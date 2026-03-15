import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    return payload.id;
  } catch {
    return null;
  }
}

// GET /api/madresah/[madresahId]/analytics
// Returns school-wide analytics:
//   - struggle topics grouped by subject and frequency
//   - attendance rates per class
//   - homework completion rates per class
//   - hifz progress summary
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ madresahId: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { madresahId } = await params;

  const madresah = await prisma.madresah.findUnique({ where: { id: madresahId } });
  if (!madresah) return NextResponse.json({ error: 'School not found' }, { status: 404 });

  const membership = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId } },
  });
  const canView =
    madresah.adminId === userId ||
    membership?.role === 'PRINCIPAL' ||
    membership?.role === 'TEACHER';
  if (!canView) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const classes = await prisma.madresahClass.findMany({
    where: { madresahId },
    include: { students: true },
  });
  const classIds = classes.map(c => c.id);

  const [struggles, attendance, homework, submissions, hifz] = await Promise.all([
    prisma.struggleReport.findMany({ where: { classId: { in: classIds } } }),
    prisma.attendance.findMany({ where: { classId: { in: classIds } } }),
    prisma.homework.findMany({ where: { classId: { in: classIds } } }),
    prisma.homeworkSubmission.findMany({ where: { homework: { classId: { in: classIds } } } }),
    prisma.hifzProgress.findMany({ where: { classId: { in: classIds } } }),
  ]);

  // Struggle analytics: group by subjectName+topic
  const struggleMap: Record<string, { subject: string; topic: string; count: number; resolved: number }> = {};
  for (const s of struggles) {
    const key = `${s.subjectName}||${s.topic}`;
    if (!struggleMap[key]) {
      struggleMap[key] = { subject: s.subjectName, topic: s.topic, count: 0, resolved: 0 };
    }
    struggleMap[key].count++;
    if (s.isResolved) struggleMap[key].resolved++;
  }
  const struggleAnalytics = Object.values(struggleMap).sort((a, b) => b.count - a.count).slice(0, 20);

  // Attendance per class
  const attendanceByClass = classes.map(cls => {
    const records = attendance.filter(a => a.classId === cls.id);
    const total = records.length;
    const present = records.filter(a => a.present).length;
    return {
      classId: cls.id,
      className: cls.name,
      studentCount: cls.students.length,
      totalRecords: total,
      presentCount: present,
      attendancePct: total > 0 ? Math.round((present / total) * 100) : null,
    };
  });

  // Homework completion per class
  const hwByClass = classes.map(cls => {
    const hw = homework.filter(h => h.classId === cls.id);
    const enrolledStudents = cls.students.length;
    const totalExpected = hw.length * enrolledStudents;
    const totalSubmitted = submissions.filter(s =>
      hw.some(h => h.id === s.homeworkId)
    ).length;
    return {
      classId: cls.id,
      className: cls.name,
      totalHomework: hw.length,
      enrolledStudents,
      totalExpected,
      totalSubmitted,
      completionPct: totalExpected > 0 ? Math.round((totalSubmitted / totalExpected) * 100) : null,
    };
  });

  // Hifz progress summary
  const totalMemorized = hifz.filter(h => h.memorized).length;
  const totalHifzEntries = hifz.length;
  const hifzByClass = classes.map(cls => {
    const entries = hifz.filter(h => h.classId === cls.id);
    const memorized = entries.filter(h => h.memorized).length;
    return { classId: cls.id, className: cls.name, totalEntries: entries.length, memorized };
  });

  return NextResponse.json({
    struggleAnalytics,
    attendanceByClass,
    hwByClass,
    hifzSummary: { totalEntries: totalHifzEntries, totalMemorized, byClass: hifzByClass },
    totalStudents: classes.reduce((acc, c) => acc + c.students.length, 0),
    totalClasses: classes.length,
  });
}

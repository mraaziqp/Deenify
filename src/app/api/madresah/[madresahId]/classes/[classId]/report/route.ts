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

// GET /api/madresah/[madresahId]/classes/[classId]/report
// Returns a per-student progress report: grades, homework completion, attendance %, hifz pages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ madresahId: string; classId: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { classId } = await params;

  const cls = await prisma.madresahClass.findUnique({
    where: { id: classId },
    include: {
      madresah: true,
      students: { include: { user: { select: { id: true, displayName: true, email: true } } } },
    },
  });
  if (!cls) return NextResponse.json({ error: 'Class not found' }, { status: 404 });

  const membership = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId: cls.madresahId } },
  });
  const canView =
    cls.madresah.adminId === userId ||
    membership?.role === 'PRINCIPAL' ||
    membership?.role === 'TEACHER' ||
    cls.teacherId === userId;
  if (!canView) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const studentIds = cls.students.map(e => e.userId);

  // Fetch all data in parallel
  const [allHomework, allSubmissions, allGrades, allAttendance, allHifz, allStruggles] = await Promise.all([
    prisma.homework.findMany({ where: { classId } }),
    prisma.homeworkSubmission.findMany({
      where: { homework: { classId }, studentId: { in: studentIds } },
    }),
    prisma.grade.findMany({
      where: { subject: { classId }, studentId: { in: studentIds } },
      include: { subject: { select: { name: true } } },
    }),
    prisma.attendance.findMany({ where: { classId, studentId: { in: studentIds } } }),
    prisma.hifzProgress.findMany({ where: { classId, studentId: { in: studentIds } } }),
    prisma.struggleReport.findMany({ where: { classId, studentId: { in: studentIds } } }),
  ]);

  const totalHw = allHomework.length;

  const report = cls.students.map(enrollment => {
    const sid = enrollment.userId;

    // Homework completion
    const submitted = allSubmissions.filter(s => s.studentId === sid).length;
    const hwCompletion = totalHw > 0 ? Math.round((submitted / totalHw) * 100) : null;

    // Average grade
    const studentGrades = allGrades.filter(g => g.studentId === sid);
    const avgGrade =
      studentGrades.length > 0
        ? Math.round(studentGrades.reduce((acc, g) => acc + (g.value / g.maxValue) * 100, 0) / studentGrades.length)
        : null;

    // Attendance
    const attendanceRecords = allAttendance.filter(a => a.studentId === sid);
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.present).length;
    const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null;

    // Hifz progress
    const hifzEntries = allHifz.filter(h => h.studentId === sid);
    const memorizedPages = hifzEntries.filter(h => h.memorized).length;

    // Struggles
    const struggles = allStruggles.filter(s => s.studentId === sid);
    const unresolvedStruggles = struggles.filter(s => !s.isResolved).length;

    return {
      student: enrollment.user,
      hwCompletion,
      avgGrade,
      attendancePct,
      memorizedPages,
      unresolvedStruggles,
      gradesBySubject: studentGrades.map(g => ({
        subject: g.subject.name,
        value: g.value,
        maxValue: g.maxValue,
        percentage: Math.round((g.value / g.maxValue) * 100),
        label: g.label,
        createdAt: g.createdAt,
      })),
    };
  });

  return NextResponse.json(report);
}

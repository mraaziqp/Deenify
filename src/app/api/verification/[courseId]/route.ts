import { NextRequest, NextResponse } from 'next/server';

function getCurrentUser(request: NextRequest) {
  return {
    id: 'verifier-456',
    email: 'verifier@deenify.com',
    name: 'Sheikh Verifier',
    role: 'verifier' as const,
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = getCurrentUser(request);
    
    if (!user || (user.role !== 'verifier' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Verifier role required.' },
        { status: 403 }
      );
    }

    const { courseId } = params;
    const body = await request.json();
    const { action, feedback } = body;

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    if (action === 'reject' && !feedback) {
      return NextResponse.json(
        { error: 'Feedback is required when rejecting a course' },
        { status: 400 }
      );
    }

    // TODO: Update database
    // const courseRef = db.collection('courses').doc(courseId);
    // await courseRef.update({
    //   status: action === 'approve' ? 'approved' : 'rejected',
    //   verifierId: user.id,
    //   verifiedAt: new Date(),
    //   rejectionFeedback: feedback,
    //   publishedAt: action === 'approve' ? new Date() : null,
    // });

    // TODO: Send notification to teacher
    // await notifyTeacher(courseId, action, feedback);

    return NextResponse.json({
      success: true,
      message: `Course ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      courseId,
      action,
    });
  } catch (error) {
    console.error('Verification review error:', error);
    return NextResponse.json(
      { error: 'Failed to process verification' },
      { status: 500 }
    );
  }
}

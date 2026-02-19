import { NextRequest, NextResponse } from 'next/server';

// Genkit/AI temporarily disabled for debugging

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Genkit API endpoint',
    status: 'operational' 
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      success: true,
      data: body 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

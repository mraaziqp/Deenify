import { NextRequest, NextResponse } from 'next/server';
import { config } from 'dotenv';
config();

// Import AI flows to register them
import '@/ai/dev';

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

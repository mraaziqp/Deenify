import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'release';

    // Determine APK path based on type
    let apkPath: string;
    let filename: string;

    if (type === 'debug') {
      apkPath = join(process.cwd(), 'android/app/build/outputs/apk/debug/app-debug.apk');
      filename = 'deenify-debug-0.1.0.apk';
    } else {
      apkPath = join(process.cwd(), 'android/app/build/outputs/apk/release/app-release-unsigned.apk');
      filename = 'deenify-release-0.1.0.apk';
    }

    // Check if file exists
    if (!existsSync(apkPath)) {
      return NextResponse.json(
        { error: `APK file not found: ${type}` },
        { status: 404 }
      );
    }

    // Read the APK file
    const fileBuffer = readFileSync(apkPath);

    // Get file size for stats
    const fileSize = fileBuffer.length;
    const sizeMB = (fileSize / (1024 * 1024)).toFixed(2);

    // Log download
    console.log(`📥 APK Download: ${filename} (${sizeMB} MB)`);

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileSize.toString(),
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('❌ APK Download Error:', error);
    return NextResponse.json(
      { error: 'Failed to download APK file' },
      { status: 500 }
    );
  }
}

// Return APK info
export async function OPTIONS() {
  return NextResponse.json({
    apks: [
      {
        type: 'release',
        name: 'deenify-release-0.1.0.apk',
        size: '3.6 MB',
        description: 'Production-ready release version',
      },
      {
        type: 'debug',
        name: 'deenify-debug-0.1.0.apk',
        size: '4.5 MB',
        description: 'Debug version with enhanced logging',
      },
    ],
  });
}

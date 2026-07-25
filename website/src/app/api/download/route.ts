import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');

  if (platform === 'mac') {
    return NextResponse.redirect(
      'https://github.com/Dhruv-Mann/filemind/releases/download/v0.1.0/filemind.dmg',
      { status: 307 }
    );
  }

  const filename = 'filemind.exe';
  
  // 1. Check local public downloads folder (git-ignored)
  let targetPath = path.join(process.cwd(), 'public', 'downloads', filename);

  // 2. Fallback to local Tauri build output directory
  if (!fs.existsSync(targetPath)) {
    targetPath = path.join(process.cwd(), '..', 'src-tauri', 'target', 'release', 'bundle', 'nsis', 'Local MCP File Organizer_0.1.0_x64-setup.exe');
  }

  // If local binary exists on disk, serve it directly
  if (fs.existsSync(targetPath)) {
    const fileBuffer = fs.readFileSync(targetPath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.microsoft.portable-executable',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  }

  // 3. Fallback to GitHub Release executable for production
  return NextResponse.redirect(
    'https://github.com/Dhruv-Mann/filemind/releases/download/v0.1.0/filemind.exe',
    { status: 307 }
  );
}

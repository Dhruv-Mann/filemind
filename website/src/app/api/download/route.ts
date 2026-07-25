import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const filename = 'filemind.exe';
  const localFilePath = path.join(process.cwd(), 'public', 'downloads', filename);

  // If file exists locally on server, serve it directly
  if (fs.existsSync(localFilePath)) {
    const fileBuffer = fs.readFileSync(localFilePath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.microsoft.portable-executable',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  }

  // Otherwise redirect seamlessly to GitHub Releases binary download
  return NextResponse.redirect(
    'https://github.com/Dhruv-Mann/filemind/releases/latest/download/filemind.exe',
    { status: 307 }
  );
}

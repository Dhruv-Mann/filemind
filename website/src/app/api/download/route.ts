import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const filename = 'filemind.exe';
  let filePath = path.join(process.cwd(), 'public', 'downloads', filename);

  if (!fs.existsSync(filePath)) {
    filePath = path.join(process.cwd(), 'public', 'downloads', 'Local_MCP_File_Organizer_0.1.0_x64-setup.exe');
  }

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Installer executable file not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/vnd.microsoft.portable-executable',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'public, max-age=3600, immutable',
    },
  });
}

import { NextResponse } from 'next/server';
import { getYTDlp } from '@/lib/ytdlp';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const title = searchParams.get('title') || 'audio';

  if (!id) {
    return new NextResponse('ID requerido', { status: 400 });
  }

  const url = `https://www.youtube.com/watch?v=${id}`;
  const tempDir = os.tmpdir();
  const fileName = `yt-${Date.now()}-${id}`;
  const tempFilePath = path.join(tempDir, fileName); 
  // yt-dlp output template. It will append extension.
  const outputTemplate = `${tempFilePath}.%(ext)s`;
  const expectedOutput = `${tempFilePath}.mp3`;

  try {
    const ytDlp = await getYTDlp();

    // Use yt-dlp directly for download + conversion + metadata
    // This is more robust than piping and handles metadata/thumbnails
    await ytDlp.execPromise([
      url,
      '-x', // Extract audio
      '--audio-format', 'mp3',
      '--audio-quality', '0', // Best quality
      '--add-metadata',
      '--embed-thumbnail',
      '--ffmpeg-location', ffmpegInstaller.path,
      '-o', outputTemplate,
      '--force-overwrites'
    ]);

    if (!fs.existsSync(expectedOutput)) {
        throw new Error('File not created');
    }

    const stats = fs.statSync(expectedOutput);
    const fileStream = fs.createReadStream(expectedOutput);
    
    const stream = new ReadableStream({
        start(controller) {
            fileStream.on('data', (chunk) => controller.enqueue(chunk));
            fileStream.on('end', () => {
                controller.close();
                // Cleanup after sending
                fs.unlink(expectedOutput, (err) => {
                    if (err) console.error('Error deleting temp file:', err);
                });
            });
            fileStream.on('error', (err) => {
                controller.error(err);
                // Cleanup on error
                fs.unlink(expectedOutput, () => {});
            });
        }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Disposition': `attachment; filename="${title.replace(/[^a-zA-Z0-9-_ ]/g, '').trim()}.mp3"`,
        'Content-Type': 'audio/mpeg',
        'Content-Length': stats.size.toString(),
      },
    });

  } catch (err) {
    console.error(err);
    // Cleanup if exists
    if (fs.existsSync(expectedOutput)) {
        try { fs.unlinkSync(expectedOutput); } catch (e) {}
    }
    return new NextResponse('Error downloading: ' + err.message, { status: 500 });
  }
}
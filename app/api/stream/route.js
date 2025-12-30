import { NextResponse } from 'next/server';
import { getYTDlp } from '@/lib/ytdlp';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse('ID requerido', { status: 400 });
  }

  const url = `https://www.youtube.com/watch?v=${id}`;

  try {
    const ytDlp = await getYTDlp();
    
    // Stream the audio directly. 
    // -f bestaudio: Get best audio
    // -o -: Output to stdout
    const ytDlpStream = ytDlp.execStream([
      url,
      '-f', 'bestaudio',
      '-o', '-'
    ]);

    // Convert Node stream to Web Stream for NextResponse
    const stream = new ReadableStream({
      start(controller) {
        ytDlpStream.on('data', (chunk) => controller.enqueue(chunk));
        ytDlpStream.on('end', () => controller.close());
        ytDlpStream.on('error', (err) => controller.error(err));
      },
      cancel() {
        ytDlpStream.destroy();
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'audio/mpeg', // Browser will try to sniff or play whatever comes
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (err) {
    console.error(err);
    return new NextResponse('Error streaming: ' + err.message, { status: 500 });
  }
}

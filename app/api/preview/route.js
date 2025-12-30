import { NextResponse } from 'next/server';
import ytpl from 'ytpl';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL requerida' }, { status: 400 });
  }

  try {
    const playlist = await ytpl(url, { limit: Infinity });
    const items = playlist.items.map(item => {
      // Fallback for thumbnail
      const thumbnail = item.bestThumbnail?.url || 
                        (item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[0].url : null);
      
      return {
        id: item.id,
        title: item.title,
        thumbnail: thumbnail,
        duration: item.duration,
        author: item.author?.name,
      };
    });
    return NextResponse.json(items);
  } catch (err) {
    return NextResponse.json({ error: 'Error fetching playlist: ' + err.message }, { status: 500 });
  }
}
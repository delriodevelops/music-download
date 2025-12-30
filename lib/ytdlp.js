import YTDlpWrap from 'yt-dlp-wrap';
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream/promises';

const YTDLP_DIR = path.join(process.cwd(), 'bin');
const YTDLP_PATH = path.join(YTDLP_DIR, 'yt-dlp');

if (!fs.existsSync(YTDLP_DIR)) {
  fs.mkdirSync(YTDLP_DIR, { recursive: true });
}

let ytDlpWrap;

export async function getYTDlp() {
  if (ytDlpWrap) return ytDlpWrap;

  if (!fs.existsSync(YTDLP_PATH)) {
    console.log('Downloading yt-dlp binary...');
    
    let binaryName = 'yt-dlp'; 
    if (process.platform === 'win32') binaryName = 'yt-dlp.exe';
    else if (process.platform === 'darwin') binaryName = 'yt-dlp_macos';
    else if (process.platform === 'linux') binaryName = 'yt-dlp_linux';

    const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${binaryName}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download yt-dlp: ${response.statusText}`);
    
    const fileStream = fs.createWriteStream(YTDLP_PATH);
    // @ts-ignore
    await pipeline(response.body, fileStream);

    // Ensure it is executable
    if (process.platform !== 'win32') {
        fs.chmodSync(YTDLP_PATH, '755');
    }
    console.log('Downloaded yt-dlp binary');
  }

  // Force usage of the binary path we just downloaded
  ytDlpWrap = new YTDlpWrap(YTDLP_PATH);
  return ytDlpWrap;
}

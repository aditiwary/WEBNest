import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.ogg': 'video/ogg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.ogg', '.mkv', '.m4v']);

function scanVideos() {
  const videos = [];
  const dirsToScan = [
    { dir: PUBLIC_DIR, prefix: '/' },
    { dir: path.join(PUBLIC_DIR, 'videos'), prefix: '/videos/' }
  ];

  for (const { dir, prefix } of dirsToScan) {
    if (fs.existsSync(dir)) {
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          if (VIDEO_EXTENSIONS.has(ext)) {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              videos.push({
                name: file,
                url: `${prefix}${file}`.replace(/\/+/g, '/'),
                size: stats.size,
                modified: stats.mtimeMs,
                folder: path.relative(PUBLIC_DIR, dir) || 'public'
              });
            }
          }
        }
      } catch (err) {
        console.error('Error scanning dir:', dir, err);
      }
    }
  }

  // Deduplicate by URL
  const uniqueVideos = [];
  const seen = new Set();
  for (const v of videos) {
    if (!seen.has(v.url)) {
      seen.add(v.url);
      uniqueVideos.push(v);
    }
  }
  return uniqueVideos;
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // API endpoint to detect reference videos dynamically
  if (pathname === '/api/videos') {
    const list = scanVideos();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify({ count: list.length, videos: list }));
  }

  // Route root to index.html
  if (pathname === '/') {
    pathname = '/index.html';
  }

  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  // Security check to prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head><title>404 Not Found - DEVYRO</title><style>body{background:#0b0f19;color:#e2e8f0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;}</style></head>
        <body>
          <h1>404 - Asset Not Found</h1>
          <p>The file <code>${pathname}</code> was not found in <code>/public</code>.</p>
          <a href="/" style="color:#00f2fe;">Return to DEVYRO Homepage</a>
        </body>
        </html>
      `);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Support HTTP 206 Partial Content for video streaming
    const range = req.headers.range;
    if (range && (contentType.startsWith('video/') || ext === '.mp4' || ext === '.webm')) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunkSize = (end - start) + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType
      });
      fileStream.pipe(res);
      return;
    }

    res.writeHead(200, {
      'Content-Length': stats.size,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 DEVYRO Local Server Running!`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`📁 Serving directory: ${PUBLIC_DIR}`);
  console.log(`📹 Video reference folder: ${path.join(PUBLIC_DIR, 'videos')}`);
  console.log(`=========================================`);
});

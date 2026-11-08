/**
 * Cliffhanger 🇨🇦 - Local Development Server
 * Runs static frontend and serverless API route locally.
 * Zero external dependencies: uses built-in Node.js modules.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const searchHandler = require('./api/search.js');

const PORT = process.env.PORT || 3000;
const STATIC_DIR = __dirname;

// Simple .env file loader
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...rest] = trimmed.split('=');
        if (key && rest.length > 0) {
          process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }
}

loadEnv();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Route: /api/search
  if (pathname === '/api/search') {
    return searchHandler(req, res);
  }

  // Route: Static files
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';

  const filePath = path.join(STATIC_DIR, safePath);

  // Security: Prevent directory traversal outside STATIC_DIR
  if (!filePath.startsWith(STATIC_DIR)) {
    res.statusCode = 403;
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n🧗 Cliffhanger local server running at:`);
    console.log(`   ➜ Local:   http://localhost:${PORT}/`);
    console.log(`   ➜ API:     http://localhost:${PORT}/api/search?q=severance`);
    console.log(`   ➜ Mode:    ${process.env.TMDB_API_KEY ? 'Live TMDB API active' : 'Demo Mode (No TMDB_API_KEY in .env)'}\n`);
  });
}

module.exports = server;

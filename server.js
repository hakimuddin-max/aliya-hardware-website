/**
 * ALIYA HARDWARE LLC — Website Server
 * Works locally (node server.js) AND on Vercel serverless.
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.json': 'application/json',
};

const ROUTES = {
  '/':           'views/pages/home.html',
  '/about':      'views/pages/about.html',
  '/products':   'views/pages/products.html',
  '/industries': 'views/pages/industries.html',
  '/contact':    'views/pages/contact.html',
};

// ── KEY FIX: use process.cwd() so Vercel finds files correctly ──
function getRoot() {
  // On Vercel, __dirname is inside /var/task/api/ or similar
  // process.cwd() always points to /var/task (project root)
  // We check both and use whichever has the views folder
  const cwd = process.cwd();
  const dir = __dirname;

  if (fs.existsSync(path.join(cwd, 'views'))) return cwd;
  if (fs.existsSync(path.join(dir, 'views'))) return dir;
  // Walk up from __dirname
  let p = dir;
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(p, 'views'))) return p;
    p = path.dirname(p);
  }
  return cwd; // fallback
}

function handler(req, res) {
  const ROOT = getRoot();

  // Strip query strings and trailing slash (except root)
  let urlPath = (req.url || '/').split('?')[0];
  if (urlPath !== '/' && urlPath.endsWith('/')) urlPath = urlPath.slice(0, -1);

  // 1. Static files from /public/
  if (urlPath.startsWith('/public/')) {
    const filePath = path.join(ROOT, urlPath);
    const ext = path.extname(filePath).toLowerCase();
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400'
      });
      res.end(data);
    });
    return;
  }

  // 2. Page routes
  const pageFile = ROUTES[urlPath];
  if (pageFile) {
    const pagePath   = path.join(ROOT, pageFile);
    const layoutPath = path.join(ROOT, 'views/partials/layout.html');

    fs.readFile(pagePath, 'utf8', (err, pageContent) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Page load error: ' + err.message + ' | ROOT=' + ROOT);
        return;
      }
      fs.readFile(layoutPath, 'utf8', (err2, layout) => {
        if (err2) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Layout load error: ' + err2.message);
          return;
        }

        // Inject page content
        let html = layout.replace('{{PAGE_CONTENT}}', pageContent);

        // Set active nav link
        const pageKey = urlPath === '/' ? 'HOME' : urlPath.replace('/', '').toUpperCase();
        html = html.replace(/\{\{ACTIVE_([A-Z]+)\}\}/g, (_, p) =>
          p === pageKey ? 'active' : ''
        );

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      });
    });
    return;
  }

  // 3. 404
  const notFoundPath = path.join(ROOT, 'views/pages/404.html');
  fs.readFile(notFoundPath, 'utf8', (err, data) => {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data || '<h1>404 Not Found</h1>');
  });
}

// Local dev server
if (require.main === module) {
  const server = http.createServer(handler);
  server.listen(PORT, () => {
    console.log(`\n✅  ALIYA HARDWARE LLC running at http://localhost:${PORT}\n`);
    Object.keys(ROUTES).forEach(r =>
      console.log(`   → http://localhost:${PORT}${r}`)
    );
  });
}

// Vercel serverless export
module.exports = handler;

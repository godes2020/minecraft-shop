const { createServer } = require('node:http');
const fs = require('fs');
const path = require('path');

const hostname = '127.0.0.1';
const port = 3000;

const server = createServer((req, res) => {
  let filePath = path.join(__dirname, 'src/pages', req.url === '/' ? 'home.html' : req.url + '.html');

  // Serve static files
  if (req.url.startsWith('/styles/') || req.url.startsWith('/scripts/') || req.url.startsWith('/assets/')) {
    filePath = path.join(__dirname, 'src', req.url);
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('<h1>404 - Страница не найдена</h1>');
      return;
    }

    res.statusCode = 200;
    
    // Set content type based on file extension
    const ext = path.extname(filePath);
    if (ext === '.html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    } else if (ext === '.css') {
      res.setHeader('Content-Type', 'text/css');
    } else if (ext === '.js') {
      res.setHeader('Content-Type', 'text/javascript');
    } else if (ext === '.json') {
      res.setHeader('Content-Type', 'application/json');
    }

    res.end(data);
  });
});

server.listen(port, hostname, () => {
  console.log(`Сервер запущен на http://${hostname}:${port}/`);
});

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse
from pathlib import Path
import sqlite3, json, os

ROOT = Path(__file__).resolve().parent
DB = ROOT / 'responses.db'
PORT = int(os.environ.get('PORT', '3000'))

with sqlite3.connect(DB) as conn:
    conn.execute('''CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )''')

class Handler(BaseHTTPRequestHandler):
    def send_json(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != '/api/responses':
            self.send_json({'error': 'Not found'}, 404); return
        try:
            length = int(self.headers.get('Content-Length', 0))
            data = json.loads(self.rfile.read(length) or b'{}')
            page, response = str(data.get('page', '')).strip(), str(data.get('response', '')).strip()
            if not page or not response:
                self.send_json({'error': 'A response is required.'}, 400); return
            with sqlite3.connect(DB) as conn:
                cur = conn.execute('INSERT INTO responses (page, response) VALUES (?, ?)', (page, response))
                self.send_json({'success': True, 'id': cur.lastrowid}, 201)
        except Exception as exc:
            self.send_json({'error': str(exc)}, 500)

    def do_GET(self):
        if self.path == '/api/responses':
            with sqlite3.connect(DB) as conn:
                conn.row_factory = sqlite3.Row
                rows = [dict(r) for r in conn.execute('SELECT * FROM responses ORDER BY id DESC')]
            self.send_json(rows); return
        path = urlparse(self.path).path
        if path == '/': path = '/index.html'
        file = (ROOT / path.lstrip('/')).resolve()
        if not str(file).startswith(str(ROOT)) or not file.is_file():
            self.send_error(404); return
        data = file.read_bytes()
        types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8'}
        self.send_response(200)
        self.send_header('Content-Type', types.get(file.suffix, 'application/octet-stream'))
        self.send_header('Content-Length', str(len(data)))
        self.end_headers(); self.wfile.write(data)

if __name__ == '__main__':
    print(f'Jackie app running on port {PORT}')
    ThreadingHTTPServer(('0.0.0.0', PORT), Handler).serve_forever()

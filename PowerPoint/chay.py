from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
import ssl

root = Path(__file__).resolve().parent
class GameHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.path.partition('?')[0]
        if path != '/icon.png' and not re.fullmatch(r'/[a-f0-9-]{36}\.html', path):
            self.send_error(404)
            return
        try:
            file = root / 'icon.png' if path == '/icon.png' else root / 'tro-choi' / path[1:]
            content = file.read_bytes()
        except FileNotFoundError:
            self.send_error(404, 'Copy the exported HTML into the tro-choi folder.')
            return
        self.send_response(200)
        self.send_header('Content-Type', 'image/png' if path == '/icon.png' else 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(content)

if __name__ == '__main__':
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(root / 'localhost.pem', root / 'localhost-key.pem')
    with ThreadingHTTPServer(('127.0.0.1', 43127), GameHandler) as server:
        server.socket = context.wrap_socket(server.socket, server_side=True)
        print('GVCN đã sẵn sàng. Giữ cửa sổ này mở trong khi trình chiếu.', flush=True)
        server.serve_forever()

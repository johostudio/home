from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlsplit, urlunsplit
import os


class CleanUrlsHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parts = urlsplit(self.path)
        req_path = parts.path
        base = os.path.basename(req_path.rstrip('/'))

        # Rewrite extensionless routes like /hoshii to /hoshii.html when present.
        if req_path != "/" and "." not in base:
            candidate = req_path.rstrip("/") + ".html"
            fs_candidate = self.translate_path(candidate)
            if os.path.isfile(fs_candidate):
                self.path = urlunsplit(("", "", candidate, parts.query, parts.fragment))

        return super().do_GET()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", 5500), CleanUrlsHandler)
    print("Serving on http://0.0.0.0:5500")
    server.serve_forever()

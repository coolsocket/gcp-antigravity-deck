#!/usr/bin/env python3
import os
import json
import mimetypes
from http.server import HTTPServer, SimpleHTTPRequestHandler
from compile_deck import compile_deck

PORT = 8000

class EditableDeckRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable caching during presentation edits
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        super().end_headers()

    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # Root path serves index_offline.html
        if self.path == '/' or self.path == '/index.html':
            # Ensure index_offline.html exists
            if not os.path.exists("index_offline.html"):
                print("index_offline.html not found, compiling deck first...")
                compile_deck()
            
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            with open("index_offline.html", "rb") as f:
                self.wfile.write(f.read())
            return

        # Handle serving of editable-client.js directly if requested from static js/ path
        if self.path == '/js/editable-client.js':
            self.send_response(200)
            self.send_header('Content-Type', 'application/javascript')
            self.end_headers()
            # Try to read local file or serve from skill references
            js_local_path = os.path.join("js", "editable-client.js")
            if os.path.exists(js_local_path):
                with open(js_local_path, "rb") as f:
                    self.wfile.write(f.read())
            else:
                # Fallback to the bundled one in references
                ref_path = os.path.join(os.path.dirname(__file__), "..", "references", "editable-client.js")
                if os.path.exists(ref_path):
                    with open(ref_path, "rb") as f:
                        self.wfile.write(f.read())
                else:
                    self.wfile.write(b"console.error('editable-client.js not found');")
            return

        # Standard file serving for other files
        super().do_GET()

    def do_POST(self):
        if self.path == '/api/save-slide':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                # Parse request data
                data = json.loads(post_data.decode('utf-8'))
                slide_num = int(data.get('slideNum'))
                content = data.get('content', '').strip()

                if not slide_num or not content:
                    raise ValueError("Missing 'slideNum' or 'content' in payload.")

                # Ensure slides directory exists
                os.makedirs("slides", exist_ok=True)

                # Write contents to slide-X.html
                slide_filename = os.path.join("slides", f"slide-{slide_num}.html")
                with open(slide_filename, "w", encoding="utf-8") as f:
                    f.write(content)

                print(f"💾 Saved updated content to '{slide_filename}'")

                # Trigger local compilation automatically to refresh index_offline.html
                compile_deck()

                # Send response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {
                    "status": "success",
                    "message": f"Slide {slide_num} updated and recompiled successfully."
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))

            except Exception as e:
                # Error response
                print(f"❌ Error saving slide: {e}")
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {
                    "status": "error",
                    "message": str(e)
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        # 404 for other API endpoints
        self.send_response(404)
        self.end_headers()

def run_server():
    print("--------------------------------------------------")
    print(f"🚀 Launching Live Editable Slide Deck Server")
    print(f"👉 Presentation Address: http://localhost:{PORT}")
    print(f"👉 Autosave Endpoint: http://localhost:{PORT}/api/save-slide")
    print("--------------------------------------------------")
    server = HTTPServer(('0.0.0.0', PORT), EditableDeckRequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Slide fragments are safely saved.")

if __name__ == "__main__":
    run_server()

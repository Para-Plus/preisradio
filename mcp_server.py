#!/usr/bin/env python3
"""
Preisradio MCP Server
Gives AI assistants direct access to 74k+ products across 4 German retailers.

Usage:
  stdio (Claude Desktop):  python mcp_server.py
  HTTP  (remote):          python mcp_server.py --http --port 8765
"""

import sys
import json
import argparse
from pymongo import MongoClient

# ── MongoDB connections ────────────────────────────────────────────────────────
RETAILERS = {
    "saturn":    {"uri": "mongodb+srv://stronglimitless76_db_user:XkH6zK9tcANup38i@cluster0.pzd9gka.mongodb.net/Saturn?retryWrites=true&w=majority",    "db": "Saturn",    "name": "Saturn"},
    "mediamarkt":{"uri": "mongodb+srv://stronglimitless76_db_user:oLZm2SKrgK5ZskXv@mediamarkt.iwjamu6.mongodb.net/Mediamarkt?retryWrites=true&w=majority","db": "Mediamarkt","name": "MediaMarkt"},
    "otto":      {"uri": "mongodb+srv://stronglimitless76_db_user:ThiKAzVAqh0fmbtS@otto.sx1z58n.mongodb.net/Otto?retryWrites=true&w=majority",           "db": "Otto",      "name": "Otto"},
    "kaufland":  {"uri": "mongodb+srv://stronglimitless76_db_user:h4Z4KFmx6Iwm6e4I@kaufland.hsxmfh8.mongodb.net/Kaufland?retryWrites=true&w=majority",  "db": "Kaufland",  "name": "Kaufland"},
}

_clients: dict = {}

def get_collection(retailer: str):
    if retailer not in _clients:
        info = RETAILERS[retailer]
        _clients[retailer] = MongoClient(info["uri"], serverSelectionTimeoutMS=8000)[info["db"]]["Db"]
    return _clients[retailer]


def _fmt(doc, retailer: str) -> dict:
    sku = doc.get("sku") or str(doc["_id"])
    return {
        "id": f"{retailer}-{sku}",
        "title": doc.get("title", ""),
        "price": doc.get("price"),
        "old_price": doc.get("old_price"),
        "brand": doc.get("brand", ""),
        "category": doc.get("category", ""),
        "gtin": doc.get("gtin", ""),
        "retailer": RETAILERS[retailer]["name"],
        "url": doc.get("url", ""),
        "link": f"https://preisradio.de/product/{retailer}-{sku}",
        "image": doc.get("image", ""),
    }


# ── Tool implementations ───────────────────────────────────────────────────────
def search_products(query: str, category: str = "", brand: str = "", limit: int = 10) -> list:
    """Search products across all 4 retailers."""
    import re
    results = []
    regex = {"$regex": re.escape(query), "$options": "i"}
    mongo_filter: dict = {"$or": [{"title": regex}, {"brand": regex}, {"description": regex}]}
    if category:
        mongo_filter["category"] = {"$regex": re.escape(category), "$options": "i"}
    if brand:
        mongo_filter["brand"] = {"$regex": re.escape(brand), "$options": "i"}

    per_retailer = max(1, limit // 4)
    for retailer in RETAILERS:
        try:
            col = get_collection(retailer)
            docs = col.find(mongo_filter, {"_id":1,"sku":1,"title":1,"price":1,"old_price":1,
                                           "brand":1,"category":1,"gtin":1,"url":1,"image":1}
                           ).sort("price", 1).limit(per_retailer)
            results.extend([_fmt(d, retailer) for d in docs])
        except Exception:
            pass
    results.sort(key=lambda x: x.get("price") or 9999)
    return results[:limit]


def compare_prices(gtin: str) -> list:
    """Find the same product (by GTIN/EAN) across all retailers."""
    results = []
    for retailer in RETAILERS:
        try:
            col = get_collection(retailer)
            doc = col.find_one({"gtin": gtin}, {"_id":1,"sku":1,"title":1,"price":1,"old_price":1,
                                                 "brand":1,"category":1,"gtin":1,"url":1,"image":1})
            if doc:
                results.append(_fmt(doc, retailer))
        except Exception:
            pass
    results.sort(key=lambda x: x.get("price") or 9999)
    return results


def get_categories() -> list:
    """List all product categories."""
    cats = set()
    for retailer in RETAILERS:
        try:
            col = get_collection(retailer)
            cats.update(col.distinct("category"))
        except Exception:
            pass
    return sorted(c for c in cats if c)


def get_product(product_id: str) -> dict | None:
    """Get a single product by id (format: retailer-sku)."""
    parts = product_id.split("-", 1)
    if len(parts) != 2:
        return None
    retailer, sku = parts
    if retailer not in RETAILERS:
        return None
    try:
        col = get_collection(retailer)
        doc = col.find_one({"sku": sku})
        return _fmt(doc, retailer) if doc else None
    except Exception:
        return None


# ── MCP protocol ──────────────────────────────────────────────────────────────
TOOLS = [
    {
        "name": "search_products",
        "description": "Search for products across Saturn, MediaMarkt, Otto and Kaufland. Returns products with prices and links to preisradio.de for comparison.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query":    {"type": "string", "description": "Search term (product name, brand, model)"},
                "category": {"type": "string", "description": "Filter by category (optional)"},
                "brand":    {"type": "string", "description": "Filter by brand (optional)"},
                "limit":    {"type": "integer", "description": "Max results (default 10, max 40)"},
            },
            "required": ["query"],
        },
    },
    {
        "name": "compare_prices",
        "description": "Compare prices for the same product across all retailers using its EAN/GTIN barcode.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "gtin": {"type": "string", "description": "EAN/GTIN barcode (e.g. 4549576231501)"},
            },
            "required": ["gtin"],
        },
    },
    {
        "name": "get_categories",
        "description": "List all available product categories on Preisradio.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_product",
        "description": "Get details of a specific product by its Preisradio ID (format: retailer-sku).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "product_id": {"type": "string", "description": "Product ID, e.g. saturn-123456"},
            },
            "required": ["product_id"],
        },
    },
]


def handle_request(req: dict) -> dict:
    method = req.get("method", "")
    req_id = req.get("id")

    def ok(result):
        return {"jsonrpc": "2.0", "id": req_id, "result": result}

    def err(code, msg):
        return {"jsonrpc": "2.0", "id": req_id, "error": {"code": code, "message": msg}}

    if method == "initialize":
        return ok({
            "protocolVersion": "2024-11-05",
            "capabilities": {"tools": {}},
            "serverInfo": {"name": "preisradio", "version": "1.0.0"},
        })

    if method == "tools/list":
        return ok({"tools": TOOLS})

    if method == "tools/call":
        name = req.get("params", {}).get("name")
        args = req.get("params", {}).get("arguments", {})
        try:
            if name == "search_products":
                data = search_products(args["query"], args.get("category",""), args.get("brand",""), min(int(args.get("limit",10)),40))
            elif name == "compare_prices":
                data = compare_prices(args["gtin"])
            elif name == "get_categories":
                data = get_categories()
            elif name == "get_product":
                data = get_product(args["product_id"])
            else:
                return err(-32601, f"Unknown tool: {name}")
            return ok({"content": [{"type": "text", "text": json.dumps(data, ensure_ascii=False, indent=2)}]})
        except Exception as e:
            return err(-32000, str(e))

    if method == "notifications/initialized":
        return None  # no response needed

    return err(-32601, f"Method not found: {method}")


# ── Transports ────────────────────────────────────────────────────────────────
def run_stdio():
    """stdio transport — for Claude Desktop / local use."""
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            resp = handle_request(req)
            if resp is not None:
                print(json.dumps(resp), flush=True)
        except json.JSONDecodeError:
            pass


def run_http(port: int):
    """HTTP transport — for remote AI assistants."""
    from http.server import HTTPServer, BaseHTTPRequestHandler

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args): pass

        def do_POST(self):
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                req = json.loads(body)
                resp = handle_request(req) or {}
                data = json.dumps(resp).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(data)
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())

        def do_GET(self):
            if self.path == "/health":
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'{"status":"ok","server":"preisradio-mcp"}')
            else:
                self.send_response(404)
                self.end_headers()

        def do_OPTIONS(self):
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()

    print(f"Preisradio MCP server running on http://0.0.0.0:{port}", file=sys.stderr)
    HTTPServer(("0.0.0.0", port), Handler).serve_forever()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--http", action="store_true", help="Run as HTTP server")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()

    if args.http:
        run_http(args.port)
    else:
        run_stdio()

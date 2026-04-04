import re
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import SaturnProduct, MediaMarktProduct, OttoProduct, KauflandProduct

MODELS = {
    "saturn":     SaturnProduct,
    "mediamarkt": MediaMarktProduct,
    "otto":       OttoProduct,
    "kaufland":   KauflandProduct,
}

RETAILER_NAMES = {
    "saturn": "Saturn",
    "mediamarkt": "MediaMarkt",
    "otto": "Otto",
    "kaufland": "Kaufland",
}

TOOLS = [
    {
        "name": "search_products",
        "description": "Search for products across Saturn, MediaMarkt, Otto and Kaufland. Returns products with prices and direct links to preisradio.de.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query":    {"type": "string",  "description": "Search term (product name, brand, model)"},
                "category": {"type": "string",  "description": "Filter by category (optional)"},
                "brand":    {"type": "string",  "description": "Filter by brand (optional)"},
                "limit":    {"type": "integer", "description": "Max results 1-40 (default 10)"},
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
                "product_id": {"type": "string", "description": "Product ID e.g. saturn-123456"},
            },
            "required": ["product_id"],
        },
    },
]


def _fmt(product, retailer: str) -> dict:
    sku = product.sku or str(product.id)
    return {
        "id": f"{retailer}-{sku}",
        "title": product.title,
        "price": product.price,
        "old_price": product.old_price,
        "brand": product.brand or "",
        "category": product.category,
        "gtin": product.gtin or "",
        "retailer": RETAILER_NAMES[retailer],
        "url": product.url,
        "link": f"https://preisradio.de/product/{retailer}-{sku}",
        "image": product.image or "",
    }


def _search_products(query, category="", brand="", limit=10):
    results = []
    limit = min(int(limit), 40)
    per = max(1, limit // 4)

    for retailer, Model in MODELS.items():
        try:
            qs = Model.objects(__raw__={"title": {"$regex": re.escape(query), "$options": "i"}})
            if category:
                qs = qs.filter(__raw__={"category": {"$regex": re.escape(category), "$options": "i"}})
            if brand:
                qs = qs.filter(__raw__={"brand": {"$regex": re.escape(brand), "$options": "i"}})
            results.extend([_fmt(p, retailer) for p in qs.order_by("price").limit(per)])
        except Exception:
            pass

    results.sort(key=lambda x: x.get("price") or 9999)
    return results[:limit]


def _compare_prices(gtin):
    results = []
    for retailer, Model in MODELS.items():
        try:
            p = Model.objects(gtin=gtin).first()
            if p:
                results.append(_fmt(p, retailer))
        except Exception:
            pass
    return sorted(results, key=lambda x: x.get("price") or 9999)


def _get_categories():
    cats = set()
    for Model in MODELS.values():
        try:
            cats.update(Model.objects.distinct("category"))
        except Exception:
            pass
    return sorted(c for c in cats if c)


def _get_product(product_id):
    parts = product_id.split("-", 1)
    if len(parts) != 2:
        return None
    retailer, sku = parts
    if retailer not in MODELS:
        return None
    try:
        p = MODELS[retailer].objects(sku=sku).first()
        return _fmt(p, retailer) if p else None
    except Exception:
        return None


def _handle(req):
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
                data = _search_products(args["query"], args.get("category", ""), args.get("brand", ""), args.get("limit", 10))
            elif name == "compare_prices":
                data = _compare_prices(args["gtin"])
            elif name == "get_categories":
                data = _get_categories()
            elif name == "get_product":
                data = _get_product(args["product_id"])
            else:
                return err(-32601, f"Unknown tool: {name}")
            return ok({"content": [{"type": "text", "text": json.dumps(data, ensure_ascii=False)}]})
        except Exception as e:
            return err(-32000, str(e))

    if method == "notifications/initialized":
        return None

    return err(-32601, f"Method not found: {method}")


@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def mcp_endpoint(request):
    if request.method == "OPTIONS":
        resp = JsonResponse({})
        resp["Access-Control-Allow-Origin"] = "*"
        resp["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        resp["Access-Control-Allow-Headers"] = "Content-Type"
        return resp

    if request.method == "GET":
        resp = JsonResponse({
            "name": "preisradio",
            "description": "Price comparison for 74k+ products across Saturn, MediaMarkt, Otto and Kaufland (Germany).",
            "version": "1.0.0",
            "tools": [t["name"] for t in TOOLS],
            "endpoint": "https://api.preisradio.de/mcp/",
        })
        resp["Access-Control-Allow-Origin"] = "*"
        return resp

    try:
        req = json.loads(request.body)
        result = _handle(req)
        resp = JsonResponse(result or {})
    except Exception as e:
        resp = JsonResponse({"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": str(e)}})

    resp["Access-Control-Allow-Origin"] = "*"
    return resp

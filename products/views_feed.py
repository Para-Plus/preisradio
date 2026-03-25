"""
Pinterest Catalogs product feed — TSV format.

Endpoint: /api/pinterest-feed/
Pinterest crawls this URL and creates Product Pins automatically.

Pinterest Product Data Spec (Google-compatible):
https://help.pinterest.com/en/business/article/data-source-ingestion
"""
import csv
import logging
from io import StringIO

from django.http import HttpResponse
from django.views.decorators.cache import cache_page
from django.views.decorators.http import require_GET

from .models import SaturnProduct, MediaMarktProduct, OttoProduct, KauflandProduct

logger = logging.getLogger(__name__)

# Pinterest required + recommended fields
FEED_HEADERS = [
    'id',
    'title',
    'description',
    'link',
    'image_link',
    'price',
    'availability',
    'brand',
    'condition',
    'gtin',
    'item_group_id',
    'product_type',
    'sale_price',
]

RETAILER_CONFIGS = [
    {'model': SaturnProduct, 'retailer': 'Saturn', 'prefix': 'saturn'},
    {'model': MediaMarktProduct, 'retailer': 'MediaMarkt', 'prefix': 'mediamarkt'},
    {'model': OttoProduct, 'retailer': 'Otto', 'prefix': 'otto'},
    {'model': KauflandProduct, 'retailer': 'Kaufland', 'prefix': 'kaufland'},
]


def _clean(text, max_len=1000):
    """Clean text for TSV: remove tabs, newlines, limit length."""
    if not text:
        return ''
    return text.replace('\t', ' ').replace('\n', ' ').replace('\r', '').strip()[:max_len]


def _product_to_row(product, retailer, prefix):
    """Convert a product model instance to a feed row dict."""
    product_id = f"{prefix}-{product.sku or str(product.pk)}"
    title = _clean(product.title, 150)
    description = _clean(product.description or product.title, 5000)
    price = f"{product.price:.2f} EUR" if product.price else ''
    image = product.image or ''
    brand = _clean(product.brand, 100) if product.brand else ''
    gtin = product.gtin or ''
    category = _clean(product.category, 250) if product.category else ''

    # Link to preisradio.de product page
    link = f"https://preisradio.de/product/{prefix}-{product.sku or str(product.pk)}"

    # Sale price if there's a discount
    sale_price = ''
    if product.old_price and product.price and product.old_price > product.price:
        sale_price = f"{product.price:.2f} EUR"
        price = f"{product.old_price:.2f} EUR"

    # item_group_id = GTIN (groups same product across retailers)
    item_group_id = gtin if gtin else ''

    return {
        'id': product_id,
        'title': title,
        'description': description,
        'link': link,
        'image_link': image,
        'price': price,
        'availability': 'in stock',
        'brand': brand,
        'condition': 'new',
        'gtin': gtin,
        'item_group_id': item_group_id,
        'product_type': category,
        'sale_price': sale_price,
    }


@require_GET
@cache_page(6 * 3600)  # Cache 6 hours
def pinterest_feed(request):
    """Generate TSV product feed for Pinterest Catalogs.

    URL: /api/pinterest-feed/
    Format: TSV (tab-separated values), UTF-8
    """
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=FEED_HEADERS, delimiter='\t',
                            extrasaction='ignore', quoting=csv.QUOTE_MINIMAL)
    writer.writeheader()

    total = 0
    for config in RETAILER_CONFIGS:
        model = config['model']
        retailer = config['retailer']
        prefix = config['prefix']

        try:
            # Fetch products with required fields (title, price, image)
            products = model.objects.filter(
                title__ne='', price__gt=0, image__ne=None
            ).only(
                'sku', 'title', 'description', 'price', 'old_price',
                'image', 'brand', 'gtin', 'category', 'url'
            ).limit(50000)

            count = 0
            for product in products:
                if not product.image:
                    continue
                row = _product_to_row(product, retailer, prefix)
                writer.writerow(row)
                count += 1

            logger.info("Pinterest feed: %d %s products", count, retailer)
            total += count

        except Exception as e:
            logger.error("Pinterest feed error for %s: %s", retailer, e)

    logger.info("Pinterest feed generated: %d total products", total)

    response = HttpResponse(output.getvalue(), content_type='text/tab-separated-values; charset=utf-8')
    response['Content-Disposition'] = 'inline; filename="pinterest-feed.tsv"'
    return response

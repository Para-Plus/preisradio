import io
import csv
from django.http import StreamingHttpResponse
from django.views.decorators.cache import cache_page
from .models import SaturnProduct, MediaMarktProduct, OttoProduct, KauflandProduct


RETAILERS = [
    ('saturn', SaturnProduct),
    ('mediamarkt', MediaMarktProduct),
    ('otto', OttoProduct),
    ('kaufland', KauflandProduct),
]

TSV_FIELDS = [
    'id', 'title', 'description', 'link', 'image_link',
    'price', 'sale_price', 'availability', 'brand',
    'condition', 'gtin', 'item_group_id', 'product_type',
]


def _product_rows(prefix, products):
    for p in products:
        price_str = f"{p.price:.2f} EUR" if p.price else ''
        sale_price_str = ''
        if p.old_price and p.old_price > p.price:
            sale_price_str = f"{p.price:.2f} EUR"
            price_str = f"{p.old_price:.2f} EUR"

        sku = p.sku or str(p.id)
        yield {
            'id': f"{prefix}-{sku}",
            'title': (p.title or '')[:150],
            'description': (p.description or p.title or '')[:5000],
            'link': f"https://preisradio.de/product/{prefix}-{sku}",
            'image_link': p.image or '',
            'price': price_str,
            'sale_price': sale_price_str,
            'availability': 'in stock',
            'brand': p.brand or '',
            'condition': 'new',
            'gtin': p.gtin or '',
            'item_group_id': p.gtin or sku,
            'product_type': p.category or '',
        }


@cache_page(6 * 3600)
def pinterest_feed(request):
    def generate():
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=TSV_FIELDS, delimiter='\t',
                                lineterminator='\n', extrasaction='ignore')
        writer.writeheader()
        yield output.getvalue()

        for prefix, Model in RETAILERS:
            for row in _product_rows(prefix, Model.objects.only(
                'sku', 'title', 'description', 'url', 'image',
                'price', 'old_price', 'brand', 'gtin', 'category'
            )):
                output = io.StringIO()
                writer = csv.DictWriter(output, fieldnames=TSV_FIELDS, delimiter='\t',
                                        lineterminator='\n', extrasaction='ignore')
                writer.writerow(row)
                yield output.getvalue()

    response = StreamingHttpResponse(generate(), content_type='text/tab-separated-values; charset=utf-8')
    response['Content-Disposition'] = 'inline; filename="pinterest_feed.tsv"'
    return response

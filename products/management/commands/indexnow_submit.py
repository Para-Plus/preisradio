"""
Submit recently scraped product pages (plus their brand and category pages)
to IndexNow (Bing & co.). Meant to run once a day from cron.

Usage:
    python manage.py indexnow_submit            # products scraped in the last 26h
    python manage.py indexnow_submit --hours 72
    python manage.py indexnow_submit --dry-run
"""
import re
from datetime import datetime, timedelta, timezone

from django.core.management.base import BaseCommand, CommandError

from blog.indexnow import submit_urls
from products.models import SaturnProduct, MediaMarktProduct, OttoProduct, KauflandProduct

SITE = 'https://preisradio.de'
BATCH_SIZE = 10000  # IndexNow per-request maximum

STORES = [
    ('Saturn', SaturnProduct),
    ('MediaMarkt', MediaMarktProduct),
    ('Otto', OttoProduct),
    ('Kaufland', KauflandProduct),
]


def slugify(value):
    return re.sub(r'[^a-z0-9]+', '-', value.lower())


class Command(BaseCommand):
    help = 'Submit recently scraped product, brand and category URLs to IndexNow'

    def add_arguments(self, parser):
        # 26h instead of 24h so a daily run slightly late never leaves a gap.
        parser.add_argument('--hours', type=int, default=26)
        parser.add_argument('--dry-run', action='store_true')

    def handle(self, *args, **options):
        since = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(hours=options['hours'])

        product_urls, brands, categories = [], set(), set()
        for store_name, Model in STORES:
            query = {'scraped_at': {'$gte': since}}
            if Model is KauflandProduct:
                # Same exclusion as the API: these product pages return 404.
                query['$or'] = [{'price': {'$gte': 10}}, {'old_price': {'$ne': None}}]
            cursor = Model._get_collection().find(query, {'_id': 1, 'brand': 1, 'category': 1})
            count = 0
            for doc in cursor:
                product_urls.append(f"{SITE}/product/{doc['_id']}")
                if doc.get('brand'):
                    brands.add(slugify(doc['brand']))
                if doc.get('category'):
                    categories.add(slugify(doc['category']))
                count += 1
            self.stdout.write(f'{store_name}: {count} products')

        urls = (
            [f'{SITE}/kategorien/{c}' for c in sorted(categories) if c.strip('-')]
            + [f'{SITE}/marken/{b}' for b in sorted(brands) if b.strip('-')]
            + product_urls
        )
        self.stdout.write(
            f'Total: {len(urls)} URLs ({len(categories)} categories, '
            f'{len(brands)} brands, {len(product_urls)} products)'
        )

        if options['dry_run'] or not urls:
            for url in urls[:20]:
                self.stdout.write(f'  {url}')
            return

        failed = 0
        for i in range(0, len(urls), BATCH_SIZE):
            batch = urls[i:i + BATCH_SIZE]
            if submit_urls(batch, timeout=60):
                self.stdout.write(self.style.SUCCESS(f'Batch {i // BATCH_SIZE + 1}: {len(batch)} URLs accepted'))
            else:
                failed += 1
                self.stdout.write(self.style.ERROR(f'Batch {i // BATCH_SIZE + 1}: {len(batch)} URLs rejected'))

        if failed:
            raise CommandError(f'{failed} IndexNow batch(es) rejected')

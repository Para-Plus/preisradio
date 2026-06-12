"""
Django management command to display product counts per category per store.

Usage:
    python manage.py category_stats
"""

from django.core.management.base import BaseCommand
from products.models import SaturnProduct, MediaMarktProduct, OttoProduct, KauflandProduct


STORES = [
    ('Saturn',     SaturnProduct),
    ('MediaMarkt', MediaMarktProduct),
    ('Otto',       OttoProduct),
    ('Kaufland',   KauflandProduct),
]


class Command(BaseCommand):
    help = 'Display product counts per category per store'

    def handle(self, *args, **options):
        # Collect all categories across all stores
        all_categories = set()
        store_data = {}

        for store_name, Model in STORES:
            pipeline = [
                {"$group": {"_id": "$category", "count": {"$sum": 1}}},
                {"$sort": {"_id": 1}},
            ]
            collection = Model._get_collection()
            results = list(collection.aggregate(pipeline))
            store_data[store_name] = {r['_id']: r['count'] for r in results}
            all_categories.update(store_data[store_name].keys())

        all_categories = sorted(all_categories)

        # Header
        col_width = 22
        store_names = [s[0] for s in STORES]
        header = f"{'Kategorie':<{col_width}}" + "".join(f"{s:>12}" for s in store_names) + f"{'TOTAL':>12}"
        separator = "-" * (col_width + 12 * (len(STORES) + 1))

        self.stdout.write("")
        self.stdout.write(self.style.MIGRATE_HEADING("=== Produits par Catégorie par Store ==="))
        self.stdout.write(separator)
        self.stdout.write(header)
        self.stdout.write(separator)

        grand_total = 0
        store_totals = {s: 0 for s in store_names}

        for cat in all_categories:
            row_total = 0
            line = f"{cat:<{col_width}}"
            for store_name, _ in STORES:
                count = store_data[store_name].get(cat, 0)
                line += f"{count:>12,}" if count else f"{'—':>12}"
                row_total += count
                store_totals[store_name] += count
            line += f"{row_total:>12,}"
            grand_total += row_total
            self.stdout.write(line)

        # Footer totals
        self.stdout.write(separator)
        total_line = f"{'TOTAL':<{col_width}}"
        for store_name in store_names:
            total_line += f"{store_totals[store_name]:>12,}"
        total_line += f"{grand_total:>12,}"
        self.stdout.write(self.style.SUCCESS(total_line))
        self.stdout.write(separator)
        self.stdout.write(f"\nTotal général : {grand_total:,} produits dans {len(all_categories)} catégories\n")

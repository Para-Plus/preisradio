"""
Fusionne la catégorie "Klima" dans "Heizung & Klima" pour tous les stores.

Usage:
    python manage.py merge_klima --dry-run   # aperçu sans modifier
    python manage.py merge_klima             # fusion réelle
"""

from django.core.management.base import BaseCommand
from products.models import SaturnProduct, MediaMarktProduct, OttoProduct, KauflandProduct

STORES = [
    ('Saturn',     SaturnProduct),
    ('MediaMarkt', MediaMarktProduct),
    ('Otto',       OttoProduct),
    ('Kaufland',   KauflandProduct),
]

SOURCE = 'Klima'
TARGET = 'Heizung & Klima'


class Command(BaseCommand):
    help = 'Fusionne "Klima" dans "Heizung & Klima" pour tous les stores'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Aperçu sans modification')

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        if dry_run:
            self.stdout.write(self.style.WARNING('--- MODE DRY-RUN (aucune modification) ---\n'))

        total_merged = 0

        for store_name, Model in STORES:
            count_source = Model.objects(category=SOURCE).count()
            count_target = Model.objects(category=TARGET).count()

            self.stdout.write(
                f'{store_name}: "{SOURCE}" = {count_source} produits | '
                f'"{TARGET}" = {count_target} produits'
            )

            if count_source == 0:
                self.stdout.write(f'  → Aucun produit "{SOURCE}", rien à faire.\n')
                continue

            if not dry_run:
                updated = Model.objects(category=SOURCE).update(set__category=TARGET)
                self.stdout.write(self.style.SUCCESS(
                    f'  → {updated} produits renommés "{SOURCE}" → "{TARGET}"'
                ))
                total_merged += updated
            else:
                self.stdout.write(
                    f'  → [dry-run] {count_source} produits seraient renommés "{SOURCE}" → "{TARGET}"'
                )
                total_merged += count_source

            self.stdout.write('')

        if dry_run:
            self.stdout.write(self.style.WARNING(f'Total (dry-run) : {total_merged} produits à fusionner.'))
            self.stdout.write('Relancez sans --dry-run pour appliquer.')
        else:
            self.stdout.write(self.style.SUCCESS(f'✓ Total fusionné : {total_merged} produits.'))
            self.stdout.write(f'  La catégorie "{SOURCE}" est maintenant vide dans tous les stores.')

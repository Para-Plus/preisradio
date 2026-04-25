"""
Management command: migrate_to_imagekit
Migrates all Wagtail images from Cloudinary to ImageKit.

Usage:
    python manage.py migrate_to_imagekit
    python manage.py migrate_to_imagekit --dry-run
"""
import io
import os
import urllib.request
import logging
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Migrate all Wagtail images from Cloudinary to ImageKit'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be migrated without actually doing it',
        )

    def handle(self, *args, **options):
        from wagtail.images import get_image_model
        Image = get_image_model()

        dry_run = options['dry_run']
        images = Image.objects.all()
        total = images.count()

        self.stdout.write(f"Found {total} images to migrate.")
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN — no changes will be made."))

        success = 0
        skipped = 0
        failed = 0

        for img in images:
            try:
                file_name = img.file.name if img.file else None

                if not file_name:
                    self.stdout.write(self.style.WARNING(f"  SKIP (no file): {img.title}"))
                    skipped += 1
                    continue

                # Already migrated: file name starts with ImageKit folder (preisradio/)
                imagekit_folder = 'preisradio/'
                if file_name.startswith(imagekit_folder) or file_name.startswith('/' + imagekit_folder):
                    self.stdout.write(f"  SKIP (already ImageKit): {img.title}")
                    skipped += 1
                    continue

                # Build Cloudinary download URL via Admin API (returns actual CDN secure_url)
                import cloudinary
                import cloudinary.api
                from decouple import config as env
                cloudinary.config(
                    cloud_name=env('CLOUDINARY_CLOUD_NAME', default='dumra5wv4'),
                    api_key=env('CLOUDINARY_API_KEY', default=''),
                    api_secret=env('CLOUDINARY_API_SECRET', default=''),
                )
                # Use Admin API to get the actual secure CDN URL
                try:
                    resource = cloudinary.api.resource(file_name, resource_type='image')
                    download_url = resource['secure_url']
                except Exception as api_exc:
                    # Fallback: build URL manually from cloud_name
                    cloud_name = env('CLOUDINARY_CLOUD_NAME', default='dumra5wv4')
                    download_url = f"https://res.cloudinary.com/{cloud_name}/image/upload/{file_name}"
                    self.stdout.write(self.style.WARNING(
                        f"  API lookup failed ({api_exc}), using fallback URL"
                    ))

                self.stdout.write(f"  Migrating: {img.title} → {download_url[:70]}")

                if dry_run:
                    success += 1
                    continue

                # Download from Cloudinary
                req = urllib.request.Request(
                    download_url,
                    headers={'User-Agent': 'preisradio-migrator/1.0'}
                )
                with urllib.request.urlopen(req, timeout=30) as response:
                    file_data = response.read()

                # Upload to ImageKit via Django storage
                file_name = os.path.basename(img.file.name) or f"image_{img.pk}.jpg"
                content = ContentFile(file_data, name=file_name)

                # Save via the new ImageKit storage backend
                img.file.save(file_name, content, save=True)

                self.stdout.write(self.style.SUCCESS(
                    f"  OK: {img.title} → {img.file.url[:60]}..."
                ))
                success += 1

            except Exception as exc:
                self.stdout.write(self.style.ERROR(f"  FAILED: {img.title} — {exc}"))
                failed += 1

        self.stdout.write("\n" + "="*50)
        self.stdout.write(f"Migration complete:")
        self.stdout.write(f"  Success : {success}")
        self.stdout.write(f"  Skipped : {skipped}")
        self.stdout.write(f"  Failed  : {failed}")

        if failed:
            self.stdout.write(self.style.WARNING(
                "Some images failed. Re-run the command to retry."
            ))

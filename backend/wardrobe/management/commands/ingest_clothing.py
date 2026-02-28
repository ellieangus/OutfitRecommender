"""
Bulk-ingest clothing photos into the wardrobe for a given user.

Usage:
    python manage.py ingest_clothing --user <username> --directory <path/to/images>
    python manage.py ingest_clothing --user admin --directory "media/clothing/raw/HackUSU Drive"

Skips any image where a ClothingItem with that filename already exists for the user.
HEIC/HEIF files are automatically converted to JPEG before storing and sending to Claude.
"""

import io
import os

import pillow_heif
from PIL import Image
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError

from wardrobe.claude_api import analyze_clothing_image
from wardrobe.models import ClothingItem

pillow_heif.register_heif_opener()

User = get_user_model()

SUPPORTED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif'}


_MAX_DIMENSION = 1600   # resize before storing — keeps files well under 5 MB


def _load_as_jpeg_bytes(src_path: str) -> bytes:
    """Open any supported image, resize if large, and return JPEG bytes."""
    img = Image.open(src_path).convert('RGB')
    w, h = img.size
    if w > _MAX_DIMENSION or h > _MAX_DIMENSION:
        img.thumbnail((_MAX_DIMENSION, _MAX_DIMENSION), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, 'JPEG', quality=85)
    return buf.getvalue()


class Command(BaseCommand):
    help = 'Bulk-ingest clothing photos for a user, calling Claude to generate AI attributes.'

    def add_arguments(self, parser):
        parser.add_argument('--user', required=True, help='Username to assign items to')
        parser.add_argument('--directory', required=True, help='Directory containing clothing photos')
        parser.add_argument(
            '--category',
            default='other',
            help='Default category for all items (can be updated in the UI)',
        )

    def handle(self, *args, **options):
        username = options['user']
        directory = options['directory']
        category = options['category']

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise CommandError(f"User '{username}' does not exist.")

        if not os.path.isdir(directory):
            raise CommandError(f"Directory '{directory}' does not exist.")

        image_files = [
            f for f in os.listdir(directory)
            if os.path.splitext(f)[1].lower() in SUPPORTED_EXTENSIONS
        ]

        if not image_files:
            self.stdout.write(self.style.WARNING('No supported image files found.'))
            return

        self.stdout.write(f'Found {len(image_files)} image(s). Starting ingestion...\n')

        created = 0
        skipped = 0
        errors = 0

        for filename in sorted(image_files):
            stem = os.path.splitext(filename)[0]

            # Skip if already ingested (match by stem so HEIC→JPEG renames don't re-ingest)
            existing = ClothingItem.objects.filter(
                user=user,
                image__icontains=stem,
            ).exists()

            if existing:
                self.stdout.write(f'  SKIP  {filename} (already ingested)')
                skipped += 1
                continue

            src_path = os.path.join(directory, filename)
            self.stdout.write(f'  INGEST {filename} ...', ending='')

            try:
                jpeg_bytes = _load_as_jpeg_bytes(src_path)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f' LOAD ERROR: {e}'))
                errors += 1
                continue

            # Save as JPEG regardless of source format
            save_name = f'{stem}.jpg'
            item = ClothingItem(user=user, source='photo', category=category)
            item.image.save(save_name, ContentFile(jpeg_bytes), save=True)

            try:
                attrs = analyze_clothing_image(item.image.path)
                item.ai_attributes = attrs
                item.save()
                label = f'{attrs.get("type", "?")} | {attrs.get("color", [])}'
                self.stdout.write(self.style.SUCCESS(f' OK — {label}'))
            except Exception as e:
                item.ai_attributes = {'error': str(e)}
                item.save()
                self.stdout.write(self.style.ERROR(f' AI ERROR: {e}'))
                errors += 1

            created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'\nDone. Created: {created} | Skipped: {skipped} | Errors: {errors}'
            )
        )

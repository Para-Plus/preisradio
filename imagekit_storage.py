"""
Custom Django Storage backend for ImageKit.io (SDK v5.x)
Replaces django-cloudinary-storage for Wagtail blog images.
"""
import os
import logging
from io import BytesIO
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible
from decouple import config

logger = logging.getLogger(__name__)


@deconstructible
class ImageKitStorage(Storage):
    """
    Django storage backend that saves files to ImageKit.io via the upload API.
    Compatible with imagekitio SDK v5.x.

    Required env variables:
        IMAGEKIT_PRIVATE_KEY   — starts with private_
        IMAGEKIT_PUBLIC_KEY    — starts with public_
        IMAGEKIT_URL_ENDPOINT  — e.g. https://ik.imagekit.io/your_id
        IMAGEKIT_FOLDER        — optional, default: /preisradio/
    """

    def __init__(self):
        from imagekitio import ImageKit
        self._private_key = config('IMAGEKIT_PRIVATE_KEY', default='')
        self._public_key = config('IMAGEKIT_PUBLIC_KEY', default='')
        self._url_endpoint = config('IMAGEKIT_URL_ENDPOINT', default='').rstrip('/')
        self._folder = config('IMAGEKIT_FOLDER', default='/preisradio/')

        self.imagekit = ImageKit(private_key=self._private_key)

    # ------------------------------------------------------------------
    # Required Storage API
    # ------------------------------------------------------------------

    def _save(self, name, content):
        content.seek(0)
        file_data = content.read()
        file_name = os.path.basename(name)

        try:
            result = self.imagekit.files.upload(
                file=file_data,
                file_name=file_name,
                folder=self._folder,
                public_key=self._public_key,
                use_unique_file_name=False,
                is_private_file=False,
            )
            # result.url = full ImageKit CDN URL
            # Store file_path (relative) for url() reconstruction
            file_path = result.file_path.lstrip('/')
            logger.info("ImageKit upload OK: %s → %s", file_name, result.url)
            return file_path
        except Exception as exc:
            logger.error("ImageKit upload failed for %s: %s", name, exc)
            raise

    def _open(self, name, mode='rb'):
        import urllib.request
        url = self.url(name)
        response = urllib.request.urlopen(url)
        return BytesIO(response.read())

    def url(self, name):
        if name and name.startswith('http'):
            return name
        if not name:
            return ''
        return f"{self._url_endpoint}/{name.lstrip('/')}"

    def exists(self, name):
        return False

    def delete(self, name):
        pass

    def size(self, name):
        return 0

    def get_valid_name(self, name):
        return name

    def get_available_name(self, name, max_length=None):
        return name

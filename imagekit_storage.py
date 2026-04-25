"""
Custom Django Storage backend for ImageKit.io
Replaces django-cloudinary-storage for Wagtail blog images.
"""
import os
import mimetypes
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
    Configured via environment variables:
        IMAGEKIT_PUBLIC_KEY
        IMAGEKIT_PRIVATE_KEY
        IMAGEKIT_URL_ENDPOINT  (e.g. https://ik.imagekit.io/your_id)
        IMAGEKIT_FOLDER        (optional, default: /preisradio/)
    """

    def __init__(self):
        from imagekitio import ImageKit
        self._public_key = config('IMAGEKIT_PUBLIC_KEY', default='')
        self._private_key = config('IMAGEKIT_PRIVATE_KEY', default='')
        self._url_endpoint = config('IMAGEKIT_URL_ENDPOINT', default='').rstrip('/')
        self._folder = config('IMAGEKIT_FOLDER', default='/preisradio/')

        self.imagekit = ImageKit(
            public_key=self._public_key,
            private_key=self._private_key,
            url_endpoint=self._url_endpoint,
        )

    # ------------------------------------------------------------------
    # Required Storage API
    # ------------------------------------------------------------------

    def _save(self, name, content):
        content.seek(0)
        file_data = content.read()
        file_name = os.path.basename(name)

        try:
            from imagekitio.models.UploadFileRequestOptions import UploadFileRequestOptions
            options = UploadFileRequestOptions(
                folder=self._folder,
                is_private_file=False,
            )
            result = self.imagekit.upload_file(
                file=file_data,
                file_name=file_name,
                options=options,
            )
            # Store relative path (without URL endpoint) so url() can reconstruct
            url = result.url
            relative = url.replace(self._url_endpoint, '').lstrip('/')
            return relative
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
        return f"{self._url_endpoint}/{name.lstrip('/')}" if name else ''

    def exists(self, name):
        # Always allow upload — ImageKit handles deduplication by file name
        return False

    def delete(self, name):
        """Optional deletion via ImageKit API."""
        try:
            # ImageKit requires fileId to delete; skip if not available
            pass
        except Exception as exc:
            logger.warning("ImageKit delete failed for %s: %s", name, exc)

    def size(self, name):
        return 0

    def get_valid_name(self, name):
        return name

    def get_available_name(self, name, max_length=None):
        return name

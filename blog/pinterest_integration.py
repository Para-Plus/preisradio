"""
Pinterest API v5 integration for blog auto-publishing.
Handles OAuth 2.0 flow and pin creation.
"""
import json
import logging
import os
import re
import urllib.request
import urllib.parse
import ssl
from base64 import b64encode

from django.conf import settings

logger = logging.getLogger(__name__)

PINTEREST_API_URL = 'https://api.pinterest.com/v5'
PINTEREST_OAUTH_URL = 'https://www.pinterest.com/oauth/'
PINTEREST_TOKEN_URL = f'{PINTEREST_API_URL}/oauth/token'

# Token file path (stored on server, not in repo)
TOKEN_FILE = os.path.join(os.path.expanduser('~'), '.pinterest_tokens.json')


def _get_credentials():
    app_id = getattr(settings, 'PINTEREST_APP_ID', '') or os.environ.get('PINTEREST_APP_ID', '')
    app_secret = getattr(settings, 'PINTEREST_APP_SECRET', '') or os.environ.get('PINTEREST_APP_SECRET', '')
    return app_id, app_secret


def _api_request(method, endpoint, data=None, access_token=None):
    """Make a request to Pinterest API v5."""
    url = f'{PINTEREST_API_URL}{endpoint}'
    ctx = ssl.create_default_context()

    if data is not None:
        body = json.dumps(data).encode('utf-8')
    else:
        body = None

    req = urllib.request.Request(url, data=body, method=method)
    req.add_header('Content-Type', 'application/json')
    if access_token:
        req.add_header('Authorization', f'Bearer {access_token}')

    try:
        resp = urllib.request.urlopen(req, context=ctx, timeout=30)
        return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8', errors='replace')
        logger.error("Pinterest API error %d: %s", e.code, error_body)
        raise ValueError(f"Pinterest API Fehler ({e.code}): {error_body}")


# ── Token management ────────────────────────────────────────────────

def save_tokens(access_token, refresh_token):
    """Save tokens to file on server."""
    with open(TOKEN_FILE, 'w') as f:
        json.dump({'access_token': access_token, 'refresh_token': refresh_token}, f)
    logger.info("Pinterest tokens saved to %s", TOKEN_FILE)


def load_tokens():
    """Load tokens from file. Returns (access_token, refresh_token) or (None, None)."""
    if not os.path.exists(TOKEN_FILE):
        return None, None
    try:
        with open(TOKEN_FILE, 'r') as f:
            data = json.load(f)
        return data.get('access_token'), data.get('refresh_token')
    except (json.JSONDecodeError, IOError):
        return None, None


def is_connected():
    """Check if Pinterest tokens exist."""
    access_token, _ = load_tokens()
    return bool(access_token)


def disconnect():
    """Remove stored tokens."""
    if os.path.exists(TOKEN_FILE):
        os.remove(TOKEN_FILE)
        logger.info("Pinterest tokens removed")


# ── OAuth 2.0 ───────────────────────────────────────────────────────

def get_authorize_url(redirect_uri):
    """Build the Pinterest OAuth authorization URL."""
    app_id, _ = _get_credentials()
    if not app_id:
        raise ValueError("PINTEREST_APP_ID not configured")

    params = urllib.parse.urlencode({
        'response_type': 'code',
        'client_id': app_id,
        'redirect_uri': redirect_uri,
        'scope': 'pins:read,pins:write,boards:read,boards:write',
        'state': 'wagtail_pinterest',
    })
    return f'{PINTEREST_OAUTH_URL}?{params}'


def exchange_code(code, redirect_uri):
    """Exchange authorization code for access + refresh tokens."""
    app_id, app_secret = _get_credentials()
    if not app_id or not app_secret:
        raise ValueError("Pinterest credentials not configured")

    credentials = b64encode(f'{app_id}:{app_secret}'.encode()).decode()

    body = urllib.parse.urlencode({
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_uri,
        'continuous_refresh': 'true',
    }).encode('utf-8')

    ctx = ssl.create_default_context()
    req = urllib.request.Request(PINTEREST_TOKEN_URL, data=body, method='POST')
    req.add_header('Authorization', f'Basic {credentials}')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')

    try:
        resp = urllib.request.urlopen(req, context=ctx, timeout=30)
        data = json.loads(resp.read().decode('utf-8'))
        access_token = data['access_token']
        refresh_token = data['refresh_token']
        save_tokens(access_token, refresh_token)
        logger.info("Pinterest OAuth successful, scopes: %s", data.get('scope', ''))
        return data
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8', errors='replace')
        logger.error("Pinterest token exchange failed: %s", error_body)
        raise ValueError(f"Token-Austausch fehlgeschlagen: {error_body}")


def refresh_access_token():
    """Refresh the access token using the refresh token."""
    _, refresh_token = load_tokens()
    if not refresh_token:
        raise ValueError("Kein Refresh-Token vorhanden")

    app_id, app_secret = _get_credentials()
    credentials = b64encode(f'{app_id}:{app_secret}'.encode()).decode()

    body = urllib.parse.urlencode({
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'scope': 'pins:read,pins:write,boards:read,boards:write',
    }).encode('utf-8')

    ctx = ssl.create_default_context()
    req = urllib.request.Request(PINTEREST_TOKEN_URL, data=body, method='POST')
    req.add_header('Authorization', f'Basic {credentials}')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')

    try:
        resp = urllib.request.urlopen(req, context=ctx, timeout=30)
        data = json.loads(resp.read().decode('utf-8'))
        save_tokens(data['access_token'], data.get('refresh_token', refresh_token))
        logger.info("Pinterest token refreshed")
        return data
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8', errors='replace')
        logger.error("Pinterest token refresh failed: %s", error_body)
        raise ValueError(f"Token-Refresh fehlgeschlagen: {error_body}")


# ── Boards ───────────────────────────────────────────────────────────

def list_boards():
    """List all Pinterest boards."""
    access_token, _ = load_tokens()
    if not access_token:
        raise ValueError("Nicht mit Pinterest verbunden")
    return _api_request('GET', '/boards', access_token=access_token)


# ── Pin creation ─────────────────────────────────────────────────────

def create_pin(board_id, title, description, link, image_url):
    """Create a pin on Pinterest.

    Auto-refreshes the token on 401 and retries once.
    """
    access_token, _ = load_tokens()
    if not access_token:
        raise ValueError("Nicht mit Pinterest verbunden")

    pin_data = {
        'board_id': board_id,
        'title': title[:100],
        'description': description[:500],
        'link': link,
        'media_source': {
            'source_type': 'image_url',
            'url': image_url,
        },
    }

    try:
        result = _api_request('POST', '/pins', data=pin_data, access_token=access_token)
        logger.info("Pinterest pin created: %s", result.get('id'))
        return result
    except ValueError as e:
        if '401' in str(e):
            logger.info("Token expired, refreshing...")
            refresh_access_token()
            access_token, _ = load_tokens()
            result = _api_request('POST', '/pins', data=pin_data, access_token=access_token)
            logger.info("Pinterest pin created after refresh: %s", result.get('id'))
            return result
        raise


def publish_blog_to_pinterest(blog_page, board_id=None):
    """Publish a BlogPage as a Pinterest pin.

    Args:
        blog_page: BlogPage instance
        board_id: Pinterest board ID (uses PINTEREST_DEFAULT_BOARD if not specified)
    """
    if not is_connected():
        logger.warning("Pinterest not connected, skipping pin creation")
        return None

    if not board_id:
        board_id = getattr(settings, 'PINTEREST_DEFAULT_BOARD', '') or os.environ.get('PINTEREST_DEFAULT_BOARD', '')

    if not board_id:
        logger.warning("No Pinterest board configured (PINTEREST_DEFAULT_BOARD)")
        return None

    # Build pin data from blog page
    title = blog_page.title
    description = blog_page.excerpt or blog_page.title
    link = f'https://preisradio.de/blog/{blog_page.slug}'

    # Get image URL from ImageKit (URL transform for width-1000)
    image_url = ''
    if blog_page.image:
        try:
            image_url = blog_page.image.file.url
            if not image_url.startswith('http'):
                image_url = f'https://api.preisradio.de{image_url}'
            # ImageKit URL-based transformation: resize to width 1000
            if 'ik.imagekit.io' in image_url:
                sep = '&' if '?' in image_url else '?'
                image_url = f'{image_url}{sep}tr=w-1000'
        except Exception as e:
            logger.warning("Could not get image URL: %s", e)

    if not image_url:
        image_url = 'https://preisradio.de/og-image.webp'

    return create_pin(board_id, title, description, link, image_url)

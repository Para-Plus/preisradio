"""
IndexNow integration — instantly notify Bing (and other IndexNow-participating
search engines) when a blog article is published, instead of relying solely on
periodic sitemap re-crawls.
"""
import json
import logging
import urllib.request

logger = logging.getLogger(__name__)

INDEXNOW_KEY = '521e58667cf14de9bb6161c5c08de8ed'
INDEXNOW_HOST = 'preisradio.de'
INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'


def submit_url(url):
    """Submit a single URL to IndexNow. Never raises."""
    return submit_urls([url])


def submit_urls(urls):
    """Submit one or more URLs (must all belong to INDEXNOW_HOST) to IndexNow.

    Returns True on a 2xx response, False on any failure. Never raises —
    a failed submission must never break the page-publish flow that calls it.
    """
    if not urls:
        return False

    body = json.dumps({
        'host': INDEXNOW_HOST,
        'key': INDEXNOW_KEY,
        'keyLocation': f'https://{INDEXNOW_HOST}/{INDEXNOW_KEY}.txt',
        'urlList': urls,
    }).encode('utf-8')

    req = urllib.request.Request(
        INDEXNOW_ENDPOINT,
        data=body,
        method='POST',
        headers={'Content-Type': 'application/json; charset=utf-8'},
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            ok = 200 <= resp.status < 300
            logger.info("IndexNow: submitted %d URL(s), status %s", len(urls), resp.status)
            return ok
    except Exception as e:
        logger.warning("IndexNow submission failed for %s: %s", urls, e)
        return False

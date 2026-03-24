"""
Pinterest OAuth views for Wagtail admin.
"""
import json
import logging

from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET

from blog import pinterest_integration as pi

logger = logging.getLogger(__name__)


@staff_member_required
@require_GET
def pinterest_connect(request):
    """Start Pinterest OAuth flow — redirects to Pinterest."""
    redirect_uri = request.build_absolute_uri('/wagtail-admin/pinterest/callback/')
    try:
        auth_url = pi.get_authorize_url(redirect_uri)
        return HttpResponseRedirect(auth_url)
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=500)


@staff_member_required
@require_GET
def pinterest_callback(request):
    """OAuth callback — exchange code for tokens, redirect to admin."""
    code = request.GET.get('code')
    error = request.GET.get('error')

    if error:
        logger.error("Pinterest OAuth error: %s", error)
        return HttpResponseRedirect('/wagtail-admin/?pinterest=error')

    if not code:
        return HttpResponseRedirect('/wagtail-admin/?pinterest=no_code')

    redirect_uri = request.build_absolute_uri('/wagtail-admin/pinterest/callback/')

    try:
        pi.exchange_code(code, redirect_uri)
        return HttpResponseRedirect('/wagtail-admin/?pinterest=connected')
    except ValueError as e:
        logger.error("Pinterest token exchange failed: %s", e)
        return HttpResponseRedirect('/wagtail-admin/?pinterest=error')


@staff_member_required
@require_GET
def pinterest_disconnect(request):
    """Disconnect Pinterest (remove tokens)."""
    pi.disconnect()
    return HttpResponseRedirect('/wagtail-admin/?pinterest=disconnected')


@staff_member_required
@require_GET
def pinterest_status(request):
    """Return Pinterest connection status + boards list."""
    connected = pi.is_connected()
    data = {'connected': connected, 'boards': []}

    if connected:
        try:
            boards_resp = pi.list_boards()
            data['boards'] = [
                {'id': b['id'], 'name': b['name'], 'pin_count': b.get('pin_count', 0)}
                for b in boards_resp.get('items', [])
                if b.get('privacy') == 'PUBLIC'
            ]
        except Exception as e:
            logger.warning("Could not fetch boards: %s", e)
            data['error'] = str(e)

    return JsonResponse(data)


@csrf_exempt
@staff_member_required
@require_POST
def pinterest_publish(request):
    """Manually publish a blog page to Pinterest."""
    try:
        body = json.loads(request.body)
        page_id = body.get('page_id')
        board_id = body.get('board_id')
    except (json.JSONDecodeError, AttributeError):
        return JsonResponse({'error': 'Invalid request'}, status=400)

    if not page_id or not board_id:
        return JsonResponse({'error': 'page_id und board_id erforderlich'}, status=400)

    from blog.models import BlogPage
    try:
        page = BlogPage.objects.get(pk=page_id)
    except BlogPage.DoesNotExist:
        return JsonResponse({'error': 'Seite nicht gefunden'}, status=404)

    try:
        result = pi.publish_blog_to_pinterest(page, board_id=board_id)
        if result:
            return JsonResponse({
                'success': True,
                'pin_id': result.get('id'),
                'pin_url': f"https://www.pinterest.com/pin/{result.get('id')}/",
            })
        return JsonResponse({'error': 'Pin konnte nicht erstellt werden'}, status=500)
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=500)

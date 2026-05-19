from django.http import JsonResponse
from .models import BlogPage

CATEGORY_COLORS = {
    'Kaufberatung': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'Spartipps': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    'Technik': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    'Nachrichten': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'Testberichte': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}


def get_image_url(page):
    """Return image URL — ImageKit if uploaded, otherwise Cloudinary."""
    if page.imagekit_image:
        return page.imagekit_image.url
    if page.image:
        return page.image.file.url
    return ''


def serialize_article(page):
    """Convert a BlogPage to a JSON-friendly dict."""
    return {
        'id': page.pk,
        'title': page.title,
        'slug': page.slug,
        'excerpt': page.excerpt,
        'content': page.content,
        'category': page.category,
        'categoryColor': CATEGORY_COLORS.get(page.category, CATEGORY_COLORS['Kaufberatung']),
        'image': get_image_url(page),
        'amazonKeywords': [k.strip() for k in page.amazon_keywords.split(',') if k.strip()] if page.amazon_keywords else [],
        'amazonProductUrl': page.amazon_product_url or '',
        'productNames': [n.strip() for n in page.product_names.split(',') if n.strip()] if page.product_names else [],
        'author': page.author,
        'readTime': page.read_time,
        'date': page.published_date.isoformat() if page.published_date else page.first_published_at.isoformat() if page.first_published_at else '',
    }


def article_list(request):
    """GET /api/blog/articles/ — list all live blog articles."""
    articles = BlogPage.objects.live().order_by('-first_published_at')
    data = [serialize_article(a) for a in articles]
    return JsonResponse(data, safe=False)


def article_detail(request, slug):
    """GET /api/blog/articles/<slug>/ — single article by slug."""
    try:
        article = BlogPage.objects.live().get(slug=slug)
        return JsonResponse(serialize_article(article))
    except BlogPage.DoesNotExist:
        return JsonResponse({'error': 'Article not found'}, status=404)


def article_slugs(request):
    """GET /api/blog/slugs/ — all published slugs for generateStaticParams."""
    slugs = list(BlogPage.objects.live().values_list('slug', flat=True))
    return JsonResponse(slugs, safe=False)

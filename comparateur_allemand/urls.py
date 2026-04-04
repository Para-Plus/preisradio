from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from wagtail.admin import urls as wagtailadmin_urls
from wagtail import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls

urlpatterns = [
    path('admin/', admin.site.urls),
    path('wagtail-admin/', include(wagtailadmin_urls)),
    path('documents/', include(wagtaildocs_urls)),
    path('api/', include('products.urls')),
    path('mcp/', include('products.urls_mcp')),
    path('api/contact/', include('contact.urls')),
    path('api/blog/', include('blog.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RetailerViewSet, ProductViewSet
from .health import health_check, api_status

router = DefaultRouter()
router.register(r'retailers', RetailerViewSet, basename='retailer')
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
    path('health/', health_check, name='health-check'),
    path('status/', api_status, name='api-status'),
]

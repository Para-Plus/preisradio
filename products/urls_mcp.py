from django.urls import path
from .views_mcp import mcp_endpoint

urlpatterns = [
    path('', mcp_endpoint, name='mcp'),
]

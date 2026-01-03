"""
URL patterns for companies app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyListView,
    CompanyDashboardView,
    CompanyStatusView,
    CompanySettingsView,
    CompanyAdminViewSet
)

# Admin router for CRUD
admin_router = DefaultRouter()
admin_router.register('companies', CompanyAdminViewSet, basename='admin-companies')

urlpatterns = [
    # Student endpoints
    path('', CompanyListView.as_view(), name='company_list'),
    
    # Company token-based endpoints
    path('<str:token>/', CompanyDashboardView.as_view(), name='company_dashboard'),
    path('<str:token>/status/', CompanyStatusView.as_view(), name='company_status'),
    path('<str:token>/settings/', CompanySettingsView.as_view(), name='company_settings'),
    
    # Admin endpoints (nested under admin/)
    path('admin/', include(admin_router.urls)),
]

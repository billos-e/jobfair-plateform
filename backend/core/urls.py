"""
Main URL Configuration for JobFair Platform
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .views import AdminDashboardView


class HealthCheckView(APIView):
    """Health check endpoint for monitoring"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({'status': 'ok'})


urlpatterns = [
    # Health check
    path('health/', HealthCheckView.as_view(), name='health'),
    
    # Django Admin
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('users.urls')),
    path('api/students/', include('students.urls')),
    path('api/companies/', include('companies.urls')),
    path('api/queues/', include('queues.urls')),
    
    # Admin custom dashboard
    path('api/admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    
    # Company token-based queue operations (complete endpoint)
    path('api/company/<str:token>/queues/', include('queues.urls')),
]

"""
URL patterns for students app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentMeView, StudentStatusView, StudentAdminViewSet

# Admin router for CRUD
admin_router = DefaultRouter()
admin_router.register('students', StudentAdminViewSet, basename='admin-students')

urlpatterns = [
    path('me/', StudentMeView.as_view(), name='student_me'),
    path('me/status/', StudentStatusView.as_view(), name='student_status'),
    
    # Admin endpoints (nested under admin/)
    path('admin/', include(admin_router.urls)),
]

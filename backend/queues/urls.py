"""
URL patterns for queues app
"""
from django.urls import path
from .views import (
    StudentQueueListView, 
    QueueStartInterviewView, 
    QueueCompleteView, 
    StudentOpportunitiesView,
    QueueDetailView
)

app_name = 'queues'

urlpatterns = [
    # Student endpoints
    path('', StudentQueueListView.as_view(), name='queue_list'),
    path('opportunities/', StudentOpportunitiesView.as_view(), name='opportunities'),
    path('<int:pk>/start/', QueueStartInterviewView.as_view(), name='queue_start'),
    path('<int:pk>/complete/', QueueCompleteView.as_view(), name='queue_complete'),
    path('<int:pk>/', QueueDetailView.as_view(), name='queue_detail'),
]

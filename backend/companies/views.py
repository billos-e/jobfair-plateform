"""
Views for company operations - Updated with notifications
"""
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from core.permissions import IsStudent, IsCompanyToken, IsAdmin
from .models import Company
from .serializers import (
    CompanyPublicSerializer,
    CompanyDashboardSerializer,
    CompanyStatusSerializer,
    CompanyAdminSerializer,
    CompanyCreateSerializer
)
from queues.models import Queue
from queues.services import QueueService
from queues.serializers import QueueCompanySerializer
from notifications.services import NotificationService


class CompanyListView(APIView):
    """
    List companies for students
    R17: Only shows companies in 'recruiting' status
    """
    
    permission_classes = [IsStudent]
    
    def get(self, request):
        companies = Company.objects.filter(status='recruiting').order_by('name')
        serializer = CompanyPublicSerializer(companies, many=True)
        return Response(serializer.data)


class CompanyDashboardView(APIView):
    """
    Company dashboard accessed via token
    Returns company info + queue sections using QueueService
    """
    
    permission_classes = [IsCompanyToken]
    
    def get(self, request, token):
        company = request.company
        
        # Use service for queue status
        queue_status = QueueService.get_queue_status(company)
        
        return Response({
            'company': CompanyDashboardSerializer(company).data,
            'in_interview': QueueCompanySerializer(queue_status['in_interview'], many=True).data,
            'waiting': QueueCompanySerializer(queue_status['waiting'], many=True).data,
            'completed': QueueCompanySerializer(queue_status['completed'][:20], many=True).data,  # Limit completed
            'stats': {
                'total_waiting': queue_status['total_waiting'],
                'available_now': queue_status['available_count']
            }
        })


class CompanyStatusView(APIView):
    """Change company status (pause/resume) - R17-R20"""
    
    permission_classes = [IsCompanyToken]
    
    def patch(self, request, token):
        company = request.company
        old_status = company.status
        
        serializer = CompanyStatusSerializer(company, data=request.data)
        if serializer.is_valid():
            serializer.save()
            new_status = company.status
            
            # Trigger notification if status changed
            if old_status != new_status:
                NotificationService.on_company_status_change(company, new_status)
            
            return Response({
                'message': f"Status changed to '{company.status}'",
                'status': company.status
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Admin ViewSet for full CRUD
class CompanyAdminViewSet(viewsets.ModelViewSet):
    """Admin CRUD for companies"""
    
    permission_classes = [IsAdmin]
    queryset = Company.objects.all().order_by('name')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CompanyCreateSerializer
        return CompanyAdminSerializer
    
    @action(detail=True, methods=['post'])
    def regenerate_token(self, request, pk=None):
        """Regenerate company access token"""
        company = self.get_object()
        new_token = company.regenerate_token()
        return Response({
            'message': 'Token regenerated successfully',
            'access_token': new_token,
            'access_url': f"/company/{new_token}"
        })
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Admin action to pause company"""
        company = self.get_object()
        if company.status != 'paused':
            company.pause()
            NotificationService.on_company_status_change(company, 'paused')
        return Response({'status': 'paused'})
    
    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        """Admin action to resume company"""
        company = self.get_object()
        if company.status != 'recruiting':
            company.resume()
            NotificationService.on_company_status_change(company, 'recruiting')
        return Response({'status': 'recruiting'})

    @action(detail=True, methods=['get'])
    def queue(self, request, pk=None):
        """Get company queue for admin"""
        company = self.get_object()
        status = QueueService.get_queue_status(company)
        return Response({
            'in_interview': QueueCompanySerializer(status['in_interview'], many=True).data,
            'waiting': QueueCompanySerializer(status['waiting'], many=True).data,
            'completed': QueueCompanySerializer(status['completed'], many=True).data,
            'stats': {
                'total_waiting': status['total_waiting'],
                'available_now': status['available_count']
            }
        })

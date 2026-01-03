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
    CompanySettingsSerializer,
    CompanyStatusSerializer,
    CompanyAdminSerializer,
    CompanyCreateSerializer
)
from queues.models import Queue
from queues.services import QueueService
from queues.serializers import QueueCompanySerializer
from notifications.services import NotificationService

from django.db import models
from students.models import Student
from queues.serializers import QueueCreateSerializer
from django.shortcuts import get_object_or_404


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


class CompanySettingsView(APIView):
    """Update settings (slots, max queue)"""
    
    permission_classes = [IsCompanyToken]
    
    def patch(self, request, token):
        print(f"DEBUG: CompanySettingsView patch called with data: {request.data}")
        company = request.company
        serializer = CompanySettingsSerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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

    @action(detail=True, methods=['post'])
    def reorder_queue(self, request, pk=None):
        """
        Reorder student in queue
        Body: { "queue_id": 123, "new_position": 5 }
        """
        company = self.get_object()
        queue_id = request.data.get('queue_id')
        new_position = request.data.get('new_position')
        
        try:
            queue_item = Queue.objects.get(id=queue_id, company=company)
            # Basic reorder logic: Remove from old pos, insert at new
            # For simplicity, we can swap or shift. 
            # Ideally, use a library or proper logic. 
            # Here: simplistic shift.
            old_position = queue_item.position
            if old_position == new_position:
                return Response({'status': 'unchanged'})
            
            # Shift others
            if old_position < new_position:
                Queue.objects.filter(
                    company=company, 
                    position__gt=old_position, 
                    position__lte=new_position
                ).update(position=models.F('position') - 1)
            else:
                Queue.objects.filter(
                    company=company, 
                    position__gte=new_position, 
                    position__lt=old_position
                ).update(position=models.F('position') + 1)
                
            queue_item.position = new_position
            queue_item.save()
            
            return Response({'status': 'reordered'})
        except Queue.DoesNotExist:
            return Response({'error': 'Queue item not found'}, status=404)

    @action(detail=True, methods=['post'])
    def force_add_student(self, request, pk=None):
        """
        Admin forces student into queue
        Body: { "student_id": 456 }
        """
        company = self.get_object()
        student_id = request.data.get('student_id')
        
        
        student = get_object_or_404(Student, id=student_id)
        
        # Check if already exists
        if Queue.objects.filter(company=company, student=student).exists():
             return Response({'error': 'Student already in queue'}, status=400)
             
        # Create without normal validation (admin override)
        # But we still use save() logic for position
        Queue.objects.create(company=company, student=student)
        return Response({'status': 'added'})

    @action(detail=False, methods=['post'], url_path='bulk-resume')
    def bulk_resume(self, request):
        """Set all companies to 'recruiting' status"""
        updated_count = Company.objects.all().update(status='recruiting')
        return Response({
            'message': f'Updated {updated_count} companies to recruiting',
            'updated': updated_count
        })

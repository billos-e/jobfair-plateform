"""
Views for queue operations - Updated to use services
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView
from django.shortcuts import get_object_or_404
from core.permissions import IsStudent, IsCompanyToken, IsOwnerOrAdmin
from .models import Queue
from .services import QueueService
from .serializers import (
    QueueCreateSerializer,
    QueueStudentSerializer,
    QueueStartInterviewSerializer,
    QueueCompleteSerializer
)
from notifications.services import NotificationService


class StudentQueueListView(ListCreateAPIView):
    """
    List student's queue entries / Create new inscription
    """
    
    permission_classes = [IsStudent]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return QueueCreateSerializer
        return QueueStudentSerializer
    
    def get_queryset(self):
        return Queue.objects.filter(
            student=self.request.user.student
        ).select_related('company').order_by('-created_at')
    
    def perform_create(self, serializer):
        """Override to trigger notification on inscription"""
        queue_entry = serializer.save()
        # Trigger notification for new inscription
        NotificationService.on_queue_inscription(queue_entry)


class QueueStartInterviewView(APIView):
    """
    Start interview at a company (R10 validation)
    POST /api/queues/{id}/start/
    Uses QueueService for business logic
    """
    
    permission_classes = [IsStudent]
    
    def post(self, request, pk):
        queue_entry = get_object_or_404(
            Queue,
            pk=pk,
            student=request.user.student
        )
        
        # Use service for validation and action
        can_start, error = QueueService.can_start_interview(queue_entry)
        
        if not can_start:
            return Response(
                {'detail': error},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            QueueService.start_interview(queue_entry)
            
            # Trigger notifications
            NotificationService.on_interview_started(queue_entry)
            
            return Response({
                'message': f"Entretien commencé chez {queue_entry.company.name}",
                'status': queue_entry.student.status,
                'company': queue_entry.company.name
            })
        except ValueError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class QueueCompleteView(APIView):
    """
    Mark student as 'passé' (R6, R7, R12)
    POST /api/company/{token}/queues/{id}/complete/
    Uses QueueService for business logic
    """
    
    permission_classes = [IsCompanyToken]
    
    def post(self, request, token, pk):
        company = request.company
        
        queue_entry = get_object_or_404(
            Queue,
            pk=pk,
            company=company
        )
        
        try:
            result = QueueService.complete_interview(queue_entry)
            
            # Trigger notifications
            NotificationService.on_interview_completed(
                completed_student=result['completed_student'],
                company=company,
                next_students=result['next_available']
            )
            
            return Response({
                'message': f"{queue_entry.student.full_name} marqué comme passé",
                'student_id': queue_entry.student.id,
                'is_completed': True,
                'next_available_count': len(result['next_available'])
            })
        except ValueError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class StudentOpportunitiesView(APIView):
    """
    Get all opportunities for current student
    Shows which companies they can interview with now
    """
    
    permission_classes = [IsStudent]
    
    def get(self, request):
        student = request.user.student
        opportunities = QueueService.get_student_opportunities(student)
        
        result = []
        for opp in opportunities:
            entry = opp['queue_entry']
            result.append({
                'queue_id': entry.id,
                'company_id': entry.company_id,
                'company_name': entry.company.name,
                'company_status': entry.company.status,
                'position': opp['position'],
                'can_start': opp['can_start'],
                'ahead_count': opp['ahead_count'],
                'reason': opp['reason']
            })
        
        return Response({
            'student_status': student.status,
            'opportunities': result,
            'can_start_any': any(o['can_start'] for o in opportunities)
        })


class QueueDetailView(APIView):
    """
    R11, Admin: Delete queue entry
    DELETE /api/queues/{id}/
    """
    permission_classes = [IsOwnerOrAdmin]
    
    def delete(self, request, pk):
        queue_entry = get_object_or_404(Queue, pk=pk)
        self.check_object_permissions(request, queue_entry)
        
        # Trigger notification before deletion so we have the data
        NotificationService.on_queue_cancel(queue_entry)
        
        QueueService.cancel_inscription(queue_entry)
        
        return Response(status=status.HTTP_204_NO_CONTENT)

"""
Core views
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from core.permissions import IsAdmin
from students.models import Student
from companies.models import Company
from queues.models import Queue

class AdminDashboardView(APIView):
    """
    Global statistics for Admin Dashboard
    """
    permission_classes = [IsAdmin]
    
    def get(self, request):
        total_students = Student.objects.count()
        total_companies = Company.objects.count()
        
        # Queue stats
        total_interviews = Queue.objects.filter(is_completed=True).count()
        current_interviews = Student.objects.filter(status='in_interview').count()
        waiting_count = Queue.objects.filter(is_completed=False).count() - current_interviews
        if waiting_count < 0: waiting_count = 0
        
        # Idle detection
        # Companies recruiting but with NO active interview
        idle_companies = Company.objects.filter(
            status='recruiting'
        ).exclude(
            queue_entries__student__status='in_interview'
        ).values('id', 'name', 'status')
        
        # Idle Students: No active queue entries (not waiting, not in interview)
        # Assuming they are not 'in_interview' and have no IS_COMPLETED=False queue entries
        idle_students = Student.objects.exclude(
            queue_entries__is_completed=False
        ).values('id', 'first_name', 'last_name', 'status')

        return Response({
            'total_students': total_students,
            'total_companies': total_companies,
            'total_interviews': total_interviews,
            'current_interviews': current_interviews,
            'waiting_count': waiting_count,
            'idle_companies': idle_companies,
            'idle_students': idle_students
        })

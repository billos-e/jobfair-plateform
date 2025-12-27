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
        
        return Response({
            'total_students': total_students,
            'total_companies': total_companies,
            'total_interviews': total_interviews,
            'current_interviews': current_interviews,
            'waiting_count': waiting_count
        })

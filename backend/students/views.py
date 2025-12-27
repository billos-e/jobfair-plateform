"""
Views for student operations - Updated with notifications
"""
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from core.permissions import IsStudent, IsAdmin
from .models import Student
from .serializers import StudentSerializer, StudentStatusSerializer, StudentAdminSerializer
from notifications.services import NotificationService


class StudentMeView(APIView):
    """Get/update current student profile"""
    
    permission_classes = [IsStudent]
    
    def get(self, request):
        student = request.user.student
        serializer = StudentSerializer(student)
        return Response(serializer.data)
    
    def patch(self, request):
        student = request.user.student
        serializer = StudentSerializer(student, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentStatusView(APIView):
    """Change student status (R5: only available/paused allowed)"""
    
    permission_classes = [IsStudent]
    
    def patch(self, request):
        student = request.user.student
        old_status = student.status
        
        serializer = StudentStatusSerializer(
            student,
            data=request.data,
            context={'student': student}
        )
        if serializer.is_valid():
            serializer.save()
            new_status = student.status
            
            # Trigger notification if status actually changed
            if old_status != new_status:
                NotificationService.on_student_status_change(
                    student, old_status, new_status
                )
            
            return Response({
                'message': f"Status changed to '{student.status}'",
                'status': student.status
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentAdminViewSet(viewsets.ModelViewSet):
    """Admin CRUD for students"""
    
    permission_classes = [IsAdmin]
    queryset = Student.objects.all().order_by('last_name', 'first_name')
    serializer_class = StudentAdminSerializer

    def perform_destroy(self, instance):
        """Delete associated user account when deleting student profile"""
        user = instance.user
        user.delete()


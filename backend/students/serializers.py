"""
Serializers for Student model
"""
from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    """Serializer for student data with current company info"""
    
    email = serializers.EmailField(source='user.email', read_only=True)
    current_company_name = serializers.CharField(
        source='current_company.name',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = Student
        fields = [
            'id', 'first_name', 'last_name', 'email',
            'status', 'current_company', 'current_company_name'
        ]
        read_only_fields = ['id', 'email', 'status', 'current_company', 'current_company_name']


class StudentStatusSerializer(serializers.Serializer):
    """Serializer for changing student status"""
    
    status = serializers.ChoiceField(
        choices=[('available', 'Available'), ('paused', 'Paused')],
        required=True
    )
    
    def validate_status(self, value):
        """
        R5: Only student can change from paused to available
        Cannot directly set to in_interview (that's done via queue/start)
        """
        student = self.context.get('student')
        if not student:
            return value
        
        # Cannot change status if in interview
        if student.status == 'in_interview':
            raise serializers.ValidationError(
                "You cannot change status while in an interview. "
                "Wait for the company to mark you as 'passé'."
            )
        
        return value
    
    def update(self, instance, validated_data):
        new_status = validated_data['status']
        
        if new_status == 'available':
            instance.set_available()
        elif new_status == 'paused':
            instance.status = 'paused'
            instance.current_company = None
            instance.save()
        
        return instance


class StudentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for student lists"""
    
    class Meta:
        model = Student
        fields = ['id', 'first_name', 'last_name', 'status']
        read_only_fields = fields


class StudentAdminSerializer(serializers.ModelSerializer):
    """Admin serializer allowing status updates"""
    
    email = serializers.EmailField(source='user.email', read_only=True)
    current_company_name = serializers.CharField(
        source='current_company.name',
        read_only=True,
        allow_null=True
    )
    
    queue_entries = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = [
            'id', 'first_name', 'last_name', 'email',
            'status', 'current_company', 'current_company_name',
            'queue_entries'
        ]
        read_only_fields = ['id', 'email', 'current_company', 'current_company_name', 'queue_entries']

    def get_queue_entries(self, obj):
        """Return structured queue history"""
        entries = obj.queue_entries.select_related('company').order_by('is_completed', 'created_at')
        return [{
            'id': e.id,
            'company_id': e.company.id,
            'company_name': e.company.name,
            'status': 'completed' if e.is_completed else ('in_interview' if e.company == obj.current_company else 'waiting'),
            'position': e.position,
            'created_at': e.created_at
        } for e in entries]


"""
Serializers for Queue model
"""
from rest_framework import serializers
from .models import Queue
from students.serializers import StudentListSerializer
from companies.serializers import CompanyPublicSerializer


class QueueCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating queue entries (inscription)"""
    
    class Meta:
        model = Queue
        fields = ['id', 'company', 'position', 'created_at']
        read_only_fields = ['id', 'position', 'created_at']
    
    def validate_company(self, value):
        """Validate that company is recruiting (R17)"""
        if value.status != 'recruiting':
            raise serializers.ValidationError(
                "Cette entreprise est actuellement en pause. "
                "Vous ne pouvez pas vous inscrire."
            )
        return value
    
    def validate(self, attrs):
        """Check unique constraint: one inscription per student per company"""
        student = self.context['request'].user.student
        company = attrs['company']
        
        # Check for existing inscriptions
        existing_q = Queue.objects.filter(company=company, student=student).first()
        
        if existing_q:
            if existing_q.is_completed:
                raise serializers.ValidationError({
                    'company': "Vous avez déjà passé un entretien avec cette entreprise."
                })
            else:
                raise serializers.ValidationError({
                    'company': "Vous êtes déjà inscrit chez cette entreprise."
                })
        
        return attrs
    
    def create(self, validated_data):
        student = self.context['request'].user.student
        validated_data['student'] = student
        # Position is auto-calculated in model.save()
        return super().create(validated_data)


class QueueStudentSerializer(serializers.ModelSerializer):
    """
    Serializer for student viewing their own queue entries
    Shows position, company info, is_completed status
    """
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_status = serializers.CharField(source='company.status', read_only=True)
    students_ahead = serializers.SerializerMethodField()
    can_start = serializers.SerializerMethodField()
    
    class Meta:
        model = Queue
        fields = [
            'id', 'company', 'company_name', 'company_status',
            'position', 'is_completed', 'students_ahead', 'can_start',
            'created_at', 'completed_at'
        ]
        read_only_fields = fields
    
    def get_students_ahead(self, obj):
        """Number of non-completed students ahead (R15)"""
        if obj.is_completed:
            return 0
        return Queue.get_students_ahead_count(obj)
    
    def get_can_start(self, obj):
        """Check if student can start interview at this company"""
        if obj.is_completed:
            return False
        
        student = obj.student
        company = obj.company
        
        # R10: Check all conditions
        if student.status != 'available':
            return False
        if company.status != 'recruiting':
            return False
        if not company.has_available_slots():
            return False
        
        # Check if first available
        first_available = Queue.get_next_available(company, 1).first()
        return first_available and first_available.id == obj.id


class QueueCompanySerializer(serializers.ModelSerializer):
    """
    Serializer for company viewing their queue
    Shows student info with status indication for grisage
    """
    student_id = serializers.IntegerField(source='student.id', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_status = serializers.CharField(source='student.status', read_only=True)
    current_company_name = serializers.SerializerMethodField()
    is_greyed = serializers.SerializerMethodField()
    interview_duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Queue
        fields = [
            'id', 'position', 'student_id', 'student_name',
            'student_status', 'current_company_name', 'is_greyed',
            'is_completed', 'created_at', 'completed_at', 'interview_duration'
        ]
        read_only_fields = fields
    
    def get_current_company_name(self, obj):
        if obj.student.current_company:
            return obj.student.current_company.name
        return None
    
    def get_is_greyed(self, obj):
        """R2: Student is greyed if not available"""
        return obj.student.status != 'available'
    
    def get_interview_duration(self, obj):
        """Duration for students currently in interview at this company"""
        if obj.student.current_company_id == obj.company_id and not obj.is_completed:
            from django.utils import timezone
            # Assuming they started when they set current_company
            # In real implementation, we'd track interview start time
            return None  # TODO: Add interview_started_at field
        return None


class QueueStartInterviewSerializer(serializers.Serializer):
    """Serializer for starting an interview (R10 validation)"""
    
    def validate(self, attrs):
        queue_entry = self.instance
        student = queue_entry.student
        company = queue_entry.company
        
        # R10: Complete validation
        if queue_entry.is_completed:
            raise serializers.ValidationError(
                "Vous êtes déjà passé chez cette entreprise."
            )
        
        if student.status != 'available':
            raise serializers.ValidationError(
                "Vous devez être disponible pour commencer un entretien."
            )
        
        if company.status != 'recruiting':
            raise serializers.ValidationError(
                "Cette entreprise est actuellement en pause."
            )
        
        if not company.has_available_slots():
            raise serializers.ValidationError(
                "Cette entreprise ne peut pas recevoir plus d'étudiants pour le moment."
            )
        
        # Check if first available in queue
        first_available = Queue.get_next_available(company, 1).first()
        if not first_available or first_available.id != queue_entry.id:
            raise serializers.ValidationError(
                "Ce n'est pas encore votre tour. "
                "Attendez que les personnes avant vous aient terminé."
            )
        
        return attrs
    
    def update(self, instance, validated_data):
        """Start the interview"""
        instance.student.start_interview(instance.company)
        return instance


class QueueCompleteSerializer(serializers.Serializer):
    """Serializer for marking student as 'passé' (R6, R7, R12)"""
    
    def validate(self, attrs):
        queue_entry = self.instance
        
        if queue_entry.is_completed:
            raise serializers.ValidationError(
                "Cet étudiant a déjà été marqué comme passé."
            )
        
        # Check student is actually in interview at this company
        if queue_entry.student.current_company_id != queue_entry.company_id:
            raise serializers.ValidationError(
                "Cet étudiant n'est pas en entretien chez vous."
            )
        
        return attrs
    
    def update(self, instance, validated_data):
        """Mark as completed (triggers R7: auto-pause)"""
        instance.mark_completed()
        return instance

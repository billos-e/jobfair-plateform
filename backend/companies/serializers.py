"""
Serializers for Company model
"""
from rest_framework import serializers
from .models import Company


class CompanyPublicSerializer(serializers.ModelSerializer):
    """
    Public serializer for students viewing available companies
    R17: Only shows companies in 'recruiting' status
    """
    available_slots = serializers.SerializerMethodField()
    queue_length = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = ['id', 'name', 'status', 'max_concurrent_interviews', 'available_slots', 'queue_length']
        read_only_fields = fields
    
    def get_available_slots(self, obj):
        return obj.get_available_slots()
    
    def get_queue_length(self, obj):
        return obj.queue_entries.filter(is_completed=False).count()


class CompanyDashboardSerializer(serializers.ModelSerializer):
    """
    Serializer for company dashboard (accessed via token)
    Includes full queue information
    """
    current_interview_count = serializers.SerializerMethodField()
    available_slots = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'status', 'max_concurrent_interviews',
            'current_interview_count', 'available_slots', 'created_at'
        ]
        read_only_fields = ['id', 'name', 'max_concurrent_interviews', 'created_at']
    
    def get_current_interview_count(self, obj):
        return obj.get_current_interview_count()
    
    def get_available_slots(self, obj):
        return obj.get_available_slots()


class CompanyStatusSerializer(serializers.Serializer):
    """Serializer for changing company status (pause/resume)"""
    
    status = serializers.ChoiceField(
        choices=[('recruiting', 'Recruiting'), ('paused', 'Paused')],
        required=True
    )
    
    def update(self, instance, validated_data):
        instance.status = validated_data['status']
        instance.save()
        return instance


class CompanyAdminSerializer(serializers.ModelSerializer):
    """Admin serializer with full control including token"""
    
    access_url = serializers.SerializerMethodField()
    current_interview_count = serializers.SerializerMethodField()
    queue_length = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'access_token', 'access_url', 'status',
            'max_concurrent_interviews', 'current_interview_count',
            'queue_length', 'created_at'
        ]
        read_only_fields = ['id', 'access_token', 'access_url', 'created_at',
                           'current_interview_count', 'queue_length']
    
    def get_access_url(self, obj):
        # TODO: Get from settings or request
        return f"/company/{obj.access_token}"
    
    def get_current_interview_count(self, obj):
        return obj.get_current_interview_count()
    
    def get_queue_length(self, obj):
        return obj.queue_entries.filter(is_completed=False).count()


class CompanyCreateSerializer(serializers.ModelSerializer):
    """Serializer for admin creating new companies"""
    
    class Meta:
        model = Company
        fields = ['id', 'name', 'max_concurrent_interviews', 'access_token']
        read_only_fields = ['id', 'access_token']

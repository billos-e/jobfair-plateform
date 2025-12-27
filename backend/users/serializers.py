"""
Serializers for user registration and authentication
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from users.models import User
from students.models import Student


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for student registration"""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    first_name = serializers.CharField(required=True, max_length=100)
    last_name = serializers.CharField(required=True, max_length=100)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match'})
        return attrs
    
    def create(self, validated_data):
        # Extract student profile fields
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        validated_data.pop('password_confirm')
        
        # Create user with student role
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role='student'
        )
        
        # Create student profile
        Student.objects.create(
            user=user,
            first_name=first_name,
            last_name=last_name
        )
        
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data (read-only)"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'created_at']
        read_only_fields = fields

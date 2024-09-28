from django.contrib.auth import get_user_model
from rest_framework import serializers
from TODO.models import DefaultTask, Task, TaskList

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirmpassword = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'}, label="Confirm password")
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirmpassword']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirmpassword']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirmpassword')  # Remove confirmpassword before creating the user
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])  # Use set_password to hash the password
        user.save()
        return user

class TaskListSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskList
        fields = ['id', 'taskname', 'pin','cdate']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
    
class DefaultTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = DefaultTask
        fields = ['id', 'description', 'due_date', 'pin', 'complete']
from django.contrib.auth.models import User
from rest_framework import serializers
from TODO.models import DefaultTask, Task, TaskList

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirmpassword = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'}, label="Confirm password")
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirmpassword']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirmpassword']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        # Checking username is existing or not
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "This username is already existing."})

        # Checking email is existing or not
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "This Email is already existing."})

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirmpassword')
        
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])
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
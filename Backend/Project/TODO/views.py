from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.views import APIView
from TODO.models import DefaultTask, TaskList, Task
from .serializers import UserRegistrationSerializer, TaskListSerializer, TaskSerializer, DefaultTaskSerializer
from django.contrib.auth.models import User

class RegisterUserView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny] 

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User registered successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user is not None:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username
        })

# DefaultTask views
class DefaultTaskCreateView(generics.CreateAPIView):
    queryset = DefaultTask.objects.all()
    serializer_class = DefaultTaskSerializer

    def perform_create(self, serializer):
        serializer.save(userid=self.request.user)

class DefaultTaskListView(generics.ListAPIView):
    serializer_class = DefaultTaskSerializer

    def get_queryset(self):
        return DefaultTask.objects.filter(userid=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():  # Check if queryset is empty
            return Response({"message": "No data"}, status=status.HTTP_204_NO_CONTENT)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class DefaultTaskUpdateView(generics.UpdateAPIView):
    queryset = DefaultTask.objects.all()
    serializer_class = DefaultTaskSerializer

    def get_queryset(self):
        return DefaultTask.objects.filter(userid=self.request.user)

class DefaultTaskDeleteView(generics.DestroyAPIView):
    queryset = DefaultTask.objects.all()
    serializer_class = DefaultTaskSerializer

    def get_queryset(self):
        return DefaultTask.objects.filter(userid=self.request.user)

# TaskList views
class TaskListCreateView(generics.CreateAPIView):
    queryset = TaskList.objects.all()
    serializer_class = TaskListSerializer

    def perform_create(self, serializer):
        serializer.save(userid=self.request.user)

class TaskListListView(generics.ListAPIView):
    serializer_class = TaskListSerializer

    def get_queryset(self):
        return TaskList.objects.filter(userid=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():  # Check if queryset is empty
            return Response({"message": "No data"}, status=status.HTTP_204_NO_CONTENT)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class TaskListUpdateView(generics.UpdateAPIView):
    queryset = TaskList.objects.all()
    serializer_class = TaskListSerializer

    def get_queryset(self):
        return TaskList.objects.filter(userid=self.request.user)

class TaskListDeleteView(generics.DestroyAPIView):
    queryset = TaskList.objects.all()
    serializer_class = TaskListSerializer

    def get_queryset(self):
        return TaskList.objects.filter(userid=self.request.user)

# Task views
class TaskCreateView(generics.CreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class TaskListView(generics.ListAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        task_list_id = self.kwargs.get('pk')  # Get the pk from the URL
        if task_list_id is None:  # Check if pk is undefined
            return Response({"message": "No data"}, status=status.HTTP_204_NO_CONTENT)
        return Task.objects.filter(task_list__id=task_list_id)  # Filter tasks by task_list id

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():  # Check if there are any tasks
            return Response({"message": "No data"}, status=status.HTTP_204_NO_CONTENT)  
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TaskUpdateView(generics.UpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class TaskDeleteView(generics.DestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

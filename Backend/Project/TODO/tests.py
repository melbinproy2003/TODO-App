from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from TODO.models import DefaultTask, TaskList, Task
from .serializers import UserRegistrationSerializer, TaskListSerializer, TaskSerializer, DefaultTaskSerializer

class UserTests(APITestCase):

    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'password': 'testpassword',
            'email': 'test@example.com'
        }
        self.user = User.objects.create_user(**self.user_data)
        self.token = Token.objects.create(user=self.user)

    def test_register_user(self):
        url = reverse('register') 
        response = self.client.post(url, {
            'username': 'newuser',
            'password': 'newpassword',
            'email': 'new@example.com'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)

    def test_login_user(self):
        url = reverse('login') 
        response = self.client.post(url, {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_user_profile(self):
        url = reverse('profile') 
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user_data['username'])

class DefaultTaskTests(APITestCase):

    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'password': 'testpassword'
        }
        self.user = User.objects.create_user(**self.user_data)
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        self.default_task_data = {
            'description': 'Test Task',
            'due_date': '08/19/2025'
        }
        self.default_task = DefaultTask.objects.create(userid=self.user, **self.default_task_data)

    def test_create_default_task(self):
        url = reverse('DefaultTask/add/') 
        response = self.client.post(url, self.default_task_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_default_tasks(self):
        url = reverse('DefaultTask/')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

    def test_update_default_task(self):
        url = reverse('DefaultTask/<int:pk>/update/', args=[self.default_task.id]) 
        response = self.client.patch(url, {'description': 'Updated Task description'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.default_task.refresh_from_db()
        self.assertEqual(self.default_task.description, 'Updated Task description')

    def test_delete_default_task(self):
        url = reverse('DefaultTask/<int:pk>/delete/', args=[self.default_task.id]) 
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(DefaultTask.objects.filter(id=self.default_task.id).exists())

class TaskListTests(APITestCase):

    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'password': 'testpassword'
        }
        self.user = User.objects.create_user(**self.user_data)
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        self.task_list_data = {
            'taskname': 'Test Task List'
        }
        self.task_list = TaskList.objects.create(userid=self.user, **self.task_list_data)

    def test_create_task_list(self):
        url = reverse('TaskList/add/') 
        response = self.client.post(url, self.task_list_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_task_lists(self):
        url = reverse('TaskList/')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

    def test_update_task_list(self):
        url = reverse('TaskList/<int:pk>/update/', args=[self.task_list.id]) 
        response = self.client.patch(url, {'taskname': 'Updated Task List taskname'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task_list.refresh_from_db()
        self.assertEqual(self.task_list.taskname, 'Updated Task List taskname')

    def test_delete_task_list(self):
        url = reverse('TaskList/<int:pk>/delete/', args=[self.task_list.id]) 
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(TaskList.objects.filter(id=self.task_list.id).exists())

class TaskTests(APITestCase):

    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'password': 'testpassword'
        }
        self.user = User.objects.create_user(**self.user_data)
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        self.task_list = TaskList.objects.create(userid=self.user, title='Test Task List')
        self.task_data = {
            'description': 'Test Task',
            'task_list': self.task_list.id
        }
        self.task = Task.objects.create(userid=self.user, **self.task_data)

    def test_create_task(self):
        url = reverse('Task/<int:pk>/add/') 
        response = self.client.post(url, self.task_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_tasks(self):
        url = reverse('Task/<int:pk>/', args=[self.task_list.id]) 
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

    def test_update_task(self):
        url = reverse('Task/<int:pk>/update/', args=[self.task.id]) 
        response = self.client.patch(url, {'description': 'Updated Task description'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.description, 'Updated Task description')

    def test_delete_task(self):
        url = reverse('Task/<int:pk>/delete/', args=[self.task.id]) 
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=self.task.id).exists())

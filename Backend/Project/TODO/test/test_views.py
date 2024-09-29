from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from TODO.models import DefaultTask, TaskList, Task

class TestViews(TestCase):

    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.user = User.objects.create_user(username='testuser', password='testpass')

        # Authenticate the test client
        self.client.force_authenticate(user=self.user)

        # URLs for testing
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.profile_url = reverse('profile')
        self.default_task_list_url = reverse('DefaultTaskList')
        self.default_task_create_url = reverse('DefaultTaskCreate')

        # Create a TaskList and DefaultTask for testing
        self.tasklist = TaskList.objects.create(taskname='Test TaskList', userid=self.user)
        self.default_task = DefaultTask.objects.create(
            description='Test Default Task',
            userid=self.user,
            due_date='2024-09-30T12:00:00Z',  # Add the due_date here
            complete=False
        )
    
    def test_RegisterUserView_POST(self):
        """ Test user registration via POST """
        data = {
            'username': 'newuser',
            'password': 'newpass123',
            'email': 'newuser@example.com'
        }
        # Ensure that you are sending the request with the correct format
        response = self.client.post(self.register_url, data, format='json')

        # Check the response status code
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'User registered successfully.')



    def test_LoginUserView_POST(self):
        """ Test user login via POST """
        data = {
            'username': 'testuser',
            'password': 'testpass'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_UserProfileView_GET(self):
        """ Test user profile retrieval via GET """
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)

    def test_DefaultTaskListView_GET(self):
        """ Test DefaultTask list retrieval via GET """
        response = self.client.get(self.default_task_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)  # Ensure at least one task is present

    def test_DefaultTaskCreateView_POST(self):
        """ Test DefaultTask creation via POST """
        data = {
            'description': 'New Default Task',
            'due_date': '2024-09-30T12:00:00Z',
            'complete': False
        }
        response = self.client.post(self.default_task_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['description'], 'New Default Task')

    def test_TaskListCreateView_POST(self):
        """ Test TaskList creation via POST """
        url = reverse('TaskListCreate')
        data = {
            'taskname': 'New Task List',    
            'pin': False
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['taskname'], 'New Task List')

    def test_TaskListView_GET(self):
        """ Test retrieving TaskList tasks via GET """
        task = Task.objects.create(description='Test Task', task_list=self.tasklist)
        url = reverse('TaskList', args=[self.tasklist.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)  # Ensure at least one task is present


    def test_TaskCreateView_POST(self):
        """ Test Task creation via POST """
        url = reverse('TaskCreate', args=[self.tasklist.id])
        task_list = TaskList.objects.create(name="Default Task List") 
        data = {
            'description': 'New Task',
            'due_date': '2024-09-30',
            'task_list_id': task_list.id,
            'complete': False
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['description'], 'New Task')


    def test_TaskUpdateView_PUT(self):
        """ Test updating a Task via PUT """
        task = Task.objects.create(description='Old Task', task_list=self.tasklist)
        url = reverse('TaskUpdate', args=[task.id])
        data = {
            'description': 'Updated Task',
            'due_date': '2024-10-01',
            'complete': True
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['description'], 'Updated Task')


    def test_TaskDeleteView_DELETE(self):
        """ Test deleting a Task via DELETE """
        task = Task.objects.create(description='Task to Delete', task_list=self.tasklist, due_date='2024-09-30')
        url = reverse('TaskDelete', args=[task.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_DefaultTaskUpdateView_PUT(self):
        """ Test updating a DefaultTask via PUT """
        url = reverse('DefaultTaskUpdate', args=[self.default_task.id])
        data = {
            'description': 'Updated Default Task',
            'due_date': '2024-10-01T12:00:00Z',
            'complete': True
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['description'], 'Updated Default Task')

    def test_DefaultTaskDeleteView_DELETE(self):
        """ Test deleting a DefaultTask via DELETE """
        url = reverse('DefaultTaskDelete', args=[self.default_task.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

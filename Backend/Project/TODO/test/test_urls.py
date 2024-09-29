
from django.test import SimpleTestCase
from django.urls import resolve, reverse
from TODO.views import RegisterUserView, LoginUserView, UserProfileView, DefaultTaskListView, DefaultTaskCreateView, DefaultTaskUpdateView, DefaultTaskDeleteView, TaskListListView, TaskListCreateView, TaskListUpdateView, TaskListDeleteView, TaskListView, TaskCreateView, TaskUpdateView, TaskDeleteView

class TestUrls(SimpleTestCase):

    def test_register_url_resolves(self):
        url = reverse('register')
        self.assertEqual(resolve(url).func.view_class, RegisterUserView)
    
    def test_login_url_resolves(self):
        url = reverse('login')
        self.assertEqual(resolve(url).func.view_class, LoginUserView)

    def test_profile_url_resolves(self):
        url = reverse('profile')
        self.assertEqual(resolve(url).func.view_class, UserProfileView)

    def test_DefaultTask_url_resolves(self):
        url = reverse('DefaultTaskList')
        self.assertEqual(resolve(url).func.view_class, DefaultTaskListView)

    def test_DefaultTaskCreate_url_resolves(self):
        url = reverse('DefaultTaskCreate')
        self.assertEqual(resolve(url).func.view_class, DefaultTaskCreateView)
    
    def test_DefaultTaskUpdate_url_resolves(self):
        url = reverse('DefaultTaskUpdate', args=([1]))
        self.assertEqual(resolve(url).func.view_class, DefaultTaskUpdateView)

    def test_DefaultTaskDelete_url_resolves(self):
        url = reverse('DefaultTaskDelete', args=([1]))
        self.assertEqual(resolve(url).func.view_class, DefaultTaskDeleteView)

    def test_TaskListList_url_resolves(self):
        url = reverse('TaskListList')
        self.assertEqual(resolve(url).func.view_class, TaskListListView)
    
    def test_TaskListCreate_url_resolves(self):
        url = reverse('TaskListCreate')
        self.assertEqual(resolve(url).func.view_class, TaskListCreateView)
    
    def test_TaskListUpdate_url_resolves(self):
        url = reverse('TaskListUpdate', args=([1]))
        self.assertEqual(resolve(url).func.view_class, TaskListUpdateView)

    def test_TaskListDelete_url_resolves(self):
        url = reverse('TaskListDelete', args=([1]))
        self.assertEqual(resolve(url).func.view_class, TaskListDeleteView)
    
    def test_TaskList_url_resolves(self):
        url = reverse('TaskList', args=([1]))
        self.assertEqual(resolve(url).func.view_class, TaskListView)
    
    def test_TaskCreate_url_resolves(self):
        url = reverse('TaskCreate', args=([1]))
        self.assertEqual(resolve(url).func.view_class, TaskCreateView)

    def test_TaskUpdate_url_resolves(self):
        url = reverse('TaskUpdate', args=([1]))
        self.assertEqual(resolve(url).func.view_class, TaskUpdateView)

    def test_TaskDelete_url_resolves(self):
        url = reverse('TaskDelete', args=([1]))
        self.assertEqual(resolve(url).func.view_class, TaskDeleteView)
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterUserView.as_view(), name='register'),
    path('login/', views.LoginUserView.as_view(), name='login'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('DefaultTask/', views.DefaultTaskListView.as_view(), name='DefaultTaskList'),
    path('DefaultTask/add/', views.DefaultTaskCreateView.as_view(), name='DefaultTaskCreate'),
    path('DefaultTask/<int:pk>/update/', views.DefaultTaskUpdateView.as_view(), name='DefaultTaskUpdate'),
    path('DefaultTask/<int:pk>/delete/', views.DefaultTaskDeleteView.as_view(), name='DefaultTaskDelete'),
    path('TaskList/', views.TaskListListView.as_view(), name='TaskListList'),
    path('TaskList/add/', views.TaskListCreateView.as_view(), name='TaskListCreate'),
    path('TaskList/<int:pk>/update/', views.TaskListUpdateView.as_view(), name='TaskListUpdate'),
    path('TaskList/<int:pk>/delete/', views.TaskListDeleteView.as_view(), name='TaskListDelete'),
    path('Task/<int:pk>/', views.TaskListView.as_view(), name='TaskList'),
    path('Task/<int:pk>/add/', views.TaskCreateView.as_view(), name='TaskCreate'),
    path('Task/<int:pk>/update/', views.TaskUpdateView.as_view(), name='TaskUpdate'),
    path('Task/<int:pk>/delete/', views.TaskDeleteView.as_view(), name='TaskDelete'),
]

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class TaskList(models.Model):
    taskname = models.CharField(max_length=50)
    pin = models.BooleanField(default=False)
    userid = models.ForeignKey(User, on_delete=models.CASCADE)
    cdate = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.taskname
    

class Task(models.Model):
    description = models.TextField()
    due_date = models.DateTimeField(blank=True)
    task_list = models.ForeignKey(TaskList, on_delete=models.CASCADE, blank=True, related_name='tasks')
    cdate = models.DateField(default=timezone.now)
    complete = models.BooleanField(default=False)

    def __str__(self):
        return self.description

class DefaultTask(models.Model):
    description = models.TextField()
    due_date = models.DateTimeField(blank=True)
    pin = models.BooleanField(default=False)
    complete = models.BooleanField(default=False)
    userid = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.description
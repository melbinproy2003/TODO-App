from django.contrib import admin
from .models import TaskList, Task, DefaultTask

@admin.register(TaskList)
class TaskListAdmin(admin.ModelAdmin):
    list_display = ('taskname', 'pin', 'userid', 'cdate')
    search_fields = ('taskname', 'description')
    list_filter = ('pin', 'cdate', 'userid')
    ordering = ('taskname',)

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('description', 'due_date', 'task_list','cdate', 'complete')
    search_fields = ('description',)
    list_filter = ('complete', 'task_list')
    ordering = ('due_date',)

@admin.register(DefaultTask)
class DefaultTaskAdmin(admin.ModelAdmin):
    list_display = ('description', 'due_date', 'pin', 'complete', 'userid')
    search_fields = ('description',)
    list_filter = ('pin', 'complete', 'userid')
    ordering = ('due_date',)

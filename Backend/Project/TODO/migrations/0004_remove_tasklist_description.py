# Generated by Django 5.0.6 on 2024-09-27 21:50

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('TODO', '0003_task_cdate'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tasklist',
            name='description',
        ),
    ]

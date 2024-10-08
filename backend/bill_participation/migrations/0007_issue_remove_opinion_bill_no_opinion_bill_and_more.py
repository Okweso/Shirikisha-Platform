# Generated by Django 5.1.1 on 2024-10-03 09:30

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bill_participation', '0006_opinion_user_id_alter_opinion_whether_have_read_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Issue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(blank=True, max_length=255, null=True)),
                ('summary', models.TextField(blank=True, null=True)),
                ('link', models.URLField(max_length=255)),
                ('category', models.CharField(blank=True, max_length=255, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.RemoveField(
            model_name='opinion',
            name='bill_no',
        ),
        migrations.AddField(
            model_name='opinion',
            name='bill',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='bill_participation.issue'),
        ),
        migrations.DeleteModel(
            name='Bill',
        ),
    ]

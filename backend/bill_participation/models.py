from django.db import models

# Create your models here.

# class Bill(models.Model):
#     #bill_no = models.CharField(max_length=255, primary_key=True)
#     bill_title = models.CharField(max_length=255, blank=True)
#     bill_summary = models.TextField(null=True, blank=True)
#     bill_link = models.URLField(max_length=255)
#     category = models.CharField(max_length=255, null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

class Issue(models.Model):
    title = models.CharField(max_length=255, null=True, blank=True)
    summary = models.TextField(null=True, blank=True)
    link = models.URLField(max_length=255)
    category = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Opinion(models.Model):
    weather_read_choices = [
        ('yes', 'Yes'),
        ('no', 'No'),
        ('explained to by someone', 'Explained to by someone',)
    ]
    weather_support_choices = [
        ('yes', 'Yes'),
        ('no', 'No'),
        ('need amendment', 'Need Amendment'),
    ]
    whether_have_read = models.CharField(max_length=255, choices=weather_read_choices)
    whether_support = models.CharField(max_length=255, choices=weather_support_choices, null=True, blank=True)
    user_opinion = models.TextField(null=True, blank=True)
    issue_id = models.ForeignKey(Issue, on_delete=models.CASCADE, null=True, blank=True)
    user_id = models.CharField(max_length=255, blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)
    hashed_ip = models.CharField(max_length=255, null=True, blank=True)
    

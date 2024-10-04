from rest_framework import serializers
from django.utils import timezone
from bill_participation.models import Issue, Opinion

class IssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = '__all__'

class OpinionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opinion
        fields = '__all__'
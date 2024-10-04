"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from bill_participation.views import IssueViewSet, OpinionViewSet, Session_ID, issue_statistics, select_opinions
from rest_framework.routers import DefaultRouter
from bill_participation import views

bill_list = IssueViewSet.as_view({
    'get':'list',
    'post':'create'
})

bill_detail = IssueViewSet.as_view({
    'get':'retrieve',
    'put':'update',
    'patch':'partial_update',
    'delete':'destroy'
})

opinion_list = OpinionViewSet.as_view({
    'get':'list',
    'post':'create'
})
opinion_detail = OpinionViewSet.as_view({
    'get':'retrieve',
    'put':'update',
    'patch':'partial_update',
    'delete':'destroy'
})

router = DefaultRouter()
router.register(r'issues', views.IssueViewSet, basename='issues')
router.register(r'opinions', views.OpinionViewSet, basename='opinions')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(router.urls)),
    path('session_id', Session_ID, name='session_id'),
    path('issues/<int:id>/statistics/', views.issue_statistics, name='issue_statistics'),
    path('issues/<int:id>/opinions/', views.select_opinions, name='user_opinions')
]


from django.contrib import admin
from django.urls import path, include
from bill_participation.views import IssueViewSet, OpinionViewSet, Session_ID, issue_statistics, select_opinions, issue_analysis, lda_topic_modeling
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
    path('issues/<int:id>/opinions/', views.select_opinions, name='user_opinions'),
    path('issues/<int:issue_id>/opinions/sentiments-analysis/', views.issue_analysis, name='issue_analysis'),
    path('issues/opinions/topics/', views.lda_topic_modeling, name='topics')
 ]

from django.shortcuts import render
from django.http import HttpResponse
from bill_participation.serializers import IssueSerializer, OpinionSerializer
from bill_participation.models import Issue, Opinion
from rest_framework import viewsets
import uuid
from django.http import JsonResponse

# Create your views here.

class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer

class OpinionViewSet(viewsets.ModelViewSet):
    queryset = Opinion.objects.all()
    serializer_class = OpinionSerializer

def Session_ID(request):
    
    #if request.method == 'GET':
    #if not request.session.get('uid'):
    request.session['uid'] = str(uuid.uuid4())
    return JsonResponse({'uid': request.session['uid']})
    #return JsonResponse({'error': 'Invalid request method'}, status=405)


def issue_statistics(request, id):
    opinions = Opinion.objects.filter(issue_id__id=id)
    total_participants = opinions.count()
    
    support_count = opinions.filter(whether_support='yes').count()
    oppose_count = opinions.filter(whether_support='no').count()
    amendment_count = opinions.filter(whether_support='need amendment').count()

    if total_participants > 0:
        support_percentage = (support_count / total_participants) * 100
        oppose_percentage = (oppose_count / total_participants) * 100
        amendment_percentage = (amendment_count / total_participants) * 100
    else:
        support_percentage = oppose_percentage = amendment_percentage = 0

    data = {
        'total_participants': total_participants,
        'support_percentage': support_percentage,
        'oppose_percentage': oppose_percentage,
        'amendment_percentage': amendment_percentage
    }
    return JsonResponse(data)


def select_opinions(request, id):
    opinions = Opinion.objects.filter(issue_id__id=id)
    # Serialize the queryset into a list of dictionaries
    opinions_list = list(opinions.values('user_id', 'user_opinion', 'date', 'whether_have_read', 'whether_support'))
    
    # Return the JSON response with the serialized data
    return JsonResponse({'issue_id': id, 'opinions': opinions_list})
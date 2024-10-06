from django.shortcuts import render
from django.http import HttpResponse
from bill_participation.serializers import IssueSerializer, OpinionSerializer
from bill_participation.models import Issue, Opinion
from rest_framework import viewsets
import uuid
from django.http import JsonResponse
import hashlib
from django.shortcuts import get_object_or_404  


# Create your views here.

class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer

class OpinionViewSet(viewsets.ModelViewSet):  
    queryset = Opinion.objects.all()  
    serializer_class = OpinionSerializer  

    # Function to fetch the IP address of the user's device  
    def get_client_ip(self, request):  
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')  
        if x_forwarded_for:  
            ip = x_forwarded_for.split(',')[0]  # Take the first IP in the list  
        else:  
            ip = request.META.get('REMOTE_ADDR')  
        print(ip)  
        return ip  

    # Function to hash the IP address using SHA-256  
    def hash_ip(self, ip_address):  
        hashed_ip = hashlib.sha256(ip_address.encode('utf-8')).hexdigest()  
        return hashed_ip  

    # Check if the IP has submitted an opinion for a specific issue_id  
    def has_ip_submitted_before(self, hashed_ip, issue_id):  
        return Opinion.objects.filter(hashed_ip=hashed_ip, issue_id__id=issue_id).exists() 

    # Overriding the create method to handle the logic  
    def create(self, request, *args, **kwargs):  
        ip_address = self.get_client_ip(request)  
        hashed_ip = self.hash_ip(ip_address)  

        issue_id = request.data.get('issue_id')  
        issue_instance = get_object_or_404(Issue, id=issue_id)  

        if self.has_ip_submitted_before(hashed_ip, issue_id):  # Pass the issue_id here  
            return JsonResponse({'error': 'You have already submitted an opinion for this issue.'}, status=400)
        
         # Get the issue instance using the provided issue ID  
        # issue_id = request.data.get('issue_id')  
        # issue_instance = get_object_or_404(Issue, id=issue_id) 

        # Create the Opinion instance with the data from the request  
        opinion_data = {  
            'whether_have_read': request.data.get('whether_have_read'),  
            'whether_support': request.data.get('whether_support'),  
            'user_opinion': request.data.get('user_opinion'),  
            'issue_id': issue_instance,  # This should be a valid Issue ID  
            'user_id': request.data.get('user_id'),  
            'hashed_ip': hashed_ip  
        }  

        # Create the new opinion instance  
        new_opinion = Opinion(**opinion_data)  
        new_opinion.save()  

        return JsonResponse({'success': 'Opinion submitted successfully.'}, status=201)  






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


#Implementing sentiment analysis

from transformers import pipeline
from spacy import load
from nltk.corpus import stopwords
from gensim import corpora
from gensim.models import LdaModel
#from my_aspect_extraction_module import extract_aspects
import spacy
import nltk


# Download stopwords (you can run this once in your environment)
nltk.download('stopwords')




# Example GPT model for sentiment analysis
sentiment_analyzer = pipeline("sentiment-analysis")
nlp = spacy.load("en_core_web_sm")

def extract_aspects(text):
    """
    Function to extract aspects from the given text using Named Entity Recognition (NER).
    This function returns a list of aspects from the text.
    """
    doc = nlp(text)
    aspects = []
    for ent in doc.ents:
        if ent.label_ in ['ORG', 'GPE', 'MONEY', 'PRESIDENCY', 'IMPEACHMENT']:  # Choose labels relevant to aspects
            aspects.append(ent.text)
    return aspects

def issue_analysis(request, issue_id):
    opinions = Opinion.objects.filter(issue_id__id=issue_id)
    
    sentiments = []
    aspects = []
    entities = []
    common_themes = []
    
    # Collect text from opinions
    opinion_texts = [opinion.user_opinion for opinion in opinions]
    
    # Perform sentiment and aspect extraction
    for opinion_text in opinion_texts:
        sentiment = sentiment_analyzer(opinion_text)[0]
        doc = nlp(opinion_text)
        
        # Named entity recognition
        entities.append([(ent.text, ent.label_) for ent in doc.ents])
        
        # Extract common aspects (e.g., reasons for amendment or negative opinions)
        aspects.append(extract_aspects(opinion_text))  # You can define this function
        
        # Store the sentiment result
        sentiments.append({
            "text": opinion_text,
            "sentiment": sentiment['label'],
            "confidence": sentiment['score']
        })
    
    # Topic modeling (LDA for common themes)
    common_themes = lda_topic_modeling(opinion_texts)
    
    return JsonResponse({
        "sentiments": sentiments,
        "aspects": aspects,
        "entities": entities,
        "themes": common_themes
    })

# Topic Modeling (LDA)
def lda_topic_modeling(texts):
    stop_words = set(stopwords.words('english'))
    texts = [[word for word in document.lower().split() if word not in stop_words] for document in texts]
    dictionary = corpora.Dictionary(texts)
    corpus = [dictionary.doc2bow(text) for text in texts]
    lda = LdaModel(corpus, num_topics=5, id2word=dictionary, passes=15)
    return lda.show_topics()
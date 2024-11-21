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
       # print(ip)  
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
            'issue_id': issue_instance,    
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


#a view function for the statistics
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


#view to fetch opinion based on the issue
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
from nltk.tokenize import word_tokenize
from django.http import JsonResponse
import spacy
import nltk
from collections import Counter


# Download stopwords and tokenizer
nltk.download('stopwords')
nltk.download('punkt')
nltk.download('punkt_tab')

# GPT model for sentiment analysis
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
    # Fetch opinions related to the specific issue
    opinions = Opinion.objects.filter(issue_id=issue_id)
    opinion_texts = [opinion.user_opinion for opinion in opinions]
    
    if not opinion_texts:
        return JsonResponse({"error": "No opinions found for this issue"}, status=404)
    
    # Combine all opinions into one text for analysis
    combined_text = " ".join(opinion_texts)
    
    # Perform sentiment analysis on the combined text
    sentiment = sentiment_analyzer(combined_text)[0]
    
    # Extract aspects using NER
    aspects = extract_aspects(combined_text)
    
    # Extract top keywords and format them into meaningful sentences
    keywords = lda_topic_modeling(opinion_texts)
    framed_sentences = frame_keywords_into_sentences(keywords)
    
    return JsonResponse({
        "overall_sentiment": {
            "sentiment": sentiment['label'],
            "confidence": sentiment['score']
        },
        "top_aspects": aspects[:5],  # Limit to top 5 aspects
        "themes": framed_sentences  # Top keywords framed into sentences
    })


# Topic Modeling (LDA) for Top Keywords
def lda_topic_modeling(texts):
    stop_words = set(stopwords.words('english'))
    texts = [
        [word for word in word_tokenize(document.lower()) if word.isalnum() and word not in stop_words]
        for document in texts
    ]
    
    dictionary = corpora.Dictionary(texts)
    corpus = [dictionary.doc2bow(text) for text in texts]
    lda = LdaModel(corpus, num_topics=1, id2word=dictionary, passes=15)  # Focus on a single overall topic
    
    # Extract top keywords from the most dominant topic
    topic_terms = lda.show_topic(0, topn=5)  # Get top 5 terms
    top_keywords = [term for term, _ in topic_terms]
    
    return top_keywords


# Frame Keywords into Meaningful Sentences
def frame_keywords_into_sentences(keywords):
    sentences = []
    for keyword in keywords:
        # Frame a sentence based on the keyword
        if keyword.lower() == "amend":
            sentences.append("Citizens suggest the bill should be amended.")
        elif keyword.lower() == "impeachment":
            sentences.append("Impeachment discussions are a key focus.")
        elif keyword.lower() == "support":
            sentences.append("There is significant support for the issue.")
        elif keyword.lower() == "president":
            sentences.append("The president's role is being heavily debated.")
        elif keyword.lower() == "want":
            sentences.append("People express their desires about this issue.")
        else:
            sentences.append(f"The term '{keyword}' is frequently mentioned.")
    
    return sentences
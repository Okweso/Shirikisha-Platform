from django.test import TestCase
from.models import Issue, Opinion
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
import hashlib

# Create your tests here.
class IssueModelTest(TestCase):

    def setUp(self):
        # Setting up initial data
        self.issue = Issue.objects.create(
            title="Test Issue",
            summary="This is a test summary",
            link="http://example.com",
            category="Education"
        )

    def test_issue_creation(self):
        """Test if the issue is created successfully"""
        self.assertEqual(self.issue.title, "Test Issue")
        self.assertEqual(self.issue.summary, "This is a test summary")
        self.assertEqual(self.issue.link, "http://example.com")
        self.assertEqual(self.issue.category, "Education")

    def test_blank_fields(self):
        """Test that null/blank fields work as expected"""
        issue = Issue.objects.create(link="http://example.com")
        self.assertIsNone(issue.title)
        self.assertIsNone(issue.summary)
        self.assertIsNone(issue.category)
    
    # def test_invalid_link(self):
    #     """Test that invalid URL is not allowed"""
    #     with self.assertRaises(ValueError):
    #         Issue.objects.create(link="invalid_link")





class OpinionModelTest(TestCase):

    def setUp(self):
        # Create a sample issue for the foreign key relationship
        self.issue = Issue.objects.create(
            title="Sample Issue",
            link="http://example.com"
        )
        # Create an opinion associated with the issue
        self.opinion = Opinion.objects.create(
            whether_have_read="yes",
            whether_support="no",
            user_opinion="I do not support this issue",
            issue_id=self.issue,
            user_id="user123",
            hashed_ip="hashed-ip-address"
        )

    def test_opinion_creation(self):
        """Test if the opinion is created successfully"""
        opinion = Opinion.objects.get(id=self.opinion.id)
        self.assertEqual(opinion.whether_have_read, "yes")
        self.assertEqual(opinion.whether_support, "no")
        self.assertEqual(opinion.user_opinion, "I do not support this issue")
        self.assertEqual(opinion.issue_id, self.issue)
        self.assertEqual(opinion.user_id, "user123")
        self.assertEqual(opinion.hashed_ip, "hashed-ip-address")
        self.assertIsNotNone(opinion.date)

    def test_blank_fields_in_opinion(self):
        """Test if nullable fields can be left blank"""
        opinion = Opinion.objects.create(
            whether_have_read="explained to by someone",
            issue_id=self.issue
        )
        self.assertIsNone(opinion.whether_support)
        self.assertIsNone(opinion.user_opinion)
        self.assertIsNone(opinion.hashed_ip)
    
    # def test_invalid_whether_have_read_choice(self):
    #     """Test invalid choice for whether_have_read raises error"""
    #     with self.assertRaises(ValueError):
    #         Opinion.objects.create(
    #             whether_have_read="invalid_choice",  # Invalid choice
    #             issue_id=self.issue
    #         )
    
    # def test_invalid_whether_support_choice(self):
    #     """Test invalid choice for whether_support raises error"""
    #     with self.assertRaises(ValueError):
    #         Opinion.objects.create(
    #             whether_have_read="yes",
    #             whether_support="invalid_choice",  # Invalid choice
    #             issue_id=self.issue
    #         )


class ListIssuesViewTest(TestCase):

    def setUp(self):
        # Create some test data
        Issue.objects.create(title="Issue 1", summary="Summary 1", link="http://example.com", category="Health")
        Issue.objects.create(title="Issue 2", summary="Summary 2", link="http://example.com", category="Economy")

    def test_list_issues(self):
        """Test if the issues list API returns the correct data"""
        response = self.client.get(reverse('issues-list')) 
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)  


class OpinionSubmissionTest(APITestCase):

    def setUp(self):
        # Set up an issue to associate with the opinion
        self.issue = Issue.objects.create(title="Issue 1", summary="Summary 1", link="http://example.com", category="Health")

    def test_submit_opinion(self):
        """Test submitting an opinion via API"""
        url = reverse('opinions-list')  
        data = {
            "issue_id": self.issue.id,
            "opinion": "I support this bill",
            "whether_have_read": "yes",
            "whether_support": "yes"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)  # Assuming successful submission returns 201



class OpinionListByIssueTest(APITestCase):

    def setUp(self):
        # Creating an issue and some opinions related to it
        self.issue = Issue.objects.create(title="Issue 1", summary="Summary 1", link="http://example.com", category="Health")
        self.issue2 = Issue.objects.create(title="Issue 2", summary="Summary 2", link="http://example.com", category="Economy")

        # Opinions for Issue 1
        Opinion.objects.create(
            whether_have_read="yes",
            whether_support="yes",
            user_opinion="I support this issue",
            issue_id=self.issue,
            user_id="user1"
        )
        Opinion.objects.create(
            whether_have_read="no",
            whether_support="no",
            user_opinion="I do not support this issue",
            issue_id=self.issue,
            user_id="user2"
        )

        # Opinion for Issue 2 (to ensure filtering works correctly)
        Opinion.objects.create(
            whether_have_read="explained to by someone",
            whether_support="need amendment",
            user_opinion="This issue needs amendment",
            issue_id=self.issue2,
            user_id="user3"
        )

    def test_list_opinions_by_issue_id(self):
        """Test listing opinions for a specific issue by issue_id"""
        url = reverse('user_opinions', kwargs={'id': self.issue.id})  # Reverse the URL with issue id
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)  # Ensuring the request is successful
        opinions = response.json()['opinions']

        # Checking if only 2 opinions related to Issue 1 are returned
        self.assertEqual(len(opinions), 2)

        # Checking the content of the opinions
        self.assertEqual(opinions[0]['user_opinion'], "I support this issue")
        self.assertEqual(opinions[1]['user_opinion'], "I do not support this issue")



class HashedIPTest(APITestCase):

    def setUp(self):
        # Set up an issue to associate with the opinion
        self.issue = Issue.objects.create(title="Issue 1", summary="Summary 1", link="http://example.com", category="Health")

    def hash_ip(self, ip_address):
        """Helper function to hash an IP address"""
        return hashlib.sha256(ip_address.encode('utf-8')).hexdigest()

    def test_ip_address_hashed(self):
        """Test that the IP address is correctly fetched and hashed"""
        url = reverse('opinions-list')  # URL for opinion submission

        # Simulate a client IP address in the request metadata
        client_ip = '123.45.67.89'
        
        # Opinion data
        data = {
            "issue_id": self.issue.id,
            "user_opinion": "I support this bill",
            "whether_have_read": "yes",
            "whether_support": "yes"
        }

        # Simulate the request with the IP address in META
        response = self.client.post(
            url, 
            data, 
            format='json', 
            REMOTE_ADDR=client_ip  # Set the client's IP address
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)  # Ensure the request is successful

        # Fetch the newly created opinion
        opinion = Opinion.objects.get(issue_id=self.issue.id)

        # Hash the IP address using the helper function
        hashed_ip = self.hash_ip(client_ip)

        # Check if the stored hashed IP matches the expected hashed value
        self.assertEqual(opinion.hashed_ip, hashed_ip)
# Shirikisha Platform

Shirikisha is a public participation platform for Kenyan citizens to engage with current affairs, express their opinions on various issues (bills, policies, or matters of national importance), and analyze public sentiment. The platform allows users to submit opinions anonymously and view real-time analysis of public sentiment, helping decision-makers understand the pulse of the people.

## Features
- **Anonymous opinion submission** on issues of national importance.
- **Data analysis and visualization** of public sentiment using interactive charts.
- **Sentiment analysis** to understand the reasons behind public opinions.
- **Pagination and filtering** for easy navigation through issues and opinions.

## Technologies Used
- **Backend**: Python, Django, MySQL
- **Frontend**: React.js, Tailwind CSS, Chart.js
- **APIs**: Custom REST APIs built using Django
- **Sentiment Analysis**: Pre-trained language models (GPT)

## Installation Instructions

To set up and run Shirikisha locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Okweso/Shirikisha-Platform.git
   ```


2. **Backend Setup**:
   - Ensure you have Python 3 and MySQL installed.
   - Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

   - Configure the MySQL database in the settings.py file.
   - Run database migrations:
   ```bash
   python manage.py migrate
   ```
   - Start the backend server:
   ```bash
   python manage.py runserver
   ```
3. **Frontend Setup**
   - Install Node.js and npm if not already installed.
   - Navigate to the frontend folder and install dependencies:
   ```bash
   cd frontend
   cd front-end
   npm install
   ```
   - Start the frontend development server
  ```bash
  npm start
  ```

## Usage
Once both servers are running, you can access the platform by visiting ```http://localhost:3000``` in your browser.

**Submitting Opinions**
- Users can visit an issue page and submit their opinion without the need for any sign-up process.
- Only one opinion can be submitted per issue per device to prevent spam. The IP address is hashed for anonymity while checking for duplicates.

**Viewing Public Sentiment**
- Each issue has an Detailed Analysis page where users can see the percentage of people who support or oppose the issue. This data is visualized using Chart.js.
- The Sentiment Analysis section provides insights into why users feel the way they do.

**Viewing Other Opinions**
- Users can click the "View Opinions" button on the Analysis page to see opinions submitted by others. The opinions are paginated, showing 10 per page, ordered by submission date.
## API Documentation

**Issues API**

Endpoint:   ``GET /issues/``

Returns a list of issues in the following format:
```bash
[
  {
    "issue_id": 1,
    "issue_title": "New Education Bill",
    "issue_summary": "This bill proposes changes to the current education system.",
    "issue_link": "http://example.com/education-bill",
    "category": "Education"
  },
  ...
]
```
**Opinions API**

Endpoint: ``POST /opinions/``

Example request body:
```bash
{
  "issue_id": 1,
  "opinion": "I support this bill because it improves access to education.",
  "whether_have_read": "Yes",
  "whether_support": "Yes"
}
```
**Statistics API**

Endpoint: GET ``/issues/<int:id>/statistics/``

Returns sentiment statistics for a particular issue.

**Sentiment Analysis API**

Endpoint: GET ``/issues/<int:issue_id>/opinions/sentiments-analysis/``

Returns the sentiment analysis of a particular issue

## Testing

To run tests for the backend:

```bash
python manage.py test
```

Testing should cover the following aspects:

- Submission of opinions
- Analysis data retrieval
- API response validation
  
For frontend testing, ensure that all visualizations and user interactions work as expected, especially the charts and pagination.

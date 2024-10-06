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
   git clone https://github.com/Okweso/Shirikisha-Platform.git```


2. **Backend Setup**:
   - Ensure you have Python 3 and MySQL installed.
   - Install backend dependencies:
   ```bash
   pip install -r requirements.txt```

   - Configure the MySQL database in the settings.py file.
   - Run database migrations:
   ```bash
   python manage.py migrate```
   - Start the backend server:
   ```bash
   python manage.py runserver```

  

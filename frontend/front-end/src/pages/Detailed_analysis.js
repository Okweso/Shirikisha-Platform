import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnalysisPage = () => {
  const { id } = useParams(); // Get issue ID from the URL
  const [statistics, setStatistics] = useState(null);
  const [issueTitle, setIssueTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [graphData, setGraphData] = useState(null); // Existing graph data
  const [sentimentData, setSentimentData] = useState(null);
  //const [error, setError] = useState(null);


  useEffect(() => {
    // Fetch graph data (assuming you have this logic already)
    const fetchGraphData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/issues/${id}/opinions/sentiments-analysis/`);
        setGraphData(response.data);
      } catch (err) {
        console.error('Error fetching graph data:', err);
        setError('Failed to load graph data.');
      }
    };

    // Fetch sentiment analysis data
    const fetchSentimentAnalysis = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/issues/${id}/opinions/sentiments-analysis/`);
        setSentimentData(response.data);
      } catch (err) {
        console.error('Error fetching sentiment data:', err);
        setError('Failed to load sentiment data.');
      }
    };

    fetchGraphData();
    fetchSentimentAnalysis();
  }, [id]);

  // Function to calculate sentiment percentages
  const calculateSentimentPercentages = (sentiments) => {
    const total = sentiments.length;
    const sentimentCounts = sentiments.reduce(
      (acc, curr) => {
        if (curr.sentiment === 'POSITIVE') acc.positive += 1;
        else if (curr.sentiment === 'NEGATIVE') acc.negative += 1;
        // If you have neutral sentiments, add else if for 'NEUTRAL'
        return acc;
      },
      { positive: 0, negative: 0 , neutral: 0  }
    );

    const positivePercentage = ((sentimentCounts.positive / total) * 100).toFixed(2);
    const negativePercentage = ((sentimentCounts.negative / total) * 100).toFixed(2);
    // const neutralPercentage = ((sentimentCounts.neutral / total) * 100).toFixed(2);

    return { positive: positivePercentage, negative: negativePercentage /*, neutral: neutralPercentage */ };
  };

  // Function to process themes (Optional)
  const processThemes = (themes) => {
    // Example: Extract unique words and their weights
    const themeDetails = themes.map(([index, expression]) => {
      const regex = /(\d*\.\d+)\*"([^"]+)"/g;
      let match;
      const components = [];

      while ((match = regex.exec(expression)) !== null) {
        components.push({ word: match[2], weight: parseFloat(match[1]) });
      }

      return { index, components };
    });

    return themeDetails;
  };


  // Fetch issue statistics and issue details
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // Fetch the statistics data
        const statsResponse = await axios.get(`http://localhost:8000/issues/${id}/statistics/`);
        setStatistics(statsResponse.data);

        // Fetch the issue title (or any other issue-related data)
        const issueResponse = await axios.get(`http://localhost:8000/issues/${id}/`);
        setIssueTitle(issueResponse.data.title);
      } catch (err) {
        setError('Failed to load statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // Data for the bar chart
  const data = {
    labels: ['Support', 'Oppose', 'Need Amendment'],
    datasets: [
      {
        label: '% of Participants',
        data: [
          statistics.support_percentage,
          statistics.oppose_percentage,
          statistics.amendment_percentage,
        ],
        backgroundColor: ['#34D399', '#F87171', '#FDBA74'],
        borderColor: ['#059669', '#DC2626', '#F97316'],
        borderWidth: 1,
      },
    ],
  };

  // Options for the chart
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Disable the default aspect ratio to manually adjust the height
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Analysis of Issue: ${issueTitle}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };


  

  return (
    <div className="container mx-auto p-6">
      {/* Top View Opinions Button */}
      <div className="flex justify-center mb-6">
        <Link
          to={`/issues/${id}/opinions`}
          className="bg-black text-white py-2 px-4 rounded hover:bg-red-600"
        >
          View Opinions
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">{`Analysis of Issue: ${issueTitle}`}</h1>

      {/* Reduced chart size */}
      <div className="w-full max-w-lg mx-auto" style={{ height: '400px' }}>
        <Bar data={data} options={options} />
      </div>

      <div className="text-center mt-6">
        <p>Total Participants: {statistics.total_participants}</p>
      </div>

      {/* Bottom View Opinions Button */}
      <div className="text-center mt-6">
        <Link
          to={`/issues/${id}/opinions`}
          className="bg-black text-white py-2 px-4 rounded hover:bg-red-600"
        >
          View Opinions
        </Link>
      </div>

        {/* Existing Graph Section */}
      <div className="graph-section">
        {/* Your existing graph component goes here */}
        {/* Example:
        {graphData && <YourGraphComponent data={graphData} />}
        */}
      </div>

      {/* Sentiment Analysis Section */}
      {sentimentData && (
        <div className="sentiment-section mt-8 p-6 bg-white shadow rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Sentiment Analysis</h2>
          <div className="flex space-x-8">
            <div className="flex flex-col items-center">
              <span className="text-green-500 text-xl font-bold">{calculateSentimentPercentages(sentimentData.sentiments).positive}%</span>
              <span className="text-gray-700">Positive</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-red-500 text-xl font-bold">{calculateSentimentPercentages(sentimentData.sentiments).negative}%</span>
              <span className="text-gray-700">Negative</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-red-500 text-xl font-bold">{calculateSentimentPercentages(sentimentData.sentiments).neutral}%</span>
              <span className="text-gray-700">Neutral</span>
            </div>
            {/* Uncomment if handling Neutral
            <div className="flex flex-col items-center">
              <span className="text-yellow-500 text-xl font-bold">{calculateSentimentPercentages(sentimentData.sentiments).neutral}%</span>
              <span className="text-gray-700">Neutral</span>
            </div>
            */}
          </div>

          {/* Optional: Display Themes */}
          {sentimentData.themes && sentimentData.themes.length > 0 && (
            <div className="themes-section mt-6">
              <h3 className="text-xl font-semibold mb-2">Common Themes</h3>
              <ul className="list-disc list-inside">
                {processThemes(sentimentData.themes).map((theme) => (
                  <li key={theme.index}>
                    {theme.components.map((comp, idx) => (
                      <span key={idx} className="mr-1">
                        {comp.weight}x "{comp.word}"
                        {idx < theme.components.length - 1 && '+'}
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Error Handling */}
      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

    </div>
  );
};

export default AnalysisPage;

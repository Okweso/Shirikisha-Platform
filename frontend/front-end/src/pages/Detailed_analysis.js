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
    </div>
  );
};

export default AnalysisPage;

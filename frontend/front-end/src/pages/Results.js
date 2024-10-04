import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Results = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch issues from the API
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await axios.get('http://localhost:8000/issues/');
        const sortedBills = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setIssues(sortedBills);
      } catch (err) {
        setError('Failed to fetch issues.');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  // Function to fetch total participants for a specific issue
  const fetchTotalParticipants = async (issueId) => {
    try {
      const response = await axios.get(`http://localhost:8000/issues/${issueId}/statistics/`);
      return response.data.total_participants;
    } catch (err) {
      console.error(`Failed to fetch total participants for issue ${issueId}:`, err);
      return 0; // Fallback to 0 if there's an error
    }
  };

  // Use state to store total participants for each issue
  const [totalParticipants, setTotalParticipants] = useState({});

  // Fetch total participants for each issue
  useEffect(() => {
    const fetchParticipants = async () => {
      const participantsData = {};
      await Promise.all(
        issues.map(async (issue) => {
          const total = await fetchTotalParticipants(issue.id);
          participantsData[issue.id] = total;
        })
      );
      setTotalParticipants(participantsData);
    };

    if (issues.length > 0) {
      fetchParticipants();
    }
  }, [issues]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const groupBillsByCategory = () => {
    const groupedBills = {};
    issues.forEach((issue) => {
      const category = issue.category || 'Uncategorized'; // Default to 'Uncategorized' if no category
      if (!groupedBills[category]) {
        groupedBills[category] = [];
      }
      groupedBills[category].push(issue);
    });
    return groupedBills;
  };

  const groupedBills = groupBillsByCategory();

  const openSummaryModal = (issue) => {
    setSelectedBill(issue);
    setIsModalOpen(true);
  };

  const closeSummaryModal = () => {
    setSelectedBill(null);
    setIsModalOpen(false);
  };



  return (
    <div className="container mx-auto p-6">

{Object.keys(groupedBills).map((category) => (
          <div key={category} className="mb-10">
            <h2 className="text-2xl font-bold mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {groupedBills[category].map((issue) => (
                <div key={issue.id} className="bg-white border border-gray-300 p-4 rounded-lg shadow-md hover:bg-green-100">
                  
                  <h2 className="text-lg font-bold text-black">{issue.title}</h2>
            <p className="text-sm text-gray-600 mt-2">{issue.summary && issue.summary.length > 70?
                        `${issue.summary.substring(0, 70)}...`
                      : issue.summary || 'No summary'}</p>
            <button 
                    onClick={() => openSummaryModal(issue)} 
                    className="text-blue-500 underline mb-4 block"
                  >
                    Read More
                  </button>
            {/* <span className="text-xs font-semibold bg-red-100 text-red-500 py-1 px-2 rounded">
              Category: {issue.category}
            </span> */}
            <p className="text-sm mt-2">Total Participants: {totalParticipants[issue.id] || 0}</p>
            <Link to={`/issues/${issue.id}/analysis`} className="mt-4 block bg-black text-white py-2 px-4 rounded hover:bg-red-600 text-center">
              View Analysis
            </Link>

                  </div>

                

              ))}
            </div>
          </div>
        ))}

        {/* Summary Modal */}
      {isModalOpen && selectedBill && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full h-3/4 overflow-y-auto relative">
            {/* Title */}
            <h3 className="text-xl font-bold mb-4 text-center">{selectedBill.title}</h3>

            {/* Bill Summary */}
            <p className="mb-6">{selectedBill.summary}</p>

            {/* Close Button */}
            <button
              onClick={closeSummaryModal}
              className="mt-6 w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}


    </div>

        

  );
};

export default Results;

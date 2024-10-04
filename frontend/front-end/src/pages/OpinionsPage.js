import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Import useParams to access URL params

const OpinionsPage = () => {
  const { id } = useParams(); // Get the issue ID from the URL
  const [opinions, setOpinions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [opinionsPerPage] = useState(6); // Show 6 opinions per page
  const [totalOpinions, setTotalOpinions] = useState(0);

  useEffect(() => {
    // Fetch opinions based on the issue ID from the URL
    const fetchOpinions = async () => {
      const res = await axios.get(`http://localhost:8000/issues/${id}/opinions/`);
      setOpinions(res.data.opinions);
      setTotalOpinions(res.data.opinions.length); // Get total number of opinions
    };
    fetchOpinions();
  }, [id]);

  // Calculate current opinions for pagination
  const indexOfLastOpinion = currentPage * opinionsPerPage;
  const indexOfFirstOpinion = indexOfLastOpinion - opinionsPerPage;
  const currentOpinions = opinions.slice(indexOfFirstOpinion, indexOfLastOpinion);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-6">What Kenyans are saying about this issue</h1>

      {/* Opinions List */}
      <div className="space-y-4">  
        {currentOpinions && currentOpinions.length > 0 ? (  
            currentOpinions.map((opinion) => (  
            <div key={opinion.id} className="p-4 bg-gray-100 rounded-lg shadow-md">  
                <p><strong>User:  </strong> {opinion.user_id}</p>  
                <p><strong>Opinion:  </strong> {opinion.user_opinion}</p>  
                <p><strong>Date Submitted:  </strong> {new Date(opinion.date).toLocaleString()}</p>  
                {/* <p><strong>Have Read:</strong> {opinion.whether_have_read === 'yes' ? 'Yes' : 'No'}</p>  
                <p><strong>Support:</strong> {opinion.whether_support}</p>   */}
            </div>  
            ))  
        ) : (  
            <p>There are no opinions for this issue yet.</p>  
        )}  
</div>  

      {/* Pagination */}
      {totalOpinions > opinionsPerPage && (
        <Pagination
          opinionsPerPage={opinionsPerPage}
          totalOpinions={opinions.length}
          paginate={paginate}
          currentPage={currentPage}
        />
      )}
    </div>
  );
};

// Pagination Component
const Pagination = ({ opinionsPerPage, totalOpinions, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalOpinions / opinionsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="mt-8">
      <ul className="flex justify-center space-x-2">
        {pageNumbers.map(number => (
          <li key={number}>
            <button
              onClick={() => paginate(number)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === number ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default OpinionsPage;

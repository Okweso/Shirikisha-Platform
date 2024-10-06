import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BillsPage = () => {

  let user_id = localStorage.getItem('user_uid')
  
  if (user_id === null){
    // Save UID in localStorage or session cookie
    fetch('http://localhost:8000/session_id')
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('user_uid', data.uid);
        user_id = localStorage.getItem('user_uid')
    });
  }
  //alert(user_id)

 
  

  // useEffect(() => {
  //   const fetchSessionToken = async () => {
  //     try {
  //       const response = await axios.get('http://127.0.0.1:8000/get_or_create_uid');
  //       const { uid } = response.data;
  
  //       // Store token in localStorage
  //       localStorage.setItem('uid', uid);
  //     } catch (error) {
  //       console.error('Error fetching session token:', error);
  //     }
  //   };
  
  //   fetchSessionToken();
  // }, []);
  


  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [opinions, setOpinions] = useState([]);
  const [formData, setFormData] = useState({
    whether_read: '',
    whether_support: '',
    user_opinion: '',
    issue_id: '',
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpinionModalOpen, setIsOpinionModalOpen] = useState(false);
  

  const [opinionFormData, setOpinionFormData] = useState({
    whether_have_read: '',
    whether_support: '',
    user_opinion: '',
  });

  useEffect(() => {
    // Fetch bills from the API
    axios.get('http://127.0.0.1:8000/issues/')
      .then((response) => {
        const billsData = response.data;
        // Sort bills by date in descending order (latest bills first)
      const sortedBills = billsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setBills(sortedBills);
      })
      .catch((error) => {
        console.error('Error fetching bills:', error);
      });
  }, []);

  const openSummaryModal = (issue) => {
    setSelectedBill(issue);
    setIsModalOpen(true);
  };

  const closeSummaryModal = () => {
    setSelectedBill(null);
    setIsModalOpen(false);
  };

  const openOpinionModal = (issue) => {
    setFormData({
      whether_read: '',
      whether_support: '',
      user_opinion: '',
      issue_id: issue.id, // Automatically set the bill number
    });
    setShowSuccessMessage(false);
    setIsOpinionModalOpen(true);
  };

  const closeOpinionModal = () => {
    setIsOpinionModalOpen(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOpinionSubmit = async (e) => {  
    e.preventDefault();  

    if (!selectedBill || !selectedBill.id) {  
        alert('Error: No bill selected.');  
        return;  
    }  

    try {  
        // Prepare the data to send in the POST request  
        const opinionData = {  
            whether_have_read: opinionFormData.whether_have_read,  // Captured from dropdown  
            whether_support: opinionFormData.whether_support,      // Captured from dropdown  
            user_opinion: opinionFormData.user_opinion,            // Text area input  
            issue_id: selectedBill.id,                         // Bill number  
            user_id: user_id,                                      // From the browser or localStorage  
            date: new Date().toISOString(),                       // Current date automatically added  
        };  

        // Fetch opinions from the backend  
        const response = await axios.get('http://127.0.0.1:8000/opinions/');  
        const allOpinions = response.data; // Get the opinions data from the API  

        // Filter opinions based on the selected bill_no  
        const filteredOpinions = allOpinions.filter(opinion => opinion.issue_id === selectedBill.id);  

        // Check if any opinion from the filtered list has the same user_id  
        const userHasVoted = filteredOpinions.some(opinion => opinion.user_id === user_id);  

        if (userHasVoted) {  
            console.log('User has already submitted an opinion for this bill.');  
            // Handle case when user has already voted  
            alert('You have already submitted an opinion for this bill.');  
        } else {  
            // Make the POST request to submit the opinion  
            const postResponse = await axios.post(`http://127.0.0.1:8000/opinions/`, opinionData, {  
                headers: {  
                    "Content-Type": 'application/json',  
                    //'Session-Token': localStorage.getItem('user_uid'),  
                }  
            });  

            if (postResponse.status === 201 || postResponse.status === 200) {  
                alert('Opinion submitted successfully!');  
                console.log('Response Status:', postResponse.status);  
                setIsOpinionModalOpen(false);  // Close the modal  
            } else {  
                alert('Failed to submit opinion. Please try again.');  
                console.log('Response Status:', postResponse.status);  
            }  
        }  
    } catch (error) {  
        console.error('Error submitting opinion:', error);  
        alert('An error occurred while submitting your opinion.');  
    }  
};

   // Function to group bills by their category
   const groupBillsByCategory = () => {
    const groupedBills = {};
    bills.forEach((bill) => {
      const category = bill.category || 'Uncategorized'; // Default to 'Uncategorized' if no category
      if (!groupedBills[category]) {
        groupedBills[category] = [];
      }
      groupedBills[category].push(bill);
    });
    return groupedBills;
  };

  const groupedBills = groupBillsByCategory();

  return (
    <div className="bg-gray-100 min-h-screen">
      

      {/* Hero Section */}
      <section className="bg-green-500 text-white py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">Current Bills Under Review</h2>
          <p className="text-lg">Explore and share your opinion on ongoing legislative discussions and current affairs of our beloved country.</p>
        </div>
      </section>

      {/* Bills Overview Section */}
      <section className="container mx-auto py-10">
        {/* Loop through each category and render its bills */}
        {Object.keys(groupedBills).map((category) => (
          <div key={category} className="mb-10">
            <h2 className="text-2xl font-bold mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedBills[category].map((issue) => (
                <div key={issue.id} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">{issue.title}</h3>
                  <p className="text-gray-600 mb-4">
                    {issue.summary && issue.summary.length > 70?
                        `${issue.summary.substring(0, 70)}...`
                      : issue.summary || 'No summary'}
                  </p>
                  
                  <button 
                    onClick={() => openSummaryModal(issue)} 
                    className="text-blue-500 underline mb-4 block"
                  >
                    Read More
                  </button>

                  <div className="flex justify-between items-center mt-4 space-x-4">
                    {/* Primary CTA: Share Your Opinion */}
                    <button
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg w-full hover:bg-blue-700 transition duration-300"
                      onClick={() => {
                        setSelectedBill(issue);
                        setIsOpinionModalOpen(true);
                      }}
                    >
                      <span className="mr-2">💬</span> Share Your Opinion
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-4 space-x-4">
                    {/* Secondary CTA: View Analysis */}
                    <a
                      href='Analysis' // This links to the analysis page for the specific issue
                      className="bg-gray-400 text-white py-2 px-4 rounded-lg w-full hover:bg-gray-500 transition duration-300 flex items-center justify-center"
                    >
                      <span className="mr-2">📊</span> View Analysis
                    </a>

                    {/* Button for Viewing Full Bill */}
                    <button
                      className="bg-green-500 text-white py-2 px-4 rounded-lg w-full hover:bg-green-600 transition duration-300"
                      onClick={() => window.open(issue.link, '_blank')}
                    >
                      <span className="mr-2">📄</span> View in Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>


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


      {/* Opinion Modal */}
      {isOpinionModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="bg-white p-8 rounded-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Share Your Opinion</h3>
            <form onSubmit={handleOpinionSubmit} className="p-4">
              {/* Whether Have Read */}
              <div className="mb-4">
                <label htmlFor="whether_have_read" className="block text-sm font-medium text-gray-700">
                  Have you read and understood the bill?
                </label>
                <select
                  id="whether_have_read"
                  value={opinionFormData.whether_have_read}
                  onChange={(e) => setOpinionFormData({ ...opinionFormData, whether_have_read: e.target.value })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select an option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="explained to by someone">Explained to by someone</option>
                </select>
              </div>

              {/* Whether Support */}
              <div className="mb-4">
                <label htmlFor="whether_support" className="block text-sm font-medium text-gray-700">
                  Do you support this bill?
                </label>
                <select
                  id="whether_support"
                  value={opinionFormData.whether_support}
                  onChange={(e) => setOpinionFormData({ ...opinionFormData, whether_support: e.target.value })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select an option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="need amendment">Need Amendment</option>
                </select>
              </div>

              {/* User Opinion */}
              <div className="mb-4">
                <label htmlFor="user_opinion" className="block text-sm font-medium text-gray-700">
                  Your Opinion
                </label>
                <textarea
                  id="user_opinion"
                  value={opinionFormData.user_opinion}
                  onChange={(e) => setOpinionFormData({ ...opinionFormData, user_opinion: e.target.value })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  rows="4"
                  required
                ></textarea>
              </div>

              {/* Submit Button */}
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                Submit Opinion
              </button>
            </form>


            <button 
              onClick={closeOpinionModal} 
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="bg-white p-8 rounded-lg max-w-lg w-full text-center">
            <p className="text-green-500 mb-4">Your opinion has been successfully submitted!</p>
            <button 
              onClick={() => setShowSuccessMessage(false)} 
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default BillsPage;

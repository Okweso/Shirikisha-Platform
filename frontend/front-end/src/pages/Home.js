import React, { useCallback, useEffect, useState } from 'react';
import  Axios from 'axios';
import '../App.css'
import image from '../Images/Kenyan_youth.jpg'

function Home() {

  // Save UID in localStorage or session cookie
  fetch('/api/get_or_create_uid/')
  .then(response => response.json())
  .then(data => {
      localStorage.setItem('user_uid', data.uid);
  });

    const images = [
        {id:1, image:image},
    ]

    return(


        <div className="bg-white">
     

      {/* Hero Section */}
      <section className="bg-green-500 text-white py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Shaping Kenya’s Future Together</h2>
          <p className="text-xl mb-6">Give your opinion on government decisions and bills anonymously. Your voice matters!</p>
          <a href="Bills" className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">Start Engaging</a>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <img src= {images[0].image} alt="Civic participation" className="rounded-lg shadow-lg" />
          </div>
          <div className="md:w-1/2 md:pl-12">
            <h3 className="text-3xl font-bold mb-4">About Shirikisha</h3>
            <p className="text-lg mb-6">Shirikisha allows Kenyans to anonymously share their opinions on current government decisions and bills. We use advanced AI to analyze public sentiment and provide transparent insights into how people feel about the issues that matter.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-12">Key Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-white shadow-lg rounded-lg">
              <h4 className="text-xl font-bold mb-4">Easy Participation</h4>
              <p>Quickly share your opinion on current bills without needing an account.</p>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-lg">
              <h4 className="text-xl font-bold mb-4">AI-Driven Sentiment Analysis</h4>
              <p>Our platform uses AI to analyze public sentiment trends.</p>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-lg">
              <h4 className="text-xl font-bold mb-4">Anonymity</h4>
              <p>Your identity is fully protected as you participate anonymously.</p>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-lg">
              <h4 className="text-xl font-bold mb-4">Transparent Information</h4>
              <p>Clear and transparent insights on how opinions shape Kenya’s future.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-green-500 text-white py-16">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">Start Engaging Now</h3>
          <a href="Bills" className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">View Bills</a>
        </div>
      </section>

      
    </div>
  );
        

}
export default Home;
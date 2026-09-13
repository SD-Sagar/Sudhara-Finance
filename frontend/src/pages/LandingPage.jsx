import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-5xl font-bold text-blue-900 mb-6 text-center">
        Welcome to Sudhara Finance
      </h1>
      <p className="text-xl text-gray-600 mb-12 text-center max-w-2xl">
        Your trusted partner for financial growth. Please select your portal to continue.
      </p>
      
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link 
          to="/customer/login"
          className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 group"
        >
          <div className="h-20 w-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Customer Portal</h2>
          <p className="text-gray-500 mt-2 text-center">Login or register for a new account.</p>
        </Link>
        
        <Link 
          to="/admin/login"
          className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 group"
        >
          <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Admin Portal</h2>
          <p className="text-gray-500 mt-2 text-center">Manage loans, customers, and operations.</p>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;

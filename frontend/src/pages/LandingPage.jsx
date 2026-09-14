import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const LandingPage = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-80px)] w-[100vw] relative left-1/2 -translate-x-1/2 pb-12 overflow-x-hidden">
      {/* Welcome Banner Section */}
      <div 
        className="w-full relative h-[45vh] md:h-[55vh] flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat shadow-2xl"
        style={{ backgroundImage: "url('/sudharaBanner.jpg')", animation: 'fadeIn 1.5s ease-out forwards' }}
      >
        {/* Golden overlay */}
        <div className="absolute inset-0 bg-[#673c1c]/70 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10"></div>
        
        <div className="z-10 text-center px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#f5eecc] mb-6 drop-shadow-2xl">
            {t('welcome_title')}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-[#fbf8eb] font-medium drop-shadow-lg max-w-3xl mx-auto leading-relaxed">
            {t('welcome_subtitle')}
          </p>
        </div>
      </div>
      
      {/* Login Boxes (Delayed Animation) */}
      <div 
        className="grid md:grid-cols-2 gap-8 w-full max-w-5xl px-4 -mt-16 z-20 opacity-0"
        style={{ animation: 'fadeInUp 1s ease-out 1.5s forwards' }}
      >
        <Link 
          to="/customer/login"
          className="flex flex-col items-center justify-center p-10 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all border-b-4 border-[#bc7b1f] hover:-translate-y-2 group"
        >
          <div className="h-24 w-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition shadow-sm border border-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{t('customer_portal')}</h2>
          <p className="text-gray-500 mt-3 text-center text-lg">{t('customer_portal_desc')}</p>
        </Link>
        
        <Link 
          to="/admin/login"
          className="flex flex-col items-center justify-center p-10 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all border-b-4 border-[#bc7b1f] hover:-translate-y-2 group"
        >
          <div className="h-24 w-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition shadow-sm border border-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{t('admin_portal')}</h2>
          <p className="text-gray-500 mt-3 text-center text-lg">{t('admin_portal_desc')}</p>
        </Link>
      </div>

      <style jsx="true">{`
        @keyframes slideDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;

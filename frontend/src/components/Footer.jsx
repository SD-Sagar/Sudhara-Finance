import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#673c1c] text-[#fbf8eb] border-t-4 border-[#bc7b1f] mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* About Section */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <img src="/ShudharaIcon.png" alt="Shudhara Logo" className="h-10 w-10 object-contain rounded-full bg-white p-0.5 border-2 border-[#e1b73e]" />
              <h3 className="text-xl font-bold text-[#e1b73e]">About Us</h3>
            </div>
            <p className="text-sm md:text-base leading-relaxed text-[#f5eecc] italic">
              "Empowering families and building futures. We are dedicated to providing accessible financial loans specifically tailored to support married women and married couples."
            </p>
          </div>

          {/* Contact & Location Section */}
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-[#e1b73e] mb-4">Contact & Location</h3>
            <div className="flex flex-col gap-3 text-sm md:text-base text-[#f5eecc]">
              <div className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 shrink-0 text-[#bc7b1f]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>Ranaghat, Nadia<br />Ramnagar Milan Bagan school para</span>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-[#bc7b1f]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>7029368862 / 9046377730</span>
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-[#e1b73e] mb-4">Quick Links</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link to="/terms" className="text-[#f5eecc] hover:text-[#e1b73e] transition flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link to="/customer/register" className="text-[#f5eecc] hover:text-[#e1b73e] transition flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Register Now
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#bc7b1f] my-6"></div>

        {/* Copyright & Developer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#efdf9e]">
          <p>&copy; {new Date().getFullYear()} Shudhara Women Development Organization. All Rights Reserved.</p>
          <p>
            Developed by{' '}
            <a 
              href="https://sd-portfolio-latest.netlify.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold text-[#e1b73e] hover:text-[#fbf8eb] transition underline decoration-[#bc7b1f] underline-offset-2"
            >
              sd-Sagar
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

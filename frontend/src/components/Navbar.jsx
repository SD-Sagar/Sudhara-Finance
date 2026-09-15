import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import api from '../utils/axiosConfig';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <nav className="bg-[#673c1c] text-white shadow-2xl border-b-4 border-[#bc7b1f]" style={{ animation: 'slideDown 0.8s ease-out forwards' }}>
      <style jsx="true">{`
        @keyframes shimmerText {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div className="w-full px-2 md:px-6 lg:px-8 py-3 md:py-5 lg:py-6 flex flex-wrap justify-between items-center gap-2">
        
        {/* Logo and Title */}
        <Link to="/" className="flex items-center gap-2 md:gap-3 shrink-0">
          <img src="/ShudharaIcon.png" alt="Shudhara Logo" className="h-8 w-8 md:h-16 md:w-16 lg:h-24 lg:w-24 object-contain rounded-full bg-white border-2 border-[#e1b73e] p-0.5 md:p-1" />
          <div className="flex flex-col justify-center">
            {/* Desktop Title */}
            <span 
              className="text-lg md:text-2xl lg:text-4xl font-extrabold tracking-wider drop-shadow-md hidden sm:block"
              style={{ backgroundImage: 'linear-gradient(to right, #f5eecc, #e1b73e, #f5eecc, #e1b73e)', backgroundSize: '300% 100%', animation: 'shimmerText 5s ease-in-out infinite', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Shudhara Women Development Organization
            </span>
            {/* Mobile Title */}
            <span 
              className="text-lg font-extrabold tracking-widest drop-shadow-md sm:hidden"
              style={{ backgroundImage: 'linear-gradient(to right, #f5eecc, #e1b73e, #f5eecc, #e1b73e)', backgroundSize: '300% 100%', animation: 'shimmerText 5s ease-in-out infinite', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              SWDO
            </span>
          </div>
        </Link>
        
        {/* Right side actions */}
        <div className="flex items-center gap-2 md:gap-6 shrink-0 ml-auto">
          <button 
            onClick={toggleLanguage} 
            className="border border-[#e1b73e] bg-[#bc7b1f] hover:bg-[#965a1a] text-white px-2 py-1 md:px-4 md:py-2 rounded text-xs md:text-base lg:text-lg font-bold transition shadow-sm"
          >
            {language === 'en' ? 'EN / বাং' : 'বাং / EN'}
          </button>
          
          {userInfo ? (
            <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-end">
              {userInfo.role === 'CUSTOMER' && userInfo.photoUrl && (
                <div className="flex items-center gap-1 md:gap-3 bg-[#7b481c]/80 pr-2 md:pr-4 rounded-full border border-[#d79e27] shadow-inner">
                  <img src={userInfo.photoUrl} alt="Profile" className="w-6 h-6 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full object-cover border border-[#e7cb68]" />
                  <div className="flex flex-col justify-center">
                    <span className="text-[8px] md:text-xs text-[#efdf9e] uppercase tracking-wider leading-none mt-1">CIBIL</span>
                    <span className="text-[10px] md:text-sm lg:text-base font-bold text-[#f5eecc] leading-none">{userInfo.cibilScore || 600}</span>
                  </div>
                </div>
              )}
              <span className="font-medium whitespace-nowrap text-xs md:text-sm lg:text-base hidden md:inline-block text-[#fbf8eb]">
                Welcome, {userInfo.name || userInfo.email}
              </span>
              <button 
                onClick={handleLogout}
                className="bg-red-700 hover:bg-red-800 px-2 py-1 md:px-5 md:py-2.5 lg:px-6 lg:py-3 text-xs md:text-base lg:text-lg font-bold rounded shadow-md border border-red-900 transition text-white"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="flex gap-2 md:gap-6 text-xs md:text-lg lg:text-xl">
              <Link to="/customer/login" className="text-[#efdf9e] hover:text-[#fbf8eb] transition font-medium">{t('customer_login')}</Link>
              <Link to="/admin/login" className="text-[#efdf9e] hover:text-[#fbf8eb] transition font-medium">{t('admin_login')}</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

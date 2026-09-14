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
      <div className="container mx-auto px-2 py-3 md:px-4 md:py-4 flex flex-wrap justify-between items-center gap-2">
        
        {/* Logo and Title */}
        <Link to="/" className="flex items-center gap-2 md:gap-3 shrink-0">
          <img src="/ShudharaIcon.png" alt="Shudhara Logo" className="h-8 w-8 md:h-12 md:w-12 object-contain rounded-full bg-white border-2 border-[#e1b73e] p-0.5 md:p-1" />
          <div className="flex flex-col justify-center">
            {/* Desktop Title */}
            <span 
              className="text-lg md:text-xl lg:text-2xl font-extrabold tracking-wider drop-shadow-md hidden sm:block"
              style={{ backgroundImage: 'linear-gradient(to right, #f5eecc, #e1b73e, #f5eecc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Shudhara Women Development Organization
            </span>
            {/* Mobile Title */}
            <span 
              className="text-lg font-extrabold tracking-widest drop-shadow-md sm:hidden"
              style={{ backgroundImage: 'linear-gradient(to right, #f5eecc, #e1b73e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              SWDO
            </span>
          </div>
        </Link>
        
        {/* Right side actions */}
        <div className="flex items-center gap-2 md:gap-6 shrink-0 ml-auto">
          <button 
            onClick={toggleLanguage} 
            className="border border-[#e1b73e] bg-[#bc7b1f] hover:bg-[#965a1a] text-white px-2 py-1 md:px-3 md:py-1.5 rounded text-xs md:text-sm font-bold transition shadow-sm"
          >
            {language === 'en' ? 'EN / বাং' : 'বাং / EN'}
          </button>
          
          {userInfo ? (
            <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-end">
              {userInfo.role === 'CUSTOMER' && userInfo.photoUrl && (
                <div className="flex items-center gap-1 md:gap-2 bg-[#7b481c]/80 pr-2 md:pr-3 rounded-full border border-[#d79e27] shadow-inner">
                  <img src={userInfo.photoUrl} alt="Profile" className="w-6 h-6 md:w-9 md:h-9 rounded-full object-cover border border-[#e7cb68]" />
                  <div className="flex flex-col">
                    <span className="text-[8px] md:text-[10px] text-[#efdf9e] uppercase tracking-wider leading-none mt-1">CIBIL</span>
                    <span className="text-[10px] md:text-xs font-bold text-[#f5eecc] leading-none">{userInfo.cibilScore || 600}</span>
                  </div>
                </div>
              )}
              <span className="font-medium whitespace-nowrap text-xs md:text-base hidden sm:inline-block text-[#fbf8eb]">
                Welcome, {userInfo.name || userInfo.email}
              </span>
              <button 
                onClick={handleLogout}
                className="bg-red-700 hover:bg-red-800 px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm font-bold rounded shadow-md border border-red-900 transition text-white"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="flex gap-2 md:gap-4 text-xs md:text-base">
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

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
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-wider">
          SUDHARA FINANCE
        </Link>
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleLanguage} 
            className="border border-blue-400 hover:bg-blue-800 px-3 py-1 rounded text-sm font-bold transition"
          >
            {language === 'en' ? 'EN / বাং' : 'বাং / EN'}
          </button>
          {userInfo ? (
            <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-end">
              {userInfo.role === 'CUSTOMER' && userInfo.photoUrl && (
                <div className="flex items-center gap-2 bg-blue-800/50 pr-3 rounded-full border border-blue-700">
                  <img src={userInfo.photoUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-blue-200 uppercase tracking-wider leading-none mt-1">CIBIL</span>
                    <span className="text-xs font-bold text-emerald-400 leading-none">{userInfo.cibilScore || 600}</span>
                  </div>
                </div>
              )}
              <span className="font-medium whitespace-nowrap text-sm md:text-base hidden sm:inline-block">
                Welcome, {userInfo.name || userInfo.email}
              </span>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1.5 md:px-4 md:py-2 text-sm rounded transition"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/customer/login" className="hover:text-blue-300 transition">{t('customer_login')}</Link>
              <Link to="/admin/login" className="hover:text-blue-300 transition">{t('admin_login')}</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

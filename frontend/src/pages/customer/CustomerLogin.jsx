import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../../features/auth/authSlice';
import api from '../../utils/axiosConfig';
import { useLanguage } from '../../contexts/LanguageContext';

const CustomerLogin = () => {
  const { t } = useLanguage();
  const [customerId, setCustomerId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (userInfo) {
      if (userInfo.role === 'ADMIN') navigate('/admin/dashboard');
      else if (userInfo.role === 'CUSTOMER') navigate('/customer/dashboard');
    }
  }, [userInfo, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/api/auth/customer', { customerId, password });
      dispatch(setCredentials(data));
      navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-[#fbf8eb] p-8 rounded-xl border border-[#bc7b1f] shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-center text-[#673c1c] mb-6">{t('customer_login')}</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[#965a1a] font-medium mb-1">Customer ID (SH-XXXX)</label>
          <input 
            type="text" 
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full border border-[#d79e27] rounded px-3 py-2 focus:outline-none focus:border-[#d79e27]"
            required 
            placeholder="e.g. SH-1234"
          />
        </div>
        <div>
          <label className="block text-[#965a1a] font-medium mb-1">{t('password')}</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#d79e27] rounded px-3 py-2 focus:outline-none focus:border-[#d79e27]"
            required 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#bc7b1f] text-white font-medium py-2 rounded hover:bg-[#965a1a] transition hover:-translate-y-1 shadow-md hover:shadow-lg disabled:bg-gray-400"
        >
          {loading ? t('submitting') : t('login')}
        </button>
      </form>
      
      <div className="mt-6 text-center text-[#bc7b1f]">
        {t('dont_have_account')} <Link to="/customer/register" className="text-[#bc7b1f] hover:underline">{t('register_here')}</Link>
      </div>
    </div>
  );
};

export default CustomerLogin;

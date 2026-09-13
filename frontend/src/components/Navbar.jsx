import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import api from '../utils/axiosConfig';

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
        <div>
          {userInfo ? (
            <div className="flex items-center gap-4">
              <span className="font-medium">
                Welcome, {userInfo.name || userInfo.email}
              </span>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/customer/login" className="hover:text-blue-300 transition">Customer</Link>
              <Link to="/admin/login" className="hover:text-blue-300 transition">Admin</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

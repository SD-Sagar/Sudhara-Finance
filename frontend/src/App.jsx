import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LandingPage from './pages/LandingPage';
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerRegister from './pages/customer/CustomerRegister';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Terms from './pages/Terms';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { userInfo } = useSelector((state) => state.auth);
  
  if (!userInfo) return <Navigate to="/" replace />;
  if (allowedRole && userInfo.role !== allowedRole) return <Navigate to="/" replace />;
  
  return children;
};

import { LanguageProvider } from './contexts/LanguageContext';
import api from './utils/axiosConfig';

// A beautiful full-screen loader to mask the "Render Cold Start" delay
const ServerWakeupLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fbf8eb]">
      <div className="text-center px-6">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-[#e1b73e]/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#bc7b1f] rounded-full border-t-transparent animate-spin"></div>
          <img src="/ShudharaIcon.png" alt="Shudhara" className="absolute inset-2 w-20 h-20 object-contain rounded-full bg-white p-1" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#673c1c] mb-3">
          Waking up secure server...
        </h2>
        <p className="text-lg text-[#965a1a] max-w-md mx-auto">
          Our systems are starting up to ensure your data is processed securely. This may take a few seconds.
        </p>
      </div>
    </div>
  );
};

const App = () => {
  const [serverReady, setServerReady] = React.useState(false);

  React.useEffect(() => {
    // Ping the health endpoint to wake up the Render backend
    const wakeUpServer = async () => {
      try {
        await api.get('/api/health');
        setServerReady(true);
      } catch (error) {
        // Even if it errors (e.g. CORS), it means the server responded
        setServerReady(true);
      }
    };
    wakeUpServer();
  }, []);

  return (
    <LanguageProvider>
      {!serverReady && <ServerWakeupLoader />}
      <Router>
        <div className={`min-h-screen flex flex-col bg-[#fbf8eb] transition-opacity duration-1000 ${!serverReady ? 'opacity-0' : 'opacity-100'}`}>
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/terms" element={<Terms />} />
            
            {/* Customer Routes */}
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/customer/register" element={<CustomerRegister />} />
            <Route 
              path="/customer/dashboard/*" 
              element={
                <ProtectedRoute allowedRole="CUSTOMER">
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard/*" 
              element={
                <ProtectedRoute allowedRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
    </LanguageProvider>
  );
};

export default App;

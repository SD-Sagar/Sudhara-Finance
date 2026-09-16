import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import { useLanguage } from '../../contexts/LanguageContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('registrations'); // registrations, loans, customers, add-customer
  
  // Data states
  const [registrations, setRegistrations] = useState([]);
  const [loanRequests, setLoanRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals / Selected Items
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [expandedLoans, setExpandedLoans] = useState({});
  const toggleLoan = (loanId) => setExpandedLoans(prev => ({...prev, [loanId]: !prev[loanId]}));
  const [selectedLoanRequest, setSelectedLoanRequest] = useState(null);
  
  // Edit Customer State
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editCustomerData, setEditCustomerData] = useState({});
  const [editCustomerFiles, setEditCustomerFiles] = useState({ photo: null, aadhaarDoc: null, voterIdDoc: null, panDoc: null });
  
  // Customer Search
  const [searchQuery, setSearchQuery] = useState('');

  // Add Customer State
  const [addCustomerData, setAddCustomerData] = useState({
    name: '', whatsappNumber: '', mobileNumber: '', email: '',
    aadhaar: '', voterId: '', pan: '', maritalStatus: 'Unmarried', permanentAddress: '', password: ''
  });
  const [addCustomerFiles, setAddCustomerFiles] = useState({
    photo: null,
    aadhaarDoc: null,
    voterIdDoc: null,
    panDoc: null
  });
  
  // Loan Config State
  const [loanConfig, setLoanConfig] = useState({
    approvedAmount: '',
    duration: '',
    installmentAmount: '',
    installmentFrequency: 'Monthly', // 'Monthly' or 'Weekly'
    startDate: new Date().toISOString().split('T')[0],
    completionDate: ''
  });

  const handleDurationChange = (val) => {
    const newConfig = { ...loanConfig, duration: val };
    const durationStr = val.toLowerCase();
    const match = durationStr.match(/(\d+)\s*(week|month)/);
    if (match && newConfig.startDate) {
      const value = parseInt(match[1]);
      const unit = match[2];
      const date = new Date(newConfig.startDate);
      if (unit === 'week') {
        date.setDate(date.getDate() + (value * 7));
      } else if (unit === 'month') {
        date.setMonth(date.getMonth() + value);
      }
      newConfig.completionDate = date.toISOString().split('T')[0];
    }
    setLoanConfig(newConfig);
  };

  const handleDatesChange = (field, val) => {
    const newConfig = { ...loanConfig, [field]: val };
    
    if (newConfig.startDate && newConfig.completionDate) {
      const start = new Date(newConfig.startDate);
      const end = new Date(newConfig.completionDate);
      if (end > start) {
        const timeDiff = end.getTime() - start.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        if (newConfig.installmentFrequency === 'Monthly') {
          newConfig.duration = `${Math.ceil(daysDiff / 30)} months`;
        } else if (newConfig.installmentFrequency === 'Weekly') {
          newConfig.duration = `${Math.ceil(daysDiff / 7)} weeks`;
        }
      }
    }
    setLoanConfig(newConfig);
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'registrations') {
        const { data } = await api.get('/api/registration/pending');
        setRegistrations(data);
      } else if (activeTab === 'loans') {
        const { data } = await api.get('/api/loans/requests');
        setLoanRequests(data);
      } else if (activeTab === 'customers') {
        const { data } = await api.get('/api/customers');
        setCustomers(data);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/api/notifications/admin');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchNotifications();
    setSelectedCustomer(null);
  }, [activeTab]);

  // Removed auto-calculate useEffects to prevent infinite loops
  // Actions - Registrations
  const handleApproveRegistration = async (id) => {
    const password = prompt('Create a password for this customer (min 6 chars):');
    if (!password) {
        alert('Approval cancelled. Password is required.');
        return;
    }
    if (password.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
    }

    try {
      await api.put(`/api/registration/${id}/approve`, { password });
      fetchData();
      alert('Registration approved and credentials sent to customer.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving');
    }
  };

  const handleRejectRegistration = async (id) => {
    try {
      await api.put(`/api/registration/${id}/reject`);
      fetchData();
    } catch (err) {
      alert('Error rejecting');
    }
  };

  // Actions - Loans
  const handleApproveLoan = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/loans/approve/${selectedLoanRequest._id}`, loanConfig);
      setSelectedLoanRequest(null);
      fetchData();
      alert('Loan approved and schedule generated.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving loan');
    }
  };

  const handleResolveCancellation = async (requestId, action) => {
    if (window.confirm(`Are you sure you want to ${action} this cancellation request?`)) {
      try {
        await api.post(`/api/loans/request/${requestId}/cancel-resolve`, { action });
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Error resolving cancellation');
      }
    }
  };

  // Actions - Customers & Payments
  const viewCustomerProfile = async (id) => {
    try {
      const { data } = await api.get(`/api/customers/${id}`);
      
      // also fetch installments for each loan
      const loansWithInstallments = await Promise.all(
        data.loans.map(async (loan) => {
          const res = await api.get(`/api/loans/${loan._id}`);
          return res.data;
        })
      );
      
      setSelectedCustomer({ ...data.customer, loansData: loansWithInstallments });
    } catch (err) {
      alert('Failed to load customer profile');
    }
  };

  const handleMarkPaid = async (installmentId) => {
    let paymentDate = prompt('Enter payment date (YYYY-MM-DD). Leave empty for today:');
    if (paymentDate === null) return;
    if (paymentDate.trim() === '') paymentDate = undefined;

    const paymentMethod = prompt('Enter payment method (Cash or Online):', 'Cash');
    if (!paymentMethod || !['Cash', 'Online'].includes(paymentMethod)) {
      alert('Invalid payment method. Cancelled.');
      return;
    }
    
    try {
      await api.put(`/api/installments/${installmentId}/pay`, { paymentMethod, paymentDate });
      // refresh profile
      viewCustomerProfile(selectedCustomer._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Error marking as paid');
    }
  };

  const handleToggleCustomerStatus = async (id, currentStatus) => {
    const action = currentStatus === 'ACTIVE' ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} this customer?`)) {
      try {
        if (action === 'deactivate') {
           await api.delete(`/api/customers/${id}`);
        } else {
           await api.put(`/api/customers/${id}/activate`); // We need to add this endpoint
        }
        setSelectedCustomer(null);
        fetchData();
      } catch (err) {
        alert(`Error ${action}ing customer`);
      }
    }
  };

  const handleEditCustomerFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 150 * 1024) {
      alert(`${e.target.name} must be less than 150KB`);
      e.target.value = null; // reset
      return;
    }
    setEditCustomerFiles({ ...editCustomerFiles, [e.target.name]: file });
  };

  const handleEditCustomerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    Object.keys(editCustomerData).forEach(key => formData.append(key, editCustomerData[key]));
    if (editCustomerFiles.photo) formData.append('photo', editCustomerFiles.photo);
    if (editCustomerFiles.aadhaarDoc) formData.append('aadhaarDoc', editCustomerFiles.aadhaarDoc);
    if (editCustomerFiles.voterIdDoc) formData.append('voterIdDoc', editCustomerFiles.voterIdDoc);
    if (editCustomerFiles.panDoc) formData.append('panDoc', editCustomerFiles.panDoc);

    try {
      await api.put(`/api/customers/${selectedCustomer._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Customer updated successfully.');
      setIsEditingCustomer(false);
      viewCustomerProfile(selectedCustomer._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating customer');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (customerId) => {
    const newPassword = prompt('Enter a new password for this customer (min 6 chars):');
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    
    try {
      await api.put(`/api/customers/${customerId}/reset-password`, { newPassword });
      alert('Password reset successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error resetting password');
    }
  };

  const handleAddCustomerFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 150 * 1024) {
      alert(`${e.target.name} must be less than 150KB`);
      e.target.value = null; // reset
      return;
    }
    setAddCustomerFiles({ ...addCustomerFiles, [e.target.name]: file });
  };

  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!addCustomerFiles.photo) {
      alert("Photograph is required");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    Object.keys(addCustomerData).forEach(key => formData.append(key, addCustomerData[key]));
    if (addCustomerFiles.photo) formData.append('photo', addCustomerFiles.photo);
    if (addCustomerFiles.aadhaarDoc) formData.append('aadhaarDoc', addCustomerFiles.aadhaarDoc);
    if (addCustomerFiles.voterIdDoc) formData.append('voterIdDoc', addCustomerFiles.voterIdDoc);
    if (addCustomerFiles.panDoc) formData.append('panDoc', addCustomerFiles.panDoc);

    try {
      await api.post('/api/customers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Customer created successfully and credentials sent to customer email.');
      setAddCustomerData({
        name: '', whatsappNumber: '', mobileNumber: '', email: '',
        aadhaar: '', voterId: '', pan: '', maritalStatus: 'Unmarried', permanentAddress: '', password: ''
      });
      setAddCustomerFiles({ photo: null, aadhaarDoc: null, voterIdDoc: null, panDoc: null });
      setActiveTab('customers');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding customer');
    } finally {
      setLoading(false);
    }
  };

  const getLogoBase64 = () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = '/ShudharaIcon.png';
    });
  };

  const handleDownloadLoanPDF = async (loanData, customer) => {
    const doc = new jsPDF();
    const logoData = await getLogoBase64();
    if (logoData) {
      doc.addImage(logoData, 'PNG', 14, 10, 20, 20); // small logo top left
      // Watermark in center (light opacity)
      doc.setGState(new doc.GState({opacity: 0.1}));
      doc.addImage(logoData, 'PNG', 50, 80, 100, 100);
      doc.setGState(new doc.GState({opacity: 1})); // reset
    }

    doc.setFontSize(22);
    doc.setTextColor(103, 60, 28); // #673c1c
    doc.text(`Shudhara Women Development Organization`, 38, 24);
    
    doc.setFontSize(16);
    doc.setTextColor(188, 123, 31); // #bc7b1f
    doc.text(`Full Loan History`, 14, 45);

    // Customer Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Customer Name: ${customer.name}`, 14, 55);
    doc.text(`Customer ID: ${customer.customerId}`, 14, 62);
    doc.text(`Loan Amount: Rs. ${loanData.loan.approvedAmount}`, 14, 69);
    doc.text(`Duration: ${loanData.loan.duration}`, 14, 76);

    const tableColumn = ["Due Date", "Amount (Rs)", "Fine (Rs)", "Status", "Payment Date"];
    const tableRows = [];

    loanData.installments.forEach(inst => {
      tableRows.push([
        new Date(inst.dueDate).toLocaleDateString(),
        inst.amount,
        inst.fine,
        inst.status,
        inst.paymentDate ? new Date(inst.paymentDate).toLocaleDateString() : '-'
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      styles: { fontSize: 10, halign: 'center' },
      headStyles: { fillColor: [188, 123, 31], textColor: [255,255,255] }, // #bc7b1f
      alternateRowStyles: { fillColor: [251, 248, 235] } // #fbf8eb
    });

    // Authority Signature
    const finalY = doc.lastAutoTable.finalY || 85;
    doc.setFontSize(12);
    doc.setTextColor(103, 60, 28);
    doc.text(`Authorized Signatory: _________________________`, 110, finalY + 40);

    doc.save(`LoanHistory_${customer.customerId}_${loanData.loan._id.substring(0, 6)}.pdf`);
  };

  const handleDownloadReceipt = async (installment, loanData, customer) => {
    const doc = new jsPDF();
    const logoData = await getLogoBase64();
    if (logoData) {
      doc.addImage(logoData, 'PNG', 14, 10, 20, 20);
      doc.setGState(new doc.GState({opacity: 0.1}));
      doc.addImage(logoData, 'PNG', 50, 80, 100, 100);
      doc.setGState(new doc.GState({opacity: 1}));
    }

    doc.setFontSize(22);
    doc.setTextColor(103, 60, 28);
    doc.text(`Shudhara Women Development Organization`, 38, 24);
    
    doc.setFontSize(18);
    doc.setTextColor(188, 123, 31);
    doc.text(`Payment Receipt`, 14, 45);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date of Payment: ${new Date(installment.paymentDate).toLocaleDateString()}`, 120, 45);
    
    doc.text(`Customer Name: ${customer.name}`, 14, 60);
    doc.text(`Customer ID: ${customer.customerId}`, 14, 67);
    doc.text(`Loan Amount: Rs. ${loanData.loan.approvedAmount}`, 14, 74);
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(188, 123, 31);
    doc.line(14, 85, 196, 85);

    doc.setFontSize(14);
    doc.setTextColor(103, 60, 28);
    doc.text(`Amount Paid: Rs. ${installment.amount}`, 14, 100);
    if(installment.fine > 0) {
        doc.text(`Late Fine Paid: Rs. ${installment.fine}`, 14, 110);
    }
    doc.text(`Payment Method: ${installment.paymentMethod || 'Cash'}`, 14, installment.fine > 0 ? 120 : 110);

    doc.line(14, 135, 196, 135);

    doc.setFontSize(12);
    doc.text(`Authorized Signatory: _________________________`, 110, 170);

    doc.save(`Receipt_${customer.customerId}_${installment._id.substring(0, 6)}.pdf`);
  };

  const handleDeleteLoan = async (loanData, customer) => {
    const password = prompt('Enter your admin password to delete this loan history:');
    if (!password) {
      return;
    }

    // Auto-download PDF as requested
    handleDownloadLoanPDF(loanData, customer);

    try {
      await api.delete(`/api/loans/${loanData.loan._id}`, {
        data: { password }
      });
      alert('Loan history deleted successfully.');
      viewCustomerProfile(customer._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting loan history');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.customerId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8 relative">
        <h1 className="text-3xl font-bold text-[#7b481c]">{t('admin_dashboard')}</h1>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full hover:bg-gray-100 transition relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#bc7b1f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
              <div className="p-3 bg-[#f5eecc] border-b font-bold text-[#7b481c]">
                Notifications
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-gray-500 text-sm text-center">No new notifications</div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      onClick={() => {
                        setActiveTab(notif.actionTab);
                        setShowNotifications(false);
                      }}
                      className="p-3 border-b hover:bg-gray-50 cursor-pointer transition text-sm text-gray-800 flex items-start gap-3"
                    >
                      <div className="mt-0.5">
                        {notif.type === 'registration' && <span className="w-2 h-2 mt-1.5 block rounded-full bg-blue-500"></span>}
                        {notif.type === 'loan' && <span className="w-2 h-2 mt-1.5 block rounded-full bg-yellow-500"></span>}
                        {notif.type === 'installment' && <span className="w-2 h-2 mt-1.5 block rounded-full bg-red-500"></span>}
                      </div>
                      <span className="font-medium">{notif.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto">
        {['registrations', 'loans', 'customers', 'add_customer'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab === 'add_customer' ? 'add-customer' : tab)}
            className={`pb-2 px-4 font-medium capitalize whitespace-nowrap ${
              (activeTab === tab || (activeTab === 'add-customer' && tab === 'add_customer')) 
                ? 'text-[#bc7b1f] border-b-2 border-[#bc7b1f]' 
                : 'text-[#d79e27] hover:text-[#965a1a]'
            }`}
          >
            {t(tab)}
          </button>
        ))}
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* REGISTRATIONS TAB */}
      {activeTab === 'registrations' && (
        <div className="space-y-6">
          {registrations.length === 0 && <p className="text-[#d79e27] text-center py-8">{t('no_pending_registrations')}</p>}
          {registrations.map(req => (
            <div key={req._id} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                  <img src={req.photoUrl || 'https://via.placeholder.com/150'} alt="Applicant" className="w-24 h-24 rounded-full object-cover border-4 border-[#fbf8eb]" />
                  <div>
                    <h3 className="text-2xl font-bold text-[#7b481c]">{req.name}</h3>
                    <p className="text-[#bc7b1f] mt-1"><strong className="text-[#965a1a]">Email:</strong> {req.email} | <strong className="text-[#965a1a]">WhatsApp:</strong> {req.whatsappNumber}</p>
                    <p className="text-[#bc7b1f]"><strong className="text-[#965a1a]">Mobile:</strong> {req.mobileNumber} | <strong className="text-[#965a1a]">Address:</strong> {req.permanentAddress}</p>
                    <p className="text-[#bc7b1f] mt-2"><strong className="text-[#965a1a]">Aadhaar:</strong> {req.aadhaar} | <strong className="text-[#965a1a]">PAN:</strong> {req.pan}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 min-w-[120px]">
                  <button onClick={() => handleApproveRegistration(req._id)} className="bg-[#bc7b1f] text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition hover:-translate-y-1 shadow-md hover:shadow-lg w-full shadow-sm">{t('approve')}</button>
                  <button onClick={() => handleRejectRegistration(req._id)} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition w-full">{t('reject')}</button>
                </div>
              </div>

              {/* Document Links */}
              <div className="mt-6 border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-[#d79e27] uppercase tracking-wider mb-3">Uploaded Documents</h4>
                <div className="flex flex-wrap gap-3">
                  {req.photoUrl && (
                    <a href={req.photoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#fbf8eb] text-[#965a1a] px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#f5eecc] transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                      Passport Photo
                    </a>
                  )}
                  {req.aadhaarDocUrl && (
                    <a href={req.aadhaarDocUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#fbf8eb] text-[#965a1a] px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#f5eecc] transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                      Aadhaar Document
                    </a>
                  )}
                  {req.panDocUrl && (
                    <a href={req.panDocUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#fbf8eb] text-[#965a1a] px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#f5eecc] transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                      PAN Document
                    </a>
                  )}
                  {req.voterIdDocUrl && (
                    <a href={req.voterIdDocUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#fbf8eb] text-[#965a1a] px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#f5eecc] transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                      Voter Document
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOANS TAB */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          {loanRequests.length === 0 && <p className="text-[#d79e27]">{t('no_pending_loans')}</p>}
          {loanRequests.map(req => (
            <div key={req._id} className="bg-white p-6 rounded shadow border">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-[#7b481c]">
                    {t('customer')}: {req.customer?.name} ({req.customer?.customerId})
                    {req.cancellationRequested && (
                      <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Cancellation Requested</span>
                    )}
                  </h3>
                  <p className="text-[#bc7b1f]">{t('requested')}: ₹{req.requestedAmount} for {req.requestedDuration}</p>
                  <p className="text-[#bc7b1f]">{t('reason')}: {req.reason}</p>
                  <p className="text-sm text-gray-400">{t('date')}: {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {!req.cancellationRequested ? (
                    <button 
                      onClick={() => {
                        setSelectedLoanRequest(req);
                        setLoanConfig({
                          approvedAmount: req.requestedAmount,
                          duration: req.requestedDuration,
                          installmentAmount: '',
                          installmentFrequency: req.requestedDuration.includes('weeks') ? 'Weekly' : 'Monthly',
                          startDate: new Date().toISOString().split('T')[0],
                          completionDate: ''
                        });
                      }} 
                      className="bg-[#bc7b1f] text-white px-4 py-2 rounded hover:bg-emerald-700"
                    >
                      {t('configure_approve')}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleResolveCancellation(req._id, 'approve')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Approve Cancel
                      </button>
                      <button 
                        onClick={() => handleResolveCancellation(req._id, 'reject')}
                        className="bg-[#fbf8eb]0 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                      >
                        Reject Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CUSTOMERS TAB */}
      {activeTab === 'customers' && !selectedCustomer && (
        <div className="space-y-4">
          <div className="mb-4">
            <input 
              type="text" 
              placeholder={t('search_customer')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-1/2 border border-[#d79e27] rounded px-4 py-2 focus:outline-none focus:border-[#fbf8eb]0"
            />
          </div>
          {filteredCustomers.length === 0 && <p className="text-[#d79e27]">{t('no_customers_found')}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map(c => (
              <div 
                key={c._id} 
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition cursor-pointer flex flex-col items-center text-center" 
                onClick={() => viewCustomerProfile(c._id)}
              >
                <img 
                  src={c.photoUrl || 'https://via.placeholder.com/150'} 
                  alt={c.name} 
                  className="w-20 h-20 rounded-full object-cover border-4 border-[#fbf8eb] mb-3"
                />
                <h3 className="font-bold text-lg text-[#7b481c]">{c.name}</h3>
                <span className="text-[#bc7b1f] font-medium mb-3">{c.customerId}</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CUSTOMER PROFILE VIEW */}
      {selectedCustomer && (
        <div>
          <button onClick={() => setSelectedCustomer(null)} className="mb-4 text-[#bc7b1f] hover:underline">
            &larr; Back to Customers List
          </button>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <img 
                src={selectedCustomer.photoUrl || 'https://via.placeholder.com/150'} 
                alt={selectedCustomer.name} 
                className="w-32 h-32 rounded-xl object-cover shadow-sm border border-gray-200"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold text-[#7b481c]">{selectedCustomer.name}</h2>
                    <span className="inline-block mt-2 text-lg text-[#bc7b1f] font-medium">{selectedCustomer.customerId}</span>
                    <span className={`ml-4 inline-block px-3 py-1 text-xs font-bold rounded-full ${selectedCustomer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {t('account_status')}: {selectedCustomer.status}
                    </span>
                  </div>
                  <div>
                    {selectedCustomer.status === 'ACTIVE' ? (
                       <button onClick={() => handleToggleCustomerStatus(selectedCustomer._id, selectedCustomer.status)} className="text-red-600 border-2 border-red-200 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition font-medium">{t('deactivate')}</button>
                    ) : (
                       <button onClick={() => handleToggleCustomerStatus(selectedCustomer._id, selectedCustomer.status)} className="text-green-600 border-2 border-green-200 bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition font-medium">{t('activate')}</button>
                    )}
                    <button onClick={() => handleResetPassword(selectedCustomer._id)} className="ml-3 text-[#7b481c] border-2 border-[#d79e27] bg-[#fbf8eb] px-4 py-2 rounded-lg hover:bg-[#f5eecc] transition font-medium">Reset Password</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="space-y-2 text-[#bc7b1f]">
                    <p><strong className="text-[#7b481c]">Email:</strong> {selectedCustomer.email}</p>
                    <p><strong className="text-[#7b481c]">WhatsApp:</strong> {selectedCustomer.whatsappNumber}</p>
                    <p><strong className="text-[#7b481c]">Mobile:</strong> {selectedCustomer.mobileNumber}</p>
                    <p><strong className="text-[#7b481c]">Address:</strong> {selectedCustomer.permanentAddress}</p>
                  </div>
                  <div className="space-y-2 text-[#bc7b1f]">
                    <p><strong className="text-[#7b481c]">Aadhaar:</strong> {selectedCustomer.aadhaar}</p>
                    <p><strong className="text-[#7b481c]">PAN:</strong> {selectedCustomer.pan}</p>
                    
                    {/* CIBIL Score Display */}
                    <div className="mt-4 p-4 rounded-xl border border-gray-100 bg-[#fbf8eb] flex flex-col justify-center items-center">
                      <h4 className="text-sm font-bold text-[#d79e27] uppercase tracking-wider mb-2">CIBIL Score</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-[#7b481c]">{selectedCustomer.cibilScore || 600}</span>
                        {(() => {
                          const score = selectedCustomer.cibilScore || 600;
                          if (score <= 300) return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase tracking-wider">Bad</span>;
                          if (score <= 500) return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wider">Moderate</span>;
                          if (score <= 700) return <span className="px-3 py-1 bg-[#f5eecc] text-[#7b481c] rounded-full text-xs font-bold uppercase tracking-wider">Good</span>;
                          return <span className="px-3 py-1 bg-[#f5eecc] text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">Excellent</span>;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* EDIT CUSTOMER TOGGLE */}
            <div className="mt-6 flex justify-end mb-6">
              {!isEditingCustomer ? (
                <button 
                  onClick={() => {
                    setEditCustomerData({
                      name: selectedCustomer.name,
                      whatsappNumber: selectedCustomer.whatsappNumber,
                      mobileNumber: selectedCustomer.mobileNumber,
                      email: selectedCustomer.email,
                      aadhaar: selectedCustomer.aadhaar,
                      voterId: selectedCustomer.voterId,
                      pan: selectedCustomer.pan,
                      maritalStatus: selectedCustomer.maritalStatus,
                      permanentAddress: selectedCustomer.permanentAddress,
                      cibilScore: selectedCustomer.cibilScore
                    });
                    setIsEditingCustomer(true);
                  }} 
                  className="bg-[#bc7b1f] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#965a1a] transition hover:-translate-y-1 shadow-md hover:shadow-lg"
                >
                  Edit Customer Details
                </button>
              ) : (
                <button onClick={() => setIsEditingCustomer(false)} className="bg-[#efdf9e] text-[#7b481c] px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition">
                  Cancel Edit
                </button>
              )}
            </div>

            {/* EDIT CUSTOMER FORM */}
            {isEditingCustomer && (
              <form onSubmit={handleEditCustomerSubmit} className="bg-[#fbf8eb]/50 p-6 rounded-xl border border-[#f5eecc] mb-8">
                <h4 className="text-xl font-bold text-[#7b481c] mb-4">Edit Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Full Name" value={editCustomerData.name} onChange={e => setEditCustomerData({...editCustomerData, name: e.target.value})} className="p-3 border rounded-lg" required />
                  <input type="email" placeholder="Email" value={editCustomerData.email} onChange={e => setEditCustomerData({...editCustomerData, email: e.target.value})} className="p-3 border rounded-lg" />
                  <input type="text" placeholder={t('mobile_number') || "Mobile Number"} value={editCustomerData.mobileNumber} onChange={e => setEditCustomerData({...editCustomerData, mobileNumber: e.target.value})} className="p-3 border rounded-lg" required />
                  <input type="text" placeholder="WhatsApp Number" value={editCustomerData.whatsappNumber} onChange={e => setEditCustomerData({...editCustomerData, whatsappNumber: e.target.value})} className="p-3 border rounded-lg" required />
                  <input type="text" placeholder="Aadhaar Number" value={editCustomerData.aadhaar} onChange={e => setEditCustomerData({...editCustomerData, aadhaar: e.target.value})} className="p-3 border rounded-lg" required />
                  <input type="text" placeholder="PAN Number" value={editCustomerData.pan} onChange={e => setEditCustomerData({...editCustomerData, pan: e.target.value})} className="p-3 border rounded-lg" required />
                                    <input type="text" placeholder="Voter ID" value={editCustomerData.voterId} onChange={e => setEditCustomerData({...editCustomerData, voterId: e.target.value})} className="p-3 border rounded-lg" />
                  <input type="number" placeholder="CIBIL Score" min="150" max="800" value={editCustomerData.cibilScore || ''} onChange={e => setEditCustomerData({...editCustomerData, cibilScore: e.target.value})} className="p-3 border rounded-lg" />
                  <select value={editCustomerData.maritalStatus} onChange={e => setEditCustomerData({...editCustomerData, maritalStatus: e.target.value})} className="p-3 border rounded-lg">
                    <option value="Unmarried">Unmarried</option>
                    <option value="Married">Married</option>
                  </select>
                  <textarea placeholder="Permanent Address" value={editCustomerData.permanentAddress} onChange={e => setEditCustomerData({...editCustomerData, permanentAddress: e.target.value})} className="p-3 border rounded-lg" rows="1" required></textarea>
                </div>
                
                <h4 className="text-lg font-bold text-[#7b481c] mt-6 mb-4">Update Documents (Optional - leave blank to keep existing)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col"><label className="text-sm font-medium text-[#965a1a]">Passport Photo</label><input type="file" name="photo" onChange={handleEditCustomerFileChange} accept=".jpg,.jpeg,.png" className="p-2 border rounded-lg bg-white" /></div>
                  <div className="flex flex-col"><label className="text-sm font-medium text-[#965a1a]">Aadhaar Doc</label><input type="file" name="aadhaarDoc" onChange={handleEditCustomerFileChange} accept=".jpg,.jpeg,.png" className="p-2 border rounded-lg bg-white" /></div>
                  <div className="flex flex-col"><label className="text-sm font-medium text-[#965a1a]">PAN Doc</label><input type="file" name="panDoc" onChange={handleEditCustomerFileChange} accept=".jpg,.jpeg,.png" className="p-2 border rounded-lg bg-white" /></div>
                  <div className="flex flex-col"><label className="text-sm font-medium text-[#965a1a]">Voter Doc</label><input type="file" name="voterIdDoc" onChange={handleEditCustomerFileChange} accept=".jpg,.jpeg,.png" className="p-2 border rounded-lg bg-white" /></div>
                </div>
                
                <button type="submit" disabled={loading} className="mt-6 w-full bg-[#bc7b1f] text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition hover:-translate-y-1 shadow-md hover:shadow-lg">
                  {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </form>
            )}

            {/* Document Links */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h4 className="text-lg font-bold text-[#7b481c] mb-4">Uploaded Documents</h4>
              <div className="flex flex-wrap gap-4">
                {selectedCustomer.photoUrl && (
                  <a href={selectedCustomer.photoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#fbf8eb] text-[#965a1a] px-4 py-2 rounded-lg hover:bg-[#f5eecc] transition font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                    Passport Photo
                  </a>
                )}
                {selectedCustomer.aadhaarDocUrl && (
                  <a href={selectedCustomer.aadhaarDocUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#fbf8eb] text-[#965a1a] px-4 py-2 rounded-lg hover:bg-[#f5eecc] transition font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                    Aadhaar Document
                  </a>
                )}
                {selectedCustomer.panDocUrl && (
                  <a href={selectedCustomer.panDocUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#fbf8eb] text-[#965a1a] px-4 py-2 rounded-lg hover:bg-[#f5eecc] transition font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                    PAN Document
                  </a>
                )}
                {selectedCustomer.voterIdDocUrl && (
                  <a href={selectedCustomer.voterIdDocUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#fbf8eb] text-[#965a1a] px-4 py-2 rounded-lg hover:bg-[#f5eecc] transition font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                    Voter Document
                  </a>
                )}
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-4">{t('loan_history')}</h3>
          {selectedCustomer.loansData?.length === 0 && <p className="text-[#d79e27]">{t('no_loan_history')}</p>}
          
          <div className="space-y-6">
            {selectedCustomer.loansData?.map(data => {
              const totalPaid = data.installments.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
              const isExpanded = expandedLoans[data.loan._id];
              return (
              <div key={data.loan._id} className="bg-white rounded border overflow-hidden shadow-sm">
                <div 
                  className="bg-[#fbf8eb] p-4 border-b flex justify-between items-center cursor-pointer hover:bg-[#f5eecc] transition"
                  onClick={() => toggleLoan(data.loan._id)}
                >
                  <div>
                    <h4 className="font-bold text-[#7b481c] flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      Loan: ₹{data.loan.approvedAmount}
                    </h4>
                    <p className="text-sm text-[#bc7b1f] ml-7">
                      Start Date: {new Date(data.loan.startDate).toLocaleDateString()} | Duration: {data.loan.duration} | Status: {data.loan.status}
                    </p>
                    <p className="text-sm font-bold text-green-700 ml-7 mt-1">Total Paid So Far: ₹{totalPaid}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-sm font-medium">{data.loan.completedInstallments} / {data.loan.totalInstallments} Paid</p>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleDownloadLoanPDF(data, selectedCustomer)}
                        className="text-xs bg-[#bc7b1f] text-white px-2 py-1 rounded hover:bg-[#965a1a] transition hover:-translate-y-1 shadow-md hover:shadow-lg"
                      >
                        Download PDF
                      </button>
                      <button 
                        onClick={() => handleDeleteLoan(data, selectedCustomer)}
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-[#f5eecc]">
                    <tr>
                      <th className="px-4 py-2 text-left text-[#bc7b1f]">Due Date</th>
                      <th className="px-4 py-2 text-left text-[#bc7b1f]">Amount</th>
                      <th className="px-4 py-2 text-left text-[#bc7b1f]">Fine</th>
                      <th className="px-4 py-2 text-left text-[#bc7b1f]">Status</th>
                      <th className="px-4 py-2 text-left text-[#bc7b1f]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.installments.map(inst => (
                      <tr key={inst._id}>
                        <td className="px-4 py-2">{new Date(inst.dueDate).toLocaleDateString()}</td>
                        <td className="px-4 py-2">₹{inst.amount}</td>
                        <td className="px-4 py-2 text-red-600">{inst.fine > 0 ? `₹${inst.fine}` : '-'}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            inst.status === 'PAID' ? 'bg-green-100 text-green-800' :
                            inst.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {inst.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {inst.status !== 'PAID' && (
                            <button 
                              onClick={() => handleMarkPaid(inst._id)}
                              className="text-[#bc7b1f] hover:underline font-medium"
                            >
                              Mark Paid
                            </button>
                          )}
                          {inst.status === 'PAID' && (
                            <div className="flex items-center gap-3">
                              <span className="text-[#d79e27]">Paid on {new Date(inst.paymentDate).toLocaleDateString()}</span>
                              <button 
                                onClick={() => handleDownloadReceipt(inst, data, selectedCustomer)}
                                className="text-xs bg-[#fbf8eb] text-[#bc7b1f] border border-[#bc7b1f] px-2 py-1 rounded hover:bg-[#f5eecc] transition flex items-center gap-1 font-medium shadow-sm hover:shadow"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Receipt
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                )}
              </div>
            );
            })}
          </div>
        </div>
      )}

      {/* LOAN APPROVAL MODAL */}
      {selectedLoanRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#fbf8eb] rounded-xl shadow-lg border border-[#e1b73e]-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">{t('configure_loan_schedule')}</h3>
            <p className="mb-4 text-[#bc7b1f]">
              {t('requested')}: ₹{selectedLoanRequest.requestedAmount} for {selectedLoanRequest.requestedDuration}
            </p>
            
            <form onSubmit={handleApproveLoan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#965a1a]">{t('approved_amount')}</label>
                  <input type="number" required value={loanConfig.approvedAmount} onChange={e => setLoanConfig({...loanConfig, approvedAmount: e.target.value})} className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#965a1a]">{t('final_duration')}</label>
                  <input type="text" required value={loanConfig.duration} onChange={e => handleDurationChange(e.target.value)} placeholder="e.g. 6 months" className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#965a1a]">{t('installment_amount')}</label>
                  <input type="number" required value={loanConfig.installmentAmount} onChange={e => setLoanConfig({...loanConfig, installmentAmount: e.target.value})} className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#965a1a]">{t('frequency')}</label>
                  <select required value={loanConfig.installmentFrequency} onChange={e => handleDatesChange('installmentFrequency', e.target.value)} className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]">
                    <option value="Monthly">{t('monthly')}</option>
                    <option value="Weekly">{t('weekly')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#965a1a]">{t('start_date')}</label>
                  <input type="date" required value={loanConfig.startDate} onChange={e => handleDatesChange('startDate', e.target.value)} className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#965a1a]">{t('completion_date')}</label>
                  <input type="date" required value={loanConfig.completionDate} onChange={e => handleDatesChange('completionDate', e.target.value)} className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setSelectedLoanRequest(null)} className="px-4 py-2 text-[#bc7b1f]">{t('cancel')}</button>
                <button type="submit" className="bg-[#bc7b1f] text-white px-4 py-2 rounded hover:bg-emerald-700">{t('generate_approve')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER TAB */}
      {activeTab === 'add-customer' && (
        <div className="bg-white p-6 rounded shadow border max-w-4xl">
          <h2 className="text-xl font-bold mb-6">{t('register_new_customer')}</h2>
          <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#965a1a]">{t('full_name')}</label>
                <input type="text" required value={addCustomerData.name} onChange={e => setAddCustomerData({...addCustomerData, name: e.target.value})} className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#965a1a]">{t('email_address')} (Optional)</label>
                <input type="email" value={addCustomerData.email} onChange={e => setAddCustomerData({...addCustomerData, email: e.target.value})} pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$" className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#965a1a]">{t('whatsapp_number')}</label>
                <input type="text" required value={addCustomerData.whatsappNumber} onChange={e => setAddCustomerData({...addCustomerData, whatsappNumber: e.target.value})} maxLength="10" minLength="10" pattern="\d{10}" title="Must be exactly 10 digits" className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#965a1a]">{t('mobile_number') || "Mobile Number"}</label>
                <input type="text" required value={addCustomerData.mobileNumber} onChange={e => setAddCustomerData({...addCustomerData, mobileNumber: e.target.value})} maxLength="10" minLength="10" pattern="\d{10}" title="Must be exactly 10 digits" className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#965a1a]">{t('aadhaar_number')}</label>
                <input type="text" required value={addCustomerData.aadhaar} onChange={e => setAddCustomerData({...addCustomerData, aadhaar: e.target.value})} maxLength="12" minLength="12" pattern="\d{12}" title="Must be exactly 12 digits" className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#965a1a]">{t('pan_number')}</label>
                <input type="text" required value={addCustomerData.pan} onChange={e => setAddCustomerData({...addCustomerData, pan: e.target.value})} maxLength="10" minLength="10" pattern="[a-zA-Z0-9]{10}" title="Must be exactly 10 alphanumeric characters" className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f] uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#965a1a]">{t('voter_id')} (Optional)</label>
                <input type="text" value={addCustomerData.voterId} onChange={e => setAddCustomerData({...addCustomerData, voterId: e.target.value})} className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#965a1a]">{t('marital_status')}</label>
                <select required value={addCustomerData.maritalStatus} onChange={e => setAddCustomerData({...addCustomerData, maritalStatus: e.target.value})} className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]">
                  <option value="Unmarried">{t('unmarried')}</option>
                  <option value="Married">{t('married')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#965a1a]">{t('permanent_address')}</label>
              <textarea required value={addCustomerData.permanentAddress} onChange={e => setAddCustomerData({...addCustomerData, permanentAddress: e.target.value})} className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]"></textarea>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-4">
               <div>
                  <label className="block text-sm font-medium text-[#965a1a]">{t('set_initial_password')}</label>
                  <input type="text" required minLength="6" value={addCustomerData.password} onChange={e => setAddCustomerData({...addCustomerData, password: e.target.value})} placeholder="e.g. password123" className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6 mt-6">
              <div className="border-2 border-dashed border-[#d79e27] p-4 rounded-lg text-center hover:bg-[#fbf8eb] transition relative">
                <label className="cursor-pointer block">
                  <span className="block text-sm font-bold text-[#965a1a] mb-1">{t('passport_photo')} (Optional)</span>
                  <span className="block text-xs text-[#d79e27] mb-2">JPG, PNG (Max 150KB)</span>
                  <div className="bg-[#fbf8eb] text-[#bc7b1f] p-3 rounded mx-auto w-12 h-12 flex items-center justify-center mb-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <input type="file" name="photo" onChange={handleAddCustomerFileChange} accept=".jpg,.jpeg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <span className="text-sm font-medium text-[#bc7b1f]">{addCustomerFiles.photo ? addCustomerFiles.photo.name : 'Click to Upload'}</span>
                </label>
              </div>

              <div className="border-2 border-dashed border-[#d79e27] p-4 rounded-lg text-center hover:bg-[#fbf8eb] transition relative">
                <label className="cursor-pointer block">
                  <span className="block text-sm font-bold text-[#965a1a] mb-1">{t('aadhaar_document')} (Optional)</span>
                  <span className="block text-xs text-[#d79e27] mb-2">JPG, PNG (Max 150KB)</span>
                  <div className="bg-[#fbf8eb] text-[#bc7b1f] p-3 rounded mx-auto w-12 h-12 flex items-center justify-center mb-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                  <input type="file" name="aadhaarDoc" onChange={handleAddCustomerFileChange} accept=".jpg,.jpeg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <span className="text-sm font-medium text-[#bc7b1f]">{addCustomerFiles.aadhaarDoc ? addCustomerFiles.aadhaarDoc.name : 'Click to Upload'}</span>
                </label>
              </div>

              <div className="border-2 border-dashed border-[#d79e27] p-4 rounded-lg text-center hover:bg-[#fbf8eb] transition relative">
                <label className="cursor-pointer block">
                  <span className="block text-sm font-bold text-[#965a1a] mb-1">{t('pan_document')} (Optional)</span>
                  <span className="block text-xs text-[#d79e27] mb-2">JPG, PNG (Max 150KB)</span>
                  <div className="bg-[#fbf8eb] text-[#bc7b1f] p-3 rounded mx-auto w-12 h-12 flex items-center justify-center mb-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                  <input type="file" name="panDoc" onChange={handleAddCustomerFileChange} accept=".jpg,.jpeg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <span className="text-sm font-medium text-[#bc7b1f]">{addCustomerFiles.panDoc ? addCustomerFiles.panDoc.name : 'Click to Upload'}</span>
                </label>
              </div>

              <div className="border-2 border-dashed border-[#d79e27] p-4 rounded-lg text-center hover:bg-[#fbf8eb] transition relative">
                <label className="cursor-pointer block">
                  <span className="block text-sm font-bold text-[#965a1a] mb-1">{t('voter_document')} (Optional)</span>
                  <span className="block text-xs text-[#d79e27] mb-2">JPG, PNG (Max 150KB)</span>
                  <div className="bg-[#fbf8eb] text-[#bc7b1f] p-3 rounded mx-auto w-12 h-12 flex items-center justify-center mb-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <input type="file" name="voterIdDoc" onChange={handleAddCustomerFileChange} accept=".jpg,.jpeg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <span className="text-sm font-medium text-[#bc7b1f]">{addCustomerFiles.voterIdDoc ? addCustomerFiles.voterIdDoc.name : 'Click to Upload'}</span>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="mt-4 bg-[#bc7b1f] text-white px-4 py-2 rounded hover:bg-emerald-700">
              {loading ? t('submitting') : t('register_new_customer')}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;

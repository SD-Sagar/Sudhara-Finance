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
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals / Selected Items
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedLoanRequest, setSelectedLoanRequest] = useState(null);
  
  // Customer Search
  const [searchQuery, setSearchQuery] = useState('');

  // Add Customer State
  const [addCustomerData, setAddCustomerData] = useState({
    name: '', bankAccountNumber: '', whatsappNumber: '', email: '',
    aadhaar: '', voterId: '', pan: '', maritalStatus: 'Unmarried', permanentAddress: '', password: ''
  });
  const [addCustomerPhoto, setAddCustomerPhoto] = useState(null);
  
  // Loan Config State
  const [loanConfig, setLoanConfig] = useState({
    approvedAmount: '',
    duration: '',
    installmentAmount: '',
    installmentFrequency: 'Monthly', // 'Monthly' or 'Weekly'
    startDate: new Date().toISOString().split('T')[0],
    completionDate: ''
  });

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

  useEffect(() => {
    fetchData();
    setSelectedCustomer(null);
  }, [activeTab]);

  // Actions - Registrations
  const handleApproveRegistration = async (id) => {
    const password = prompt('Create a password for this customer:');
    if (!password) {
        alert('Approval cancelled. Password is required.');
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
    const paymentMethod = prompt('Enter payment method (Cash or Online):', 'Cash');
    if (!paymentMethod || !['Cash', 'Online'].includes(paymentMethod)) {
      alert('Invalid payment method. Cancelled.');
      return;
    }
    
    try {
      await api.put(`/api/installments/${installmentId}/pay`, { paymentMethod });
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

  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!addCustomerPhoto) {
      alert("Photograph is required");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    Object.keys(addCustomerData).forEach(key => formData.append(key, addCustomerData[key]));
    formData.append('photo', addCustomerPhoto);

    try {
      await api.post('/api/customers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Customer created successfully and credentials sent to customer email.');
      setAddCustomerData({
        name: '', bankAccountNumber: '', whatsappNumber: '', email: '',
        aadhaar: '', voterId: '', pan: '', maritalStatus: 'Unmarried', permanentAddress: '', password: ''
      });
      setAddCustomerPhoto(null);
      setActiveTab('customers');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding customer');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLoanPDF = (loanData, customer) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text(`Loan History - Sudhara Finance`, 14, 20);
    
    // Customer Info
    doc.setFontSize(12);
    doc.text(`Customer Name: ${customer.name}`, 14, 30);
    doc.text(`Customer ID: ${customer.customerId}`, 14, 37);
    
    // Loan Info
    doc.text(`Loan Amount: Rs. ${loanData.loan.approvedAmount}`, 14, 47);
    doc.text(`Duration: ${loanData.loan.duration}`, 14, 54);
    doc.text(`Status: ${loanData.loan.status}`, 14, 61);

    // Table Data
    const tableColumn = ["Due Date", "Amount (Rs)", "Fine (Rs)", "Status", "Payment Date"];
    const tableRows = [];

    loanData.installments.forEach(inst => {
      const rowData = [
        new Date(inst.dueDate).toLocaleDateString(),
        inst.amount,
        inst.fine,
        inst.status,
        inst.paymentDate ? new Date(inst.paymentDate).toLocaleDateString() : '-'
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 70,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [16, 185, 129] } // emerald-500 equivalent
    });

    doc.save(`Loan_${customer.customerId}_${loanData.loan._id.substring(0, 6)}.pdf`);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.customerId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('admin_dashboard')}</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto">
        {['registrations', 'loans', 'customers', 'add_customer'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab === 'add_customer' ? 'add-customer' : tab)}
            className={`pb-2 px-4 font-medium capitalize whitespace-nowrap ${
              (activeTab === tab || (activeTab === 'add-customer' && tab === 'add_customer')) 
                ? 'text-emerald-600 border-b-2 border-emerald-600' 
                : 'text-gray-500 hover:text-gray-700'
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
        <div className="space-y-4">
          {registrations.length === 0 && <p className="text-gray-500">{t('no_pending_registrations')}</p>}
          {registrations.map(req => (
            <div key={req._id} className="bg-white p-6 rounded shadow border">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-xl font-bold">{req.name}</h3>
                  <p className="text-gray-600">{t('email')}: {req.email} | {t('whatsapp_number')}: {req.whatsappNumber}</p>
                  <p className="text-gray-600">{t('aadhaar_number')}: {req.aadhaar} | {t('pan_number')}: {req.pan}</p>
                  <a href={req.photoUrl} target="_blank" rel="noreferrer" className="text-blue-500 text-sm hover:underline">{t('view_photo')}</a>
                </div>
                <div className="flex gap-2 items-start">
                  <button onClick={() => handleApproveRegistration(req._id)} className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700">{t('approve')}</button>
                  <button onClick={() => handleRejectRegistration(req._id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">{t('reject')}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOANS TAB */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          {loanRequests.length === 0 && <p className="text-gray-500">{t('no_pending_loans')}</p>}
          {loanRequests.map(req => (
            <div key={req._id} className="bg-white p-6 rounded shadow border">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {t('customer')}: {req.customer?.name} ({req.customer?.customerId})
                  </h3>
                  <p className="text-gray-600">{t('requested')}: ₹{req.requestedAmount} for {req.requestedDuration}</p>
                  <p className="text-gray-600">{t('reason')}: {req.reason}</p>
                  <p className="text-sm text-gray-400">{t('date')}: {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
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
                    className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
                  >
                    {t('configure_approve')}
                  </button>
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
              className="w-full md:w-1/2 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-emerald-500"
            />
          </div>
          {filteredCustomers.length === 0 && <p className="text-gray-500">{t('no_customers_found')}</p>}
          {filteredCustomers.map(c => (
            <div key={c._id} className="bg-white p-4 rounded shadow border flex justify-between items-center hover:bg-gray-50 transition cursor-pointer" onClick={() => viewCustomerProfile(c._id)}>
              <div>
                <span className="font-bold text-gray-800">{c.customerId}</span>
                <span className="ml-4 text-gray-700">{c.name}</span>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* CUSTOMER PROFILE VIEW */}
      {selectedCustomer && (
        <div>
          <button onClick={() => setSelectedCustomer(null)} className="mb-4 text-blue-600 hover:underline">
            &larr; Back to Customers List
          </button>
          
          <div className="bg-white p-6 rounded shadow border mb-6">
            <div className="flex justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedCustomer.name} <span className="text-gray-500 text-lg">({selectedCustomer.customerId})</span></h2>
                <p className="text-gray-600 mt-2">Email: {selectedCustomer.email} | WhatsApp: {selectedCustomer.whatsappNumber}</p>
                <p className="text-gray-600">Aadhaar: {selectedCustomer.aadhaar} | PAN: {selectedCustomer.pan}</p>
                <p className="text-gray-600">Address: {selectedCustomer.permanentAddress}</p>
                <p className="text-gray-600 font-medium mt-2">Login Password: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">{selectedCustomer.plainPassword}</span></p>
                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${selectedCustomer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {t('account_status')}: {selectedCustomer.status}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {selectedCustomer.status === 'ACTIVE' ? (
                   <button onClick={() => handleToggleCustomerStatus(selectedCustomer._id, selectedCustomer.status)} className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-50">{t('deactivate')}</button>
                ) : (
                   <button onClick={() => handleToggleCustomerStatus(selectedCustomer._id, selectedCustomer.status)} className="text-green-600 border border-green-600 px-3 py-1 rounded hover:bg-green-50">{t('activate')}</button>
                )}
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-4">{t('loan_history')}</h3>
          {selectedCustomer.loansData?.length === 0 && <p className="text-gray-500">{t('no_loan_history')}</p>}
          
          <div className="space-y-6">
            {selectedCustomer.loansData?.map(data => (
              <div key={data.loan._id} className="bg-white rounded border overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-4 border-b flex justify-between">
                  <div>
                    <h4 className="font-bold">Loan: ₹{data.loan.approvedAmount}</h4>
                    <p className="text-sm text-gray-600">Duration: {data.loan.duration} | Status: {data.loan.status}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-sm font-medium">{data.loan.completedInstallments} / {data.loan.totalInstallments} Paid</p>
                    <button 
                      onClick={() => handleDownloadLoanPDF(data, selectedCustomer)}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
                
                <table className="min-w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-600">Due Date</th>
                      <th className="px-4 py-2 text-left text-gray-600">Amount</th>
                      <th className="px-4 py-2 text-left text-gray-600">Fine</th>
                      <th className="px-4 py-2 text-left text-gray-600">Status</th>
                      <th className="px-4 py-2 text-left text-gray-600">Action</th>
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
                              className="text-emerald-600 hover:underline font-medium"
                            >
                              Mark Paid
                            </button>
                          )}
                          {inst.status === 'PAID' && (
                            <span className="text-gray-500">Paid on {new Date(inst.paymentDate).toLocaleDateString()}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOAN APPROVAL MODAL */}
      {selectedLoanRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">{t('configure_loan_schedule')}</h3>
            <p className="mb-4 text-gray-600">
              {t('requested')}: ₹{selectedLoanRequest.requestedAmount} for {selectedLoanRequest.requestedDuration}
            </p>
            
            <form onSubmit={handleApproveLoan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('approved_amount')}</label>
                  <input type="number" required value={loanConfig.approvedAmount} onChange={e => setLoanConfig({...loanConfig, approvedAmount: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('final_duration')}</label>
                  <input type="text" required value={loanConfig.duration} onChange={e => setLoanConfig({...loanConfig, duration: e.target.value})} placeholder="e.g. 6 months" className="mt-1 w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('installment_amount')}</label>
                  <input type="number" required value={loanConfig.installmentAmount} onChange={e => setLoanConfig({...loanConfig, installmentAmount: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('frequency')}</label>
                  <select required value={loanConfig.installmentFrequency} onChange={e => setLoanConfig({...loanConfig, installmentFrequency: e.target.value})} className="mt-1 w-full border rounded px-3 py-2">
                    <option value="Monthly">{t('monthly')}</option>
                    <option value="Weekly">{t('weekly')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('start_date')}</label>
                  <input type="date" required value={loanConfig.startDate} onChange={e => setLoanConfig({...loanConfig, startDate: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('completion_date')}</label>
                  <input type="date" required value={loanConfig.completionDate} onChange={e => setLoanConfig({...loanConfig, completionDate: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setSelectedLoanRequest(null)} className="px-4 py-2 text-gray-600">{t('cancel')}</button>
                <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">{t('generate_approve')}</button>
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
                <label className="block text-sm font-medium text-gray-700">{t('full_name')}</label>
                <input type="text" required value={addCustomerData.name} onChange={e => setAddCustomerData({...addCustomerData, name: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('email_address')}</label>
                <input type="email" required value={addCustomerData.email} onChange={e => setAddCustomerData({...addCustomerData, email: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('whatsapp_number')}</label>
                <input type="text" required value={addCustomerData.whatsappNumber} onChange={e => setAddCustomerData({...addCustomerData, whatsappNumber: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('bank_account_number')}</label>
                <input type="text" required value={addCustomerData.bankAccountNumber} onChange={e => setAddCustomerData({...addCustomerData, bankAccountNumber: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('aadhaar_number')}</label>
                <input type="text" required value={addCustomerData.aadhaar} onChange={e => setAddCustomerData({...addCustomerData, aadhaar: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('pan_number')}</label>
                <input type="text" required value={addCustomerData.pan} onChange={e => setAddCustomerData({...addCustomerData, pan: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('voter_id')}</label>
                <input type="text" required value={addCustomerData.voterId} onChange={e => setAddCustomerData({...addCustomerData, voterId: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('marital_status')}</label>
                <select required value={addCustomerData.maritalStatus} onChange={e => setAddCustomerData({...addCustomerData, maritalStatus: e.target.value})} className="mt-1 w-full border rounded px-3 py-2">
                  <option value="Unmarried">{t('unmarried')}</option>
                  <option value="Married">{t('married')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('permanent_address')}</label>
              <textarea required value={addCustomerData.permanentAddress} onChange={e => setAddCustomerData({...addCustomerData, permanentAddress: e.target.value})} className="mt-1 w-full border rounded px-3 py-2"></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700">{t('set_initial_password')}</label>
                  <input type="text" required value={addCustomerData.password} onChange={e => setAddCustomerData({...addCustomerData, password: e.target.value})} placeholder="e.g. password123" className="mt-1 w-full border rounded px-3 py-2" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700">{t('passport_photo')}</label>
                  <input type="file" required onChange={e => setAddCustomerPhoto(e.target.files[0])} accept="image/*" className="mt-1 w-full text-sm" />
               </div>
            </div>

            <button type="submit" disabled={loading} className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">
              {loading ? t('submitting') : t('register_new_customer')}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;

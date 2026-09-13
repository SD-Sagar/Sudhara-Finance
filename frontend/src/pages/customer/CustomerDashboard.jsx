import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import { useLanguage } from '../../contexts/LanguageContext';

const CustomerDashboard = () => {
  const { t } = useLanguage();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanRequestData, setLoanRequestData] = useState({
    requestedAmount: '',
    reason: '',
    loanType: 'months', // 'months' or 'weeks'
    durationValue: '6' // default
  });
  const [requestStatus, setRequestStatus] = useState('');

  const [expandedLoans, setExpandedLoans] = useState({});

  const toggleLoan = (loanId) => {
    setExpandedLoans(prev => ({
      ...prev,
      [loanId]: !prev[loanId]
    }));
  };

  const getNextDueDate = (installments) => {
    const nextInst = installments.find(i => i.status === 'PENDING' || i.status === 'OVERDUE');
    if (nextInst) return new Date(nextInst.dueDate).toLocaleDateString();
    return t('all_paid');
  };

  const fetchLoans = async () => {
    try {
      // Get loans
      const { data } = await api.get('/api/loans/myloans');
      // For each loan, fetch details (installments)
      const loansWithDetails = await Promise.all(
        data.map(async (loan) => {
          const res = await api.get(`/api/loans/${loan._id}`);
          return res.data;
        })
      );
      setLoans(loansWithDetails);
    } catch (err) {
      setError('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleLoanRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestStatus('submitting');
    try {
      const duration = `${loanRequestData.durationValue} ${loanRequestData.loanType}`;
      await api.post('/api/loans/request', {
        requestedAmount: loanRequestData.requestedAmount,
        reason: loanRequestData.reason,
        requestedDuration: duration
      });
      setRequestStatus('success');
    } catch (err) {
      setRequestStatus(err.response?.data?.message || 'Failed to request loan');
    }
  };

  const handlePaymentContact = (installmentId) => {
    alert(`Please contact the administrator and provide your Customer ID to verify and process payment for installment.`);
  };

  if (loading) return <div className="text-center p-8">Loading dashboard...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t('my_dashboard')}</h1>
        <button 
          onClick={() => setShowLoanModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {t('request_loan')}
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}

      {loans.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500 text-lg">
          {t('no_loan_history')}
        </div>
      ) : (
        <div className="space-y-8">
          {loans.map(({ loan, installments }) => (
            <div key={loan._id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <div 
                className="p-6 bg-blue-50 hover:bg-blue-100 cursor-pointer transition flex flex-wrap justify-between items-center gap-4"
                onClick={() => toggleLoan(loan._id)}
              >
                <div>
                  <h3 className="text-xl font-bold text-blue-900">{t('loan')}: ₹{loan.approvedAmount}</h3>
                  <p className="text-gray-600 font-medium">{t('next_due')}: <span className="text-red-600">{getNextDueDate(installments)}</span></p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      loan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'
                    }`}>
                      {loan.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-2">
                      {loan.completedInstallments} / {loan.totalInstallments} Paid
                    </p>
                  </div>
                  <div className="text-blue-500">
                    {expandedLoans[loan._id] ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    )}
                  </div>
                </div>
              </div>
              
              {expandedLoans[loan._id] && (
              <div className="p-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-4">{t('installment_schedule')}</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('due_date')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('amount')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('fine')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('action')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {installments.map(inst => (
                        <tr key={inst._id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{new Date(inst.dueDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">₹{inst.amount}</td>
                          <td className="px-4 py-3 text-sm text-red-600">{inst.fine > 0 ? `₹${inst.fine}` : '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              inst.status === 'PAID' ? 'bg-green-100 text-green-800' :
                              inst.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {inst.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {inst.status !== 'PAID' && (
                              <button 
                                onClick={() => handlePaymentContact(inst._id)}
                                className="text-blue-600 hover:text-blue-900 font-medium"
                              >
                                {t('pay_contact_admin')}
                              </button>
                            )}
                            {inst.status === 'PAID' && (
                              <span className="text-green-600 font-medium">{t('paid_on')} {new Date(inst.paymentDate).toLocaleDateString()}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Loan Request Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">{t('request_new_loan')}</h3>
            
            {requestStatus === 'success' ? (
              <div className="text-center">
                <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
                  Request received. You will receive confirmation through email and WhatsApp.
                </div>
                <button 
                  onClick={() => { setShowLoanModal(false); setRequestStatus(''); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleLoanRequestSubmit}>
                {requestStatus && requestStatus !== 'submitting' && (
                  <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{requestStatus}</div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('requested_amount')} (₹)</label>
                    <input 
                      type="number" 
                      required 
                      min="1000"
                      className="mt-1 w-full border rounded px-3 py-2"
                      value={loanRequestData.requestedAmount}
                      onChange={e => setLoanRequestData({...loanRequestData, requestedAmount: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('reason_for_loan')}</label>
                    <textarea 
                      required 
                      className="mt-1 w-full border rounded px-3 py-2"
                      value={loanRequestData.reason}
                      onChange={e => setLoanRequestData({...loanRequestData, reason: e.target.value})}
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('duration_type')}</label>
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="loanType" 
                          value="months" 
                          checked={loanRequestData.loanType === 'months'}
                          onChange={() => setLoanRequestData({...loanRequestData, loanType: 'months', durationValue: '6'})}
                        /> 
                        {t('months')}
                      </label>
                      <label className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="loanType" 
                          value="weeks" 
                          checked={loanRequestData.loanType === 'weeks'}
                          onChange={() => setLoanRequestData({...loanRequestData, loanType: 'weeks', durationValue: '24'})}
                        /> 
                        {t('weeks')}
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {loanRequestData.loanType === 'months' ? (
                        ['6', '12', '18', '24'].map(val => (
                          <label key={val} className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name="durationValue" 
                              value={val}
                              checked={loanRequestData.durationValue === val}
                              onChange={e => setLoanRequestData({...loanRequestData, durationValue: e.target.value})}
                            /> {val} {t('months')}
                          </label>
                        ))
                      ) : (
                        ['24', '48', '72', '96'].map(val => (
                          <label key={val} className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name="durationValue" 
                              value={val}
                              checked={loanRequestData.durationValue === val}
                              onChange={e => setLoanRequestData({...loanRequestData, durationValue: e.target.value})}
                            /> {val} {t('weeks')}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowLoanModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    type="submit" 
                    disabled={requestStatus === 'submitting'}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {t('submit_request')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import { useLanguage } from '../../contexts/LanguageContext';

const CustomerRegister = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    whatsappNumber: '',
    mobileNumber: '',
    email: '',
    aadhaar: '',
    voterId: '',
    pan: '',
    maritalStatus: 'Unmarried',
    permanentAddress: ''
  });
  const [files, setFiles] = useState({
    photo: null,
    aadhaarDoc: null,
    voterIdDoc: null,
    panDoc: null
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  
  // Terms and Conditions State
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 5; // 5px tolerance
    if (bottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleOpenTerms = (e) => {
    e.preventDefault();
    if (!files.photo) {
      setStatus({ type: 'error', message: 'Photograph is required' });
      return;
    }
    // Form is valid enough to show terms
    setShowTermsModal(true);
    setHasScrolledToBottom(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 150 * 1024) {
      alert(`${e.target.name} must be less than 150KB`);
      e.target.value = null; // reset
      return;
    }
    setFiles({ ...files, [e.target.name]: file });
  };

  const handleSubmit = async () => {
    setShowTermsModal(false);
    setLoading(true);
    setStatus({ type: '', message: '' });

    setLoading(true);
    setStatus({ type: '', message: '' });

    const submitData = new FormData();
    Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
    if (files.photo) submitData.append('photo', files.photo);
    if (files.aadhaarDoc) submitData.append('aadhaarDoc', files.aadhaarDoc);
    if (files.voterIdDoc) submitData.append('voterIdDoc', files.voterIdDoc);
    if (files.panDoc) submitData.append('panDoc', files.panDoc);

    try {
      await api.post('/api/registration', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus({ 
        type: 'success', 
        message: 'Request received. You will receive your password and login credentials through email and WhatsApp within 24 hours.' 
      });
      // Reset form
      setFormData({
        name: '', whatsappNumber: '', mobileNumber: '', email: '',
        aadhaar: '', voterId: '', pan: '', maritalStatus: 'Unmarried', permanentAddress: ''
      });
      // File inputs can't be easily reset without refs, but keeping it simple for prototype
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Registration failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-[#fbf8eb] p-8 rounded-xl border border-[#bc7b1f] shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-center text-[#673c1c] mb-6">{t('register_new_customer')}</h2>
      
      {status.message && (
        <div className={`p-4 rounded mb-6 text-center font-medium ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {status.message}
        </div>
      )}

      {!status.message || status.type === 'error' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#965a1a]">{t('full_name')}</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#965a1a]">{t('email_address')} (Optional)</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$" className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#965a1a]">{t('whatsapp_number')}</label>
              <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} required maxLength="10" minLength="10" pattern="\d{10}" title="Must be exactly 10 digits" className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f] focus:ring-2 focus:ring-[#fbf8eb]0 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#965a1a]">{t('mobile_number')}</label>
              <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} required maxLength="10" minLength="10" pattern="\d{10}" title="Must be exactly 10 digits" className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f] focus:ring-2 focus:ring-[#fbf8eb]0 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#965a1a]">{t('aadhaar_number')}</label>
              <input type="text" name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} required maxLength="12" minLength="12" pattern="\d{12}" title="Must be exactly 12 digits" className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#965a1a]">{t('pan_number')}</label>
              <input type="text" name="pan" value={formData.pan} onChange={handleInputChange} required maxLength="10" minLength="10" pattern="[a-zA-Z0-9]{10}" title="Must be exactly 10 alphanumeric characters" className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f] uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#965a1a]">{t('voter_id')} (Optional)</label>
              <input type="text" name="voterId" value={formData.voterId} onChange={handleInputChange} className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#965a1a]">{t('marital_status')}</label>
              <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]">
                <option value="Unmarried">{t('unmarried')}</option>
                <option value="Married">{t('married')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#965a1a]">{t('permanent_address')}</label>
            <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} required rows="3" className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6 mt-6">
            
            <div className="border-2 border-dashed border-[#d79e27] p-4 rounded-lg text-center hover:bg-[#fbf8eb] transition relative">
              <label className="cursor-pointer block">
                <span className="block text-sm font-bold text-[#965a1a] mb-1">{t('passport_photo')}*</span>
                <span className="block text-xs text-[#d79e27] mb-2">JPG, PNG (Max 150KB)</span>
                <div className="bg-[#fbf8eb] text-[#bc7b1f] p-3 rounded mx-auto w-12 h-12 flex items-center justify-center mb-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <input type="file" name="photo" onChange={handleFileChange} accept=".jpg,.jpeg,.png" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <span className="text-sm font-medium text-[#bc7b1f]">{files.photo ? files.photo.name : 'Click to Upload'}</span>
              </label>
            </div>

            <div className="border-2 border-dashed border-[#d79e27] p-4 rounded-lg text-center hover:bg-[#fbf8eb] transition relative">
              <label className="cursor-pointer block">
                <span className="block text-sm font-bold text-[#965a1a] mb-1">{t('aadhaar_document')}*</span>
                <span className="block text-xs text-[#d79e27] mb-2">JPG, PNG (Max 150KB)</span>
                <div className="bg-[#fbf8eb] text-[#bc7b1f] p-3 rounded mx-auto w-12 h-12 flex items-center justify-center mb-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <input type="file" name="aadhaarDoc" onChange={handleFileChange} accept=".jpg,.jpeg,.png" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <span className="text-sm font-medium text-[#bc7b1f]">{files.aadhaarDoc ? files.aadhaarDoc.name : 'Click to Upload'}</span>
              </label>
            </div>

            <div className="border-2 border-dashed border-[#d79e27] p-4 rounded-lg text-center hover:bg-[#fbf8eb] transition relative">
              <label className="cursor-pointer block">
                <span className="block text-sm font-bold text-[#965a1a] mb-1">{t('pan_document')}*</span>
                <span className="block text-xs text-[#d79e27] mb-2">JPG, PNG (Max 150KB)</span>
                <div className="bg-[#fbf8eb] text-[#bc7b1f] p-3 rounded mx-auto w-12 h-12 flex items-center justify-center mb-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <input type="file" name="panDoc" onChange={handleFileChange} accept=".jpg,.jpeg,.png" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <span className="text-sm font-medium text-[#bc7b1f]">{files.panDoc ? files.panDoc.name : 'Click to Upload'}</span>
              </label>
            </div>

            <div className="border-2 border-dashed border-[#d79e27] p-4 rounded-lg text-center hover:bg-[#fbf8eb] transition relative">
              <label className="cursor-pointer block">
                <span className="block text-sm font-bold text-[#965a1a] mb-1">{t('voter_document')}</span>
                <span className="block text-xs text-[#d79e27] mb-2">JPG, PNG (Max 150KB)</span>
                <div className="bg-[#fbf8eb] text-[#bc7b1f] p-3 rounded mx-auto w-12 h-12 flex items-center justify-center mb-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <input type="file" name="voterIdDoc" onChange={handleFileChange} accept=".jpg,.jpeg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <span className="text-sm font-medium text-[#bc7b1f]">{files.voterIdDoc ? files.voterIdDoc.name : 'Click to Upload'}</span>
              </label>
            </div>

          </div>

          <button 
            type="button" 
            onClick={handleOpenTerms}
            disabled={loading}
            className="w-full mt-6 bg-[#bc7b1f] text-white font-medium py-3 rounded hover:bg-[#965a1a] transition hover:-translate-y-1 shadow-md hover:shadow-lg disabled:bg-blue-400"
          >
            {loading ? t('submitting') : 'Continue to Terms & Conditions'}
          </button>
        </form>
      ) : null}

      <div className="mt-6 text-center text-[#bc7b1f]">
        <Link to="/customer/login" className="text-[#bc7b1f] hover:underline">Back to Login</Link>
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#fbf8eb] rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border-2 border-[#bc7b1f]">
            
            <div className="p-6 bg-[#673c1c] text-[#fbf8eb] flex justify-between items-center">
              <h3 className="text-xl md:text-2xl font-bold">Terms and Conditions</h3>
              <button onClick={() => setShowTermsModal(false)} className="text-[#f5eecc] hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div 
              className="p-6 overflow-y-auto flex-grow bg-white text-[#673c1c] leading-relaxed relative"
              onScroll={handleScroll}
            >
              <div className="sticky top-0 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded shadow-sm text-sm font-medium mb-4 z-10 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                Please read full thing and scroll to the bottom to agree before proceeding.
              </div>

              <h4 className="font-bold text-lg mb-2 text-[#bc7b1f]">1. Introduction</h4>
              <p className="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              
              <h4 className="font-bold text-lg mb-2 text-[#bc7b1f]">2. Eligibility for Loans</h4>
              <p className="mb-4">Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula.</p>
              
              <h4 className="font-bold text-lg mb-2 text-[#bc7b1f]">3. Repayment Terms</h4>
              <p className="mb-4">Phasellus tristique libero vel justo aliquam pellentesque. Morbi egestas mattis placerat. Aenean hendrerit tristique congue. In hendrerit magna eu rhoncus fermentum. Integer consequat erat leo, eu ullamcorper justo faucibus in.</p>
              
              <h4 className="font-bold text-lg mb-2 text-[#bc7b1f]">4. Fines and Penalties</h4>
              <p className="mb-4">Fusce euismod consequat ante. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Pellentesque sed dui ut augue blandit vehicula. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh.</p>
              
              <h4 className="font-bold text-lg mb-2 text-[#bc7b1f]">5. Account Cancellation</h4>
              <p className="mb-4">Nam adipiscing. Vestibulum cursus interdum urna. Nullam hendrerit diam in magna. Praesent in arcu ac diam vulputate semper. Morbi eu mauris. Quisque sollicitudin elit eu odio. Aliquam hendrerit mi vel magna. Curabitur accumsan pretium dolor. Fusce nec enim tempor turpis vehicula congue.</p>
              
              <p className="font-bold mt-8 pb-4 text-center text-[#bc7b1f]">--- End of Terms ---</p>
            </div>

            <div className="p-6 bg-[#fbf8eb] border-t border-[#e1b73e] flex justify-end gap-4">
              <button 
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2 rounded border border-[#bc7b1f] text-[#673c1c] font-medium hover:bg-[#f5eecc] transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!hasScrolledToBottom}
                className={`px-8 py-2 rounded font-bold transition shadow-md ${hasScrolledToBottom ? 'bg-[#bc7b1f] text-white hover:bg-[#965a1a] hover:shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                I Agree & Register
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerRegister;

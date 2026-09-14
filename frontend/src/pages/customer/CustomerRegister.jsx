import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import { useLanguage } from '../../contexts/LanguageContext';

const CustomerRegister = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    bankAccountNumber: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.photo) {
      setStatus({ type: 'error', message: 'Photograph is required' });
      return;
    }

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
        name: '', bankAccountNumber: '', whatsappNumber: '', mobileNumber: '', email: '',
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
              <label className="block text-sm font-medium text-[#965a1a]">{t('email_address')}</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#965a1a]">{t('whatsapp_number')}</label>
              <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} required className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f] focus:ring-2 focus:ring-[#fbf8eb]0 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#965a1a]">{t('mobile_number')}</label>
              <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} required className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f] focus:ring-2 focus:ring-[#fbf8eb]0 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#965a1a]">{t('bank_account_number')}</label>
              <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleInputChange} required className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f] focus:ring-2 focus:ring-[#fbf8eb]0 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#965a1a]">{t('aadhaar_number')}</label>
              <input type="text" name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} required className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#965a1a]">{t('pan_number')}</label>
              <input type="text" name="pan" value={formData.pan} onChange={handleInputChange} required className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#965a1a]">{t('voter_id')}</label>
              <input type="text" name="voterId" value={formData.voterId} onChange={handleInputChange} required className="mt-1 w-full border border-[#d79e27] rounded-lg px-4 py-2 transition hover:border-[#bc7b1f]" />
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
                <span className="block text-sm font-bold text-[#965a1a] mb-1">{t('aadhaar_document')}</span>
                <span className="block text-xs text-[#d79e27] mb-2">JPG, PNG (Max 150KB)</span>
                <div className="bg-[#fbf8eb] text-[#bc7b1f] p-3 rounded mx-auto w-12 h-12 flex items-center justify-center mb-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <input type="file" name="aadhaarDoc" onChange={handleFileChange} accept=".jpg,.jpeg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <span className="text-sm font-medium text-[#bc7b1f]">{files.aadhaarDoc ? files.aadhaarDoc.name : 'Click to Upload'}</span>
              </label>
            </div>

            <div className="border-2 border-dashed border-[#d79e27] p-4 rounded-lg text-center hover:bg-[#fbf8eb] transition relative">
              <label className="cursor-pointer block">
                <span className="block text-sm font-bold text-[#965a1a] mb-1">{t('pan_document')}</span>
                <span className="block text-xs text-[#d79e27] mb-2">JPG, PNG (Max 150KB)</span>
                <div className="bg-[#fbf8eb] text-[#bc7b1f] p-3 rounded mx-auto w-12 h-12 flex items-center justify-center mb-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <input type="file" name="panDoc" onChange={handleFileChange} accept=".jpg,.jpeg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
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
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-[#bc7b1f] text-white font-medium py-3 rounded hover:bg-[#965a1a] transition hover:-translate-y-1 shadow-md hover:shadow-lg disabled:bg-blue-400"
          >
            {loading ? t('submitting') : t('register')}
          </button>
        </form>
      ) : null}

      <div className="mt-6 text-center text-[#bc7b1f]">
        <Link to="/customer/login" className="text-[#bc7b1f] hover:underline">Back to Login</Link>
      </div>
    </div>
  );
};

export default CustomerRegister;

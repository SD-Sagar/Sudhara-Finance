import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/axiosConfig';

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    bankAccountNumber: '',
    whatsappNumber: '',
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
        name: '', bankAccountNumber: '', whatsappNumber: '', email: '',
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
    <div className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-lg shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">Customer Registration</h2>
      
      {status.message && (
        <div className={`p-4 rounded mb-6 text-center font-medium ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {status.message}
        </div>
      )}

      {!status.message || status.type === 'error' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
              <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} required className="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Account Number</label>
              <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleInputChange} required className="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
              <input type="text" name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} required className="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PAN Number</label>
              <input type="text" name="pan" value={formData.pan} onChange={handleInputChange} required className="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Voter ID</label>
              <input type="text" name="voterId" value={formData.voterId} onChange={handleInputChange} required className="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Marital Status</label>
              <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="mt-1 w-full border rounded px-3 py-2">
                <option value="Unmarried">Unmarried</option>
                <option value="Married">Married</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Permanent Address</label>
            <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} required rows="3" className="mt-1 w-full border rounded px-3 py-2"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Self Photograph (Max 150KB)*</label>
              <input type="file" name="photo" onChange={handleFileChange} accept="image/*" required className="mt-1 w-full text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Aadhaar Document (Max 150KB)</label>
              <input type="file" name="aadhaarDoc" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="mt-1 w-full text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PAN Document (Max 150KB)</label>
              <input type="file" name="panDoc" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="mt-1 w-full text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Voter ID Document (Max 150KB)</label>
              <input type="file" name="voterIdDoc" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="mt-1 w-full text-sm" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-blue-600 text-white font-medium py-3 rounded hover:bg-blue-700 transition disabled:bg-blue-400"
          >
            {loading ? 'Submitting...' : 'Submit Registration Request'}
          </button>
        </form>
      ) : null}

      <div className="mt-6 text-center text-gray-600">
        <Link to="/customer/login" className="text-blue-600 hover:underline">Back to Login</Link>
      </div>
    </div>
  );
};

export default CustomerRegister;

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
              </div>\n              <h2 className="text-3xl font-bold text-[#673c1c] mt-8 mb-4 text-center">SHUDHARA WOMEN DEVELOPMENT ORGANIZATION</h2>
              <h2 className="text-3xl font-bold text-[#673c1c] mt-8 mb-4 text-center">LOAN TERMS & CONDITIONS</h2>
              <p className="mb-4">Effective Date: 15/09/2026</p>
              <p className="mb-4">Shudhara Women Development Organization (“the Organization”) provides financial assistance/loan facilities subject to the following terms and conditions. Applicants are required to read and understand these Terms & Conditions carefully before submitting a registration or loan application through the Organization's website or through any other application channel.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">1. Eligibility of Applicants</h2>
              <p className="mb-3 pl-4"><strong>1.1.</strong> The loan facility is available only to married women and married couples, subject to fulfillment of all other eligibility requirements.</p>
              <p className="mb-3 pl-4"><strong>1.2.</strong> Applicants must meet the minimum age requirements specified by the Organization and applicable law.</p>
              <p className="mb-3 pl-4"><strong>1.3.</strong> The Organization reserves the right to verify the applicant's identity, age, marital status, residential address, occupation, income, financial obligations, and other information provided in the application.</p>
              <p className="mb-3 pl-4"><strong>1.4.</strong> Submission of a customer registration through the Organization's website does not by itself establish eligibility for a loan or guarantee that a loan will be approved.</p>
              <p className="mb-3 pl-4"><strong>1.5.</strong> The Organization may approve, reject, request additional information for, or otherwise process a registration or loan application according to its applicable policies, verification procedures, and applicable law.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">2. Age Requirement</h2>
              <p className="mb-3 pl-4"><strong>2.1.</strong> Applicants must be 18 years of age or above to be considered for services provided by the Organization.</p>
              <p className="mb-3 pl-4"><strong>2.2.</strong> For loan approval and disbursement, the applicant must be 21 years of age or above, unless otherwise permitted by applicable law or the Organization's specific loan policy.</p>
              <p className="mb-3 pl-4"><strong>2.3.</strong> Valid government-issued identification and age proof may be required during the application and verification process.</p>
              <p className="mb-3 pl-4"><strong>2.4.</strong> Providing an incorrect date of birth, age, or identity information may result in rejection of the application or other action permitted under the applicable agreement and law.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">3. Criminal and Loan/Credit Background</h2>
              <p className="mb-3 pl-4"><strong>3.1.</strong> Every applicant must have a clear and satisfactory criminal background.</p>
              <p className="mb-3 pl-4"><strong>3.2.</strong> The applicant must also have a satisfactory loan/credit repayment history.</p>
              <p className="mb-3 pl-4"><strong>3.3.</strong> The Organization may conduct reasonable verification of the information provided by the applicant, including verification of existing or previous loans, repayment records, and other relevant financial information, subject to applicable law.</p>
              <p className="mb-3 pl-4"><strong>3.4.</strong> Providing false, misleading, incomplete, or fraudulent information may result in rejection of the application or cancellation of an approved loan.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">4. Existing Loans and Financial Obligations</h2>
              <p className="mb-3 pl-4"><strong>4.1.</strong> Applicants must disclose all existing loans, credit facilities, and other significant financial obligations held with banks, financial institutions, organizations, lenders, or other parties.</p>
              <p className="mb-3 pl-4"><strong>4.2.</strong> If an applicant already has an active loan or significant outstanding borrowing elsewhere, the Organization may decline to approve a new loan, depending on the applicant's repayment capacity and applicable lending rules.</p>
              <p className="mb-3 pl-4"><strong>4.3.</strong> The applicant must not conceal any existing loan or financial obligation for the purpose of obtaining approval.</p>
              <p className="mb-3 pl-4"><strong>4.4.</strong> Loan approval is subject to the Organization's assessment of the applicant's financial position and ability to repay.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">5. First-Time Loan Limit</h2>
              <p className="mb-3 pl-4"><strong>5.1.</strong> For a customer applying for a loan from the Organization for the first time, the maximum initial loan amount shall be ₹10,000 (Rupees Ten Thousand only), unless otherwise permitted under the Organization's approved policy.</p>
              <p className="mb-3 pl-4"><strong>5.2.</strong> A first-time applicant cannot demand or require a loan amount higher than the applicable first-loan limit.</p>
              <p className="mb-3 pl-4"><strong>5.3.</strong> The initial loan amount may be determined after considering the applicant's eligibility, repayment capacity, documentation, and verification results.</p>
              <p className="mb-3 pl-4"><strong>5.4.</strong> After successful repayment of the first loan and subject to the Organization's assessment, the applicant may become eligible to apply for a higher loan amount.</p>
              <p className="mb-3 pl-4"><strong>5.5.</strong> Approval of a higher loan amount is not automatic and remains at the discretion of the Organization, subject to applicable laws and regulations.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">6. Registration and Website Application Process</h2>
              <p className="mb-3 pl-4"><strong>6.1.</strong> The Organization may provide an online registration facility through its website for applicants who wish to become customers of the Organization.</p>
              <p className="mb-3 pl-4"><strong>6.2.</strong> During registration, applicants may be required to provide personal information and supporting documents, including name, contact information, residential address, identification information, photographs, marital status, and other information reasonably required by the Organization.</p>
              <p className="mb-3 pl-4"><strong>6.3.</strong> Applicants are responsible for ensuring that all information and documents submitted through the website are accurate, complete, valid, and belong to the applicant.</p>
              <p className="mb-3 pl-4"><strong>6.4.</strong> The Organization may review and verify registration requests before approving a customer account.</p>
              <p className="mb-3 pl-4"><strong>6.5.</strong> Registration through the website does not constitute loan approval, loan sanction, loan disbursement, or a promise that a loan will be provided.</p>
              <p className="mb-3 pl-4"><strong>6.6.</strong> The Organization may approve or reject a registration request after reviewing the information and documents submitted by the applicant.</p>
              <p className="mb-3 pl-4"><strong>6.7.</strong> Where registration is approved, the Organization may provide the customer with a unique customer identification number and login credentials through the communication method selected or used by the Organization.</p>
              <p className="mb-3 pl-4"><strong>6.8.</strong> Customers are responsible for keeping their login credentials confidential and must not share their credentials with unauthorized persons.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">7. Loan Application and Approval</h2>
              <p className="mb-3 pl-4"><strong>7.1.</strong> A registered customer may submit a loan application through the website or through another application method provided by the Organization.</p>
              <p className="mb-3 pl-4"><strong>7.2.</strong> Submission of a loan application does not guarantee approval.</p>
              <p className="mb-3 pl-4"><strong>7.3.</strong> The Organization reserves the right to approve, reject, modify, defer, or request additional information regarding a loan application based on eligibility, documentation, verification, repayment capacity, and applicable lending requirements.</p>
              <p className="mb-3 pl-4"><strong>7.4.</strong> The Organization may independently verify the applicant's information before approving or disbursing a loan.</p>
              <p className="mb-3 pl-4"><strong>7.5.</strong> The approved loan amount, applicable interest, fees, repayment schedule, due dates, and other financial terms shall be communicated to the borrower before disbursement.</p>
              <p className="mb-3 pl-4"><strong>7.6.</strong> The borrower is responsible for reviewing and accepting the applicable loan agreement before receiving the loan amount.</p>
              <p className="mb-3 pl-4"><strong>7.7.</strong> The loan information displayed through the website is intended to provide the customer with a convenient record of the Organization's loan and repayment information. The final financial terms shall be determined by the applicable loan agreement and records maintained by the Organization.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">8. Loan Disbursement and Financial Transactions</h2>
              <p className="mb-3 pl-4"><strong>8.1.</strong> The Organization's website is intended primarily for customer registration, loan application, communication, record-keeping, and ledger-management purposes.</p>
              <p className="mb-3 pl-4"><strong>8.2.</strong> The website does not itself operate as a bank, banking platform, payment gateway, wallet, or financial institution.</p>
              <p className="mb-3 pl-4"><strong>8.3.</strong> The website does not provide customers with banking services, hold customer funds, or independently execute bank transfers or other financial transactions.</p>
              <p className="mb-3 pl-4"><strong>8.4.</strong> Actual loan disbursement, repayment, payment verification, and other financial transactions shall be handled by the Organization and the customer through the applicable process communicated by the Organization.</p>
              <p className="mb-3 pl-4"><strong>8.5.</strong> Where a customer makes a repayment outside the website, the Organization may verify the payment separately and then update the corresponding installment record through its administrative system.</p>
              <p className="mb-3 pl-4"><strong>8.6.</strong> The customer must not treat the ability to view or submit information through the website as evidence that a payment, loan, or financial transaction has been completed unless the Organization has confirmed and recorded the relevant transaction.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">9. Repayment Obligations</h2>
              <p className="mb-3 pl-4"><strong>9.1.</strong> The borrower must repay the loan according to the agreed repayment schedule and specified due dates.</p>
              <p className="mb-3 pl-4"><strong>9.2.</strong> The borrower is responsible for making payments on time and maintaining sufficient funds or otherwise arranging the required payment to meet scheduled repayments.</p>
              <p className="mb-3 pl-4"><strong>9.3.</strong> Any delay or failure to make repayments may result in applicable late-payment charges, additional consequences, or other remedies as specified in the loan agreement and permitted by law.</p>
              <p className="mb-3 pl-4"><strong>9.4.</strong> The borrower should immediately inform the Organization if circumstances arise that may affect their ability to make a scheduled repayment.</p>
              <p className="mb-3 pl-4"><strong>9.5.</strong> The repayment schedule displayed in the customer account may show installment amounts, due dates, payment status, completed installments, pending installments, overdue installments, and other relevant repayment information.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">10. Installment Records and Digital Ledger</h2>
              <p className="mb-3 pl-4"><strong>10.1.</strong> The Organization may maintain a digital record of each customer's loan and installment history through its website.</p>
              <p className="mb-3 pl-4"><strong>10.2.</strong> The digital ledger may contain information including the loan amount, installment amount, scheduled due date, payment status, payment date, outstanding amount, applicable charges, and other relevant loan information.</p>
              <p className="mb-3 pl-4"><strong>10.3.</strong> The Organization's authorized administrator may update an installment as paid after independently verifying that the corresponding payment has been received.</p>
              <p className="mb-3 pl-4"><strong>10.4.</strong> Customers must not assume that an installment has been paid merely because a payment was attempted or communicated to the Organization. The installment will be treated as completed when the Organization has verified and recorded the payment.</p>
              <p className="mb-3 pl-4"><strong>10.5.</strong> Where the Organization provides a digital or printed receipt, the receipt will serve as a record of the payment acknowledged by the Organization, subject to the applicable transaction and loan records.</p>
              <p className="mb-3 pl-4"><strong>10.6.</strong> The Organization may correct an accidental or erroneous ledger entry where necessary, while maintaining appropriate records of such corrections.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">11. Late Payment and Default</h2>
              <p className="mb-3 pl-4"><strong>11.1.</strong> Failure to pay an installment by its specified due date may result in the installment being treated as overdue.</p>
              <p className="mb-3 pl-4"><strong>11.2.</strong> Any late-payment charge, fine, or other applicable consequence shall be determined according to the applicable loan agreement, Organization policy, and applicable law.</p>
              <p className="mb-3 pl-4"><strong>11.3.</strong> The Organization may issue reminders or notifications regarding upcoming or overdue installments.</p>
              <p className="mb-3 pl-4"><strong>11.4.</strong> The customer remains responsible for repayment even if the customer does not receive a reminder or notification due to an incorrect phone number, email address, technical issue, communication failure, or other reason.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">12. Long-Term or Serious Default</h2>
              <p className="mb-3 pl-4"><strong>12.1.</strong> If a loan remains overdue for three (3) months or more, the Organization may classify the account as a serious/defaulted account, subject to the applicable loan agreement and law.</p>
              <p className="mb-3 pl-4"><strong>12.2.</strong> In the event of prolonged non-payment, the Organization may take appropriate legal recovery action to recover the outstanding amount, subject to applicable laws and regulations.</p>
              <p className="mb-3 pl-4"><strong>12.3.</strong> Before taking legal action, the Organization may issue notices, reminders, or demands for payment as required or appropriate.</p>
              <p className="mb-3 pl-4"><strong>12.4.</strong> Any recovery or legal action shall be conducted in accordance with applicable law. The Organization will not use unlawful threats, harassment, intimidation, or coercive recovery practices.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">13. False Information or Fraud</h2>
              <p className="mb-3 pl-4"><strong>13.1.</strong> Applicants must provide accurate, complete, and truthful information in all application forms and documents.</p>
              <p className="mb-3 pl-4"><strong>13.2.</strong> If any information or document is found to be false, forged, misleading, or intentionally concealed, the Organization may reject the application or take appropriate action in accordance with the loan agreement and applicable law.</p>
              <p className="mb-3 pl-4"><strong>13.3.</strong> The Organization may suspend or terminate a customer's access to the website where fraudulent, unauthorized, abusive, or otherwise unlawful activity is reasonably suspected, subject to applicable law and the Organization's policies.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">14. Documents and Verification</h2>
              <p className="mb-3 pl-4"><strong>14.1.</strong> Applicants may be required to provide valid identification, address proof, age proof, marital-status documents, income/occupation information, bank details, photographs, and other documents reasonably required for loan assessment.</p>
              <p className="mb-3 pl-4"><strong>14.2.</strong> The Organization may verify submitted documents and information before approving or disbursing a loan.</p>
              <p className="mb-3 pl-4"><strong>14.3.</strong> Failure to provide required documents may result in delay or rejection of the application.</p>
              <p className="mb-3 pl-4"><strong>14.4.</strong> Documents and personal information submitted through the website may be stored and processed for customer registration, identity verification, loan assessment, record-keeping, communication, and other legitimate business purposes of the Organization, subject to applicable law and the Organization's privacy practices.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">15. Customer Account and Website Access</h2>
              <p className="mb-3 pl-4"><strong>15.1.</strong> Approved customers may be provided with login credentials to access their customer account.</p>
              <p className="mb-3 pl-4"><strong>15.2.</strong> Customers are responsible for maintaining the confidentiality of their login credentials and must immediately inform the Organization if they believe their account credentials have been compromised.</p>
              <p className="mb-3 pl-4"><strong>15.3.</strong> Customers must not attempt to access another customer's account, information, loan records, documents, or other restricted information.</p>
              <p className="mb-3 pl-4"><strong>15.4.</strong> The Organization may suspend or restrict access where it reasonably believes that an account is being misused, compromised, or accessed without authorization.</p>
              <p className="mb-3 pl-4"><strong>15.5.</strong> The Organization may temporarily suspend website services for maintenance, security updates, technical issues, or other operational reasons.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">16. Electronic Communication and Notifications</h2>
              <p className="mb-3 pl-4"><strong>16.1.</strong> By using the website and providing contact information, the applicant/customer agrees that the Organization may use the provided email address, telephone number, or other permitted communication channels to communicate regarding registration, account status, loan applications, repayment schedules, payment confirmations, reminders, and other matters related to the Organization's services, subject to applicable law.</p>
              <p className="mb-3 pl-4"><strong>16.2.</strong> The Organization may send electronic notifications regarding upcoming installment dates, overdue payments, loan application status, registration status, and other relevant account information.</p>
              <p className="mb-3 pl-4"><strong>16.3.</strong> Customers are responsible for keeping their contact information accurate and updated.</p>
              <p className="mb-3 pl-4"><strong>16.4.</strong> The Organization shall not be responsible for communication failures caused by incorrect customer-provided contact information, unavailable communication services, network problems, or other circumstances outside the Organization's reasonable control.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">17. Acceptance of Terms</h2>
              <p className="mb-3 pl-4"><strong>17.1.</strong> By submitting a registration or loan application through the website, the applicant confirms that they have read and understood these Terms & Conditions and agree to comply with the applicable requirements.</p>
              <p className="mb-3 pl-4"><strong>17.2.</strong> The applicant confirms that the information provided is true and complete to the best of their knowledge.</p>
              <p className="mb-3 pl-4"><strong>17.3.</strong> By accepting a loan, the borrower agrees to comply with the applicable loan agreement, repayment schedule, and related terms and conditions.</p>
              <p className="mb-3 pl-4"><strong>17.4.</strong> The borrower acknowledges that loan approval and the amount sanctioned are subject to the Organization's eligibility criteria and applicable laws.</p>
              <p className="mb-3 pl-4"><strong>17.5.</strong> Where electronic acceptance is used, the Organization may maintain a record of the customer's acceptance, including the applicable Terms & Conditions version, date, and time of acceptance, for administrative and record-keeping purposes.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">18. Privacy and Protection of Information</h2>
              <p className="mb-3 pl-4"><strong>18.1.</strong> The Organization may collect personal information and documents reasonably required for customer registration, verification, loan assessment, account management, repayment records, communication, and other legitimate business purposes.</p>
              <p className="mb-3 pl-4"><strong>18.2.</strong> The Organization will take reasonable measures to protect customer information against unauthorized access, alteration, disclosure, or misuse, subject to applicable law.</p>
              <p className="mb-3 pl-4"><strong>18.3.</strong> Access to sensitive customer information should be limited to authorized persons who require such information for legitimate organizational purposes.</p>
              <p className="mb-3 pl-4"><strong>18.4.</strong> Customers should not submit information belonging to another person without appropriate authorization.</p>
              <p className="mb-3 pl-4"><strong>18.5.</strong> The Organization may retain relevant customer, loan, payment, and transaction records for the period required for business, accounting, legal, regulatory, dispute-resolution, or other legitimate purposes, subject to applicable law.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">19. Changes to Terms & Conditions</h2>
              <p className="mb-3 pl-4"><strong>19.1.</strong> Shudhara Women Development Organization reserves the right to amend or update these Terms & Conditions when necessary, subject to applicable law.</p>
              <p className="mb-3 pl-4"><strong>19.2.</strong> Any material changes applicable to an existing borrower will be communicated as required under the applicable agreement or law.</p>
              <p className="mb-3 pl-4"><strong>19.3.</strong> The applicable version of the Terms & Conditions may be identified by its effective date or version information.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">20. Governing Law</h2>
              <p className="mb-3 pl-4"><strong>20.1.</strong> All loan transactions, agreements, recovery procedures, and disputes shall be governed by the laws applicable in India.</p>
              <p className="mb-3 pl-4"><strong>20.2.</strong> Any dispute shall be handled through the appropriate legal or dispute-resolution process available under applicable law.</p>
              <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">21. Website Records and Technical Disclaimer</h2>
              <p className="mb-3 pl-4"><strong>21.1.</strong> The website is provided as a digital platform for customer interaction, application management, communication, loan information, installment tracking, and record-keeping.</p>
              <p className="mb-3 pl-4"><strong>21.2.</strong> The Organization will take reasonable measures to maintain the availability and accuracy of the information displayed through the website; however, temporary technical interruptions, maintenance, network failures, or other technical issues may occur.</p>
              <p className="mb-3 pl-4"><strong>21.3.</strong> In the event of a discrepancy between information displayed through the website and the applicable executed loan agreement or verified organizational records, the Organization may investigate and correct the discrepancy in accordance with its records and applicable law.</p>
              <p className="mb-3 pl-4"><strong>21.4.</strong> Customers must contact the Organization promptly if they identify an apparent error in their personal information, loan information, installment schedule, payment status, or receipt.</p>
              <hr className="my-8 border-[#bc7b1f]" />
              <h2 className="text-3xl font-bold text-[#673c1c] mt-8 mb-4 text-center">IMPORTANT NOTICE TO APPLICANTS</h2>
              <p className="mb-4">Please read all loan documents carefully before accepting a loan. Make sure you understand the loan amount, interest rate, fees, repayment schedule, due dates, and consequences of default. Do not provide false information or conceal existing financial obligations.</p>
              <p className="mb-4">Registration on the Organization's website does not guarantee loan approval. A loan application will be considered only after the Organization completes its applicable verification and approval process.</p>
              <p className="mb-4">The website primarily functions as a customer communication, application-management, loan-ledger, installment-tracking, and record-keeping platform. It does not itself provide banking services, hold customer funds, or independently process or execute financial transactions. Actual financial transactions and their verification are handled separately by the Organization according to its applicable procedures.</p>
              <p className="mb-4">Please ensure that all personal information and documents submitted to the Organization are accurate and belong to you or are submitted with appropriate authorization.</p>
              <p className="mb-4">For any questions regarding eligibility, registration, repayment, loan terms, payment status, or other matters, please contact the Organization before accepting or signing the applicable loan agreement.</p>
              <p className="mb-4">By proceeding with registration or a loan application, the applicant confirms that they have read, understood, and agreed to the applicable Terms & Conditions.</p>

              <h2 className="text-2xl font-bold text-[#7b481c] mt-12 mb-4">Contact Information</h2>
              <p className="mb-4 text-lg">
                For any queries or concerns regarding these Terms, please contact us at:<br /><br />
                <strong>Shudhara Women Development Organization</strong><br />
                Ranaghat, Nadia, Ramnagar Milan Bagan school para<br />
                Phone: 7029368862 / 9046377730
              </p>
              \n              <p className="font-bold mt-8 pb-4 text-center text-[#bc7b1f]">--- End of Terms ---</p>
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

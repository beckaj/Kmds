import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import SectionTitle from './SectionTitle';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import {
  filterAlphaOnly,
  filterDigitsOnly,
  filterAlphanumeric,
  filterAddress,
  validateAccountNumber,
  validateIFSC,
  validateRequired,
} from '../../utils/validation';

interface BankDetails {
  fullName: string;
  bankName: string;
  branchName: string;
  bankAddress: string;
  accountNumber: string;
  ifscCode: string;
}

interface BankErrors {
  fullName: string;
  bankName: string;
  branchName: string;
  bankAddress: string;
  accountNumber: string;
  ifscCode: string;
}

interface CitizenBankDetailsFormProps {
  applicationId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function CitizenBankDetailsForm({ 
  applicationId, 
  onBack, 
  onSuccess 
}: CitizenBankDetailsFormProps) {
  const [submitting, setSubmitting] = useState(false);
  
  // Bank Details Form State
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    fullName: '',
    bankName: '',
    branchName: '',
    bankAddress: '',
    accountNumber: '',
    ifscCode: '',
  });

  const [bankErrors, setBankErrors] = useState<BankErrors>({
    fullName: '',
    bankName: '',
    branchName: '',
    bankAddress: '',
    accountNumber: '',
    ifscCode: '',
  });
  
  // Additional Fields State
  const [autoDebitWaterBill, setAutoDebitWaterBill] = useState('');
  const [comments, setComments] = useState('');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  const clearBankError = (field: keyof BankErrors) => {
    if (bankErrors[field]) {
      setBankErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateBankForm = (): boolean => {
    const errs: BankErrors = {
      fullName: validateRequired(bankDetails.fullName, 'Full name'),
      bankName: validateRequired(bankDetails.bankName, 'Bank name'),
      branchName: validateRequired(bankDetails.branchName, 'Branch name'),
      bankAddress: validateRequired(bankDetails.bankAddress, 'Bank address'),
      accountNumber: validateAccountNumber(bankDetails.accountNumber),
      ifscCode: validateIFSC(bankDetails.ifscCode),
    };
    setBankErrors(errs);
    return !errs.fullName && !errs.bankName && !errs.branchName && !errs.bankAddress && !errs.accountNumber && !errs.ifscCode;
  };

  const handleSubmitApplication = async () => {
    // Validate bank details
    if (!validateBankForm()) {
      return;
    }

    if (!autoDebitWaterBill) {
      alert('Please select auto-debit preference.');
      return;
    }

    if (!declarationAccepted) {
      alert('Please accept the declaration to proceed.');
      return;
    }

    if (!confirm('Are you sure you want to submit this application for further processing?')) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/citizen/submit-application`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            applicationId,
            bankDetails,
            autoDebitWaterBill,
            comments,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert('Application submitted successfully! It will now be processed by the department.');
        onSuccess();
      } else {
        console.error('Failed to submit application:', result.error);
        alert(`Failed to submit application: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(`Error submitting application: ${error}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={submitting}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Review
      </button>

      {/* Page Header */}
      <div className="mb-6">
        <SectionTitle title="Bank Details & Final Declaration" className="mb-2" />
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Please provide your bank details to complete the application
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Bank Details Section */}
          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Bank Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankDetails.fullName}
                  onChange={(e) => {
                    setBankDetails({ ...bankDetails, fullName: filterAlphaOnly(e.target.value) });
                    clearBankError('fullName');
                  }}
                  placeholder="Enter full name as per bank account"
                  maxLength={100}
                  className={"w-full px-4 py-2.5 border rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all " + (bankErrors.fullName ? "border-red-500" : "border-gray-300")}
                />
                {bankErrors.fullName && <p className="text-red-500 text-[13px] mt-1 font-['Poppins',sans-serif]">{bankErrors.fullName}</p>}
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => {
                    setBankDetails({ ...bankDetails, bankName: filterAlphaOnly(e.target.value) });
                    clearBankError('bankName');
                  }}
                  placeholder="Enter bank name"
                  maxLength={100}
                  className={"w-full px-4 py-2.5 border rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all " + (bankErrors.bankName ? "border-red-500" : "border-gray-300")}
                />
                {bankErrors.bankName && <p className="text-red-500 text-[13px] mt-1 font-['Poppins',sans-serif]">{bankErrors.bankName}</p>}
              </div>

              {/* Branch Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                  Branch Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankDetails.branchName}
                  onChange={(e) => {
                    setBankDetails({ ...bankDetails, branchName: filterAlphaOnly(e.target.value) });
                    clearBankError('branchName');
                  }}
                  placeholder="Enter branch name"
                  maxLength={100}
                  className={"w-full px-4 py-2.5 border rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all " + (bankErrors.branchName ? "border-red-500" : "border-gray-300")}
                />
                {bankErrors.branchName && <p className="text-red-500 text-[13px] mt-1 font-['Poppins',sans-serif]">{bankErrors.branchName}</p>}
              </div>

              {/* Bank Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                  Bank Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankDetails.bankAddress}
                  onChange={(e) => {
                    setBankDetails({ ...bankDetails, bankAddress: filterAddress(e.target.value) });
                    clearBankError('bankAddress');
                  }}
                  placeholder="Enter bank address"
                  maxLength={200}
                  className={"w-full px-4 py-2.5 border rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all " + (bankErrors.bankAddress ? "border-red-500" : "border-gray-300")}
                />
                {bankErrors.bankAddress && <p className="text-red-500 text-[13px] mt-1 font-['Poppins',sans-serif]">{bankErrors.bankAddress}</p>}
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => {
                    setBankDetails({ ...bankDetails, accountNumber: filterDigitsOnly(e.target.value) });
                    clearBankError('accountNumber');
                  }}
                  placeholder="Enter account number (9-18 digits)"
                  maxLength={18}
                  inputMode="numeric"
                  className={"w-full px-4 py-2.5 border rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all " + (bankErrors.accountNumber ? "border-red-500" : "border-gray-300")}
                />
                {bankErrors.accountNumber && <p className="text-red-500 text-[13px] mt-1 font-['Poppins',sans-serif]">{bankErrors.accountNumber}</p>}
              </div>

              {/* IFSC Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankDetails.ifscCode}
                  onChange={(e) => {
                    setBankDetails({ ...bankDetails, ifscCode: filterAlphanumeric(e.target.value).toUpperCase() });
                    clearBankError('ifscCode');
                  }}
                  placeholder="Enter IFSC code (e.g. SBIN0001234)"
                  maxLength={11}
                  className={"w-full px-4 py-2.5 border rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all " + (bankErrors.ifscCode ? "border-red-500" : "border-gray-300")}
                />
                {bankErrors.ifscCode && <p className="text-red-500 text-[13px] mt-1 font-['Poppins',sans-serif]">{bankErrors.ifscCode}</p>}
              </div>
            </div>
          </div>

          {/* Auto Debit Preference Section */}
          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Auto-Debit Preference
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 font-['Poppins',sans-serif] mb-3">
                Do you want to auto-debit your water bill? <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="autoDebit"
                    value="yes"
                    checked={autoDebitWaterBill === 'yes'}
                    onChange={(e) => setAutoDebitWaterBill(e.target.value)}
                    className="w-4 h-4 text-[#1f3a5f] border-gray-300 focus:ring-[#1f3a5f] focus:ring-2"
                  />
                  <span className="ml-2 text-sm font-['Poppins',sans-serif] text-gray-700">Yes</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="autoDebit"
                    value="no"
                    checked={autoDebitWaterBill === 'no'}
                    onChange={(e) => setAutoDebitWaterBill(e.target.value)}
                    className="w-4 h-4 text-[#1f3a5f] border-gray-300 focus:ring-[#1f3a5f] focus:ring-2"
                  />
                  <span className="ml-2 text-sm font-['Poppins',sans-serif] text-gray-700">No</span>
                </label>
              </div>
            </div>
          </div>

          {/* Additional Comments Section */}
          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Additional Comments
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter any additional comments or remarks"
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all resize-none"
              />
            </div>
          </div>

          {/* Declaration Section */}
          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Declaration
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="w-5 h-5 text-[#1f3a5f] border-gray-300 rounded focus:ring-[#1f3a5f] focus:ring-2 mt-0.5 flex-shrink-0"
                />
                <span className="ml-3 text-sm font-['Poppins',sans-serif] text-gray-700 leading-relaxed">
                  I hereby declare that the information provided above is true and accurate to the best of my knowledge. <span className="text-red-500">*</span>
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={onBack}
              disabled={submitting}
              className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            <button
              onClick={handleSubmitApplication}
              disabled={submitting}
              className="px-8 py-3 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#152d4a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
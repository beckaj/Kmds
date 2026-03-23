import { useState, useEffect } from 'react';
import SectionTitle from './SectionTitle';
import { ChevronLeft, FileText, Download, CheckCircle, CreditCard } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface Application {
  id: string;
  status: string;
  submittedAt: string;
  type?: string;
  propertyDetails: {
    district: string;
    ulb: string;
    ulbType: string;
    authorityType: string;
    ownershipType: string;
  };
  applicantDetails: {
    applicantName: string;
    mobile: string;
    email?: string;
  };
  connectionDetails: {
    connectionType: string;
    propertyType: string;
  };
  plumberConnectionData?: {
    estimationRows: any[];
    totalAmount: number;
  };
  paymentDetails?: {
    status: string;
    paidAt: string;
    transactionId: string;
  };
  applicationNo?: string;
  approvedEstimation?: {
    totalAmount: number;
    rows: any[];
  };
  isAppealApproved?: boolean;
  appealId?: string;
  // Change of Connection fields
  rrData?: any;
  existingConnectionType?: string;
  newConnectionType?: string;
  applicationFees?: number;
  securityDeposit?: number;
  // Unauthorized tap penalty
  unauthorizedTapPenalty?: {
    amount: number;
    approvedAt?: string;
    approvedBy?: string;
  };
  fieldVisitReport?: {
    unauthorizedTapConnection?: {
      found: boolean;
      penaltyAmount: number;
    };
    [key: string]: any;
  };
}

interface CitizenPaymentViewProps {
  application: Application;
  onBack: () => void;
}

export default function CitizenPaymentView({ application, onBack }: CitizenPaymentViewProps) {
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [processing, setProcessing] = useState(false);

  const isChangeConnection = (application as any).type === 'changeConnection';

  const applicationNo = application.applicationNo || application.id || 'N/A';

  // Calculate total amount based on application type
  const totalAmount = isChangeConnection
    ? ((typeof application.applicationFees === 'number' ? application.applicationFees : 0) +
       (typeof application.securityDeposit === 'number' ? application.securityDeposit : 0))
    : (application.plumberConnectionData && typeof application.plumberConnectionData.totalAmount === 'number'
      ? application.plumberConnectionData.totalAmount
      : (application.approvedEstimation && typeof application.approvedEstimation.totalAmount === 'number'
        ? application.approvedEstimation.totalAmount
        : 14000));

  // Get applicant name based on application type
  const applicantName = isChangeConnection
    ? (application.rrData && application.rrData.ownerName ? application.rrData.ownerName : 'N/A')
    : (application.applicantDetails && application.applicantDetails.applicantName
      ? application.applicantDetails.applicantName
      : 'N/A');

  // Service type label
  const serviceTypeLabel = isChangeConnection ? 'Change of Connection Type' : 'New Tap Water Connection';

  // Get estimation rows from approvedEstimation or plumberConnectionData
  const estimationRows = (application.approvedEstimation && application.approvedEstimation.rows)
    ? application.approvedEstimation.rows
    : (application.plumberConnectionData && application.plumberConnectionData.estimationRows)
      ? application.plumberConnectionData.estimationRows
      : [];

  // Build change-of-connection fee breakdown rows
  const changeConnectionFeeRows = isChangeConnection ? [
    { id: 'appFee', attribute: 'Application Fees', measurement: 'Lump Sum', price: application.applicationFees || 0 },
    { id: 'secDep', attribute: 'Security Deposit', measurement: 'Lump Sum', price: application.securityDeposit || 0 },
  ] : [];

  // Choose which rows to display
  const displayRows = isChangeConnection ? changeConnectionFeeRows : estimationRows;

  // Non-metered upfront charge calculation
  const NON_METERED_SLAB_RATES: Record<string, { rate: number; label: string }> = {
    'domestic': { rate: 80, label: 'Domestic' },
    'commercial': { rate: 160, label: 'Commercial' },
    'non-domestic': { rate: 120, label: 'Non-Domestic' },
    'nondomestic': { rate: 120, label: 'Non-Domestic' },
    'non_domestic': { rate: 120, label: 'Non-Domestic' },
    'industrial': { rate: 320, label: 'Industrial' },
  };

  const connType = (application.connectionDetails && application.connectionDetails.connectionType) ? application.connectionDetails.connectionType : '';
  const normalizedConnType = connType.toLowerCase().replace(/[\s_-]+/g, '');
  const isNonMetered = normalizedConnType === 'nonmetered' || normalizedConnType === 'unmetered';
  const usageCategory = (application.connectionDetails && application.connectionDetails.propertyType) ? application.connectionDetails.propertyType : '';
  const rawCat = usageCategory.trim();
  const categoryKey = rawCat.toLowerCase().replace(/[\s_]+/g, '-');
  const altCatKey = rawCat.toLowerCase().replace(/[\s-]+/g, '');
  const directCatKey = rawCat.toLowerCase();
  const slabEntry = NON_METERED_SLAB_RATES[categoryKey] || NON_METERED_SLAB_RATES[altCatKey] || NON_METERED_SLAB_RATES[directCatKey] || null;
  const nonMeteredMonthlyRate = slabEntry ? slabEntry.rate : 0;
  const nonMeteredCategoryLabel = slabEntry ? slabEntry.label : (usageCategory || 'N/A');
  const nonMeteredAnnualRate = nonMeteredMonthlyRate * 12;
  // Compute unauthorized tap penalty
  const penaltyAmt = (application.unauthorizedTapPenalty && typeof application.unauthorizedTapPenalty.amount === 'number' && application.unauthorizedTapPenalty.amount > 0)
    ? application.unauthorizedTapPenalty.amount
    : (application.fieldVisitReport && application.fieldVisitReport.unauthorizedTapConnection && application.fieldVisitReport.unauthorizedTapConnection.found && typeof application.fieldVisitReport.unauthorizedTapConnection.penaltyAmount === 'number'
      ? application.fieldVisitReport.unauthorizedTapConnection.penaltyAmount
      : 0);
  const grandTotal = (isNonMetered ? totalAmount + nonMeteredAnnualRate : totalAmount) + penaltyAmt;

  // Check if payment is already completed
  // IMPORTANT: Application status is the primary source of truth.
  // If status is pending_payment or sentToCitizenForPayment, citizen must pay first
  // regardless of any stale paymentDetails that may exist on the object.
  const isPendingPaymentStatus = application.status === 'pending_payment' || application.status === 'pendingPayment' || application.status === 'sentToCitizenForPayment';
  const isPaymentCompleted = !isPendingPaymentStatus && (
    application.status === 'payment_done' ||
    application.status === 'commissioner_payment_verification' ||
    (application.paymentDetails && application.paymentDetails.status === 'completed')
  );
  const paymentDate = (application.paymentDetails && application.paymentDetails.paidAt) 
    ? new Date(application.paymentDetails.paidAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;
  const transactionId = (application.paymentDetails && application.paymentDetails.transactionId) || 'N/A';

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Simulated DSC signature timestamp
  const dscSignedDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago

  const handlePayment = async () => {
    setProcessing(true);
    setShowPaymentPopup(false);

    try {
      console.log('[CITIZEN] Initiating payment for:', {
        applicationId: application.id,
        amount: grandTotal,
      });

      // Simulate payment process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Submit payment to backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/payment/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: application.id,
            amount: grandTotal,
            paymentMethod: 'Online',
            transactionId: `TXN${Date.now()}`,
          }),
        }
      );

      const data = await response.json();
      console.log('[CITIZEN] Payment response:', data);

      if (data.success) {
        alert(isChangeConnection
          ? '✅ Payment Successful!\n\nYour payment has been received. The Commissioner will verify the payment and generate the change of connection type permission certificate. You will be notified once approved.'
          : '✅ Payment Successful!\n\nYour payment has been received. The Commissioner will verify the payment and generate the installation permission certificate. You will be notified once approved.');
        
        // Navigate back to application list
        onBack();
      } else {
        throw new Error(data.error || 'Payment failed');
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      alert(`Error processing payment: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    alert('Payment letter downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={processing}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      {/* Page Header */}
      <div className="mb-6">
        <SectionTitle title="Payment Approval Letter" className="mb-2" />
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application No: <span className="font-semibold">{applicationNo}</span>
        </p>
        <div className="mt-2 inline-flex items-center px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800 font-['Poppins',sans-serif] font-semibold text-[14px]">
            Application Approved by Commissioner
          </span>
        </div>
        {application.isAppealApproved && (
          <div className="mt-2 ml-3 inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
            <FileText className="w-5 h-5 text-yellow-700 mr-2" />
            <span className="text-yellow-800 font-['Poppins',sans-serif] font-semibold text-[14px]">
              Approved via Appeal — Previous Rejection Revoked
            </span>
          </div>
        )}
      </div>

      {/* Payment Letter Card */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        {/* Letter Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
            Official Payment Letter
          </h2>
          <div className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-md">
            <CheckCircle className="w-5 h-5 text-white" />
            <span className="text-white font-['Poppins',sans-serif] font-semibold text-[14px]">
              Digitally Signed
            </span>
          </div>
        </div>

        {/* Letter Content */}
        <div className="p-12 bg-white rounded-lg border border-gray-200" id="payment-letter">
          {/* Government Header */}
          <div className="text-center mb-8 border-b-2 border-[#1f3a5f] pb-6">
            <ImageWithFallback src="https://upload.wikimedia.org/wikipedia/commons/d/d3/Seal_of_Karnataka.png" alt="Government of Karnataka Seal" className="w-[80px] h-[80px] mx-auto mb-3 object-contain" />
            <div className="mb-4">
              <div className="text-[#1f3a5f] font-bold text-[24px] font-['Poppins',sans-serif]">
                ಕರ್ನಾಟಕ ಸರ್ಕಾರ
              </div>
              <div className="text-[#1f3a5f] font-bold text-[22px] font-['Poppins',sans-serif]">
                GOVERNMENT OF KARNATAKA
              </div>
            </div>
            <div className="text-[#414141] font-semibold text-[18px] font-['Poppins',sans-serif]">
              Department of Municipal Administration
            </div>
            <div className="text-[#414141] text-[16px] font-['Poppins',sans-serif]">
              Directorate of Municipal Administration
            </div>
            <div className="text-gray-600 text-[14px] font-['Poppins',sans-serif] mt-2">
              Jalanidhi - Water Supply Connection Service
            </div>
          </div>

          {/* Reference Numbers */}
          <div className="flex justify-between mb-6 text-[14px] font-['Poppins',sans-serif]">
            <div>
              <p className="text-gray-600">Ref No: <span className="font-semibold text-gray-900">DMA/JN/{applicationNo}</span></p>
            </div>
            <div>
              <p className="text-gray-600">Date: <span className="font-semibold text-gray-900">{currentDate}</span></p>
            </div>
          </div>

          {/* Recipient */}
          <div className="mb-6">
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900 font-semibold">To,</p>
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900 mt-1 font-semibold">{applicantName}</p>
            <p className="text-[14px] font-['Poppins',sans-serif] text-gray-600 mt-1">
              Application No: {applicationNo}
            </p>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900">
              <span className="font-bold">Subject: </span>
              <span className="underline">{isChangeConnection ? 'Approval of Change of Connection Type - Payment Authorization' : 'Approval of Tap Water Connection - Payment Authorization'}</span>
            </p>
          </div>

          {/* Salutation */}
          <div className="mb-4">
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900">
              Dear Sir/Madam,
            </p>
          </div>

          {/* Letter Body */}
          <div className="space-y-4 mb-6 text-[15px] font-['Poppins',sans-serif] text-gray-900 leading-relaxed text-justify">
            <p className="indent-12">
              {isChangeConnection
                ? <>With reference to your application for change of connection type under the Jalanidhi initiative, we are pleased to inform you that your application bearing reference number <span className="font-semibold">{applicationNo}</span> has been thoroughly reviewed and <span className="font-bold text-green-700">APPROVED</span> by the Commissioner of the Department of Municipal Administration, Government of Karnataka.</>
                : <>With reference to your application for a new tap water connection under the Jalanidhi initiative, we are pleased to inform you that your application bearing reference number <span className="font-semibold">{applicationNo}</span> has been thoroughly reviewed and <span className="font-bold text-green-700">APPROVED</span> by the Commissioner of the Department of Municipal Administration, Government of Karnataka.</>
              }
            </p>

            <p className="indent-12">
              {isChangeConnection
                ? <>After careful verification of all submitted documents, review of your existing connection details by our field engineers, and assessment by concerned authorities, your request to change the connection type from <span className="font-semibold">{(application as any).existingConnectionType || 'N/A'}</span> to <span className="font-semibold">{(application as any).newConnectionType || 'N/A'}</span> has been approved as per government norms and regulations.</>
                : <>After careful verification of all submitted documents, site inspection by our field engineers, and review by concerned authorities, it has been determined that your property meets all the necessary criteria for the installation of a tap water connection as per government norms and regulations.</>
              }
            </p>

            <p className="indent-12">
              {isChangeConnection
                ? <>You are hereby authorized to proceed with the payment of applicable fees for the change of connection type. The approved fee structure includes application fees and security deposit as determined by the department.</>
                : <>You are hereby authorized to proceed with the payment of installation charges. The approved cost estimation for the tap water connection has been prepared by our licensed plumber and verified by our technical team.</>
              }
            </p>
          </div>

          {/* Payment Details Box */}
          <div className="bg-blue-50 border-2 border-[#1f3a5f] rounded-lg p-6 mb-6">
            <h3 className="text-[16px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
              APPROVED PAYMENT DETAILS
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Application Number</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {applicationNo}
                </p>
              </div>
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Applicant Name</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {applicantName}
                </p>
              </div>
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Service Type</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {serviceTypeLabel}
                </p>
              </div>
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Approval Date</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {currentDate}
                </p>
              </div>
            </div>

            {/* Cost Estimation Breakdown Table */}
            {displayRows && displayRows.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#1f3a5f]/20">
                <h4 className="text-[14px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  {isChangeConnection ? 'APPROVED FEE BREAKDOWN' : 'APPROVED COST ESTIMATION BREAKDOWN'}
                </h4>
                <div className="bg-white rounded-lg border border-[#1f3a5f]/20 overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-[#1f3a5f] grid grid-cols-[30px_2.5fr_1.5fr_1.5fr] gap-2 px-4 py-2.5">
                    <p className="text-white text-[12px] font-semibold font-['Poppins',sans-serif] text-center">#</p>
                    <p className="text-white text-[12px] font-semibold font-['Poppins',sans-serif]">Attribute</p>
                    <p className="text-white text-[12px] font-semibold font-['Poppins',sans-serif] text-center">Measurement</p>
                    <p className="text-white text-[12px] font-semibold font-['Poppins',sans-serif] text-right">Amount (₹)</p>
                  </div>
                  {/* Table Body */}
                  <div className="divide-y divide-gray-100">
                    {displayRows.map((row: any, index: number) => (
                      <div
                        key={row.id || index}
                        className={`grid grid-cols-[30px_2.5fr_1.5fr_1.5fr] gap-2 px-4 py-2.5 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <p className="text-gray-500 text-[13px] font-['Poppins',sans-serif] text-center">{index + 1}</p>
                        <p className="text-gray-900 text-[13px] font-medium font-['Poppins',sans-serif]">{row.attribute}</p>
                        <p className="text-gray-700 text-[13px] font-['Poppins',sans-serif] text-center">{row.measurement}</p>
                        <p className="text-gray-900 text-[13px] font-semibold font-['Poppins',sans-serif] text-right">₹{typeof row.price === 'number' ? row.price.toFixed(2) : row.price}</p>
                      </div>
                    ))}
                  </div>
                  {/* Total Row */}
                  <div className="bg-[#1f3a5f]/10 border-t-2 border-[#1f3a5f] grid grid-cols-[30px_2.5fr_1.5fr_1.5fr] gap-2 px-4 py-3">
                    <div></div>
                    <p className="text-[#1f3a5f] text-[13px] font-bold font-['Poppins',sans-serif]">{(isNonMetered || penaltyAmt > 0) ? 'Sub-Total (Installation Charges)' : 'Total Approved Amount'}</p>
                    <div></div>
                    <p className="text-[#1f3a5f] text-[14px] font-bold font-['Poppins',sans-serif] text-right">₹{totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Non-Metered Upfront Water Charge */}
            {isNonMetered && !isChangeConnection && (
              <div className="mt-5 pt-4 border-t border-[#1f3a5f]/20">
                <h4 className="text-[14px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  NON-METERED UPFRONT WATER CHARGE (ANNUAL — 12 MONTHS)
                </h4>
                <div className="bg-white rounded-lg border border-[#1f3a5f]/20 overflow-hidden">
                  <div className="bg-[#1f3a5f] grid grid-cols-[2.5fr_1.5fr_1fr_1.5fr] gap-2 px-4 py-2.5">
                    <p className="text-white text-[12px] font-semibold font-['Poppins',sans-serif]">Description</p>
                    <p className="text-white text-[12px] font-semibold font-['Poppins',sans-serif] text-center">Category</p>
                    <p className="text-white text-[12px] font-semibold font-['Poppins',sans-serif] text-center">Rate (₹/month)</p>
                    <p className="text-white text-[12px] font-semibold font-['Poppins',sans-serif] text-right">Annual Amount (₹)</p>
                  </div>
                  <div className="grid grid-cols-[2.5fr_1.5fr_1fr_1.5fr] gap-2 px-4 py-2.5 bg-white">
                    <p className="text-gray-900 text-[13px] font-medium font-['Poppins',sans-serif]">
                      Non-Metered Water Supply — Flat Rate × 12 Months
                    </p>
                    <p className="text-gray-700 text-[13px] font-['Poppins',sans-serif] text-center">{nonMeteredCategoryLabel}</p>
                    <p className="text-gray-500 text-[13px] font-['Poppins',sans-serif] text-center">₹{nonMeteredMonthlyRate.toFixed(2)}</p>
                    <p className="text-gray-900 text-[13px] font-semibold font-['Poppins',sans-serif] text-right">₹{nonMeteredAnnualRate.toFixed(2)}</p>
                  </div>
                  <div className="bg-[#eef2f7] border-t border-[#1f3a5f]/20 px-4 py-2">
                    <p className="text-[11px] text-[#1f3a5f] font-['Poppins',sans-serif] italic">
                      As per Government Order: Domestic ₹80 | Commercial ₹160 | Non-Domestic ₹120 | Industrial ₹320 per month × 12 months
                    </p>
                  </div>
                </div>

                {/* Grand Total including upfront charge */}
                <div className="mt-4 bg-[#1f3a5f]/10 border-2 border-[#1f3a5f] rounded-lg overflow-hidden">
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">Installation Charges</p>
                      <p className="text-[13px] font-semibold text-gray-900 font-['Poppins',sans-serif]">₹{totalAmount.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">Non-Metered Water Charge (12 Months — {nonMeteredCategoryLabel} @ ₹{nonMeteredMonthlyRate}/mo)</p>
                      <p className="text-[13px] font-semibold text-gray-900 font-['Poppins',sans-serif]">₹{nonMeteredAnnualRate.toFixed(2)}</p>
                    </div>
                    {penaltyAmt > 0 && (
                      <div className="flex justify-between items-center">
                        <p className="text-[13px] text-red-600 font-medium font-['Poppins',sans-serif]">Unauthorized Tap Penalty</p>
                        <p className="text-[13px] font-semibold text-red-600 font-['Poppins',sans-serif]">₹{penaltyAmt.toFixed(2)}</p>
                      </div>
                    )}
                    <div className="border-t border-[#1f3a5f]/30 pt-2 flex justify-between items-center">
                      <p className="text-[14px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">Grand Total Payable</p>
                      <p className="text-[16px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">₹{grandTotal.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Unauthorized Tap Penalty Section */}
            {penaltyAmt > 0 && !isChangeConnection && (
              <div className="mt-5 pt-4 border-t border-red-300">
                <h4 className="text-[14px] font-bold text-red-700 font-['Poppins',sans-serif] mb-3">
                  UNAUTHORIZED TAP CONNECTION — PENALTY
                </h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                  <p className="text-[13px] text-red-800 font-['Poppins',sans-serif] leading-relaxed">
                    During the field inspection, an <span className="font-bold">unauthorized tap connection</span> was identified at your property.
                    As per Government norms and the Karnataka Municipal Corporations Act, a penalty of <span className="font-bold">₹{penaltyAmt.toFixed(2)}</span> has been levied and added to the total payment due.
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
                  <div className="bg-red-600 grid grid-cols-[3fr_1.5fr] gap-2 px-4 py-2.5">
                    <p className="text-white text-[12px] font-semibold font-['Poppins',sans-serif]">Description</p>
                    <p className="text-white text-[12px] font-semibold font-['Poppins',sans-serif] text-right">Amount (₹)</p>
                  </div>
                  <div className="grid grid-cols-[3fr_1.5fr] gap-2 px-4 py-2.5 bg-white">
                    <p className="text-gray-900 text-[13px] font-medium font-['Poppins',sans-serif]">
                      Penalty for Unauthorized Tap Connection
                    </p>
                    <p className="text-red-700 text-[13px] font-bold font-['Poppins',sans-serif] text-right">₹{penaltyAmt.toFixed(2)}</p>
                  </div>
                  <div className="bg-red-50 border-t-2 border-red-400 grid grid-cols-[3fr_1.5fr] gap-2 px-4 py-3">
                    <p className="text-red-700 text-[13px] font-bold font-['Poppins',sans-serif]">Sub-Total (Penalty)</p>
                    <p className="text-red-700 text-[14px] font-bold font-['Poppins',sans-serif] text-right">₹{penaltyAmt.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="col-span-2 bg-white rounded-md p-4 mt-4 border border-[#1f3a5f]">
              <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">
                {(() => {
                  const parts = [];
                  parts.push('Installation');
                  if (isNonMetered && !isChangeConnection) parts.push('Upfront Water Charge');
                  if (penaltyAmt > 0 && !isChangeConnection) parts.push('Unauthorized Tap Penalty');
                  return parts.length > 1 ? 'Total Payable (' + parts.join(' + ') + ')' : 'Total Approved Amount';
                })()}
              </p>
              <p className="text-[24px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                ₹{grandTotal.toFixed(2)}
              </p>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                (Rupees {convertToWords(grandTotal)} Only)
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h4 className="text-[15px] font-bold text-gray-900 font-['Poppins',sans-serif] mb-3">
              Instructions for Payment:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-[14px] font-['Poppins',sans-serif] text-gray-900">
              <li>Please make the payment within 30 days from the date of this letter.</li>
              <li>Payment can be made online through the Jalanidhi portal or at designated government centers.</li>
              <li>Keep the payment receipt safe for future reference.</li>
              <li>{isChangeConnection ? 'Change of connection type work will commence within 7 working days after payment confirmation.' : 'Installation work will commence within 7 working days after payment confirmation.'}</li>
              <li>For any queries, please contact the helpdesk at 1800-XXX-XXXX.</li>
            </ol>
          </div>

          {/* Closing */}
          <div className="space-y-4 mb-8 text-[15px] font-['Poppins',sans-serif] text-gray-900">
            <p>
              We appreciate your patience throughout the application process and look forward to providing 
              you with quality water supply services.
            </p>
            <p>
              Thanking you,
            </p>
          </div>

          {/* Signature Section */}
          <div className="mt-12 flex justify-end">
            <div className="text-right">
              <div className="mb-4 bg-green-50 border-2 border-green-500 rounded-lg p-4 inline-block">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-[12px] font-bold text-green-700 font-['Poppins',sans-serif]">
                    DIGITALLY SIGNED
                  </p>
                </div>
                <p className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">
                  Signed on: {dscSignedDate.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">
                  Certificate ID: DSC-2026-COMM-{application.id.slice(-6).toUpperCase()}
                </p>
              </div>
              <div className="border-t-2 border-gray-800 pt-2 min-w-[250px]">
                <p className="text-[15px] font-bold text-gray-900 font-['Poppins',sans-serif]">
                  Commissioner
                </p>
                <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">
                  Department of Municipal Administration
                </p>
                <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">
                  Government of Karnataka
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-300 text-center">
            <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">
              This is a system-generated letter from the Jalanidhi Portal, Department of Municipal Administration, Government of Karnataka
            </p>
            <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] mt-1">
              For queries, visit: www.jalanidhi.karnataka.gov.in | Email: support@jalanidhi.karnataka.gov.in
            </p>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="bg-[#1f3a5f] px-6 py-4">
          <h2 className="text-xl font-semibold text-white font-['Poppins',sans-serif]">
            {isPaymentCompleted ? 'Payment Receipt' : 'Complete Your Payment'}
          </h2>
        </div>

        <div className="p-6">
          {isPaymentCompleted ? (
            // Show payment receipt when payment is completed
            <>
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold text-green-800 font-['Poppins',sans-serif]">
                      Payment Completed Successfully
                    </h3>
                    <p className="text-[13px] text-green-700 font-['Poppins',sans-serif]">
                      Your payment has been received and verified
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-[12px] text-gray-600 font-['Poppins',sans-serif] mb-1">Transaction ID</p>
                    <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                      {transactionId}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-[12px] text-gray-600 font-['Poppins',sans-serif] mb-1">Payment Date</p>
                    <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                      {paymentDate || currentDate}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-[12px] text-gray-600 font-['Poppins',sans-serif] mb-1">Amount Paid</p>
                    <p className="text-[16px] font-bold text-green-700 font-['Poppins',sans-serif]">
                      ₹{grandTotal.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-[12px] text-gray-600 font-['Poppins',sans-serif] mb-1">Payment Method</p>
                    <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                      Online
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-[14px] text-blue-800 font-['Poppins',sans-serif]">
                  {isChangeConnection
                    ? <>&#8505;&#65039; <span className="font-semibold">Next Steps:</span> The Commissioner will verify your payment and generate the change of connection type permission certificate. You will be notified once the certificate is ready. The plumber will proceed with the connection type change within 7 working days after certificate approval.</>
                    : <>&#8505;&#65039; <span className="font-semibold">Next Steps:</span> The Commissioner will verify your payment and generate the installation permission certificate. You will be notified once the certificate is ready. Installation work will commence within 7 working days after certificate approval.</>
                  }
                </p>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleDownload}
                  className="px-8 py-3 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#2c5282] transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Download Payment Letter
                </button>
                <button
                  onClick={handleDownload}
                  className="px-8 py-3 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#2c5282] transition-colors flex items-center gap-2 shadow-lg"
                >
                  <FileText className="w-5 h-5" />
                  Download Payment Receipt
                </button>
              </div>
            </>
          ) : (
            // Show payment interface when payment is pending
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-[14px] text-yellow-800 font-['Poppins',sans-serif]">
                  {isChangeConnection
                    ? <>&#9200; <span className="font-semibold">Important:</span> Please complete the payment within 30 days to proceed with the change of connection type. After successful payment, the plumber will proceed with the work within 7 working days.</>
                    : <>&#9200; <span className="font-semibold">Important:</span> Please complete the payment within 30 days to proceed with the installation. After successful payment, installation will commence within 7 working days.</>
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Application Number</p>
                  <p className="text-[16px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                    {applicationNo}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Service Type</p>
                  <p className="text-[16px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                    {isChangeConnection ? 'Change Connection Type' : 'New Tap Connection'}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Amount to Pay</p>
                  <p className="text-[20px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                    ₹{grandTotal.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-white border-2 border-[#1f3a5f] text-[#1f3a5f] rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Letter
                </button>

                <button
                  onClick={() => setShowPaymentPopup(true)}
                  disabled={processing}
                  className="px-8 py-3 bg-[#22c55e] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#16a34a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  {processing ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.928l3-2.647z"></path>
                    </svg>
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                  {processing ? 'Processing...' : 'Make Payment'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Popup */}
      {showPaymentPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-[500px]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
                Confirm Payment
              </h2>
              <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                {isChangeConnection
                  ? 'Proceed with online payment for change of connection type'
                  : 'Proceed with online payment for tap water connection'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-2">Payment Details:</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[14px] text-gray-700 font-['Poppins',sans-serif]">Application No:</span>
                  <span className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                    {applicationNo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] text-gray-700 font-['Poppins',sans-serif]">Service Type:</span>
                  <span className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                    {isChangeConnection ? 'Change Connection Type' : 'New Tap Connection'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-[15px] font-semibold text-gray-700 font-['Poppins',sans-serif]">Total Amount:</span>
                  <span className="text-[18px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-[12px] text-blue-800 font-['Poppins',sans-serif]">
                💳 <span className="font-semibold">Payment Gateway:</span> You will be redirected to a secure 
                payment gateway to complete your transaction. All payment methods including UPI, Net Banking, 
                Debit/Credit Cards are accepted.
              </p>
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => setShowPaymentPopup(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="px-6 py-2 bg-[#22c55e] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#16a34a] transition-colors flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to convert number to words
function convertToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (amount === 0) return 'Zero';

  let words = '';
  
  if (amount >= 100000) {
    words += ones[Math.floor(amount / 100000)] + ' Lakh ';
    amount %= 100000;
  }
  
  if (amount >= 1000) {
    const thousands = Math.floor(amount / 1000);
    if (thousands >= 10) {
      words += tens[Math.floor(thousands / 10)] + ' ';
      if (thousands % 10 !== 0) words += ones[thousands % 10] + ' ';
    } else {
      words += ones[thousands] + ' ';
    }
    words += 'Thousand ';
    amount %= 1000;
  }
  
  if (amount >= 100) {
    words += ones[Math.floor(amount / 100)] + ' Hundred ';
    amount %= 100;
  }
  
  if (amount >= 20) {
    words += tens[Math.floor(amount / 10)] + ' ';
    amount %= 10;
  } else if (amount >= 10) {
    words += teens[amount - 10] + ' ';
    amount = 0;
  }
  
  if (amount > 0) {
    words += ones[amount] + ' ';
  }
  
  return words.trim();
}
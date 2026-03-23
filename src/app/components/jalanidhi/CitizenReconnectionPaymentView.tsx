import { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, CreditCard, Download, FileText, Droplet, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface CitizenReconnectionPaymentViewProps {
  application: any;
  onBack: () => void;
}

function SectionDivider() {
  return <div className="border-t-2 border-[#e0e0e0] my-4"></div>;
}

export default function CitizenReconnectionPaymentView({ application, onBack }: CitizenReconnectionPaymentViewProps) {
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Check if payment is already completed
  // IMPORTANT: Application status is the primary source of truth.
  // If status is pending_payment/pendingPayment/sentToCitizenForPayment, citizen must pay first
  // regardless of any stale paymentDetails that may exist on the object.
  const isPendingPaymentStatus = application.status === 'pending_payment' || application.status === 'pendingPayment' || application.status === 'sentToCitizenForPayment';
  const isPaymentCompleted = !isPendingPaymentStatus && (
    application.status === 'payment_done' ||
    application.status === 'commissioner_payment_verification' ||
    (application.paymentDetails && application.paymentDetails.status === 'completed')
  );

  // Extract reconnection-specific data
  const rrData = application.rrData || {};
  const charges = application.charges || { reconnectionFee: 500, inspectionFee: 200, serviceTax: 105, total: 805 };
  const disconnection = application.disconnectionDetails;
  const arrears = application.arrearDetails;
  const reconnPayment = application.reconnectionPaymentDetails;
  const securityDeposit = application.securityDeposit || 350;
  const applicationFees = application.applicationFees || 500;

  // Calculate total amount
  const arrearAmount = arrears && arrears.totalArrears ? parseFloat(arrears.totalArrears) : 0;
  const totalPayment = charges.total + securityDeposit + arrearAmount;

  // Applicant info
  const applicantName = rrData.ownerName ||
    (application.applicantDetails && application.applicantDetails.applicantName ? application.applicantDetails.applicantName : 'N/A');
  const rrNumber = application.rrNumber || 'N/A';
  const applicationId = application.id || 'N/A';

  // Workflow trail
  const caseworkerWf = application.workflow && application.workflow.caseworker ? application.workflow.caseworker : null;
  const revenueOfficerWf = application.workflow && application.workflow.revenueOfficer ? application.workflow.revenueOfficer : null;
  const fieldEngineerWf = application.workflow && application.workflow.fieldEngineer ? application.workflow.fieldEngineer : null;
  const commissionerWf = application.workflow && application.workflow.commissioner ? application.workflow.commissioner : null;

  // Payment details (if already paid)
  const paymentDetails = application.paymentDetails;
  const transactionId = paymentDetails && paymentDetails.transactionId ? paymentDetails.transactionId : 'N/A';
  const paymentDate = paymentDetails && paymentDetails.paidAt
    ? new Date(paymentDetails.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePayment = async () => {
    setProcessing(true);
    setShowPaymentPopup(false);

    try {
      console.log('[CITIZEN RECON PAYMENT] Initiating payment:', {
        applicationId: application.id,
        amount: totalPayment,
      });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

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
            amount: totalPayment,
            paymentMethod: 'Online',
            transactionId: `TXN${Date.now()}`,
          }),
        }
      );

      const data = await response.json();
      console.log('[CITIZEN RECON PAYMENT] Payment response:', data);

      if (data.success) {
        alert('Payment Successful!\n\nYour reconnection payment has been received. The Commissioner will verify the payment and process your reconnection order. You will be notified once verified.');
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
    alert('Document downloaded successfully!');
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
        Back to Applications
      </button>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
          Tap Reconnection - Payment
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application No: <span className="font-semibold">{applicationId}</span> | RR Number: <span className="font-semibold">{rrNumber}</span>
        </p>
        <div className="mt-2 inline-flex items-center px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800 font-['Poppins',sans-serif] font-semibold text-[14px]">
            Application Approved by Commissioner
          </span>
        </div>
      </div>

      {/* Application Details Card */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Droplet className="w-6 h-6 text-[#1f3a5f]" />
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
            Reconnection Application Details
          </h2>
        </div>

        <div>
          {/* RR & Property Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">RR Number</p>
              <p className="text-[16px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">{rrNumber}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Owner Name</p>
              <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{applicantName}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Application Date</p>
              <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                {formatDate(application.createdAt || application.submittedAt || '')}
              </p>
            </div>
          </div>

          {/* Property Details */}
          <div className="mb-6">
            <h3 className="text-[15px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Property & Connection Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">District</p>
                <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {rrData.district || (application.propertyDetails && application.propertyDetails.district ? application.propertyDetails.district : 'N/A')}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">ULB Name</p>
                <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {rrData.ulb || (application.propertyDetails && application.propertyDetails.ulb ? application.propertyDetails.ulb : 'N/A')}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Meter Category</p>
                <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {rrData.meterCategory || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Connection Type</p>
                <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.existingConnection || 'Domestic'}
                </p>
              </div>
            </div>
          </div>

          <SectionDivider />

          {/* Disconnection Details */}
          {disconnection && (
            <div className="mb-6">
              <h3 className="text-[15px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Disconnection Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Reason for Disconnection</p>
                  <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {disconnection.disconnectionReason || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Disconnection Date</p>
                  <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {disconnection.disconnectionDate ? formatDate(disconnection.disconnectionDate) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Last Meter Reading</p>
                  <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {disconnection.lastMeterReading || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Arrear Details */}
          {arrears && (
            <>
              <SectionDivider />
              <div className="mb-6">
                <h3 className="text-[15px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Arrear Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Water Bill Arrears</p>
                    <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {arrears.waterBillArrears || 'Nil'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Penalty</p>
                    <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {arrears.penalty || 'Nil'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Total Arrears</p>
                    <p className="text-[14px] font-semibold text-red-700 font-['Poppins',sans-serif]">
                      {arrears.totalArrears ? `Rs. ${arrears.totalArrears}` : 'Nil'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Approval Letter Card */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
            Official Reconnection Approval Letter
          </h2>
          <div className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-md">
            <CheckCircle className="w-5 h-5 text-white" />
            <span className="text-white font-['Poppins',sans-serif] font-semibold text-[14px]">
              Digitally Signed
            </span>
          </div>
        </div>

        <div className="p-10 bg-white rounded-lg border border-gray-200">
          {/* Government Header */}
          <div className="text-center mb-8 border-b-2 border-[#1f3a5f] pb-6">
            <ImageWithFallback src="https://upload.wikimedia.org/wikipedia/commons/d/d3/Seal_of_Karnataka.png" alt="Government of Karnataka Seal" className="w-[80px] h-[80px] mx-auto mb-3 object-contain" />
            <div className="mb-4">
              <div className="text-[#1f3a5f] font-bold text-[24px] font-['Poppins',sans-serif]">
                &#x0C95;&#x0CB0;&#x0CCD;&#x0CA8;&#x0CBE;&#x0C9F;&#x0C95; &#x0CB8;&#x0CB0;&#x0CCD;&#x0C95;&#x0CBE;&#x0CB0;
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
              <p className="text-gray-600">Ref No: <span className="font-semibold text-gray-900">DMA/JN/RECON/{applicationId.slice(-8)}</span></p>
            </div>
            <div>
              <p className="text-gray-600">Date: <span className="font-semibold text-gray-900">
                {commissionerWf && commissionerWf.approvedAt ? formatDate(commissionerWf.approvedAt) : formatDate(new Date().toISOString())}
              </span></p>
            </div>
          </div>

          {/* Recipient */}
          <div className="mb-6">
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900 font-semibold">To,</p>
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900 mt-1 font-semibold">{applicantName}</p>
            <p className="text-[14px] font-['Poppins',sans-serif] text-gray-600 mt-1">
              RR Number: {rrNumber} | Application No: {applicationId}
            </p>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900">
              <span className="font-bold">Subject: </span>
              <span className="underline">Approval of Tap Water Reconnection - Payment Authorization</span>
            </p>
          </div>

          {/* Letter Body */}
          <div className="space-y-4 mb-6 text-[15px] font-['Poppins',sans-serif] text-gray-900 leading-relaxed text-justify">
            <p className="indent-12">
              Dear Sir/Madam,
            </p>
            <p className="indent-12">
              With reference to your application for Tap Water Reconnection under the Jalanidhi initiative,
              bearing Application ID <span className="font-semibold">{applicationId}</span> and
              RR Number <span className="font-semibold">{rrNumber}</span>, we are pleased to inform you that
              your application has been thoroughly reviewed and <span className="font-bold text-green-700">APPROVED</span> by
              the Commissioner of the Department of Municipal Administration, Government of Karnataka.
            </p>
            <p className="indent-12">
              After careful verification of all submitted documents, review of arrears and dues, site inspection by
              field engineers, and review by concerned authorities, it has been determined that your reconnection
              request meets all the necessary criteria as per government norms and regulations.
            </p>
            <p className="indent-12">
              You are hereby authorized to proceed with the payment of reconnection charges as detailed below.
              Upon receipt of payment, your water connection will be restored at the earliest.
            </p>
          </div>

          {/* Payment Details Box */}
          <div className="bg-blue-50 border-2 border-[#1f3a5f] rounded-lg p-6 mb-6">
            <h3 className="text-[16px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
              APPROVED PAYMENT DETAILS
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Application Number</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{applicationId}</p>
              </div>
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">RR Number</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{rrNumber}</p>
              </div>
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Service Type</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  Tap Water Reconnection
                </p>
              </div>
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Applicant Name</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{applicantName}</p>
              </div>
            </div>

            {/* Charges Breakdown */}
            <div className="bg-white rounded-md p-4 border border-gray-200 mb-4">
              <h4 className="text-[14px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Charges Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-[14px] font-['Poppins',sans-serif]">
                  <span className="text-gray-700">Reconnection Fee</span>
                  <span className="font-medium text-gray-900">Rs. {charges.reconnectionFee || 500}</span>
                </div>
                <div className="flex justify-between text-[14px] font-['Poppins',sans-serif]">
                  <span className="text-gray-700">Inspection Fee</span>
                  <span className="font-medium text-gray-900">Rs. {charges.inspectionFee || 200}</span>
                </div>
                <div className="flex justify-between text-[14px] font-['Poppins',sans-serif]">
                  <span className="text-gray-700">Service Tax</span>
                  <span className="font-medium text-gray-900">Rs. {charges.serviceTax || 105}</span>
                </div>
                <div className="flex justify-between text-[14px] font-['Poppins',sans-serif]">
                  <span className="text-gray-700">Security Deposit</span>
                  <span className="font-medium text-gray-900">Rs. {securityDeposit}</span>
                </div>
                {arrearAmount > 0 && (
                  <div className="flex justify-between text-[14px] font-['Poppins',sans-serif]">
                    <span className="text-red-700">Arrears (Outstanding Dues)</span>
                    <span className="font-medium text-red-700">Rs. {arrearAmount}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                  <span className="text-[15px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">Total Amount</span>
                  <span className="text-[18px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">Rs. {totalPayment.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Commissioner Remarks */}
          {commissionerWf && commissionerWf.remarks && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-[13px] font-semibold text-green-800 font-['Poppins',sans-serif] mb-1">Commissioner's Remarks:</p>
              <p className="text-[14px] text-green-700 font-['Poppins',sans-serif]">{commissionerWf.remarks}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="mb-6">
            <h4 className="text-[15px] font-bold text-gray-900 font-['Poppins',sans-serif] mb-3">
              Instructions for Payment:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-[14px] font-['Poppins',sans-serif] text-gray-900">
              <li>Please make the payment within 30 days from the date of this letter.</li>
              <li>Payment can be made online through the Jalanidhi portal.</li>
              <li>Keep the payment receipt safe for future reference.</li>
              <li>Reconnection work will commence within 5 working days after payment confirmation.</li>
              <li>For any queries, please contact the helpdesk at 1800-XXX-XXXX.</li>
            </ol>
          </div>

          {/* DSC Signature */}
          <div className="mt-10 flex justify-end">
            <div className="text-right">
              <div className="mb-4 bg-green-50 border-2 border-green-500 rounded-lg p-4 inline-block">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-[12px] font-bold text-green-700 font-['Poppins',sans-serif]">
                    DIGITALLY SIGNED
                  </p>
                </div>
                <p className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">
                  Signed on: {commissionerWf && commissionerWf.approvedAt ? formatDateTime(commissionerWf.approvedAt) : formatDateTime(new Date().toISOString())}
                </p>
                <p className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">
                  Certificate ID: DSC-2026-COMM-{applicationId.slice(-6).toUpperCase()}
                </p>
              </div>
              <div className="border-t-2 border-gray-800 pt-2 min-w-[250px]">
                <p className="text-[15px] font-bold text-gray-900 font-['Poppins',sans-serif]">Commissioner</p>
                <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">Department of Municipal Administration</p>
                <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">Government of Karnataka</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-gray-300 text-center">
            <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">
              This is a system-generated letter from the Jalanidhi Portal, Department of Municipal Administration, Government of Karnataka
            </p>
          </div>
        </div>
      </div>

      {/* Comments & History */}
      {(() => {
        const remarkEntries: RemarkEntry[] = [];
        if (caseworkerWf && (caseworkerWf.comment || caseworkerWf.comments)) {
          remarkEntries.push({ role: 'Caseworker', comment: caseworkerWf.comment || caseworkerWf.comments || '', timestamp: caseworkerWf.timestamp || '' });
        }
        if (revenueOfficerWf && (revenueOfficerWf.comment || revenueOfficerWf.comments)) {
          remarkEntries.push({ role: 'Revenue Officer', comment: revenueOfficerWf.comment || revenueOfficerWf.comments || '', timestamp: revenueOfficerWf.timestamp || '' });
        }
        if (fieldEngineerWf && (fieldEngineerWf.comment || fieldEngineerWf.comments)) {
          const feComment = (fieldEngineerWf.comment || fieldEngineerWf.comments || '') +
            (fieldEngineerWf.assignedPlumber ? ' (Assigned Plumber: ' + fieldEngineerWf.assignedPlumber + ')' : '');
          remarkEntries.push({ role: 'Field Engineer', comment: feComment, timestamp: fieldEngineerWf.timestamp || '' });
        }
        if (commissionerWf && (commissionerWf.remarks || commissionerWf.comments)) {
          remarkEntries.push({ role: 'Commissioner', comment: commissionerWf.remarks || commissionerWf.comments || '', timestamp: commissionerWf.approvedAt || commissionerWf.timestamp || '', variant: 'approved' });
        }
        return remarkEntries.length > 0 ? (
          <div className="mb-6">
            <RemarksTimeline remarks={remarkEntries} title="Comments & History" />
          </div>
        ) : null;
      })()}

      {/* Payment Section */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="bg-[#1f3a5f] px-6 py-4">
          <h2 className="text-xl font-semibold text-white font-['Poppins',sans-serif]">
            {isPaymentCompleted ? 'Payment Receipt' : 'Complete Your Payment'}
          </h2>
        </div>

        <div className="p-6">
          {isPaymentCompleted ? (
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
                      Your reconnection payment has been received and verified
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-[12px] text-gray-600 font-['Poppins',sans-serif] mb-1">Transaction ID</p>
                    <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{transactionId}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-[12px] text-gray-600 font-['Poppins',sans-serif] mb-1">Payment Date</p>
                    <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{paymentDate || 'N/A'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-[12px] text-gray-600 font-['Poppins',sans-serif] mb-1">Amount Paid</p>
                    <p className="text-[16px] font-bold text-green-700 font-['Poppins',sans-serif]">Rs. {totalPayment.toFixed(2)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-[12px] text-gray-600 font-['Poppins',sans-serif] mb-1">Payment Method</p>
                    <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">Online</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-[14px] text-blue-800 font-['Poppins',sans-serif]">
                    <span className="font-semibold">Next Steps:</span> The Commissioner will verify your payment
                    and process the reconnection order. Your water connection will be restored within
                    5 working days after verification.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleDownload}
                  className="px-8 py-3 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#2c5282] transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Download Approval Letter
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
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                  <p className="text-[14px] text-yellow-800 font-['Poppins',sans-serif]">
                    <span className="font-semibold">Important:</span> Please complete the payment within 30 days
                    to proceed with the reconnection. After successful payment, your water connection will be
                    restored within 5 working days.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Application Number</p>
                  <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{applicationId}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Service Type</p>
                  <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">Tap Reconnection</p>
                </div>
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Amount to Pay</p>
                  <p className="text-[20px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                    Rs. {totalPayment.toFixed(2)}
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
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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

      {/* Payment Confirmation Popup */}
      {showPaymentPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-[520px]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
                Confirm Reconnection Payment
              </h2>
              <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                Proceed with online payment for tap water reconnection
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-3">Payment Summary:</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[14px] text-gray-700 font-['Poppins',sans-serif]">Application No:</span>
                  <span className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{applicationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] text-gray-700 font-['Poppins',sans-serif]">RR Number:</span>
                  <span className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{rrNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] text-gray-700 font-['Poppins',sans-serif]">Service Type:</span>
                  <span className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">Tap Reconnection</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between text-[13px] font-['Poppins',sans-serif] text-gray-600">
                    <span>Reconnection Charges</span>
                    <span>Rs. {charges.total}</span>
                  </div>
                  <div className="flex justify-between text-[13px] font-['Poppins',sans-serif] text-gray-600">
                    <span>Security Deposit</span>
                    <span>Rs. {securityDeposit}</span>
                  </div>
                  {arrearAmount > 0 && (
                    <div className="flex justify-between text-[13px] font-['Poppins',sans-serif] text-red-600">
                      <span>Arrears</span>
                      <span>Rs. {arrearAmount}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-[15px] font-semibold text-gray-700 font-['Poppins',sans-serif]">Total Amount:</span>
                  <span className="text-[18px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                    Rs. {totalPayment.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-[12px] text-blue-800 font-['Poppins',sans-serif]">
                <span className="font-semibold">Payment Gateway:</span> You will be redirected to a secure
                payment gateway. All payment methods including UPI, Net Banking,
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
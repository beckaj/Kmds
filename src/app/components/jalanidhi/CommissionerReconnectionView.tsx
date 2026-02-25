import { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, XCircle, RotateCcw, Shield, FileText, Download } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface CommissionerReconnectionViewProps {
  applicationId: string;
  onBack: () => void;
}

// Default sample data for when actual values are missing
const sampleData: Record<string, string> = {
  'District': 'Dharwad',
  'ULB': 'Hubballi-Dharwad',
  'ULB Type': 'City Corporation',
  'Authority Type': 'Board',
  'Owner Name': 'Rajesh Kumar Sharma',
  'Door Number': '42/3A',
  'Ward Number': '15',
  'Street': 'MG Road, 4th Cross',
  'Address': '42/3A, MG Road, 4th Cross, Indiranagar',
  'City': 'Hubballi',
  'State': 'Karnataka',
  'Pincode': '560038',
  'Mobile No': '9876543210',
  'Connection Type': 'Domestic',
  'Meter Category': 'Metered',
  'Meter Status': 'Working',
  'Meter Installed Date': '15/03/2019',
  'Scheme Name': 'Cauvery Water Supply',
  'Disconnection Reason': 'Non-payment of dues',
  'Date of Approval': '22/08/2024',
  'Current Demand': '2,450',
  'Arrears': '8,750',
  'Total Bill': '11,200',
  'Service Applied For': 'Tap Reconnection',
  'Payment Date': '05/01/2025',
  'Order No': 'ORD-2025-00312',
  'Transaction No': 'TXN-78452196',
  'Payment Status': 'Paid',
  'Total Demand': '11,200',
  'Reconnection Reason': 'Cleared all pending dues',
  'Application Fees': 'Rs.500',
  'Existing Connection': 'Domestic',
  'New Connection': 'Commercial',
  'Security Deposit': '5000',
};

// Reusable read-only field display
function ReadOnlyField({ label, value }: { label: string; value: string | number | undefined | null }) {
  const displayValue = (value !== undefined && value !== null && value !== '')
    ? String(value)
    : (sampleData[label] || 'N/A');
  return (
    <div className="flex flex-col gap-[6px] min-w-0">
      <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
        {label}
      </p>
      <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141]">
        {displayValue}
      </p>
    </div>
  );
}

function SectionDivider() {
  return <div className="w-full border-t border-[#dee2e6]" />;
}

export default function CommissionerReconnectionView({ applicationId, onBack }: CommissionerReconnectionViewProps) {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [commissionerRemarks, setCommissionerRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [sendBackTo, setSendBackTo] = useState('Field Engineer');
  const [activeAction, setActiveAction] = useState<'approve' | 'sendBack' | 'reject' | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);
  const [completedAction, setCompletedAction] = useState('');
  const [endorsementData, setEndorsementData] = useState<any>(null);
  const [showEndorsementLetter, setShowEndorsementLetter] = useState(false);

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      console.log('[COMMISSIONER RECON VIEW] Loading application:', applicationId);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/application/${applicationId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('[COMMISSIONER RECON VIEW] API Error:', response.statusText);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[COMMISSIONER RECON VIEW] Application loaded:', data);

      if (data.success && data.application) {
        setApplication(data.application);

        // Check if already processed
        const commWf = data.application.workflow && data.application.workflow.commissioner;
        if (commWf && (commWf.status === 'approved' || commWf.status === 'rejected' || commWf.status === 'sent_back')) {
          setActionCompleted(true);
          if (commWf.status === 'approved') {
            setCompletedAction('approved');
          } else if (commWf.status === 'rejected') {
            setCompletedAction('rejected');
            if (data.application.endorsementLetter) {
              setEndorsementData(data.application.endorsementLetter);
            }
          } else if (commWf.status === 'sent_back') {
            setCompletedAction('sent_back');
          }
        }
        if (data.application.status === 'sentToCitizenForPayment') {
          setActionCompleted(true);
          setCompletedAction('approved');
        }
      } else {
        console.error('[COMMISSIONER RECON VIEW] Error:', data.error);
      }
    } catch (error) {
      console.error('[COMMISSIONER RECON VIEW] Error loading application:', error);
    } finally {
      setLoading(false);
    }
  };

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
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleActionClick = (action: 'approve' | 'sendBack' | 'reject') => {
    if (!commissionerRemarks.trim()) {
      alert('Please enter your remarks before proceeding.');
      return;
    }
    if (commissionerRemarks.trim().length < 10) {
      alert('Remarks must be at least 10 characters.');
      return;
    }
    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    setActiveAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!activeAction) return;
    setShowConfirmModal(false);
    setProcessing(true);

    try {
      let endpoint = '';
      let body: any = { applicationId: application.id, remarks: commissionerRemarks };

      if (activeAction === 'approve') {
        endpoint = '/commissioner/reconnection/approve';
      } else if (activeAction === 'sendBack') {
        endpoint = '/commissioner/reconnection/send-back';
        body.sendBackTo = sendBackTo;
      } else if (activeAction === 'reject') {
        endpoint = '/commissioner/reconnection/reject';
        body.rejectionReason = rejectionReason;
      }

      console.log(`[COMMISSIONER] ${activeAction} reconnection:`, body);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log(`[COMMISSIONER] ${activeAction} successful:`, data);
        setActionCompleted(true);

        if (activeAction === 'approve') {
          setCompletedAction('approved');
          alert(`Application ${application.id} approved and sent to citizen for payment.`);
        } else if (activeAction === 'sendBack') {
          setCompletedAction('sent_back');
          alert(`Application ${application.id} sent back to ${sendBackTo} for corrections.`);
        } else if (activeAction === 'reject') {
          setCompletedAction('rejected');
          if (data.endorsementNo) {
            setEndorsementData({
              endorsementNo: data.endorsementNo,
              applicantName: application.applicantDetails && application.applicantDetails.applicantName ? application.applicantDetails.applicantName : (application.rrData && application.rrData.ownerName ? application.rrData.ownerName : 'N/A'),
              applicationId: application.id,
              rrNumber: application.rrNumber || 'N/A',
              rejectionReason: rejectionReason,
              commissionerRemarks: commissionerRemarks,
              generatedAt: new Date().toISOString(),
              dscSigned: true,
              dscSignedAt: new Date().toISOString()
            });
          }
          alert(`Application ${application.id} rejected. Endorsement letter generated with DSC sign.`);
        }

        // Reload application data
        await loadApplication();
      } else {
        console.error(`[COMMISSIONER] ${activeAction} failed:`, data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(`[COMMISSIONER] Error during ${activeAction}:`, error);
      alert(`Error processing request: ${error}`);
    } finally {
      setProcessing(false);
      setActiveAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-['Poppins',sans-serif]">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <p className="text-red-600 font-['Poppins',sans-serif]">Application not found</p>
      </div>
    );
  }

  // Helpers for reconnection data
  const rrData = application.rrData || {};
  const disconnection = application.disconnectionDetails;
  const arrears = application.arrearDetails;
  const payment = application.reconnectionPaymentDetails;
  const caseworkerWorkflow = application.workflow && application.workflow.caseworker ? application.workflow.caseworker : null;
  const revenueOfficerWorkflow = application.workflow && application.workflow.revenueOfficer ? application.workflow.revenueOfficer : null;
  const fieldEngineerWorkflow = application.workflow && application.workflow.fieldEngineer ? application.workflow.fieldEngineer : null;
  const commissionerWorkflow = application.workflow && application.workflow.commissioner ? application.workflow.commissioner : null;

  // Endorsement Letter Modal
  if (showEndorsementLetter && endorsementData) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        <button
          onClick={() => setShowEndorsementLetter(false)}
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Application
        </button>

        <div className="bg-white rounded-lg shadow-lg max-w-[800px] mx-auto p-10">
          {/* Letter Header */}
          <div className="text-center border-b-2 border-[#1f3a5f] pb-6 mb-6">
            <h1 className="text-[22px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] uppercase tracking-wide">
              Department of Municipal Administration
            </h1>
            <h2 className="text-[16px] font-semibold text-[#414141] font-['Poppins',sans-serif] mt-1">
              Government of Karnataka
            </h2>
            <p className="text-[14px] text-gray-600 font-['Poppins',sans-serif] mt-2">
              Jalanidhi - Water Supply Management System
            </p>
            <div className="mt-4 bg-red-50 border border-red-300 rounded-md px-4 py-2 inline-block">
              <p className="text-red-700 font-bold text-[16px] font-['Poppins',sans-serif]">
                ENDORSEMENT LETTER - REJECTION ORDER
              </p>
            </div>
          </div>

          {/* Letter Details */}
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">Endorsement No.</p>
                <p className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                  {endorsementData.endorsementNo}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">Date</p>
                <p className="text-[15px] font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  {formatDate(endorsementData.generatedAt)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">Application ID</p>
                <p className="text-[15px] font-medium text-[#414141] font-['Poppins',sans-serif]">
                  {endorsementData.applicationId}
                </p>
              </div>
              <div>
                <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">RR Number</p>
                <p className="text-[15px] font-medium text-[#414141] font-['Poppins',sans-serif]">
                  {endorsementData.rrNumber}
                </p>
              </div>
            </div>
          </div>

          <SectionDivider />

          {/* Letter Body */}
          <div className="my-6 space-y-4">
            <p className="text-[14px] text-[#414141] font-['Poppins',sans-serif] leading-relaxed">
              <span className="font-semibold">To,</span><br />
              <span className="font-medium">{endorsementData.applicantName}</span><br />
              {application.rrData && application.rrData.address ? application.rrData.address : 'Address on record'}
            </p>

            <p className="text-[14px] text-[#414141] font-['Poppins',sans-serif] leading-relaxed mt-4">
              <span className="font-semibold">Subject:</span> Rejection of Tap Reconnection Application - {endorsementData.applicationId}
            </p>

            <p className="text-[14px] text-[#414141] font-['Poppins',sans-serif] leading-relaxed mt-4">
              Dear Sir/Madam,
            </p>

            <p className="text-[14px] text-[#414141] font-['Poppins',sans-serif] leading-relaxed">
              With reference to your application for Tap Reconnection bearing Application ID: <span className="font-semibold">{endorsementData.applicationId}</span> and RR Number: <span className="font-semibold">{endorsementData.rrNumber}</span>, it is to inform you that after due verification and review by the concerned authorities, your application has been <span className="font-bold text-red-700">REJECTED</span> for the following reason(s):
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-[13px] font-semibold text-red-800 font-['Poppins',sans-serif] mb-2">
                Reason for Rejection:
              </p>
              <p className="text-[14px] text-red-700 font-['Poppins',sans-serif] leading-relaxed">
                {endorsementData.rejectionReason}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
              <p className="text-[13px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">
                Commissioner's Remarks:
              </p>
              <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">
                {endorsementData.commissionerRemarks}
              </p>
            </div>

            <p className="text-[14px] text-[#414141] font-['Poppins',sans-serif] leading-relaxed mt-4">
              You may re-apply after addressing the above concerns. For any queries, please contact the Municipal Administration office during working hours.
            </p>
          </div>

          <SectionDivider />

          {/* DSC Section */}
          <div className="mt-6 flex justify-between items-end">
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                This is a digitally signed document.
              </p>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                No physical signature required.
              </p>
            </div>
            <div className="text-right">
              <div className="border-2 border-[#1f3a5f] rounded-lg p-4 bg-blue-50 inline-block">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-[#1f3a5f]" />
                  <span className="text-[13px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                    Digitally Signed
                  </span>
                </div>
                <p className="text-[12px] text-[#414141] font-['Poppins',sans-serif]">
                  Commissioner / Chief Officer
                </p>
                <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">
                  DSC Signed: {formatDateTime(endorsementData.dscSignedAt)}
                </p>
                <p className="text-[11px] text-green-600 font-['Poppins',sans-serif] font-semibold mt-1">
                  Signature Valid
                </p>
              </div>
            </div>
          </div>

          {/* Print / Download */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-[#2d4a6f] transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download / Print
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={processing}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-[#414141] font-['Poppins',sans-serif] mb-2">
          Review Reconnection Application
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{application.id}</span>
        </p>
        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mt-1">
          Submitted on: {formatDate(application.submittedAt)}
        </p>
      </div>

      {/* ========================= APPLICATION DETAILS CARD ========================= */}
      <div className="bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] p-6 mb-6">
        <div className="flex flex-col gap-[24px]">

          {/* RR Number */}
          <div className="flex flex-col gap-[12px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[20px] text-[#414141]">
              RR Number
            </h2>
            <p className="font-['Poppins',sans-serif] font-medium text-[16px] text-[#1f3a5f]">
              {application.rrNumber || 'RR-2024-KA-004521'}
            </p>
          </div>

          {/* Applicant Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Applicant Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="District" value={rrData.district} />
              <ReadOnlyField label="ULB" value={rrData.ulb} />
              <ReadOnlyField label="ULB Type" value={rrData.ulbType} />
              <ReadOnlyField label="Authority Type" value={rrData.authorityType} />
            </div>
          </div>

          {/* Property Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Property Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="Owner Name" value={rrData.ownerName} />
              <ReadOnlyField label="Door Number" value={rrData.doorNumber} />
              <ReadOnlyField label="Ward Number" value={rrData.wardNumber} />
              <ReadOnlyField label="Street" value={rrData.street} />
              <ReadOnlyField label="Address" value={rrData.address} />
              <ReadOnlyField label="City" value={rrData.city} />
              <ReadOnlyField label="District" value={rrData.district} />
              <ReadOnlyField label="State" value={rrData.state} />
              <ReadOnlyField label="Pincode" value={rrData.pincode} />
              <ReadOnlyField label="Mobile No" value={rrData.mobileNo} />
            </div>
          </div>

          <SectionDivider />

          {/* Connection Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Connection Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="Connection Type" value={rrData.connectionType} />
              <ReadOnlyField label="Meter Category" value={rrData.meterCategory} />
              <ReadOnlyField label="Meter Status" value={rrData.motorStatus} />
              <ReadOnlyField label="Meter Installed Date" value={rrData.meterInstalledDate} />
              <ReadOnlyField label="Scheme Name" value={rrData.schemeName} />
            </div>
          </div>

          <SectionDivider />

          {/* UGD Connection */}
          <div className="flex flex-col gap-[12px]">
            <p className="font-['Poppins',sans-serif] font-medium text-[16px] text-[#414141]">
              Is there any UGD Connection Linked?
            </p>
            <p className="font-['Poppins',sans-serif] font-medium text-[16px] text-[#263238]">
              {application.hasUGDConnection === 'yes' ? 'Yes' : application.hasUGDConnection === 'no' ? 'No' : 'Yes'}
            </p>
          </div>

          <SectionDivider />

          {/* Disconnection Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Disconnection Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="Disconnection Reason" value={disconnection && disconnection.disconnectionReason ? disconnection.disconnectionReason : undefined} />
              <ReadOnlyField label="Date of Approval" value={disconnection && disconnection.dateOfApproval ? disconnection.dateOfApproval : undefined} />
            </div>
          </div>

          {/* Current Arrears Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Current Arrears Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="Current Demand" value={arrears && arrears.currentDemand !== undefined ? arrears.currentDemand : undefined} />
              <ReadOnlyField label="Arrears" value={arrears && arrears.arrears !== undefined ? arrears.arrears : undefined} />
              <ReadOnlyField label="Total Bill" value={arrears && arrears.totalBill !== undefined ? arrears.totalBill : undefined} />
            </div>
          </div>

          {/* Payment Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Payment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="Service Applied For" value={payment && payment.serviceAppliedFor ? payment.serviceAppliedFor : undefined} />
              <ReadOnlyField label="Payment Date" value={payment && payment.paymentDate ? payment.paymentDate : undefined} />
              <ReadOnlyField label="Order No" value={payment && payment.orderNo ? payment.orderNo : undefined} />
              <ReadOnlyField label="Transaction No" value={payment && payment.transactionNo ? payment.transactionNo : undefined} />
              <ReadOnlyField label="Payment Status" value={payment && payment.paymentStatus ? payment.paymentStatus : undefined} />
              <ReadOnlyField label="Current Demand" value={payment && payment.currentDemand !== undefined ? payment.currentDemand : undefined} />
              <ReadOnlyField label="Arrears" value={payment && payment.arrears !== undefined ? payment.arrears : undefined} />
              <ReadOnlyField label="Total Demand" value={payment && payment.totalDemand !== undefined ? payment.totalDemand : undefined} />
            </div>
          </div>
        </div>
      </div>

      {/* ========================= RECONNECTION DETAILS CARD ========================= */}
      <div className="bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] p-6 mb-6">
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Reconnection Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="Reconnection Reason" value={application.reconnectionReason} />
              <ReadOnlyField label="Application Fees" value={application.applicationFees !== undefined && application.applicationFees !== null ? `Rs.${application.applicationFees}` : undefined} />
            </div>
          </div>

          <SectionDivider />

          <div className="flex flex-col gap-[12px]">
            <p className="font-['Poppins',sans-serif] font-semibold text-[16px] text-[#414141]">
              Do you want to change the Connection Type?
            </p>
            <p className="font-['Poppins',sans-serif] font-medium text-[18px] text-[#263238]">
              {application.wantToChangeConnectionType === 'yes' ? 'Yes' : application.wantToChangeConnectionType === 'no' ? 'No' : 'Yes'}
            </p>
          </div>

          {application.wantToChangeConnectionType !== 'no' && (
            <div className="flex flex-col gap-[16px]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[16px]">
                <ReadOnlyField label="Existing Connection" value={application.existingConnection} />
                <ReadOnlyField label="New Connection" value={application.newConnectionType} />
                <ReadOnlyField label="Security Deposit" value={application.securityDeposit !== undefined && application.securityDeposit !== null ? String(application.securityDeposit) : undefined} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================= CONSOLIDATED REMARKS ========================= */}
      {(() => {
        const remarkEntries: RemarkEntry[] = [];
        const cwComment = caseworkerWorkflow && caseworkerWorkflow.comments ? caseworkerWorkflow.comments : (application.caseworkerComments || '');
        if (cwComment) {
          remarkEntries.push({ role: 'Caseworker', comment: cwComment, timestamp: caseworkerWorkflow && caseworkerWorkflow.timestamp ? caseworkerWorkflow.timestamp : '' });
        }
        const roComment = revenueOfficerWorkflow && revenueOfficerWorkflow.comments ? revenueOfficerWorkflow.comments : (application.revenueOfficerComments || '');
        if (roComment) {
          remarkEntries.push({ role: 'Revenue Officer', comment: roComment, timestamp: revenueOfficerWorkflow && revenueOfficerWorkflow.timestamp ? revenueOfficerWorkflow.timestamp : '' });
        }
        const feComment = fieldEngineerWorkflow && fieldEngineerWorkflow.comments ? fieldEngineerWorkflow.comments : (application.fieldEngineerComments || '');
        if (feComment) {
          remarkEntries.push({ role: 'Field Engineer', comment: feComment, timestamp: fieldEngineerWorkflow && fieldEngineerWorkflow.timestamp ? fieldEngineerWorkflow.timestamp : '' });
        }
        return remarkEntries.length > 0 ? (
          <div className="mb-6">
            <RemarksTimeline remarks={remarkEntries} title="Remarks" />
          </div>
        ) : null;
      })()}

      {/* ========================= COMMISSIONER DECISION CARD ========================= */}
      <div className="bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] p-6 mb-6">
        <div className="bg-[#1f3a5f] rounded-t-[8px] -mt-6 -mx-6 px-6 py-4 mb-6">
          <h2 className="text-xl font-semibold text-white font-['Poppins',sans-serif]">
            Commissioner's Decision
          </h2>
        </div>

        {actionCompleted ? (
          /* ---- ALREADY PROCESSED ---- */
          <div>
            {completedAction === 'approved' && (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#4caf50] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-['Poppins',sans-serif] font-bold text-[18px] text-[#2e7d32]">
                      Application Approved
                    </p>
                    <p className="font-['Poppins',sans-serif] text-[14px] text-[#558b2f]">
                      Application has been approved and sent to citizen for payment
                    </p>
                  </div>
                </div>
                {commissionerWorkflow && commissionerWorkflow.remarks && (
                  <div className="mt-3 pt-3 border-t border-green-300">
                    <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#2e7d32] mb-1">Commissioner's Remarks</p>
                    <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141] bg-white rounded-[6px] p-3 border border-[#c8e6c9]">
                      {commissionerWorkflow.remarks}
                    </p>
                  </div>
                )}
                {commissionerWorkflow && commissionerWorkflow.approvedAt && (
                  <p className="text-[13px] text-[#558b2f] font-['Poppins',sans-serif] mt-3">
                    Approved on: {formatDateTime(commissionerWorkflow.approvedAt)}
                  </p>
                )}
              </div>
            )}

            {completedAction === 'sent_back' && (
              <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#1f3a5f] rounded-full flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-['Poppins',sans-serif] font-bold text-[18px] text-[#1f3a5f]">
                      Application Sent Back for Correction
                    </p>
                    <p className="font-['Poppins',sans-serif] text-[14px] text-[#364e6b]">
                      Sent back to: {commissionerWorkflow && commissionerWorkflow.sentBackTo ? commissionerWorkflow.sentBackTo : 'Field Engineer'}
                    </p>
                  </div>
                </div>
                {commissionerWorkflow && commissionerWorkflow.remarks && (
                  <div className="mt-3 pt-3 border-t border-orange-300">
                    <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#1f3a5f] mb-1">Commissioner's Remarks</p>
                    <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141] bg-white rounded-[6px] p-3 border border-orange-200">
                      {commissionerWorkflow.remarks}
                    </p>
                  </div>
                )}
                {commissionerWorkflow && commissionerWorkflow.sentBackAt && (
                  <p className="text-[13px] text-[#364e6b] font-['Poppins',sans-serif] mt-3">
                    Sent back on: {formatDateTime(commissionerWorkflow.sentBackAt)}
                  </p>
                )}
              </div>
            )}

            {completedAction === 'rejected' && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#d32f2f] rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-['Poppins',sans-serif] font-bold text-[18px] text-[#c62828]">
                      Application Rejected
                    </p>
                    <p className="font-['Poppins',sans-serif] text-[14px] text-[#b71c1c]">
                      Endorsement letter generated with DSC signature
                    </p>
                  </div>
                </div>
                {commissionerWorkflow && commissionerWorkflow.remarks && (
                  <div className="mt-3 pt-3 border-t border-red-300">
                    <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#c62828] mb-1">Commissioner's Remarks</p>
                    <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141] bg-white rounded-[6px] p-3 border border-red-200">
                      {commissionerWorkflow.remarks}
                    </p>
                  </div>
                )}
                {commissionerWorkflow && commissionerWorkflow.endorsementNo && (
                  <div className="mt-4 flex items-center gap-3">
                    <p className="text-[13px] text-[#b71c1c] font-['Poppins',sans-serif]">
                      Endorsement No: <span className="font-semibold">{commissionerWorkflow.endorsementNo}</span>
                    </p>
                    <button
                      onClick={() => setShowEndorsementLetter(true)}
                      className="px-4 py-2 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-medium text-[13px] hover:bg-[#2d4a6f] transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View Endorsement Letter
                    </button>
                  </div>
                )}
                {endorsementData && !(commissionerWorkflow && commissionerWorkflow.endorsementNo) && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowEndorsementLetter(true)}
                      className="px-4 py-2 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-medium text-[13px] hover:bg-[#2d4a6f] transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View Endorsement Letter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ---- PENDING DECISION ---- */
          <div className="space-y-6">
            {/* Remarks */}
            <div>
              <label className="block text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-2">
                Remarks <span className="text-red-600">*</span>
              </label>
              <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-3">
                Provide your decision remarks (minimum 10 characters required)
              </p>
              <textarea
                value={commissionerRemarks}
                onChange={(e) => setCommissionerRemarks(e.target.value)}
                placeholder="Enter your remarks about the reconnection application..."
                className="w-full min-h-[100px] px-4 py-3 font-['Poppins',sans-serif] text-[14px] text-[#170f49] border-2 border-[#1f3a5f] rounded-lg outline-none resize-vertical"
                rows={4}
              />
              <p className="text-xs text-gray-400 font-['Poppins',sans-serif] mt-1">
                Characters: {commissionerRemarks.length} (Min 10)
              </p>
            </div>

            {/* Rejection Reason (conditional - shown when reject mode is active) */}
            {activeAction === 'reject' && (
              <div>
                <label className="block text-base font-semibold text-red-700 font-['Poppins',sans-serif] mb-2">
                  Rejection Reason <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter the specific reason for rejecting this application..."
                  className="w-full min-h-[80px] px-4 py-3 font-['Poppins',sans-serif] text-[14px] text-[#170f49] border-2 border-red-400 rounded-lg outline-none resize-vertical"
                  rows={3}
                />
                {rejectionReason.trim() && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleActionClick('reject')}
                      disabled={processing}
                      className="px-6 py-2 bg-red-600 text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Left: Send Back */}
                <div className="flex items-center gap-3">
                  <select
                    value={sendBackTo}
                    onChange={(e) => setSendBackTo(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md font-['Poppins',sans-serif] text-[13px] text-[#414141] outline-none"
                  >
                    <option value="Field Engineer">Field Engineer</option>
                    <option value="Revenue Officer">Revenue Officer</option>
                    <option value="Caseworker">Caseworker</option>
                  </select>
                  <button
                    onClick={() => handleActionClick('sendBack')}
                    disabled={processing}
                    className="px-6 py-3 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-[#2c5282] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Send Back
                  </button>
                </div>

                {/* Right: Reject & Approve */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveAction('reject');
                      if (commissionerRemarks.trim().length >= 10 && rejectionReason.trim()) {
                        handleActionClick('reject');
                      } else if (!rejectionReason.trim()) {
                        // Show rejection reason field
                      }
                    }}
                    disabled={processing}
                    className="px-6 py-3 bg-white border-2 border-red-600 text-red-600 rounded-md font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject & Generate Endorsement
                  </button>

                  <button
                    onClick={() => handleActionClick('approve')}
                    disabled={processing}
                    className="px-8 py-3 bg-[#22c55e] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-[#16a34a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    {processing && activeAction === 'approve' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Approve & Allow Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================= CONFIRMATION MODAL ========================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-[480px] max-w-[90vw]">
            <div className="flex items-center gap-3 mb-4">
              {activeAction === 'approve' && <CheckCircle className="w-8 h-8 text-green-600" />}
              {activeAction === 'sendBack' && <RotateCcw className="w-8 h-8 text-orange-600" />}
              {activeAction === 'reject' && <XCircle className="w-8 h-8 text-red-600" />}
              <h2 className={`text-xl font-bold font-['Poppins',sans-serif] ${
                activeAction === 'approve' ? 'text-green-600' :
                activeAction === 'sendBack' ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {activeAction === 'approve' ? 'Confirm Approval' :
                 activeAction === 'sendBack' ? 'Confirm Send Back' :
                 'Confirm Rejection'}
              </h2>
            </div>

            <div className="space-y-3 mb-6">
              {activeAction === 'approve' && (
                <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                  Are you sure you want to <span className="font-bold text-green-700">approve</span> this reconnection application? The citizen will be notified to make payment.
                </p>
              )}
              {activeAction === 'sendBack' && (
                <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                  Are you sure you want to <span className="font-bold text-orange-700">send back</span> this application to <span className="font-semibold">{sendBackTo}</span> for corrections?
                </p>
              )}
              {activeAction === 'reject' && (
                <>
                  <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                    Are you sure you want to <span className="font-bold text-red-700">reject</span> this reconnection application? An endorsement letter with your digital signature will be generated.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-[12px] text-red-600 font-['Poppins',sans-serif]">
                      This action cannot be undone.
                    </p>
                  </div>
                </>
              )}

              <div className="bg-gray-50 rounded-md p-3 mt-3">
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Your Remarks:</p>
                <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">{commissionerRemarks}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setActiveAction(null);
                }}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={processing}
                className={`px-5 py-2 text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[14px] transition-colors disabled:opacity-50 ${
                  activeAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  activeAction === 'sendBack' ? 'bg-orange-600 hover:bg-orange-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing ? 'Processing...' :
                 activeAction === 'approve' ? 'Yes, Approve' :
                 activeAction === 'sendBack' ? 'Yes, Send Back' :
                 'Yes, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
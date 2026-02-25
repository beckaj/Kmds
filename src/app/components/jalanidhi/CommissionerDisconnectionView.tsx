import { useState, useEffect } from 'react';
import { ChevronLeft, User, MapPin, Droplet, FileText, Download, CheckCircle, XCircle, RotateCcw, ClipboardCheck } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import SectionTitle from './SectionTitle';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface CommissionerDisconnectionViewProps {
  applicationId: string;
  onBack: () => void;
}

// Rejection reasons dropdown
const REJECTION_REASONS = [
  'Incomplete/Invalid Documentation',
  'Property Ownership Mismatch',
  'Outstanding Dues Not Cleared',
  'Connection Not Found in Records',
  'Unauthorized Connection Detected',
  'Application Does Not Meet Eligibility Criteria',
  'Duplicate Application',
  'Other',
];

export default function CommissionerDisconnectionView({ applicationId, onBack }: CommissionerDisconnectionViewProps) {
  const [commissionerRemarks, setCommissionerRemarks] = useState('');
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  // Approve flow
  const [showPaymentLetter, setShowPaymentLetter] = useState(false);
  const [dscSigned, setDscSigned] = useState(false);

  // Reject flow
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [showEndorsementLetter, setShowEndorsementLetter] = useState(false);
  const [endorsementDscSigned, setEndorsementDscSigned] = useState(false);

  // Send Back flow
  const [showSendBackModal, setShowSendBackModal] = useState(false);
  const [sendBackComment, setSendBackComment] = useState('');

  // DSC popups
  const [showDSCPopup, setShowDSCPopup] = useState(false);
  const [showEndorsementDSCPopup, setShowEndorsementDSCPopup] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
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

      const data = await response.json();

      if (data.success && data.application) {
        setApplication(data.application);
        console.log('[COMMISSIONER DISCONNECTION VIEW] Application loaded:', data.application);
      } else {
        setError('Application not found');
      }
    } catch (err) {
      console.error('[COMMISSIONER DISCONNECTION VIEW] Error fetching application:', err);
      setError('Failed to load application');
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
      year: 'numeric',
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
      minute: '2-digit',
    });
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // ===== APPROVE FLOW =====
  const handleApprove = () => {
    if (commissionerRemarks.trim().length < 10) {
      alert('Please provide remarks (minimum 10 characters) before approving.');
      return;
    }
    setShowPaymentLetter(true);
  };

  const handleDSCSign = async () => {
    setProcessing(true);
    setShowDSCPopup(false);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDscSigned(true);
      alert('Payment Letter signed successfully with Digital Signature!');
    } catch (err) {
      console.error('Error signing letter:', err);
      alert('Error signing letter: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteApproval = async () => {
    try {
      setProcessing(true);
      console.log('[COMMISSIONER] Approving disconnection application:', applicationId);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/commissioner/approve-for-payment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId,
            applicationNo: application.id,
            remarks: commissionerRemarks || 'Disconnection approved. Payment letter sent to applicant.',
            estimationRows: [],
            totalAmount: 0,
          }),
        }
      );

      const data = await response.json();
      console.log('[COMMISSIONER] Approve response:', data);

      if (data.success) {
        alert('Disconnection application approved successfully!\n\nPayment letter has been sent to the applicant.');
        localStorage.removeItem('commissioner_applications');
        const event = new CustomEvent('navigate', { detail: '/jalanidhi/commissioner/tap-connection' });
        window.dispatchEvent(event);
        onBack();
      } else {
        throw new Error(data.error || 'Failed to approve application');
      }
    } catch (err) {
      console.error('[COMMISSIONER] Error approving:', err);
      alert('Error: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // ===== REJECT FLOW =====
  const handleRejectClick = () => {
    if (commissionerRemarks.trim().length < 10) {
      alert('Please provide remarks (minimum 10 characters) before rejecting.');
      return;
    }
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!rejectReason) {
      alert('Please select a reason for rejection.');
      return;
    }
    if (rejectComment.trim().length < 10) {
      alert('Please provide rejection comments (minimum 10 characters).');
      return;
    }
    setShowRejectModal(false);
    setShowEndorsementLetter(true);
  };

  const handleEndorsementDSCSign = async () => {
    setProcessing(true);
    setShowEndorsementDSCPopup(false);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setEndorsementDscSigned(true);
      alert('Endorsement Letter signed successfully with Digital Signature!');
    } catch (err) {
      console.error('Error signing endorsement letter:', err);
      alert('Error signing endorsement letter: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteRejection = async () => {
    try {
      setProcessing(true);
      console.log('[COMMISSIONER] Rejecting disconnection application:', applicationId);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/commissioner/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId,
            remarks: commissionerRemarks + ' | Rejection: ' + rejectComment,
            rejectReason,
          }),
        }
      );

      const data = await response.json();
      console.log('[COMMISSIONER] Reject response:', data);

      if (data.success) {
        alert('Disconnection application rejected.\n\nEndorsement letter has been sent to the applicant.');
        localStorage.removeItem('commissioner_applications');
        onBack();
      } else {
        throw new Error(data.error || 'Failed to reject application');
      }
    } catch (err) {
      console.error('[COMMISSIONER] Error rejecting:', err);
      alert('Error: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  // ===== SEND BACK FLOW =====
  const handleSendBackClick = () => {
    setShowSendBackModal(true);
  };

  const handleConfirmSendBack = async () => {
    if (sendBackComment.trim().length < 10) {
      alert('Please provide comments (minimum 10 characters) for sending back.');
      return;
    }

    try {
      setProcessing(true);
      setShowSendBackModal(false);
      console.log('[COMMISSIONER] Sending back disconnection application:', applicationId);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/commissioner/send-back`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId,
            remarks: sendBackComment,
          }),
        }
      );

      const data = await response.json();
      console.log('[COMMISSIONER] Send-back response:', data);

      if (data.success) {
        alert('Application sent back to Field Engineer for corrections.');
        localStorage.removeItem('commissioner_applications');
        onBack();
      } else {
        throw new Error(data.error || 'Failed to send back application');
      }
    } catch (err) {
      console.error('[COMMISSIONER] Error sending back:', err);
      alert('Error: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    alert('Letter downloaded successfully!');
  };

  // ===== LOADING / ERROR STATES =====
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#1f3a5f] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#1f3a5f] font-['Poppins',sans-serif] text-lg">Loading application...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        <button onClick={onBack} className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error || 'Application not found'}
        </div>
      </div>
    );
  }

  // Extract data safely
  const rrData = application.rrData || {};
  const arrears = application.arrearDetails || {};
  const arrearPayment = application.arrearPaymentDetails || null;
  const caseworkerWorkflow = application.workflow && application.workflow.caseworker ? application.workflow.caseworker : null;
  const feWorkflow = application.workflow && application.workflow.fieldEngineer ? application.workflow.fieldEngineer : null;
  const commWorkflow = application.workflow && application.workflow.commissioner ? application.workflow.commissioner : null;

  const isAlreadyProcessed = commWorkflow && (commWorkflow.status === 'approved' || commWorkflow.status === 'rejected' || commWorkflow.status === 'sent_back');
  const ownerName = rrData.ownerName || 'N/A';
  const appNo = application.id || 'N/A';

  // ===== ENDORSEMENT LETTER VIEW =====
  if (showEndorsementLetter) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        <button
          onClick={() => setShowEndorsementLetter(false)}
          disabled={processing}
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="mb-6">
          <SectionTitle title="Endorsement Letter — Rejection" className="mb-2" />
          <p className="text-gray-600 font-['Poppins',sans-serif]">
            Application No: <span className="font-semibold">{appNo}</span>
          </p>
        </div>

        {/* Endorsement Letter Card */}
        <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#8b0000] to-[#b22222] px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white font-['Poppins',sans-serif]">
              Official Endorsement Letter
            </h2>
            {endorsementDscSigned && (
              <div className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-md">
                <CheckCircle className="w-5 h-5 text-white" />
                <span className="text-white font-['Poppins',sans-serif] font-semibold text-[14px]">
                  Digitally Signed
                </span>
              </div>
            )}
          </div>

          <div className="p-12 bg-white">
            {/* Government Header */}
            <div className="text-center mb-8 border-b-2 border-[#8b0000] pb-6">
              <ImageWithFallback src="https://upload.wikimedia.org/wikipedia/commons/d/d3/Seal_of_Karnataka.png" alt="Government of Karnataka Seal" className="w-[80px] h-[80px] mx-auto mb-3 object-contain" />
              <div className="mb-4">
                <div className="text-[#8b0000] font-bold text-[24px] font-['Poppins',sans-serif]">
                  ಕರ್ನಾಟಕ ಸರ್ಕಾರ
                </div>
                <div className="text-[#8b0000] font-bold text-[22px] font-['Poppins',sans-serif]">
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

            {/* Reference */}
            <div className="flex justify-between mb-6 text-[14px] font-['Poppins',sans-serif]">
              <div>
                <p className="text-gray-600">Ref No: <span className="font-semibold text-gray-900">DMA/JN/END/{appNo}</span></p>
              </div>
              <div>
                <p className="text-gray-600">Date: <span className="font-semibold text-gray-900">{currentDate}</span></p>
              </div>
            </div>

            {/* Recipient */}
            <div className="mb-6">
              <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900 font-semibold">To,</p>
              <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900 mt-1 font-semibold">{ownerName}</p>
              <p className="text-[14px] font-['Poppins',sans-serif] text-gray-600 mt-1">
                Application No: {appNo}
              </p>
            </div>

            {/* Subject */}
            <div className="mb-6">
              <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900">
                <span className="font-bold">Subject: </span>
                <span className="underline">Rejection of Tap Water Disconnection Application — Endorsement</span>
              </p>
            </div>

            <div className="mb-4">
              <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900">Dear Sir/Madam,</p>
            </div>

            {/* Letter Body */}
            <div className="space-y-4 mb-6 text-[15px] font-['Poppins',sans-serif] text-gray-900 leading-relaxed text-justify">
              <p className="indent-12">
                With reference to your application for tap water disconnection under the Jalanidhi initiative,
                bearing reference number <span className="font-semibold">{appNo}</span>,
                we regret to inform you that your application has been <span className="font-bold text-red-700">REJECTED</span> by
                the Commissioner of the Department of Municipal Administration, Government of Karnataka.
              </p>
              <p className="indent-12">
                After careful review of the submitted documents, field verification report, and relevant records,
                it has been determined that the application does not meet the required criteria for processing
                the disconnection request at this time.
              </p>
            </div>

            {/* Rejection Details Box */}
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
              <h3 className="text-[16px] font-bold text-red-800 font-['Poppins',sans-serif] mb-4">
                REASON FOR REJECTION
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Reason Category</p>
                  <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                    {rejectReason}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Detailed Remarks</p>
                  <p className="text-[15px] text-gray-900 font-['Poppins',sans-serif]">
                    {rejectComment}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Commissioner Remarks</p>
                  <p className="text-[15px] text-gray-900 font-['Poppins',sans-serif]">
                    {commissionerRemarks}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-6">
              <h4 className="text-[15px] font-bold text-gray-900 font-['Poppins',sans-serif] mb-3">
                Next Steps:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-[14px] font-['Poppins',sans-serif] text-gray-900">
                <li>You may re-apply after rectifying the issues mentioned above.</li>
                <li>Please ensure all necessary documents are complete and valid before re-applying.</li>
                <li>For any queries or clarifications, please contact the helpdesk at 1800-XXX-XXXX.</li>
                <li>This endorsement letter serves as an official communication of the rejection decision.</li>
              </ol>
            </div>

            <div className="space-y-4 mb-8 text-[15px] font-['Poppins',sans-serif] text-gray-900">
              <p>
                We regret the inconvenience caused. You may contact the concerned authorities for further assistance.
              </p>
              <p>Thanking you,</p>
            </div>

            {/* Signature */}
            <div className="mt-12 flex justify-end">
              <div className="text-right">
                {endorsementDscSigned && (
                  <div className="mb-4 bg-green-50 border-2 border-green-500 rounded-lg p-4 inline-block">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-[12px] font-bold text-green-700 font-['Poppins',sans-serif]">
                        DIGITALLY SIGNED
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">
                      Signed on: {new Date().toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">
                      Certificate ID: DSC-2026-END-{applicationId.slice(-6).toUpperCase()}
                    </p>
                  </div>
                )}
                <div className="border-t-2 border-gray-800 pt-2 min-w-[250px]">
                  <p className="text-[15px] font-bold text-gray-900 font-['Poppins',sans-serif]">Commissioner</p>
                  <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">Department of Municipal Administration</p>
                  <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">Government of Karnataka</p>
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

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowEndorsementLetter(false)}
            disabled={processing}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownload}
              disabled={processing || !endorsementDscSigned}
              className="px-6 py-3 bg-white border-2 border-[#8b0000] text-[#8b0000] rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Letter
            </button>
            {!endorsementDscSigned ? (
              <button
                onClick={() => setShowEndorsementDSCPopup(true)}
                disabled={processing}
                className="px-8 py-3 bg-[#8b0000] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#a00000] transition-all disabled:opacity-50 shadow-lg flex items-center gap-2"
              >
                {processing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FileText className="w-5 h-5" />
                )}
                {processing ? 'Signing...' : 'Sign with DSC'}
              </button>
            ) : (
              <button
                onClick={handleCompleteRejection}
                disabled={processing}
                className="px-8 py-3 bg-[#8b0000] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#a00000] transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                {processing ? 'Processing...' : 'Complete & Send to Applicant'}
              </button>
            )}
          </div>
        </div>

        {/* Endorsement DSC Popup */}
        {showEndorsementDSCPopup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-[500px]">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-[#8b0000]" />
                </div>
                <h2 className="text-2xl font-bold text-[#8b0000] font-['Poppins',sans-serif] mb-2">
                  Digital Signature Certificate
                </h2>
                <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                  Sign the endorsement letter with your DSC
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-2">Document Details:</p>
                <div className="space-y-1">
                  <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">Endorsement Letter — Rejection</p>
                  <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">Application: {appNo}</p>
                  <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">Applicant: {ownerName}</p>
                  <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">Reason: {rejectReason}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-[12px] text-yellow-800 font-['Poppins',sans-serif]">
                  <span className="font-semibold">Important:</span> By signing this document, you confirm the rejection
                  of this tap water disconnection application.
                </p>
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => setShowEndorsementDSCPopup(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndorsementDSCSign}
                  className="px-6 py-2 bg-[#8b0000] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#a00000] transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Sign with DSC
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== PAYMENT LETTER VIEW =====
  if (showPaymentLetter) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        <button
          onClick={() => setShowPaymentLetter(false)}
          disabled={processing}
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="mb-6">
          <SectionTitle title="Disconnection Approval Letter" className="mb-2" />
          <p className="text-gray-600 font-['Poppins',sans-serif]">
            Application No: <span className="font-semibold">{appNo}</span>
          </p>
        </div>

        {/* Payment Letter Card */}
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Official Disconnection Approval Letter
            </h2>
            {dscSigned && (
              <div className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-md">
                <CheckCircle className="w-5 h-5 text-white" />
                <span className="text-white font-['Poppins',sans-serif] font-semibold text-[14px]">
                  Digitally Signed
                </span>
              </div>
            )}
          </div>

          <div className="p-12 bg-white">
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

            {/* Reference */}
            <div className="flex justify-between mb-6 text-[14px] font-['Poppins',sans-serif]">
              <div>
                <p className="text-gray-600">Ref No: <span className="font-semibold text-gray-900">DMA/JN/DISCON/{appNo}</span></p>
              </div>
              <div>
                <p className="text-gray-600">Date: <span className="font-semibold text-gray-900">{currentDate}</span></p>
              </div>
            </div>

            {/* Recipient */}
            <div className="mb-6">
              <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900 font-semibold">To,</p>
              <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900 mt-1 font-semibold">{ownerName}</p>
              <p className="text-[14px] font-['Poppins',sans-serif] text-gray-600 mt-1">
                Application No: {appNo}
              </p>
              {application.rrNumber && (
                <p className="text-[14px] font-['Poppins',sans-serif] text-gray-600">
                  RR Number: {application.rrNumber}
                </p>
              )}
            </div>

            {/* Subject */}
            <div className="mb-6">
              <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900">
                <span className="font-bold">Subject: </span>
                <span className="underline">Approval of Tap Water Disconnection Request — Payment Authorization</span>
              </p>
            </div>

            <div className="mb-4">
              <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900">Dear Sir/Madam,</p>
            </div>

            {/* Letter Body */}
            <div className="space-y-4 mb-6 text-[15px] font-['Poppins',sans-serif] text-gray-900 leading-relaxed text-justify">
              <p className="indent-12">
                With reference to your application for voluntary tap water disconnection under the Jalanidhi initiative,
                we are pleased to inform you that your application bearing reference number <span className="font-semibold">{appNo}</span> has
                been thoroughly reviewed and <span className="font-bold text-green-700">APPROVED</span> by the Commissioner of the Department
                of Municipal Administration, Government of Karnataka.
              </p>
              <p className="indent-12">
                After careful verification of all submitted documents, field inspection by our field engineers,
                and review by concerned authorities, it has been determined that your request for disconnection
                of the tap water connection associated with RR Number <span className="font-semibold">{application.rrNumber || 'N/A'}</span> meets
                all the necessary criteria as per government norms and regulations.
              </p>
              <p className="indent-12">
                You are hereby authorized to proceed with the payment of disconnection charges, if applicable.
                Upon receipt of payment, the disconnection work will be carried out by the assigned licensed plumber.
              </p>
            </div>

            {/* Disconnection Details Box */}
            <div className="bg-blue-50 border-2 border-[#1f3a5f] rounded-lg p-6 mb-6">
              <h3 className="text-[16px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
                APPROVED DISCONNECTION DETAILS
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Application Number</p>
                  <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{appNo}</p>
                </div>
                <div>
                  <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Applicant Name</p>
                  <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{ownerName}</p>
                </div>
                <div>
                  <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Service Type</p>
                  <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                    Tap Water Disconnection ({application.disconnectionType === 'permanent' ? 'Permanent' : 'Temporary'})
                  </p>
                </div>
                <div>
                  <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">RR Number</p>
                  <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{application.rrNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Approval Date</p>
                  <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{currentDate}</p>
                </div>
                <div>
                  <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Connection Type</p>
                  <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{rrData.connectionType || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-6">
              <h4 className="text-[15px] font-bold text-gray-900 font-['Poppins',sans-serif] mb-3">
                Instructions:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-[14px] font-['Poppins',sans-serif] text-gray-900">
                <li>Please make any applicable disconnection charges payment within 15 days from the date of this letter.</li>
                <li>Payment can be made online through the Jalanidhi portal or at designated government centers.</li>
                <li>Keep the payment receipt safe for future reference.</li>
                <li>Disconnection work will be carried out by the assigned plumber within 7 working days after payment confirmation.</li>
                <li>Meter reading will be recorded at the time of disconnection.</li>
                <li>For any queries, please contact the helpdesk at 1800-XXX-XXXX.</li>
              </ol>
            </div>

            <div className="space-y-4 mb-8 text-[15px] font-['Poppins',sans-serif] text-gray-900">
              <p>
                We appreciate your patience throughout the application process.
              </p>
              <p>Thanking you,</p>
            </div>

            {/* Signature */}
            <div className="mt-12 flex justify-end">
              <div className="text-right">
                {dscSigned && (
                  <div className="mb-4 bg-green-50 border-2 border-green-500 rounded-lg p-4 inline-block">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-[12px] font-bold text-green-700 font-['Poppins',sans-serif]">
                        DIGITALLY SIGNED
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">
                      Signed on: {new Date().toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">
                      Certificate ID: DSC-2026-DISCON-{applicationId.slice(-6).toUpperCase()}
                    </p>
                  </div>
                )}
                <div className="border-t-2 border-gray-800 pt-2 min-w-[250px]">
                  <p className="text-[15px] font-bold text-gray-900 font-['Poppins',sans-serif]">Commissioner</p>
                  <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">Department of Municipal Administration</p>
                  <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">Government of Karnataka</p>
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

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowPaymentLetter(false)}
            disabled={processing}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownload}
              disabled={processing || !dscSigned}
              className="px-6 py-3 bg-white border-2 border-[#1f3a5f] text-[#1f3a5f] rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Letter
            </button>
            {!dscSigned ? (
              <button
                onClick={() => setShowDSCPopup(true)}
                disabled={processing}
                className="px-8 py-3 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#27548a] transition-all disabled:opacity-50 shadow-lg flex items-center gap-2"
              >
                {processing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FileText className="w-5 h-5" />
                )}
                {processing ? 'Signing...' : 'Sign with DSC'}
              </button>
            ) : (
              <button
                onClick={handleCompleteApproval}
                disabled={processing}
                className="px-8 py-3 bg-[#22c55e] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#16a34a] transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {processing ? 'Processing...' : 'Complete & Send to Applicant'}
              </button>
            )}
          </div>
        </div>

        {/* DSC Popup */}
        {showDSCPopup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-[500px]">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-[#1f3a5f]" />
                </div>
                <h2 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
                  Digital Signature Certificate
                </h2>
                <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                  Sign the disconnection approval letter with your DSC
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-2">Document Details:</p>
                <div className="space-y-1">
                  <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">Disconnection Approval Letter</p>
                  <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">Application: {appNo}</p>
                  <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">Applicant: {ownerName}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-[12px] text-yellow-800 font-['Poppins',sans-serif]">
                  <span className="font-semibold">Important:</span> By signing this document, you authorize
                  the disconnection and confirm the approval of this tap water disconnection application.
                </p>
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => setShowDSCPopup(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDSCSign}
                  className="px-6 py-2 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#27548a] transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Sign with DSC
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== MAIN REVIEW VIEW =====
  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={processing}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Page Header */}
      <div className="mb-6">
        <SectionTitle title="Review Disconnection Application" className="mb-2" />
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{appNo}</span>
        </p>
        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mt-1">
          Submitted on: {formatDateTime(application.submittedAt)}
        </p>
      </div>

      {/* Application Summary Card */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
          Disconnection Application Details
        </h2>

        <div className="space-y-6">
          {/* RR Number & Disconnection Type */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Existing RR Number & Disconnection Type
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">RR Number</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.rrNumber || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Disconnection Type</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.disconnectionType === 'permanent' ? 'Permanent Disconnection' : application.disconnectionType === 'temporary' ? 'Temporary Disconnection' : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Reason for Disconnection</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.disconnectionReason || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Applicant Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Applicant / Property Details
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Owner Name</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{rrData.ownerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Mobile Number</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{rrData.mobileNo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">District</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{rrData.district || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">ULB</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{rrData.ulb || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Ward Number</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{rrData.wardNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Door Number</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{rrData.doorNumber || 'N/A'}</p>
              </div>
              <div className="md:col-span-3">
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Address</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {rrData.address || [rrData.street, rrData.city, rrData.state, rrData.pincode].filter(Boolean).join(', ') || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Connection Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Connection Details
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Connection Type</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{rrData.connectionType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Meter Category</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{rrData.meterCategory || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Meter Status</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{rrData.meterStatus || rrData.motorStatus || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Scheme Name</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{rrData.schemeName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">UGD Connection Linked</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.hasUGDConnection === 'yes' ? 'Yes' : application.hasUGDConnection === 'no' ? 'No' : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Current Arrears */}
          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Current Arrears Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Current Demand</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{arrears.currentDemand != null ? '\u20B9' + arrears.currentDemand : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Arrears</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{arrears.arrears != null ? '\u20B9' + arrears.arrears : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Total Bill</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{arrears.totalBill != null ? '\u20B9' + arrears.totalBill : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Arrear Payment Details */}
          {arrearPayment && (
            <div>
              <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
                Arrear Payment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Service Applied For</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{arrearPayment.serviceAppliedFor || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Payment Date</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{arrearPayment.paymentDate || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Transaction No</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{arrearPayment.transactionNo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Payment Status</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{arrearPayment.paymentStatus || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Amount Paid</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{arrearPayment.amountPaid != null ? '\u20B9' + arrearPayment.amountPaid : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Consolidated Remarks Card */}
      <div className="mb-6">
        {(() => {
          const remarkEntries: RemarkEntry[] = [];
          if (caseworkerWorkflow && caseworkerWorkflow.comments) {
            remarkEntries.push({ role: 'Caseworker', comment: caseworkerWorkflow.comments, timestamp: caseworkerWorkflow.timestamp || '' });
          }
          if (feWorkflow && feWorkflow.comments) {
            remarkEntries.push({ role: 'Field Engineer', comment: feWorkflow.comments, timestamp: feWorkflow.timestamp || '' });
          }
          return remarkEntries.length > 0 ? (
            <RemarksTimeline remarks={remarkEntries} title="Remarks" />
          ) : null;
        })()}
      </div>

      {/* Commissioner Decision Card */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="bg-[#1f3a5f] px-6 py-4">
          <h2 className="text-xl font-semibold text-white font-['Poppins',sans-serif]">
            Commissioner Decision
          </h2>
        </div>

        <div className="p-6">
          {isAlreadyProcessed ? (
            <div className={`rounded-[8px] border p-5 ${
              commWorkflow.status === 'approved' ? 'bg-[#e8f5e9] border-[#a5d6a7]' :
              commWorkflow.status === 'rejected' ? 'bg-red-50 border-red-200' :
              'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  commWorkflow.status === 'approved' ? 'bg-green-500' :
                  commWorkflow.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                }`}>
                  {commWorkflow.status === 'approved' ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : commWorkflow.status === 'rejected' ? (
                    <XCircle className="w-5 h-5 text-white" />
                  ) : (
                    <RotateCcw className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <p className={`font-['Poppins',sans-serif] font-semibold text-[16px] ${
                    commWorkflow.status === 'approved' ? 'text-green-800' :
                    commWorkflow.status === 'rejected' ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {commWorkflow.status === 'approved' ? 'Application Approved' :
                     commWorkflow.status === 'rejected' ? 'Application Rejected' : 'Application Sent Back'}
                  </p>
                  <p className="font-['Poppins',sans-serif] text-[13px] text-gray-600">
                    Processed on: {commWorkflow.timestamp ? formatDateTime(commWorkflow.timestamp) : 'N/A'}
                  </p>
                </div>
              </div>
              {commWorkflow.remarks && (
                <div className="mt-2 pt-3 border-t border-gray-200">
                  <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-gray-700 mb-1">Remarks</p>
                  <p className="font-['Poppins',sans-serif] text-[14px] text-gray-900 bg-white rounded-md p-3 border border-gray-200">{commWorkflow.remarks}</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Commissioner Remarks */}
              <div className="mb-6">
                <label className="block font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49] mb-2">
                  Commissioner Remarks <span className="text-[#ff0c10]">*</span>
                </label>
                <textarea
                  value={commissionerRemarks}
                  onChange={(e) => setCommissionerRemarks(e.target.value)}
                  className="w-full h-[100px] px-[12px] py-[11px] font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none rounded-[8px] resize-none border border-[#d0d0d0] focus:border-[#1f3a5f]"
                  placeholder="Enter your remarks regarding the disconnection application (minimum 10 characters)..."
                />
                <p className="text-[12px] text-gray-400 font-['Poppins',sans-serif] mt-1">
                  {commissionerRemarks.length}/10 characters minimum
                </p>
              </div>

              {/* Action Buttons — arranged per UX: destructive on left, primary on right */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                {/* Left: Send Back */}
                <button
                  onClick={handleSendBackClick}
                  disabled={processing}
                  className="px-6 py-3 bg-white border-2 border-[#1f3a5f] text-[#1f3a5f] rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#f0f4f8] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <RotateCcw className="w-5 h-5" />
                  Send Back
                </button>

                <div className="flex items-center gap-4">
                  {/* Reject */}
                  <button
                    onClick={handleRejectClick}
                    disabled={processing}
                    className="px-6 py-3 bg-white border-2 border-red-500 text-red-600 rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>

                  {/* Approve */}
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="px-8 py-3 bg-[#22c55e] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#16a34a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve & Allow for Payment
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===== REJECT MODAL ===== */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-[550px]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
                Reject Application
              </h2>
              <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                Please provide the reason for rejection. An endorsement letter will be generated.
              </p>
            </div>

            {/* Reject Reason Dropdown */}
            <div className="mb-4">
              <label className="block text-[14px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[14px] focus:outline-none focus:border-[#1f3a5f] appearance-none cursor-pointer bg-white"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23170f49' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
              >
                <option value="">-- Select Reason --</option>
                {REJECTION_REASONS.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            {/* Rejection Comments */}
            <div className="mb-6">
              <label className="block text-[14px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">
                Detailed Comments <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[14px] focus:outline-none focus:border-[#1f3a5f] resize-none"
                placeholder="Provide detailed comments about the rejection..."
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); setRejectComment(''); }}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason || rejectComment.trim().length < 10}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4" />
                Generate Endorsement Letter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SEND BACK MODAL ===== */}
      {showSendBackModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-[500px]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-[#1f3a5f]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
                Send Back to Field Engineer
              </h2>
              <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                Specify what corrections or additional information is needed.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-[14px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">
                Remarks <span className="text-red-500">*</span>
              </label>
              <textarea
                value={sendBackComment}
                onChange={(e) => setSendBackComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[14px] focus:outline-none focus:border-[#1f3a5f] resize-none"
                placeholder="Describe what needs to be corrected or re-verified..."
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => { setShowSendBackModal(false); setSendBackComment(''); }}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSendBack}
                disabled={processing || sendBackComment.trim().length < 10}
                className="px-6 py-2.5 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-[#2c5282] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                {processing ? 'Sending...' : 'Confirm Send Back'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

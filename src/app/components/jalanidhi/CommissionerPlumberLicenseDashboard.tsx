import { useState, useEffect } from 'react';
import { ChevronLeft, Search, Filter, Eye, Clock, CheckCircle, XCircle, User, MapPin, FileText, Wrench, Building2, UserCheck, MessageSquare, AlertTriangle, Shield, RotateCcw, Award, CreditCard, Download, Stamp, PenTool } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface PlumberLicenseApp {
  id: string;
  registrationType: string;
  status: string;
  submittedAt: string;
  district: string;
  ulb: string;
  financialYear: string;
  registrationFees: string;
  applicantName: string;
  mobileNumber: string;
  // Individual fields
  plumberName?: string;
  addressDistrict?: string;
  city?: string;
  street?: string;
  wardNo?: string;
  pincode?: string;
  qualification?: string;
  yearOfExperience?: string;
  // Contractor fields
  firmName?: string;
  typeOfFirm?: string;
  officeAddress?: string;
  contDistrict?: string;
  taluk?: string;
  emailId?: string;
  panNumber?: string;
  gstNumber?: string;
  authFullName?: string;
  authDesignation?: string;
  authMobile?: string;
  authEmail?: string;
  // Workflow
  documents?: any;
  workflow?: any;
  caseworkerComments?: string;
  fieldEngineerComments?: string;
  commissionerComments?: string;
  commissionerDecision?: string;
  paymentDetails?: any;
  licenseNumber?: string;
  licenseIssuedAt?: string;
  licenseValidUntil?: string;
  dscDetails?: any;
}

// Confirmation Popup
function ConfirmationPopup({ isOpen, onClose, onConfirm, title, message, type, processing }: {
  isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; type: 'approve' | 'reject' | 'sendback'; processing: boolean;
}) {
  if (!isOpen) return null;
  const colorConfig = type === 'approve'
    ? { bgIcon: 'bg-green-100', iconColor: 'text-green-600', btnBg: 'bg-green-600 hover:bg-green-700', btnLabel: 'Confirm Approval', Icon: CheckCircle }
    : type === 'sendback'
    ? { bgIcon: 'bg-amber-100', iconColor: 'text-amber-600', btnBg: 'bg-amber-600 hover:bg-amber-700', btnLabel: 'Confirm Send Back', Icon: RotateCcw }
    : { bgIcon: 'bg-red-100', iconColor: 'text-red-600', btnBg: 'bg-red-600 hover:bg-red-700', btnLabel: 'Confirm Rejection', Icon: XCircle };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-[2px] bg-[rgba(0,0,0,0.4)]" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,120,160,0.15)] w-[470px] px-[24px] py-[32px] flex flex-col gap-[24px]">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${colorConfig.bgIcon} flex items-center justify-center`}>
            <colorConfig.Icon className={`w-5 h-5 ${colorConfig.iconColor}`} />
          </div>
          <h3 className="text-lg font-semibold text-[#170f49] font-['Poppins',sans-serif]">{title}</h3>
        </div>
        <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 relative z-10">
          <button
            onClick={onClose}
            disabled={processing}
            className="px-6 py-2.5 rounded-[24px] border-[1.5px] border-gray-300 text-gray-700 font-['Poppins',sans-serif] font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            disabled={processing}
            className={`px-6 py-2.5 rounded-[24px] text-white font-['Poppins',sans-serif] font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2 ${colorConfig.btnBg}`}
          >
            {processing && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {colorConfig.btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Status badge helper
function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; classes: string; icon: any }> = {
    'submitted': { label: 'Submitted', classes: 'bg-blue-100 text-blue-800 border-blue-300', icon: <Clock className="w-3.5 h-3.5" /> },
    'sentToFieldEngineer': { label: 'Sent Back to FE', classes: 'bg-amber-100 text-amber-800 border-amber-300', icon: <RotateCcw className="w-3.5 h-3.5" /> },
    'sentToCommissioner': { label: 'Pending Review', classes: 'bg-pink-100 text-pink-800 border-pink-300', icon: <Clock className="w-3.5 h-3.5" /> },
    'pendingPayment': { label: 'Pending Payment', classes: 'bg-orange-100 text-orange-800 border-orange-300', icon: <Clock className="w-3.5 h-3.5" /> },
    'paymentCompleted': { label: 'Payment Done - Generate Certificate', classes: 'bg-cyan-100 text-cyan-800 border-cyan-300', icon: <Award className="w-3.5 h-3.5" /> },
    'approved': { label: 'License Issued', classes: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    'rejected': { label: 'Rejected', classes: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle className="w-3.5 h-3.5" /> },
  };
  const s = statusMap[status] || { label: status, classes: 'bg-gray-100 text-gray-800 border-gray-200', icon: <Clock className="w-3.5 h-3.5" /> };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium border ${s.classes}`}>
      {s.icon}
      {s.label}
    </span>
  );
}

// ─── Review View ─────────────────────────────────────────────────────────────
function PlumberLicenseCommissionerReview({ application, onBack }: { application: PlumberLicenseApp; onBack: () => void }) {
  const [commComment, setCommComment] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showSendbackConfirm, setShowSendbackConfirm] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);
  const [completedAction, setCompletedAction] = useState<'approved' | 'rejected' | 'sent_back' | null>(null);

  // Check if commissioner has already acted on this application
  // If the application status is 'sentToCommissioner', it means it was re-forwarded (e.g., after sendback)
  // so the commissioner should be able to act again even if workflow.commissioner has an old status
  useEffect(() => {
    const wf = application && application.workflow;
    const comm = wf && wf.commissioner;
    const appStatus = application && application.status;
    // If application is currently at commissioner for review, allow action regardless of old commissioner status
    if (appStatus === 'sentToCommissioner') {
      setActionCompleted(false);
      setCompletedAction(null);
      setCommComment('');
      return;
    }
    if (comm && (comm.status === 'approved' || comm.status === 'rejected' || comm.status === 'sent_back')) {
      setActionCompleted(true);
      setCompletedAction(comm.status === 'approved' ? 'approved' : comm.status === 'sent_back' ? 'sent_back' : 'rejected');
      setCommComment(comm.comment || '');
    }
  }, [application]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/commissioner/approve`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId: application.id, comment: commComment }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        setShowApproveConfirm(false);
        setActionCompleted(true);
        setCompletedAction('approved');
        alert(`Application ${application.id} approved successfully!\n\nThe citizen can now proceed with payment.`);
      } else {
        const errMsg = data && data.error ? data.error : 'Unknown error';
        console.error('[COMM PLUMBER LICENSE] Approve error:', errMsg);
        alert('Error approving: ' + errMsg);
      }
    } catch (error) {
      console.error('[COMM PLUMBER LICENSE] Error approving application:', error);
      alert('Error approving: ' + error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/commissioner/reject`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId: application.id, comment: commComment }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        setShowRejectConfirm(false);
        setActionCompleted(true);
        setCompletedAction('rejected');
        alert(`Application ${application.id} has been rejected.\n\nThe citizen has been notified.`);
      } else {
        const errMsg = data && data.error ? data.error : 'Unknown error';
        console.error('[COMM PLUMBER LICENSE] Reject error:', errMsg);
        alert('Error rejecting: ' + errMsg);
      }
    } catch (error) {
      console.error('[COMM PLUMBER LICENSE] Error rejecting application:', error);
      alert('Error rejecting: ' + error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSendback = async () => {
    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/commissioner/sendback`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId: application.id, comment: commComment }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        setShowSendbackConfirm(false);
        setActionCompleted(true);
        setCompletedAction('sent_back');
        alert(`Application ${application.id} has been sent back to the Field Engineer for re-review.\n\nYour comments have been shared with the Field Engineer.`);
      } else {
        const errMsg = data && data.error ? data.error : 'Unknown error';
        console.error('[COMM PLUMBER LICENSE] Sendback error:', errMsg);
        alert('Error sending back: ' + errMsg);
      }
    } catch (error) {
      console.error('[COMM PLUMBER LICENSE] Error sending back application:', error);
      alert('Error sending back: ' + error);
    } finally {
      setProcessing(false);
    }
  };

  const isIndividual = application.registrationType === 'individual';
  const isContractor = application.registrationType === 'contractor';

  // Check if this was previously sent back by commissioner (re-forward from FE after sendback)
  const wasPreviouslySentBack = application.workflow && application.workflow.commissioner && application.workflow.commissioner.previousDecision === 'sent_back';
  const previousCommComment = application.commissionerComments || '';

  // Get caseworker comments
  const caseworkerComment = application.caseworkerComments || (application.workflow && application.workflow.caseworker && application.workflow.caseworker.comment) || '';
  const caseworkerTimestamp = application.workflow && application.workflow.caseworker && application.workflow.caseworker.timestamp;

  // Get field engineer comments
  const feComment = application.fieldEngineerComments || (application.workflow && application.workflow.fieldEngineer && application.workflow.fieldEngineer.comment) || '';
  const feTimestamp = application.workflow && application.workflow.fieldEngineer && application.workflow.fieldEngineer.timestamp;

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      <button
        onClick={onBack}
        disabled={processing}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
          Review Plumber License Application
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{application.id}</span>
        </p>
        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mt-1">
          Submitted on: {formatDate(application.submittedAt)} | Type: <span className="capitalize font-medium">{isIndividual ? 'Individual Plumber' : 'Contractor'}</span>
        </p>
      </div>

      {/* Previously Sent Back Banner */}
      {wasPreviouslySentBack && !actionCompleted && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <RotateCcw className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-amber-800 font-['Poppins',sans-serif] mb-1">
                Re-submitted After Sendback
              </p>
              <p className="text-sm text-amber-700 font-['Poppins',sans-serif] leading-relaxed">
                This application was previously sent back by you to the Field Engineer for re-review. The Field Engineer has addressed the concerns and re-forwarded this application for your final decision.
              </p>
              {previousCommComment && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-amber-200">
                  <p className="text-xs text-gray-500 font-['Poppins',sans-serif] mb-1">Your Previous Sendback Comments:</p>
                  <p className="text-sm text-gray-800 font-['Poppins',sans-serif] font-medium">{previousCommComment}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Application Summary Card */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
            Application Summary
          </h2>
          {/* ULB / Basic Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                ULB Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">District</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                  {application.district || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">ULB</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                  {application.ulb || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Financial Year</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.financialYear || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Registration Fees</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  Rs. {application.registrationFees || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Individual Plumber Details */}
          {isIndividual && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-[#1f3a5f]" />
                <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  Personal Details
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Plumber Name</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.plumberName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">District</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                    {application.addressDistrict || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">City</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.city || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Street</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.street || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Ward No</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.wardNo || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Pincode</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.pincode || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Mobile Number</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.mobileNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Qualification</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                    {application.qualification || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Year of Experience</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.yearOfExperience || 'N/A'} {application.yearOfExperience && application.yearOfExperience !== 'N/A' ? 'Years' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contractor Details */}
          {isContractor && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-[#1f3a5f]" />
                  <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                    Contractors Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Firm Name</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.firmName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Type of Firm</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                      {(application.typeOfFirm || 'N/A').replace(/-/g, ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Office Address</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.officeAddress || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">District</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                      {(application.contDistrict || 'N/A').replace(/-/g, ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Taluk</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                      {application.taluk || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Pincode</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.pincode || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Mobile Number</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.mobileNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Email ID</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.emailId || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">PAN Number</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.panNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">GST Number</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.gstNumber || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Authorized Person Details */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="w-5 h-5 text-[#1f3a5f]" />
                  <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                    Authorized Person Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Full Name</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.authFullName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Designation</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.authDesignation || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Mobile Number</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.authMobile || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Email ID</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.authEmail || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Documents */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Uploaded Documents
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              {application.documents && application.documents.aadhar && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Aadhar Document</p>
                  <p className="text-[15px] font-medium text-green-700 font-['Poppins',sans-serif] flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> {application.documents.aadhar.name || 'Uploaded'}
                  </p>
                </div>
              )}
              {application.documents && application.documents.experienceLetter && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Experience Letter</p>
                  <p className="text-[15px] font-medium text-green-700 font-['Poppins',sans-serif] flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> {application.documents.experienceLetter.name || 'Uploaded'}
                  </p>
                </div>
              )}
              {application.documents && application.documents.supportingDoc && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Supporting Document</p>
                  <p className="text-[15px] font-medium text-green-700 font-['Poppins',sans-serif] flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> {application.documents.supportingDoc.name || 'Uploaded'}
                  </p>
                </div>
              )}
              {(!application.documents || Object.keys(application.documents).length === 0) && (
                <p className="text-sm text-gray-500 font-['Poppins',sans-serif]">No documents uploaded</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Consolidated Remarks Card */}
      {(() => {
        const remarkEntries: RemarkEntry[] = [];
        if (caseworkerComment) {
          remarkEntries.push({ role: 'Caseworker', comment: caseworkerComment, timestamp: caseworkerTimestamp || '' });
        }
        if (feComment) {
          remarkEntries.push({ role: 'Field Engineer', comment: feComment, timestamp: feTimestamp || '' });
        }
        if (wasPreviouslySentBack && previousCommComment) {
          remarkEntries.push({ role: 'Commissioner', comment: previousCommComment, variant: 'sent_back' });
        }
        return remarkEntries.length > 0 ? (
          <div className="mb-6">
            <RemarksTimeline remarks={remarkEntries} title="Remarks" />
          </div>
        ) : null;
      })()}

      {/* Commissioner Decision Card */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5" />
            Commissioner Decision
          </h2>
          {actionCompleted ? (
            <div className="space-y-4">
              {completedAction === 'approved' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-800 font-['Poppins',sans-serif] text-sm">
                    This application has been <strong>approved</strong>. The citizen can now proceed to make the payment.
                  </p>
                </div>
              ) : completedAction === 'sent_back' ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                  <RotateCcw className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p className="text-amber-800 font-['Poppins',sans-serif] text-sm">
                    This application has been <strong>sent back</strong> to the Field Engineer for re-review. Your comments have been shared.
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800 font-['Poppins',sans-serif] text-sm">
                    This application has been <strong>rejected</strong>. The citizen has been notified.
                  </p>
                </div>
              )}
              {commComment && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">Commissioner Comments:</p>
                  <p className="text-sm text-gray-700 font-['Poppins',sans-serif]">{commComment}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Warning Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 font-['Poppins',sans-serif]">Final Decision Required</p>
                  <p className="text-sm text-amber-700 font-['Poppins',sans-serif] mt-1">
                    Please review all details, caseworker observations, and field engineer verification before making your decision.
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
                  Comments <span className="text-red-600 ml-1">*</span>
                </label>
                <textarea
                  value={commComment}
                  onChange={(e) => setCommComment(e.target.value)}
                  placeholder="Enter your review comments and decision rationale..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-2">
                <button
                  onClick={() => {
                    if (!commComment.trim()) {
                      alert('Please enter comments before rejecting.');
                      return;
                    }
                    setShowRejectConfirm(true);
                  }}
                  disabled={processing}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-['Poppins',sans-serif] font-semibold hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Application
                </button>
                <button
                  onClick={() => {
                    if (!commComment.trim()) {
                      alert('Please enter comments before sending back.');
                      return;
                    }
                    setShowSendbackConfirm(true);
                  }}
                  disabled={processing}
                  className="px-6 py-3 bg-amber-500 text-white rounded-lg font-['Poppins',sans-serif] font-semibold hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4" />
                  Send Back Application
                </button>
                <button
                  onClick={() => {
                    if (!commComment.trim()) {
                      alert('Please enter comments before approving.');
                      return;
                    }
                    setShowApproveConfirm(true);
                  }}
                  disabled={processing}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg font-['Poppins',sans-serif] font-semibold hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Application
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Popups */}
      <ConfirmationPopup
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleApprove}
        title="Approve Application"
        message={`Are you sure you want to approve plumber license application ${application.id}? The citizen will be notified and can proceed to make the registration payment.`}
        type="approve"
        processing={processing}
      />
      <ConfirmationPopup
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={handleReject}
        title="Reject Application"
        message={`Are you sure you want to reject plumber license application ${application.id}? The citizen will be notified of the rejection with your comments.`}
        type="reject"
        processing={processing}
      />
      <ConfirmationPopup
        isOpen={showSendbackConfirm}
        onClose={() => setShowSendbackConfirm(false)}
        onConfirm={handleSendback}
        title="Send Back Application"
        message={`Are you sure you want to send back plumber license application ${application.id} to the Field Engineer? Your comments will be shared and the Field Engineer will re-review this application.`}
        type="sendback"
        processing={processing}
      />
    </div>
  );
}

// ─── Pending Payment View (read-only after commissioner approves, awaiting citizen payment) ──
function PlumberLicensePendingPaymentView({ application, onBack }: { application: PlumberLicenseApp; onBack: () => void }) {
  const isIndividual = application.registrationType === 'individual';
  const applicantName = isIndividual
    ? (application.plumberName || application.applicantName || 'N/A')
    : (application.firmName || application.applicantName || 'N/A');

  const formatLabelLocal = (value: string | undefined | null): string => {
    if (!value) return 'N/A';
    return value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDateLocal = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const commTimestamp = application.workflow && application.workflow.commissioner && application.workflow.commissioner.timestamp;
  const commComment = application.commissionerComments || (application.workflow && application.workflow.commissioner && application.workflow.commissioner.comment) || '';

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
            Approved - Awaiting Citizen Payment
          </h1>
          <p className="text-gray-600 font-['Poppins',sans-serif]">
            Application ID: <span className="font-semibold">{application.id}</span>
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-['Poppins',sans-serif] font-medium border bg-amber-100 border-amber-300 text-amber-800">
          <Clock className="w-4 h-4" />
          Pending Payment
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="p-8 space-y-8">

          {/* Approval Status */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Approval Status
            </h3>
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <p className="text-[15px] font-semibold text-green-800 font-['Poppins',sans-serif]">
                  You approved this application. Waiting for citizen to complete payment.
                </p>
              </div>
              {commTimestamp && (
                <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-2">
                  Approved on: {formatDateLocal(commTimestamp)}
                </p>
              )}
              {commComment && (
                <div className="mt-3 p-4 bg-white rounded-lg border border-green-100">
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Your Approval Comments:</p>
                  <p className="text-sm text-gray-700 font-['Poppins',sans-serif]">{commComment}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Payment Status
            </h3>
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-amber-800 font-['Poppins',sans-serif] mb-1">
                    Awaiting Citizen Payment
                  </p>
                  <p className="text-sm text-amber-700 font-['Poppins',sans-serif] leading-relaxed">
                    The citizen has been notified to make the registration fee payment of Rs. {application.registrationFees || '1000'}.
                    Once the payment is completed, the application will re-appear in your queue for certificate generation and DSC.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Applicant Summary */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Applicant Summary
            </h3>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Applicant Name</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{applicantName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Registration Type</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {isIndividual ? 'Individual Plumber' : 'Contractor'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">District / ULB</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {formatLabelLocal(application.district)} / {formatLabelLocal(application.ulb)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Registration Fees</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    Rs. {application.registrationFees || '1000'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Financial Year</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{application.financialYear || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Mobile Number</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{application.mobileNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Certificate Generation View (after citizen payment) ──────────────────���──
function PlumberLicenseCertificateGeneration({ application, onBack }: { application: PlumberLicenseApp; onBack: () => void }) {
  const [processing, setProcessing] = useState(false);
  const [certComment, setCertComment] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState('');

  const isIndividual = application.registrationType === 'individual';
  const applicantName = isIndividual
    ? (application.plumberName || application.applicantName || 'N/A')
    : (application.firmName || application.applicantName || 'N/A');

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatLabel = (value: string | undefined | null): string => {
    if (!value) return 'N/A';
    return value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleGenerateLicense = async () => {
    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/commissioner/generate-license`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationId: application.id,
            comment: certComment,
            dscDetails: {
              signedBy: 'Commissioner',
            }
          }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        setShowConfirm(false);
        setGenerated(true);
        setLicenseNumber(data.licenseNumber || '');
        alert(`License certificate generated successfully!\n\nLicense No: ${data.licenseNumber}\nDSC applied. The citizen can now download their certificate.`);
      } else {
        const errMsg = data && data.error ? data.error : 'Unknown error';
        console.error('[COMM CERT GEN] Error:', errMsg);
        alert('Error generating certificate: ' + errMsg);
      }
    } catch (error) {
      console.error('[COMM CERT GEN] Error generating certificate:', error);
      alert('Error generating certificate: ' + error);
    } finally {
      setProcessing(false);
    }
  };

  const paymentDetails = application.paymentDetails || {};
  const paymentDate = paymentDetails && paymentDetails.paidAt ? formatDate(paymentDetails.paidAt) : 'N/A';
  const txnId = paymentDetails && paymentDetails.transactionId ? paymentDetails.transactionId : 'N/A';
  const paymentAmount = paymentDetails && paymentDetails.amount ? paymentDetails.amount : (application.registrationFees || '500');
  const paymentMethod = paymentDetails && paymentDetails.paymentMethod
    ? formatLabel(paymentDetails.paymentMethod) : 'Online';

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      <button
        onClick={onBack}
        disabled={processing}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
            Generate Plumber License Certificate
          </h1>
          <p className="text-gray-600 font-['Poppins',sans-serif]">
            Application ID: <span className="font-semibold">{application.id}</span>
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-['Poppins',sans-serif] font-medium border bg-cyan-100 border-cyan-300 text-cyan-800">
          <CreditCard className="w-4 h-4" />
          Payment Completed
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="p-8 space-y-8">

          {/* Payment Verification */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Payment Verification
            </h3>
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <p className="text-[15px] font-semibold text-green-800 font-['Poppins',sans-serif]">
                  Citizen has completed the payment. Ready for certificate generation.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Transaction ID</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{txnId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Amount Paid</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">Rs. {paymentAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Date</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{paymentDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Method</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{paymentMethod}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Applicant Summary */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Applicant Summary
            </h3>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Applicant Name</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{applicantName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Registration Type</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {isIndividual ? 'Individual Plumber' : 'Contractor'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">District</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{formatLabel(application.district)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">ULB</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{formatLabel(application.ulb)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Financial Year</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{application.financialYear || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Mobile Number</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{application.mobileNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Generation + DSC */}
          {generated ? (
            <div>
              <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                Certificate Generated
              </h3>
              <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-lg font-bold text-green-800 font-['Poppins',sans-serif]">
                      License No: {licenseNumber}
                    </p>
                    <p className="text-sm text-green-600 font-['Poppins',sans-serif]">
                      Certificate generated and DSC applied successfully
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5 mt-4">
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">DSC Status</p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium bg-green-100 text-green-800 border border-green-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Digital Signature Applied
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Certificate Status</p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium bg-green-100 text-green-800 border border-green-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Sent to Citizen
                    </span>
                  </div>
                </div>
                {certComment && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-green-100">
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Commissioner's Comments:</p>
                    <p className="text-sm text-gray-700 font-['Poppins',sans-serif]">{certComment}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                Generate Certificate & Apply DSC
              </h3>
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 space-y-5">
                {/* Info Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 font-['Poppins',sans-serif]">Certificate Generation</p>
                    <p className="text-sm text-amber-700 font-['Poppins',sans-serif] mt-1">
                      Clicking "Generate License & Apply DSC" will generate the official Plumber License certificate,
                      apply your Digital Signature Certificate (DSC), and send the license to the citizen for download.
                    </p>
                  </div>
                </div>

                {/* DSC Preview */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#1f3a5f]/10 flex items-center justify-center">
                      <PenTool className="w-5 h-5 text-[#1f3a5f]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Digital Signature Certificate (DSC)</p>
                      <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">Your DSC will be applied to the license certificate</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Signed By</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">Commissioner</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Authority</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{formatLabel(application.ulb)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">License Validity</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">3 Years from issue date</p>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={certComment}
                    onChange={(e) => setCertComment(e.target.value)}
                    placeholder="Enter any comments for the certificate..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={onBack}
                    disabled={processing}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowConfirm(true)}
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-[#1f3a5f]/90 transition-colors disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#1f3a5f] border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4" />
                        Generate License & Apply DSC
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 backdrop-blur-[2px] bg-[rgba(0,0,0,0.4)]" onClick={() => setShowConfirm(false)} />
          <div className="relative z-10 bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,120,160,0.15)] w-[470px] px-[24px] py-[32px] flex flex-col gap-[24px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#170f49] font-['Poppins',sans-serif]">Generate License Certificate</h3>
            </div>
            <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">
              Are you sure you want to generate the plumber license certificate for <strong>{applicantName}</strong> (Application: {application.id})?
              <br /><br />
              This will:
            </p>
            <ul className="text-[14px] text-gray-700 font-['Poppins',sans-serif] list-disc pl-6 -mt-3 space-y-1">
              <li>Generate an official Plumber License number</li>
              <li>Apply your Digital Signature Certificate (DSC)</li>
              <li>Send the license certificate to the citizen for download</li>
            </ul>
            <div className="flex justify-end gap-3 relative z-10">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={processing}
                className="px-6 py-2.5 rounded-[24px] border-[1.5px] border-gray-300 text-gray-700 font-['Poppins',sans-serif] font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerateLicense();
                }}
                disabled={processing}
                className="px-6 py-2.5 rounded-[24px] bg-[#1f3a5f] text-white font-['Poppins',sans-serif] font-medium text-sm hover:bg-[#1f3a5f]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {processing && (
                  <div className="w-4 h-4 border-2 border-[#1f3a5f] border-t-transparent rounded-full animate-spin" />
                )}
                Confirm & Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── License Issued View (read-only summary after certificate generated) ─────
function PlumberLicenseIssuedView({ application, onBack }: { application: PlumberLicenseApp; onBack: () => void }) {
  const isIndividual = application.registrationType === 'individual';
  const applicantName = isIndividual
    ? (application.plumberName || application.applicantName || 'N/A')
    : (application.firmName || application.applicantName || 'N/A');

  const formatDateFull = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatLabelLocal = (value: string | undefined | null): string => {
    if (!value) return 'N/A';
    return value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const paymentDetails = application.paymentDetails || {};
  const paymentDate = paymentDetails && paymentDetails.paidAt ? formatDateFull(paymentDetails.paidAt) : 'N/A';
  const txnId = paymentDetails && paymentDetails.transactionId ? paymentDetails.transactionId : 'N/A';
  const paymentAmount = paymentDetails && paymentDetails.amount ? paymentDetails.amount : (application.registrationFees || '500');
  const paymentMethod = paymentDetails && paymentDetails.paymentMethod
    ? formatLabelLocal(paymentDetails.paymentMethod) : 'Online';

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
            License Issued - Application Complete
          </h1>
          <p className="text-gray-600 font-['Poppins',sans-serif]">
            Application ID: <span className="font-semibold">{application.id}</span>
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-['Poppins',sans-serif] font-medium border bg-green-100 border-green-300 text-green-800">
          <CheckCircle className="w-4 h-4" />
          License Issued
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="p-8 space-y-8">

          {/* License Details */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              License Details
            </h3>
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-lg font-bold text-green-800 font-['Poppins',sans-serif]">
                    {application.licenseNumber || 'N/A'}
                  </p>
                  <p className="text-sm text-green-600 font-['Poppins',sans-serif]">Official Plumber License Number</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">License Holder</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{applicantName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Registration Type</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {isIndividual ? 'Individual Plumber' : 'Contractor'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">District / ULB</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {formatLabelLocal(application.district)} / {formatLabelLocal(application.ulb)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Date of Issue</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {formatDateFull(application.licenseIssuedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Valid Until</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {formatDateFull(application.licenseValidUntil)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Financial Year</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.financialYear || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DSC Details */}
          {application.dscDetails && (
            <div>
              <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                Digital Signature Certificate (DSC)
              </h3>
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <PenTool className="w-5 h-5 text-[#1f3a5f]" />
                  <p className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                    Digitally signed by Commissioner
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Signed By</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.dscDetails && application.dscDetails.signedBy ? application.dscDetails.signedBy : 'Commissioner'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">DSC Certificate ID</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.dscDetails && application.dscDetails.certificateId ? application.dscDetails.certificateId : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Signed Date</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.dscDetails && application.dscDetails.signedAt ? formatDateFull(application.dscDetails.signedAt) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Serial Number</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.dscDetails && application.dscDetails.serialNumber ? application.dscDetails.serialNumber : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Receipt */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Payment Receipt
            </h3>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Status</p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium bg-green-100 text-green-800 border border-green-200">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Completed
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Amount Paid</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">Rs. {paymentAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Transaction ID</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{txnId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Date</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{paymentDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Method</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{paymentMethod}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Commissioner Comments */}
          {application.commissionerComments && (
            <div>
              <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                Commissioner Comments
              </h3>
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                <p className="text-sm text-gray-700 font-['Poppins',sans-serif]">{application.commissionerComments}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function CommissionerPlumberLicenseDashboard() {
  const [applications, setApplications] = useState<PlumberLicenseApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<PlumberLicenseApp | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/commissioner/applications`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      if (data && data.success) {
        // Deduplicate by ID to prevent duplicate key warnings
        const rawApps = data.applications || [];
        const seen = new Set();
        const uniqueApps = rawApps.filter((app: PlumberLicenseApp) => {
          if (seen.has(app.id)) return false;
          seen.add(app.id);
          return true;
        });
        setApplications(uniqueApps);
      } else {
        console.error('[COMM PLUMBER LICENSE] API Error:', data && data.error ? data.error : 'Unknown');
        setApplications([]);
      }
    } catch (error) {
      console.error('[COMM PLUMBER LICENSE] Error fetching:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const filteredApps = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      (app.id && app.id.toLowerCase().includes(q)) ||
      (app.applicantName && app.applicantName.toLowerCase().includes(q)) ||
      (app.plumberName && app.plumberName.toLowerCase().includes(q)) ||
      (app.firmName && app.firmName.toLowerCase().includes(q)) ||
      (app.mobileNumber && app.mobileNumber.includes(searchQuery));
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (selectedApp) {
    // Route to license issued view for approved apps with license number
    if (selectedApp.status === 'approved' && selectedApp.licenseNumber) {
      return (
        <PlumberLicenseIssuedView
          application={selectedApp}
          onBack={() => { setSelectedApp(null); fetchApplications(); }}
        />
      );
    }
    // Route to certificate generation view for paymentCompleted apps
    if (selectedApp.status === 'paymentCompleted') {
      return (
        <PlumberLicenseCertificateGeneration
          application={selectedApp}
          onBack={() => { setSelectedApp(null); fetchApplications(); }}
        />
      );
    }
    // Route to pending payment view for apps awaiting citizen payment
    if (selectedApp.status === 'pendingPayment') {
      return (
        <PlumberLicensePendingPaymentView
          application={selectedApp}
          onBack={() => { setSelectedApp(null); fetchApplications(); }}
        />
      );
    }
    return (
      <PlumberLicenseCommissionerReview
        application={selectedApp}
        onBack={() => { setSelectedApp(null); fetchApplications(); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
          Plumber License - New Applications
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Review and approve/reject plumber license registration applications
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Application ID, Name, or Mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all"
            />
          </div>
          <div className="md:w-64 relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="sentToCommissioner">Pending Review</option>
              <option value="paymentCompleted">Payment Done - Generate Certificate</option>
              <option value="pendingPayment">Approved - Pending Payment</option>
              <option value="approved">License Issued</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f]"></div>
            <p className="mt-4 text-gray-600 font-['Poppins',sans-serif]">Loading applications...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 font-['Poppins',sans-serif]">
              {searchQuery || statusFilter !== 'all' ? 'No applications match your filters.' : 'No plumber license applications assigned yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto gov-table-scroll">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-[#27548a]/10 backdrop-blur-[4px]">
                <tr className="border-b border-[#170F49]">
                  <th className="px-4 py-3 text-center text-[14px] font-bold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[50px]">#</th>
                  <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[180px]">Application No</th>
                  <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[180px]">Applicant Name</th>
                  <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[120px]">Type</th>
                  <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[150px]">ULB</th>
                  <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[150px]">Submitted Date</th>
                  <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[160px]">Status</th>
                  <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[120px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApps.map((app, index) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-center text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif]">{index + 1}</td>
                    <td className="px-4 py-4 text-center text-[14px] font-medium text-[#1f3a5f] font-['Poppins',sans-serif]">{app.id}</td>
                    <td className="px-4 py-4 text-center text-[14px] text-gray-700 font-['Poppins',sans-serif]">
                      {app.applicantName || app.plumberName || app.firmName || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-['Poppins',sans-serif] border ${
                        app.registrationType === 'contractor'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : 'bg-teal-100 text-teal-800 border-teal-200'
                      }`}>
                        {app.registrationType === 'contractor' ? 'Contractor' : 'Individual'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-[14px] text-gray-700 font-['Poppins',sans-serif] capitalize">{(app.ulb || 'N/A').replace(/-/g, ' ')}</td>
                    <td className="px-4 py-4 text-center text-[14px] text-gray-700 font-['Poppins',sans-serif]">{formatDate(app.submittedAt)}</td>
                    <td className="px-4 py-4 text-center">{getStatusBadge(app.status)}</td>
                    <td className="px-4 py-4 text-center">
                      {app.status === 'paymentCompleted' ? (
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-sm hover:bg-[#1f3a5f]/90 transition-colors mx-auto"
                        >
                          <Award className="w-4 h-4" />
                          Generate License
                        </button>
                      ) : app.status === 'approved' ? (
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg font-['Poppins',sans-serif] font-medium text-sm hover:bg-green-700 transition-colors mx-auto"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      ) : app.status === 'pendingPayment' || app.status === 'rejected' ? (
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-500 text-white rounded-lg font-['Poppins',sans-serif] font-medium text-sm hover:bg-gray-600 transition-colors mx-auto"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-medium text-sm hover:bg-[#2d4a6f] transition-colors mx-auto"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
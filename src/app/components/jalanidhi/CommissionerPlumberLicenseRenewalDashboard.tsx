import { useState, useEffect } from 'react';
import { ChevronLeft, Search, Filter, Eye, Clock, CheckCircle, XCircle, User, MapPin, FileText, Building2, UserCheck, RotateCcw, RefreshCw, AlertTriangle, Shield, CreditCard, Award, PenTool } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { GovTable, GovTableHeader, GovTableHeaderCell, GovTableBody, GovTableRow, GovTableCell, GovTableEmpty, GovTableLoading } from '../ui/gov-table';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface RenewalApp {
  id: string;
  registrationType: string;
  status: string;
  submittedAt: string;
  updatedAt: string;
  isRenewal: boolean;
  renewalOf: string;
  originalLicenseNumber: string;
  district: string;
  ulb: string;
  financialYear: string;
  registrationFees: string;
  applicantName: string;
  mobileNumber: string;
  citizenId: string;
  plumberName?: string;
  addressDistrict?: string;
  city?: string;
  street?: string;
  wardNo?: string;
  pincode?: string;
  qualification?: string;
  yearOfExperience?: string;
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
  documents?: any;
  workflow?: any;
  caseworkerComments?: string;
  fieldEngineerComments?: string;
  commissionerComments?: string;
  commissionerDecision?: string;
  licenseNumber?: string;
  licenseIssuedAt?: string;
  licenseValidUntil?: string;
  paymentDetails?: any;
  dscDetails?: any;
}

const QUALIFICATION_LABELS: Record<string, string> = {
  'iti': 'ITI',
  'diploma': 'Diploma in Plumbing',
  'certificate': 'Certificate Course',
  'bsc': 'B.Sc. (Plumbing Technology)',
  'experience-based': 'Experience Based',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  '1': '1 Year',
  '2': '2 Years',
  '3': '3 Years',
  '4': '4 Years',
  '5': '5 Years',
  '6-10': '6-10 Years',
  '10+': '10+ Years',
};

const formatLabel = (value: string | undefined | null): string => {
  if (!value) return 'N/A';
  return value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDateFull = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Confirmation Popup ─────────────────────────────────────────────────────
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

// ─── Review View ────────────────────────────────────────────────────────────
function RenewalCommissionerReview({ application, onBack }: { application: RenewalApp; onBack: () => void }) {
  const [commComment, setCommComment] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showSendbackConfirm, setShowSendbackConfirm] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);
  const [completedAction, setCompletedAction] = useState<'approved' | 'rejected' | 'sent_back' | null>(null);

  useEffect(() => {
    const wf = application && application.workflow;
    const comm = wf && wf.commissioner;
    const appStatus = application && application.status;
    // If application is currently at commissioner for review, allow action
    if (appStatus === 'sentToCommissioner') {
      setActionCompleted(false);
      setCompletedAction(null);
      setCommComment('');
      return;
    }
    if (comm && (comm.status === 'approved' || comm.status === 'rejected' || comm.status === 'sent_back_to_citizen')) {
      setActionCompleted(true);
      if (comm.status === 'approved') {
        setCompletedAction('approved');
      } else if (comm.status === 'sent_back_to_citizen') {
        setCompletedAction('sent_back');
      } else {
        setCompletedAction('rejected');
      }
      setCommComment(comm.comment || '');
    }
  }, [application]);

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
        alert(`Renewal application ${application.id} approved successfully!\n\nThe Plumber can now proceed with payment.`);
      } else {
        const errMsg = data && data.error ? data.error : 'Unknown error';
        console.error('[COMM RENEWAL] Approve error:', errMsg);
        alert('Error approving: ' + errMsg);
      }
    } catch (error) {
      console.error('[COMM RENEWAL] Error approving:', error);
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
        alert(`Renewal application ${application.id} has been rejected.\n\nThe Plumber has been notified.`);
      } else {
        const errMsg = data && data.error ? data.error : 'Unknown error';
        console.error('[COMM RENEWAL] Reject error:', errMsg);
        alert('Error rejecting: ' + errMsg);
      }
    } catch (error) {
      console.error('[COMM RENEWAL] Error rejecting:', error);
      alert('Error rejecting: ' + error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSendback = async () => {
    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/commissioner/sendback-to-citizen`,
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
        alert(`Renewal application ${application.id} has been sent back to the Plumber for corrections.\n\nYour comments have been shared.`);
      } else {
        const errMsg = data && data.error ? data.error : 'Unknown error';
        console.error('[COMM RENEWAL] Sendback error:', errMsg);
        alert('Error sending back: ' + errMsg);
      }
    } catch (error) {
      console.error('[COMM RENEWAL] Error sending back:', error);
      alert('Error sending back: ' + error);
    } finally {
      setProcessing(false);
    }
  };

  const isIndividual = application.registrationType !== 'contractor';
  const isContractor = application.registrationType === 'contractor';

  // Build remarks entries
  const remarkEntries: RemarkEntry[] = [];

  // Previous send-back remarks
  const prevSendBacks = application.workflow && application.workflow.previousSendBacks ? application.workflow.previousSendBacks : [];
  prevSendBacks.forEach((sb: any) => {
    if (sb && sb.comment) {
      remarkEntries.push({
        role: sb.sentBackByLabel || 'Reviewer',
        comment: sb.comment + ' (Send Back)',
        timestamp: sb.timestamp || '',
        variant: 'sent_back' as const,
      });
    }
  });

  // Caseworker comment
  const caseworkerComment = application.caseworkerComments || (application.workflow && application.workflow.caseworker && application.workflow.caseworker.comment) || '';
  const caseworkerTimestamp = application.workflow && application.workflow.caseworker && application.workflow.caseworker.timestamp ? application.workflow.caseworker.timestamp : '';
  if (caseworkerComment) {
    remarkEntries.push({ role: 'Caseworker', comment: caseworkerComment, timestamp: caseworkerTimestamp });
  }

  // Field Engineer comment
  const feComment = application.fieldEngineerComments || (application.workflow && application.workflow.fieldEngineer && application.workflow.fieldEngineer.comment) || '';
  const feTimestamp = application.workflow && application.workflow.fieldEngineer && application.workflow.fieldEngineer.timestamp ? application.workflow.fieldEngineer.timestamp : '';
  if (feComment) {
    remarkEntries.push({ role: 'Field Engineer', comment: feComment, timestamp: feTimestamp });
  }

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      <button
        onClick={onBack}
        disabled={processing}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Renewal Applications
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
            Review Renewal Application
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium bg-amber-100 text-amber-800 border border-amber-300">
            <RefreshCw className="w-3.5 h-3.5" />
            Renewal
          </span>
        </div>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{application.id}</span>
        </p>
        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mt-1">
          Submitted on: {formatDateFull(application.submittedAt)} | Original License: <span className="font-medium text-[#1f3a5f]">{application.originalLicenseNumber || 'N/A'}</span>
        </p>
      </div>

      {/* Renewal Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[14px] font-semibold text-amber-800 font-['Poppins',sans-serif] mb-1">
              This is a License Renewal Application
            </p>
            <p className="text-sm text-amber-700 font-['Poppins',sans-serif] leading-relaxed">
              Original Application: <span className="font-medium">{application.renewalOf || 'N/A'}</span> | Certificate: <span className="font-medium">{application.originalLicenseNumber || 'N/A'}</span> | Renewal Fee: Rs. {application.registrationFees || '1000'}
            </p>
          </div>
        </div>
      </div>

      {/* Application Details Card */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="p-6 space-y-6">

          {/* Certificate Information */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Certificate Information
            </h3>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Application Number</p>
                  <p className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                    {application.id || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Original License Number</p>
                  <p className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                    {application.originalLicenseNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Registration Type</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {isIndividual ? 'Individual Plumber' : 'Contractor'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Renewal Of</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.renewalOf || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Submission Date</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {formatDateFull(application.submittedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Renewal Fee</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    Rs. {application.registrationFees || '1000'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ULB Information */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              ULB Information
            </h3>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">District</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {formatLabel(application.district)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">ULB</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {formatLabel(application.ulb)}
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

          {/* Personal Details (Individual) */}
          {isIndividual && (
            <div>
              <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                Personal Details
              </h3>
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Plumber Name</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.plumberName || application.applicantName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Mobile Number</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.mobileNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Qualification</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.qualification && QUALIFICATION_LABELS[application.qualification] ? QUALIFICATION_LABELS[application.qualification] : (application.qualification || 'N/A')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Experience</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.yearOfExperience && EXPERIENCE_LABELS[application.yearOfExperience] ? EXPERIENCE_LABELS[application.yearOfExperience] : (application.yearOfExperience || 'N/A')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">District (Address)</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {formatLabel(application.addressDistrict)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">City</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.city || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Street</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.street || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Ward No</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.wardNo || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Pincode</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.pincode || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contractor Details */}
          {isContractor && (
            <>
              <div>
                <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Contractor Details
                </h3>
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Firm Name</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {application.firmName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Type of Firm</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                        {application.typeOfFirm ? application.typeOfFirm.replace(/-/g, ' ') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Office Address</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {application.officeAddress || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">District</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {formatLabel(application.contDistrict)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Taluk</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {application.taluk || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Mobile Number</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {application.mobileNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Email ID</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {application.emailId || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">PAN Number</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {application.panNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">GST Number</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {application.gstNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authorized Person Details */}
              <div>
                <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Authorized Person Details
                </h3>
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Full Name</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {application.authFullName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Designation</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {application.authDesignation || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Mobile Number</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {application.authMobile || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Email ID</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {application.authEmail || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Documents */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Uploaded Documents
            </h3>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                {application.documents && application.documents.aadhar && (
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Aadhar Document</p>
                    <p className="text-[15px] font-medium text-green-700 font-['Poppins',sans-serif] flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> {application.documents.aadhar.name || 'Uploaded'}
                    </p>
                  </div>
                )}
                {application.documents && application.documents.experienceLetter && (
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Experience Letter</p>
                    <p className="text-[15px] font-medium text-green-700 font-['Poppins',sans-serif] flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> {application.documents.experienceLetter.name || 'Uploaded'}
                    </p>
                  </div>
                )}
                {application.documents && application.documents.supportingDoc && (
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Supporting Document</p>
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
      </div>

      {/* Consolidated Remarks Card */}
      {remarkEntries.length > 0 && (
        <div className="mb-6">
          <RemarksTimeline remarks={remarkEntries} title="Remarks" />
        </div>
      )}

      {/* Commissioner Decision Card */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5" />
            Commissioner Decision
          </h3>
          {actionCompleted ? (
            <div className="space-y-4">
              {completedAction === 'approved' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-800 font-['Poppins',sans-serif] text-sm">
                    This renewal application has been <strong>approved</strong>. The Plumber can now proceed to make the payment.
                  </p>
                </div>
              ) : completedAction === 'sent_back' ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                  <RotateCcw className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p className="text-amber-800 font-['Poppins',sans-serif] text-sm">
                    This renewal application has been <strong>sent back</strong> to the Plumber for corrections. Your comments have been shared.
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800 font-['Poppins',sans-serif] text-sm">
                    This renewal application has been <strong>rejected</strong>. The Plumber has been notified.
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
                  Reject
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
                  Send Back
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
                  Approve
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
        title="Approve Renewal"
        message={`Are you sure you want to approve renewal application ${application.id}? The Plumber will be notified and can proceed to make the renewal payment.`}
        type="approve"
        processing={processing}
      />
      <ConfirmationPopup
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={handleReject}
        title="Reject Renewal"
        message={`Are you sure you want to reject renewal application ${application.id}? The Plumber will be notified of the rejection with your comments. This application will be closed.`}
        type="reject"
        processing={processing}
      />
      <ConfirmationPopup
        isOpen={showSendbackConfirm}
        onClose={() => setShowSendbackConfirm(false)}
        onConfirm={handleSendback}
        title="Send Back to Plumber"
        message={`Are you sure you want to send back renewal application ${application.id} to the Plumber? Your comments will be shared and the Plumber can make the required corrections and resubmit.`}
        type="sendback"
        processing={processing}
      />
    </div>
  );
}

// ─── Pending Payment View (read-only, awaiting citizen payment) ─────────────
function RenewalPendingPaymentView({ application, onBack }: { application: RenewalApp; onBack: () => void }) {
  const isIndividual = application.registrationType !== 'contractor';
  const applicantName = isIndividual
    ? (application.plumberName || application.applicantName || 'N/A')
    : (application.firmName || application.applicantName || 'N/A');

  const commTimestamp = application.workflow && application.workflow.commissioner && application.workflow.commissioner.timestamp
    ? application.workflow.commissioner.timestamp : '';
  const commComment = application.commissionerComments
    || (application.workflow && application.workflow.commissioner && application.workflow.commissioner.comment)
    || '';

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2">
        <ChevronLeft className="w-4 h-4" /> Back to Renewal Applications
      </button>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">Approved - Awaiting Plumber Payment</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium bg-amber-100 text-amber-800 border border-amber-300"><RefreshCw className="w-3.5 h-3.5" />Renewal</span>
          </div>
          <p className="text-gray-600 font-['Poppins',sans-serif]">Application ID: <span className="font-semibold">{application.id}</span></p>
        </div>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-['Poppins',sans-serif] font-medium border bg-amber-100 border-amber-300 text-amber-800"><Clock className="w-4 h-4" />Pending Payment</span>
      </div>
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="p-8 space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Approval Status</h3>
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <p className="text-[15px] font-semibold text-green-800 font-['Poppins',sans-serif]">You approved this renewal application. Waiting for plumber to complete payment.</p>
              </div>
              {commTimestamp && (<p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-2">Approved on: {formatDateFull(commTimestamp)}</p>)}
              {commComment && (<div className="mt-3 p-4 bg-white rounded-lg border border-green-100"><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Your Approval Comments:</p><p className="text-sm text-gray-700 font-['Poppins',sans-serif]">{commComment}</p></div>)}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Payment Status</h3>
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5"><CreditCard className="w-5 h-5 text-amber-600" /></div>
                <div>
                  <p className="text-[15px] font-semibold text-amber-800 font-['Poppins',sans-serif] mb-1">Awaiting Plumber Payment</p>
                  <p className="text-sm text-amber-700 font-['Poppins',sans-serif] leading-relaxed">The plumber has been notified to make the renewal fee payment of Rs. {application.registrationFees || '1000'}. Once the payment is completed, the application will re-appear in your queue for certificate generation and DSC.</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Applicant Summary</h3>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Applicant Name</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{applicantName}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Original License</p><p className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">{application.originalLicenseNumber || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Registration Type</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{isIndividual ? 'Individual Plumber' : 'Contractor'}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">District / ULB</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{formatLabel(application.district)} / {formatLabel(application.ulb)}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Renewal Fee</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">Rs. {application.registrationFees || '1000'}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Mobile Number</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{application.mobileNumber || 'N/A'}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Certificate Generation View (after citizen payment) ────────────────────
function RenewalCertificateGeneration({ application, onBack }: { application: RenewalApp; onBack: () => void }) {
  const [processing, setProcessing] = useState(false);
  const [certComment, setCertComment] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState('');

  const isIndividual = application.registrationType !== 'contractor';
  const applicantName = isIndividual
    ? (application.plumberName || application.applicantName || 'N/A')
    : (application.firmName || application.applicantName || 'N/A');

  const handleGenerateLicense = async () => {
    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/commissioner/generate-license`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId: application.id, comment: certComment, dscDetails: { signedBy: 'Commissioner' } }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        setShowConfirm(false);
        setGenerated(true);
        setLicenseNumber(data.licenseNumber || '');
        alert(`Renewal license certificate generated successfully!\n\nLicense No: ${data.licenseNumber}\nDSC applied. The plumber can now download their renewed certificate.`);
      } else {
        const errMsg = data && data.error ? data.error : 'Unknown error';
        console.error('[COMM RENEWAL CERT GEN] Error:', errMsg);
        alert('Error generating certificate: ' + errMsg);
      }
    } catch (error) {
      console.error('[COMM RENEWAL CERT GEN] Error:', error);
      alert('Error generating certificate: ' + error);
    } finally {
      setProcessing(false);
    }
  };

  const paymentDetails = application.paymentDetails || {};
  const paymentDate = paymentDetails && paymentDetails.paidAt ? formatDateFull(paymentDetails.paidAt) : 'N/A';
  const txnId = paymentDetails && paymentDetails.transactionId ? paymentDetails.transactionId : 'N/A';
  const paymentAmount = paymentDetails && paymentDetails.amount ? paymentDetails.amount : (application.registrationFees || '1000');
  const paymentMethod = paymentDetails && paymentDetails.paymentMethod ? formatLabel(paymentDetails.paymentMethod) : 'Online';

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      <button onClick={onBack} disabled={processing} className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2 disabled:opacity-50">
        <ChevronLeft className="w-4 h-4" /> Back to Renewal Applications
      </button>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">Generate Renewal License Certificate</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium bg-amber-100 text-amber-800 border border-amber-300"><RefreshCw className="w-3.5 h-3.5" />Renewal</span>
          </div>
          <p className="text-gray-600 font-['Poppins',sans-serif]">Application ID: <span className="font-semibold">{application.id}</span></p>
        </div>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-['Poppins',sans-serif] font-medium border bg-cyan-100 border-cyan-300 text-cyan-800"><CreditCard className="w-4 h-4" />Payment Completed</span>
      </div>
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="p-8 space-y-8">
          {/* Payment Verification */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Payment Verification</h3>
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <p className="text-[15px] font-semibold text-green-800 font-['Poppins',sans-serif]">Plumber has completed the renewal payment. Ready for certificate generation.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-5">
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Transaction ID</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{txnId}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Amount Paid</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">Rs. {paymentAmount}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Date</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{paymentDate}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Method</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{paymentMethod}</p></div>
              </div>
            </div>
          </div>
          {/* Applicant Summary */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Renewal Information</h3>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Original License</p><p className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">{application.originalLicenseNumber || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Applicant Name</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{applicantName}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Registration Type</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{isIndividual ? 'Individual Plumber' : 'Contractor'}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">District</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{formatLabel(application.district)}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">ULB</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{formatLabel(application.ulb)}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Mobile Number</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{application.mobileNumber || 'N/A'}</p></div>
              </div>
            </div>
          </div>
          {/* Certificate Generation + DSC */}
          {generated ? (
            <div>
              <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Certificate Generated</h3>
              <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-lg font-bold text-green-800 font-['Poppins',sans-serif]">License No: {licenseNumber}</p>
                    <p className="text-sm text-green-600 font-['Poppins',sans-serif]">Renewal certificate generated and DSC applied successfully</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5 mt-4">
                  <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">DSC Status</p><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle className="w-3.5 h-3.5" />Digital Signature Applied</span></div>
                  <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Certificate Status</p><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle className="w-3.5 h-3.5" />Sent to Plumber</span></div>
                </div>
                {certComment && (<div className="mt-4 p-4 bg-white rounded-lg border border-green-100"><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Commissioner's Comments:</p><p className="text-sm text-gray-700 font-['Poppins',sans-serif]">{certComment}</p></div>)}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Generate Certificate & Apply DSC</h3>
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 space-y-5">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 font-['Poppins',sans-serif]">Renewal Certificate Generation</p>
                    <p className="text-sm text-amber-700 font-['Poppins',sans-serif] mt-1">Clicking "Generate Renewal License & Apply DSC" will generate the official renewed Plumber License certificate, apply your Digital Signature Certificate (DSC), and send the renewed license to the plumber for download.</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#1f3a5f]/10 flex items-center justify-center"><PenTool className="w-5 h-5 text-[#1f3a5f]" /></div>
                    <div>
                      <p className="text-sm font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Digital Signature Certificate (DSC)</p>
                      <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">Your DSC will be applied to the renewed license certificate</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                    <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Signed By</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">Commissioner</p></div>
                    <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Authority</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{formatLabel(application.ulb)}</p></div>
                    <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">License Validity</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">3 Years from issue date</p></div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">Comments (Optional)</label>
                  <textarea value={certComment} onChange={(e) => setCertComment(e.target.value)} placeholder="Enter any comments for the renewal certificate..." rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all resize-none" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={onBack} disabled={processing} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
                  <button onClick={() => setShowConfirm(true)} disabled={processing} className="inline-flex items-center gap-2 px-6 py-3 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-[#1f3a5f]/90 transition-colors disabled:opacity-50">
                    {processing ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating...</>) : (<><Award className="w-4 h-4" />Generate Renewal License & Apply DSC</>)}
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
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center"><Award className="w-5 h-5 text-amber-600" /></div>
              <h3 className="text-lg font-semibold text-[#170f49] font-['Poppins',sans-serif]">Generate Renewal License Certificate</h3>
            </div>
            <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">
              Are you sure you want to generate the renewed plumber license certificate for <strong>{applicantName}</strong> (Application: {application.id})?<br /><br />This will:
            </p>
            <ul className="text-[14px] text-gray-700 font-['Poppins',sans-serif] list-disc pl-6 -mt-3 space-y-1">
              <li>Generate a renewed official Plumber License number</li>
              <li>Apply your Digital Signature Certificate (DSC)</li>
              <li>Send the renewed license certificate to the plumber for download</li>
            </ul>
            <div className="flex justify-end gap-3 relative z-10">
              <button onClick={() => setShowConfirm(false)} disabled={processing} className="px-6 py-2.5 rounded-[24px] border-[1.5px] border-gray-300 text-gray-700 font-['Poppins',sans-serif] font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={(e) => { e.stopPropagation(); handleGenerateLicense(); }} disabled={processing} className="px-6 py-2.5 rounded-[24px] bg-[#1f3a5f] text-white font-['Poppins',sans-serif] font-medium text-sm hover:bg-[#1f3a5f]/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                {processing && (<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />)}
                Confirm & Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── License Issued View (read-only, after certificate generated) ───────────
function RenewalLicenseIssuedView({ application, onBack }: { application: RenewalApp; onBack: () => void }) {
  const isIndividual = application.registrationType !== 'contractor';
  const applicantName = isIndividual
    ? (application.plumberName || application.applicantName || 'N/A')
    : (application.firmName || application.applicantName || 'N/A');

  const formatDateLong = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const paymentDetails = application.paymentDetails || {};
  const txnId = paymentDetails && paymentDetails.transactionId ? paymentDetails.transactionId : 'N/A';
  const paymentAmount = paymentDetails && paymentDetails.amount ? paymentDetails.amount : (application.registrationFees || '1000');
  const paymentDate = paymentDetails && paymentDetails.paidAt ? formatDateLong(paymentDetails.paidAt) : 'N/A';
  const paymentMethod = paymentDetails && paymentDetails.paymentMethod ? formatLabel(paymentDetails.paymentMethod) : 'Online';

  const dscDetails = application.dscDetails || {};
  const dscSignedBy = dscDetails && dscDetails.signedBy ? dscDetails.signedBy : 'Commissioner';
  const dscSignedAt = dscDetails && dscDetails.signedAt ? formatDateLong(dscDetails.signedAt) : 'N/A';
  const dscCertId = dscDetails && dscDetails.certificateId ? dscDetails.certificateId : 'N/A';

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2">
        <ChevronLeft className="w-4 h-4" /> Back to Renewal Applications
      </button>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">Renewal License Issued</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium bg-amber-100 text-amber-800 border border-amber-300"><RefreshCw className="w-3.5 h-3.5" />Renewal</span>
          </div>
          <p className="text-gray-600 font-['Poppins',sans-serif]">Application ID: <span className="font-semibold">{application.id}</span></p>
        </div>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-['Poppins',sans-serif] font-medium border bg-green-100 border-green-300 text-green-800"><CheckCircle className="w-4 h-4" />License Issued</span>
      </div>
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="p-8 space-y-8">
          {/* License Details */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Renewed License Details</h3>
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <Award className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-lg font-bold text-green-800 font-['Poppins',sans-serif]">License No: {application.licenseNumber || 'N/A'}</p>
                  <p className="text-sm text-green-600 font-['Poppins',sans-serif]">Renewal certificate generated and DSC applied successfully</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Original License</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{application.originalLicenseNumber || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Issued Date</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{formatDateLong(application.licenseIssuedAt)}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Valid Until</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{formatDateLong(application.licenseValidUntil)}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Applicant</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{applicantName}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">District / ULB</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{formatLabel(application.district)} / {formatLabel(application.ulb)}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Mobile</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{application.mobileNumber || 'N/A'}</p></div>
              </div>
            </div>
          </div>
          {/* DSC Details */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Digital Signature Details</h3>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">DSC Status</p><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle className="w-3.5 h-3.5" />Digital Signature Applied</span></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Signed By</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{dscSignedBy}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Signed At</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{dscSignedAt}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">DSC Certificate ID</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{dscCertId}</p></div>
              </div>
            </div>
          </div>
          {/* Payment Details */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Payment Details</h3>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-5">
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Transaction ID</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{txnId}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Amount Paid</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">Rs. {paymentAmount}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Date</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{paymentDate}</p></div>
                <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Method</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{paymentMethod}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function CommissionerPlumberLicenseRenewalDashboard() {
  const [applications, setApplications] = useState<RenewalApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<RenewalApp | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRenewalApplications();
  }, []);

  const fetchRenewalApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/commissioner/renewal-applications`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      if (data && data.success) {
        const rawApps = data.applications || [];
        const seen = new Set();
        const uniqueApps = rawApps.filter((app: RenewalApp) => {
          if (seen.has(app.id)) return false;
          seen.add(app.id);
          return true;
        });
        console.log(`[COMM RENEWAL DASHBOARD] Loaded ${uniqueApps.length} renewal applications`);
        setApplications(uniqueApps);
      } else {
        console.error('[COMM RENEWAL DASHBOARD] API Error:', data && data.error ? data.error : 'Unknown');
        setApplications([]);
      }
    } catch (error) {
      console.error('[COMM RENEWAL DASHBOARD] Error fetching:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      'sentToCommissioner': { label: 'Pending Review', color: 'bg-pink-100 text-pink-800 border-pink-300' },
      'pendingPayment': { label: 'Pending Payment', color: 'bg-orange-100 text-orange-800 border-orange-300' },
      'paymentCompleted': { label: 'Payment Completed', color: 'bg-teal-100 text-teal-800 border-teal-300' },
      'approved': { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-300' },
      'rejected': { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-300' },
      'sentBackToCitizen': { label: 'Sent Back to Plumber', color: 'bg-orange-100 text-orange-800 border-orange-300' },
      'sentToFieldEngineer': { label: 'Sent Back to FE', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    };
    const config = configs[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium border ${config.color}`}>
        <Clock className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const filteredApps = applications.filter(app => {
    const plumberName = app.plumberName || app.firmName || app.applicantName || '';
    const certNumber = app.originalLicenseNumber || '';
    const matchesSearch =
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plumberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      certNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.mobileNumber && app.mobileNumber.includes(searchQuery));
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (selectedApp) {
    const backHandler = () => { setSelectedApp(null); fetchRenewalApplications(); };
    // Route to appropriate view based on application status
    if (selectedApp.status === 'pendingPayment') {
      return <RenewalPendingPaymentView application={selectedApp} onBack={backHandler} />;
    }
    if (selectedApp.status === 'paymentCompleted') {
      return <RenewalCertificateGeneration application={selectedApp} onBack={backHandler} />;
    }
    if (selectedApp.status === 'approved' && selectedApp.licenseNumber) {
      return <RenewalLicenseIssuedView application={selectedApp} onBack={backHandler} />;
    }
    // Default: review view (sentToCommissioner, rejected, sentBackToCitizen, etc.)
    return <RenewalCommissionerReview application={selectedApp} onBack={backHandler} />;
  }

  // Column definitions removed — using compositional GovTable below

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
          Plumber License - Renewal of License
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Review and approve plumber license renewal applications
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Application ID, Name, or Certificate Number..."
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
              <option value="all">All Statuses</option>
              <option value="sentToCommissioner">Pending Review</option>
              <option value="pendingPayment">Pending Payment</option>
              <option value="paymentCompleted">Payment Completed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="sentBackToCitizen">Sent Back to Plumber</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.10)] overflow-hidden">
        <GovTable title="Renewal Applications" minWidth="1000px">
          <GovTableHeader>
            <GovTableHeaderCell width="60px" align="center">SL. NO</GovTableHeaderCell>
            <GovTableHeaderCell width="200px">APPLICATION NUMBER</GovTableHeaderCell>
            <GovTableHeaderCell width="200px">PLUMBER NAME</GovTableHeaderCell>
            <GovTableHeaderCell width="200px">CERTIFICATE NUMBER</GovTableHeaderCell>
            <GovTableHeaderCell width="150px" align="center">SUBMISSION DATE</GovTableHeaderCell>
            <GovTableHeaderCell width="200px" align="center">STATUS</GovTableHeaderCell>
            <GovTableHeaderCell width="120px" align="center">ACTIONS</GovTableHeaderCell>
          </GovTableHeader>
          <GovTableBody>
            {loading ? (
              <GovTableLoading colSpan={7} />
            ) : filteredApps.length === 0 ? (
              <GovTableEmpty message="No renewal applications found" colSpan={7} />
            ) : (
              filteredApps.map((row, index) => {
                const isIndividual = row.registrationType !== 'contractor';
                const name = isIndividual
                  ? (row.plumberName || row.applicantName || 'N/A')
                  : (row.firmName || row.applicantName || 'N/A');
                const btnLabel = row.status === 'paymentCompleted' ? 'Generate Cert' : row.status === 'pendingPayment' ? 'View' : row.status === 'approved' && row.licenseNumber ? 'View License' : 'Review';
                const BtnIcon = row.status === 'paymentCompleted' ? Award : Eye;
                return (
                  <GovTableRow key={row.id} onClick={() => setSelectedApp(row)}>
                    <GovTableCell align="center">{index + 1}</GovTableCell>
                    <GovTableCell variant="id">{row.id}</GovTableCell>
                    <GovTableCell>{name}</GovTableCell>
                    <GovTableCell>
                      <span className="font-medium text-[#1f3a5f]">{row.originalLicenseNumber || 'N/A'}</span>
                    </GovTableCell>
                    <GovTableCell align="center">{formatDateFull(row.submittedAt)}</GovTableCell>
                    <GovTableCell align="center">{getStatusBadge(row.status)}</GovTableCell>
                    <GovTableCell align="center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(row);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1f3a5f] text-white rounded-md text-xs font-['Poppins',sans-serif] font-medium hover:bg-[#152d4a] transition-colors"
                      >
                        <BtnIcon className="w-3.5 h-3.5" />
                        {btnLabel}
                      </button>
                    </GovTableCell>
                  </GovTableRow>
                );
              })
            )}
          </GovTableBody>
        </GovTable>
      </div>
    </div>
  );
}
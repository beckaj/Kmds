import { useState, useEffect } from 'react';
import { ChevronLeft, Search, Filter, Eye, Clock, CheckCircle, User, MapPin, FileText, Building2, UserCheck, RotateCcw, RefreshCw, AlertTriangle, Shield } from 'lucide-react';
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
  // Workflow & other
  documents?: any;
  workflow?: any;
  caseworkerComments?: string;
  fieldEngineerComments?: string;
  commissionerComments?: string;
  commissionerDecision?: string;
  licenseNumber?: string;
  licenseIssuedAt?: string;
  licenseValidUntil?: string;
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

// ─── Review View ────────────────────────────────────────────────────────────
function RenewalReviewView({ application, onBack }: { application: RenewalApp; onBack: () => void }) {
  const [processing, setProcessing] = useState(false);
  const [forwarded, setForwarded] = useState(false);
  const [feComment, setFeComment] = useState('');

  // Check if commissioner sent this back — if so, FE needs to re-review
  const wf = application && application.workflow;
  const commData = wf && wf.commissioner;
  const isSentBack = commData && commData.status === 'sent_back' && application.status === 'sentToFieldEngineer';
  const commSendbackComment = isSentBack ? (application.commissionerComments || (commData && commData.comment) || '') : '';
  const commSendbackTimestamp = isSentBack && commData && commData.timestamp ? commData.timestamp : '';

  useEffect(() => {
    const wfLocal = application && application.workflow;
    const fe = wfLocal && wfLocal.fieldEngineer;
    const comm = wfLocal && wfLocal.commissioner;
    // If commissioner sent it back, allow FE to re-review even if previously forwarded
    const sentBack = comm && comm.status === 'sent_back' && application.status === 'sentToFieldEngineer';
    if (fe && fe.status === 'reviewed' && !sentBack) {
      setForwarded(true);
      setFeComment(fe.comment || '');
    }
  }, [application]);

  const handleForward = async (comment: string) => {
    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/field-engineer/forward`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId: application.id, comment, forwardTo: 'Commissioner' }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        alert(`Renewal application ${application.id} forwarded to Commissioner successfully!`);
        onBack();
      } else {
        const errMsg = data && data.error ? data.error : 'Unknown error';
        alert('Error forwarding: ' + errMsg);
      }
    } catch (error) {
      console.error('[FE RENEWAL] Error forwarding:', error);
      alert('Error forwarding: ' + error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSendBackToCitizen = async (comment: string) => {
    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/field-engineer/sendback`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId: application.id, comment }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        alert(`Renewal application ${application.id} sent back to Plumber for corrections.\n\nComment: ${comment}`);
        onBack();
      } else {
        const errMsg = data && data.error ? data.error : 'Unknown error';
        alert('Error sending back: ' + errMsg);
      }
    } catch (error) {
      console.error('[FE RENEWAL] Error sending back:', error);
      alert('Error sending back: ' + error);
    } finally {
      setProcessing(false);
    }
  };

  const isIndividual = application.registrationType !== 'contractor';
  const isContractor = application.registrationType === 'contractor';

  // Check if already forwarded or downstream
  const isAlreadyForwarded = application.status === 'sentToCommissioner' ||
    application.status === 'pendingPayment' ||
    application.status === 'paymentCompleted' ||
    application.status === 'approved' ||
    application.status === 'rejected';
  const isSentBackToCitizen = application.status === 'sentBackToCitizen';

  // Get caseworker comments
  const caseworkerComment = application.caseworkerComments || (application.workflow && application.workflow.caseworker && application.workflow.caseworker.comment) || '';
  const caseworkerTimestamp = application.workflow && application.workflow.caseworker && application.workflow.caseworker.timestamp ? application.workflow.caseworker.timestamp : '';

  // Build remarks
  const remarkEntries: RemarkEntry[] = [];
  // Previous send-back remarks (from previous cycles)
  const prevSendBacks = application.workflow && application.workflow.previousSendBacks ? application.workflow.previousSendBacks : [];
  prevSendBacks.forEach((sb: any) => {
    if (sb && sb.comment) {
      remarkEntries.push({
        role: sb.sentBackByLabel || 'Reviewer',
        comment: sb.comment + ' (Send Back to Plumber)',
        timestamp: sb.timestamp || '',
        variant: 'sent_back' as const,
      });
    }
  });
  if (caseworkerComment) {
    remarkEntries.push({ role: 'Caseworker', comment: caseworkerComment, timestamp: caseworkerTimestamp });
  }
  if (isSentBack && commSendbackComment) {
    remarkEntries.push({ role: 'Commissioner', comment: commSendbackComment, timestamp: commSendbackTimestamp, variant: 'sent_back' });
  }
  // Current send-back remark (if FE previously sent back)
  if (application.workflow && application.workflow.sendBack && application.workflow.sendBack.comment && application.status !== 'sentBackToCitizen') {
    remarkEntries.push({
      role: application.workflow.sendBack.sentBackByLabel || 'Reviewer',
      comment: application.workflow.sendBack.comment + ' (Send Back to Plumber)',
      timestamp: application.workflow.sendBack.timestamp || '',
      variant: 'sent_back' as const,
    });
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
            Verify Renewal Application
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

      {/* Commissioner Sent-Back Warning Banner */}
      {isSentBack && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 font-['Poppins',sans-serif]">Application Sent Back for Re-Review</p>
            <p className="text-sm text-amber-700 font-['Poppins',sans-serif] mt-1">
              The Commissioner has sent this renewal application back for re-review. Please address the concerns and re-forward with updated comments.
            </p>
          </div>
        </div>
      )}

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

      {/* Field Engineer Action Card */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
            Field Engineer Action
          </h3>

          {forwarded || isAlreadyForwarded ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-800 font-['Poppins',sans-serif] text-sm">
                  This renewal application has been verified and forwarded to the Commissioner.
                </p>
              </div>
              {feComment && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">Comments:</p>
                  <p className="text-sm text-gray-700 font-['Poppins',sans-serif]">{feComment}</p>
                </div>
              )}
              <div className="flex justify-end">
                <button
                  onClick={onBack}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : isSentBackToCitizen ? (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <p className="text-orange-800 font-['Poppins',sans-serif] text-sm">
                  This renewal application has been sent back to the Plumber for corrections.
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={onBack}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
                  Comments <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={feComment}
                  onChange={(e) => setFeComment(e.target.value)}
                  placeholder="Enter your verification comments for this renewal application..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all resize-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={onBack}
                  disabled={processing}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!feComment.trim()) {
                      alert('Please enter a comment before sending back');
                      return;
                    }
                    if (confirm('Are you sure you want to send this renewal application back to the Plumber for corrections?')) {
                      handleSendBackToCitizen(feComment);
                    }
                  }}
                  disabled={processing}
                  className="px-6 py-2.5 bg-white border-2 border-red-400 text-red-600 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Send Back
                </button>
                <button
                  onClick={() => {
                    if (!feComment.trim()) {
                      alert('Please enter a comment before forwarding');
                      return;
                    }
                    handleForward(feComment);
                  }}
                  disabled={processing}
                  className="px-6 py-2.5 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-[#152d4a] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {processing && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isSentBack ? 'Re-Forward to Commissioner' : 'Forward to Commissioner'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function FieldEngineerPlumberLicenseRenewalDashboard() {
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
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/field-engineer/renewal-applications`,
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
        console.log(`[FE RENEWAL DASHBOARD] Loaded ${uniqueApps.length} renewal applications`);
        setApplications(uniqueApps);
      } else {
        console.error('[FE RENEWAL DASHBOARD] API Error:', data && data.error ? data.error : 'Unknown');
        setApplications([]);
      }
    } catch (error) {
      console.error('[FE RENEWAL DASHBOARD] Error fetching:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (app: RenewalApp) => {
    const status = app.status;
    // Check if commissioner sent this back
    const isSentBackByComm = status === 'sentToFieldEngineer' && app.workflow && app.workflow.commissioner && app.workflow.commissioner.status === 'sent_back';
    const configs: Record<string, { label: string; color: string }> = {
      'sentToFieldEngineer': { label: 'Pending Verification', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
      'sentToCommissioner': { label: 'Sent to Commissioner', color: 'bg-purple-100 text-purple-800 border-purple-300' },
      'pendingPayment': { label: 'Pending Payment', color: 'bg-amber-100 text-amber-800 border-amber-300' },
      'paymentCompleted': { label: 'Payment Completed', color: 'bg-teal-100 text-teal-800 border-teal-300' },
      'approved': { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-300' },
      'rejected': { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-300' },
      'sentBackToCitizen': { label: 'Sent Back to Plumber', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    };
    if (isSentBackByComm) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium border bg-amber-100 text-amber-800 border-amber-300">
          <RotateCcw className="w-3.5 h-3.5" />
          Sent Back - Re-Verify
        </span>
      );
    }
    const config = configs[status] || configs['sentToFieldEngineer'];
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
    return (
      <RenewalReviewView
        application={selectedApp}
        onBack={() => { setSelectedApp(null); fetchRenewalApplications(); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
          Plumber License - Renewal of License
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Verify and process plumber license renewal applications
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
              <option value="sentToFieldEngineer">Pending Verification</option>
              <option value="sentToCommissioner">Sent to Commissioner</option>
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
                return (
                  <GovTableRow key={row.id} onClick={() => setSelectedApp(row)}>
                    <GovTableCell align="center">{index + 1}</GovTableCell>
                    <GovTableCell variant="id">{row.id}</GovTableCell>
                    <GovTableCell>{name}</GovTableCell>
                    <GovTableCell>
                      <span className="font-medium text-[#1f3a5f]">{row.originalLicenseNumber || 'N/A'}</span>
                    </GovTableCell>
                    <GovTableCell align="center">{formatDateFull(row.submittedAt)}</GovTableCell>
                    <GovTableCell align="center">{getStatusBadge(row)}</GovTableCell>
                    <GovTableCell align="center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(row);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1f3a5f] text-white rounded-md text-xs font-['Poppins',sans-serif] font-medium hover:bg-[#152d4a] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
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
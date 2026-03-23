import { useState } from 'react';
import { ChevronLeft, CheckCircle, XCircle, Scale, MessageSquare, FileText } from 'lucide-react';
import { GovButton } from '../../../ui/gov-button';
import { projectId, publicAnonKey } from '../../../../../../utils/supabase/info';
import { RemarksTimeline } from '../../RemarksTimeline';
import type { RemarkEntry } from '../../RemarksTimeline';

interface AppealApplication {
  id: string;
  ulb: string;
  menu: string;
  subMenu: string;
  dateOfRejection: string;
  dateOfAppealRequested: string;
  reasonForAppeal: string;
  status: string;
  currentStage: string;
  originalApplicationId: string;
  citizenName: string;
  citizenPhone: string;
  applicationDetails: any;
  workflow: any;
}

interface ProjectDirectorAppealViewProps {
  appeal: AppealApplication;
  onBack: () => void;
  onActionComplete: () => void;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-gray-500 mb-1 font-['Poppins',sans-serif]">{label}</label>
      <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{value}</p>
    </div>
  );
}

export default function ProjectDirectorAppealView({ appeal, onBack, onActionComplete }: ProjectDirectorAppealViewProps) {
  const [processing, setProcessing] = useState(false);
  const [actionComments, setActionComments] = useState('');

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  const isActioned = appeal.status === 'pd_approved' || appeal.status === 'pd_rejected' || appeal.status === 'commissioner_approved' || appeal.status === 'commissioner_appeal_rejected';
  const pdWf = appeal.workflow && appeal.workflow.projectDirector ? appeal.workflow.projectDirector : {};

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!actionComments.trim()) {
      alert('Please provide comments for your decision');
      return;
    }
    const confirmMsg = action === 'approve'
      ? 'Approve this appeal and send to Commissioner with your comments?'
      : 'Reject this appeal and close the application?';
    if (!confirm(confirmMsg)) return;

    setProcessing(true);
    try {
      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/appeal/pd-action',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + publicAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appealId: appeal.id,
            action,
            comments: actionComments.trim(),
            pdName: userData.name || 'Project Director',
          }),
        }
      );

      const data = await response.json();
      console.log('[PD APPEAL VIEW] Action response:', data);

      if (data.success) {
        alert(data.message);
        onActionComplete();
      } else {
        alert('Error: ' + (data.error || 'Unknown'));
      }
    } catch (err) {
      console.error('[PD APPEAL VIEW] Action error:', err);
      alert('Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <button
        onClick={onBack}
        disabled={processing}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
          Appeal Review
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
          Appeal Application No: <span className="font-semibold">{appeal.id}</span>
        </p>
        {isActioned && (
          <div className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold font-['Poppins',sans-serif] ${appeal.status === 'pd_approved' || appeal.status === 'commissioner_approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {(appeal.status === 'pd_approved' || appeal.status === 'commissioner_approved') ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {appeal.status === 'pd_approved' ? 'Approved - Sent to Commissioner' : appeal.status === 'commissioner_approved' ? 'Commissioner Approved - NTC Workflow In Progress' : appeal.status === 'commissioner_appeal_rejected' ? 'Commissioner Rejected - Case Closed' : 'Rejected - Closed'}
          </div>
        )}
      </div>

      {/* Appeal Details */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Appeal Information
          </h2>
        </div>
        <div className="p-6">
          <div className="bg-[#f8fafc] rounded-lg p-5">
            <div className="grid grid-cols-3 gap-6 mb-4">
              <DetailField label="Appeal Application No" value={appeal.id} />
              <DetailField label="Original Application No" value={appeal.originalApplicationId || 'N/A'} />
              <DetailField label="ULB" value={appeal.ulb || 'N/A'} />
            </div>
            <div className="grid grid-cols-3 gap-6 mb-4">
              <DetailField label="Menu" value={appeal.menu || 'Tap Connection'} />
              <DetailField label="Sub-Menu" value={appeal.subMenu || 'New Tap Connection'} />
              <DetailField label="Date of Rejection" value={formatDate(appeal.dateOfRejection)} />
            </div>
            <div className="grid grid-cols-3 gap-6 mb-4">
              <DetailField label="Date of Appeal Requested" value={formatDate(appeal.dateOfAppealRequested)} />
              <DetailField label="Applicant Name" value={appeal.citizenName || 'N/A'} />
              <DetailField label="Applicant Phone" value={appeal.citizenPhone || 'N/A'} />
            </div>
          </div>
        </div>
      </div>

      {/* Reason for Appeal */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Reason for Appeal
          </h2>
        </div>
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-[14px] text-amber-900 font-['Poppins',sans-serif]">
              {appeal.reasonForAppeal || 'No reason provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Original Application Summary */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Original Application Details
          </h2>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-[14px] text-blue-900 font-['Poppins',sans-serif]">
              Original Application ID: <span className="font-semibold">{appeal.originalApplicationId}</span>
            </p>
            <p className="text-[13px] text-blue-700 font-['Poppins',sans-serif] mt-2">
              This application was rejected by the Commissioner. The citizen has submitted an appeal requesting reconsideration.
            </p>
          </div>
        </div>
      </div>

      {/* PD Action - Only if not yet actioned */}
      {!isActioned && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Project Director Action
            </h2>
          </div>
          <div className="p-6">
            <div className="bg-[#f8fafc] rounded-lg p-5">
              <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                Comments <span className="text-red-500">*</span>
              </label>
              <textarea
                value={actionComments}
                onChange={(e) => setActionComments(e.target.value)}
                rows={4}
                placeholder="Enter your comments / observations..."
                className="w-full px-4 py-3 text-[14px] font-['Poppins',sans-serif] border-[1.5px] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] placeholder:text-gray-400 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <GovButton
                variant="danger"
                size="lg"
                onClick={() => handleAction('reject')}
                loading={processing}
                disabled={!actionComments.trim()}
              >
                <XCircle className="w-4 h-4" />
                Reject & Close
              </GovButton>
              <GovButton
                variant="success"
                size="lg"
                onClick={() => handleAction('approve')}
                loading={processing}
                disabled={!actionComments.trim()}
              >
                <CheckCircle className="w-4 h-4" />
                Approve & Send to Commissioner
              </GovButton>
            </div>
          </div>
        </div>
      )}

      {/* Comments & History for Appeal Decisions */}
      {(() => {
        const remarkEntries: RemarkEntry[] = [];
        if (isActioned && pdWf && pdWf.action) {
          const pdDecision = pdWf.action === 'approve' ? 'Approved - Sent to Commissioner' : 'Rejected - Application Closed';
          remarkEntries.push({ role: 'Project Director', comment: (pdWf.comments || pdDecision), timestamp: pdWf.timestamp || '', variant: pdWf.action === 'approve' ? 'approved' : 'rejected' });
        }
        if (appeal.status === 'commissioner_approved' || appeal.status === 'commissioner_appeal_rejected') {
          const commAppealWf = appeal.workflow && appeal.workflow.commissioner ? appeal.workflow.commissioner : null;
          const isCommApproved = appeal.status === 'commissioner_approved';
          const commDecision = isCommApproved ? 'Appeal Approved - Original Rejection Revoked' : 'Appeal Rejected - Original Rejection Upheld';
          if (commAppealWf) {
            remarkEntries.push({ role: 'Commissioner', comment: (commAppealWf.comments || commDecision), timestamp: commAppealWf.timestamp || '', variant: isCommApproved ? 'approved' : 'rejected' });
          }
        }
        return remarkEntries.length > 0 ? (
          <div className="mb-6">
            <RemarksTimeline remarks={remarkEntries} title="Appeal Decision History" />
          </div>
        ) : null;
      })()}
    </div>
  );
}
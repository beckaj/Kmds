import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle, RotateCcw, AlertTriangle, Shield, MessageSquare, XCircle, FileText, Printer, Send } from 'lucide-react';
import { GovInput } from '../ui/gov-input';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { QRCodeSVG } from 'qrcode.react';

interface CommissionerDCBCorrectionViewProps {
  applicationId: string;
  onBack: () => void;
}

export default function CommissionerDCBCorrectionView({ applicationId, onBack }: CommissionerDCBCorrectionViewProps) {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [commRemarks, setCommRemarks] = useState('');
  const [error, setError] = useState('');
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showRegeneratedBill, setShowRegeneratedBill] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchApplication(); }, [applicationId]);

  const fetchApplication = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/dcb/application/' + applicationId,
        { method: 'GET', headers: { 'Authorization': 'Bearer ' + publicAnonKey, 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      if (data && data.success && data.application) {
        setApplication(data.application);
      } else {
        setError(data && data.error ? data.error : 'Application not found');
      }
    } catch (err) {
      console.error('[COMM DCB VIEW] Error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'approve' | 'return' | 'reject') => {
    if (action === 'return' && !commRemarks.trim()) {
      alert('Please provide remarks when returning for rework.');
      return;
    }
    setProcessing(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const commName = userData && userData.name ? userData.name : 'Commissioner';

      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/dcb/commissioner/action',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + publicAnonKey },
          body: JSON.stringify({ applicationId, action, remarks: commRemarks.trim(), commissionerName: commName }),
        }
      );
      const result = await response.json();
      if (result && result.success) {
        setShowApproveConfirm(false);
        setShowReturnConfirm(false);
        setShowRejectConfirm(false);
        if (action === 'approve') {
          alert('DCB Correction approved successfully!\n\nThe system has:\n- Recalculated the DCB\n- Re-generated the bill with the same bill number\n- Updated the citizen DCB record and KMF-25 register\n- Locked the corrected bill\n- Sent notifications to caseworker and citizen');
        } else if (action === 'return') {
          alert('DCB Correction sent back to Caseworker.\n\nYour remarks have been shared directly with the caseworker to make the corrections you have mentioned. The RO will not be involved in this rework cycle.');
        } else {
          alert('DCB Correction rejected.\n\nYour comments have been shared with the caseworker.');
        }
        fetchApplication();
      } else {
        alert('Failed: ' + (result && result.error ? result.error : 'Unknown error'));
      }
    } catch (err) {
      console.error('[COMM DCB VIEW] Action error:', err);
      alert('Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-['Poppins',sans-serif]">Loading DCB correction details...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-[#1f3a5f] hover:underline font-['Poppins',sans-serif] text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to DCB Corrections
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 font-['Poppins',sans-serif]">{error || 'Application not found'}</p>
        </div>
      </div>
    );
  }

  const orig = application.originalData || {};
  const corrected = application.correctedData || {};
  const isPending = application.status === 'ro_approved';
  const isCorrectionApplied = application.status === 'correction_applied';
  const isReturned = application.status === 'returned_by_commissioner';
  const isRejected = application.status === 'rejected';
  const returnHistory = application.returnHistory || [];

  // Render field comparison (original vs corrected)
  const renderField = (label: string, origVal: any, correctedVal: any, isCurrency?: boolean) => {
    const origStr = isCurrency ? String(origVal) : String(origVal || 'N/A');
    const corrStr = isCurrency ? String(correctedVal) : String(correctedVal || 'N/A');
    const isChanged = origStr !== corrStr;
    return (
      <div className="w-full">
        <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
          {label}
          {isChanged && <span className="ml-2 text-[11px] text-[#1f3a5f] font-semibold">(CHANGED)</span>}
        </label>
        {isChanged ? (
          <div className="flex flex-col gap-1">
            <div className="h-10 px-3 flex items-center bg-red-50 border border-red-200 rounded-md text-sm text-red-700 font-['Poppins',sans-serif] line-through">
              {isCurrency ? '\u20B9 ' + origStr : origStr}
            </div>
            <div className="h-10 px-3 flex items-center bg-green-50 border border-green-200 rounded-md text-sm text-green-800 font-semibold font-['Poppins',sans-serif]">
              {isCurrency ? '\u20B9 ' + corrStr : corrStr}
            </div>
          </div>
        ) : (
          <div className="h-10 px-3 flex items-center bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-700 font-['Poppins',sans-serif]">
            {isCurrency ? '\u20B9 ' + origStr : origStr}
          </div>
        )}
      </div>
    );
  };

  // Collect all comments for consolidated section
  const comments: { role: string; name: string; date: string; text: string; type: 'remark' | 'return' }[] = [];

  // Caseworker remarks
  if (application.caseworkerRemarks) {
    comments.push({
      role: 'Caseworker',
      name: application.caseworkerName || 'Caseworker',
      date: application.forwardedAt || application.createdAt || '',
      text: application.caseworkerRemarks,
      type: 'remark',
    });
  }

  // RO remarks
  if (application.roAction && application.roAction.remarks) {
    comments.push({
      role: 'Revenue Officer',
      name: application.roAction && application.roAction.roName ? application.roAction.roName : 'Revenue Officer',
      date: application.roAction && application.roAction.actionDate ? application.roAction.actionDate : '',
      text: application.roAction.remarks,
      type: 'remark',
    });
  }

  // Return history entries
  returnHistory.forEach((entry: any) => {
    comments.push({
      role: 'Commissioner',
      name: entry.returnedBy || 'Commissioner',
      date: entry.returnedAt || '',
      text: entry.remarks || 'No comments',
      type: 'return',
    });
  });

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Back Button */}
      <button onClick={onBack} className="flex items-center gap-2 text-[#1f3a5f] hover:underline font-['Poppins',sans-serif] text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to DCB Corrections
      </button>

      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
            DCB Correction - Commissioner Review
          </h1>
          <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
            Application ID: {applicationId}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-['Poppins',sans-serif] uppercase tracking-wider ${
          isCorrectionApplied ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          : isReturned ? 'bg-orange-100 text-orange-800 border border-orange-200'
          : isRejected ? 'bg-red-100 text-red-800 border border-red-200'
          : 'bg-amber-100 text-amber-800 border border-amber-200'
        }`}>
          {isCorrectionApplied ? 'Correction Applied' : isReturned ? 'Returned for Rework' : isRejected ? 'Rejected' : 'Pending Approval'}
        </span>
      </div>

      {/* Section 1: District, ULB, ULB Type, RR Number */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-4 gap-6">
          <GovInput label="District" value={orig.district || 'N/A'} disabled />
          <GovInput label="ULB" value={orig.ulb || 'N/A'} disabled />
          <GovInput label="ULB Type" value={orig.ulbType || 'N/A'} disabled />
          <GovInput label="RR Number" value={application.rrNumber || 'N/A'} disabled />
        </div>
      </div>

      {/* Section 2: Connection Details */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5">
          Connection Details
        </h2>
        <div className="grid grid-cols-4 gap-6 mb-4">
          <GovInput label="Connection Type" value={orig.connectionType || 'N/A'} disabled />
          <GovInput label="Meter Category" value={orig.meterCategory || 'N/A'} disabled />
          <GovInput label="Meter Status" value={orig.meterStatus || 'N/A'} disabled />
          <GovInput label="Meter Installed Date" value={orig.meterInstalledDate || 'N/A'} disabled />
        </div>
        
      </div>

      {/* Section 3: DCB Details */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5">
          DCB Details
        </h2>
        {/* Row 1 */}
        <div className="grid grid-cols-3 gap-6 mb-4">
          <GovInput label="Previous Reading" value={orig.previousReading || 'N/A'} disabled />
          <GovInput label="Current Reading" value={corrected.currentReading || orig.currentReading || 'N/A'} disabled />
          <GovInput label="Bill Generated Date" value={orig.billGeneratedDate || 'N/A'} disabled />
        </div>
        {/* Row 2 */}
        <div className="grid grid-cols-3 gap-6 mb-4">
          <GovInput label="Bill Number" value={orig.billNumber || 'N/A'} disabled />
          <GovInput label="Arrears (In Rs)" value={'\u20B9 ' + (corrected.arrears || orig.arrears || 'N/A')} disabled />
          <GovInput label="Principle Amount (in Rs)" value={'\u20B9 ' + (corrected.principleAmount || orig.principleAmount || 'N/A')} disabled />
        </div>
        {/* Row 3 */}
        <div className="grid grid-cols-3 gap-6 mb-4">
          <GovInput label="Interest (in %)" value={(orig.interest || 0) + '%'} disabled />
          <GovInput label="Penalty (in Rs)" value={'\u20B9 ' + (corrected.penalty || orig.penalty || 'N/A')} disabled />
          <GovInput label="Total Amount (in Rs)" value={'\u20B9 ' + (corrected.totalAmount || orig.totalAmount || 'N/A')} disabled />
        </div>
        {/* Row 4 */}
        <div className="grid grid-cols-3 gap-6">
          <GovInput label="Effective Date" value={application.effectiveDate || 'N/A'} disabled />
          <GovInput label="Correction Reason" value={application.correctionReasonLabel || application.correctionReason || 'N/A'} disabled />
          <div className="w-full">
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
              Supporting Doc
            </label>
            {application.supportingDocument ? (
              <button
                onClick={() => {
                  if (application.supportingDocument && application.supportingDocument.startsWith('http')) {
                    window.open(application.supportingDocument, '_blank');
                  } else {
                    alert('Document: ' + (application.supportingDocument || 'N/A'));
                  }
                }}
                className="h-10 px-3 flex items-center justify-center bg-[#1f3a5f] text-white rounded-md text-sm font-medium font-['Poppins',sans-serif] hover:bg-[#2d4a6f] transition-colors w-full"
              >
                View Document
              </button>
            ) : (
              <div className="h-10 px-3 flex items-center bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-500 font-['Poppins',sans-serif]">
                No document
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Consolidated Comments */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comments
        </h2>
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 font-['Poppins',sans-serif]">No comments available.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c, idx) => {
              const roleColors: Record<string, string> = {
                'Caseworker': 'bg-blue-50 border-l-blue-500',
                'Revenue Officer': 'bg-purple-50 border-l-purple-500',
                'Commissioner': 'bg-orange-50 border-l-orange-500',
              };
              const badgeColors: Record<string, string> = {
                'Caseworker': 'bg-blue-100 text-blue-800',
                'Revenue Officer': 'bg-purple-100 text-purple-800',
                'Commissioner': 'bg-orange-100 text-orange-800',
              };
              const colorClass = roleColors[c.role] || 'bg-gray-50 border-l-gray-400';
              const badgeClass = badgeColors[c.role] || 'bg-gray-100 text-gray-800';

              return (
                <div key={idx} className={`border-l-4 ${colorClass} rounded-r-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-['Poppins',sans-serif] ${badgeClass}`}>
                        {c.role}
                      </span>
                      <span className="text-sm font-medium text-gray-800 font-['Poppins',sans-serif]">
                        {c.name}
                      </span>
                    </div>
                    {c.date && (
                      <span className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                        {formatDate(c.date)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 font-['Poppins',sans-serif] leading-relaxed">
                    {c.text}
                  </p>
                  {c.type === 'return' && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-orange-600 font-['Poppins',sans-serif] font-medium">
                      <RotateCcw className="w-3 h-3" /> Returned for rework
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 5: Commissioner Action */}
      {isPending ? (
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Commissioner Decision
          </h2>

          {/* Warning */}
          

          <div className="mb-4">
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
              Commissioner Remarks <span className="text-red-600">*</span>
            </label>
            <textarea
              className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-md font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/30 focus:border-[#1f3a5f]"
              placeholder="Enter your review remarks..."
              value={commRemarks}
              onChange={(e) => setCommRemarks(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                if (!commRemarks.trim()) { alert('Please enter remarks before rejecting.'); return; }
                setShowRejectConfirm(true);
              }}
              disabled={processing}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-sm hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={() => {
                if (!commRemarks.trim()) { alert('Please enter remarks before sending back.'); return; }
                setShowReturnConfirm(true);
              }}
              disabled={processing}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-sm hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Send Back
            </button>
            <button
              onClick={() => {
                if (!commRemarks.trim()) { alert('Please enter remarks before approving.'); return; }
                setShowApproveConfirm(true);
              }}
              disabled={processing}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-sm hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Approve & Regenerate Bill
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
            {isCorrectionApplied ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : isReturned ? (
              <RotateCcw className="w-5 h-5 text-orange-600" />
            ) : isRejected ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : (
              <Shield className="w-5 h-5" />
            )}
            Commissioner Decision
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <GovInput label="Decision" value={
              isCorrectionApplied ? 'Approved & Correction Applied'
              : isReturned ? 'Returned for Rework'
              : isRejected ? 'Rejected'
              : application.status
            } disabled />
            <GovInput label="Decided By" value={
              application.commissionerAction && application.commissionerAction.commissionerName
                ? application.commissionerAction.commissionerName : 'N/A'
            } disabled />
            <GovInput label="Decided On" value={formatDate(
              application.commissionerAction && application.commissionerAction.actionDate
                ? application.commissionerAction.actionDate : ''
            )} disabled />
          </div>
          {application.commissionerAction && application.commissionerAction.remarks && (
            <div className="mt-4">
              <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">Commissioner Remarks</label>
              <div className="p-3 bg-white border border-gray-200 rounded-md text-sm text-gray-700 font-['Poppins',sans-serif]">
                {application.commissionerAction.remarks}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Popups */}
      {showApproveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 backdrop-blur-[2px] bg-[rgba(0,0,0,0.4)]" onClick={() => setShowApproveConfirm(false)} />
          <div className="relative z-10 bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,120,160,0.15)] w-[500px] px-[24px] py-[32px] flex flex-col gap-[20px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#170f49] font-['Poppins',sans-serif]">Approve & Regenerate Bill</h3>
            </div>
            <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">
              Are you sure you want to approve this DCB correction for RR <strong>{application.rrNumber}</strong>?
            </p>
            <div className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">
              <p className="font-semibold mb-1">On approval, the system will automatically:</p>
              <ul className="list-disc pl-5 space-y-1 text-[13px]">
                <li>Recalculate the DCB with corrected meter reading</li>
                <li>Regenerate the bill with the same bill number</li>
                <li>Update citizen's DCB record and KMF-25 register</li>
                <li>Lock the corrected bill to prevent modifications</li>
                <li>Send notifications to caseworker and citizen</li>
                <li>Close the correction ticket</li>
              </ul>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowApproveConfirm(false)} disabled={processing} className="px-6 py-2.5 rounded-[24px] border-[1.5px] border-gray-300 text-gray-700 font-['Poppins',sans-serif] font-medium text-sm hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button
                onClick={async () => {
                  setProcessing(true);
                  try {
                    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                    const commName = userData && userData.name ? userData.name : 'Commissioner';
                    const response = await fetch(
                      'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/dcb/commissioner/action',
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + publicAnonKey },
                        body: JSON.stringify({ applicationId, action: 'approve', remarks: commRemarks.trim(), commissionerName: commName }),
                      }
                    );
                    const result = await response.json();
                    if (result && result.success) {
                      setShowApproveConfirm(false);
                      setShowRegeneratedBill(true);
                      fetchApplication();
                    } else {
                      alert('Failed: ' + (result && result.error ? result.error : 'Unknown error'));
                    }
                  } catch (err) {
                    console.error('[COMM DCB VIEW] Approve error:', err);
                    alert('Network error. Please try again.');
                  } finally {
                    setProcessing(false);
                  }
                }}
                disabled={processing}
                className="px-6 py-2.5 rounded-[24px] bg-green-600 text-white font-['Poppins',sans-serif] font-medium text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {processing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Confirm & Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Back Confirmation */}
      {showReturnConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 backdrop-blur-[2px] bg-[rgba(0,0,0,0.4)]" onClick={() => setShowReturnConfirm(false)} />
          <div className="relative z-10 bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,120,160,0.15)] w-[470px] px-[24px] py-[32px] flex flex-col gap-[20px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Send className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#170f49] font-['Poppins',sans-serif]">Send Back to Caseworker</h3>
            </div>
            <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">
              Are you sure you want to send back DCB correction <strong>{applicationId}</strong> to the <strong>Caseworker</strong> for rework? Your remarks will be shared directly with the caseworker to make the corrections you have mentioned. The RO will not be involved in this rework cycle.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReturnConfirm(false)} disabled={processing} className="px-6 py-2.5 rounded-[24px] border-[1.5px] border-gray-300 text-gray-700 font-['Poppins',sans-serif] font-medium text-sm hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={() => handleAction('return')} disabled={processing} className="px-6 py-2.5 rounded-[24px] bg-amber-500 text-white font-['Poppins',sans-serif] font-medium text-sm hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2">
                {processing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Confirm Send Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation */}
      {showRejectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 backdrop-blur-[2px] bg-[rgba(0,0,0,0.4)]" onClick={() => setShowRejectConfirm(false)} />
          <div className="relative z-10 bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,120,160,0.15)] w-[470px] px-[24px] py-[32px] flex flex-col gap-[20px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#170f49] font-['Poppins',sans-serif]">Reject DCB Correction</h3>
            </div>
            <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">
              Are you sure you want to <strong>reject</strong> DCB correction <strong>{applicationId}</strong>? This action cannot be undone. The caseworker will be notified of the rejection.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowRejectConfirm(false)} disabled={processing} className="px-6 py-2.5 rounded-[24px] border-[1.5px] border-gray-300 text-gray-700 font-['Poppins',sans-serif] font-medium text-sm hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={() => handleAction('reject')} disabled={processing} className="px-6 py-2.5 rounded-[24px] bg-red-600 text-white font-['Poppins',sans-serif] font-medium text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                {processing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerated Bill Modal */}
      {showRegeneratedBill && (() => {
        const billNo = orig.billNumber || 'BILL-' + Date.now();
        const rrNum = application.rrNumber || 'N/A';
        const applicantName = orig.applicantName || application.applicantName || 'N/A';
        const connectionType = orig.connectionType || 'N/A';
        const meterNumber = orig.meterNumber || 'N/A';
        const district = orig.district || 'N/A';
        const ulb = orig.ulb || 'N/A';
        const wardDisplay = orig.ward || 'N/A';
        const applicationNo = orig.applicationNo || application.applicationNo || 'N/A';

        const previousReading = orig.previousReading || '0';
        const currentReading = corrected.currentReading || orig.currentReading || '0';
        const prevNum = parseFloat(previousReading) || 0;
        const currNum = parseFloat(currentReading) || 0;
        const unitsConsumed = Math.max(0, currNum - prevNum);

        const billDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const dueDateObj = new Date();
        dueDateObj.setDate(dueDateObj.getDate() + 15);
        const dueDate = dueDateObj.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const billingMonth = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

        const ratePerUnit = (() => {
          const type = (connectionType || '').toLowerCase();
          if (type === 'domestic') return 5;
          if (type === 'non-domestic') return 8;
          if (type === 'commercial') return 10;
          if (type === 'industries' || type === 'industrial') return 12;
          return 5;
        })();

        const currentDemand = unitsConsumed * ratePerUnit;
        const arrears = parseFloat(corrected.arrears || orig.arrears || '0') || 0;
        const interest = parseFloat(corrected.interest || orig.interest || '0') || 0;
        const penalty = parseFloat(corrected.penalty || orig.penalty || '0') || 0;
        const others = 0;
        const totalAmount = currentDemand + arrears + interest + penalty + others;

        const fmtCurr = (val: number) => val.toFixed(2);

        const qrPayload = [
          'JALANIDHI-BILL',
          'BillNo:' + billNo,
          'RR:' + rrNum,
          'Name:' + applicantName,
          'Amount:' + totalAmount,
          'Due:' + dueDate,
          'ULB:' + ulb,
        ].join('|');

        const handlePrintBill = () => {
          if (!printRef.current) return;
          const printContents = printRef.current.innerHTML;
          const printWindow = window.open('', '_blank', 'width=500,height=800');
          if (!printWindow) return;
          printWindow.document.write(
            '<!DOCTYPE html><html><head><title>Regenerated Bill - ' + billNo + '</title>' +
            '<style>' +
            "@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');" +
            '* { margin: 0; padding: 0; box-sizing: border-box; }' +
            "body { font-family: 'Poppins', sans-serif; padding: 16px; background: #fff; }" +
            '.receipt-box { border: 2px solid #1f3a5f; padding: 20px; max-width: 420px; margin: 0 auto; }' +
            '.receipt-header { text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #1f3a5f; }' +
            '.receipt-title { font-size: 18px; font-weight: 700; color: #1f3a5f; margin-bottom: 2px; }' +
            '.receipt-subtitle { font-size: 11px; color: #555; }' +
            '.receipt-ulb { font-size: 13px; font-weight: 600; color: #1f3a5f; margin-top: 4px; }' +
            '.section-title { font-size: 11px; font-weight: 700; color: #1f3a5f; margin: 12px 0 6px; padding-bottom: 3px; border-bottom: 1px dashed #ccc; text-transform: uppercase; letter-spacing: 0.5px; }' +
            '.row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px; }' +
            '.row-label { color: #555; font-weight: 500; }' +
            '.row-value { color: #1a1a1a; font-weight: 600; text-align: right; max-width: 55%; }' +
            '.total-row { display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 2px solid #1f3a5f; font-size: 13px; font-weight: 700; color: #1f3a5f; }' +
            '.qr-section { text-align: center; margin-top: 16px; padding-top: 12px; border-top: 1px dashed #ccc; }' +
            '.qr-label { font-size: 9px; color: #777; margin-top: 6px; }' +
            '.footer-note { text-align: center; font-size: 9px; color: #888; margin-top: 12px; font-style: italic; }' +
            '.correction-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; margin-top: 4px; }' +
            '@media print { body { padding: 0; } }' +
            '</style></head><body>' + printContents + '</body></html>'
          );
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => { printWindow.print(); printWindow.close(); }, 400);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 backdrop-blur-[2px] bg-[rgba(0,0,0,0.4)]" onClick={() => setShowRegeneratedBill(false)} />
            <div className="relative z-10 bg-white rounded-[12px] shadow-[2px_2px_20px_0px_rgba(0,120,160,0.2)] w-[520px] max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Regenerated Bill</h3>
                    <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">DCB Correction Approved — Bill #{billNo}</p>
                  </div>
                </div>
                <button onClick={() => setShowRegeneratedBill(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Scrollable Bill Content */}
              <div className="flex-1 overflow-auto px-6 py-5">
                <div ref={printRef}>
                  <div style={{ border: '2px solid #1f3a5f', padding: '20px', background: '#fff', maxWidth: '420px', margin: '0 auto' }}>
                    {/* Receipt Header */}
                    <div style={{ textAlign: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #1f3a5f' }}>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#1f3a5f', fontFamily: "'Poppins', sans-serif", marginBottom: '2px' }}>
                        ULB Bill
                      </div>
                      <div style={{ fontSize: '11px', color: '#555', fontFamily: "'Poppins', sans-serif" }}>
                        Department of Municipal Administration
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f3a5f', fontFamily: "'Poppins', sans-serif", marginTop: '4px' }}>
                        {ulb}
                      </div>
                      <div className="correction-badge" style={{ display: 'inline-block', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, marginTop: '6px', fontFamily: "'Poppins', sans-serif" }}>
                        CORRECTED & REGENERATED
                      </div>
                    </div>

                    {/* Bill Info */}
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#1f3a5f', margin: '12px 0 6px', paddingBottom: '3px', borderBottom: '1px dashed #ccc', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Poppins', sans-serif" }}>
                      Bill Information
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: "'Poppins', sans-serif" }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Bill No</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{billNo}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Bill Date</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{billDate}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Due Date</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{dueDate}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Billing Month</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{billingMonth}</span>
                      </div>
                    </div>

                    {/* Consumer Details */}
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#1f3a5f', margin: '12px 0 6px', paddingBottom: '3px', borderBottom: '1px dashed #ccc', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Poppins', sans-serif" }}>
                      Consumer Details
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: "'Poppins', sans-serif" }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Consumer Name</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{applicantName}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>RR Number</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{rrNum}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Application No</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{applicationNo}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Connection Type</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{connectionType}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>District</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{district}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Ward</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{wardDisplay}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Meter No</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{meterNumber}</span>
                      </div>
                    </div>

                    {/* Meter Reading */}
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#1f3a5f', margin: '12px 0 6px', paddingBottom: '3px', borderBottom: '1px dashed #ccc', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Poppins', sans-serif" }}>
                      Meter Reading (Corrected)
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: "'Poppins', sans-serif" }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Previous Reading</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{previousReading}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Current Reading</span>
                        <span style={{ color: '#065f46', fontWeight: 700 }}>{currentReading}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Units Consumed</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{unitsConsumed}</span>
                      </div>
                    </div>

                    {/* Bill Breakdown */}
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#1f3a5f', margin: '12px 0 6px', paddingBottom: '3px', borderBottom: '1px dashed #ccc', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Poppins', sans-serif" }}>
                      Bill Breakdown
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: "'Poppins', sans-serif" }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Current Demand ({unitsConsumed} × Rs.{ratePerUnit})</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>Rs. {fmtCurr(currentDemand)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Arrears</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>Rs. {fmtCurr(arrears)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Interest</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>Rs. {fmtCurr(interest)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Penalty</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>Rs. {fmtCurr(penalty)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Others</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 600 }}>Rs. {fmtCurr(others)}</span>
                      </div>

                      {/* Total */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '2px solid #1f3a5f', fontSize: '13px', fontWeight: 700, color: '#1f3a5f', fontFamily: "'Poppins', sans-serif" }}>
                        <span>Total Amount Due</span>
                        <span>Rs. {fmtCurr(totalAmount)}</span>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #ccc' }}>
                      <QRCodeSVG value={qrPayload} size={110} level="M" style={{ margin: '0 auto' }} />
                      <div style={{ fontSize: '9px', color: '#777', marginTop: '6px', fontFamily: "'Poppins', sans-serif" }}>
                        Scan to Pay
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ textAlign: 'center', fontSize: '9px', color: '#888', marginTop: '12px', fontStyle: 'italic', fontFamily: "'Poppins', sans-serif" }}>
                      This is a computer-generated bill. For queries, contact your ULB office.
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-center gap-4 shrink-0">
                <button
                  onClick={handlePrintBill}
                  className="px-8 py-2.5 bg-[#f9a825] hover:bg-[#f59e0b] text-[#1f3a5f] rounded-lg font-['Poppins',sans-serif] font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Bill
                </button>
                <button
                  onClick={() => setShowRegeneratedBill(false)}
                  className="px-8 py-2.5 bg-[#1f3a5f] hover:bg-[#2a4a73] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
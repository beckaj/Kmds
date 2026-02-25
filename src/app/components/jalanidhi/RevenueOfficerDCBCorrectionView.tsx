import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, CheckCircle, XCircle, User, Calendar, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { GovInput } from '../ui/gov-input';
import { GovButton } from '../ui/gov-button';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface RevenueOfficerDCBCorrectionViewProps {
  applicationId: string;
}

export default function RevenueOfficerDCBCorrectionView({ applicationId }: RevenueOfficerDCBCorrectionViewProps) {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [roRemarks, setRoRemarks] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/dcb/application/' + applicationId,
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + publicAnonKey,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.success && data.application) {
        setApplication(data.application);
      } else {
        setError(data.error || 'Application not found');
      }
    } catch (err) {
      console.error('[RO DCB VIEW] Error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    const confirmMsg = action === 'approve'
      ? 'Are you sure you want to approve this DCB correction?'
      : 'Are you sure you want to reject this DCB correction?';
    if (!confirm(confirmMsg)) return;

    setProcessing(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const roName = userData && userData.name ? userData.name : 'Revenue Officer';

      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/dcb/revenue-officer/action',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + publicAnonKey,
          },
          body: JSON.stringify({
            applicationId,
            action,
            remarks: roRemarks.trim(),
            roName,
          }),
        }
      );
      const result = await response.json();
      if (result.success) {
        alert('DCB Correction ' + (action === 'approve' ? 'approved' : 'rejected') + ' successfully!');
        fetchApplication();
      } else {
        alert('Failed: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('[RO DCB VIEW] Action error:', err);
      alert('Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleBack = () => {
    const event = new CustomEvent('navigate', {
      detail: '/jalanidhi/revenue-officer/tap-connection/dcb-correction',
    });
    window.dispatchEvent(event);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
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
        <button onClick={handleBack} className="flex items-center gap-2 text-[#1f3a5f] hover:underline font-['Poppins',sans-serif] text-sm mb-4">
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
  const isActioned = application.status === 'approved' || application.status === 'rejected' || application.status === 'ro_approved' || application.status === 'ro_rejected' || application.status === 'correction_applied';
  const isReturnedByCommissioner = application.status === 'returned_by_commissioner';

  // Helper to highlight changed values
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

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Back Button */}
      <button onClick={handleBack} className="flex items-center gap-2 text-[#1f3a5f] hover:underline font-['Poppins',sans-serif] text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to DCB Corrections
      </button>

      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
            DCB Correction Review
          </h1>
          <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
            Application ID: {applicationId}
          </p>
        </div>
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold font-['Poppins',sans-serif] uppercase tracking-wider ${
          application.status === 'ro_approved' || application.status === 'correction_applied' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          : application.status === 'ro_rejected' ? 'bg-red-100 text-red-800 border border-red-200'
          : application.status === 'returned_by_commissioner' ? 'bg-orange-100 text-orange-800 border border-orange-200'
          : 'bg-amber-100 text-amber-800 border border-amber-200'
        }`}>
          {application.status === 'ro_approved' ? 'Forwarded to Commissioner'
           : application.status === 'correction_applied' ? 'Correction Applied'
           : application.status === 'ro_rejected' ? 'Rejected'
           : application.status === 'returned_by_commissioner' ? 'Returned by Commissioner'
           : 'Pending Review'}
        </span>
      </div>

      {/* Commissioner Return Banner (if returned for rework) */}
      {isReturnedByCommissioner && (
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-orange-800 font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Returned by Commissioner
          </h2>
          {application.commissionerAction && application.commissionerAction.remarks && (
            <div className="p-3 bg-white border border-orange-100 rounded-md text-sm text-gray-700 font-['Poppins',sans-serif] mb-4">
              <span className="text-xs text-gray-500 block mb-1">Commissioner's Comments:</span>
              {application.commissionerAction.remarks}
            </div>
          )}
          <p className="text-sm text-orange-700 font-['Poppins',sans-serif]">
            This correction was returned for rework. You can re-review and re-forward to Commissioner after addressing the comments.
          </p>
        </div>
      )}

      {/* Section 1: Caseworker Info */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
          <User className="w-5 h-5" />
          Forwarded By
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <GovInput label="Caseworker Name" value={application.caseworkerName || 'N/A'} disabled />
          <GovInput label="Forwarded Date" value={formatDate(application.forwardedAt || application.createdAt)} disabled />
          <GovInput label="RR Number" value={application.rrNumber || 'N/A'} disabled />
        </div>
      </div>

      {/* Section 2: Location Details */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Location Details
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <GovInput label="District" value={orig.district || 'N/A'} disabled />
          <GovInput label="ULB" value={orig.ulb || 'N/A'} disabled />
          <GovInput label="ULB Type" value={orig.ulbType || 'N/A'} disabled />
        </div>
      </div>

      {/* Section 3: Connection Details */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5">
          Connection Details:
        </h2>
        <div className="grid grid-cols-4 gap-6">
          <GovInput label="Connection Type" value={orig.connectionType || 'N/A'} disabled />
          <GovInput label="Meter Category" value={orig.meterCategory || 'N/A'} disabled />
          <GovInput label="Meter Status" value={orig.meterStatus || 'N/A'} disabled />
          <GovInput label="Meter Installed Date" value={orig.meterInstalledDate || 'N/A'} disabled />
        </div>
      </div>

      {/* Section 4: DCB Details - Comparison */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5">
          DCB Details (Original vs Corrected):
        </h2>
        <div className="grid grid-cols-3 gap-6 mb-4">
          <GovInput label="Previous Reading" value={orig.previousReading || 'N/A'} disabled />
          {renderField('Current Reading', orig.currentReading, corrected.currentReading)}
          <GovInput label="Bill Generated Date" value={orig.billGeneratedDate || 'N/A'} disabled />
        </div>
        <div className="grid grid-cols-3 gap-6 mb-4">
          <GovInput label="Bill Number" value={orig.billNumber || 'N/A'} disabled />
          {renderField('Arrears (In Rs)', orig.arrears, corrected.arrears, true)}
          {renderField('Principle Amount (in Rs)', orig.principleAmount, corrected.principleAmount, true)}
        </div>
        <div className="grid grid-cols-3 gap-6 mb-4">
          <GovInput label="Interest (in %)" value={(orig.interest || 0) + '%'} disabled />
          {renderField('Penalty (in Rs)', orig.penalty, corrected.penalty, true)}
          {renderField('Total Amount (in Rs)', orig.totalAmount, corrected.totalAmount, true)}
        </div>
      </div>

      {/* Section 5: Correction Details */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Correction Details
        </h2>
        <div className="grid grid-cols-3 gap-6 mb-4">
          <GovInput label="Effective Date" value={application.effectiveDate || 'N/A'} disabled />
          <GovInput label="Correction Reason" value={application.correctionReasonLabel || application.correctionReason || 'N/A'} disabled />
          <GovInput label="Supporting Document" value={application.supportingDocument || 'No document uploaded'} disabled />
        </div>
        {application.caseworkerRemarks && (
          <div className="mt-2">
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
              Caseworker Remarks
            </label>
            <div className="p-3 bg-white border border-gray-200 rounded-md text-sm text-gray-700 font-['Poppins',sans-serif]">
              {application.caseworkerRemarks}
            </div>
          </div>
        )}
      </div>

      {/* Section 6: Revenue Officer Action */}
      {!isActioned && !isReturnedByCommissioner ? (
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
            <Send className="w-5 h-5" />
            Revenue Officer Action
          </h2>
          <div className="mb-4">
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
              Remarks
            </label>
            <textarea
              className="w-full h-20 px-3 py-2 text-sm border border-gray-300 rounded-md font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/30 focus:border-[#1f3a5f]"
              placeholder="Enter your review remarks (optional)"
              value={roRemarks}
              onChange={(e) => setRoRemarks(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-4">
            <GovButton
              variant="success"
              onClick={() => handleAction('approve')}
              disabled={processing}
              loading={processing}
            >
              <Send className="w-4 h-4" />
              Forward to Commissioner
            </GovButton>
            <GovButton
              variant="outline"
              onClick={handleBack}
              disabled={processing}
            >
              Cancel
            </GovButton>
          </div>
        </div>
      ) : isReturnedByCommissioner ? (
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
            <Send className="w-5 h-5" />
            Re-forward to Commissioner
          </h2>
          <div className="mb-4">
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
              Remarks (address Commissioner's comments)
            </label>
            <textarea
              className="w-full h-20 px-3 py-2 text-sm border border-gray-300 rounded-md font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/30 focus:border-[#1f3a5f]"
              placeholder="Address the Commissioner's comments and provide updated remarks..."
              value={roRemarks}
              onChange={(e) => setRoRemarks(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-4">
            <GovButton
              variant="success"
              onClick={() => handleAction('approve')}
              disabled={processing}
              loading={processing}
            >
              <CheckCircle className="w-4 h-4" />
              Re-forward to Commissioner
            </GovButton>
            <GovButton
              variant="outline"
              onClick={handleBack}
              disabled={processing}
            >
              Cancel
            </GovButton>
          </div>
        </div>
      ) : (
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
            {application.status === 'ro_approved' || application.status === 'correction_applied' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : application.status === 'returned_by_commissioner' ? (
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            Revenue Officer Decision
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <GovInput label="Decision" value={
              application.status === 'ro_approved' || application.status === 'correction_applied' ? 'Approved & Forwarded to Commissioner'
              : application.status === 'returned_by_commissioner' ? 'Returned by Commissioner for Rework'
              : 'Rejected'
            } disabled />
            <GovInput label="Reviewed By" value={(application.roAction && application.roAction.roName) ? application.roAction.roName : 'N/A'} disabled />
            <GovInput label="Reviewed On" value={formatDate((application.roAction && application.roAction.actionDate) ? application.roAction.actionDate : '')} disabled />
          </div>
          {application.roAction && application.roAction.remarks && (
            <div className="mt-4">
              <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                Revenue Officer Remarks
              </label>
              <div className="p-3 bg-white border border-gray-200 rounded-md text-sm text-gray-700 font-['Poppins',sans-serif]">
                {application.roAction.remarks}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
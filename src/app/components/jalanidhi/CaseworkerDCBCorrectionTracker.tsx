import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, RotateCcw, Eye, RefreshCw, AlertTriangle, ChevronLeft, History, Send } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface CorrectionItem {
  id: string;
  rrNumber: string;
  status: string;
  correctionReasonLabel: string;
  correctionReason: string;
  createdAt: string;
  updatedAt: string;
  originalData: any;
  correctedData: any;
  caseworkerRemarks: string;
  roAction: any;
  commissionerAction: any;
  recalculatedDCB: any;
  auditLog: any[];
  notifications: any[];
  returnHistory: any[];
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  try { return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return dateStr; }
};

const formatDateFull = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  try { return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return dateStr; }
};

const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; color: string; Icon: any }> = {
    'pending': { label: 'Pending RO Review', color: 'bg-amber-100 text-amber-800 border-amber-300', Icon: Clock },
    'ro_approved': { label: 'RO Approved - At Commissioner', color: 'bg-blue-100 text-blue-800 border-blue-300', Icon: Send },
    'ro_rejected': { label: 'Rejected by RO', color: 'bg-red-100 text-red-800 border-red-300', Icon: XCircle },
    'returned_by_commissioner': { label: 'Returned for Rework', color: 'bg-orange-100 text-orange-800 border-orange-300', Icon: RotateCcw },
    'correction_applied': { label: 'Correction Applied', color: 'bg-green-100 text-green-800 border-green-300', Icon: CheckCircle },
  };
  return configs[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200', Icon: Clock };
};

export default function CaseworkerDCBCorrectionTracker() {
  const [corrections, setCorrections] = useState<CorrectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<CorrectionItem | null>(null);

  useEffect(() => { fetchCorrections(); }, []);

  const fetchCorrections = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const caseworkerId = userData && userData.phone ? userData.phone : '';
      if (!caseworkerId) { setCorrections([]); setLoading(false); return; }

      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/dcb/caseworker/my-corrections/' + caseworkerId,
        { method: 'GET', headers: { 'Authorization': 'Bearer ' + publicAnonKey, 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      if (data && data.success) {
        setCorrections(data.corrections || []);
      } else {
        console.error('[CW DCB TRACKER] Error:', data && data.error ? data.error : 'Unknown');
        setCorrections([]);
      }
    } catch (err) {
      console.error('[CW DCB TRACKER] Fetch error:', err);
      setCorrections([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Detail View ──
  if (selectedItem) {
    const statusConfig = getStatusConfig(selectedItem.status);
    const StatusIcon = statusConfig.Icon;
    const orig = selectedItem.originalData || {};
    const corrected = selectedItem.correctedData || {};
    const auditLog = selectedItem.auditLog || [];
    const returnHistory = selectedItem.returnHistory || [];
    const notifications = selectedItem.notifications || [];
    const recalcDCB = selectedItem.recalculatedDCB || null;

    return (
      <div className="p-6 max-w-[1200px] mx-auto">
        <button onClick={() => setSelectedItem(null)} className="flex items-center gap-2 text-[#1f3a5f] hover:underline font-['Poppins',sans-serif] text-sm mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to My Corrections
        </button>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">DCB Correction Status</h1>
            <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">Application: {selectedItem.id} | RR: {selectedItem.rrNumber}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-['Poppins',sans-serif] border ${statusConfig.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />{statusConfig.label}
          </span>
        </div>

        {/* Return notification */}
        {selectedItem.status === 'returned_by_commissioner' && returnHistory.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-orange-800 font-['Poppins',sans-serif]">Action Required: Returned for Rework</h3>
            </div>
            {returnHistory.map((entry: any, idx: number) => (
              <div key={idx} className="bg-white rounded-md border border-orange-100 p-4 mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-orange-800 font-['Poppins',sans-serif]">Returned by {entry.returnedBy || 'Commissioner'}</span>
                  <span className="text-xs text-gray-500 font-['Poppins',sans-serif]">{formatDateFull(entry.returnedAt)}</span>
                </div>
                <p className="text-sm text-gray-700 font-['Poppins',sans-serif]">{entry.remarks || 'No comments'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Correction applied success */}
        {selectedItem.status === 'correction_applied' && recalcDCB && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800 font-['Poppins',sans-serif]">Correction Applied Successfully</h3>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm font-['Poppins',sans-serif]">
              <div><span className="text-gray-500">Revised Total:</span> <span className="font-bold text-green-800">{'\u20B9'} {recalcDCB.totalAmount}</span></div>
              <div><span className="text-gray-500">Bill Number:</span> <span className="font-medium">{recalcDCB.billNumber}</span></div>
              <div><span className="text-gray-500">Version:</span> <span className="font-medium">v{recalcDCB.billVersion}</span></div>
              <div><span className="text-gray-500">Re-generated:</span> <span className="font-medium">{formatDate(recalcDCB.regeneratedAt)}</span></div>
            </div>
          </div>
        )}

        {/* DCB Comparison */}
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">Original vs Corrected</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left font-['Poppins',sans-serif] text-gray-700">Field</th>
                  <th className="px-4 py-2 text-left font-['Poppins',sans-serif] text-gray-700">Original</th>
                  <th className="px-4 py-2 text-left font-['Poppins',sans-serif] text-gray-700">Corrected</th>
                  <th className="px-4 py-2 text-left font-['Poppins',sans-serif] text-gray-700">Changed?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { label: 'Current Reading', orig: orig.currentReading, corr: corrected.currentReading },
                  { label: 'Arrears (Rs)', orig: orig.arrears, corr: corrected.arrears },
                  { label: 'Principal Amount (Rs)', orig: orig.principleAmount, corr: corrected.principleAmount },
                  { label: 'Penalty (Rs)', orig: orig.penalty, corr: corrected.penalty },
                  { label: 'Total Amount (Rs)', orig: orig.totalAmount, corr: corrected.totalAmount },
                ].map((row, idx) => {
                  const changed = String(row.orig) !== String(row.corr);
                  return (
                    <tr key={idx} className={changed ? 'bg-amber-50' : ''}>
                      <td className="px-4 py-2 font-medium font-['Poppins',sans-serif] text-gray-800">{row.label}</td>
                      <td className={`px-4 py-2 font-['Poppins',sans-serif] ${changed ? 'text-red-600 line-through' : 'text-gray-700'}`}>{String(row.orig || 'N/A')}</td>
                      <td className={`px-4 py-2 font-['Poppins',sans-serif] ${changed ? 'text-green-700 font-semibold' : 'text-gray-700'}`}>{String(row.corr || 'N/A')}</td>
                      <td className="px-4 py-2">{changed ? <span className="text-xs font-semibold text-[#1f3a5f] bg-blue-100 px-2 py-0.5 rounded">YES</span> : <span className="text-xs text-gray-400">No</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RO Decision */}
        {selectedItem.roAction && (
          <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Revenue Officer Decision</h2>
            <div className="grid grid-cols-3 gap-4 text-sm font-['Poppins',sans-serif]">
              <div><span className="text-gray-500">Decision:</span> <span className={`font-semibold ${selectedItem.roAction.action === 'approve' ? 'text-green-700' : 'text-red-700'}`}>{selectedItem.roAction.action === 'approve' ? 'Approved' : 'Rejected'}</span></div>
              <div><span className="text-gray-500">Reviewed By:</span> <span className="font-medium">{selectedItem.roAction.roName || 'N/A'}</span></div>
              <div><span className="text-gray-500">Date:</span> <span className="font-medium">{formatDateFull(selectedItem.roAction.actionDate)}</span></div>
            </div>
            {selectedItem.roAction.remarks && (
              <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                <span className="text-xs text-gray-500 font-['Poppins',sans-serif]">Remarks:</span>
                <p className="text-sm text-gray-700 font-['Poppins',sans-serif] mt-1">{selectedItem.roAction.remarks}</p>
              </div>
            )}
          </div>
        )}

        {/* Commissioner Decision */}
        {selectedItem.commissionerAction && (() => {
          const action = selectedItem.commissionerAction;
          const decision = action.action === 'approve' ? 'Approved' : 'Returned for Rework';
          const commComment = action.remarks || decision;
          const remarkEntries: RemarkEntry[] = [
            { role: 'Commissioner', comment: commComment, timestamp: action.actionDate || '', variant: action.action === 'approve' ? 'approved' : 'sent_back' },
          ];
          return (
            <div className="mb-6">
              <RemarksTimeline remarks={remarkEntries} title="Commissioner Decision" />
            </div>
          );
        })()}

        {/* Audit Trail */}
        {auditLog.length > 0 && (
          <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4 flex items-center gap-2">
              <History className="w-5 h-5" /> Audit Trail
            </h2>
            <div className="space-y-2">
              {auditLog.map((entry: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded border border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-[#1f3a5f] mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800 font-['Poppins',sans-serif]">{entry.actor} <span className="text-xs text-gray-400 font-normal">({entry.role})</span></span>
                      <span className="text-xs text-gray-400 font-['Poppins',sans-serif]">{formatDateFull(entry.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-0.5">{entry.remarks || entry.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
              <Send className="w-5 h-5" /> Notifications
            </h2>
            <div className="space-y-2">
              {notifications.filter((n: any) => n.to === 'caseworker').map((notif: any, idx: number) => (
                <div key={idx} className="bg-white rounded-md border border-blue-100 p-3">
                  <p className="text-sm text-gray-700 font-['Poppins',sans-serif]">{notif.message}</p>
                  <span className="text-xs text-gray-400 font-['Poppins',sans-serif]">{formatDateFull(notif.sentAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── List View ──
  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
            <FileText className="w-6 h-6" />
            My DCB Correction Requests
          </h1>
          <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
            Track the status of your submitted DCB correction requests
          </p>
        </div>
        <button onClick={fetchCorrections} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-['Poppins',sans-serif] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1f3a5f] mx-auto"></div>
            <p className="mt-3 text-gray-500 font-['Poppins',sans-serif] text-sm">Loading corrections...</p>
          </div>
        </div>
      ) : corrections.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 font-['Poppins',sans-serif] mb-2">No Corrections Found</h3>
          <p className="text-sm text-gray-400 font-['Poppins',sans-serif]">You haven't submitted any DCB correction requests yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1f3a5f] text-white">
                  <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[13px]">S.No</th>
                  <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[13px]">Application ID</th>
                  <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[13px]">RR Number</th>
                  <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[13px]">Reason</th>
                  <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[13px]">Submitted</th>
                  <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[13px]">Current Step</th>
                  <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[13px]">Status</th>
                  <th className="px-4 py-3 text-center font-['Poppins',sans-serif] font-semibold text-[13px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {corrections.map((item, idx) => {
                  const config = getStatusConfig(item.status);
                  const StIcon = config.Icon;
                  const currentStep = item.status === 'pending' ? 'Revenue Officer'
                    : item.status === 'ro_approved' ? 'Commissioner'
                    : item.status === 'ro_rejected' ? 'Closed (RO Rejected)'
                    : item.status === 'returned_by_commissioner' ? 'Caseworker (Rework)'
                    : item.status === 'correction_applied' ? 'Completed'
                    : 'Unknown';
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedItem(item)}>
                      <td className="px-4 py-3 text-gray-600 font-['Poppins',sans-serif]">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">{item.id}</td>
                      <td className="px-4 py-3 text-gray-800 font-['Poppins',sans-serif]">{item.rrNumber || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-700 font-['Poppins',sans-serif] text-[13px]">{item.correctionReasonLabel || item.correctionReason || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-600 font-['Poppins',sans-serif] text-[13px]">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-3 text-gray-700 font-['Poppins',sans-serif] text-[13px] font-medium">{currentStep}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium border ${config.color}`}>
                          <StIcon className="w-3 h-3" />{config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1f3a5f] text-white rounded-md text-xs font-['Poppins',sans-serif] font-medium hover:bg-[#152d4a] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

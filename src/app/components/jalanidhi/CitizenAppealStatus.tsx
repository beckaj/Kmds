import { useState, useEffect } from 'react';
import { Scale, Search, RefreshCw, CheckCircle, XCircle, Clock, CreditCard, FileText, Wrench, Eye, ChevronLeft } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

export default function CitizenAppealStatus() {
  const [appeals, setAppeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppeal, setSelectedAppeal] = useState<any>(null);
  const [origAppStatus, setOrigAppStatus] = useState<any>(null);
  const [loadingOrigApp, setLoadingOrigApp] = useState(false);

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const phone = userData && userData.phone ? String(userData.phone) : '';

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const url = 'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/appeal/applications?citizenPhone=' + phone;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + publicAnonKey,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setAppeals(data.applications || []);
        console.log('[APPEAL STATUS] Loaded', (data.applications || []).length, 'appeals');
      }
    } catch (err) {
      console.error('[APPEAL STATUS] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOriginalAppStatus = async (originalAppId: string) => {
    setLoadingOrigApp(true);
    try {
      const url = 'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/appeal/original-app-status?originalAppId=' + encodeURIComponent(originalAppId);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + publicAnonKey,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('[APPEAL STATUS] Original app status:', data);
      if (data.success && data.found) {
        setOrigAppStatus(data.application);
      } else {
        setOrigAppStatus(null);
      }
    } catch (err) {
      console.error('[APPEAL STATUS] Error fetching original app:', err);
      setOrigAppStatus(null);
    } finally {
      setLoadingOrigApp(false);
    }
  };

  const handleViewAppeal = (appeal: any) => {
    setSelectedAppeal(appeal);
    // Fetch original app status for approved or completed appeals (to show workflow progress)
    if ((appeal.status === 'commissioner_approved' || appeal.status === 'completed') && appeal.originalApplicationId) {
      fetchOriginalAppStatus(appeal.originalApplicationId);
    } else {
      setOrigAppStatus(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'requested') return { text: 'Requested', cls: 'bg-yellow-100 text-yellow-800' };
    if (status === 'pd_approved') return { text: 'Approved by PD', cls: 'bg-blue-100 text-blue-800' };
    if (status === 'pd_rejected') return { text: 'Rejected by PD', cls: 'bg-red-100 text-red-800' };
    if (status === 'commissioner_approved') return { text: 'Approved by Commissioner', cls: 'bg-green-100 text-green-800' };
    if (status === 'commissioner_rejected' || status === 'commissioner_appeal_rejected') return { text: 'Rejected by Commissioner', cls: 'bg-red-100 text-red-800' };
    if (status === 'completed') return { text: 'Completed', cls: 'bg-green-100 text-green-800' };
    return { text: status, cls: 'bg-gray-100 text-gray-800' };
  };

  const getOrigAppStageLabel = (status: string) => {
    if (status === 'sentToCitizenForPayment') return { label: 'Payment Pending', desc: 'Payment letter has been sent. Please proceed with payment from your Applications page.', cls: 'text-orange-700 bg-orange-50 border-orange-200', icon: CreditCard };
    if (status === 'payment_done' || status === 'commissioner_payment_verification') return { label: 'Payment Completed', desc: 'Payment received. Commissioner is verifying the payment.', cls: 'text-blue-700 bg-blue-50 border-blue-200', icon: CheckCircle };
    if (status === 'permission_letter_sent' || status === 'certificate_generated' || status === 'installation_approved') return { label: 'Permission Letter Issued', desc: 'Permission letter has been generated and sent to you and the plumber. Plumber will begin installation work.', cls: 'text-purple-700 bg-purple-50 border-purple-200', icon: FileText };
    if (status === 'plumber_accepted' || status === 'plumber_work_in_progress' || status === 'plumber_accepted_installation') return { label: 'Plumber Work In Progress', desc: 'The plumber has accepted the work and is performing the connection installation.', cls: 'text-indigo-700 bg-indigo-50 border-indigo-200', icon: Wrench };
    if (status === 'plumber_completed' || status === 'plumber_work_done' || status === 'installation_work_submitted') return { label: 'Plumber Work Completed', desc: 'The plumber has completed the installation. Pending Field Engineer verification.', cls: 'text-teal-700 bg-teal-50 border-teal-200', icon: CheckCircle };
    if (status === 'field_engineer_verification' || status === 'fe_verification') return { label: 'Field Engineer Verification', desc: 'Field Engineer is verifying the completed installation work.', cls: 'text-cyan-700 bg-cyan-50 border-cyan-200', icon: Eye };
    if (status === 'completed' || status === 'closed' || status === 'installation_completed') return { label: 'Application Completed', desc: 'Your water tap connection has been successfully installed and verified!', cls: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle };
    return { label: status || 'N/A', desc: 'Status is being updated.', cls: 'text-gray-700 bg-gray-50 border-gray-200', icon: Clock };
  };

  const filteredAppeals = appeals.filter((app) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (app.id || '').toLowerCase().includes(q) ||
      (app.originalApplicationId || '').toLowerCase().includes(q) ||
      (app.reasonForAppeal || '').toLowerCase().includes(q)
    );
  });

  const sortedAppeals = [...filteredAppeals].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] flex items-center justify-center px-8 py-6">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#1f3a5f] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#1f3a5f] font-['Poppins',sans-serif] text-lg">Loading appeal applications...</p>
        </div>
      </div>
    );
  }

  // Detail view for a selected appeal
  if (selectedAppeal) {
    const appeal = selectedAppeal;
    const badge = getStatusBadge(appeal.status);
    const pdWf = appeal.workflow && appeal.workflow.projectDirector ? appeal.workflow.projectDirector : null;
    const commWf = appeal.workflow && appeal.workflow.commissioner ? appeal.workflow.commissioner : null;
    const isApproved = appeal.status === 'commissioner_approved' || appeal.status === 'completed';

    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        <button
          onClick={() => { setSelectedAppeal(null); setOrigAppStatus(null); }}
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Appeals
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-3">
            <Scale className="w-6 h-6" />
            Appeal Details
          </h1>
          <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
            Appeal Application No: <span className="font-semibold">{appeal.id}</span>
          </p>
        </div>

        {/* Appeal Information Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Appeal Information</h2>
          </div>
          <div className="p-6">
            <div className="bg-[#f8fafc] rounded-lg p-5">
              <div className="grid grid-cols-3 gap-6 mb-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1 font-['Poppins',sans-serif]">Appeal Application No</label>
                  <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{appeal.id}</p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1 font-['Poppins',sans-serif]">Original Application No</label>
                  <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{appeal.originalApplicationId || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1 font-['Poppins',sans-serif]">Status</label>
                  <span className={'inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ' + badge.cls}>{badge.text}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 mb-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1 font-['Poppins',sans-serif]">Date of Appeal</label>
                  <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{formatDate(appeal.dateOfAppealRequested || appeal.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1 font-['Poppins',sans-serif]">Service Type</label>
                  <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{appeal.subMenu || 'New Tap Connection'}</p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1 font-['Poppins',sans-serif]">Current Queue</label>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[13px] font-['Poppins',sans-serif]">
                    {appeal.currentStage === 'project_director' ? 'Project Director' : appeal.currentStage === 'commissioner' ? 'Commissioner' : appeal.currentStage === 'closed' ? 'Closed' : appeal.currentStage === 'payment_letter_sent' ? 'Payment Letter Sent' : appeal.currentStage || 'N/A'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1 font-['Poppins',sans-serif]">Reason for Appeal</label>
                <p className="text-[14px] text-gray-900 font-['Poppins',sans-serif]">{appeal.reasonForAppeal || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comments & History */}
        {(() => {
          const remarkEntries: RemarkEntry[] = [];
          remarkEntries.push({ role: 'Citizen', comment: 'Appeal submitted' + (appeal.reasonForAppeal ? ': ' + appeal.reasonForAppeal : ''), timestamp: appeal.dateOfAppealRequested || appeal.createdAt || '' });
          if (pdWf) {
            const pdAction = pdWf.action === 'approve' ? 'Approved' : 'Rejected';
            remarkEntries.push({ role: 'Project Director', comment: (pdWf.comments || pdAction), timestamp: pdWf.timestamp || '', variant: pdWf.action === 'approve' ? 'approved' : 'rejected' });
          }
          if (commWf) {
            const commAction = commWf.action === 'approve' ? 'Rejection Revoked & Approved for Payment' : 'Appeal Rejected';
            remarkEntries.push({ role: 'Commissioner', comment: (commWf.comments || commAction), timestamp: commWf.timestamp || '', variant: commWf.action === 'approve' ? 'approved' : 'rejected' });
          }
          return (
            <div className="mb-6">
              <RemarksTimeline remarks={remarkEntries} title="Appeal Workflow Timeline" />
            </div>
          );
        })()}

        {/* Original Application Workflow Progress (only for commissioner_approved) */}
        {isApproved && (
          <div className="bg-white rounded-lg border-2 border-green-200 shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-green-200 bg-green-50/50">
              <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Original Application Workflow Progress
              </h2>
              <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mt-1">
                Your original application is now following the regular New Tap Connection workflow
              </p>
            </div>
            <div className="p-6">
              {loadingOrigApp ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-3 border-[#1f3a5f] border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-500 font-['Poppins',sans-serif] text-sm">Loading application status...</p>
                </div>
              ) : origAppStatus ? (
                <div>
                  {(() => {
                    const stageInfo = getOrigAppStageLabel(origAppStatus.status);
                    const StageIcon = stageInfo.icon;
                    return (
                      <div className={'rounded-lg p-5 border ' + stageInfo.cls}>
                        <div className="flex items-center gap-3 mb-2">
                          <StageIcon className="w-5 h-5" />
                          <p className="text-[16px] font-bold font-['Poppins',sans-serif]">{stageInfo.label}</p>
                        </div>
                        <p className="text-[14px] font-['Poppins',sans-serif]">{stageInfo.desc}</p>
                        {origAppStatus.updatedAt && (
                          <p className="text-[12px] mt-2 opacity-70 font-['Poppins',sans-serif]">Last updated: {formatDateTime(origAppStatus.updatedAt)}</p>
                        )}
                        {origAppStatus.paymentDetails && origAppStatus.paymentDetails.status === 'completed' && (
                          <div className="mt-3 pt-3 border-t border-current/20">
                            <p className="text-[13px] font-['Poppins',sans-serif]">
                              <span className="font-semibold">Payment Amount:</span> Rs. {origAppStatus.paymentDetails.amount || 'N/A'} |
                              <span className="font-semibold"> Paid:</span> {formatDateTime(origAppStatus.paymentDetails.paidAt)} |
                              <span className="font-semibold"> Txn:</span> {origAppStatus.paymentDetails.transactionId || 'N/A'}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* NTC Workflow Steps Tracker */}
                  <div className="mt-6">
                    <p className="text-[13px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-3">Workflow Steps:</p>
                    <div className="flex items-center gap-1">
                      {[
                        { key: 'payment', label: 'Payment', statuses: ['sentToCitizenForPayment'] },
                        { key: 'verification', label: 'Verification', statuses: ['payment_done', 'commissioner_payment_verification'] },
                        { key: 'permission', label: 'Permission Letter', statuses: ['installation_approved', 'permission_letter_sent', 'certificate_generated'] },
                        { key: 'plumber', label: 'Plumber Work', statuses: ['plumber_accepted_installation', 'plumber_accepted', 'plumber_work_in_progress', 'installation_work_submitted', 'plumber_completed', 'plumber_work_done'] },
                        { key: 'fe', label: 'FE Verification', statuses: ['field_engineer_verification', 'fe_verification'] },
                        { key: 'done', label: 'Completed', statuses: ['installation_completed', 'completed', 'closed'] },
                      ].map((step, idx, arr) => {
                        const appStatus = origAppStatus && origAppStatus.status ? origAppStatus.status : '';
                        const allStatuses = arr.flatMap(s => s.statuses);
                        const currentIdx = allStatuses.findIndex(s => s === appStatus);
                        const stepStartIdx = arr.slice(0, idx).reduce((sum, s) => sum + s.statuses.length, 0);
                        const isCompleted = currentIdx > stepStartIdx + step.statuses.length - 1;
                        const isCurrent = step.statuses.includes(appStatus);
                        const isPending = !isCompleted && !isCurrent;

                        return (
                          <div key={step.key} className="flex items-center gap-1 flex-1">
                            <div className={'flex flex-col items-center flex-1 ' + (isPending ? 'opacity-40' : '')}>
                              <div className={'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ' + (isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-[#1f3a5f] text-white' : 'bg-gray-200 text-gray-500')}>
                                {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span className="text-[10px] font-['Poppins',sans-serif] mt-1 text-center leading-tight">{step.label}</span>
                            </div>
                            {idx < arr.length - 1 && (
                              <div className={'h-0.5 w-4 flex-shrink-0 mt-[-14px] ' + (isCompleted ? 'bg-green-500' : 'bg-gray-200')} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 font-['Poppins',sans-serif] text-sm">
                    Original application status could not be loaded. Please check your Applications page for the latest status.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info banner for approved appeals */}
        {isApproved && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-[13px] text-blue-800 font-['Poppins',sans-serif]">
              <span className="font-semibold">Next Step:</span> Your appeal has been approved and the original rejection has been revoked.
              A payment letter has been sent to you. Please go to your <span className="font-bold">Applications</span> page to view the payment letter and make the payment.
              Once payment is completed, the regular New Tap Connection workflow will continue automatically.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2 flex items-center gap-3">
          <Scale className="w-7 h-7" />
          Appeal Application Status
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Track the status of your submitted appeals
        </p>
      </div>

      <div className="bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-['Poppins',sans-serif] text-[#414141] text-[18px] font-semibold">My Appeals</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAppeals}
              className="px-4 py-2 bg-[#f9a825] text-white rounded-lg font-['Poppins',sans-serif] font-semibold hover:bg-[#f9a825]/90 transition-colors flex items-center gap-2 text-[14px]"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <div className="bg-white flex gap-2 items-center px-3 py-2.5 rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.2),0px_0px_0px_1px_rgba(104,113,130,0.2)] w-[280px]">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="flex-1 font-['Inter',sans-serif] text-[14px] text-[#28334b] outline-none bg-transparent"
              />
            </div>
          </div>
        </div>

        {sortedAppeals.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scale className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 font-['Poppins',sans-serif] text-lg mb-2">No appeal applications found</p>
            <p className="text-gray-500 font-['Poppins',sans-serif] text-sm">
              You have not submitted any appeals yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1300px]">
              <thead>
                <tr className="bg-[#27548a]/10">
                  <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[#170f49] text-[14px] tracking-[0.56px] uppercase border-b-2 border-[#27548a]/20">#</th>
                  <th className="px-4 py-3 text-center font-['Poppins',sans-serif] font-semibold text-[#170f49] text-[14px] tracking-[0.56px] uppercase border-b-2 border-[#27548a]/20 min-w-[200px]">Appeal Application No</th>
                  <th className="px-4 py-3 text-center font-['Poppins',sans-serif] font-semibold text-[#170f49] text-[14px] tracking-[0.56px] uppercase border-b-2 border-[#27548a]/20 min-w-[200px]">Original Application No</th>
                  <th className="px-4 py-3 text-center font-['Poppins',sans-serif] font-semibold text-[#170f49] text-[14px] tracking-[0.56px] uppercase border-b-2 border-[#27548a]/20 min-w-[130px]">Sub-Menu</th>
                  <th className="px-4 py-3 text-center font-['Poppins',sans-serif] font-semibold text-[#170f49] text-[14px] tracking-[0.56px] uppercase border-b-2 border-[#27548a]/20 min-w-[130px]">Date of Appeal</th>
                  <th className="px-4 py-3 text-center font-['Poppins',sans-serif] font-semibold text-[#170f49] text-[14px] tracking-[0.56px] uppercase border-b-2 border-[#27548a]/20 min-w-[200px]">Reason for Appeal</th>
                  <th className="px-4 py-3 text-center font-['Poppins',sans-serif] font-semibold text-[#170f49] text-[14px] tracking-[0.56px] uppercase border-b-2 border-[#27548a]/20 min-w-[100px]">Queue</th>
                  <th className="px-4 py-3 text-center font-['Poppins',sans-serif] font-semibold text-[#170f49] text-[14px] tracking-[0.56px] uppercase border-b-2 border-[#27548a]/20 min-w-[150px]">Status</th>
                  <th className="px-4 py-3 text-center font-['Poppins',sans-serif] font-semibold text-[#170f49] text-[14px] tracking-[0.56px] uppercase border-b-2 border-[#27548a]/20 min-w-[80px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedAppeals.map((appeal, index) => {
                  const badge = getStatusBadge(appeal.status);
                  return (
                    <tr key={appeal.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-black">{index + 1}</td>
                      <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-[#1f3a5f] text-center">
                        <span className="inline-block max-w-[200px] truncate" title={appeal.id}>{appeal.id}</span>
                      </td>
                      <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-[#171c26] text-center">
                        <span className="inline-block max-w-[200px] truncate" title={appeal.originalApplicationId}>{appeal.originalApplicationId}</span>
                      </td>
                      <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-[#171c26] text-center">
                        {appeal.subMenu || 'New Tap Connection'}
                      </td>
                      <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-[#171c26] text-center">
                        {formatDate(appeal.dateOfAppealRequested || appeal.createdAt)}
                      </td>
                      <td className="px-4 py-4 font-['Poppins',sans-serif] text-[13px] text-[#171c26] text-center">
                        <span className="inline-block max-w-[200px] truncate" title={appeal.reasonForAppeal}>{appeal.reasonForAppeal || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-[#171c26] text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[13px]">
                          {appeal.currentStage === 'project_director' ? 'Project Director' : appeal.currentStage === 'commissioner' ? 'Commissioner' : appeal.currentStage === 'closed' ? 'Closed' : appeal.currentStage === 'payment_letter_sent' ? 'Payment Flow' : appeal.currentStage || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={'inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold ' + badge.cls}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleViewAppeal(appeal)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1f3a5f] text-white rounded-md text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-[#2d4a6f] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
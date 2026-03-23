import { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, MapPin, Camera, User, Wrench, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { RemarksTimeline, RemarkEntry } from './RemarksTimeline';
import SectionTitle from './SectionTitle';

interface FieldEngineerDisconnectionViewProps {
  applicationId: string;
}

// Plumber data
const PLUMBER_LIST = [
  {
    licenseNo: 'HUB-DHAR/0173/PLN',
    plumberName: 'Ramesh M',
    licensedDate: '01/08/2025',
    licenseExpiryDate: '31/09/2026',
    mobileNumber: '9876543210',
  },
];

// Reusable read-only field display
function ReadOnlyField({ label, value }: { label: string; value: string | number | undefined | null }) {
  const displayValue = (value !== undefined && value !== null && value !== '')
    ? String(value)
    : 'N/A';
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

// Section divider
function SectionDivider() {
  return (
    <div className="w-full border-t border-[#dee2e6]" />
  );
}

export default function FieldEngineerDisconnectionView({ applicationId }: FieldEngineerDisconnectionViewProps) {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [fieldEngineerComment, setFieldEngineerComment] = useState('');
  const [selectedPlumberLicense, setSelectedPlumberLicense] = useState('');
  const [wantsSiteVisit, setWantsSiteVisit] = useState<string>('');
  const [forwarded, setForwarded] = useState(false);
  const [forwardedTo, setForwardedTo] = useState('');
  const [forwardedAt, setForwardedAt] = useState('');
  // Verification state (post-plumber phase)
  const [verificationRemarks, setVerificationRemarks] = useState('');
  const [siteVisitDone, setSiteVisitDone] = useState('');
  const [siteVisitRemarks, setSiteVisitRemarks] = useState('');
  const [showReworkModal, setShowReworkModal] = useState(false);
  const [reworkRemarks, setReworkRemarks] = useState('');

  useEffect(() => {
    loadApplicationData();
  }, [applicationId]);

  const loadApplicationData = async () => {
    try {
      setLoading(true);
      console.log('[FE DISCONNECTION VIEW] Fetching application:', applicationId);

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
        console.error('[FE DISCONNECTION VIEW] API Error:', response.statusText);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[FE DISCONNECTION VIEW] API Response:', data);

      if (data.success && data.application) {
        setApplication(data.application);

        // Check if already forwarded (initial review phase)
        const wf = data.application.workflow;
        const feWf = wf && wf.fieldEngineer;
        if (feWf && feWf.status === 'reviewed') {
          setForwarded(true);
          setForwardedTo(feWf.forwardedTo || 'Commissioner');
          setForwardedAt(feWf.timestamp || '');
          if (feWf.assignedPlumber) {
            setSelectedPlumberLicense(feWf.assignedPlumber);
          }
        }
      } else {
        console.error('[FE DISCONNECTION VIEW] Error:', data.error);
      }
    } catch (error) {
      console.error('[FE DISCONNECTION VIEW] Error loading application:', error);
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
    if (!dateString || dateString === 'N/A') return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const selectedPlumber = PLUMBER_LIST.find(p => p.licenseNo === selectedPlumberLicense);

  // Forward to Commissioner (initial review phase)
  const handleForward = async () => {
    if (!fieldEngineerComment.trim()) {
      alert('Please enter comments before forwarding.');
      return;
    }

    if (!selectedPlumberLicense) {
      alert('Please select a plumber before forwarding to Commissioner.');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/field_engineer/forward`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: application.id,
            comment: fieldEngineerComment,
            assignedPlumber: selectedPlumberLicense,
            wantsSiteVisit: wantsSiteVisit || 'no',
            forwardTo: 'Commissioner'
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(`Application ${application.id} forwarded to Commissioner successfully!`);
        const event = new CustomEvent('navigate', { detail: '/jalanidhi/field-engineer/tap-connection/disconnection-requests' });
        window.dispatchEvent(event);
        setForwarded(true);
        setForwardedTo('Commissioner');
        setForwardedAt(formatDate(new Date().toISOString()));
      } else {
        alert(`Error forwarding application: ${data.error}`);
      }
    } catch (error) {
      alert(`Error forwarding application: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  // Verify disconnection (post-plumber phase)
  const handleVerifyDisconnection = async (action: 'approve' | 'rework') => {
    const remarks = action === 'approve' ? verificationRemarks : reworkRemarks;
    if (!remarks.trim()) {
      alert(action === 'approve' ? 'Please enter review remarks before closing.' : 'Please enter rework remarks.');
      return;
    }
    const confirmMsg = action === 'approve'
      ? 'Are you sure you want to verify this disconnection and close the application?'
      : 'Are you sure you want to request rework? The application will be sent back to the plumber.';
    if (!confirm(confirmMsg)) return;

    setProcessing(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const engineerName = userData.name || 'Field Engineer';

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/field_engineer/verify-disconnection`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationId,
            action,
            remarks,
            engineerName,
            siteVisitDone,
            siteVisitRemarks,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        if (action === 'approve') {
          alert('Disconnection verified and application closed successfully!');
        } else {
          alert('Rework requested. Application sent back to plumber.');
        }
        const event = new CustomEvent('navigate', { detail: '/jalanidhi/field-engineer/tap-connection/disconnection-requests' });
        window.dispatchEvent(event);
      } else {
        alert('Error: ' + (data.error || 'Failed to process'));
      }
    } catch (err) {
      alert('Error: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  const handleBack = () => {
    const event = new CustomEvent('navigate', { detail: '/jalanidhi/field-engineer/tap-connection/disconnection-requests' });
    window.dispatchEvent(event);
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
          onClick={handleBack}
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 font-['Poppins',sans-serif]">Application not found</p>
        </div>
      </div>
    );
  }

  // Extract data
  const rrData = application.rrData || {};
  const arrears = application.arrearDetails || {};
  const arrearPayment = application.arrearPaymentDetails || null;
  const caseworkerWorkflow = application.workflow && application.workflow.caseworker ? application.workflow.caseworker : null;

  // Detect phase: post-plumber verification vs initial review
  const isVerificationPhase = application.status === 'disconnection_work_submitted' || application.status === 'disconnection_completed';
  const isCompleted = application.status === 'disconnection_completed';
  const isSubmitted = application.status === 'disconnection_work_submitted';
  const report = application.disconnectionFieldReport || {};
  const ownerName = rrData.ownerName || 'N/A';
  const mobileNo = rrData.mobileNo || 'N/A';
  const district = rrData.district || 'N/A';
  const ulb = rrData.ulb || 'N/A';
  const connectionType = rrData.connectionType || 'N/A';

  // ===================================================================
  // PHASE 2: Post-Plumber Verification View (after plumber submits disconnection report)
  // ===================================================================
  if (isVerificationPhase) {
    return (
      <div className="p-6 bg-[#f5f5fa] min-h-screen">
        <button onClick={handleBack} className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="mb-6">
          <SectionTitle title="Disconnection Verification" className="mb-2" />
          <p className="text-gray-600 font-['Poppins',sans-serif]">Application: <span className="font-semibold">{application.id}</span></p>
          <div className="mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-semibold font-['Poppins',sans-serif] ${
              isCompleted ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {isCompleted ? 'Disconnection Completed' : 'Pending Verification'}
            </span>
          </div>
        </div>

        {/* Property & Owner Details */}
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-[#1f3a5f]" />
            <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Property & Owner Details</h2>
          </div>
          <div>
            <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Owner Name</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{ownerName}</p></div>
              <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Mobile</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{mobileNo}</p></div>
              <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">RR Number</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{application.rrNumber || 'N/A'}</p></div>
              <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">District / ULB</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{district} / {ulb}</p></div>
              <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Connection Type</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{connectionType}</p></div>
              <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Disconnection Type</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{application.disconnectionType === 'permanent' ? 'Permanent' : 'Temporary'}</p></div>
              <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Reason</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{application.disconnectionReason || 'N/A'}</p></div>
              <div className="col-span-2"><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Address</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{rrData.address || [rrData.doorNumber, rrData.street, rrData.city, rrData.state, rrData.pincode].filter(Boolean).join(', ') || 'N/A'}</p></div>
            </div>
          </div>
        </div>

        {/* Plumber Disconnection Report */}
        <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
          <div className="bg-[#1f3a5f] px-6 py-4 flex items-center gap-3">
            <Wrench className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white font-['Poppins',sans-serif]">Plumber Disconnection Report</h2>
          </div>
          <div className="p-6">
            {report.plumberName ? (
              <>
                <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 rounded-lg p-4">
                  <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Plumber Name</p><p className="text-[14px] font-medium font-['Poppins',sans-serif]">{report.plumberName}</p></div>
                  <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Submitted At</p><p className="text-[14px] font-medium font-['Poppins',sans-serif]">{formatDateTime(report.submittedAt)}</p></div>
                  <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Work Completed</p><p className="text-[14px] font-medium font-['Poppins',sans-serif]">{formatDateTime(report.workCompletedAt)}</p></div>
                  <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Final Meter Reading</p><p className="text-[14px] font-medium font-['Poppins',sans-serif]">{report.meterReadingFinal || 'N/A'}</p></div>
                  <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Seal Number</p><p className="text-[14px] font-medium font-['Poppins',sans-serif]">{report.sealNumber || 'N/A'}</p></div>
                  <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Disconnection Method</p><p className="text-[14px] font-medium font-['Poppins',sans-serif]">{report.disconnectionMethod || 'N/A'}</p></div>
                </div>

                {/* Location Verification */}
                {report.locationVerification && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <p className="text-green-800 font-semibold text-[14px] font-['Poppins',sans-serif]">Location Verified</p>
                    </div>
                    <p className="text-green-700 text-[13px] font-['Poppins',sans-serif]">
                      Lat: {report.locationVerification.latitude}, Lng: {report.locationVerification.longitude}
                    </p>
                    <p className="text-green-600 text-[12px] font-['Poppins',sans-serif] mt-1">Verified at: {formatDateTime(report.locationVerification.verifiedAt)}</p>
                  </div>
                )}

                {/* Photos */}
                {report.photoCount > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <p className="text-blue-800 text-[13px] font-semibold font-['Poppins',sans-serif]">{report.photoCount} photo(s) captured during disconnection</p>
                    </div>
                  </div>
                )}

                {/* Disconnection Checklist */}
                {report.disconnectionChecklist && report.disconnectionChecklist.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-[14px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Disconnection Checklist</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {report.disconnectionChecklist.map((item: any, idx: number) => (
                        <div key={idx} className={`flex items-center gap-2 p-2.5 rounded-lg border ${item.checked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                          <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center ${item.checked ? 'bg-green-500' : 'bg-gray-300'}`}>
                            {item.checked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <p className={`text-[12px] font-['Poppins',sans-serif] ${item.checked ? 'text-green-800' : 'text-gray-500'}`}>{item.item || item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remarks */}
                {report.siteObservations && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Site Observations</p>
                    <p className="text-[14px] text-gray-900 font-['Poppins',sans-serif]">{report.siteObservations}</p>
                  </div>
                )}
                {report.disconnectionRemarks && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Disconnection Remarks</p>
                    <p className="text-[14px] text-gray-900 font-['Poppins',sans-serif]">{report.disconnectionRemarks}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-['Poppins',sans-serif]">No disconnection report available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Verification Section */}
        {isSubmitted && (
          <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-6 py-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white font-['Poppins',sans-serif]">Verify & Close Application</h2>
            </div>
            <div className="p-6">
              {/* Site Visit Verification */}
              <div className="flex flex-col gap-[9px] mb-6">
                <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
                  Did you conduct a site visit to verify the disconnection?
                </p>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="siteVisitVerificationDiscon" value="yes" checked={siteVisitDone === 'yes'} onChange={e => setSiteVisitDone(e.target.value)} className="w-[18px] h-[18px] accent-[#1f3a5f] cursor-pointer" />
                    <span className="font-['Poppins',sans-serif] text-[14px] text-[#170f49]">Yes, site visit conducted</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="siteVisitVerificationDiscon" value="no" checked={siteVisitDone === 'no'} onChange={e => setSiteVisitDone(e.target.value)} className="w-[18px] h-[18px] accent-[#1f3a5f] cursor-pointer" />
                    <span className="font-['Poppins',sans-serif] text-[14px] text-[#170f49]">No, desk review only</span>
                  </label>
                </div>
              </div>

              {siteVisitDone === 'yes' && (
                <div className="flex flex-col gap-[9px] mb-6">
                  <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">Site Visit Observations <span className="text-[#888] text-[12px] ml-2">(Optional)</span></p>
                  <textarea value={siteVisitRemarks} onChange={e => setSiteVisitRemarks(e.target.value)} className="w-full h-[70px] px-[12px] py-[11px] font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none rounded-[12px] resize-none border border-[#d0d0d0] focus:border-[#1f3a5f]" placeholder="Enter your observations from the site visit..." />
                </div>
              )}

              <div className="flex flex-col gap-[9px] mb-6">
                <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
                  Review Remarks <span className="text-[#ff0c10]">*</span>
                </p>
                <textarea value={verificationRemarks} onChange={e => setVerificationRemarks(e.target.value)} className="w-full h-[80px] px-[12px] py-[11px] font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none rounded-[12px] resize-none border border-[#d0d0d0] focus:border-[#1f3a5f]" placeholder="Enter your review remarks (e.g., seal integrity, meter reading confirmation)..." />
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setShowReworkModal(true)}
                  disabled={processing}
                  className="px-6 py-3 bg-white border-2 border-red-500 text-red-600 rounded-lg font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                  Request Rework
                </button>
                <button
                  onClick={() => handleVerifyDisconnection('approve')}
                  disabled={processing || !verificationRemarks.trim()}
                  className="px-10 py-3 bg-[#22c55e] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#16a34a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing...</>
                  ) : (
                    <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> Verify & Close Application</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Completed Badge */}
        {isCompleted && (
          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-6 text-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-800 font-['Poppins',sans-serif]">Application Closed</h3>
            <p className="text-green-700 font-['Poppins',sans-serif] text-[14px] mt-2">
              The disconnection has been verified and the application has been successfully closed.
            </p>
            {application.workflow && application.workflow.disconnectionVerification && (
              <div className="mt-3 text-[13px] text-green-600 font-['Poppins',sans-serif]">
                Verified by: {application.workflow.disconnectionVerification.engineerName || 'Field Engineer'} | {formatDateTime(application.workflow.disconnectionVerification.verifiedAt)}
              </div>
            )}
          </div>
        )}

        {/* Rework Modal */}
        {showReworkModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-[500px]">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">Request Rework</h2>
                <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">Specify what corrections are needed. The application will be sent back to the plumber.</p>
              </div>
              <div className="mb-6">
                <label className="block text-[14px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">Rework Remarks <span className="text-red-500">*</span></label>
                <textarea value={reworkRemarks} onChange={e => setReworkRemarks(e.target.value)} rows={4} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[14px] focus:outline-none focus:border-[#1f3a5f] resize-none" placeholder="Describe what needs to be corrected or redone..." />
              </div>
              <div className="flex items-center justify-end gap-4">
                <button onClick={() => { setShowReworkModal(false); setReworkRemarks(''); }} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors">Cancel</button>
                <button
                  onClick={() => handleVerifyDisconnection('rework')}
                  disabled={processing || !reworkRemarks.trim()}
                  className="px-6 py-2.5 bg-orange-600 text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Sending...</>
                  ) : (
                    <>Send Rework Request</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===================================================================
  // PHASE 1: Initial Review (before Commissioner — forward to Commissioner)
  // ===================================================================
  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        disabled={processing}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-[#414141] font-['Poppins',sans-serif] mb-2">
          Review Disconnection Application
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{application.id}</span>
        </p>
        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mt-1">
          Submitted on: {formatDate(application.submittedAt)}
        </p>
      </div>

      {/* Application Details Card */}
      <div className="bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] p-6 mb-6">
        <div className="flex flex-col gap-[24px]">

          {/* Existing RR Number */}
          <div className="flex flex-col gap-[12px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[20px] text-[#414141]">
              Existing RR Number
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="RR Number" value={application.rrNumber} />
              <ReadOnlyField label="Disconnection Type" value={application.disconnectionType ? (application.disconnectionType === 'permanent' ? 'Permanent Disconnection' : 'Temporary Disconnection') : null} />
            </div>
          </div>

          <SectionDivider />

          {/* Applicant Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Applicant Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="District" value={rrData.district} />
              <ReadOnlyField label="ULB" value={rrData.ulb} />
              <ReadOnlyField label="ULB Type" value={rrData.ulbType} />
            </div>
          </div>

          <SectionDivider />

          {/* Property Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Property Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="Owner Name" value={rrData.ownerName} />
              <ReadOnlyField label="Mobile Number" value={rrData.mobileNo} />
              <ReadOnlyField label="Door Number" value={rrData.doorNumber} />
              <ReadOnlyField label="Ward Number" value={rrData.wardNumber} />
              <ReadOnlyField label="Street" value={rrData.street} />
              <ReadOnlyField label="City" value={rrData.city} />
              <ReadOnlyField label="State" value={rrData.state} />
              <ReadOnlyField label="Pincode" value={rrData.pincode} />
            </div>
            {rrData.address && (
              <div className="mt-2">
                <ReadOnlyField label="Full Address" value={rrData.address} />
              </div>
            )}
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
              <ReadOnlyField label="Meter Status" value={rrData.meterStatus || rrData.motorStatus} />
              <ReadOnlyField label="Meter Installed Date" value={rrData.meterInstalledDate} />
              <ReadOnlyField label="Scheme Name" value={rrData.schemeName} />
            </div>
          </div>

          <SectionDivider />

          {/* Disconnection Information */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Disconnection Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="Disconnection Type" value={application.disconnectionType ? (application.disconnectionType === 'permanent' ? 'Permanent Disconnection' : 'Temporary Disconnection') : null} />
              <ReadOnlyField label="Reason for Disconnection" value={application.disconnectionReason} />
              <ReadOnlyField label="UGD Connection Linked" value={application.hasUGDConnection === 'yes' ? 'Yes' : application.hasUGDConnection === 'no' ? 'No' : 'N/A'} />
            </div>
          </div>

          <SectionDivider />

          {/* Current Arrears Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Current Arrears Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="Current Demand" value={arrears.currentDemand != null ? '\u20B9' + arrears.currentDemand : null} />
              <ReadOnlyField label="Arrears" value={arrears.arrears != null ? '\u20B9' + arrears.arrears : null} />
              <ReadOnlyField label="Total Bill" value={arrears.totalBill != null ? '\u20B9' + arrears.totalBill : null} />
            </div>
          </div>

          {/* Arrear Payment Details */}
          {arrearPayment && (
            <>
              <SectionDivider />
              <div className="flex flex-col gap-[16px]">
                <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
                  Arrear Payment Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
                  <ReadOnlyField label="Service Applied For" value={arrearPayment.serviceAppliedFor} />
                  <ReadOnlyField label="Payment Date" value={arrearPayment.paymentDate} />
                  <ReadOnlyField label="Order No" value={arrearPayment.orderNo} />
                  <ReadOnlyField label="Transaction No" value={arrearPayment.transactionNo} />
                  <ReadOnlyField label="Payment Status" value={arrearPayment.paymentStatus} />
                  <ReadOnlyField label="Amount Paid" value={arrearPayment.amountPaid != null ? '\u20B9' + arrearPayment.amountPaid : null} />
                </div>
              </div>
            </>
          )}

          {/* Declaration */}
          {application.declarationAccepted && (
            <>
              <SectionDivider />
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-['Poppins',sans-serif] text-[14px] font-medium text-gray-700">
                  The applicant has declared that all information provided is true and accurate.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Consolidated Remarks Card */}
      {(() => {
        const remarkEntries: RemarkEntry[] = [];
        const cwComment = caseworkerWorkflow && caseworkerWorkflow.comments ? caseworkerWorkflow.comments : (application.caseworkerComments || '');
        if (cwComment) {
          remarkEntries.push({ role: 'Caseworker', comment: cwComment, timestamp: caseworkerWorkflow && caseworkerWorkflow.timestamp ? caseworkerWorkflow.timestamp : '' });
        }
        return remarkEntries.length > 0 ? (
          <div className="mb-6">
            <RemarksTimeline remarks={remarkEntries} title="Remarks" />
          </div>
        ) : null;
      })()}

      {/* Field Engineer Action Card */}
      <div className="bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] p-6 mb-6">
        {forwarded ? (
          <div className="flex flex-col gap-[16px]">
            <div className="bg-[#e8f5e9] rounded-[8px] border border-[#a5d6a7] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#4caf50] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-['Poppins',sans-serif] font-semibold text-[16px] text-[#2e7d32]">
                    Application Already Forwarded
                  </p>
                  <p className="font-['Poppins',sans-serif] text-[13px] text-[#558b2f]">
                    This application has been forwarded to {forwardedTo}{forwardedAt ? ` on ${forwardedAt}` : ''}
                  </p>
                </div>
              </div>
              {application.fieldEngineerComments && (
                <div className="mt-2 pt-3 border-t border-[#a5d6a7]">
                  <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#2e7d32] mb-1">
                    Your Comments
                  </p>
                  <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141] bg-white rounded-[6px] p-3 border border-[#c8e6c9]">
                    {application.fieldEngineerComments}
                  </p>
                </div>
              )}
              {selectedPlumber && (
                <div className="mt-3 pt-3 border-t border-[#a5d6a7]">
                  <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#2e7d32] mb-1">
                    Assigned Plumber
                  </p>
                  <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                    {selectedPlumber.plumberName} ({selectedPlumber.licenseNo})
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Plumber License No Dropdown */}
            <div className="flex flex-col gap-[9px] mb-6">
              <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
                <span>Plumber License No </span>
                <span className="text-[#ff0c10]">*</span>
              </p>
              <select
                value={selectedPlumberLicense}
                onChange={(e) => setSelectedPlumberLicense(e.target.value)}
                className="w-[50%] px-[12px] py-[11px] bg-white font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none rounded-[8px] cursor-pointer border border-[#d0d0d0] focus:border-[#1f3a5f] appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23170f49' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
              >
                <option value="">-- Select Plumber License --</option>
                {PLUMBER_LIST.map((p) => (
                  <option key={p.licenseNo} value={p.licenseNo}>{p.licenseNo}</option>
                ))}
              </select>
            </div>

            {/* Plumber Details */}
            {selectedPlumber && (
              <div className="mb-6">
                <h3 className="font-['Poppins',sans-serif] font-semibold text-[16px] text-[#414141] mb-4 pb-2 border-b border-[#dee2e6]">
                  Plumber Details:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px] mb-4">
                  <div className="flex flex-col gap-[6px]">
                    <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">Plumber Name <span className="text-[#ff0c10]">*</span></p>
                    <div className="px-[12px] py-[11px] bg-[#f5f5f5] border border-[#d0d0d0] rounded-[8px]">
                      <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141]">{selectedPlumber.plumberName}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">License No <span className="text-[#ff0c10]">*</span></p>
                    <div className="px-[12px] py-[11px] bg-[#f5f5f5] border border-[#d0d0d0] rounded-[8px]">
                      <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141]">{selectedPlumber.licenseNo}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">Licensed Date <span className="text-[#ff0c10]">*</span></p>
                    <div className="px-[12px] py-[11px] bg-[#f5f5f5] border border-[#d0d0d0] rounded-[8px]">
                      <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141]">{selectedPlumber.licensedDate}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">License Expiry Date <span className="text-[#ff0c10]">*</span></p>
                    <div className="px-[12px] py-[11px] bg-[#f5f5f5] border border-[#d0d0d0] rounded-[8px]">
                      <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141]">{selectedPlumber.licenseExpiryDate}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
                  <div className="flex flex-col gap-[6px]">
                    <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">Mobile Number <span className="text-[#ff0c10]">*</span></p>
                    <div className="px-[12px] py-[11px] bg-[#f5f5f5] border border-[#d0d0d0] rounded-[8px]">
                      <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141]">{selectedPlumber.mobileNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Site Visit Details */}
            <div className="mb-6">
              <h3 className="font-['Poppins',sans-serif] font-semibold text-[16px] text-[#414141] mb-4 pb-2 border-b border-[#dee2e6]">
                Set Field Visit Details:
              </h3>
              <div className="flex flex-col gap-[9px]">
                <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
                  Do you want to visit site? <span className="text-[#ff0c10]">*</span>
                </p>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="siteVisitDisconnection" value="yes" checked={wantsSiteVisit === 'yes'} onChange={(e) => setWantsSiteVisit(e.target.value)} className="w-[18px] h-[18px] accent-[#1f3a5f] cursor-pointer" />
                    <span className="font-['Poppins',sans-serif] text-[14px] text-[#170f49]">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="siteVisitDisconnection" value="no" checked={wantsSiteVisit === 'no'} onChange={(e) => setWantsSiteVisit(e.target.value)} className="w-[18px] h-[18px] accent-[#1f3a5f] cursor-pointer" />
                    <span className="font-['Poppins',sans-serif] text-[14px] text-[#170f49]">No</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="flex flex-col gap-[9px] mb-6">
              <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
                <span>Comments </span>
                <span className="text-[#ff0c10]">*</span>
              </p>
              <textarea
                value={fieldEngineerComment}
                onChange={(e) => setFieldEngineerComment(e.target.value)}
                className="w-full h-[100px] px-[12px] py-[11px] font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none rounded-[8px] resize-none border border-[#d0d0d0] focus:border-[#1f3a5f]"
                placeholder="Enter your comments for the Commissioner..."
              />
            </div>

            {/* Forward Button */}
            <div className="flex items-center justify-end pt-4">
              <button
                onClick={handleForward}
                disabled={processing || !fieldEngineerComment.trim() || !selectedPlumberLicense}
                className="px-8 py-3 bg-[#0078a0] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#006b8f] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  'Forward to Commissioner'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
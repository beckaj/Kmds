import { ChevronLeft, CheckCircle, MapPin, Camera, User, Hammer, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import SectionTitle from './SectionTitle';

interface FieldEngineerInstallationViewProps {
  applicationId: string;
}

export default function FieldEngineerInstallationView({ applicationId }: FieldEngineerInstallationViewProps) {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [verificationRemarks, setVerificationRemarks] = useState('');
  const [siteVisitDone, setSiteVisitDone] = useState('');
  const [siteVisitRemarks, setSiteVisitRemarks] = useState('');
  const [showReworkModal, setShowReworkModal] = useState(false);
  const [reworkRemarks, setReworkRemarks] = useState('');

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/application/${applicationId}`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      if (data.success) {
        setApplication(data.application);
      } else {
        setError(data.error || 'Application not found');
      }
    } catch (err) {
      setError('Failed to load application: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyInstallation = async (action: 'approve' | 'rework') => {
    const remarks = action === 'approve' ? verificationRemarks : reworkRemarks;
    if (!remarks.trim()) {
      alert(action === 'approve' ? 'Please enter review remarks before closing.' : 'Please enter rework remarks.');
      return;
    }
    const confirmMsg = action === 'approve'
      ? 'Are you sure you want to verify this installation and close the application?'
      : 'Are you sure you want to request rework? The application will be sent back to the plumber.';
    if (!confirm(confirmMsg)) return;

    setProcessing(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const engineerName = userData.name || 'Field Engineer';

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/field_engineer/verify-installation`,
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
          alert('Installation verified and application closed successfully!');
        } else {
          alert('Rework requested. Application sent back to plumber.');
        }
        const event = new CustomEvent('navigate', { detail: '/jalanidhi/field-engineer/tap-connection' });
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

  const goBack = () => {
    const event = new CustomEvent('navigate', { detail: '/jalanidhi/field-engineer/tap-connection' });
    window.dispatchEvent(event);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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

  if (error || !application) {
    return (
      <div className="p-8">
        <button onClick={goBack} className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 font-['Poppins',sans-serif]">{error || 'Application not found'}</p>
        </div>
      </div>
    );
  }

  const report = application.installationReport || {};
  const isCompleted = application.status === 'installation_completed';
  const isSubmitted = application.status === 'installation_work_submitted';
  const applicationNo = application.applicationNo || application.id || 'N/A';
  const applicantName = (application.applicantDetails && application.applicantDetails.applicantName) ? application.applicantDetails.applicantName : 'N/A';
  const mobile = (application.applicantDetails && application.applicantDetails.mobile) ? application.applicantDetails.mobile : 'N/A';
  const address = (application.applicantDetails && application.applicantDetails.address) ? application.applicantDetails.address : 'N/A';
  const district = (application.propertyDetails && application.propertyDetails.district) ? application.propertyDetails.district : 'N/A';
  const ulb = (application.propertyDetails && application.propertyDetails.ulb) ? application.propertyDetails.ulb : 'N/A';
  const connectionType = (application.connectionDetails && application.connectionDetails.connectionType) ? application.connectionDetails.connectionType : 'N/A';
  const propertyType = (application.connectionDetails && application.connectionDetails.propertyType) ? application.connectionDetails.propertyType : 'N/A';

  return (
    <div className="p-6 bg-[#f5f5fa] min-h-screen">
      <button onClick={goBack} className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 flex items-center gap-2">
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="mb-6">
        <SectionTitle title="Installation Verification" className="mb-2" />
        <p className="text-gray-600 font-['Poppins',sans-serif]">Application: <span className="font-semibold">{applicationNo}</span></p>
        <div className="mt-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-semibold font-['Poppins',sans-serif] ${
            isCompleted ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
          }`}>
            {isCompleted ? 'Installation Completed' : 'Pending Verification'}
          </span>
        </div>
      </div>

      {/* Applicant Details */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-[#1f3a5f]" />
          <h2 className="text-lg font-semibold text-white font-['Poppins',sans-serif]">Applicant Details</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Applicant Name</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{applicantName}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Mobile</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{mobile}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">District / ULB</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{district} / {ulb}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Connection Type</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{connectionType}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Property Type</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{propertyType}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Address</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{address}</p></div>
          </div>
        </div>
      </div>

      {/* Plumber Installation Report */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="bg-[#1f3a5f] px-6 py-4 flex items-center gap-3">
          <Hammer className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold text-white font-['Poppins',sans-serif]">Plumber Installation Report</h2>
        </div>
        <div className="p-6">
          {report.plumberName ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 rounded-lg p-4">
                <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Plumber Name</p><p className="text-[14px] font-medium font-['Poppins',sans-serif]">{report.plumberName}</p></div>
                <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Submitted At</p><p className="text-[14px] font-medium font-['Poppins',sans-serif]">{formatDateTime(report.submittedAt)}</p></div>
                <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Work Completed</p><p className="text-[14px] font-medium font-['Poppins',sans-serif]">{formatDateTime(report.workCompletedAt)}</p></div>
                {report.meterNumber && <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Meter Number</p><p className="text-[14px] font-medium font-['Poppins',sans-serif]">{report.meterNumber}</p></div>}
                {report.pipeSize && <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Pipe Size</p><p className="text-[14px] font-medium font-['Poppins',sans-serif]">{report.pipeSize}</p></div>}
                {report.connectionPoint && <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Connection Point</p><p className="text-[14px] font-medium font-['Poppins',sans-serif]">{report.connectionPoint}</p></div>}
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

              {/* Installation Checklist */}
              {report.installationChecklist && report.installationChecklist.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-[14px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Installation Checklist</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {report.installationChecklist.map((item: any, idx: number) => (
                      <div key={idx} className={`flex items-center gap-2 p-2.5 rounded-lg border ${item.checked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center ${item.checked ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {item.checked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <p className={`text-[12px] font-['Poppins',sans-serif] ${item.checked ? 'text-green-800' : 'text-gray-500'}`}>{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos */}
              {report.photoCount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <p className="text-blue-800 text-[13px] font-semibold font-['Poppins',sans-serif]">{report.photoCount} photo(s) captured during installation</p>
                  </div>
                </div>
              )}

              {/* Remarks */}
              {report.installationRemarks && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Installation Remarks</p>
                  <p className="text-[14px] text-gray-900 font-['Poppins',sans-serif]">{report.installationRemarks}</p>
                </div>
              )}
              {report.siteObservations && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Site Observations</p>
                  <p className="text-[14px] text-gray-900 font-['Poppins',sans-serif]">{report.siteObservations}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 font-['Poppins',sans-serif]">No installation report available yet.</p>
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
                Did you conduct a site visit to verify the installation?
              </p>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="siteVisitVerification" value="yes" checked={siteVisitDone === 'yes'} onChange={e => setSiteVisitDone(e.target.value)} className="w-[18px] h-[18px] accent-[#1f3a5f] cursor-pointer" />
                  <span className="font-['Poppins',sans-serif] text-[14px] text-[#170f49]">Yes, site visit conducted</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="siteVisitVerification" value="no" checked={siteVisitDone === 'no'} onChange={e => setSiteVisitDone(e.target.value)} className="w-[18px] h-[18px] accent-[#1f3a5f] cursor-pointer" />
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
              <textarea value={verificationRemarks} onChange={e => setVerificationRemarks(e.target.value)} className="w-full h-[80px] px-[12px] py-[11px] font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none rounded-[12px] resize-none border border-[#d0d0d0] focus:border-[#1f3a5f]" placeholder="Enter your review remarks (e.g., work quality assessment, compliance check notes)..." />
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
                onClick={() => handleVerifyInstallation('approve')}
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
            The installation has been verified and the application has been successfully closed.
          </p>
          {application.workflow && application.workflow.installationVerification && (
            <div className="mt-3 text-[13px] text-green-600 font-['Poppins',sans-serif]">
              Verified by: {application.workflow.installationVerification.engineerName || 'Field Engineer'} | {formatDateTime(application.workflow.installationVerification.verifiedAt)}
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
                onClick={() => handleVerifyInstallation('rework')}
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
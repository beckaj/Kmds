import { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, MapPin, Camera, User, Wrench, AlertCircle, Droplets, FileText, CreditCard, Clock } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface FieldEngineerChangeConnectionVerifyViewProps {
  applicationId: string;
}

export default function FieldEngineerChangeConnectionVerifyView({ applicationId }: FieldEngineerChangeConnectionVerifyViewProps) {
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
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/application/' + applicationId,
        { headers: { 'Authorization': 'Bearer ' + publicAnonKey, 'Content-Type': 'application/json' } }
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

  const handleVerifyChangeConnection = async (action: 'approve' | 'rework') => {
    const remarks = action === 'approve' ? verificationRemarks : reworkRemarks;
    if (!remarks.trim()) {
      alert(action === 'approve' ? 'Please enter review remarks before closing.' : 'Please enter rework remarks.');
      return;
    }
    const confirmMsg = action === 'approve'
      ? 'Are you sure you want to verify this change of connection work and close the application?'
      : 'Are you sure you want to request rework? The application will be sent back to the plumber.';
    if (!confirm(confirmMsg)) return;

    setProcessing(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const engineerName = userData.name || 'Field Engineer';

      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/field_engineer/verify-change-connection',
        {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + publicAnonKey, 'Content-Type': 'application/json' },
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
          alert('Change of connection verified and application closed successfully!');
        } else {
          alert('Rework requested. Application sent back to plumber.');
        }
        const event = new CustomEvent('navigate', { detail: '/jalanidhi/field-engineer/tap-connection/change-connection-type' });
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
    const event = new CustomEvent('navigate', { detail: '/jalanidhi/field-engineer/tap-connection/change-connection-type' });
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

  // Extract data safely using && null checks
  const rrData = application.rrData || {};
  const applicantDetails = application.applicantDetails || {};
  const report = application.changeConnectionFieldReport || {};
  const plumberWorkflow = (application.workflow && application.workflow.plumberChangeConnection) ? application.workflow.plumberChangeConnection : {};
  const isCompleted = application.status === 'change_connection_completed';
  const isForwarded = application.status === 'change_connection_forwarded_to_fe';
  const applicationNo = application.applicationNo || application.id || 'N/A';

  // Applicant info
  const applicantName = (rrData && rrData.ownerName) ? rrData.ownerName
    : (applicantDetails && applicantDetails.applicantName ? applicantDetails.applicantName : 'N/A');
  const mobile = (rrData && rrData.mobileNo) ? rrData.mobileNo
    : (applicantDetails && applicantDetails.mobile ? applicantDetails.mobile : 'N/A');
  const rrNumber = application.rrNumber || 'N/A';
  const address = (rrData && rrData.address) ? rrData.address
    : (applicantDetails && applicantDetails.address ? applicantDetails.address : 'N/A');
  const district = (rrData && rrData.propertyDistrict) ? rrData.propertyDistrict
    : (applicantDetails && applicantDetails.district ? applicantDetails.district : 'N/A');
  const doorNumber = (rrData && rrData.doorNumber) ? rrData.doorNumber : 'N/A';
  const wardNumber = (rrData && rrData.wardNumber) ? rrData.wardNumber : 'N/A';

  // Connection type details
  const currentConnectionType = (rrData && rrData.connectionType) ? rrData.connectionType
    : (application.connectionDetails && application.connectionDetails.connectionType ? application.connectionDetails.connectionType : 'N/A');
  const requestedConnectionType = (application.changeConnectionDetails && application.changeConnectionDetails.requestedType)
    ? application.changeConnectionDetails.requestedType
    : (application.connectionDetails && application.connectionDetails.requestedConnectionType ? application.connectionDetails.requestedConnectionType : 'N/A');
  const changeReason = (application.changeConnectionDetails && application.changeConnectionDetails.reason)
    ? application.changeConnectionDetails.reason
    : (application.reasonForChange || 'N/A');

  // Plumber details
  const plumberName = plumberWorkflow.plumberName || (report && report.plumberName) || 'N/A';
  const acceptedAt = plumberWorkflow.acceptedAt || 'N/A';
  const forwardRemarks = plumberWorkflow.forwardRemarks || 'N/A';

  // Certificate
  const certificateNo = (application.certificateData && application.certificateData.certificateNo) ? application.certificateData.certificateNo : 'N/A';

  // Payment
  const paymentAmount = (application.paymentDetails && application.paymentDetails.amount)
    ? Number(application.paymentDetails.amount) : 0;
  const paymentRef = (application.paymentDetails && application.paymentDetails.transactionId) ? application.paymentDetails.transactionId : 'N/A';

  return (
    <div className="p-6 bg-[#f5f5fa] min-h-screen">
      <button onClick={goBack} className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 flex items-center gap-2">
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
          Change of Connection Type - Final Verification
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">Application: <span className="font-semibold">{applicationNo}</span></p>
        <div className="mt-2">
          <span className={'inline-flex items-center px-3 py-1 rounded-full text-[13px] font-semibold font-[\'Poppins\',sans-serif] ' +
            (isCompleted ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800')
          }>
            {isCompleted ? 'Application Closed' : 'Pending Verification'}
          </span>
        </div>
      </div>

      {/* ===== Applicant & Connection Details ===== */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-[#1f3a5f]" />
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Applicant & Connection Details</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 bg-white rounded-lg p-4 mb-4">
          <div>
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Owner / Applicant Name</p>
            <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{applicantName}</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">RR Number</p>
            <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{rrNumber}</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Mobile</p>
            <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{mobile}</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Door No / Ward</p>
            <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{doorNumber} / Ward {wardNumber}</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">District</p>
            <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{district}</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Address</p>
            <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{address}</p>
          </div>
        </div>

        {/* Connection Change Info */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="w-5 h-5 text-purple-600" />
            <h3 className="text-[14px] font-semibold text-purple-800 font-['Poppins',sans-serif]">Connection Change Details</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Current Connection Type</p>
              <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{currentConnectionType}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Requested Connection Type</p>
              <p className="text-[14px] font-semibold text-purple-700 font-['Poppins',sans-serif]">{requestedConnectionType}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Reason for Change</p>
              <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{changeReason}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Commissioner Certificate & Payment ===== */}
      {(certificateNo !== 'N/A' || paymentAmount > 0) && (
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-[#1f3a5f]" />
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Commissioner Approval & Payment</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 bg-white rounded-lg p-4">
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Certificate No</p>
              <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{certificateNo}</p>
            </div>
            {paymentAmount > 0 && (
              <>
                <div>
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Payment Amount</p>
                  <p className="text-[14px] font-semibold text-green-700 font-['Poppins',sans-serif]">Rs. {paymentAmount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Transaction Reference</p>
                  <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{paymentRef}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== Plumber's Field Report ===== */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Wrench className="w-5 h-5 text-[#1f3a5f]" />
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Plumber's Change Connection Report</h2>
        </div>

        {plumberName !== 'N/A' ? (
          <>
            <div className="grid grid-cols-3 gap-4 bg-white rounded-lg p-4 mb-4">
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Plumber Name</p>
                <p className="text-[14px] font-medium font-['Poppins',sans-serif]">{plumberName}</p>
              </div>
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Accepted At</p>
                <p className="text-[14px] font-medium font-['Poppins',sans-serif]">{formatDateTime(acceptedAt)}</p>
              </div>
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Work Submitted At</p>
                <p className="text-[14px] font-medium font-['Poppins',sans-serif]">{(report && report.submittedAt) ? formatDateTime(report.submittedAt) : formatDateTime(plumberWorkflow.forwardedAt || '')}</p>
              </div>
            </div>

            {/* Location Verification */}
            {report && report.locationVerification && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <p className="text-green-800 font-semibold text-[14px] font-['Poppins',sans-serif]">Location Verified by Plumber</p>
                </div>
                <p className="text-green-700 text-[13px] font-['Poppins',sans-serif]">
                  Lat: {report.locationVerification.latitude || report.locationVerification.verifiedLatitude || 'N/A'}, Lng: {report.locationVerification.longitude || report.locationVerification.verifiedLongitude || 'N/A'}
                </p>
                {report.locationVerification.verifiedAt && (
                  <p className="text-green-600 text-[12px] font-['Poppins',sans-serif] mt-1">Verified at: {formatDateTime(report.locationVerification.verifiedAt)}</p>
                )}
              </div>
            )}

            {/* Photos */}
            {report && report.photoCount && report.photoCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <p className="text-blue-800 text-[13px] font-semibold font-['Poppins',sans-serif]">{report.photoCount} photo(s) captured during work</p>
                </div>
              </div>
            )}

            {/* Remarks */}
            {report && report.changeConnectionRemarks && (
              <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Plumber Remarks</p>
                <p className="text-[14px] text-gray-900 font-['Poppins',sans-serif]">{report.changeConnectionRemarks}</p>
              </div>
            )}

            {/* Forward Remarks */}
            {forwardRemarks !== 'N/A' && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Plumber Forward Remarks</p>
                <p className="text-[14px] text-gray-900 font-['Poppins',sans-serif]">{forwardRemarks}</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 font-['Poppins',sans-serif]">No field report available yet.</p>
          </div>
        )}
      </div>

      {/* ===== Verification & Close Section ===== */}
      {isForwarded && (
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Verify & Close Application</h2>
          </div>

          {/* Site Visit */}
          <div className="flex flex-col gap-[9px] mb-6">
            <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
              Did you conduct a site visit to verify the change of connection work? <span className="text-[#888] text-[12px] ml-1">(Optional)</span>
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

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              onClick={() => setShowReworkModal(true)}
              disabled={processing}
              className="px-6 py-3 bg-white border-2 border-red-500 text-red-600 rounded-lg font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              Request Rework
            </button>
            <button
              onClick={() => handleVerifyChangeConnection('approve')}
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
      )}

      {/* ===== Completed Badge ===== */}
      {isCompleted && (
        <div className="bg-green-50 border-2 border-green-400 rounded-lg p-6 text-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-green-800 font-['Poppins',sans-serif]">Application Closed</h3>
          <p className="text-green-700 font-['Poppins',sans-serif] text-[14px] mt-2">
            The change of connection type has been verified and the application has been successfully closed.
          </p>
          {application.workflow && application.workflow.changeConnectionVerification && (
            <div className="mt-3 text-[13px] text-green-600 font-['Poppins',sans-serif]">
              Verified by: {application.workflow.changeConnectionVerification.engineerName || 'Field Engineer'} | {formatDateTime(application.workflow.changeConnectionVerification.verifiedAt)}
            </div>
          )}
        </div>
      )}

      {/* ===== Rework Modal ===== */}
      {showReworkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-[500px]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">Request Rework</h2>
              <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">Specify what corrections are needed. The application will be sent back to the plumber for re-work.</p>
            </div>
            <div className="mb-6">
              <label className="block text-[14px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">Rework Remarks <span className="text-red-500">*</span></label>
              <textarea value={reworkRemarks} onChange={e => setReworkRemarks(e.target.value)} rows={4} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[14px] focus:outline-none focus:border-[#1f3a5f] resize-none" placeholder="Describe what needs to be corrected or redone..." />
            </div>
            <div className="flex items-center justify-end gap-4">
              <button onClick={() => { setShowReworkModal(false); setReworkRemarks(''); }} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors">Cancel</button>
              <button
                onClick={() => handleVerifyChangeConnection('rework')}
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
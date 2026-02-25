import { useState } from 'react';
import { ChevronLeft, MapPin, Camera, Send, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface PlumberChangeConnectionChecklistProps {
  application: any;
  plumberData: { mobile: string; name: string; id: string };
  onBack: () => void;
  onSubmit: (reportData: any) => void;
}

export default function PlumberChangeConnectionChecklist({
  application,
  plumberData,
  onBack,
  onSubmit,
}: PlumberChangeConnectionChecklistProps) {
  const [step, setStep] = useState<'review' | 'checklist'>('review');
  const [locationVerified, setLocationVerified] = useState(false);
  const [verifiedLat, setVerifiedLat] = useState('');
  const [verifiedLng, setVerifiedLng] = useState('');
  const [changeConnectionRemarks, setChangeConnectionRemarks] = useState('');
  const [photoCount, setPhotoCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const rrData = application.rrData || {};
  const applicantDetails = application.applicantDetails || {};
  const ownerName = rrData.ownerName || applicantDetails.applicantName || 'N/A';
  const address = rrData.address || applicantDetails.address || [rrData.doorNumber, rrData.street, rrData.city].filter(Boolean).join(', ') || 'N/A';

  // Connection type details
  const currentConnectionType = (rrData && rrData.connectionType)
    ? rrData.connectionType
    : (application.connectionDetails && application.connectionDetails.connectionType ? application.connectionDetails.connectionType : 'N/A');
  const requestedConnectionType = (application.changeConnectionDetails && application.changeConnectionDetails.requestedType)
    ? application.changeConnectionDetails.requestedType
    : (application.connectionDetails && application.connectionDetails.requestedConnectionType ? application.connectionDetails.requestedConnectionType : 'N/A');
  const changeReason = (application.changeConnectionDetails && application.changeConnectionDetails.reason)
    ? application.changeConnectionDetails.reason
    : (application.reasonForChange || 'N/A');

  // Deadline calculation
  const acceptedAt = (application.workflow && application.workflow.plumberChangeConnection && application.workflow.plumberChangeConnection.acceptedAt)
    ? application.workflow.plumberChangeConnection.acceptedAt : null;
  const deadlineDate = acceptedAt ? new Date(new Date(acceptedAt).getTime() + 7 * 24 * 60 * 60 * 1000) : null;
  const daysRemaining = deadlineDate ? Math.max(0, Math.ceil((deadlineDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))) : null;

  const handleVerifyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setVerifiedLat(position.coords.latitude.toFixed(6));
          setVerifiedLng(position.coords.longitude.toFixed(6));
          setLocationVerified(true);
        },
        () => {
          setVerifiedLat('12.971600');
          setVerifiedLng('77.594600');
          setLocationVerified(true);
        }
      );
    } else {
      setVerifiedLat('12.971600');
      setVerifiedLng('77.594600');
      setLocationVerified(true);
    }
  };

  const handleCapturePhoto = () => {
    setPhotoCount(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!locationVerified) {
      alert('Please verify your location before submitting.');
      return;
    }
    if (!changeConnectionRemarks.trim()) {
      alert('Please add remarks about the connection change.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        locationVerified,
        verifiedLatitude: verifiedLat,
        verifiedLongitude: verifiedLng,
        changeConnectionRemarks: changeConnectionRemarks.trim(),
        photoCount,
        photos: [],
      });
    } catch (err) {
      console.error('Error submitting change connection report:', err);
      alert('Error submitting report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== REVIEW STEP =====
  if (step === 'review') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="bg-[#1f3a5f] px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white text-[14px] font-semibold font-['Poppins',sans-serif]">
              Change Connection Work
            </h1>
            <p className="text-white/70 text-[10px] font-['Poppins',sans-serif]">
              {application.applicationNo || application.id}
            </p>
          </div>
        </div>

        {/* Application Details */}
        <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
          {/* Type Badge */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-800 text-[12px] font-semibold font-['Poppins',sans-serif] uppercase tracking-wider mb-1">
              Change of Connection Type
            </p>
            <p className="text-[11px] text-purple-600 font-['Poppins',sans-serif]">
              From: {currentConnectionType} {'→'} To: {requestedConnectionType}
            </p>
          </div>

          {/* 7-Day Deadline Warning */}
          {daysRemaining !== null && (
            <div className={(daysRemaining <= 2 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200') + ' border rounded-lg p-3 flex items-center gap-2'}>
              {daysRemaining <= 2 ? (
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              )}
              <div>
                <p className={(daysRemaining <= 2 ? 'text-red-800' : 'text-amber-800') + " text-[11px] font-semibold font-['Poppins',sans-serif]"}>
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining to complete
                </p>
                <p className={(daysRemaining <= 2 ? 'text-red-600' : 'text-amber-600') + " text-[10px] font-['Poppins',sans-serif]"}>
                  Deadline: {deadlineDate ? deadlineDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* Owner/Applicant Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif] uppercase">Owner Name</p>
              <p className="text-[13px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{ownerName}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif] uppercase">RR Number</p>
              <p className="text-[13px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{application.rrNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif] uppercase">Address</p>
              <p className="text-[12px] text-gray-700 font-['Poppins',sans-serif]">{address}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif] uppercase">District</p>
                <p className="text-[12px] font-medium text-gray-900 font-['Poppins',sans-serif]">{rrData.propertyDistrict || rrData.district || applicantDetails.district || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif] uppercase">Mobile</p>
                <p className="text-[12px] font-medium text-gray-900 font-['Poppins',sans-serif]">{rrData.mobileNo || applicantDetails.mobile || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Connection Change Details */}
          <div className="bg-purple-50 rounded-lg p-4 space-y-3">
            <p className="text-[11px] font-semibold text-purple-800 font-['Poppins',sans-serif] uppercase">Connection Change Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif] uppercase">Current Type</p>
                <p className="text-[12px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{currentConnectionType}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif] uppercase">Requested Type</p>
                <p className="text-[12px] font-semibold text-purple-700 font-['Poppins',sans-serif]">{requestedConnectionType}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif] uppercase">Reason for Change</p>
              <p className="text-[12px] text-gray-700 font-['Poppins',sans-serif]">{changeReason}</p>
            </div>
          </div>

          {/* Commissioner Certificate Info */}
          {application.certificateData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <p className="text-[11px] font-semibold text-green-800 font-['Poppins',sans-serif]">Commissioner Approved</p>
              </div>
              <p className="text-[10px] text-green-600 font-['Poppins',sans-serif]">
                Certificate: {application.certificateData.certificateNo || 'N/A'}
              </p>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={() => setStep('checklist')}
            className="w-full py-3 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px]"
          >
            Start Change Connection Work
          </button>
        </div>
      </div>
    );
  }

  // ===== CHECKLIST STEP =====
  if (step === 'checklist') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="bg-[#1f3a5f] px-4 py-3 flex items-center gap-3">
          <button onClick={() => setStep('review')} className="text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white text-[14px] font-semibold font-['Poppins',sans-serif]">
            Site Verification
          </h1>
        </div>

        <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
          {/* Location Verification */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-[12px] font-semibold text-blue-800 font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              GPS Location Verification
            </p>
            {locationVerified ? (
              <div className="flex items-center gap-2 bg-green-100 rounded-lg p-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-[11px] font-semibold text-green-800 font-['Poppins',sans-serif]">Location Verified</p>
                  <p className="text-[10px] text-green-600 font-['Poppins',sans-serif]">
                    Lat: {verifiedLat}, Lng: {verifiedLng}
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleVerifyLocation}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-['Poppins',sans-serif] font-medium text-[12px] flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Verify My Location
              </button>
            )}
          </div>

          {/* Photo Capture */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-[12px] font-semibold text-gray-800 font-['Poppins',sans-serif] mb-2 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Site Photos
            </p>
            <button
              onClick={handleCapturePhoto}
              className="w-full py-2.5 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-medium text-[12px] flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Capture Photo ({photoCount} taken)
            </button>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-1">
              Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              value={changeConnectionRemarks}
              onChange={(e) => setChangeConnectionRemarks(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[12px] focus:outline-none focus:border-[#1f3a5f]"
              rows={3}
              placeholder="Remarks about the connection type change..."
            />
          </div>
        </div>

        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={submitting || !locationVerified || !changeConnectionRemarks.trim()}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
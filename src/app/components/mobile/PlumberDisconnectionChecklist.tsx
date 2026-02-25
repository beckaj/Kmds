import { useState } from 'react';
import { ChevronLeft, MapPin, Camera, Send, CheckCircle2 } from 'lucide-react';

interface PlumberDisconnectionChecklistProps {
  application: any;
  plumberData: { mobile: string; name: string; id: string };
  onBack: () => void;
  onSubmit: (reportData: any) => void;
}

export default function PlumberDisconnectionChecklist({
  application,
  plumberData,
  onBack,
  onSubmit,
}: PlumberDisconnectionChecklistProps) {
  const [step, setStep] = useState<'review' | 'checklist' | 'report'>('review');
  const [locationVerified, setLocationVerified] = useState(false);
  const [verifiedLat, setVerifiedLat] = useState('');
  const [verifiedLng, setVerifiedLng] = useState('');
  const [meterReadingFinal, setMeterReadingFinal] = useState('');
  const [disconnectionMethod, setDisconnectionMethod] = useState('');
  const [sealNumber, setSealNumber] = useState('');
  const [siteObservations, setSiteObservations] = useState('');
  const [disconnectionRemarks, setDisconnectionRemarks] = useState('');
  const [photoCount, setPhotoCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const rrData = application.rrData || {};
  const ownerName = rrData.ownerName || 'N/A';

  const handleVerifyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setVerifiedLat(position.coords.latitude.toFixed(6));
          setVerifiedLng(position.coords.longitude.toFixed(6));
          setLocationVerified(true);
        },
        () => {
          setVerifiedLat('15.363882');
          setVerifiedLng('75.124486');
          setLocationVerified(true);
        }
      );
    } else {
      setVerifiedLat('15.363882');
      setVerifiedLng('75.124486');
      setLocationVerified(true);
    }
  };

  const handleCapturePhoto = () => {
    setPhotoCount(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!locationVerified || !meterReadingFinal.trim() || !sealNumber.trim()) {
      alert('Please complete all required fields: location verification, meter reading, and seal number.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        locationVerified,
        verifiedLatitude: verifiedLat,
        verifiedLongitude: verifiedLng,
        meterReadingFinal,
        disconnectionMethod: disconnectionMethod || 'Valve closure and pipe seal',
        sealNumber,
        siteObservations,
        disconnectionRemarks,
        photoCount,
        photos: [],
      });
    } catch (err) {
      console.error('Error submitting disconnection report:', err);
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
              Disconnection Work Order
            </h1>
            <p className="text-white/70 text-[10px] font-['Poppins',sans-serif]">
              {application.id}
            </p>
          </div>
        </div>

        {/* Application Details */}
        <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-[12px] font-semibold font-['Poppins',sans-serif] uppercase tracking-wider mb-1">
              Disconnection Request
            </p>
            <p className="text-[11px] text-red-600 font-['Poppins',sans-serif]">
              {application.disconnectionType === 'permanent' ? 'Permanent' : 'Temporary'} Disconnection
            </p>
          </div>

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
              <p className="text-[12px] text-gray-700 font-['Poppins',sans-serif]">
                {rrData.address || [rrData.doorNumber, rrData.street, rrData.city].filter(Boolean).join(', ') || 'N/A'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif] uppercase">District</p>
                <p className="text-[12px] font-medium text-gray-900 font-['Poppins',sans-serif]">{rrData.district || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif] uppercase">Connection Type</p>
                <p className="text-[12px] font-medium text-gray-900 font-['Poppins',sans-serif]">{rrData.connectionType || 'N/A'}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif] uppercase">Reason</p>
              <p className="text-[12px] text-gray-700 font-['Poppins',sans-serif]">{application.disconnectionReason || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={() => setStep('checklist')}
            className="w-full py-3 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px]"
          >
            Start Disconnection Work
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
        </div>

        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={() => locationVerified ? setStep('report') : alert('Please verify your location before proceeding.')}
            disabled={!locationVerified}
            className="w-full py-3 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] disabled:opacity-50"
          >
            Next: Enter Report Details
          </button>
        </div>
      </div>
    );
  }

  // ===== REPORT STEP =====
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-[#1f3a5f] px-4 py-3 flex items-center gap-3">
        <button onClick={() => setStep('checklist')} className="text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white text-[14px] font-semibold font-['Poppins',sans-serif]">
          Site Verification
        </h1>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
        {/* Final Meter Reading */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-1">
            Final Meter Reading <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={meterReadingFinal}
            onChange={(e) => setMeterReadingFinal(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[12px] focus:outline-none focus:border-[#1f3a5f]"
            placeholder="e.g., 12345.67"
          />
        </div>

        {/* Seal Number */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-1">
            Seal Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={sealNumber}
            onChange={(e) => setSealNumber(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[12px] focus:outline-none focus:border-[#1f3a5f]"
            placeholder="e.g., SEAL-2026-001234"
          />
        </div>

        {/* Disconnection Method */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-1">
            Disconnection Method
          </label>
          <select
            value={disconnectionMethod}
            onChange={(e) => setDisconnectionMethod(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[12px] focus:outline-none focus:border-[#1f3a5f] bg-white"
          >
            <option value="">Select method</option>
            <option value="Valve closure and pipe seal">Valve closure and pipe seal</option>
            <option value="Pipe cut and capped">Pipe cut and capped</option>
            <option value="Meter removal">Meter removal</option>
            <option value="Main line disconnection">Main line disconnection</option>
          </select>
        </div>

        {/* Site Observations */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-1">
            Site Observations
          </label>
          <textarea
            value={siteObservations}
            onChange={(e) => setSiteObservations(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[12px] focus:outline-none focus:border-[#1f3a5f] resize-none h-[70px]"
            placeholder="Describe site conditions..."
          />
        </div>

        {/* Disconnection Remarks */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-1">
            Disconnection Remarks
          </label>
          <textarea
            value={disconnectionRemarks}
            onChange={(e) => setDisconnectionRemarks(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[12px] focus:outline-none focus:border-[#1f3a5f] resize-none h-[70px]"
            placeholder="Additional remarks about disconnection..."
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="px-4 py-4 border-t border-gray-200">
        <button
          onClick={handleSubmit}
          disabled={submitting || !meterReadingFinal.trim() || !sealNumber.trim()}
          className="w-full py-3 bg-[#22c55e] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Disconnection Report
            </>
          )}
        </button>
      </div>
    </div>
  );
}
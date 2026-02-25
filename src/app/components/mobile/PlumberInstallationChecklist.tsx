import { useState, useRef } from 'react';
import {
  ArrowLeft, MapPin, Camera, Upload, FileText, Navigation,
  CheckCircle2, Clock, User, Home, AlertCircle, Loader2, Wrench, Send, Hammer
} from 'lucide-react';

interface PlumberInstallationChecklistProps {
  application: any;
  plumberData: { mobile: string; name: string; id: string };
  onBack: () => void;
  onSubmit: (reportData: any) => void;
}

export default function PlumberInstallationChecklist({
  application,
  plumberData,
  onBack,
  onSubmit,
}: PlumberInstallationChecklistProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationVerified, setLocationVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [siteObservations, setSiteObservations] = useState('');
  const [installationRemarks, setInstallationRemarks] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [pipeSize, setPipeSize] = useState('');
  const [connectionPoint, setConnectionPoint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitTime] = useState(new Date().toLocaleString('en-IN'));
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [checklist, setChecklist] = useState([
    { id: 'c1', label: 'Pipeline laid from main line to property', checked: false },
    { id: 'c2', label: 'Stop cock / ferrule installed', checked: false },
    { id: 'c3', label: 'Meter installed and reading recorded', checked: false },
    { id: 'c4', label: 'Water flow tested and verified', checked: false },
    { id: 'c5', label: 'No leakage in connections', checked: false },
    { id: 'c6', label: 'Trench backfilled and surface restored', checked: false },
    { id: 'c7', label: 'Photos captured of completed work', checked: false },
    { id: 'c8', label: 'Applicant informed about connection', checked: false },
  ]);

  const applicationNo = application.applicationNo || application.id || 'N/A';
  const ownerName = (application.applicantDetails && application.applicantDetails.applicantName) ? application.applicantDetails.applicantName : 'N/A';
  const address = (application.applicantDetails && application.applicantDetails.address) ? application.applicantDetails.address : 'N/A';
  const mobileNo = (application.applicantDetails && application.applicantDetails.mobile) ? application.applicantDetails.mobile : 'N/A';
  const connectionType = (application.connectionDetails && application.connectionDetails.connectionType) ? application.connectionDetails.connectionType : 'New Connection';

  const propertyLat = 15.3647;
  const propertyLng = 75.1240;

  const verifyLocation = () => {
    setIsVerifying(true);
    setLocationError(null);
    setTimeout(() => {
      const lat = propertyLat;
      const lng = propertyLng;
      setCurrentLocation({ lat, lng });
      setLocationVerified(true);
      setLocationError(null);
      setIsVerifying(false);
    }, 2000);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!locationVerified) return;
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const toggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleSubmit = () => {
    if (!locationVerified) {
      alert('Please verify your location at the property site before submitting.');
      return;
    }
    if (photos.length === 0) {
      alert('Please capture at least one photo of the installation work.');
      return;
    }
    if (!installationRemarks.trim()) {
      alert('Please enter installation remarks before submitting.');
      return;
    }
    if (!meterNumber.trim()) {
      alert('Please enter the meter number.');
      return;
    }

    setIsSubmitting(true);

    onSubmit({
      verifiedLatitude: currentLocation ? currentLocation.lat : propertyLat,
      verifiedLongitude: currentLocation ? currentLocation.lng : propertyLng,
      locationVerified: true,
      photos: photos,
      photoCount: photos.length,
      siteObservations: siteObservations,
      installationRemarks: installationRemarks,
      meterNumber: meterNumber,
      pipeSize: pipeSize,
      connectionPoint: connectionPoint,
      installationChecklist: checklist,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Status Bar */}
      <div className="h-[28px] flex items-center justify-between px-4 pt-2 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-black/50"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-black/50"></div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <svg width="16" height="12" viewBox="0 0 24 24" fill="black"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" /></svg>
          <div className="w-4 h-2 border border-black rounded-sm relative"><div className="absolute left-0 top-0 w-3/4 h-full bg-black rounded-sm"></div></div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-[#1f3a5f] px-5 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-[16px] font-semibold font-['Poppins',sans-serif] flex items-center gap-2">
              <Hammer className="w-4 h-4" /> New Tap Installation
            </h1>
            <p className="text-white/80 text-[10px] font-['Poppins',sans-serif]">{applicationNo}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-28">
        {/* Work Order Info */}
        <div className="bg-white m-4 rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Hammer className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-[#263238] text-[12px] font-semibold font-['Poppins',sans-serif]">{ownerName}</p>
              <p className="text-[#263238]/60 text-[10px] font-['Poppins',sans-serif]">{connectionType} | {mobileNo}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-gray-50 rounded-md p-2">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-[#263238]/70 text-[10px] font-['Poppins',sans-serif] leading-relaxed">{address}</p>
          </div>
        </div>

        {/* Step 1: Location Verification */}
        <div className="bg-white mx-4 mb-3 rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${locationVerified ? 'bg-green-500' : 'bg-[#1f3a5f]'}`}>1</div>
            <h3 className="text-[13px] font-semibold text-[#263238] font-['Poppins',sans-serif]">Verify Location</h3>
            {locationVerified && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
          </div>

          {!locationVerified ? (
            <button onClick={verifyLocation} disabled={isVerifying} className="w-full py-3 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[13px] flex items-center justify-center gap-2 disabled:opacity-50">
              {isVerifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <><Navigation className="w-4 h-4" /> Verify My Location</>}
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-700 text-[12px] font-semibold font-['Poppins',sans-serif]">Location Verified at {visitTime}</p>
              <p className="text-green-600 text-[10px] font-['Poppins',sans-serif] mt-1">Lat: {currentLocation && currentLocation.lat}, Lng: {currentLocation && currentLocation.lng}</p>
            </div>
          )}
          {locationError && <p className="text-red-600 text-[11px] mt-2 font-['Poppins',sans-serif]">{locationError}</p>}
        </div>

        {/* Step 2: Installation Details */}
        <div className={`bg-white mx-4 mb-3 rounded-lg shadow-sm border border-gray-200 p-4 ${!locationVerified ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${meterNumber ? 'bg-green-500' : 'bg-[#1f3a5f]'}`}>2</div>
            <h3 className="text-[13px] font-semibold text-[#263238] font-['Poppins',sans-serif]">Installation Details</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-gray-700 font-['Poppins',sans-serif]">Meter Number *</label>
              <input type="text" value={meterNumber} onChange={e => setMeterNumber(e.target.value)} placeholder="Enter meter number" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-[13px] font-['Poppins',sans-serif] focus:border-[#1f3a5f] outline-none" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700 font-['Poppins',sans-serif]">Pipe Size</label>
              <input type="text" value={pipeSize} onChange={e => setPipeSize(e.target.value)} placeholder="e.g. 1/2 inch, 3/4 inch" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-[13px] font-['Poppins',sans-serif] focus:border-[#1f3a5f] outline-none" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700 font-['Poppins',sans-serif]">Connection Point</label>
              <input type="text" value={connectionPoint} onChange={e => setConnectionPoint(e.target.value)} placeholder="e.g. Main road pipeline" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-[13px] font-['Poppins',sans-serif] focus:border-[#1f3a5f] outline-none" />
            </div>
          </div>
        </div>

        {/* Step 3: Capture Photos */}
        <div className={`bg-white mx-4 mb-3 rounded-lg shadow-sm border border-gray-200 p-4 ${!locationVerified ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${photos.length > 0 ? 'bg-green-500' : 'bg-[#1f3a5f]'}`}>3</div>
            <h3 className="text-[13px] font-semibold text-[#263238] font-['Poppins',sans-serif]">Capture Photos *</h3>
            <span className="ml-auto text-[11px] text-gray-500 font-['Poppins',sans-serif]">{photos.length} photos</span>
          </div>

          <input type="file" accept="image/*" capture="environment" multiple ref={photoInputRef} className="hidden" onChange={handlePhotoCapture} />
          <button onClick={() => photoInputRef.current && photoInputRef.current.click()} className="w-full py-3 border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg flex items-center justify-center gap-2 text-blue-600 font-['Poppins',sans-serif] font-semibold text-[13px]">
            <Camera className="w-4 h-4" /> Take Photo / Upload
          </button>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative">
                  <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                  <button onClick={() => removePhoto(idx)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">x</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 4: Installation Checklist */}
        <div className={`bg-white mx-4 mb-3 rounded-lg shadow-sm border border-gray-200 p-4 ${!locationVerified ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold bg-[#1f3a5f]">4</div>
            <h3 className="text-[13px] font-semibold text-[#263238] font-['Poppins',sans-serif]">Installation Checklist</h3>
            <span className="ml-auto text-[11px] text-gray-500 font-['Poppins',sans-serif]">{checklist.filter(c => c.checked).length}/{checklist.length}</span>
          </div>

          <div className="space-y-2">
            {checklist.map(item => (
              <button key={item.id} onClick={() => toggleChecklist(item.id)} className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-colors text-left ${item.checked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center ${item.checked ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                  {item.checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <p className={`text-[12px] font-['Poppins',sans-serif] ${item.checked ? 'text-green-800 font-medium' : 'text-gray-700'}`}>{item.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 5: Remarks */}
        <div className={`bg-white mx-4 mb-3 rounded-lg shadow-sm border border-gray-200 p-4 ${!locationVerified ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold bg-[#1f3a5f]">5</div>
            <h3 className="text-[13px] font-semibold text-[#263238] font-['Poppins',sans-serif]">Remarks *</h3>
          </div>

          <textarea value={siteObservations} onChange={e => setSiteObservations(e.target.value)} placeholder="Site observations (optional)..." rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[12px] font-['Poppins',sans-serif] focus:border-[#1f3a5f] outline-none resize-none mb-2" />
          <textarea value={installationRemarks} onChange={e => setInstallationRemarks(e.target.value)} placeholder="Installation remarks (required)..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[12px] font-['Poppins',sans-serif] focus:border-[#1f3a5f] outline-none resize-none" />
        </div>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <button onClick={handleSubmit} disabled={isSubmitting || !locationVerified || photos.length === 0 || !installationRemarks.trim() || !meterNumber.trim()} className="w-full py-3.5 bg-[#22c55e] text-white rounded-xl font-['Poppins',sans-serif] font-semibold text-[14px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
          {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : <><Send className="w-5 h-5" /> Submit Installation Report</>}
        </button>
      </div>
    </div>
  );
}

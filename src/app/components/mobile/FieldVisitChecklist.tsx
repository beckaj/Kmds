import { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Camera, 
  Upload, 
  FileText, 
  Navigation,
  CheckCircle2,
  Clock,
  User,
  Home,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface FieldVisitChecklistProps {
  applicationNo: string;
  engineerData: { mobile: string; name: string; id: string };
  propertyLocation: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  onBack: () => void;
  onNext: (data: ChecklistData) => void;
  onSubmitReport: () => void;
}

interface ChecklistData {
  verifiedLatitude: number;
  verifiedLongitude: number;
  locationVerified: boolean;
  photos: string[];
  documents: File[];
  siteNotes: string;
}

export default function FieldVisitChecklist({
  applicationNo,
  engineerData,
  propertyLocation,
  onBack,
  onNext,
}: FieldVisitChecklistProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationVerified, setLocationVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [siteNotes, setSiteNotes] = useState('');
  const [visitTime] = useState(new Date().toLocaleString('en-IN'));
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const verifyLocation = () => {
    setIsVerifying(true);
    setLocationError(null);

    // For demo purposes: Auto-verify after 2 seconds
    // In production, use: navigator.geolocation.getCurrentPosition()
    setTimeout(() => {
      if (propertyLocation) {
        // Demo: Use property location as "current" location
        const engineerLat = propertyLocation.latitude;
        const engineerLng = propertyLocation.longitude;
        
        setCurrentLocation({ lat: engineerLat, lng: engineerLng });
        
        // Calculate distance
        const distance = calculateDistance(
          engineerLat,
          engineerLng,
          propertyLocation.latitude,
          propertyLocation.longitude
        );
        
        // Verify if within 100 meters (for demo, always true)
        if (distance <= 100) {
          setLocationVerified(true);
          setLocationError(null);
        } else {
          setLocationVerified(false);
          setLocationError(`You are ${Math.round(distance)}m away from the property. Please move closer.`);
        }
      }
      setIsVerifying(false);
    }, 2000);
  };

  // Real GPS implementation (commented for demo):
  /*
  const verifyLocation = () => {
    setIsVerifying(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your device');
      setIsVerifying(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const engineerLat = position.coords.latitude;
        const engineerLng = position.coords.longitude;
        
        setCurrentLocation({ lat: engineerLat, lng: engineerLng });
        
        if (propertyLocation) {
          const distance = calculateDistance(
            engineerLat,
            engineerLng,
            propertyLocation.latitude,
            propertyLocation.longitude
          );
          
          // Verify if within 100 meters
          if (distance <= 100) {
            setLocationVerified(true);
            setLocationError(null);
          } else {
            setLocationVerified(false);
            setLocationError(`You are ${Math.round(distance)}m away from the property. Please move closer.`);
          }
        }
        setIsVerifying(false);
      },
      (error) => {
        setLocationError('Unable to get your location. Please enable GPS and try again.');
        setIsVerifying(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
  */

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!locationVerified) return;
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!locationVerified) return;
    const files = e.target.files;
    if (files) {
      setDocuments([...documents, ...Array.from(files)]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (!locationVerified) {
      alert('Please verify your location before proceeding');
      return;
    }

    if (photos.length === 0) {
      alert('Please capture at least one site photo');
      return;
    }

    onNext({
      verifiedLatitude: (currentLocation && currentLocation.lat) || (propertyLocation && propertyLocation.latitude) || 0,
      verifiedLongitude: (currentLocation && currentLocation.lng) || (propertyLocation && propertyLocation.longitude) || 0,
      locationVerified,
      photos,
      documents,
      siteNotes,
    });
  };

  const openMaps = () => {
    const url = `https://www.google.com/maps?q=${propertyLocation && propertyLocation.latitude},${propertyLocation && propertyLocation.longitude}`;
    window.open(url, '_blank');
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
          <svg width="16" height="12" viewBox="0 0 24 24" fill="black">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
          </svg>
          <div className="w-4 h-2 border border-black rounded-sm relative">
            <div className="absolute left-0 top-0 w-3/4 h-full bg-black rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-[#1f3a5f] px-5 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-[16px] font-semibold font-['Poppins',sans-serif]">
              Field Site Inspection
            </h1>
            <p className="text-white/80 text-[10px] font-['Poppins',sans-serif]">
              Application: {applicationNo}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-24">
        
        {/* Visit Info Card */}
        <div className="bg-white m-4 rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#1f3a5f]/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-[#1f3a5f]" />
            </div>
            <div className="flex-1">
              <p className="text-[#263238] text-[12px] font-semibold font-['Poppins',sans-serif]">
                {engineerData.name}
              </p>
              <p className="text-[#263238]/60 text-[10px] font-['Poppins',sans-serif]">
                Field Engineer
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-[#263238]/60">
                <Clock className="w-3 h-3" />
                <p className="text-[9px] font-['Poppins',sans-serif]">{visitTime}</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <Home className="w-4 h-4 text-[#1f3a5f] mt-0.5 flex-shrink-0" />
              <p className="flex-1 text-[#263238] text-[10px] font-['Poppins',sans-serif] leading-relaxed">
                {propertyLocation && propertyLocation.address}
              </p>
              <button
                onClick={openMaps}
                className="shrink-0 h-[30px] px-3 bg-white border-[1.5px] border-[#1f3a5f] text-[#1f3a5f] text-[10px] font-semibold font-['Poppins',sans-serif] rounded-full hover:bg-[#1f3a5f]/5 transition-colors flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                Maps
              </button>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="mx-4 mb-4">
          <h3 className="text-[#1f3a5f] text-[13px] font-semibold font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location Verification <span className="text-red-500">*</span>
          </h3>
          
          {/* Verification Status Banner */}
          {!locationVerified && !isVerifying && !locationError && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-amber-800 text-[11px] font-medium font-['Poppins',sans-serif] mb-1">
                  Location Verification Required
                </p>
                <p className="text-amber-700 text-[10px] font-['Poppins',sans-serif] leading-relaxed">
                  You must verify your location at the property site before capturing photos or uploading documents.
                </p>
              </div>
            </div>
          )}

          {locationVerified && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-green-800 text-[11px] font-medium font-['Poppins',sans-serif] mb-1">
                  ✓ Location Verified Successfully
                </p>
                <p className="text-green-700 text-[10px] font-['Poppins',sans-serif]">
                  You are at the correct property location. You can now proceed with inspection.
                </p>
              </div>
            </div>
          )}

          {locationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 text-[11px] font-medium font-['Poppins',sans-serif] mb-1">
                  Location Verification Failed
                </p>
                <p className="text-red-700 text-[10px] font-['Poppins',sans-serif]">
                  {locationError}
                </p>
              </div>
            </div>
          )}
          
          {/* Map View */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="w-full h-[180px] bg-gray-200 relative">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${propertyLocation && propertyLocation.latitude},${propertyLocation && propertyLocation.longitude}&zoom=17&maptype=roadmap`}
                allowFullScreen
              ></iframe>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <MapPin className="w-10 h-10 text-red-500 drop-shadow-lg" fill="#ef4444" />
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif] mb-2">Target Property Location</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[9px] text-gray-500 font-['Poppins',sans-serif] mb-1">Latitude</p>
                    <p className="text-[11px] text-[#263238] font-semibold font-['Poppins',sans-serif]">
                      {propertyLocation && propertyLocation.latitude.toFixed(6)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[9px] text-gray-500 font-['Poppins',sans-serif] mb-1">Longitude</p>
                    <p className="text-[11px] text-[#263238] font-semibold font-['Poppins',sans-serif]">
                      {propertyLocation && propertyLocation.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              {currentLocation && (
                <div className="mb-4 pt-4 border-t border-gray-100">
                  <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif] mb-2">Your Current Location</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 rounded-lg p-2.5 border border-green-200">
                      <p className="text-[9px] text-green-600 font-['Poppins',sans-serif] mb-1">Latitude</p>
                      <p className="text-[11px] text-green-800 font-semibold font-['Poppins',sans-serif]">
                        {currentLocation.lat.toFixed(6)}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2.5 border border-green-200">
                      <p className="text-[9px] text-green-600 font-['Poppins',sans-serif] mb-1">Longitude</p>
                      <p className="text-[11px] text-green-800 font-semibold font-['Poppins',sans-serif]">
                        {currentLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={verifyLocation}
                  disabled={isVerifying || locationVerified}
                  className={`flex-1 h-[40px] rounded-lg text-white text-[12px] font-semibold font-['Poppins',sans-serif] flex items-center justify-center gap-2 transition-colors shadow-sm ${
                    locationVerified
                      ? 'bg-green-600 cursor-not-allowed'
                      : isVerifying
                      ? 'bg-[#1f3a5f]/60 cursor-wait'
                      : 'bg-[#1f3a5f] hover:bg-[#2d4a75]'
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : locationVerified ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Verified
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      Verify Location
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Site Photos */}
        <div className="mx-4 mb-4">
          <h3 className="text-[#1f3a5f] text-[13px] font-semibold font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Site Photos <span className="text-red-500">*</span>
          </h3>
          
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${!locationVerified ? 'opacity-50' : ''}`}>
            {!locationVerified && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-amber-700 text-[10px] font-medium font-['Poppins',sans-serif]">
                  Verify location first to capture photos
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-3 mb-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={photo}
                    alt={`Site photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(index);
                    }}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[12px] shadow-lg hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {/* Add Photo Button */}
              {locationVerified && (
                <button
                  onClick={() => { if (photoInputRef.current) { photoInputRef.current.click(); } }}
                  className="aspect-square bg-[#1f3a5f]/5 border-2 border-dashed border-[#1f3a5f]/30 rounded-lg flex flex-col items-center justify-center hover:bg-[#1f3a5f]/10 transition-colors"
                >
                  <Camera className="w-6 h-6 text-[#1f3a5f]/60 mb-1" />
                  <p className="text-[9px] text-[#1f3a5f]/60 font-semibold font-['Poppins',sans-serif]">Add Photo</p>
                </button>
              )}
            </div>
            
            <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif]">
              {photos.length > 0 
                ? `${photos.length} photo(s) captured` 
                : 'Capture photos of the property and connection point'}
            </p>
            
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handlePhotoCapture}
              className="hidden"
            />
          </div>
        </div>

        {/* Documents */}
        <div className="mx-4 mb-4">
          <h3 className="text-[#1f3a5f] text-[13px] font-semibold font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Supporting Documents
          </h3>
          
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${!locationVerified ? 'opacity-50' : ''}`}>
            {!locationVerified && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-amber-700 text-[10px] font-medium font-['Poppins',sans-serif]">
                  Verify location first to upload documents
                </p>
              </div>
            )}
            
            <button
              onClick={() => { if (locationVerified && documentInputRef.current) { documentInputRef.current.click(); } }}
              disabled={!locationVerified}
              className="w-full h-[44px] bg-[#1f3a5f]/5 border-2 border-dashed border-[#1f3a5f]/30 rounded-lg flex items-center justify-center gap-2 hover:bg-[#1f3a5f]/10 transition-colors disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5 text-[#1f3a5f]" />
              <p className="text-[12px] text-[#1f3a5f] font-semibold font-['Poppins',sans-serif]">
                Upload Documents
              </p>
            </button>
            
            {documents.length > 0 && (
              <div className="mt-3 space-y-2">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="w-4 h-4 text-[#1f3a5f]" />
                    <p className="text-[11px] text-[#263238] font-medium font-['Poppins',sans-serif] flex-1 truncate">
                      {doc.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif] mt-3">
              {documents.length > 0 
                ? `${documents.length} document(s) uploaded` 
                : 'Upload any relevant documents (optional)'}
            </p>
            
            <input
              ref={documentInputRef}
              type="file"
              accept="application/pdf,image/*"
              multiple
              onChange={handleDocumentUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Site Notes */}
        <div className="mx-4 mb-4">
          <h3 className="text-[#1f3a5f] text-[13px] font-semibold font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Site Observations
          </h3>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <textarea
              value={siteNotes}
              onChange={(e) => setSiteNotes(e.target.value)}
              placeholder="Enter any observations, measurements, or notes about the site visit..."
              className="w-full h-28 text-[11px] text-[#263238] font-['Poppins',sans-serif] placeholder-gray-400 resize-none focus:outline-none"
            />
          </div>
        </div>

      </div>

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex items-center gap-3 max-w-[400px] mx-auto">
          <button
            onClick={onBack}
            className="h-[44px] px-6 bg-white border-2 border-gray-300 rounded-lg text-[#263238] text-[12px] font-semibold font-['Poppins',sans-serif] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            className="flex-1 h-[44px] bg-[#1f3a5f] rounded-lg text-white text-[13px] font-semibold font-['Poppins',sans-serif] shadow-md hover:bg-[#2d4a75] transition-colors"
          >
            Continue to Report
          </button>
        </div>
      </div>
    </div>
  );
}
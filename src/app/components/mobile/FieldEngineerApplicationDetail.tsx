import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  Home, 
  Calendar, 
  FileText,
  CheckCircle2,
  XCircle,
  Camera,
  Upload
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface ApplicationDetails {
  applicationNo: string;
  applicantName: string;
  mobileNumber: string;
  address: string;
  propertyType: string;
  connectionType: string;
  visitDate: string;
  visitPurpose: string;
  status: string;
  engineerComments?: string;
}

interface FieldEngineerApplicationDetailProps {
  applicationNo: string;
  engineerData: { mobile: string; name: string; id: string };
  onBack: () => void;
  onSubmitReport: () => void;
}

export default function FieldEngineerApplicationDetail({
  applicationNo,
  engineerData,
  onBack,
  onSubmitReport,
}: FieldEngineerApplicationDetailProps) {
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visitStatus, setVisitStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [remarks, setRemarks] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationNo]);

  const fetchApplicationDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/jalanidhi/applications/${applicationNo}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setApplication(data);
      } else {
        console.error('Failed to fetch application details');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, you would upload to storage
      // For now, we'll just show placeholders
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleSubmit = async () => {
    if (visitStatus === 'pending') {
      alert('Please select a visit status (Approved/Rejected)');
      return;
    }

    if (!remarks.trim()) {
      alert('Please enter remarks about the site visit');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/jalanidhi/field-engineer/submit-report`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationNo,
            engineerId: engineerData.id,
            engineerName: engineerData.name,
            visitStatus,
            remarks,
            photoCount: photos.length,
            visitDate: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        alert('Site visit report submitted successfully!');
        onSubmitReport();
      } else {
        const error = await response.text();
        alert(`Failed to submit report: ${error}`);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#27548a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#170f49]/60 text-[12px] font-['Poppins',sans-serif]">
            Loading application...
          </p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-[#170f49]/60 text-[14px] font-['Poppins',sans-serif]">
            Application not found
          </p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-[#27548a] text-white text-[12px] font-medium font-['Poppins',sans-serif] rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
          </svg>
          <div className="w-4 h-2 border border-black rounded-sm relative">
            <div className="absolute left-0 top-0 w-3/4 h-full bg-black rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors -ml-2"
        >
          <ArrowLeft className="w-5 h-5 text-[#263238]" />
        </button>
        <div className="flex-1">
          <h1 className="text-[#263238] text-[16px] font-semibold font-['Poppins',sans-serif]">
            Site Visit Details
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-24">
        {/* Application Info Card */}
        <div className="bg-white m-4 rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            <FileText className="w-4 h-4 text-[#27548a]" />
            <p className="text-[#170f49] text-[11px] font-semibold font-['Poppins',sans-serif]">
              {application.applicationNo}
            </p>
          </div>

          <div className="space-y-3">
            {/* Applicant Name */}
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-[#170f49]/60 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[#170f49]/60 text-[10px] font-['Poppins',sans-serif] mb-0.5">
                  Applicant Name
                </p>
                <p className="text-[#170f49] text-[13px] font-medium font-['Poppins',sans-serif]">
                  {application.applicantName}
                </p>
              </div>
            </div>

            {/* Mobile Number */}
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#170f49]/60 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[#170f49]/60 text-[10px] font-['Poppins',sans-serif] mb-0.5">
                  Mobile Number
                </p>
                <p className="text-[#170f49] text-[13px] font-medium font-['Poppins',sans-serif]">
                  {application.mobileNumber}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#170f49]/60 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[#170f49]/60 text-[10px] font-['Poppins',sans-serif] mb-0.5">
                  Address
                </p>
                <p className="text-[#170f49] text-[13px] font-medium font-['Poppins',sans-serif]">
                  {application.address}
                </p>
              </div>
            </div>

            {/* Property Type */}
            <div className="flex items-start gap-3">
              <Home className="w-4 h-4 text-[#170f49]/60 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[#170f49]/60 text-[10px] font-['Poppins',sans-serif] mb-0.5">
                  Property Type
                </p>
                <p className="text-[#170f49] text-[13px] font-medium font-['Poppins',sans-serif]">
                  {application.propertyType}
                </p>
              </div>
            </div>

            {/* Visit Date */}
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-[#0078a0] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[#170f49]/60 text-[10px] font-['Poppins',sans-serif] mb-0.5">
                  Scheduled Date
                </p>
                <p className="text-[#0078a0] text-[13px] font-semibold font-['Poppins',sans-serif]">
                  {formatDate(application.visitDate)}
                </p>
              </div>
            </div>

            {/* Visit Purpose */}
            <div className="pt-2 border-t border-gray-100">
              <span className="px-3 py-1.5 bg-[#0078a0]/10 text-[#0078a0] text-[11px] font-medium font-['Poppins',sans-serif] rounded-full">
                {application.visitPurpose}
              </span>
            </div>
          </div>
        </div>

        {/* Site Visit Report Card */}
        <div className="bg-white m-4 rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-[#170f49] text-[14px] font-semibold font-['Poppins',sans-serif] mb-4">
            Site Visit Report
          </h2>

          {/* Visit Status */}
          <div className="mb-4">
            <p className="text-[#170f49] text-[11px] font-medium font-['Poppins',sans-serif] mb-2">
              Visit Status <span className="text-red-500">*</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setVisitStatus('approved')}
                className={`flex-1 h-[44px] rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                  visitStatus === 'approved'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <CheckCircle2 className={`w-5 h-5 ${visitStatus === 'approved' ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`text-[12px] font-semibold font-['Poppins',sans-serif] ${visitStatus === 'approved' ? 'text-green-700' : 'text-gray-600'}`}>
                  Approved
                </span>
              </button>

              <button
                onClick={() => setVisitStatus('rejected')}
                className={`flex-1 h-[44px] rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                  visitStatus === 'rejected'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-red-300'
                }`}
              >
                <XCircle className={`w-5 h-5 ${visitStatus === 'rejected' ? 'text-red-600' : 'text-gray-400'}`} />
                <span className={`text-[12px] font-semibold font-['Poppins',sans-serif] ${visitStatus === 'rejected' ? 'text-red-700' : 'text-gray-600'}`}>
                  Rejected
                </span>
              </button>
            </div>
          </div>

          {/* Remarks */}
          <div className="mb-4">
            <p className="text-[#170f49] text-[11px] font-medium font-['Poppins',sans-serif] mb-2">
              Remarks <span className="text-red-500">*</span>
            </p>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter your observations from the site visit..."
              className="w-full h-[100px] px-3 py-2.5 bg-white border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[12px] text-[#170f49] outline-none focus:border-[#27548a] focus:ring-2 focus:ring-[#27548a]/20 resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div className="mb-4">
            <p className="text-[#170f49] text-[11px] font-medium font-['Poppins',sans-serif] mb-2">
              Site Photos (Optional)
            </p>
            
            <label className="flex items-center justify-center h-[44px] border-2 border-dashed border-gray-300 rounded-lg hover:border-[#27548a] hover:bg-gray-50 transition-all cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Camera className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-[12px] font-medium font-['Poppins',sans-serif] text-gray-600">
                Add Photos
              </span>
            </label>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {photos.map((photo, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img src={photo} alt={`Site photo ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-[50px] bg-[#27548a] hover:bg-[#1f3a5f] text-white text-[14px] font-bold font-['Poppins',sans-serif] rounded-[12px] shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting Report...' : 'Submit Site Visit Report'}
        </button>
      </div>
    </div>
  );
}
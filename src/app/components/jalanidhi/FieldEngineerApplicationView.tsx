import { useState, useEffect } from 'react';
import SectionTitle from './SectionTitle';
import { ChevronLeft, User, MapPin, Droplet, FileText, Download, Calendar, Eye, RotateCcw, CheckCircle, MessageSquare, Phone } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import svgPaths from '../../../imports/svg-qcyk0j46yr';
import FieldReportView from './FieldReportView';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface FieldEngineerApplicationViewProps {
  applicationId: string;
}

interface ApplicationData {
  id: string;
  applicationNo: string;
  status: string;
  submittedAt: string;
  applicantDetails: {
    applicantName: string;
    mobile: string;
    email?: string;
    fatherName?: string;
    aadharNumber?: string;
    doorNumber?: string;
    wardNumber?: string;
    street?: string;
    address?: string;
  };
  propertyDetails: {
    district: string;
    ulb: string;
    ulbType: string;
    authorityType: string;
    ownershipType: string;
  };
  connectionDetails: {
    connectionType: string;
    propertyType: string;
  };
  bankDetails?: {
    fullName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName: string;
    bankAddress: string;
  };
  plumberEstimation?: {
    rows: Array<{
      id: string;
      attribute: string;
      unitOfMeasurement: string;
      amount: string;
    }>;
    totalAmount: number;
    documents: Array<{
      name: string;
      type: string;
    }>;
    comments?: string;
  };
  scheme?: {
    name: string;
    amount: string;
    item1: string;
    item2: string;
  };
  caseworkerDetails?: {
    name: string;
    comment: string;
    forwardedTo: string;
    forwardedAt: string;
  };
  revenueOfficerDetails?: {
    name: string;
    comment: string;
    forwardedTo: string;
    forwardedAt: string;
  };
  plumberDetails?: {
    plumberName: string;
    plumberType?: string;
    firmName?: string;
  };
  fieldVisitReport?: {
    engineerName: string;
    submittedAt: string;
    locationVerification: {
      verified: boolean;
      latitude: number;
      longitude: number;
      address: string;
      verifiedAt: string;
    };
    siteObservations: string;
    engineerRemarks: string;
    photos: string[];
    documents: Array<{
      name: string;
      size: string;
    }>;
  };
  fieldVisit?: {
    status: 'pending' | 'scheduled' | 'completed';
    visitDate: string;
    visitPurpose: string;
    comment: string;
    scheduledAt?: string;
  };
}

// Dropdown icon component
function WeuiBackOutlined() {
  return (
    <div className="h-[16px] relative w-[8px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 16">
        <g>
          <path clipRule="evenodd" d={svgPaths.p313bbf80} fill="black" fillRule="evenodd" />
        </g>
      </svg>
    </div>
  );
}

// Schedule Visit Popup Component
interface SchedulePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (visitDate: string, visitPurpose: string, comment: string) => Promise<boolean>;
  applicationNo: string;
  isReschedule?: boolean;
  citizenMobile?: string;
}

function SchedulePopup({
  isOpen,
  onClose,
  onSubmit,
  applicationNo,
  isReschedule = false,
  citizenMobile = '',
}: SchedulePopupProps) {
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitPurpose, setVisitPurpose] = useState('Verification');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [scheduledInfo, setScheduledInfo] = useState<{ date: string; purpose: string } | null>(null);

  const handleSubmit = async () => {
    if (!visitDate) {
      alert('Please select a visit date');
      return;
    }
    if (!visitPurpose) {
      alert('Please select a visit purpose');
      return;
    }
    setSubmitting(true);
    try {
      const dateStr = visitDate.toISOString().split('T')[0];
      const success = await onSubmit(dateStr, visitPurpose, comments);
      if (success) {
        setScheduledInfo({ date: dateStr, purpose: visitPurpose });
        setShowSuccess(true);
        // Auto-close the popup after a short delay so user sees the success state briefly
        setTimeout(() => {
          setShowSuccess(false);
          setScheduledInfo(null);
          onClose();
        }, 1500);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setScheduledInfo(null);
    onClose();
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Mask mobile number: show first 3 and last 2 digits
  const cleanMobile = citizenMobile ? citizenMobile.replace(/\s/g, '') : '';
  const maskedMobile = cleanMobile.length > 5
    ? cleanMobile.slice(0, 3) + '*****' + cleanMobile.slice(-2)
    : cleanMobile || '***********';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 backdrop-blur-[2px] bg-[rgba(0,0,0,0.4)]" 
        onClick={showSuccess ? handleSuccessClose : onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,120,160,0.15)] w-[500px] px-[24px] py-[32px] flex flex-col gap-[24px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_8px_0px_rgba(0,0,0,0.25)]" />
        
        {showSuccess && scheduledInfo ? (
          /* Success State */
          <div className="flex flex-col items-center gap-[20px] relative z-10 py-2">
            {/* Success Icon */}
            <div className="w-[72px] h-[72px] rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            {/* Title */}
            <p className="font-['Poppins',sans-serif] font-bold text-[18px] text-[#170f49] text-center">
              Site Visit {isReschedule ? 'Rescheduled' : 'Scheduled'} Successfully!
            </p>

            {/* Visit Details */}
            <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 font-['Poppins',sans-serif] mb-0.5">Application</p>
                  <p className="text-[13px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">{applicationNo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-['Poppins',sans-serif] mb-0.5">Visit Date</p>
                  <p className="text-[13px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">{formatDisplayDate(scheduledInfo.date)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 font-['Poppins',sans-serif] mb-0.5">Purpose</p>
                  <p className="text-[13px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">{scheduledInfo.purpose}</p>
                </div>
              </div>
            </div>

            {/* SMS Notification Banner */}
            <div className="w-full bg-blue-50 rounded-lg p-4 border border-blue-200 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="w-[18px] h-[18px] text-blue-600" />
              </div>
              <div>
                <p className="font-['Poppins',sans-serif] font-semibold text-[13px] text-blue-900 mb-1">
                  SMS Notification Sent
                </p>
                <p className="font-['Poppins',sans-serif] text-[12px] text-blue-700 leading-relaxed">
                  Field visit schedule has been sent as SMS to the citizen's registered mobile number{' '}
                  <span className="font-semibold inline-flex items-center gap-1"><Phone className="w-3 h-3" />{maskedMobile}</span>.
                </p>
              </div>
            </div>

            {/* OK Button */}
            <button
              onClick={handleSuccessClose}
              className="bg-[#1f3a5f] cursor-pointer h-[38px] px-[28px] rounded-[24px] shadow-[0px_2.45px_7.841px_0px_rgba(8,15,52,0.06)] hover:bg-[#27548a] transition-colors"
            >
              <p className="font-['Poppins',sans-serif] font-semibold leading-[12px] text-white text-[13px]">
                OK
              </p>
            </button>
          </div>
        ) : (
          /* Form State */
          <>
            {/* Title */}
            <div className="flex flex-col gap-[12px] relative z-10">
              <p className="font-['Poppins',sans-serif] font-bold leading-[17.152px] text-[#170f49] text-[14px]">
                {isReschedule ? 'Reschedule Site Visit' : 'Schedule Site Visit'}
              </p>
              <div className="h-0 relative">
                <div className="absolute inset-[-0.49px_0_0_0]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 422 0.490046">
                    <line stroke="#D9DBE9" strokeWidth="0.490046" x2="422" y1="0.245023" y2="0.245023" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Visit Date Field */}
            <div className="flex flex-col gap-[9px] relative z-10">
              <div className="flex gap-[10px] items-center">
                <p className="flex-1 font-['Poppins',sans-serif] font-medium leading-[9.801px] text-[#170f49] text-[14px]">
                  <span>Visit Date </span>
                  <span className="text-[#ff0c10]">*</span>
                </p>
              </div>
              <div className="bg-white h-[32px] relative rounded-[22.542px]">
                <div className="absolute border border-[#d3d8ff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
                <DatePicker
                  selected={visitDate}
                  onChange={(date) => setVisitDate(date as Date)}
                  className="w-full h-full px-[10px] py-[11px] bg-transparent font-['Poppins',sans-serif] text-[12px] text-[#170f49] outline-none rounded-[22.542px]"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>

            {/* Visit Purpose Field */}
            <div className="flex flex-col gap-[9px] relative z-10">
              <div className="flex gap-[10px] items-center">
                <p className="flex-1 font-['Poppins',sans-serif] font-medium leading-[9.801px] text-[#170f49] text-[14px]">
                  <span>Visit Purpose </span>
                  <span className="text-[#ff0c10]">*</span>
                </p>
              </div>
              <div className="bg-white h-[32.343px] relative rounded-[22.542px]">
                <div className="absolute border border-[#dadfff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
                <div className="flex items-center justify-between h-full px-[10px] py-[11px] relative z-50">
                  <select
                    value={visitPurpose}
                    onChange={(e) => setVisitPurpose(e.target.value)}
                    className="w-full h-full bg-transparent font-['Poppins',sans-serif] text-[12px] text-[#170f49] outline-none appearance-none pr-[24px] cursor-pointer relative z-50"
                    style={{ minHeight: '24px' }}
                  >
                    <option value="Verification">Verification</option>
                    <option value="Site Inspection">Site Inspection</option>
                    <option value="Measurement Survey">Measurement Survey</option>
                    <option value="Final Assessment">Final Assessment</option>
                  </select>
                  <div className="flex h-[8px] items-center justify-center w-[16px] pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 z-10">
                    <div className="-rotate-90">
                      <WeuiBackOutlined />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comment Field */}
            <div className="flex flex-col gap-[9px] relative z-10">
              <div className="flex gap-[10px] items-center">
                <p className="flex-1 font-['Poppins',sans-serif] font-medium leading-[9.801px] text-[#170f49] text-[14px]">
                  <span>Comments</span>
                </p>
              </div>
              <div className="bg-white h-[32px] relative rounded-[22.542px]">
                <div className="absolute border border-[#d3d8ff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
                <input
                  type="text"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="relative z-10 w-full h-full px-[10px] py-[11px] bg-transparent font-['Poppins',sans-serif] text-[12px] text-[#170f49] outline-none rounded-[22.542px]"
                  placeholder="Enter your comment..."
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-start justify-between relative z-10">
              <button 
                onClick={onClose}
                disabled={submitting}
                className="bg-white cursor-pointer h-[32px] px-[14px] rounded-[24px] border-[#0078a0] border-[0.49px] shadow-[0px_2.45px_7.841px_0px_rgba(8,15,52,0.06)] hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <p className="font-['Poppins',sans-serif] font-medium leading-[9.801px] text-[#0078a0] text-[12px]">
                  Cancel
                </p>
              </button>
              
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[#0078a0] cursor-pointer h-[32px] px-[14px] rounded-[24px] shadow-[0px_2.45px_7.841px_0px_rgba(8,15,52,0.06)] hover:bg-[#006b8f] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <p className="font-['Poppins',sans-serif] font-medium leading-[9.801px] text-white text-[12px]">
                  {submitting ? 'Submitting...' : 'Submit'}
                </p>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function FieldEngineerApplicationView({ applicationId }: FieldEngineerApplicationViewProps) {
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFieldReport, setShowFieldReport] = useState(false);
  const [showSchedulePopup, setShowSchedulePopup] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadApplicationData();
  }, [applicationId]);

  const loadApplicationData = async () => {
    setLoading(true);
    
    try {
      console.log('[FIELD ENGINEER VIEW] Loading application:', applicationId);
      
      // Fetch application data from backend (note: /application/ is singular, not plural)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/application/${applicationId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch application');
      }

      const data = await response.json();
      
      if (data.success && data.application) {
        console.log('[FIELD ENGINEER VIEW] Application loaded:', data.application);
        console.log('[FIELD ENGINEER VIEW] fieldVisitReport exists:', !!data.application.fieldVisitReport);
        console.log('[FIELD ENGINEER VIEW] fieldVisitReport data:', data.application.fieldVisitReport);
        
        // Transform backend data to match component interface
        const app = data.application;
        const transformedApp: ApplicationData = {
          ...app,
          revenueOfficerDetails: app.workflow && app.workflow.revenueOfficer ? {
            name: app.workflow.revenueOfficer.name || 'Revenue Officer',
            comment: app.workflow.revenueOfficer.comments || '',
            forwardedTo: app.workflow.revenueOfficer.forwardedTo || 'Field Engineer',
            forwardedAt: app.workflow.revenueOfficer.timestamp || '',
          } : undefined,
          caseworkerDetails: app.workflow && app.workflow.caseworker ? {
            name: app.workflow.caseworker.name || 'Caseworker',
            comment: app.workflow.caseworker.comments || '',
            forwardedTo: app.workflow.caseworker.forwardedTo || '',
            forwardedAt: app.workflow.caseworker.timestamp || '',
          } : undefined,
          plumberEstimation: app.plumberConnectionData ? {
            rows: app.plumberConnectionData.estimationRows || [],
            totalAmount: app.plumberConnectionData.totalAmount || 0,
            documents: [
              ...(app.plumberConnectionData.siteSketchUploaded ? [{ name: 'Site_Sketch.pdf', type: 'PDF Document' }] : []),
              ...(app.plumberConnectionData.estimateUploaded ? [{ name: 'Cost_Estimate.pdf', type: 'PDF Document' }] : []),
            ],
            comments: app.plumberConnectionData.comments,
          } : undefined,
          // Ensure fieldVisitReport is properly passed through
          fieldVisitReport: app.fieldVisitReport || undefined,
          fieldVisit: app.fieldVisit || undefined,
        };
        
        console.log('[FIELD ENGINEER VIEW] Transformed application:', transformedApp);
        console.log('[FIELD ENGINEER VIEW] Transformed fieldVisitReport:', transformedApp.fieldVisitReport);
        console.log('[FIELD ENGINEER VIEW] Transformed fieldVisit:', transformedApp.fieldVisit);
        setApplication(transformedApp);
      } else {
        throw new Error('Application not found');
      }
      
    } catch (error) {
      console.error('[FIELD ENGINEER VIEW] Error loading application:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const handleSchedule = async (visitDate: string, visitPurpose: string, comment: string): Promise<boolean> => {
    setProcessing(true);
    try {
      console.log('[FIELD ENGINEER] Scheduling site visit:', {
        applicationId: application && application.id,
        visitDate,
        visitPurpose,
        comment
      });
      
      // Call the backend API to schedule the visit
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/field-engineer/schedule-visit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: application && application.id,
            visitDate,
            visitPurpose,
            comment,
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to schedule visit');
      }
      
      console.log('[FIELD ENGINEER] Site visit scheduled successfully:', data);
      
      // Reload application data to show updated visit info and "Reschedule Visit" button
      await loadApplicationData();
      
      return true;
      
    } catch (error) {
      console.error('[FIELD ENGINEER] Error scheduling site visit:', error);
      alert(`Error scheduling site visit: ${error}`);
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const handleBack = () => {
    const event = new CustomEvent('navigate', { detail: '/jalanidhi/field-engineer/tap-connection' });
    window.dispatchEvent(event);
  };

  const handleResetStatus = async () => {
    if (!confirm('Are you sure you want to reset this application status back to "Received from Revenue Officer"? This will remove all field visit data.')) {
      return;
    }
    
    setResetting(true);
    try {
      console.log('[FIELD ENGINEER] Resetting application status:', application && application.id);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/reset-application-status`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: application && application.id,
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset status');
      }
      
      console.log('[FIELD ENGINEER] Status reset successfully:', data);
      alert(`✅ Application status reset successfully!\n\nThe application is now back to "Received from Revenue Officer" status and the Schedule Visit button is enabled.`);
      
      // Reload the application data
      await loadApplicationData();
      
    } catch (error) {
      console.error('[FIELD ENGINEER] Error resetting status:', error);
      alert(`❌ Error resetting status: ${error}`);
    } finally {
      setResetting(false);
    }
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
        <p className="text-red-600 font-['Poppins',sans-serif]">Application not found</p>
      </div>
    );
  }

  // Show Field Report View if requested
  if (showFieldReport) {
    return (
      <FieldReportView 
        applicationId={application.id}
        onBack={() => setShowFieldReport(false)}
      />
    );
  }

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
        <SectionTitle title="Review Application" className="mb-2" />
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{application.id}</span>
        </p>
        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mt-1">
          Submitted on: {formatDate(application.submittedAt)}
        </p>
      </div>

      {/* Application Summary Card */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <SectionTitle title="Application Summary" className="mb-4" />
        
        <div className="space-y-6">
          {/* Property Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Property Details
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">District</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.propertyDetails.district}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">ULB</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.propertyDetails.ulb}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Ownership Type</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                  {application.propertyDetails.ownershipType}
                </p>
              </div>
            </div>
          </div>

          {/* Applicant Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Applicant Details
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Name</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.applicantDetails.applicantName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Mobile</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.applicantDetails.mobile}
                </p>
              </div>
              {application.applicantDetails.email && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Email</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.applicantDetails.email}
                  </p>
                </div>
              )}
              {application.applicantDetails.address && (
                <div className="md:col-span-3">
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Address</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.applicantDetails.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Connection Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Connection Details
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Connection Type</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                  {application.connectionDetails.connectionType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Property Type</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                  {application.connectionDetails.propertyType}
                </p>
              </div>
              {application.plumberDetails && application.plumberDetails.plumberName && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Assigned Plumber</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.plumberDetails.plumberName}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bank Details */}
          {application.bankDetails && (
            <div>
              <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
                Bank Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Account Holder Name</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.bankDetails.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Bank Name</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.bankDetails.bankName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Branch Name</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.bankDetails.branchName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Account Number</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.bankDetails.accountNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">IFSC Code</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.bankDetails.ifscCode}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plumber Estimation Card */}
      {application.plumberEstimation && (
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
          <SectionTitle title="Plumber Estimation & Documents" className="mb-4" />
          
          <div className="space-y-6">
            {/* Estimation Table */}
            <div>
              <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
                Cost Estimation
              </h3>
              
              <div className="overflow-hidden rounded-lg border border-gray-200 mb-4">
                <div className="bg-gray-50 grid grid-cols-[60px_2fr_1.5fr_1fr] gap-4 px-6 py-3 border-b border-gray-200">
                  <div className="font-['Poppins',sans-serif] font-semibold text-[13px] text-gray-700 text-center">
                    S.No
                  </div>
                  <div className="font-['Poppins',sans-serif] font-semibold text-[13px] text-gray-700">
                    Attributes
                  </div>
                  <div className="font-['Poppins',sans-serif] font-semibold text-[13px] text-gray-700 text-center">
                    Unit of Measurement
                  </div>
                  <div className="font-['Poppins',sans-serif] font-semibold text-[13px] text-gray-700 text-right">
                    Amount (₹)
                  </div>
                </div>

                <div className="bg-white">
                  {application.plumberEstimation.rows.map((row, index) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-[60px_2fr_1.5fr_1fr] gap-4 px-6 py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="font-['Poppins',sans-serif] text-[14px] text-gray-600 text-center">
                        {index + 1}
                      </div>
                      <div className="font-['Poppins',sans-serif] text-[14px] text-gray-900">
                        {row.attribute}
                      </div>
                      <div className="font-['Poppins',sans-serif] text-[14px] text-gray-700 text-center">
                        {row.unitOfMeasurement}
                      </div>
                      <div className="font-['Poppins',sans-serif] text-[14px] text-gray-900 text-right">
                        ₹{parseFloat(row.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}

                  <div className="bg-gray-50 grid grid-cols-[60px_2fr_1.5fr_1fr] gap-4 px-6 py-4 border-t-2 border-gray-300">
                    <div></div>
                    <div className="font-['Poppins',sans-serif] font-semibold text-[15px] text-[#1f3a5f]">
                      Total Estimated Amount
                    </div>
                    <div></div>
                    <div className="font-['Poppins',sans-serif] font-bold text-[16px] text-[#1f3a5f] text-right">
                      ₹{application.plumberEstimation.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Uploaded Documents */}
            <div>
              <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
                Uploaded Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.plumberEstimation.documents.map((doc, index) => (
                  <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-gray-900">{doc.name}</p>
                        <p className="font-['Poppins',sans-serif] text-[12px] text-gray-600">{doc.type}</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-blue-100 rounded-md transition-colors">
                      <Download className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Plumber Comments */}
            {application.plumberEstimation.comments && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <p className="text-sm font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">
                  Plumber's Comments:
                </p>
                <p className="font-['Poppins',sans-serif] text-[14px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {application.plumberEstimation.comments}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comments & History */}
      {(() => {
        const remarkEntries: RemarkEntry[] = [];
        if (application.caseworkerDetails && application.caseworkerDetails.comment) {
          remarkEntries.push({ role: 'Caseworker', comment: application.caseworkerDetails.comment, timestamp: application.caseworkerDetails.forwardedAt || '' });
        }
        if (application.revenueOfficerDetails && application.revenueOfficerDetails.comment) {
          remarkEntries.push({ role: 'Revenue Officer', comment: application.revenueOfficerDetails.comment, timestamp: application.revenueOfficerDetails.forwardedAt || '' });
        }
        return remarkEntries.length > 0 ? (
          <div className="mb-6">
            <RemarksTimeline remarks={remarkEntries} title="Comments & History" />
          </div>
        ) : null;
      })()}

      {/* Scheme Details Card */}
      {application.scheme && (
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
          <SectionTitle title="Selected Scheme Details" className="mb-4" />

          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Scheme Name</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.scheme.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Amount</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.scheme.amount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Item 1</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.scheme.item1}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Item 2</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.scheme.item2}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Visit Info Card - Show when visit is scheduled but site visit not done */}
      {application.fieldVisit && application.fieldVisit.status === 'scheduled' && !application.fieldVisitReport && (
        <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
          <div className="bg-[#1f3a5f] px-6 py-4">
            <h2 className="text-xl font-semibold text-white font-['Poppins',sans-serif] flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Scheduled Site Visit
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#f8fafc] rounded-lg p-4 border border-gray-200">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Visit Date</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {formatDate(application.fieldVisit.visitDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Visit Purpose</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {application.fieldVisit.visitPurpose}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Status</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-semibold bg-[#1f3a5f]/10 text-[#1f3a5f] border border-[#1f3a5f]/20">
                  <Calendar className="w-3.5 h-3.5" />
                  Awaiting Site Visit
                </span>
              </div>
              {application.fieldVisit.comment && (
                <div className="md:col-span-3">
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Comments</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.fieldVisit.comment}
                  </p>
                </div>
              )}
              {application.fieldVisit.scheduledAt && (
                <div className="md:col-span-3">
                  <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                    Scheduled on: {formatDate(application.fieldVisit.scheduledAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons at Bottom */}
      <div className="flex items-center justify-end gap-4 mt-8 mb-6">
        {/* Schedule / Reschedule Visit Button - Show until site visit report is done */}
        {!application.fieldVisitReport && (
          <button
            onClick={() => setShowSchedulePopup(true)}
            disabled={processing}
            className={`px-8 py-3 text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 ${
              application.fieldVisit && application.fieldVisit.status === 'scheduled'
                ? 'bg-[#2c5282] hover:bg-[#1f3a5f]'
                : 'bg-[#1f3a5f] hover:bg-[#27548a]'
            }`}
          >
            {application.fieldVisit && application.fieldVisit.status === 'scheduled' ? (
              <RotateCcw className="w-5 h-5" />
            ) : (
              <Calendar className="w-5 h-5" />
            )}
            {processing ? 'Processing...' : (
              application.fieldVisit && application.fieldVisit.status === 'scheduled'
                ? 'Reschedule Visit'
                : 'Schedule Visit'
            )}
          </button>
        )}

        {/* View Field Report Button - Only show if field visit is completed and report exists */}
        {(application.fieldVisit && application.fieldVisit.status === 'completed' || application.fieldVisitReport) && (
          <button
            onClick={() => setShowFieldReport(true)}
            disabled={processing}
            className="px-8 py-3 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#27548a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Eye className="w-5 h-5" />
            {processing ? 'Processing...' : 'Field Visit Report'}
          </button>
        )}
      </div>

      {/* Schedule Popup */}
      {showSchedulePopup && (
        <SchedulePopup
          isOpen={showSchedulePopup}
          onClose={() => setShowSchedulePopup(false)}
          onSubmit={handleSchedule}
          applicationNo={application.id}
          isReschedule={!!(application.fieldVisit && application.fieldVisit.status === 'scheduled')}
          citizenMobile={application.applicantDetails && application.applicantDetails.mobile ? application.applicantDetails.mobile : ''}
        />
      )}
    </div>
  );
}
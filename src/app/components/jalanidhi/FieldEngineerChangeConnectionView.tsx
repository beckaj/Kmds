import { useState, useEffect } from 'react';
import { ChevronLeft, Eye, Calendar } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import FieldReportView from './FieldReportView';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface FieldEngineerChangeConnectionViewProps {
  applicationId: string;
}

interface PlumberLicense {
  id: string;
  applicationNo: string;
  plumberName: string;
  mobile: string;
  status: string;
  licensedDate?: string;
  expiryDate?: string;
}

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

/* eslint-disable @typescript-eslint/no-unused-vars */
function __DEAD_SchedulePopup() {
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
                  <span>Start Date </span>
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
                    <option value="Connection Type Change Verification">Connection Type Change Verification</option>
                    <option value="Final Assessment">Final Assessment</option>
                  </select>
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


export default function FieldEngineerChangeConnectionView({ applicationId }: FieldEngineerChangeConnectionViewProps) {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [fieldEngineerComment, setFieldEngineerComment] = useState('');
  const [selectedPlumberLicense, setSelectedPlumberLicense] = useState('');
  const [plumberLicenses, setPlumberLicenses] = useState<PlumberLicense[]>([]);
  const [loadingPlumbers, setLoadingPlumbers] = useState(false);
  const [wantsSiteVisit, setWantsSiteVisit] = useState<string>('');
  const [forwarded, setForwarded] = useState(false);
  const [forwardedTo, setForwardedTo] = useState('');
  const [forwardedAt, setForwardedAt] = useState('');
  const [showFieldReport, setShowFieldReport] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    loadApplicationData();
    fetchPlumberLicenses();
  }, [applicationId]);

  const loadApplicationData = async () => {
    try {
      setLoading(true);
      console.log('[FE CHANGE CONNECTION VIEW] Fetching application:', applicationId);
      
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
        console.error('[FE CHANGE CONNECTION VIEW] API Error:', response.statusText);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[FE CHANGE CONNECTION VIEW] API Response:', data);
      
      if (data.success && data.application) {
        setApplication(data.application);
        console.log('[FE CHANGE CONNECTION VIEW] Application loaded:', data.application);
        
        // Restore previously saved plumber assignment and site visit choice
        const feWf = data.application.workflow && data.application.workflow.fieldEngineer;
        if (feWf) {
          if (feWf.status === 'reviewed') {
            setForwarded(true);
            setForwardedTo(feWf.forwardedTo || 'Commissioner');
            setForwardedAt(feWf.timestamp || '');
          }
          if (feWf.assignedPlumber) {
            setSelectedPlumberLicense(feWf.assignedPlumber);
          }
          if (feWf.wantsSiteVisit) {
            setWantsSiteVisit(feWf.wantsSiteVisit);
          }
        }
        // Also check top-level saved values
        if (data.application.fieldEngineerAssignedPlumber) {
          setSelectedPlumberLicense(data.application.fieldEngineerAssignedPlumber);
        }
        if (data.application.fieldEngineerWantsSiteVisit) {
          setWantsSiteVisit(data.application.fieldEngineerWantsSiteVisit);
        }
      } else {
        console.error('[FE CHANGE CONNECTION VIEW] Error:', data.error);
      }
    } catch (error) {
      console.error('[FE CHANGE CONNECTION VIEW] Error loading application:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlumberLicenses = async () => {
    try {
      setLoadingPlumbers(true);
      console.log('[FE CHANGE CONNECTION] Fetching approved plumber licenses...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/meter-management/approved-plumbers`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('[FE CHANGE CONNECTION] Error fetching plumber licenses:', response.statusText);
        return;
      }

      const data = await response.json();
      if (data.success) {
        const licenses: PlumberLicense[] = (data.individuals || []).map((p: any) => ({
          id: p.id,
          applicationNo: p.applicationNo || p.id,
          plumberName: p.plumberName || 'N/A',
          mobile: p.mobile || 'N/A',
          status: p.status || 'approved',
          licensedDate: p.licensedDate || '01/08/2025',
          expiryDate: p.expiryDate || '31/07/2026',
        }));
        // Also add contractors
        (data.contractors || []).forEach((c: any) => {
          licenses.push({
            id: c.id,
            applicationNo: c.applicationNo || c.id,
            plumberName: c.firmName || c.authFullName || 'N/A',
            mobile: c.mobile || c.authMobile || 'N/A',
            status: c.status || 'approved',
            licensedDate: c.licensedDate || '01/08/2025',
            expiryDate: c.expiryDate || '31/07/2026',
          });
        });
        setPlumberLicenses(licenses);
        console.log('[FE CHANGE CONNECTION] Loaded plumber licenses:', licenses.length);
      }
    } catch (error) {
      console.error('[FE CHANGE CONNECTION] Error fetching plumber licenses:', error);
    } finally {
      setLoadingPlumbers(false);
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

  // Get selected plumber details
  const selectedPlumber = plumberLicenses.find(p => p.applicationNo === selectedPlumberLicense) || null;

  // Determine states
  const hasFieldVisit = application && application.fieldVisit;
  const visitScheduled = hasFieldVisit && application.fieldVisit.status === 'scheduled';
  const visitCompleted = hasFieldVisit && application.fieldVisit.status === 'completed';
  const hasFieldVisitReport = application && application.fieldVisitReport && Object.keys(application.fieldVisitReport).length > 0;

  // Can forward to Commissioner?
  // If site visit = yes, can only forward after field report is submitted
  // If site visit = no, can forward directly
  const canForward = !forwarded && fieldEngineerComment.trim() && selectedPlumberLicense && wantsSiteVisit && (
    wantsSiteVisit === 'no' || (wantsSiteVisit === 'yes' && hasFieldVisitReport)
  );

  const handleScheduleVisit = async () => {
    if (!scheduleDate) {
      alert('Please select a visit date before scheduling.');
      return;
    }
    if (!selectedPlumberLicense) {
      alert('Please select a plumber license before scheduling.');
      return;
    }

    setScheduling(true);
    try {
      const dateStr = scheduleDate.toISOString().split('T')[0];
      console.log('[FE CHANGE CONNECTION] Scheduling site visit:', {
        applicationId: application && application.id,
        visitDate: dateStr,
      });

      // First save the plumber assignment
      try {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-698be164/field_engineer/save-assignment`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              applicationId: application && application.id,
              assignedPlumber: selectedPlumberLicense,
              wantsSiteVisit: 'yes',
            }),
          }
        );
      } catch (saveErr) {
        console.warn('[FE CHANGE CONNECTION] Save-assignment fallback:', saveErr);
      }

      // Then schedule the visit
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
            visitDate: dateStr,
            visitPurpose: 'Connection Type Change Verification',
            comment: '',
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error((data && data.error) || 'Failed to schedule visit');
      }
      
      console.log('[FE CHANGE CONNECTION] Site visit scheduled successfully:', data);
      alert('Site visit scheduled for ' + scheduleDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) + '.\nThe application has been pushed to the mobile app for field inspection.');
      await loadApplicationData();
      
    } catch (error) {
      console.error('[FE CHANGE CONNECTION] Error scheduling site visit:', error);
      alert('Error scheduling site visit: ' + error);
    } finally {
      setScheduling(false);
    }
  };

  const handleForward = async () => {
    if (!fieldEngineerComment.trim()) {
      alert('Please enter comments before forwarding.');
      return;
    }

    if (!selectedPlumberLicense) {
      alert('Please select a plumber before forwarding to Commissioner.');
      return;
    }

    if (!wantsSiteVisit) {
      alert('Please select whether site visit is needed.');
      return;
    }

    if (wantsSiteVisit === 'yes' && !hasFieldVisitReport) {
      alert('Site visit report is required before forwarding. Please complete the field inspection first.');
      return;
    }

    setProcessing(true);
    try {
      console.log('[FE CHANGE CONNECTION] Forwarding to Commissioner:', {
        applicationId: application.id,
        comment: fieldEngineerComment,
        assignedPlumber: selectedPlumberLicense,
        wantsSiteVisit,
        forwardTo: 'Commissioner'
      });
      
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
            wantsSiteVisit,
            forwardTo: 'Commissioner'
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        console.log('[FE CHANGE CONNECTION] Application forwarded successfully to Commissioner');
        alert('Application ' + application.id + ' forwarded to Commissioner successfully!\n\nComment: ' + fieldEngineerComment);
        
        const event = new CustomEvent('navigate', { detail: '/jalanidhi/field-engineer/tap-connection/change-connection-type' });
        window.dispatchEvent(event);
        
        setForwarded(true);
        setForwardedTo('Commissioner');
        setForwardedAt(new Date().toISOString());
      } else {
        console.error('[FE CHANGE CONNECTION] Error forwarding application:', data.error);
        alert('Error forwarding application: ' + ((data && data.error) || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error forwarding application:', error);
      alert('Error forwarding application: ' + error);
    } finally {
      setProcessing(false);
    }
  };

  const handleBack = () => {
    const event = new CustomEvent('navigate', { detail: '/jalanidhi/field-engineer/tap-connection/change-connection-type' });
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

  // Helpers for application data
  const rrData = application.rrData || {};
  const arrears = application.arrearDetails;
  const caseworkerWorkflow = application.workflow && application.workflow.caseworker ? application.workflow.caseworker : null;
  const revenueOfficerWorkflow = application.workflow && application.workflow.revenueOfficer ? application.workflow.revenueOfficer : null;

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
          Review Change of Connection Type Application
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{application.id}</span>
        </p>
        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mt-1">
          Submitted on: {formatDate(application.submittedAt)}
        </p>
      </div>

      {/* ======================= APPLICATION DETAILS ======================= */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col gap-[24px]">

          {/* RR Number */}
          <div className="flex flex-col gap-[12px]">
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Existing RR Number
            </h2>
            <p className="font-['Poppins',sans-serif] font-medium text-[16px] text-[#1f3a5f]">
              {application.rrNumber || 'N/A'}
            </p>
          </div>

          <SectionDivider />

          {/* Applicant Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Applicant Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[16px] bg-gray-50 rounded-lg p-4">
              <ReadOnlyField label="District" value={rrData.district} />
              <ReadOnlyField label="ULB" value={rrData.ulb} />
              <ReadOnlyField label="ULB Type" value={rrData.ulbType} />
            </div>
          </div>

          <SectionDivider />

          {/* Property Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Property Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[16px] bg-gray-50 rounded-lg p-4">
              <ReadOnlyField label="Owner Name" value={rrData.ownerName} />
              <ReadOnlyField label="Door Number" value={rrData.doorNumber} />
              <ReadOnlyField label="Ward Number" value={rrData.wardNumber} />
              <ReadOnlyField label="Street" value={rrData.street} />
              <ReadOnlyField label="Address" value={rrData.address} />
              <ReadOnlyField label="City" value={rrData.city} />
              <ReadOnlyField label="State" value={rrData.state} />
              <ReadOnlyField label="Pincode" value={rrData.pincode} />
              <ReadOnlyField label="Mobile No" value={rrData.mobileNo} />
            </div>
          </div>

          <SectionDivider />

          {/* Existing Connection Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Existing Connection Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[16px] bg-gray-50 rounded-lg p-4">
              <ReadOnlyField label="Connection Type" value={rrData.connectionType} />
              <ReadOnlyField label="Meter Category" value={rrData.meterCategory} />
              <ReadOnlyField label="Meter Status" value={rrData.meterStatus} />
              <ReadOnlyField label="Meter Installed Date" value={rrData.meterInstalledDate} />
              <ReadOnlyField label="Scheme Name" value={rrData.schemeName} />
            </div>
          </div>

          <SectionDivider />

          {/* UGD Connection */}
          <div className="flex flex-col gap-[12px]">
            <p className="font-['Poppins',sans-serif] font-medium text-[16px] text-[#414141]">
              Is there any UGD Connection Linked?
            </p>
            <p className="font-['Poppins',sans-serif] font-medium text-[16px] text-[#263238]">
              {application.hasUGDConnection === 'yes' ? 'Yes' : application.hasUGDConnection === 'no' ? 'No' : 'N/A'}
            </p>
          </div>

          <SectionDivider />

          {/* Change of Connection Type Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Change of Connection Type Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[16px] bg-gray-50 rounded-lg p-4">
              <ReadOnlyField label="Existing Connection Type" value={application.existingConnectionType || (rrData.connectionType || 'N/A')} />
              <ReadOnlyField label="New Connection Type" value={application.newConnectionType || 'N/A'} />
              <ReadOnlyField label="Application Fees" value={application.applicationFees !== undefined && application.applicationFees !== null ? 'Rs. ' + application.applicationFees : 'N/A'} />
              <ReadOnlyField label="Security Deposit" value={application.securityDeposit !== undefined && application.securityDeposit !== null ? 'Rs. ' + application.securityDeposit : 'N/A'} />
            </div>
          </div>

          <SectionDivider />

          {/* Current Arrears Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Current Arrears Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[16px] bg-gray-50 rounded-lg p-4">
              <ReadOnlyField label="Current Demand" value={arrears && arrears.currentDemand !== undefined ? 'Rs. ' + arrears.currentDemand : 'N/A'} />
              <ReadOnlyField label="Arrears" value={arrears && arrears.arrears !== undefined ? 'Rs. ' + arrears.arrears : 'N/A'} />
              <ReadOnlyField label="Total Bill" value={arrears && arrears.totalBill !== undefined ? 'Rs. ' + arrears.totalBill : 'N/A'} />
            </div>
          </div>

          {/* Arrear Payment Details */}
          {application.arrearPaymentDetails && (
            <>
              <SectionDivider />
              <div className="flex flex-col gap-[16px]">
                <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                  Arrear Payment Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[16px] bg-gray-50 rounded-lg p-4">
                  <ReadOnlyField label="Service Applied For" value={application.arrearPaymentDetails.serviceAppliedFor || 'N/A'} />
                  <ReadOnlyField label="Payment Date" value={application.arrearPaymentDetails.paymentDate || 'N/A'} />
                  <ReadOnlyField label="Order No" value={application.arrearPaymentDetails.orderNo || 'N/A'} />
                  <ReadOnlyField label="Transaction No" value={application.arrearPaymentDetails.transactionNo || 'N/A'} />
                  <ReadOnlyField label="Payment Status" value={application.arrearPaymentDetails.paymentStatus || 'N/A'} />
                  <ReadOnlyField label="Amount Paid" value={application.arrearPaymentDetails.amountPaid !== undefined ? 'Rs. ' + application.arrearPaymentDetails.amountPaid : 'N/A'} />
                </div>
              </div>
            </>
          )}

          {/* Declaration */}
          {application.declarationAccepted && (
            <>
              <SectionDivider />
              <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-['Poppins',sans-serif] text-[14px] font-medium text-green-800">
                    Declaration accepted: The applicant has declared that all information provided is true and accurate.
                  </p>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ======================= COMMENTS & HISTORY ======================= */}
      {(() => {
        const remarkEntries: RemarkEntry[] = [];
        const cwComment = caseworkerWorkflow && caseworkerWorkflow.comments ? caseworkerWorkflow.comments : (application.caseworkerComments || '');
        if (cwComment) {
          remarkEntries.push({ role: 'Caseworker', comment: cwComment, timestamp: caseworkerWorkflow && caseworkerWorkflow.timestamp ? caseworkerWorkflow.timestamp : '' });
        }
        if (revenueOfficerWorkflow) {
          const roComment = revenueOfficerWorkflow.comments || (application.revenueOfficerComments || '');
          if (roComment) {
            remarkEntries.push({ role: 'Revenue Officer', comment: roComment, timestamp: revenueOfficerWorkflow.timestamp || '' });
          }
        }
        return remarkEntries.length > 0 ? (
          <div className="mb-6">
            <RemarksTimeline remarks={remarkEntries} title="Comments & History" />
          </div>
        ) : null;
      })()}

      {/* ======================= FIELD ENGINEER ACTION ======================= */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6 overflow-visible">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
          Field Engineer Review &amp; Assignment
        </h2>

        {forwarded ? (
          /* Already Forwarded Banner */
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
                  This application has been forwarded to {forwardedTo}{forwardedAt ? ' on ' + formatDate(forwardedAt) : ''}
                </p>
              </div>
            </div>
            {application.fieldEngineerComments && (
              <div className="mt-2 pt-3 border-t border-[#a5d6a7]">
                <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#2e7d32] mb-1">Your Comments</p>
                <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141] bg-white rounded-[6px] p-3 border border-[#c8e6c9]">
                  {application.fieldEngineerComments}
                </p>
              </div>
            )}
            {application.fieldEngineerAssignedPlumber && (
              <div className="mt-3 pt-3 border-t border-[#a5d6a7]">
                <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#2e7d32] mb-1">Assigned Plumber</p>
                <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                  {application.fieldEngineerAssignedPlumber}
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ---- Plumber License Assignment ---- */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif] mb-3">
                Plumber License Assignment
              </h3>
              
              {/* Plumber License No Dropdown */}
              <div className="flex flex-col gap-[9px] mb-4">
                <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
                  <span>Plumber License No </span>
                  <span className="text-[#ff0c10]">*</span>
                </p>
                <div className="bg-white relative rounded-[12px]">
                  <div className="absolute border border-[#d3d8ff] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)] -z-[1]" />
                  <select
                    value={selectedPlumberLicense}
                    onChange={(e) => setSelectedPlumberLicense(e.target.value)}
                    className="w-[50%] px-[12px] py-[11px] bg-transparent font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none rounded-[12px] relative z-[1] appearance-none cursor-pointer border border-[#d0d0d0]"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23170f49\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                  >
                    <option value="">-- Select Plumber License --</option>
                    {loadingPlumbers ? (
                      <option value="__none__" disabled>Loading plumbers...</option>
                    ) : plumberLicenses.length === 0 ? (
                      <option value="__none__" disabled>No approved plumbers found</option>
                    ) : (
                      plumberLicenses.map((plumber) => (
                        <option key={plumber.applicationNo} value={plumber.applicationNo}>
                          {plumber.applicationNo}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Plumber Details - Auto-populated when plumber is selected */}
              {selectedPlumber && (
                <div className="mb-4">
                  <p className="font-['Poppins',sans-serif] font-semibold text-[14px] text-[#1f3a5f] mb-3">
                    Plumber Details:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-x-[24px] gap-y-[12px] bg-[#f0f7ff] rounded-lg p-4 border border-[#b8d4f0]">
                    <div className="flex flex-col gap-1">
                      <p className="font-['Poppins',sans-serif] font-medium text-[12px] text-[#888]">
                        Plumber Name<span className="text-[#ff0c10]">*</span>
                      </p>
                      <p className="font-['Poppins',sans-serif] text-[14px] text-[#170f49] font-medium bg-white rounded px-2 py-1.5 border border-[#d0d0d0]">
                        {selectedPlumber.plumberName}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="font-['Poppins',sans-serif] font-medium text-[12px] text-[#888]">
                        License Number<span className="text-[#ff0c10]">*</span>
                      </p>
                      <p className="font-['Poppins',sans-serif] text-[14px] text-[#170f49] font-medium bg-white rounded px-2 py-1.5 border border-[#d0d0d0]">
                        {selectedPlumber.applicationNo}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="font-['Poppins',sans-serif] font-medium text-[12px] text-[#888]">
                        Licensed Date<span className="text-[#ff0c10]">*</span>
                      </p>
                      <p className="font-['Poppins',sans-serif] text-[14px] text-[#170f49] font-medium bg-white rounded px-2 py-1.5 border border-[#d0d0d0]">
                        {selectedPlumber.licensedDate || 'N/A'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="font-['Poppins',sans-serif] font-medium text-[12px] text-[#888]">
                        License Expiry Date<span className="text-[#ff0c10]">*</span>
                      </p>
                      <p className="font-['Poppins',sans-serif] text-[14px] text-[#170f49] font-medium bg-white rounded px-2 py-1.5 border border-[#d0d0d0]">
                        {selectedPlumber.expiryDate || 'N/A'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="font-['Poppins',sans-serif] font-medium text-[12px] text-[#888]">
                        Mobile Number<span className="text-[#ff0c10]">*</span>
                      </p>
                      <p className="font-['Poppins',sans-serif] text-[14px] text-[#170f49] font-medium bg-white rounded px-2 py-1.5 border border-[#d0d0d0]">
                        {selectedPlumber.mobile}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <SectionDivider />

            {/* ---- Set Field Visit Details ---- */}
            <div className="mt-6 mb-6">
              <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif] mb-3">
                Set Field Visit Details:
              </h3>
              
              {/* Site Visit Question */}
              <div className="flex flex-col gap-[9px] mb-4">
                <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
                  <span>Do you want to visit site? </span>
                  <span className="text-[#ff0c10]">*</span>
                </p>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="siteVisitChangeConn"
                      value="yes"
                      checked={wantsSiteVisit === 'yes'}
                      onChange={(e) => setWantsSiteVisit(e.target.value)}
                      className="w-[18px] h-[18px] accent-[#1f3a5f] cursor-pointer"
                    />
                    <span className="font-['Poppins',sans-serif] text-[14px] text-[#170f49]">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="siteVisitChangeConn"
                      value="no"
                      checked={wantsSiteVisit === 'no'}
                      onChange={(e) => setWantsSiteVisit(e.target.value)}
                      className="w-[18px] h-[18px] accent-[#1f3a5f] cursor-pointer"
                    />
                    <span className="font-['Poppins',sans-serif] text-[14px] text-[#170f49]">No</span>
                  </label>
                </div>
              </div>

              {/* If Yes: Show inline date picker + Schedule Visit button */}
              {wantsSiteVisit === 'yes' && (
                <div className="mt-4">
                  {/* Not yet scheduled: show date picker + Schedule Visit */}
                  {!visitScheduled && !hasFieldVisitReport && (
                    <div className="flex flex-col gap-[12px]">
                      <div className="flex flex-col gap-[9px]">
                        <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
                          <span>Visit Date </span>
                          <span className="text-[#ff0c10]">*</span>
                        </p>
                        <div className="w-[260px] relative z-[100]">
                          <DatePicker
                            selected={scheduleDate}
                            onChange={(date) => setScheduleDate(date as Date)}
                            className="w-full h-[40px] px-[12px] py-[8px] bg-white font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none rounded-[8px] border border-[#d0d0d0] shadow-[0px_1px_3px_0px_rgba(19,18,66,0.07)]"
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Select visit date"
                            minDate={new Date()}
                            popperPlacement="bottom-start"
                            popperModifiers={[
                              {
                                name: 'preventOverflow',
                                options: {
                                  boundary: 'viewport',
                                  altAxis: true,
                                  padding: 8,
                                },
                              },
                              {
                                name: 'flip',
                                options: {
                                  fallbackPlacements: ['top-start', 'top-end', 'bottom-end'],
                                },
                              },
                            ]}
                          />
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={handleScheduleVisit}
                          disabled={scheduling || !scheduleDate || !selectedPlumberLicense}
                          className="px-6 py-2.5 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-[#27548a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {scheduling && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          )}
                          <Calendar className="w-4 h-4" />
                          {scheduling ? 'Scheduling...' : 'Schedule Visit'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Visit already scheduled, awaiting mobile inspection */}
                  {visitScheduled && !hasFieldVisitReport && (
                    <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                            <Calendar className="w-3.5 h-3.5" />
                            Awaiting Site Visit
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-3 font-['Poppins',sans-serif]">
                        The site visit has been pushed to the mobile app. Complete the inspection and submit the report.
                      </p>
                    </div>
                  )}

                  {/* Field Report Available Banner */}
                  {hasFieldVisitReport && (
                    <div className="bg-green-50 rounded-lg border border-green-200 p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-['Poppins',sans-serif] font-semibold text-[14px] text-green-800">
                            Field Inspection Report Submitted
                          </p>
                          <p className="font-['Poppins',sans-serif] text-[12px] text-green-700">
                            The field visit report is available. You can now forward this application to the Commissioner.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* View Field Report button (only when report exists) */}
                  {hasFieldVisitReport && (
                    <div className="mt-2">
                      <button
                        onClick={() => setShowFieldReport(true)}
                        className="px-6 py-2.5 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-[#27548a] transition-all flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Field Report
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* If No: Informational message */}
              {wantsSiteVisit === 'no' && (
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mt-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-['Poppins',sans-serif] text-[14px] text-blue-800">
                      Site visit will be skipped. The application will be forwarded directly to the Commissioner without a field inspection report.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <SectionDivider />

            {/* ---- Comments ---- */}
            <div className="flex flex-col gap-[9px] mt-6 mb-6">
              <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
                <span>Comments </span>
                <span className="text-[#ff0c10]">*</span>
              </p>
              <div className="bg-white relative rounded-[12px]">
                <div className="absolute border border-[#d3d8ff] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)] -z-[1]" />
                <textarea
                  value={fieldEngineerComment}
                  onChange={(e) => setFieldEngineerComment(e.target.value)}
                  className="w-full h-[80px] px-[12px] py-[11px] bg-transparent font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none rounded-[12px] resize-none relative z-[1] border border-[#d0d0d0]"
                  placeholder="Enter your comments for the Commissioner..."
                />
              </div>
            </div>

            {/* Forward Button */}
            <div className="flex items-center justify-end pt-4">
              <button
                onClick={handleForward}
                disabled={processing || !canForward}
                className="px-8 py-3 bg-[#0078a0] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#006b8f] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {processing ? 'Processing...' : 'Forward to Commissioner'}
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
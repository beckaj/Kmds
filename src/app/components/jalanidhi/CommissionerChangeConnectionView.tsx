import { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, XCircle, RotateCcw, Shield, FileText, Download, Eye, MapPin } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface CommissionerChangeConnectionViewProps {
  applicationId: string;
  onBack: () => void;
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

function SectionDivider() {
  return <div className="w-full border-t border-[#dee2e6]" />;
}

export default function CommissionerChangeConnectionView({ applicationId, onBack }: CommissionerChangeConnectionViewProps) {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [commissionerRemarks, setCommissionerRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [sendBackTo, setSendBackTo] = useState('Field Engineer');
  const [activeAction, setActiveAction] = useState<'approve' | 'sendBack' | 'reject' | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);
  const [completedAction, setCompletedAction] = useState('');
  const [endorsementData, setEndorsementData] = useState<any>(null);
  const [showEndorsementLetter, setShowEndorsementLetter] = useState(false);
  const [showFieldReport, setShowFieldReport] = useState(false);

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      console.log('[COMMISSIONER CC VIEW] Loading application:', applicationId);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/application/${encodeURIComponent(applicationId)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('[COMMISSIONER CC VIEW] API Error:', response.statusText);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[COMMISSIONER CC VIEW] Application loaded:', data);

      if (data.success && data.application) {
        setApplication(data.application);

        // Check if already processed
        const commWf = data.application.workflow && data.application.workflow.commissioner;
        if (commWf && (commWf.status === 'approved' || commWf.status === 'rejected' || commWf.status === 'sent_back')) {
          setActionCompleted(true);
          if (commWf.status === 'approved') {
            setCompletedAction('approved');
          } else if (commWf.status === 'rejected') {
            setCompletedAction('rejected');
            if (data.application.endorsementLetter) {
              setEndorsementData(data.application.endorsementLetter);
            }
          } else if (commWf.status === 'sent_back') {
            setCompletedAction('sent_back');
          }
        }
        if (data.application.status === 'sentToCitizenForPayment') {
          setActionCompleted(true);
          setCompletedAction('approved');
        }
      } else {
        console.error('[COMMISSIONER CC VIEW] Error:', data.error);
      }
    } catch (error) {
      console.error('[COMMISSIONER CC VIEW] Error loading application:', error);
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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleActionClick = (action: 'approve' | 'sendBack' | 'reject') => {
    if (!commissionerRemarks.trim()) {
      alert('Please enter your remarks before proceeding.');
      return;
    }
    if (commissionerRemarks.trim().length < 10) {
      alert('Remarks must be at least 10 characters.');
      return;
    }
    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    setActiveAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!activeAction) return;
    setShowConfirmModal(false);
    setProcessing(true);

    try {
      let endpoint = '';
      const body: any = { applicationId: application.id, remarks: commissionerRemarks };

      if (activeAction === 'approve') {
        endpoint = '/commissioner/change-connection/approve';
      } else if (activeAction === 'sendBack') {
        endpoint = '/commissioner/change-connection/send-back';
        body.sendBackTo = sendBackTo;
      } else if (activeAction === 'reject') {
        endpoint = '/commissioner/change-connection/reject';
        body.rejectionReason = rejectionReason;
      }

      console.log(`[COMMISSIONER CC] ${activeAction} change-connection:`, body);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log(`[COMMISSIONER CC] ${activeAction} successful:`, data);
        setActionCompleted(true);

        if (activeAction === 'approve') {
          setCompletedAction('approved');
          alert(`Application ${application.id} approved and sent to citizen for payment.`);
        } else if (activeAction === 'sendBack') {
          setCompletedAction('sent_back');
          alert(`Application ${application.id} sent back to ${sendBackTo} for corrections.`);
        } else if (activeAction === 'reject') {
          setCompletedAction('rejected');
          if (data.endorsementNo) {
            setEndorsementData({
              endorsementNo: data.endorsementNo,
              applicantName: application.rrData && application.rrData.ownerName ? application.rrData.ownerName : 'N/A',
              applicationId: application.id,
              rrNumber: application.rrNumber || 'N/A',
              existingConnectionType: application.existingConnectionType || 'N/A',
              newConnectionType: application.newConnectionType || 'N/A',
              rejectionReason: rejectionReason,
              commissionerRemarks: commissionerRemarks,
              generatedAt: new Date().toISOString(),
              dscSigned: true,
              dscSignedAt: new Date().toISOString()
            });
          }
          alert(`Application ${application.id} rejected. Endorsement letter generated with DSC sign.`);
        }

        // Reload application data
        await loadApplication();
      } else {
        console.error(`[COMMISSIONER CC] ${activeAction} failed:`, data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(`[COMMISSIONER CC] Error during ${activeAction}:`, error);
      alert(`Error processing request: ${error}`);
    } finally {
      setProcessing(false);
      setActiveAction(null);
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
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <p className="text-red-600 font-['Poppins',sans-serif]">Application not found</p>
      </div>
    );
  }

  // Helpers for application data
  const rrData = application.rrData || {};
  const arrears = application.arrearDetails;
  const caseworkerWorkflow = application.workflow && application.workflow.caseworker ? application.workflow.caseworker : null;
  const revenueOfficerWorkflow = application.workflow && application.workflow.revenueOfficer ? application.workflow.revenueOfficer : null;
  const fieldEngineerWorkflow = application.workflow && application.workflow.fieldEngineer ? application.workflow.fieldEngineer : null;
  const commissionerWorkflow = application.workflow && application.workflow.commissioner ? application.workflow.commissioner : null;
  const fieldVisitReport = application.fieldVisitReport || null;

  // Endorsement Letter Modal
  if (showEndorsementLetter && endorsementData) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        <button
          onClick={() => setShowEndorsementLetter(false)}
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Application
        </button>

        <div className="bg-white rounded-lg shadow-lg max-w-[800px] mx-auto p-10">
          {/* Letter Header */}
          <div className="text-center border-b-2 border-[#1f3a5f] pb-6 mb-6">
            <h1 className="text-[22px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] uppercase tracking-wide">
              Department of Municipal Administration
            </h1>
            <h2 className="text-[16px] font-semibold text-[#414141] font-['Poppins',sans-serif] mt-1">
              Government of Karnataka
            </h2>
            <p className="text-[14px] text-gray-600 font-['Poppins',sans-serif] mt-2">
              Jalanidhi - Water Supply Management System
            </p>
            <div className="mt-4 bg-red-50 border border-red-300 rounded-md px-4 py-2 inline-block">
              <p className="text-red-700 font-bold text-[16px] font-['Poppins',sans-serif]">
                ENDORSEMENT LETTER - REJECTION ORDER
              </p>
            </div>
          </div>

          {/* Letter Details */}
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">Endorsement No.</p>
                <p className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                  {endorsementData.endorsementNo}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">Date</p>
                <p className="text-[15px] font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  {formatDate(endorsementData.generatedAt)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">Application ID</p>
                <p className="text-[15px] font-medium text-[#414141] font-['Poppins',sans-serif]">
                  {endorsementData.applicationId}
                </p>
              </div>
              <div>
                <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">RR Number</p>
                <p className="text-[15px] font-medium text-[#414141] font-['Poppins',sans-serif]">
                  {endorsementData.rrNumber}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">Existing Connection Type</p>
                <p className="text-[15px] font-medium text-[#414141] font-['Poppins',sans-serif]">
                  {endorsementData.existingConnectionType}
                </p>
              </div>
              <div>
                <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">Requested New Type</p>
                <p className="text-[15px] font-medium text-[#414141] font-['Poppins',sans-serif]">
                  {endorsementData.newConnectionType}
                </p>
              </div>
            </div>
          </div>

          <SectionDivider />

          {/* Letter Body */}
          <div className="my-6 space-y-4">
            <p className="text-[14px] text-[#414141] font-['Poppins',sans-serif] leading-relaxed">
              <span className="font-semibold">To,</span><br />
              <span className="font-medium">{endorsementData.applicantName}</span><br />
              {rrData.address || 'Address on record'}
            </p>

            <p className="text-[14px] text-[#414141] font-['Poppins',sans-serif] leading-relaxed mt-4">
              <span className="font-semibold">Subject:</span> Rejection of Change of Connection Type Application - {endorsementData.applicationId}
            </p>

            <p className="text-[14px] text-[#414141] font-['Poppins',sans-serif] leading-relaxed mt-4">
              Dear Sir/Madam,
            </p>

            <p className="text-[14px] text-[#414141] font-['Poppins',sans-serif] leading-relaxed">
              With reference to your application for Change of Connection Type bearing Application ID: <span className="font-semibold">{endorsementData.applicationId}</span> and RR Number: <span className="font-semibold">{endorsementData.rrNumber}</span>, requesting change from <span className="font-semibold">{endorsementData.existingConnectionType}</span> to <span className="font-semibold">{endorsementData.newConnectionType}</span>, it is to inform you that after due verification and review by the concerned authorities, your application has been <span className="font-bold text-red-700">REJECTED</span> for the following reason(s):
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-[13px] font-semibold text-red-800 font-['Poppins',sans-serif] mb-2">
                Reason for Rejection:
              </p>
              <p className="text-[14px] text-red-700 font-['Poppins',sans-serif] leading-relaxed">
                {endorsementData.rejectionReason}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
              <p className="text-[13px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">
                Commissioner's Remarks:
              </p>
              <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">
                {endorsementData.commissionerRemarks}
              </p>
            </div>

            <p className="text-[14px] text-[#414141] font-['Poppins',sans-serif] leading-relaxed mt-4">
              You may re-apply after addressing the above concerns. For any queries, please contact the Municipal Administration office during working hours.
            </p>
          </div>

          <SectionDivider />

          {/* DSC Section */}
          <div className="mt-6 flex justify-between items-end">
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                This is a digitally signed document.
              </p>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                No physical signature required.
              </p>
            </div>
            <div className="text-right">
              <div className="border-2 border-[#1f3a5f] rounded-lg p-4 bg-blue-50 inline-block">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-[#1f3a5f]" />
                  <span className="text-[13px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                    Digitally Signed
                  </span>
                </div>
                <p className="text-[12px] text-[#414141] font-['Poppins',sans-serif]">
                  Commissioner / Chief Officer
                </p>
                <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">
                  DSC Signed: {formatDateTime(endorsementData.dscSignedAt)}
                </p>
                <p className="text-[11px] text-green-600 font-['Poppins',sans-serif] font-semibold mt-1">
                  Signature Valid
                </p>
              </div>
            </div>
          </div>

          {/* Print / Download */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-[#2d4a6f] transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download / Print
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Field Visit Report inline view
  if (showFieldReport && fieldVisitReport) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        <button
          onClick={() => setShowFieldReport(false)}
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Application
        </button>

        <div className="mb-6">
          <h1 className="text-[24px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
            Field Inspection Report
          </h1>
          <p className="text-gray-600 font-['Poppins',sans-serif]">
            Application ID: <span className="font-semibold">{application.id}</span>
          </p>
        </div>

        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
          {/* Location Verification */}
          {fieldVisitReport.locationVerification && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-[#1f3a5f]" />
                <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  Location Verification
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[16px] bg-gray-50 rounded-lg p-4">
                <ReadOnlyField label="Verified By" value={fieldVisitReport.engineerName} />
                <ReadOnlyField label="Address" value={fieldVisitReport.locationVerification.address} />
                <ReadOnlyField label="Status" value={fieldVisitReport.locationVerification.verified ? 'Verified' : 'Not Verified'} />
                <ReadOnlyField label="Latitude" value={fieldVisitReport.locationVerification.latitude} />
                <ReadOnlyField label="Longitude" value={fieldVisitReport.locationVerification.longitude} />
                <ReadOnlyField label="Verified At" value={fieldVisitReport.locationVerification.verifiedAt ? formatDateTime(fieldVisitReport.locationVerification.verifiedAt) : 'N/A'} />
              </div>
            </div>
          )}

          <SectionDivider />

          {/* Site Observations */}
          {fieldVisitReport.siteObservations && (
            <div className="my-6">
              <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-3">
                Site Observations
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-[14px] text-gray-900 font-['Poppins',sans-serif] leading-relaxed">
                  {fieldVisitReport.siteObservations}
                </p>
              </div>
            </div>
          )}

          {/* Engineer Remarks */}
          {fieldVisitReport.engineerRemarks && (
            <div className="mb-6">
              <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-3">
                Engineer Remarks
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-[14px] text-gray-900 font-['Poppins',sans-serif] leading-relaxed">
                  {fieldVisitReport.engineerRemarks}
                </p>
              </div>
            </div>
          )}

          {/* Inspection Checklist */}
          {fieldVisitReport.inspectionChecklist && fieldVisitReport.inspectionChecklist.length > 0 && (
            <div className="mb-6">
              <SectionDivider />
              <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mt-6 mb-3">
                Inspection Checklist
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fieldVisitReport.inspectionChecklist.map((item: any, index: number) => (
                  <div
                    key={item && item.id ? item.id : 'chk-' + index}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      item && item.checked
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {item && item.checked ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <p className={`text-[13px] font-['Poppins',sans-serif] ${
                      item && item.checked ? 'text-green-800 font-medium' : 'text-gray-500'
                    }`}>
                      {item && item.label ? item.label : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Site Photos */}
          {fieldVisitReport.photos && fieldVisitReport.photos.length > 0 && (
            <div className="mb-6">
              <SectionDivider />
              <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mt-6 mb-3">
                Site Photos ({fieldVisitReport.photos.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fieldVisitReport.photos.map((photo: string, index: number) => (
                  <div key={index} className="border-2 border-blue-300 rounded-lg overflow-hidden bg-white shadow-md">
                    <img
                      src={photo}
                      alt={`Site Photo ${index + 1}`}
                      className="w-full h-[250px] object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
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

      {/* ========================= CITIZEN APPLICATION DETAILS ========================= */}
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

      {/* ========================= DEPARTMENT REVIEW (CONSOLIDATED) ========================= */}
      {(caseworkerWorkflow || revenueOfficerWorkflow || fieldEngineerWorkflow) && (
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5">
            Department Review
          </h2>
          <div className="space-y-0">
            {/* ---- Caseworker ---- */}
            {caseworkerWorkflow && (
              <div className="border-l-4 border-[#42a5f5] bg-white rounded-r-lg p-5 mb-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#e3f2fd] text-[#1565c0] font-['Poppins',sans-serif] font-bold text-[12px]">C</span>
                  <h3 className="font-['Poppins',sans-serif] font-semibold text-[15px] text-[#1f3a5f]">Caseworker</h3>
                  {caseworkerWorkflow.timestamp && (
                    <span className="ml-auto text-[12px] text-gray-400 font-['Poppins',sans-serif]">{formatDate(caseworkerWorkflow.timestamp)}</span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[12px]">
                  <ReadOnlyField label="Reviewed By" value={caseworkerWorkflow.name || 'Caseworker'} />
                  <ReadOnlyField label="Forwarded To" value={caseworkerWorkflow.forwardedTo || 'Revenue Officer'} />
                  <ReadOnlyField label="Forwarded At" value={caseworkerWorkflow.timestamp ? formatDate(caseworkerWorkflow.timestamp) : 'N/A'} />
                </div>
                {(caseworkerWorkflow.comments || application.caseworkerComments) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="font-['Poppins',sans-serif] font-medium text-[13px] text-[#170f49] mb-1">Comments</p>
                    <p className="font-['Poppins',sans-serif] text-[13px] text-[#414141] bg-[#f0f7ff] rounded-[6px] p-3 border border-[#b8d4f0]">
                      {caseworkerWorkflow.comments || application.caseworkerComments || 'No comments provided'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ---- Revenue Officer ---- */}
            {revenueOfficerWorkflow && (
              <div className="border-l-4 border-[#ffa726] bg-white rounded-r-lg p-5 mb-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#eef2f7] text-[#1f3a5f] font-['Poppins',sans-serif] font-bold text-[12px]">R</span>
                  <h3 className="font-['Poppins',sans-serif] font-semibold text-[15px] text-[#1f3a5f]">Revenue Officer</h3>
                  {revenueOfficerWorkflow.timestamp && (
                    <span className="ml-auto text-[12px] text-gray-400 font-['Poppins',sans-serif]">{formatDate(revenueOfficerWorkflow.timestamp)}</span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[12px]">
                  <ReadOnlyField label="Reviewed By" value={revenueOfficerWorkflow.name || 'Revenue Officer'} />
                  <ReadOnlyField label="Forwarded To" value={revenueOfficerWorkflow.forwardedTo || 'Field Engineer'} />
                  <ReadOnlyField label="Forwarded At" value={revenueOfficerWorkflow.timestamp ? formatDate(revenueOfficerWorkflow.timestamp) : 'N/A'} />
                </div>
                {(revenueOfficerWorkflow.comments || application.revenueOfficerComments) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="font-['Poppins',sans-serif] font-medium text-[13px] text-[#170f49] mb-1">Comments</p>
                    <p className="font-['Poppins',sans-serif] text-[13px] text-[#414141] bg-[#eef2f7] rounded-[6px] p-3 border border-[#c5d5e8]">
                      {revenueOfficerWorkflow.comments || application.revenueOfficerComments || 'No comments provided'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ---- Field Engineer ---- */}
            {fieldEngineerWorkflow && (
              <div className="border-l-4 border-[#66bb6a] bg-white rounded-r-lg p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#e8f5e9] text-[#2e7d32] font-['Poppins',sans-serif] font-bold text-[12px]">F</span>
                  <h3 className="font-['Poppins',sans-serif] font-semibold text-[15px] text-[#1f3a5f]">Field Engineer</h3>
                  {fieldEngineerWorkflow.timestamp && (
                    <span className="ml-auto text-[12px] text-gray-400 font-['Poppins',sans-serif]">{formatDate(fieldEngineerWorkflow.timestamp)}</span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[12px]">
                  <ReadOnlyField label="Reviewed By" value={fieldEngineerWorkflow.name || 'Field Engineer'} />
                  <ReadOnlyField label="Forwarded To" value={fieldEngineerWorkflow.forwardedTo || 'Commissioner'} />
                  <ReadOnlyField label="Forwarded At" value={fieldEngineerWorkflow.timestamp ? formatDate(fieldEngineerWorkflow.timestamp) : 'N/A'} />
                </div>

                {/* Assigned Plumber & Site Visit in a sub-grid */}
                {((application.fieldEngineerAssignedPlumber || (fieldEngineerWorkflow && fieldEngineerWorkflow.assignedPlumber)) || (application.fieldEngineerWantsSiteVisit || (fieldEngineerWorkflow && fieldEngineerWorkflow.wantsSiteVisit))) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[12px]">
                      {(application.fieldEngineerAssignedPlumber || (fieldEngineerWorkflow && fieldEngineerWorkflow.assignedPlumber)) && (
                        <ReadOnlyField label="Assigned Plumber" value={application.fieldEngineerAssignedPlumber || (fieldEngineerWorkflow && fieldEngineerWorkflow.assignedPlumber) || 'N/A'} />
                      )}
                      {(application.fieldEngineerWantsSiteVisit || (fieldEngineerWorkflow && fieldEngineerWorkflow.wantsSiteVisit)) && (
                        <ReadOnlyField label="Site Visit" value={(application.fieldEngineerWantsSiteVisit === 'yes' || (fieldEngineerWorkflow && fieldEngineerWorkflow.wantsSiteVisit === 'yes')) ? 'Yes - Site visit was conducted' : 'No - Direct forwarding'} />
                      )}
                    </div>
                  </div>
                )}

                {/* Field Engineer Comments */}
                {(fieldEngineerWorkflow.comments || application.fieldEngineerComments) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="font-['Poppins',sans-serif] font-medium text-[13px] text-[#170f49] mb-1">Comments</p>
                    <p className="font-['Poppins',sans-serif] text-[13px] text-[#414141] bg-[#e8f5e9] rounded-[6px] p-3 border border-[#a5d6a7]">
                      {fieldEngineerWorkflow.comments || application.fieldEngineerComments || 'No comments provided'}
                    </p>
                  </div>
                )}

                {/* View Field Visit Report button */}
                {fieldVisitReport && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setShowFieldReport(true)}
                      className="px-4 py-2 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-medium text-[13px] hover:bg-[#2d4a6f] transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Field Inspection Report
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================= CONSOLIDATED REMARKS ========================= */}
      {(() => {
        const remarkEntries: RemarkEntry[] = [];
        const cwComment = caseworkerWorkflow && caseworkerWorkflow.comments ? caseworkerWorkflow.comments : (application.caseworkerComments || '');
        if (cwComment) {
          remarkEntries.push({ role: 'Caseworker', comment: cwComment, timestamp: caseworkerWorkflow && caseworkerWorkflow.timestamp ? caseworkerWorkflow.timestamp : '' });
        }
        const roComment = revenueOfficerWorkflow && revenueOfficerWorkflow.comments ? revenueOfficerWorkflow.comments : (application.revenueOfficerComments || '');
        if (roComment) {
          remarkEntries.push({ role: 'Revenue Officer', comment: roComment, timestamp: revenueOfficerWorkflow && revenueOfficerWorkflow.timestamp ? revenueOfficerWorkflow.timestamp : '' });
        }
        const feComment = fieldEngineerWorkflow && fieldEngineerWorkflow.comments ? fieldEngineerWorkflow.comments : (application.fieldEngineerComments || '');
        if (feComment) {
          remarkEntries.push({ role: 'Field Engineer', comment: feComment, timestamp: fieldEngineerWorkflow && fieldEngineerWorkflow.timestamp ? fieldEngineerWorkflow.timestamp : '' });
        }
        if (commissionerWorkflow && commissionerWorkflow.remarks) {
          remarkEntries.push({ role: 'Commissioner', comment: commissionerWorkflow.remarks, timestamp: commissionerWorkflow.timestamp || '', variant: commissionerWorkflow.status === 'approved' ? 'approved' : commissionerWorkflow.status === 'rejected' ? 'rejected' : commissionerWorkflow.status === 'sent_back' ? 'sent_back' : 'default' });
        }
        return remarkEntries.length > 0 ? (
          <div className="mb-6">
            <RemarksTimeline remarks={remarkEntries} title="Consolidated Remarks Timeline" />
          </div>
        ) : null;
      })()}

      {/* ========================= COMMISSIONER DECISION CARD ========================= */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-6">
          Commissioner's Decision
        </h2>

        {actionCompleted ? (
          /* ---- ALREADY PROCESSED ---- */
          <div>
            {completedAction === 'approved' && (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#4caf50] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-['Poppins',sans-serif] font-bold text-[18px] text-[#2e7d32]">
                      Application Approved
                    </p>
                    <p className="font-['Poppins',sans-serif] text-[14px] text-[#558b2f]">
                      Application has been approved and sent to citizen for payment
                    </p>
                  </div>
                </div>
                {commissionerWorkflow && commissionerWorkflow.remarks && (
                  <div className="mt-3 pt-3 border-t border-green-300">
                    <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#2e7d32] mb-1">Commissioner's Remarks</p>
                    <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141] bg-white rounded-[6px] p-3 border border-[#c8e6c9]">
                      {commissionerWorkflow.remarks}
                    </p>
                  </div>
                )}
                {commissionerWorkflow && commissionerWorkflow.approvedAt && (
                  <p className="text-[13px] text-[#558b2f] font-['Poppins',sans-serif] mt-3">
                    Approved on: {formatDateTime(commissionerWorkflow.approvedAt)}
                  </p>
                )}
              </div>
            )}

            {completedAction === 'sent_back' && (
              <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#1f3a5f] rounded-full flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-['Poppins',sans-serif] font-bold text-[18px] text-[#1f3a5f]">
                      Application Sent Back for Correction
                    </p>
                    <p className="font-['Poppins',sans-serif] text-[14px] text-[#364e6b]">
                      Sent back to: {commissionerWorkflow && commissionerWorkflow.sentBackTo ? commissionerWorkflow.sentBackTo : 'Field Engineer'}
                    </p>
                  </div>
                </div>
                {commissionerWorkflow && commissionerWorkflow.remarks && (
                  <div className="mt-3 pt-3 border-t border-orange-300">
                    <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#1f3a5f] mb-1">Commissioner's Remarks</p>
                    <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141] bg-white rounded-[6px] p-3 border border-orange-200">
                      {commissionerWorkflow.remarks}
                    </p>
                  </div>
                )}
                {commissionerWorkflow && commissionerWorkflow.sentBackAt && (
                  <p className="text-[13px] text-[#364e6b] font-['Poppins',sans-serif] mt-3">
                    Sent back on: {formatDateTime(commissionerWorkflow.sentBackAt)}
                  </p>
                )}
              </div>
            )}

            {completedAction === 'rejected' && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#d32f2f] rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-['Poppins',sans-serif] font-bold text-[18px] text-[#c62828]">
                      Application Rejected
                    </p>
                    <p className="font-['Poppins',sans-serif] text-[14px] text-[#b71c1c]">
                      Endorsement letter generated with DSC signature
                    </p>
                  </div>
                </div>
                {commissionerWorkflow && commissionerWorkflow.remarks && (
                  <div className="mt-3 pt-3 border-t border-red-300">
                    <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#c62828] mb-1">Commissioner's Remarks</p>
                    <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141] bg-white rounded-[6px] p-3 border border-red-200">
                      {commissionerWorkflow.remarks}
                    </p>
                  </div>
                )}
                {commissionerWorkflow && commissionerWorkflow.rejectionReason && (
                  <div className="mt-3 pt-3 border-t border-red-300">
                    <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#c62828] mb-1">Rejection Reason</p>
                    <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141] bg-white rounded-[6px] p-3 border border-red-200">
                      {commissionerWorkflow.rejectionReason}
                    </p>
                  </div>
                )}
                {commissionerWorkflow && commissionerWorkflow.endorsementNo && (
                  <div className="mt-4 flex items-center gap-3">
                    <p className="text-[13px] text-[#b71c1c] font-['Poppins',sans-serif]">
                      Endorsement No: <span className="font-semibold">{commissionerWorkflow.endorsementNo}</span>
                    </p>
                    <button
                      onClick={() => setShowEndorsementLetter(true)}
                      className="px-4 py-2 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-medium text-[13px] hover:bg-[#2d4a6f] transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View Endorsement Letter
                    </button>
                  </div>
                )}
                {endorsementData && !(commissionerWorkflow && commissionerWorkflow.endorsementNo) && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowEndorsementLetter(true)}
                      className="px-4 py-2 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-medium text-[13px] hover:bg-[#2d4a6f] transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View Endorsement Letter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ---- PENDING DECISION ---- */
          <div className="space-y-6">
            {/* Remarks */}
            <div>
              <label className="block text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-2">
                Remarks <span className="text-red-600">*</span>
              </label>
              <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-3">
                Provide your decision remarks (minimum 10 characters required)
              </p>
              <textarea
                value={commissionerRemarks}
                onChange={(e) => setCommissionerRemarks(e.target.value)}
                placeholder="Enter your remarks about the change of connection type application..."
                className="w-full min-h-[100px] px-4 py-3 font-['Poppins',sans-serif] text-[14px] text-[#170f49] border-2 border-[#1f3a5f] rounded-lg outline-none resize-vertical"
                rows={4}
              />
              <p className="text-xs text-gray-400 font-['Poppins',sans-serif] mt-1">
                Characters: {commissionerRemarks.length} (Min 10)
              </p>
            </div>

            {/* Rejection Reason (conditional) */}
            {activeAction === 'reject' && (
              <div>
                <label className="block text-base font-semibold text-red-700 font-['Poppins',sans-serif] mb-2">
                  Rejection Reason <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter the specific reason for rejecting this application..."
                  className="w-full min-h-[80px] px-4 py-3 font-['Poppins',sans-serif] text-[14px] text-[#170f49] border-2 border-red-400 rounded-lg outline-none resize-vertical"
                  rows={3}
                />
                {rejectionReason.trim() && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleActionClick('reject')}
                      disabled={processing}
                      className="px-6 py-2 bg-red-600 text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons — 2-row layout matching Figma */}
            <div className="pt-5 border-t border-gray-200 space-y-4">
              {/* Row 1: Send Back with dropdown */}
              <div className="flex items-center gap-3">
                <select
                  value={sendBackTo}
                  onChange={(e) => setSendBackTo(e.target.value)}
                  className="h-[42px] px-4 pr-8 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#414141] outline-none bg-white appearance-none cursor-pointer"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                >
                  <option value="Field Engineer">Field Engineer</option>
                  <option value="Revenue Officer">Revenue Officer</option>
                  <option value="Caseworker">Caseworker</option>
                </select>
                <button
                  onClick={() => handleActionClick('sendBack')}
                  disabled={processing}
                  className="h-[42px] px-6 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-[#2c5282] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Send Back
                </button>
              </div>

              {/* Row 2: Reject & Approve */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setActiveAction('reject');
                    if (commissionerRemarks.trim().length >= 10 && rejectionReason.trim()) {
                      handleActionClick('reject');
                    }
                  }}
                  disabled={processing}
                  className="h-[44px] px-6 bg-white border-2 border-red-600 text-red-600 rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <XCircle className="w-[18px] h-[18px]" />
                  Reject & Generate Endorsement
                </button>

                <button
                  onClick={() => handleActionClick('approve')}
                  disabled={processing}
                  className="h-[44px] px-8 bg-[#22c55e] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-[#16a34a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {processing && activeAction === 'approve' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  Approve & Allow Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================= CONFIRMATION MODAL ========================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-[480px] max-w-[90vw]">
            <div className="flex items-center gap-3 mb-4">
              {activeAction === 'approve' && <CheckCircle className="w-8 h-8 text-green-600" />}
              {activeAction === 'sendBack' && <RotateCcw className="w-8 h-8 text-orange-600" />}
              {activeAction === 'reject' && <XCircle className="w-8 h-8 text-red-600" />}
              <h2 className={`text-xl font-bold font-['Poppins',sans-serif] ${
                activeAction === 'approve' ? 'text-green-600' :
                activeAction === 'sendBack' ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {activeAction === 'approve' ? 'Confirm Approval' :
                 activeAction === 'sendBack' ? 'Confirm Send Back' :
                 'Confirm Rejection'}
              </h2>
            </div>

            <div className="space-y-3 mb-6">
              {activeAction === 'approve' && (
                <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                  Are you sure you want to <span className="font-bold text-green-700">approve</span> this change of connection type application? The citizen will be notified to make payment.
                </p>
              )}
              {activeAction === 'sendBack' && (
                <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                  Are you sure you want to <span className="font-bold text-orange-700">send back</span> this application to <span className="font-semibold">{sendBackTo}</span> for corrections?
                </p>
              )}
              {activeAction === 'reject' && (
                <>
                  <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                    Are you sure you want to <span className="font-bold text-red-700">reject</span> this change of connection type application? An endorsement letter with your digital signature will be generated and sent to the citizen.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-[12px] text-red-600 font-['Poppins',sans-serif]">
                      This action cannot be undone.
                    </p>
                  </div>
                </>
              )}

              <div className="bg-gray-50 rounded-md p-3 mt-3">
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Your Remarks:</p>
                <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">{commissionerRemarks}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setActiveAction(null);
                }}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={processing}
                className={`px-5 py-2 text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[14px] transition-colors disabled:opacity-50 ${
                  activeAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  activeAction === 'sendBack' ? 'bg-orange-600 hover:bg-orange-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing ? 'Processing...' :
                 activeAction === 'approve' ? 'Yes, Approve' :
                 activeAction === 'sendBack' ? 'Yes, Send Back' :
                 'Yes, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

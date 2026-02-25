import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, MapPin, Plug, IndianRupee, Gauge, User, CheckCircle,
  XCircle, RotateCcw, MessageSquare, Shield, FileText, Download, Printer, Send
} from 'lucide-react';
import { GovButton } from '../ui/gov-button';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface CommissionerLegacyDataReviewViewProps {
  applicationId: string;
  onBack: () => void;
}

export default function CommissionerLegacyDataReviewView({ applicationId, onBack }: CommissionerLegacyDataReviewViewProps) {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | 'send_back' | null>(null);
  const [showPermissionLetter, setShowPermissionLetter] = useState(false);
  const [letterData, setLetterData] = useState<any>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const [sendingToCitizen, setSendingToCitizen] = useState(false);
  const [sentToCitizen, setSentToCitizen] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      console.log('[COMMISSIONER LEGACY REVIEW] Fetching application:', applicationId);

      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/legacy-data/application/' + applicationId,
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + publicAnonKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      console.log('[COMMISSIONER LEGACY REVIEW] Response:', data);

      if (data.success && data.application) {
        setApplication(data.application);
        // If already actioned, show permission letter
        if (data.application.status === 'approved' && data.application.permissionLetter) {
          setShowPermissionLetter(true);
          setLetterData(data.application.permissionLetter);
        }
        // Check if already sent to citizen
        if (data.application.status === 'sent_to_citizen') {
          setShowPermissionLetter(true);
          setLetterData(data.application.permissionLetter);
          setSentToCitizen(true);
        }
      } else {
        setError(data.error || 'Application not found');
      }
    } catch (err) {
      console.error('[COMMISSIONER LEGACY REVIEW] Fetch error:', err);
      setError('Failed to load application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: 'approve' | 'reject' | 'send_back') => {
    if (!comments.trim() || comments.trim().length < 10) {
      alert('Please enter comments (minimum 10 characters) before proceeding.');
      return;
    }
    setPendingAction(action);
    setShowConfirmPopup(true);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    setShowConfirmPopup(false);
    setProcessing(true);

    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const commissionerName = userData && userData.name ? userData.name : 'Commissioner';
      const commissionerId = userData && userData.id ? userData.id : 'COM001';

      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/legacy-data/commissioner-action',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + publicAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId,
            action: pendingAction,
            comments: comments.trim(),
            commissionerName,
            commissionerId,
          }),
        }
      );

      const data = await response.json();
      console.log('[COMMISSIONER LEGACY REVIEW] Action response:', data);

      if (data.success) {
        if (pendingAction === 'approve') {
          setLetterData(data.permissionLetter);
          setShowPermissionLetter(true);
          // Re-fetch to get updated data
          await fetchApplication();
        } else if (pendingAction === 'reject') {
          alert('Application has been rejected.');
          onBack();
        } else if (pendingAction === 'send_back') {
          alert('Application has been sent back to Field Engineer for corrections.');
          onBack();
        }
      } else {
        console.error('[COMMISSIONER LEGACY REVIEW] Action error:', data.error);
        alert('Failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('[COMMISSIONER LEGACY REVIEW] Action error:', err);
      alert('Network error. Please try again.');
    } finally {
      setProcessing(false);
      setPendingAction(null);
    }
  };

  const handlePrint = () => {
    if (letterRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Permission Letter</title>');
        printWindow.document.write('<style>');
        printWindow.document.write('body { font-family: "Poppins", "Segoe UI", sans-serif; padding: 40px; color: #1a1a1a; }');
        printWindow.document.write('.letter-header { text-align: center; border-bottom: 3px double #1f3a5f; padding-bottom: 20px; margin-bottom: 20px; }');
        printWindow.document.write('.letter-header h1 { color: #1f3a5f; font-size: 18px; margin: 0; }');
        printWindow.document.write('.letter-header h2 { color: #333; font-size: 14px; margin: 4px 0; }');
        printWindow.document.write('.letter-body { line-height: 1.8; font-size: 13px; }');
        printWindow.document.write('.field-row { display: flex; margin-bottom: 4px; }');
        printWindow.document.write('.field-label { font-weight: 600; width: 200px; color: #555; }');
        printWindow.document.write('.field-value { color: #1a1a1a; }');
        printWindow.document.write('.dsc-block { border: 2px solid #1f3a5f; border-radius: 8px; padding: 16px; margin-top: 30px; background: #f8fafc; }');
        printWindow.document.write('.dsc-title { color: #1f3a5f; font-weight: 700; font-size: 14px; margin-bottom: 8px; }');
        printWindow.document.write('@media print { body { padding: 20px; } }');
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(letterRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const formatDateOnly = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const safe = (val: any) => (val !== null && val !== undefined && val !== '' ? val : 'N/A');

  const handleSendToCitizen = async () => {
    if (!confirm('Are you sure you want to send this permission letter to the applicant? The citizen will be able to view and download it from their Application Status page.')) return;

    setSendingToCitizen(true);
    try {
      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/legacy-data/send-to-citizen',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + publicAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ applicationId }),
        }
      );

      const data = await response.json();
      console.log('[COMMISSIONER LEGACY REVIEW] Send to citizen response:', data);

      if (data.success) {
        setSentToCitizen(true);
        alert('Permission letter has been sent to the applicant successfully! They can view it under Application Status.');
      } else {
        console.error('[COMMISSIONER LEGACY REVIEW] Send to citizen error:', data.error);
        alert('Failed to send: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('[COMMISSIONER LEGACY REVIEW] Send to citizen error:', err);
      alert('Network error while sending. Please try again.');
    } finally {
      setSendingToCitizen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-['Poppins',sans-serif]">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg font-['Poppins',sans-serif]">
          {error || 'Application not found'}
        </div>
      </div>
    );
  }

  const loc = application && application.locationDetails ? application.locationDetails : {};
  const conn = application && application.existingConnection ? application.existingConnection : {};
  const fin = application && application.financialDetails ? application.financialDetails : {};
  const bill = application && application.billingDetails ? application.billingDetails : {};
  const header = application && application.headerDetails ? application.headerDetails : {};
  const wf = application && application.workflow ? application.workflow : {};
  const cwDetails = wf && wf.caseworker ? wf.caseworker : {};
  const feDetails = wf && wf.fieldEngineer ? wf.fieldEngineer : {};
  const comDetails = wf && wf.commissioner ? wf.commissioner : {};
  const isActioned = application.status === 'approved' || application.status === 'rejected';
  const permLetter = application && application.permissionLetter ? application.permissionLetter : null;

  // Build remarks
  const remarks: RemarkEntry[] = [];
  if (cwDetails && cwDetails.name) {
    remarks.push({
      role: 'Caseworker',
      comment: 'Submitted legacy data entry for RR Number: ' + safe(conn.rrNumber),
      timestamp: cwDetails.timestamp || application.submittedAt || '',
    });
  }
  if (feDetails && feDetails.name) {
    remarks.push({
      role: 'Field Engineer',
      comment: feDetails.comments || 'Verified and forwarded',
      timestamp: feDetails.timestamp || '',
    });
  }
  if (comDetails && comDetails.name) {
    const variant = comDetails.status === 'approved' ? 'approved' : comDetails.status === 'rejected' ? 'rejected' : comDetails.status === 'sent_back' ? 'sent_back' : 'default';
    remarks.push({
      role: 'Commissioner',
      comment: comDetails.comments || '',
      timestamp: comDetails.timestamp || '',
      variant: variant as any,
    });
  }

  // Show Permission Letter
  if (showPermissionLetter && (permLetter || letterData)) {
    const pl = permLetter || letterData;
    return (
      <div className="p-6 max-w-[900px] mx-auto">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mb-4">
          <GovButton variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Print Letter
          </GovButton>
          <GovButton variant="primary" onClick={handlePrint}>
            <Download className="w-4 h-4" />
            Download PDF
          </GovButton>
        </div>

        {/* Permission Letter */}
        <div ref={letterRef} className="bg-white rounded-lg border-2 border-gray-300 shadow-lg p-10">
          {/* Letter Header */}
          <div className="text-center border-b-[3px] border-double border-[#1f3a5f] pb-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-[#1f3a5f]" />
              <div>
                <h1 className="text-[20px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] tracking-wide uppercase">
                  Government of Karnataka
                </h1>
                <h2 className="text-[16px] font-semibold text-gray-700 font-['Poppins',sans-serif]">
                  Department of Municipal Administration
                </h2>
              </div>
              <Shield className="w-8 h-8 text-[#1f3a5f]" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mt-2">
              JALANIDHI - Karnataka Municipal Data System (KMDS)
            </h3>
            <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mt-1">
              Legacy Data Process - Permission Letter
            </p>
          </div>

          {/* Letter Number & Date */}
          <div className="flex justify-between mb-8">
            <div>
              <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                <span className="font-semibold">Letter No:</span> {safe(pl.letterNumber)}
              </p>
              <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                <span className="font-semibold">Application ID:</span> {safe(application.id)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                <span className="font-semibold">Date:</span> {formatDateOnly(pl.generatedAt)}
              </p>
            </div>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <p className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Subject: Approval of Legacy Water Connection Data Entry
            </p>
          </div>

          {/* Body */}
          <div className="text-[13px] text-gray-800 font-['Poppins',sans-serif] leading-relaxed mb-8">
            <p className="mb-4">
              This is to certify that the legacy data entry for the following water connection has been verified by the Field Engineer and approved by the Commissioner. A new RR Number has been assigned as detailed below.
            </p>
          </div>

          {/* Details Section */}
          <div className="bg-[#f8fafc] border border-gray-200 rounded-lg p-6 mb-6">
            <h4 className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4 border-b border-gray-200 pb-2">
              Connection Details
            </h4>
            <div className="space-y-2.5">
              <LetterField label="Applicant Name" value={safe(loc.fullName)} />
              <LetterField label="Applicant Type" value={safe(application.applicantType)} />
              <LetterField label="Address" value={[safe(loc.houseDoorNo), safe(loc.street), safe(loc.address), safe(loc.city), safe(loc.district), safe(loc.state)].filter(v => v !== 'N/A').join(', ')} />
              <LetterField label="Ward Number" value={safe(loc.wardNumber)} />
              <LetterField label="Mobile No" value={safe(loc.mobileNo)} />
              <LetterField label="Old RR Number" value={safe(conn.rrNumber)} />
              <LetterField label="Connection Type" value={safe(conn.connectionType)} />
              <LetterField label="Meter Category" value={safe(conn.meterCategory)} />
              <LetterField label="Connection Status" value={safe(conn.connectionStatus)} />
            </div>
          </div>

          {/* New RR Number - Highlighted */}
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h4 className="text-[16px] font-bold text-green-800 font-['Poppins',sans-serif]">
                New RR Number Assigned
              </h4>
            </div>
            <p className="text-[22px] font-bold text-green-700 font-['Poppins',sans-serif] tracking-wider text-center py-3 bg-white rounded-md border border-green-200">
              {safe(pl.newRRNumber || application.newRRNumber)}
            </p>
          </div>

          {/* Financial Summary */}
          <div className="bg-[#f8fafc] border border-gray-200 rounded-lg p-6 mb-6">
            <h4 className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4 border-b border-gray-200 pb-2">
              Financial Summary (DCB)
            </h4>
            <div className="space-y-2.5">
              <LetterField label="Financial Year" value={safe(fin.currentFY)} />
              <LetterField label="Opening Balance" value={fin.openingBalance ? 'Rs. ' + fin.openingBalance : 'N/A'} />
              <LetterField label="Principal Amount" value={fin.principalAmount ? 'Rs. ' + fin.principalAmount : 'N/A'} />
              <LetterField label="Interest Amount" value={fin.interestAmount ? 'Rs. ' + fin.interestAmount : 'N/A'} />
              <LetterField label="Interest %" value={safe(fin.interestPercent)} />
            </div>
          </div>

          {/* DSC Block */}
          <div className="border-2 border-[#1f3a5f] rounded-lg p-6 mt-8 bg-[#f8fafc]">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#1f3a5f]" />
              <h4 className="text-[14px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                Digital Signature Certificate (DSC)
              </h4>
            </div>
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-[#1f3a5f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-8 h-8 text-[#1f3a5f]" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">
                    <span className="font-semibold">Signed By:</span> {safe(pl.dscSignedBy)}
                  </p>
                  <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif] mt-1">
                    <span className="font-semibold">Designation:</span> Commissioner, {safe(header.ulb)} Municipal Corporation
                  </p>
                  <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif] mt-1">
                    <span className="font-semibold">Signed At:</span> {formatDate(pl.dscSignedAt)}
                  </p>
                  <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif] mt-1">
                    <span className="font-semibold">Certificate Status:</span>{' '}
                    <span className="text-green-700 font-semibold">Valid - Digitally Signed</span>
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">
                      This document has been digitally signed using a Class 3 DSC issued by a Certifying Authority recognized under the Information Technology Act, 2000.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-center">
            <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">
              This is a system-generated document. No physical signature is required.
            </p>
            <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] mt-1">
              KMDS - Jalanidhi | Department of Municipal Administration, Government of Karnataka
            </p>
          </div>
        </div>

        {/* Send to Applicant Section */}
        {sentToCitizen ? (
          <div className="mt-6 bg-green-50 border border-green-300 rounded-lg p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-semibold text-green-800 font-['Poppins',sans-serif]">
                Permission Letter Sent to Applicant
              </h3>
              <p className="text-[13px] text-green-700 font-['Poppins',sans-serif] mt-0.5">
                The citizen can now view and download this letter from their Application Status page.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 bg-[#f8fafc] border-2 border-dashed border-[#1f3a5f]/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                  Send Permission Letter to Applicant
                </h3>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mt-1">
                  The applicant will be able to view and download the permission letter from their Application Status page.
                </p>
              </div>
              <GovButton
                variant="success"
                size="lg"
                onClick={handleSendToCitizen}
                loading={sendingToCitizen}
              >
                <Send className="w-4 h-4" />
                Send to Applicant
              </GovButton>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={processing}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
          Legacy Data - Commissioner Review
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
          Application ID: <span className="font-semibold">{safe(application.id)}</span>
          <span className="ml-4">Submitted: {formatDate(application.submittedAt)}</span>
        </p>
        {isActioned && (
          <div className={'mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold font-[\'Poppins\',sans-serif] ' + (application.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
            {application.status === 'approved' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {application.status === 'approved' ? 'Approved' : 'Rejected'}
          </div>
        )}
      </div>

      {/* Section 1: Header Summary */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-4 gap-6">
          <ReadOnlyField label="District" value={safe(header.district)} />
          <ReadOnlyField label="ULB" value={safe(header.ulb)} />
          <ReadOnlyField label="Authority Type" value={safe(header.authorityType)} />
          <ReadOnlyField label="ULB Type" value={safe(header.ulbType)} />
        </div>
        <div className="mt-4">
          <ReadOnlyField label="Applicant Type" value={safe(application.applicantType)} className="capitalize" />
        </div>
      </div>

      {/* Section 2: Location */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location of the Tap Connection
        </h2>
        <div className="grid grid-cols-3 gap-6 mb-5">
          <ReadOnlyField label="Full Name" value={safe(loc.fullName)} />
          <ReadOnlyField label="House/Door No" value={safe(loc.houseDoorNo)} />
          <ReadOnlyField label="Ward Number" value={safe(loc.wardNumber)} />
        </div>
        <div className="grid grid-cols-3 gap-6 mb-5">
          <ReadOnlyField label="Street" value={safe(loc.street)} />
          <ReadOnlyField label="Address" value={safe(loc.address)} />
          <ReadOnlyField label="State" value={safe(loc.state)} />
        </div>
        <div className="grid grid-cols-3 gap-6 mb-5">
          <ReadOnlyField label="District" value={safe(loc.district)} />
          <ReadOnlyField label="City" value={safe(loc.city)} />
          <ReadOnlyField label="Pincode" value={safe(loc.pincode)} />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <ReadOnlyField label="Mobile No" value={safe(loc.mobileNo)} />
          <ReadOnlyField label="Mobile Verified" value={loc.mobileVerified ? 'Yes' : 'No'} />
          <div />
        </div>
      </div>

      {/* Section 3: Connection */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
          <Plug className="w-5 h-5" />
          Existing Connection Details
        </h2>
        <div className="grid grid-cols-4 gap-6">
          <ReadOnlyField label="RR Number" value={safe(conn.rrNumber)} />
          <ReadOnlyField label="Connection Type" value={safe(conn.connectionType)} />
          <ReadOnlyField label="Meter Category" value={safe(conn.meterCategory)} />
          <ReadOnlyField label="Connection Status" value={safe(conn.connectionStatus)} />
        </div>
      </div>

      {/* Section 4: Financial */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
          <IndianRupee className="w-5 h-5" />
          DCB Financial Details
        </h2>
        <div className="grid grid-cols-3 gap-6 mb-5">
          <ReadOnlyField label="Current FY" value={safe(fin.currentFY)} />
          <ReadOnlyField label="Current Date" value={safe(fin.currentDate)} />
          <ReadOnlyField label="Opening Balance" value={safe(fin.openingBalance)} />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <ReadOnlyField label="Principal Amount" value={safe(fin.principalAmount)} />
          <ReadOnlyField label="Interest Amount" value={safe(fin.interestAmount)} />
          <ReadOnlyField label="% of Interest" value={safe(fin.interestPercent)} />
        </div>
      </div>

      {/* Section 5: Billing */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
          <Gauge className="w-5 h-5" />
          Billing Details
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <ReadOnlyField label="Volumetric (Meter) Billing?" value={safe(bill.isVolumetricBilling) === 'yes' ? 'Yes' : safe(bill.isVolumetricBilling) === 'no' ? 'No' : safe(bill.isVolumetricBilling)} />
          <ReadOnlyField label="Previous Meter Reading" value={safe(bill.previousMeterReading)} />
          <div />
        </div>
      </div>

      {/* Caseworker Details */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
          <User className="w-5 h-5" />
          Caseworker Details
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <ReadOnlyField label="Caseworker Name" value={safe(application.caseworkerName)} />
          <ReadOnlyField label="Caseworker ID" value={safe(application.caseworkerId)} />
          <ReadOnlyField label="Submitted At" value={formatDate(application.submittedAt)} />
        </div>
      </div>

      {/* Field Engineer Verification */}
      <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-indigo-800 font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Field Engineer Verification
        </h2>
        <div className="grid grid-cols-3 gap-6 mb-4">
          <ReadOnlyField label="Field Engineer Name" value={safe(feDetails.name)} />
          <ReadOnlyField label="Verification Status" value={safe(feDetails.status)} className="capitalize" />
          <ReadOnlyField label="Verified At" value={formatDate(feDetails.timestamp)} />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">
            Field Engineer Comments
          </label>
          <div className="px-4 py-3 bg-white border border-indigo-200 rounded-md text-[14px] text-gray-800 font-['Poppins',sans-serif] min-h-[60px]">
            {safe(feDetails.comments)}
          </div>
        </div>
      </div>

      {/* Remarks Timeline */}
      {remarks.length > 0 && (
        <div className="mb-6">
          <RemarksTimeline remarks={remarks} title="Application Timeline" />
        </div>
      )}

      {/* Commissioner Action Section */}
      {!isActioned && (
        <div className="bg-white rounded-lg border-2 border-[#1f3a5f]/20 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Commissioner Decision
          </h2>

          <div className="mb-5">
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
              Commissioner Comments / Remarks <span className="text-red-600">*</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter your decision remarks (minimum 10 characters)..."
              rows={4}
              className="w-full px-4 py-3 text-[14px] font-['Poppins',sans-serif] border-[1.5px] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] placeholder:text-gray-400 resize-none"
              disabled={processing}
            />
            <p className="text-xs text-gray-500 font-['Poppins',sans-serif] mt-1">
              {comments.trim().length}/10 minimum characters
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <GovButton
              variant="danger"
              onClick={() => handleActionClick('reject')}
              disabled={processing || comments.trim().length < 10}
            >
              <XCircle className="w-4 h-4" />
              Reject
            </GovButton>
            <GovButton
              variant="outline"
              onClick={() => handleActionClick('send_back')}
              disabled={processing || comments.trim().length < 10}
            >
              <RotateCcw className="w-4 h-4" />
              Send Back to FE
            </GovButton>
            <GovButton
              variant="success"
              onClick={() => handleActionClick('approve')}
              disabled={processing || comments.trim().length < 10}
              loading={processing}
            >
              <CheckCircle className="w-4 h-4" />
              Approve & Generate Letter
            </GovButton>
          </div>
        </div>
      )}

      {/* Already Approved - Show Letter Link */}
      {application.status === 'approved' && permLetter && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800 font-['Poppins',sans-serif]">
              Application Approved
            </h3>
          </div>
          <p className="text-sm text-green-700 font-['Poppins',sans-serif] mb-3">
            New RR Number: <span className="font-bold text-lg">{safe(application.newRRNumber)}</span>
          </p>
          <GovButton variant="primary" onClick={() => setShowPermissionLetter(true)}>
            <FileText className="w-4 h-4" />
            View Permission Letter
          </GovButton>
        </div>
      )}

      {/* Already Rejected */}
      {application.status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <XCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800 font-['Poppins',sans-serif]">
              Application Rejected
            </h3>
          </div>
          <p className="text-sm text-red-700 font-['Poppins',sans-serif]">
            Reason: {safe(comDetails.comments)}
          </p>
        </div>
      )}

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              {pendingAction === 'approve' && <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />}
              {pendingAction === 'reject' && <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />}
              {pendingAction === 'send_back' && <RotateCcw className="w-12 h-12 text-amber-500 mx-auto mb-3" />}
              <h3 className="text-lg font-bold text-gray-900 font-['Poppins',sans-serif]">
                {pendingAction === 'approve' && 'Confirm Approval'}
                {pendingAction === 'reject' && 'Confirm Rejection'}
                {pendingAction === 'send_back' && 'Confirm Send Back'}
              </h3>
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-2">
                {pendingAction === 'approve' && 'This will approve the legacy data entry and generate a permission letter with a new RR Number.'}
                {pendingAction === 'reject' && 'This will reject the legacy data entry. The citizen will be notified.'}
                {pendingAction === 'send_back' && 'This will send the application back to the Field Engineer for corrections.'}
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <GovButton
                variant="outline"
                fullWidth
                onClick={() => { setShowConfirmPopup(false); setPendingAction(null); }}
              >
                Cancel
              </GovButton>
              <GovButton
                variant={pendingAction === 'approve' ? 'success' : pendingAction === 'reject' ? 'danger' : 'primary'}
                fullWidth
                onClick={confirmAction}
                loading={processing}
              >
                {pendingAction === 'approve' && 'Yes, Approve'}
                {pendingAction === 'reject' && 'Yes, Reject'}
                {pendingAction === 'send_back' && 'Yes, Send Back'}
              </GovButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReadOnlyField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">
        {label}
      </label>
      <div className={'h-10 px-3 flex items-center bg-gray-100 border border-gray-200 rounded-md text-[14px] text-gray-800 font-[\'Poppins\',sans-serif] font-medium ' + (className || '')}>
        {value}
      </div>
    </div>
  );
}

function LetterField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <span className="text-[13px] font-semibold text-gray-600 font-['Poppins',sans-serif] w-[200px] flex-shrink-0">
        {label}:
      </span>
      <span className="text-[13px] text-gray-900 font-['Poppins',sans-serif]">
        {value}
      </span>
    </div>
  );
}
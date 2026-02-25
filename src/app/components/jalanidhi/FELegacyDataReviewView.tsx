import { useState, useEffect } from 'react';
import {
  ChevronLeft, MapPin, Plug, IndianRupee, Gauge, User, Send,
  CheckCircle, MessageSquare, AlertTriangle
} from 'lucide-react';
import { GovButton } from '../ui/gov-button';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface FELegacyDataReviewViewProps {
  applicationId: string;
}

export default function FELegacyDataReviewView({ applicationId }: FELegacyDataReviewViewProps) {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feComments, setFeComments] = useState('');
  const [forwarding, setForwarding] = useState(false);
  const [forwarded, setForwarded] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      console.log('[FE LEGACY REVIEW] Fetching application:', applicationId);

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
      console.log('[FE LEGACY REVIEW] Response:', data);

      if (data.success && data.application) {
        setApplication(data.application);
        // If already forwarded
        const wf = data.application && data.application.workflow ? data.application.workflow : {};
        const fe = wf && wf.fieldEngineer ? wf.fieldEngineer : null;
        if (fe && fe.status === 'verified') {
          setForwarded(true);
          setFeComments(fe.comments || '');
        }
      } else {
        setError(data.error || 'Application not found');
      }
    } catch (err) {
      console.error('[FE LEGACY REVIEW] Fetch error:', err);
      setError('Failed to load application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForward = async () => {
    if (!feComments.trim() || feComments.trim().length < 10) {
      alert('Please enter verification comments (minimum 10 characters) before forwarding.');
      return;
    }

    if (!confirm('Are you sure you want to forward this application to the Commissioner?')) return;

    setForwarding(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const feName = userData && userData.name ? userData.name : 'Field Engineer';
      const feId = userData && userData.id ? userData.id : 'FE001';

      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/legacy-data/fe-forward',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + publicAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId,
            feComments: feComments.trim(),
            feName,
            feId,
          }),
        }
      );

      const data = await response.json();
      console.log('[FE LEGACY REVIEW] Forward response:', data);

      if (data.success) {
        setForwarded(true);
        alert('Application forwarded to Commissioner successfully!');
      } else {
        console.error('[FE LEGACY REVIEW] Forward error:', data.error);
        alert('Failed to forward: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('[FE LEGACY REVIEW] Forward error:', err);
      alert('Network error while forwarding. Please try again.');
    } finally {
      setForwarding(false);
    }
  };

  const handleBack = () => {
    const event = new CustomEvent('navigate', {
      detail: '/jalanidhi/field-engineer/tap-connection/legacy-data-applications',
    });
    window.dispatchEvent(event);
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

  // Safe data accessors
  const safe = (val: any) => (val !== null && val !== undefined && val !== '' ? val : 'N/A');

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
          onClick={handleBack}
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Applications
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
  const isSentBack = application.status === 'sent_back';
  const sendBackHistory = application && application.sendBackHistory ? application.sendBackHistory : [];

  // Build remarks timeline
  const remarks: RemarkEntry[] = [];
  if (cwDetails && cwDetails.name) {
    remarks.push({
      role: 'Caseworker',
      comment: 'Submitted legacy data entry for RR Number: ' + safe(conn.rrNumber),
      timestamp: cwDetails.timestamp || application.submittedAt || '',
    });
  }
  if (sendBackHistory.length > 0) {
    sendBackHistory.forEach((sb: any) => {
      remarks.push({
        role: 'Commissioner',
        comment: sb.comments || 'Sent back for corrections',
        timestamp: sb.timestamp || '',
        variant: 'sent_back',
      });
    });
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Applications
      </button>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
          Legacy Data - Application Review
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
          Application ID: <span className="font-semibold">{safe(application.id)}</span>
          <span className="ml-4">Submitted: {formatDate(application.submittedAt)}</span>
        </p>
      </div>

      {/* Sent Back Warning */}
      {isSentBack && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-amber-800 font-['Poppins',sans-serif]">Application Sent Back by Commissioner</h3>
            <p className="text-sm text-amber-700 font-['Poppins',sans-serif] mt-1">
              {sendBackHistory.length > 0 ? sendBackHistory[sendBackHistory.length - 1].comments : 'Please review and re-forward.'}
            </p>
          </div>
        </div>
      )}

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

      {/* Section 2: Location Details */}
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

      {/* Section 3: Existing Connection Details */}
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

      {/* Section 4: DCB Financial Details */}
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

      {/* Section 5: Billing Details */}
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

      {/* Caseworker Submission Info */}
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

      {/* Remarks Timeline */}
      {remarks.length > 0 && (
        <div className="mb-6">
          <RemarksTimeline remarks={remarks} title="Application Timeline" />
        </div>
      )}

      {/* Field Engineer Comments & Action */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Field Engineer Verification
        </h2>

        {forwarded ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-green-800 font-['Poppins',sans-serif]">
                Application Forwarded to Commissioner
              </h3>
              <p className="text-sm text-green-700 font-['Poppins',sans-serif] mt-1">
                Your comments: {feComments}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                Verification Comments <span className="text-red-600">*</span>
              </label>
              <textarea
                value={feComments}
                onChange={(e) => setFeComments(e.target.value)}
                placeholder="Enter your verification comments, observations, and recommendations (minimum 10 characters)..."
                rows={4}
                className="w-full px-4 py-3 text-[14px] font-['Poppins',sans-serif] border-[1.5px] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] placeholder:text-gray-400 resize-none"
              />
              <p className="text-xs text-gray-500 font-['Poppins',sans-serif] mt-1">
                {feComments.trim().length}/10 minimum characters
              </p>
            </div>

            <div className="flex justify-end">
              <GovButton
                variant="primary"
                onClick={handleForward}
                disabled={forwarding || feComments.trim().length < 10}
                loading={forwarding}
              >
                <Send className="w-4 h-4" />
                Forward to Commissioner
              </GovButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Reusable read-only field component
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
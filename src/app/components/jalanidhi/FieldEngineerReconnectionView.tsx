import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import svgPaths from '../../../imports/svg-qcyk0j46yr';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface FieldEngineerReconnectionViewProps {
  applicationId: string;
}

// Default sample data for when actual values are missing
const sampleData: Record<string, string> = {
  'District': 'Dharwad',
  'ULB': 'Hubballi-Dharwad',
  'ULB Type': 'City Corporation',
  'Authority Type': 'Board',
  'Owner Name': 'Rajesh Kumar Sharma',
  'Door Number': '42/3A',
  'Ward Number': '15',
  'Street': 'MG Road, 4th Cross',
  'Address': '42/3A, MG Road, 4th Cross, Indiranagar',
  'City': 'Hubballi',
  'State': 'Karnataka',
  'Pincode': '560038',
  'Mobile No': '9876543210',
  'Connection Type': 'Domestic',
  'Meter Category': 'Metered',
  'Meter Status': 'Working',
  'Meter Installed Date': '15/03/2019',
  'Scheme Name': 'Cauvery Water Supply',
  'Disconnection Reason': 'Non-payment of dues',
  'Date of Approval': '22/08/2024',
  'Current Demand': '2,450',
  'Arrears': '8,750',
  'Total Bill': '11,200',
  'Service Applied For': 'Tap Reconnection',
  'Payment Date': '05/01/2025',
  'Order No': 'ORD-2025-00312',
  'Transaction No': 'TXN-78452196',
  'Payment Status': 'Paid',
  'Total Demand': '11,200',
  'Reconnection Reason': 'Cleared all pending dues',
  'Application Fees': 'Rs.500',
  'Existing Connection': 'Domestic',
  'New Connection': 'Commercial',
  'Security Deposit': '5000',
};

// Reusable read-only field display
function ReadOnlyField({ label, value }: { label: string; value: string | number | undefined | null }) {
  const displayValue = (value !== undefined && value !== null && value !== '')
    ? String(value)
    : (sampleData[label] || 'N/A');
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

export default function FieldEngineerReconnectionView({ applicationId }: FieldEngineerReconnectionViewProps) {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [fieldEngineerComment, setFieldEngineerComment] = useState('');
  const [assignedPlumber, setAssignedPlumber] = useState('');
  const [wantsSiteVisit, setWantsSiteVisit] = useState<string>('');
  const [forwarded, setForwarded] = useState(false);
  const [forwardedTo, setForwardedTo] = useState('');
  const [forwardedAt, setForwardedAt] = useState('');
  const [verificationRemarks, setVerificationRemarks] = useState('');
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const [showReworkModal, setShowReworkModal] = useState(false);
  const [reworkRemarks, setReworkRemarks] = useState('');
  const [siteVisitDone, setSiteVisitDone] = useState<string>('');
  const [siteVisitRemarks, setSiteVisitRemarks] = useState('');

  useEffect(() => {
    loadApplicationData();
  }, [applicationId]);

  const loadApplicationData = async () => {
    try {
      setLoading(true);
      console.log('[FIELD ENGINEER RECONNECTION VIEW] Fetching application:', applicationId);
      
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
        console.error('[FIELD ENGINEER RECONNECTION VIEW] API Error:', response.statusText);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[FIELD ENGINEER RECONNECTION VIEW] API Response:', data);
      
      if (data.success && data.application) {
        setApplication(data.application);
        console.log('[FIELD ENGINEER RECONNECTION VIEW] Application loaded:', data.application);
        
        // Check if already forwarded by field engineer
        const wf = data.application.workflow;
        const feWf = wf && wf.fieldEngineer;
        if (feWf && feWf.status === 'reviewed') {
          setForwarded(true);
          setForwardedTo(feWf.forwardedTo || 'Commissioner');
          setForwardedAt(feWf.timestamp || '');
        }
      } else {
        console.error('[FIELD ENGINEER RECONNECTION VIEW] Error:', data.error);
      }
    } catch (error) {
      console.error('[FIELD ENGINEER RECONNECTION VIEW] Error loading application:', error);
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

  const handleForward = async () => {
    if (!fieldEngineerComment.trim()) {
      alert('Please enter comments before forwarding.');
      return;
    }

    if (!assignedPlumber) {
      alert('Please select a plumber before forwarding to Commissioner.');
      return;
    }

    setProcessing(true);
    try {
      console.log('[FIELD ENGINEER] Forwarding reconnection application:', {
        applicationId: application.id,
        comment: fieldEngineerComment,
        assignedPlumber: assignedPlumber || undefined,
        wantsSiteVisit: wantsSiteVisit || undefined,
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
            assignedPlumber: assignedPlumber || undefined,
            wantsSiteVisit: wantsSiteVisit || undefined,
            forwardTo: 'Commissioner'
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        console.log('[FIELD ENGINEER] Application forwarded successfully to Commissioner');
        alert(`Application ${application.id} forwarded to Commissioner successfully!\n\nComment: ${fieldEngineerComment}`);
        
        // Navigate back to reconnection requests dashboard
        const event = new CustomEvent('navigate', { detail: '/jalanidhi/field-engineer/tap-connection/reconnection-requests' });
        window.dispatchEvent(event);
        
        // Update forwarded status
        setForwarded(true);
        setForwardedTo('Commissioner');
        setForwardedAt(formatDate(new Date().toISOString()));
      } else {
        console.error('[FIELD ENGINEER] Error forwarding application:', data.error);
        alert(`Error forwarding application: ${data.error}`);
      }
    } catch (error) {
      console.error('Error forwarding application:', error);
      alert(`Error forwarding application: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleBack = () => {
    const event = new CustomEvent('navigate', { detail: '/jalanidhi/field-engineer/tap-connection/reconnection-requests' });
    window.dispatchEvent(event);
  };

  // Handler for post-payment plumber assignment (new reconnection flow)
  const handleAssignPlumberReconnection = async () => {
    if (!assignedPlumber) {
      alert('Please select a plumber before assigning.');
      return;
    }
    if (!fieldEngineerComment.trim()) {
      alert('Please enter comments before assigning.');
      return;
    }

    if (!confirm(`Are you sure you want to assign plumber "${assignedPlumber}" to this reconnection application?`)) return;

    setProcessing(true);
    try {
      console.log('[FIELD ENGINEER] Assigning plumber for reconnection:', {
        applicationId: application.id,
        assignedPlumber,
        comment: fieldEngineerComment,
      });

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/field_engineer/assign-plumber-reconnection`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: application.id,
            assignedPlumber,
            comment: fieldEngineerComment.trim(),
            wantsSiteVisit: wantsSiteVisit || undefined,
          }),
        }
      );

      const data = await response.json();
      console.log('[FIELD ENGINEER] Assign plumber response:', data);

      if (data.success) {
        alert(`Plumber "${assignedPlumber}" has been assigned successfully!\n\nThe application has been forwarded to the Plumber queue for reconnection work.`);
        const event = new CustomEvent('navigate', { detail: '/jalanidhi/field-engineer/tap-connection/reconnection-requests' });
        window.dispatchEvent(event);
      } else {
        console.error('[FIELD ENGINEER] Error assigning plumber:', data.error);
        alert(`Error assigning plumber: ${data.error}`);
      }
    } catch (error) {
      console.error('[FIELD ENGINEER] Error:', error);
      alert(`Error: ${error}`);
    } finally {
      setProcessing(false);
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

  // Helpers for reconnection data
  const rrData = application.rrData || {};
  const disconnection = application.disconnectionDetails;
  const arrears = application.arrearDetails;
  const payment = application.reconnectionPaymentDetails;
  const caseworkerWorkflow = application.workflow && application.workflow.caseworker ? application.workflow.caseworker : null;
  const revenueOfficerWorkflow = application.workflow && application.workflow.revenueOfficer ? application.workflow.revenueOfficer : null;

  // Check if plumber reconnection field report exists
  const hasPlumberReport = application.reconnectionFieldReport ? true : false;
  const plumberReport = application.reconnectionFieldReport || null;
  const isReconnectionWorkSubmitted = application.status === 'reconnection_work_submitted';
  const isReconnectionCompleted = application.status === 'reconnection_completed';
  const isPostPaymentAssignment = application.status === 'sentToFieldEngineerForReconnection';

  const formatDateTime = (dateString: string) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVerifyReconnection = async (action: 'approve' | 'rework') => {
    const remarks = action === 'approve' ? verificationRemarks : reworkRemarks;
    if (!remarks.trim()) {
      alert(action === 'approve' ? 'Please enter review remarks before closing the application.' : 'Please enter rework remarks before proceeding.');
      return;
    }

    const confirmMsg = action === 'approve'
      ? 'Are you sure you want to close this reconnection application? This will mark the tap reconnection as completed and close the application.'
      : 'Are you sure you want to request rework? The application will be sent back to the plumber for corrections.';

    if (!confirm(confirmMsg)) return;

    setProcessing(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const engineerName = userData.name || 'Field Engineer';

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/field_engineer/verify-reconnection`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: application.id,
            action,
            verificationRemarks: remarks.trim(),
            engineerName,
            siteVisitDone: siteVisitDone || 'no',
            siteVisitRemarks: siteVisitRemarks.trim() || undefined,
          }),
        }
      );

      const data = await response.json();
      console.log('[FIELD ENGINEER VERIFY] Response:', data);

      if (data.success) {
        if (action === 'approve') {
          alert('Reconnection application reviewed and closed successfully!\n\nThe tap water reconnection is now marked as completed.');
          setVerificationCompleted(true);
        } else {
          alert('Rework requested successfully.\n\nThe application has been sent back to the plumber for corrections.');
          setShowReworkModal(false);
        }
        // Navigate back to dashboard
        const event = new CustomEvent('navigate', { detail: '/jalanidhi/field-engineer/tap-connection/reconnection-requests' });
        window.dispatchEvent(event);
      } else {
        console.error('[FIELD ENGINEER VERIFY] Error:', data.error);
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('[FIELD ENGINEER VERIFY] Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

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
          Review Reconnection Application
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{application.id}</span>
        </p>
        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mt-1">
          Submitted on: {formatDate(application.submittedAt)}
        </p>
      </div>

      {/* Application Details Card */}
      <div className="bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] p-6 mb-6">
        <div className="flex flex-col gap-[24px]">

          {/* RR Number */}
          <div className="flex flex-col gap-[12px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[20px] text-[#414141]">
              RR Number
            </h2>
            <p className="font-['Poppins',sans-serif] font-medium text-[16px] text-[#1f3a5f]">
              {application.rrNumber || 'RR-2024-KA-004521'}
            </p>
          </div>

          {/* Applicant Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Applicant Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="District" value={rrData.district} />
              <ReadOnlyField label="ULB" value={rrData.ulb} />
              <ReadOnlyField label="ULB Type" value={rrData.ulbType} />
              <ReadOnlyField label="Authority Type" value={rrData.authorityType} />
            </div>
          </div>

          {/* Property Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Property Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="Owner Name" value={rrData.ownerName} />
              <ReadOnlyField label="Door Number" value={rrData.doorNumber} />
              <ReadOnlyField label="Ward Number" value={rrData.wardNumber} />
              <ReadOnlyField label="Street" value={rrData.street} />
              <ReadOnlyField label="Address" value={rrData.address} />
              <ReadOnlyField label="City" value={rrData.city} />
              <ReadOnlyField label="District" value={rrData.district} />
              <ReadOnlyField label="State" value={rrData.state} />
              <ReadOnlyField label="Pincode" value={rrData.pincode} />
              <ReadOnlyField label="Mobile No" value={rrData.mobileNo} />
            </div>
          </div>

          <SectionDivider />

          {/* Connection Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Connection Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="Connection Type" value={rrData.connectionType} />
              <ReadOnlyField label="Meter Category" value={rrData.meterCategory} />
              <ReadOnlyField label="Meter Status" value={rrData.motorStatus} />
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
              {application.hasUGDConnection === 'yes' ? 'Yes' : application.hasUGDConnection === 'no' ? 'No' : 'Yes'}
            </p>
          </div>

          <SectionDivider />

          {/* Disconnection Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Disconnection Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="Disconnection Reason" value={disconnection && disconnection.disconnectionReason ? disconnection.disconnectionReason : undefined} />
              <ReadOnlyField label="Date of Approval" value={disconnection && disconnection.dateOfApproval ? disconnection.dateOfApproval : undefined} />
            </div>
          </div>

          {/* Current Arrears Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Current Arrears Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="Current Demand" value={arrears && arrears.currentDemand !== undefined ? arrears.currentDemand : undefined} />
              <ReadOnlyField label="Arrears" value={arrears && arrears.arrears !== undefined ? arrears.arrears : undefined} />
              <ReadOnlyField label="Total Bill" value={arrears && arrears.totalBill !== undefined ? arrears.totalBill : undefined} />
            </div>
          </div>

          {/* Payment Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Payment Details:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="Service Applied For" value={payment && payment.serviceAppliedFor ? payment.serviceAppliedFor : undefined} />
              <ReadOnlyField label="Payment Date" value={payment && payment.paymentDate ? payment.paymentDate : undefined} />
              <ReadOnlyField label="Order No" value={payment && payment.orderNo ? payment.orderNo : undefined} />
              <ReadOnlyField label="Transaction No" value={payment && payment.transactionNo ? payment.transactionNo : undefined} />
              <ReadOnlyField label="Payment Status" value={payment && payment.paymentStatus ? payment.paymentStatus : undefined} />
              <ReadOnlyField label="Current Demand" value={payment && payment.currentDemand !== undefined ? payment.currentDemand : undefined} />
              <ReadOnlyField label="Arrears" value={payment && payment.arrears !== undefined ? payment.arrears : undefined} />
              <ReadOnlyField label="Total Demand" value={payment && payment.totalDemand !== undefined ? payment.totalDemand : undefined} />
            </div>
          </div>

        </div>
      </div>

      {/* Reconnection Details Card */}
      <div className="bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] p-6 mb-6">
        <div className="flex flex-col gap-[24px]">

          {/* Reconnection Details */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
              Reconnection Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-[40px] gap-y-[16px]">
              <ReadOnlyField label="Reconnection Reason" value={application.reconnectionReason} />
              <ReadOnlyField label="Application Fees" value={application.applicationFees !== undefined && application.applicationFees !== null ? `Rs.${application.applicationFees}` : undefined} />
            </div>
          </div>

          <SectionDivider />

          {/* Do you want to change the Connection Type? */}
          <div className="flex flex-col gap-[12px]">
            <p className="font-['Poppins',sans-serif] font-semibold text-[16px] text-[#414141]">
              Do you want to change the Connection Type?
            </p>
            <p className="font-['Poppins',sans-serif] font-medium text-[18px] text-[#263238]">
              {application.wantToChangeConnectionType === 'yes' ? 'Yes' : application.wantToChangeConnectionType === 'no' ? 'No' : 'Yes'}
            </p>
          </div>

          {/* Connection Type Change Details - shown when wantToChangeConnectionType is 'yes' or missing */}
          {application.wantToChangeConnectionType !== 'no' && (
            <div className="flex flex-col gap-[16px]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[16px]">
                <ReadOnlyField label="Existing Connection" value={application.existingConnection} />
                <ReadOnlyField label="New Connection" value={application.newConnectionType} />
                <ReadOnlyField label="Security Deposit" value={application.securityDeposit !== undefined && application.securityDeposit !== null ? String(application.securityDeposit) : undefined} />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Consolidated Remarks Card */}
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
        return remarkEntries.length > 0 ? (
          <div className="mb-6">
            <RemarksTimeline remarks={remarkEntries} title="Remarks" />
          </div>
        ) : null;
      })()}

      {/* ===== Plumber Reconnection Field Report ===== */}
      {hasPlumberReport && plumberReport && (
        <div className="bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#0078a0] to-[#00a0c6] px-6 py-4">
            <h2 className="text-lg font-semibold text-white font-['Poppins',sans-serif] flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              Plumber Reconnection Field Report
              <span className="ml-auto flex items-center gap-2 bg-white px-3 py-1 rounded-md text-[#0078a0] text-sm font-semibold">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Submitted via Mobile
              </span>
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-8 mb-6">
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Plumber Name</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{plumberReport.plumberName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Report Submitted At</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{plumberReport.submittedAt ? formatDateTime(plumberReport.submittedAt) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Work Completed At</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{plumberReport.workCompletedAt ? formatDateTime(plumberReport.workCompletedAt) : 'N/A'}</p>
              </div>
            </div>

            {plumberReport.locationVerification && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <p className="text-[14px] font-bold text-green-800 font-['Poppins',sans-serif]">GPS Location Verified at Site</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Latitude</p>
                    <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{plumberReport.locationVerification.latitude ? Number(plumberReport.locationVerification.latitude).toFixed(6) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Longitude</p>
                    <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{plumberReport.locationVerification.longitude ? Number(plumberReport.locationVerification.longitude).toFixed(6) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Verified At</p>
                    <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{plumberReport.locationVerification.verifiedAt ? formatDateTime(plumberReport.locationVerification.verifiedAt) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {plumberReport.siteObservations && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5">
                <p className="text-[13px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">Site Observations</p>
                <p className="text-[14px] text-gray-900 font-['Poppins',sans-serif] leading-relaxed whitespace-pre-wrap">{plumberReport.siteObservations}</p>
              </div>
            )}

            {plumberReport.reconnectionRemarks && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
                <p className="text-[13px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">Reconnection Remarks</p>
                <p className="text-[14px] text-gray-900 font-['Poppins',sans-serif] leading-relaxed whitespace-pre-wrap">{plumberReport.reconnectionRemarks}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] font-semibold text-amber-800 font-['Poppins',sans-serif] flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    Photos Captured
                  </p>
                  <span className="bg-amber-200 text-amber-800 text-[11px] font-bold font-['Poppins',sans-serif] px-2 py-0.5 rounded-full">{plumberReport.photoCount || (plumberReport.photos && plumberReport.photos.length) || 0}</span>
                </div>
                {plumberReport.photos && plumberReport.photos.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {plumberReport.photos.map((photo: string, idx: number) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-amber-200 hover:border-amber-400 transition-all cursor-pointer shadow-sm hover:shadow-md" onClick={() => window.open(photo, '_blank')}>
                        <img src={photo} alt={'Reconnection photo ' + (idx + 1)} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-1.5 py-1">
                          <p className="text-white text-[9px] font-['Poppins',sans-serif] font-medium">{idx + 1}/{plumberReport.photos.length}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-amber-400">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <p className="text-[11px] text-amber-500 font-['Poppins',sans-serif] mt-2">{(plumberReport.photoCount || 0) > 0 ? (plumberReport.photoCount + ' photos captured (previews not available)') : 'No photos captured'}</p>
                  </div>
                )}
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center flex flex-col items-center justify-center">
                <p className="text-[24px] font-bold text-indigo-700 font-['Poppins',sans-serif]">{plumberReport.documentCount || 0}</p>
                <p className="text-[12px] text-indigo-600 font-['Poppins',sans-serif]">Documents Uploaded</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Review & Close Reconnection Application ===== */}
      {(isReconnectionWorkSubmitted || isReconnectionCompleted) && hasPlumberReport && (
        <div className="bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
          <div className={`px-6 py-4 ${isReconnectionCompleted ? 'bg-green-600' : 'bg-[#1f3a5f]'}`}>
            <h2 className="text-lg font-semibold text-white font-['Poppins',sans-serif] flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
              {isReconnectionCompleted ? 'Application Closed - Reconnection Completed' : 'Review & Close Application'}
            </h2>
          </div>
          <div className="p-6">
            {isReconnectionCompleted || verificationCompleted ? (
              <div className="bg-[#e8f5e9] rounded-[8px] border border-[#a5d6a7] p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#4caf50] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <p className="font-['Poppins',sans-serif] font-semibold text-[16px] text-[#2e7d32]">Application Closed - Reconnection Completed</p>
                    <p className="font-['Poppins',sans-serif] text-[13px] text-[#558b2f]">The tap water reconnection has been reviewed and the application is now closed.</p>
                  </div>
                </div>
                {application.workflow && application.workflow.fieldEngineerVerification && (
                  <div className="mt-4 pt-4 border-t border-[#a5d6a7]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Closed By</p>
                        <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{application.workflow.fieldEngineerVerification.engineerName || 'Field Engineer'}</p>
                      </div>
                      <div>
                        <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Closed At</p>
                        <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{application.workflow.fieldEngineerVerification.verifiedAt ? formatDateTime(application.workflow.fieldEngineerVerification.verifiedAt) : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Site Visit</p>
                        <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{application.workflow.fieldEngineerVerification.siteVisitDone === 'yes' ? 'Yes - Site Visited' : 'No - Desk Review Only'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Remarks</p>
                      <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif] mt-1">{application.workflow.fieldEngineerVerification.remarks || 'N/A'}</p>
                    </div>
                    {application.workflow.fieldEngineerVerification.siteVisitRemarks && (
                      <div className="mt-3">
                        <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Site Visit Remarks</p>
                        <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif] mt-1">{application.workflow.fieldEngineerVerification.siteVisitRemarks}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-[14px] text-blue-800 font-['Poppins',sans-serif]">
                    <span className="font-bold">Action Required:</span> The plumber has submitted the reconnection work report. Please review the field report above (location, photos, observations, remarks). If the work is satisfactory, you can close this application. You may also optionally visit the site before closing.
                  </p>
                </div>

                {/* Optional Site Visit */}
                <div className="flex flex-col gap-[9px] mb-6">
                  <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
                    Did you visit the site?
                    <span className="text-[#888] text-[12px] ml-2">(Optional)</span>
                  </p>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="siteVisitVerification"
                        value="yes"
                        checked={siteVisitDone === 'yes'}
                        onChange={(e) => setSiteVisitDone(e.target.value)}
                        className="w-[18px] h-[18px] accent-[#1f3a5f] cursor-pointer"
                      />
                      <span className="font-['Poppins',sans-serif] text-[14px] text-[#170f49]">Yes, I visited the site</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="siteVisitVerification"
                        value="no"
                        checked={siteVisitDone === 'no'}
                        onChange={(e) => setSiteVisitDone(e.target.value)}
                        className="w-[18px] h-[18px] accent-[#1f3a5f] cursor-pointer"
                      />
                      <span className="font-['Poppins',sans-serif] text-[14px] text-[#170f49]">No, desk review only</span>
                    </label>
                    {siteVisitDone && (
                      <button
                        type="button"
                        onClick={() => { setSiteVisitDone(''); setSiteVisitRemarks(''); }}
                        className="text-[12px] text-gray-400 hover:text-gray-600 font-['Poppins',sans-serif] underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Site Visit Remarks - shown when site visit is 'yes' */}
                {siteVisitDone === 'yes' && (
                  <div className="flex flex-col gap-[9px] mb-6">
                    <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
                      Site Visit Observations
                      <span className="text-[#888] text-[12px] ml-2">(Optional)</span>
                    </p>
                    <textarea
                      value={siteVisitRemarks}
                      onChange={(e) => setSiteVisitRemarks(e.target.value)}
                      className="w-full h-[70px] px-[12px] py-[11px] font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none rounded-[12px] resize-none border border-[#d0d0d0] focus:border-[#1f3a5f]"
                      placeholder="Enter your observations from the site visit..."
                    />
                  </div>
                )}

                {/* Review Remarks */}
                <div className="flex flex-col gap-[9px] mb-6">
                  <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
                    <span>Review Remarks </span>
                    <span className="text-[#ff0c10]">*</span>
                  </p>
                  <textarea
                    value={verificationRemarks}
                    onChange={(e) => setVerificationRemarks(e.target.value)}
                    className="w-full h-[80px] px-[12px] py-[11px] font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none rounded-[12px] resize-none border border-[#d0d0d0] focus:border-[#1f3a5f]"
                    placeholder="Enter your review remarks (e.g., work quality assessment, compliance check notes)..."
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setShowReworkModal(true)}
                    disabled={processing}
                    className="px-6 py-3 bg-white border-2 border-red-500 text-red-600 rounded-lg font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                    Request Rework
                  </button>
                  <button
                    onClick={() => handleVerifyReconnection('approve')}
                    disabled={processing || !verificationRemarks.trim()}
                    className="px-10 py-3 bg-[#22c55e] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#16a34a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        Close Application
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Rework Modal */}
      {showReworkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-[500px]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">Request Rework</h2>
              <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">Specify what corrections are needed. The application will be sent back to the plumber.</p>
            </div>
            <div className="mb-6">
              <label className="block text-[14px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">Rework Remarks <span className="text-red-500">*</span></label>
              <textarea
                value={reworkRemarks}
                onChange={(e) => setReworkRemarks(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[14px] focus:outline-none focus:border-[#1f3a5f] resize-none"
                placeholder="Describe what needs to be corrected or redone..."
              />
            </div>
            <div className="flex items-center justify-end gap-4">
              <button onClick={() => { setShowReworkModal(false); setReworkRemarks(''); }} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors">Cancel</button>
              <button
                onClick={() => handleVerifyReconnection('rework')}
                disabled={processing || !reworkRemarks.trim()}
                className="px-6 py-2.5 bg-orange-600 text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Sending...</>
                ) : (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>Send Rework Request</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Engineer Action Card - only show when NOT in verification mode */}
      {!isReconnectionWorkSubmitted && !isReconnectionCompleted && (
      <div className="bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] p-6 mb-6">
        {forwarded ? (
          <div className="flex flex-col gap-[16px]">
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
                    This application has been forwarded to {forwardedTo}{forwardedAt ? ` on ${formatDate(forwardedAt)}` : ''}
                  </p>
                </div>
              </div>
              {application.fieldEngineerComments && (
                <div className="mt-2 pt-3 border-t border-[#a5d6a7]">
                  <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#2e7d32] mb-1">
                    Your Comments
                  </p>
                  <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141] bg-white rounded-[6px] p-3 border border-[#c8e6c9]">
                    {application.fieldEngineerComments}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : isPostPaymentAssignment ? (
          <>
            {/* Post-Payment Plumber Assignment Mode */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-[14px] text-blue-800 font-['Poppins',sans-serif]">
                <span className="font-bold">Action Required:</span> Payment has been verified by the Commissioner. Please assign a plumber to carry out the reconnection work at the site.
              </p>
            </div>

            {/* Comments Box */}
            <div className="flex flex-col gap-[9px] mb-6">
              <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
                <span>Comments </span>
                <span className="text-[#ff0c10]">*</span>
              </p>
              <textarea
                value={fieldEngineerComment}
                onChange={(e) => setFieldEngineerComment(e.target.value)}
                className="w-full h-[80px] px-[12px] py-[11px] font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none rounded-[12px] resize-none border border-[#d0d0d0] focus:border-[#1f3a5f]"
                placeholder="Enter your comments for the plumber assignment..."
              />
            </div>

            {/* Assign Plumber Dropdown */}
            <div className="flex flex-col gap-[9px] mb-6">
              <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
                <span>Assign Plumber </span>
                <span className="text-[#ff0c10]">*</span>
              </p>
              <select
                value={assignedPlumber}
                onChange={(e) => setAssignedPlumber(e.target.value)}
                className="w-[50%] px-[12px] py-[11px] font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none rounded-[12px] appearance-none cursor-pointer border border-[#d0d0d0] bg-white"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23170f49' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
              >
                <option value="">-- Select a Plumber --</option>
                <option value="Ramesh Kumar - PLB-KA-001">Ramesh Kumar - PLB-KA-001</option>
                <option value="Suresh Patil - PLB-KA-002">Suresh Patil - PLB-KA-002</option>
                <option value="Manoj Gowda - PLB-KA-003">Manoj Gowda - PLB-KA-003</option>
                <option value="Vijay Sharma - PLB-KA-004">Vijay Sharma - PLB-KA-004</option>
                <option value="Anil Reddy - PLB-KA-005">Anil Reddy - PLB-KA-005</option>
                <option value="Kiran Naik - PLB-KA-006">Kiran Naik - PLB-KA-006</option>
                <option value="Prasad Rao - PLB-KA-007">Prasad Rao - PLB-KA-007</option>
                <option value="Deepak Hegde - PLB-KA-008">Deepak Hegde - PLB-KA-008</option>
              </select>
            </div>

            {/* Site Visit Question */}
            <div className="flex flex-col gap-[9px] mb-6">
              <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
                Do you want to visit the site?
                <span className="text-[#888] text-[12px] ml-2">(Optional)</span>
              </p>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="siteVisitPost" value="yes" checked={wantsSiteVisit === 'yes'} onChange={(e) => setWantsSiteVisit(e.target.value)} className="w-[18px] h-[18px] accent-[#1f3a5f] cursor-pointer" />
                  <span className="font-['Poppins',sans-serif] text-[14px] text-[#170f49]">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="siteVisitPost" value="no" checked={wantsSiteVisit === 'no'} onChange={(e) => setWantsSiteVisit(e.target.value)} className="w-[18px] h-[18px] accent-[#1f3a5f] cursor-pointer" />
                  <span className="font-['Poppins',sans-serif] text-[14px] text-[#170f49]">No</span>
                </label>
                {wantsSiteVisit && (
                  <button type="button" onClick={() => setWantsSiteVisit('')} className="text-[12px] text-gray-400 hover:text-gray-600 font-['Poppins',sans-serif] underline">Clear</button>
                )}
              </div>
            </div>

            {/* Assign Plumber Button */}
            <div className="flex items-center justify-end pt-6">
              <button
                onClick={handleAssignPlumberReconnection}
                disabled={processing || !fieldEngineerComment.trim() || !assignedPlumber}
                className="px-8 py-3 bg-[#0078a0] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#006b8f] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {processing ? 'Processing...' : 'Assign Plumber & Forward'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Comments Box */}
            <div className="flex flex-col gap-[9px] mb-6">
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

            {/* Assign Plumber Dropdown */}
            <div className="flex flex-col gap-[9px] mb-6">
              <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
                <span>Assign Plumber </span>
                <span className="text-[#ff0c10]">*</span>
              </p>
              <div className="bg-white relative rounded-[12px]">
                <div className="absolute border border-[#d3d8ff] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)] -z-[1]" />
                <select
                  value={assignedPlumber}
                  onChange={(e) => setAssignedPlumber(e.target.value)}
                  className="w-[50%] px-[12px] py-[11px] bg-transparent font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none rounded-[12px] relative z-[1] appearance-none cursor-pointer border border-[#d0d0d0]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23170f49' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  <option value="">-- Select a Plumber --</option>
                  <option value="Ramesh Kumar - PLB-KA-001">Ramesh Kumar - PLB-KA-001</option>
                  <option value="Suresh Patil - PLB-KA-002">Suresh Patil - PLB-KA-002</option>
                  <option value="Manoj Gowda - PLB-KA-003">Manoj Gowda - PLB-KA-003</option>
                  <option value="Vijay Sharma - PLB-KA-004">Vijay Sharma - PLB-KA-004</option>
                  <option value="Anil Reddy - PLB-KA-005">Anil Reddy - PLB-KA-005</option>
                  <option value="Kiran Naik - PLB-KA-006">Kiran Naik - PLB-KA-006</option>
                  <option value="Prasad Rao - PLB-KA-007">Prasad Rao - PLB-KA-007</option>
                  <option value="Deepak Hegde - PLB-KA-008">Deepak Hegde - PLB-KA-008</option>
                </select>
              </div>
            </div>

            {/* Site Visit Question */}
            <div className="flex flex-col gap-[9px] mb-6">
              <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">
                Do you want to visit the site?
                <span className="text-[#888] text-[12px] ml-2">(Optional)</span>
              </p>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="siteVisit"
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
                    name="siteVisit"
                    value="no"
                    checked={wantsSiteVisit === 'no'}
                    onChange={(e) => setWantsSiteVisit(e.target.value)}
                    className="w-[18px] h-[18px] accent-[#1f3a5f] cursor-pointer"
                  />
                  <span className="font-['Poppins',sans-serif] text-[14px] text-[#170f49]">No</span>
                </label>
                {wantsSiteVisit && (
                  <button
                    type="button"
                    onClick={() => setWantsSiteVisit('')}
                    className="text-[12px] text-gray-400 hover:text-gray-600 font-['Poppins',sans-serif] underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Forward Button */}
            <div className="flex items-center justify-end pt-6">
              <button
                onClick={handleForward}
                disabled={processing || !fieldEngineerComment.trim()}
                className="px-8 py-3 bg-[#0078a0] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#006b8f] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {processing ? 'Processing...' : 'Forward to Commissioner'}
              </button>
            </div>
          </>
        )}
      </div>
      )}
    </div>
  );
}
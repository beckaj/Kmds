import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface RevenueOfficerChangeConnectionViewProps {
  applicationId: string;
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

export default function RevenueOfficerChangeConnectionView({ applicationId }: RevenueOfficerChangeConnectionViewProps) {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [revenueOfficerComment, setRevenueOfficerComment] = useState('');
  const [forwarded, setForwarded] = useState(false);
  const [forwardedTo, setForwardedTo] = useState('');
  const [forwardedAt, setForwardedAt] = useState('');

  useEffect(() => {
    loadApplicationData();
  }, [applicationId]);

  const loadApplicationData = async () => {
    try {
      setLoading(true);
      console.log('[REVENUE OFFICER CHANGE CONNECTION VIEW] Fetching application:', applicationId);
      
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
        console.error('[REVENUE OFFICER CHANGE CONNECTION VIEW] API Error:', response.statusText);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[REVENUE OFFICER CHANGE CONNECTION VIEW] API Response:', data);
      
      if (data.success && data.application) {
        setApplication(data.application);
        console.log('[REVENUE OFFICER CHANGE CONNECTION VIEW] Application loaded:', data.application);
        
        // Check if already forwarded by revenue officer
        const wf = data.application.workflow;
        const roWf = wf && wf.revenueOfficer;
        if (roWf && roWf.status === 'reviewed') {
          setForwarded(true);
          setForwardedTo(roWf.forwardedTo || 'Field Engineer');
          setForwardedAt(roWf.timestamp || '');
        }
      } else {
        console.error('[REVENUE OFFICER CHANGE CONNECTION VIEW] Error:', data.error);
      }
    } catch (error) {
      console.error('[REVENUE OFFICER CHANGE CONNECTION VIEW] Error loading application:', error);
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
    if (!revenueOfficerComment.trim()) {
      alert('Please enter comments before forwarding.');
      return;
    }

    setProcessing(true);
    try {
      console.log('[REVENUE OFFICER] Forwarding change connection application:', {
        applicationId: application.id,
        comment: revenueOfficerComment,
        forwardTo: 'Field Engineer'
      });
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/revenue_officer/forward`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: application.id,
            comment: revenueOfficerComment,
            forwardTo: 'Field Engineer'
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        console.log('[REVENUE OFFICER] Change connection application forwarded successfully');
        alert(`Application ${application.id} forwarded to Field Engineer successfully!\n\nComment: ${revenueOfficerComment}`);
        
        // Navigate back to change connection requests dashboard
        const event = new CustomEvent('navigate', { detail: '/jalanidhi/revenue-officer/tap-connection/change-connection-type' });
        window.dispatchEvent(event);
        
        // Update forwarded status
        setForwarded(true);
        setForwardedTo('Field Engineer');
        setForwardedAt(new Date().toISOString());
      } else {
        console.error('[REVENUE OFFICER] Error forwarding application:', data.error);
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
    const event = new CustomEvent('navigate', { detail: '/jalanidhi/revenue-officer/tap-connection/change-connection-type' });
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

  // Helpers for application data
  const rrData = application.rrData || {};
  const arrears = application.arrearDetails;
  const caseworkerWorkflow = application.workflow && application.workflow.caseworker ? application.workflow.caseworker : null;

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

      {/* Application Details Card */}
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
              {application.supportingDocName && (
                <ReadOnlyField label="Supporting Document" value={application.supportingDocName} />
              )}
              <ReadOnlyField label="Save to DigiLocker" value={application.saveToDigiLocker === 'yes' ? 'Yes' : application.saveToDigiLocker === 'no' ? 'No' : 'N/A'} />
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

      {/* Comments & History */}
      {(() => {
        const remarkEntries: RemarkEntry[] = [];
        const cwComment = caseworkerWorkflow && caseworkerWorkflow.comments ? caseworkerWorkflow.comments : (application.caseworkerComments || '');
        if (cwComment) {
          remarkEntries.push({ role: 'Caseworker', comment: cwComment, timestamp: caseworkerWorkflow && caseworkerWorkflow.timestamp ? caseworkerWorkflow.timestamp : '' });
        }
        return remarkEntries.length > 0 ? (
          <div className="mb-6">
            <RemarksTimeline remarks={remarkEntries} title="Comments & History" />
          </div>
        ) : null;
      })()}

      {/* Revenue Officer Action Card */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
          Revenue Officer Review
        </h2>
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
              {application.revenueOfficerComments && (
                <div className="mt-2 pt-3 border-t border-[#a5d6a7]">
                  <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#2e7d32] mb-1">
                    Your Comments
                  </p>
                  <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141] bg-white rounded-[6px] p-3 border border-[#c8e6c9]">
                    {application.revenueOfficerComments}
                  </p>
                </div>
              )}
            </div>
          </div>
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
                  value={revenueOfficerComment}
                  onChange={(e) => setRevenueOfficerComment(e.target.value)}
                  className="w-full h-[80px] px-[12px] py-[11px] bg-transparent font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none rounded-[12px] resize-none"
                  placeholder="Enter your comments for the Field Engineer..."
                />
              </div>
            </div>

            {/* Forward Button */}
            <div className="flex items-center justify-end pt-6">
              <button
                onClick={handleForward}
                disabled={processing || !revenueOfficerComment.trim()}
                className="px-8 py-3 bg-[#0078a0] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#006b8f] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {processing ? 'Processing...' : 'Forward to Field Engineer'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
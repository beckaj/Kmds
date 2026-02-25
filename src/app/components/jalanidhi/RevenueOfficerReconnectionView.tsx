import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import svgPaths from '../../../imports/svg-qcyk0j46yr';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface RevenueOfficerReconnectionViewProps {
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

export default function RevenueOfficerReconnectionView({ applicationId }: RevenueOfficerReconnectionViewProps) {
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
      console.log('[REVENUE OFFICER RECONNECTION VIEW] Fetching application:', applicationId);
      
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
        console.error('[REVENUE OFFICER RECONNECTION VIEW] API Error:', response.statusText);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[REVENUE OFFICER RECONNECTION VIEW] API Response:', data);
      
      if (data.success && data.application) {
        setApplication(data.application);
        console.log('[REVENUE OFFICER RECONNECTION VIEW] Application loaded:', data.application);
        
        // Check if already forwarded by revenue officer
        const wf = data.application.workflow;
        const roWf = wf && wf.revenueOfficer;
        if (roWf && roWf.status === 'reviewed') {
          setForwarded(true);
          setForwardedTo(roWf.forwardedTo || 'Field Engineer');
          setForwardedAt(roWf.timestamp || '');
        }
      } else {
        console.error('[REVENUE OFFICER RECONNECTION VIEW] Error:', data.error);
      }
    } catch (error) {
      console.error('[REVENUE OFFICER RECONNECTION VIEW] Error loading application:', error);
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
      console.log('[REVENUE OFFICER] Forwarding reconnection application:', {
        applicationId: application.id,
        comment: revenueOfficerComment,
        forwardTo: 'Commissioner'
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
            forwardTo: 'Commissioner'
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        console.log('[REVENUE OFFICER] Application forwarded successfully');
        alert(`Application ${application.id} forwarded to Commissioner successfully!\n\nComment: ${revenueOfficerComment}`);
        
        // Navigate back to reconnection requests dashboard
        const event = new CustomEvent('navigate', { detail: '/jalanidhi/revenue-officer/tap-connection/reconnection-requests' });
        window.dispatchEvent(event);
        
        // Update forwarded status
        setForwarded(true);
        setForwardedTo('Commissioner');
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
    const event = new CustomEvent('navigate', { detail: '/jalanidhi/revenue-officer/tap-connection/reconnection-requests' });
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

  // Helpers for reconnection data
  const rrData = application.rrData || {};
  const disconnection = application.disconnectionDetails;
  const arrears = application.arrearDetails;
  const payment = application.reconnectionPaymentDetails;
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
                  placeholder="Enter your comments for the Commissioner..."
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
                {processing ? 'Processing...' : 'Forward to Commissioner'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
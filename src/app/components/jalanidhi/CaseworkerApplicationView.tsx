import { useState, useEffect } from 'react';
import { ChevronLeft, User, MapPin, Droplet, FileText, Download, Wrench, Landmark } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import SectionTitle from './SectionTitle';

interface Application {
  id: string;
  type?: string;
  status: string;
  submittedAt: string;
  propertyDetails?: {
    district: string;
    ulb: string;
    ulbType?: string;
    authorityType?: string;
    ownershipType: string;
  };
  applicantDetails?: {
    applicantName: string;
    mobile: string;
    email?: string;
    fatherName?: string;
    aadharNumber?: string;
    doorNumber?: string;
    wardNumber?: string;
    street?: string;
    address?: string;
    state?: string;
    district?: string;
    city?: string;
    pincode?: string;
  };
  connectionDetails?: {
    connectionType: string;
    propertyType: string;
    propertyTypeCategory?: string;
    flatsOrHouses?: string;
  };
  plumberConnectionData?: {
    estimationRows: Array<{
      id: string;
      attribute: string;
      unitOfMeasurement: string;
      amount: string;
    }>;
    totalAmount: number;
    siteSketchUploaded: boolean;
    estimateUploaded: boolean;
    comments?: string;
  };
  plumberDetails?: {
    plumberName: string;
    plumberType?: string;
    firmName?: string;
  };
  bankDetails?: {
    fullName: string;
    bankName: string;
    branchName: string;
    bankAddress: string;
    accountNumber: string;
    ifscCode: string;
  };
  autoDebitWaterBill?: string;
  comments?: string;
  rrNumber?: string;
  rrData?: any;
  charges?: any;
  // Step 2 reconnection data
  hasUGDConnection?: string;
  disconnectionDetails?: {
    disconnectionReason: string;
    dateOfApproval: string;
  };
  arrearDetails?: {
    currentDemand: number;
    arrears: number;
    totalBill: number;
  };
  reconnectionPaymentDetails?: {
    serviceAppliedFor: string;
    paymentDate: string;
    orderNo: string;
    transactionNo: string;
    paymentStatus: string;
    currentDemand?: number;
    arrears?: number;
    totalDemand?: number;
  };
  // Step 3 reconnection data
  wantToChangeConnectionType?: string;
  newConnectionType?: string;
  reconnectionReason?: string;
  applicationFees?: number;
  existingConnection?: string;
  securityDeposit?: number;
  wantDigiLocker?: string;
  // Disconnection-specific fields
  disconnectionType?: string;
  disconnectionReason?: string;
  arrearPaymentDetails?: {
    serviceAppliedFor: string;
    paymentDate: string;
    orderNo: string;
    transactionNo: string;
    paymentStatus: string;
    amountPaid: number;
  };
  declarationAccepted?: boolean;
  // Change of Connection Type fields
  existingConnectionType?: string;
  supportingDocName?: string;
  saveToDigiLocker?: string;
}

interface CaseworkerApplicationViewProps {
  application: Application;
  onBack: () => void;
}

// Default sample data for when actual values are missing
const sampleData: Record<string, string> = {
  'District': 'Dharwad',
  'ULB': 'Hubballi-Dharwad',
  'ULB Type': 'City Corporation',
  'Authority Type': 'Board',
  'Ownership Type': 'Owner',
  'Property ID': 'PROP12345',
  'Applicant Name': 'Rajesh Kumar Sharma',
  'Father Name': 'Suresh Kumar Sharma',
  'Mobile': '9876543210',
  'Email': 'rajesh.kumar@email.com',
  'Aadhar Number': '1234-5678-9012',
  'Address': '42/3A, MG Road, 4th Cross, Hubballi',
  'Owner Name': 'Rajesh Kumar Sharma',
  'Door Number': '42/3A',
  'Ward Number': '15',
  'Street': 'MG Road, 4th Cross',
  'City': 'Hubballi',
  'State': 'Karnataka',
  'Pincode': '580030',
  'Mobile No': '9876543210',
  'Property Type': 'Residential',
  'Connection Type': 'Domestic',
  'Plot Number': 'PLT-45',
  'Survey Number': 'SRV-2024-001',
  'Property Address': '42/3A, MG Road, Hubballi',
  'Service Applied For': 'New Tap Connection',
  'Plumber Name': 'Sri Ganesh Plumbing',
  'Plumber Type': 'Licensed',
  'Firm Name': 'Sri Ganesh Plumbing Services',
  'Full Name': 'Rajesh Kumar S',
  'Bank Name': 'State Bank of India',
  'Branch Name': 'Hubballi Main Branch',
  'Bank Address': 'MG Road, Hubballi',
  'Account Number': '123456789012',
  'IFSC Code': 'SBIN0001234',
  'Auto Debit Water Bill': 'Yes',
  // Reconnection-specific sample data
  'Meter Category': 'Metered',
  'Meter Status': 'Working',
  'Meter Installed Date': '15/03/2019',
  'Scheme Name': 'Cauvery Water Supply',
  'Disconnection Reason': 'Non-payment of dues',
  'Date of Approval': '22/08/2024',
  'Current Demand': '2,450',
  'Arrears': '8,750',
  'Total Bill': '11,200',
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

export default function CaseworkerApplicationView({ 
  application, 
  onBack 
}: CaseworkerApplicationViewProps) {
  const [processing, setProcessing] = useState(false);
  const [caseworkerComment, setCaseworkerComment] = useState('');
  const [forwarded, setForwarded] = useState(false);
  const [forwardedTo, setForwardedTo] = useState('');
  const [forwardedAt, setForwardedAt] = useState('');

  // Check if already forwarded on load
  useEffect(() => {
    const wf = application.workflow && (application as any).workflow;
    const caseworkerWf = wf && wf.caseworker;
    if (caseworkerWf && caseworkerWf.status === 'reviewed') {
      setForwarded(true);
      setForwardedTo(caseworkerWf.forwardedTo || 'Revenue Officer');
      setForwardedAt(caseworkerWf.timestamp || '');
    }
  }, [application]);
  
  // Keep scheme defaults for forward call
  const schemeName = 'Har Ghar Jal';
  const schemeAmount = '5,00,000';
  const item1 = 'Meters';
  const item2 = 'Pipes';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const handleDirectForward = async () => {
    if (!caseworkerComment.trim()) {
      alert('Please enter comments before forwarding.');
      return;
    }

    setProcessing(true);
    try {
      console.log('[CASEWORKER] Forwarding application directly to Revenue Officer:', {
        applicationId: application.id,
        comment: caseworkerComment,
        forwardTo: 'Revenue Officer',
        scheme: { name: schemeName, amount: schemeAmount, item1, item2 }
      });
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/caseworker/forward`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: application.id,
            comment: caseworkerComment,
            forwardTo: 'Revenue Officer',
            scheme: { name: schemeName, amount: schemeAmount, item1, item2 }
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        console.log('[CASEWORKER] Application forwarded successfully to Revenue Officer');
        alert(`Application ${application.id} forwarded to Revenue Officer successfully!\n\nComment: ${caseworkerComment}`);
        onBack();
      } else {
        console.error('[CASEWORKER] Error forwarding application:', data.error);
        alert(`Error forwarding application: ${data.error}`);
      }
      
    } catch (error) {
      console.error('Error forwarding application:', error);
      alert(`Error forwarding application: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDirectForwardToFE = async () => {
    if (!caseworkerComment.trim()) {
      alert('Please enter comments before forwarding.');
      return;
    }

    setProcessing(true);
    try {
      console.log('[CASEWORKER] Forwarding disconnection application to Field Engineer:', {
        applicationId: application.id,
        comment: caseworkerComment,
        forwardTo: 'Field Engineer'
      });
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/caseworker/forward`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: application.id,
            comment: caseworkerComment,
            forwardTo: 'Field Engineer',
            scheme: { name: schemeName, amount: schemeAmount, item1, item2 }
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        console.log('[CASEWORKER] Disconnection application forwarded to Field Engineer');
        alert(`Application ${application.id} forwarded to Field Engineer successfully!\n\nComment: ${caseworkerComment}`);
        onBack();
      } else {
        console.error('[CASEWORKER] Error forwarding application:', data.error);
        alert(`Error forwarding application: ${data.error}`);
      }
      
    } catch (error) {
      console.error('Error forwarding application:', error);
      alert(`Error forwarding application: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  // Helpers for reconnection data
  const rrData = application.rrData || {};
  const disconnection = application.disconnectionDetails;
  const arrears = application.arrearDetails;
  const payment = application.reconnectionPaymentDetails;

  // Determine application type
  const isNewConnection = !application.type || application.type === 'newConnection';
  const isReconnection = application.type === 'reconnection';
  const isDisconnection = application.type === 'disconnection';
  const isChangeConnection = application.type === 'changeConnection';

  // Helpers for new connection data
  const propDetails = application.propertyDetails;
  const applicantDetails = application.applicantDetails;
  const connDetails = application.connectionDetails;
  const plumberDetails = application.plumberDetails;
  const plumberData = application.plumberConnectionData;
  const bankDetails = application.bankDetails;

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
        <SectionTitle title="Review Application" className="mb-2" />
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{application.id}</span>
        </p>
        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mt-1">
          Submitted on: {formatDate(application.submittedAt)}
        </p>
      </div>

      {/* === NEW TAP CONNECTION VIEW === */}
      {isNewConnection && (
        <>
          {/* Application Summary Card */}
          <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
              Application Summary
            </h2>

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
                      {(propDetails && propDetails.district) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">ULB</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {(propDetails && propDetails.ulb) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">ULB Type</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {(propDetails && propDetails.ulbType) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Authority Type</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {(propDetails && propDetails.authorityType) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Ownership Type</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                      {(propDetails && propDetails.ownershipType) || 'N/A'}
                    </p>
                  </div>
                  {propDetails && (propDetails as any).propertyId && (
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Property ID</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {(propDetails as any).propertyId}
                      </p>
                    </div>
                  )}
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
                      {(applicantDetails && applicantDetails.applicantName) || 'N/A'}
                    </p>
                  </div>
                  {applicantDetails && applicantDetails.fatherName && (
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Father's Name</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {applicantDetails.fatherName}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Mobile</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {(applicantDetails && applicantDetails.mobile) || 'N/A'}
                    </p>
                  </div>
                  {applicantDetails && applicantDetails.email && (
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Email</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {applicantDetails.email}
                      </p>
                    </div>
                  )}
                  {applicantDetails && applicantDetails.aadharNumber && (
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Aadhar Number</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {applicantDetails.aadharNumber}
                      </p>
                    </div>
                  )}
                  {applicantDetails && applicantDetails.address && (
                    <div className="md:col-span-3">
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Address</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {applicantDetails.address}
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
                      {(connDetails && connDetails.connectionType) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Property Type</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                      {(connDetails && connDetails.propertyType) || 'N/A'}
                    </p>
                  </div>
                  {connDetails && (connDetails as any).plotNumber && (
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Plot Number</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {(connDetails as any).plotNumber}
                      </p>
                    </div>
                  )}
                  {connDetails && (connDetails as any).surveyNumber && (
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Survey Number</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {(connDetails as any).surveyNumber}
                      </p>
                    </div>
                  )}
                  {connDetails && (connDetails as any).propertyAddress && (
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Property Address</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {(connDetails as any).propertyAddress}
                      </p>
                    </div>
                  )}
                  {connDetails && (connDetails as any).pincode && (
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Pincode</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {(connDetails as any).pincode}
                      </p>
                    </div>
                  )}
                  {plumberDetails && plumberDetails.plumberName && (
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Assigned Plumber</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {plumberDetails.plumberName}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bank Details */}
              {bankDetails && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Landmark className="w-5 h-5 text-[#1f3a5f]" />
                    <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                      Bank Account Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Account Holder Name</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {bankDetails.fullName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Bank Name</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {bankDetails.bankName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Branch Name</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {bankDetails.branchName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Branch Address</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {bankDetails.bankAddress || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Account Number</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {bankDetails.accountNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">IFSC Code</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {bankDetails.ifscCode || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {application.autoDebitWaterBill && (
                    <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm font-semibold text-gray-700 font-['Poppins',sans-serif] mb-1">
                        Auto-Debit Water Bill
                      </p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                        {application.autoDebitWaterBill}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Plumber Estimation Card */}
          <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
              Plumber Estimation & Documents
            </h2>

            <div className="space-y-6">
              {/* Plumber Info */}
              {plumberDetails && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Wrench className="w-5 h-5 text-[#1f3a5f]" />
                    <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                      Plumber Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Plumber Name</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {plumberDetails.plumberName || 'N/A'}
                      </p>
                    </div>
                    {plumberDetails.plumberType && (
                      <div>
                        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Plumber Type</p>
                        <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                          {plumberDetails.plumberType}
                        </p>
                      </div>
                    )}
                    {plumberDetails.firmName && (
                      <div>
                        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Firm Name</p>
                        <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                          {plumberDetails.firmName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cost Estimation */}
              <div>
                <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
                  Cost Estimation
                </h3>

                {plumberData && plumberData.estimationRows && plumberData.estimationRows.length > 0 ? (
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
                        Amount (Rs.)
                      </div>
                    </div>

                    <div className="bg-white">
                      {plumberData.estimationRows.map((row: any, index: number) => (
                        <div
                          key={row.id || index}
                          className="grid grid-cols-[60px_2fr_1.5fr_1fr] gap-4 px-6 py-3 border-b border-gray-100 last:border-0"
                        >
                          <div className="font-['Poppins',sans-serif] text-[14px] text-gray-600 text-center">
                            {index + 1}
                          </div>
                          <div className="font-['Poppins',sans-serif] text-[14px] text-gray-900">
                            {row.attribute || 'N/A'}
                          </div>
                          <div className="font-['Poppins',sans-serif] text-[14px] text-gray-700 text-center">
                            {row.unitOfMeasurement || 'N/A'}
                          </div>
                          <div className="font-['Poppins',sans-serif] text-[14px] text-gray-900 text-right">
                            Rs.{parseFloat(row.amount || '0').toFixed(2)}
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
                          Rs.{plumberData.totalAmount !== undefined && plumberData.totalAmount !== null ? Number(plumberData.totalAmount).toFixed(2) : '0.00'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="font-['Poppins',sans-serif] text-[14px] text-gray-500 italic">No estimation data available</p>
                )}
              </div>

              {/* Uploaded Documents */}
              <div>
                <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
                  Uploaded Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plumberData && plumberData.siteSketchUploaded && (
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-gray-900">Site_Sketch.pdf</p>
                          <p className="font-['Poppins',sans-serif] text-[12px] text-gray-600">PDF Document</p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-blue-100 rounded-md transition-colors">
                        <Download className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  )}
                  {plumberData && plumberData.estimateUploaded && (
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-gray-900">Cost_Estimate.pdf</p>
                          <p className="font-['Poppins',sans-serif] text-[12px] text-gray-600">PDF Document</p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-blue-100 rounded-md transition-colors">
                        <Download className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  )}
                  {(!plumberData || (!plumberData.siteSketchUploaded && !plumberData.estimateUploaded)) && (
                    <p className="font-['Poppins',sans-serif] text-[14px] text-gray-500 italic">No documents uploaded</p>
                  )}
                </div>
              </div>

              {/* Plumber Comments */}
              {plumberData && plumberData.comments && (
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <p className="text-sm font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">
                    Plumber's Comments:
                  </p>
                  <p className="font-['Poppins',sans-serif] text-[14px] text-gray-800">
                    {plumberData.comments}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* === RECONNECTION VIEW === */}
      {isReconnection && (
        <>
          {/* Application Details Card */}
          <div className="bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] p-6 mb-6">
            <div className="flex flex-col gap-[24px]">

              {/* RR Number */}
              <div className="flex flex-col gap-[12px]">
                <h2 className="font-['Poppins',sans-serif] font-semibold text-[20px] text-[#414141]">
                  Existing RR Number
                </h2>
                <p className="font-['Poppins',sans-serif] font-medium text-[16px] text-[#1f3a5f]">
                  {application.rrNumber || 'N/A'}
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
                  {application.hasUGDConnection === 'yes' ? 'Yes' : application.hasUGDConnection === 'no' ? 'No' : 'N/A'}
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
                  Payment Details
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
                  {application.wantToChangeConnectionType === 'yes' ? 'Yes' : application.wantToChangeConnectionType === 'no' ? 'No' : 'N/A'}
                </p>
              </div>

              {/* Connection Type Change Details */}
              {application.wantToChangeConnectionType === 'yes' && (
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
        </>
      )}

      {/* === DISCONNECTION VIEW === */}
      {isDisconnection && (
        <>
          <div className="bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] p-6 mb-6">
            <div className="flex flex-col gap-[24px]">

              {/* RR Number */}
              <div className="flex flex-col gap-[12px]">
                <h2 className="font-['Poppins',sans-serif] font-semibold text-[20px] text-[#414141]">
                  Existing RR Number
                </h2>
                <p className="font-['Poppins',sans-serif] font-medium text-[16px] text-[#1f3a5f]">
                  {application.rrNumber || 'N/A'}
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
                  <ReadOnlyField label="Meter Status" value={rrData.meterStatus} />
                  <ReadOnlyField label="Meter Installed Date" value={rrData.meterInstalledDate} />
                  <ReadOnlyField label="Scheme Name" value={rrData.schemeName} />
                </div>
              </div>

              <SectionDivider />

              {/* Disconnection Information */}
              <div className="flex flex-col gap-[16px]">
                <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
                  Disconnection Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[16px]">
                  <ReadOnlyField label="Disconnection Type" value={application.disconnectionType ? (application.disconnectionType === 'permanent' ? 'Permanent Disconnection' : 'Temporary Disconnection') : 'N/A'} />
                  <ReadOnlyField label="Reason for Disconnection" value={application.disconnectionReason || 'N/A'} />
                  <ReadOnlyField label="UGD Connection Linked" value={application.hasUGDConnection === 'yes' ? 'Yes' : application.hasUGDConnection === 'no' ? 'No' : 'N/A'} />
                </div>
              </div>

              <SectionDivider />

              {/* Current Arrears Details */}
              <div className="flex flex-col gap-[16px]">
                <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
                  Current Arrears Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[16px]">
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
                    <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141]">
                      Arrear Payment Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[40px] gap-y-[16px]">
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
        </>
      )}

      {/* === CHANGE OF CONNECTION TYPE VIEW === */}
      {isChangeConnection && (
        <>
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

              {/* Connection Details */}
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
        </>
      )}

      {/* Caseworker Review Card */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
          Caseworker Review
        </h2>

        <div>
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
              {application.caseworkerComments && (
                <div className="mt-2 pt-3 border-t border-[#a5d6a7]">
                  <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#2e7d32] mb-1">
                    Your Comments
                  </p>
                  <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141] bg-white rounded-[6px] p-3 border border-[#c8e6c9]">
                    {application.caseworkerComments}
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
                  value={caseworkerComment}
                  onChange={(e) => setCaseworkerComment(e.target.value)}
                  className="w-full h-[80px] px-[12px] py-[11px] bg-transparent font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none rounded-[12px] resize-none"
                  placeholder={isDisconnection ? "Enter your comments for the Field Engineer..." : "Enter your comments for the Revenue Officer..."}
                />
              </div>
            </div>

            {/* Forward Button */}
            <div className="flex items-center justify-end pt-6">
              <button
                onClick={isDisconnection ? handleDirectForwardToFE : handleDirectForward}
                disabled={processing}
                className="px-8 py-3 bg-[#0078a0] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#006b8f] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {processing ? 'Processing...' : isDisconnection ? 'Forward to Field Engineer' : 'Forward to Revenue Officer'}
              </button>
            </div>
          </>
        )}
        </div>
      </div>

    </div>
  );
}
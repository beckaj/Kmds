import { ChevronLeft, Check, MapPin, Droplets, CreditCard, Users, Clock, CheckCircle, FileText, Unplug } from 'lucide-react';
import SectionTitle from './SectionTitle';

interface Application {
  id: string;
  citizenId: string;
  type?: string; // "reconnection", "newConnection", "disconnection"
  rrNumber?: string;
  rrData?: {
    district: string;
    ulb: string;
    ulbType: string;
    authorityType: string;
    ownerName: string;
    doorNumber: string;
    wardNumber: string;
    street: string;
    address: string;
    city: string;
    propertyDistrict: string;
    state: string;
    pincode: string;
    mobileNo: string;
    connectionType: string;
    meterCategory: string;
    motorStatus: string;
    meterInstalledDate: string;
    schemeName: string;
  };
  charges?: {
    reconnectionFee: number;
    inspectionFee: number;
    serviceTax: number;
    total: number;
  };
  // Step 2 reconnection data
  hasUGDConnection?: string;
  disconnectionDetails?: {
    disconnectionReason: string;
    dateOfApproval: string;
  };
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
  };
  // Step 3 reconnection data
  wantToChangeConnectionType?: string;
  newConnectionType?: string;
  reconnectionReason?: string;
  applicationFees?: number;
  existingConnection?: string;
  securityDeposit?: number;
  wantDigiLocker?: string;
  // New tap connection fields
  propertyDetails: {
    district: string;
    ulb: string;
    ulbType: string;
    authorityType: string;
    ownershipType: string;
  };
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
    state?: string;
    district?: string;
    city?: string;
    pincode?: string;
  };
  communicationDetails?: {
    houseDoorNo?: string;
    wardNo?: string;
    street?: string;
    address?: string;
    state?: string;
    district?: string;
    city?: string;
    pincode?: string;
  };
  existingConnectionDetails?: {
    rrNumber?: string;
    meterCategory?: string;
    connectionStatus?: string;
    existingConnectionType?: string;
  };
  connectionDetails: {
    connectionType: string;
    propertyType: string;
    propertyTypeCategory?: string;
    flatsOrHouses?: string;
  };
  plumberDetails?: {
    plumberName: string;
    plumberType?: string;
    firmName?: string;
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
  status: string;
  submittedAt: string;
  currentStage: string;
}

interface ApplicationSummaryViewProps {
  application: Application;
  onBack: () => void;
  isPlumberView?: boolean;
  onAccept?: (appId: string) => void;
  onDecline?: (appId: string) => void;
  processing?: boolean;
}

export default function ApplicationSummaryView({ application, onBack, isPlumberView, onAccept, onDecline, processing }: ApplicationSummaryViewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const getQueueText = (stage: string) => {
    const stageMap: { [key: string]: string } = {
      plumber: 'Plumber',
      caseworker: 'Caseworker',
      fieldEngineer1: 'Field Engineer',
      revenueOfficer: 'Revenue Officer',
      commissioner: 'Commissioner',
      fieldEngineer2: 'Field Engineer',
      completed: 'Completed',
    };
    return stageMap[stage] || stage;
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending_plumber: 'Pending',
      pending_applicant_review: 'Under Review',
      pending_caseworker: 'Processing',
      sentToCaseworker: 'Sent to Caseworker',
      declined_by_plumber: 'Declined',
      approved: 'Approved',
    };
    return statusMap[status] || status;
  };

  const isReconnection = application.type === 'reconnection';
  const isDisconnection = application.type === 'disconnection';

  const reconnectionSteps = [
    { number: 1, label: "Application Details" },
    { number: 2, label: "Charges Details" },
    { number: 3, label: "Reconnection Details" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[#1f3a5f] hover:text-[#27548a] transition-colors mb-4 font-['Poppins',sans-serif] font-semibold"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Applications
        </button>
        <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
          Application Summary
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          {isReconnection ? 'Tap Reconnection Application Details' : isDisconnection ? 'Tap Disconnection Application Details' : 'New Tap Connection Application Details'}
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden">
        {/* Status Header Banner */}
        <div className="bg-[#1f3a5f] text-white px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white font-['Poppins',sans-serif] text-lg font-semibold">
                Application ID: <span className="font-mono font-bold">{application.id}</span>
              </p>
              {(isReconnection || isDisconnection) && application.rrNumber && (
                <p className="text-blue-200 font-['Poppins',sans-serif] text-sm mt-1">
                  RR Number: <span className="font-semibold text-white">{application.rrNumber}</span>
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-blue-100 font-['Poppins',sans-serif] text-sm mb-1">
                Submitted: {formatDate(application.submittedAt)}
              </p>
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                application.status === 'reconnection_completed'
                  ? 'bg-green-400 text-green-900'
                  : application.status.includes('pending') 
                  ? 'bg-yellow-400 text-yellow-900' 
                  : application.status.includes('approved')
                  ? 'bg-green-400 text-green-900'
                  : application.status.includes('declined')
                  ? 'bg-red-400 text-red-900'
                  : 'bg-gray-400 text-gray-900'
              }`}>
                {application.status === 'reconnection_completed' ? 'Reconnection Completed' : getStatusText(application.status)}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {isReconnection ? (
            /* ========== RECONNECTION APPLICATION - COMPLETED SUMMARY ========== */
            <>
              {/* Completion Status Banner */}
              {(application.status === 'reconnection_completed' || application.currentStage === 'completed') && (
                <div className="mb-8 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 flex-shrink-0">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-['Poppins',sans-serif] text-xl font-bold text-emerald-800">Reconnection Completed</h2>
                      <p className="font-['Poppins',sans-serif] text-sm text-emerald-600 mt-0.5">
                        Your tap water reconnection request has been successfully processed and closed.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-emerald-500 text-white font-['Poppins',sans-serif] shadow-sm">
                        <Check className="w-4 h-4" />
                        Closed
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Reference Card */}
              <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-[#1f3a5f]/5 rounded-xl border border-[#1f3a5f]/15 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-[#1f3a5f] rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-['Poppins',sans-serif] text-xs font-semibold text-gray-500 uppercase tracking-wide">RR Number</p>
                  </div>
                  <p className="font-['Poppins',sans-serif] text-xl font-bold text-[#1f3a5f]">{application.rrNumber || 'N/A'}</p>
                </div>
                <div className="bg-[#1f3a5f]/5 rounded-xl border border-[#1f3a5f]/20 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-[#1f3a5f] rounded-lg flex items-center justify-center">
                      <Droplets className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-['Poppins',sans-serif] text-xs font-semibold text-gray-500 uppercase tracking-wide">Connection Type</p>
                  </div>
                  <p className="font-['Poppins',sans-serif] text-xl font-bold text-[#1f3a5f]">{application.rrData && application.rrData.connectionType ? application.rrData.connectionType : 'N/A'}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-['Poppins',sans-serif] text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Charges</p>
                  </div>
                  <p className="font-['Poppins',sans-serif] text-xl font-bold text-emerald-700">
                    {application.charges && application.charges.total != null ? '\u20B9' + application.charges.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Owner & Property Details */}
              <div className="mb-6">
                <SectionTitle title="Owner & Property Details" className="mb-5" />
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
                    <InfoRow label="Owner Name" value={application.rrData && application.rrData.ownerName ? application.rrData.ownerName : 'N/A'} />
                    <InfoRow label="Mobile Number" value={application.rrData && application.rrData.mobileNo ? application.rrData.mobileNo : 'N/A'} />
                    <InfoRow label="District" value={application.rrData && application.rrData.district ? application.rrData.district : 'N/A'} />
                    <InfoRow label="ULB" value={application.rrData && application.rrData.ulb ? application.rrData.ulb : 'N/A'} />
                  </div>
                  <div className="mt-5 pt-5 border-t border-gray-200">
                    <p className="font-['Poppins',sans-serif] font-semibold text-sm text-[#1f3a5f] mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Property Address
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-3">
                      <InfoRow label="Door No" value={application.rrData && application.rrData.doorNumber ? application.rrData.doorNumber : 'N/A'} compact />
                      <InfoRow label="Ward No" value={application.rrData && application.rrData.wardNumber ? application.rrData.wardNumber : 'N/A'} compact />
                      <InfoRow label="Street" value={application.rrData && application.rrData.street ? application.rrData.street : 'N/A'} compact />
                      <InfoRow label="City" value={application.rrData && application.rrData.city ? application.rrData.city : 'N/A'} compact />
                      <InfoRow label="State" value={application.rrData && application.rrData.state ? application.rrData.state : 'N/A'} compact />
                      <InfoRow label="Pincode" value={application.rrData && application.rrData.pincode ? application.rrData.pincode : 'N/A'} compact />
                    </div>
                    {application.rrData && application.rrData.address && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <InfoRow label="Full Address" value={application.rrData.address} compact />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Connection Details */}
              <div className="mb-6">
                <SectionTitle title="Connection Details" className="mb-5" />
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                    <InfoRow label="Connection Type" value={application.rrData && application.rrData.connectionType ? application.rrData.connectionType : 'N/A'} />
                    <InfoRow label="Meter Category" value={application.rrData && application.rrData.meterCategory ? application.rrData.meterCategory : 'N/A'} />
                    <InfoRow label="Motor Status" value={application.rrData && application.rrData.motorStatus ? application.rrData.motorStatus : 'N/A'} />
                    <InfoRow label="Scheme Name" value={application.rrData && application.rrData.schemeName ? application.rrData.schemeName : 'N/A'} />
                    <InfoRow label="Reconnection Reason" value={application.reconnectionReason || 'N/A'} />
                    {application.wantToChangeConnectionType === 'yes' && (
                      <InfoRow label="Changed To" value={application.newConnectionType || 'N/A'} />
                    )}
                  </div>
                  {application.disconnectionDetails && (
                    <div className="mt-5 pt-5 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <InfoRow label="Disconnection Reason" value={application.disconnectionDetails.disconnectionReason || 'N/A'} />
                        <InfoRow label="Disconnection Approval Date" value={application.disconnectionDetails.dateOfApproval || 'N/A'} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="mb-6">
                <SectionTitle title="Financial Summary" className="mb-5" />

                {/* Arrears & Charges Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                  <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
                    <p className="font-['Poppins',sans-serif] text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Current Demand</p>
                    <p className="font-['Poppins',sans-serif] text-xl font-bold text-[#1f3a5f]">
                      {application.arrearDetails && application.arrearDetails.currentDemand != null ? '\u20B9' + application.arrearDetails.currentDemand : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 text-center">
                    <p className="font-['Poppins',sans-serif] text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Arrears</p>
                    <p className="font-['Poppins',sans-serif] text-xl font-bold text-orange-700">
                      {application.arrearDetails && application.arrearDetails.arrears != null ? '\u20B9' + application.arrearDetails.arrears : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4 text-center">
                    <p className="font-['Poppins',sans-serif] text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Bill</p>
                    <p className="font-['Poppins',sans-serif] text-xl font-bold text-indigo-700">
                      {application.arrearDetails && application.arrearDetails.totalBill != null ? '\u20B9' + application.arrearDetails.totalBill : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
                    <p className="font-['Poppins',sans-serif] text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Reconnection Charges</p>
                    <p className="font-['Poppins',sans-serif] text-xl font-bold text-emerald-700">
                      {application.charges && application.charges.total != null ? '\u20B9' + application.charges.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Charges Breakdown */}
                {application.charges && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
                    <div className="bg-[#1f3a5f]/10 px-5 py-3 border-b border-gray-200">
                      <p className="font-['Poppins',sans-serif] text-sm font-bold text-[#1f3a5f]">Charges Breakdown</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      <div className="px-5 py-3 flex justify-between items-center">
                        <span className="font-['Poppins',sans-serif] text-sm text-gray-700">Reconnection Fee</span>
                        <span className="font-['Poppins',sans-serif] text-sm font-medium text-gray-900">{'\u20B9'}{application.charges.reconnectionFee != null ? application.charges.reconnectionFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
                      </div>
                      <div className="px-5 py-3 flex justify-between items-center">
                        <span className="font-['Poppins',sans-serif] text-sm text-gray-700">Inspection Fee</span>
                        <span className="font-['Poppins',sans-serif] text-sm font-medium text-gray-900">{'\u20B9'}{application.charges.inspectionFee != null ? application.charges.inspectionFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
                      </div>
                      <div className="px-5 py-3 flex justify-between items-center">
                        <span className="font-['Poppins',sans-serif] text-sm text-gray-700">Service Tax</span>
                        <span className="font-['Poppins',sans-serif] text-sm font-medium text-gray-900">{'\u20B9'}{application.charges.serviceTax != null ? application.charges.serviceTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
                      </div>
                      <div className="px-5 py-3 flex justify-between items-center bg-[#1f3a5f]/5">
                        <span className="font-['Poppins',sans-serif] text-sm font-bold text-[#1f3a5f]">Total Amount</span>
                        <span className="font-['Poppins',sans-serif] text-base font-bold text-[#1f3a5f]">{'\u20B9'}{application.charges.total != null ? application.charges.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Confirmation */}
                {application.reconnectionPaymentDetails && (
                  <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <p className="font-['Poppins',sans-serif] text-sm font-bold text-emerald-800">Payment Confirmed</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                      <InfoRow label="Payment Date" value={application.reconnectionPaymentDetails.paymentDate || 'N/A'} compact />
                      <InfoRow label="Transaction No" value={application.reconnectionPaymentDetails.transactionNo || 'N/A'} compact />
                      <InfoRow label="Order No" value={application.reconnectionPaymentDetails.orderNo || 'N/A'} compact />
                      <div className="space-y-1">
                        <p className="font-['Poppins',sans-serif] text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</p>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">
                          <Check className="w-3 h-3" />
                          {application.reconnectionPaymentDetails.paymentStatus || 'Paid'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Workflow Journey Timeline */}
              <div className="mb-6">
                <SectionTitle title="Application Journey" className="mb-5" />
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-emerald-300" />

                    {/* Timeline items */}
                    <div className="space-y-6">
                      <div className="flex items-start gap-4 relative">
                        <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <p className="font-['Poppins',sans-serif] text-sm font-bold text-gray-900">Application Submitted by Citizen</p>
                            <p className="font-['Poppins',sans-serif] text-xs text-gray-500">{formatDate(application.submittedAt)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 relative">
                        <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
                          <p className="font-['Poppins',sans-serif] text-sm font-bold text-gray-900">Reviewed by Caseworker</p>
                          <p className="font-['Poppins',sans-serif] text-xs text-gray-500 mt-0.5">Application forwarded for field verification</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 relative">
                        <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
                          <p className="font-['Poppins',sans-serif] text-sm font-bold text-gray-900">Field Engineer Review & Site Visit</p>
                          <p className="font-['Poppins',sans-serif] text-xs text-gray-500 mt-0.5">Forwarded to Revenue Officer with recommendations</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 relative">
                        <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
                          <p className="font-['Poppins',sans-serif] text-sm font-bold text-gray-900">Revenue Officer Approval</p>
                          <p className="font-['Poppins',sans-serif] text-xs text-gray-500 mt-0.5">Charges assessed and forwarded to Commissioner</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 relative">
                        <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
                          <p className="font-['Poppins',sans-serif] text-sm font-bold text-gray-900">Commissioner Approval</p>
                          <p className="font-['Poppins',sans-serif] text-xs text-gray-500 mt-0.5">Application approved and payment request generated</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 relative">
                        <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
                          <p className="font-['Poppins',sans-serif] text-sm font-bold text-gray-900">Payment Completed</p>
                          <p className="font-['Poppins',sans-serif] text-xs text-gray-500 mt-0.5">
                            {application.reconnectionPaymentDetails && application.reconnectionPaymentDetails.transactionNo
                              ? 'Transaction No: ' + application.reconnectionPaymentDetails.transactionNo
                              : 'All dues cleared and payment verified'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 relative">
                        <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
                          <p className="font-['Poppins',sans-serif] text-sm font-bold text-gray-900">Plumber Reconnection Work</p>
                          <p className="font-['Poppins',sans-serif] text-xs text-gray-500 mt-0.5">Reconnection work completed and report submitted via mobile app</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 relative">
                        <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 bg-emerald-50 rounded-lg border-2 border-emerald-300 p-4">
                          <p className="font-['Poppins',sans-serif] text-sm font-bold text-emerald-800">Application Closed by Field Engineer</p>
                          <p className="font-['Poppins',sans-serif] text-xs text-emerald-600 mt-0.5">Reconnection work verified and application closed successfully</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connection Type Change (if applicable) */}
              {application.wantToChangeConnectionType === 'yes' && (
                <div className="mb-6">
                  <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      <p className="font-['Poppins',sans-serif] text-sm font-bold text-blue-800">Connection Type Changed</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                      <InfoRow label="Previous Connection" value={application.existingConnection || 'N/A'} compact />
                      <InfoRow label="New Connection" value={application.newConnectionType || 'N/A'} compact />
                      <InfoRow label="Security Deposit" value={application.securityDeposit != null ? '\u20B9' + application.securityDeposit : 'N/A'} compact />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : isDisconnection ? (
            /* ========== DISCONNECTION APPLICATION SUMMARY ========== */
            <>
              {/* 1. Existing RR Number */}
              <div className="mb-8">
                <SectionTitle title="Existing RR Number" className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoRow label="RR Number" value={application.rrNumber || 'N/A'} />
                  <InfoRow label="Disconnection Type" value={application.disconnectionType ? (application.disconnectionType === 'permanent' ? 'Permanent Disconnection' : 'Temporary Disconnection') : 'N/A'} />
                </div>
              </div>

              {/* 2. Applicant Details */}
              <div className="mb-8">
                <SectionTitle title="Applicant Details" className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoRow label="District" value={application.rrData && application.rrData.district ? application.rrData.district : 'N/A'} />
                  <InfoRow label="ULB" value={application.rrData && application.rrData.ulb ? application.rrData.ulb : 'N/A'} />
                  <InfoRow label="ULB Type" value={application.rrData && application.rrData.ulbType ? application.rrData.ulbType : 'N/A'} />
                </div>
              </div>

              {/* 3. Property Details */}
              <div className="mb-8">
                <SectionTitle title="Property Details" className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <InfoRow label="Owner Name" value={application.rrData && application.rrData.ownerName ? application.rrData.ownerName : 'N/A'} />
                  <InfoRow label="Mobile Number" value={application.rrData && application.rrData.mobileNo ? application.rrData.mobileNo : 'N/A'} />
                </div>

                {/* Property Address */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="font-['Poppins',sans-serif] font-bold text-base text-[#1f3a5f] mb-4">Property Address</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoRow label="Door Number" value={application.rrData && application.rrData.doorNumber ? application.rrData.doorNumber : 'N/A'} compact />
                    <InfoRow label="Ward Number" value={application.rrData && application.rrData.wardNumber ? application.rrData.wardNumber : 'N/A'} compact />
                    <InfoRow label="Street" value={application.rrData && application.rrData.street ? application.rrData.street : 'N/A'} compact />
                    <InfoRow label="City" value={application.rrData && application.rrData.city ? application.rrData.city : 'N/A'} compact />
                    <InfoRow label="State" value={application.rrData && application.rrData.state ? application.rrData.state : 'N/A'} compact />
                    <InfoRow label="Pincode" value={application.rrData && application.rrData.pincode ? application.rrData.pincode : 'N/A'} compact />
                  </div>
                  {application.rrData && application.rrData.address && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <InfoRow label="Full Address" value={application.rrData.address} compact />
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Connection Details */}
              <div className="mb-8">
                <SectionTitle title="Connection Details" className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoRow label="Connection Type" value={application.rrData && application.rrData.connectionType ? application.rrData.connectionType : 'N/A'} />
                  <InfoRow label="Meter Category" value={application.rrData && application.rrData.meterCategory ? application.rrData.meterCategory : 'N/A'} />
                  <InfoRow label="Meter Status" value={application.rrData && (application.rrData as any).meterStatus ? (application.rrData as any).meterStatus : 'N/A'} />
                  <InfoRow label="Meter Installed Date" value={application.rrData && application.rrData.meterInstalledDate ? application.rrData.meterInstalledDate : 'N/A'} />
                  <InfoRow label="Scheme Name" value={application.rrData && application.rrData.schemeName ? application.rrData.schemeName : 'N/A'} />
                </div>
              </div>

              {/* 5. Disconnection Information */}
              <div className="mb-8">
                <SectionTitle title="Disconnection Information" className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoRow label="Disconnection Type" value={application.disconnectionType ? (application.disconnectionType === 'permanent' ? 'Permanent Disconnection' : 'Temporary Disconnection') : 'N/A'} />
                  <InfoRow label="Reason for Disconnection" value={application.disconnectionReason || 'N/A'} />
                  <InfoRow label="UGD Connection Linked" value={application.hasUGDConnection === 'yes' ? 'Yes' : application.hasUGDConnection === 'no' ? 'No' : 'N/A'} />
                </div>
              </div>

              {/* 6. Current Arrears Details */}
              <div className="mb-8">
                <SectionTitle title="Current Arrears Details" className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoRow label="Current Demand" value={application.arrearDetails && application.arrearDetails.currentDemand != null ? '\u20B9' + application.arrearDetails.currentDemand : 'N/A'} />
                  <InfoRow label="Arrears" value={application.arrearDetails && application.arrearDetails.arrears != null ? '\u20B9' + application.arrearDetails.arrears : 'N/A'} />
                  <InfoRow label="Total Bill" value={application.arrearDetails && application.arrearDetails.totalBill != null ? '\u20B9' + application.arrearDetails.totalBill : 'N/A'} />
                </div>
              </div>

              {/* 7. Arrear Payment Details */}
              {application.arrearPaymentDetails && (
                <div className="mb-8">
                  <SectionTitle title="Arrear Payment Details" className="mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InfoRow label="Service Applied For" value={application.arrearPaymentDetails.serviceAppliedFor || 'N/A'} />
                    <InfoRow label="Payment Date" value={application.arrearPaymentDetails.paymentDate || 'N/A'} />
                    <InfoRow label="Order No" value={application.arrearPaymentDetails.orderNo || 'N/A'} />
                    <InfoRow label="Transaction No" value={application.arrearPaymentDetails.transactionNo || 'N/A'} />
                    <InfoRow label="Payment Status" value={application.arrearPaymentDetails.paymentStatus || 'N/A'} />
                    <InfoRow label="Amount Paid" value={application.arrearPaymentDetails.amountPaid != null ? '\u20B9' + application.arrearPaymentDetails.amountPaid : 'N/A'} />
                  </div>
                </div>
              )}

              {/* 8. Declaration */}
              {application.declarationAccepted && (
                <div className="mb-8">
                  <SectionTitle title="Declaration" className="mb-4" />
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-['Poppins',sans-serif] text-sm font-medium text-gray-700">
                        The applicant has declared that all information provided is true and accurate to the best of their knowledge.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ========== NEW TAP CONNECTION DETAILS (existing) ========== */
            <>
              {/* 1. Property Details Section */}
              <div className="mb-8">
                <SectionTitle title="Property Details" className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoRow label="District" value={application.propertyDetails && application.propertyDetails.district ? application.propertyDetails.district : 'N/A'} />
                  <InfoRow label="ULB / Municipality" value={application.propertyDetails && application.propertyDetails.ulb ? application.propertyDetails.ulb : 'N/A'} />
                  <InfoRow label="Authority Type" value={application.propertyDetails && application.propertyDetails.authorityType ? application.propertyDetails.authorityType : 'N/A'} />
                  <InfoRow label="ULB Type" value={application.propertyDetails && application.propertyDetails.ulbType ? application.propertyDetails.ulbType : 'N/A'} />
                  <InfoRow label="Ownership Type" value={application.propertyDetails && application.propertyDetails.ownershipType ? application.propertyDetails.ownershipType : 'N/A'} />
                </div>
              </div>

              {/* 2. Applicant Details Section */}
              <div className="mb-8">
                <SectionTitle title="Applicant Details" className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <InfoRow label="Applicant Name" value={application.applicantDetails && application.applicantDetails.applicantName ? application.applicantDetails.applicantName : 'N/A'} />
                  <InfoRow label="Father's Name" value={application.applicantDetails && application.applicantDetails.fatherName ? application.applicantDetails.fatherName : undefined} />
                  <InfoRow label="Mobile Number" value={application.applicantDetails && application.applicantDetails.mobile ? application.applicantDetails.mobile : 'N/A'} />
                  <InfoRow label="Email" value={application.applicantDetails && application.applicantDetails.email ? application.applicantDetails.email : undefined} />
                  <InfoRow label="Aadhar Number" value={application.applicantDetails && application.applicantDetails.aadharNumber ? application.applicantDetails.aadharNumber : undefined} />
                </div>

                {/* Address Details */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="font-['Poppins',sans-serif] font-bold text-base text-[#1f3a5f] mb-4">Residential Address</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoRow label="Door Number" value={application.applicantDetails && application.applicantDetails.doorNumber ? application.applicantDetails.doorNumber : undefined} compact />
                    <InfoRow label="Ward Number" value={application.applicantDetails && application.applicantDetails.wardNumber ? application.applicantDetails.wardNumber : undefined} compact />
                    <InfoRow label="Street" value={application.applicantDetails && application.applicantDetails.street ? application.applicantDetails.street : undefined} compact />
                    <InfoRow label="City" value={application.applicantDetails && application.applicantDetails.city ? application.applicantDetails.city : undefined} compact />
                    <InfoRow label="District" value={application.applicantDetails && application.applicantDetails.district ? application.applicantDetails.district : undefined} compact />
                    <InfoRow label="State" value={application.applicantDetails && application.applicantDetails.state ? application.applicantDetails.state : undefined} compact />
                    <InfoRow label="Pincode" value={application.applicantDetails && application.applicantDetails.pincode ? application.applicantDetails.pincode : undefined} compact />
                  </div>
                  {application.applicantDetails && application.applicantDetails.address && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <InfoRow label="Full Address" value={application.applicantDetails.address} compact />
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Communication Address (if different) */}
              {application.communicationDetails && Object.keys(application.communicationDetails).length > 0 && (
                <div className="mb-8">
                  <SectionTitle title="Communication Address" className="mb-4" />
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InfoRow label="Door Number" value={application.communicationDetails.houseDoorNo} compact />
                      <InfoRow label="Ward Number" value={application.communicationDetails.wardNo} compact />
                      <InfoRow label="Street" value={application.communicationDetails.street} compact />
                      <InfoRow label="City" value={application.communicationDetails.city} compact />
                      <InfoRow label="District" value={application.communicationDetails.district} compact />
                      <InfoRow label="State" value={application.communicationDetails.state} compact />
                      <InfoRow label="Pincode" value={application.communicationDetails.pincode} compact />
                    </div>
                    {application.communicationDetails.address && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <InfoRow label="Full Address" value={application.communicationDetails.address} compact />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. Existing Connection Details (if available) */}
              <div className="mb-8">
                <SectionTitle title="Existing Connection Details" className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoRow label="RR Number" value={application.existingConnectionDetails && application.existingConnectionDetails.rrNumber ? application.existingConnectionDetails.rrNumber : 'N/A'} />
                  <InfoRow label="Meter Category" value={application.existingConnectionDetails && application.existingConnectionDetails.meterCategory ? application.existingConnectionDetails.meterCategory : 'N/A'} />
                  <InfoRow label="Connection Status" value={application.existingConnectionDetails && application.existingConnectionDetails.connectionStatus ? application.existingConnectionDetails.connectionStatus : 'N/A'} />
                  <InfoRow label="Existing Connection Type" value={application.existingConnectionDetails && application.existingConnectionDetails.existingConnectionType ? application.existingConnectionDetails.existingConnectionType : 'N/A'} />
                </div>
              </div>

              {/* 5. Connection Details Section */}
              <div className="mb-8">
                <SectionTitle title="Connection Details" className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoRow label="Connection Type" value={application.connectionDetails && application.connectionDetails.connectionType ? application.connectionDetails.connectionType : 'N/A'} />
                  <InfoRow label="Property Type" value={application.connectionDetails && application.connectionDetails.propertyType ? application.connectionDetails.propertyType : 'N/A'} />
                  <InfoRow label="Property Category" value={application.connectionDetails && application.connectionDetails.propertyTypeCategory ? application.connectionDetails.propertyTypeCategory : undefined} />
                  <InfoRow label="Number of Flats/Houses" value={application.connectionDetails && application.connectionDetails.flatsOrHouses ? application.connectionDetails.flatsOrHouses : undefined} />
                </div>
              </div>

              {/* 6. Plumber Details Section */}
              {application.plumberDetails && (
                <div className="mb-8">
                  <SectionTitle title="Plumber Details" className="mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InfoRow label="Plumber Name" value={application.plumberDetails.plumberName} />
                    <InfoRow label="Plumber Type" value={application.plumberDetails.plumberType} />
                    <InfoRow label="Firm Name" value={application.plumberDetails.firmName} />
                  </div>
                </div>
              )}

              {/* 7. Plumber Connection Data (if plumber has submitted details) */}
              {application.plumberConnectionData && (
                <div className="mb-8">
                  <SectionTitle title="Plumber Submitted Details" className="mb-4" />
                  
                  {/* Documents Status */}
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mb-6">
                    <p className="font-['Poppins',sans-serif] font-bold text-base text-[#1f3a5f] mb-4">Documents Status</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        {application.plumberConnectionData.siteSketchUploaded ? (
                          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <span className="font-['Poppins',sans-serif] text-sm text-gray-700">
                          Site Sketch: {application.plumberConnectionData.siteSketchUploaded ? 'Uploaded' : 'Not Uploaded'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {application.plumberConnectionData.estimateUploaded ? (
                          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <span className="font-['Poppins',sans-serif] text-sm text-gray-700">
                          Estimate Document: {application.plumberConnectionData.estimateUploaded ? 'Uploaded' : 'Not Uploaded'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estimation Table */}
                  <div className="mb-6">
                    <p className="font-['Poppins',sans-serif] font-bold text-base text-[#1f3a5f] mb-4">Cost Estimation</p>
                    <div className="overflow-x-auto gov-table-scroll">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#27548a]/10">
                            <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[#1f3a5f] text-sm border border-gray-300">
                              #
                            </th>
                            <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[#1f3a5f] text-sm border border-gray-300">
                              Attribute
                            </th>
                            <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[#1f3a5f] text-sm border border-gray-300">
                              Unit of Measurement
                            </th>
                            <th className="px-4 py-3 text-right font-['Poppins',sans-serif] font-semibold text-[#1f3a5f] text-sm border border-gray-300">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {application.plumberConnectionData.estimationRows.map((row, index) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-['Poppins',sans-serif] text-sm text-gray-700 border border-gray-300">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3 font-['Poppins',sans-serif] text-sm text-gray-900 border border-gray-300">
                                {row.attribute}
                              </td>
                              <td className="px-4 py-3 font-['Poppins',sans-serif] text-sm text-gray-700 border border-gray-300">
                                {row.unitOfMeasurement}
                              </td>
                              <td className="px-4 py-3 font-['Poppins',sans-serif] text-sm text-gray-900 text-right border border-gray-300">
                                ₹{parseFloat(row.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-[#1f3a5f]/10 font-bold">
                            <td colSpan={3} className="px-4 py-3 font-['Poppins',sans-serif] text-sm text-[#1f3a5f] text-right border border-gray-300">
                              Total Amount:
                            </td>
                            <td className="px-4 py-3 font-['Poppins',sans-serif] text-sm text-[#1f3a5f] text-right border border-gray-300">
                              ₹{application.plumberConnectionData.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Comments */}
                  {application.plumberConnectionData.comments && (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <p className="font-['Poppins',sans-serif] font-bold text-base text-[#1f3a5f] mb-3">Plumber Comments</p>
                      <p className="font-['Poppins',sans-serif] text-sm text-gray-700 whitespace-pre-wrap">
                        {application.plumberConnectionData.comments}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center gap-4 pt-6 border-t border-gray-200">
            <button 
              onClick={onBack}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-['Poppins',sans-serif] font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to List
            </button>
            <div className="flex gap-4">
              {/* Show Accept/Decline only for plumber view and pending applications */}
              {isPlumberView && application.status === 'pending_plumber' && (
                <>
                  <button 
                    onClick={() => onDecline && onDecline(application.id)}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg font-['Poppins',sans-serif] font-semibold hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={processing}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {processing ? 'Processing...' : 'Decline'}
                  </button>
                  <button 
                    onClick={() => onAccept && onAccept(application.id)}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg font-['Poppins',sans-serif] font-semibold hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={processing}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {processing ? 'Processing...' : 'Accept'}
                  </button>
                </>
              )}
              {!isPlumberView && (
                <button className="px-6 py-3 bg-[#27548a] text-white rounded-lg font-['Poppins',sans-serif] font-semibold hover:bg-[#1f3a5f] transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for displaying info rows
function InfoRow({ label, value, compact = false }: { label: string; value?: string; compact?: boolean }) {
  // Show N/A if explicitly passed, otherwise hide empty values
  const displayValue = value === 'N/A' ? 'N/A' : value;
  if (!displayValue || displayValue === '') return null;
  
  return (
    <div className={compact ? 'space-y-1' : 'space-y-2'}>
      <p className="font-['Poppins',sans-serif] text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className={`font-['Poppins',sans-serif] ${compact ? 'text-sm' : 'text-base'} ${displayValue === 'N/A' ? 'text-gray-500' : 'text-gray-900'} capitalize break-words`}>
        {displayValue}
      </p>
    </div>
  );
}
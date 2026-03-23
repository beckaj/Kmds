import { useState, useEffect } from 'react';
import { ChevronLeft, User, MapPin, Droplet, Receipt, AlertCircle, Power, CheckCircle, ArrowRight } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../../../utils/supabase/info';
import SectionTitle from '../../SectionTitle';

interface DisconnectionApplication {
  id: string;
  type: 'disconnection';
  status: string;
  submittedAt?: string;
  createdAt?: string;
  
  // RR Number data
  rrNumber: string;
  rrData?: {
    ownerName: string;
    mobileNo: string;
    connectionType: string;
    propertyType?: string;
    meterCategory?: string;
    meterStatus?: string;
    meterInstalledDate?: string;
    schemeName?: string;
    doorNumber?: string;
    wardNumber?: string;
    street?: string;
    city?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
  
  // Disconnection-specific data
  disconnectionReason?: string;
  disconnectionDate?: string;
  disconnectionRequestedDate?: string;
  requestType?: string; // 'temporary' or 'permanent'
  temporaryDuration?: string;
  reconnectionDate?: string;
  additionalComments?: string;
  
  // Payment details
  paymentDetails?: {
    serviceAppliedFor: string;
    paymentDate: string;
    orderNo: string;
    transactionNo: string;
    paymentStatus: string;
    amount?: number;
  };
  
  // Outstanding dues
  outstandingDues?: {
    currentDemand: number;
    arrears: number;
    totalBill: number;
  };
  
  // Workflow
  workflow?: any;
}

interface CaseworkerDisconnectionViewProps {
  application: DisconnectionApplication;
  onBack: () => void;
}

export default function CaseworkerDisconnectionView({ 
  application, 
  onBack 
}: CaseworkerDisconnectionViewProps) {
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
      setForwardedTo(caseworkerWf.forwardedTo || 'Field Engineer');
      setForwardedAt(caseworkerWf.timestamp || '');
    }
  }, [application]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleForwardToFieldEngineer = async () => {
    if (!caseworkerComment.trim()) {
      alert('Please add a comment before forwarding.');
      return;
    }

    try {
      setProcessing(true);
      console.log('[CASEWORKER DISCONNECTION] Forwarding to Field Engineer:', {
        applicationId: application.id,
        comment: caseworkerComment,
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
          }),
        }
      );

      const data = await response.json();
      console.log('[CASEWORKER DISCONNECTION] Forward API Response:', data);

      if (response.ok && data.success) {
        alert('Application forwarded to Field Engineer successfully!');
        setForwarded(true);
        setForwardedTo('Field Engineer');
        setForwardedAt(new Date().toISOString());
        
        // Update local application status
        application.status = 'sentToFieldEngineerForDisconnection';
        
        // Delay back navigation to allow user to see success state
        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        console.error('[CASEWORKER DISCONNECTION] Forward Failed:', data);
        alert(`Failed to forward application: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[CASEWORKER DISCONNECTION] Error forwarding application:', error);
      alert('An error occurred while forwarding the application. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Back Button and Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[#1f3a5f] font-['Poppins',sans-serif] font-medium hover:underline mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Disconnection Requests
        </button>
        <SectionTitle title="Disconnection Application Review" className="mb-2" />
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Review and process disconnection request {application.id}
        </p>
      </div>

      {/* Application Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Info Card */}
          <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-sm overflow-hidden">
            <div className="bg-[#1f3a5f] px-6 py-4">
              <h3 className="font-['Poppins',sans-serif] font-semibold text-[16px] text-white">
                Application Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Application ID</p>
                  <p className="text-[#1f3a5f] font-['Poppins',sans-serif] font-semibold">{application.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">RR Number</p>
                  <p className="text-gray-900 font-['Poppins',sans-serif] font-medium">{application.rrNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Submitted Date</p>
                  <p className="text-gray-900 font-['Poppins',sans-serif]">
                    {application.submittedAt || application.createdAt ? formatDate(application.submittedAt || application.createdAt || '') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Current Status</p>
                  <p className="text-gray-900 font-['Poppins',sans-serif] capitalize">
                    {application.status.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Consumer Details Card */}
          <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-sm overflow-hidden">
            <div className="bg-[#1f3a5f] px-6 py-4 flex items-center gap-2">
              <User className="w-5 h-5 text-white" />
              <h3 className="font-['Poppins',sans-serif] font-semibold text-[16px] text-white">
                Consumer Details
              </h3>
            </div>
            <div className="p-6">
              {application.rrData && application.rrData.ownerName ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Owner Name</p>
                    <p className="text-gray-900 font-['Poppins',sans-serif] font-medium">{application.rrData.ownerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Mobile Number</p>
                    <p className="text-gray-900 font-['Poppins',sans-serif]">{application.rrData.mobileNo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Connection Type</p>
                    <p className="text-gray-900 font-['Poppins',sans-serif] capitalize">{application.rrData.connectionType || 'Domestic'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Property Type</p>
                    <p className="text-gray-900 font-['Poppins',sans-serif]">{application.rrData.propertyType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Meter Category</p>
                    <p className="text-gray-900 font-['Poppins',sans-serif]">{application.rrData.meterCategory || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Meter Status</p>
                    <p className="text-gray-900 font-['Poppins',sans-serif]">{application.rrData.meterStatus || 'N/A'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 font-['Poppins',sans-serif]">No consumer data available</p>
              )}
            </div>
          </div>

          {/* Property Address Card */}
          {application.rrData && (application.rrData.doorNumber || application.rrData.street || application.rrData.city) && (
            <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-sm overflow-hidden">
              <div className="bg-[#1f3a5f] px-6 py-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-white" />
                <h3 className="font-['Poppins',sans-serif] font-semibold text-[16px] text-white">
                  Property Address
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {application.rrData.doorNumber && (
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Door Number</p>
                      <p className="text-gray-900 font-['Poppins',sans-serif]">{application.rrData.doorNumber}</p>
                    </div>
                  )}
                  {application.rrData.wardNumber && (
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Ward Number</p>
                      <p className="text-gray-900 font-['Poppins',sans-serif]">{application.rrData.wardNumber}</p>
                    </div>
                  )}
                  {application.rrData.street && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Street</p>
                      <p className="text-gray-900 font-['Poppins',sans-serif]">{application.rrData.street}</p>
                    </div>
                  )}
                  {application.rrData.city && (
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">City</p>
                      <p className="text-gray-900 font-['Poppins',sans-serif]">{application.rrData.city}</p>
                    </div>
                  )}
                  {application.rrData.district && (
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">District</p>
                      <p className="text-gray-900 font-['Poppins',sans-serif]">{application.rrData.district}</p>
                    </div>
                  )}
                  {application.rrData.state && (
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">State</p>
                      <p className="text-gray-900 font-['Poppins',sans-serif]">{application.rrData.state}</p>
                    </div>
                  )}
                  {application.rrData.pincode && (
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Pincode</p>
                      <p className="text-gray-900 font-['Poppins',sans-serif]">{application.rrData.pincode}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Disconnection Details Card */}
          <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-sm overflow-hidden">
            <div className="bg-[#1f3a5f] px-6 py-4 flex items-center gap-2">
              <Power className="w-5 h-5 text-white" />
              <h3 className="font-['Poppins',sans-serif] font-semibold text-[16px] text-white">
                Disconnection Details
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Disconnection Reason</p>
                  <p className="text-gray-900 font-['Poppins',sans-serif]">{application.disconnectionReason || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Request Type</p>
                  <p className="text-gray-900 font-['Poppins',sans-serif] capitalize">{application.requestType || 'N/A'}</p>
                </div>
                {application.disconnectionRequestedDate && (
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Requested Date</p>
                    <p className="text-gray-900 font-['Poppins',sans-serif]">{formatDate(application.disconnectionRequestedDate)}</p>
                  </div>
                )}
                {application.disconnectionDate && (
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Disconnection Date</p>
                    <p className="text-gray-900 font-['Poppins',sans-serif]">{formatDate(application.disconnectionDate)}</p>
                  </div>
                )}
                {application.requestType === 'temporary' && application.temporaryDuration && (
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Temporary Duration</p>
                    <p className="text-gray-900 font-['Poppins',sans-serif]">{application.temporaryDuration}</p>
                  </div>
                )}
                {application.requestType === 'temporary' && application.reconnectionDate && (
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Planned Reconnection</p>
                    <p className="text-gray-900 font-['Poppins',sans-serif]">{formatDate(application.reconnectionDate)}</p>
                  </div>
                )}
                {application.additionalComments && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Additional Comments</p>
                    <p className="text-gray-900 font-['Poppins',sans-serif]">{application.additionalComments}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Outstanding Dues Card */}
          {application.outstandingDues && (application.outstandingDues.currentDemand || application.outstandingDues.arrears) ? (
            <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-sm overflow-hidden">
              <div className="bg-[#1f3a5f] px-6 py-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-white" />
                <h3 className="font-['Poppins',sans-serif] font-semibold text-[16px] text-white">
                  Outstanding Dues
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Current Demand</p>
                    <p className="text-xl font-['Poppins',sans-serif] font-bold text-[#1f3a5f]">
                      {formatCurrency(application.outstandingDues.currentDemand || 0)}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Arrears</p>
                    <p className="text-xl font-['Poppins',sans-serif] font-bold text-orange-600">
                      {formatCurrency(application.outstandingDues.arrears || 0)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Total Bill</p>
                    <p className="text-xl font-['Poppins',sans-serif] font-bold text-green-600">
                      {formatCurrency(application.outstandingDues.totalBill || 0)}
                    </p>
                  </div>
                </div>
                {application.outstandingDues.totalBill && application.outstandingDues.totalBill > 0 && (
                  <div className="mt-4 flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800 font-['Poppins',sans-serif]">
                      Outstanding dues must be cleared before disconnection is processed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Payment Details Card */}
          {application.paymentDetails && application.paymentDetails.transactionNo && (
            <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-sm overflow-hidden">
              <div className="bg-[#1f3a5f] px-6 py-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-white" />
                <h3 className="font-['Poppins',sans-serif] font-semibold text-[16px] text-white">
                  Payment Details
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Service Applied For</p>
                    <p className="text-gray-900 font-['Poppins',sans-serif]">{application.paymentDetails.serviceAppliedFor || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Date</p>
                    <p className="text-gray-900 font-['Poppins',sans-serif]">
                      {application.paymentDetails.paymentDate ? formatDate(application.paymentDetails.paymentDate) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Order Number</p>
                    <p className="text-gray-900 font-['Poppins',sans-serif]">{application.paymentDetails.orderNo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Transaction Number</p>
                    <p className="text-gray-900 font-['Poppins',sans-serif]">{application.paymentDetails.transactionNo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Status</p>
                    <p className="text-gray-900 font-['Poppins',sans-serif] capitalize">
                      {application.paymentDetails.paymentStatus || 'N/A'}
                    </p>
                  </div>
                  {application.paymentDetails.amount && (
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Amount Paid</p>
                      <p className="text-gray-900 font-['Poppins',sans-serif] font-semibold">
                        {formatCurrency(application.paymentDetails.amount)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Actions */}
        <div className="lg:col-span-1">
          {/* Caseworker Action Card */}
          <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-sm overflow-hidden sticky top-6">
            <div className="bg-[#1f3a5f] px-6 py-4">
              <h3 className="font-['Poppins',sans-serif] font-semibold text-[16px] text-white">
                Caseworker Action
              </h3>
            </div>
            <div className="p-6">
              {forwarded ? (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-['Poppins',sans-serif] font-semibold text-lg text-gray-900 mb-2">
                    Already Forwarded
                  </h4>
                  <p className="text-gray-600 font-['Poppins',sans-serif] text-sm mb-4">
                    This application has been forwarded to {forwardedTo}
                  </p>
                  {forwardedAt && (
                    <p className="text-gray-500 font-['Poppins',sans-serif] text-xs">
                      on {formatDate(forwardedAt)}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                      Add Comments <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={caseworkerComment}
                      onChange={(e) => setCaseworkerComment(e.target.value)}
                      placeholder="Enter your review comments..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] resize-none"
                    />
                  </div>

                  <button
                    onClick={handleForwardToFieldEngineer}
                    disabled={processing || !caseworkerComment.trim()}
                    className="w-full bg-[#1f3a5f] text-white py-3 px-4 rounded-lg font-['Poppins',sans-serif] font-semibold hover:bg-[#2d4a6f] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-5 h-5" />
                        Forward to Field Engineer
                      </>
                    )}
                  </button>

                  <p className="mt-4 text-xs text-gray-500 font-['Poppins',sans-serif] text-center">
                    Review the application details and forward to Field Engineer for verification
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
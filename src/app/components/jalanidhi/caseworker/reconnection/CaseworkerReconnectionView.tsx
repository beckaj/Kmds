import { useState, useEffect } from 'react';
import { ChevronLeft, User, MapPin, Droplet, Receipt, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../../../utils/supabase/info';
import SectionTitle from '../../SectionTitle';

interface ReconnectionApplication {
  id: string;
  type: 'reconnection';
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
  
  // Reconnection-specific data
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
  wantToChangeConnectionType?: string;
  newConnectionType?: string;
  reconnectionReason?: string;
  applicationFees?: number;
  existingConnection?: string;
  securityDeposit?: number;
  charges?: any;
  
  // Workflow
  workflow?: any;
}

interface CaseworkerReconnectionViewProps {
  application: ReconnectionApplication;
  onBack: () => void;
}

export default function CaseworkerReconnectionView({ 
  application, 
  onBack 
}: CaseworkerReconnectionViewProps) {
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

  const handleForwardToFieldEngineer = async () => {
    if (!caseworkerComment.trim()) {
      alert('Please enter comments before forwarding.');
      return;
    }

    setProcessing(true);
    try {
      console.log('[CASEWORKER RECONNECTION] Forwarding to Field Engineer:', {
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
            scheme: { name: 'Reconnection Service', amount: '0', item1: '', item2: '' }
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        console.log('[CASEWORKER RECONNECTION] Forwarded to Field Engineer successfully');
        alert(`Reconnection Application ${application.id} forwarded to Field Engineer successfully!\n\nComment: ${caseworkerComment}`);
        onBack();
      } else {
        console.error('[CASEWORKER RECONNECTION] Error forwarding:', data.error);
        alert(`Error forwarding application: ${data.error}`);
      }
      
    } catch (error) {
      console.error('[CASEWORKER RECONNECTION] Error:', error);
      alert(`Error forwarding application: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  // Helper data
  const rrData = application.rrData || {};
  const disconnection = application.disconnectionDetails;
  const arrears = application.arrearDetails;
  const payment = application.reconnectionPaymentDetails;

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
        <SectionTitle title="Review Reconnection Application" className="mb-2" />
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{application.id}</span>
        </p>
        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mt-1">
          Submitted on: {formatDate(application.submittedAt || application.createdAt || '')}
        </p>
      </div>

      {/* Application Summary Card */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
          Reconnection Application Summary
        </h2>

        <div className="space-y-6">
          {/* RR Number & Consumer Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Consumer Details (RR Number: {application.rrNumber})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Owner Name</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {rrData.ownerName || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Mobile No</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {rrData.mobileNo || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Connection Type</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                  {rrData.connectionType || 'Domestic'}
                </p>
              </div>
              {rrData.propertyType && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Property Type</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                    {rrData.propertyType}
                  </p>
                </div>
              )}
              {rrData.meterCategory && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Meter Category</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {rrData.meterCategory}
                  </p>
                </div>
              )}
              {rrData.meterStatus && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Meter Status</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {rrData.meterStatus}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Property Address */}
          {(rrData.doorNumber || rrData.street || rrData.city) && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-[#1f3a5f]" />
                <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  Property Address
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                {rrData.doorNumber && (
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Door Number</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {rrData.doorNumber}
                    </p>
                  </div>
                )}
                {rrData.wardNumber && (
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Ward Number</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {rrData.wardNumber}
                    </p>
                  </div>
                )}
                {rrData.street && (
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Street</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {rrData.street}
                    </p>
                  </div>
                )}
                {rrData.city && (
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">City</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {rrData.city}
                    </p>
                  </div>
                )}
                {rrData.district && (
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">District</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {rrData.district}
                    </p>
                  </div>
                )}
                {rrData.state && (
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">State</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {rrData.state}
                    </p>
                  </div>
                )}
                {rrData.pincode && (
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Pincode</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {rrData.pincode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Disconnection Details */}
          {disconnection && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-[#1f3a5f]" />
                <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  Disconnection Details
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Disconnection Reason</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {disconnection.disconnectionReason || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Date of Approval</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {disconnection.dateOfApproval || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Arrear Details */}
          {arrears && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="w-5 h-5 text-[#1f3a5f]" />
                <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  Arrear Details
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Current Demand</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    ₹{arrears.currentDemand && arrears.currentDemand.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Arrears</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    ₹{arrears.arrears && arrears.arrears.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Total Bill</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    ₹{arrears.totalBill && arrears.totalBill.toLocaleString() || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          {payment && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="w-5 h-5 text-[#1f3a5f]" />
                <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  Payment Details
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Payment Date</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {payment.paymentDate || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Order No</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {payment.orderNo || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Transaction No</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {payment.transactionNo || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Payment Status</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {payment.paymentStatus || 'N/A'}
                  </p>
                </div>
                {payment.totalDemand && (
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Total Demand</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      ₹{payment.totalDemand.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Connection Type Change Request */}
          {application.wantToChangeConnectionType === 'yes' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Droplet className="w-5 h-5 text-[#1f3a5f]" />
                <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  Connection Type Change Request
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Existing Connection</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                    {application.existingConnection || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">New Connection Type</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                    {application.newConnectionType || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reconnection Reason */}
          {application.reconnectionReason && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-[#1f3a5f]" />
                <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  Reconnection Reason
                </h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-[15px] text-gray-900 font-['Poppins',sans-serif]">
                  {application.reconnectionReason}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Card */}
      {!forwarded ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
            Caseworker Action
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                Comments <span className="text-red-500">*</span>
              </label>
              <textarea
                value={caseworkerComment}
                onChange={(e) => setCaseworkerComment(e.target.value)}
                placeholder="Enter your review comments..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f]"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleForwardToFieldEngineer}
                disabled={processing || !caseworkerComment.trim()}
                className="px-6 py-2.5 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-[#2d4a6f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Forward to Field Engineer'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800 font-['Poppins',sans-serif]">
                Application Already Forwarded
              </h3>
              <p className="text-sm text-green-700 font-['Poppins',sans-serif] mt-1">
                This application has been forwarded to {forwardedTo}
                {forwardedAt && ` on ${formatDate(forwardedAt)}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

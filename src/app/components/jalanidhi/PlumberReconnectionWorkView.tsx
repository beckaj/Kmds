import { useState } from 'react';
import { ChevronLeft, CheckCircle, FileText, CreditCard, User, MapPin, Droplets, Calendar, Phone, Hash, Download, XCircle, Wrench } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface PlumberReconnectionWorkViewProps {
  application: any;
  onBack: () => void;
}

export default function PlumberReconnectionWorkView({ application, onBack }: PlumberReconnectionWorkViewProps) {
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionCompleted, setActionCompleted] = useState(
    application.status === 'reconnection_completed' || 
    application.status === 'declined_by_plumber' ||
    application.status === 'plumber_accepted_reconnection' ||
    application.status === 'reconnection_work_submitted'
  );

  // Check if field report has been submitted via mobile
  const hasFieldReport = application.reconnectionFieldReport ? true : false;
  const fieldReport = application.reconnectionFieldReport || null;

  // Get plumber info
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const plumberId = userData.plumberLicense || 'PLB-001';
  const plumberName = userData.name || 'Plumber';

  // Extract application data safely
  const applicationNo = application.applicationNo || application.id || 'N/A';
  const rrNumber = application.rrNumber || 'N/A';
  const applicantName = (application.rrData && application.rrData.ownerName)
    ? application.rrData.ownerName
    : (application.applicantDetails && application.applicantDetails.applicantName ? application.applicantDetails.applicantName : 'N/A');
  const mobile = (application.rrData && application.rrData.mobileNo)
    ? application.rrData.mobileNo
    : (application.applicantDetails && application.applicantDetails.mobile ? application.applicantDetails.mobile : 'N/A');
  const doorNumber = (application.rrData && application.rrData.doorNumber)
    ? application.rrData.doorNumber
    : (application.applicantDetails && application.applicantDetails.doorNumber ? application.applicantDetails.doorNumber : 'N/A');
  const wardNumber = (application.rrData && application.rrData.wardNumber)
    ? application.rrData.wardNumber
    : (application.applicantDetails && application.applicantDetails.wardNumber ? application.applicantDetails.wardNumber : 'N/A');
  const street = (application.rrData && application.rrData.street)
    ? application.rrData.street
    : (application.applicantDetails && application.applicantDetails.street ? application.applicantDetails.street : 'N/A');
  const address = (application.rrData && application.rrData.address)
    ? application.rrData.address
    : (application.applicantDetails && application.applicantDetails.address ? application.applicantDetails.address : 'N/A');
  const city = (application.rrData && application.rrData.city)
    ? application.rrData.city
    : (application.applicantDetails && application.applicantDetails.city ? application.applicantDetails.city : 'N/A');
  const district = (application.rrData && application.rrData.propertyDistrict)
    ? application.rrData.propertyDistrict
    : (application.propertyDetails && application.propertyDetails.district ? application.propertyDetails.district : 'N/A');
  const state = (application.rrData && application.rrData.state)
    ? application.rrData.state
    : (application.applicantDetails && application.applicantDetails.state ? application.applicantDetails.state : 'Karnataka');
  const pincode = (application.rrData && application.rrData.pincode)
    ? application.rrData.pincode
    : (application.applicantDetails && application.applicantDetails.pincode ? application.applicantDetails.pincode : 'N/A');

  // Connection details
  const connectionType = (application.rrData && application.rrData.connectionType)
    ? application.rrData.connectionType
    : (application.connectionDetails && application.connectionDetails.connectionType ? application.connectionDetails.connectionType : 'N/A');
  const meterCategory = (application.rrData && application.rrData.meterCategory)
    ? application.rrData.meterCategory
    : (application.connectionDetails && application.connectionDetails.propertyType ? application.connectionDetails.propertyType : 'N/A');
  const motorStatus = (application.rrData && application.rrData.motorStatus)
    ? application.rrData.motorStatus
    : 'N/A';
  const meterInstalledDate = (application.rrData && application.rrData.meterInstalledDate)
    ? application.rrData.meterInstalledDate
    : 'N/A';
  const schemeName = (application.rrData && application.rrData.schemeName)
    ? application.rrData.schemeName
    : 'N/A';

  // Reconnection details
  const reconnectionReason = application.reconnectionReason || 'N/A';
  const existingConnection = application.existingConnection || 'N/A';
  const hasUGDConnection = application.hasUGDConnection || 'N/A';
  const disconnectionReason = (application.disconnectionDetails && application.disconnectionDetails.disconnectionReason)
    ? application.disconnectionDetails.disconnectionReason
    : 'N/A';
  const disconnectionDate = (application.disconnectionDetails && application.disconnectionDetails.dateOfApproval)
    ? application.disconnectionDetails.dateOfApproval
    : 'N/A';

  // Charges
  const charges = application.charges || {};
  const reconnectionFee = charges.reconnectionFee || 0;
  const inspectionFee = charges.inspectionFee || 0;
  const serviceTax = charges.serviceTax || 0;
  const totalCharges = charges.total || 0;

  // Payment details
  const paymentAmount = (application.paymentDetails && application.paymentDetails.amount)
    ? Number(application.paymentDetails.amount)
    : totalCharges;
  const paymentDate = (application.paymentDetails && application.paymentDetails.paidAt)
    ? application.paymentDetails.paidAt
    : 'N/A';
  const paymentReference = (application.paymentDetails && application.paymentDetails.transactionId)
    ? application.paymentDetails.transactionId
    : 'N/A';
  const paymentMode = (application.paymentDetails && application.paymentDetails.paymentMethod)
    ? application.paymentDetails.paymentMethod
    : 'Online Payment Gateway';

  // Certificate data
  const certificateNo = (application.certificateData && application.certificateData.certificateNo)
    ? application.certificateData.certificateNo
    : `DMA/JN/CERT/${applicationNo}`;
  const certificateDate = (application.certificateData && application.certificateData.issuedDate)
    ? new Date(application.certificateData.issuedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  // Commissioner details
  const commissionerRemarks = (application.workflow && application.workflow.commissioner && application.workflow.commissioner.remarks)
    ? application.workflow.commissioner.remarks
    : 'Payment verified and certificate issued';
  const commissionerApprovedAt = (application.workflow && application.workflow.commissioner && application.workflow.commissioner.approvedAt)
    ? new Date(application.workflow.commissioner.approvedAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    : 'N/A';

  // Plumber assigned
  const assignedPlumberName = (application.plumberDetails && application.plumberDetails.plumberName)
    ? application.plumberDetails.plumberName
    : (application.workflow && application.workflow.fieldEngineer && application.workflow.fieldEngineer.assignedPlumber
        ? application.workflow.fieldEngineer.assignedPlumber
        : plumberName);

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const formatDate = (dateString: string) => {
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

  const handleAccept = async () => {
    if (!confirm('Are you sure you want to accept this reconnection work? You will be responsible for completing the tap water reconnection at the specified address.')) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber/reconnection-action`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            applicationId: application.id,
            plumberId,
            plumberName,
            action: 'accept',
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert('Reconnection work accepted successfully!\n\nPlease login to the Plumber Mobile App to complete the field visit, capture photos, and submit the reconnection report.\n\nMobile App: Plumber Login > Reconnection Work Orders');
        setActionCompleted(true);
        onBack();
      } else {
        console.error('Failed to accept reconnection:', result.error);
        alert('Failed to accept reconnection: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error accepting reconnection:', error);
      alert('An error occurred while accepting. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejecting this reconnection work.');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber/reconnection-action`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            applicationId: application.id,
            plumberId,
            plumberName,
            action: 'reject',
            rejectReason: rejectReason.trim(),
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert('Reconnection work has been rejected.');
        setActionCompleted(true);
        setShowRejectModal(false);
        onBack();
      } else {
        console.error('Failed to reject reconnection:', result.error);
        alert('Failed to reject reconnection: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error rejecting reconnection:', error);
      alert('An error occurred while rejecting. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
          Reconnection Work Order
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application No: <span className="font-semibold text-[#1f3a5f]">{applicationNo}</span>
          <span className="mx-3 text-gray-400">|</span>
          RR Number: <span className="font-semibold text-[#1f3a5f]">{rrNumber}</span>
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="inline-flex items-center px-4 py-2 bg-orange-100 border border-orange-300 rounded-lg">
            <Wrench className="w-4 h-4 text-orange-600 mr-2" />
            <span className="text-orange-800 font-['Poppins',sans-serif] font-semibold text-[13px]">
              Tap Reconnection Work
            </span>
          </span>
          <span className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-green-800 font-['Poppins',sans-serif] font-semibold text-[13px]">
              Commissioner Approved
            </span>
          </span>
        </div>
      </div>

      {/* ===== Section 1: Applicant / Owner Details ===== */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2 mb-4">
          <User className="w-5 h-5" />
          Applicant / Owner Details
        </h2>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-8">
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Owner Name</p>
              <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{applicantName}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Mobile Number</p>
              <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{mobile}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">RR Number</p>
              <p className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">{rrNumber}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Door Number</p>
              <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{doorNumber}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Ward Number</p>
              <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{wardNumber}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Street</p>
              <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{street}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Full Address</p>
              <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{address}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">City / District</p>
              <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{city}, {district}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">State</p>
              <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{state}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Pincode</p>
              <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{pincode}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Section 2: Connection Details ===== */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2 mb-4">
          <Droplets className="w-5 h-5" />
          Connection & Reconnection Details
        </h2>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-8">
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Connection Type</p>
              <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{connectionType}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Meter Category</p>
              <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{meterCategory}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Motor Status</p>
              <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{motorStatus}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Meter Installed Date</p>
              <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{meterInstalledDate}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Scheme Name</p>
              <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{schemeName}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Existing Connection</p>
              <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{existingConnection}</p>
            </div>
          </div>

          {/* Reconnection reason section */}
          <div className="mt-6 pt-5 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-8">
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Reconnection Reason</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{reconnectionReason}</p>
              </div>
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Disconnection Reason</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{disconnectionReason}</p>
              </div>
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Date of Disconnection</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{disconnectionDate}</p>
              </div>
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">UGD Connection</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{hasUGDConnection}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Section 3: Commissioner Approval & Payment Details ===== */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-white font-['Poppins',sans-serif] flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Commissioner Approval & Payment Verification
          </h2>
        </div>
        <div className="p-6">
          {/* Commissioner approval */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-[14px] font-bold text-green-800 font-['Poppins',sans-serif]">
                Approved by Commissioner
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Approved At</p>
                <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{commissionerApprovedAt}</p>
              </div>
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Remarks</p>
                <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{commissionerRemarks}</p>
              </div>
            </div>
          </div>

          {/* Payment details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 border border-green-300 rounded-lg p-4">
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Amount</p>
              <p className="text-2xl font-bold text-green-700 font-['Poppins',sans-serif]">
                {'\u20B9'}{paymentAmount.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Date</p>
              <p className="text-[15px] font-semibold text-blue-700 font-['Poppins',sans-serif]">
                {paymentDate !== 'N/A' ? formatDate(paymentDate) : 'N/A'}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Reference</p>
              <p className="text-[13px] font-semibold text-purple-700 font-['Poppins',sans-serif] break-all">
                {paymentReference}
              </p>
            </div>
          </div>

          {/* Charges breakdown */}
          {totalCharges > 0 && (
            <div className="mt-5 bg-gray-50 rounded-lg p-4">
              <p className="text-[13px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-3">Charges Breakdown</p>
              <div className="space-y-2">
                <div className="flex justify-between text-[13px] font-['Poppins',sans-serif]">
                  <span className="text-gray-600">Reconnection Fee</span>
                  <span className="font-medium text-gray-900">{'\u20B9'}{reconnectionFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px] font-['Poppins',sans-serif]">
                  <span className="text-gray-600">Inspection Fee</span>
                  <span className="font-medium text-gray-900">{'\u20B9'}{inspectionFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px] font-['Poppins',sans-serif]">
                  <span className="text-gray-600">Service Tax</span>
                  <span className="font-medium text-gray-900">{'\u20B9'}{serviceTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[14px] font-['Poppins',sans-serif] pt-2 border-t border-gray-300">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-green-700">{'\u20B9'}{totalCharges.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Section 4: Permission Letter / Certificate ===== */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-white font-['Poppins',sans-serif] flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Installation Permission Certificate
            <span className="ml-auto flex items-center gap-2 bg-white px-3 py-1 rounded-md text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              Digitally Signed
            </span>
          </h2>
        </div>

        {/* Certificate Content */}
        <div className="p-12 bg-white">
          {/* Government Header */}
          <div className="text-center mb-8 border-b-2 border-[#1f3a5f] pb-6">
            <ImageWithFallback src="https://upload.wikimedia.org/wikipedia/commons/d/d3/Seal_of_Karnataka.png" alt="Government of Karnataka Seal" className="w-[80px] h-[80px] mx-auto mb-3 object-contain" />
            <div className="mb-4">
              <div className="text-[#1f3a5f] font-bold text-[24px] font-['Poppins',sans-serif]">
                {'\u0C95\u0CB0\u0CCD\u0CA8\u0CBE\u0C9F\u0C95 \u0CB8\u0CB0\u0CCD\u0C95\u0CBE\u0CB0'}
              </div>
              <div className="text-[#1f3a5f] font-bold text-[22px] font-['Poppins',sans-serif]">
                GOVERNMENT OF KARNATAKA
              </div>
            </div>
            <div className="text-[#414141] font-semibold text-[18px] font-['Poppins',sans-serif]">
              Department of Municipal Administration
            </div>
            <div className="text-[#414141] text-[16px] font-['Poppins',sans-serif]">
              Directorate of Municipal Administration
            </div>
            <div className="text-gray-600 text-[14px] font-['Poppins',sans-serif] mt-2">
              Jalanidhi - Water Supply Connection Service
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center mb-8">
            <h3 className="text-[22px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] uppercase tracking-wide">
              Certificate of Reconnection Permission
            </h3>
            <div className="w-32 h-1 bg-[#1f3a5f] mx-auto mt-3 rounded-full"></div>
          </div>

          {/* Reference Numbers */}
          <div className="flex justify-between mb-6 text-[14px] font-['Poppins',sans-serif]">
            <div>
              <p className="text-gray-600">Certificate No: <span className="font-semibold text-gray-900">{certificateNo}</span></p>
            </div>
            <div>
              <p className="text-gray-600">Date: <span className="font-semibold text-gray-900">{certificateDate}</span></p>
            </div>
          </div>

          {/* Recipient */}
          <div className="mb-6">
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900 font-semibold">To,</p>
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900 mt-1 font-semibold">{applicantName}</p>
            <p className="text-[14px] font-['Poppins',sans-serif] text-gray-600 mt-1">{address}</p>
            <p className="text-[14px] font-['Poppins',sans-serif] text-gray-600 mt-1">
              Application No: {applicationNo} | RR No: {rrNumber}
            </p>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900">
              <span className="font-bold">Subject: </span>
              <span className="underline">Permission for Tap Water Reconnection</span>
            </p>
          </div>

          {/* Certificate Body */}
          <div className="space-y-4 mb-6 text-[15px] font-['Poppins',sans-serif] text-gray-900 leading-relaxed text-justify">
            <p className="indent-12">
              This is to certify that <span className="font-bold">{applicantName}</span>, bearer of
              application number <span className="font-semibold">{applicationNo}</span> and RR Number <span className="font-semibold">{rrNumber}</span>, has successfully
              completed all required procedures including technical verification, documentation review, field inspection,
              and payment of prescribed fees for the reconnection of tap water supply at the above-mentioned address.
            </p>
            <p className="indent-12">
              After thorough verification of all submitted documents, successful completion of site inspection by our
              field engineers, review by the Revenue Officer, and confirmation of payment receipt of <span className="font-bold">{'\u20B9'}{paymentAmount.toFixed(2)}</span>,
              the Department of Municipal Administration, Government of Karnataka, hereby grants <span className="font-bold text-green-700">PERMISSION</span> for
              the reconnection of tap water supply as per the approved specifications.
            </p>
          </div>

          {/* Authorization Details Box */}
          <div className="bg-green-50 border-2 border-green-600 rounded-lg p-6 mb-6">
            <h3 className="text-[16px] font-bold text-green-800 font-['Poppins',sans-serif] mb-4">
              RECONNECTION AUTHORIZATION DETAILS
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Certificate Number</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{certificateNo}</p>
              </div>
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Connection Type</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{connectionType} - {meterCategory}</p>
              </div>
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Authorized Plumber</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{assignedPlumberName}</p>
              </div>
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Permission Date</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{certificateDate}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Reconnection Address</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{address}, {city}, {district} - {pincode}</p>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mb-6">
            <h4 className="text-[15px] font-bold text-gray-900 font-['Poppins',sans-serif] mb-3">
              Terms and Conditions:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-[14px] font-['Poppins',sans-serif] text-gray-900">
              <li>Reconnection work must be completed by the authorized licensed plumber only.</li>
              <li>All reconnection work must comply with government standards and specifications.</li>
              <li>Reconnection must be completed within 15 days from the date of this certificate.</li>
              <li>Any deviation from approved specifications requires prior written approval.</li>
              <li>Water supply charges will be applicable as per government tariff rates from the date of reconnection.</li>
              <li>The property owner is responsible for maintenance of internal plumbing.</li>
              <li>This permission is non-transferable and valid only for the specified property.</li>
            </ol>
          </div>

          {/* Closing */}
          <div className="space-y-4 mb-8 text-[15px] font-['Poppins',sans-serif] text-gray-900">
            <p>
              This certificate is issued under the authority of the Commissioner, Department of Municipal Administration,
              Government of Karnataka, and is valid for immediate commencement of reconnection work.
            </p>
          </div>

          {/* DSC Signature Section */}
          <div className="mt-12 flex justify-end">
            <div className="text-right">
              <div className="mb-4 bg-green-50 border-2 border-green-500 rounded-lg p-4 inline-block">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-[12px] font-bold text-green-700 font-['Poppins',sans-serif]">
                    DIGITALLY SIGNED
                  </p>
                </div>
                <p className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">
                  Signed on: {commissionerApprovedAt}
                </p>
                <p className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">
                  Certificate ID: DSC-2026-PERM-{application.id ? application.id.slice(-6).toUpperCase() : 'XXXXXX'}
                </p>
              </div>
              <div className="border-t-2 border-gray-800 pt-2 min-w-[250px]">
                <p className="text-[15px] font-bold text-gray-900 font-['Poppins',sans-serif]">
                  Commissioner
                </p>
                <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">
                  Department of Municipal Administration
                </p>
                <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">
                  Government of Karnataka
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-300 text-center">
            <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">
              This is an official certificate from the Jalanidhi Portal, Department of Municipal Administration, Government of Karnataka
            </p>
            <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] mt-1">
              For verification, visit: www.jalanidhi.karnataka.gov.in | Certificate Verification ID: {applicationNo}
            </p>
          </div>
        </div>
      </div>

      {/* ===== Section 5: Reconnection Field Report (from Mobile App) ===== */}
      {hasFieldReport && fieldReport && (
        <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#0078a0] to-[#00a0c6] px-6 py-4">
            <h2 className="text-lg font-semibold text-white font-['Poppins',sans-serif] flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Reconnection Field Visit Report
              <span className="ml-auto flex items-center gap-2 bg-white px-3 py-1 rounded-md text-[#0078a0] text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                Submitted via Mobile
              </span>
            </h2>
          </div>
          <div className="p-6">
            {/* Plumber & Visit Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-8 mb-6">
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Plumber Name</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {fieldReport.plumberName || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Submitted At</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {fieldReport.submittedAt ? formatDate(fieldReport.submittedAt) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Work Completed At</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {fieldReport.workCompletedAt ? formatDate(fieldReport.workCompletedAt) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Location Verification */}
            {fieldReport.locationVerification && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <p className="text-[14px] font-bold text-green-800 font-['Poppins',sans-serif]">
                    Location Verified at Site
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Latitude</p>
                    <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {fieldReport.locationVerification.latitude ? Number(fieldReport.locationVerification.latitude).toFixed(6) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Longitude</p>
                    <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {fieldReport.locationVerification.longitude ? Number(fieldReport.locationVerification.longitude).toFixed(6) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Verified At</p>
                    <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {fieldReport.locationVerification.verifiedAt ? formatDate(fieldReport.locationVerification.verifiedAt) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Reconnection Remarks */}
            {fieldReport.reconnectionRemarks && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
                <p className="text-[13px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">Reconnection Remarks</p>
                <p className="text-[14px] text-gray-900 font-['Poppins',sans-serif] leading-relaxed whitespace-pre-wrap">
                  {fieldReport.reconnectionRemarks}
                </p>
              </div>
            )}

            {/* Site Observations */}
            {fieldReport.siteObservations && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5">
                <p className="text-[13px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">Site Observations</p>
                <p className="text-[14px] text-gray-900 font-['Poppins',sans-serif] leading-relaxed whitespace-pre-wrap">
                  {fieldReport.siteObservations}
                </p>
              </div>
            )}

            {/* Photo & Document Count */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] font-semibold text-amber-800 font-['Poppins',sans-serif] flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    Photos Captured
                  </p>
                  <span className="bg-amber-200 text-amber-800 text-[11px] font-bold font-['Poppins',sans-serif] px-2 py-0.5 rounded-full">
                    {fieldReport.photoCount || (fieldReport.photos && fieldReport.photos.length) || 0}
                  </span>
                </div>
                {fieldReport.photos && fieldReport.photos.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {fieldReport.photos.map((photo: string, idx: number) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-lg overflow-hidden border-2 border-amber-200 hover:border-amber-400 transition-all cursor-pointer shadow-sm hover:shadow-md"
                        onClick={() => window.open(photo, '_blank')}
                      >
                        <img
                          src={photo}
                          alt={'Reconnection photo ' + (idx + 1)}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="11" y1="8" x2="11" y2="14"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                          </svg>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-1.5 py-1">
                          <p className="text-white text-[9px] font-['Poppins',sans-serif] font-medium">{idx + 1}/{fieldReport.photos.length}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-amber-400">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <p className="text-[11px] text-amber-500 font-['Poppins',sans-serif] mt-2">
                      {(fieldReport.photoCount || 0) > 0 ? (fieldReport.photoCount + ' photos captured (previews not available)') : 'No photos captured'}
                    </p>
                  </div>
                )}
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                <p className="text-[24px] font-bold text-indigo-700 font-['Poppins',sans-serif]">
                  {fieldReport.documentCount || 0}
                </p>
                <p className="text-[12px] text-indigo-600 font-['Poppins',sans-serif]">Documents Uploaded</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Section 6: Accept / Reject Action ===== */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2 mb-4">
          <Wrench className="w-5 h-5" />
          Reconnection Work Action
        </h2>
        <div>
          {actionCompleted ? (
            <div className="flex flex-col items-center justify-center gap-3 py-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <p className="text-[16px] font-semibold text-green-700 font-['Poppins',sans-serif]">
                  {application.status === 'declined_by_plumber' || application.status === 'reconnection_rejected_by_plumber'
                    ? 'This reconnection work has been rejected.'
                    : application.status === 'reconnection_work_submitted'
                    ? 'Reconnection work completed and submitted to Field Engineer for verification.'
                    : application.status === 'plumber_accepted_reconnection'
                    ? 'Accepted - Pending field visit via Plumber Mobile App.'
                    : 'This reconnection work has been accepted.'}
                </p>
              </div>
              {application.status === 'plumber_accepted_reconnection' && (
                <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                  Please login to the Plumber Mobile App to complete the field visit, capture photos, and submit the report.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-[14px] text-amber-800 font-['Poppins',sans-serif]">
                  <span className="font-bold">Note:</span> By accepting this reconnection work, you confirm that you will carry out the tap water reconnection 
                  at the specified address as per the government standards and complete it within 15 days. If you are unable to perform 
                  this work, please reject with a valid reason.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={processing}
                  className="px-8 py-3 bg-white border-2 border-red-500 text-red-600 rounded-lg font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Work
                </button>

                <button
                  onClick={handleAccept}
                  disabled={processing}
                  className="px-10 py-3 bg-[#22c55e] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#16a34a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Accept & Complete Reconnection
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-[500px]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
                Reject Reconnection Work
              </h2>
              <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                Please provide a reason for rejecting this reconnection work order
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-[14px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[14px] focus:outline-none focus:border-[#1f3a5f] resize-none"
                placeholder="Enter the reason for rejecting this reconnection work..."
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectReason.trim()}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
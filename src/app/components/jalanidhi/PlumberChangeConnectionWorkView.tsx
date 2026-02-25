import { useState } from 'react';
import { ChevronLeft, CheckCircle, FileText, CreditCard, User, MapPin, Droplets, Calendar, Phone, Hash, Download, XCircle, Wrench, Clock, AlertTriangle, Send, Camera } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface PlumberChangeConnectionWorkViewProps {
  application: any;
  onBack: () => void;
}

export default function PlumberChangeConnectionWorkView({ application, onBack }: PlumberChangeConnectionWorkViewProps) {
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showMobileSimulator, setShowMobileSimulator] = useState(false);
  const [forwardRemarks, setForwardRemarks] = useState('');
  const [actionCompleted, setActionCompleted] = useState(
    application.status === 'change_connection_work_submitted' ||
    application.status === 'change_connection_rejected_by_plumber' ||
    application.status === 'plumber_accepted_change_connection' ||
    application.status === 'change_connection_forwarded_to_fe'
  );

  // Mobile field report form state
  const [mobileLocationVerified, setMobileLocationVerified] = useState(false);
  const [mobileWorkDone, setMobileWorkDone] = useState('');
  const [mobileRemarks, setMobileRemarks] = useState('');
  const [mobilePhotos, setMobilePhotos] = useState<string[]>([]);
  const [mobileSubmitting, setMobileSubmitting] = useState(false);

  // Check if field report has been submitted via mobile
  const hasFieldReport = application.changeConnectionFieldReport ? true : false;
  const fieldReport = application.changeConnectionFieldReport || null;
  const isForwarded = application.status === 'change_connection_forwarded_to_fe';

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
  const currentConnectionType = (application.rrData && application.rrData.connectionType)
    ? application.rrData.connectionType
    : (application.connectionDetails && application.connectionDetails.connectionType ? application.connectionDetails.connectionType : 'N/A');
  const requestedConnectionType = (application.changeConnectionDetails && application.changeConnectionDetails.requestedType)
    ? application.changeConnectionDetails.requestedType
    : (application.connectionDetails && application.connectionDetails.requestedConnectionType ? application.connectionDetails.requestedConnectionType : 'N/A');
  const meterCategory = (application.rrData && application.rrData.meterCategory)
    ? application.rrData.meterCategory
    : (application.connectionDetails && application.connectionDetails.propertyType ? application.connectionDetails.propertyType : 'N/A');
  const motorStatus = (application.rrData && application.rrData.motorStatus)
    ? application.rrData.motorStatus
    : 'N/A';
  const changeReason = (application.changeConnectionDetails && application.changeConnectionDetails.reason)
    ? application.changeConnectionDetails.reason
    : (application.reasonForChange || 'N/A');

  // Payment details
  const paymentAmount = (application.paymentDetails && application.paymentDetails.amount)
    ? Number(application.paymentDetails.amount)
    : 0;
  const paymentDate = (application.paymentDetails && application.paymentDetails.paidAt)
    ? application.paymentDetails.paidAt
    : 'N/A';
  const paymentReference = (application.paymentDetails && application.paymentDetails.transactionId)
    ? application.paymentDetails.transactionId
    : 'N/A';

  // Certificate data
  const certificateNo = (application.certificateData && application.certificateData.certificateNo)
    ? application.certificateData.certificateNo
    : 'DMA/JN/CERT/' + applicationNo;
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

  // Deadline calculation
  const acceptedAt = (application.workflow && application.workflow.plumberChangeConnection && application.workflow.plumberChangeConnection.acceptedAt)
    ? application.workflow.plumberChangeConnection.acceptedAt : null;
  const deadlineDate = acceptedAt ? new Date(new Date(acceptedAt).getTime() + 7 * 24 * 60 * 60 * 1000) : null;
  const daysRemaining = deadlineDate ? Math.max(0, Math.ceil((deadlineDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))) : null;

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
    if (!confirm('Are you sure you want to accept this change of connection type work? You must complete the work within 7 days from the date of acceptance.')) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/plumber/change-connection-action',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + publicAnonKey,
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
        alert('Change of connection work accepted successfully!\n\nYou must complete this work within 7 days.\n\nPlease login to the Plumber Mobile App to complete the field visit, verify location, capture photos, and submit the report.\n\nMobile App: Plumber Login > Change Connection Work Orders');
        setActionCompleted(true);
        onBack();
      } else {
        console.error('Failed to accept change connection:', result.error);
        alert('Failed to accept: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error accepting change connection:', error);
      alert('An error occurred while accepting. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejecting this change of connection work.');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/plumber/change-connection-action',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + publicAnonKey,
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
        alert('Change of connection work has been rejected.');
        setActionCompleted(true);
        setShowRejectModal(false);
        onBack();
      } else {
        console.error('Failed to reject:', result.error);
        alert('Failed to reject: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('An error occurred while rejecting. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleMobileSubmitReport = async () => {
    if (!mobileWorkDone.trim()) {
      alert('Please describe the work done.');
      return;
    }
    if (!mobileRemarks.trim()) {
      alert('Please add remarks.');
      return;
    }

    setMobileSubmitting(true);
    try {
      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/plumber/change-connection-submit-report',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + publicAnonKey,
          },
          body: JSON.stringify({
            applicationId: application.id,
            plumberId,
            plumberName,
            fieldReport: {
              locationVerification: mobileLocationVerified ? {
                verified: true,
                latitude: 12.9716 + (Math.random() * 0.01),
                longitude: 77.5946 + (Math.random() * 0.01),
                verifiedAt: new Date().toISOString()
              } : null,
              workDescription: mobileWorkDone.trim(),
              changeConnectionRemarks: mobileRemarks.trim(),
              photos: mobilePhotos,
              photoCount: mobilePhotos.length,
              workCompletedAt: new Date().toISOString()
            },
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert('Field report submitted successfully!\n\nPlease review and submit to Field Engineer from the web portal.');
        setShowMobileSimulator(false);
        onBack();
      } else {
        console.error('Failed to submit report:', result.error);
        alert('Failed to submit: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setMobileSubmitting(false);
    }
  };

  const handleForwardToFE = async () => {
    if (!confirm('Are you sure you want to forward this change of connection report to the Field Engineer for verification?')) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/plumber/change-connection-forward-to-fe',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + publicAnonKey,
          },
          body: JSON.stringify({
            applicationId: application.id,
            plumberId,
            plumberName,
            remarks: forwardRemarks.trim() || 'Change of connection work completed and forwarded to Field Engineer for verification.',
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert('Report forwarded to Field Engineer for verification successfully!');
        onBack();
      } else {
        console.error('Failed to forward:', result.error);
        alert('Failed to forward: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error forwarding:', error);
      alert('An error occurred. Please try again.');
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
          Change of Connection Type - Work Order
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application No: <span className="font-semibold text-[#1f3a5f]">{applicationNo}</span>
          {rrNumber !== 'N/A' && (
            <>
              <span className="mx-3 text-gray-400">|</span>
              RR Number: <span className="font-semibold text-[#1f3a5f]">{rrNumber}</span>
            </>
          )}
        </p>
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center px-4 py-2 bg-[#1f3a5f]/10 border border-[#1f3a5f]/20 rounded-lg">
            <Wrench className="w-4 h-4 text-[#1f3a5f] mr-2" />
            <span className="text-[#1f3a5f] font-['Poppins',sans-serif] font-semibold text-[13px]">
              Change of Connection Type
            </span>
          </span>
          <span className="inline-flex items-center px-4 py-2 bg-[#1f3a5f]/10 border border-[#1f3a5f]/20 rounded-lg">
            <CheckCircle className="w-4 h-4 text-[#1f3a5f] mr-2" />
            <span className="text-[#1f3a5f] font-['Poppins',sans-serif] font-semibold text-[13px]">
              Commissioner Approved
            </span>
          </span>
          {daysRemaining !== null && application.status === 'plumber_accepted_change_connection' && (
            <span className={'inline-flex items-center px-4 py-2 rounded-lg border ' + (daysRemaining <= 2 ? 'bg-red-100 border-red-300' : 'bg-[#1f3a5f]/15 border-[#1f3a5f]/30')}>
              <Clock className={'w-4 h-4 mr-2 ' + (daysRemaining <= 2 ? 'text-red-600' : 'text-[#1f3a5f]')} />
              <span className={(daysRemaining <= 2 ? 'text-red-800' : 'text-[#1f3a5f]') + " font-['Poppins',sans-serif] font-semibold text-[13px]"}>
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
              </span>
            </span>
          )}
        </div>
      </div>

      {/* 7-Day Deadline Warning */}
      {application.status === 'plumber_accepted_change_connection' && daysRemaining !== null && (
        <div className={'rounded-lg border p-4 mb-6 flex items-start gap-3 ' + (daysRemaining <= 2 ? 'bg-red-50 border-red-300' : 'bg-[#1f3a5f]/10 border-[#1f3a5f]/30')}>
          <AlertTriangle className={'w-6 h-6 mt-0.5 flex-shrink-0 ' + (daysRemaining <= 2 ? 'text-red-600' : 'text-[#1f3a5f]')} />
          <div>
            <p className={(daysRemaining <= 2 ? 'text-red-800' : 'text-[#1f3a5f]') + " font-['Poppins',sans-serif] font-bold text-[15px]"}>
              Work Completion Deadline
            </p>
            <p className={(daysRemaining <= 2 ? 'text-red-700' : 'text-gray-700') + " font-['Poppins',sans-serif] text-[13px] mt-1"}>
              This change of connection work must be completed within <strong>7 days</strong> from the date of acceptance ({acceptedAt ? formatDate(acceptedAt) : 'N/A'}).
              Deadline: <strong>{deadlineDate ? deadlineDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}</strong>.
              {daysRemaining <= 2 && ' Please complete the work urgently.'}
            </p>
          </div>
        </div>
      )}

      {/* ===== Section 1: Applicant / Owner Details ===== */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2 mb-4">
          <User className="w-5 h-5" />
          Applicant / Owner Details
        </h2>
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

      {/* ===== Section 2: Change of Connection Details ===== */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2 mb-4">
          <Droplets className="w-5 h-5" />
          Change of Connection Type Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-8">
          <div>
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Current Connection Type</p>
            <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{currentConnectionType}</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Requested Connection Type</p>
            <p className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">{requestedConnectionType}</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Meter Category</p>
            <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{meterCategory}</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Motor Status</p>
            <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{motorStatus}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Reason for Change</p>
            <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{changeReason}</p>
          </div>
        </div>
      </div>

      {/* ===== Section 3: Commissioner Approval & Payment Details ===== */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2 mb-5">
          <CreditCard className="w-5 h-5" />
          Commissioner Approval & Payment Verification
        </h2>

        {/* Commissioner approval status */}
        <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-[#1f3a5f]/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-[#1f3a5f]" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Approved by Commissioner
            </p>
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-0.5">{commissionerApprovedAt}</p>
          </div>
          <span className="bg-[#1f3a5f]/10 text-[#1f3a5f] text-[11px] font-semibold font-['Poppins',sans-serif] px-3 py-1 rounded-full uppercase tracking-wider">Approved</span>
        </div>

        {/* Commissioner Remarks */}
        {commissionerRemarks && commissionerRemarks !== 'N/A' && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5">
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Commissioner Remarks</p>
            <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{commissionerRemarks}</p>
          </div>
        )}

        {/* Payment details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Payment Amount</p>
            <p className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
              {'\u20B9'}{paymentAmount.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Payment Date</p>
            <p className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
              {paymentDate !== 'N/A' ? formatDate(paymentDate) : 'N/A'}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Payment Reference</p>
            <p className="text-[13px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] break-all">
              {paymentReference}
            </p>
          </div>
        </div>
      </div>

      {/* ===== Section 4: Permission Letter / Certificate ===== */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Change of Connection Type Permission Certificate
          </h2>
          <span className="flex items-center gap-1.5 bg-[#1f3a5f]/10 text-[#1f3a5f] px-3 py-1 rounded-full text-[11px] font-semibold font-['Poppins',sans-serif] uppercase tracking-wider">
            <CheckCircle className="w-3.5 h-3.5" />
            Digitally Signed
          </span>
        </div>

        {/* Certificate Content */}
        <div className="p-12 bg-white rounded-lg border border-gray-200">
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
              Certificate of Change of Connection Type Permission
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
              Application No: {applicationNo}{rrNumber !== 'N/A' ? ' | RR No: ' + rrNumber : ''}
            </p>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900">
              <span className="font-bold">Subject: </span>
              <span className="underline">Permission for Change of Tap Water Connection Type</span>
            </p>
          </div>

          {/* Certificate Body */}
          <div className="space-y-4 mb-6 text-[15px] font-['Poppins',sans-serif] text-gray-900 leading-relaxed text-justify">
            <p className="indent-12">
              This is to certify that <span className="font-bold">{applicantName}</span>, bearer of
              application number <span className="font-semibold">{applicationNo}</span>, has successfully
              completed all required procedures including technical verification, documentation review, field inspection,
              and payment of prescribed fees for the change of tap water connection type from <span className="font-bold">{currentConnectionType}</span> to <span className="font-bold">{requestedConnectionType}</span> at the above-mentioned address.
            </p>
            <p className="indent-12">
              After thorough verification of all submitted documents, successful completion of site inspection by our
              field engineers, review by the Revenue Officer, and confirmation of payment receipt of <span className="font-bold">{'\u20B9'}{paymentAmount.toFixed(2)}</span>,
              the Department of Municipal Administration, Government of Karnataka, hereby grants <span className="font-bold text-[#1f3a5f]">PERMISSION</span> for
              the change of tap water connection type as per the approved specifications.
            </p>
          </div>

          {/* Authorization Details Box */}
          <div className="bg-[#f8fafc] border-2 border-[#1f3a5f] rounded-lg p-6 mb-6">
            <h3 className="text-[16px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
              CHANGE OF CONNECTION TYPE AUTHORIZATION DETAILS
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Certificate Number</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{certificateNo}</p>
              </div>
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Current Connection Type</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{currentConnectionType}</p>
              </div>
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">New Connection Type</p>
                <p className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">{requestedConnectionType}</p>
              </div>
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Authorized Plumber</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{assignedPlumberName}</p>
              </div>
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Permission Date</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{certificateDate}</p>
              </div>
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Address</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{address}</p>
              </div>
            </div>
          </div>

          {/* DSC Signature */}
          <div className="mt-8 flex justify-end">
            <div className="text-right">
              <div className="mb-4 bg-[#f8fafc] border-2 border-[#1f3a5f] rounded-lg p-4 inline-block">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-[#1f3a5f]" />
                  <p className="text-[12px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">DIGITALLY SIGNED</p>
                </div>
                <p className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">
                  Signed on: {commissionerApprovedAt}
                </p>
                <p className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">
                  Certificate ID: DSC-2026-PERM-{application.id ? application.id.slice(-6).toUpperCase() : 'XXXXXX'}
                </p>
              </div>
              <div className="border-t-2 border-gray-800 pt-2 min-w-[250px]">
                <p className="text-[15px] font-bold text-gray-900 font-['Poppins',sans-serif]">Commissioner</p>
                <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">Department of Municipal Administration</p>
                <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">Government of Karnataka</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Section 5: Field Report (from Mobile App) ===== */}
      {hasFieldReport && fieldReport && (
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Change Connection Field Visit Report
            </h2>
            <span className="flex items-center gap-1.5 bg-[#1f3a5f]/10 text-[#1f3a5f] px-3 py-1 rounded-full text-[11px] font-semibold font-['Poppins',sans-serif] uppercase tracking-wider">
              <CheckCircle className="w-3.5 h-3.5" />
              Submitted via Mobile
            </span>
          </div>

          {/* Plumber & Visit Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Plumber Name</p>
              <p className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                {fieldReport.plumberName || 'N/A'}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Submitted At</p>
              <p className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                {fieldReport.submittedAt ? formatDate(fieldReport.submittedAt) : 'N/A'}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Work Completed At</p>
              <p className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                {fieldReport.workCompletedAt ? formatDate(fieldReport.workCompletedAt) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Location Verification */}
          {fieldReport.locationVerification && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#1f3a5f]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[#1f3a5f]" />
                </div>
                <p className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Location Verified at Site</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Latitude</p>
                  <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {fieldReport.locationVerification.latitude ? Number(fieldReport.locationVerification.latitude).toFixed(6) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Longitude</p>
                  <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {fieldReport.locationVerification.longitude ? Number(fieldReport.locationVerification.longitude).toFixed(6) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">Verified At</p>
                  <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {fieldReport.locationVerification.verifiedAt ? formatDate(fieldReport.locationVerification.verifiedAt) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Work Description & Remarks */}
          {(fieldReport.workDescription || fieldReport.changeConnectionRemarks) && (
            <div className={'grid gap-4 mb-5 ' + (fieldReport.workDescription && fieldReport.changeConnectionRemarks ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
              {fieldReport.workDescription && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-2">Work Description</p>
                  <p className="text-[14px] text-gray-900 font-['Poppins',sans-serif] leading-relaxed whitespace-pre-wrap">
                    {fieldReport.workDescription}
                  </p>
                </div>
              )}
              {fieldReport.changeConnectionRemarks && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-2">Plumber Remarks</p>
                  <p className="text-[14px] text-gray-900 font-['Poppins',sans-serif] leading-relaxed whitespace-pre-wrap">
                    {fieldReport.changeConnectionRemarks}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Site Photos */}
          <div>
              <div className="flex items-center gap-2 mb-3">
                <Camera className="w-5 h-5 text-[#1f3a5f]" />
                <p className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                  Site Photos
                </p>
                <span className="ml-auto bg-[#1f3a5f]/10 text-[#1f3a5f] text-[12px] font-semibold font-['Poppins',sans-serif] px-3 py-1 rounded-full">
                  {fieldReport.photoCount || 0} Photo{(fieldReport.photoCount || 0) !== 1 ? 's' : ''}
                </span>
              </div>
              {(() => {
                const hasRealPhotos = fieldReport.photos && fieldReport.photos.length > 0;
                const photoCount = fieldReport.photoCount || 0;
                const placeholderImages = [
                  'https://images.unsplash.com/photo-1765277789190-22f77c5e7046?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmluZyUyMHBpcGUlMjBjb25zdHJ1Y3Rpb258ZW58MXx8fHwxNzcxNDE0OTQxfDA&ixlib=rb-4.1.0&q=80&w=1080',
                  'https://images.unsplash.com/photo-1755770746901-a99d395c4cbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMG1ldGVyJTIwY29ubmVjdGlvbnxlbnwxfHx8fDE3NzE0MTQ5NDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
                  'https://images.unsplash.com/photo-1758826898770-c76ce24b4eff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMHBpcGUlMjB2YWx2ZSUyMGluZnJhc3RydWN0dXJlfGVufDF8fHx8MTc3MTQxNDk0OHww&ixlib=rb-4.1.0&q=80&w=1080',
                  'https://images.unsplash.com/photo-1759577452862-48bc9b5b7ca9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmluZyUyMHdvcmslMjB1bmRlcmdyb3VuZCUyMHBpcGV8ZW58MXx8fHwxNzcxNDE0OTU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
                ];
                const images = hasRealPhotos
                  ? fieldReport.photos
                  : (photoCount > 0 ? placeholderImages.slice(0, Math.min(photoCount, 4)) : []);

                if (images.length > 0) {
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {images.map((photo: string, idx: number) => (
                        <div
                          key={idx}
                          className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#1f3a5f] transition-all cursor-pointer shadow-sm hover:shadow-md"
                          onClick={() => window.open(photo, '_blank')}
                        >
                          <ImageWithFallback src={photo} alt={'Site photo ' + (idx + 1)} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-[#1f3a5f]/0 group-hover:bg-[#1f3a5f]/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Camera className="w-6 h-6 text-white drop-shadow-md" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1f3a5f]/70 to-transparent px-2 py-1.5">
                            <p className="text-[10px] text-white font-['Poppins',sans-serif] font-medium">Photo {idx + 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                } else {
                  return (
                    <div className="bg-[#f8fafc] border border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Camera className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-[12px] text-gray-400 font-['Poppins',sans-serif]">No photos captured during field visit</p>
                    </div>
                  );
                }
              })()}
          </div>
        </div>
      )}

      {/* ===== Section 6: Actions ===== */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2 mb-4">
          <Wrench className="w-5 h-5" />
          Change of Connection Work Action
        </h2>
        <div>
          {isForwarded ? (
            <div className="flex flex-col items-center justify-center gap-3 py-4">
              <div className="flex items-center gap-3">
                <Send className="w-6 h-6 text-[#1f3a5f]" />
                <p className="text-[16px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                  Report forwarded to Field Engineer for verification.
                </p>
              </div>
            </div>
          ) : hasFieldReport ? (
            // Field report submitted - show review and forward to FE
            <div>
              

              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">
                  Remarks for Field Engineer (Optional)
                </label>
                <textarea
                  value={forwardRemarks}
                  onChange={(e) => setForwardRemarks(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[14px] focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent"
                  rows={3}
                  placeholder="Add any remarks for the Field Engineer..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleForwardToFE}
                  disabled={processing}
                  className="px-10 py-3 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#2d4a6f] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit to Field Engineer
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : actionCompleted && application.status === 'plumber_accepted_change_connection' ? (
            // Accepted but waiting for mobile field report
            <div className="flex flex-col items-center justify-center gap-3 py-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-[#1f3a5f]" />
                <p className="text-[16px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                  Accepted - Pending field visit via Plumber Mobile App.
                </p>
              </div>
              <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                Please login to the Plumber Mobile App to verify location, capture work photos, and submit the report.
              </p>
              {/* Mobile App Direction */}
              <div className="mt-3 px-5 py-3 bg-[#f8fafc] border border-gray-200 rounded-lg flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#1f3a5f] flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                    Application sent to Plumber Mobile App
                  </p>
                  <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] mt-0.5">
                    Login with ID <span className="font-semibold text-[#1f3a5f]">9888888888</span> on the Plumber Mobile App to complete the field visit.
                  </p>
                </div>
              </div>
            </div>
          ) : actionCompleted ? (
            <div className="flex flex-col items-center justify-center gap-3 py-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-[#1f3a5f]" />
                <p className="text-[16px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                  {application.status === 'change_connection_rejected_by_plumber'
                    ? 'This change of connection work has been rejected.'
                    : 'This change of connection work has been processed.'}
                </p>
              </div>
            </div>
          ) : (
            // Initial accept/reject
            <>
              <div className="bg-[#f8fafc] border border-[#1f3a5f]/20 rounded-lg p-4 mb-6">
                <p className="text-[14px] text-[#1f3a5f] font-['Poppins',sans-serif]">
                  <span className="font-bold">Note:</span> By accepting this change of connection work, you confirm that you will carry out the
                  connection type change at the specified address as per the government standards and complete it within <strong>7 days</strong>.
                  If you are unable to perform this work, please reject with a valid reason.
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
                      Accept & Change Connection
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
                Reject Change Connection Work
              </h2>
              <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                Please provide a reason for rejecting this change of connection work order
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-[13px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[14px] focus:ring-2 focus:ring-red-400 focus:border-transparent"
                rows={4}
                placeholder="Explain why you are unable to perform this change of connection work..."
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="px-6 py-2 bg-red-600 text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {processing ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile App Simulator */}
      {showMobileSimulator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-[40px] p-3 shadow-2xl" style={{ width: '400px', maxHeight: '90vh' }}>
            {/* Phone Notch */}
            <div className="bg-gray-900 rounded-t-[32px] flex justify-center py-2">
              <div className="w-24 h-5 bg-gray-800 rounded-full"></div>
            </div>

            {/* Phone Screen */}
            <div className="bg-white rounded-[28px] overflow-hidden" style={{ maxHeight: 'calc(90vh - 60px)' }}>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                {/* Mobile Header */}
                <div className="bg-gradient-to-r from-[#1f3a5f] to-[#27548a] px-5 py-4 sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowMobileSimulator(false)}
                      className="text-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                      <h3 className="text-white font-['Poppins',sans-serif] font-bold text-[16px]">
                        Change Connection Work
                      </h3>
                      <p className="text-white/70 font-['Poppins',sans-serif] text-[11px]">
                        {applicationNo}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Location Verification */}
                  <div className="bg-[#f8fafc] border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-['Poppins',sans-serif] font-bold text-[14px] text-[#1f3a5f] flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location Verification
                      </p>
                    </div>
                    <button
                      onClick={() => setMobileLocationVerified(!mobileLocationVerified)}
                      className={'w-full py-3 rounded-lg font-[\'Poppins\',sans-serif] font-semibold text-[14px] transition-colors ' + (mobileLocationVerified ? 'bg-[#1f3a5f] text-white' : 'bg-white border-2 border-[#1f3a5f]/30 text-[#1f3a5f]')}
                    >
                      {mobileLocationVerified ? 'Location Verified' : 'Verify Current Location'}
                    </button>
                    {mobileLocationVerified && (
                      <p className="text-[11px] text-[#1f3a5f] font-['Poppins',sans-serif] mt-2 text-center">
                        GPS: 12.9716N, 77.5946E
                      </p>
                    )}
                  </div>

                  {/* Work Description */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">
                      Work Done Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={mobileWorkDone}
                      onChange={(e) => setMobileWorkDone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl font-['Poppins',sans-serif] text-[14px] focus:ring-2 focus:ring-[#1f3a5f]"
                      rows={3}
                      placeholder="Describe the change of connection work completed..."
                    />
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">
                      Remarks <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={mobileRemarks}
                      onChange={(e) => setMobileRemarks(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl font-['Poppins',sans-serif] text-[14px] focus:ring-2 focus:ring-[#1f3a5f]"
                      rows={2}
                      placeholder="Any additional remarks..."
                    />
                  </div>

                  {/* Photo Capture */}
                  <div className="bg-[#f8fafc] border border-gray-200 rounded-xl p-4">
                    <p className="font-['Poppins',sans-serif] font-bold text-[14px] text-[#1f3a5f] mb-3">
                      Capture Photos
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setMobilePhotos([...mobilePhotos, 'https://via.placeholder.com/200x200?text=Photo+' + (mobilePhotos.length + 1)]);
                        }}
                        className="w-16 h-16 border-2 border-dashed border-[#1f3a5f]/30 rounded-lg flex items-center justify-center text-[#1f3a5f] hover:bg-[#1f3a5f]/5 transition-colors"
                      >
                        <span className="text-2xl">+</span>
                      </button>
                      {mobilePhotos.map((_photo, idx) => (
                        <div key={idx} className="w-16 h-16 bg-[#1f3a5f]/10 rounded-lg flex items-center justify-center text-[#1f3a5f] font-bold text-[12px]">
                          Photo {idx + 1}
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] mt-2">
                      {mobilePhotos.length} photo(s) captured
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleMobileSubmitReport}
                    disabled={mobileSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-[#1f3a5f] to-[#27548a] text-white rounded-xl font-['Poppins',sans-serif] font-bold text-[16px] shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {mobileSubmitting ? 'Submitting...' : 'Submit Field Report'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { ChevronLeft, CheckCircle, XCircle, Wrench, FileText, Download } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface PlumberDisconnectionWorkViewProps {
  application: any;
  onBack: () => void;
  onRefresh: () => void;
}

export default function PlumberDisconnectionWorkView({ application, onBack, onRefresh }: PlumberDisconnectionWorkViewProps) {
  const [processing, setProcessing] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const rrData = application.rrData || {};
  const ownerName = rrData.ownerName || 'N/A';
  const isAccepted = application.status === 'plumber_accepted_disconnection';
  const isSubmitted = application.status === 'disconnection_work_submitted';
  const isDeclined = application.status === 'plumber_declined_disconnection';

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const plumberName = userData.name || 'Plumber';
  const plumberId = userData.plumberLicense || 'PLB-001';

  const applicationNo = application.applicationNo || application.id || 'N/A';
  const mobileNo = rrData.mobileNo || 'N/A';
  const doorNumber = rrData.doorNumber || 'N/A';
  const wardNumber = rrData.wardNumber || 'N/A';
  const street = rrData.street || 'N/A';
  const addressFull = rrData.address || [rrData.doorNumber, rrData.street, rrData.city, rrData.state, rrData.pincode].filter(Boolean).join(', ') || 'N/A';
  const district = rrData.district || 'N/A';
  const ulb = rrData.ulb || 'N/A';
  const connectionType = rrData.connectionType || 'N/A';
  const meterCategory = rrData.meterCategory || 'N/A';
  const disconnectionType = application.disconnectionType === 'permanent' ? 'Permanent Disconnection' : 'Temporary Disconnection';

  const certData = application.certificateData || {};
  const certNo = certData.certificateNo || `DMA/JN/CERT/${applicationNo}`;
  const paymentAmount = (application.paymentDetails && application.paymentDetails.amount) ? Number(application.paymentDetails.amount) : 0;
  const commissionerRemarks = (application.workflow && application.workflow.commissioner && application.workflow.commissioner.remarks) ? application.workflow.commissioner.remarks : 'Disconnection approved';
  const commissionerApprovedAt = (application.workflow && application.workflow.commissioner && application.workflow.commissioner.approvedAt) ? new Date(application.workflow.commissioner.approvedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const certIssuedDate = certData.issuedDate ? new Date(certData.issuedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : currentDate;
  const certSignedDate = certData.signedDate ? new Date(certData.signedDate).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');

  const handleAccept = async () => {
    if (!confirm('Are you sure you want to accept this disconnection work order? After accepting, the application will appear in your mobile app for field work.')) return;

    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber/accept-disconnection`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: application.id,
            action: 'accept',
            plumberName,
            plumberId,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Disconnection work order accepted!\n\nPlease open the mobile app to visit the field and complete the disconnection.');
        onRefresh();
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error accepting disconnection:', err);
      alert('Error: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (declineReason.trim().length < 10) {
      alert('Please provide a reason for declining (minimum 10 characters).');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber/accept-disconnection`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: application.id,
            action: 'decline',
            plumberName,
            plumberId,
            declineReason,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Disconnection work order declined.\n\nThe application has been sent back to the Field Engineer.');
        setShowDeclineModal(false);
        onRefresh();
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error declining disconnection:', err);
      alert('Error: ' + err);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={processing}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-[#414141] font-['Poppins',sans-serif] mb-2">
          Disconnection Work Order
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{application.id}</span>
        </p>
        <div className="mt-2 flex gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-semibold font-['Poppins',sans-serif] ${
            isSubmitted ? 'bg-blue-100 text-blue-800' :
            isAccepted ? 'bg-amber-100 text-amber-800' :
            isDeclined ? 'bg-red-100 text-red-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {isSubmitted ? 'Report Submitted' :
             isAccepted ? 'Accepted - Pending Field Visit' :
             isDeclined ? 'Declined' :
             'Pending Acceptance'}
          </span>
        </div>
      </div>

      {/* Disconnection Permission Letter */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#1f3a5f]" />
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Permission Letter - Tap Disconnection</h2>
          </div>
          <span className="flex items-center gap-2 bg-white px-3 py-1 rounded-md text-green-600 text-sm font-['Poppins',sans-serif] font-semibold">
            <CheckCircle className="w-4 h-4" />
            Digitally Signed
          </span>
        </div>
        <div className="p-8 bg-white">
          {/* Government Header */}
          <div className="text-center mb-6 border-b-2 border-[#1f3a5f] pb-4">
            <ImageWithFallback src="https://upload.wikimedia.org/wikipedia/commons/d/d3/Seal_of_Karnataka.png" alt="Government of Karnataka Seal" className="w-[80px] h-[80px] mx-auto mb-3 object-contain" />
            <p className="text-[#1f3a5f] font-bold text-[20px] font-['Poppins',sans-serif]">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</p>
            <p className="text-[#1f3a5f] font-bold text-[18px] font-['Poppins',sans-serif]">GOVERNMENT OF KARNATAKA</p>
            <p className="text-[#414141] font-semibold text-[16px] font-['Poppins',sans-serif]">Department of Municipal Administration</p>
            <p className="text-gray-600 text-[13px] font-['Poppins',sans-serif]">Jalanidhi - Water Supply Connection Service</p>
          </div>

          {/* Reference & Date */}
          <div className="flex justify-between mb-4 text-[13px] font-['Poppins',sans-serif]">
            <p className="text-gray-600">Ref: <span className="font-semibold text-gray-900">{certNo}</span></p>
            <p className="text-gray-600">Date: <span className="font-semibold text-gray-900">{certIssuedDate}</span></p>
          </div>

          {/* Permission Banner */}
          

          {/* Recipient */}
          <div className="mb-4">
            <p className="text-[14px] font-['Poppins',sans-serif] text-gray-900 font-semibold">To,</p>
            <p className="text-[14px] font-['Poppins',sans-serif] text-gray-900 mt-1 font-semibold">{ownerName}</p>
            <p className="text-[13px] font-['Poppins',sans-serif] text-gray-600 mt-1">{addressFull}</p>
            <p className="text-[13px] font-['Poppins',sans-serif] text-gray-600 mt-1">Application No: {applicationNo}</p>
          </div>

          {/* Subject */}
          <div className="mb-4">
            <p className="text-[14px] font-['Poppins',sans-serif] text-gray-900">
              <span className="font-bold">Subject: </span>
              <span className="underline">Permission for Tap Water Disconnection — {disconnectionType}</span>
            </p>
          </div>

          {/* Body */}
          <div className="space-y-3 mb-5 text-[14px] font-['Poppins',sans-serif] text-gray-900 leading-relaxed text-justify">
            <p className="indent-12">
              This is to certify that <span className="font-bold">{ownerName}</span>, bearer of
              application number <span className="font-semibold">{applicationNo}</span>, RR Number <span className="font-semibold">{application.rrNumber || 'N/A'}</span>, has successfully
              completed all required procedures including technical verification, documentation review, field inspection,
              and payment of prescribed fees for the disconnection of tap water supply at the above-mentioned address.
            </p>
            <p className="indent-12">
              After thorough verification of all submitted documents, successful completion of site inspection by our
              field engineers, review by the Commissioner, and confirmation of payment receipt of <span className="font-bold">₹{paymentAmount.toFixed(2)}</span>,
              the Department of Municipal Administration, Government of Karnataka, hereby grants <span className="font-bold text-red-700">PERMISSION</span> for
              the disconnection of tap water supply as per the approved specifications.
            </p>
          </div>

          {/* Property & Connection Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 rounded-lg p-4">
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Owner Name</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{ownerName}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Mobile</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{mobileNo}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">RR Number</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{application.rrNumber || 'N/A'}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Disconnection Type</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{disconnectionType}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Door No</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{doorNumber}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Ward</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{wardNumber}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Street</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{street}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">District / ULB</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{district} / {ulb}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Connection Type</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{connectionType}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Meter Category</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{meterCategory}</p></div>
            <div className="col-span-2"><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Address</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{addressFull}</p></div>
          </div>

          {/* Disconnection Authorization Box */}
          <div className="bg-green-50 border-2 border-green-600 rounded-lg p-5 mb-4">
            <h3 className="text-[15px] font-bold text-green-800 font-['Poppins',sans-serif] mb-3">DISCONNECTION AUTHORIZATION DETAILS</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[12px] text-gray-600 font-['Poppins',sans-serif] mb-1">Certificate Number</p>
                <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{certNo}</p>
              </div>
              <div>
                <p className="text-[12px] text-gray-600 font-['Poppins',sans-serif] mb-1">Disconnection Type</p>
                <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{disconnectionType}</p>
              </div>
              <div>
                <p className="text-[12px] text-gray-600 font-['Poppins',sans-serif] mb-1">Payment Verified</p>
                <p className="text-[14px] font-semibold text-green-700 font-['Poppins',sans-serif]">₹{paymentAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[12px] text-gray-600 font-['Poppins',sans-serif] mb-1">Permission Date</p>
                <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{certIssuedDate}</p>
              </div>
              <div>
                <p className="text-[12px] text-gray-600 font-['Poppins',sans-serif] mb-1">Reason for Disconnection</p>
                <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{application.disconnectionReason || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[12px] text-gray-600 font-['Poppins',sans-serif] mb-1">RR Number</p>
                <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{application.rrNumber || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mb-5">
            <h4 className="text-[14px] font-bold text-gray-900 font-['Poppins',sans-serif] mb-2">Terms and Conditions:</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-[13px] font-['Poppins',sans-serif] text-gray-900">
              <li>Disconnection work must be carried out by the authorized licensed plumber only.</li>
              <li>Final meter reading must be recorded before disconnection.</li>
              <li>The disconnection point must be properly sealed and seal number recorded.</li>
              <li>Site photographs must be captured before and after disconnection.</li>
              <li>The property owner/occupant must be informed and preferably present during disconnection.</li>
              <li>Disconnection must be completed within 15 days from the date of this certificate.</li>
              <li>Any deviation from approved specifications requires prior written approval.</li>
              <li>This permission is non-transferable and valid only for the specified property.</li>
            </ol>
          </div>

          {/* Commissioner Remarks */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-[13px] text-blue-800 font-['Poppins',sans-serif]"><span className="font-semibold">Commissioner Remarks:</span> {commissionerRemarks}</p>
            <p className="text-[12px] text-blue-600 font-['Poppins',sans-serif] mt-1">Approved on: {commissionerApprovedAt}</p>
          </div>

          {/* Closing */}
          <div className="space-y-3 mb-6 text-[14px] font-['Poppins',sans-serif] text-gray-900">
            <p>
              This certificate is issued under the authority of the Commissioner, Department of Municipal Administration,
              Government of Karnataka, and is valid for immediate commencement of disconnection work.
            </p>
            <p>
              For any queries or clarifications, please contact the helpdesk at 1800-XXX-XXXX or visit www.jalanidhi.karnataka.gov.in
            </p>
          </div>

          {/* DSC Signature Block */}
          <div className="flex justify-end mt-8">
            <div className="text-right">
              <div className="mb-4 bg-green-50 border-2 border-green-500 rounded-lg p-4 inline-block">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-[12px] font-bold text-green-700 font-['Poppins',sans-serif]">DIGITALLY SIGNED</p>
                </div>
                <p className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">Signed on: {certSignedDate}</p>
                <p className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">Certificate ID: DSC-2026-DISCON-{application.id ? application.id.slice(-6).toUpperCase() : 'XXXXXX'}</p>
              </div>
              <div className="border-t-2 border-gray-800 pt-2 min-w-[250px]">
                <p className="text-[14px] font-bold text-gray-900 font-['Poppins',sans-serif]">Commissioner</p>
                <p className="text-[12px] text-gray-700 font-['Poppins',sans-serif]">Dept. of Municipal Administration</p>
                <p className="text-[12px] text-gray-700 font-['Poppins',sans-serif]">Government of Karnataka</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-center">
            <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">
              This is an official certificate from the Jalanidhi Portal, Department of Municipal Administration, Government of Karnataka
            </p>
            <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] mt-1">
              For verification, visit: www.jalanidhi.karnataka.gov.in | Certificate Verification ID: {applicationNo}
            </p>
          </div>
        </div>

        {/* Download Bar */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={() => alert('Permission letter downloaded successfully!')}
            className="px-5 py-2 bg-white border-2 border-[#1f3a5f] text-[#1f3a5f] rounded-md font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Permission Letter
          </button>
        </div>
      </div>

      {/* Action Card */}
      <div className="bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] p-6 mb-6">
        {isSubmitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-['Poppins',sans-serif] font-semibold text-[16px] text-green-800">
                  Disconnection Work Submitted
                </p>
                <p className="font-['Poppins',sans-serif] text-[13px] text-green-600">
                  The disconnection report has been submitted and sent to Field Engineer for verification.
                </p>
              </div>
            </div>
          </div>
        ) : isDeclined ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-['Poppins',sans-serif] font-semibold text-[16px] text-red-800">
                  Work Order Declined
                </p>
                <p className="font-['Poppins',sans-serif] text-[13px] text-red-600">
                  This work order has been declined and sent back to the Field Engineer.
                </p>
              </div>
            </div>
          </div>
        ) : isAccepted ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-['Poppins',sans-serif] font-semibold text-[16px] text-blue-800">
                  Work Order Accepted — Awaiting Field Visit
                </p>
                <p className="font-['Poppins',sans-serif] text-[13px] text-blue-600">
                  Please open the Plumber Mobile App to visit the field, complete the disconnection, and submit your report.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#414141] mb-4">
              Accept or Decline Work Order
            </h2>
            <p className="text-[14px] text-gray-600 font-['Poppins',sans-serif] mb-6">
              Review the application details above. If you accept, the disconnection work order will appear in your mobile app for field work.
            </p>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowDeclineModal(true)}
                disabled={processing}
                className="px-6 py-3 bg-white border-2 border-red-500 text-red-600 rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                Decline
              </button>
              <button
                onClick={handleAccept}
                disabled={processing}
                className="px-8 py-3 bg-[#22c55e] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#16a34a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Accept Work Order
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-[500px]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
                Decline Work Order
              </h2>
              <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                Please provide a reason for declining this disconnection work order.
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-[14px] font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">
                Reason for Declining <span className="text-red-500">*</span>
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[14px] focus:outline-none focus:border-[#1f3a5f] resize-none"
                placeholder="Explain why you are declining this work order..."
              />
            </div>
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => { setShowDeclineModal(false); setDeclineReason(''); }}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={processing || declineReason.trim().length < 10}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {processing ? 'Processing...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { ChevronLeft, CheckCircle, FileText, User, MapPin, Calendar, Phone, Download, Wrench, Hammer } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface PlumberInstallationWorkViewProps {
  application: any;
  onBack: () => void;
}

export default function PlumberInstallationWorkView({ application, onBack }: PlumberInstallationWorkViewProps) {
  const [processing, setProcessing] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(
    application.status === 'plumber_accepted_installation' ||
    application.status === 'installation_work_submitted' ||
    application.status === 'installation_completed'
  );

  const hasInstallationReport = application.installationReport ? true : false;

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const plumberId = userData.plumberLicense || 'PLB-001';
  const plumberName = userData.name || 'Plumber';

  const applicationNo = application.applicationNo || application.id || 'N/A';
  const applicantName = (application.applicantDetails && application.applicantDetails.applicantName) ? application.applicantDetails.applicantName : 'N/A';
  const mobile = (application.applicantDetails && application.applicantDetails.mobile) ? application.applicantDetails.mobile : 'N/A';
  const doorNumber = (application.applicantDetails && application.applicantDetails.doorNumber) ? application.applicantDetails.doorNumber : 'N/A';
  const wardNumber = (application.applicantDetails && application.applicantDetails.wardNumber) ? application.applicantDetails.wardNumber : 'N/A';
  const street = (application.applicantDetails && application.applicantDetails.street) ? application.applicantDetails.street : 'N/A';
  const address = (application.applicantDetails && application.applicantDetails.address) ? application.applicantDetails.address : 'N/A';
  const district = (application.propertyDetails && application.propertyDetails.district) ? application.propertyDetails.district : 'N/A';
  const ulb = (application.propertyDetails && application.propertyDetails.ulb) ? application.propertyDetails.ulb : 'N/A';
  const connectionType = (application.connectionDetails && application.connectionDetails.connectionType) ? application.connectionDetails.connectionType : 'New Connection';
  const propertyType = (application.connectionDetails && application.connectionDetails.propertyType) ? application.connectionDetails.propertyType : 'N/A';

  // Estimation data
  const estimationRows = (application.approvedEstimation && application.approvedEstimation.rows) ? application.approvedEstimation.rows : (application.plumberConnectionData && application.plumberConnectionData.estimationRows) ? application.plumberConnectionData.estimationRows : [];
  const totalAmount = (application.approvedEstimation && application.approvedEstimation.totalAmount) ? application.approvedEstimation.totalAmount : (application.plumberConnectionData && application.plumberConnectionData.totalAmount) ? application.plumberConnectionData.totalAmount : 0;

  const commissionerRemarks = (application.workflow && application.workflow.commissioner && application.workflow.commissioner.remarks) ? application.workflow.commissioner.remarks : 'Application approved';
  const commissionerApprovedAt = (application.workflow && application.workflow.commissioner && application.workflow.commissioner.approvedAt) ? new Date(application.workflow.commissioner.approvedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

  const currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const handleAccept = async () => {
    if (!confirm('Are you sure you want to accept this installation work? You will be responsible for installing the new tap connection at the specified address.')) return;

    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber/installation-action`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
          body: JSON.stringify({ applicationId: application.id, plumberId, plumberName, action: 'accept' }),
        }
      );
      const result = await response.json();
      if (result.success) {
        alert('Installation work accepted! You can now proceed with the field visit via the mobile app.');
        setActionCompleted(true);
      } else {
        alert('Error: ' + (result.error || 'Failed to accept'));
      }
    } catch (error) {
      console.error('Error accepting installation:', error);
      alert('Error: ' + error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2">
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">Installation Work Order</h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">Application: <span className="font-semibold">{applicationNo}</span></p>
        <div className="mt-2 flex gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-semibold font-['Poppins',sans-serif] ${
            application.status === 'installation_work_submitted' ? 'bg-blue-100 text-blue-800' :
            application.status === 'plumber_accepted_installation' ? 'bg-amber-100 text-amber-800' :
            application.status === 'installation_completed' ? 'bg-green-100 text-green-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {application.status === 'installation_work_submitted' ? 'Report Submitted' :
             application.status === 'plumber_accepted_installation' ? 'Accepted - Pending Field Visit' :
             application.status === 'installation_completed' ? 'Installation Complete' :
             'Pending Acceptance'}
          </span>
        </div>
      </div>

      {/* Permission Letter */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-[#1f3a5f]" />
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Permission Letter - New Tap Installation</h2>
        </div>
        <div className="p-8 bg-white">
          <div className="text-center mb-6 border-b-2 border-[#1f3a5f] pb-4">
            <ImageWithFallback src="https://upload.wikimedia.org/wikipedia/commons/d/d3/Seal_of_Karnataka.png" alt="Government of Karnataka Seal" className="w-[80px] h-[80px] mx-auto mb-3 object-contain" />
            <p className="text-[#1f3a5f] font-bold text-[20px] font-['Poppins',sans-serif]">GOVERNMENT OF KARNATAKA</p>
            <p className="text-[#414141] font-semibold text-[16px] font-['Poppins',sans-serif]">Department of Municipal Administration</p>
            <p className="text-gray-600 text-[13px] font-['Poppins',sans-serif]">Jalanidhi - Water Supply Connection Service</p>
          </div>

          <div className="flex justify-between mb-4 text-[13px] font-['Poppins',sans-serif]">
            <p className="text-gray-600">Ref: DMA/JN/{applicationNo}</p>
            <p className="text-gray-600">Date: {currentDate}</p>
          </div>

          <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-4">
            <p className="text-green-800 font-semibold text-[15px] font-['Poppins',sans-serif] mb-2">INSTALLATION PERMISSION GRANTED</p>
            <p className="text-green-700 text-[14px] font-['Poppins',sans-serif]">
              The Commissioner has approved the new tap water connection for the below property. You are authorized to proceed with the installation work.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 rounded-lg p-4">
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Applicant</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{applicantName}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Mobile</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{mobile}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Door No</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{doorNumber}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Ward</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{wardNumber}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Street</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{street}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">District / ULB</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{district} / {ulb}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Connection Type</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{connectionType}</p></div>
            <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Property Type</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{propertyType}</p></div>
            <div className="col-span-2"><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Address</p><p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{address}</p></div>
          </div>

          {/* Approved Estimation */}
          {estimationRows.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[14px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">Approved Cost Estimation</h4>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-[#1f3a5f] grid grid-cols-[30px_2.5fr_1.5fr_1.5fr] gap-2 px-4 py-2">
                  <p className="text-white text-[12px] font-semibold font-['Poppins',sans-serif] text-center">#</p>
                  <p className="text-white text-[12px] font-semibold font-['Poppins',sans-serif]">Attribute</p>
                  <p className="text-white text-[12px] font-semibold font-['Poppins',sans-serif] text-center">Measurement</p>
                  <p className="text-white text-[12px] font-semibold font-['Poppins',sans-serif] text-right">Amount</p>
                </div>
                {estimationRows.map((row: any, idx: number) => (
                  <div key={row.id || idx} className={`grid grid-cols-[30px_2.5fr_1.5fr_1.5fr] gap-2 px-4 py-2 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <p className="text-gray-500 text-[13px] font-['Poppins',sans-serif] text-center">{idx + 1}</p>
                    <p className="text-gray-900 text-[13px] font-['Poppins',sans-serif]">{row.attribute}</p>
                    <p className="text-gray-700 text-[13px] font-['Poppins',sans-serif] text-center">{row.measurement}</p>
                    <p className="text-gray-900 text-[13px] font-semibold font-['Poppins',sans-serif] text-right">{typeof row.price === 'number' ? '₹' + row.price.toFixed(2) : row.price}</p>
                  </div>
                ))}
                <div className="bg-[#1f3a5f]/10 border-t-2 border-[#1f3a5f] grid grid-cols-[30px_2.5fr_1.5fr_1.5fr] gap-2 px-4 py-3">
                  <div></div>
                  <p className="text-[#1f3a5f] text-[13px] font-bold font-['Poppins',sans-serif]">Total</p>
                  <div></div>
                  <p className="text-[#1f3a5f] text-[14px] font-bold font-['Poppins',sans-serif] text-right">₹{typeof totalAmount === 'number' ? totalAmount.toFixed(2) : totalAmount}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-[13px] text-blue-800 font-['Poppins',sans-serif]"><span className="font-semibold">Commissioner Remarks:</span> {commissionerRemarks}</p>
            <p className="text-[12px] text-blue-600 font-['Poppins',sans-serif] mt-1">Approved on: {commissionerApprovedAt}</p>
          </div>

          <div className="flex justify-end mt-4">
            <div className="text-right border-t-2 border-gray-800 pt-2 min-w-[200px]">
              <p className="text-[14px] font-bold text-gray-900 font-['Poppins',sans-serif]">Commissioner</p>
              <p className="text-[12px] text-gray-700 font-['Poppins',sans-serif]">Dept. of Municipal Administration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Installation Report (if submitted) */}
      {hasInstallationReport && (
        <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-6 py-4 flex items-center gap-3">
            <Hammer className="w-5 h-5 text-white" />
            <h2 className="text-xl font-semibold text-white font-['Poppins',sans-serif]">Installation Report Submitted</h2>
          </div>
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-semibold font-['Poppins',sans-serif]">Work Completed</p>
              </div>
              <p className="text-green-700 text-[14px] font-['Poppins',sans-serif]">
                Installation report has been submitted and is pending Field Engineer verification.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Submitted By</p><p className="text-[14px] font-medium font-['Poppins',sans-serif]">{application.installationReport.plumberName || plumberName}</p></div>
              <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Submitted At</p><p className="text-[14px] font-medium font-['Poppins',sans-serif]">{application.installationReport.submittedAt ? new Date(application.installationReport.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p></div>
              {application.installationReport.meterNumber && <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Meter Number</p><p className="text-[14px] font-medium font-['Poppins',sans-serif]">{application.installationReport.meterNumber}</p></div>}
              {application.installationReport.pipeSize && <div><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Pipe Size</p><p className="text-[14px] font-medium font-['Poppins',sans-serif]">{application.installationReport.pipeSize}</p></div>}
              {application.installationReport.installationRemarks && <div className="col-span-2"><p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">Remarks</p><p className="text-[14px] font-medium font-['Poppins',sans-serif]">{application.installationReport.installationRemarks}</p></div>}
            </div>
          </div>
        </div>
      )}

      {/* Action Section */}
      {!actionCompleted && (application.status === 'sentToCitizenForPayment' || application.status === 'installation_approved' || application.status === 'approved') && (
        <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
          <div className="bg-[#1f3a5f] px-6 py-4">
            <h2 className="text-xl font-semibold text-white font-['Poppins',sans-serif]">Accept Installation Work</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 font-['Poppins',sans-serif] text-[15px] mb-6">
              You have been assigned to install a new tap water connection at the above property.
              Please review the permission letter and accept the work to proceed.
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleAccept}
                disabled={processing}
                className="px-8 py-3 bg-[#22c55e] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#16a34a] transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {processing ? 'Processing...' : 'Accept Installation Work'}
              </button>
            </div>
          </div>
        </div>
      )}

      {actionCompleted && application.status === 'plumber_accepted_installation' && (
        <div className="bg-green-50 border-2 border-green-400 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-bold text-green-800 font-['Poppins',sans-serif]">Work Accepted - Field Visit Pending</h3>
              <p className="text-[14px] text-green-700 font-['Poppins',sans-serif]">
                Please use the Plumber Mobile App to visit the site, verify location, capture photos, and submit the installation report.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
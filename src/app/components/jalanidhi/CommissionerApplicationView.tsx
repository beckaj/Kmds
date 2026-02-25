import { useState, useEffect } from 'react';
import { ChevronLeft, User, MapPin, Droplet, FileText, Download, CheckCircle, XCircle, Wrench, Pencil, RotateCcw, ClipboardCheck, CheckCircle2, Circle, Calculator, AlertTriangle } from 'lucide-react';
import PaymentLetterView from './PaymentLetterView';
import SectionTitle from './SectionTitle';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface CommissionerApplicationViewProps {
  applicationId: string;
  onBack: () => void;
}

export default function CommissionerApplicationView({ applicationId, onBack }: CommissionerApplicationViewProps) {
  const [commissionerRemarks, setCommissionerRemarks] = useState('');
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showPaymentLetter, setShowPaymentLetter] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editedEstimationRows, setEditedEstimationRows] = useState<Array<{ id: string; attribute: string; measurement: string; price: number }>>([]);
  const [isEstimationEditing, setIsEstimationEditing] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  // Initialize editable estimation rows from fieldVisitReport.fieldEngineerEstimation (or fallback to plumber)
  useEffect(() => {
    if (application && application.fieldVisitReport && application.fieldVisitReport.fieldEngineerEstimation && application.fieldVisitReport.fieldEngineerEstimation.rows) {
      setEditedEstimationRows(
        application.fieldVisitReport.fieldEngineerEstimation.rows.map((row: any) => ({
          id: row.id || String(Math.random()),
          attribute: row.attribute || '',
          measurement: row.measurement || '',
          price: typeof row.price === 'number' ? row.price : parseFloat(row.price) || 0,
        }))
      );
    } else if (application && application.fieldVisitReport && application.fieldVisitReport.plumberEstimation && application.fieldVisitReport.plumberEstimation.rows) {
      setEditedEstimationRows(
        application.fieldVisitReport.plumberEstimation.rows.map((row: any) => ({
          id: row.id || String(Math.random()),
          attribute: row.attribute || '',
          measurement: row.measurement || '',
          price: typeof row.price === 'number' ? row.price : parseFloat(row.price) || 0,
        }))
      );
    }
  }, [application]);

  const editedTotalAmount = editedEstimationRows.reduce((sum, row) => sum + (row.price || 0), 0);

  const handlePriceEdit = (rowId: string, newPrice: string) => {
    const parsed = parseFloat(newPrice);
    setEditedEstimationRows(prev =>
      prev.map(row => row.id === rowId ? { ...row, price: isNaN(parsed) ? 0 : parsed } : row)
    );
  };

  const handleMeasurementEdit = (rowId: string, newMeasurement: string) => {
    setEditedEstimationRows(prev =>
      prev.map(row => row.id === rowId ? { ...row, measurement: newMeasurement } : row)
    );
  };

  const resetEstimation = () => {
    if (application && application.fieldVisitReport && application.fieldVisitReport.fieldEngineerEstimation && application.fieldVisitReport.fieldEngineerEstimation.rows) {
      setEditedEstimationRows(
        application.fieldVisitReport.fieldEngineerEstimation.rows.map((row: any) => ({
          id: row.id || String(Math.random()),
          attribute: row.attribute || '',
          measurement: row.measurement || '',
          price: typeof row.price === 'number' ? row.price : parseFloat(row.price) || 0,
        }))
      );
    } else if (application && application.fieldVisitReport && application.fieldVisitReport.plumberEstimation && application.fieldVisitReport.plumberEstimation.rows) {
      setEditedEstimationRows(
        application.fieldVisitReport.plumberEstimation.rows.map((row: any) => ({
          id: row.id || String(Math.random()),
          attribute: row.attribute || '',
          measurement: row.measurement || '',
          price: typeof row.price === 'number' ? row.price : parseFloat(row.price) || 0,
        }))
      );
    }
    setIsEstimationEditing(false);
  };

  const fetchApplication = async () => {
    try {
      setLoading(true);
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

      const data = await response.json();
      
      if (data.success && data.application) {
        const app = data.application;
        // Runtime fix: if propertyType is a known service-type string (legacy form bug),
        // it means the usage category was incorrectly stored. Detect and auto-patch.
        const KNOWN_CATEGORIES = ['domestic', 'commercial', 'non-domestic', 'nondomestic', 'non_domestic', 'industrial'];
        const cd = app.connectionDetails;
        if (cd && cd.propertyType) {
          const ptNorm = cd.propertyType.toLowerCase().replace(/[\s_-]+/g, '');
          const isValidCategory = KNOWN_CATEGORIES.some(function(cat) { return ptNorm === cat.replace(/[\s_-]+/g, ''); });
          if (!isValidCategory) {
            // propertyType contains a service type (e.g. "new-tap-connection") — default to "domestic"
            console.log('[COMMISSIONER] Auto-fixing invalid propertyType:', cd.propertyType, '→ domestic');
            cd.propertyType = 'domestic';
            // Also patch the DB asynchronously so it's fixed permanently
            fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-698be164/dev/patch-application`,
              {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: app.id, patch: { connectionDetails: { propertyType: 'domestic' } } }),
              }
            ).then(function(r) { return r.json(); }).then(function(d) { console.log('[COMMISSIONER] Auto-patched propertyType:', d); }).catch(function() {});
          }
        }
        setApplication(app);
      } else {
        setError('Application not found');
      }
    } catch (err) {
      console.error('Error fetching application:', err);
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#1f3a5f] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#1f3a5f] font-['Poppins',sans-serif] text-lg">Loading application...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        <button onClick={onBack} className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error || 'Application not found'}
        </div>
      </div>
    );
  }

  // Check if already approved/sent to payment
  const isAlreadyApproved = application.status === 'sentToCitizenForPayment' || 
                            application.currentStage === 'payment' ||
                            (application.workflow && application.workflow.commissioner && application.workflow.commissioner.status === 'approved');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDecisionClick = (selectedDecision: 'approve' | 'reject') => {
    if (commissionerRemarks.trim().length < 20) {
      alert('Please provide remarks (minimum 20 characters) before proceeding.');
      return;
    }
    setDecision(selectedDecision);
    setShowConfirmPopup(true);
  };

  const confirmDecision = async () => {
    setProcessing(true);
    setShowConfirmPopup(false);
    
    try {
      console.log('[COMMISSIONER] Application decision:', {
        applicationId,
        decision,
        commissionerRemarks,
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (decision === 'approve') {
        // For approval, show payment letter page
        setShowPaymentLetter(true);
      } else {
        // For rejection, go back to dashboard
        alert('❌ Application Rejected');
        const event = new CustomEvent('navigate', { detail: '/jalanidhi/commissioner/tap-connection' });
        window.dispatchEvent(event);
      }
      
    } catch (error) {
      console.error('Error processing decision:', error);
      alert(`Error processing decision: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  // Show Payment Letter View if approved
  if (showPaymentLetter) {
    return (
      <PaymentLetterView
        applicationId={applicationId}
        applicationNo={application.applicationNo || application.id}
        applicantName={(application.applicantDetails && application.applicantDetails.applicantName) || 'N/A'}
        totalAmount={editedTotalAmount > 0 ? editedTotalAmount : ((application.plumberConnectionData && application.plumberConnectionData.totalAmount) || (application.plumberEstimation && application.plumberEstimation.totalAmount) || 0)}
        estimationRows={editedEstimationRows.length > 0 ? editedEstimationRows : undefined}
        commissionerRemarks={commissionerRemarks}
        connectionType={(application.connectionDetails && application.connectionDetails.connectionType) || ''}
        usageCategory={(application.connectionDetails && application.connectionDetails.propertyType) || ''}
        nonMeterBillingMode={(application.connectionDetails && application.connectionDetails.nonMeterBillingMode) || ''}
        unauthorizedTapPenalty={
          application.fieldVisitReport && application.fieldVisitReport.unauthorizedTapConnection && application.fieldVisitReport.unauthorizedTapConnection.found
            ? (typeof application.fieldVisitReport.unauthorizedTapConnection.penaltyAmount === 'number'
              ? application.fieldVisitReport.unauthorizedTapConnection.penaltyAmount
              : parseFloat(application.fieldVisitReport.unauthorizedTapConnection.penaltyAmount || '0') || 0)
            : 0
        }
        onBack={() => setShowPaymentLetter(false)}
      />
    );
  }

  // Use plumberConnectionData or plumberEstimation (for backward compatibility)
  const estimationData = application.plumberConnectionData || application.plumberEstimation || {};
  const estimationRows = estimationData.estimationRows || estimationData.rows || [];
  const totalAmount = estimationData.totalAmount || 0;
  const documents = estimationData.documents || [];
  const comments = estimationData.comments || 'No comments provided';

  // Safe access to workflow data
  const caseworkerDetails = application.caseworkerDetails || (application.workflow && application.workflow.caseworker) || {};
  const revenueOfficerDetails = application.revenueOfficerDetails || (application.workflow && application.workflow.revenueOfficer) || {};
  const fieldEngineerDetails = application.fieldEngineer || (application.workflow && application.workflow.fieldEngineer) || {};
  const fieldVisitReport = application.fieldVisitReport || {};
  
  // Check if all required data is present for display
  const hasCompleteData = caseworkerDetails && revenueOfficerDetails && fieldEngineerDetails && fieldVisitReport;

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
          Application ID: <span className="font-semibold">{application.applicationNo}</span>
        </p>
        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mt-1">
          Submitted on: {formatDate(application.submittedAt)}
        </p>
      </div>

      {/* Application Summary Card */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
          Application Details
        </h2>
        
        <div className="space-y-6">
          {/* Applicant Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Applicant Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Name</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.applicantDetails.applicantName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Mobile</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.applicantDetails.mobile}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Email</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.applicantDetails.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Father's Name</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.applicantDetails.fatherName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Aadhar Number</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.applicantDetails.aadharNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Door Number</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.applicantDetails.doorNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Ward Number</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.applicantDetails.wardNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Street</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.applicantDetails.street}
                </p>
              </div>
              <div className="md:col-span-3">
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Address</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.applicantDetails.address}
                </p>
              </div>
            </div>
          </div>

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
                  {application.propertyDetails.district}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">ULB</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.propertyDetails.ulb}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">ULB Type</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.propertyDetails.ulbType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Authority Type</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.propertyDetails.authorityType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Property Type</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.propertyDetails.propertyType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Ownership Type</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.propertyDetails.ownershipType}
                </p>
              </div>
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
                  {application.connectionDetails.connectionType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Property Type</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                  {application.connectionDetails.propertyType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Assigned Plumber</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.plumberDetails.plumberName}
                </p>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          {application.bankDetails && (
            <div>
              <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
                Bank Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Account Holder Name</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.bankDetails.fullName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Bank Name</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.bankDetails.bankName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Branch Name</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.bankDetails.branchName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Account Number</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.bankDetails.accountNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">IFSC Code</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.bankDetails.ifscCode || 'N/A'}
                  </p>
                </div>
              </div>
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
          {/* Estimation Table */}
          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Cost Estimation Breakdown
            </h3>
            
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
                  Amount (₹)
                </div>
              </div>

              <div className="bg-white">
                {estimationRows.map((row: any, index: number) => (
                  <div
                    key={row.id || index}
                    className="grid grid-cols-[60px_2fr_1.5fr_1fr] gap-4 px-6 py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="font-['Poppins',sans-serif] text-[14px] text-gray-600 text-center">
                      {index + 1}
                    </div>
                    <div className="font-['Poppins',sans-serif] text-[14px] text-gray-900">
                      {row.attribute}
                    </div>
                    <div className="font-['Poppins',sans-serif] text-[14px] text-gray-700 text-center">
                      {row.measurement}
                    </div>
                    <div className="font-['Poppins',sans-serif] text-[14px] text-gray-900 text-right">
                      ₹{typeof row.price === 'number' ? row.price.toFixed(2) : row.price}
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
                    ₹{typeof totalAmount === 'number' ? totalAmount.toFixed(2) : totalAmount}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Uploaded Documents */}
          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Uploaded Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc, index) => (
                <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-gray-900">{doc.name}</p>
                      <p className="font-['Poppins',sans-serif] text-[12px] text-gray-600">{doc.type}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-blue-100 rounded-md transition-colors">
                    <Download className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Plumber Comments */}
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <p className="text-sm font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">
              Plumber's Comments:
            </p>
            <p className="font-['Poppins',sans-serif] text-[14px] text-gray-700 whitespace-pre-wrap leading-relaxed">
              {comments}
            </p>
          </div>
        </div>
      </div>

      {/* Consolidated Remarks Card */}
      <div className="mb-6">
        {(() => {
          const remarkEntries: RemarkEntry[] = [];
          if (comments && comments !== 'No comments provided') {
            remarkEntries.push({ role: 'Plumber', comment: comments });
          }
          if (caseworkerDetails && caseworkerDetails.comment) {
            remarkEntries.push({ role: 'Caseworker', comment: caseworkerDetails.comment, timestamp: caseworkerDetails.forwardedAt || '' });
          }
          if (revenueOfficerDetails && revenueOfficerDetails.comment) {
            remarkEntries.push({ role: 'Revenue Officer', comment: revenueOfficerDetails.comment, timestamp: revenueOfficerDetails.forwardedAt || '' });
          }
          if (fieldEngineerDetails && fieldEngineerDetails.remarks) {
            remarkEntries.push({ role: 'Field Engineer', comment: fieldEngineerDetails.remarks, timestamp: fieldEngineerDetails.forwardedAt || '' });
          }
          return <RemarksTimeline remarks={remarkEntries} title="Remarks" />;
        })()}
      </div>

      {/* Field Inspection Report Card */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
          Field Inspection Report
        </h2>
        
        <div className="space-y-6">
          {/* Location Verification */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Location Verification
              </h3>
            </div>
            
            {fieldVisitReport && fieldVisitReport.locationVerification ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left side - Verification details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Verified By</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {(fieldVisitReport && fieldVisitReport.engineerName) || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Verified At</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {fieldVisitReport && fieldVisitReport.locationVerification && fieldVisitReport.locationVerification.verifiedAt ? formatDate(fieldVisitReport.locationVerification.verifiedAt) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Address</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {(fieldVisitReport && fieldVisitReport.locationVerification && fieldVisitReport.locationVerification.address) || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Coordinates</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    Latitude: {(fieldVisitReport && fieldVisitReport.locationVerification && fieldVisitReport.locationVerification.latitude) || 'N/A'}, Longitude: {(fieldVisitReport && fieldVisitReport.locationVerification && fieldVisitReport.locationVerification.longitude) || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium font-['Poppins',sans-serif] ${
                      fieldVisitReport && fieldVisitReport.locationVerification && fieldVisitReport.locationVerification.verified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {fieldVisitReport && fieldVisitReport.locationVerification && fieldVisitReport.locationVerification.verified ? '✓ Verified' : '✗ Not Verified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side - Map */}
              {fieldVisitReport && fieldVisitReport.locationVerification && fieldVisitReport.locationVerification.latitude && fieldVisitReport.locationVerification.longitude && (
              <div className="bg-gray-50 rounded-lg p-2 h-[400px]">
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${fieldVisitReport.locationVerification.longitude - 0.01},${fieldVisitReport.locationVerification.latitude - 0.01},${fieldVisitReport.locationVerification.longitude + 0.01},${fieldVisitReport.locationVerification.latitude + 0.01}&layer=mapnik&marker=${fieldVisitReport.locationVerification.latitude},${fieldVisitReport.locationVerification.longitude}`}
                  className="w-full h-full rounded-md border-2 border-[#1f3a5f]"
                  title="Location Map"
                />
              </div>
              )}
            </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 font-['Poppins',sans-serif]">Location verification data not available</p>
              </div>
            )}
          </div>

          {/* Site Observations */}
          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Site Observations
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-[15px] text-gray-900 font-['Poppins',sans-serif] leading-relaxed">
                {(fieldVisitReport && fieldVisitReport.siteObservations) || 'No site observations recorded'}
              </p>
            </div>
          </div>

          {/* Engineer Remarks */}
          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Engineer Remarks
            </h3>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-[15px] text-gray-900 font-['Poppins',sans-serif] leading-relaxed">
                {(fieldVisitReport && fieldVisitReport.engineerRemarks) || 'No engineer remarks recorded'}
              </p>
            </div>
          </div>

          {/* Plumber's Cost Estimation - Read Only */}
          {fieldVisitReport && fieldVisitReport.plumberEstimation && fieldVisitReport.plumberEstimation.rows && fieldVisitReport.plumberEstimation.rows.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <Wrench className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Plumber's Cost Estimation
              </h3>
              <span className="ml-auto bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[11px] font-semibold font-['Poppins',sans-serif]">
                Read Only
              </span>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              {/* Table Header */}
              <div className="bg-[#1f3a5f] grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3 px-5 py-3 rounded-t-lg">
                <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-center">#</p>
                <p className="text-white text-sm font-semibold font-['Poppins',sans-serif]">Attribute</p>
                <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-center">Measurement</p>
                <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-right">Price (₹)</p>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {fieldVisitReport.plumberEstimation.rows.map((row: any, index: number) => (
                  <div
                    key={row.id || index}
                    className={`grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3 px-5 py-3.5 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <p className="text-gray-500 text-sm font-['Poppins',sans-serif] text-center">{index + 1}</p>
                    <p className="text-gray-900 text-[15px] font-medium font-['Poppins',sans-serif]">{row.attribute}</p>
                    <p className="text-gray-700 text-[15px] font-['Poppins',sans-serif] text-center">{row.measurement}</p>
                    <p className="text-gray-900 text-[15px] font-semibold font-['Poppins',sans-serif] text-right">₹{typeof row.price === 'number' ? row.price.toFixed(2) : row.price}</p>
                  </div>
                ))}
              </div>

              {/* Total Amount */}
              <div className="bg-gray-100 border-t-2 border-gray-300 px-5 py-4">
                <div className="grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3">
                  <div></div>
                  <p className="text-[#1f3a5f] text-[15px] font-bold font-['Poppins',sans-serif]">Total Amount</p>
                  <div></div>
                  <p className="text-[#1f3a5f] text-lg font-bold font-['Poppins',sans-serif] text-right">₹{typeof fieldVisitReport.plumberEstimation.totalAmount === 'number' ? fieldVisitReport.plumberEstimation.totalAmount.toFixed(2) : fieldVisitReport.plumberEstimation.totalAmount}</p>
                </div>
              </div>
            </div>

            {/* Plumber Comments from field visit */}
            {fieldVisitReport.plumberEstimation.comments && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-[#1f3a5f] font-semibold font-['Poppins',sans-serif] mb-2">
                  Plumber's Comments:
                </p>
                <p className="text-[15px] text-gray-900 font-['Poppins',sans-serif] leading-relaxed">
                  {fieldVisitReport.plumberEstimation.comments}
                </p>
              </div>
            )}
          </div>
          )}

          {/* Field Engineer's Cost Estimation - Editable by Commissioner */}
          {editedEstimationRows.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <Calculator className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Field Engineer's Cost Estimation
              </h3>
              {!isAlreadyApproved && (
                <div className="ml-auto flex items-center gap-2">
                  {isEstimationEditing ? (
                    <>
                      <button
                        onClick={resetEstimation}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-[12px] font-semibold font-['Poppins',sans-serif] hover:bg-gray-200 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                      </button>
                      <button
                        onClick={() => setIsEstimationEditing(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f3a5f] text-white rounded-md text-[12px] font-semibold font-['Poppins',sans-serif] hover:bg-[#27548a] transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Done
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEstimationEditing(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f3a5f]/15 text-[#1f3a5f] border border-[#1f3a5f]/40 rounded-md text-[12px] font-semibold font-['Poppins',sans-serif] hover:bg-[#1f3a5f]/25 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit Estimation
                    </button>
                  )}
                </div>
              )}
            </div>

            {isEstimationEditing && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-[13px] text-amber-800 font-['Poppins',sans-serif]">
                  <span className="font-semibold">Editing Mode:</span> Modify measurements and prices as needed. The total will auto-recalculate. These updated values will appear in the payment letter.
                </p>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              {/* Table Header */}
              <div className="bg-[#1f3a5f] grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3 px-5 py-3 rounded-t-lg">
                <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-center">#</p>
                <p className="text-white text-sm font-semibold font-['Poppins',sans-serif]">Attribute</p>
                <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-center">Measurement</p>
                <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-right">Price (₹)</p>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {editedEstimationRows.map((row, index) => (
                  <div
                    key={row.id}
                    className={`grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3 px-5 py-3.5 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <p className="text-gray-500 text-sm font-['Poppins',sans-serif] text-center">{index + 1}</p>
                    <p className="text-gray-900 text-[15px] font-medium font-['Poppins',sans-serif]">{row.attribute}</p>
                    {isEstimationEditing ? (
                      <input
                        type="text"
                        value={row.measurement}
                        onChange={(e) => handleMeasurementEdit(row.id, e.target.value)}
                        className="text-center text-[15px] text-[#1f3a5f] font-['Poppins',sans-serif] bg-white border-2 border-[#1f3a5f] rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-[#1f3a5f]/30"
                      />
                    ) : (
                      <p className="text-gray-700 text-[15px] font-['Poppins',sans-serif] text-center">{row.measurement}</p>
                    )}
                    {isEstimationEditing ? (
                      <div className="flex items-center justify-end">
                        <span className="text-gray-500 text-[15px] font-['Poppins',sans-serif] mr-1">₹</span>
                        <input
                          type="number"
                          value={row.price}
                          onChange={(e) => handlePriceEdit(row.id, e.target.value)}
                          className="w-[100px] text-right text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] bg-white border-2 border-[#1f3a5f] rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-[#1f3a5f]/30"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-900 text-[15px] font-semibold font-['Poppins',sans-serif] text-right">₹{row.price.toFixed(2)}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Total Amount */}
              <div className="bg-[#1f3a5f]/10 border-t-2 border-[#1f3a5f] px-5 py-4">
                <div className="grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3">
                  <div></div>
                  <p className="text-[#1f3a5f] text-[15px] font-bold font-['Poppins',sans-serif]">Total Amount</p>
                  <div></div>
                  <p className="text-[#1f3a5f] text-lg font-bold font-['Poppins',sans-serif] text-right">₹{editedTotalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Inspection Checklist */}
          {fieldVisitReport && fieldVisitReport.inspectionChecklist && fieldVisitReport.inspectionChecklist.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <ClipboardCheck className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Site Inspection Checklist
              </h3>
              <span className="ml-auto bg-[#1f3a5f]/10 text-[#1f3a5f] px-3 py-1 rounded-full text-xs font-semibold font-['Poppins',sans-serif]">
                {fieldVisitReport.inspectionChecklist.filter((item: any) => item && item.checked).length} of {fieldVisitReport.inspectionChecklist.length} verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fieldVisitReport.inspectionChecklist.map((item: any, index: number) => (
                <div
                  key={item && item.id ? item.id : 'chk-' + index}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                    item && item.checked
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {item && item.checked ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <p className={`text-[14px] font-['Poppins',sans-serif] leading-relaxed ${
                    item && item.checked ? 'text-green-800 font-medium' : 'text-gray-500'
                  }`}>
                    {item && item.label ? item.label : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Photos */}
          {fieldVisitReport && fieldVisitReport.photos && fieldVisitReport.photos.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Site Photos ({fieldVisitReport.photos.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fieldVisitReport.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="border-2 border-blue-300 rounded-lg overflow-hidden bg-white shadow-md hover:shadow-xl transition-all">
                    <img 
                      src={photo} 
                      alt={`Site Photo ${index + 1}`}
                      className="w-full h-[300px] object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-white">
                          Photo {index + 1}
                        </p>
                        <button className="p-2 bg-white/90 hover:bg-white rounded-md transition-colors">
                          <Download className="w-4 h-4 text-[#1f3a5f]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Documents */}
          {fieldVisitReport && fieldVisitReport.documents && fieldVisitReport.documents.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Supporting Documents ({fieldVisitReport.documents.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fieldVisitReport.documents.map((doc, index) => (
                <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50 flex items-center justify-between hover:bg-blue-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-gray-900">{doc.name}</p>
                      <p className="font-['Poppins',sans-serif] text-[12px] text-gray-600">{doc.size}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-blue-200 rounded-md transition-colors">
                    <Download className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      </div>

      {/* ── Unauthorized Tap Connection Alert (if found) ── */}
      {fieldVisitReport && fieldVisitReport.unauthorizedTapConnection && fieldVisitReport.unauthorizedTapConnection.found && (
        <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6 border-2 border-red-300">
          <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-white" />
            <h2 className="text-lg font-semibold text-white font-['Poppins',sans-serif]">
              Unauthorized Tap Connection Detected
            </h2>
          </div>
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-red-800 font-['Poppins',sans-serif] mb-1">
                    Field Engineer has reported an unauthorized tap connection at this site.
                  </p>
                  <p className="text-[13px] text-red-700 font-['Poppins',sans-serif]">
                    As per Government norms, a penalty has been recommended. This amount will be added to the citizen's total payment along with the installation charges.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-red-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-red-200">
                <div className="p-4 text-center">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-['Poppins',sans-serif] font-medium mb-1">Status</p>
                  <p className="text-[15px] font-bold text-red-600 font-['Poppins',sans-serif]">Unauthorized</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-['Poppins',sans-serif] font-medium mb-1">Penalty Amount</p>
                  <p className="text-[20px] font-bold text-red-600 font-['Poppins',sans-serif]">
                    ₹{typeof fieldVisitReport.unauthorizedTapConnection.penaltyAmount === 'number'
                      ? fieldVisitReport.unauthorizedTapConnection.penaltyAmount.toFixed(2)
                      : parseFloat(fieldVisitReport.unauthorizedTapConnection.penaltyAmount || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commissioner Decision Card */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="bg-[#1f3a5f] px-6 py-4">
          <h2 className="text-xl font-semibold text-white font-['Poppins',sans-serif]">
            Commissioner's Decision
          </h2>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Show Already Approved Message if applicable */}
          {isAlreadyApproved ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-bold text-green-800 font-['Poppins',sans-serif]">
                    Application Already Approved
                  </h3>
                  <p className="text-sm text-green-700 font-['Poppins',sans-serif] mt-1">
                    This application has been approved and sent to the citizen for payment
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">Status</p>
                    <p className="text-base font-semibold text-gray-900 font-['Poppins',sans-serif]">
                      {application.status === 'sentToCitizenForPayment' ? 'Sent to Citizen for Payment' : application.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">Current Stage</p>
                    <p className="text-base font-semibold text-gray-900 font-['Poppins',sans-serif] capitalize">
                      {application.currentStage}
                    </p>
                  </div>
                </div>
                
                {application.workflow && application.workflow.commissioner && application.workflow.commissioner.remarks && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Approval Remarks</p>
                    <p className="text-sm text-gray-900 font-['Poppins',sans-serif]">
                      {application.workflow.commissioner.remarks}
                    </p>
                  </div>
                )}
                
                {application.workflow && application.workflow.commissioner && application.workflow.commissioner.approvedAt && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">Approved At</p>
                    <p className="text-sm text-gray-900 font-['Poppins',sans-serif]">
                      {formatDate(application.workflow.commissioner.approvedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Show Remarks Input and Action Buttons for Pending Applications */
            <div>
              <label className="block text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-3">
                Remarks <span className="text-red-600">*</span>
              </label>
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-3">
                Provide your decision remarks (minimum 20 characters required)
              </p>
              
              <div className="bg-white border-2 border-[#1f3a5f] rounded-lg overflow-hidden">
                <textarea
                  value={commissionerRemarks}
                  onChange={(e) => setCommissionerRemarks(e.target.value)}
                  placeholder="Enter your remarks about the application review, approval/rejection reason, and any additional instructions..."
                  className="w-full min-h-[120px] px-4 py-3 font-['Poppins',sans-serif] text-[15px] text-gray-900 outline-none resize-vertical"
                  rows={5}
                />
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                    Character count: {commissionerRemarks.length} (Minimum 20 required)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          disabled={processing}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back to Dashboard
        </button>
        
        {!isAlreadyApproved && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleDecisionClick('reject')}
              disabled={processing}
              className="px-8 py-3 bg-white border-2 border-red-600 text-red-600 rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              {processing && decision === 'reject' ? 'Processing...' : 'Reject Application'}
            </button>

            <button
              onClick={() => handleDecisionClick('approve')}
              disabled={processing}
              className="px-8 py-3 bg-[#22c55e] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#16a34a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              {processing && decision === 'approve' ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.928l3-2.647z"></path>
                </svg>
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              {processing && decision === 'approve' ? 'Processing...' : 'Approve Application'}
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-[400px]">
            <h2 className={`text-xl font-bold font-['Poppins',sans-serif] mb-4 ${
              decision === 'approve' ? 'text-green-600' : 'text-red-600'
            }`}>
              {decision === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </h2>
            <p className="text-gray-600 font-['Poppins',sans-serif] mb-6">
              {decision === 'approve' 
                ? 'Are you sure you want to approve this application? This action will move the application to the next stage.'
                : 'Are you sure you want to reject this application? This action cannot be undone.'}
            </p>
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDecision}
                className={`px-6 py-2 text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:opacity-90 transition-colors ${
                  decision === 'approve' ? 'bg-green-600' : 'bg-red-600'
                }`}
              >
                {decision === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
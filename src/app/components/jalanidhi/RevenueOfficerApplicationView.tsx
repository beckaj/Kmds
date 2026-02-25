import { useState, useEffect } from 'react';
import SectionTitle from './SectionTitle';
import { ChevronLeft, User, MapPin, Droplet, FileText, Download } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import svgPaths from '../../../imports/svg-qcyk0j46yr';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface RevenueOfficerApplicationViewProps {
  applicationId: string;
}

interface ApplicationData {
  id: string;
  applicationNo: string;
  status: string;
  submittedAt: string;
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
  };
  propertyDetails: {
    district: string;
    ulb: string;
    ulbType: string;
    authorityType: string;
    ownershipType: string;
    propertyId?: string;
  };
  connectionDetails: {
    connectionType: string;
    propertyType: string;
    plotNumber?: string;
    surveyNumber?: string;
    propertyAddress?: string;
    pincode?: string;
  };
  bankDetails?: {
    fullName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName: string;
    bankAddress: string;
  };
  autoDebitWaterBill?: string;
  plumberEstimation?: {
    rows: Array<{
      id: string;
      attribute: string;
      unitOfMeasurement: string;
      amount: string;
    }>;
    totalAmount: number;
    documents: Array<{
      name: string;
      type: string;
    }>;
    comments?: string;
  };
  scheme?: {
    name: string;
    amount: string;
    item1: string;
    item2: string;
  };
  caseworkerDetails?: {
    name: string;
    comment: string;
    forwardedTo: string;
    forwardedAt: string;
  };
  plumberDetails?: {
    plumberName: string;
    plumberType?: string;
    firmName?: string;
    plumberId?: string;
  };
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

export default function RevenueOfficerApplicationView({ applicationId }: RevenueOfficerApplicationViewProps) {
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [revenueOfficerComment, setRevenueOfficerComment] = useState(''); // Comment state for direct input

  useEffect(() => {
    loadApplicationData();
  }, [applicationId]);

  const loadApplicationData = async () => {
    try {
      setLoading(true);
      console.log('[REVENUE OFFICER VIEW] Fetching application:', applicationId);
      
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
        console.error('[REVENUE OFFICER VIEW] API Error:', response.statusText);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[REVENUE OFFICER VIEW] API Response:', data);
      
      if (data.success && data.application) {
        const app = data.application;
        
        console.log('[REVENUE OFFICER VIEW] Raw application data keys:', Object.keys(app));
        console.log('[REVENUE OFFICER VIEW] propertyDetails:', app.propertyDetails);
        console.log('[REVENUE OFFICER VIEW] bankDetails:', app.bankDetails);
        console.log('[REVENUE OFFICER VIEW] plumberConnectionData:', app.plumberConnectionData);
        console.log('[REVENUE OFFICER VIEW] plumberDetails:', app.plumberDetails);
        console.log('[REVENUE OFFICER VIEW] workflow:', app.workflow);
        
        // Safe accessors using explicit && null checks (no optional chaining in client code)
        const appDetails = app && app.applicantDetails ? app.applicantDetails : {};
        const propDetails = app && app.propertyDetails ? app.propertyDetails : {};
        const connDetails = app && app.connectionDetails ? app.connectionDetails : {};
        const plumbConnData = app && app.plumberConnectionData ? app.plumberConnectionData : null;
        const wf = app && app.workflow ? app.workflow : {};
        const wfCaseworker = wf && wf.caseworker ? wf.caseworker : null;
        const plumbDetails = app && app.plumberDetails ? app.plumberDetails : null;
        const bankDets = app && app.bankDetails ? app.bankDetails : null;
        
        // Transform backend data to match component interface
        const transformedApp: ApplicationData = {
          id: app.id || '',
          applicationNo: app.applicationNo || app.id || '',
          status: app.status || '',
          submittedAt: app.submittedAt || '',
          applicantDetails: {
            applicantName: appDetails.applicantName || 'N/A',
            mobile: appDetails.mobile || 'N/A',
            email: appDetails.email || undefined,
            fatherName: appDetails.fatherName || undefined,
            aadharNumber: appDetails.aadharNumber || undefined,
            doorNumber: appDetails.doorNumber || undefined,
            wardNumber: appDetails.wardNumber || undefined,
            street: appDetails.street || undefined,
            address: appDetails.address || undefined,
          },
          propertyDetails: {
            district: propDetails.district || 'N/A',
            ulb: propDetails.ulb || 'N/A',
            ulbType: propDetails.ulbType || 'N/A',
            authorityType: propDetails.authorityType || 'N/A',
            ownershipType: propDetails.ownershipType || 'N/A',
            propertyId: propDetails.propertyId || undefined,
          },
          connectionDetails: {
            connectionType: connDetails.connectionType || 'N/A',
            propertyType: connDetails.propertyType || 'N/A',
            plotNumber: connDetails.plotNumber || undefined,
            surveyNumber: connDetails.surveyNumber || undefined,
            propertyAddress: connDetails.propertyAddress || undefined,
            pincode: connDetails.pincode || undefined,
          },
          bankDetails: bankDets ? {
            fullName: bankDets.fullName || 'N/A',
            accountNumber: bankDets.accountNumber || 'N/A',
            ifscCode: bankDets.ifscCode || 'N/A',
            bankName: bankDets.bankName || 'N/A',
            branchName: bankDets.branchName || 'N/A',
            bankAddress: bankDets.bankAddress || 'N/A',
          } : undefined,
          autoDebitWaterBill: app.autoDebitWaterBill || undefined,
          plumberEstimation: plumbConnData ? {
            rows: (plumbConnData.estimationRows || []).map((row: any) => ({
              id: row.id || String(Math.random()),
              attribute: row.attribute || 'N/A',
              unitOfMeasurement: row.unitOfMeasurement || row.measurement || 'N/A',
              amount: row.amount || row.price || '0',
            })),
            totalAmount: plumbConnData.totalAmount || 0,
            documents: [
              ...(plumbConnData.siteSketchUploaded ? [{ name: 'Site_Sketch.pdf', type: 'PDF Document' }] : []),
              ...(plumbConnData.estimateUploaded ? [{ name: 'Cost_Estimate.pdf', type: 'PDF Document' }] : []),
            ],
            comments: plumbConnData.comments || '',
          } : undefined,
          scheme: app.scheme || undefined,
          caseworkerDetails: wfCaseworker ? {
            name: wfCaseworker.name || 'Caseworker',
            comment: wfCaseworker.comments || wfCaseworker.comment || 'N/A',
            forwardedTo: wfCaseworker.forwardedTo || 'N/A',
            forwardedAt: wfCaseworker.timestamp || wfCaseworker.forwardedAt || '',
          } : undefined,
          plumberDetails: plumbDetails ? {
            plumberName: plumbDetails.plumberName || 'N/A',
            plumberType: plumbDetails.plumberType || undefined,
            firmName: plumbDetails.firmName || undefined,
            plumberId: plumbDetails.plumberId || undefined,
          } : undefined,
        };
        
        setApplication(transformedApp);
        console.log('[REVENUE OFFICER VIEW] Transformed application:', transformedApp);
      } else {
        console.error('[REVENUE OFFICER VIEW] Error:', data.error);
      }
    } catch (error) {
      console.error('[REVENUE OFFICER VIEW] Error loading application:', error);
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
    setProcessing(true);
    try {
      console.log('[REVENUE OFFICER] Forwarding application:', {
        applicationId: application && application.id ? application.id : '',
        comment: revenueOfficerComment,
        forwardTo: 'Field Engineer'
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
            applicationId: application && application.id ? application.id : '',
            comment: revenueOfficerComment,
            forwardTo: 'Field Engineer'
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        console.log('[REVENUE OFFICER] Application forwarded successfully');
        alert(`Application ${application && application.id ? application.id : ''} forwarded to Field Engineer successfully!\n\nComment: ${revenueOfficerComment}`);
        
        // Navigate back to dashboard
        const event = new CustomEvent('navigate', { detail: '/jalanidhi/revenue-officer/tap-connection' });
        window.dispatchEvent(event);
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
    const event = new CustomEvent('navigate', { detail: '/jalanidhi/revenue-officer/tap-connection' });
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
        <p className="text-red-600 font-['Poppins',sans-serif]">Application not found</p>
      </div>
    );
  }

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
        <SectionTitle title="Review Application" className="mb-2" />
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{application.id}</span>
        </p>
        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mt-1">
          Submitted on: {formatDate(application.submittedAt)}
        </p>
      </div>

      {/* Application Summary Card */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <SectionTitle title="Application Summary" className="mb-4" />
        
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
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Ownership Type</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                  {application.propertyDetails.ownershipType}
                </p>
              </div>
              {application.propertyDetails.propertyId && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Property ID</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.propertyDetails.propertyId}
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
                  {application.applicantDetails.applicantName}
                </p>
              </div>
              {application.applicantDetails.fatherName && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Father's Name</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.applicantDetails.fatherName}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Mobile</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.applicantDetails.mobile}
                </p>
              </div>
              {application.applicantDetails.email && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Email</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.applicantDetails.email}
                  </p>
                </div>
              )}
              {application.applicantDetails.aadharNumber && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Aadhar Number</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.applicantDetails.aadharNumber}
                  </p>
                </div>
              )}
              {application.applicantDetails.address && (
                <div className="md:col-span-3">
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Address</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.applicantDetails.address}
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
                  {application.connectionDetails.connectionType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Property Type</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                  {application.connectionDetails.propertyType}
                </p>
              </div>
              {application.connectionDetails.plotNumber && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Plot Number</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.connectionDetails.plotNumber}
                  </p>
                </div>
              )}
              {application.connectionDetails.surveyNumber && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Survey Number</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.connectionDetails.surveyNumber}
                  </p>
                </div>
              )}
              {application.connectionDetails.propertyAddress && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Property Address</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.connectionDetails.propertyAddress}
                  </p>
                </div>
              )}
              {application.connectionDetails.pincode && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Pincode</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.connectionDetails.pincode}
                  </p>
                </div>
              )}
              {application.plumberDetails && application.plumberDetails.plumberName && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Assigned Plumber</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.plumberDetails.plumberName}
                  </p>
                </div>
              )}
              {application.plumberDetails && application.plumberDetails.plumberId && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Plumber ID</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.plumberDetails.plumberId}
                  </p>
                </div>
              )}
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
                    {application.bankDetails.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Bank Name</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.bankDetails.bankName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Branch Name</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.bankDetails.branchName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Branch Address</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.bankDetails.bankAddress}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Account Number</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.bankDetails.accountNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">IFSC Code</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.bankDetails.ifscCode}
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
      {application.plumberEstimation && (
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
          <SectionTitle title="Plumber Estimation & Documents" className="mb-4" />
          
          <div className="space-y-6">
            {/* Estimation Table */}
            <div>
              <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
                Cost Estimation
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
                  {application.plumberEstimation.rows.map((row, index) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-[60px_2fr_1.5fr_1fr] gap-4 px-6 py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="font-['Poppins',sans-serif] text-[14px] text-gray-600 text-center">
                        {index + 1}
                      </div>
                      <div className="font-['Poppins',sans-serif] text-[14px] text-gray-900">
                        {row.attribute}
                      </div>
                      <div className="font-['Poppins',sans-serif] text-[14px] text-gray-700 text-center">
                        {row.unitOfMeasurement}
                      </div>
                      <div className="font-['Poppins',sans-serif] text-[14px] text-gray-900 text-right">
                        ₹{parseFloat(row.amount).toFixed(2)}
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
                      ₹{application.plumberEstimation.totalAmount.toFixed(2)}
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
                {application.plumberEstimation.documents.map((doc, index) => (
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
            {application.plumberEstimation.comments && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <p className="text-sm font-semibold text-gray-700 font-['Poppins',sans-serif] mb-2">
                  Plumber's Comments:
                </p>
                <p className="font-['Poppins',sans-serif] text-[14px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {application.plumberEstimation.comments}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comments & History */}
      {application.caseworkerDetails && (
        <div className="mb-6">
          <RemarksTimeline
            remarks={[
              { role: 'Caseworker', comment: application.caseworkerDetails.comment || 'N/A', timestamp: application.caseworkerDetails.forwardedAt || '' },
            ]}
            title="Comments & History"
          />
        </div>
      )}

      {/* Scheme Details Card */}
      {application.scheme && (
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
          <SectionTitle title="Selected Scheme Details" className="mb-4" />

          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Scheme Name</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.scheme.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Amount</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.scheme.amount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Item 1</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.scheme.item1}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Item 2</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.scheme.item2}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Officer Action Card - Always Visible */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <SectionTitle title="Revenue Officer Review" className="mb-4" />

        <div>
          {/* Revenue Officer Comments Box */}
          <div className="flex flex-col gap-[9px]">
            <p className="font-['Poppins',sans-serif] font-medium leading-[9.801px] text-[#170f49] text-[14px]">
              <span>Comments </span>
              <span className="text-[#ff0c10]">*</span>
            </p>
            <div className="relative rounded-[12px] border border-[#d3d8ff] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]">
              <textarea
                value={revenueOfficerComment}
                onChange={(e) => setRevenueOfficerComment(e.target.value)}
                className="w-full h-[80px] px-[12px] py-[11px] bg-white font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none rounded-[12px] resize-none"
                placeholder="Enter your comments for the Field Engineer..."
              />
            </div>
          </div>

          {/* Forward Button */}
          <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleForward}
              disabled={processing || !revenueOfficerComment.trim()}
              className="px-8 py-3 bg-[#0078a0] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#006b8f] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {processing ? 'Processing...' : 'Forward to Field Engineer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
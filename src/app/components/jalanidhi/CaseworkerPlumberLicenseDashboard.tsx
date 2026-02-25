import { useState, useEffect } from 'react';
import { ChevronLeft, Search, Filter, Eye, Clock, CheckCircle, User, MapPin, FileText, Wrench, Building2, UserCheck, RotateCcw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface PlumberLicenseApp {
  id: string;
  registrationType: string;
  status: string;
  submittedAt: string;
  district: string;
  ulb: string;
  financialYear: string;
  registrationFees: string;
  applicantName: string;
  mobileNumber: string;
  // Individual fields
  plumberName?: string;
  addressDistrict?: string;
  city?: string;
  street?: string;
  wardNo?: string;
  pincode?: string;
  qualification?: string;
  yearOfExperience?: string;
  // Contractor fields
  firmName?: string;
  typeOfFirm?: string;
  officeAddress?: string;
  contDistrict?: string;
  taluk?: string;
  emailId?: string;
  panNumber?: string;
  gstNumber?: string;
  authFullName?: string;
  authDesignation?: string;
  authMobile?: string;
  authEmail?: string;
  // Workflow
  documents?: any;
  workflow?: any;
  caseworkerComments?: string;
}

// Read-only review view for a plumber license application
function PlumberLicenseReviewView({ application, onBack }: { application: PlumberLicenseApp; onBack: () => void }) {
  const [processing, setProcessing] = useState(false);
  const [forwarded, setForwarded] = useState(false);
  const [caseworkerComment, setCaseworkerComment] = useState('');

  useEffect(() => {
    const wf = application && application.workflow;
    const cw = wf && wf.caseworker;
    if (cw && cw.status === 'reviewed') {
      setForwarded(true);
      setCaseworkerComment(cw.comments || '');
    }
  }, [application]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleForward = async (comment: string) => {
    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/caseworker/forward`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId: application.id, comment, forwardTo: 'Field Engineer' }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        alert(`Application ${application.id} forwarded to Field Engineer successfully!\n\nComment: ${comment}`);
        onBack();
      } else {
        const errMsg = data && data.error ? data.error : 'Unknown error';
        alert('Error forwarding: ' + errMsg);
      }
    } catch (error) {
      console.error('Error forwarding plumber license application:', error);
      alert('Error forwarding: ' + error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSendBack = async (comment: string) => {
    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/caseworker/sendback`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId: application.id, comment }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        alert(`Application ${application.id} sent back to Citizen for corrections.\n\nComment: ${comment}`);
        onBack();
      } else {
        const errMsg = data && data.error ? data.error : 'Unknown error';
        alert('Error sending back: ' + errMsg);
      }
    } catch (error) {
      console.error('Error sending back plumber license application:', error);
      alert('Error sending back: ' + error);
    } finally {
      setProcessing(false);
    }
  };

  const isIndividual = application.registrationType === 'individual';
  const isContractor = application.registrationType === 'contractor';

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      <button
        onClick={onBack}
        disabled={processing}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
          Review Plumber License Application
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{application.id}</span>
        </p>
        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mt-1">
          Submitted on: {formatDate(application.submittedAt)} | Type: <span className="capitalize font-medium">{application.registrationType === 'individual' ? 'Individual Plumber' : 'Contractor'}</span>
        </p>
      </div>

      {/* Application Summary Card */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
            Application Summary
          </h2>
          {/* ULB / Basic Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                ULB Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">District</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                  {application.district || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">ULB</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                  {application.ulb || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Financial Year</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.financialYear || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Registration Fees</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  Rs. {application.registrationFees || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Individual Plumber Details */}
          {isIndividual && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-[#1f3a5f]" />
                <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  Personal Details
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Plumber Name</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.plumberName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">District</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                    {application.addressDistrict || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">City</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.city || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Street</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.street || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Ward No</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.wardNo || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Pincode</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.pincode || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Mobile Number</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.mobileNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Qualification</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                    {application.qualification || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Year of Experience</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.yearOfExperience || 'N/A'} {application.yearOfExperience && application.yearOfExperience !== 'N/A' ? 'Years' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contractor Details */}
          {isContractor && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-[#1f3a5f]" />
                  <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                    Contractors Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Firm Name</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.firmName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Type of Firm</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                      {(application.typeOfFirm || 'N/A').replace(/-/g, ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Office Address</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.officeAddress || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">District</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                      {(application.contDistrict || 'N/A').replace(/-/g, ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Taluk</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                      {application.taluk || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Pincode</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.pincode || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Mobile Number</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.mobileNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Email ID</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.emailId || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">PAN Number</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.panNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">GST Number</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.gstNumber || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Authorized Person Details */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="w-5 h-5 text-[#1f3a5f]" />
                  <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                    Authorized Person Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Full Name</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.authFullName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Designation</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.authDesignation || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Mobile Number</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.authMobile || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Email ID</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.authEmail || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Documents */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Uploaded Documents
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              {application.documents && application.documents.aadhar && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Aadhar Document</p>
                  <p className="text-[15px] font-medium text-green-700 font-['Poppins',sans-serif] flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> {application.documents.aadhar.name || 'Uploaded'}
                  </p>
                </div>
              )}
              {application.documents && application.documents.experienceLetter && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Experience Letter</p>
                  <p className="text-[15px] font-medium text-green-700 font-['Poppins',sans-serif] flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> {application.documents.experienceLetter.name || 'Uploaded'}
                  </p>
                </div>
              )}
              {application.documents && application.documents.supportingDoc && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Supporting Document</p>
                  <p className="text-[15px] font-medium text-green-700 font-['Poppins',sans-serif] flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> {application.documents.supportingDoc.name || 'Uploaded'}
                  </p>
                </div>
              )}
              {(!application.documents || Object.keys(application.documents).length === 0) && (
                <p className="text-sm text-gray-500 font-['Poppins',sans-serif]">No documents uploaded</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Caseworker Action Card */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
            Caseworker Action
          </h2>
          {forwarded ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-800 font-['Poppins',sans-serif] text-sm">
                  This application has been reviewed and forwarded to the Field Engineer.
                </p>
              </div>
              {caseworkerComment && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">Comments:</p>
                  <p className="text-sm text-gray-700 font-['Poppins',sans-serif]">{caseworkerComment}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
                  Comments <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={caseworkerComment}
                  onChange={(e) => setCaseworkerComment(e.target.value)}
                  placeholder="Enter your review comments..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all resize-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    if (!caseworkerComment.trim()) {
                      alert('Please enter a comment before sending back');
                      return;
                    }
                    if (confirm('Are you sure you want to send this application back to the Citizen for corrections?')) {
                      handleSendBack(caseworkerComment);
                    }
                  }}
                  disabled={processing}
                  className="px-6 py-2.5 bg-white border-2 border-red-400 text-red-600 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Send Back to Citizen
                </button>
                <button
                  onClick={() => {
                    if (!caseworkerComment.trim()) {
                      alert('Please enter a comment before forwarding');
                      return;
                    }
                    handleForward(caseworkerComment);
                  }}
                  disabled={processing}
                  className="px-6 py-2.5 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-[#152d4a] transition-colors disabled:opacity-50"
                >
                  Forward to Field Engineer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// Main Dashboard component
export default function CaseworkerPlumberLicenseDashboard() {
  const [applications, setApplications] = useState<PlumberLicenseApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<PlumberLicenseApp | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/caseworker/applications`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      if (data && data.success) {
        // Deduplicate by ID to prevent duplicate key warnings
        const rawApps = data.applications || [];
        const seen = new Set();
        const uniqueApps = rawApps.filter((app: PlumberLicenseApp) => {
          if (seen.has(app.id)) return false;
          seen.add(app.id);
          return true;
        });
        setApplications(uniqueApps);
      } else {
        console.error('[PLUMBER LICENSE CASEWORKER] API Error:', data && data.error ? data.error : 'Unknown');
        setApplications([]);
      }
    } catch (error) {
      console.error('[PLUMBER LICENSE CASEWORKER] Error fetching:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      'submitted': { label: 'Pending Review', color: 'bg-blue-100 text-blue-800 border-blue-300' },
      'sentToFieldEngineer': { label: 'Sent to Field Engineer', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
      'sentToCommissioner': { label: 'Sent to Commissioner', color: 'bg-purple-100 text-purple-800 border-purple-300' },
      'pendingPayment': { label: 'Pending Payment', color: 'bg-amber-100 text-amber-800 border-amber-300' },
      'paymentCompleted': { label: 'Payment Completed', color: 'bg-teal-100 text-teal-800 border-teal-300' },
      'approved': { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-300' },
      'rejected': { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-300' },
      'sentBackToCitizen': { label: 'Sent Back to Citizen', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    };
    const config = configs[status] || configs['submitted'];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium border ${config.color}`}>
        <Clock className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.applicantName && app.applicantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.mobileNumber && app.mobileNumber.includes(searchQuery));
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (selectedApp) {
    return (
      <PlumberLicenseReviewView
        application={selectedApp}
        onBack={() => { setSelectedApp(null); fetchApplications(); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
          Plumber License - New Applications
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Review and process plumber license registration applications
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Application ID, Name, or Mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all"
            />
          </div>
          <div className="md:w-64 relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="submitted">Pending Review</option>
              <option value="sentToFieldEngineer">Sent to Field Engineer</option>
              <option value="sentToCommissioner">Sent to Commissioner</option>
              <option value="pendingPayment">Pending Payment</option>
              <option value="sentBackToCitizen">Sent Back to Citizen</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Title Bar */}
        <div className="bg-[#1f3a5f] px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-white leading-7">
            Plumber License Applications
          </h2>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f]"></div>
            <p className="mt-4 text-gray-600 font-['Poppins',sans-serif]">Loading applications...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 font-['Poppins',sans-serif]">
              {searchQuery || statusFilter !== 'all' ? 'No applications match your filters.' : 'No plumber license applications submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '1200px' }}>
              <thead className="bg-[#f8f9fa] border-b border-[#e5e7eb]">
                <tr>
                  <th className="px-6 py-5 text-center font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[50px]">#</th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">Application No</th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">Applicant Name</th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[120px]">Type</th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[150px]">ULB</th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[150px]">Submitted Date</th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[160px]">Status</th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[120px]">Queue</th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[120px]">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredApps.map((app, index) => (
                  <tr key={app.id} className="border-b border-[#e5e7eb] hover:bg-[#f8f9fb] transition-colors">
                    <td className="px-6 py-4 text-center font-['Poppins',sans-serif] text-[14px] font-medium text-[#414141]">{index + 1}</td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] font-medium text-[#06c]">{app.id}</td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#170f49] font-medium">
                      {app.applicantName || app.plumberName || app.firmName || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-['Poppins',sans-serif] border ${
                        app.registrationType === 'contractor'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : 'bg-teal-100 text-teal-800 border-teal-200'
                      }`}>
                        {app.registrationType === 'contractor' ? 'Contractor' : 'Individual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-[14px] text-gray-700 font-['Poppins',sans-serif] capitalize">{(app.ulb || 'N/A').replace(/-/g, ' ')}</td>
                    <td className="px-6 py-4 text-center text-[14px] text-gray-700 font-['Poppins',sans-serif]">{formatDate(app.submittedAt)}</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(app.status)}</td>
                    <td className="px-6 py-4 text-center">
                      {(() => {
                        const queueMap: Record<string, { label: string; color: string }> = {
                          'submitted': { label: 'Caseworker', color: 'bg-blue-100 text-blue-800 border border-blue-200' },
                          'sentToFieldEngineer': { label: 'Field Engineer', color: 'bg-indigo-100 text-indigo-800 border border-indigo-200' },
                          'sentToCommissioner': { label: 'Commissioner', color: 'bg-purple-100 text-purple-800 border border-purple-200' },
                          'pendingPayment': { label: 'Citizen (Payment)', color: 'bg-amber-100 text-amber-800 border border-amber-200' },
                          'paymentCompleted': { label: 'Commissioner', color: 'bg-teal-100 text-teal-800 border border-teal-200' },
                          'approved': { label: 'Completed', color: 'bg-green-100 text-green-800 border border-green-200' },
                          'rejected': { label: 'Rejected', color: 'bg-red-100 text-red-800 border border-red-200' },
                          'sentBackToCitizen': { label: 'Citizen (Corrections)', color: 'bg-orange-100 text-orange-800 border border-orange-200' },
                        };
                        const q = queueMap[app.status] || queueMap['submitted'];
                        return (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium ${q.color}`}>
                            {q.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-medium text-sm hover:bg-[#2d4a6f] transition-colors mx-auto"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Search, Filter, Eye, Clock, CheckCircle, XCircle, ArrowRight, Wrench, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import CaseworkerApplicationView from './CaseworkerApplicationView';
import Group1000001441 from '../../../imports/Group1000001441';
import SectionTitle from './SectionTitle';

interface Application {
  id: string;
  type?: string; // Application type: "newConnection", "reconnection", "disconnection"
  status: string;
  submittedAt: string;
  createdAt?: string; // For reconnection applications
  propertyDetails?: {
    district: string;
    ulb: string;
    ownershipType: string;
  };
  applicantDetails?: {
    applicantName: string;
    mobile: string;
    email: string;
    address: string;
  };
  connectionDetails?: {
    connectionType: string;
    propertyType: string;
  };
  plumberDetails?: {
    plumberName: string;
  };
  plumberConnectionData?: {
    estimationRows: {
      id: string;
      attribute: string;
      unitOfMeasurement: string;
      amount: string;
    }[];
    totalAmount: number;
    siteSketchUploaded: boolean;
    estimateUploaded: boolean;
    comments: string;
  };
  bankDetails?: {
    fullName: string;
    bankName: string;
    branchName: string;
    bankAddress: string;
    accountNumber: string;
    ifscCode: string;
  };
  autoDebitWaterBill?: 'yes' | 'no';
  rrNumber?: string; // For reconnection applications
  rrData?: any; // For reconnection applications
}

interface CaseworkerDashboardProps {
  applicationType?: 'newConnection' | 'reconnection' | 'disconnection' | 'changeConnection';
}

export default function CaseworkerDashboard({ applicationType = 'newConnection' }: CaseworkerDashboardProps) {
  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('caseworker_applications');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [loading, setLoading] = useState(() => {
    const saved = localStorage.getItem('caseworker_applications');
    return !saved; // Only show loading if no cached data
  });
  
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(() => {
    const saved = localStorage.getItem('caseworker_selectedApplication');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [searchQuery, setSearchQuery] = useState(() => {
    const saved = localStorage.getItem('caseworker_searchQuery');
    return saved || '';
  });
  
  const [statusFilter, setStatusFilter] = useState(() => {
    const saved = localStorage.getItem('caseworker_statusFilter');
    return saved || 'all';
  });

  // Track previous applicationType to detect tab switches
  const prevApplicationType = useRef(applicationType);

  // Persist applications to localStorage
  useEffect(() => {
    if (applications.length > 0) {
      localStorage.setItem('caseworker_applications', JSON.stringify(applications));
    }
  }, [applications]);

  // Persist state to localStorage
  useEffect(() => {
    if (selectedApplication) {
      localStorage.setItem('caseworker_selectedApplication', JSON.stringify(selectedApplication));
    } else {
      localStorage.removeItem('caseworker_selectedApplication');
    }
  }, [selectedApplication]);

  useEffect(() => {
    localStorage.setItem('caseworker_searchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('caseworker_statusFilter', statusFilter);
  }, [statusFilter]);

  // Fetch on mount
  useEffect(() => {
    fetchApplications();
  }, []);

  // Re-fetch when applicationType changes (tab switch) - React may reuse component instance
  useEffect(() => {
    if (prevApplicationType.current !== applicationType) {
      prevApplicationType.current = applicationType;
      // Clear selected application when switching tabs
      setSelectedApplication(null);
      fetchApplications();
    }
  }, [applicationType]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      console.log('[CASEWORKER DASHBOARD] Fetching applications from API...');
      
      const maxRetries = 3;
      let lastError: any = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[CASEWORKER DASHBOARD] Attempt ${attempt}/${maxRetries}...`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);
          
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-698be164/caseworker/applications`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
            }
          );
          
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Failed to fetch applications: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          console.log('[CASEWORKER DASHBOARD] API Response:', data);
          
          if (data.success) {
            setApplications(data.applications || []);
            console.log('[CASEWORKER DASHBOARD] Loaded applications:', (data.applications && data.applications.length) || 0);
          } else {
            console.error('[CASEWORKER DASHBOARD] API Error:', data.error);
            setApplications([]);
          }
          return; // Success — exit retry loop
        } catch (err) {
          lastError = err;
          console.warn(`[CASEWORKER DASHBOARD] Attempt ${attempt} failed:`, err);
          if (attempt < maxRetries) {
            const delay = attempt * 2000;
            console.log(`[CASEWORKER DASHBOARD] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // All retries failed
      console.error('[CASEWORKER DASHBOARD] All retry attempts failed:', lastError);
      setApplications([]);
    } catch (error) {
      console.error('[CASEWORKER DASHBOARD] Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      'submitted': { 
        label: 'Received from Citizen', 
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: Clock 
      },
      'sentToCaseworker': { 
        label: 'Received from Citizen', 
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: Clock 
      },
      'pending_caseworker': { 
        label: 'Received from Citizen', 
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: Clock 
      },
      'underReview': { 
        label: 'Under Review', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: Eye 
      },
      'sentToFieldEngineer': {
        label: 'Sent to Field Engineer',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        icon: ArrowRight
      },
      'fieldVisitScheduled': {
        label: 'Field Visit Scheduled',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        icon: ArrowRight
      },
      'sentToRevenueOfficer': {
        label: 'Sent to Revenue Officer',
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        icon: ArrowRight
      },
      'sentToCommissioner': {
        label: 'Sent to Commissioner',
        color: 'bg-pink-100 text-pink-800 border-pink-300',
        icon: ArrowRight
      },
      'sentToCitizenForPayment': {
        label: 'Awaiting Citizen Payment',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        icon: Clock
      },
      'pendingPayment': {
        label: 'Pending Payment',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        icon: Clock
      },
      'paymentCompleted': {
        label: 'Payment Completed',
        color: 'bg-teal-100 text-teal-800 border-teal-300',
        icon: CheckCircle
      },
      'sentToPlumberForDisconnection': {
        label: 'Sent to Plumber (Disconnection)',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: Wrench
      },
      'sentToPlumberForInstallation': {
        label: 'Sent to Plumber (Installation)',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: Wrench
      },
      'sentToPlumberForReconnection': {
        label: 'Sent to Plumber (Reconnection)',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: Wrench
      },
      'sentToFieldEngineerForReconnection': {
        label: 'Sent to Field Engineer (Reconnection)',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        icon: ArrowRight
      },
      'plumber_accepted_disconnection': {
        label: 'Plumber Working (Disconnection)',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: Wrench
      },
      'plumber_accepted_installation': {
        label: 'Plumber Working (Installation)',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: Wrench
      },
      'disconnection_work_submitted': {
        label: 'Disconnection Work Done',
        color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
        icon: CheckCircle
      },
      'disconnection_completed': {
        label: 'Disconnection Completed',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle
      },
      'reconnection_work_submitted': {
        label: 'Reconnection Work Done',
        color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
        icon: CheckCircle
      },
      'installation_work_submitted': {
        label: 'Installation Work Done',
        color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
        icon: CheckCircle
      },
      'installation_completed': {
        label: 'Installation Completed',
        color: 'bg-teal-100 text-teal-800 border-teal-300',
        icon: CheckCircle
      },
      'installation_approved': {
        label: 'Installation Approved',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle
      },
      'approved': { 
        label: 'Approved', 
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle 
      },
      'rejected': { 
        label: 'Rejected', 
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: XCircle 
      },
    };

    const config = statusConfig[status] || { 
      label: status.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(), 
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: Clock 
    };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  // Determine queue/current stage label based on status
  const getQueueLabel = (application: Application) => {
    const status = application.status;
    if (status === 'submitted' || status === 'sentToCaseworker' || status === 'pending_caseworker' || status === 'underReview') {
      return { label: 'Caseworker', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
    if (status === 'sentToFieldEngineer' || status === 'fieldVisitScheduled') {
      return { label: 'Field Engineer', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    }
    if (status === 'sentToRevenueOfficer') {
      return { label: 'Revenue Officer', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    }
    if (status === 'sentToCommissioner') {
      return { label: 'Commissioner', color: 'bg-pink-100 text-pink-800 border-pink-200' };
    }
    if (status === 'sentToCitizenForPayment' || status === 'pendingPayment' || status === 'paymentCompleted') {
      return { label: 'Citizen Payment', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    if (status === 'sentToPlumberForDisconnection' || status === 'plumber_accepted_disconnection' || status === 'disconnection_work_submitted') {
      return { label: 'Plumber (Discon)', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    }
    if (status === 'sentToPlumberForInstallation' || status === 'plumber_accepted_installation' || status === 'installation_work_submitted') {
      return { label: 'Plumber (Install)', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    }
    if (status === 'sentToPlumberForReconnection' || status === 'reconnection_work_submitted') {
      return { label: 'Plumber (Recon)', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    }
    if (status === 'sentToFieldEngineerForReconnection') {
      return { label: 'Field Engineer', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    }
    if (status === 'disconnection_completed' || status === 'installation_completed' || status === 'installation_approved' || status === 'approved') {
      return { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' };
    }
    if (status === 'rejected') {
      return { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' };
    }
    // Fallback based on application type
    if (application.type === 'disconnection') {
      return { label: 'Field Engineer', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    }
    return { label: 'Revenue Officer', color: 'bg-purple-100 text-purple-800 border-purple-200' };
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    // Filter by application type
    const typeFilter = applicationType === 'newConnection'
      ? (!app.type || app.type === 'newConnection') // Show apps without type (legacy) or with newConnection type
      : app.type === applicationType;
    
    const matchesSearch = 
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.applicantDetails && app.applicantDetails.applicantName ? app.applicantDetails.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
      (app.applicantDetails && app.applicantDetails.mobile ? app.applicantDetails.mobile.includes(searchQuery) : false) ||
      (app.rrData && app.rrData.ownerName ? app.rrData.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
      (app.rrData && app.rrData.mobileNo ? app.rrData.mobileNo.includes(searchQuery) : false);
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return typeFilter && matchesSearch && matchesStatus;
  });

  // Sort: latest applications first
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const dateA = new Date(a.submittedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.submittedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  // If viewing a specific application
  if (selectedApplication) {
    return (
      <CaseworkerApplicationView
        application={selectedApplication}
        onBack={() => {
          setSelectedApplication(null);
          // Refetch applications to get updated status after any action (forward, approve, reject)
          fetchApplications();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <SectionTitle title={applicationType === 'reconnection' ? 'Tap Reconnection Requests' : 
             applicationType === 'disconnection' ? 'Tap Disconnection Requests' : 
             applicationType === 'changeConnection' ? 'Tap Change Connection Requests' : 
             'New Connection Requests'} className="mb-2" />
          <p className="text-gray-600 font-['Poppins',sans-serif]">
            {applicationType === 'reconnection' ? 'Review and process tap reconnection applications' : 
             applicationType === 'disconnection' ? 'Review and process tap disconnection applications' : 
             applicationType === 'changeConnection' ? 'Review and process tap change connection applications' : 
             'Review and process new tap connection applications'}
          </p>
        </div>
        <button
          onClick={() => fetchApplications()}
          disabled={loading}
          className="mt-1 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 font-['Poppins',sans-serif] hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Application ID, Name, or Mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="sentToCaseworker">Received (Reconnection)</option>
                <option value="pending_caseworker">Pending Caseworker</option>
                <option value="underReview">Under Review</option>
                <option value="sentToFieldEngineer">Sent to Field Engineer</option>
                <option value="fieldVisitScheduled">Field Visit Scheduled</option>
                <option value="sentToRevenueOfficer">Sent to Revenue Officer</option>
                <option value="sentToCommissioner">Sent to Commissioner</option>
                <option value="sentToCitizenForPayment">Awaiting Citizen Payment</option>
                <option value="paymentCompleted">Payment Completed</option>
                <option value="sentToPlumberForDisconnection">Sent to Plumber (Disconnection)</option>
                <option value="sentToPlumberForInstallation">Sent to Plumber (Installation)</option>
                <option value="disconnection_work_submitted">Disconnection Work Done</option>
                <option value="disconnection_completed">Disconnection Completed</option>
                <option value="installation_work_submitted">Installation Work Done</option>
                <option value="installation_completed">Installation Completed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Title Bar */}
        <div className="bg-[#1f3a5f] px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-white leading-7">
            {applicationType === 'reconnection' ? 'Reconnection Requests' :
             applicationType === 'disconnection' ? 'Disconnection Requests' :
             'New Connection Requests'}
          </h2>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f]"></div>
            <p className="mt-4 text-gray-600 font-['Poppins',sans-serif]">Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 font-['Poppins',sans-serif]">
              {searchQuery || statusFilter !== 'all' 
                ? 'No applications match your filters.' 
                : 'No applications submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '1200px' }}>
              <thead className="bg-[#f8f9fa] border-b border-[#e5e7eb]">
                <tr>
                  <th className="px-6 py-5 text-center font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[50px]">
                    #
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">
                    Application No
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[150px]">
                    Plumber Name
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[130px]">
                    Applicant As
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">
                    Applicant Name
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[150px]">
                    Connection Type
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[160px]">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[120px]">
                    Queue
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[120px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {sortedApplications.map((application, index) => {
                  const queueInfo = getQueueLabel(application);
                  return (
                    <tr 
                      key={application.id}
                      className="border-b border-[#e5e7eb] hover:bg-[#f8f9fb] transition-colors"
                    >
                      <td className="px-6 py-4 text-center font-['Poppins',sans-serif] text-[14px] font-medium text-[#414141]">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] font-medium text-[#06c]">
                        {application.id}
                      </td>
                      <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                        {(application.plumberDetails && application.plumberDetails.plumberName) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141] capitalize">
                        {(application.propertyDetails && application.propertyDetails.ownershipType) || 'Owner'}
                      </td>
                      <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#170f49] font-medium">
                        {(application.applicantDetails && application.applicantDetails.applicantName) || (application.rrData && application.rrData.ownerName) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141] capitalize">
                        {(application.connectionDetails && application.connectionDetails.connectionType) || (application.rrData && application.rrData.connectionType) || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-['Poppins',sans-serif] font-medium border ${queueInfo.color}`}>
                          {queueInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1f3a5f] text-white rounded-[8px] font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-[#2d4a6f] transition-colors shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
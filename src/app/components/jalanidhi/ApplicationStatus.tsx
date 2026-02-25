import { useState, useEffect } from 'react';
import SectionTitle from './SectionTitle';
import svgPaths from '../../../imports/svg-o4g60fk9nm';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import ApplicationSummaryView from './ApplicationSummaryView';
import CitizenReviewView from './CitizenReviewView';
import CitizenPaymentView from './CitizenPaymentView';
import CitizenReconnectionPaymentView from './CitizenReconnectionPaymentView';
import CertificateView from './CertificateView';
import CitizenLegacyDataStatusView from './CitizenLegacyDataStatusView';

interface EstimationRow {
  id: string;
  attribute: string;
  unitOfMeasurement: string;
  amount: string;
}

interface PlumberConnectionData {
  estimationRows: EstimationRow[];
  totalAmount: number;
  siteSketchUploaded: boolean;
  estimateUploaded: boolean;
  comments?: string;
}

interface Application {
  id: string;
  type?: string; // Application type: "newConnection", "reconnection", "disconnection", "changeConnection"
  citizenId: string;
  
  // For reconnection applications
  rrNumber?: string;
  rrData?: any;
  charges?: any;
  // Step 2 reconnection data
  hasUGDConnection?: string;
  disconnectionDetails?: any;
  arrearDetails?: any;
  reconnectionPaymentDetails?: any;
  // Step 3 reconnection data
  wantToChangeConnectionType?: string;
  newConnectionType?: string;
  reconnectionReason?: string;
  applicationFees?: number;
  existingConnection?: string;
  securityDeposit?: number;
  wantDigiLocker?: string;
  
  propertyDetails?: {
    district: string;
    ulb: string;
    ulbType: string;
    authorityType: string;
    ownershipType: string;
  };
  applicantDetails?: {
    applicantName: string;
    mobile: string;
    email?: string;
    fatherName?: string;
    aadharNumber?: string;
    doorNumber?: string;
    wardNumber?: string;
    street?: string;
    address?: string;
    state?: string;
    district?: string;
    city?: string;
    pincode?: string;
  };
  communicationDetails?: {
    houseDoorNo?: string;
    wardNo?: string;
    street?: string;
    address?: string;
    state?: string;
    district?: string;
    city?: string;
    pincode?: string;
  };
  connectionDetails?: {
    connectionType: string;
    propertyType: string;
    propertyTypeCategory?: string;
    flatsOrHouses?: string;
  };
  plumberDetails?: {
    plumberName: string;
    plumberType?: string;
    firmName?: string;
  };
  plumberConnectionData?: PlumberConnectionData;
  status: string;
  submittedAt?: string;
  createdAt?: string; // For reconnection applications
  currentStage: string;
  applicationNo?: string;
  approvedEstimation?: {
    totalAmount: number;
    rows: any[];
  };
  paymentDetails?: {
    status: string;
    paidAt: string;
    transactionId: string;
  };
}

// Search Icon
function SearchIcon() {
  return (
    <div className="relative shrink-0 size-[16px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path clipRule="evenodd" d={svgPaths.p17546400} fill="#28334B" fillRule="evenodd" id="icon" />
        </g>
      </svg>
    </div>
  );
}

export default function ApplicationStatus() {
  // Initialize state from localStorage to persist across page refreshes
  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('appStatus_applications');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [loading, setLoading] = useState(() => {
    // Only show loading if we don't have cached applications
    const saved = localStorage.getItem('appStatus_applications');
    return !saved;
  });
  
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState(() => {
    const saved = localStorage.getItem('appStatus_searchTerm');
    return saved || '';
  });
  
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(() => {
    const saved = localStorage.getItem('appStatus_selectedApplication');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [showSummaryView, setShowSummaryView] = useState(() => {
    const saved = localStorage.getItem('appStatus_showSummaryView');
    return saved === 'true';
  });
  
  const [showCitizenReviewView, setShowCitizenReviewView] = useState(() => {
    const saved = localStorage.getItem('appStatus_showCitizenReviewView');
    return saved === 'true';
  });
  
  const [showCitizenPaymentView, setShowCitizenPaymentView] = useState(() => {
    const saved = localStorage.getItem('appStatus_showCitizenPaymentView');
    return saved === 'true';
  });
  
  const [showCitizenReconnectionPaymentView, setShowCitizenReconnectionPaymentView] = useState(() => {
    const saved = localStorage.getItem('appStatus_showCitizenReconnectionPaymentView');
    return saved === 'true';
  });
  
  const [showCertificateView, setShowCertificateView] = useState(() => {
    const saved = localStorage.getItem('appStatus_showCertificateView');
    return saved === 'true';
  });
  
  const [showLegacyDataView, setShowLegacyDataView] = useState(() => {
    const saved = localStorage.getItem('appStatus_showLegacyDataView');
    return saved === 'true';
  });

  const [refreshing, setRefreshing] = useState(false);
  
  // Active tab state - persist to localStorage
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('appStatus_activeTab');
    return saved || 'newConnection';
  });

  // Persist applications to localStorage
  useEffect(() => {
    if (applications.length > 0) {
      localStorage.setItem('appStatus_applications', JSON.stringify(applications));
    }
  }, [applications]);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('appStatus_searchTerm', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedApplication) {
      localStorage.setItem('appStatus_selectedApplication', JSON.stringify(selectedApplication));
    } else {
      localStorage.removeItem('appStatus_selectedApplication');
    }
  }, [selectedApplication]);

  useEffect(() => {
    localStorage.setItem('appStatus_showSummaryView', showSummaryView.toString());
  }, [showSummaryView]);

  useEffect(() => {
    localStorage.setItem('appStatus_showCitizenReviewView', showCitizenReviewView.toString());
  }, [showCitizenReviewView]);

  useEffect(() => {
    localStorage.setItem('appStatus_showCitizenPaymentView', showCitizenPaymentView.toString());
  }, [showCitizenPaymentView]);

  useEffect(() => {
    localStorage.setItem('appStatus_showCitizenReconnectionPaymentView', showCitizenReconnectionPaymentView.toString());
  }, [showCitizenReconnectionPaymentView]);

  useEffect(() => {
    localStorage.setItem('appStatus_showCertificateView', showCertificateView.toString());
  }, [showCertificateView]);

  useEffect(() => {
    localStorage.setItem('appStatus_showLegacyDataView', showLegacyDataView.toString());
  }, [showLegacyDataView]);

  // Persist active tab to localStorage
  useEffect(() => {
    console.log(`[APP STATUS] Tab changed to: ${activeTab}`);
    console.log(`[APP STATUS] Total applications:`, applications.length);
    console.log(`[APP STATUS] Applications by type:`, {
      newConnection: applications.filter(a => !a.type || a.type === 'newConnection').length,
      reconnection: applications.filter(a => a.type === 'reconnection').length,
      disconnection: applications.filter(a => a.type === 'disconnection').length,
      changeConnection: applications.filter(a => a.type === 'changeConnection').length,
    });
    localStorage.setItem('appStatus_activeTab', activeTab);
  }, [activeTab, applications]);

  // Get logged-in user data
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const citizenId = `CITIZEN-${userData.phone}`;

  useEffect(() => {
    console.log('[APP STATUS] userData:', userData);
    console.log('[APP STATUS] citizenId being used for fetch:', citizenId);
    console.log('[APP STATUS] userData.phone type:', typeof userData.phone, 'value:', userData.phone);
    // Clear stale cache to force fresh server fetch
    localStorage.removeItem('appStatus_applications');
    // Always fetch fresh data on mount
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    // Always show loading state for fresh fetches
    setLoading(true);
    setError('');
    
    try {
      // Extract phone number for matching
      const phone = userData.phone ? String(userData.phone) : '';
      console.log('[APP STATUS] Citizen phone for matching:', phone);
      console.log('[APP STATUS] CitizenId for matching:', citizenId);
      
      // PRIMARY: Use raw dump endpoint - fetches ALL apps, filter client-side
      // This bypasses any server-side citizenId matching issues
      const rawUrl = `https://${projectId}.supabase.co/functions/v1/make-server-698be164/citizen/all-apps-raw`;
      console.log('[APP STATUS] Fetching ALL raw apps from:', rawUrl);
      
      const rawResponse = await fetch(rawUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      const rawData = await rawResponse.json();
      console.log('[APP STATUS] Raw API response - total apps in DB:', rawData.total);
      
      if (rawData.success && rawData.applications && rawData.applications.length > 0) {
        // Log ALL apps in DB for debugging
        console.log('[APP STATUS] ========== ALL APPS IN DATABASE ==========');
        rawData.applications.forEach((app: any) => {
          const appCid = app && app.citizenId ? String(app.citizenId) : 'NONE';
          const appMobile = (app && app.applicantDetails && app.applicantDetails.mobile) || 
                           (app && app.rrData && app.rrData.mobileNo) || 'NONE';
          console.log(`[APP STATUS] DB App: id=${app && app.id ? app.id : 'NO_ID'} | type=${app && app.type ? app.type : 'NO_TYPE'} | citizenId=${appCid} | mobile=${appMobile} | status=${app && app.status ? app.status : 'NO_STATUS'}`);
        });
        console.log('[APP STATUS] ================================================');
        
        // CLIENT-SIDE FILTERING: Match by citizenId OR by phone number
        const myApps = rawData.applications.filter((app: any) => {
          if (!app) return false;
          
          const appCid = app.citizenId ? String(app.citizenId).trim() : '';
          const myCid = String(citizenId).trim();
          
          // Exact citizenId match
          if (appCid === myCid) return true;
          
          // Phone number match - check if phone appears in citizenId or mobile fields
          if (phone && phone.length > 5) {
            if (appCid.includes(phone)) return true;
            if (app.applicantDetails && app.applicantDetails.mobile && String(app.applicantDetails.mobile).includes(phone)) return true;
            if (app.rrData && app.rrData.mobileNo && String(app.rrData.mobileNo).includes(phone)) return true;
            // Legacy data apps: match by locationDetails.mobileNo
            if (app.locationDetails && app.locationDetails.mobileNo && String(app.locationDetails.mobileNo).includes(phone)) return true;
          }
          
          return false;
        });
        
        console.log('[APP STATUS] CLIENT-SIDE filter found', myApps.length, 'apps for citizen', citizenId);
        myApps.forEach((app: any) => {
          console.log(`[APP STATUS] MY APP: ${app.id} | type=${app.type} | status=${app.status} | citizenId=${app.citizenId}`);
        });
        
        // Runtime fix: auto-patch any apps with invalid propertyType (legacy form bug)
        const VALID_CATS = ['domestic', 'commercial', 'non-domestic', 'nondomestic', 'non_domestic', 'industrial'];
        myApps.forEach((app: any) => {
          const cd = app.connectionDetails;
          if (cd && cd.propertyType) {
            const ptNorm = cd.propertyType.toLowerCase().replace(/[\s_-]+/g, '');
            const isValid = VALID_CATS.some(function(cat) { return ptNorm === cat.replace(/[\s_-]+/g, ''); });
            if (!isValid) {
              console.log('[APP STATUS] Auto-fixing invalid propertyType:', cd.propertyType, '→ domestic for', app.id);
              cd.propertyType = 'domestic';
              // Async DB patch
              fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-698be164/dev/patch-application`,
                {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ applicationId: app.id, patch: { connectionDetails: { propertyType: 'domestic' } } }),
                }
              ).then(function(r) { return r.json(); }).then(function(d) { console.log('[APP STATUS] Auto-patched propertyType for', app.id, ':', d); }).catch(function() {});
            }
          }
        });
        
        setApplications(myApps);
      } else {
        console.log('[APP STATUS] Raw endpoint returned no apps or error:', rawData.error);
        // FALLBACK: try the citizen-specific endpoint
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-698be164/citizen/${citizenId}/applications`;
        console.log('[APP STATUS] Falling back to citizen endpoint:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        console.log('[APP STATUS] Fallback response:', data);
        
        if (data.success) {
          setApplications(data.applications || []);
        } else {
          setError(data.error || 'Failed to fetch applications');
        }
      }
    } catch (err) {
      console.error('[APP STATUS] Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const getQueueText = (stage: string) => {
    const stageMap: { [key: string]: string } = {
      plumber: 'Plumber',
      plumber_reconnection: 'Plumber',
      plumber_installation: 'Plumber',
      caseworker: 'Caseworker',
      field_engineer: 'Field Engineer',
      fieldEngineer1: 'Field Engineer',
      revenue_officer: 'Revenue Officer',
      revenueOfficer: 'Revenue Officer',
      commissioner: 'Commissioner',
      fieldEngineer2: 'Field Engineer',
      payment: 'Payment',
      commissioner_payment_verification: 'Commissioner',
      completed: 'Completed',
      citizen: 'Citizen',
    };
    return stageMap[stage] || stage;
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending_plumber: 'Pending',
      estimation_sent: 'Estimation Received',
      pending_applicant_review: 'Under Review',
      pending_caseworker: 'Processing',
      submitted: 'Submitted to Caseworker',
      sentToCaseworker: 'Submitted to Caseworker',
      sentToRevenueOfficer: 'Under Review - Revenue Officer',
      sentToFieldEngineer: 'Under Review - Field Engineer',
      sentToCommissioner: 'Under Review - Commissioner',
      under_review: 'Under Review',
      field_visit_completed: 'Field Visit Completed',
      declined_by_plumber: 'Declined',
      approved: 'Approved',
      pending_payment: 'Pending Payment',
      sentToCitizenForPayment: 'Pending Payment',
      payment_done: 'Payment Completed',
      commissioner_payment_verification: 'Payment Verification',
      installation_approved: 'Approved for Installation',
      plumber_accepted_installation: 'Installation In Progress - Plumber Assigned',
      installation_work_submitted: 'Installation Work Submitted - Under Verification',
      installation_completed: 'Installation Completed',
      sentToPlumberForReconnection: 'Reconnection In Progress - Plumber Assigned',
      plumber_accepted_reconnection: 'Reconnection Accepted - Field Visit Pending',
      reconnection_work_submitted: 'Reconnection Work Submitted - Under Verification',
      reconnection_completed: 'Reconnection Completed',
      reconnection_rejected_by_plumber: 'Reconnection Rejected by Plumber',
      rejected: 'Rejected',
      sent_back: 'Sent Back for Correction',
      fe_verified: 'Under Review - Commissioner',
      sent_to_citizen: 'Approved - Letter Available',
      sentToPlumberForChangeConnection: 'Change Connection In Progress - Plumber Assigned',
      plumber_accepted_change_connection: 'Change Connection Accepted - Field Visit Pending',
      change_connection_work_submitted: 'Change Connection Work Submitted - Under Verification',
      change_connection_forwarded_to_fe: 'Change Connection - FE Verification Pending',
      change_connection_completed: 'Change Connection Completed',
    };
    return statusMap[status] || status;
  };

  const filteredApplications = applications.filter(app => {
    // Log all applications to see their types
    console.log(`[APP STATUS] Application ${app.id}: type="${app.type}", stage="${app.currentStage}", status="${app.status}"`);
    
    // Filter by application type based on active tab
    const typeFilter = activeTab === 'newConnection' 
      ? (!app.type || app.type === 'newConnection') // Show apps without type (legacy) or with newConnection type
      : activeTab === 'legacyData'
      ? app.type === 'legacyDataEntry'
      : app.type === activeTab;
    
    console.log(`[APP STATUS] ${app.id} - activeTab: ${activeTab}, app.type: ${app.type}, typeFilter: ${typeFilter}`);
    
    // Filter by search term
    const searchFilter = app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.applicantDetails && app.applicantDetails.applicantName ? app.applicantDetails.applicantName : '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.rrData && app.rrData.ownerName ? app.rrData.ownerName : '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((app as any).locationDetails && (app as any).locationDetails.fullName ? (app as any).locationDetails.fullName : '').toLowerCase().includes(searchTerm.toLowerCase());
    
    console.log(`[APP STATUS] ${app.id} - searchTerm: "${searchTerm}", searchFilter: ${searchFilter}`);
    
    const result = typeFilter && searchFilter;
    console.log(`[APP STATUS] ${app.id} - FINAL RESULT: ${result} (typeFilter: ${typeFilter}, searchFilter: ${searchFilter})`);
    
    return result;
  });

  // Sort: latest applications first
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const dateA = new Date(a.submittedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.submittedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  console.log(`[APP STATUS] Active tab: ${activeTab}, Filtered count: ${sortedApplications.length}, Total count: ${applications.length}`);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] flex items-center justify-center px-8 py-6">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#1f3a5f] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#1f3a5f] font-['Poppins',sans-serif] text-lg">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <SectionTitle title="My Applications" className="mb-2" />
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Track the status of your tap connection applications
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 font-['Poppins',sans-serif]">
          {error}
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden">
        {/* Header with Search */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-col font-['Poppins',sans-serif] text-[#414141] text-[18px] font-semibold">
              <p>Applicants List</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Refresh Button */}
              <button
                onClick={fetchApplications}
                disabled={refreshing}
                className="px-4 py-2 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-semibold hover:bg-[#1f3a5f]/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh applications"
              >
                <svg 
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>

              {/* Search Box */}
              <div className="bg-white flex gap-[8px] items-center px-[12px] py-[10px] rounded-[32px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.2),0px_0px_0px_1px_rgba(104,113,130,0.2)] w-[320px]">
                <SearchIcon />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 font-['Inter',sans-serif] font-normal leading-[20px] text-[#28334b] text-[14px] outline-none bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-200">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('newConnection')}
              className={`px-6 py-3 font-['Poppins',sans-serif] font-semibold text-[14px] transition-all relative ${
                activeTab === 'newConnection'
                  ? 'text-[#1f3a5f] border-b-2 border-[#1f3a5f]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              New Tap Connection
              {applications.filter(app => !app.type || app.type === 'newConnection').length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  activeTab === 'newConnection'
                    ? 'bg-[#1f3a5f] text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {applications.filter(app => !app.type || app.type === 'newConnection').length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('reconnection')}
              className={`px-6 py-3 font-['Poppins',sans-serif] font-semibold text-[14px] transition-all relative ${
                activeTab === 'reconnection'
                  ? 'text-[#1f3a5f] border-b-2 border-[#1f3a5f]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tap Reconnection
              {applications.filter(app => app.type === 'reconnection').length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  activeTab === 'reconnection'
                    ? 'bg-[#1f3a5f] text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {applications.filter(app => app.type === 'reconnection').length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('disconnection')}
              className={`px-6 py-3 font-['Poppins',sans-serif] font-semibold text-[14px] transition-all relative ${
                activeTab === 'disconnection'
                  ? 'text-[#1f3a5f] border-b-2 border-[#1f3a5f]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tap Disconnection
              {applications.filter(app => app.type === 'disconnection').length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  activeTab === 'disconnection'
                    ? 'bg-[#1f3a5f] text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {applications.filter(app => app.type === 'disconnection').length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('changeConnection')}
              className={`px-6 py-3 font-['Poppins',sans-serif] font-semibold text-[14px] transition-all relative ${
                activeTab === 'changeConnection'
                  ? 'text-[#1f3a5f] border-b-2 border-[#1f3a5f]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Change Connection Type
              {applications.filter(app => app.type === 'changeConnection').length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  activeTab === 'changeConnection'
                    ? 'bg-[#1f3a5f] text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {applications.filter(app => app.type === 'changeConnection').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('legacyData')}
              className={`px-6 py-3 font-['Poppins',sans-serif] font-semibold text-[14px] transition-all relative ${
                activeTab === 'legacyData'
                  ? 'text-[#1f3a5f] border-b-2 border-[#1f3a5f]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Legacy Data
              {applications.filter(app => app.type === 'legacyDataEntry').length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  activeTab === 'legacyData'
                    ? 'bg-[#1f3a5f] text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {applications.filter(app => app.type === 'legacyDataEntry').length}
                </span>
              )}
            </button>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-16 w-full">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-['Poppins',sans-serif] text-lg mb-2">
              No applications found
            </p>
            <p className="text-gray-500 font-['Poppins',sans-serif] text-sm">
              You haven't submitted any tap connection applications yet.
            </p>
          </div>
        ) : (
          <div 
            className="overflow-x-auto overflow-y-visible scrollbar-custom"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db #f5f5f5',
            }}
          >
            <style>{`
              .scrollbar-custom::-webkit-scrollbar {
                height: 12px;
              }
              .scrollbar-custom::-webkit-scrollbar-track {
                background: linear-gradient(to right, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
                border-radius: 10px;
                margin: 0 16px;
              }
              .scrollbar-custom::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #1f3a5f 0%, #2c5282 100%);
                border-radius: 10px;
                border: 2px solid #e5e7eb;
                transition: all 0.3s ease;
              }
              .scrollbar-custom::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(135deg, #2c5282 0%, #1f3a5f 100%);
                border-color: #1f3a5f;
                box-shadow: 0 0 8px rgba(31, 58, 95, 0.4);
              }
              .scrollbar-custom::-webkit-scrollbar-thumb:active {
                background: linear-gradient(135deg, #1f3a5f 0%, #2c5282 100%);
              }
            `}</style>
            <table className="w-full" style={{ minWidth: '1200px' }}>
              {/* Table Header - Sticky */}
              <thead className="sticky top-0 z-10 bg-[#f8f9fa] border-b border-[#e5e7eb]">
                <tr>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide">
                    #
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide min-w-[140px]">
                    Type of Service
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide min-w-[180px]">
                    Application No
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide min-w-[120px]">
                    Applicant As
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide min-w-[140px]">
                    Connection Type
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide min-w-[140px]">
                    Plumber Name
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide min-w-[140px]">
                    Date of Submission
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide min-w-[120px]">
                    Queue
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide min-w-[100px]">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide min-w-[120px]">
                    Action
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {sortedApplications.map((app, index) => (
                  <tr 
                    key={app.id} 
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {/* # */}
                    <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-black">
                      {index + 1}
                    </td>
                    
                    {/* Type of Service */}
                    <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-[#171c26] text-center">
                      {app.type === 'reconnection' ? 'Tap Reconnection' : 
                       app.type === 'disconnection' ? 'Tap Disconnection' : 
                       app.type === 'changeConnection' ? 'Change Connection Type' :
                       app.type === 'legacyDataEntry' ? 'Legacy Data' :
                       'New Tap Connection'}
                    </td>
                    
                    {/* Application No */}
                    <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-[#171c26] text-center">
                      <span className="inline-block max-w-[180px] truncate" title={app.id}>
                        {app.id}
                      </span>
                    </td>
                    
                    {/* Applicant As */}
                    <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-[#171c26] text-center capitalize">
                      {app.type === 'legacyDataEntry'
                        ? ((app as any).applicantType || 'Owner')
                        : (app.propertyDetails && app.propertyDetails.ownershipType ? app.propertyDetails.ownershipType : 'Owner')}
                    </td>
                    
                    {/* Connection Type */}
                    <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-[#171c26] text-center capitalize">
                      {app.type === 'legacyDataEntry'
                        ? ((app as any).existingConnection && (app as any).existingConnection.connectionType ? (app as any).existingConnection.connectionType : 'N/A')
                        : (() => {
                            // propertyType stores the usage category (Domestic/Commercial/etc.)
                            const pt = app.connectionDetails && app.connectionDetails.propertyType ? app.connectionDetails.propertyType : '';
                            const VALID_CATS = ['domestic', 'commercial', 'non-domestic', 'nondomestic', 'non_domestic', 'industrial'];
                            const ptNorm = pt.toLowerCase().replace(/[\s_-]+/g, '');
                            const isValidCat = VALID_CATS.some(function(c) { return ptNorm === c.replace(/[\s_-]+/g, ''); });
                            if (isValidCat) return pt;
                            // Fallback: check connectionType if it holds a category (not a metering value)
                            const ct = app.connectionDetails && app.connectionDetails.connectionType ? app.connectionDetails.connectionType : '';
                            const ctNorm = ct.toLowerCase().replace(/[\s_-]+/g, '');
                            const isMeteringVal = ctNorm === 'metered' || ctNorm === 'nonmetered' || ctNorm === 'unmetered';
                            if (ct && !isMeteringVal) return ct;
                            // Fallback: rrData
                            return (app.rrData && app.rrData.connectionType ? app.rrData.connectionType : 'N/A');
                          })()}
                    </td>
                    
                    {/* Plumber Name */}
                    <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-[#171c26] text-center">
                      {app.type === 'legacyDataEntry'
                        ? ((app as any).locationDetails && (app as any).locationDetails.fullName ? (app as any).locationDetails.fullName : 'N/A')
                        : (app.plumberDetails && app.plumberDetails.plumberName ? app.plumberDetails.plumberName : 'Not Assigned')}
                    </td>
                    
                    {/* Date of Submission */}
                    <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-[#151515] text-center">
                      {formatDate(app.submittedAt || app.createdAt || '')}
                    </td>
                    
                    {/* Queue */}
                    <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-[#171c26] text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[13px]">
                        {getQueueText(app.currentStage)}
                      </span>
                    </td>
                    
                    {/* Status */}
                    <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[13px] ${
                        app.status === 'sentToCitizenForPayment' || app.status === 'pending_payment'
                          ? 'bg-purple-100 text-purple-800'
                          : app.status === 'payment_done' || app.status === 'sent_to_citizen'
                          ? 'bg-green-100 text-green-800'
                          : app.status === 'estimation_sent' || app.status === 'pending_applicant_review'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status.includes('pending') 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : app.status.includes('approved')
                          ? 'bg-green-100 text-green-800'
                          : app.status.includes('declined')
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusText(app.status)}
                      </span>
                    </td>
                    
                    {/* Action Button */}
                    <td className="px-4 py-4 text-center">
                      <button className={`px-5 py-2 rounded-[24px] shadow-sm transition-colors ${
                        app.status === 'installation_approved' || app.status === 'approved' || app.status === 'completed' || app.status === 'sentToPlumberForReconnection' || app.status === 'plumber_accepted_reconnection' || app.status === 'reconnection_work_submitted' || app.status === 'reconnection_completed' || app.status === 'plumber_accepted_installation' || app.status === 'installation_work_submitted' || app.status === 'installation_completed' || app.status === 'sentToPlumberForChangeConnection' || app.status === 'plumber_accepted_change_connection' || app.status === 'change_connection_work_submitted' || app.status === 'change_connection_forwarded_to_fe' || app.status === 'change_connection_completed'
                          ? 'bg-[#22c55e] hover:bg-[#16a34a]'
                          : app.type === 'legacyDataEntry' && (app.status === 'sent_to_citizen' || app.status === 'approved')
                          ? 'bg-[#22c55e] hover:bg-[#16a34a]'
                          : 'bg-[#27548a] hover:bg-[#1f3a5f]'
                      }`}
                        onClick={() => {
                          console.log('Application clicked:', app.id);
                          console.log('Application status:', app.status);
                          console.log('Has plumberConnectionData:', !!app.plumberConnectionData);
                          setSelectedApplication(app);
                          // Handle legacy data applications
                          if (app.type === 'legacyDataEntry') {
                            console.log('Showing CitizenLegacyDataStatusView');
                            setShowLegacyDataView(true);
                          } else if (app.status === 'estimation_sent' || app.status === 'pending_applicant_review') {
                            console.log('Showing CitizenReviewView for estimation review');
                            setShowCitizenReviewView(true);
                          } else if (app.status === 'pending_payment' || app.status === 'sentToCitizenForPayment') {
                            console.log('Showing CitizenPaymentView');
                            if (app.type === 'reconnection') {
                              setShowCitizenReconnectionPaymentView(true);
                            } else {
                              setShowCitizenPaymentView(true);
                            }
                          } else if (app.status === 'payment_done' || app.status === 'commissioner_payment_verification') {
                            console.log('Showing payment receipt and letter view');
                            if (app.type === 'reconnection') {
                              setShowCitizenReconnectionPaymentView(true);
                            } else {
                              setShowCitizenPaymentView(true); // Reuse payment view to show receipt
                            }
                          } else if (app.status === 'installation_approved' || app.status === 'approved' || app.status === 'completed' || app.status === 'sentToPlumberForReconnection' || app.status === 'plumber_accepted_reconnection' || app.status === 'reconnection_work_submitted' || app.status === 'reconnection_completed' || app.status === 'plumber_accepted_installation' || app.status === 'installation_work_submitted' || app.status === 'installation_completed' || app.status === 'sentToPlumberForChangeConnection' || app.status === 'plumber_accepted_change_connection' || app.status === 'change_connection_work_submitted' || app.status === 'change_connection_forwarded_to_fe' || app.status === 'change_connection_completed') {
                            console.log('Showing CertificateView');
                            setShowCertificateView(true);
                          } else {
                            console.log('Showing ApplicationSummaryView');
                            setShowSummaryView(true);
                          }
                        }}
                      >
                        <span className="font-['Poppins',sans-serif] font-semibold text-[14px] text-white">
                          {app.type === 'legacyDataEntry' && (app.status === 'sent_to_citizen' || app.status === 'approved')
                            ? 'View Letter'
                            : app.status === 'installation_approved' || app.status === 'approved' || app.status === 'completed' || app.status === 'sentToPlumberForReconnection' || app.status === 'plumber_accepted_reconnection' || app.status === 'reconnection_work_submitted' || app.status === 'reconnection_completed' || app.status === 'plumber_accepted_installation' || app.status === 'installation_work_submitted' || app.status === 'installation_completed' || app.status === 'sentToPlumberForChangeConnection' || app.status === 'plumber_accepted_change_connection' || app.status === 'change_connection_work_submitted' || app.status === 'change_connection_forwarded_to_fe' || app.status === 'change_connection_completed' ? 'View Certificate' : 'View'}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredApplications.length === 0 && searchTerm && applications.length > 0 && (
          <div className="text-center py-12 w-full">
            <p className="text-gray-500 font-['Poppins',sans-serif]">
              No applications found matching "{searchTerm}"
            </p>
          </div>
        )}

        {filteredApplications.length === 0 && !searchTerm && applications.length > 0 && (
          <div className="text-center py-12 w-full">
            <p className="text-gray-500 font-['Poppins',sans-serif]">
              No {activeTab === 'reconnection' ? 'Tap Reconnection' : activeTab === 'disconnection' ? 'Tap Disconnection' : activeTab === 'changeConnection' ? 'Change Connection Type' : activeTab === 'legacyData' ? 'Legacy Data' : 'New Tap Connection'} applications found
            </p>
            <p className="text-gray-400 font-['Poppins',sans-serif] text-sm mt-2">
              Try clicking the Refresh button to check for updates
            </p>
          </div>
        )}
      </div>

      {/* Summary View - Replaces entire screen */}
      {showSummaryView && selectedApplication ? (
        <div className="fixed inset-0 bg-[#f5f5fa] z-50 overflow-auto">
          <ApplicationSummaryView
            application={selectedApplication}
            onBack={() => setShowSummaryView(false)}
          />
        </div>
      ) : null}

      {/* Citizen Review View - Replaces entire screen */}
      {showCitizenReviewView && selectedApplication ? (
        <div className="fixed inset-0 bg-[#f5f5fa] z-50 overflow-auto">
          <CitizenReviewView
            application={selectedApplication}
            onBack={() => {
              setShowCitizenReviewView(false);
              fetchApplications(); // Refresh the list
            }}
          />
        </div>
      ) : null}

      {/* Citizen Payment View - Replaces entire screen */}
      {showCitizenPaymentView && selectedApplication ? (
        <div className="fixed inset-0 bg-[#f5f5fa] z-50 overflow-auto">
          <CitizenPaymentView
            application={selectedApplication}
            onBack={() => {
              setShowCitizenPaymentView(false);
              fetchApplications(); // Refresh the list
            }}
          />
        </div>
      ) : null}

      {/* Citizen Reconnection Payment View - Replaces entire screen */}
      {showCitizenReconnectionPaymentView && selectedApplication ? (
        <div className="fixed inset-0 bg-[#f5f5fa] z-50 overflow-auto">
          <CitizenReconnectionPaymentView
            application={selectedApplication}
            onBack={() => {
              setShowCitizenReconnectionPaymentView(false);
              fetchApplications(); // Refresh the list
            }}
          />
        </div>
      ) : null}

      {/* Certificate View - Replaces entire screen */}
      {showCertificateView && selectedApplication ? (
        <div className="fixed inset-0 bg-[#f5f5fa] z-50 overflow-auto">
          <CertificateView
            application={selectedApplication}
            onBack={() => setShowCertificateView(false)}
          />
        </div>
      ) : null}

      {/* Legacy Data View - Replaces entire screen */}
      {showLegacyDataView && selectedApplication ? (
        <div className="fixed inset-0 bg-[#f5f5fa] z-50 overflow-auto">
          <CitizenLegacyDataStatusView
            application={selectedApplication}
            onBack={() => setShowLegacyDataView(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
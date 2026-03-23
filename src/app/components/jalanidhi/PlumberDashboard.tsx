import { useState, useEffect } from 'react';
import svgPaths from '../../../imports/svg-o4g60fk9nm';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import ApplicationSummaryView from './ApplicationSummaryView';
import SectionTitle from './SectionTitle';
import PlumberConnectionDetails, { ConnectionDetailsData } from './PlumberConnectionDetails';
import PlumberReconnectionWorkView from './PlumberReconnectionWorkView';
import PlumberInstallationWorkView from './PlumberInstallationWorkView';
import PlumberDisconnectionWorkView from './PlumberDisconnectionWorkView';
import PlumberChangeConnectionWorkView from './PlumberChangeConnectionWorkView';

interface Application {
  id: string;
  type?: string;
  citizenId: string;
  propertyDetails: {
    district: string;
    ulb: string;
    ulbType: string;
    authorityType: string;
    ownershipType: string;
  };
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
  connectionDetails: {
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
  // Reconnection fields
  rrNumber?: string;
  rrData?: any;
  charges?: any;
  certificateData?: any;
  paymentDetails?: any;
  status: string;
  submittedAt: string;
  createdAt?: string;
  currentStage: string;
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

export default function PlumberDashboard() {
  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('plumber_applications');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [loading, setLoading] = useState(() => {
    const saved = localStorage.getItem('plumber_applications');
    return !saved;
  });
  
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState(() => {
    const saved = localStorage.getItem('plumber_searchTerm');
    return saved || '';
  });
  
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(() => {
    const saved = localStorage.getItem('plumber_selectedApplication');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [showSummaryView, setShowSummaryView] = useState(() => {
    const saved = localStorage.getItem('plumber_showSummaryView');
    return saved === 'true';
  });
  
  const [showConnectionDetails, setShowConnectionDetails] = useState(() => {
    const saved = localStorage.getItem('plumber_showConnectionDetails');
    return saved === 'true';
  });
  
  const [processing, setProcessing] = useState(false);
  
  const [showReconnectionWorkView, setShowReconnectionWorkView] = useState(() => {
    const saved = localStorage.getItem('plumber_showReconnectionWorkView');
    return saved === 'true';
  });

  const [actionApp, setActionApp] = useState<{ id: string; action: 'accept' | 'decline' } | null>(() => {
    const saved = localStorage.getItem('plumber_actionApp');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activeTab, setActiveTab] = useState<'pending' | 'estimation_sent' | 'reconnection_work' | 'installation_work' | 'disconnection_work' | 'change_connection_work'>(() => {
    const saved = localStorage.getItem('plumber_activeTab');
    return (saved as 'pending' | 'estimation_sent' | 'reconnection_work' | 'installation_work' | 'disconnection_work' | 'change_connection_work') || 'pending';
  });

  const [showInstallationWorkView, setShowInstallationWorkView] = useState(() => {
    const saved = localStorage.getItem('plumber_showInstallationWorkView');
    return saved === 'true';
  });
  
  const [showDisconnectionWorkView, setShowDisconnectionWorkView] = useState(() => {
    const saved = localStorage.getItem('plumber_showDisconnectionWorkView');
    return saved === 'true';
  });

  const [showChangeConnectionWorkView, setShowChangeConnectionWorkView] = useState(() => {
    const saved = localStorage.getItem('plumber_showChangeConnectionWorkView');
    return saved === 'true';
  });

  const [statusFilter, setStatusFilter] = useState('all');
  
  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('plumber_searchTerm', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedApplication) {
      localStorage.setItem('plumber_selectedApplication', JSON.stringify(selectedApplication));
    } else {
      localStorage.removeItem('plumber_selectedApplication');
    }
  }, [selectedApplication]);

  useEffect(() => {
    localStorage.setItem('plumber_showSummaryView', showSummaryView.toString());
  }, [showSummaryView]);

  useEffect(() => {
    localStorage.setItem('plumber_showConnectionDetails', showConnectionDetails.toString());
  }, [showConnectionDetails]);

  useEffect(() => {
    if (actionApp) {
      localStorage.setItem('plumber_actionApp', JSON.stringify(actionApp));
    } else {
      localStorage.removeItem('plumber_actionApp');
    }
  }, [actionApp]);

  useEffect(() => {
    localStorage.setItem('plumber_activeTab', activeTab);
    setStatusFilter('all');
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('plumber_showReconnectionWorkView', showReconnectionWorkView.toString());
  }, [showReconnectionWorkView]);

  useEffect(() => {
    localStorage.setItem('plumber_showInstallationWorkView', showInstallationWorkView.toString());
  }, [showInstallationWorkView]);

  useEffect(() => {
    localStorage.setItem('plumber_showDisconnectionWorkView', showDisconnectionWorkView.toString());
  }, [showDisconnectionWorkView]);

  useEffect(() => {
    localStorage.setItem('plumber_showChangeConnectionWorkView', showChangeConnectionWorkView.toString());
  }, [showChangeConnectionWorkView]);
  
  // Get plumber info from logged-in user
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const plumberId = userData.plumberLicense || 'PLB-001';
  const plumberName = userData.name || 'Plumber';

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber/applications`;
      console.log('Fetching plumber applications from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Plumber Applications API response:', data);

      if (data.success) {
        console.log('Applications found:', data.applications && data.applications.length ? data.applications.length : 0);
        setApplications(data.applications || []);
        localStorage.setItem('plumber_applications', JSON.stringify(data.applications || []));
      } else {
        console.error('Error from API:', data.error);
        setError(data.error || 'Failed to fetch applications');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (appId: string) => {
    // Show connection details form instead of immediately accepting
    setShowSummaryView(false);
    setShowConnectionDetails(true);
  };

  const handleConnectionDetailsSubmit = async (data: ConnectionDetailsData) => {
    if (!selectedApplication) return;

    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber/process`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            applicationId: selectedApplication.id,
            plumberId,
            plumberName,
            action: 'accept',
            connectionDetails: {
              estimationRows: data.estimationRows,
              totalAmount: data.totalAmount,
              siteSketchUploaded: !!data.siteSketch,
              estimateUploaded: !!data.estimate,
              comments: data.comments,
            },
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert('Application accepted successfully with connection details!');
        setShowConnectionDetails(false);
        setSelectedApplication(null);
        fetchApplications(); // Refresh the list
      } else {
        console.error('Failed to accept application:', result.error);
        alert(`Failed to accept application: ${result.error}`);
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      alert(`Error accepting application: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async (appId: string) => {
    const reason = prompt('Please provide a reason for declining this application:');
    if (!reason) return;

    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber/process`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            applicationId: appId,
            plumberId,
            plumberName,
            action: 'decline',
            declineReason: reason,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert('Application declined successfully!');
        fetchApplications(); // Refresh the list
      } else {
        console.error('Failed to decline application:', result.error);
        alert(`Failed to decline application: ${result.error}`);
      }
    } catch (error) {
      console.error('Error declining application:', error);
      alert(`Error declining application: ${error}`);
    } finally {
      setProcessing(false);
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

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending_plumber: 'Pending',
      estimation_sent: 'Estimation Sent',
      pending_applicant_review: 'Under Review',
      pending_caseworker: 'Processing',
      declined_by_plumber: 'Declined',
      approved: 'Approved',
      sentToPlumberForReconnection: 'Reconnection Pending',
      plumber_accepted_reconnection: 'Accepted - Field Visit',
      reconnection_work_submitted: 'Work Submitted',
      sentToCitizenForPayment: 'Installation Pending',
      installation_approved: 'Ready for Installation',
      plumber_accepted_installation: 'Accepted - Field Visit',
      installation_work_submitted: 'Report Submitted',
      installation_completed: 'Completed',
      sentToPlumberForDisconnection: 'Disconnection Pending',
      plumber_accepted_disconnection: 'Accepted - Field Visit',
      plumber_declined_disconnection: 'Declined',
      disconnection_work_submitted: 'Report Submitted',
      sentToPlumberForChangeConnection: 'Change Connection Pending',
      plumber_accepted_change_connection: 'Accepted - Field Visit',
      change_connection_work_submitted: 'Report Submitted',
      change_connection_forwarded_to_fe: 'Forwarded to FE',
    };
    return statusMap[status] || status;
  };

  // Filter applications based on active tab
  const tabFilteredApplications = applications.filter(app => {
    if (activeTab === 'pending') {
      return app.status === 'pending_plumber';
    } else if (activeTab === 'estimation_sent') {
      return app.status === 'estimation_sent' || app.status === 'pending_applicant_review';
    } else if (activeTab === 'reconnection_work') {
      return app.status === 'sentToPlumberForReconnection' || 
             app.status === 'plumber_accepted_reconnection' || 
             app.status === 'reconnection_work_submitted';
    } else if (activeTab === 'installation_work') {
      return app.status === 'sentToCitizenForPayment' ||
             app.status === 'installation_approved' ||
             app.status === 'approved' ||
             app.status === 'plumber_accepted_installation' ||
             app.status === 'installation_work_submitted' ||
             app.status === 'installation_completed';
    } else if (activeTab === 'disconnection_work') {
      return app.status === 'sentToPlumberForDisconnection' || 
             app.status === 'plumber_accepted_disconnection' || 
             app.status === 'disconnection_work_submitted';
    } else if (activeTab === 'change_connection_work') {
      return app.status === 'sentToPlumberForChangeConnection' || 
             app.status === 'plumber_accepted_change_connection' || 
             app.status === 'change_connection_work_submitted' ||
             app.status === 'change_connection_forwarded_to_fe';
    }
    return false;
  });

  // Apply status filter on top of tab filter
  const statusFilteredApplications = tabFilteredApplications.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  // Apply search filter on top of status filter
  const filteredApplications = statusFilteredApplications.filter(app => {
    const isReconnection = app.type === 'reconnection';
    const isDisconnection = app.type === 'disconnection';
    const isChangeConnection = app.type === 'changeConnection';
    const appName = (isReconnection || isDisconnection || isChangeConnection)
      ? (app.rrData && app.rrData.ownerName ? app.rrData.ownerName : (app.applicantDetails && app.applicantDetails.applicantName ? app.applicantDetails.applicantName : 'N/A'))
      : (app.applicantDetails && app.applicantDetails.applicantName ? app.applicantDetails.applicantName : 'N/A');
    return app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort: latest applications first
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const dateA = new Date(a.submittedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.submittedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  // Count applications for each tab
  const pendingCount = applications.filter(app => app.status === 'pending_plumber').length;
  const estimationSentCount = applications.filter(app => 
    app.status === 'estimation_sent' || app.status === 'pending_applicant_review'
  ).length;
  const reconnectionWorkCount = applications.filter(app => app.status === 'sentToPlumberForReconnection' || 
    app.status === 'plumber_accepted_reconnection' || 
    app.status === 'reconnection_work_submitted'
  ).length;
  const installationWorkCount = applications.filter(app => app.status === 'sentToCitizenForPayment' ||
    app.status === 'installation_approved' ||
    app.status === 'approved' ||
    app.status === 'plumber_accepted_installation' ||
    app.status === 'installation_work_submitted' ||
    app.status === 'installation_completed'
  ).length;
  const disconnectionWorkCount = applications.filter(app => app.status === 'sentToPlumberForDisconnection' || 
    app.status === 'plumber_accepted_disconnection' || 
    app.status === 'disconnection_work_submitted'
  ).length;
  const changeConnectionWorkCount = applications.filter(app => app.status === 'sentToPlumberForChangeConnection' || 
    app.status === 'plumber_accepted_change_connection' || 
    app.status === 'change_connection_work_submitted' ||
    app.status === 'change_connection_forwarded_to_fe'
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] flex items-center justify-center px-8 py-6">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#1f3a5f] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#1f3a5f] font-['Poppins',sans-serif] text-lg">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <SectionTitle title="New Tap Connection Requested Applications" className="mb-2" />
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Review and process tap connection requests from citizens
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 font-['Poppins',sans-serif]">
          {error}
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Title Bar */}
        <div className="bg-[#1f3a5f] px-6 py-4">
          <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-white leading-7">
            Applicants List
          </h2>
        </div>
        {/* Tabs Navigation */}
        <div className="border-b border-[#e5e7eb]">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 px-4 py-4 font-['Poppins',sans-serif] font-semibold text-[14px] transition-all relative whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'text-[#1f3a5f] bg-[#1f3a5f]/5'
                  : 'text-gray-500 hover:text-[#1f3a5f] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Pending Applications</span>
                {pendingCount > 0 && (
                  <span className="bg-[#1f3a5f] text-white text-[12px] font-bold px-2.5 py-0.5 rounded-full min-w-[24px] text-center">
                    {pendingCount}
                  </span>
                )}
              </div>
              {activeTab === 'pending' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1f3a5f]"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('estimation_sent')}
              className={`flex-1 px-4 py-4 font-['Poppins',sans-serif] font-semibold text-[14px] transition-all relative whitespace-nowrap ${
                activeTab === 'estimation_sent'
                  ? 'text-[#1f3a5f] bg-[#1f3a5f]/5'
                  : 'text-gray-500 hover:text-[#1f3a5f] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Estimation Sent</span>
                {estimationSentCount > 0 && (
                  <span className="bg-green-600 text-white text-[12px] font-bold px-2.5 py-0.5 rounded-full min-w-[24px] text-center">
                    {estimationSentCount}
                  </span>
                )}
              </div>
              {activeTab === 'estimation_sent' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1f3a5f]"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('reconnection_work')}
              className={`flex-1 px-4 py-4 font-['Poppins',sans-serif] font-semibold text-[14px] transition-all relative whitespace-nowrap ${
                activeTab === 'reconnection_work'
                  ? 'text-[#1f3a5f] bg-[#1f3a5f]/5'
                  : 'text-gray-500 hover:text-[#1f3a5f] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Reconnection Work</span>
                {reconnectionWorkCount > 0 && (
                  <span className="bg-blue-600 text-white text-[12px] font-bold px-2.5 py-0.5 rounded-full min-w-[24px] text-center">
                    {reconnectionWorkCount}
                  </span>
                )}
              </div>
              {activeTab === 'reconnection_work' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1f3a5f]"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('installation_work')}
              className={`flex-1 px-4 py-4 font-['Poppins',sans-serif] font-semibold text-[14px] transition-all relative whitespace-nowrap ${
                activeTab === 'installation_work'
                  ? 'text-[#1f3a5f] bg-[#1f3a5f]/5'
                  : 'text-gray-500 hover:text-[#1f3a5f] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Installation Work</span>
                {installationWorkCount > 0 && (
                  <span className="bg-green-600 text-white text-[12px] font-bold px-2.5 py-0.5 rounded-full min-w-[24px] text-center">
                    {installationWorkCount}
                  </span>
                )}
              </div>
              {activeTab === 'installation_work' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1f3a5f]"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('disconnection_work')}
              className={`flex-1 px-4 py-4 font-['Poppins',sans-serif] font-semibold text-[14px] transition-all relative whitespace-nowrap ${
                activeTab === 'disconnection_work'
                  ? 'text-[#1f3a5f] bg-[#1f3a5f]/5'
                  : 'text-gray-500 hover:text-[#1f3a5f] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Disconnection Work</span>
                {disconnectionWorkCount > 0 && (
                  <span className="bg-red-600 text-white text-[12px] font-bold px-2.5 py-0.5 rounded-full min-w-[24px] text-center">
                    {disconnectionWorkCount}
                  </span>
                )}
              </div>
              {activeTab === 'disconnection_work' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1f3a5f]"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('change_connection_work')}
              className={`flex-1 px-4 py-4 font-['Poppins',sans-serif] font-semibold text-[14px] transition-all relative whitespace-nowrap ${
                activeTab === 'change_connection_work'
                  ? 'text-[#1f3a5f] bg-[#1f3a5f]/5'
                  : 'text-gray-500 hover:text-[#1f3a5f] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Change Connection Work</span>
                {changeConnectionWorkCount > 0 && (
                  <span className="bg-purple-600 text-white text-[12px] font-bold px-2.5 py-0.5 rounded-full min-w-[24px] text-center">
                    {changeConnectionWorkCount}
                  </span>
                )}
              </div>
              {activeTab === 'change_connection_work' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1f3a5f]"></div>
              )}
            </button>
          </div>
        </div>

        {/* Header with Search */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="font-['Poppins',sans-serif] text-[13px] text-[#28334b] bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#1f3a5f] focus:ring-1 focus:ring-[#1f3a5f] cursor-pointer min-w-[200px]"
              >
                <option value="all">All Statuses</option>
                {activeTab === 'pending' && (
                  <option value="pending_plumber">Pending</option>
                )}
                {activeTab === 'estimation_sent' && (
                  <>
                    <option value="estimation_sent">Estimation Sent</option>
                    <option value="pending_applicant_review">Under Review</option>
                  </>
                )}
                {activeTab === 'reconnection_work' && (
                  <>
                    <option value="sentToPlumberForReconnection">Reconnection Pending</option>
                    <option value="plumber_accepted_reconnection">Accepted - Field Visit</option>
                    <option value="reconnection_work_submitted">Work Submitted</option>
                  </>
                )}
                {activeTab === 'installation_work' && (
                  <>
                    <option value="sentToCitizenForPayment">Installation Pending</option>
                    <option value="installation_approved">Ready for Installation</option>
                    <option value="approved">Approved</option>
                    <option value="plumber_accepted_installation">Accepted - Field Visit</option>
                    <option value="installation_work_submitted">Report Submitted</option>
                    <option value="installation_completed">Completed</option>
                  </>
                )}
                {activeTab === 'disconnection_work' && (
                  <>
                    <option value="sentToPlumberForDisconnection">Disconnection Pending</option>
                    <option value="plumber_accepted_disconnection">Accepted - Field Visit</option>
                    <option value="disconnection_work_submitted">Report Submitted</option>
                  </>
                )}
                {activeTab === 'change_connection_work' && (
                  <>
                    <option value="sentToPlumberForChangeConnection">Change Connection Pending</option>
                    <option value="plumber_accepted_change_connection">Accepted - Field Visit</option>
                    <option value="change_connection_work_submitted">Report Submitted</option>
                    <option value="change_connection_forwarded_to_fe">Forwarded to FE</option>
                  </>
                )}
              </select>
            </div>
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

        {applications.length === 0 ? (
          <div className="text-center py-16 w-full">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-['Poppins',sans-serif] text-lg mb-2">
              No applications
            </p>
            <p className="text-gray-500 font-['Poppins',sans-serif] text-sm">
              There are no tap connection applications at the moment.
            </p>
          </div>
        ) : tabFilteredApplications.length === 0 ? (
          <div className="text-center py-16 w-full">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-['Poppins',sans-serif] text-lg mb-2">
              {activeTab === 'pending' ? 'No pending applications' : activeTab === 'reconnection_work' ? 'No reconnection work pending' : 'No estimation sent'}
            </p>
            <p className="text-gray-500 font-['Poppins',sans-serif] text-sm">
              {activeTab === 'pending' 
                ? 'There are no tap connection requests waiting for your review.' 
                : activeTab === 'reconnection_work'
                ? 'There are no reconnection applications assigned to you at the moment.'
                : 'You have not sent any estimations yet.'}
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
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide min-w-[180px]">
                    Application No
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide min-w-[140px]">
                    Applicant Name
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide min-w-[120px]">
                    Applicant As
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide min-w-[140px]">
                    Connection Type
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide min-w-[140px]">
                    Date of Requested
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide min-w-[100px]">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide min-w-[180px]">
                    Action
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {sortedApplications.map((app, index) => {
                  const isReconnection = app.type === 'reconnection';
                  const isDisconnection = app.type === 'disconnection';
                  const isChangeConnection = app.type === 'changeConnection';
                  const appName = (isReconnection || isDisconnection || isChangeConnection)
                    ? (app.rrData && app.rrData.ownerName ? app.rrData.ownerName : (app.applicantDetails && app.applicantDetails.applicantName ? app.applicantDetails.applicantName : 'N/A'))
                    : (app.applicantDetails && app.applicantDetails.applicantName ? app.applicantDetails.applicantName : 'N/A');
                  const ownershipType = app.propertyDetails && app.propertyDetails.ownershipType ? app.propertyDetails.ownershipType : 'Owner';
                  const connType = isDisconnection
                    ? 'Disconnection'
                    : isReconnection
                    ? 'Reconnection'
                    : isChangeConnection
                    ? 'Change of Connection'
                    : (app.connectionDetails && app.connectionDetails.connectionType ? app.connectionDetails.connectionType : 'N/A');
                  const submittedDate = app.submittedAt || app.createdAt || '';
                  
                  return (
                  <tr 
                    key={app.id} 
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {/* # */}
                    <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-black">
                      {index + 1}
                    </td>
                    
                    {/* Application No */}
                    <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-[#171c26] text-center">
                      <span className="inline-block max-w-[180px] truncate" title={app.id}>
                        {app.id}
                      </span>
                    </td>
                    
                    {/* Applicant Name */}
                    <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-[#171c26] text-center">
                      {appName}
                    </td>
                    
                    {/* Applicant As */}
                    <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-[#171c26] text-center capitalize">
                      {ownershipType}
                    </td>
                    
                    {/* Connection Type */}
                    <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-[#171c26] text-center capitalize">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold ${
                        isDisconnection
                          ? 'bg-red-100 text-red-800'
                          : isReconnection
                          ? 'bg-orange-100 text-orange-800'
                          : isChangeConnection
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {connType}
                      </span>
                    </td>
                    
                    {/* Date of Requested */}
                    <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-[#151515] text-center">
                      {submittedDate ? formatDate(submittedDate) : 'N/A'}
                    </td>
                    
                    {/* Status */}
                    <td className="px-4 py-4 font-['Poppins',sans-serif] font-medium text-[14px] text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[13px] ${
                        app.status === 'sentToPlumberForReconnection'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status === 'plumber_accepted_reconnection'
                          ? 'bg-amber-100 text-amber-800'
                          : app.status === 'reconnection_work_submitted'
                          ? 'bg-green-100 text-green-800'
                          : app.status === 'sentToCitizenForPayment'
                          ? 'bg-purple-100 text-purple-800'
                          : app.status === 'installation_approved' || app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'plumber_accepted_installation'
                          ? 'bg-amber-100 text-amber-800'
                          : app.status === 'installation_work_submitted'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status === 'installation_completed'
                          ? 'bg-green-100 text-green-800'
                          : app.status === 'estimation_sent' || app.status === 'pending_applicant_review'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status === 'sentToPlumberForChangeConnection'
                          ? 'bg-purple-100 text-purple-800'
                          : app.status === 'plumber_accepted_change_connection'
                          ? 'bg-amber-100 text-amber-800'
                          : app.status === 'change_connection_work_submitted'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status === 'change_connection_forwarded_to_fe'
                          ? 'bg-green-100 text-green-800'
                          : app.status.includes('pending')
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusText(app.status)}
                      </span>
                    </td>
                    
                    {/* Action Buttons */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Button */}
                        <button 
                          className="bg-[#27548a] px-4 py-1.5 rounded-[24px] shadow-sm hover:bg-[#1f3a5f] transition-colors"
                          onClick={() => {
                            setSelectedApplication(app);
                            if (app.status === 'sentToPlumberForReconnection' || 
                                app.status === 'plumber_accepted_reconnection' || 
                                app.status === 'reconnection_work_submitted') {
                              setShowReconnectionWorkView(true);
                              localStorage.setItem('plumber_showReconnectionWorkView', 'true');
                            } else if (app.status === 'sentToPlumberForDisconnection' ||
                                       app.status === 'plumber_accepted_disconnection' ||
                                       app.status === 'disconnection_work_submitted') {
                              setShowDisconnectionWorkView(true);
                              localStorage.setItem('plumber_showDisconnectionWorkView', 'true');
                            } else if (activeTab === 'installation_work' ||
                                       app.status === 'sentToCitizenForPayment' ||
                                       app.status === 'installation_approved' ||
                                       app.status === 'approved' ||
                                       app.status === 'plumber_accepted_installation' ||
                                       app.status === 'installation_work_submitted' ||
                                       app.status === 'installation_completed') {
                              setShowInstallationWorkView(true);
                              localStorage.setItem('plumber_showInstallationWorkView', 'true');
                            } else if (activeTab === 'change_connection_work' ||
                                       app.status === 'sentToPlumberForChangeConnection' ||
                                       app.status === 'plumber_accepted_change_connection' ||
                                       app.status === 'change_connection_work_submitted' ||
                                       app.status === 'change_connection_forwarded_to_fe') {
                              setShowChangeConnectionWorkView(true);
                              localStorage.setItem('plumber_showChangeConnectionWorkView', 'true');
                            } else {
                              setShowSummaryView(true);
                            }
                          }}
                        >
                          <span className="font-['Poppins',sans-serif] font-medium text-[14px] text-white">
                            View
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
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
      </div>

      {/* Summary View - Replaces entire screen */}
      {showSummaryView && selectedApplication ? (
        <div className="fixed inset-0 bg-[#f5f5fa] z-50 overflow-auto">
          <ApplicationSummaryView
            application={selectedApplication}
            onBack={() => {
              setShowSummaryView(false);
              fetchApplications(); // Refresh list when returning
            }}
            isPlumberView={true}
            onAccept={handleAccept}
            onDecline={handleDecline}
            processing={processing}
          />
        </div>
      ) : null}

      {/* Connection Details Form - Replaces entire screen */}
      {showConnectionDetails && selectedApplication ? (
        <div className="fixed inset-0 bg-[#f5f5fa] z-50 overflow-auto">
          <PlumberConnectionDetails
            application={selectedApplication}
            onBack={() => {
              setShowConnectionDetails(false);
              setSelectedApplication(null);
            }}
            onSubmit={handleConnectionDetailsSubmit}
            processing={processing}
          />
        </div>
      ) : null}

      {/* Reconnection Work View - Replaces entire screen */}
      {showReconnectionWorkView && selectedApplication ? (
        <div className="fixed inset-0 bg-[#f5f5fa] z-50 overflow-auto">
          <PlumberReconnectionWorkView
            application={selectedApplication}
            onBack={() => {
              setShowReconnectionWorkView(false);
              localStorage.setItem('plumber_showReconnectionWorkView', 'false');
              setSelectedApplication(null);
              fetchApplications();
            }}
          />
        </div>
      ) : null}

      {/* Installation Work View - Replaces entire screen */}
      {showInstallationWorkView && selectedApplication ? (
        <div className="fixed inset-0 bg-[#f5f5fa] z-50 overflow-auto">
          <PlumberInstallationWorkView
            application={selectedApplication}
            onBack={() => {
              setShowInstallationWorkView(false);
              localStorage.setItem('plumber_showInstallationWorkView', 'false');
              setSelectedApplication(null);
              fetchApplications();
            }}
          />
        </div>
      ) : null}

      {/* Disconnection Work View - Replaces entire screen */}
      {showDisconnectionWorkView && selectedApplication ? (
        <div className="fixed inset-0 bg-[#f5f5fa] z-50 overflow-auto">
          <PlumberDisconnectionWorkView
            application={selectedApplication}
            onBack={() => {
              setShowDisconnectionWorkView(false);
              localStorage.setItem('plumber_showDisconnectionWorkView', 'false');
              setSelectedApplication(null);
              fetchApplications();
            }}
            onRefresh={() => {
              fetchApplications();
              setShowDisconnectionWorkView(false);
              localStorage.setItem('plumber_showDisconnectionWorkView', 'false');
              setSelectedApplication(null);
            }}
          />
        </div>
      ) : null}

      {/* Change Connection Work View - Replaces entire screen */}
      {showChangeConnectionWorkView && selectedApplication ? (
        <div className="fixed inset-0 bg-[#f5f5fa] z-50 overflow-auto">
          <PlumberChangeConnectionWorkView
            application={selectedApplication}
            onBack={() => {
              setShowChangeConnectionWorkView(false);
              localStorage.setItem('plumber_showChangeConnectionWorkView', 'false');
              setSelectedApplication(null);
              fetchApplications();
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
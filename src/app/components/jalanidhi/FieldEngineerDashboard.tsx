import { useState, useEffect, useRef } from 'react';
import { Eye, Smartphone, RefreshCw, RotateCcw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface Application {
  id: string;
  type?: string;
  applicationNo: string;
  plumberName: string;
  applicantAs: string;
  applicantName: string;
  connectionType: string;
  status: string;
  nextStage: string;
  caseworkerComment?: string;
  caseworkerName?: string;
  forwardedTo?: string;
  forwardedAt?: string;
  // Reconnection-specific fields
  rrNumber?: string;
  ownerName?: string;
  district?: string;
  ulb?: string;
  submittedAt?: string;
  originalStatus?: string;
}

interface FieldEngineerDashboardProps {
  applicationType?: 'newConnection' | 'reconnection' | 'disconnection' | 'changeConnection';
}

export default function FieldEngineerDashboard({ applicationType = 'newConnection' }: FieldEngineerDashboardProps) {
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  const [selectedApp, setSelectedApp] = useState<string | null>(() => {
    const saved = localStorage.getItem('fieldEngineer_selectedApp');
    return saved || null;
  });

  // Track previous applicationType to trigger refetch on tab change
  const prevAppTypeRef = useRef(applicationType);

  // Persist state to localStorage
  useEffect(() => {
    if (selectedApp) {
      localStorage.setItem('fieldEngineer_selectedApp', selectedApp);
    } else {
      localStorage.removeItem('fieldEngineer_selectedApp');
    }
  }, [selectedApp]);

  useEffect(() => {
    // Clear stale localStorage cache on mount to ensure fresh data with type field
    localStorage.removeItem('fieldEngineer_applications');
    fetchApplications();
  }, []);

  // Refetch when applicationType tab changes
  useEffect(() => {
    if (prevAppTypeRef.current !== applicationType) {
      prevAppTypeRef.current = applicationType;
      fetchApplications();
    }
  }, [applicationType]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      console.log('[FIELD ENGINEER DASHBOARD] Fetching applications from API...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/field_engineer/applications`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('[FIELD ENGINEER DASHBOARD] API Error:', response.statusText);
        setAllApplications([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[FIELD ENGINEER DASHBOARD] API Response:', data);
      
      if (data.success) {
        // Transform the raw application data to match the dashboard's expected format
        const transformedApplications = (data.applications || []).map((app: any) => {
          // Determine the display status based on application state
          let displayStatus = 'Pending';
          
          const fieldVisitStatus = app.fieldVisit && app.fieldVisit.status ? app.fieldVisit.status : null;
          const hasFieldVisitReport = app.fieldVisitReport && Object.keys(app.fieldVisitReport).length > 0;
          const workflowFE = app.workflow && app.workflow.fieldEngineer ? app.workflow.fieldEngineer : null;
          
          console.log(`[FIELD ENGINEER DASHBOARD] App ${app.id} - type: ${app.type}, status: ${app.status}, fieldVisit.status: ${fieldVisitStatus}, hasReport: ${hasFieldVisitReport}`);
          
          // Priority order: Check forwarded status FIRST (most recent action)
          if (app.status === 'change_connection_forwarded_to_fe') {
            displayStatus = 'Change Connection - Work Submitted';
          } else if (app.status === 'change_connection_completed') {
            displayStatus = 'Change Connection - Completed';
          } else if (app.status === 'installation_work_submitted' || (app.currentStage === 'field_engineer_verification' && app.installationReport)) {
            displayStatus = 'Installation Work Submitted';
          } else if (app.status === 'installation_completed') {
            displayStatus = 'Installation Completed';
          } else if (app.status === 'installation_approved') {
            displayStatus = 'Installation Approved';
          } else if (app.status === 'disconnection_work_submitted' || (app.currentStage === 'field_engineer_verification' && app.disconnectionFieldReport)) {
            displayStatus = 'Disconnection Work Submitted';
          } else if (app.status === 'disconnection_completed') {
            displayStatus = 'Disconnection Completed';
          } else if (app.status === 'reconnection_work_submitted' || app.currentStage === 'field_engineer_verification') {
            displayStatus = 'Plumber Work Submitted';
          } else if (app.status === 'reconnection_completed') {
            displayStatus = 'Reconnection Completed';
          } else if (app.status === 'sentToFieldEngineerForReconnection' || app.currentStage === 'field_engineer_plumber_assignment') {
            displayStatus = 'Pending Plumber Assignment';
          } else if (app.status === 'approved') {
            displayStatus = 'Approved';
          } else if (app.status === 'rejected') {
            displayStatus = 'Rejected';
          } else if (app.status === 'sentToCommissioner' || app.currentStage === 'commissioner') {
            displayStatus = 'Sent to Commissioner';
          } else if (app.status === 'sentToRevenueOfficer' || app.currentStage === 'revenue_officer') {
            displayStatus = 'Sent to Revenue Officer';
          } else if (app.status === 'sentToCitizenForPayment' || app.status === 'pendingPayment') {
            displayStatus = 'Pending Payment';
          } else if (app.status === 'paymentCompleted') {
            displayStatus = 'Payment Completed';
          } else if (app.status === 'sentToPlumberForInstallation' || app.status === 'plumber_accepted_installation') {
            displayStatus = 'Sent to Plumber';
          } else if (app.status === 'sentToPlumberForDisconnection' || app.status === 'plumber_accepted_disconnection') {
            displayStatus = 'Sent to Plumber';
          } else if (app.status === 'sentToPlumberForReconnection' || app.status === 'plumber_accepted_reconnection') {
            displayStatus = 'Sent to Plumber';
          } else if (hasFieldVisitReport) {
            displayStatus = 'Site Visit Done';
          } else if (fieldVisitStatus === 'completed') {
            displayStatus = 'Site Visit Done';
          } else if (fieldVisitStatus === 'scheduled') {
            displayStatus = 'Site Visit Scheduled';
          } else if (app.status === 'sentToFieldEngineer' || (workflowFE && workflowFE.status === 'pending')) {
            // For disconnection apps, they come from Caseworker directly
            if (app.type === 'disconnection') {
              displayStatus = 'Received from Caseworker';
            } else {
              displayStatus = 'Received from Revenue Officer';
            }
          }
          
          console.log(`[FIELD ENGINEER DASHBOARD] App ${app.id} - Final displayStatus: ${displayStatus}`);
          
          // Extract reconnection-specific fields
          const rrData = app.rrData || {};
          
          return {
            id: app.id,
            type: app.type || 'newConnection',
            applicationNo: app.id || 'N/A',
            plumberName: app.plumberDetails && app.plumberDetails.plumberName ? app.plumberDetails.plumberName : 'N/A',
            applicantAs: app.propertyDetails && app.propertyDetails.ownershipType ? app.propertyDetails.ownershipType : 'N/A',
            applicantName: app.applicantDetails && app.applicantDetails.applicantName ? app.applicantDetails.applicantName : 'N/A',
            connectionType: app.connectionDetails && app.connectionDetails.connectionType ? app.connectionDetails.connectionType : (rrData.connectionType || 'N/A'),
            status: displayStatus,
            nextStage: (app.workflow && app.workflow.caseworker && app.workflow.caseworker.forwardedTo) ? app.workflow.caseworker.forwardedTo : 'Field Engineer',
            caseworkerComment: (app.workflow && app.workflow.caseworker && app.workflow.caseworker.comments) ? app.workflow.caseworker.comments : '',
            caseworkerName: (app.workflow && app.workflow.caseworker && app.workflow.caseworker.name) ? app.workflow.caseworker.name : '',
            forwardedTo: (app.workflow && app.workflow.caseworker && app.workflow.caseworker.forwardedTo) ? app.workflow.caseworker.forwardedTo : '',
            forwardedAt: (app.workflow && app.workflow.caseworker && app.workflow.caseworker.timestamp) ? app.workflow.caseworker.timestamp : '',
            // Reconnection-specific fields
            rrNumber: app.rrNumber || '',
            ownerName: rrData.ownerName || (app.applicantDetails && app.applicantDetails.applicantName ? app.applicantDetails.applicantName : 'N/A'),
            district: rrData.district || (app.propertyDetails && app.propertyDetails.district ? app.propertyDetails.district : 'N/A'),
            ulb: rrData.ulb || (app.propertyDetails && app.propertyDetails.ulb ? app.propertyDetails.ulb : 'N/A'),
            submittedAt: app.submittedAt || '',
            originalStatus: app.status || '',
          };
        });
        
        setAllApplications(transformedApplications);
        console.log('[FIELD ENGINEER DASHBOARD] Loaded applications:', transformedApplications.length);
        console.log('[FIELD ENGINEER DASHBOARD] Transformed applications:', transformedApplications);
      } else {
        console.error('[FIELD ENGINEER DASHBOARD] API Error:', data.error);
        setAllApplications([]);
      }
    } catch (error) {
      console.error('[FIELD ENGINEER DASHBOARD] Error fetching applications:', error);
      setAllApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter applications by type
  const applications = allApplications.filter(app => {
    if (applicationType === 'reconnection') {
      return app.type === 'reconnection';
    } else if (applicationType === 'disconnection') {
      return app.type === 'disconnection';
    } else if (applicationType === 'changeConnection') {
      return app.type === 'changeConnection';
    } else {
      // newConnection: show apps without type (legacy) or with newConnection type
      return !app.type || app.type === 'newConnection';
    }
  });

  // Sort: latest applications first
  const sortedApplications = [...applications].sort((a, b) => {
    const dateA = new Date(a.submittedAt || 0).getTime();
    const dateB = new Date(b.submittedAt || 0).getTime();
    return dateB - dateA;
  });

  const handleView = (appId: string, appType?: string) => {
    // Navigate to the correct view based on application type and status
    const app = allApplications.find(a => a.id === appId);
    const isInstallationStatus = app && (
      app.status === 'Installation Work Submitted' ||
      app.status === 'Installation Completed'
    );

    if (appType === 'disconnection') {
      const event = new CustomEvent('navigate', { detail: `/jalanidhi/field-engineer/tap-connection/disconnection/view/${appId}` });
      window.dispatchEvent(event);
    } else if (appType === 'reconnection') {
      const event = new CustomEvent('navigate', { detail: `/jalanidhi/field-engineer/tap-connection/reconnection/view/${appId}` });
      window.dispatchEvent(event);
    } else if (appType === 'changeConnection') {
      // Route to verify view if plumber has forwarded work for final verification
      const isChangeConnectionVerify = app && app.originalStatus && (
        app.originalStatus === 'change_connection_forwarded_to_fe' ||
        app.originalStatus === 'change_connection_completed'
      );
      if (isChangeConnectionVerify) {
        const event = new CustomEvent('navigate', { detail: `/jalanidhi/field-engineer/tap-connection/change-connection/verify/${appId}` });
        window.dispatchEvent(event);
      } else {
        const event = new CustomEvent('navigate', { detail: `/jalanidhi/field-engineer/tap-connection/change-connection/view/${appId}` });
        window.dispatchEvent(event);
      }
    } else if (isInstallationStatus) {
      const event = new CustomEvent('navigate', { detail: `/jalanidhi/field-engineer/tap-connection/installation/view/${appId}` });
      window.dispatchEvent(event);
    } else {
      const event = new CustomEvent('navigate', { detail: `/jalanidhi/field-engineer/tap-connection/view/${appId}` });
      window.dispatchEvent(event);
    }
  };

  const handleDebugCheck = async () => {
    const searchTerm = prompt('Enter Application No or ID to debug (e.g., TAP-1770544219816-P75KWS):');
    if (!searchTerm) return;
    
    try {
      console.log('[DEBUG] Checking application:', searchTerm);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/debug/application/${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      const data = await response.json();
      console.log('[DEBUG] Response:', data);
      
      if (data.success) {
        alert(`✅ Application Found!\n\nID: ${data.application.id}\nApplication No: ${data.application.applicationNo}\nStatus: ${data.application.status}\nField Visit Status: ${(data.application.fieldVisit && data.application.fieldVisit.status) || 'N/A'}\nHas Report: ${!!data.application.fieldVisitReport}\n\nCheck console for full details.`);
      } else {
        alert(`❌ Application Not Found\n\n${data.error}\n\nCheck console for available applications.`);
      }
    } catch (error) {
      console.error('[DEBUG] Error:', error);
      alert(`❌ Error: ${error}`);
    }
  };

  const handleRemoveFromFE = async () => {
    const applicationId = prompt('Enter Application No or ID to remove from Field Engineer queue (e.g., TAP-1770544219816-P75KWS):');
    if (!applicationId) return;
    
    if (!confirm(`Are you sure you want to remove application ${applicationId} from Field Engineer queue and send it back to Revenue Officer?`)) {
      return;
    }
    
    try {
      console.log('[REMOVE FROM FE] Removing application:', applicationId);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/remove-from-field-engineer`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ applicationId }),
        }
      );
      
      const data = await response.json();
      console.log('[REMOVE FROM FE] Response:', data);
      
      if (data.success) {
        alert(`✅ Success!\n\nApplication ${data.applicationNo} has been:\n- Removed from Field Engineer queue\n- Sent back to Revenue Officer\n- Status changed to: ${data.newStatus}\n\nYou can now forward it again from Revenue Officer.`);
        // Refresh the applications list
        fetchApplications();
      } else {
        alert(`❌ Error\n\n${data.error}`);
      }
    } catch (error) {
      console.error('[REMOVE FROM FE] Error:', error);
      alert(`❌ Error: ${error}`);
    }
  };

  const handleAddFieldReport = async () => {
    const applicationId = prompt('Enter Application No or ID to add a test field visit report:');
    if (!applicationId) return;
    
    if (!confirm(`Add a test field visit report to application ${applicationId}?`)) {
      return;
    }
    
    try {
      console.log('[ADD REPORT] Adding field visit report:', applicationId);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/dev/add-field-visit-report`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ applicationId }),
        }
      );
      
      const data = await response.json();
      console.log('[ADD REPORT] Response:', data);
      
      if (data.success) {
        alert(`✅ Success!\n\nField visit report added to application ${data.application.id}\n\nStatus: ${data.application.status}\nField Visit Status: ${data.application.fieldVisit.status}\nHas Report: ${data.application.hasFieldVisitReport}\n\nRefreshing dashboard...`);
        // Refresh the applications list
        fetchApplications();
      } else {
        alert(`❌ Error\n\n${data.error}`);
      }
    } catch (error) {
      console.error('[ADD REPORT] Error:', error);
      alert(`❌ Error: ${error}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-['Poppins',sans-serif]">Loading applications...</p>
        </div>
      </div>
    );
  }

  const isReconnection = applicationType === 'reconnection';
  const isDisconnection = applicationType === 'disconnection';
  const isChangeConnection = applicationType === 'changeConnection';
  const showRRColumns = isReconnection || isDisconnection || isChangeConnection;

  return (
    <div className="p-6">
      {/* Header with Mobile App Button */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
            {applicationType === 'reconnection' ? 'Tap Reconnection Requests' : 
             applicationType === 'disconnection' ? 'Tap Disconnection Requests' : 
             applicationType === 'changeConnection' ? 'Change of Connection Type Requests' :
             'New Connection Requests'}
          </h1>
          <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
            {applicationType === 'reconnection' ? 'Review and verify tap reconnection applications' : 
             applicationType === 'disconnection' ? 'Review and verify tap disconnection applications' : 
             applicationType === 'changeConnection' ? 'Review, assign plumber and schedule field verification' :
             'Review and schedule field verification'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchApplications}
            className="flex items-center gap-2 px-4 py-2 bg-[#1f3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors font-['Poppins',sans-serif] text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Title Bar */}
        <div className="bg-[#1f3a5f] px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-white leading-7">
            {applicationType === 'reconnection' ? 'Reconnection Requests' : 
             applicationType === 'disconnection' ? 'Disconnection Requests' : 
             applicationType === 'changeConnection' ? 'Change Connection Requests' :
             'New Connection Requests'}
          </h2>
        </div>
        {sortedApplications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 font-['Poppins',sans-serif]">No applications found</p>
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
                  {showRRColumns ? (
                    <>
                      <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[150px]">
                        RR Number
                      </th>
                      <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">
                        Owner Name
                      </th>
                      <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[150px]">
                        District
                      </th>
                      <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[150px]">
                        Connection Type
                      </th>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[160px]">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[80px]">
                    Queue
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[120px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {sortedApplications.map((app, index) => (
                  <tr key={app.id} className="border-b border-[#e5e7eb] hover:bg-[#f8f9fb] transition-colors">
                    <td className="px-6 py-4 text-center font-['Poppins',sans-serif] text-[14px] font-medium text-[#414141]">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] font-medium text-[#06c]">
                      {app.applicationNo}
                    </td>
                    {showRRColumns ? (
                      <>
                        <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                          {app.rrNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#170f49] font-medium">
                          {app.ownerName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                          {app.district || 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                          {app.connectionType}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                          {app.plumberName}
                        </td>
                        <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                          {app.applicantAs}
                        </td>
                        <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#170f49] font-medium">
                          {app.applicantName}
                        </td>
                        <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                          {app.connectionType}
                        </td>
                      </>
                    )}
                    {/* Status Column */}
                    <td className="px-6 py-4 text-left">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-['Poppins',sans-serif] ${
                        app.status === 'Site Visit Done' 
                          ? 'bg-green-100 text-green-800' 
                          : app.status === 'Received from Revenue Officer'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : app.status === 'Received from Caseworker'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : app.status === 'Site Visit Scheduled'
                          ? 'bg-yellow-100 text-yellow-800'
                          : app.status === 'Plumber Work Submitted'
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : app.status === 'Reconnection Completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : app.status === 'Installation Work Submitted'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : app.status === 'Installation Completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : app.status === 'Disconnection Work Submitted'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : app.status === 'Disconnection Completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : app.status === 'Change Connection - Work Submitted'
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : app.status === 'Change Connection - Completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : app.status === 'Sent to Commissioner'
                          ? 'bg-green-100 text-green-800'
                          : app.status === 'Sent to Revenue Officer'
                          ? 'bg-purple-100 text-purple-800'
                          : app.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : app.status === 'Rejected'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : app.status === 'Pending Payment'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : app.status === 'Payment Completed'
                          ? 'bg-teal-100 text-teal-800 border border-teal-200'
                          : app.status === 'Sent to Plumber'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : app.status === 'Installation Approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : app.status === 'Pending Plumber Assignment'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    {/* Queue Column */}
                    <td className="px-6 py-4 text-left">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-['Poppins',sans-serif] ${
                        app.status === 'Plumber Work Submitted' || app.status === 'Installation Work Submitted' || app.status === 'Disconnection Work Submitted' || app.status === 'Change Connection - Work Submitted'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status === 'Reconnection Completed' || app.status === 'Installation Completed' || app.status === 'Disconnection Completed' || app.status === 'Approved' || app.status === 'Installation Approved' || app.status === 'Change Connection - Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : app.status === 'Sent to Commissioner'
                          ? 'bg-green-100 text-green-800'
                          : app.status === 'Sent to Revenue Officer'
                          ? 'bg-purple-100 text-purple-800'
                          : app.status === 'Pending Payment' || app.status === 'Payment Completed'
                          ? 'bg-amber-100 text-amber-800'
                          : app.status === 'Sent to Plumber'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {app.status === 'Plumber Work Submitted' || app.status === 'Installation Work Submitted' || app.status === 'Disconnection Work Submitted' || app.status === 'Change Connection - Work Submitted'
                          ? 'Field Engineer'
                          : app.status === 'Reconnection Completed' || app.status === 'Installation Completed' || app.status === 'Disconnection Completed' || app.status === 'Approved' || app.status === 'Installation Approved' || app.status === 'Change Connection - Completed'
                          ? 'Completed'
                          : app.status === 'Rejected'
                          ? 'Rejected'
                          : app.status === 'Sent to Commissioner'
                          ? 'Commissioner'
                          : app.status === 'Sent to Revenue Officer'
                          ? 'Revenue Officer'
                          : app.status === 'Pending Payment' || app.status === 'Payment Completed'
                          ? 'Citizen'
                          : app.status === 'Sent to Plumber'
                          ? 'Plumber'
                          : 'Field Engineer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleView(app.id, app.type)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1f3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors font-['Poppins',sans-serif] text-sm font-medium mx-auto"
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
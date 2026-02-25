import { useState, useEffect, useRef } from 'react';
import { Eye } from 'lucide-react';
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
}

interface RevenueOfficerDashboardProps {
  applicationType?: 'newConnection' | 'reconnection' | 'disconnection' | 'changeConnection';
}

export default function RevenueOfficerDashboard({ applicationType = 'newConnection' }: RevenueOfficerDashboardProps) {
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);
  
  // Track previous applicationType to trigger refetch on tab change
  const prevAppTypeRef = useRef(applicationType);

  useEffect(() => {
    // Clear old localStorage cache on mount
    localStorage.removeItem('revenueOfficer_applications');
    
    fetchApplications(true);
    
    // Set up auto-refresh every 10 seconds to catch new applications
    const interval = setInterval(() => fetchApplications(false), 10000);
    return () => clearInterval(interval);
  }, []);

  // Refetch when applicationType tab changes
  useEffect(() => {
    if (prevAppTypeRef.current !== applicationType) {
      prevAppTypeRef.current = applicationType;
      fetchApplications(true);
    }
  }, [applicationType]);

  const fetchApplications = async (isInitial: boolean) => {
    // Skip if a fetch is already in progress (use ref for accurate check in intervals)
    if (isFetchingRef.current) {
      console.log('[REVENUE OFFICER DASHBOARD] Skipping fetch - already in progress');
      return;
    }
    
    try {
      isFetchingRef.current = true;
      setIsFetching(true);
      if (isInitial) {
        setLoading(true);
      }
      setFetchError(null);
      console.log('[REVENUE OFFICER DASHBOARD] Fetching applications from API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/revenue_officer/applications`,
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
        console.error('[REVENUE OFFICER DASHBOARD] API Error:', response.statusText);
        setFetchError('Server returned an error: ' + response.statusText);
        if (isInitial) {
          setAllApplications([]);
        }
        setLoading(false);
        setIsFetching(false);
        isFetchingRef.current = false;
        return;
      }

      const data = await response.json();
      console.log('[REVENUE OFFICER DASHBOARD] API Response:', data);
      
      if (data.success) {
        // Transform the raw application data to match the dashboard's expected format
        const transformedApplications = (data.applications || []).map((app: any) => ({
          id: app.id,
          type: app.type || 'newConnection',
          applicationNo: app.id || 'N/A',
          plumberName: app.plumberDetails && app.plumberDetails.plumberName ? app.plumberDetails.plumberName : 'N/A',
          applicantAs: app.propertyDetails && app.propertyDetails.ownershipType ? app.propertyDetails.ownershipType : 'N/A',
          applicantName: app.applicantDetails && app.applicantDetails.applicantName ? app.applicantDetails.applicantName : 'N/A',
          connectionType: app.connectionDetails && app.connectionDetails.connectionType ? app.connectionDetails.connectionType : 'N/A',
          status: app.status || 'sentToRevenueOfficer',
          nextStage: (app.workflow && app.workflow.caseworker && app.workflow.caseworker.forwardedTo) || (app.workflow && app.workflow.fieldEngineer && app.workflow.fieldEngineer.forwardedTo) || 'Revenue Officer',
          caseworkerComment: app.workflow && app.workflow.caseworker && app.workflow.caseworker.comments ? app.workflow.caseworker.comments : '',
          caseworkerName: app.workflow && app.workflow.caseworker && app.workflow.caseworker.name ? app.workflow.caseworker.name : '',
          forwardedTo: (app.workflow && app.workflow.caseworker && app.workflow.caseworker.forwardedTo) || (app.workflow && app.workflow.fieldEngineer && app.workflow.fieldEngineer.forwardedTo) || '',
          forwardedAt: (app.workflow && app.workflow.caseworker && app.workflow.caseworker.timestamp) || (app.workflow && app.workflow.fieldEngineer && app.workflow.fieldEngineer.timestamp) || '',
          // Reconnection-specific fields
          rrNumber: app.rrNumber || '',
          ownerName: app.rrData && app.rrData.ownerName ? app.rrData.ownerName : (app.applicantDetails && app.applicantDetails.applicantName ? app.applicantDetails.applicantName : 'N/A'),
          district: app.rrData && app.rrData.district ? app.rrData.district : (app.propertyDetails && app.propertyDetails.district ? app.propertyDetails.district : 'N/A'),
          ulb: app.rrData && app.rrData.ulb ? app.rrData.ulb : (app.propertyDetails && app.propertyDetails.ulb ? app.propertyDetails.ulb : 'N/A'),
          submittedAt: app.submittedAt || '',
        }));
        
        setAllApplications(transformedApplications);
        console.log('[REVENUE OFFICER DASHBOARD] Loaded applications:', transformedApplications.length);
        console.log('[REVENUE OFFICER DASHBOARD] Transformed applications:', transformedApplications);
      } else {
        console.error('[REVENUE OFFICER DASHBOARD] API Error:', data.error);
        setFetchError('API Error: ' + (data.error || 'Unknown error'));
        if (isInitial) {
          setAllApplications([]);
        }
      }
    } catch (error) {
      if (error && (error as any).name === 'AbortError') {
        console.log('[REVENUE OFFICER DASHBOARD] Fetch request timed out');
        setFetchError('Request timed out. Click Refresh to try again.');
      } else {
        console.error('[REVENUE OFFICER DASHBOARD] Error fetching applications:', error);
        setFetchError('Network error. The server may be temporarily unavailable.');
      }
      if (isInitial) {
        setAllApplications([]);
      }
    } finally {
      setLoading(false);
      setIsFetching(false);
      isFetchingRef.current = false;
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
    // Navigate to the correct view based on application type
    if (appType === 'reconnection') {
      const event = new CustomEvent('navigate', { detail: `/jalanidhi/revenue-officer/tap-connection/reconnection/view/${appId}` });
      window.dispatchEvent(event);
    } else if (appType === 'changeConnection') {
      const event = new CustomEvent('navigate', { detail: `/jalanidhi/revenue-officer/tap-connection/change-connection/view/${appId}` });
      window.dispatchEvent(event);
    } else {
      const event = new CustomEvent('navigate', { detail: `/jalanidhi/revenue-officer/tap-connection/view/${appId}` });
      window.dispatchEvent(event);
    }
  };

  const isReconnection = applicationType === 'reconnection';
  const isChangeConnection = applicationType === 'changeConnection';
  const useRRColumns = isReconnection || isChangeConnection;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
            {applicationType === 'reconnection' ? 'Tap Reconnection Requests' : 
             applicationType === 'disconnection' ? 'Tap Disconnection Requests' : 
             applicationType === 'changeConnection' ? 'Change Connection Requests' : 
             'New Connection Requests'}
          </h1>
          <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
            {applicationType === 'reconnection' ? 'Review and approve reconnection applications' : 
             applicationType === 'disconnection' ? 'Review and approve disconnection applications' : 
             applicationType === 'changeConnection' ? 'Review and approve change connection applications' : 
             'Review and approve applications'}
          </p>
        </div>
        <button
          onClick={() => fetchApplications(true)}
          disabled={isFetching}
          className="px-4 py-2 bg-[#1f3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors font-['Poppins',sans-serif] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFetching ? 'Loading...' : 'Refresh'}
        </button>
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
            <p className="text-gray-500 font-['Poppins',sans-serif]">
              {loading ? 'Loading applications...' : 'No applications found'}
            </p>
            {fetchError && (
              <p className="text-red-500 font-['Poppins',sans-serif] mt-2">
                {fetchError}
              </p>
            )}
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
                  {useRRColumns ? (
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
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[140px]">
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
                    {useRRColumns ? (
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
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-['Poppins',sans-serif] ${
                        app.status === 'sentToFieldEngineer' || app.status === 'fieldVisitScheduled'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : app.status === 'sentToCommissioner'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : app.status === 'sentToRevenueOfficer'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : app.status === 'sentToCitizenForPayment' || app.status === 'pendingPayment'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : app.status === 'paymentCompleted'
                          ? 'bg-teal-100 text-teal-800 border border-teal-200'
                          : app.status === 'approved' || app.status === 'installation_completed' || app.status === 'installation_approved' || app.status === 'reconnection_completed' || app.status === 'disconnection_completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : app.status === 'rejected'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : app.status === 'installation_work_submitted' || app.status === 'reconnection_work_submitted' || app.status === 'disconnection_work_submitted'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {app.status === 'sentToFieldEngineer' ? 'Sent to Field Engineer'
                          : app.status === 'fieldVisitScheduled' ? 'Field Visit Scheduled'
                          : app.status === 'sentToCommissioner' ? 'Sent to Commissioner'
                          : app.status === 'sentToRevenueOfficer' ? 'Pending Review'
                          : app.status === 'sentToCitizenForPayment' || app.status === 'pendingPayment' ? 'Pending Payment'
                          : app.status === 'paymentCompleted' ? 'Payment Completed'
                          : app.status === 'approved' ? 'Approved'
                          : app.status === 'rejected' ? 'Rejected'
                          : app.status === 'installation_approved' ? 'Installation Approved'
                          : app.status === 'installation_completed' || app.status === 'reconnection_completed' || app.status === 'disconnection_completed' ? 'Completed'
                          : app.status === 'installation_work_submitted' || app.status === 'reconnection_work_submitted' || app.status === 'disconnection_work_submitted' ? 'Plumber Work Submitted'
                          : app.status === 'sentToPlumberForInstallation' || app.status === 'sentToPlumberForReconnection' || app.status === 'sentToPlumberForDisconnection' || app.status === 'plumber_accepted_installation' || app.status === 'plumber_accepted_reconnection' || app.status === 'plumber_accepted_disconnection' ? 'With Plumber'
                          : 'Pending Review'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-[14px] text-gray-700 font-['Poppins',sans-serif]">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-['Poppins',sans-serif] ${
                        app.status === 'sentToRevenueOfficer'
                          ? 'bg-orange-100 text-orange-800'
                          : app.status === 'sentToFieldEngineer' || app.status === 'fieldVisitScheduled' || app.status === 'installation_work_submitted' || app.status === 'reconnection_work_submitted' || app.status === 'disconnection_work_submitted'
                          ? 'bg-indigo-100 text-indigo-800'
                          : app.status === 'sentToCommissioner'
                          ? 'bg-green-100 text-green-800'
                          : app.status === 'approved' || app.status === 'installation_completed' || app.status === 'installation_approved' || app.status === 'reconnection_completed' || app.status === 'disconnection_completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {app.status === 'sentToRevenueOfficer' ? 'Revenue Officer'
                          : app.status === 'sentToFieldEngineer' || app.status === 'fieldVisitScheduled' || app.status === 'installation_work_submitted' || app.status === 'reconnection_work_submitted' || app.status === 'disconnection_work_submitted' ? 'Field Engineer'
                          : app.status === 'sentToCommissioner' ? 'Commissioner'
                          : app.status === 'sentToCitizenForPayment' || app.status === 'pendingPayment' || app.status === 'paymentCompleted' ? 'Citizen'
                          : app.status === 'sentToPlumberForInstallation' || app.status === 'sentToPlumberForReconnection' || app.status === 'sentToPlumberForDisconnection' || app.status === 'plumber_accepted_installation' || app.status === 'plumber_accepted_reconnection' || app.status === 'plumber_accepted_disconnection' ? 'Plumber'
                          : app.status === 'approved' || app.status === 'installation_completed' || app.status === 'installation_approved' || app.status === 'reconnection_completed' || app.status === 'disconnection_completed' ? 'Completed'
                          : app.status === 'rejected' ? 'Rejected'
                          : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
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
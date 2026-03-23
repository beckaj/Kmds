import { useState, useEffect, useRef } from 'react';
import { Eye } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../../../utils/supabase/info';
import SectionTitle from '../../SectionTitle';

interface ReconnectionApplication {
  id: string;
  type: 'reconnection';
  applicationNo: string;
  rrNumber: string;
  ownerName: string;
  district: string;
  ulb: string;
  connectionType: string;
  status: string;
  nextStage: string;
  caseworkerComment?: string;
  caseworkerName?: string;
  forwardedTo?: string;
  forwardedAt?: string;
  submittedAt?: string;
}

export default function RevenueOfficerReconnectionDashboard() {
  const [applications, setApplications] = useState<ReconnectionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // Clear old localStorage cache on mount
    localStorage.removeItem('revenueOfficer_reconnection_applications');
    
    fetchApplications(true);
    
    // Set up auto-refresh every 10 seconds to catch new applications
    const interval = setInterval(() => fetchApplications(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchApplications = async (isInitial: boolean) => {
    // Skip if a fetch is already in progress (use ref for accurate check in intervals)
    if (isFetchingRef.current) {
      console.log('[RO RECONNECTION DASHBOARD] Skipping fetch - already in progress');
      return;
    }
    
    try {
      isFetchingRef.current = true;
      setIsFetching(true);
      if (isInitial) {
        setLoading(true);
      }
      setFetchError(null);
      console.log('[RO RECONNECTION DASHBOARD] Fetching reconnection applications from API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/revenue_officer/applications?type=reconnection`,
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
        console.error('[RO RECONNECTION DASHBOARD] API Error:', response.statusText);
        setFetchError('Server returned an error: ' + response.statusText);
        if (isInitial) {
          setApplications([]);
        }
        setLoading(false);
        setIsFetching(false);
        isFetchingRef.current = false;
        return;
      }

      const data = await response.json();
      console.log('[RO RECONNECTION DASHBOARD] API Response:', data);
      
      if (data.success) {
        // Filter and transform reconnection applications
        const reconnectionApps = (data.applications || [])
          .filter((app: any) => app.type === 'reconnection')
          .map((app: any) => ({
            id: app.id,
            type: 'reconnection' as const,
            applicationNo: app.id || 'N/A',
            rrNumber: app.rrNumber || 'N/A',
            ownerName: app.rrData && app.rrData.ownerName ? app.rrData.ownerName : 'N/A',
            district: app.rrData && app.rrData.district ? app.rrData.district : 'N/A',
            ulb: app.rrData && app.rrData.ulb ? app.rrData.ulb : 'N/A',
            connectionType: app.rrData && app.rrData.connectionType ? app.rrData.connectionType : 'Domestic',
            status: app.status || 'sentToRevenueOfficer',
            nextStage: (app.workflow && app.workflow.caseworker && app.workflow.caseworker.forwardedTo) || 'Revenue Officer',
            caseworkerComment: app.workflow && app.workflow.caseworker && app.workflow.caseworker.comments ? app.workflow.caseworker.comments : '',
            caseworkerName: app.workflow && app.workflow.caseworker && app.workflow.caseworker.name ? app.workflow.caseworker.name : '',
            forwardedTo: (app.workflow && app.workflow.caseworker && app.workflow.caseworker.forwardedTo) || '',
            forwardedAt: (app.workflow && app.workflow.caseworker && app.workflow.caseworker.timestamp) || '',
            submittedAt: app.submittedAt || '',
          }));
        
        setApplications(reconnectionApps);
        console.log('[RO RECONNECTION DASHBOARD] Loaded reconnection applications:', reconnectionApps.length);
      } else {
        console.error('[RO RECONNECTION DASHBOARD] API Error:', data.error);
        setFetchError('API Error: ' + (data.error || 'Unknown error'));
        if (isInitial) {
          setApplications([]);
        }
      }
    } catch (error) {
      if (error && (error as any).name === 'AbortError') {
        console.log('[RO RECONNECTION DASHBOARD] Fetch request timed out');
        setFetchError('Request timed out. Click Refresh to try again.');
      } else {
        console.error('[RO RECONNECTION DASHBOARD] Error fetching applications:', error);
        setFetchError('Network error. The server may be temporarily unavailable.');
      }
      if (isInitial) {
        setApplications([]);
      }
    } finally {
      setLoading(false);
      setIsFetching(false);
      isFetchingRef.current = false;
    }
  };

  // Sort: latest applications first
  const sortedApplications = [...applications].sort((a, b) => {
    const dateA = new Date(a.submittedAt || 0).getTime();
    const dateB = new Date(b.submittedAt || 0).getTime();
    return dateB - dateA;
  });

  const handleView = (appId: string) => {
    const event = new CustomEvent('navigate', { detail: `/jalanidhi/revenue-officer/tap-connection/reconnection/view/${appId}` });
    window.dispatchEvent(event);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <SectionTitle title="TAP RECONNECTION REQUESTS" />
          <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-3">
            Review and approve tap reconnection applications forwarded by caseworker
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
            Reconnection Applications
          </h2>
        </div>
        {sortedApplications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 font-['Poppins',sans-serif]">
              {loading ? 'Loading applications...' : 'No reconnection applications found'}
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
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                      {app.rrNumber}
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#170f49] font-medium">
                      {app.ownerName}
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                      {app.district}
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                      {app.connectionType}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-['Poppins',sans-serif] ${
                        app.status === 'sentToFieldEngineer' || app.status === 'fieldVisitScheduled'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : app.status === 'sentToCommissioner'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : app.status === 'sentToRevenueOfficer'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : app.status === 'reconnection_completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : app.status === 'reconnection_work_submitted'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : app.status === 'sentToPlumberForReconnection' || app.status === 'plumber_accepted_reconnection'
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {app.status === 'sentToFieldEngineer' ? 'Sent to Field Engineer'
                          : app.status === 'fieldVisitScheduled' ? 'Field Visit Scheduled'
                          : app.status === 'sentToCommissioner' ? 'Sent to Commissioner'
                          : app.status === 'sentToRevenueOfficer' ? 'Pending Review'
                          : app.status === 'reconnection_completed' ? 'Reconnection Completed'
                          : app.status === 'reconnection_work_submitted' ? 'Plumber Work Submitted'
                          : app.status === 'sentToPlumberForReconnection' || app.status === 'plumber_accepted_reconnection' ? 'With Plumber'
                          : 'Pending Review'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-[14px] text-gray-700 font-['Poppins',sans-serif]">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-['Poppins',sans-serif] ${
                        app.status === 'sentToRevenueOfficer'
                          ? 'bg-orange-100 text-orange-800'
                          : app.status === 'sentToFieldEngineer' || app.status === 'fieldVisitScheduled' || app.status === 'reconnection_work_submitted'
                          ? 'bg-indigo-100 text-indigo-800'
                          : app.status === 'sentToCommissioner'
                          ? 'bg-green-100 text-green-800'
                          : app.status === 'reconnection_completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'sentToPlumberForReconnection' || app.status === 'plumber_accepted_reconnection'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {app.status === 'sentToRevenueOfficer' ? 'Revenue Officer'
                          : app.status === 'sentToFieldEngineer' || app.status === 'fieldVisitScheduled' || app.status === 'reconnection_work_submitted' ? 'Field Engineer'
                          : app.status === 'sentToCommissioner' ? 'Commissioner'
                          : app.status === 'sentToPlumberForReconnection' || app.status === 'plumber_accepted_reconnection' ? 'Plumber'
                          : app.status === 'reconnection_completed' ? 'Completed'
                          : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleView(app.id)}
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
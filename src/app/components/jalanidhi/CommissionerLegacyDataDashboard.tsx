import { useState, useEffect } from 'react';
import { Eye, RefreshCw, Database, Search } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface LegacyApplication {
  id: string;
  applicantType: string;
  applicantName: string;
  connectionType: string;
  status: string;
  currentStage: string;
  submittedAt: string;
  rrNumber: string;
  feComments: string;
}

interface CommissionerLegacyDataDashboardProps {
  onViewApplication: (appId: string) => void;
}

export default function CommissionerLegacyDataDashboard({ onViewApplication }: CommissionerLegacyDataDashboardProps) {
  const [applications, setApplications] = useState<LegacyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      console.log('[COMMISSIONER LEGACY] Fetching legacy data applications for Commissioner...');

      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/legacy-data/applications?stage=commissioner',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + publicAnonKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('[COMMISSIONER LEGACY] API Error:', response.statusText);
        setApplications([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[COMMISSIONER LEGACY] API Response:', data);

      if (data.success) {
        const transformed = (data.applications || []).map((app: any) => {
          const locDetails = app && app.locationDetails ? app.locationDetails : {};
          const existConn = app && app.existingConnection ? app.existingConnection : {};
          const wf = app && app.workflow ? app.workflow : {};
          const feWf = wf && wf.fieldEngineer ? wf.fieldEngineer : {};

          let displayStatus = 'Pending Review';
          if (app.status === 'fe_verified') {
            displayStatus = 'Pending Commissioner Review';
          } else if (app.status === 'approved') {
            displayStatus = 'Approved';
          } else if (app.status === 'rejected') {
            displayStatus = 'Rejected';
          } else if (app.status === 'sent_to_citizen') {
            displayStatus = 'Sent to Applicant';
          }

          return {
            id: app.id || 'N/A',
            applicantType: app.applicantType || 'N/A',
            applicantName: locDetails.fullName || 'N/A',
            connectionType: existConn.connectionType || 'N/A',
            status: displayStatus,
            currentStage: 'Commissioner',
            submittedAt: app.submittedAt || '',
            rrNumber: existConn.rrNumber || 'N/A',
            feComments: feWf.comments || 'N/A',
          };
        });

        transformed.sort((a: LegacyApplication, b: LegacyApplication) => {
          const dateA = new Date(a.submittedAt || 0).getTime();
          const dateB = new Date(b.submittedAt || 0).getTime();
          return dateB - dateA;
        });

        setApplications(transformed);
        console.log('[COMMISSIONER LEGACY] Loaded:', transformed.length);
      } else {
        console.error('[COMMISSIONER LEGACY] Error:', data.error);
        setApplications([]);
      }
    } catch (error) {
      console.error('[COMMISSIONER LEGACY] Fetch error:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.id.toLowerCase().includes(q) ||
      app.applicantName.toLowerCase().includes(q) ||
      app.rrNumber.toLowerCase().includes(q)
    );
  });

  const getStatusBadgeClass = (status: string) => {
    if (status.includes('Approved')) return 'bg-green-100 text-green-800';
    if (status.includes('Rejected')) return 'bg-red-100 text-red-800';
    if (status.includes('Pending')) return 'bg-yellow-100 text-yellow-800';
    if (status.includes('Sent to Applicant')) return 'bg-emerald-100 text-emerald-800';
    return 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-['Poppins',sans-serif]">Loading legacy data applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
            <Database className="w-6 h-6" />
            Legacy Data Applications
          </h1>
          <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
            Review and approve legacy data entries forwarded by Field Engineer
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

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4 flex items-end gap-4">
        <div className="flex-1 max-w-[400px]">
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5 font-['Poppins',sans-serif]">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, Name, or RR Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-[14px] font-['Poppins',sans-serif] border-[1.5px] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Title Bar */}
        <div className="bg-[#1f3a5f] px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-white leading-7">
            Legacy Data Applications
          </h2>
        </div>
        {filteredApplications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-['Poppins',sans-serif]">No legacy data applications pending review</p>
            <p className="text-sm text-gray-400 font-['Poppins',sans-serif] mt-1">Applications verified by Field Engineer will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '1100px' }}>
              <thead className="bg-[#f8f9fa] border-b border-[#e5e7eb]">
                <tr>
                  <th className="px-6 py-5 text-center font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[60px]">
                    Sl.No
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[200px]">
                    Application No
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">
                    Applicant Name
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[130px]">
                    RR Number
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[160px]">
                    Connection Type
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[100px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredApplications.map((app, index) => (
                  <tr key={app.id} className="border-b border-[#e5e7eb] hover:bg-[#f8f9fb] transition-colors">
                    <td className="px-6 py-4 text-center font-['Poppins',sans-serif] text-[14px] font-medium text-[#414141]">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] font-medium text-[#06c]">
                      {app.id}
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#170f49] font-medium">
                      {app.applicantName}
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                      {app.rrNumber}
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                      {app.connectionType}
                    </td>
                    <td className="px-6 py-4">
                      <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-medium font-[\'Poppins\',sans-serif] border ' + getStatusBadgeClass(app.status)}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onViewApplication(app.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1f3a5f] text-white rounded-[8px] font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-[#2d4a6f] transition-colors shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]"
                      >
                        <Eye className="w-3.5 h-3.5" />
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

      {/* Footer count */}
      <div className="mt-3 text-right">
        <span className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">
          Showing {filteredApplications.length} of {applications.length} application(s)
        </span>
      </div>
    </div>
  );
}
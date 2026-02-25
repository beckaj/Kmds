import { useState, useEffect } from 'react';
import { Eye, RefreshCw, Database, Search } from 'lucide-react';
import { GovSelect } from '../ui/gov-select';
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
}

export default function CaseworkerLegacyApplicationsView() {
  const [applications, setApplications] = useState<LegacyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionTypeFilter, setConnectionTypeFilter] = useState('__all__');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      console.log('[CASEWORKER LEGACY APPS] Fetching legacy data applications...');

      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/legacy-data/applications',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + publicAnonKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('[CASEWORKER LEGACY APPS] API Error:', response.statusText);
        setApplications([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[CASEWORKER LEGACY APPS] API Response:', data);

      if (data.success) {
        const transformed = (data.applications || []).map((app: any) => {
          const locDetails = app && app.locationDetails ? app.locationDetails : {};
          const existConn = app && app.existingConnection ? app.existingConnection : {};

          let displayStatus = 'Submitted';
          if (app.status === 'submitted' && app.currentStage === 'field_engineer') {
            displayStatus = 'Pending FE Verification';
          } else if (app.status === 'fe_verified' && app.currentStage === 'commissioner') {
            displayStatus = 'Pending Commissioner Approval';
          } else if (app.status === 'approved') {
            displayStatus = 'Approved';
          } else if (app.status === 'rejected') {
            displayStatus = 'Rejected';
          } else if (app.status === 'sent_back') {
            displayStatus = 'Sent Back';
          }

          let queueLabel = 'Field Engineer';
          if (app.currentStage === 'commissioner') {
            queueLabel = 'Commissioner';
          } else if (app.currentStage === 'caseworker') {
            queueLabel = 'Caseworker';
          } else if (app.status === 'approved' || app.status === 'rejected') {
            queueLabel = 'Completed';
          }

          return {
            id: app.id || 'N/A',
            applicantType: app.applicantType || 'N/A',
            applicantName: locDetails.fullName || 'N/A',
            connectionType: existConn.connectionType || 'N/A',
            status: displayStatus,
            currentStage: queueLabel,
            submittedAt: app.submittedAt || '',
            rrNumber: existConn.rrNumber || 'N/A',
          };
        });

        // Sort newest first
        transformed.sort((a: LegacyApplication, b: LegacyApplication) => {
          const dateA = new Date(a.submittedAt || 0).getTime();
          const dateB = new Date(b.submittedAt || 0).getTime();
          return dateB - dateA;
        });

        setApplications(transformed);
        console.log('[CASEWORKER LEGACY APPS] Loaded:', transformed.length);
      } else {
        console.error('[CASEWORKER LEGACY APPS] Error:', data.error);
        setApplications([]);
      }
    } catch (error) {
      console.error('[CASEWORKER LEGACY APPS] Fetch error:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const CONNECTION_TYPE_OPTIONS = [
    { value: '__all__', label: 'All Connection Types' },
    { value: 'Domestic 1/2"', label: 'Domestic 1/2"' },
    { value: 'Domestic 3/4"', label: 'Domestic 3/4"' },
    { value: 'Domestic 1"', label: 'Domestic 1"' },
    { value: 'Non-Domestic 1/2"', label: 'Non-Domestic 1/2"' },
    { value: 'Non-Domestic 3/4"', label: 'Non-Domestic 3/4"' },
    { value: 'Commercial 3/4"', label: 'Commercial 3/4"' },
    { value: 'Commercial 4"', label: 'Commercial 4"' },
    { value: 'Industries 4"', label: 'Industries 4"' },
    { value: 'Industries 6"', label: 'Industries 6"' },
  ];

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      !searchQuery ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.rrNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      connectionTypeFilter === '__all__' || app.connectionType === connectionTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleView = (appId: string) => {
    // For now, just alert — full detail view can be built later
    alert('View application: ' + appId);
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === 'Approved') return 'bg-green-100 text-green-800';
    if (status === 'Rejected') return 'bg-red-100 text-red-800';
    if (status === 'Sent Back') return 'bg-orange-100 text-orange-800';
    if (status.includes('Pending')) return 'bg-yellow-100 text-yellow-800';
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
            Track submitted legacy data entries and their processing status
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

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4 flex items-end gap-4">
        <div className="flex-1 max-w-[300px]">
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
        <div className="w-[220px]">
          <GovSelect
            label="Connection Type"
            options={CONNECTION_TYPE_OPTIONS}
            value={connectionTypeFilter}
            onValueChange={setConnectionTypeFilter}
          />
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
            <p className="text-gray-500 font-['Poppins',sans-serif]">No legacy data applications found</p>
            <p className="text-sm text-gray-400 font-['Poppins',sans-serif] mt-1">Submit a legacy data entry to see it here</p>
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
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[120px]">
                    Applicant As
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">
                    Applicant Name
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[160px]">
                    Connection Type
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[140px]">
                    Queue
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[100px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.map((app, index) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-center text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif]">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-left text-[14px] font-medium text-[#1f3a5f] font-['Poppins',sans-serif]">
                      {app.id}
                    </td>
                    <td className="px-6 py-4 text-left text-[14px] text-gray-700 font-['Poppins',sans-serif] capitalize">
                      {app.applicantType}
                    </td>
                    <td className="px-6 py-4 text-left text-[14px] text-gray-700 font-['Poppins',sans-serif]">
                      {app.applicantName}
                    </td>
                    <td className="px-6 py-4 text-left text-[14px] text-gray-700 font-['Poppins',sans-serif]">
                      {app.connectionType}
                    </td>
                    <td className="px-6 py-4 text-left">
                      <span className={'inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold font-[\'Poppins\',sans-serif] ' + getStatusBadgeClass(app.status)}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left text-[14px] text-gray-700 font-['Poppins',sans-serif]">
                      {app.currentStage}
                    </td>
                    <td className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleView(app.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1f3a5f] text-white rounded-md text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-[#2d4a6f] transition-colors"
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
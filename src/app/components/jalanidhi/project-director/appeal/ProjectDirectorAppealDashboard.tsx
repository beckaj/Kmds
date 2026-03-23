import { useState, useEffect } from 'react';
import { Eye, RefreshCw, Search } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../../../utils/supabase/info';
import SectionTitle from '../../SectionTitle';

interface AppealApplication {
  id: string;
  ulb: string;
  menu: string;
  subMenu: string;
  dateOfRejection: string;
  dateOfAppealRequested: string;
  reasonForAppeal: string;
  status: string;
  currentStage: string;
  originalApplicationId: string;
  citizenName: string;
  citizenPhone: string;
  applicationDetails: any;
  workflow: any;
}

interface ProjectDirectorAppealDashboardProps {
  onViewAppeal: (appeal: AppealApplication) => void;
}

export default function ProjectDirectorAppealDashboard({ onViewAppeal }: ProjectDirectorAppealDashboardProps) {
  const [appeals, setAppeals] = useState<AppealApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const url = 'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/appeal/applications';
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + publicAnonKey,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setAppeals(data.applications || []);
        console.log('[PD APPEAL DASHBOARD] Loaded', (data.applications || []).length, 'appeals');
      }
    } catch (err) {
      console.error('[PD APPEAL DASHBOARD] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter appeals for new tap connection that need PD action
  const filteredAppeals = appeals.filter(app => {
    const menu = app.menu || '';
    const subMenu = app.subMenu || '';
    const stage = app.currentStage || '';
    const status = app.status || '';
    
    // Only show New Tap Connection appeals that are at project_director stage and not yet actioned
    const isNewTap = menu === 'New Tap Connection' || subMenu === 'New Tap Connection';
    const isPDStage = stage === 'project_director';
    const needsAction = status !== 'pd_approved' && status !== 'pd_rejected' && status !== 'commissioner_approved' && status !== 'commissioner_appeal_rejected';
    
    return isNewTap && isPDStage && needsAction;
  });

  // Search filter
  const searchedAppeals = filteredAppeals.filter(app => {
    const q = searchQuery.toLowerCase();
    return (
      app.id.toLowerCase().includes(q) ||
      app.originalApplicationId.toLowerCase().includes(q) ||
      app.citizenName.toLowerCase().includes(q) ||
      app.ulb.toLowerCase().includes(q)
    );
  });

  // Sort by date (newest first)
  const sortedAppeals = [...searchedAppeals].sort((a, b) => {
    return new Date(b.dateOfAppealRequested).getTime() - new Date(a.dateOfAppealRequested).getTime();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <SectionTitle title="APPEAL REQUESTS - NEW TAP CONNECTION" />
          <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-3">
            Review and process appeal requests from citizens for rejected new tap connection applications
          </p>
        </div>
        <button
          onClick={fetchAppeals}
          disabled={loading}
          className="px-4 py-2 bg-[#1f3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors font-['Poppins',sans-serif] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Appeal ID, Application ID, Citizen Name, or ULB..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Title Bar */}
        <div className="bg-[#1f3a5f] px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-white leading-7">
            Pending Appeal Requests ({sortedAppeals.length})
          </h2>
        </div>
        {sortedAppeals.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 font-['Poppins',sans-serif]">
              {loading ? 'Loading appeals...' : searchQuery ? 'No appeals match your search' : 'No pending appeal requests'}
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
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[150px]">
                    Appeal ID
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[150px]">
                    Application ID
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">
                    Citizen Name
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[200px]">
                    ULB
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[120px]">
                    Date Requested
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[120px]">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[120px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {sortedAppeals.map((appeal, index) => (
                  <tr key={appeal.id} className="border-b border-[#e5e7eb] hover:bg-[#f8f9fb] transition-colors">
                    <td className="px-6 py-4 text-center font-['Poppins',sans-serif] text-[14px] font-medium text-[#414141]">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] font-medium text-[#06c]">
                      {appeal.id}
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                      {appeal.originalApplicationId}
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#170f49] font-medium">
                      {appeal.citizenName}
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                      {appeal.ulb}
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                      {formatDate(appeal.dateOfAppealRequested)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-['Poppins',sans-serif] bg-amber-100 text-amber-800 border border-amber-200">
                        Pending Review
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onViewAppeal(appeal)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1f3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors font-['Poppins',sans-serif] text-sm font-medium mx-auto"
                      >
                        <Eye className="w-4 h-4" />
                        Review
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

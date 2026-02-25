import { FileText, Search, Filter, Clock, CheckCircle, Eye, RotateCcw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface DCBCorrectionApp {
  id: string;
  rrNumber: string;
  status: string;
  caseworkerName: string;
  correctionReasonLabel: string;
  correctionReason: string;
  forwardedAt: string;
  updatedAt: string;
  createdAt: string;
  originalData: any;
  correctedData: any;
  roAction: any;
}

interface CommissionerDCBCorrectionDashboardProps {
  onViewApplication: (id: string) => void;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
};

export default function CommissionerDCBCorrectionDashboard({ onViewApplication }: CommissionerDCBCorrectionDashboardProps) {
  const [applications, setApplications] = useState<DCBCorrectionApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/dcb/commissioner/applications',
        { method: 'GET', headers: { 'Authorization': 'Bearer ' + publicAnonKey, 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      if (data && data.success) {
        setApplications(data.applications || []);
        console.log('[COMM DCB DASH] Loaded', (data.applications || []).length, 'applications');
      } else {
        console.error('[COMM DCB DASH] Error:', data && data.error ? data.error : 'Unknown');
        setApplications([]);
      }
    } catch (err) {
      console.error('[COMM DCB DASH] Fetch error:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string; Icon: any }> = {
      'ro_approved': { label: 'Pending Review', color: 'bg-amber-100 text-amber-800 border-amber-300', Icon: Clock },
      'correction_applied': { label: 'Correction Applied', color: 'bg-green-100 text-green-800 border-green-300', Icon: CheckCircle },
      'returned_by_commissioner': { label: 'Returned for Rework', color: 'bg-orange-100 text-orange-800 border-orange-300', Icon: RotateCcw },
    };
    const config = configs[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200', Icon: Clock };
    const StatusIcon = config.Icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium border ${config.color}`}>
        <StatusIcon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = !searchQuery ||
      (app.id && app.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.rrNumber && app.rrNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.caseworkerName && app.caseworkerName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-['Poppins',sans-serif]">Loading DCB correction applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
          <FileText className="w-6 h-6" />
          DCB Correction Applications
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
          Review DCB corrections approved by Revenue Officer
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Application ID, RR Number, Caseworker..."
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
              <option value="all">All Statuses</option>
              <option value="ro_approved">Pending Review</option>
              <option value="correction_applied">Correction Applied</option>
              <option value="returned_by_commissioner">Returned for Rework</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Title Bar */}
        <div className="bg-[#1f3a5f] px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-white leading-7">
            DCB Correction Applications
          </h2>
        </div>
        {filteredApps.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-['Poppins',sans-serif]">No DCB correction applications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8f9fa] border-b border-[#e5e7eb]">
                <tr>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide">S.No</th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide">Application ID</th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide">RR Number</th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide">Reason</th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide">Caseworker</th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide">RO Approved</th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide">Status</th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredApps.map((app, idx) => {
                  const roDate = app.roAction && app.roAction.actionDate ? formatDate(app.roAction.actionDate) : 'N/A';
                  return (
                    <tr key={app.id} className="border-b border-[#e5e7eb] hover:bg-[#f8f9fb] transition-colors cursor-pointer" onClick={() => onViewApplication(app.id)}>
                      <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] font-medium text-[#414141]">{idx + 1}</td>
                      <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] font-medium text-[#06c]">{app.id}</td>
                      <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">{app.rrNumber || 'N/A'}</td>
                      <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">{app.correctionReasonLabel || app.correctionReason || 'N/A'}</td>
                      <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#170f49] font-medium">{app.caseworkerName || 'N/A'}</td>
                      <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">{roDate}</td>
                      <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); onViewApplication(app.id); }}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1f3a5f] text-white rounded-[8px] font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-[#2d4a6f] transition-colors shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {app.status === 'ro_approved' ? 'Review' : 'View'}
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
import { FileText, ChevronRight, MapPin, User, LogOut, Wrench, CheckCircle2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface PlumberMobileAppListProps {
  plumberData: { mobile: string; name: string; id: string };
  onViewApplication: (application: any) => void;
  onLogout: () => void;
}

export default function PlumberMobileAppList({
  plumberData,
  onViewApplication,
  onLogout,
}: PlumberMobileAppListProps) {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchAllApps();
  }, []);

  const fetchAllApps = async () => {
    try {
      setIsLoading(true);
      console.log('[PLUMBER MOBILE] Fetching all plumber apps (reconnection + installation)...');
      
      // Fetch both reconnection and installation apps in parallel
      const [reconRes, installRes] = await Promise.all([
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber/mobile/reconnection-apps`,
          { headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' } }
        ),
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber/mobile/installation-apps`,
          { headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' } }
        ),
      ]);

      let allApps: any[] = [];

      if (reconRes.ok) {
        const reconData = await reconRes.json();
        console.log('[PLUMBER MOBILE] Reconnection apps:', reconData);
        if (reconData.success && reconData.applications) {
          allApps = [...allApps, ...reconData.applications];
        }
      }

      if (installRes.ok) {
        const installData = await installRes.json();
        console.log('[PLUMBER MOBILE] Installation apps:', installData);
        if (installData.success && installData.applications) {
          allApps = [...allApps, ...installData.applications];
        }
      }

      // Also fetch disconnection apps
      try {
        const disconRes = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber/mobile/disconnection-apps`,
          { headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' } }
        );
        if (disconRes.ok) {
          const disconData = await disconRes.json();
          console.log('[PLUMBER MOBILE] Disconnection apps:', disconData);
          if (disconData.success && disconData.applications) {
            allApps = [...allApps, ...disconData.applications];
          }
        }
      } catch (e) {
        console.log('[PLUMBER MOBILE] Disconnection fetch error (non-critical):', e);
      }

      // Also fetch change connection apps
      try {
        const changeConnRes = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber/mobile/change-connection-apps`,
          { headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' } }
        );
        if (changeConnRes.ok) {
          const changeConnData = await changeConnRes.json();
          console.log('[PLUMBER MOBILE] Change connection apps:', changeConnData);
          if (changeConnData.success && changeConnData.applications) {
            allApps = [...allApps, ...changeConnData.applications];
          }
        }
      } catch (e) {
        console.log('[PLUMBER MOBILE] Change connection fetch error (non-critical):', e);
      }

      // Deduplicate by id
      const seen = new Set();
      const unique = allApps.filter(app => {
        if (seen.has(app.id)) return false;
        seen.add(app.id);
        return true;
      });

      // Sort newest first
      unique.sort((a, b) => new Date(b.updatedAt || b.submittedAt || 0).getTime() - new Date(a.updatedAt || a.submittedAt || 0).getTime());

      setApplications(unique);
      console.log('[PLUMBER MOBILE] Total unique apps:', unique.length);
    } catch (error) {
      console.error('[PLUMBER MOBILE] Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Status Bar */}
      <div className="h-[28px] flex items-center justify-between px-4 pt-2 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-black/50"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-black/50"></div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <svg width="16" height="12" viewBox="0 0 24 24" fill="black">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
          </svg>
          <div className="w-4 h-2 border border-black rounded-sm relative">
            <div className="absolute left-0 top-0 w-3/4 h-full bg-black rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-[#263238] text-[18px] font-semibold font-['Poppins',sans-serif]">
            KMDS - Jalanidhi
          </h1>
          <p className="text-[#170f49]/60 text-[11px] font-['Poppins',sans-serif] mt-0.5">
            Welcome, {plumberData.name}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex flex-col gap-1">
              <div className="w-1 h-1 rounded-full bg-[#263238]"></div>
              <div className="w-1 h-1 rounded-full bg-[#263238]"></div>
              <div className="w-1 h-1 rounded-full bg-[#263238]"></div>
            </div>
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <button
                onClick={() => {
                  setShowMenu(false);
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full px-4 py-3 text-left text-[#170f49] text-[12px] font-['Poppins',sans-serif] hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                Web Version
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onLogout();
                }}
                className="w-full px-4 py-3 text-left text-[#170f49] text-[12px] font-['Poppins',sans-serif] hover:bg-gray-50 flex items-center gap-2 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section Title */}
      <div className="px-4 py-3 bg-orange-50 border-b border-orange-200">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-orange-600" />
          <h2 className="text-orange-800 text-[12px] font-semibold font-['Poppins',sans-serif] uppercase tracking-wider">
            Work Orders
          </h2>
        </div>
      </div>

      {/* Applications List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#1f3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#170f49]/60 text-[12px] font-['Poppins',sans-serif]">
                Loading reconnection work...
              </p>
            </div>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-[#170f49]/60 text-[14px] font-['Poppins',sans-serif]">
                No reconnection work orders
              </p>
              <p className="text-[#170f49]/40 text-[11px] font-['Poppins',sans-serif] mt-1">
                Accepted work orders will appear here
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {applications.map((app, index) => {
              const ownerName = (app.rrData && app.rrData.ownerName)
                ? app.rrData.ownerName
                : (app.applicantDetails && app.applicantDetails.applicantName ? app.applicantDetails.applicantName : 'N/A');
              const address = (app.rrData && app.rrData.address)
                ? app.rrData.address
                : (app.applicantDetails && app.applicantDetails.address ? app.applicantDetails.address : 'N/A');
              const isNewConnection = !app.type || app.type === 'newConnection';
              const isDisconnectionApp = app.type === 'disconnection';
              const isChangeConnectionApp = app.type === 'changeConnection';
              const isInstallation = isNewConnection && (app.status === 'sentToCitizenForPayment' || app.status === 'installation_approved' || app.status === 'approved' || app.status === 'plumber_accepted_installation' || app.status === 'installation_work_submitted');
              const isSubmitted = app.status === 'reconnection_work_submitted' || app.status === 'installation_work_submitted' || app.status === 'disconnection_work_submitted' || app.status === 'change_connection_work_submitted';
              
              return (
                <div
                  key={app.id || index}
                  onClick={() => !isSubmitted && onViewApplication(app)}
                  className={`px-5 py-4 transition-colors cursor-pointer ${
                    isSubmitted ? 'bg-green-50/50 opacity-70' : 'hover:bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Application Number */}
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-[#1f3a5f] flex-shrink-0" />
                        <p className="text-[#170f49] text-[11px] font-semibold font-['Poppins',sans-serif] truncate">
                          {app.applicationNo || app.id}
                        </p>
                      </div>

                      {/* Owner Name */}
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-3.5 h-3.5 text-[#170f49]/60 flex-shrink-0" />
                        <p className="text-[#170f49] text-[12px] font-medium font-['Poppins',sans-serif]">
                          {ownerName}
                        </p>
                      </div>

                      {/* Address */}
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-[#0078a0] flex-shrink-0" />
                        <p className="text-[#170f49]/70 text-[10px] font-['Poppins',sans-serif] truncate">
                          {address}
                        </p>
                      </div>

                      {/* RR Number + Type badges */}
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        <span className={`px-2 py-1 text-[10px] font-medium font-['Poppins',sans-serif] rounded-full ${
                          isDisconnectionApp ? 'bg-red-100 text-red-700' :
                          isChangeConnectionApp ? 'bg-purple-100 text-purple-700' :
                          isInstallation ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {isDisconnectionApp ? 'Disconnection' : isChangeConnectionApp ? 'Change Connection' : isInstallation ? 'New Installation' : 'Reconnection'}
                        </span>
                        {app.rrNumber && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-medium font-['Poppins',sans-serif] rounded-full">
                            RR: {app.rrNumber}
                          </span>
                        )}
                        {isSubmitted ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-medium font-['Poppins',sans-serif] rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Submitted
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-medium font-['Poppins',sans-serif] rounded-full">
                            Pending Visit
                          </span>
                        )}
                      </div>
                    </div>

                    {/* View Arrow */}
                    {!isSubmitted && (
                      <div className="flex items-center justify-center w-8 h-8 bg-[#1f3a5f]/5 rounded-full flex-shrink-0 mt-2">
                        <ChevronRight className="w-4 h-4 text-[#1f3a5f]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Refresh Button */}
      {!isLoading && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={fetchAllApps}
            className="w-full h-[44px] bg-[#1f3a5f] hover:bg-[#2d4a75] text-white text-[12px] font-semibold font-['Poppins',sans-serif] rounded-[12px] shadow-sm transition-colors"
          >
            Refresh List
          </button>
        </div>
      )}
    </div>
  );
}
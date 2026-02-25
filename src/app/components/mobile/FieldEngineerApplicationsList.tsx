import { FileText, ChevronRight, Calendar, MapPin, User, LogOut } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface Application {
  applicationNo: string;
  applicantName: string;
  address: string;
  visitDate: string;
  visitPurpose: string;
  status: string;
}

interface FieldEngineerApplicationsListProps {
  engineerData: { mobile: string; name: string; id: string };
  onViewApplication: (applicationNo: string) => void;
  onLogout: () => void;
}

export default function FieldEngineerApplicationsList({
  engineerData,
  onViewApplication,
  onLogout,
}: FieldEngineerApplicationsListProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchScheduledApplications();
  }, []);

  const fetchScheduledApplications = async () => {
    try {
      setIsLoading(true);
      console.log('[MOBILE APP] Fetching scheduled field visits...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/jalanidhi/applications?status=field_visit_scheduled`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('[MOBILE APP] Received applications:', data);
        setApplications(data.applications || []);
      } else {
        console.error('[MOBILE APP] Failed to fetch applications:', response.statusText);
        setApplications([]);
      }
    } catch (error) {
      console.error('[MOBILE APP] Error fetching applications:', error);
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not scheduled';
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-black">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <div className="flex items-center gap-1">
          <svg width="16" height="12" viewBox="0 0 24 24" fill="black">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
          </svg>
          <div className="flex items-center gap-0.5">
            <div className="w-4 h-2 border border-black rounded-sm relative">
              <div className="absolute left-0 top-0 w-3/4 h-full bg-black rounded-sm"></div>
            </div>
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
            Welcome, {engineerData.name}
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
          
          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <button
                onClick={() => {
                  setShowMenu(false);
                  // Clear localStorage and navigate to web login
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
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-[#170f49] text-[12px] font-semibold font-['Poppins',sans-serif] uppercase tracking-wider">
          Scheduled Site Visits
        </h2>
      </div>

      {/* Applications List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#27548a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#170f49]/60 text-[12px] font-['Poppins',sans-serif]">
                Loading applications...
              </p>
            </div>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-[#170f49]/60 text-[14px] font-['Poppins',sans-serif]">
                No scheduled visits
              </p>
              <p className="text-[#170f49]/40 text-[11px] font-['Poppins',sans-serif] mt-1">
                New visits will appear here
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {applications.map((app, index) => (
              <div
                key={index}
                onClick={() => onViewApplication(app.applicationNo)}
                className="px-5 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Application Number */}
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-[#27548a] flex-shrink-0" />
                      <p className="text-[#170f49] text-[11px] font-semibold font-['Poppins',sans-serif] truncate">
                        {app.applicationNo}
                      </p>
                    </div>

                    {/* Applicant Name */}
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-3.5 h-3.5 text-[#170f49]/60 flex-shrink-0" />
                      <p className="text-[#170f49] text-[12px] font-medium font-['Poppins',sans-serif]">
                        {app.applicantName}
                      </p>
                    </div>

                    {/* Visit Date */}
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-[#0078a0] flex-shrink-0" />
                      <p className="text-[#170f49]/70 text-[11px] font-['Poppins',sans-serif]">
                        {formatDate(app.visitDate)}
                      </p>
                    </div>

                    {/* Visit Purpose */}
                    {app.visitPurpose && (
                      <div className="mt-2 inline-block">
                        <span className="px-2 py-1 bg-[#0078a0]/10 text-[#0078a0] text-[10px] font-medium font-['Poppins',sans-serif] rounded-full">
                          {app.visitPurpose}
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    {app.status && (
                      <div className="mt-2 inline-block ml-2">
                        <span className={`px-2 py-1 text-[10px] font-medium font-['Poppins',sans-serif] rounded-full ${
                          app.status === 'Verified' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* View Arrow */}
                  <div className="flex items-center justify-center w-8 h-8 bg-[#27548a]/5 rounded-full flex-shrink-0">
                    <ChevronRight className="w-4 h-4 text-[#27548a]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Refresh Button */}
      {!isLoading && applications.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={fetchScheduledApplications}
            className="w-full h-[44px] bg-[#27548a] hover:bg-[#1f3a5f] text-white text-[12px] font-semibold font-['Poppins',sans-serif] rounded-[12px] shadow-sm transition-colors"
          >
            Refresh List
          </button>
        </div>
      )}
    </div>
  );
}
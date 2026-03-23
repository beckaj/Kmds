import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../../../utils/supabase/info';
import CommissionerReconnectionView from '../../CommissionerReconnectionView';
import SectionTitle from '../../SectionTitle';

interface ReconnectionApplication {
  id: string;
  type: 'reconnection';
  status: string;
  submittedAt?: string;
  createdAt?: string;
  
  // RR Number data
  rrNumber: string;
  rrData?: {
    ownerName: string;
    mobileNo: string;
    connectionType: string;
    propertyType?: string;
    meterCategory?: string;
    meterStatus?: string;
  };
  
  // Reconnection-specific data
  hasUGDConnection?: string;
  disconnectionDetails?: {
    disconnectionReason: string;
    dateOfApproval: string;
  };
  reconnectionReason?: string;
  
  // Field Engineer details
  fieldEngineerDetails?: {
    name: string;
    employeeId?: string;
  };
}

export default function CommissionerReconnectionDashboard() {
  const [applications, setApplications] = useState<ReconnectionApplication[]>(() => {
    const saved = localStorage.getItem('commissioner_reconnection_applications');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [loading, setLoading] = useState(() => {
    const saved = localStorage.getItem('commissioner_reconnection_applications');
    return !saved;
  });
  
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(() => {
    const saved = localStorage.getItem('commissioner_reconnection_selectedAppId');
    return saved || null;
  });
  
  const [searchQuery, setSearchQuery] = useState(() => {
    const saved = localStorage.getItem('commissioner_reconnection_searchQuery');
    return saved || '';
  });
  
  const [statusFilter, setStatusFilter] = useState(() => {
    const saved = localStorage.getItem('commissioner_reconnection_statusFilter');
    return saved || 'all';
  });

  // Persist applications to localStorage
  useEffect(() => {
    if (applications.length > 0) {
      localStorage.setItem('commissioner_reconnection_applications', JSON.stringify(applications));
    }
  }, [applications]);

  // Persist state to localStorage
  useEffect(() => {
    if (selectedApplicationId) {
      localStorage.setItem('commissioner_reconnection_selectedAppId', selectedApplicationId);
    } else {
      localStorage.removeItem('commissioner_reconnection_selectedAppId');
    }
  }, [selectedApplicationId]);

  useEffect(() => {
    localStorage.setItem('commissioner_reconnection_searchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('commissioner_reconnection_statusFilter', statusFilter);
  }, [statusFilter]);

  // Fetch on mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      console.log('[COMMISSIONER RECONNECTION] Fetching reconnection applications...');
      
      const maxRetries = 3;
      let lastError: any = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[COMMISSIONER RECONNECTION] Attempt ${attempt}/${maxRetries}...`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);
          
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-698be164/commissioner/applications`,
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
            throw new Error(`Failed to fetch applications: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          console.log('[COMMISSIONER RECONNECTION] API Response:', data);
          
          if (data.success) {
            // Filter only reconnection applications
            const reconnectionApps = (data.applications || []).filter(
              (app: any) => app.type === 'reconnection'
            );
            setApplications(reconnectionApps);
            console.log('[COMMISSIONER RECONNECTION] Loaded reconnection applications:', reconnectionApps.length);
          } else {
            console.error('[COMMISSIONER RECONNECTION] API Error:', data.error);
            setApplications([]);
          }
          return; // Success — exit retry loop
        } catch (err) {
          lastError = err;
          console.warn(`[COMMISSIONER RECONNECTION] Attempt ${attempt} failed:`, err);
          if (attempt < maxRetries) {
            const delay = attempt * 2000;
            console.log(`[COMMISSIONER RECONNECTION] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // All retries failed
      console.error('[COMMISSIONER RECONNECTION] All retry attempts failed:', lastError);
      setApplications([]);
    } catch (error) {
      console.error('[COMMISSIONER RECONNECTION] Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      'sentToCommissioner': {
        label: 'Pending Decision',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: Clock
      },
      'underReviewByCommissioner': {
        label: 'Under Review',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: AlertCircle
      },
      'approved': {
        label: 'Approved',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle
      },
      'rejected': {
        label: 'Rejected',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: XCircle
      },
      'sentBackToFieldEngineer': {
        label: 'Sent Back to Field Engineer',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: AlertCircle
      },
    };

    const config = statusConfig[status] || { 
      label: status.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(), 
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: Clock 
    };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.rrNumber && app.rrNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.rrData && app.rrData.ownerName ? app.rrData.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
      (app.rrData && app.rrData.mobileNo ? app.rrData.mobileNo.includes(searchQuery) : false);
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort: latest applications first
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const dateA = new Date(a.submittedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.submittedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  // If viewing a specific application
  if (selectedApplicationId) {
    return (
      <CommissionerReconnectionView
        applicationId={selectedApplicationId}
        onBack={() => {
          setSelectedApplicationId(null);
          // Refetch applications to get updated status
          fetchApplications();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <SectionTitle title="Tap Reconnection Requests" className="mb-2" />
          <p className="text-gray-600 font-['Poppins',sans-serif]">
            Review and make decisions on tap reconnection applications
          </p>
        </div>
        <button
          onClick={() => fetchApplications()}
          disabled={loading}
          className="mt-1 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 font-['Poppins',sans-serif] hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Application ID, RR Number, Name, or Mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="sentToCommissioner">Pending Decision</option>
                <option value="underReviewByCommissioner">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="sentBackToFieldEngineer">Sent Back to FE</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Title Bar */}
        <div className="bg-[#1f3a5f] px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-white leading-7">
            Reconnection Requests
          </h2>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f]"></div>
            <p className="mt-4 text-gray-600 font-['Poppins',sans-serif]">Loading reconnection applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 font-['Poppins',sans-serif]">
              {searchQuery || statusFilter !== 'all' 
                ? 'No reconnection applications match your filters.' 
                : 'No reconnection applications awaiting decision yet.'}
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
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">
                    Application No
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[150px]">
                    RR Number
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">
                    Owner Name
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[130px]">
                    Mobile No
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[150px]">
                    Connection Type
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[220px]">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[120px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {sortedApplications.map((application, index) => {
                  return (
                    <tr 
                      key={application.id}
                      className="border-b border-[#e5e7eb] hover:bg-[#f8f9fb] transition-colors"
                    >
                      <td className="px-6 py-4 text-center font-['Poppins',sans-serif] text-[14px] font-medium text-[#414141]">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] font-medium text-[#06c]">
                        {application.id}
                      </td>
                      <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                        {application.rrNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#170f49] font-medium">
                        {(application.rrData && application.rrData.ownerName) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                        {(application.rrData && application.rrData.mobileNo) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141] capitalize">
                        {(application.rrData && application.rrData.connectionType) || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedApplicationId(application.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1f3a5f] text-white rounded-[8px] font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-[#2d4a6f] transition-colors shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
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
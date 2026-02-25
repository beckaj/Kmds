import { useState, useEffect, useRef } from 'react';
import { FileText, Clock, CheckCircle, Wrench, AlertTriangle, ArrowRightLeft, Plug, PlugZap, RefreshCw, Database } from 'lucide-react';
import SectionTitle from './SectionTitle';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface RevenueOfficerOverviewProps {
  onNavigate: (path: string) => void;
}

interface Stats {
  totalApplications: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  newConnections: number;
  reconnections: number;
  disconnections: number;
  changeConnections: number;
  dcbCorrections: number;
}

export default function RevenueOfficerOverview({ onNavigate }: RevenueOfficerOverviewProps) {
  const [stats, setStats] = useState<Stats>({
    totalApplications: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    newConnections: 0,
    reconnections: 0,
    disconnections: 0,
    changeConnections: 0,
    dcbCorrections: 0,
  });
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);

    try {
      // Fetch all application types in parallel
      const endpoints = [
        { type: 'newConnection', url: 'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/revenue-officer/applications?type=newConnection' },
        { type: 'reconnection', url: 'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/revenue-officer/applications?type=reconnection' },
        { type: 'disconnection', url: 'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/revenue-officer/applications?type=disconnection' },
        { type: 'changeConnection', url: 'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/revenue-officer/applications?type=changeConnection' },
      ];

      const headers = {
        'Authorization': 'Bearer ' + publicAnonKey,
        'Content-Type': 'application/json',
      };

      const results = await Promise.allSettled(
        endpoints.map((ep) =>
          fetch(ep.url, { method: 'GET', headers }).then((res) => res.json())
        )
      );

      let totalApps = 0;
      let pending = 0;
      let approved = 0;
      let rejected = 0;
      let newConn = 0;
      let reconn = 0;
      let disconn = 0;
      let changeConn = 0;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value && result.value.applications) {
          const apps = result.value.applications;
          const count = apps.length;
          totalApps += count;

          if (index === 0) newConn = count;
          if (index === 1) reconn = count;
          if (index === 2) disconn = count;
          if (index === 3) changeConn = count;

          apps.forEach((app: any) => {
            const status = app.status || '';
            if (status === 'forwarded_to_revenue_officer' || status === 'pending' || status === 'fe_approved') {
              pending++;
            } else if (status === 'ro_approved' || status === 'approved' || status === 'commissioner_approved') {
              approved++;
            } else if (status === 'ro_rejected' || status === 'rejected') {
              rejected++;
            }
          });
        }
      });

      // Also try to fetch DCB correction applications
      let dcbCount = 0;
      try {
        const dcbRes = await fetch(
          'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/dcb/revenue-officer/applications',
          { method: 'GET', headers }
        );
        const dcbData = await dcbRes.json();
        if (dcbData && dcbData.success && dcbData.applications) {
          dcbCount = dcbData.applications.length;
          totalApps += dcbCount;
          dcbData.applications.forEach((app: any) => {
            const st = app.status || '';
            if (st === 'pending') pending++;
            else if (st === 'ro_approved' || st === 'correction_applied') approved++;
            else if (st === 'ro_rejected') rejected++;
          });
        }
      } catch (e) {
        console.log('[RO Overview] DCB fetch error (non-fatal):', e);
      }

      setStats({
        totalApplications: totalApps,
        pendingReview: pending,
        approved: approved,
        rejected: rejected,
        newConnections: newConn,
        reconnections: reconn,
        disconnections: disconn,
        changeConnections: changeConn,
        dcbCorrections: dcbCount,
      });
    } catch (error) {
      console.error('[RO Overview] Error fetching stats:', error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const statCards = [
    {
      label: 'Total Applications',
      value: stats.totalApplications,
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      bgIcon: 'bg-blue-100',
      borderColor: 'border-blue-500',
    },
    {
      label: 'Pending Review',
      value: stats.pendingReview,
      icon: <Clock className="w-6 h-6 text-yellow-600" />,
      bgIcon: 'bg-yellow-100',
      borderColor: 'border-yellow-500',
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      bgIcon: 'bg-green-100',
      borderColor: 'border-green-500',
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      bgIcon: 'bg-red-100',
      borderColor: 'border-red-500',
    },
  ];

  const quickActions = [
    {
      title: 'New Connection Requests',
      description: 'Review and approve new tap connection applications forwarded by caseworkers',
      count: stats.newConnections,
      icon: <Plug className="w-6 h-6 text-white" />,
      bgIcon: 'bg-blue-600',
      gradient: 'from-blue-50 to-blue-100',
      border: 'border-blue-200',
      hoverBorder: 'hover:border-blue-400',
      path: '/jalanidhi/revenue-officer/tap-connection/new-requests',
    },
    {
      title: 'Reconnection Requests',
      description: 'Process reconnection applications and verify eligibility',
      count: stats.reconnections,
      icon: <PlugZap className="w-6 h-6 text-white" />,
      bgIcon: 'bg-green-600',
      gradient: 'from-green-50 to-green-100',
      border: 'border-green-200',
      hoverBorder: 'hover:border-green-400',
      path: '/jalanidhi/revenue-officer/tap-connection/reconnection-requests',
    },
    {
      title: 'Disconnection Requests',
      description: 'Review disconnection requests and take appropriate action',
      count: stats.disconnections,
      icon: <AlertTriangle className="w-6 h-6 text-white" />,
      bgIcon: 'bg-orange-600',
      gradient: 'from-orange-50 to-orange-100',
      border: 'border-orange-200',
      hoverBorder: 'hover:border-orange-400',
      path: '/jalanidhi/revenue-officer/tap-connection/disconnection-requests',
    },
    {
      title: 'Change of Connection Type',
      description: 'Process applications for changing connection type (metered/non-metered)',
      count: stats.changeConnections,
      icon: <ArrowRightLeft className="w-6 h-6 text-white" />,
      bgIcon: 'bg-purple-600',
      gradient: 'from-purple-50 to-purple-100',
      border: 'border-purple-200',
      hoverBorder: 'hover:border-purple-400',
      path: '/jalanidhi/revenue-officer/tap-connection/change-connection-type',
    },
    {
      title: 'DCB Correction',
      description: 'Review and approve DCB correction applications submitted by caseworkers',
      count: stats.dcbCorrections,
      icon: <Database className="w-6 h-6 text-white" />,
      bgIcon: 'bg-teal-600',
      gradient: 'from-teal-50 to-teal-100',
      border: 'border-teal-200',
      hoverBorder: 'hover:border-teal-400',
      path: '/jalanidhi/revenue-officer/tap-connection/dcb-correction',
    },
    {
      title: 'Plumber License Applications',
      description: 'Review plumber license new applications and renewals',
      count: 0,
      icon: <Wrench className="w-6 h-6 text-white" />,
      bgIcon: 'bg-indigo-600',
      gradient: 'from-indigo-50 to-indigo-100',
      border: 'border-indigo-200',
      hoverBorder: 'hover:border-indigo-400',
      path: '/jalanidhi/revenue-officer/plumber-license/new-applications',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <SectionTitle title="Revenue Officer Dashboard" className="mb-2" />
          <p className="text-gray-600 font-['Poppins',sans-serif]">
            Welcome to the Revenue Officer Panel — Review, approve, and forward applications
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#1f3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors font-['Poppins',sans-serif] text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={'w-4 h-4' + (loading ? ' animate-spin' : '')} />
          Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={'bg-white rounded-lg shadow-md p-6 border-l-4 ' + card.borderColor}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 font-['Poppins',sans-serif]">
                  {loading ? '—' : card.value}
                </p>
              </div>
              <div className={'w-12 h-12 rounded-full flex items-center justify-center ' + card.bgIcon}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => onNavigate(action.path)}
              className={
                'bg-gradient-to-br ' +
                action.gradient +
                ' border-2 ' +
                action.border +
                ' rounded-lg p-6 hover:shadow-lg ' +
                action.hoverBorder +
                ' transition-all text-left group'
              }
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div
                    className={
                      'w-12 h-12 ' +
                      action.bgIcon +
                      ' rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'
                    }
                  >
                    {action.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 font-['Poppins',sans-serif] mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-3">
                    {action.description}
                  </p>
                  {!loading && action.count > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1f3a5f] text-white font-['Poppins',sans-serif]">
                      {action.count} application{action.count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
          Recent Activity
        </h2>

        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-['Poppins',sans-serif]">
            No recent activity yet
          </p>
        </div>
      </div>
    </div>
  );
}
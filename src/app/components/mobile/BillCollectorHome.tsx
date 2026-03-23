import { useState, useEffect } from 'react';
import { Menu, User, ChevronDown, FileText, LogOut, RefreshCw, Droplets, Home as HomeIcon, LayoutList, X } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { BCCollectorData, BCApplication } from './BillCollectorMobileApp';

interface BillCollectorHomeProps {
  collector: BCCollectorData;
  wards: string[];
  selectedWard: string;
  onSelectWard: (ward: string) => void;
  onViewApp: (app: BCApplication) => void;
  onLogout: () => void;
}

// ─── Demo Data ──────────────────────────────────────────────────────────────
function getDemoApps(wardNo: string, district: string, ulb: string, ulbType: string): BCApplication[] {
  const entries = [
    { rr: '234354', name: 'Ramesh A', type: 'Domestic', meter: 'Metered' },
    { rr: '325455', name: 'S Sachin', type: 'Domestic', meter: 'Metered' },
    { rr: '524131', name: 'Mahaveer', type: 'Non-Domestic', meter: 'Metered' },
    { rr: '452421', name: 'Shanti V', type: 'Industrial', meter: 'Metered' },
    { rr: '342454', name: 'M Sudha', type: 'Commercial', meter: 'Metered' },
    { rr: '654321', name: 'Kavitha R', type: 'Domestic', meter: 'Non-Metered' },
    { rr: '765432', name: 'Naveen K', type: 'Commercial', meter: 'Non-Metered' },
    { rr: '876543', name: 'Lakshmi P', type: 'Non-Domestic', meter: 'Non-Metered' },
  ];
  return entries.map((e, i) => ({
    id: 'demo_' + wardNo + '_' + i,
    applicationNo: 'TAP-DEMO-' + e.rr,
    rrNumber: e.rr,
    applicantName: e.name,
    connectionType: e.type,
    meteringType: e.meter,
    district: district || 'Dharwad',
    ulb: ulb || 'Hub-Dha',
    ulbType: ulbType || 'CC',
    meterCategory: e.meter === 'Metered' ? 'Meter' : 'Non-Meter',
    meterStatus: e.meter === 'Metered' ? 'Active' : 'N/A',
    meterInstalledDate: e.meter === 'Metered' ? '2024-12-10' : '',
    meterNumber: e.meter === 'Metered' ? 'MTR-DEMO-' + (10000 + i) : 'N/A',
    lastMeterReading: e.meter === 'Metered' ? 0 : 0,
    ward: wardNo,
    status: 'active',
    dcbEntry: null,
  }));
}

export default function BillCollectorHome({
  collector,
  wards,
  selectedWard,
  onSelectWard,
  onViewApp,
  onLogout,
}: BillCollectorHomeProps) {
  const [applications, setApplications] = useState<BCApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'tap'>('tap');
  const [tapDropdown, setTapDropdown] = useState(false);

  // Auto-select first ward
  useEffect(() => {
    if (!selectedWard && wards.length > 0) {
      onSelectWard(wards[0]);
    }
  }, [wards]);

  // Fetch applications when ward changes
  useEffect(() => {
    if (selectedWard) {
      fetchApplications(selectedWard);
    }
  }, [selectedWard]);

  const fetchApplications = async (ward: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/bill-collector/applications/${encodeURIComponent(ward)}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data && data.success && data.applications && data.applications.length > 0) {
        setApplications(data.applications);
      } else {
        setApplications(getDemoApps(ward, collector.district, collector.ulb, collector.ulbType));
      }
    } catch (error) {
      console.error('[BC HOME] Error fetching apps:', error);
      setApplications(getDemoApps(ward, collector.district, collector.ulb, collector.ulbType));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5fa] flex flex-col max-w-[420px] mx-auto border-x border-gray-200 shadow-xl">
      {/* ── App Header ─────────────────────────────────────── */}
      <div className="bg-[#1f3a5f] px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuOpen(!menuOpen)} className="cursor-pointer p-0.5">
            <Menu className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#f9a825]" />
            <span className="text-white text-[14px] font-semibold font-['Poppins',sans-serif] tracking-wide">
              Jalanidhi
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-white/90 text-[12px] font-medium font-['Poppins',sans-serif]">
            {collector && collector.name ? collector.name.split(' ').slice(0, 2).join(' ') : 'User'}
          </span>
          <div className="w-7 h-7 rounded-full bg-white/15 border border-white/30 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>

      {/* ── Sidebar Drawer (overlay) ───────────────────────── */}
      {menuOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex" style={{ maxWidth: '420px', margin: '0 auto' }}>
          <div className="w-[270px] bg-white h-full shadow-2xl z-50 flex flex-col">
            {/* Drawer Header */}
            <div className="bg-[#1f3a5f] px-5 py-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-full bg-white/15 border border-white/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <button onClick={() => setMenuOpen(false)} className="cursor-pointer p-1">
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>
              <p className="text-white text-[14px] font-semibold font-['Poppins',sans-serif]">
                {collector && collector.name ? collector.name : 'Bill Collector'}
              </p>
              <p className="text-white/60 text-[11px] font-['Poppins',sans-serif] mt-0.5">
                {collector && collector.billCollectorId ? collector.billCollectorId : ''}
              </p>
              <p className="text-white/50 text-[10px] font-['Poppins',sans-serif] mt-0.5">
                {collector && collector.designation ? collector.designation : 'Bill Collector'}
              </p>
            </div>

            {/* Drawer Nav Items */}
            <nav className="flex-1 py-2">
              <button
                onClick={() => { setMenuOpen(false); setActiveTab('home'); }}
                className={
                  'w-full px-5 py-3 text-left text-[13px] font-medium font-[\'Poppins\',sans-serif] flex items-center gap-3 transition-colors cursor-pointer ' +
                  (activeTab === 'home' ? 'bg-[#e3f2fd] text-[#1f3a5f] border-r-3 border-[#1f3a5f]' : 'text-[#1b212d] hover:bg-gray-50')
                }
              >
                <HomeIcon className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={() => { setMenuOpen(false); setActiveTab('tap'); }}
                className={
                  'w-full px-5 py-3 text-left text-[13px] font-medium font-[\'Poppins\',sans-serif] flex items-center gap-3 transition-colors cursor-pointer ' +
                  (activeTab === 'tap' ? 'bg-[#e3f2fd] text-[#1f3a5f] border-r-3 border-[#1f3a5f]' : 'text-[#1b212d] hover:bg-gray-50')
                }
              >
                <LayoutList className="w-4 h-4" />
                Tap Connection
              </button>
            </nav>

            {/* Drawer Footer */}
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={onLogout}
                className="w-full px-4 py-2.5 text-left text-[13px] font-medium text-red-600 hover:bg-red-50 font-['Poppins',sans-serif] flex items-center gap-2.5 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/50 backdrop-blur-[2px]" onClick={() => setMenuOpen(false)} />
        </div>
      )}

      {/* ── Tab Navigation ─────────────────────────────────── */}
      <div className="flex bg-white border-b border-gray-200 shadow-sm">
        <button
          onClick={() => setActiveTab('home')}
          className={
            'flex-1 px-3 py-3 text-[12px] font-semibold font-[\'Poppins\',sans-serif] border-b-[3px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 ' +
            (activeTab === 'home'
              ? 'border-[#f9a825] text-[#1f3a5f] bg-[#f8fafc]'
              : 'border-transparent text-gray-500 hover:text-gray-700')
          }
        >
          <HomeIcon className="w-3.5 h-3.5" />
          Home
        </button>
        <div className="relative flex-1">
          <button
            onClick={() => setTapDropdown(!tapDropdown)}
            className={
              'w-full px-3 py-3 text-[12px] font-semibold font-[\'Poppins\',sans-serif] border-b-[3px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer ' +
              (activeTab === 'tap'
                ? 'border-[#f9a825] text-[#1f3a5f] bg-[#f8fafc]'
                : 'border-transparent text-gray-500 hover:text-gray-700')
            }
          >
            <Droplets className="w-3.5 h-3.5" />
            Tap Connection
            <ChevronDown className="w-3 h-3" />
          </button>
          {tapDropdown && (
            <div className="absolute top-full left-2 right-2 bg-white shadow-lg border border-gray-200 z-30 rounded-b-lg overflow-hidden">
              <button
                onClick={() => { setActiveTab('tap'); setTapDropdown(false); }}
                className="w-full px-4 py-2.5 text-left text-[12px] font-medium text-[#1b212d] hover:bg-[#e3f2fd] hover:text-[#1f3a5f] font-['Poppins',sans-serif] transition-colors cursor-pointer"
              >
                New Tap Connection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">

        {/* ────── HOME TAB ────── */}
        {activeTab === 'home' && (
          <div className="p-4 space-y-4">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                  Profile Details
                </h3>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-[#27548a]/10 flex items-center justify-center border border-[#27548a]/20">
                    <User className="w-5 h-5 text-[#1f3a5f]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                      {collector && collector.name ? collector.name : 'N/A'}
                    </p>
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                      {collector && collector.designation ? collector.designation : 'Bill Collector'}
                    </p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#f8fafc] rounded-lg border border-gray-100 p-3">
                    <p className="text-[10px] font-medium text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">
                      Assigned Wards
                    </p>
                    <p className="text-[20px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                      {wards.length}
                    </p>
                  </div>
                  <div className="bg-[#f8fafc] rounded-lg border border-gray-100 p-3">
                    <p className="text-[10px] font-medium text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">
                      District
                    </p>
                    <p className="text-[13px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                      {collector && collector.district ? collector.district : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-[#f8fafc] rounded-lg border border-gray-100 p-3">
                    <p className="text-[10px] font-medium text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">
                      ULB
                    </p>
                    <p className="text-[12px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] leading-tight">
                      {collector && collector.ulb ? collector.ulb : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-[#f8fafc] rounded-lg border border-gray-100 p-3">
                    <p className="text-[10px] font-medium text-gray-500 font-['Poppins',sans-serif] uppercase tracking-wider mb-1">
                      Phone
                    </p>
                    <p className="text-[13px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                      {collector && collector.phone ? collector.phone : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Ward Badges */}
                {wards.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-[11px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-2 uppercase tracking-wider">
                      Ward Numbers
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {wards.map((w) => (
                        <span
                          key={w}
                          className="inline-flex items-center px-3 py-1 rounded-md text-[11px] font-medium bg-[#27548a]/10 text-[#1f3a5f] font-['Poppins',sans-serif] border border-[#27548a]/15"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ────── TAP CONNECTION TAB ────── */}
        {activeTab === 'tap' && (
          <div className="p-4 space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                New Tap Connection Applications
              </h2>
              <button
                onClick={() => selectedWard && fetchApplications(selectedWard)}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
              >
                <RefreshCw className={'w-3.5 h-3.5 text-[#1f3a5f]' + (loading ? ' animate-spin' : '')} />
              </button>
            </div>

            {/* Ward Selector — bg-[#f8fafc] container */}
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-4">
              <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                Ward<span className="text-red-600 ml-1">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedWard}
                  onChange={(e) => onSelectWard(e.target.value)}
                  className="w-full h-[40px] px-4 font-['Poppins',sans-serif] text-[14px] text-gray-900 bg-white border-[1.5px] border-gray-300 rounded-md outline-none appearance-none cursor-pointer transition-all duration-200 hover:border-gray-400 focus:border-[#1f3a5f] focus:ring-2 focus:ring-[#1f3a5f]/20"
                >
                  {wards.length === 0 && (
                    <option value="__none__">No wards assigned</option>
                  )}
                  {wards.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Applications Table — GovTable pattern */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 flex flex-col items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-gray-200 border-t-[#1f3a5f]"></div>
                <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 text-center">
                <LayoutList className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif]">No applications found for this ward</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Table Header — formal blue-tinted */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[360px]">
                    <thead>
                      <tr className="bg-[#27548a]/10 border-b border-[#170F49]/20">
                        <th className="px-3 py-3 text-left text-[11px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[70px]">
                          RR No
                        </th>
                        <th className="px-3 py-3 text-left text-[11px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">
                          Applicant Name
                        </th>
                        <th className="px-3 py-3 text-left text-[11px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">
                          Connection Type
                        </th>
                        <th className="px-3 py-3 text-center text-[11px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[56px]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {applications.map((app, idx) => (
                        <tr
                          key={app && app.id ? app.id : 'app-' + idx}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 py-3.5 text-[13px] font-medium text-[#1f3a5f] font-['Poppins',sans-serif]">
                            {app && app.rrNumber ? app.rrNumber : 'N/A'}
                          </td>
                          <td className="px-3 py-3.5 text-[13px] text-gray-700 font-['Poppins',sans-serif]">
                            {app && app.applicantName ? app.applicantName : 'N/A'}
                          </td>
                          <td className="px-3 py-3.5 font-['Poppins',sans-serif]">
                            <span className={
                              'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ' +
                              (app && app.connectionType === 'Domestic'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : app && app.connectionType === 'Non-Domestic'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : app && app.connectionType === 'Industrial'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : app && app.connectionType === 'Commercial'
                                      ? 'bg-green-50 text-green-700 border border-green-200'
                                      : 'bg-gray-50 text-gray-700 border border-gray-200')
                            }>
                              {app && app.connectionType ? app.connectionType : 'Domestic'}
                            </span>
                            {app && app.meteringType === 'Non-Metered' && (
                              <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-orange-50 text-orange-600 border border-orange-200">
                                NM
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <button
                              onClick={() => onViewApp(app)}
                              className="inline-flex items-center justify-center w-8 h-8 bg-[#1f3a5f] text-white rounded-lg hover:bg-[#2d4f7f] active:bg-[#15283f] transition-colors cursor-pointer shadow-sm"
                              title="View Details"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="px-4 py-2.5 bg-[#f8fafc] border-t border-gray-200 flex items-center justify-between">
                  <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">
                    Showing <span className="font-semibold text-[#1f3a5f]">{applications.length}</span> application{applications.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-[11px] text-gray-400 font-['Poppins',sans-serif]">
                    {selectedWard}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
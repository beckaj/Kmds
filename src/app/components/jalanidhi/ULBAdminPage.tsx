import { useState, useEffect } from 'react';
import { Home, Settings, Users, GitBranch, ClipboardList } from 'lucide-react';
import TariffRateConfiguration from './TariffRateConfiguration';
import ULBAdminDCBAdjustment from './ULBAdminDCBAdjustment';
import ULBAdminDCBCorrection from './ULBAdminDCBCorrection';
import UnifiedSidebar from './UnifiedSidebar';
import type { SidebarMenuItem } from './UnifiedSidebar';

type View = 'overview' | 'user-management' | 'workflow-config' | 'tariff-config' | 'dcb-adjustment' | 'dcb-correction';

// ─── Overview Component ─────────────────────────────────────────────────────
function OverviewContent() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
          ULB Admin Overview
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
          Welcome to the ULB Administration Panel
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
            Welcome, Administrator
          </h2>
          <p className="text-gray-700 font-['Poppins',sans-serif] leading-relaxed mb-4">
            As a ULB Admin, you can manage system configurations, user accounts, and service parameters for the Jalanidhi portal. Use the navigation menu to access different modules.
          </p>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">12</p>
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">Active Users</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-700 font-['Poppins',sans-serif]">3</p>
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">Workflows</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-amber-700 font-['Poppins',sans-serif]">5</p>
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">Tariff Rates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder Components ─────────────────────────────────────────────────
function UserManagementPlaceholder() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
          User Management
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
          Manage user accounts and permissions
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-[#1f3a5f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-[#1f3a5f]" />
        </div>
        <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
          Coming Soon
        </h2>
        <p className="text-sm text-gray-500 font-['Poppins',sans-serif]">
          User management features will be available in a future update.
        </p>
      </div>
    </div>
  );
}

function WorkflowConfigPlaceholder() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
          Workflow Configuration
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
          Configure approval workflows
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-[#1f3a5f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <GitBranch className="w-8 h-8 text-[#1f3a5f]" />
        </div>
        <h3 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
          Coming Soon
        </h3>
        <p className="text-sm text-gray-400 font-['Poppins',sans-serif]">
          Workflow configuration features will be available in a future update.
        </p>
      </div>
    </div>
  );
}

// ─── Main ULB Admin Page ────────────────────────────────────────────────────
export default function ULBAdminPage() {
  const [currentView, setCurrentView] = useState<View>(() => {
    const saved = localStorage.getItem('ulb_admin_currentView');
    return (saved as View) || 'overview';
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem('ulb_admin_currentView', currentView);
  }, [currentView]);

  const sidebarItems: SidebarMenuItem[] = [
    {
      id: 'ulb-overview',
      label: 'Overview',
      icon: <Home className="w-[18px] h-[18px]" />,
      path: 'overview',
    },
    {
      id: 'ulb-user-mgmt',
      label: 'User Management',
      icon: <Users className="w-[18px] h-[18px]" />,
      path: 'user-management',
    },
    {
      id: 'ulb-dcb',
      label: 'DCB',
      icon: <ClipboardList className="w-[18px] h-[18px]" />,
      children: [
        {
          id: 'ulb-dcb-correction',
          label: 'Correction',
          path: 'dcb-correction',
        },
      ],
    },
    {
      id: 'ulb-config',
      label: 'Configurations',
      icon: <Settings className="w-[18px] h-[18px]" />,
      children: [
        {
          id: 'ulb-cfg-workflow',
          label: 'Workflow Configuration',
          path: 'workflow-config',
        },
        {
          id: 'ulb-cfg-tariff',
          label: 'Tariff Rate Configuration',
          path: 'tariff-config',
        },
        {
          id: 'ulb-cfg-dcb-adj',
          label: 'DCB Adjustment',
          path: 'dcb-adjustment',
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-[#f5f5fa]">
      {/* Sidebar */}
      <UnifiedSidebar
        title="ULB Admin Panel"
        items={sidebarItems}
        activePath={currentView}
        onNavigate={(view) => setCurrentView(view as View)}
        storageKey="ulbAdminSidebar"
        collapsible={true}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {currentView === 'overview' && <OverviewContent />}
          {currentView === 'user-management' && <UserManagementPlaceholder />}
          {currentView === 'workflow-config' && <WorkflowConfigPlaceholder />}
          {currentView === 'tariff-config' && <TariffRateConfiguration />}
          {currentView === 'dcb-adjustment' && <ULBAdminDCBAdjustment />}
          {currentView === 'dcb-correction' && <ULBAdminDCBCorrection />}
        </div>
      </main>
    </div>
  );
}
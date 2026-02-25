import { useState, useEffect } from 'react';
import { Home, Droplet } from 'lucide-react';
import CommissionerDashboard from './CommissionerDashboard';
import CommissionerApplicationView from './CommissionerApplicationView';
import CommissionerReconnectionView from './CommissionerReconnectionView';
import CommissionerDisconnectionView from './CommissionerDisconnectionView';
import CommissionerPaymentVerification from './CommissionerPaymentVerification';
import CommissionerPlumberLicenseDashboard from './CommissionerPlumberLicenseDashboard';
import CommissionerPlumberLicenseRenewalDashboard from './CommissionerPlumberLicenseRenewalDashboard';
import CommissionerChangeConnectionView from './CommissionerChangeConnectionView';
import CommissionerLegacyDataDashboard from './CommissionerLegacyDataDashboard';
import CommissionerLegacyDataReviewView from './CommissionerLegacyDataReviewView';
import CommissionerAppealDashboard from './CommissionerAppealDashboard';
import CommissionerDCBCorrectionDashboard from './CommissionerDCBCorrectionDashboard';
import CommissionerDCBCorrectionView from './CommissionerDCBCorrectionView';
import UnifiedSidebar from './UnifiedSidebar';
import type { SidebarMenuItem } from './UnifiedSidebar';

type View = 'overview' | 'tap-connection' | 'tap-reconnection' | 'tap-disconnection' | 'application-view' | 'reconnection-view' | 'disconnection-view' | 'payment-verification' | 'change-connection-type' | 'change-connection-view' | 'plumber-license-new' | 'plumber-license-renewal' | 'legacy-data' | 'legacy-data-view' | 'appeal-new-tap' | 'dcb-correction' | 'dcb-correction-view';

// Overview Component
function OverviewContent() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
          Commissioner Overview
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
          Welcome to the Commissioner Dashboard
        </p>
      </div>

      {/* Welcome Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
            Welcome, Commissioner
          </h2>
          <p className="text-gray-700 font-['Poppins',sans-serif] leading-relaxed mb-4">
            You have access to review and approve applications across Jalanidhi services. Use the navigation menu to access different modules.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h3 className="text-sm font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
              Quick Navigation
            </h3>
            <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
              Select <strong>Jalanidhi &rarr; Tap Connection &rarr; New Connection Request</strong> from the sidebar to view pending applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommissionerPage() {
  const [currentView, setCurrentView] = useState<View>(() => {
    const saved = localStorage.getItem('commissioner_currentView');
    return (saved as View) || 'overview';
  });
  
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(() => {
    const saved = localStorage.getItem('commissioner_selectedApplicationId');
    return saved || null;
  });

  // Track which dashboard the user came from for back navigation
  const [viewingFromDashboard, setViewingFromDashboard] = useState<'tap-connection' | 'tap-reconnection' | 'tap-disconnection' | 'change-connection-type'>(() => {
    const saved = localStorage.getItem('commissioner_viewingFromDashboard');
    if (saved === 'tap-reconnection' || saved === 'tap-disconnection' || saved === 'change-connection-type') return saved;
    return 'tap-connection';
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('commissioner_currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    if (selectedApplicationId) {
      localStorage.setItem('commissioner_selectedApplicationId', selectedApplicationId);
    } else {
      localStorage.removeItem('commissioner_selectedApplicationId');
    }
  }, [selectedApplicationId]);

  useEffect(() => {
    localStorage.setItem('commissioner_viewingFromDashboard', viewingFromDashboard);
  }, [viewingFromDashboard]);

  const handleViewApplication = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    if (viewingFromDashboard === 'tap-reconnection') {
      setCurrentView('reconnection-view');
    } else if (viewingFromDashboard === 'tap-disconnection') {
      setCurrentView('disconnection-view');
    } else if (viewingFromDashboard === 'change-connection-type') {
      setCurrentView('change-connection-view');
    } else {
      setCurrentView('application-view');
    }
  };

  const handleViewLegacyApplication = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setCurrentView('legacy-data-view');
  };

  const handleBackToDashboard = () => {
    setCurrentView(viewingFromDashboard as View);
    setSelectedApplicationId(null);
  };

  const handleBackToLegacyDashboard = () => {
    setCurrentView('legacy-data');
    setSelectedApplicationId(null);
  };

  const handleViewDCBCorrection = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setCurrentView('dcb-correction-view');
  };

  const handleBackToDCBCorrectionDashboard = () => {
    setCurrentView('dcb-correction');
    setSelectedApplicationId(null);
  };

  // Sidebar navigation handler — maps view-name paths to state changes
  const handleSidebarNavigate = (viewName: string) => {
    setSelectedApplicationId(null);
    if (viewName === 'tap-connection' || viewName === 'tap-disconnection' || viewName === 'tap-reconnection' || viewName === 'change-connection-type') {
      setViewingFromDashboard(viewName as any);
    }
    setCurrentView(viewName as View);
  };

  const sidebarItems: SidebarMenuItem[] = [
    {
      id: 'comm-overview',
      label: 'Overview',
      icon: <Home className="w-[18px] h-[18px]" />,
      path: 'overview',
    },
    {
      id: 'comm-jalanidhi',
      label: 'Jalanidhi',
      icon: <Droplet className="w-[18px] h-[18px]" />,
      children: [
        {
          id: 'comm-plumber-license',
          label: 'Plumber License',
          children: [
            { id: 'comm-pl-new', label: 'New Application', path: 'plumber-license-new' },
            { id: 'comm-pl-renewal', label: 'Renewal of License', path: 'plumber-license-renewal' },
          ],
        },
        {
          id: 'comm-tap-connection',
          label: 'Tap Connection',
          children: [
            { id: 'comm-tc-new', label: 'New Connection Request', path: 'tap-connection', matchPaths: ['application-view'] },
            { id: 'comm-tc-disconn', label: 'Disconnection Requests', path: 'tap-disconnection', matchPaths: ['disconnection-view'] },
            { id: 'comm-tc-reconn', label: 'Reconnection Requests', path: 'tap-reconnection', matchPaths: ['reconnection-view'] },
            { id: 'comm-tc-change', label: 'Change of Connection Type', path: 'change-connection-type', matchPaths: ['change-connection-view'] },
            { id: 'comm-tc-payment', label: 'Payment Verification', path: 'payment-verification' },
          ],
        },
        {
          id: 'comm-legacy',
          label: 'Legacy Data Applications',
          path: 'legacy-data',
          matchPaths: ['legacy-data-view'],
        },
        {
          id: 'comm-appeal',
          label: 'Appealed Applications',
          path: 'appeal-new-tap',
        },
        {
          id: 'comm-dcb',
          label: 'DCB Correction Applications',
          path: 'dcb-correction',
          matchPaths: ['dcb-correction-view'],
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-[#f5f5fa]">
      {/* Sidebar */}
      <UnifiedSidebar
        title="Commissioner Panel"
        items={sidebarItems}
        activePath={currentView}
        onNavigate={handleSidebarNavigate}
        storageKey="commissionerSidebar"
        collapsible={true}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {currentView === 'overview' && <OverviewContent />}
          {currentView === 'tap-connection' && (
            <CommissionerDashboard onViewApplication={handleViewApplication} applicationType="newConnection" />
          )}
          {currentView === 'tap-reconnection' && (
            <CommissionerDashboard onViewApplication={handleViewApplication} applicationType="reconnection" />
          )}
          {currentView === 'tap-disconnection' && (
            <CommissionerDashboard onViewApplication={handleViewApplication} applicationType="disconnection" />
          )}
          {currentView === 'application-view' && selectedApplicationId && (
            <CommissionerApplicationView
              applicationId={selectedApplicationId}
              onBack={handleBackToDashboard}
            />
          )}
          {currentView === 'reconnection-view' && selectedApplicationId && (
            <CommissionerReconnectionView
              applicationId={selectedApplicationId}
              onBack={handleBackToDashboard}
            />
          )}
          {currentView === 'disconnection-view' && selectedApplicationId && (
            <CommissionerDisconnectionView
              applicationId={selectedApplicationId}
              onBack={handleBackToDashboard}
            />
          )}
          {currentView === 'payment-verification' && (
            <CommissionerPaymentVerification />
          )}
          {currentView === 'plumber-license-new' && (
            <CommissionerPlumberLicenseDashboard />
          )}
          {currentView === 'plumber-license-renewal' && (
            <CommissionerPlumberLicenseRenewalDashboard />
          )}
          {currentView === 'change-connection-type' && (
            <CommissionerDashboard onViewApplication={handleViewApplication} applicationType="changeConnection" />
          )}
          {currentView === 'change-connection-view' && selectedApplicationId && (
            <CommissionerChangeConnectionView
              applicationId={selectedApplicationId}
              onBack={handleBackToDashboard}
            />
          )}
          {currentView === 'legacy-data' && (
            <CommissionerLegacyDataDashboard onViewApplication={handleViewLegacyApplication} />
          )}
          {currentView === 'legacy-data-view' && selectedApplicationId && (
            <CommissionerLegacyDataReviewView
              applicationId={selectedApplicationId}
              onBack={handleBackToLegacyDashboard}
            />
          )}
          {currentView === 'appeal-new-tap' && (
            <CommissionerAppealDashboard />
          )}
          {currentView === 'dcb-correction' && (
            <CommissionerDCBCorrectionDashboard onViewApplication={handleViewDCBCorrection} />
          )}
          {currentView === 'dcb-correction-view' && selectedApplicationId && (
            <CommissionerDCBCorrectionView
              applicationId={selectedApplicationId}
              onBack={handleBackToDCBCorrectionDashboard}
            />
          )}
        </div>
      </main>
    </div>
  );
}
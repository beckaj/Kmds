import { useState, useEffect } from "react";
import Header from "../imports/Header";
import Footer from "../imports/Footer";
import Sidebar from "./components/Sidebar";
import CitizenServices from "./components/CitizenServices";
import JalanihiSidebar from "./components/JalanihiSidebar";
import JalanihiOverview from "./components/jalanidhi/JalanihiOverview";
import NewTapConnection from "./components/jalanidhi/NewTapConnection";
import ApplicationStatus from "./components/jalanidhi/ApplicationStatus";
import TapReconnection from "./components/jalanidhi/TapReconnection";
import TapDisconnection from "./components/jalanidhi/TapDisconnection";
import PlumberDashboard from "./components/jalanidhi/PlumberDashboard";
import CaseworkerOverview from "./components/jalanidhi/CaseworkerOverview";
import CaseworkerDashboard from "./components/jalanidhi/CaseworkerDashboard";
import CaseworkerSidebar from "./components/jalanidhi/CaseworkerSidebar";
import { CaseworkerReconnectionDashboard } from "./components/jalanidhi/caseworker/reconnection";
import { CaseworkerDisconnectionDashboard } from "./components/jalanidhi/caseworker/disconnection";
import { FieldEngineerReconnectionDashboard } from "./components/jalanidhi/field-engineer/reconnection";
import FieldEngineerSidebar from "./components/jalanidhi/FieldEngineerSidebar";
import FieldEngineerDashboard from "./components/jalanidhi/FieldEngineerDashboard";
import FieldEngineerApplicationView from "./components/jalanidhi/FieldEngineerApplicationView";
import FieldEngineerScheduleVisit from "./components/jalanidhi/FieldEngineerScheduleVisit";
import FieldEngineerMobileApp from "./components/mobile/FieldEngineerMobileApp";
import PlumberMobileApp from "./components/mobile/PlumberMobileApp";
import FieldEngineerReconnectionView from "./components/jalanidhi/FieldEngineerReconnectionView";
import FieldEngineerInstallationView from "./components/jalanidhi/FieldEngineerInstallationView";
import FieldEngineerDisconnectionView from "./components/jalanidhi/FieldEngineerDisconnectionView";
import FieldEngineerChangeConnectionView from "./components/jalanidhi/FieldEngineerChangeConnectionView";
import FieldEngineerChangeConnectionVerifyView from "./components/jalanidhi/FieldEngineerChangeConnectionVerifyView";
import FieldEngineerLegacyDataReviewView from "./components/jalanidhi/FELegacyDataReviewView";
import RevenueOfficerSidebar from "./components/jalanidhi/RevenueOfficerSidebar";
import RevenueOfficerDashboard from "./components/jalanidhi/RevenueOfficerDashboard";
import RevenueOfficerApplicationView from "./components/jalanidhi/RevenueOfficerApplicationView";
import RevenueOfficerForwardPage from "./components/jalanidhi/RevenueOfficerForwardPage";
import { RevenueOfficerReconnectionDashboard, RevenueOfficerReconnectionView } from "./components/jalanidhi/revenue-officer/reconnection";
import RevenueOfficerChangeConnectionView from "./components/jalanidhi/RevenueOfficerChangeConnectionView";
import RevenueOfficerDCBCorrectionView from "./components/jalanidhi/RevenueOfficerDCBCorrectionView";
import RevenueOfficerOverview from "./components/jalanidhi/RevenueOfficerOverview";
import CommissionerPage from "./components/jalanidhi/CommissionerPage";
import ULBAdminPage from "./components/jalanidhi/ULBAdminPage";
import DMAAdminPage from "./components/jalanidhi/DMAAdminPage";
import PlumberRegistrationForm from "./components/jalanidhi/PlumberRegistrationForm";
import CaseworkerPlumberLicenseDashboard from "./components/jalanidhi/CaseworkerPlumberLicenseDashboard";
import CaseworkerPlumberLicenseRenewalDashboard from "./components/jalanidhi/CaseworkerPlumberLicenseRenewalDashboard";
import PlumberLicenseStatus from "./components/jalanidhi/PlumberLicenseStatus";
import FieldEngineerPlumberLicenseDashboard from "./components/jalanidhi/FieldEngineerPlumberLicenseDashboard";
import FieldEngineerPlumberLicenseRenewalDashboard from "./components/jalanidhi/FieldEngineerPlumberLicenseRenewalDashboard";
import PlumberLicenseRenewal from "./components/jalanidhi/PlumberLicenseRenewal";
import BillCollectorDetails from "./components/jalanidhi/BillCollectorDetails";
import AssignWardToBillCollectors from "./components/jalanidhi/AssignWardToBillCollectors";
import FEBillCollectorApplications from "./components/jalanidhi/FEBillCollectorApplications";
import BillCollectorMobileApp from "./components/mobile/BillCollectorMobileApp";
import ChangeOfConnectionType from "./components/jalanidhi/ChangeOfConnectionType";
import CaseworkerDCBCorrectionView from "./components/jalanidhi/CaseworkerDCBCorrectionView";
import CaseworkerDCBCorrectionTracker from "./components/jalanidhi/CaseworkerDCBCorrectionTracker";
import RevenueOfficerDCBCorrectionDashboard from "./components/jalanidhi/RevenueOfficerDCBCorrectionDashboard";
import CaseworkerLegacyDataEntryView from "./components/jalanidhi/CaseworkerLegacyDataEntryView";
import CaseworkerLegacyApplicationsView from "./components/jalanidhi/CaseworkerLegacyApplicationsView";
import FELegacyDataApplicationsView from "./components/jalanidhi/FELegacyDataApplicationsView";
import CitizenRequestAppeal from "./components/jalanidhi/CitizenRequestAppeal";
import CitizenAppealStatus from "./components/jalanidhi/CitizenAppealStatus";
import ProjectDirectorPage from "./components/jalanidhi/ProjectDirectorPage";
import PaymentReceipts from "./components/jalanidhi/PaymentReceipts";
import DCBStatement from "./components/jalanidhi/DCBStatement";
import KMFReport from "./components/jalanidhi/KMFReport";
import NonMeteredReceipts from "./components/jalanidhi/NonMeteredReceipts";
import NonMeteredKMFReport from "./components/jalanidhi/NonMeteredKMFReport";
import CitizenGeneratedBills from "./components/jalanidhi/CitizenGeneratedBills";
import Login from "./components/Login";
import DevUtils from "./components/DevUtils";
import DevTools from "./components/DevTools";
import TaskChecklist from "./components/jalanidhi/TaskChecklist";
import { ArrowLeft, User, Wrench, Home, ChevronRight } from "lucide-react";
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export default function App() {
  // Initialize state from localStorage to persist across page refreshes
  // Force HMR refresh
  const [activePath, setActivePath] = useState(() => {
    const saved = localStorage.getItem('app_activePath');
    return saved || "/";
  });
  
  const [userRole, setUserRole] = useState<"citizen" | "department" | null>(() => {
    const saved = localStorage.getItem('app_userRole');
    return saved ? (saved as "citizen" | "department") : null;
  });
  
  const [userData, setUserData] = useState<any>(() => {
    const saved = localStorage.getItem('userData');
    return saved ? JSON.parse(saved) : null;
  });

  const [showDevUtils, setShowDevUtils] = useState(false);

  // Persist activePath to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('app_activePath', activePath);
  }, [activePath]);

  // Persist userRole to localStorage whenever it changes
  useEffect(() => {
    if (userRole) {
      localStorage.setItem('app_userRole', userRole);
    } else {
      localStorage.removeItem('app_userRole');
    }
  }, [userRole]);

  // Persist userData to localStorage whenever it changes
  useEffect(() => {
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    } else {
      localStorage.removeItem('userData');
    }
  }, [userData]);

  // Keyboard shortcut to open Dev Utils (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setShowDevUtils(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // One-time data migration: Patch TAP-1771565458488-BZOVA8 connectionType to Non-Metered AND propertyType to domestic
  useEffect(() => {
    const MIGRATION_KEY = 'migration_fix_TAP1771565458488_v3';
    if (localStorage.getItem(MIGRATION_KEY)) return;

    // Clear any stale migration keys from previous versions
    localStorage.removeItem('migration_nonmetered_TAP1771565458488');
    localStorage.removeItem('migration_propertytype_TAP1771565458488');
    localStorage.removeItem('migration_fix_TAP1771565458488_v2');

    const patchApp = async () => {
      try {
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-698be164/dev/patch-application`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              applicationId: 'TAP-1771565458488-BZOVA8',
              patch: {
                connectionDetails: {
                  connectionType: 'Non-Metered',
                  propertyType: 'domestic',
                },
              },
            }),
          }
        );
        const data = await res.json();
        if (data && data.success) {
          localStorage.setItem(MIGRATION_KEY, 'done');
          console.log('[MIGRATION v3] Patched TAP-1771565458488-BZOVA8 connectionType=Non-Metered, propertyType=domestic:', data);
        } else {
          console.log('[MIGRATION v3] Patch response (may not exist yet):', data);
        }
      } catch (err) {
        console.log('[MIGRATION v3] Patch error (non-fatal):', err);
      }
    };
    patchApp();
  }, []);

  const handleNavigation = (path: string) => {
    setActivePath(path);
    console.log("Navigating to:", path);
  };

  // Listen for custom navigate events
  useEffect(() => {
    const handleCustomNavigate = (event: any) => {
      const path = event.detail;
      handleNavigation(path);
    };

    window.addEventListener('navigate', handleCustomNavigate);
    
    return () => {
      window.removeEventListener('navigate', handleCustomNavigate);
    };
  }, []);

  const handleBack = () => {
    // Smart back navigation
    if (activePath.startsWith("/jalanidhi/")) {
      setActivePath("/jalanidhi");
    } else {
      setActivePath("/");
    }
    console.log("Going back");
  };

  const handleLogin = async (type: 'citizen' | 'department', user: any) => {
    setUserRole(type);
    setUserData(user);
    
    // Store user data in localStorage for Header to access
    localStorage.setItem('userData', JSON.stringify(user));
    
    // Redirect based on user role
    if (type === 'department') {
      if (user.role === 'caseworker') {
        setActivePath('/jalanidhi/caseworker/overview');
      } else if (user.role === 'field_engineer' || user.role === 'field-engineer') {
        setActivePath('/jalanidhi/field-engineer/tap-connection/new-requests');
      } else if (user.role === 'revenue_officer' || user.role === 'revenue-officer') {
        setActivePath('/jalanidhi/revenue-officer/overview');
      } else if (user.role === 'commissioner') {
        setActivePath('/jalanidhi/commissioner/tap-connection');
      } else if (user.role === 'ulb_admin' || user.role === 'ulb-admin') {
        setActivePath('/jalanidhi/ulb-admin/overview');
      } else if (user.role === 'project_director' || user.role === 'project-director') {
        setActivePath('/jalanidhi/project-director/appeal');
      } else if (user.role === 'dma_admin' || user.role === 'dma-admin') {
        setActivePath('/jalanidhi/dma-admin/overview');
      } else {
        setActivePath('/');
      }
    } else {
      setActivePath('/');
    }
    
    console.log("Logged in as:", type, user);
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserData(null);
    setActivePath("/");
    localStorage.clear();
  };

  // Show login page if not logged in
  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  // Render content based on active path
  const renderContent = () => {
    // Handle dynamic routes for field engineer
    if (activePath.startsWith("/jalanidhi/field-engineer/tap-connection/reconnection/view/")) {
      const appId = activePath.split('/').pop();
      return <FieldEngineerReconnectionView applicationId={appId!} />;
    }

    if (activePath.startsWith("/jalanidhi/field-engineer/tap-connection/installation/view/")) {
      const appId = activePath.split('/').pop();
      return <FieldEngineerInstallationView applicationId={appId!} />;
    }

    if (activePath.startsWith("/jalanidhi/field-engineer/tap-connection/disconnection/view/")) {
      const appId = activePath.split('/').pop();
      return <FieldEngineerDisconnectionView applicationId={appId!} />;
    }

    if (activePath.startsWith("/jalanidhi/field-engineer/tap-connection/change-connection/view/")) {
      const appId = activePath.split('/').pop();
      return <FieldEngineerChangeConnectionView applicationId={appId!} />;
    }

    if (activePath.startsWith("/jalanidhi/field-engineer/tap-connection/change-connection/verify/")) {
      const appId = activePath.split('/').pop();
      return <FieldEngineerChangeConnectionVerifyView applicationId={appId!} />;
    }

    if (activePath.startsWith("/jalanidhi/field-engineer/tap-connection/legacy-data/view/")) {
      const appId = activePath.split('/').pop();
      return <FieldEngineerLegacyDataReviewView applicationId={appId!} />;
    }

    if (activePath.startsWith("/jalanidhi/field-engineer/tap-connection/view/")) {
      const appId = activePath.split('/').pop();
      return <FieldEngineerApplicationView applicationId={appId!} />;
    }
    
    if (activePath.startsWith("/jalanidhi/field-engineer/tap-connection/schedule/")) {
      const appId = activePath.split('/').pop();
      return <FieldEngineerScheduleVisit applicationId={appId!} />;
    }
    
    // Handle dynamic routes for revenue officer
    if (activePath.startsWith("/jalanidhi/revenue-officer/tap-connection/reconnection/view/")) {
      const appId = activePath.split('/').pop();
      return <RevenueOfficerReconnectionView applicationId={appId!} />;
    }

    if (activePath.startsWith("/jalanidhi/revenue-officer/tap-connection/change-connection/view/")) {
      const appId = activePath.split('/').pop();
      return <RevenueOfficerChangeConnectionView applicationId={appId!} />;
    }

    if (activePath.startsWith("/jalanidhi/revenue-officer/tap-connection/dcb-correction/view/")) {
      const appId = activePath.split('/').pop();
      return <RevenueOfficerDCBCorrectionView applicationId={appId!} />;
    }

    if (activePath.startsWith("/jalanidhi/revenue-officer/tap-connection/view/")) {
      const appId = activePath.split('/').pop();
      return <RevenueOfficerApplicationView applicationId={appId!} />;
    }
    
    if (activePath.startsWith("/jalanidhi/revenue-officer/tap-connection/forward/")) {
      const appId = activePath.split('/').pop();
      return <RevenueOfficerForwardPage applicationId={appId!} />;
    }

    switch (activePath) {
      case "/jalanidhi":
        return <JalanihiOverview onNavigate={handleNavigation} />;
      
      case "/jalanidhi/tap/new":
        return <NewTapConnection onSuccess={(appId) => {
          console.log("Application submitted:", appId);
          alert(`Application submitted successfully! Application ID: ${appId}`);
        }} />;
      
      case "/jalanidhi/tap/status":
        return <ApplicationStatus />;
      
      case "/jalanidhi/tap/reconnect":
        return <TapReconnection />;
      
      case "/jalanidhi/tap/disconnect":
        return <TapDisconnection />;
      
      case "/jalanidhi/tap/change-connection":
        return <ChangeOfConnectionType />;
      
      case "/jalanidhi/plumber/dashboard":
        return <PlumberDashboard />;
      
      case "/jalanidhi/plumber/register":
        return <PlumberRegistrationForm />;
      
      case "/jalanidhi/plumber/application-status":
        return <PlumberLicenseStatus />;
      
      case "/jalanidhi/plumber/renew":
        return <PlumberLicenseRenewal />;
      
      case "/jalanidhi/caseworker/dashboard":
      case "/jalanidhi/caseworker/overview":
        return <CaseworkerOverview onNavigate={handleNavigation} />;
      
      case "/jalanidhi/caseworker/tap-connection/new-requests":
        return <CaseworkerDashboard applicationType="newConnection" />;
      
      case "/jalanidhi/caseworker/tap-connection/reconnection-requests":
        return <CaseworkerReconnectionDashboard />;
      
      case "/jalanidhi/caseworker/tap-connection/disconnection-requests":
        return <CaseworkerDisconnectionDashboard />;
      
      case "/jalanidhi/caseworker/tap-connection/change-connection-type":
        return <CaseworkerDashboard applicationType="changeConnection" />;
      
      case "/jalanidhi/caseworker/tap-connection/dcb-correction":
        return <CaseworkerDCBCorrectionView />;
      
      case "/jalanidhi/caseworker/tap-connection/dcb-correction-tracker":
        return <CaseworkerDCBCorrectionTracker />;
      
      case "/jalanidhi/caseworker/plumber-license/new-applications":
        return <CaseworkerPlumberLicenseDashboard />;
      
      case "/jalanidhi/caseworker/plumber-license/renewal":
        return <CaseworkerPlumberLicenseRenewalDashboard />;
      
      case "/jalanidhi/caseworker/meter-management/bill-collector-details":
        return <BillCollectorDetails />;
      
      case "/jalanidhi/caseworker/meter-management/assign-ward":
        return <AssignWardToBillCollectors />;
      
      case "/jalanidhi/caseworker/tap-connection/legacy-data-entry":
        return <CaseworkerLegacyDataEntryView />;
      
      case "/jalanidhi/caseworker/tap-connection/legacy-data-applications":
        return <CaseworkerLegacyApplicationsView />;
      
      case "/jalanidhi/field-engineer/tap-connection/new-requests":
        return <FieldEngineerDashboard applicationType="newConnection" />;
      
      case "/jalanidhi/field-engineer/tap-connection/reconnection-requests":
        return <FieldEngineerReconnectionDashboard />;
      
      case "/jalanidhi/field-engineer/tap-connection/disconnection-requests":
        return <FieldEngineerDashboard applicationType="disconnection" />;
      
      case "/jalanidhi/field-engineer/tap-connection/change-connection-type":
        return <FieldEngineerDashboard applicationType="changeConnection" />;
      
      case "/jalanidhi/field-engineer/plumber-license/new-applications":
        return <FieldEngineerPlumberLicenseDashboard />;
      
      case "/jalanidhi/field-engineer/plumber-license/renewal":
        return <FieldEngineerPlumberLicenseRenewalDashboard />;
      
      case "/jalanidhi/field-engineer/meter-management/bill-collector-applications":
        return <FEBillCollectorApplications />;
      
      case "/jalanidhi/field-engineer/tap-connection/legacy-data-applications":
        return <FELegacyDataApplicationsView />;
      
      case "/jalanidhi/field-engineer/meter-management/installation":
      case "/jalanidhi/field-engineer/meter-management/replacement":
      case "/jalanidhi/field-engineer/meter-management/reading":
        return (
          <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
            <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
              {activePath.includes('installation') ? 'Meter Installation' : activePath.includes('replacement') ? 'Meter Replacement' : 'Meter Reading'}
            </h1>
            <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-6">This module is under development.</p>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-[#1f3a5f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔧</span>
              </div>
              <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">Coming Soon</h2>
              <p className="text-sm text-gray-500 font-['Poppins',sans-serif]">This feature will be available in a future update.</p>
            </div>
          </div>
        );
      
      case "/jalanidhi/revenue-officer/dashboard":
      case "/jalanidhi/revenue-officer/overview":
        return <RevenueOfficerOverview onNavigate={handleNavigation} />;

      case "/jalanidhi/revenue-officer/tap-connection/new-requests":
        return <RevenueOfficerDashboard applicationType="newConnection" />;
      
      case "/jalanidhi/revenue-officer/tap-connection/reconnection-requests":
        return <RevenueOfficerReconnectionDashboard />;
      
      case "/jalanidhi/revenue-officer/tap-connection/disconnection-requests":
        return <RevenueOfficerDashboard applicationType="disconnection" />;
      
      case "/jalanidhi/revenue-officer/tap-connection/change-connection-type":
        return <RevenueOfficerDashboard applicationType="changeConnection" />;
      
      case "/jalanidhi/revenue-officer/tap-connection/dcb-correction":
        return <RevenueOfficerDCBCorrectionDashboard />;
      
      case "/jalanidhi/commissioner/overview":
      case "/jalanidhi/commissioner/tap-connection":
        return <CommissionerPage />;
      
      case "/jalanidhi/ulb-admin/overview":
      case "/jalanidhi/ulb-admin/tap-connection":
        return <ULBAdminPage />;
      
      case "/jalanidhi/dma-admin/overview":
      case "/jalanidhi/dma-admin/tap-connection":
        return <DMAAdminPage />;
      
      case "/jalanidhi/field-engineer/mobile":
        return <FieldEngineerMobileApp />;
      
      case "/jalanidhi/plumber/mobile":
        return <PlumberMobileApp />;
      
      case "/jalanidhi/bill-collector/mobile":
        return <BillCollectorMobileApp />;

      case "/jalanidhi/appeal/request":
        return <CitizenRequestAppeal />;

      case "/jalanidhi/appeal/status":
        return <CitizenAppealStatus />;

      case "/jalanidhi/project-director/appeal":
        return <ProjectDirectorPage />;

      case "/jalanidhi/payment/receipts":
      case "/jalanidhi/payment/metered/receipts":
        return <PaymentReceipts />;

      case "/jalanidhi/payment/metered/generated-bills":
        return <CitizenGeneratedBills type="metered" />;

      case "/jalanidhi/payment/non-metered/receipts":
        return <NonMeteredReceipts />;

      case "/jalanidhi/payment/non-metered/generated-bills":
        return <CitizenGeneratedBills type="non-metered" />;

      case "/jalanidhi/payment/dcb-statement":
      case "/jalanidhi/payment/metered/dcb-statement":
      case "/jalanidhi/payment/non-metered/dcb-statement":
        return <DCBStatement />;

      case "/jalanidhi/payment/kmf-report":
      case "/jalanidhi/payment/metered/kmf-report":
        return <KMFReport />;

      case "/jalanidhi/payment/non-metered/kmf-report":
        return <NonMeteredKMFReport />;

      case "/jalanidhi/task-checklist":
        return <TaskChecklist onBack={() => handleNavigation('/jalanidhi')} />;

      default:
        return <CitizenServices onNavigate={handleNavigation} />;
    }
  };

  // Determine if we should show sidebar
  const isMobileApp = activePath === "/jalanidhi/field-engineer/mobile" || activePath === "/jalanidhi/plumber/mobile" || activePath === "/jalanidhi/bill-collector/mobile";
  const roleWithEmbeddedSidebar = (() => {
    const role = userData && userData.role ? userData.role : '';
    return role === 'commissioner' || role === 'ulb_admin' || role === 'ulb-admin' || role === 'project_director' || role === 'project-director' || role === 'dma_admin' || role === 'dma-admin';
  })();
  const showSidebar = activePath.startsWith("/jalanidhi") && !isMobileApp && !roleWithEmbeddedSidebar;
  
  // Determine which sidebar to show
  const renderSidebar = () => {
    if (activePath.startsWith("/jalanidhi")) {
      const role = userData && userData.role ? userData.role : '';
      if (role === 'caseworker') {
        return <CaseworkerSidebar activePath={activePath} onNavigate={handleNavigation} />;
      } else if (role === 'field-engineer' || role === 'field_engineer') {
        return <FieldEngineerSidebar activePath={activePath} onNavigate={handleNavigation} />;
      } else if (role === 'revenue-officer' || role === 'revenue_officer') {
        return <RevenueOfficerSidebar activePath={activePath} onNavigate={handleNavigation} />;
      } else if (role === 'commissioner') {
        // Commissioner uses its own sidebar within CommissionerPage
        return null;
      } else if (role === 'ulb_admin' || role === 'ulb-admin') {
        // ULB Admin uses its own sidebar within ULBAdminPage
        return null;
      } else if (role === 'project_director' || role === 'project-director') {
        // Project Director uses its own sidebar within ProjectDirectorPage
        return null;
      } else if (role === 'dma_admin' || role === 'dma-admin') {
        // DMA Admin uses its own sidebar within DMAAdminPage
        return null;
      }
      return <JalanihiSidebar activePath={activePath} onNavigate={handleNavigation} isPlumber={userData && userData.isPlumber ? true : false} />;
    }
    return <Sidebar activePath={activePath} onNavigate={handleNavigation} />;
  };

  // Show back button for non-home pages
  const showBackButton = activePath !== "/" && activePath !== "/jalanidhi";

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const crumbs = [{ label: "Home", path: "/services" }];
    
    if (activePath.startsWith("/jalanidhi")) {
      crumbs.push({ label: "Jalanidhi", path: "/jalanidhi" });
      
      if (activePath.startsWith("/jalanidhi/tap/")) {
        crumbs.push({ label: "Tap Connection", path: "/jalanidhi/tap" });
        
        if (activePath === "/jalanidhi/tap/new") {
          crumbs.push({ label: "New Connection", path: "/jalanidhi/tap/new" });
        } else if (activePath === "/jalanidhi/tap/reconnect") {
          crumbs.push({ label: "Reconnection", path: "/jalanidhi/tap/reconnect" });
        } else if (activePath === "/jalanidhi/tap/disconnect") {
          crumbs.push({ label: "Disconnection", path: "/jalanidhi/tap/disconnect" });
        } else if (activePath === "/jalanidhi/tap/status") {
          crumbs.push({ label: "Application Status", path: "/jalanidhi/tap/status" });
        } else if (activePath === "/jalanidhi/tap/change-connection") {
          crumbs.push({ label: "Change of Connection Type", path: "/jalanidhi/tap/change-connection" });
        }
      } else if (activePath === "/jalanidhi/borewell") {
        crumbs.push({ label: "Borewell", path: "/jalanidhi/borewell" });
      } else if (activePath === "/jalanidhi/ugd") {
        crumbs.push({ label: "UGD", path: "/jalanidhi/ugd" });
      } else if (activePath.startsWith("/jalanidhi/appeal/")) {
        crumbs.push({ label: "Appeal", path: "/jalanidhi/appeal" });
        if (activePath === "/jalanidhi/appeal/request") {
          crumbs.push({ label: "Request Appeal", path: "/jalanidhi/appeal/request" });
        } else if (activePath === "/jalanidhi/appeal/status") {
          crumbs.push({ label: "Application Status", path: "/jalanidhi/appeal/status" });
        }
      } else if (activePath.startsWith("/jalanidhi/plumber/")) {
        crumbs.push({ label: "Tap Connection", path: "/jalanidhi/tap" });
        crumbs.push({ label: "Plumber License", path: "/jalanidhi/plumber" });
        
        if (activePath === "/jalanidhi/plumber/new") {
          crumbs.push({ label: "New Registration", path: "/jalanidhi/plumber/new" });
        } else if (activePath === "/jalanidhi/plumber/register") {
          crumbs.push({ label: "New Registration", path: "/jalanidhi/plumber/register" });
        } else if (activePath === "/jalanidhi/plumber/renew") {
          crumbs.push({ label: "Renew License", path: "/jalanidhi/plumber/renew" });
        } else if (activePath === "/jalanidhi/plumber/application-status") {
          crumbs.push({ label: "Application Status", path: "/jalanidhi/plumber/application-status" });
        }
      } else if (activePath.startsWith("/jalanidhi/payment/")) {
        crumbs.push({ label: "Payment & Bill History", path: "/jalanidhi/payment" });
        // Determine metered vs non-metered sub-group for breadcrumb
        if (activePath.includes("/metered/")) {
          crumbs.push({ label: "Metered Connection", path: "" });
        } else if (activePath.includes("/non-metered/")) {
          crumbs.push({ label: "Non-Metered Connection", path: "" });
        }
        if (activePath.endsWith("/receipts")) {
          crumbs.push({ label: "Receipts", path: activePath });
        } else if (activePath.endsWith("/generated-bills")) {
          crumbs.push({ label: "Generated Bills", path: activePath });
        } else if (activePath.endsWith("/dcb-statement")) {
          crumbs.push({ label: "DCB Statement", path: activePath });
        } else if (activePath.endsWith("/kmf-report")) {
          crumbs.push({ label: "KMF Report", path: activePath });
        }
      }
    }
    
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const showBreadcrumbs = activePath.startsWith("/jalanidhi") && activePath !== "/jalanidhi/field-engineer/mobile" && activePath !== "/jalanidhi/plumber/mobile" && activePath !== "/jalanidhi/bill-collector/mobile" && !activePath.startsWith("/jalanidhi/commissioner") && !activePath.startsWith("/jalanidhi/ulb-admin") && !activePath.startsWith("/jalanidhi/project-director") && !activePath.startsWith("/jalanidhi/dma-admin");
  
  // Hide header and footer for mobile app only
  const hideHeaderFooter = isMobileApp;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5fa]">
      {/* Header - Fixed at top */}
      {!hideHeaderFooter && (
        <div className="w-full sticky top-0 z-50">
          <Header />
        </div>
      )}

      {/* Main Layout with Conditional Sidebar */}
      <div className="flex flex-1 relative">
        {/* Sidebar - Only show when not on home page */}
        {showSidebar && (
          <div className="sticky top-0 h-screen">
            {renderSidebar()}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {/* Breadcrumbs */}
          {showBreadcrumbs && breadcrumbs.length > 1 && (
            <div className="bg-white border-b border-gray-200 px-[24px] py-[17.5px]">
              <div className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center gap-2">
                    {index > 0 && (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    {index === 0 ? (
                      <button
                        onClick={() => handleNavigation("/services")}
                        className="flex items-center gap-1 text-gray-600 hover:text-[#1f3a5f] transition-colors font-['Poppins',sans-serif]"
                      >
                        <Home className="w-4 h-4" />
                        <span>{crumb.label}</span>
                      </button>
                    ) : index === breadcrumbs.length - 1 ? (
                      <span className="text-[#1f3a5f] font-semibold font-['Poppins',sans-serif]">
                        {crumb.label}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleNavigation(crumb.path)}
                        className="text-gray-600 hover:text-[#1f3a5f] transition-colors font-['Poppins',sans-serif]"
                      >
                        {crumb.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {renderContent()}
        </div>
      </div>

      {/* Footer */}
      {!hideHeaderFooter && (
        <div className="w-full">
          <Footer />
        </div>
      )}
      
      {/* Dev Utils */}
      {showDevUtils && (
        <DevUtils onClose={() => setShowDevUtils(false)} />
      )}
      
      {/* Dev Tools - Always visible for debugging */}
      <DevTools />
    </div>
  );
}
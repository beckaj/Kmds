import { LayoutDashboard, Drill, Scale, IndianRupee, Smartphone } from "lucide-react";
import svgPaths from "../../imports/svg-rswr6g8p9o";
import UnifiedSidebar from "./jalanidhi/UnifiedSidebar";
import type { SidebarMenuItem, SidebarFooterAction } from "./jalanidhi/UnifiedSidebar";

interface JalanihiSidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
  isPlumber?: boolean;
}

// ── Icon Components ──────────────────────────────────────────────────────────

const WaterIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-[18px] h-[18px]"} fill="none" viewBox="0 0 20 20">
    <path d={svgPaths.p1ecd6152} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    <path d={svgPaths.p17796300} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
  </svg>
);

export default function JalanihiSidebar({ activePath, onNavigate, isPlumber = false }: JalanihiSidebarProps) {
  // Determine plumber submenu items based on user type
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isGeneralCitizen = userData.phone === '9876543210' && !isPlumber;

  const plumberChildren: SidebarMenuItem[] = [];
  if (isPlumber) {
    plumberChildren.push({ id: 'plumber-register', label: 'New Registration', path: '/jalanidhi/plumber/register' });
    plumberChildren.push({ id: 'plumber-renew', label: 'Renewal of License', path: '/jalanidhi/plumber/renew' });
    plumberChildren.push({ id: 'plumber-app-status', label: 'Application Status', path: '/jalanidhi/plumber/application-status' });
    plumberChildren.push({ id: 'plumber-dashboard', label: 'Dashboard', path: '/jalanidhi/plumber/dashboard' });
  }
  if (isGeneralCitizen) {
    plumberChildren.push({ id: 'plumber-register', label: 'New Registration', path: '/jalanidhi/plumber/register' });
    plumberChildren.push({ id: 'plumber-app-status', label: 'Application Status', path: '/jalanidhi/plumber/application-status' });
  }

  const tapConnectionChildren: SidebarMenuItem[] = [
    { id: 'tap-new', label: 'New Connection Request', path: '/jalanidhi/tap/new' },
    { id: 'tap-status', label: 'Application Status', path: '/jalanidhi/tap/status' },
    { id: 'tap-disconnect', label: 'Disconnection', path: '/jalanidhi/tap/disconnect' },
    { id: 'tap-reconnect', label: 'Reconnection', path: '/jalanidhi/tap/reconnect' },
    { id: 'tap-change', label: 'Change of Connection Type', path: '/jalanidhi/tap/change-connection' },
  ];

  // Only add Plumber sub-group if there are items to show
  if (plumberChildren.length > 0) {
    tapConnectionChildren.push({
      id: 'plumber-license',
      label: 'Plumber',
      children: plumberChildren,
    });
  }

  const items: SidebarMenuItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
      path: '/jalanidhi',
    },
    {
      id: 'tap-connection',
      label: 'Tap Connection',
      icon: <WaterIcon className="w-[18px] h-[18px]" />,
      children: tapConnectionChildren,
    },
    {
      id: 'appeal',
      label: 'Appeal',
      icon: <Scale className="w-[18px] h-[18px]" />,
      children: [
        { id: 'appeal-request', label: 'Request Appeal', path: '/jalanidhi/appeal/request' },
        { id: 'appeal-status', label: 'Appeal Application Status', path: '/jalanidhi/appeal/status' },
      ],
    },
    {
      id: 'borewell',
      label: 'Borewell',
      icon: <Drill className="w-[18px] h-[18px]" />,
      path: '/jalanidhi/borewell',
    },
    {
      id: 'ugd',
      label: 'UGD',
      icon: <WaterIcon className="w-[18px] h-[18px]" />,
      path: '/jalanidhi/ugd',
    },
    {
      id: 'payment-bill-history',
      label: 'Payment & Bill History',
      icon: <IndianRupee className="w-[18px] h-[18px]" />,
      children: [
        {
          id: 'payment-metered',
          label: 'Metered Connection',
          children: [
            { id: 'metered-generated-bills', label: 'Generated Bills', path: '/jalanidhi/payment/metered/generated-bills' },
            { id: 'metered-receipts', label: 'Receipts', path: '/jalanidhi/payment/metered/receipts' },
            { id: 'metered-dcb', label: 'DCB Statement', path: '/jalanidhi/payment/metered/dcb-statement' },
            { id: 'metered-kmf', label: 'KMF Report', path: '/jalanidhi/payment/metered/kmf-report' },
          ],
        },
        {
          id: 'payment-non-metered',
          label: 'Non-Metered Connection',
          children: [
            { id: 'non-metered-generated-bills', label: 'Generated Bills', path: '/jalanidhi/payment/non-metered/generated-bills' },
            { id: 'non-metered-receipts', label: 'Receipts', path: '/jalanidhi/payment/non-metered/receipts' },
            { id: 'non-metered-dcb', label: 'DCB Statement', path: '/jalanidhi/payment/non-metered/dcb-statement' },
            { id: 'non-metered-kmf', label: 'KMF Report', path: '/jalanidhi/payment/non-metered/kmf-report' },
          ],
        },
      ],
    },
  ];

  const footerAction: SidebarFooterAction = {
    label: 'Help',
    onClick: () => console.log('Help clicked'),
  };

  // Mobile App footer link (only for plumber users)
  const mobileAppFooter = isPlumber ? (
    <button
      onClick={() => onNavigate('/jalanidhi/plumber/mobile')}
      className={
        'h-[38px] w-full rounded-lg flex items-center gap-3 px-3 transition-colors whitespace-nowrap ' +
        (activePath === '/jalanidhi/plumber/mobile'
          ? "text-[#1f3a5f] font-semibold bg-[#eef2ff]"
          : "text-[#4b5563] font-medium hover:bg-[#f1f5f9] hover:text-[#1b212d]")
      }
    >
      <Smartphone className="w-[18px] h-[18px] shrink-0" />
      <span className="text-[13.5px] font-['Poppins',sans-serif]">Mobile App</span>
    </button>
  ) : null;

  return (
    <UnifiedSidebar
      title="DMA Karnataka"
      items={items}
      activePath={activePath}
      onNavigate={onNavigate}
      footerAction={footerAction}
      footerContent={mobileAppFooter}
      storageKey="jalanihiSidebar"
    />
  );
}
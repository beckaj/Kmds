import { FileText, Wrench, Gauge, Database, LayoutDashboard, Smartphone } from 'lucide-react';
import UnifiedSidebar from './UnifiedSidebar';
import type { SidebarMenuItem, SidebarFooterAction } from './UnifiedSidebar';

interface CaseworkerSidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
}

export default function CaseworkerSidebar({ activePath, onNavigate }: CaseworkerSidebarProps) {
  const items: SidebarMenuItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
      path: '/jalanidhi/caseworker/overview',
    },
    {
      id: 'plumber-license',
      label: 'Plumber License',
      icon: <Wrench className="w-[18px] h-[18px]" />,
      children: [
        { id: 'cw-pl-new', label: 'New Application', path: '/jalanidhi/caseworker/plumber-license/new-applications' },
        { id: 'cw-pl-renewal', label: 'Renewal of License', path: '/jalanidhi/caseworker/plumber-license/renewal' },
      ],
    },
    {
      id: 'tap-connection',
      label: 'Tap Connection',
      icon: <FileText className="w-[18px] h-[18px]" />,
      children: [
        {
          id: 'cw-tc-new',
          label: 'New Connection Requests',
          path: '/jalanidhi/caseworker/tap-connection/new-requests',
          matchPaths: ['/jalanidhi/caseworker/tap-connection/view/*'],
        },
        {
          id: 'cw-tc-disconn',
          label: 'Disconnection Requests',
          path: '/jalanidhi/caseworker/tap-connection/disconnection-requests',
          matchPaths: ['/jalanidhi/caseworker/tap-connection/disconnection/*'],
        },
        {
          id: 'cw-tc-reconn',
          label: 'Reconnection Requests',
          path: '/jalanidhi/caseworker/tap-connection/reconnection-requests',
          matchPaths: ['/jalanidhi/caseworker/tap-connection/reconnection/*'],
        },
        {
          id: 'cw-tc-change',
          label: 'Change of Connection Type',
          path: '/jalanidhi/caseworker/tap-connection/change-connection-type',
          matchPaths: ['/jalanidhi/caseworker/tap-connection/change-connection/*'],
        },
        {
          id: 'cw-tc-legacy-entry',
          label: 'Legacy Data Entry',
          path: '/jalanidhi/caseworker/tap-connection/legacy-data-entry',
        },
        {
          id: 'cw-tc-legacy-apps',
          label: 'Legacy Data Applications',
          path: '/jalanidhi/caseworker/tap-connection/legacy-data-applications',
          matchPaths: ['/jalanidhi/caseworker/tap-connection/legacy-data/*'],
        },
        {
          id: 'cw-tc-dcb-correction',
          label: 'DCB Correction',
          path: '/jalanidhi/caseworker/tap-connection/dcb-correction',
        },
        {
          id: 'cw-tc-dcb-tracker',
          label: 'DCB Correction Tracker',
          path: '/jalanidhi/caseworker/tap-connection/dcb-correction-tracker',
        },
      ],
    },
    {
      id: 'meter-management',
      label: 'Meter Management',
      icon: <Gauge className="w-[18px] h-[18px]" />,
      children: [
        { id: 'cw-mm-bc-details', label: 'Bill Collector Details', path: '/jalanidhi/caseworker/meter-management/bill-collector-details' },
        { id: 'cw-mm-assign-ward', label: 'Assign Ward', path: '/jalanidhi/caseworker/meter-management/assign-ward' },
      ],
    },
  ];

  const footerAction: SidebarFooterAction = {
    label: 'Bill Collector App',
    subtitle: 'Open bill collector mobile app',
    icon: <Smartphone className="w-5 h-5" />,
    onClick: () => onNavigate('/jalanidhi/bill-collector/mobile'),
    variant: 'gradient',
  };

  return (
    <UnifiedSidebar
      title="Caseworker Panel"
      items={items}
      activePath={activePath}
      onNavigate={onNavigate}
      footerAction={footerAction}
      storageKey="caseworkerSidebar"
    />
  );
}
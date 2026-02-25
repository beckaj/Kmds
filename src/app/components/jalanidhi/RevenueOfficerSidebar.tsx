import { FileText, Wrench, LayoutDashboard } from 'lucide-react';
import UnifiedSidebar from './UnifiedSidebar';
import type { SidebarMenuItem } from './UnifiedSidebar';

interface RevenueOfficerSidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
}

export default function RevenueOfficerSidebar({ activePath, onNavigate }: RevenueOfficerSidebarProps) {
  const items: SidebarMenuItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
      path: '/jalanidhi/revenue-officer/overview',
    },
    {
      id: 'plumber-license',
      label: 'Plumber License',
      icon: <Wrench className="w-[18px] h-[18px]" />,
      children: [
        { id: 'ro-pl-new', label: 'New Application', path: '/jalanidhi/revenue-officer/plumber-license/new-applications' },
        { id: 'ro-pl-renewal', label: 'Renewal of License', path: '/jalanidhi/revenue-officer/plumber-license/renewal' },
      ],
    },
    {
      id: 'tap-connection',
      label: 'Tap Connection',
      icon: <FileText className="w-[18px] h-[18px]" />,
      children: [
        {
          id: 'ro-tc-new',
          label: 'New Connection Requests',
          path: '/jalanidhi/revenue-officer/tap-connection/new-requests',
          matchPaths: ['/jalanidhi/revenue-officer/tap-connection/view/*', '/jalanidhi/revenue-officer/tap-connection/forward/*'],
        },
        { id: 'ro-tc-disconn', label: 'Disconnection Requests', path: '/jalanidhi/revenue-officer/tap-connection/disconnection-requests' },
        {
          id: 'ro-tc-reconn',
          label: 'Reconnection Requests',
          path: '/jalanidhi/revenue-officer/tap-connection/reconnection-requests',
          matchPaths: ['/jalanidhi/revenue-officer/tap-connection/reconnection/*'],
        },
        {
          id: 'ro-tc-change',
          label: 'Change of Connection Type',
          path: '/jalanidhi/revenue-officer/tap-connection/change-connection-type',
          matchPaths: ['/jalanidhi/revenue-officer/tap-connection/change-connection/*'],
        },
        {
          id: 'ro-tc-dcb',
          label: 'DCB Correction Application',
          path: '/jalanidhi/revenue-officer/tap-connection/dcb-correction',
          matchPaths: ['/jalanidhi/revenue-officer/tap-connection/dcb-correction/*'],
        },
      ],
    },
  ];

  return (
    <UnifiedSidebar
      title="Revenue Officer Panel"
      items={items}
      activePath={activePath}
      onNavigate={onNavigate}
      storageKey="revenueOfficerSidebar"
    />
  );
}
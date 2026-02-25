import { FileText, Wrench, Gauge, Smartphone } from 'lucide-react';
import UnifiedSidebar from './UnifiedSidebar';
import type { SidebarMenuItem, SidebarFooterAction } from './UnifiedSidebar';

interface FieldEngineerSidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
}

export default function FieldEngineerSidebar({ activePath, onNavigate }: FieldEngineerSidebarProps) {
  const items: SidebarMenuItem[] = [
    {
      id: 'plumber-license',
      label: 'Plumber License',
      icon: <Wrench className="w-[18px] h-[18px]" />,
      children: [
        { id: 'fe-pl-new', label: 'New Application', path: '/jalanidhi/field-engineer/plumber-license/new-applications' },
        { id: 'fe-pl-renewal', label: 'Renewal of License', path: '/jalanidhi/field-engineer/plumber-license/renewal' },
      ],
    },
    {
      id: 'tap-connection',
      label: 'Tap Connection',
      icon: <FileText className="w-[18px] h-[18px]" />,
      children: [
        {
          id: 'fe-tc-new',
          label: 'New Connection Requests',
          path: '/jalanidhi/field-engineer/tap-connection/new-requests',
          matchPaths: ['/jalanidhi/field-engineer/tap-connection/view/*', '/jalanidhi/field-engineer/tap-connection/schedule/*'],
        },
        {
          id: 'fe-tc-disconn',
          label: 'Disconnection Requests',
          path: '/jalanidhi/field-engineer/tap-connection/disconnection-requests',
          matchPaths: ['/jalanidhi/field-engineer/tap-connection/disconnection/*'],
        },
        {
          id: 'fe-tc-reconn',
          label: 'Reconnection Requests',
          path: '/jalanidhi/field-engineer/tap-connection/reconnection-requests',
          matchPaths: ['/jalanidhi/field-engineer/tap-connection/reconnection/*'],
        },
        {
          id: 'fe-tc-change',
          label: 'Change of Connection Type',
          path: '/jalanidhi/field-engineer/tap-connection/change-connection-type',
          matchPaths: ['/jalanidhi/field-engineer/tap-connection/change-connection/*'],
        },
        {
          id: 'fe-tc-legacy',
          label: 'Legacy Data Applications',
          path: '/jalanidhi/field-engineer/tap-connection/legacy-data-applications',
          matchPaths: ['/jalanidhi/field-engineer/tap-connection/legacy-data/*'],
        },
      ],
    },
    {
      id: 'meter-management',
      label: 'Meter Management',
      icon: <Gauge className="w-[18px] h-[18px]" />,
      children: [
        { id: 'fe-mm-bc', label: 'Bill Collector Applications', path: '/jalanidhi/field-engineer/meter-management/bill-collector-applications' },
      ],
    },
  ];

  const footerAction: SidebarFooterAction = {
    label: 'Open Mobile App',
    subtitle: 'Field visit mobile interface',
    icon: <Smartphone className="w-5 h-5" />,
    onClick: () => onNavigate('/jalanidhi/field-engineer/mobile'),
    variant: 'gradient',
  };

  return (
    <UnifiedSidebar
      title="Field Engineer Panel"
      items={items}
      activePath={activePath}
      onNavigate={onNavigate}
      footerAction={footerAction}
      storageKey="fieldEngineerSidebar"
    />
  );
}

import { useState } from 'react';
import { Scale, User } from 'lucide-react';
import UnifiedSidebar from './UnifiedSidebar';
import type { SidebarMenuItem } from './UnifiedSidebar';
import { ProjectDirectorAppealDashboard, ProjectDirectorAppealView } from './project-director/appeal';

interface AppealApplication {
  id: string;
  ulb: string;
  menu: string;
  subMenu: string;
  dateOfRejection: string;
  dateOfAppealRequested: string;
  reasonForAppeal: string;
  status: string;
  currentStage: string;
  originalApplicationId: string;
  citizenName: string;
  citizenPhone: string;
  applicationDetails: any;
  workflow: any;
}

export default function ProjectDirectorPage() {
  const [activePage, setActivePage] = useState('appeal-new-tap');
  const [selectedAppeal, setSelectedAppeal] = useState<AppealApplication | null>(null);

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  const handleViewAppeal = (appeal: AppealApplication) => {
    setSelectedAppeal(appeal);
  };

  const handleBackToDashboard = () => {
    setSelectedAppeal(null);
  };

  const handleActionComplete = () => {
    setSelectedAppeal(null);
  };

  const sidebarItems: SidebarMenuItem[] = [
    {
      id: 'pd-appeal',
      label: 'Appeal Request',
      icon: <Scale className="w-[18px] h-[18px]" />,
      children: [
        { id: 'pd-appeal-new-tap', label: 'New Tap Connection', path: 'appeal-new-tap' },
      ],
    },
  ];

  const handleSidebarNavigate = (viewName: string) => {
    setSelectedAppeal(null);
    setActivePage(viewName);
  };

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <UnifiedSidebar
        title="Project Director"
        items={sidebarItems}
        activePath={activePage}
        onNavigate={handleSidebarNavigate}
        storageKey="projectDirectorSidebar"
        collapsible={true}
        footerContent={
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 bg-[#1f3a5f]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-[#1f3a5f]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-800 font-['Poppins',sans-serif] truncate">{userData.name || 'Project Director'}</p>
              <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">Project Director</p>
            </div>
          </div>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {selectedAppeal ? (
          <ProjectDirectorAppealView 
            appeal={selectedAppeal}
            onBack={handleBackToDashboard}
            onActionComplete={handleActionComplete}
          />
        ) : (
          <ProjectDirectorAppealDashboard onViewAppeal={handleViewAppeal} />
        )}
      </div>
    </div>
  );
}

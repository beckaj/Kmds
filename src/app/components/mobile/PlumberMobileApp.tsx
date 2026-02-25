import { useState } from 'react';
import PlumberMobileLogin from './PlumberMobileLogin';
import PlumberMobileAppList from './PlumberMobileAppList';
import PlumberReconnectionChecklist from './PlumberReconnectionChecklist';
import PlumberInstallationChecklist from './PlumberInstallationChecklist';
import PlumberDisconnectionChecklist from './PlumberDisconnectionChecklist';
import PlumberChangeConnectionChecklist from './PlumberChangeConnectionChecklist';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

type Screen = 'login' | 'list' | 'checklist' | 'installationChecklist' | 'disconnectionChecklist' | 'changeConnectionChecklist';

export default function PlumberMobileApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [plumberData, setPlumberData] = useState<{ mobile: string; name: string; id: string } | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const handleLoginSuccess = (data: { mobile: string; name: string; id: string }) => {
    setPlumberData(data);
    setCurrentScreen('list');
  };

  const handleViewApplication = (application: any) => {
    setSelectedApplication(application);
    // Route to correct checklist based on application type
    const isNewConnection = !application.type || application.type === 'newConnection';
    const isDisconnection = application.type === 'disconnection';
    const isChangeConnection = application.type === 'changeConnection';
    const isInstallationFlow = isNewConnection && (
      application.status === 'sentToCitizenForPayment' ||
      application.status === 'installation_approved' ||
      application.status === 'approved' ||
      application.status === 'plumber_accepted_installation' ||
      application.status === 'installation_work_submitted'
    );
    
    if (isChangeConnection) {
      setCurrentScreen('changeConnectionChecklist');
    } else if (isDisconnection) {
      setCurrentScreen('disconnectionChecklist');
    } else if (isInstallationFlow) {
      setCurrentScreen('installationChecklist');
    } else {
      setCurrentScreen('checklist');
    }
  };

  const handleBackToList = () => {
    setCurrentScreen('list');
    setSelectedApplication(null);
  };

  const handleLogout = () => {
    setPlumberData(null);
    setCurrentScreen('login');
    setSelectedApplication(null);
  };

  const handleReportSubmit = async (reportData: any) => {
    if (!selectedApplication || !plumberData) return;

    try {
      console.log('[PLUMBER MOBILE] Submitting reconnection report...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber/mobile/submit-reconnection-report`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: selectedApplication.id,
            plumberId: plumberData.id,
            plumberName: plumberData.name,
            reconnectionReport: reportData,
          }),
        }
      );
      
      const data = await response.json();
      console.log('[PLUMBER MOBILE] Report submission response:', data);
      
      if (data.success) {
        alert('Reconnection work report submitted successfully!\n\nYour report has been sent to the Field Engineer for verification.');
        handleBackToList();
      } else {
        alert('Error submitting report: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('[PLUMBER MOBILE] Error submitting report:', error);
      alert('Error: ' + error + '\n\nPlease try again.');
    }
  };

  const handleInstallationReportSubmit = async (reportData: any) => {
    if (!selectedApplication || !plumberData) return;

    try {
      console.log('[PLUMBER MOBILE] Submitting installation report...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber/mobile/submit-installation-report`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: selectedApplication.id,
            plumberId: plumberData.id,
            plumberName: plumberData.name,
            installationReport: reportData,
          }),
        }
      );
      
      const data = await response.json();
      console.log('[PLUMBER MOBILE] Installation report response:', data);
      
      if (data.success) {
        alert('Installation report submitted successfully!\n\nYour report has been sent to the Field Engineer for verification.');
        handleBackToList();
      } else {
        alert('Error submitting report: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('[PLUMBER MOBILE] Error submitting installation report:', error);
      alert('Error: ' + error + '\n\nPlease try again.');
    }
  };

  const handleDisconnectionReportSubmit = async (reportData: any) => {
    if (!selectedApplication || !plumberData) return;

    try {
      console.log('[PLUMBER MOBILE] Submitting disconnection report...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber/mobile/submit-disconnection-report`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: selectedApplication.id,
            plumberId: plumberData.id,
            plumberName: plumberData.name,
            disconnectionReport: reportData,
          }),
        }
      );
      
      const data = await response.json();
      console.log('[PLUMBER MOBILE] Disconnection report response:', data);
      
      if (data.success) {
        alert('Disconnection report submitted successfully!\n\nYour report has been sent to the Field Engineer for verification.');
        handleBackToList();
      } else {
        alert('Error submitting report: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('[PLUMBER MOBILE] Error submitting disconnection report:', error);
      alert('Error: ' + error + '\n\nPlease try again.');
    }
  };

  const handleChangeConnectionReportSubmit = async (reportData: any) => {
    if (!selectedApplication || !plumberData) return;

    try {
      console.log('[PLUMBER MOBILE] Submitting change connection report...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber/mobile/submit-change-connection-report`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: selectedApplication.id,
            plumberId: plumberData.id,
            plumberName: plumberData.name,
            changeConnectionReport: reportData,
          }),
        }
      );
      
      const data = await response.json();
      console.log('[PLUMBER MOBILE] Change connection report response:', data);
      
      if (data.success) {
        alert('Change of connection report submitted successfully!\n\nPlease review and forward to Field Engineer from the web portal.');
        handleBackToList();
      } else {
        alert('Error submitting report: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('[PLUMBER MOBILE] Error submitting change connection report:', error);
      alert('Error: ' + error + '\n\nPlease try again.');
    }
  };

  return (
    <div className="max-w-[400px] mx-auto h-screen bg-white shadow-xl">
      <div className="relative h-full">
        {currentScreen === 'login' && (
          <PlumberMobileLogin onLoginSuccess={handleLoginSuccess} />
        )}

        {currentScreen === 'list' && plumberData && (
          <PlumberMobileAppList
            plumberData={plumberData}
            onViewApplication={handleViewApplication}
            onLogout={handleLogout}
          />
        )}

        {currentScreen === 'checklist' && plumberData && selectedApplication && (
          <PlumberReconnectionChecklist
            application={selectedApplication}
            plumberData={plumberData}
            onBack={handleBackToList}
            onSubmit={handleReportSubmit}
          />
        )}

        {currentScreen === 'installationChecklist' && plumberData && selectedApplication && (
          <PlumberInstallationChecklist
            application={selectedApplication}
            plumberData={plumberData}
            onBack={handleBackToList}
            onSubmit={handleInstallationReportSubmit}
          />
        )}

        {currentScreen === 'disconnectionChecklist' && plumberData && selectedApplication && (
          <PlumberDisconnectionChecklist
            application={selectedApplication}
            plumberData={plumberData}
            onBack={handleBackToList}
            onSubmit={handleDisconnectionReportSubmit}
          />
        )}

        {currentScreen === 'changeConnectionChecklist' && plumberData && selectedApplication && (
          <PlumberChangeConnectionChecklist
            application={selectedApplication}
            plumberData={plumberData}
            onBack={handleBackToList}
            onSubmit={handleChangeConnectionReportSubmit}
          />
        )}
      </div>
    </div>
  );
}
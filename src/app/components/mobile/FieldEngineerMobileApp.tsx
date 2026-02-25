import { useState } from 'react';
import FieldEngineerLogin from './FieldEngineerLogin';
import FieldEngineerApplicationsList from './FieldEngineerApplicationsList';
import FieldEngineerApplicationDetail from './FieldEngineerApplicationDetail';
import FieldVisitChecklist from './FieldVisitChecklist';
import FieldVisitReport from './FieldVisitReport';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

type Screen = 'login' | 'list' | 'detail' | 'checklist' | 'report';

export default function FieldEngineerMobileApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [engineerData, setEngineerData] = useState<{ mobile: string; name: string; id: string } | null>(null);
  const [selectedApplicationNo, setSelectedApplicationNo] = useState<string>('');
  const [propertyLocation, setPropertyLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [checklistData, setChecklistData] = useState<any>(null);

  // Dummy plumber estimation data
  const plumberEstimation = {
    rows: [
      { id: '1', attribute: 'Water Pipe (15mm)', measurement: '45 meters', price: 2250 },
      { id: '2', attribute: 'Water Meter', measurement: '1 unit', price: 1500 },
      { id: '3', attribute: 'Connection Valve', measurement: '2 units', price: 800 },
      { id: '4', attribute: 'Pipe Fittings', measurement: '10 units', price: 1200 },
      { id: '5', attribute: 'Labor Charges', measurement: '2 days', price: 3000 },
      { id: '6', attribute: 'Excavation Work', measurement: '15 meters', price: 2250 },
    ],
    totalAmount: 11000,
    comments: 'Standard residential tap connection. All materials as per BWSSB specifications. Estimated installation time: 2-3 working days.'
  };

  const handleLoginSuccess = (data: { mobile: string; name: string; id: string }) => {
    setEngineerData(data);
    setCurrentScreen('list');
  };

  const handleViewApplication = (applicationNo: string) => {
    setSelectedApplicationNo(applicationNo);
    setCurrentScreen('checklist'); // Go directly to checklist
    
    // Set dummy property location - in production, fetch from API
    setPropertyLocation({
      latitude: 15.3647,
      longitude: 75.1240,
      address: '#45, Gandhi Nagar Main Road, Hubballi - 580030',
    });
  };

  const handleBackToList = () => {
    setCurrentScreen('list');
    setSelectedApplicationNo('');
    setPropertyLocation(null);
  };

  const handleBackToChecklist = () => {
    setCurrentScreen('checklist');
  };

  const handleLogout = () => {
    setEngineerData(null);
    setCurrentScreen('login');
    setSelectedApplicationNo('');
    setPropertyLocation(null);
  };

  const handleChecklistNext = (checklistDataParam: any) => {
    // Save checklist data and move to report screen
    setChecklistData(checklistDataParam);
    setCurrentScreen('report');
  };

  const handleReportSubmit = async (engineerRemarks: string, inspectionChecklist?: { id: string; label: string; checked: boolean }[], feEstimation?: { rows: { id: string; attribute: string; measurement: string; price: number }[]; totalAmount: number }, unauthorizedTap?: { found: boolean; penaltyAmount: number }) => {
    try {
      console.log('[MOBILE APP] Submitting field visit report...');
      
      // Build full report payload with all collected data
      const reportPayload: Record<string, any> = {
        applicationNo: selectedApplicationNo,
        engineerId: engineerData && engineerData.id ? engineerData.id : '',
        engineerName: engineerData && engineerData.name ? engineerData.name : '',
        visitStatus: 'approved',
        remarks: engineerRemarks,
        photoCount: checklistData && checklistData.photos ? checklistData.photos.length : 0,
        visitDate: new Date().toISOString(),
        // Send full checklist data
        locationVerification: checklistData ? {
          verified: checklistData.locationVerified || false,
          latitude: checklistData.verifiedLatitude || 0,
          longitude: checklistData.verifiedLongitude || 0,
        } : null,
        siteObservations: checklistData && checklistData.siteNotes ? checklistData.siteNotes : '',
        photos: checklistData && checklistData.photos ? checklistData.photos : [],
        documents: checklistData && checklistData.documents ? checklistData.documents.map((doc: File) => ({
          name: doc.name,
          size: doc.size > 1048576 ? (doc.size / 1048576).toFixed(1) + ' MB' : (doc.size / 1024).toFixed(1) + ' KB',
        })) : [],
        // Send plumber estimation data
        plumberEstimation: plumberEstimation ? {
          rows: plumberEstimation.rows,
          totalAmount: plumberEstimation.totalAmount,
          comments: plumberEstimation.comments || '',
        } : null,
        // Send field engineer estimation data
        fieldEngineerEstimation: feEstimation ? {
          rows: feEstimation.rows,
          totalAmount: feEstimation.totalAmount,
        } : null,
        // Send inspection checklist data
        inspectionChecklist: inspectionChecklist || [],
        // Send unauthorized tap connection data
        unauthorizedTapConnection: unauthorizedTap || { found: false, penaltyAmount: 0 },
      };

      // Submit report to backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/jalanidhi/field-engineer/submit-report`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportPayload),
        }
      );
      
      const data = await response.json();
      console.log('[MOBILE APP] Report submission response:', data);
      
      if (data.success) {
        alert('✅ Site visit report submitted successfully!\\n\\nYour report has been saved and the application status has been updated to "Verified".');
        // Go back to list after successful submission
        handleBackToList();
      } else {
        alert(`❌ Error submitting report:\\n\\n${data.error}`);
      }
    } catch (error) {
      console.error('[MOBILE APP] Error submitting report:', error);
      alert(`❌ Error: ${error}\\n\\nPlease try again.`);
    }
  };

  return (
    <div className="max-w-[400px] mx-auto h-screen bg-white shadow-xl">
      {/* Mobile Device Frame */}
      <div className="relative h-full">
        {currentScreen === 'login' && (
          <FieldEngineerLogin onLoginSuccess={handleLoginSuccess} />
        )}

        {currentScreen === 'list' && engineerData && (
          <FieldEngineerApplicationsList
            engineerData={engineerData}
            onViewApplication={handleViewApplication}
            onLogout={handleLogout}
          />
        )}

        {currentScreen === 'detail' && engineerData && selectedApplicationNo && (
          <FieldEngineerApplicationDetail
            applicationNo={selectedApplicationNo}
            engineerData={engineerData}
            onBack={handleBackToChecklist}
            onSubmitReport={handleReportSubmit}
          />
        )}

        {currentScreen === 'checklist' && engineerData && selectedApplicationNo && propertyLocation && (
          <FieldVisitChecklist
            applicationNo={selectedApplicationNo}
            engineerData={engineerData}
            propertyLocation={propertyLocation}
            onBack={handleBackToList}
            onNext={handleChecklistNext}
            onSubmitReport={handleReportSubmit}
          />
        )}

        {currentScreen === 'report' && engineerData && selectedApplicationNo && checklistData && (
          <FieldVisitReport
            applicationNo={selectedApplicationNo}
            engineerData={engineerData}
            checklistData={checklistData}
            plumberEstimation={plumberEstimation}
            onBack={handleBackToChecklist}
            onSubmit={handleReportSubmit}
          />
        )}
      </div>
    </div>
  );
}
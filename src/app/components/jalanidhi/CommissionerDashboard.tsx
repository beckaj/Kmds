import { useState, useEffect } from 'react';
import { Eye, Search, Calendar } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface Application {
  id: string;
  applicationNo: string;
  applicantName: string;
  propertyType: string;
  district: string;
  ulb: string;
  submittedAt: string;
  forwardedAt: string;
  status: string;
  fieldEngineerName: string;
}

interface CommissionerDashboardProps {
  onViewApplication: (applicationId: string) => void;
  applicationType?: 'newConnection' | 'reconnection' | 'disconnection' | 'changeConnection';
}

export default function CommissionerDashboard({ onViewApplication, applicationType = 'newConnection' }: CommissionerDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState<'all' | 'pending'>(() => {
    const saved = localStorage.getItem('commissionerDash_filter');
    return (saved as 'all' | 'pending') || 'all';
  });

  // Persist applications to localStorage
  useEffect(() => {
    if (applications.length > 0) {
      localStorage.setItem('commissionerDash_applications', JSON.stringify(applications));
    }
  }, [applications]);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('commissionerDash_filter', filter);
  }, [filter]);

  useEffect(() => {
    loadApplications();
  }, [applicationType]);

  const loadApplications = async () => {
    setLoading(true);
    
    try {
      console.log('[COMMISSIONER DASHBOARD] Fetching applications from API...');
      
      // Clear localStorage cache to ensure fresh data
      localStorage.removeItem('commissionerDash_applications');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/commissioner/applications`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('[COMMISSIONER DASHBOARD] API Error:', response.statusText);
        setApplications([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[COMMISSIONER DASHBOARD] API Response:', data);
      
      if (data.success) {
        // Transform the raw application data to match the dashboard's expected format
        const allApps = (data.applications || []);
        
        // Filter by application type
        const filteredByType = allApps.filter((app: any) => {
          if (applicationType === 'reconnection') {
            return app.type === 'reconnection';
          } else if (applicationType === 'disconnection') {
            return app.type === 'disconnection';
          } else if (applicationType === 'changeConnection') {
            return app.type === 'changeConnection';
          } else {
            // newConnection: exclude reconnection and disconnection
            return app.type !== 'reconnection' && app.type !== 'disconnection' && app.type !== 'changeConnection';
          }
        });
        
        const transformedApplications = filteredByType.map((app: any) => {
          // For reconnection/disconnection/changeConnection, use rrData for applicant details
          const isReconnection = app.type === 'reconnection';
          const isDisconnection = app.type === 'disconnection';
          const isChangeConnection = app.type === 'changeConnection';
          const applicantName = (isReconnection || isDisconnection || isChangeConnection)
            ? (app.rrData && app.rrData.ownerName ? app.rrData.ownerName : (app.applicantDetails && app.applicantDetails.applicantName ? app.applicantDetails.applicantName : 'N/A'))
            : (app.applicantDetails && app.applicantDetails.applicantName ? app.applicantDetails.applicantName : 'N/A');
          const propertyType = (isReconnection || isDisconnection || isChangeConnection)
            ? (app.rrData && app.rrData.connectionType ? app.rrData.connectionType : (app.rrData && app.rrData.meterCategory ? app.rrData.meterCategory : (app.connectionDetails && app.connectionDetails.propertyType ? app.connectionDetails.propertyType : 'N/A')))
            : (app.connectionDetails && app.connectionDetails.propertyType ? app.connectionDetails.propertyType : 'N/A');
          
          // Determine status display
          let statusDisplay = 'Pending Review';
          const commWf = app.workflow && app.workflow.commissioner;
          if (app.status === 'sentToCitizenForPayment' || app.status === 'pendingPayment') {
            statusDisplay = 'Pending Payment';
          } else if (app.status === 'paymentCompleted') {
            statusDisplay = 'Payment Completed';
          } else if (app.status === 'approved' || app.status === 'installation_completed' || app.status === 'installation_approved' || app.status === 'reconnection_completed' || app.status === 'disconnection_completed') {
            statusDisplay = 'Approved';
          } else if (app.status === 'rejected') {
            statusDisplay = 'Rejected';
          } else if (app.status === 'sentToPlumberForInstallation' || app.status === 'sentToPlumberForDisconnection' || app.status === 'sentToPlumberForReconnection' || app.status === 'plumber_accepted_installation' || app.status === 'plumber_accepted_disconnection' || app.status === 'plumber_accepted_reconnection') {
            statusDisplay = 'With Plumber';
          } else if (app.status === 'installation_work_submitted' || app.status === 'reconnection_work_submitted' || app.status === 'disconnection_work_submitted') {
            statusDisplay = 'Plumber Work Submitted';
          } else if (commWf && commWf.status === 'approved') {
            statusDisplay = 'Approved';
          } else if (commWf && commWf.status === 'rejected') {
            statusDisplay = 'Rejected';
          } else if (commWf && commWf.status === 'sent_back') {
            statusDisplay = 'Sent Back';
          }
          
          return {
            id: app.id,
            applicationNo: app.id || 'N/A',
            applicantName: applicantName,
            propertyType: propertyType,
            district: app.propertyDetails && app.propertyDetails.district ? app.propertyDetails.district : (app.rrData && app.rrData.district ? app.rrData.district : 'N/A'),
            ulb: app.propertyDetails && app.propertyDetails.ulb ? app.propertyDetails.ulb : (app.rrData && app.rrData.ulb ? app.rrData.ulb : 'N/A'),
            submittedAt: app.submittedAt || new Date().toISOString(),
            forwardedAt: (app.workflow && app.workflow.fieldEngineer && app.workflow.fieldEngineer.timestamp) || app.submittedAt || new Date().toISOString(),
            status: statusDisplay,
            fieldEngineerName: (app.workflow && app.workflow.fieldEngineer && app.workflow.fieldEngineer.name) || 'Field Engineer',
          };
        });
        
        console.log('[COMMISSIONER DASHBOARD] Transformed applications:', transformedApplications);
        setApplications(transformedApplications);
      } else {
        console.error('[COMMISSIONER DASHBOARD] API returned success: false');
        setApplications([]);
      }
      
    } catch (error) {
      console.error('[COMMISSIONER DASHBOARD] Error loading applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewApplication = (applicationId: string) => {
    onViewApplication(applicationId);
  };

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === 'Pending Review');

  // Sort: latest applications first
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const dateA = new Date(a.submittedAt || 0).getTime();
    const dateB = new Date(b.submittedAt || 0).getTime();
    return dateB - dateA;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-['Poppins',sans-serif]">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
          {applicationType === 'reconnection' ? 'Tap Reconnection Requests' : 
           applicationType === 'disconnection' ? 'Tap Disconnection Requests' : 
           applicationType === 'changeConnection' ? 'Tap Change Connection Requests' : 
           'New Connection Request'}
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
          {applicationType === 'reconnection' ? 'Review and approve reconnection applications' : 
           applicationType === 'disconnection' ? 'Review and approve disconnection applications' : 
           applicationType === 'changeConnection' ? 'Review and approve change connection applications' : 
           'Review and approve applications forwarded by Field Engineers'}
        </p>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Title Bar */}
        <div className="bg-[#1f3a5f] px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-white leading-7">
            {applicationType === 'reconnection' ? 'Reconnection Requests' :
             applicationType === 'disconnection' ? 'Disconnection Requests' :
             applicationType === 'changeConnection' ? 'Change Connection Requests' :
             'New Connection Requests'}
          </h2>
        </div>
        {sortedApplications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 font-['Poppins',sans-serif]">No applications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '1200px' }}>
              <thead className="bg-[#f8f9fa] border-b border-[#e5e7eb]">
                <tr>
                  <th className="px-6 py-5 text-center font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[50px]">
                    #
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">
                    Application No
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[130px]">
                    Plumber Name
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[130px]">
                    Applicant As
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">
                    Applicant Name
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[150px]">
                    Connection Type
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[160px]">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[80px]">
                    Queue
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[120px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {sortedApplications.map((application, index) => (
                  <tr 
                    key={application.id}
                    className="border-b border-[#e5e7eb] hover:bg-[#f8f9fb] transition-colors"
                  >
                    <td className="px-6 py-4 text-center font-['Poppins',sans-serif] text-[14px] font-medium text-[#414141]">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] font-medium text-[#06c]">
                      {application.applicationNo}
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                      Licensed Plumber
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                      Self
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#170f49] font-medium">
                      {application.applicantName}
                    </td>
                    <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">
                      {application.propertyType}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-medium font-['Poppins',sans-serif] border whitespace-nowrap ${
                        application.status === 'Pending Payment'
                          ? 'bg-[#fef9c2] border-[#ffdf20] text-[#894b00]'
                          : application.status === 'Payment Completed'
                          ? 'bg-[#dbeafe] border-[#8ec5ff] text-[#193cb8]'
                          : application.status === 'Approved'
                          ? 'bg-[#dcfce7] border-[#7bf1a8] text-[#016630]'
                          : application.status === 'Rejected'
                          ? 'bg-[#fee2e2] border-[#fca5a5] text-[#991b1b]'
                          : application.status === 'Sent Back'
                          ? 'bg-[#fff7ed] border-[#fdba74] text-[#9a3412]'
                          : application.status === 'With Plumber'
                          ? 'bg-[#e0e7ff] border-[#a5b4fc] text-[#3730a3]'
                          : application.status === 'Plumber Work Submitted'
                          ? 'bg-[#e0e7ff] border-[#a5b4fc] text-[#3730a3]'
                          : 'bg-[#dbeafe] border-[#8ec5ff] text-[#193cb8]'
                      }`}>
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-medium font-['Poppins',sans-serif] border bg-[#dcfce7] border-[#7bf1a8] text-[#016630]">
                        Final Approval
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewApplication(application.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1f3a5f] text-white rounded-[8px] font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-[#2d4a6f] transition-colors shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
import { ChevronLeft, CheckCircle, CreditCard, FileText, Download, Calendar, User, Eye } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import SectionTitle from './SectionTitle';

interface CommissionerPaymentVerificationProps {
  applicationId?: string;
  onBack?: () => void;
}

// Dashboard View for Payment Verification
function PaymentVerificationDashboard({ onViewApplication }: { onViewApplication: (appId: string) => void }) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentApplications();
  }, []);

  const fetchPaymentApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/commissioner/payment-queue`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      console.log('[COMMISSIONER] Payment queue response:', data);
      
      if (data.success && data.applications) {
        setApplications(data.applications);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error('Error fetching payment applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#1f3a5f] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#1f3a5f] font-['Poppins',sans-serif] text-lg">Loading payment applications...</p>
          </div>
        </div>
      </div>
    );
  }

  // Sort: latest applications first
  const sortedApplications = [...applications].sort((a, b) => {
    const dateA = new Date(a.submittedAt || (a.paymentDetails && a.paymentDetails.paidAt) || 0).getTime();
    const dateB = new Date(b.submittedAt || (b.paymentDetails && b.paymentDetails.paidAt) || 0).getTime();
    return dateB - dateA;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <SectionTitle title="Payment Verification & Certificate Generation" className="mb-1" />
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
          Verify payments and generate installation permission certificates
        </p>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Title Bar */}
        <div className="bg-[#1f3a5f] px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-white leading-7">
            Payment Verification Queue
          </h2>
        </div>
        {sortedApplications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 font-['Poppins',sans-serif]">No applications with completed payments</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '1200px' }}>
              <thead className="bg-[#f8f9fa] border-b border-[#e5e7eb]">
                <tr>
                  <th className="px-6 py-5 text-center font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[50px]">
                    #
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[130px]">
                    Service Type
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">
                    Application No
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">
                    Applicant Name
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[130px]">
                    Payment Amount
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[160px]">
                    Payment Date
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">
                    Payment Reference
                  </th>
                  <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[120px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {sortedApplications.map((application, index) => {
                  const isReconnection = application.type === 'reconnection';
                  const isDisconnection = application.type === 'disconnection';
                  const isChangeConnection = application.type === 'changeConnection';
                  const appName = (isReconnection || isDisconnection || isChangeConnection)
                    ? (application.rrData && application.rrData.ownerName ? application.rrData.ownerName : (application.applicantDetails && application.applicantDetails.applicantName ? application.applicantDetails.applicantName : 'N/A'))
                    : (application.applicantDetails && application.applicantDetails.applicantName ? application.applicantDetails.applicantName : 'N/A');
                  const paymentAmt = application.paymentDetails && application.paymentDetails.amount
                    ? application.paymentDetails.amount
                    : isChangeConnection
                    ? ((typeof application.applicationFees === 'number' ? application.applicationFees : 0) + (typeof application.securityDeposit === 'number' ? application.securityDeposit : 0))
                    : (application.plumberConnectionData && application.plumberConnectionData.totalAmount ? application.plumberConnectionData.totalAmount : 0);
                  return (
                  <tr 
                    key={application.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 text-center text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif]">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 text-center text-[13px] font-['Poppins',sans-serif]">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold ${
                        isDisconnection
                          ? 'bg-red-100 text-red-800'
                          : isReconnection
                          ? 'bg-orange-100 text-orange-800'
                          : isChangeConnection
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isDisconnection ? 'Disconnection' : isReconnection ? 'Reconnection' : isChangeConnection ? 'Change of Connection' : 'New Connection'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-[14px] font-medium text-[#1f3a5f] font-['Poppins',sans-serif]">
                      {application.applicationNo || application.id}
                    </td>
                    <td className="px-4 py-4 text-center text-[14px] text-gray-700 font-['Poppins',sans-serif]">
                      {appName}
                      {application.isAppealApproved && (
                        <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                          APPEAL
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center text-[14px] font-semibold text-green-700 font-['Poppins',sans-serif]">
                      ₹{Number(paymentAmt).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-center text-[14px] text-gray-700 font-['Poppins',sans-serif]">
                      {application.paymentDetails && application.paymentDetails.paidAt ? formatDate(application.paymentDetails.paidAt) : 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-center text-[12px] text-gray-600 font-['Poppins',sans-serif]">
                      {application.paymentDetails && application.paymentDetails.transactionId ? application.paymentDetails.transactionId : 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => onViewApplication(application.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1f3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors font-['Poppins',sans-serif] text-sm font-medium mx-auto"
                      >
                        <Eye className="w-4 h-4" />
                        Generate
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommissionerPaymentVerification({ applicationId, onBack }: CommissionerPaymentVerificationProps) {
  // All hooks must be called before any conditional logic
  const [selectedAppId, setSelectedAppId] = useState<string | undefined>(applicationId);
  const [showDSCPopup, setShowDSCPopup] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [showPermissionLetter, setShowPermissionLetter] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch application when selectedAppId changes
  useEffect(() => {
    if (selectedAppId) {
      fetchApplication();
    }
  }, [selectedAppId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/application/${selectedAppId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      if (data.success && data.application) {
        setApplication(data.application);
        
        // Check if already approved/completed
        if (data.application.status === 'installation_approved' || data.application.status === 'completed') {
          setSigned(true); // Certificate already signed
        }
      } else {
        setError('Application not found');
      }
    } catch (err) {
      console.error('Error fetching application:', err);
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  // If no application is selected, show dashboard
  if (!selectedAppId) {
    return <PaymentVerificationDashboard onViewApplication={setSelectedAppId} />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#1f3a5f] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#1f3a5f] font-['Poppins',sans-serif] text-lg">Loading application...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !application) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        <button 
          onClick={() => setSelectedAppId(undefined)} 
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error || 'Application not found'}
        </div>
      </div>
    );
  }

  // Check if already completed - if so, show read-only view
  const isAlreadyCompleted = application.status === 'installation_approved' || application.status === 'completed';
  
  // Check if this is a reconnection application
  const isReconnection = application.type === 'reconnection';
  const isDisconnection = application.type === 'disconnection';
  const isChangeConnection = application.type === 'changeConnection';
  
  // Extract application data - handle new connection, reconnection, disconnection, and change of connection
  const applicationNo = application.applicationNo || application.id;
  const applicantName = (isReconnection || isDisconnection || isChangeConnection)
    ? (application.rrData && application.rrData.ownerName ? application.rrData.ownerName : (application.applicantDetails && application.applicantDetails.applicantName ? application.applicantDetails.applicantName : 'N/A'))
    : (application.applicantDetails && application.applicantDetails.applicantName ? application.applicantDetails.applicantName : 'N/A');
  const address = (isReconnection || isDisconnection || isChangeConnection)
    ? (application.rrData && application.rrData.address ? application.rrData.address : (application.applicantDetails && application.applicantDetails.address ? application.applicantDetails.address : 'N/A'))
    : (application.applicantDetails && application.applicantDetails.address ? application.applicantDetails.address : 'N/A');
  const propertyType = isChangeConnection
    ? (application.rrData && application.rrData.meterCategory ? application.rrData.meterCategory : 'N/A')
    : isReconnection
    ? (application.rrData && application.rrData.meterCategory ? application.rrData.meterCategory : 'N/A')
    : (application.connectionDetails && application.connectionDetails.propertyType ? application.connectionDetails.propertyType : 'N/A');
  const connectionType = isChangeConnection
    ? ((application.existingConnectionType || 'N/A') + ' → ' + (application.newConnectionType || 'N/A'))
    : isDisconnection
    ? (application.disconnectionType === 'permanent' ? 'Permanent Disconnection' : 'Temporary Disconnection')
    : isReconnection
    ? (application.existingConnection || 'Reconnection')
    : (application.connectionDetails && application.connectionDetails.connectionType ? application.connectionDetails.connectionType : 'New Connection');
  const district = (isReconnection || isChangeConnection)
    ? (application.rrData && application.rrData.district ? application.rrData.district : (application.propertyDetails && application.propertyDetails.district ? application.propertyDetails.district : 'N/A'))
    : (application.propertyDetails && application.propertyDetails.district ? application.propertyDetails.district : 'N/A');
  const ulb = (isReconnection || isChangeConnection)
    ? (application.rrData && application.rrData.ulb ? application.rrData.ulb : (application.propertyDetails && application.propertyDetails.ulb ? application.propertyDetails.ulb : 'N/A'))
    : (application.propertyDetails && application.propertyDetails.ulb ? application.propertyDetails.ulb : 'N/A');
  const plumberName = application.plumberDetails && application.plumberDetails.plumberName
    ? application.plumberDetails.plumberName
    : (application.workflow && application.workflow.fieldEngineer && application.workflow.fieldEngineer.assignedPlumber ? application.workflow.fieldEngineer.assignedPlumber : 'N/A');
  const paymentAmount = application.paymentDetails && application.paymentDetails.amount
    ? Number(application.paymentDetails.amount)
    : isChangeConnection
    ? ((typeof application.applicationFees === 'number' ? application.applicationFees : 0) + (typeof application.securityDeposit === 'number' ? application.securityDeposit : 0))
    : (application.plumberConnectionData && application.plumberConnectionData.totalAmount ? application.plumberConnectionData.totalAmount : 0);
  const paymentDate = application.paymentDetails && application.paymentDetails.paidAt ? application.paymentDetails.paidAt : new Date().toISOString();
  const paymentReference = application.paymentDetails && application.paymentDetails.transactionId ? application.paymentDetails.transactionId : 'N/A';
  const paymentMode = application.paymentDetails && application.paymentDetails.paymentMethod ? application.paymentDetails.paymentMethod : 'Online Payment Gateway';
  const serviceTypeLabel = isDisconnection ? 'Tap Water Disconnection' : isReconnection ? 'Tap Water Reconnection' : isChangeConnection ? 'Change of Connection Type' : 'New Tap Water Connection';

  const handleSignDSC = () => {
    setSigning(true);
    
    // Simulate DSC signing process
    setTimeout(() => {
      setSigning(false);
      setSigned(true);
      setShowDSCPopup(false);
      
      alert('✅ Permission Certificate signed successfully with Digital Signature!');
    }, 2000);
  };

  const handleComplete = async () => {
    try {
      // Store certificate data to backend
      const certificateData = {
        applicationId: application.id,
        applicationNo: applicationNo,
        applicantName: applicantName,
        address: address,
        district: district,
        ulb: ulb,
        connectionType: connectionType,
        propertyType: propertyType,
        plumberName: plumberName,
        paymentAmount: paymentAmount,
        certificateNo: `DMA/JN/CERT/${applicationNo}`,
        issuedDate: new Date().toISOString(),
        signedDate: new Date().toISOString(),
        status: 'installation_approved',
        isReconnection: isReconnection,
        sendToPlumber: isReconnection,
        sendToPlumberForDisconnection: isDisconnection,
        sendToPlumberForChangeConnection: isChangeConnection
      };

      console.log('Sending certificate data:', certificateData);

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-698be164/commissioner/complete-certificate`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(certificateData),
      });

      const data = await response.json();
      console.log('Certificate completion response:', data);
      
      if (data.success) {
        if (isDisconnection) {
          alert('✅ Disconnection Permission Certificate has been generated and sent to the Plumber!\n\nThe assigned plumber will proceed with the tap water disconnection work.');
        } else if (isReconnection) {
          alert('✅ Permission Certificate has been generated and sent to the Plumber!\n\nThe assigned plumber will proceed with the tap water reconnection work.');
        } else if (isChangeConnection) {
          alert('✅ Change of Connection Type Permission Certificate has been generated and sent to both the Citizen and the Plumber!\n\nThe assigned plumber will proceed with the change of connection type work.');
        } else {
          alert('✅ Permission Certificate has been generated and sent to the applicant!\n\nThe citizen will receive the digitally signed certificate for tap water connection installation.');
        }
        
        // Navigate back to payment verification dashboard
        setSelectedAppId(undefined);
      } else {
        console.error('Failed to send certificate:', data.error);
        alert(`❌ Failed to send certificate: ${data.error}\n\nPlease try again.`);
      }
    } catch (error) {
      console.error('Error completing certificate:', error);
      alert('❌ An error occurred while processing. Please try again.');
    }
  };

  const handleDownload = () => {
    alert('Permission certificate downloaded successfully!');
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Back Button */}
      <button
        onClick={() => setSelectedAppId(undefined)}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Page Header */}
      <div className="mb-6">
        <SectionTitle title="Payment Verification & Certificate Generation" className="mb-2" />
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application No: <span className="font-semibold">{applicationNo}</span>
        </p>
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 font-['Poppins',sans-serif] font-semibold text-[14px]">
              Payment Completed by Citizen
            </span>
          </div>
          {application && application.isAppealApproved && (
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
              <FileText className="w-5 h-5 text-yellow-700 mr-2" />
              <span className="text-yellow-800 font-['Poppins',sans-serif] font-semibold text-[14px]">
                Appeal Application — Rejection Revoked
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Details Card */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white font-['Poppins',sans-serif] flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Payment Confirmation Details
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Payment Amount */}
            <div className="bg-green-50 border border-green-300 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Payment Amount</p>
              <p className="text-2xl font-bold text-green-700 font-['Poppins',sans-serif]">
                ₹{paymentAmount.toFixed(2)}
              </p>
            </div>

            {/* Payment Date */}
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Payment Date</p>
              <p className="text-lg font-semibold text-blue-700 font-['Poppins',sans-serif]">
                {formatDate(paymentDate)}
              </p>
            </div>

            {/* Payment Reference */}
            <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Payment Reference</p>
              <p className="text-sm font-semibold text-purple-700 font-['Poppins',sans-serif] break-all">
                {paymentReference}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Mode</p>
                <p className="text-sm font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {paymentMode}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-['Poppins',sans-serif] mb-1">Application Number</p>
                <p className="text-sm font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {applicationNo}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-['Poppins',sans-serif] mb-1">Applicant Name</p>
                <p className="text-sm font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {applicantName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-['Poppins',sans-serif] mb-1">Service Type</p>
                <p className="text-sm font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {serviceTypeLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Certificate Card */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className={`px-6 py-4 ${signed ? 'bg-green-600' : 'bg-[#1f3a5f]'}`}>
          <h2 className="text-xl font-semibold text-white font-['Poppins',sans-serif] flex items-center gap-2">
            <FileText className="w-6 h-6" />
            {isDisconnection ? 'Disconnection Permission Certificate' : 'Installation Permission Certificate'}
            {signed && (
              <span className="ml-auto flex items-center gap-2 bg-white px-3 py-1 rounded-md text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                Digitally Signed
              </span>
            )}
          </h2>
        </div>

        {/* Certificate Content */}
        <div className="p-12 bg-white" id="permission-certificate">
          {/* Government Header */}
          <div className="text-center mb-8 border-b-2 border-[#1f3a5f] pb-6">
            <ImageWithFallback src="https://upload.wikimedia.org/wikipedia/commons/d/d3/Seal_of_Karnataka.png" alt="Government of Karnataka Seal" className="w-[80px] h-[80px] mx-auto mb-3 object-contain" />
            <div className="mb-4">
              <div className="text-[#1f3a5f] font-bold text-[24px] font-['Poppins',sans-serif]">
                ಕರ್ನಾಟಕ ಸರ್ಕಾರ
              </div>
              <div className="text-[#1f3a5f] font-bold text-[22px] font-['Poppins',sans-serif]">
                GOVERNMENT OF KARNATAKA
              </div>
            </div>
            <div className="text-[#414141] font-semibold text-[18px] font-['Poppins',sans-serif]">
              Department of Municipal Administration
            </div>
            <div className="text-[#414141] text-[16px] font-['Poppins',sans-serif]">
              Directorate of Municipal Administration
            </div>
            <div className="text-gray-600 text-[14px] font-['Poppins',sans-serif] mt-2">
              Jalanidhi - Water Supply Connection Service
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center mb-8">
            <h3 className="text-[22px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] uppercase tracking-wide">
              {isDisconnection ? 'Certificate of Disconnection Permission' : isChangeConnection ? 'Certificate of Change of Connection Type Permission' : isReconnection ? 'Certificate of Reconnection Permission' : 'Certificate of Installation Permission'}
            </h3>
            <div className="w-32 h-1 bg-[#1f3a5f] mx-auto mt-3 rounded-full"></div>
          </div>

          {/* Reference Numbers */}
          <div className="flex justify-between mb-6 text-[14px] font-['Poppins',sans-serif]">
            <div>
              <p className="text-gray-600">Certificate No: <span className="font-semibold text-gray-900">DMA/JN/CERT/{applicationNo}</span></p>
            </div>
            <div>
              <p className="text-gray-600">Date: <span className="font-semibold text-gray-900">{currentDate}</span></p>
            </div>
          </div>

          {/* Recipient */}
          <div className="mb-6">
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900 font-semibold">To,</p>
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900 mt-1 font-semibold">{applicantName}</p>
            <p className="text-[14px] font-['Poppins',sans-serif] text-gray-600 mt-1">
              {address}
            </p>
            <p className="text-[14px] font-['Poppins',sans-serif] text-gray-600 mt-1">
              Application No: {applicationNo}
            </p>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900">
              <span className="font-bold">Subject: </span>
              <span className="underline">
                {isDisconnection ? 'Permission for Tap Water Disconnection' : isReconnection ? 'Permission for Tap Water Reconnection' : 'Permission for Tap Water Connection Installation'}
              </span>
            </p>
          </div>

          {/* Certificate Body */}
          <div className="space-y-4 mb-6 text-[15px] font-['Poppins',sans-serif] text-gray-900 leading-relaxed text-justify">
            <p className="indent-12">
              This is to certify that <span className="font-bold">{applicantName}</span>, bearer of 
              application number <span className="font-semibold">{applicationNo}</span>, has successfully 
              completed all required procedures including technical verification, documentation review, field inspection, 
              and payment of prescribed fees for the {isDisconnection ? 'disconnection of tap water supply' : isReconnection ? 'reconnection of tap water supply' : 'installation of a tap water connection'} at the above-mentioned address.
            </p>

            <p className="indent-12">
              After thorough verification of all submitted documents, successful completion of site inspection by our 
              field engineers, review by the Revenue Officer, and confirmation of payment receipt of <span className="font-bold">₹{paymentAmount.toFixed(2)}</span>, 
              the Department of Municipal Administration, Government of Karnataka, hereby grants <span className="font-bold text-green-700">PERMISSION</span> for 
              the {isDisconnection ? 'disconnection of tap water supply' : isReconnection ? 'reconnection of tap water supply' : 'installation of tap water connection'} as per the approved specifications.
            </p>
          </div>

          {/* Installation Details Box */}
          <div className="bg-green-50 border-2 border-green-600 rounded-lg p-6 mb-6">
            <h3 className="text-[16px] font-bold text-green-800 font-['Poppins',sans-serif] mb-4">
              {isDisconnection ? 'DISCONNECTION AUTHORIZATION DETAILS' : 'INSTALLATION AUTHORIZATION DETAILS'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Certificate Number</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  DMA/JN/CERT/{applicationNo}
                </p>
              </div>
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Connection Type</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {connectionType} - {propertyType}
                </p>
              </div>
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Authorized Plumber</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {plumberName}
                </p>
              </div>
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Permission Date</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {currentDate}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">{isDisconnection ? 'Disconnection Address' : 'Installation Address'}</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {address}
                </p>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mb-6">
            <h4 className="text-[15px] font-bold text-gray-900 font-['Poppins',sans-serif] mb-3">
              Terms and Conditions:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-[14px] font-['Poppins',sans-serif] text-gray-900">
              <li>Installation work must be completed by the authorized licensed plumber only.</li>
              <li>All installation work must comply with government standards and specifications.</li>
              <li>Installation must be completed within 30 days from the date of this certificate.</li>
              <li>Any deviation from approved specifications requires prior written approval.</li>
              <li>Water supply charges will be applicable as per government tariff rates.</li>
              <li>The property owner is responsible for maintenance of internal plumbing.</li>
              <li>This permission is non-transferable and valid only for the specified property.</li>
            </ol>
          </div>

          {/* Closing */}
          <div className="space-y-4 mb-8 text-[15px] font-['Poppins',sans-serif] text-gray-900">
            <p>
              This certificate is issued under the authority of the Commissioner, Department of Municipal Administration, 
              Government of Karnataka, and is valid for immediate commencement of {isDisconnection ? 'disconnection' : 'installation'} work.
            </p>
            <p>
              For any queries or clarifications, please contact the helpdesk at 1800-XXX-XXXX or visit www.jalanidhi.karnataka.gov.in
            </p>
          </div>

          {/* DSC Signature Section */}
          {signed && (
            <div className="mt-12 flex justify-end">
              <div className="text-right">
                <div className="mb-4 bg-green-50 border-2 border-green-500 rounded-lg p-4 inline-block">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-[12px] font-bold text-green-700 font-['Poppins',sans-serif]">
                      DIGITALLY SIGNED
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">
                    Signed on: {new Date().toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">
                    Certificate ID: DSC-2026-PERM-{application.id.slice(-6).toUpperCase()}
                  </p>
                </div>
                <div className="border-t-2 border-gray-800 pt-2 min-w-[250px]">
                  <p className="text-[15px] font-bold text-gray-900 font-['Poppins',sans-serif]">
                    Commissioner
                  </p>
                  <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">
                    Department of Municipal Administration
                  </p>
                  <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">
                    Government of Karnataka
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-300 text-center">
            <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">
              This is an official certificate from the Jalanidhi Portal, Department of Municipal Administration, Government of Karnataka
            </p>
            <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] mt-1">
              For verification, visit: www.jalanidhi.karnataka.gov.in | Certificate Verification ID: {applicationNo}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleDownload}
              disabled={!signed}
              className="px-6 py-3 bg-white border-2 border-[#1f3a5f] text-[#1f3a5f] rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              Download Certificate
            </button>

            <div className="flex items-center gap-4">
              {isAlreadyCompleted ? (
                // Show read-only message for completed applications
                <div className="flex items-center gap-2 px-6 py-3 bg-green-50 border-2 border-green-500 rounded-md">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-['Poppins',sans-serif] font-semibold text-[15px]">
                    Certificate Already Issued
                  </span>
                </div>
              ) : !signed ? (
                <button
                  onClick={() => setShowDSCPopup(true)}
                  className="px-8 py-3 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#2c5282] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Sign with DSC
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="px-8 py-3 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#2c5282] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {(isReconnection || isDisconnection || isChangeConnection) ? 'Complete & Send to Citizen & Plumber' : 'Complete & Send to Applicant'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DSC Signing Popup */}
      {showDSCPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-[500px]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#1f3a5f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-[#1f3a5f]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
                Sign Permission Certificate
              </h2>
              <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                Authenticate with your Digital Signature Certificate to authorize the installation permission
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-2">Certificate Details:</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[14px] text-gray-700 font-['Poppins',sans-serif]">Certificate Type:</span>
                  <span className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                    Installation Permission
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] text-gray-700 font-['Poppins',sans-serif]">Application No:</span>
                  <span className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                    {applicationNo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] text-gray-700 font-['Poppins',sans-serif]">Applicant:</span>
                  <span className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                    {applicantName}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-[12px] text-blue-800 font-['Poppins',sans-serif]">
                🔒 <span className="font-semibold">Security Notice:</span> Your digital signature will be 
                cryptographically attached to this certificate. This action is legally binding and cannot be undone.
              </p>
            </div>

            {signing ? (
              <div className="text-center py-4">
                <div className="inline-block w-12 h-12 border-4 border-[#1f3a5f] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#1f3a5f] font-['Poppins',sans-serif] font-semibold">
                  Applying Digital Signature...
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => setShowDSCPopup(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignDSC}
                  className="px-6 py-2 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#2c5282] transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Confirm & Sign
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, Wrench, Calculator, CheckCircle2, ClipboardCheck, Circle, Download, FileText, Send } from 'lucide-react';
import SectionTitle from './SectionTitle';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface FieldReportViewProps {
  applicationId: string;
  onBack: () => void;
}

interface FieldVisitReport {
  engineerName: string;
  submittedAt: string;
  locationVerification: {
    verified: boolean;
    latitude: number;
    longitude: number;
    address: string;
    verifiedAt: string;
  };
  siteObservations: string;
  engineerRemarks: string;
  photos: string[];
  documents: Array<{
    name: string;
    size: string;
  }>;
  plumberEstimation?: {
    rows: Array<{
      id: string;
      attribute: string;
      measurement: string;
      price: number;
    }>;
    totalAmount: number;
    comments?: string;
  };
  fieldEngineerEstimation?: {
    rows: Array<{
      id: string;
      attribute: string;
      measurement: string;
      price: number;
    }>;
    totalAmount: number;
  };
  inspectionChecklist?: Array<{
    id: string;
    label: string;
    checked: boolean;
  }>;
}

export default function FieldReportView({ applicationId, onBack }: FieldReportViewProps) {
  const [engineerComments, setEngineerComments] = useState('');
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<FieldVisitReport | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string>('');
  const [applicationStage, setApplicationStage] = useState<string>('');
  const [applicationType, setApplicationType] = useState<string>('');

  // Detect application type from applicationId prefix as a reliable fallback
  const detectApplicationType = (id: string): string => {
    if (!id) return '';
    if (id.startsWith('CHGCON-')) return 'changeConnection';
    if (id.startsWith('DISC-')) return 'disconnection';
    if (id.startsWith('RECON-')) return 'reconnection';
    if (id.startsWith('TAP-')) return 'newConnection';
    return '';
  };

  useEffect(() => {
    // Set applicationType from ID prefix immediately so it's available even if fetch fails
    const detectedType = detectApplicationType(applicationId);
    if (detectedType) {
      setApplicationType(detectedType);
    }
    loadFieldReport();
  }, [applicationId]);

  const loadFieldReport = async () => {
    setLoading(true);
    
    try {
      console.log('[FIELD REPORT] Loading field report for application:', applicationId);
      
      // Fetch application data to get field visit report (note: /application/ is singular, not plural)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/application/${encodeURIComponent(applicationId)}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch application: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.application) {
        console.log('[FIELD REPORT] Application loaded:', data.application);
        console.log('[FIELD REPORT] Application status:', data.application.status);
        console.log('[FIELD REPORT] Application stage:', data.application.currentStage);
        console.log('[FIELD REPORT] Application type:', data.application.type);
        
        // Store application status, stage, and type
        setApplicationStatus(data.application.status || '');
        setApplicationStage(data.application.currentStage || '');
        // Use server-provided type if available, otherwise keep the prefix-detected type
        if (data.application.type) {
          setApplicationType(data.application.type);
        }
        
        if (data.application.fieldVisitReport) {
          console.log('[FIELD REPORT] Report loaded:', data.application.fieldVisitReport);
          setReport(data.application.fieldVisitReport);
        } else {
          console.warn('[FIELD REPORT] No field visit report found in application data, using mock data');
          loadMockReport();
        }
      } else {
        console.warn('[FIELD REPORT] Application not found or error:', data.error || 'Unknown error');
        loadMockReport();
      }
      
    } catch (error) {
      console.error('[FIELD REPORT] Error loading report:', error);
      console.error('[FIELD REPORT] Application ID was:', applicationId);
      // Fall back to mock data for development
      loadMockReport();
    } finally {
      setLoading(false);
    }
  };

  const loadMockReport = () => {
    const mockReport: FieldVisitReport = {
      engineerName: 'John Doe',
      submittedAt: '2026-02-08T10:00:00',
      locationVerification: {
        verified: true,
        latitude: 12.9716,
        longitude: 77.5946,
        address: '123, MG Road, Ward 15, Bangalore',
        verifiedAt: '2026-02-08T10:00:00',
      },
      siteObservations: 'Property is located in a residential area with proper access. No obstructions found.',
      engineerRemarks: 'Property is suitable for tap connection. No additional work required.',
      photos: [
        'https://images.unsplash.com/photo-1689574666650-de9cd6056e82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwcmVzaWRlbnRpYWwlMjBwcm9wZXJ0eXxlbnwxfHx8fDE3NzA0NjUyMjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1712640379137-6d2532f887a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmluZyUyMHdhdGVyJTIwcGlwZSUyMGluc3RhbGxhdGlvbnxlbnwxfHx8fDE3NzA0NjUyMzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      ],
      documents: [
        {
          name: 'Site_Visit_Report.pdf',
          size: '2.5 MB',
        },
        {
          name: 'Site_Photos.zip',
          size: '5.2 MB',
        },
      ],
      plumberEstimation: {
        rows: [
          { id: '1', attribute: 'Water Pipe (15mm)', measurement: '45 meters', price: 2250 },
          { id: '2', attribute: 'Water Meter', measurement: '1 unit', price: 1500 },
          { id: '3', attribute: 'Connection Valve', measurement: '2 units', price: 800 },
          { id: '4', attribute: 'Pipe Fittings', measurement: '10 units', price: 1200 },
          { id: '5', attribute: 'Labor Charges', measurement: '2 days', price: 3000 },
          { id: '6', attribute: 'Excavation Work', measurement: '15 meters', price: 2250 },
        ],
        totalAmount: 11000,
        comments: 'Standard residential tap connection. All materials as per BWSSB specifications. Estimated installation time: 2-3 working days.',
      },
      fieldEngineerEstimation: {
        rows: [
          { id: '1', attribute: 'Water Pipe (15mm)', measurement: '45 meters', price: 2250 },
          { id: '2', attribute: 'Water Meter', measurement: '1 unit', price: 1500 },
          { id: '3', attribute: 'Connection Valve', measurement: '2 units', price: 800 },
          { id: '4', attribute: 'Pipe Fittings', measurement: '10 units', price: 1200 },
          { id: '5', attribute: 'Labor Charges', measurement: '2 days', price: 3000 },
          { id: '6', attribute: 'Excavation Work', measurement: '15 meters', price: 2250 },
        ],
        totalAmount: 11000,
      },
      inspectionChecklist: [
        { id: 'chk1', label: 'Water supply pipeline condition inspected', checked: true },
        { id: 'chk2', label: 'Meter installation point verified', checked: true },
        { id: 'chk3', label: 'No unauthorized tapping or illegal connections found', checked: true },
        { id: 'chk4', label: 'Road/pathway restoration requirement assessed', checked: false },
        { id: 'chk5', label: 'Drainage and sewage proximity checked', checked: true },
        { id: 'chk6', label: 'Property boundary and access point confirmed', checked: true },
        { id: 'chk7', label: 'Existing plumbing infrastructure reviewed', checked: true },
        { id: 'chk8', label: 'Water pressure at nearest distribution point tested', checked: false },
        { id: 'chk9', label: 'Environmental and safety hazards assessed', checked: true },
        { id: 'chk10', label: "Plumber's cost estimation reviewed and found reasonable", checked: true },
      ],
    };
    
    setReport(mockReport);
  };

  const handleForwardToCommissioner = async () => {
    if (engineerComments.trim().length < 50) {
      alert('Please provide detailed remarks (minimum 50 characters) before forwarding to Commissioner.');
      return;
    }
    setShowConfirmationPopup(true);
  };

  const confirmForward = async () => {
    setProcessing(true);
    setShowConfirmationPopup(false);
    
    try {
      console.log('[FIELD ENGINEER] ======== STARTING FORWARD TO COMMISSIONER ========');
      console.log('[FIELD ENGINEER] Application ID received:', applicationId);
      console.log('[FIELD ENGINEER] Application ID type:', typeof applicationId);
      console.log('[FIELD ENGINEER] Engineer comments:', engineerComments);
      
      const requestPayload = {
        applicationId: applicationId,
        comment: engineerComments,
        forwardTo: 'Commissioner',
      };
      
      console.log('[FIELD ENGINEER] Request payload:', JSON.stringify(requestPayload, null, 2));
      
      // Call backend API to forward to Commissioner
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/field_engineer/forward`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        }
      );
      
      console.log('[FIELD ENGINEER] Response status:', response.status);
      console.log('[FIELD ENGINEER] Response ok:', response.ok);
      
      const data = await response.json();
      console.log('[FIELD ENGINEER] Response data:', JSON.stringify(data, null, 2));
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${data.error || 'Unknown error'}`);
      }
      
      if (data.success) {
        console.log('[FIELD ENGINEER] ✅ Forward successful!');
        console.log('[FIELD ENGINEER] Updated application status:', data.application && data.application.status);
        console.log('[FIELD ENGINEER] Updated application stage:', data.application && data.application.currentStage);
        
        // Clear ALL localStorage caches to force complete refresh
        localStorage.removeItem('fieldEngineer_applications');
        localStorage.removeItem('applications');
        
        // Show success message
        alert('✅ Application successfully forwarded to Commissioner!\n\nThe application status has been updated to "Sent to Commissioner".');
        
        // Navigate back to dashboard - the dashboard will fetch fresh data
        const event = new CustomEvent('navigate', { 
          detail: '/jalanidhi/field-engineer/tap-connection',
          bubbles: true 
        });
        window.dispatchEvent(event);
      } else {
        throw new Error(data.error || 'Failed to forward application');
      }
      
    } catch (error) {
      console.error('[FIELD ENGINEER] ❌ ERROR forwarding application:', error);
      console.error('[FIELD ENGINEER] Error details:', {
        message: error.message,
        stack: error.stack,
      });
      alert(`❌ Error forwarding application:\n\n${error.message}\n\nPlease check the console for details and try again.`);
    } finally {
      setProcessing(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5fa]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-['Poppins',sans-serif]">Loading field report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        <p className="text-red-600 font-['Poppins',sans-serif]">Field report not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Application
      </button>

      <div className="mb-6">
        <SectionTitle title="Field Inspection Report" className="mb-2" />
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{applicationId}</span>
        </p>
        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mt-1">
          Submitted on: {formatDate(report.submittedAt)}
        </p>
      </div>

      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
          Field Visit Report
        </h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Location Verification
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Verified By</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {report.engineerName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Verified At</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {formatDate(report.locationVerification.verifiedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Address</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {report.locationVerification.address}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Coordinates</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    Latitude: {report.locationVerification.latitude}, Longitude: {report.locationVerification.longitude}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium font-['Poppins',sans-serif] ${
                      report.locationVerification.verified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {report.locationVerification.verified ? '✓ Verified' : '✗ Not Verified'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-2 h-[400px]">
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${report.locationVerification.longitude - 0.01},${report.locationVerification.latitude - 0.01},${report.locationVerification.longitude + 0.01},${report.locationVerification.latitude + 0.01}&layer=mapnik&marker=${report.locationVerification.latitude},${report.locationVerification.longitude}`}
                  className="w-full h-full rounded-md border-2 border-[#1f3a5f]"
                  title="Location Map"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Site Observations
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-[15px] text-gray-900 font-['Poppins',sans-serif] leading-relaxed">
                {report.siteObservations}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Engineer Remarks
            </h3>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-[15px] text-gray-900 font-['Poppins',sans-serif] leading-relaxed">
                {report.engineerRemarks}
              </p>
            </div>
          </div>

          {/* Plumber's Cost Estimation - hidden for Change of Connection Type */}
          {applicationType !== 'changeConnection' && report.plumberEstimation && report.plumberEstimation.rows && report.plumberEstimation.rows.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                <Wrench className="w-5 h-5 text-[#1f3a5f]" />
                <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  Plumber's Cost Estimation
                </h3>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                {/* Table Header */}
                <div className="bg-[#1f3a5f] grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3 px-5 py-3 rounded-t-lg">
                  <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-center">#</p>
                  <p className="text-white text-sm font-semibold font-['Poppins',sans-serif]">Attribute</p>
                  <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-center">Measurement</p>
                  <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-right">Price (₹)</p>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100">
                  {report.plumberEstimation.rows.map((row, index) => (
                    <div
                      key={row.id || index}
                      className={`grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3 px-5 py-3.5 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <p className="text-gray-500 text-sm font-['Poppins',sans-serif] text-center">{index + 1}</p>
                      <p className="text-gray-900 text-[15px] font-medium font-['Poppins',sans-serif]">{row.attribute}</p>
                      <p className="text-gray-700 text-[15px] font-['Poppins',sans-serif] text-center">{row.measurement}</p>
                      <p className="text-gray-900 text-[15px] font-semibold font-['Poppins',sans-serif] text-right">₹{typeof row.price === 'number' ? row.price.toFixed(2) : row.price}</p>
                    </div>
                  ))}
                </div>

                {/* Total Amount */}
                <div className="bg-[#1f3a5f]/10 border-t-2 border-[#1f3a5f] px-5 py-4">
                  <div className="grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3">
                    <div></div>
                    <p className="text-[#1f3a5f] text-[15px] font-bold font-['Poppins',sans-serif]">Total Amount</p>
                    <div></div>
                    <p className="text-[#1f3a5f] text-lg font-bold font-['Poppins',sans-serif] text-right">₹{typeof report.plumberEstimation.totalAmount === 'number' ? report.plumberEstimation.totalAmount.toFixed(2) : report.plumberEstimation.totalAmount}</p>
                  </div>
                </div>
              </div>

              {/* Plumber Comments */}
              {report.plumberEstimation.comments && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-[#1f3a5f] font-semibold font-['Poppins',sans-serif] mb-2">
                    Plumber's Comments:
                  </p>
                  <p className="text-[15px] text-gray-900 font-['Poppins',sans-serif] leading-relaxed">
                    {report.plumberEstimation.comments}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Field Engineer's Cost Estimation - hidden for Change of Connection Type */}
          {applicationType !== 'changeConnection' && report.fieldEngineerEstimation && report.fieldEngineerEstimation.rows && report.fieldEngineerEstimation.rows.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                <Calculator className="w-5 h-5 text-[#1f3a5f]" />
                <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  Field Engineer's Cost Estimation
                </h3>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                {/* Table Header */}
                <div className="bg-[#1f3a5f] grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3 px-5 py-3 rounded-t-lg">
                  <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-center">#</p>
                  <p className="text-white text-sm font-semibold font-['Poppins',sans-serif]">Attribute</p>
                  <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-center">Measurement</p>
                  <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-right">Price (₹)</p>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100">
                  {report.fieldEngineerEstimation.rows.map((row, index) => (
                    <div
                      key={row.id || index}
                      className={`grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3 px-5 py-3.5 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <p className="text-gray-500 text-sm font-['Poppins',sans-serif] text-center">{index + 1}</p>
                      <p className="text-gray-900 text-[15px] font-medium font-['Poppins',sans-serif]">{row.attribute}</p>
                      <p className="text-gray-700 text-[15px] font-['Poppins',sans-serif] text-center">{row.measurement}</p>
                      <p className="text-gray-900 text-[15px] font-semibold font-['Poppins',sans-serif] text-right">₹{typeof row.price === 'number' ? row.price.toFixed(2) : row.price}</p>
                    </div>
                  ))}
                </div>

                {/* Total Amount */}
                <div className="bg-[#1f3a5f]/10 border-t-2 border-[#1f3a5f] px-5 py-4">
                  <div className="grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3">
                    <div></div>
                    <p className="text-[#1f3a5f] text-[15px] font-bold font-['Poppins',sans-serif]">Total Amount</p>
                    <div></div>
                    <p className="text-[#1f3a5f] text-lg font-bold font-['Poppins',sans-serif] text-right">₹{typeof report.fieldEngineerEstimation.totalAmount === 'number' ? report.fieldEngineerEstimation.totalAmount.toFixed(2) : report.fieldEngineerEstimation.totalAmount}</p>
                  </div>
                </div>
              </div>

              {/* Estimation Comparison */}
              {report.plumberEstimation && report.plumberEstimation.totalAmount !== undefined && (
                (() => {
                  const plumberTotal = typeof report.plumberEstimation.totalAmount === 'number' ? report.plumberEstimation.totalAmount : 0;
                  const feTotal = typeof report.fieldEngineerEstimation.totalAmount === 'number' ? report.fieldEngineerEstimation.totalAmount : 0;
                  const difference = feTotal - plumberTotal;
                  if (difference === 0) {
                    return (
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-[14px] text-green-800 font-medium font-['Poppins',sans-serif]">
                          Field Engineer's estimation matches the Plumber's estimation exactly.
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div className={`mt-4 rounded-lg p-4 flex items-center justify-between border ${
                      difference > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold font-['Poppins',sans-serif] ${
                          difference > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {difference > 0 ? '▲' : '▼'}
                        </span>
                        <p className={`text-[14px] font-medium font-['Poppins',sans-serif] ${
                          difference > 0 ? 'text-red-800' : 'text-green-800'
                        }`}>
                          Difference from Plumber's Estimate:
                        </p>
                      </div>
                      <p className={`text-[15px] font-bold font-['Poppins',sans-serif] ${
                        difference > 0 ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {difference > 0 ? '+' : '-'}₹{Math.abs(difference).toFixed(2)}
                      </p>
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* Inspection Checklist */}
          {report.inspectionChecklist && report.inspectionChecklist.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                <ClipboardCheck className="w-5 h-5 text-[#1f3a5f]" />
                <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  Site Inspection Checklist
                </h3>
                <span className="ml-auto bg-[#1f3a5f]/10 text-[#1f3a5f] px-3 py-1 rounded-full text-xs font-semibold font-['Poppins',sans-serif]">
                  {report.inspectionChecklist.filter(item => item && item.checked).length} of {report.inspectionChecklist.length} verified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.inspectionChecklist.map((item, index) => (
                  <div
                    key={item && item.id ? item.id : 'chk-' + index}
                    className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                      item && item.checked
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {item && item.checked ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <p className={`text-[14px] font-['Poppins',sans-serif] leading-relaxed ${
                      item && item.checked ? 'text-green-800 font-medium' : 'text-gray-500'
                    }`}>
                      {item && item.label ? item.label : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Site Photos ({report.photos.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="border-2 border-blue-300 rounded-lg overflow-hidden bg-white shadow-md hover:shadow-xl transition-all">
                    <img 
                      src={photo} 
                      alt={`Site Photo ${index + 1}`}
                      className="w-full h-[300px] object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-white">
                          Photo {index + 1}
                        </p>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Handle download
                            console.log('Download photo:', photo);
                          }}
                          className="p-2 bg-white/90 hover:bg-white rounded-md transition-colors"
                        >
                          <Download className="w-4 h-4 text-[#1f3a5f]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Supporting Documents ({report.documents.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.documents.map((doc, index) => (
                <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50 flex items-center justify-between hover:bg-blue-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-gray-900">{doc.name}</p>
                      <p className="font-['Poppins',sans-serif] text-[12px] text-gray-600">{doc.size}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Handle download
                      console.log('Download document:', doc.name);
                    }}
                    className="p-2 hover:bg-blue-200 rounded-md transition-colors"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Field Engineer Detailed Remarks {(applicationStatus !== 'sentToCommissioner' && applicationStage !== 'commissioner' && applicationStatus !== 'sentToRevenueOfficer') && <span className="text-red-600">*</span>}
            </h3>
            
            {/* Show status badge if already forwarded */}
            {(applicationStatus === 'sentToCommissioner' || applicationStage === 'commissioner') && (
              <div className="mb-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-green-800 font-['Poppins',sans-serif]">
                      ✓ Already Forwarded to Commissioner
                    </h4>
                    <p className="text-sm text-green-700 font-['Poppins',sans-serif] mt-1">
                      This application has been successfully forwarded to the Commissioner for final approval. You can view the report but cannot forward it again.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show status badge if forwarded to Revenue Officer */}
            {(applicationStatus === 'sentToRevenueOfficer' || applicationStage === 'revenue_officer') && (
              <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-blue-800 font-['Poppins',sans-serif]">
                      ✓ Forwarded to Revenue Officer
                    </h4>
                    <p className="text-sm text-blue-700 font-['Poppins',sans-serif] mt-1">
                      This application has been forwarded to the Revenue Officer. You can view the report but cannot make changes at this stage.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-3">
              {(applicationStatus === 'sentToCommissioner' || applicationStage === 'commissioner' || applicationStatus === 'sentToRevenueOfficer') 
                ? 'View the remarks submitted with this report:'
                : 'Provide detailed comments about the site visit, estimation, and any recommendations before forwarding to Commissioner.'}
            </p>
            
            <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
              <textarea
                value={engineerComments}
                onChange={(e) => setEngineerComments(e.target.value)}
                disabled={applicationStatus === 'sentToCommissioner' || applicationStage === 'commissioner' || applicationStatus === 'sentToRevenueOfficer'}
                placeholder="Enter detailed remarks about site conditions, feasibility, cost estimation accuracy, timeline expectations, and any special considerations..."
                className={`w-full min-h-[150px] px-4 py-3 font-['Poppins',sans-serif] text-[15px] text-gray-900 outline-none resize-vertical ${
                  (applicationStatus === 'sentToCommissioner' || applicationStage === 'commissioner' || applicationStatus === 'sentToRevenueOfficer') 
                    ? 'bg-gray-100 cursor-not-allowed' 
                    : ''
                }`}
                rows={6}
              />
              <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex items-center justify-between">
                <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                  Character count: {engineerComments.length}
                </p>
                {(applicationStatus !== 'sentToCommissioner' && applicationStage !== 'commissioner' && applicationStatus !== 'sentToRevenueOfficer') && (
                  <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                    Minimum 50 characters required
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-50 transition-colors"
        >
          Back to Application
        </button>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.print()}
            disabled={processing}
            className="px-6 py-3 bg-white border border-[#1f3a5f] text-[#1f3a5f] rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            Download Report
          </button>

          {/* Only show Forward button if NOT already forwarded */}
          {(applicationStatus !== 'sentToCommissioner' && applicationStage !== 'commissioner' && applicationStatus !== 'sentToRevenueOfficer' && applicationStage !== 'revenue_officer') && (
            <button
              onClick={handleForwardToCommissioner}
              disabled={processing}
              className="px-8 py-3 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#27548a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              {processing ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.928l3-2.647z"></path>
                </svg>
              ) : (
                <Send className="w-5 h-5" />
              )}
              {processing ? 'Processing...' : 'Forward to Commissioner'}
            </button>
          )}
        </div>
      </div>

      {showConfirmationPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[300px] text-center">
            <h2 className="text-xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
              Confirm Forwarding
            </h2>
            <p className="text-gray-600 font-['Poppins',sans-serif] mb-6">
              Are you sure you want to forward this application to the Commissioner?
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={confirmForward}
                className="px-4 py-2 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#27548a] transition-colors"
              >
                Yes, Forward
              </button>
              <button
                onClick={() => setShowConfirmationPopup(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
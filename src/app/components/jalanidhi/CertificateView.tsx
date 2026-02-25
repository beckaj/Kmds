import { useState, useEffect } from 'react';
import SectionTitle from './SectionTitle';
import { ChevronLeft, Download, CheckCircle, FileText } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface CertificateViewProps {
  application: any;
  onBack: () => void;
}

export default function CertificateView({ application, onBack }: CertificateViewProps) {
  const [appData, setAppData] = useState<any>(application);
  const [loading, setLoading] = useState(true);

  // Fetch fresh application data from server to get full certificateData
  useEffect(() => {
    const fetchFreshData = async () => {
      try {
        setLoading(true);
        const appId = application && application.id ? application.id : '';
        if (!appId) {
          setLoading(false);
          return;
        }

        console.log('[CERTIFICATE VIEW] Fetching fresh application data for:', appId);
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-698be164/application/${appId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        console.log('[CERTIFICATE VIEW] Server response:', data);

        if (data.success && data.application) {
          setAppData(data.application);
          console.log('[CERTIFICATE VIEW] certificateData:', data.application && data.application.certificateData ? data.application.certificateData : 'NONE');
        } else {
          console.warn('[CERTIFICATE VIEW] Could not fetch fresh data, using passed application');
          setAppData(application);
        }
      } catch (error) {
        console.error('[CERTIFICATE VIEW] Error fetching application:', error);
        setAppData(application);
      } finally {
        setLoading(false);
      }
    };

    fetchFreshData();
  }, [application]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#1f3a5f] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#1f3a5f] font-['Poppins',sans-serif] text-lg">Loading certificate...</p>
        </div>
      </div>
    );
  }

  const certificateData = appData && appData.certificateData ? appData.certificateData : {};
  const isReconnection = (appData && appData.type === 'reconnection') || (certificateData && certificateData.isReconnection);
  const isChangeConnection = (appData && appData.type === 'changeConnection');

  // Extract all certificate details from certificateData (set by Commissioner), with fallbacks
  const applicationNo = certificateData.applicationNo
    || (appData && appData.applicationNo ? appData.applicationNo : '')
    || (appData && appData.id ? appData.id : 'N/A');

  const applicantName = certificateData.applicantName
    || ((isReconnection || isChangeConnection)
      ? (appData && appData.rrData && appData.rrData.ownerName ? appData.rrData.ownerName : (appData && appData.applicantDetails && appData.applicantDetails.applicantName ? appData.applicantDetails.applicantName : 'N/A'))
      : (appData && appData.applicantDetails && appData.applicantDetails.applicantName ? appData.applicantDetails.applicantName : 'N/A'));

  const address = certificateData.address
    || ((isReconnection || isChangeConnection)
      ? (appData && appData.rrData && appData.rrData.address ? appData.rrData.address : (appData && appData.applicantDetails && appData.applicantDetails.address ? appData.applicantDetails.address : 'N/A'))
      : (appData && appData.applicantDetails && appData.applicantDetails.address ? appData.applicantDetails.address : 'N/A'));

  const district = certificateData.district
    || ((isReconnection || isChangeConnection)
      ? (appData && appData.rrData && appData.rrData.district ? appData.rrData.district : (appData && appData.propertyDetails && appData.propertyDetails.district ? appData.propertyDetails.district : 'N/A'))
      : (appData && appData.propertyDetails && appData.propertyDetails.district ? appData.propertyDetails.district : 'N/A'));

  const ulb = certificateData.ulb
    || ((isReconnection || isChangeConnection)
      ? (appData && appData.rrData && appData.rrData.ulb ? appData.rrData.ulb : (appData && appData.propertyDetails && appData.propertyDetails.ulb ? appData.propertyDetails.ulb : 'N/A'))
      : (appData && appData.propertyDetails && appData.propertyDetails.ulb ? appData.propertyDetails.ulb : 'N/A'));

  const connectionType = certificateData.connectionType
    || (isChangeConnection
      ? ((appData && appData.existingConnectionType ? appData.existingConnectionType : 'N/A') + ' → ' + (appData && appData.newConnectionType ? appData.newConnectionType : 'N/A'))
      : isReconnection
      ? (appData && appData.existingConnection ? appData.existingConnection : 'Reconnection')
      : (appData && appData.connectionDetails && appData.connectionDetails.connectionType ? appData.connectionDetails.connectionType : 'New Connection'));

  const propertyType = certificateData.propertyType
    || ((isReconnection || isChangeConnection)
      ? (appData && appData.rrData && appData.rrData.meterCategory ? appData.rrData.meterCategory : 'N/A')
      : (appData && appData.connectionDetails && appData.connectionDetails.propertyType ? appData.connectionDetails.propertyType : 'N/A'));

  const plumberName = certificateData.plumberName
    || (appData && appData.plumberDetails && appData.plumberDetails.plumberName ? appData.plumberDetails.plumberName : 'N/A');

  const paymentAmount = certificateData.paymentAmount
    || (appData && appData.paymentDetails && appData.paymentDetails.amount ? Number(appData.paymentDetails.amount) : 0);

  const certificateNo = certificateData.certificateNo || `DMA/JN/CERT/${applicationNo}`;

  // Use the actual issued date from certificate data (when Commissioner signed it)
  const issuedDateStr = certificateData.issuedDate || certificateData.signedDate || '';
  const issuedDate = issuedDateStr
    ? new Date(issuedDateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  // Signed date for DSC block
  const signedDateStr = certificateData.signedDate || certificateData.issuedDate || '';
  const signedDateDisplay = signedDateStr
    ? new Date(signedDateStr).toLocaleString('en-IN')
    : new Date().toLocaleString('en-IN');

  // DSC Certificate ID
  const dscCertId = appData && appData.id
    ? `DSC-2026-PERM-${String(appData.id).slice(-6).toUpperCase()}`
    : 'DSC-2026-PERM-XXXXXX';

  const serviceTypeLabel = isChangeConnection ? 'Change of Connection Type' : isReconnection ? 'Tap Water Reconnection' : 'New Tap Water Connection';

  const handleDownload = () => {
    alert(isChangeConnection
      ? 'Certificate downloaded successfully!\n\nThe change of connection type permission certificate has been saved to your downloads folder.'
      : 'Certificate downloaded successfully!\n\nThe installation permission certificate has been saved to your downloads folder.');
  };

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Applications
      </button>

      {/* Page Header */}
      <div className="mb-6">
        <SectionTitle title={isChangeConnection ? 'Change of Connection Type Permission Certificate' : 'Installation Permission Certificate'} className="mb-2" />
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application No: <span className="font-semibold">{applicationNo}</span>
        </p>
        <div className="mt-2 inline-flex items-center px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800 font-['Poppins',sans-serif] font-semibold text-[14px]">
            {isChangeConnection ? 'Approved for Change of Connection Type' : isReconnection ? 'Approved for Reconnection' : 'Approved for Installation'}
          </span>
        </div>
      </div>

      {/* Certificate Card */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white font-['Poppins',sans-serif] flex items-center gap-2">
            <FileText className="w-6 h-6" />
            {isChangeConnection ? 'Official Change of Connection Type Permission Certificate' : 'Official Installation Permission Certificate'}
            <span className="ml-auto flex items-center gap-2 bg-white px-3 py-1 rounded-md text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              Digitally Signed
            </span>
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
              {isChangeConnection ? 'Certificate of Change of Connection Type Permission' : 'Certificate of Installation Permission'}
            </h3>
            <div className="w-32 h-1 bg-[#1f3a5f] mx-auto mt-3 rounded-full"></div>
          </div>

          {/* Reference Numbers */}
          <div className="flex justify-between mb-6 text-[14px] font-['Poppins',sans-serif]">
            <div>
              <p className="text-gray-600">Certificate No: <span className="font-semibold text-gray-900">{certificateNo}</span></p>
            </div>
            <div>
              <p className="text-gray-600">Date: <span className="font-semibold text-gray-900">{issuedDate}</span></p>
            </div>
          </div>

          {/* Recipient */}
          <div className="mb-6">
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900 font-semibold">To,</p>
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900 mt-1 font-semibold">
              {applicantName}
            </p>
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
                {isChangeConnection ? 'Permission for Change of Tap Water Connection Type' : isReconnection ? 'Permission for Tap Water Reconnection' : 'Permission for Tap Water Connection Installation'}
              </span>
            </p>
          </div>

          {/* Certificate Body */}
          <div className="space-y-4 mb-6 text-[15px] font-['Poppins',sans-serif] text-gray-900 leading-relaxed text-justify">
            <p className="indent-12">
              This is to certify that <span className="font-bold">{applicantName}</span>, bearer of 
              application number <span className="font-semibold">{applicationNo}</span>, has successfully 
              completed all required procedures including technical verification, documentation review, field inspection, 
              and payment of prescribed fees for the {isChangeConnection ? 'change of tap water connection type' : isReconnection ? 'reconnection of tap water supply' : 'installation of a tap water connection'} at the above-mentioned address.
            </p>

            <p className="indent-12">
              After thorough verification of all submitted documents, successful completion of site inspection by our 
              field engineers, review by the Revenue Officer, and confirmation of payment receipt of <span className="font-bold">{'\u20B9'}{Number(paymentAmount).toFixed(2)}</span>, 
              the Department of Municipal Administration, Government of Karnataka, hereby grants <span className="font-bold text-green-700">PERMISSION</span> for 
              the {isChangeConnection ? 'change of tap water connection type' : isReconnection ? 'reconnection of tap water supply' : 'installation of tap water connection'} as per the approved specifications.
            </p>
          </div>

          {/* Installation Details Box */}
          <div className="bg-green-50 border-2 border-green-600 rounded-lg p-6 mb-6">
            <h3 className="text-[16px] font-bold text-green-800 font-['Poppins',sans-serif] mb-4">
              {isChangeConnection ? 'CHANGE OF CONNECTION TYPE AUTHORIZATION DETAILS' : 'INSTALLATION AUTHORIZATION DETAILS'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Certificate Number</p>
                <p className="text-[15px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {certificateNo}
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
                  {issuedDate}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">Installation Address</p>
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
              Government of Karnataka, and is valid for immediate commencement of installation work.
            </p>
            <p>
              For any queries or clarifications, please contact the helpdesk at 1800-XXX-XXXX or visit www.jalanidhi.karnataka.gov.in
            </p>
          </div>

          {/* DSC Signature Section */}
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
                  Signed on: {signedDateDisplay}
                </p>
                <p className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">
                  Certificate ID: {dscCertId}
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

      {/* Download Button */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">
                Download Your Certificate
              </h3>
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
                Save a copy of your installation permission certificate for your records
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="px-8 py-3 bg-[#22c55e] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#16a34a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
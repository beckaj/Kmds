import { useState } from 'react';
import { ChevronLeft, CheckCircle, CreditCard, Clock, Shield, FileText, Download, Award, PenTool } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface PlumberLicenseApp {
  id: string;
  registrationType: string;
  status: string;
  submittedAt: string;
  updatedAt: string;
  applicantName: string;
  district: string;
  ulb: string;
  financialYear: string;
  registrationFees: string;
  plumberName: string;
  mobileNumber: string;
  firmName: string;
  qualification: string;
  yearOfExperience: string;
  documents: any;
  workflow: any;
  caseworkerComments: string;
  commissionerComments: string;
  commissionerDecision: string;
  paymentDetails: any;
  licenseNumber: string;
  licenseIssuedAt: string;
  licenseValidUntil: string;
  dscDetails: any;
}

interface PlumberLicensePaymentViewProps {
  application: PlumberLicenseApp;
  onBack: () => void;
  onRefresh: () => void;
}

const formatLabel = (value: string | undefined | null): string => {
  if (!value) return 'N/A';
  return value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateFull = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
};

export default function PlumberLicensePaymentView({ application, onBack, onRefresh }: PlumberLicensePaymentViewProps) {
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');

  const isLicenseIssued = application.status === 'approved' && application.paymentDetails && application.paymentDetails.status === 'completed' && application.licenseNumber;
  const isPaymentDoneAwaitingCertificate = application.status === 'paymentCompleted' && application.paymentDetails && application.paymentDetails.status === 'completed';
  const isIndividual = application.registrationType !== 'contractor';
  const applicantName = isIndividual
    ? (application.plumberName || application.applicantName || 'N/A')
    : (application.firmName || application.applicantName || 'N/A');
  const registrationFees = application.registrationFees || '500';

  const handlePayment = async () => {
    setProcessing(true);
    setShowPaymentPopup(false);

    try {
      console.log('[PLUMBER LICENSE PAY] Initiating payment:', {
        applicationId: application.id,
        amount: registrationFees,
      });

      // Simulate payment gateway processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/payment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: application.id,
            paymentMethod,
            transactionId: `TXN-PL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          }),
        }
      );

      const data = await response.json();
      console.log('[PLUMBER LICENSE PAY] Payment response:', data);

      if (data && data.success) {
        alert('Payment Successful! Your application has been sent to the Commissioner for certificate generation and Digital Signature. You will be able to download your license once the certificate is ready.');
        onRefresh();
      } else {
        throw new Error((data && data.error) ? data.error : 'Payment failed');
      }
    } catch (error) {
      console.error('[PLUMBER LICENSE PAY] Error:', error);
      alert(`Error processing payment: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadCertificate = () => {
    // Create printable certificate
    const certWindow = window.open('', '_blank');
    if (!certWindow) {
      alert('Please allow popups to download the certificate.');
      return;
    }
    const licenseNo = application.licenseNumber || 'N/A';
    const issuedAt = formatDateFull(application.licenseIssuedAt);
    const validUntil = formatDateFull(application.licenseValidUntil);
    const districtLabel = formatLabel(application.district);
    const ulbLabel = formatLabel(application.ulb);

    certWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Plumber License Certificate - ${licenseNo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          body { font-family: 'Poppins', sans-serif; margin: 0; padding: 40px; background: #f5f5f5; }
          .certificate { max-width: 800px; margin: 0 auto; background: white; border: 3px solid #1f3a5f; padding: 50px; position: relative; }
          .certificate::before { content: ''; position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border: 1px solid #1f3a5f; pointer-events: none; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1f3a5f; padding-bottom: 20px; }
          .header h1 { color: #1f3a5f; font-size: 20px; margin: 5px 0; }
          .header h2 { color: #1f3a5f; font-size: 18px; margin: 5px 0; }
          .header h3 { color: #414141; font-size: 16px; margin: 5px 0; font-weight: 600; }
          .header p { color: #666; font-size: 13px; margin: 3px 0; }
          .title { text-align: center; margin: 30px 0; }
          .title h2 { color: #1f3a5f; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #1f3a5f; display: inline-block; padding-bottom: 8px; }
          .license-no { text-align: center; margin: 20px 0; font-size: 18px; color: #1f3a5f; font-weight: 600; }
          .body-text { font-size: 14px; line-height: 1.8; color: #333; margin: 20px 0; }
          .details-grid { display: grid; grid-template-columns: 200px 1fr; gap: 8px 20px; margin: 25px 0; font-size: 14px; }
          .details-grid .label { color: #666; font-weight: 500; }
          .details-grid .value { color: #1f3a5f; font-weight: 600; }
          .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 13px; }
          .footer .sign-block { text-align: center; }
          .footer .sign-line { border-top: 1px solid #333; width: 200px; margin-top: 50px; padding-top: 5px; }
          .seal { text-align: center; margin-top: 30px; color: #1f3a5f; font-size: 12px; font-weight: 600; border: 2px solid #1f3a5f; display: inline-block; padding: 8px 20px; border-radius: 4px; }
          @media print { body { background: white; padding: 0; } .certificate { border: 3px solid #1f3a5f; } }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <h1>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</h1>
            <h2>GOVERNMENT OF KARNATAKA</h2>
            <h3>Department of Municipal Administration</h3>
            <p>Directorate of Municipal Administration</p>
            <p>Jalanidhi - Karnataka Municipal Data Society (KMDS)</p>
          </div>
          
          <div class="title">
            <h2>Plumber License Certificate</h2>
          </div>
          
          <div class="license-no">License No: ${licenseNo}</div>
          
          <div class="body-text">
            This is to certify that the following ${isIndividual ? 'individual plumber' : 'contractor'} has been duly registered 
            and licensed under the provisions of the Karnataka Municipal Corporations Act and the rules framed thereunder 
            for carrying out plumbing works within the jurisdiction of the Urban Local Body.
          </div>
          
          <div class="details-grid">
            <div class="label">Name:</div>
            <div class="value">${applicantName}</div>
            <div class="label">Registration Type:</div>
            <div class="value">${isIndividual ? 'Individual Plumber' : 'Contractor'}</div>
            <div class="label">District:</div>
            <div class="value">${districtLabel}</div>
            <div class="label">ULB:</div>
            <div class="value">${ulbLabel}</div>
            <div class="label">Financial Year:</div>
            <div class="value">${application.financialYear || 'N/A'}</div>
            <div class="label">Date of Issue:</div>
            <div class="value">${issuedAt}</div>
            <div class="label">Valid Until:</div>
            <div class="value">${validUntil}</div>
            <div class="label">Application ID:</div>
            <div class="value">${application.id}</div>
          </div>
          
          <div class="body-text">
            The licensee is authorized to undertake plumbing works for water supply connections within the municipal limits 
            of ${ulbLabel}, ${districtLabel} district, subject to the terms and conditions prescribed by the department.
          </div>
          
          <div class="footer">
            <div class="sign-block">
              <div class="sign-line">Date: ${issuedAt}</div>
            </div>
            <div class="sign-block">
              <div class="sign-line">Commissioner / Authorized Signatory</div>
              <div style="margin-top: 5px; color: #666;">${ulbLabel}</div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <span class="seal">OFFICIAL DOCUMENT - GOVERNMENT OF KARNATAKA</span>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    certWindow.document.close();
  };

  // =========================================
  // PAYMENT DONE - AWAITING CERTIFICATE FROM COMMISSIONER
  // =========================================
  if (isPaymentDoneAwaitingCertificate) {
    const paymentDate = application.paymentDetails && application.paymentDetails.paidAt
      ? formatDateFull(application.paymentDetails.paidAt) : 'N/A';
    const txnId = application.paymentDetails && application.paymentDetails.transactionId
      ? application.paymentDetails.transactionId : 'N/A';

    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Applications
        </button>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
              Payment Completed - Awaiting Certificate
            </h1>
            <p className="text-gray-600 font-['Poppins',sans-serif]">
              Application ID: <span className="font-semibold">{application.id}</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-['Poppins',sans-serif] font-medium border bg-cyan-100 border-cyan-300 text-cyan-800">
            <Clock className="w-4 h-4" />
            Awaiting Certificate
          </span>
        </div>

        <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden">
          <div className="p-8 space-y-8">

            {/* Payment Success */}
            <div>
              <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                Payment Receipt
              </h3>
              <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <p className="text-[15px] font-semibold text-green-800 font-['Poppins',sans-serif]">
                    Payment completed successfully
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Transaction ID</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{txnId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Amount Paid</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">Rs. {registrationFees}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Date</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{paymentDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Awaiting Certificate Info */}
            <div>
              <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                Certificate Status
              </h3>
              <div className="bg-cyan-50 rounded-lg border border-cyan-200 p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-cyan-800 font-['Poppins',sans-serif] mb-2">
                      Awaiting Commissioner Certificate Generation & DSC
                    </p>
                    <p className="text-sm text-cyan-700 font-['Poppins',sans-serif] leading-relaxed">
                      Your payment has been received. The Commissioner will now generate your official Plumber License certificate
                      and apply the Digital Signature Certificate (DSC). Once complete, you will be able to download your license certificate
                      from this page.
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700 font-['Poppins',sans-serif]">Payment Completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-700 font-['Poppins',sans-serif]">Certificate Generation Pending</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400 font-['Poppins',sans-serif]">DSC Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // =========================================
  // LICENSE ISSUED VIEW (Certificate + Receipt)
  // =========================================
  if (isLicenseIssued) {
    const paymentDate = application.paymentDetails && application.paymentDetails.paidAt
      ? formatDateFull(application.paymentDetails.paidAt) : 'N/A';
    const txnId = application.paymentDetails && application.paymentDetails.transactionId
      ? application.paymentDetails.transactionId : 'N/A';
    const licenseNo = application.licenseNumber || 'N/A';
    const validUntil = formatDateFull(application.licenseValidUntil);

    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Applications
        </button>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
              Plumber License Issued
            </h1>
            <p className="text-gray-600 font-['Poppins',sans-serif]">
              Application ID: <span className="font-semibold">{application.id}</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-['Poppins',sans-serif] font-medium border bg-green-100 border-green-300 text-green-800">
            <CheckCircle className="w-4 h-4" />
            License Issued
          </span>
        </div>

        <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden">
          <div className="p-8 space-y-8">

            {/* License Details */}
            <div>
              <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                License Details
              </h3>
              <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-lg font-bold text-green-800 font-['Poppins',sans-serif]">{licenseNo}</p>
                    <p className="text-sm text-green-600 font-['Poppins',sans-serif]">Official Plumber License Number</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">License Holder</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{applicantName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Registration Type</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {isIndividual ? 'Individual Plumber' : 'Contractor'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">District / ULB</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {formatLabel(application.district)} / {formatLabel(application.ulb)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Date of Issue</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {formatDateFull(application.licenseIssuedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Valid Until</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{validUntil}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Financial Year</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.financialYear || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* DSC Details */}
            {application.dscDetails && (
              <div>
                <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Digital Signature Certificate (DSC)
                </h3>
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <PenTool className="w-5 h-5 text-[#1f3a5f]" />
                    <p className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                      Digitally signed by Commissioner
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Signed By</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {application.dscDetails && application.dscDetails.signedBy ? application.dscDetails.signedBy : 'Commissioner'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">DSC Certificate ID</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {application.dscDetails && application.dscDetails.certificateId ? application.dscDetails.certificateId : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Signed Date</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {application.dscDetails && application.dscDetails.signedAt ? formatDateFull(application.dscDetails.signedAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Receipt */}
            <div>
              <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                Payment Receipt
              </h3>
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Status</p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium bg-green-100 text-green-800 border border-green-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Amount Paid</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      Rs. {registrationFees}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Transaction ID</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{txnId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Date</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{paymentDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Payment Method</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {application.paymentDetails && application.paymentDetails.paymentMethod
                        ? formatLabel(application.paymentDetails.paymentMethod) : 'Online'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDownloadCertificate}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-[#1f3a5f]/90 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download License Certificate
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // =========================================
  // PENDING PAYMENT VIEW
  // =========================================
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <button
        onClick={onBack}
        disabled={processing}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Applications
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
            Plumber License - Make Payment
          </h1>
          <p className="text-gray-600 font-['Poppins',sans-serif]">
            Application ID: <span className="font-semibold">{application.id}</span>
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-['Poppins',sans-serif] font-medium border bg-amber-100 border-amber-300 text-amber-800">
          <Clock className="w-4 h-4" />
          Pending Payment
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="p-8 space-y-8">

          {/* Approval Info */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Commissioner Approval
            </h3>
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <p className="text-[15px] font-semibold text-green-800 font-['Poppins',sans-serif]">
                  Your application has been approved by the Commissioner
                </p>
              </div>
            </div>
          </div>

          {/* Consolidated Remarks */}
          {(() => {
            const remarkEntries: RemarkEntry[] = [];
            const cwComment = application.workflow && application.workflow.caseworker && application.workflow.caseworker.comment ? application.workflow.caseworker.comment : (application.caseworkerComments || '');
            if (cwComment) {
              remarkEntries.push({ role: 'Caseworker', comment: cwComment, timestamp: application.workflow && application.workflow.caseworker && application.workflow.caseworker.timestamp ? application.workflow.caseworker.timestamp : '' });
            }
            if (application.commissionerComments) {
              remarkEntries.push({ role: 'Commissioner', comment: application.commissionerComments, variant: 'approved', timestamp: application.workflow && application.workflow.commissioner && application.workflow.commissioner.timestamp ? application.workflow.commissioner.timestamp : '' });
            }
            return remarkEntries.length > 0 ? (
              <RemarksTimeline remarks={remarkEntries} title="Remarks" />
            ) : null;
          })()}

          {/* Application Summary */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Application Summary
            </h3>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Applicant Name</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{applicantName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Registration Type</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {isIndividual ? 'Individual Plumber' : 'Contractor'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">District</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{formatLabel(application.district)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">ULB</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{formatLabel(application.ulb)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Financial Year</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{application.financialYear || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Mobile Number</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{application.mobileNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Payment Details
            </h3>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#1f3a5f]/10">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Description</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Amount (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-3 text-sm text-gray-700 font-['Poppins',sans-serif]">
                        Plumber License Registration Fee ({application.financialYear || 'N/A'})
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-['Poppins',sans-serif] text-right">{registrationFees}</td>
                    </tr>
                    <tr className="bg-[#1f3a5f]/5">
                      <td className="px-4 py-3 text-sm font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">Total Payable</td>
                      <td className="px-4 py-3 text-sm font-bold text-[#1f3a5f] font-['Poppins',sans-serif] text-right">Rs. {registrationFees}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Payment Method
            </h3>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'online', label: 'Online Banking', desc: 'Net Banking / NEFT / RTGS' },
                  { id: 'upi', label: 'UPI Payment', desc: 'Google Pay / PhonePe / Paytm' },
                  { id: 'card', label: 'Debit / Credit Card', desc: 'Visa / MasterCard / RuPay' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      paymentMethod === method.id
                        ? 'border-[#1f3a5f] bg-[#1f3a5f]/5'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === method.id ? 'border-[#1f3a5f]' : 'border-gray-300'
                      }`}>
                        {paymentMethod === method.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1f3a5f]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 font-['Poppins',sans-serif]">{method.label}</p>
                        <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">{method.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onBack}
              disabled={processing}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowPaymentPopup(true)}
              disabled={processing}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#f9a825] text-[#1f3a5f] rounded-lg font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-[#f9a825]/90 transition-colors disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1f3a5f]" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay Rs. {registrationFees}
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Payment Confirmation Popup */}
      {showPaymentPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 backdrop-blur-[2px] bg-[rgba(0,0,0,0.4)]" onClick={() => setShowPaymentPopup(false)} />
          <div className="relative bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,120,160,0.15)] w-[470px] px-[24px] py-[32px] flex flex-col gap-[24px]">
            <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_8px_0px_rgba(0,0,0,0.25)]" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#170f49] font-['Poppins',sans-serif]">Confirm Payment</h3>
            </div>
            <div className="space-y-3">
              <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">
                You are about to make a payment of <span className="font-bold text-[#1f3a5f]">Rs. {registrationFees}</span> for 
                Plumber License Registration.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 text-[13px] font-['Poppins',sans-serif]">
                <p className="text-gray-600">Application: <span className="font-medium text-gray-900">{application.id}</span></p>
                <p className="text-gray-600">Payment Method: <span className="font-medium text-gray-900">{formatLabel(paymentMethod)}</span></p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-['Poppins',sans-serif]">
                <Shield className="w-3.5 h-3.5" />
                <span>Secure payment powered by Government of Karnataka payment gateway</span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPaymentPopup(false)}
                className="px-6 py-2.5 rounded-[24px] border-[1.5px] border-gray-300 text-gray-700 font-['Poppins',sans-serif] font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="px-6 py-2.5 rounded-[24px] bg-[#1f3a5f] text-white font-['Poppins',sans-serif] font-semibold text-sm hover:bg-[#1f3a5f]/90 transition-colors"
              >
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
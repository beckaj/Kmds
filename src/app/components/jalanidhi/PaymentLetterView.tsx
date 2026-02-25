import { useState } from 'react';
import { ChevronLeft, FileText, Download, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface PaymentLetterViewProps {
  applicationId: string;
  applicationNo: string;
  applicantName: string;
  totalAmount: number;
  estimationRows?: Array<{
    id: string;
    attribute: string;
    measurement: string;
    price: number;
  }>;
  commissionerRemarks?: string;
  onBack: () => void;
  onComplete?: () => Promise<void> | void;
  isAppealFlow?: boolean;
  connectionType?: string;
  usageCategory?: string;
  nonMeterBillingMode?: string; // 'upfront' | 'monthly' | ''
  unauthorizedTapPenalty?: number; // penalty amount for unauthorized tap connection
}

export default function PaymentLetterView({
  applicationId,
  applicationNo,
  applicantName,
  totalAmount,
  estimationRows,
  commissionerRemarks,
  onBack,
  onComplete,
  isAppealFlow,
  connectionType,
  usageCategory,
  nonMeterBillingMode,
  unauthorizedTapPenalty,
}: PaymentLetterViewProps) {
  const [showDSCPopup, setShowDSCPopup] = useState(false);
  const [dscSigned, setDscSigned] = useState(false);
  const [processing, setProcessing] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleDSCSign = async () => {
    setProcessing(true);
    setShowDSCPopup(false);

    try {
      console.log('[COMMISSIONER] DSC Signing payment letter:', {
        applicationId,
        applicationNo,
      });

      // Simulate DSC signing process
      await new Promise(resolve => setTimeout(resolve, 2000));

      setDscSigned(true);
      alert('✅ Payment Letter signed successfully with Digital Signature!');

    } catch (error) {
      console.error('Error signing letter:', error);
      alert(`Error signing letter: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    alert('Payment letter downloaded successfully!');
  };

  const handleComplete = async () => {
    // If external onComplete callback is provided (e.g., appeal flow), use it instead
    if (onComplete) {
      try {
        setProcessing(true);
        await onComplete();
      } catch (error) {
        console.error('[PAYMENT LETTER] onComplete error:', error);
        alert('Error: ' + error + '. Please try again.');
      } finally {
        setProcessing(false);
      }
      return;
    }

    try {
      console.log('[COMMISSIONER] Sending payment letter to applicant:', applicationId);
      console.log('[COMMISSIONER] Estimation rows:', estimationRows);
      console.log('[COMMISSIONER] Total amount:', totalAmount);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/commissioner/approve-for-payment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId,
            applicationNo,
            remarks: commissionerRemarks || 'Application approved. Payment letter sent to applicant.',
            estimationRows: estimationRows || [],
            totalAmount: totalAmount,
            unauthorizedTapPenalty: unauthorizedTapPenalty || 0,
          }),
        }
      );

      const data = await response.json();
      console.log('[COMMISSIONER] Approve-for-payment response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update application status');
      }

      if (data.success) {
        alert('Application approved successfully!\n\nPayment letter has been sent to the applicant. The citizen can now view the payment letter and make the payment.');
        
        // Clear localStorage caches to force fresh data
        localStorage.removeItem('commissioner_applications');
        
        // Navigate back to dashboard
        const event = new CustomEvent('navigate', { detail: '/jalanidhi/commissioner/tap-connection' });
        window.dispatchEvent(event);
      } else {
        throw new Error(data.error || 'Failed to approve application');
      }
      
    } catch (error) {
      console.error('[COMMISSIONER] Error sending payment letter:', error);
      alert(`Error: ${error}. Please try again.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={processing}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
          Payment Approval Letter
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application No: <span className="font-semibold">{applicationNo}</span>
        </p>
        {isAppealFlow && (
          <div className="mt-3 inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
            <FileText className="w-5 h-5 text-yellow-700 mr-2" />
            <span className="text-yellow-800 font-['Poppins',sans-serif] font-semibold text-[14px]">
              Appeal Flow — Revoke Rejection & Approve for Payment
            </span>
          </div>
        )}
      </div>

      {/* Payment Letter Card */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        {/* Letter Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
            Official Payment Letter
          </h2>
          {dscSigned && (
            <div className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-md">
              <CheckCircle className="w-5 h-5 text-white" />
              <span className="text-white font-['Poppins',sans-serif] font-semibold text-[14px]">
                Digitally Signed
              </span>
            </div>
          )}
        </div>

        {/* Letter Content */}
        <div className="p-12 bg-white" id="payment-letter">
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

          {/* Reference Numbers */}
          <div className="flex justify-between mb-6 text-[14px] font-['Poppins',sans-serif]">
            <div>
              <p className="text-gray-600">Ref No: <span className="font-semibold text-gray-900">DMA/JN/{applicationNo}</span></p>
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
              Application No: {applicationNo}
            </p>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900">
              <span className="font-bold">Subject: </span>
              <span className="underline">Approval of Tap Water Connection - Payment Authorization</span>
            </p>
          </div>

          {/* Salutation */}
          <div className="mb-4">
            <p className="text-[15px] font-['Poppins',sans-serif] text-gray-900">
              Dear Sir/Madam,
            </p>
          </div>

          {/* Letter Body */}
          <div className="space-y-4 mb-6 text-[15px] font-['Poppins',sans-serif] text-gray-900 leading-relaxed text-justify">
            <p className="indent-12">
              With reference to your application for a new tap water connection under the Jalanidhi initiative, 
              we are pleased to inform you that your application bearing reference number <span className="font-semibold">{applicationNo}</span> has 
              been thoroughly reviewed and <span className="font-bold text-green-700">APPROVED</span> by the Commissioner of the Department 
              of Municipal Administration, Government of Karnataka.
            </p>

            <p className="indent-12">
              After careful verification of all submitted documents, site inspection by our field engineers, 
              and review by concerned authorities, it has been determined that your property meets all the 
              necessary criteria for the installation of a tap water connection as per government norms and regulations.
            </p>

            <p className="indent-12">
              You are hereby authorized to proceed with the payment of installation charges. The approved 
              cost estimation for the tap water connection has been prepared by our licensed plumber and 
              verified by our technical team.
            </p>
          </div>

          {/* Payment Details Box */}
          {(() => {
            // ── Compute non-metered slab rate ONCE for the entire payment details section ──
            const NON_METERED_SLAB_RATES: Record<string, { rate: number; label: string }> = {
              'domestic': { rate: 80, label: 'Domestic' },
              'commercial': { rate: 160, label: 'Commercial' },
              'non-domestic': { rate: 120, label: 'Non-Domestic' },
              'nondomestic': { rate: 120, label: 'Non-Domestic' },
              'non_domestic': { rate: 120, label: 'Non-Domestic' },
              'industrial': { rate: 320, label: 'Industrial' },
            };

            const normalizedConnType = connectionType ? connectionType.toLowerCase().replace(/[\s_-]+/g, '') : '';
            const isNonMetered = normalizedConnType === 'nonmetered' || normalizedConnType === 'unmetered';

            // Robust category lookup with multiple normalization strategies
            const raw = usageCategory ? usageCategory.trim() : '';
            const categoryKey = raw.toLowerCase().replace(/[\s_]+/g, '-');
            const altKey = raw.toLowerCase().replace(/[\s-]+/g, '');
            const directKey = raw.toLowerCase();
            const slabEntry = NON_METERED_SLAB_RATES[categoryKey]
              || NON_METERED_SLAB_RATES[altKey]
              || NON_METERED_SLAB_RATES[directKey]
              || null;
            const monthlyRate = slabEntry ? slabEntry.rate : 0;
            const resolvedCategoryLabel = slabEntry ? slabEntry.label : '';
            const annualWaterCharge = monthlyRate * 12;
            const isMonthlyBilling = nonMeterBillingMode === 'monthly';
            // For monthly billing mode, the water charge is NOT added to the payable total
            const penaltyAmt = (unauthorizedTapPenalty && unauthorizedTapPenalty > 0) ? unauthorizedTapPenalty : 0;
            const grandTotal = ((isNonMetered && !isMonthlyBilling) ? totalAmount + annualWaterCharge : totalAmount) + penaltyAmt;

            // Determine display label for usage category
            const displayCategory = resolvedCategoryLabel || (usageCategory && usageCategory !== 'new-tap-connection' && usageCategory !== 'water-supply' && usageCategory !== 'sewerage' ? usageCategory : '');

            return (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                {/* Receipt Header Band */}
                <div className="bg-[#1f3a5f] px-6 py-4">
                  <h3 className="text-[16px] font-bold text-white font-['Poppins',sans-serif] tracking-wide">
                    APPROVED PAYMENT DETAILS
                  </h3>
                </div>

                {/* Application Info Grid */}
                <div className="px-6 py-5 border-b border-gray-200">
                  <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 font-['Poppins',sans-serif] font-medium mb-1">Application No.</p>
                      <p className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">{applicationNo}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 font-['Poppins',sans-serif] font-medium mb-1">Applicant Name</p>
                      <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{applicantName}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 font-['Poppins',sans-serif] font-medium mb-1">Approval Date</p>
                      <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">{currentDate}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 font-['Poppins',sans-serif] font-medium mb-1">Service Type</p>
                      <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">New Tap Water Connection</p>
                    </div>
                    {connectionType && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-gray-500 font-['Poppins',sans-serif] font-medium mb-1">Connection Type</p>
                        <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif] capitalize">{connectionType}</p>
                      </div>
                    )}
                    {displayCategory && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-gray-500 font-['Poppins',sans-serif] font-medium mb-1">Usage Category</p>
                        <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif] capitalize">{displayCategory}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Section A: Installation Cost Estimation ── */}
                {estimationRows && estimationRows.length > 0 && (
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h4 className="text-[13px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] uppercase tracking-wider mb-3">
                      A. Installation Cost Estimation
                    </h4>
                    <table className="w-full text-[13px] font-['Poppins',sans-serif]">
                      <thead>
                        <tr className="bg-[#f0f4f8]">
                          <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-[#1f3a5f] uppercase tracking-wider w-[36px]">#</th>
                          <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-[#1f3a5f] uppercase tracking-wider">Attribute</th>
                          <th className="text-center py-2.5 px-3 text-[11px] font-semibold text-[#1f3a5f] uppercase tracking-wider">Measurement</th>
                          <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-[#1f3a5f] uppercase tracking-wider">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {estimationRows.map((row, index) => (
                          <tr key={row.id || index} className={index % 2 === 1 ? 'bg-gray-50/50' : ''}>
                            <td className="py-2.5 px-3 text-gray-400 text-center">{index + 1}</td>
                            <td className="py-2.5 px-3 text-gray-800 font-medium">{row.attribute}</td>
                            <td className="py-2.5 px-3 text-gray-600 text-center">{row.measurement}</td>
                            <td className="py-2.5 px-3 text-gray-900 font-semibold text-right">₹{typeof row.price === 'number' ? row.price.toFixed(2) : row.price}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-[#1f3a5f]">
                          <td colSpan={3} className="py-3 px-3 text-[#1f3a5f] font-bold">
                            {(isNonMetered || penaltyAmt > 0) ? 'Sub-Total (Installation Charges)' : 'Total Approved Amount'}
                          </td>
                          <td className="py-3 px-3 text-[#1f3a5f] font-bold text-right text-[14px]">₹{totalAmount.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {/* ── Section B: Non-Metered Water Charge ── */}
                {isNonMetered && !isMonthlyBilling && (
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h4 className="text-[13px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] uppercase tracking-wider mb-3">
                      B. Non-Metered Upfront Water Charge (Annual — 12 Months)
                    </h4>
                    <table className="w-full text-[13px] font-['Poppins',sans-serif]">
                      <thead>
                        <tr className="bg-[#f0f4f8]">
                          <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-[#1f3a5f] uppercase tracking-wider">Description</th>
                          <th className="text-center py-2.5 px-3 text-[11px] font-semibold text-[#1f3a5f] uppercase tracking-wider">Category</th>
                          <th className="text-center py-2.5 px-3 text-[11px] font-semibold text-[#1f3a5f] uppercase tracking-wider">Rate/Month</th>
                          <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-[#1f3a5f] uppercase tracking-wider">Annual (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2.5 px-3 text-gray-800 font-medium">Water Supply — Flat Rate × 12 Months</td>
                          <td className="py-2.5 px-3 text-gray-700 text-center font-medium">{resolvedCategoryLabel || 'N/A'}</td>
                          <td className="py-2.5 px-3 text-gray-600 text-center">₹{monthlyRate.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-gray-900 font-semibold text-right">₹{annualWaterCharge.toFixed(2)}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-[#1f3a5f]">
                          <td colSpan={3} className="py-3 px-3 text-[#1f3a5f] font-bold">Sub-Total (Annual Water Charge)</td>
                          <td className="py-3 px-3 text-[#1f3a5f] font-bold text-right text-[14px]">₹{annualWaterCharge.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                    <div className="mt-2 bg-[#f0f4f8] rounded px-3 py-2">
                      <p className="text-[11px] text-[#1f3a5f] font-['Poppins',sans-serif] italic">
                        As per Government Order — Domestic: ₹80/mo | Commercial: ₹160/mo | Non-Domestic: ₹120/mo | Industrial: ₹320/mo × 12 months
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Section B (Monthly Info): Non-Metered Monthly Rate Information ── */}
                {isNonMetered && isMonthlyBilling && monthlyRate > 0 && (
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h4 className="text-[13px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] uppercase tracking-wider mb-3">
                      B. Monthly Water Charge — For Your Information
                    </h4>
                    <div className="bg-[#f0f4f8] rounded-lg p-4 border border-[#1f3a5f]/10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#1f3a5f]/10 flex items-center justify-center">
                          <span className="text-[18px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">₹</span>
                        </div>
                        <div>
                          <p className="text-[16px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                            ₹{monthlyRate.toFixed(2)} / month
                          </p>
                          <p className="text-[12px] text-gray-600 font-['Poppins',sans-serif]">
                            {resolvedCategoryLabel || 'N/A'} Connection — Fixed Monthly Slab Rate
                          </p>
                        </div>
                      </div>
                      <div className="border-t border-[#1f3a5f]/10 pt-3 space-y-1.5">
                        <p className="text-[12px] text-gray-700 font-['Poppins',sans-serif]">
                          <span className="font-semibold text-[#1f3a5f]">Note:</span> This monthly charge is <span className="font-semibold">not included</span> in the above installation charges.
                          It will be collected on a monthly basis by the Bill Collector after your tap connection is installed and active.
                        </p>
                        <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] italic">
                          As per Government Order — Domestic: ₹80/mo | Commercial: ₹160/mo | Non-Domestic: ₹120/mo | Industrial: ₹320/mo
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Section C (or B if no water charge section): Unauthorized Tap Connection Penalty ── */}
                {penaltyAmt > 0 && (
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h4 className="text-[13px] font-bold text-red-700 font-['Poppins',sans-serif] uppercase tracking-wider mb-3">
                      {isNonMetered && !isMonthlyBilling ? 'C' : 'B'}. Unauthorized Tap Connection — Penalty
                    </h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                      <div className="flex items-start gap-2.5">
                        <span className="text-red-500 text-[16px] mt-0.5">⚠</span>
                        <p className="text-[13px] text-red-800 font-['Poppins',sans-serif] leading-relaxed">
                          During the field inspection, an <span className="font-bold">unauthorized tap connection</span> was identified at your property.
                          As per Government norms and the Karnataka Municipal Corporations Act, a penalty has been levied.
                          This amount is added to the total payment due.
                        </p>
                      </div>
                    </div>
                    <table className="w-full text-[13px] font-['Poppins',sans-serif]">
                      <thead>
                        <tr className="bg-red-50">
                          <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-red-700 uppercase tracking-wider">Description</th>
                          <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-red-700 uppercase tracking-wider">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2.5 px-3 text-gray-800 font-medium">Penalty for Unauthorized Tap Connection (as per Field Engineer Report)</td>
                          <td className="py-2.5 px-3 text-red-700 font-bold text-right">₹{penaltyAmt.toFixed(2)}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-red-400">
                          <td className="py-3 px-3 text-red-700 font-bold">Sub-Total (Penalty)</td>
                          <td className="py-3 px-3 text-red-700 font-bold text-right text-[14px]">₹{penaltyAmt.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {/* ── Grand Total Section ── */}
                {((isNonMetered && !isMonthlyBilling) || penaltyAmt > 0) && (
                  <div className="px-6 py-4 bg-[#f8fafc] border-b border-gray-200">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">A. Installation Charges</p>
                        <p className="text-[13px] font-medium text-gray-800 font-['Poppins',sans-serif]">₹{totalAmount.toFixed(2)}</p>
                      </div>
                      {isNonMetered && !isMonthlyBilling && (
                        <div className="flex justify-between items-center">
                          <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">B. Annual Water Charge ({resolvedCategoryLabel || 'N/A'} @ ₹{monthlyRate}/mo × 12)</p>
                          <p className="text-[13px] font-medium text-gray-800 font-['Poppins',sans-serif]">₹{annualWaterCharge.toFixed(2)}</p>
                        </div>
                      )}
                      {penaltyAmt > 0 && (
                        <div className="flex justify-between items-center">
                          <p className="text-[13px] text-red-600 font-medium font-['Poppins',sans-serif]">
                            {isNonMetered && !isMonthlyBilling ? 'C' : 'B'}. Unauthorized Tap Penalty
                          </p>
                          <p className="text-[13px] font-medium text-red-600 font-['Poppins',sans-serif]">₹{penaltyAmt.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Amount Payable ── */}
                <div className="px-6 py-5 bg-[#1f3a5f]/[0.04]">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 font-['Poppins',sans-serif] font-medium mb-1">
                        {(() => {
                          const hasWaterCharge = isNonMetered && !isMonthlyBilling;
                          const hasPenalty = penaltyAmt > 0;
                          if (hasWaterCharge && hasPenalty) return 'Total Payable (A + B + C)';
                          if (hasWaterCharge) return 'Total Payable (A + B)';
                          if (hasPenalty) return 'Total Payable (A + B)';
                          return 'Total Approved Amount';
                        })()}
                      </p>
                      <p className="text-[28px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] leading-tight">
                        ₹{grandTotal.toFixed(2)}
                      </p>
                      <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1 italic">
                        (Rupees {convertToWords(Math.round(grandTotal))} Only)
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-[11px] font-semibold font-['Poppins',sans-serif] px-3 py-1.5 rounded-full uppercase tracking-wider">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approved
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Instructions */}
          <div className="mb-6">
            <h4 className="text-[15px] font-bold text-gray-900 font-['Poppins',sans-serif] mb-3">
              Instructions for Payment:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-[14px] font-['Poppins',sans-serif] text-gray-900">
              <li>Please make the payment within 30 days from the date of this letter.</li>
              <li>Payment can be made online through the Jalanidhi portal or at designated government centers.</li>
              <li>Keep the payment receipt safe for future reference.</li>
              <li>Installation work will commence within 7 working days after payment confirmation.</li>
              <li>For any queries, please contact the helpdesk at 1800-XXX-XXXX.</li>
            </ol>
          </div>

          {/* Closing */}
          <div className="space-y-4 mb-8 text-[15px] font-['Poppins',sans-serif] text-gray-900">
            <p>
              We appreciate your patience throughout the application process and look forward to providing 
              you with quality water supply services.
            </p>
            <p>
              Thanking you,
            </p>
          </div>

          {/* Signature Section */}
          <div className="mt-12 flex justify-end">
            <div className="text-right">
              {dscSigned && (
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
                    Certificate ID: DSC-2026-COMM-{applicationId.slice(-6).toUpperCase()}
                  </p>
                </div>
              )}
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
              This is a system-generated letter from the Jalanidhi Portal, Department of Municipal Administration, Government of Karnataka
            </p>
            <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] mt-1">
              For queries, visit: www.jalanidhi.karnataka.gov.in | Email: support@jalanidhi.karnataka.gov.in
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          disabled={processing}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={handleDownload}
            disabled={processing || !dscSigned}
            className="px-6 py-3 bg-white border-2 border-[#1f3a5f] text-[#1f3a5f] rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Letter
          </button>

          {!dscSigned ? (
            <button
              onClick={() => setShowDSCPopup(true)}
              disabled={processing}
              className="px-8 py-3 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#27548a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              {processing ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.928l3-2.647z"></path>
                </svg>
              ) : (
                <FileText className="w-5 h-5" />
              )}
              {processing ? 'Signing...' : 'Sign with DSC'}
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-8 py-3 bg-[#22c55e] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#16a34a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Complete & Send to Applicant
            </button>
          )}
        </div>
      </div>

      {/* DSC Sign Popup */}
      {showDSCPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-[500px]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-[#1f3a5f]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
                Digital Signature Certificate
              </h2>
              <p className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                Sign the payment approval letter with your DSC
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-2">Document Details:</p>
              <div className="space-y-1">
                <p className="text-[14px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  Payment Approval Letter
                </p>
                <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">
                  Application: {applicationNo}
                </p>
                <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">
                  Applicant: {applicantName}
                </p>
                <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">
                  Amount: ₹{totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-[12px] text-yellow-800 font-['Poppins',sans-serif]">
                ⚠️ <span className="font-semibold">Important:</span> By signing this document, you authorize 
                the payment and confirm the approval of this tap water connection application.
              </p>
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => setShowDSCPopup(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDSCSign}
                className="px-6 py-2 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#27548a] transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Sign with DSC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to convert number to words
function convertToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (amount === 0) return 'Zero';

  let words = '';
  
  if (amount >= 100000) {
    words += ones[Math.floor(amount / 100000)] + ' Lakh ';
    amount %= 100000;
  }
  
  if (amount >= 1000) {
    const thousands = Math.floor(amount / 1000);
    if (thousands >= 10) {
      words += tens[Math.floor(thousands / 10)] + ' ';
      if (thousands % 10 !== 0) words += ones[thousands % 10] + ' ';
    } else {
      words += ones[thousands] + ' ';
    }
    words += 'Thousand ';
    amount %= 1000;
  }
  
  if (amount >= 100) {
    words += ones[Math.floor(amount / 100)] + ' Hundred ';
    amount %= 100;
  }
  
  if (amount >= 20) {
    words += tens[Math.floor(amount / 10)] + ' ';
    amount %= 10;
  } else if (amount >= 10) {
    words += teens[amount - 10] + ' ';
    amount = 0;
  }
  
  if (amount > 0) {
    words += ones[amount] + ' ';
  }
  
  return words.trim();
}
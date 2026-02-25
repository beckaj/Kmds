import { useRef } from 'react';
import { ChevronLeft, User, Printer, Wallet } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { BCCollectorData, BCApplication } from './BillCollectorMobileApp';

interface BillData {
  billId: string;
  currentDemand: string;
  arrears: string;
  interest: string;
  others: string;
  penaltyReason: string;
  penaltyAmount: string;
  totalBillAmount: string;
  remarks: string;
}

interface DCBData {
  billingDate: string;
  dueDate: string;
  billingMonth: string;
  previousReading: string;
  currentReading: string;
  unitsConsumed: string;
  forMonths: string;
  principal: string;
  previousInterest: string;
  currentInterest: string;
  total: string;
}

interface BillCollectorBillReceiptProps {
  collector: BCCollectorData;
  application: BCApplication;
  dcbData: DCBData;
  billData: BillData;
  ward: string;
  onDone: () => void;
  onPay: () => void;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return day + '/' + month + '/' + year;
  } catch {
    return dateStr;
  }
}

function formatCurrency(val: string | number): string {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
}

export default function BillCollectorBillReceipt({
  collector,
  application,
  dcbData,
  billData,
  ward,
  onDone,
  onPay,
}: BillCollectorBillReceiptProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Determine if non-metered
  const isNonMetered = (() => {
    const mt = application && application.meteringType ? application.meteringType.toLowerCase() : '';
    const mc = application && application.meterCategory ? application.meterCategory.toLowerCase() : '';
    return mt === 'non-metered' || mc === 'non-meter' || mc === 'nonmeter';
  })();

  // Non-metered fixed slab rates
  const NON_METERED_SLAB: Record<string, number> = {
    'domestic': 80, 'non-domestic': 120, 'nondomestic': 120,
    'commercial': 160, 'industrial': 320, 'industries': 320,
  };
  const connTypeKey = application && application.connectionType
    ? application.connectionType.toLowerCase().replace(/[\s_-]+/g, '')
    : 'domestic';
  const fixedMonthlyRate = NON_METERED_SLAB[connTypeKey] || 80;

  const applicantName = application && application.applicantName ? application.applicantName : 'N/A';
  const rrNumber = application && application.rrNumber ? application.rrNumber : 'N/A';
  const applicationNo = application && application.applicationNo ? application.applicationNo : 'N/A';
  const connectionType = application && application.connectionType ? application.connectionType : 'N/A';
  const meterNumber = application && application.meterNumber ? application.meterNumber : 'N/A';
  const district = application && application.district ? application.district : 'N/A';
  const ulb = application && application.ulb ? application.ulb : 'N/A';
  const wardDisplay = application && application.ward ? application.ward : ward || 'N/A';

  const billingDate = dcbData && dcbData.billingDate ? formatDate(dcbData.billingDate) : 'N/A';
  const dueDate = dcbData && dcbData.dueDate ? formatDate(dcbData.dueDate) : 'N/A';
  const billingMonth = dcbData && dcbData.billingMonth ? dcbData.billingMonth : 'N/A';
  const previousReading = dcbData && dcbData.previousReading ? dcbData.previousReading : '0';
  const currentReading = dcbData && dcbData.currentReading ? dcbData.currentReading : '0';
  const unitsConsumed = dcbData && dcbData.unitsConsumed ? dcbData.unitsConsumed : '0';

  const billId = billData && billData.billId ? billData.billId : 'N/A';
  const currentDemand = billData && billData.currentDemand ? billData.currentDemand : '0';
  const arrears = billData && billData.arrears ? billData.arrears : '0';
  const interest = billData && billData.interest ? billData.interest : '0';
  const others = billData && billData.others ? billData.others : '0';
  const penaltyAmount = billData && billData.penaltyAmount ? billData.penaltyAmount : '0';
  const totalBillAmount = billData && billData.totalBillAmount ? billData.totalBillAmount : '0';
  const remarks = billData && billData.remarks ? billData.remarks : '';
  const penaltyReason = billData && billData.penaltyReason && billData.penaltyReason !== '__none__' ? billData.penaltyReason : '';

  // QR payload: encode bill details as a UPI-style or info string
  const qrPayload = [
    'JALANIDHI-BILL',
    'BillNo:' + billId,
    'RR:' + rrNumber,
    'Name:' + applicantName,
    'Amount:' + totalBillAmount,
    'Due:' + dueDate,
    'ULB:' + ulb,
  ].join('|');

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=420,height=700');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ULB Bill - ${billId}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Poppins', sans-serif; padding: 16px; background: #fff; }
          .receipt-box { border: 2px solid #1f3a5f; padding: 20px; max-width: 380px; margin: 0 auto; }
          .receipt-header { text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #1f3a5f; }
          .receipt-title { font-size: 18px; font-weight: 700; color: #1f3a5f; margin-bottom: 2px; }
          .receipt-subtitle { font-size: 11px; color: #555; }
          .receipt-ulb { font-size: 13px; font-weight: 600; color: #1f3a5f; margin-top: 4px; }
          .section-title { font-size: 11px; font-weight: 700; color: #1f3a5f; margin: 12px 0 6px; padding-bottom: 3px; border-bottom: 1px dashed #ccc; text-transform: uppercase; letter-spacing: 0.5px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px; }
          .row-label { color: #555; font-weight: 500; }
          .row-value { color: #1a1a1a; font-weight: 600; text-align: right; max-width: 55%; }
          .total-row { display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 2px solid #1f3a5f; font-size: 13px; font-weight: 700; color: #1f3a5f; }
          .qr-section { text-align: center; margin-top: 16px; padding-top: 12px; border-top: 1px dashed #ccc; }
          .qr-label { font-size: 9px; color: #777; margin-top: 6px; }
          .footer-note { text-align: center; font-size: 9px; color: #888; margin-top: 12px; font-style: italic; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${printContents}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[420px] mx-auto border-x border-gray-200 shadow-xl">
      {/* Header */}
      <div className="bg-[#1f3a5f] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onDone} className="cursor-pointer">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <span className="text-white text-[15px] font-semibold font-['Poppins',sans-serif]">KMDS - Jalanidhi</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white text-[12px] font-medium font-['Poppins',sans-serif]">
            {collector && collector.name ? collector.name.split(' ').slice(0, 2).join(' ') : 'User'}
          </span>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-[#f8f9fc] p-4">

        {/* Printable Receipt Area */}
        <div ref={printRef}>
          <div className="receipt-box" style={{ border: '2px solid #1f3a5f', padding: '20px', background: '#fff', maxWidth: '380px', margin: '0 auto' }}>
            {/* Receipt Header */}
            <div className="receipt-header" style={{ textAlign: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #1f3a5f' }}>
              <div className="receipt-title" style={{ fontSize: '18px', fontWeight: 700, color: '#1f3a5f', fontFamily: "'Poppins', sans-serif", marginBottom: '2px' }}>
                ULB Bill
              </div>
              <div className="receipt-subtitle" style={{ fontSize: '11px', color: '#555', fontFamily: "'Poppins', sans-serif" }}>
                Department of Municipal Administration
              </div>
              <div className="receipt-ulb" style={{ fontSize: '13px', fontWeight: 600, color: '#1f3a5f', fontFamily: "'Poppins', sans-serif", marginTop: '4px' }}>
                {ulb}
              </div>
            </div>

            {/* Bill Info */}
            <div className="section-title" style={{ fontSize: '11px', fontWeight: 700, color: '#1f3a5f', margin: '12px 0 6px', paddingBottom: '3px', borderBottom: '1px dashed #ccc', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Poppins', sans-serif" }}>
              Bill Information
            </div>
            <div style={{ fontSize: '11px', fontFamily: "'Poppins', sans-serif" }}>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Bill No</span>
                <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>{billId}</span>
              </div>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Bill Date</span>
                <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>{billingDate}</span>
              </div>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Due Date</span>
                <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>{dueDate}</span>
              </div>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Billing Month</span>
                <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>{billingMonth}</span>
              </div>
            </div>

            {/* Consumer Details */}
            <div className="section-title" style={{ fontSize: '11px', fontWeight: 700, color: '#1f3a5f', margin: '12px 0 6px', paddingBottom: '3px', borderBottom: '1px dashed #ccc', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Poppins', sans-serif" }}>
              Consumer Details
            </div>
            <div style={{ fontSize: '11px', fontFamily: "'Poppins', sans-serif" }}>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Consumer Name</span>
                <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>{applicantName}</span>
              </div>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>RR Number</span>
                <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>{rrNumber}</span>
              </div>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Application No</span>
                <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>{applicationNo}</span>
              </div>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Connection Type</span>
                <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>
                  {connectionType}{isNonMetered ? ' – Non-Metered' : ''}
                </span>
              </div>
              {isNonMetered && (
                <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Tariff</span>
                  <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>{connectionType} – ₹{fixedMonthlyRate}</span>
                </div>
              )}
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Ward</span>
                <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>{wardDisplay}</span>
              </div>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Meter No</span>
                <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>{meterNumber}</span>
              </div>
            </div>

            {/* Meter Reading - only for metered connections */}
            {!isNonMetered && (
              <>
                <div className="section-title" style={{ fontSize: '11px', fontWeight: 700, color: '#1f3a5f', margin: '12px 0 6px', paddingBottom: '3px', borderBottom: '1px dashed #ccc', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Poppins', sans-serif" }}>
                  Meter Reading
                </div>
                <div style={{ fontSize: '11px', fontFamily: "'Poppins', sans-serif" }}>
                  <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Previous Reading</span>
                    <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>{previousReading}</span>
                  </div>
                  <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Current Reading</span>
                    <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>{currentReading}</span>
                  </div>
                  <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Units Consumed</span>
                    <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>{unitsConsumed}</span>
                  </div>
                </div>
              </>
            )}

            {/* Bill Breakdown */}
            <div className="section-title" style={{ fontSize: '11px', fontWeight: 700, color: '#1f3a5f', margin: '12px 0 6px', paddingBottom: '3px', borderBottom: '1px dashed #ccc', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Poppins', sans-serif" }}>
              Bill Breakdown
            </div>
            <div style={{ fontSize: '11px', fontFamily: "'Poppins', sans-serif" }}>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Current Demand</span>
                <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>Rs. {formatCurrency(currentDemand)}</span>
              </div>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Arrears</span>
                <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>Rs. {formatCurrency(arrears)}</span>
              </div>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Interest</span>
                <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>Rs. {formatCurrency(interest)}</span>
              </div>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Others</span>
                <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>Rs. {formatCurrency(others)}</span>
              </div>
              {penaltyReason && (
                <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="row-label" style={{ color: '#555', fontWeight: 500 }}>Penalty ({penaltyReason.replace(/_/g, ' ')})</span>
                  <span className="row-value" style={{ color: '#1a1a1a', fontWeight: 600 }}>Rs. {formatCurrency(penaltyAmount)}</span>
                </div>
              )}

              {/* Total */}
              <div className="total-row" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '2px solid #1f3a5f', fontSize: '13px', fontWeight: 700, color: '#1f3a5f', fontFamily: "'Poppins', sans-serif" }}>
                <span>Total Amount Due</span>
                <span>Rs. {formatCurrency(totalBillAmount)}</span>
              </div>
            </div>

            {/* Remarks */}
            {remarks && (
              <div style={{ marginTop: '10px', fontSize: '10px', fontFamily: "'Poppins', sans-serif", color: '#555' }}>
                <span style={{ fontWeight: 600 }}>Remarks: </span>{remarks}
              </div>
            )}

            {/* QR Code Section */}
            <div className="qr-section" style={{ textAlign: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #ccc' }}>
              <QRCodeSVG
                value={qrPayload}
                size={110}
                level="M"
                style={{ margin: '0 auto' }}
              />
              <div className="qr-label" style={{ fontSize: '9px', color: '#777', marginTop: '6px', fontFamily: "'Poppins', sans-serif" }}>
                Scan to Pay
              </div>
            </div>

            {/* Footer */}
            <div className="footer-note" style={{ textAlign: 'center', fontSize: '9px', color: '#888', marginTop: '12px', fontStyle: 'italic', fontFamily: "'Poppins', sans-serif" }}>
              This is a computer-generated bill. For queries, contact your ULB office.
            </div>
          </div>
        </div>

        {/* Print & Pay Buttons */}
        <div className="mt-4 mb-4 flex justify-center gap-3">
          <button
            onClick={handlePrint}
            className="h-[44px] px-8 bg-[#f9a825] hover:bg-[#f59e0b] text-[#1f3a5f] text-[13px] font-bold font-['Poppins',sans-serif] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={onPay}
            className="h-[44px] px-8 bg-[#1f3a5f] hover:bg-[#2a4a73] text-white text-[13px] font-bold font-['Poppins',sans-serif] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            Pay
          </button>
        </div>
      </div>
    </div>
  );
}
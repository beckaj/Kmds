import { useState, useRef, useMemo } from 'react';
import { ChevronLeft, User, CreditCard, Smartphone, CheckCircle, ChevronRight, Printer } from 'lucide-react';
import { BCCollectorData, BCApplication } from './BillCollectorMobileApp';
import govEmblem from 'figma:asset/0be0cabdff30f03b02e49837ef21512295729acd.png';

interface BillCollectorPaymentMethodsProps {
  collector: BCCollectorData;
  application: BCApplication;
  totalAmount: string;
  billId: string;
  billData: any;
  dcbData: any;
  ward: string;
  onBack: () => void;
  onPaymentComplete: () => void;
}

interface UPIApp {
  id: string;
  name: string;
  color: string;
  initials: string;
}

const UPI_APPS: UPIApp[] = [
  { id: 'gpay', name: 'Google Pay', color: '#4285F4', initials: 'G' },
  { id: 'phonepe', name: 'PhonePe', color: '#5F259F', initials: 'P' },
  { id: 'paytm', name: 'Paytm', color: '#00BAF2', initials: 'PT' },
  { id: 'bhim', name: 'BHIM UPI', color: '#00897B', initials: 'B' },
  { id: 'amazonpay', name: 'Amazon Pay', color: '#FF9900', initials: 'A' },
  { id: 'whatsapp', name: 'WhatsApp Pay', color: '#25D366', initials: 'W' },
];

function formatCurrency(val: string | number): string {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
}

function generateReceiptNo(ulb: string): string {
  const prefix = ulb ? ulb.replace(/[^A-Z]/gi, '').substring(0, 4).toUpperCase() : 'ULB';
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 999999) + 1).padStart(6, '0');
  return prefix + '/JN/RCPT/' + year + '/' + seq;
}

function generateGatewayRef(method: string): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 999999) + 100000);
  if (method === 'upi') {
    return 'UPI' + dateStr + rand;
  }
  return 'CARD' + dateStr + rand;
}

function formatReceiptDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return day + '-' + month + '-' + year + ' ' + String(hours).padStart(2, '0') + ':' + minutes + ' ' + ampm;
}

export default function BillCollectorPaymentMethods({
  collector,
  application,
  totalAmount,
  billId,
  billData,
  dcbData,
  ward,
  onBack,
  onPaymentComplete,
}: BillCollectorPaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedUPIApp, setSelectedUPIApp] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const receiptPrintRef = useRef<HTMLDivElement>(null);

  const applicantName = application && application.applicantName ? application.applicantName : 'N/A';
  const rrNumber = application && application.rrNumber ? application.rrNumber : 'N/A';
  const meterNumber = application && application.meterNumber ? application.meterNumber : 'N/A';
  const connectionType = application && application.connectionType ? application.connectionType : 'N/A';
  const ulb = application && application.ulb ? application.ulb : collector && collector.ulb ? collector.ulb : 'N/A';
  const district = application && application.district ? application.district : collector && collector.district ? collector.district : 'N/A';
  const billingMonth = dcbData && dcbData.billingMonth ? dcbData.billingMonth : 'N/A';

  // Memoize receipt-specific data so it doesn't change on re-renders
  const receiptNo = useMemo(() => generateReceiptNo(ulb), [paymentSuccess]);
  const receiptDate = useMemo(() => formatReceiptDate(), [paymentSuccess]);
  const gatewayRef = useMemo(() => generateGatewayRef(selectedMethod || 'upi'), [paymentSuccess]);

  const handleProceedPayment = () => {
    if (!selectedMethod) return;
    if (selectedMethod === 'upi' && !selectedUPIApp) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  const canProceed = selectedMethod === 'card' || (selectedMethod === 'upi' && selectedUPIApp);

  const paymentModeLabel = selectedMethod === 'card'
    ? 'Online \u2013 Card'
    : 'Online \u2013 UPI';

  const upiAppMatch = selectedUPIApp ? UPI_APPS.find(a => a.id === selectedUPIApp) : null;
  const selectedUPIAppName = upiAppMatch ? upiAppMatch.name : 'UPI';

  const handlePrintReceipt = () => {
    if (!receiptPrintRef.current) return;
    const printContents = receiptPrintRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=420,height=800');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${receiptNo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Poppins', sans-serif; padding: 12px; background: #fff; }
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

  // ─── Payment Receipt Screen ─────────────────────────────────────────────
  if (paymentSuccess) {
    const receiptRows: { label: string; value: string }[] = [
      { label: 'Receipt No', value: receiptNo },
      { label: 'Receipt Date', value: receiptDate },
      { label: 'Bill No', value: billId },
      { label: 'Bill Month', value: billingMonth },
      { label: 'Consumer Name', value: applicantName },
      { label: 'RR No', value: rrNumber },
      { label: 'Meter No', value: meterNumber },
      { label: 'Tariff', value: connectionType },
      { label: 'District', value: district },
      { label: 'Ward', value: ward || 'N/A' },
      { label: 'Service Name', value: 'Jalanidhi \u2013 Drinking Water' },
      { label: 'Sub-Service Name', value: 'Monthly Tap Connection Charges' },
      { label: 'Amount Payable', value: '\u20B9 ' + formatCurrency(totalAmount) },
      { label: 'Amount Paid', value: '\u20B9 ' + formatCurrency(totalAmount) },
      { label: 'Payment Mode', value: paymentModeLabel },
      { label: 'Gateway', value: 'e-Sweekruthi Gateway' },
      { label: 'Gateway Ref No', value: gatewayRef },
      { label: 'Transaction Status', value: 'SUCCESS' },
    ];

    return (
      <div className="min-h-screen bg-white flex flex-col max-w-[420px] mx-auto border-x border-gray-200 shadow-xl">
        {/* Header */}
        <div className="bg-[#1f3a5f] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto bg-[#f8f9fc] p-3">

          {/* Printable Receipt */}
          <div ref={receiptPrintRef}>
            <div style={{ background: '#fff', border: '1.5px solid #1f3a5f', padding: '16px 14px', fontFamily: "'Poppins', sans-serif", maxWidth: '400px', margin: '0 auto' }}>

              {/* Emblem */}
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <div style={{
                  width: '72px', margin: '0 auto 6px',
                }}>
                  <img src={govEmblem} alt="Government of Karnataka" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              </div>

              {/* Title Block */}
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1f3a5f', textDecoration: 'underline', marginBottom: '3px', lineHeight: 1.3 }}>
                  Jalanidhi &ndash; System-Generated Payment Receipt
                </div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#1f3a5f', marginBottom: '2px' }}>
                  ({connectionType === 'Metered' ? 'Metered Connection' : connectionType + ' Connection'})
                </div>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#222', marginBottom: '1px', textTransform: 'uppercase' }}>
                  {ulb}
                </div>
                <div style={{ fontSize: '9.5px', color: '#555', marginBottom: '1px' }}>
                  &#3228;&#3250; &#3256;&#3248;&#3244;&#3248;&#3262;&#3228;&#3265; &ndash; Water Supply
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1f3a5f', letterSpacing: '0.5px', marginBottom: '1px' }}>
                  PAYMENT RECEIPT
                </div>
                <div style={{ fontSize: '9px', color: '#555' }}>
                  (Monthly Tap Connection &ndash; Water Charges)
                </div>
              </div>

              {/* Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', fontFamily: "'Poppins', sans-serif" }}>
                <tbody>
                  {receiptRows.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #d1d5db' }}>
                      <td style={{
                        padding: '5px 6px',
                        fontWeight: 500,
                        color: '#374151',
                        width: '42%',
                        borderRight: '1px solid #d1d5db',
                        borderLeft: '1px solid #d1d5db',
                        borderTop: idx === 0 ? '1px solid #d1d5db' : 'none',
                        verticalAlign: 'top',
                        lineHeight: 1.4,
                      }}>
                        {row.label}
                      </td>
                      <td style={{
                        padding: '5px 6px',
                        fontWeight: row.label === 'Transaction Status' || row.label === 'Amount Paid' ? 700 : 600,
                        color: row.label === 'Transaction Status' ? '#16a34a' : row.label === 'Amount Paid' ? '#1f3a5f' : '#111827',
                        borderRight: '1px solid #d1d5db',
                        borderTop: idx === 0 ? '1px solid #d1d5db' : 'none',
                        verticalAlign: 'top',
                        lineHeight: 1.4,
                        wordBreak: 'break-all' as any,
                      }}>
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Declaration */}
              <div style={{ marginTop: '12px', paddingTop: '8px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#1f3a5f', marginBottom: '4px' }}>
                  DECLARATION
                </div>
                <div style={{ fontSize: '9px', color: '#555', lineHeight: 1.5 }}>
                  This receipt confirms successful payment of monthly water charges for the above bill.
                  This is a system-generated receipt. No signature is required.
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 mb-4 flex justify-center gap-3">
            <button
              onClick={handlePrintReceipt}
              className="h-[44px] px-6 bg-[#f9a825] hover:bg-[#f59e0b] text-[#1f3a5f] text-[13px] font-bold font-['Poppins',sans-serif] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onPaymentComplete}
              className="h-[44px] px-6 bg-[#1f3a5f] hover:bg-[#2a4a73] text-white text-[13px] font-bold font-['Poppins',sans-serif] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Payment Method Selection Screen ────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[420px] mx-auto border-x border-gray-200 shadow-xl">
      {/* Header */}
      <div className="bg-[#1f3a5f] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="cursor-pointer">
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
        {/* Amount Summary */}
        <div className="bg-[#1f3a5f] rounded-xl p-4 mb-5">
          <div className="text-center">
            <p className="text-[11px] text-white/70 font-['Poppins',sans-serif] mb-1">Total Amount to Pay</p>
            <p className="text-[28px] font-bold text-white font-['Poppins',sans-serif]">
              Rs. {formatCurrency(totalAmount)}
            </p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-[11px] text-white/60 font-['Poppins',sans-serif]">Bill No: {billId}</span>
              <span className="text-white/30">|</span>
              <span className="text-[11px] text-white/60 font-['Poppins',sans-serif]">{applicantName}</span>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <h3 className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
          Select Payment Method
        </h3>

        {/* Debit / Credit Card */}
        <button
          onClick={() => {
            setSelectedMethod('card');
            setSelectedUPIApp(null);
          }}
          className={`w-full mb-3 rounded-xl border-2 p-4 flex items-center gap-4 transition-all cursor-pointer ${
            selectedMethod === 'card'
              ? 'border-[#f9a825] bg-[#fffbeb] shadow-md'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            selectedMethod === 'card' ? 'bg-[#f9a825]' : 'bg-gray-100'
          }`}>
            <CreditCard className={`w-6 h-6 ${selectedMethod === 'card' ? 'text-[#1f3a5f]' : 'text-gray-500'}`} />
          </div>
          <div className="flex-1 text-left">
            <p className={`text-[14px] font-semibold font-['Poppins',sans-serif] ${
              selectedMethod === 'card' ? 'text-[#1f3a5f]' : 'text-gray-800'
            }`}>
              Debit / Credit Card
            </p>
            <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">
              Visa, Mastercard, Rupay
            </p>
          </div>
          {selectedMethod === 'card' && (
            <div className="w-6 h-6 rounded-full bg-[#f9a825] flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4 text-[#1f3a5f]" />
            </div>
          )}
          {selectedMethod !== 'card' && (
            <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
          )}
        </button>

        {/* UPI Payment */}
        <div className={`rounded-xl border-2 transition-all ${
          selectedMethod === 'upi'
            ? 'border-[#f9a825] bg-[#fffbeb] shadow-md'
            : 'border-gray-200 bg-white'
        }`}>
          <button
            onClick={() => {
              setSelectedMethod('upi');
            }}
            className="w-full p-4 flex items-center gap-4 cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              selectedMethod === 'upi' ? 'bg-[#f9a825]' : 'bg-gray-100'
            }`}>
              <Smartphone className={`w-6 h-6 ${selectedMethod === 'upi' ? 'text-[#1f3a5f]' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1 text-left">
              <p className={`text-[14px] font-semibold font-['Poppins',sans-serif] ${
                selectedMethod === 'upi' ? 'text-[#1f3a5f]' : 'text-gray-800'
              }`}>
                UPI Payment
              </p>
              <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">
                Pay using your favourite UPI app
              </p>
            </div>
            {selectedMethod === 'upi' && selectedUPIApp && (
              <div className="w-6 h-6 rounded-full bg-[#f9a825] flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 text-[#1f3a5f]" />
              </div>
            )}
            {selectedMethod !== 'upi' && (
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            )}
          </button>

          {/* UPI App List */}
          {selectedMethod === 'upi' && (
            <div className="px-4 pb-4">
              <div className="border-t border-[#f9a825]/30 pt-3">
                <p className="text-[11px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-3 uppercase tracking-wide">
                  Choose UPI App
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {UPI_APPS.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedUPIApp(app.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedUPIApp === app.id
                          ? 'border-[#f9a825] bg-white shadow-sm'
                          : 'border-transparent bg-white/60 hover:bg-white'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-bold font-['Poppins',sans-serif]"
                        style={{ backgroundColor: app.color }}
                      >
                        {app.initials}
                      </div>
                      <span className={`text-[10px] font-medium font-['Poppins',sans-serif] text-center leading-tight ${
                        selectedUPIApp === app.id ? 'text-[#1f3a5f]' : 'text-gray-600'
                      }`}>
                        {app.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Proceed Button */}
        <div className="mt-5 mb-4">
          <button
            onClick={handleProceedPayment}
            disabled={!canProceed || isProcessing}
            className={`w-full h-[48px] rounded-lg text-[14px] font-bold font-['Poppins',sans-serif] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              canProceed && !isProcessing
                ? 'bg-[#f9a825] hover:bg-[#f59e0b] text-[#1f3a5f] hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-[#1f3a5f]/30 border-t-[#1f3a5f] rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>Pay Rs. {formatCurrency(totalAmount)}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
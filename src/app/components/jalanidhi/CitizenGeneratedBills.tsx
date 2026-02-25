import { useState, useMemo, useRef } from 'react';
import { Eye, Printer, Download, X, ChevronLeft, ChevronRight, Search, FileText, Wallet, CheckCircle, CreditCard, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import govEmblem from 'figma:asset/0be0cabdff30f03b02e49837ef21512295729acd.png';

// ── Types ────────────────────────────────────────────────────────────────────
interface BillData {
  id: string;
  billNo: string;
  billDate: string;
  billMonth: string;
  dueDate: string;
  consumerName: string;
  rrNo: string;
  applicationNo: string;
  meterNo: string;
  connectionType: string;
  district: string;
  ulb: string;
  ward: string;
  prevReading: number;
  currReading: number;
  consumption: number;
  currentDemand: number;
  arrears: number;
  interest: number;
  others: number;
  penaltyReason: string;
  penaltyAmount: number;
  totalAmount: number;
  remarks: string;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Partially Paid' | 'Adjusted';
  // Non-metered specific fields
  tariffLabel?: string;
  mobile?: string;
  address?: string;
  upfrontCollected?: number;
  upfrontMonths?: number;
  monthlyRate?: number;
  monthChargesAccounted?: number;
  balanceCarriedForward?: number;
  netPayable?: number;
}

// ── Constants ────────────────────────────────────────────────────────────────
const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

const CONNECTION_TYPES_METERED = ['Domestic', 'Non-Domestic', 'Commercial', 'Industrial'];
const CONNECTION_TYPES_NON_METERED = ['Domestic', 'Non-Domestic', 'Public Stand Post', 'Institutional'];

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

// ── Rate helpers (match Bill Collector) ──────────────────────────────────────
function getRatePerUnit(connectionType: string): number {
  const type = (connectionType || '').toLowerCase();
  if (type === 'domestic') return 5;
  if (type === 'non-domestic') return 8;
  if (type === 'commercial') return 10;
  if (type === 'industrial' || type === 'industries') return 12;
  return 5;
}

function getFixedMonthlyRate(connectionType: string): number {
  const type = (connectionType || '').toLowerCase().replace(/[\s_-]+/g, '');
  if (type === 'domestic') return 80;
  if (type === 'nondomestic') return 120;
  if (type === 'commercial') return 160;
  if (type === 'industrial' || type === 'industries') return 320;
  return 80;
}

// ── Receipt helpers ──────────────────────────────────────────────────────────
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
  return (method === 'upi' ? 'UPI' : 'CARD') + dateStr + rand;
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

// ── Mock Data Generator ──────────────────────────────────────────────────────
function generateMeteredBills(): BillData[] {
  const bills: BillData[] = [];
  let counter = 0;
  const fyMonths = [
    { month: 3, year: 2025 }, { month: 4, year: 2025 }, { month: 5, year: 2025 },
    { month: 6, year: 2025 }, { month: 7, year: 2025 }, { month: 8, year: 2025 },
    { month: 9, year: 2025 }, { month: 10, year: 2025 }, { month: 11, year: 2025 },
    { month: 0, year: 2026 }, { month: 1, year: 2026 },
  ];
  const statuses: Array<'Paid' | 'Unpaid' | 'Overdue' | 'Partially Paid'> = [
    'Paid', 'Paid', 'Paid', 'Paid', 'Paid', 'Paid', 'Paid', 'Paid', 'Unpaid', 'Unpaid', 'Overdue',
  ];
  fyMonths.forEach(({ month, year }, mIdx) => {
    const billDate = `${String(1).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
    const dueDate = `${String(15).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
    const connType = CONNECTION_TYPES_METERED[mIdx % CONNECTION_TYPES_METERED.length];
    const prevReading = 1200 + (mIdx * 18);
    const consumption = 14 + (mIdx % 5);
    const rate = getRatePerUnit(connType);
    const currentDemand = consumption * rate;
    const arrears = mIdx > 7 ? 250 : 0;
    const interest = mIdx > 6 ? 35 : 0;
    const penaltyAmount = mIdx === 10 ? 50 : 0;
    const penaltyReason = mIdx === 10 ? 'late_payment' : '';
    const totalAmount = currentDemand + arrears + interest + penaltyAmount;
    bills.push({
      id: `MBILL-${String(counter + 1).padStart(4, '0')}`,
      billNo: `HUBB/JN/BILL/${year}/${520100 + counter}`,
      billDate, billMonth: `${MONTHS[month]} ${year}`, dueDate,
      consumerName: 'Ramesh A', rrNo: '234354', applicationNo: `JALN-2025-${45120 + counter}`,
      meterNo: `MTR-W25-${10042 + counter}`, connectionType: connType, district: 'Dharwad',
      ulb: 'Hubballi-Dharwad Municipal Corporation', ward: `Ward ${25 + (counter % 5)}`,
      prevReading, currReading: prevReading + consumption, consumption, currentDemand,
      arrears, interest, others: 0, penaltyReason, penaltyAmount, totalAmount,
      remarks: mIdx === 10 ? 'Overdue bill with late payment penalty applied.' : '',
      status: statuses[mIdx],
    });
    counter++;
  });
  return bills.reverse();
}

function generateNonMeteredBills(): BillData[] {
  const bills: BillData[] = [];
  const connType = 'Domestic';
  const monthlyRate = getFixedMonthlyRate(connType); // 80
  const upfrontMonths = 12;
  const upfrontCollected = upfrontMonths * monthlyRate; // 960

  const fyMonths = [
    { month: 3, year: 2025 }, { month: 4, year: 2025 }, { month: 5, year: 2025 },
    { month: 6, year: 2025 }, { month: 7, year: 2025 }, { month: 8, year: 2025 },
    { month: 9, year: 2025 }, { month: 10, year: 2025 }, { month: 11, year: 2025 },
    { month: 0, year: 2026 }, { month: 1, year: 2026 },
  ];

  let cumulativeDeducted = 0;

  fyMonths.forEach(({ month, year }, mIdx) => {
    const billDate = `${String(1).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`;
    const dueDate = `${String(15).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`;
    cumulativeDeducted += monthlyRate;
    const balanceCarriedForward = upfrontCollected - cumulativeDeducted;
    const netPayable = 0; // Fully covered by upfront advance

    bills.push({
      id: `NMBILL-${String(mIdx + 1).padStart(4, '0')}`,
      billNo: `KDP/TMC/NM/${year}/${String(789 + mIdx).padStart(7, '0')}`,
      billDate,
      billMonth: `${MONTHS[month]} ${year}`,
      dueDate,
      consumerName: 'PAVITHRA R POOJARY',
      rrNo: '2018A2448029',
      applicationNo: `JALN-2025-${72030 + mIdx}`,
      meterNo: '',
      connectionType: 'Residential \u2013 Non-Metered',
      district: 'Udupi',
      ulb: 'Kundapura Town Municipal Council',
      ward: 'Vader Hobli',
      prevReading: 0, currReading: 0, consumption: 0,
      currentDemand: monthlyRate,
      arrears: 0, interest: 0, others: 0,
      penaltyReason: '', penaltyAmount: 0,
      totalAmount: monthlyRate,
      remarks: '',
      status: 'Adjusted' as const,
      // Non-metered specific
      tariffLabel: `${connType} \u2013 \u20B9${monthlyRate}`,
      mobile: '9591010960',
      address: 'Hari Om Nilaya, JLB Road, Vader Hobli, Kundapura',
      upfrontCollected,
      upfrontMonths,
      monthlyRate,
      monthChargesAccounted: monthlyRate,
      balanceCarriedForward,
      netPayable,
    });
  });

  return bills.reverse();
}

const ALL_METERED_BILLS = generateMeteredBills();
const ALL_NON_METERED_BILLS = generateNonMeteredBills();

// ── Helpers ──────────────────────────────────────────────────────────────────
function getCurrentFinancialYear(): string {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  if (month >= 3) return `${year}-${year + 1}`;
  return `${year - 1}-${year}`;
}
function getFinancialYearOptions() {
  return [
    { value: '2025-2026', label: 'FY 2025-2026' },
    { value: '2024-2025', label: 'FY 2024-2025' },
    { value: '2023-2024', label: 'FY 2023-2024' },
  ];
}
function getMonthOptions() {
  const opts = [{ value: '__none__', label: 'All Months' }];
  MONTHS.forEach((m, idx) => {
    opts.push({ value: String(idx), label: m.charAt(0) + m.slice(1).toLowerCase() });
  });
  return opts;
}
function formatCurrency(amount: number): string {
  return '\u20B9 ' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatCurrencyRs(val: number): string {
  return 'Rs. ' + val.toFixed(2);
}
function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());
}
function getStatusColor(status: string) {
  switch (status) {
    case 'Paid': return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'Unpaid': return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
    case 'Overdue': return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'Partially Paid': return { bg: 'bg-orange-100', text: 'text-orange-700' };
    case 'Adjusted': return { bg: 'bg-blue-100', text: 'text-blue-700' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
}

const PAGE_SIZE = 10;

// ── Payment step type ────────────────────────────────────────────────────────
type PaymentStep = 'idle' | 'gateway' | 'processing' | 'receipt';

// ── Component ────────────────────────────────────────────────────────────────
interface CitizenGeneratedBillsProps {
  type?: 'metered' | 'non-metered';
}

export default function CitizenGeneratedBills({ type = 'metered' }: CitizenGeneratedBillsProps) {
  const isMetered = type === 'metered';
  const allBills = isMetered ? ALL_METERED_BILLS : ALL_NON_METERED_BILLS;

  const [selectedYear, setSelectedYear] = useState<string>(getCurrentFinancialYear());
  const [selectedMonth, setSelectedMonth] = useState<string>('__none__');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewBill, setViewBill] = useState<BillData | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const receiptPrintRef = useRef<HTMLDivElement>(null);

  // Payment gateway state
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('idle');
  const [selectedPayMethod, setSelectedPayMethod] = useState<string | null>(null);
  const [selectedUPIApp, setSelectedUPIApp] = useState<string | null>(null);
  const [receiptNo, setReceiptNo] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [gatewayRef, setGatewayRef] = useState('');

  // Filter
  const filteredBills = useMemo(() => {
    let data = allBills;
    if (selectedYear) {
      const parts = selectedYear.split('-');
      const startYear = parseInt(parts[0], 10);
      const endYear = parseInt(parts[1], 10);
      data = data.filter((b) => {
        const monthName = b.billMonth.split(' ')[0];
        const bYear = parseInt(b.billMonth.split(' ')[1], 10);
        const mIdx = MONTHS.indexOf(monthName);
        if (bYear === startYear && mIdx >= 3) return true;
        if (bYear === endYear && mIdx <= 2) return true;
        return false;
      });
    }
    if (selectedMonth && selectedMonth !== '__none__') {
      const mIdx = parseInt(selectedMonth, 10);
      data = data.filter((b) => MONTHS.indexOf(b.billMonth.split(' ')[0]) === mIdx);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter((b) =>
        b.billNo.toLowerCase().includes(q) || b.billMonth.toLowerCase().includes(q) ||
        b.consumerName.toLowerCase().includes(q) || b.rrNo.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q)
      );
    }
    return data;
  }, [selectedYear, selectedMonth, searchQuery, allBills]);

  const totalPages = Math.ceil(filteredBills.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredBills.slice(start, start + PAGE_SIZE);
  }, [filteredBills, currentPage]);

  const handleYearChange = (val: string) => { setSelectedYear(val); setCurrentPage(1); };
  const handleMonthChange = (val: string) => { setSelectedMonth(val); setCurrentPage(1); };
  const handleSearchChange = (val: string) => { setSearchQuery(val); setCurrentPage(1); };

  // Close modal & reset payment
  const closeModal = () => {
    setViewBill(null);
    setPaymentStep('idle');
    setSelectedPayMethod(null);
    setSelectedUPIApp(null);
  };

  // Print bill
  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=420,height=700');
    if (win) {
      win.document.write(`<!DOCTYPE html><html><head><title>ULB Bill - ${viewBill && viewBill.billNo ? viewBill.billNo : ''}</title>
        <style>@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Poppins',sans-serif;padding:16px;background:#fff;}
        @media print{body{padding:0;}}</style></head><body>${printContents}</body></html>`);
      win.document.close(); win.focus();
      setTimeout(() => { win.print(); win.close(); }, 400);
    }
  };

  // Print receipt
  const handlePrintReceipt = () => {
    if (!receiptPrintRef.current) return;
    const printContents = receiptPrintRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=420,height=800');
    if (win) {
      win.document.write(`<!DOCTYPE html><html><head><title>Payment Receipt - ${receiptNo}</title>
        <style>@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Poppins',sans-serif;padding:12px;background:#fff;}
        @media print{body{padding:0;}}</style></head><body>${printContents}</body></html>`);
      win.document.close(); win.focus();
      setTimeout(() => { win.print(); win.close(); }, 400);
    }
  };

  // Download bill
  const handleDownload = () => {
    if (!printRef.current) return;
    const blob = new Blob([`<html><head><style>@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');body{font-family:'Poppins',sans-serif;padding:20px;color:#1f3a5f;max-width:420px;margin:0 auto;}</style></head><body>${printRef.current.innerHTML}</body></html>`], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = viewBill ? `ULB_Bill_${viewBill.billNo.replace(/\//g, '_')}.html` : 'ULB_Bill.html';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Open payment gateway
  const handlePayNow = () => {
    setPaymentStep('gateway');
    setSelectedPayMethod(null);
    setSelectedUPIApp(null);
  };

  // Process payment
  const handleProceedPayment = () => {
    if (!selectedPayMethod) return;
    if (selectedPayMethod === 'upi' && !selectedUPIApp) return;
    setPaymentStep('processing');
    // Generate receipt data
    const ulb = viewBill && viewBill.ulb ? viewBill.ulb : 'ULB';
    setReceiptNo(generateReceiptNo(ulb));
    setReceiptDate(formatReceiptDate());
    setGatewayRef(generateGatewayRef(selectedPayMethod || 'upi'));
    setTimeout(() => {
      setPaymentStep('receipt');
    }, 2000);
  };

  const canProceedPay = selectedPayMethod === 'card' || (selectedPayMethod === 'upi' && selectedUPIApp);

  // Pagination range
  const getPageRange = (): number[] => {
    const range: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  };

  const totalBilled = filteredBills.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalPaid = isMetered
    ? filteredBills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.totalAmount, 0)
    : filteredBills.filter(b => b.status === 'Adjusted').reduce((sum, b) => sum + b.totalAmount, 0);
  const totalUnpaid = isMetered
    ? filteredBills.filter(b => b.status !== 'Paid').reduce((sum, b) => sum + b.totalAmount, 0)
    : 0; // Non-metered bills are always adjusted from upfront
  const isBillUnpaid = (bill: BillData): boolean => bill.status === 'Unpaid' || bill.status === 'Overdue' || bill.status === 'Partially Paid';
  // For non-metered, compute upfront balance summary
  const nmUpfrontTotal = !isMetered && filteredBills.length > 0 && filteredBills[0].upfrontCollected ? filteredBills[0].upfrontCollected : 0;
  const nmRemainingBalance = !isMetered && filteredBills.length > 0 ? (filteredBills[0].balanceCarriedForward || 0) : 0;

  // Payment mode label for receipt
  const paymentModeLabel = selectedPayMethod === 'card' ? 'Online \u2013 Card' : 'Online \u2013 UPI';
  const upiAppMatch = selectedUPIApp ? UPI_APPS.find(a => a.id === selectedUPIApp) : null;

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg bg-[#1f3a5f] flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Generated Bills {isMetered ? '(Metered)' : '(Non-Metered)'}
            </h1>
            <p className="text-sm text-gray-500 font-['Poppins',sans-serif]">
              {isMetered ? 'View all generated water bills for your metered connection' : 'Monthly charges adjusted against upfront advance payment'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {isMetered ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider font-['Poppins',sans-serif] mb-1">Total Billed</p>
            <p className="text-xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">{formatCurrency(totalBilled)}</p>
            <p className="text-xs text-gray-400 font-['Poppins',sans-serif] mt-1">{filteredBills.length} bill(s)</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider font-['Poppins',sans-serif] mb-1">Total Paid</p>
            <p className="text-xl font-bold text-green-600 font-['Poppins',sans-serif]">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-gray-400 font-['Poppins',sans-serif] mt-1">{filteredBills.filter(b => b.status === 'Paid').length} bill(s)</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider font-['Poppins',sans-serif] mb-1">Outstanding</p>
            <p className="text-xl font-bold text-red-600 font-['Poppins',sans-serif]">{formatCurrency(totalUnpaid)}</p>
            <p className="text-xs text-gray-400 font-['Poppins',sans-serif] mt-1">{filteredBills.filter(b => b.status !== 'Paid').length} bill(s)</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider font-['Poppins',sans-serif] mb-1">Upfront Advance Collected</p>
            <p className="text-xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">{formatCurrency(nmUpfrontTotal)}</p>
            <p className="text-xs text-gray-400 font-['Poppins',sans-serif] mt-1">{filteredBills.length > 0 && filteredBills[0].upfrontMonths ? filteredBills[0].upfrontMonths : 12} months &times; {formatCurrency(filteredBills.length > 0 && filteredBills[0].monthlyRate ? filteredBills[0].monthlyRate : 80)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider font-['Poppins',sans-serif] mb-1">Total Adjusted</p>
            <p className="text-xl font-bold text-green-600 font-['Poppins',sans-serif]">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-gray-400 font-['Poppins',sans-serif] mt-1">{filteredBills.filter(b => b.status === 'Adjusted').length} month(s) adjusted</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider font-['Poppins',sans-serif] mb-1">Balance Remaining</p>
            <p className="text-xl font-bold text-blue-600 font-['Poppins',sans-serif]">{formatCurrency(nmRemainingBalance)}</p>
            <p className="text-xs text-gray-400 font-['Poppins',sans-serif] mt-1">From upfront advance</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">Financial Year</label>
            <select value={selectedYear} onChange={(e) => handleYearChange(e.target.value)} className="w-full px-4 py-2.5 border-[1.5px] border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all">
              {getFinancialYearOptions().map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">Bill Month</label>
            <select value={selectedMonth} onChange={(e) => handleMonthChange(e.target.value)} className="w-full px-4 py-2.5 border-[1.5px] border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all">
              {getMonthOptions().map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by bill no, RR no, month, status..." value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border-[1.5px] border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-[10px] border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#1f3a5f] px-6 py-3">
          <h2 className="text-white font-semibold text-[15px] font-['Poppins',sans-serif]">Generated Bills ({filteredBills.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8f9fa]">
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-600 uppercase tracking-wider font-['Poppins',sans-serif]">Bill No</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-600 uppercase tracking-wider font-['Poppins',sans-serif]">Bill Month</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-600 uppercase tracking-wider font-['Poppins',sans-serif]">Bill Date</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-600 uppercase tracking-wider font-['Poppins',sans-serif]">Due Date</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-600 uppercase tracking-wider font-['Poppins',sans-serif]">{isMetered ? 'Connection' : 'Tariff'}</th>
                {isMetered && <th className="px-4 py-3 text-[11px] font-semibold text-gray-600 uppercase tracking-wider font-['Poppins',sans-serif]">Consumption</th>}
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-600 uppercase tracking-wider font-['Poppins',sans-serif] text-right">{isMetered ? 'Amount' : 'Monthly Charge'}</th>
                {!isMetered && <th className="px-4 py-3 text-[11px] font-semibold text-gray-600 uppercase tracking-wider font-['Poppins',sans-serif] text-right">Balance</th>}
                {!isMetered && <th className="px-4 py-3 text-[11px] font-semibold text-gray-600 uppercase tracking-wider font-['Poppins',sans-serif] text-right">Net Payable</th>}
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-600 uppercase tracking-wider font-['Poppins',sans-serif] text-center">Status</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-600 uppercase tracking-wider font-['Poppins',sans-serif] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.length === 0 ? (
                <tr><td colSpan={isMetered ? 9 : 10} className="px-4 py-12 text-center text-gray-400 font-['Poppins',sans-serif] text-sm">No bills found for the selected filters</td></tr>
              ) : paginatedData.map((bill) => {
                const ss = getStatusColor(bill.status);
                return (
                  <tr key={bill.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3"><span className="text-[#0066cc] font-semibold text-[13px] font-['Poppins',sans-serif] cursor-pointer hover:underline" onClick={() => { setViewBill(bill); setPaymentStep('idle'); }}>{bill.billNo.split('/').pop()}</span></td>
                    <td className="px-4 py-3 text-[13px] text-gray-700 font-['Poppins',sans-serif]">{!isMetered ? toTitleCase(bill.billMonth) : bill.billMonth}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700 font-['Poppins',sans-serif]">{bill.billDate}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700 font-['Poppins',sans-serif]">{bill.dueDate}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700 font-['Poppins',sans-serif]">{!isMetered && bill.tariffLabel ? bill.tariffLabel : bill.connectionType}</td>
                    {isMetered && <td className="px-4 py-3 text-[13px] text-gray-700 font-['Poppins',sans-serif]">{bill.consumption} KL</td>}
                    <td className="px-4 py-3 text-[13px] font-semibold text-gray-800 font-['Poppins',sans-serif] text-right">{formatCurrency(bill.totalAmount)}</td>
                    {!isMetered && <td className="px-4 py-3 text-[13px] text-gray-700 font-['Poppins',sans-serif] text-right">{formatCurrency(bill.balanceCarriedForward != null ? bill.balanceCarriedForward : 0)}</td>}
                    {!isMetered && <td className="px-4 py-3 text-[13px] font-semibold text-green-600 font-['Poppins',sans-serif] text-right">{formatCurrency(bill.netPayable != null ? bill.netPayable : 0)}</td>}
                    <td className="px-4 py-3 text-center"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold font-['Poppins',sans-serif] ${ss.bg} ${ss.text}`}>{bill.status}</span></td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => { setViewBill(bill); setPaymentStep('idle'); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1f3a5f] text-white text-[12px] font-semibold rounded-md hover:bg-[#2a4a73] transition-colors font-['Poppins',sans-serif]">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filteredBills.length)} of {filteredBills.length} bills</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              {getPageRange().map((p) => <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded text-[13px] font-medium font-['Poppins',sans-serif] transition-colors ${currentPage === p ? 'bg-[#1f3a5f] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>)}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════ ULB Bill Modal ═══════ */}
      {viewBill && (() => {
        const bill = viewBill;
        const unpaid = isBillUnpaid(bill);
        const qrPayload = ['JALANIDHI-BILL', 'BillNo:' + bill.billNo, 'RR:' + bill.rrNo, 'Name:' + bill.consumerName, 'Amount:' + String(bill.totalAmount), 'Due:' + bill.dueDate, 'ULB:' + bill.ulb].join('|');

        // ─── Receipt rows (for payment receipt) ───
        const receiptRows = [
          { label: 'Receipt No', value: receiptNo },
          { label: 'Receipt Date', value: receiptDate },
          { label: 'Bill No', value: bill.billNo },
          { label: 'Bill Month', value: bill.billMonth },
          { label: 'Consumer Name', value: bill.consumerName },
          { label: 'RR No', value: bill.rrNo },
          ...(isMetered ? [{ label: 'Meter No', value: bill.meterNo }] : []),
          { label: 'Tariff', value: bill.connectionType },
          { label: 'District', value: bill.district },
          { label: 'Ward', value: bill.ward },
          { label: 'Service Name', value: 'Jalanidhi \u2013 Drinking Water' },
          { label: 'Sub-Service Name', value: 'Monthly Tap Connection Charges' },
          { label: 'Amount Payable', value: '\u20B9 ' + bill.totalAmount.toFixed(2) },
          { label: 'Amount Paid', value: '\u20B9 ' + bill.totalAmount.toFixed(2) },
          { label: 'Payment Mode', value: paymentModeLabel },
          { label: 'Gateway', value: 'e-Sweekruthi Gateway' },
          { label: 'Gateway Ref No', value: gatewayRef },
          { label: 'Transaction Status', value: 'SUCCESS' },
        ];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 backdrop-blur-[2px] bg-black/40" onClick={closeModal} />
            <div className="relative z-10 bg-white rounded-xl shadow-2xl w-[540px] max-h-[92vh] flex flex-col">

              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center justify-between px-5 py-3.5 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#1f3a5f] flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                      {paymentStep === 'receipt' ? 'Payment Receipt' : paymentStep === 'gateway' || paymentStep === 'processing' ? 'e-Sweekruthi Payment Gateway' : !isMetered ? 'Water Bill (Non-Metered)' : 'ULB Bill'}
                    </h3>
                    <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">{bill.billMonth} &middot; {bill.billNo}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 bg-[#f8f9fc]">

                {/* ─── STEP: Payment Receipt (metered only) ─── */}
                {isMetered && paymentStep === 'receipt' && (
                  <>
                    {/* Success Banner */}
                    <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 mb-5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0"><CheckCircle className="w-6 h-6 text-white" /></div>
                      <div>
                        <p className="text-[14px] text-green-800 font-bold font-['Poppins',sans-serif]">Payment Successful!</p>
                        <p className="text-[12px] text-green-700 font-['Poppins',sans-serif]">
                          {formatCurrencyRs(bill.totalAmount)} paid via {selectedPayMethod === 'card' ? 'Debit/Credit Card' : (upiAppMatch ? upiAppMatch.name : 'UPI')} &middot; e-Sweekruthi Gateway
                        </p>
                      </div>
                    </div>

                    {/* Printable Receipt */}
                    <div ref={receiptPrintRef}>
                      <div style={{ background: '#fff', border: '1.5px solid #1f3a5f', padding: '16px 14px', fontFamily: "'Poppins', sans-serif", maxWidth: '460px', margin: '0 auto' }}>
                        {/* Emblem */}
                        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                          <div style={{ width: '72px', margin: '0 auto 6px' }}>
                            <img src={govEmblem} alt="Government of Karnataka" style={{ width: '100%', height: 'auto', display: 'block' }} />
                          </div>
                        </div>
                        {/* Title */}
                        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1f3a5f', textDecoration: 'underline', marginBottom: '3px', lineHeight: 1.3 }}>
                            Jalanidhi &ndash; System-Generated Payment Receipt
                          </div>
                          <div style={{ fontSize: '10px', fontWeight: 600, color: '#1f3a5f', marginBottom: '2px' }}>
                            ({isMetered ? 'Metered' : 'Non-Metered'} Connection)
                          </div>
                          <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#222', marginBottom: '1px', textTransform: 'uppercase' }}>
                            {bill.ulb}
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
                                  padding: '5px 6px', fontWeight: 500, color: '#374151', width: '42%',
                                  borderRight: '1px solid #d1d5db', borderLeft: '1px solid #d1d5db',
                                  borderTop: idx === 0 ? '1px solid #d1d5db' : 'none', verticalAlign: 'top', lineHeight: 1.4,
                                }}>{row.label}</td>
                                <td style={{
                                  padding: '5px 6px', verticalAlign: 'top', lineHeight: 1.4, wordBreak: 'break-all' as any,
                                  fontWeight: row.label === 'Transaction Status' || row.label === 'Amount Paid' ? 700 : 600,
                                  color: row.label === 'Transaction Status' ? '#16a34a' : row.label === 'Amount Paid' ? '#1f3a5f' : '#111827',
                                  borderRight: '1px solid #d1d5db',
                                  borderTop: idx === 0 ? '1px solid #d1d5db' : 'none',
                                }}>{row.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {/* Declaration */}
                        <div style={{ marginTop: '12px', paddingTop: '8px' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#1f3a5f', marginBottom: '4px' }}>DECLARATION</div>
                          <div style={{ fontSize: '9px', color: '#555', lineHeight: 1.5 }}>
                            This receipt confirms successful payment of monthly water charges for the above bill.
                            This is a system-generated receipt. No signature is required.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Receipt Action Buttons */}
                    <div className="mt-5 mb-2 flex justify-center gap-3">
                      <button onClick={handlePrintReceipt} className="h-[44px] px-6 bg-[#f9a825] hover:bg-[#f59e0b] text-[#1f3a5f] text-[13px] font-bold font-['Poppins',sans-serif] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <Printer className="w-4 h-4" /> Print Receipt
                      </button>
                      <button onClick={closeModal} className="h-[44px] px-6 bg-[#1f3a5f] hover:bg-[#2a4a73] text-white text-[13px] font-bold font-['Poppins',sans-serif] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <CheckCircle className="w-4 h-4" /> Done
                      </button>
                    </div>
                  </>
                )}

                {/* ─── STEP: Payment Gateway (metered only) ─── */}
                {isMetered && (paymentStep === 'gateway' || paymentStep === 'processing') && (
                  <>
                    {/* Amount Summary Card */}
                    <div className="bg-[#1f3a5f] rounded-xl p-5 mb-5">
                      <div className="text-center">
                        <p className="text-[11px] text-white/70 font-['Poppins',sans-serif] mb-1">Total Amount to Pay</p>
                        <p className="text-[28px] font-bold text-white font-['Poppins',sans-serif]">{formatCurrencyRs(bill.totalAmount)}</p>
                        <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-white/60 font-['Poppins',sans-serif]">
                          <span>Bill: {bill.billNo.split('/').pop()}</span>
                          <span className="text-white/30">|</span>
                          <span>{bill.consumerName}</span>
                          <span className="text-white/30">|</span>
                          <span>{bill.billMonth}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment info box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5">
                      <p className="text-[12px] text-blue-800 font-['Poppins',sans-serif]">
                        <span className="font-semibold">e-Sweekruthi Gateway:</span> Secure payment processing by Department of Municipal Administration, Government of Karnataka. All methods including UPI, Net Banking, Debit/Credit Cards are accepted.
                      </p>
                    </div>

                    {paymentStep === 'processing' ? (
                      /* Processing Spinner */
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-14 h-14 border-4 border-[#1f3a5f]/20 border-t-[#1f3a5f] rounded-full animate-spin mb-4" />
                        <p className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Processing Payment...</p>
                        <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1">Please do not close this window</p>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Select Payment Method</h3>

                        {/* Debit / Credit Card */}
                        <button
                          onClick={() => { setSelectedPayMethod('card'); setSelectedUPIApp(null); }}
                          className={`w-full mb-3 rounded-xl border-2 p-4 flex items-center gap-4 transition-all cursor-pointer ${
                            selectedPayMethod === 'card' ? 'border-[#f9a825] bg-[#fffbeb] shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selectedPayMethod === 'card' ? 'bg-[#f9a825]' : 'bg-gray-100'}`}>
                            <CreditCard className={`w-6 h-6 ${selectedPayMethod === 'card' ? 'text-[#1f3a5f]' : 'text-gray-500'}`} />
                          </div>
                          <div className="flex-1 text-left">
                            <p className={`text-[14px] font-semibold font-['Poppins',sans-serif] ${selectedPayMethod === 'card' ? 'text-[#1f3a5f]' : 'text-gray-800'}`}>Debit / Credit Card</p>
                            <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">Visa, Mastercard, Rupay</p>
                          </div>
                          {selectedPayMethod === 'card' && <div className="w-6 h-6 rounded-full bg-[#f9a825] flex items-center justify-center shrink-0"><CheckCircle className="w-4 h-4 text-[#1f3a5f]" /></div>}
                        </button>

                        {/* UPI Payment */}
                        <div className={`rounded-xl border-2 transition-all ${selectedPayMethod === 'upi' ? 'border-[#f9a825] bg-[#fffbeb] shadow-md' : 'border-gray-200 bg-white'}`}>
                          <button onClick={() => setSelectedPayMethod('upi')} className="w-full p-4 flex items-center gap-4 cursor-pointer">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selectedPayMethod === 'upi' ? 'bg-[#f9a825]' : 'bg-gray-100'}`}>
                              <Smartphone className={`w-6 h-6 ${selectedPayMethod === 'upi' ? 'text-[#1f3a5f]' : 'text-gray-500'}`} />
                            </div>
                            <div className="flex-1 text-left">
                              <p className={`text-[14px] font-semibold font-['Poppins',sans-serif] ${selectedPayMethod === 'upi' ? 'text-[#1f3a5f]' : 'text-gray-800'}`}>UPI Payment</p>
                              <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">Pay using your favourite UPI app</p>
                            </div>
                            {selectedPayMethod === 'upi' && selectedUPIApp && <div className="w-6 h-6 rounded-full bg-[#f9a825] flex items-center justify-center shrink-0"><CheckCircle className="w-4 h-4 text-[#1f3a5f]" /></div>}
                          </button>
                          {selectedPayMethod === 'upi' && (
                            <div className="px-4 pb-4">
                              <div className="border-t border-[#f9a825]/30 pt-3">
                                <p className="text-[11px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-3 uppercase tracking-wide">Choose UPI App</p>
                                <div className="grid grid-cols-3 gap-3">
                                  {UPI_APPS.map((app) => (
                                    <button key={app.id} onClick={() => setSelectedUPIApp(app.id)}
                                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                        selectedUPIApp === app.id ? 'border-[#f9a825] bg-white shadow-sm' : 'border-transparent bg-white/60 hover:bg-white'
                                      }`}>
                                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-bold font-['Poppins',sans-serif]" style={{ backgroundColor: app.color }}>{app.initials}</div>
                                      <span className={`text-[10px] font-medium font-['Poppins',sans-serif] text-center leading-tight ${selectedUPIApp === app.id ? 'text-[#1f3a5f]' : 'text-gray-600'}`}>{app.name}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Proceed / Cancel */}
                        <div className="mt-5 mb-2 flex justify-center gap-3">
                          <button onClick={() => setPaymentStep('idle')} className="h-[44px] px-6 border-2 border-gray-300 text-gray-600 text-[13px] font-bold font-['Poppins',sans-serif] rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer">
                            <X className="w-4 h-4" /> Cancel
                          </button>
                          <button
                            onClick={handleProceedPayment}
                            disabled={!canProceedPay}
                            className={`h-[48px] px-8 rounded-lg text-[14px] font-bold font-['Poppins',sans-serif] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              canProceedPay ? 'bg-[#f9a825] hover:bg-[#f59e0b] text-[#1f3a5f] hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                            }`}
                          >
                            <Wallet className="w-4 h-4" />
                            Pay {formatCurrencyRs(bill.totalAmount)}
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* ─── STEP: Bill View (idle) ─── */}
                {paymentStep === 'idle' && (
                  <>
                    {/* Printable Bill */}
                    <div ref={printRef}>
                      {!isMetered ? (
                        /* ═══ Non-Metered Bill Format (Advance Adjustment) ═══ */
                        <div style={{ background: '#fff', padding: '20px', maxWidth: '480px', margin: '0 auto', fontFamily: "'Poppins', sans-serif" }}>
                          {/* ULB Title */}
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1f3a5f', marginBottom: '2px' }}>{bill.ulb}</div>
                            <div style={{ fontSize: '11px', color: '#555', marginBottom: '4px' }}>
                              &#x0C9C;&#x0CB2; &#x0CB8;&#x0CB0;&#x0CAC;&#x0CB0;&#x0CBE;&#x0C9C;&#x0CC1; &#x0CAC;&#x0CBF;&#x0CB2;&#x0CCD; / Water Bill (Non-Metered &ndash; Advance Adjustment)
                            </div>
                          </div>

                          {/* Main Bill Table */}
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: "'Poppins', sans-serif" }}>
                            <tbody>
                              {[
                                { label: 'Bill No', value: bill.billNo },
                                { label: 'Bill Date', value: bill.billDate },
                                { label: 'Due Date', value: bill.dueDate },
                                { label: 'Bill Month', value: toTitleCase(bill.billMonth) },
                                { label: 'Tariff', value: bill.tariffLabel || (bill.connectionType + ' \u2013 \u20B9' + (bill.monthlyRate || getFixedMonthlyRate(bill.connectionType))) },
                                { label: 'Consumer Name', value: bill.consumerName },
                                { label: 'RR No', value: bill.rrNo },
                                { label: 'Connection Type', value: bill.connectionType },
                                { label: 'Mobile', value: bill.mobile || 'N/A' },
                                { label: 'Address', value: bill.address || bill.ward },
                              ].map((row, idx) => (
                                <tr key={idx}>
                                  <td style={{
                                    padding: '6px 8px', fontWeight: 500, color: '#374151', width: '42%',
                                    border: '1px solid #d1d5db', verticalAlign: 'top', lineHeight: 1.4,
                                  }}>{row.label}</td>
                                  <td style={{
                                    padding: '6px 8px', fontWeight: 600, color: '#111827',
                                    border: '1px solid #d1d5db', verticalAlign: 'top', lineHeight: 1.4,
                                  }}>{row.value}</td>
                                </tr>
                              ))}
                              {/* Blank spacer row */}
                              <tr><td colSpan={2} style={{ padding: '4px', border: '1px solid #d1d5db' }}>&nbsp;</td></tr>
                              {/* Upfront & Adjustment rows */}
                              {[
                                { label: 'Upfront Collected', value: '\u20B9' + (bill.upfrontCollected || 0) + ' (' + (bill.upfrontMonths || 12) + ' months \u00D7 \u20B9' + (bill.monthlyRate || 80) + ')', bold: false },
                                { label: toTitleCase(bill.billMonth.split(' ')[0]) + ' Charges Accounted', value: '\u20B9' + (bill.monthChargesAccounted || bill.currentDemand), bold: false },
                                { label: 'Balance Carried Forward', value: '\u20B9' + (bill.balanceCarriedForward != null ? bill.balanceCarriedForward : 0), bold: true },
                                { label: 'Net Payable for ' + toTitleCase(bill.billMonth.split(' ')[0]), value: '\u20B9' + (bill.netPayable != null ? bill.netPayable : 0), bold: true },
                              ].map((row, idx) => (
                                <tr key={'adj-' + idx}>
                                  <td style={{
                                    padding: '6px 8px', fontWeight: row.bold ? 700 : 500, color: '#374151',
                                    border: '1px solid #d1d5db', verticalAlign: 'top', lineHeight: 1.4,
                                  }}>{row.label}</td>
                                  <td style={{
                                    padding: '6px 8px', fontWeight: row.bold ? 700 : 600, color: row.bold ? '#1f3a5f' : '#111827',
                                    border: '1px solid #d1d5db', verticalAlign: 'top', lineHeight: 1.4,
                                  }}>{row.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Note */}
                          <div style={{ marginTop: '14px', padding: '10px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '10px', color: '#1e40af', lineHeight: 1.6, fontFamily: "'Poppins', sans-serif" }}>
                            <strong>Note:</strong> For non-metered connections, monthly charges are adjusted against the upfront advance as per {bill.ulb} approved tariff. This is a system-generated document.
                          </div>

                          {/* QR Code */}
                          <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #ccc' }}>
                            <QRCodeSVG value={qrPayload} size={100} level="M" style={{ margin: '0 auto' }} />
                            <div style={{ fontSize: '9px', color: '#777', marginTop: '6px', fontFamily: "'Poppins', sans-serif" }}>Scan for bill verification</div>
                          </div>

                          {/* Footer */}
                          <div style={{ textAlign: 'center', fontSize: '9px', color: '#888', marginTop: '10px', fontStyle: 'italic', fontFamily: "'Poppins', sans-serif" }}>
                            This is a system-generated document. No signature is required.
                          </div>
                        </div>
                      ) : (
                        /* ═══ Metered Bill Format (original) ═══ */
                        <div style={{ border: '2px solid #1f3a5f', padding: '20px', background: '#fff', maxWidth: '440px', margin: '0 auto' }}>
                          {/* Header */}
                          <div style={{ textAlign: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #1f3a5f' }}>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1f3a5f', fontFamily: "'Poppins', sans-serif", marginBottom: '2px' }}>ULB Bill</div>
                            <div style={{ fontSize: '11px', color: '#555', fontFamily: "'Poppins', sans-serif" }}>Department of Municipal Administration</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f3a5f', fontFamily: "'Poppins', sans-serif", marginTop: '4px' }}>{bill.ulb}</div>
                          </div>
                          {/* Bill Information */}
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1f3a5f', margin: '12px 0 6px', paddingBottom: '3px', borderBottom: '1px dashed #ccc', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Poppins', sans-serif" }}>Bill Information</div>
                          <div style={{ fontSize: '11px', fontFamily: "'Poppins', sans-serif" }}>
                            {[{ l: 'Bill No', v: bill.billNo }, { l: 'Bill Date', v: bill.billDate }, { l: 'Due Date', v: bill.dueDate }, { l: 'Billing Month', v: bill.billMonth }].map((r, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#555', fontWeight: 500 }}>{r.l}</span><span style={{ color: '#1a1a1a', fontWeight: 600 }}>{r.v}</span></div>
                            ))}
                          </div>
                          {/* Consumer Details */}
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1f3a5f', margin: '12px 0 6px', paddingBottom: '3px', borderBottom: '1px dashed #ccc', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Poppins', sans-serif" }}>Consumer Details</div>
                          <div style={{ fontSize: '11px', fontFamily: "'Poppins', sans-serif" }}>
                            {[
                              { l: 'Consumer Name', v: bill.consumerName }, { l: 'RR Number', v: bill.rrNo }, { l: 'Application No', v: bill.applicationNo },
                              { l: 'Connection Type', v: bill.connectionType },
                            ].map((r, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#555', fontWeight: 500 }}>{r.l}</span><span style={{ color: '#1a1a1a', fontWeight: 600 }}>{r.v}</span></div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#555', fontWeight: 500 }}>Ward</span><span style={{ color: '#1a1a1a', fontWeight: 600 }}>{bill.ward}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#555', fontWeight: 500 }}>Meter No</span><span style={{ color: '#1a1a1a', fontWeight: 600 }}>{bill.meterNo}</span></div>
                          </div>
                          {/* Meter Reading */}
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1f3a5f', margin: '12px 0 6px', paddingBottom: '3px', borderBottom: '1px dashed #ccc', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Poppins', sans-serif" }}>Meter Reading</div>
                          <div style={{ fontSize: '11px', fontFamily: "'Poppins', sans-serif" }}>
                            {[{ l: 'Previous Reading', v: String(bill.prevReading) }, { l: 'Current Reading', v: String(bill.currReading) }, { l: 'Units Consumed', v: String(bill.consumption) }].map((r, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#555', fontWeight: 500 }}>{r.l}</span><span style={{ color: '#1a1a1a', fontWeight: 600 }}>{r.v}</span></div>
                            ))}
                          </div>
                          {/* Bill Breakdown */}
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1f3a5f', margin: '12px 0 6px', paddingBottom: '3px', borderBottom: '1px dashed #ccc', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Poppins', sans-serif" }}>Bill Breakdown</div>
                          <div style={{ fontSize: '11px', fontFamily: "'Poppins', sans-serif" }}>
                            {[{ l: 'Current Demand', v: formatCurrencyRs(bill.currentDemand) }, { l: 'Arrears', v: formatCurrencyRs(bill.arrears) }, { l: 'Interest', v: formatCurrencyRs(bill.interest) }, { l: 'Others', v: formatCurrencyRs(bill.others) }].map((r, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#555', fontWeight: 500 }}>{r.l}</span><span style={{ color: '#1a1a1a', fontWeight: 600 }}>{r.v}</span></div>
                            ))}
                            {bill.penaltyReason && bill.penaltyReason !== '__none__' && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#555', fontWeight: 500 }}>Penalty ({bill.penaltyReason.replace(/_/g, ' ')})</span><span style={{ color: '#1a1a1a', fontWeight: 600 }}>{formatCurrencyRs(bill.penaltyAmount)}</span></div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '2px solid #1f3a5f', fontSize: '13px', fontWeight: 700, color: '#1f3a5f', fontFamily: "'Poppins', sans-serif" }}><span>Total Amount Due</span><span>{formatCurrencyRs(bill.totalAmount)}</span></div>
                          </div>
                          {/* Status */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', padding: '8px 10px', background: '#f8f9fa', borderRadius: '6px', fontSize: '11px', fontFamily: "'Poppins', sans-serif" }}>
                            <span style={{ color: '#555', fontWeight: 600 }}>Payment Status</span>
                            <span style={{
                              display: 'inline-block', padding: '2px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, fontFamily: "'Poppins', sans-serif",
                              background: bill.status === 'Paid' ? '#dcfce7' : bill.status === 'Overdue' ? '#fee2e2' : bill.status === 'Partially Paid' ? '#ffedd5' : '#fef9c3',
                              color: bill.status === 'Paid' ? '#15803d' : bill.status === 'Overdue' ? '#dc2626' : bill.status === 'Partially Paid' ? '#c2410c' : '#a16207',
                            }}>{bill.status}</span>
                          </div>
                          {/* Remarks */}
                          {bill.remarks && <div style={{ marginTop: '10px', fontSize: '10px', fontFamily: "'Poppins', sans-serif", color: '#555' }}><span style={{ fontWeight: 600 }}>Remarks: </span>{bill.remarks}</div>}
                          {/* QR Code */}
                          <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #ccc' }}>
                            <QRCodeSVG value={qrPayload} size={110} level="M" style={{ margin: '0 auto' }} />
                            <div style={{ fontSize: '9px', color: '#777', marginTop: '6px', fontFamily: "'Poppins', sans-serif" }}>Scan to Pay</div>
                          </div>
                          {/* Footer */}
                          <div style={{ textAlign: 'center', fontSize: '9px', color: '#888', marginTop: '12px', fontStyle: 'italic', fontFamily: "'Poppins', sans-serif" }}>This is a computer-generated bill. For queries, contact your ULB office.</div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 mb-2 flex justify-center gap-3">
                      <button onClick={handlePrint} className="h-[44px] px-6 bg-[#f9a825] hover:bg-[#f59e0b] text-[#1f3a5f] text-[13px] font-bold font-['Poppins',sans-serif] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <Printer className="w-4 h-4" /> Print
                      </button>
                      <button onClick={handleDownload} className="h-[44px] px-6 border-2 border-[#1f3a5f] text-[#1f3a5f] text-[13px] font-bold font-['Poppins',sans-serif] rounded-lg hover:bg-[#f0f4f8] transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <Download className="w-4 h-4" /> Download
                      </button>
                      {isMetered && unpaid && (
                        <button onClick={handlePayNow} className="h-[44px] px-8 bg-[#22c55e] hover:bg-[#16a34a] text-white text-[13px] font-bold font-['Poppins',sans-serif] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                          <Wallet className="w-4 h-4" /> Pay Now &ndash; {formatCurrencyRs(bill.totalAmount)}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

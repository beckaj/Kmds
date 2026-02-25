import { useState, useMemo, useRef } from 'react';
import { Eye, Printer, Download, X, ChevronLeft, ChevronRight, Search, Receipt } from 'lucide-react';
import govEmblem from 'figma:asset/0be0cabdff30f03b02e49837ef21512295729acd.png';

// ── Types ────────────────────────────────────────────────────────────────────
interface ReceiptData {
  id: string;
  receiptNo: string;
  receiptDate: string;
  billNo: string;
  billMonth: string;
  consumerName: string;
  rrNo: string;
  meterNo: string;
  tariff: string;
  district: string;
  ward: string;
  serviceName: string;
  subServiceName: string;
  amountPayable: number;
  amountPaid: number;
  paymentMode: string;
  gateway: string;
  gatewayRefNo: string;
  transactionStatus: string;
}

// ── Mock Data Generator ──────────────────────────────────────────────────────
const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

const PAYMENT_MODES = ['Online - UPI', 'Online - Net Banking', 'Online - Debit Card', 'Online - Credit Card', 'Cash', 'Cheque'];
const GATEWAYS = ['e-Sweekruthi Gateway', 'Razorpay', 'PayU', 'BillDesk'];
const TARIFFS = ['Domestic', 'Non-Domestic', 'Commercial', 'Industrial'];

function generateReceiptId(index: number): string {
  return `RCPT-${String(index + 1).padStart(4, '0')}`;
}

function generateMockReceipts(): ReceiptData[] {
  const receipts: ReceiptData[] = [];
  let counter = 0;

  // Financial year April 2025 to February 2026
  const fyMonths = [
    { month: 3, year: 2025 },  // April
    { month: 4, year: 2025 },  // May
    { month: 5, year: 2025 },  // June
    { month: 6, year: 2025 },  // July
    { month: 7, year: 2025 },  // August
    { month: 8, year: 2025 },  // September
    { month: 9, year: 2025 },  // October
    { month: 10, year: 2025 }, // November
    { month: 11, year: 2025 }, // December
    { month: 0, year: 2026 },  // January
    { month: 1, year: 2026 },  // February
  ];

  const baseAmounts = [1295, 1450, 1100, 1650, 1295, 1380, 1295, 1520, 1295, 1295, 1295];

  fyMonths.forEach(({ month, year }, mIdx) => {
    // Generate 3-5 receipts per month
    const count = 3 + (mIdx % 3);
    for (let i = 0; i < count; i++) {
      const day = Math.min(1 + (i * 7) + (mIdx % 5), 28);
      const dateStr = `${String(day).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`;
      const hours = 9 + (counter % 12);
      const mins = (counter * 7) % 60;
      const amountBase = baseAmounts[mIdx % baseAmounts.length] + (i * 50);
      const paymentMode = PAYMENT_MODES[counter % PAYMENT_MODES.length];
      const gateway = GATEWAYS[counter % GATEWAYS.length];
      const tariff = TARIFFS[counter % TARIFFS.length];
      const billSeq = 1771503726399 + counter;

      receipts.push({
        id: generateReceiptId(counter),
        receiptNo: `HUBB/JN/RCPT/${year}/${413421 + counter}`,
        receiptDate: `${dateStr} ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')} PM`,
        billNo: `BILL-${billSeq}-${75 + (counter % 30)}`,
        billMonth: `${MONTHS[month]} ${year}`,
        consumerName: 'Ramesh A',
        rrNo: '234354',
        meterNo: `MTR-W25-${10042 + counter}`,
        tariff,
        district: 'Dharwad',
        ward: `Ward ${25 + (counter % 5)}`,
        serviceName: 'Jalanidhi - Drinking Water',
        subServiceName: 'Monthly Tap Connection Charges',
        amountPayable: amountBase,
        amountPaid: amountBase,
        paymentMode,
        gateway,
        gatewayRefNo: `UPI${year}0${String(month + 1).padStart(2, '0')}${String(day).padStart(2, '0')}${19697713 + counter}`,
        transactionStatus: 'SUCCESS',
      });
      counter++;
    }
  });

  // Sort by date descending (most recent first)
  return receipts.reverse();
}

const ALL_RECEIPTS = generateMockReceipts();

// ── Financial Year Helpers ───────────────────────────────────────────────────
function getCurrentFinancialYear(): string {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const year = now.getFullYear();
  if (month >= 3) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

function getFinancialYearOptions(): { value: string; label: string }[] {
  return [
    { value: '2025-2026', label: 'FY 2025-2026' },
    { value: '2024-2025', label: 'FY 2024-2025' },
    { value: '2023-2024', label: 'FY 2023-2024' },
  ];
}

function getMonthOptions(): { value: string; label: string }[] {
  const opts: { value: string; label: string }[] = [
    { value: '__none__', label: 'All Months' },
  ];
  MONTHS.forEach((m, idx) => {
    opts.push({ value: String(idx), label: m.charAt(0) + m.slice(1).toLowerCase() });
  });
  return opts;
}

// ── Pagination Constants ─────────────────────────────────────────────────────
const PAGE_SIZE = 10;

// ── Component ────────────────────────────────────────────────────────────────
export default function PaymentReceipts() {
  const [selectedYear, setSelectedYear] = useState<string>(getCurrentFinancialYear());
  const [selectedMonth, setSelectedMonth] = useState<string>('__none__');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewReceipt, setViewReceipt] = useState<ReceiptData | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Filter data by year, month, and search
  const filteredReceipts = useMemo(() => {
    let data = ALL_RECEIPTS;

    // Filter by financial year
    if (selectedYear) {
      const parts = selectedYear.split('-');
      const startYear = parseInt(parts[0], 10);
      const endYear = parseInt(parts[1], 10);

      data = data.filter((r) => {
        const monthName = r.billMonth.split(' ')[0];
        const rYear = parseInt(r.billMonth.split(' ')[1], 10);
        const mIdx = MONTHS.indexOf(monthName);

        // FY runs April (3) of startYear to March (2) of endYear
        if (rYear === startYear && mIdx >= 3) return true;
        if (rYear === endYear && mIdx <= 2) return true;
        return false;
      });
    }

    // Filter by month
    if (selectedMonth && selectedMonth !== '__none__') {
      const mIdx = parseInt(selectedMonth, 10);
      data = data.filter((r) => {
        const monthName = r.billMonth.split(' ')[0];
        return MONTHS.indexOf(monthName) === mIdx;
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter((r) =>
        r.receiptNo.toLowerCase().includes(q) ||
        r.billNo.toLowerCase().includes(q) ||
        r.meterNo.toLowerCase().includes(q) ||
        r.billMonth.toLowerCase().includes(q) ||
        r.paymentMode.toLowerCase().includes(q)
      );
    }

    return data;
  }, [selectedYear, selectedMonth, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredReceipts.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredReceipts.slice(start, start + PAGE_SIZE);
  }, [filteredReceipts, currentPage]);

  // Reset page when filters change
  const handleYearChange = (val: string) => {
    setSelectedYear(val);
    setCurrentPage(1);
  };
  const handleMonthChange = (val: string) => {
    setSelectedMonth(val);
    setCurrentPage(1);
  };
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Print receipt
  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printContents = receiptRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=800,height=1000');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Payment Receipt</title>
            <style>
              body { font-family: 'Poppins', Arial, sans-serif; padding: 20px; color: #1f3a5f; }
              table { width: 100%; border-collapse: collapse; }
              td { border: 1px solid #d1d5db; padding: 10px 14px; font-size: 13px; }
              .label { font-weight: 500; color: #4b5563; width: 40%; background: #f8fafc; }
              .value { font-weight: 600; color: #1f3a5f; }
              .success { color: #16a34a; font-weight: 700; }
              img { display: block; margin: 0 auto 8px; width: 72px; }
              h2, h3, p { text-align: center; margin: 4px 0; }
            </style>
          </head>
          <body>${printContents}</body>
        </html>
      `);
      win.document.close();
      win.print();
    }
  };

  // Download receipt as image (simplified - creates a data blob)
  const handleDownload = () => {
    if (!receiptRef.current) return;
    const printContents = receiptRef.current.innerHTML;
    const blob = new Blob([`
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #1f3a5f; max-width: 700px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; }
            td { border: 1px solid #d1d5db; padding: 10px 14px; font-size: 13px; }
            .label { font-weight: 500; color: #4b5563; width: 40%; background: #f8fafc; }
            .value { font-weight: 600; color: #1f3a5f; }
            .success { color: #16a34a; font-weight: 700; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = viewReceipt ? `Receipt_${viewReceipt.receiptNo.replace(/\//g, '_')}.html` : 'Receipt.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Pagination range
  const getPageRange = (): number[] => {
    const range: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg bg-[#1f3a5f] flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Payment Receipts
            </h1>
            <p className="text-sm text-gray-500 font-['Poppins',sans-serif]">
              View and download your water connection payment receipts
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Financial Year */}
          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
              Financial Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-full px-4 py-2.5 border-[1.5px] border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
            >
              {getFinancialYearOptions().map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
              Bill Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="w-full px-4 py-2.5 border-[1.5px] border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
            >
              {getMonthOptions().map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by receipt no, bill no, meter no..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-[1.5px] border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Results summary */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-['Poppins',sans-serif]">
            Showing <span className="font-semibold text-[#1f3a5f]">{paginatedData.length}</span> of{' '}
            <span className="font-semibold text-[#1f3a5f]">{filteredReceipts.length}</span> receipts
          </p>
          {selectedMonth !== '__none__' && (
            <button
              onClick={() => { setSelectedMonth('__none__'); setCurrentPage(1); }}
              className="text-sm text-[#1f3a5f] hover:underline font-['Poppins',sans-serif] font-medium"
            >
              Clear month filter
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: '1100px' }}>
            <thead className="bg-[#27548a]/10">
              <tr className="border-b border-[#170F49]">
                <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[50px]">#</th>
                <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">Receipt No</th>
                <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">Receipt Date</th>
                <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">Bill No</th>
                <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">Bill Month</th>
                <th className="px-4 py-3 text-right text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">Amount Paid</th>
                <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">Payment Mode</th>
                <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">Status</th>
                <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Receipt className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-['Poppins',sans-serif] font-medium">No receipts found</p>
                      <p className="text-sm text-gray-400 font-['Poppins',sans-serif] mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((receipt, idx) => {
                  const serialNo = (currentPage - 1) * PAGE_SIZE + idx + 1;
                  return (
                    <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-center text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif]">
                        {serialNo}
                      </td>
                      <td className="px-4 py-4 text-left">
                        <span className="text-[14px] font-medium text-[#1f3a5f] font-['Poppins',sans-serif]">
                          {receipt.receiptNo || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-[14px] text-gray-700 font-['Poppins',sans-serif]">
                        {receipt.receiptDate ? receipt.receiptDate.split(' ').slice(0, 1).join('') : 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-left text-[14px] text-gray-700 font-['Poppins',sans-serif]">
                        {receipt.billNo || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-center text-[14px] text-gray-700 font-['Poppins',sans-serif]">
                        {receipt.billMonth || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-right text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                        {receipt.amountPaid != null ? `Rs. ${receipt.amountPaid.toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-center text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                        {receipt.paymentMode || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium font-['Poppins',sans-serif] border ${
                          receipt.transactionStatus === 'SUCCESS'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : receipt.transactionStatus === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                        }`}>
                          {receipt.transactionStatus || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => setViewReceipt(receipt)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1f3a5f] text-white font-['Poppins',sans-serif] font-medium text-sm rounded-lg hover:bg-[#2d4a6f] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-['Poppins',sans-serif]">
              Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1">
              {/* Previous */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              {getPageRange().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium font-['Poppins',sans-serif] transition-colors ${
                    page === currentPage
                      ? 'bg-[#1f3a5f] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Receipt Modal ────────────────────────────────────────────────── */}
      {viewReceipt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[720px] max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <h2 className="text-lg font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">Payment Receipt</h2>
              <button
                onClick={() => setViewReceipt(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Receipt Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div ref={receiptRef}>
                {/* Blue top bar */}
                <div style={{ width: '100%', height: '6px', background: '#1f3a5f', borderRadius: '3px 3px 0 0' }} />

                <div style={{ border: '1px solid #d1d5db', borderTop: 'none', padding: '28px 24px 24px', background: '#fff' }}>
                  {/* Emblem */}
                  <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                    <img
                      src={govEmblem}
                      alt="Government of Karnataka"
                      style={{ width: '72px', height: 'auto', margin: '0 auto 4px', display: 'block' }}
                    />
                    <p style={{ fontSize: '11px', color: '#4b5563', margin: '0 0 12px', fontFamily: "'Poppins', sans-serif" }}>
                      Government of Karnataka
                    </p>
                  </div>

                  {/* Title Block */}
                  <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1f3a5f', margin: '0 0 2px', fontFamily: "'Poppins', sans-serif" }}>
                      Jalanidhi &ndash; System-Generated Payment Receipt
                    </h2>
                    <p style={{ fontSize: '13px', color: '#4b5563', margin: '0 0 3px', fontFamily: "'Poppins', sans-serif" }}>
                      ({viewReceipt.tariff || 'N/A'} Connection)
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#1f3a5f', margin: '0 0 2px', fontFamily: "'Poppins', sans-serif" }}>
                      HUBBALLI-DHARWAD (HDMC)
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 2px', fontFamily: "'Poppins', sans-serif" }}>
                      &#x0C9C;&#x0CB2; &#x0CB8;&#x0CB0;&#x0CAC;&#x0CB0;&#x0CBE;&#x0C9C;&#x0CC1; &ndash; Water Supply
                    </p>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#1f3a5f', margin: '6px 0 2px', fontFamily: "'Poppins', sans-serif" }}>
                      PAYMENT RECEIPT
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', margin: '0', fontFamily: "'Poppins', sans-serif" }}>
                      (Monthly Tap Connection &ndash; Water Charges)
                    </p>
                  </div>

                  {/* Receipt Details Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px' }}>
                    <tbody>
                      {[
                        ['Receipt No', viewReceipt.receiptNo || 'N/A'],
                        ['Receipt Date', viewReceipt.receiptDate || 'N/A'],
                        ['Bill No', viewReceipt.billNo || 'N/A'],
                        ['Bill Month', viewReceipt.billMonth || 'N/A'],
                        ['Consumer Name', viewReceipt.consumerName || 'N/A'],
                        ['RR No', viewReceipt.rrNo || 'N/A'],
                        ['Meter No', viewReceipt.meterNo || 'N/A'],
                        ['Tariff', viewReceipt.tariff || 'N/A'],
                        ['District', viewReceipt.district || 'N/A'],
                        ['Ward', viewReceipt.ward || 'N/A'],
                        ['Service Name', viewReceipt.serviceName || 'N/A'],
                        ['Sub-Service Name', viewReceipt.subServiceName || 'N/A'],
                        ['Amount Payable', viewReceipt.amountPayable != null ? `\u20B9 ${viewReceipt.amountPayable.toFixed(2)}` : 'N/A'],
                        ['Amount Paid', viewReceipt.amountPaid != null ? `\u20B9 ${viewReceipt.amountPaid.toFixed(2)}` : 'N/A'],
                        ['Payment Mode', viewReceipt.paymentMode || 'N/A'],
                        ['Gateway', viewReceipt.gateway || 'N/A'],
                        ['Gateway Ref No', viewReceipt.gatewayRefNo || 'N/A'],
                      ].map(([label, value], rIdx) => (
                        <tr key={rIdx}>
                          <td style={{
                            border: '1px solid #d1d5db',
                            padding: '10px 14px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#4b5563',
                            width: '40%',
                            background: '#f8fafc',
                            fontFamily: "'Poppins', sans-serif",
                            fontStyle: 'italic',
                          }}>
                            {label}
                          </td>
                          <td style={{
                            border: '1px solid #d1d5db',
                            padding: '10px 14px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#1f3a5f',
                            fontFamily: "'Poppins', sans-serif",
                          }}>
                            {value}
                          </td>
                        </tr>
                      ))}
                      {/* Transaction Status - Special row */}
                      <tr>
                        <td style={{
                          border: '1px solid #d1d5db',
                          padding: '10px 14px',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#4b5563',
                          width: '40%',
                          background: '#f8fafc',
                          fontFamily: "'Poppins', sans-serif",
                          fontStyle: 'italic',
                        }}>
                          Transaction Status
                        </td>
                        <td style={{
                          border: '1px solid #d1d5db',
                          padding: '10px 14px',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: viewReceipt.transactionStatus === 'SUCCESS' ? '#16a34a' : '#dc2626',
                          fontFamily: "'Poppins', sans-serif",
                        }}>
                          {viewReceipt.transactionStatus || 'N/A'}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Declaration */}
                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1f3a5f', margin: '0 0 6px', fontFamily: "'Poppins', sans-serif" }}>
                      DECLARATION
                    </h4>
                    <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.6, margin: 0, fontFamily: "'Poppins', sans-serif" }}>
                      This receipt confirms successful payment of monthly water charges for the
                      above-mentioned connection under Jalanidhi &ndash; Drinking Water Supply Service,
                      HUBBALLI-DHARWAD Municipal Corporation (HDMC). This is a system-generated
                      receipt and does not require a physical signature.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#1f3a5f] text-[#1f3a5f] font-['Poppins',sans-serif] font-semibold text-sm rounded-lg hover:bg-[#f0f4f8] transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1f3a5f] text-white font-['Poppins',sans-serif] font-semibold text-sm rounded-lg hover:bg-[#2d4a6f] transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

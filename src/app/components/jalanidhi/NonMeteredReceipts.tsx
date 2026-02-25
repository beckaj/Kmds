import { useState, useMemo, useRef } from 'react';
import { Eye, Printer, Download, X, ChevronLeft, ChevronRight, Search, Receipt } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface NonMeteredReceiptData {
  id: string;
  receiptNo: string;
  receiptDate: string;
  transactionStatus: string;
  billNo: string;
  rrNo: string;
  billMonth: string;
  consumerName: string;
  connectionType: string;
  amountPayable: number;
  amountDebited: number;
  paymentMode: string;
  gateway: string;
  referenceNo: string;
  creditedTo: string;
}

// ── Mock Data ────────────────────────────────────────────────────────────────
const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

const CONSUMER_NAMES = [
  'PAVITHRA R POOJARY', 'SURESH B HEGDE', 'LAKSHMI N SHETTY', 'RAJESH K NAIK',
  'ANITHA M GOWDA', 'RAMESH D KULKARNI', 'SAVITHA S BHAT', 'MANJUNATH R SHENOY',
  'DEEPA K HEGDE', 'GANESH P NAYAK', 'SUMA T ACHARYA', 'VINAY H SHETTY',
];

const CONNECTION_TYPES = [
  'Non-Metered (Domestic)',
  'Non-Metered (Domestic)',
  'Non-Metered (Domestic)',
  'Non-Metered (Non-Domestic)',
  'Non-Metered (Domestic)',
  'Non-Metered (Commercial)',
];

const AMOUNTS: number[] = [80, 80, 80, 120, 80, 200, 80, 80, 120, 80, 80, 80];

function generateNonMeteredReceipts(): NonMeteredReceiptData[] {
  const receipts: NonMeteredReceiptData[] = [];
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

  fyMonths.forEach(({ month, year }, mIdx) => {
    const count = 3 + (mIdx % 3);
    for (let i = 0; i < count; i++) {
      const day = Math.min(15 + (i * 3) + (mIdx % 5), 28);
      const dateStr = `${String(day).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`;
      const hours = 10 + (counter % 4);
      const mins = (counter * 13) % 60;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours > 12 ? hours - 12 : hours;
      const amount = AMOUNTS[counter % AMOUNTS.length];
      const consumerName = CONSUMER_NAMES[counter % CONSUMER_NAMES.length];
      const connectionType = CONNECTION_TYPES[counter % CONNECTION_TYPES.length];
      const rrBase = 2018000000000 + (counter * 1000029);
      const billSeqNum = String(789 + counter).padStart(7, '0');

      receipts.push({
        id: `NM-RCPT-${String(counter + 1).padStart(4, '0')}`,
        receiptNo: `KDP/JN/RCPT/${year}/${String(1245 + counter).padStart(6, '0')}`,
        receiptDate: `${dateStr} ${String(displayHour).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`,
        transactionStatus: 'SUCCESS',
        billNo: `KDP/TMC/NM/${year}/${billSeqNum}`,
        rrNo: `${Math.floor(rrBase / 1000000)}A${String(rrBase % 10000000).padStart(7, '0')}`,
        billMonth: `${MONTHS[month].charAt(0)}${MONTHS[month].slice(1).toLowerCase()} ${year}`,
        consumerName,
        connectionType,
        amountPayable: amount,
        amountDebited: amount,
        paymentMode: 'Auto-Debit',
        gateway: 'FBAS / e-Sweekruthi',
        referenceNo: `FBAS${year}${String(month + 1).padStart(2, '0')}${String(day).padStart(2, '0')}${String(103045 + counter)}`,
        creditedTo: 'Kundapura TMC \u2013 ULB Account',
      });
      counter++;
    }
  });

  return receipts.reverse();
}

const ALL_RECEIPTS = generateNonMeteredReceipts();

// ── Helpers ──────────────────────────────────────────────────────────────────
function getCurrentFinancialYear(): string {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  if (month >= 3) return `${year}-${year + 1}`;
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

const PAGE_SIZE = 10;

// ── Label + Value row style helpers ──────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  border: '1px solid #333',
  padding: '8px 14px',
  fontSize: '13.5px',
  fontWeight: 500,
  color: '#111',
  width: '38%',
  background: '#fff',
  fontFamily: "'Poppins', sans-serif",
};
const valueStyle: React.CSSProperties = {
  border: '1px solid #333',
  padding: '8px 14px',
  fontSize: '13.5px',
  fontWeight: 500,
  color: '#111',
  fontFamily: "'Poppins', sans-serif",
};

// ── Component ────────────────────────────────────────────────────────────────
export default function NonMeteredReceipts() {
  const [selectedYear, setSelectedYear] = useState<string>(getCurrentFinancialYear());
  const [selectedMonth, setSelectedMonth] = useState<string>('__none__');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewReceipt, setViewReceipt] = useState<NonMeteredReceiptData | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Filter
  const filteredReceipts = useMemo(() => {
    let data = ALL_RECEIPTS;

    if (selectedYear) {
      const parts = selectedYear.split('-');
      const startYear = parseInt(parts[0], 10);
      const endYear = parseInt(parts[1], 10);
      data = data.filter((r) => {
        const monthName = r.billMonth.split(' ')[0].toUpperCase();
        const rYear = parseInt(r.billMonth.split(' ')[1], 10);
        const mIdx = MONTHS.indexOf(monthName);
        if (rYear === startYear && mIdx >= 3) return true;
        if (rYear === endYear && mIdx <= 2) return true;
        return false;
      });
    }

    if (selectedMonth && selectedMonth !== '__none__') {
      const mIdx = parseInt(selectedMonth, 10);
      data = data.filter((r) => {
        const monthName = r.billMonth.split(' ')[0].toUpperCase();
        return MONTHS.indexOf(monthName) === mIdx;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter((r) =>
        r.receiptNo.toLowerCase().includes(q) ||
        r.billNo.toLowerCase().includes(q) ||
        r.rrNo.toLowerCase().includes(q) ||
        r.consumerName.toLowerCase().includes(q) ||
        r.billMonth.toLowerCase().includes(q) ||
        r.referenceNo.toLowerCase().includes(q)
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

  const handleYearChange = (val: string) => { setSelectedYear(val); setCurrentPage(1); };
  const handleMonthChange = (val: string) => { setSelectedMonth(val); setCurrentPage(1); };
  const handleSearchChange = (val: string) => { setSearchQuery(val); setCurrentPage(1); };

  // Print
  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printContents = receiptRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=800,height=1000');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Payment Receipt (Non-Metered)</title>
            <style>
              body { font-family: 'Poppins', Arial, sans-serif; padding: 24px; color: #111; }
              table { width: 100%; border-collapse: collapse; }
              td { border: 1px solid #333; padding: 8px 14px; font-size: 13.5px; }
              h2, h3, p { text-align: center; margin: 2px 0; }
            </style>
          </head>
          <body>${printContents}</body>
        </html>
      `);
      win.document.close();
      win.print();
    }
  };

  // Download
  const handleDownload = () => {
    if (!receiptRef.current) return;
    const printContents = receiptRef.current.innerHTML;
    const blob = new Blob([`
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; max-width: 700px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; }
            td { border: 1px solid #333; padding: 8px 14px; font-size: 13.5px; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = viewReceipt ? `Receipt_NM_${viewReceipt.receiptNo.replace(/\//g, '_')}.html` : 'Receipt_NM.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Page range
  const getPageRange = (): number[] => {
    const range: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) range.push(i);
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
              Payment Receipts &mdash; Non-Metered Connection
            </h1>
            <p className="text-sm text-gray-500 font-['Poppins',sans-serif]">
              View and download auto-debit payment receipts for non-metered water connections
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">Financial Year</label>
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

          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">Bill Month</label>
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

          <div className="md:col-span-2">
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by receipt no, bill no, consumer name, RR no..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-[1.5px] border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
              />
            </div>
          </div>
        </div>

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
          <table className="w-full" style={{ minWidth: '1050px' }}>
            <thead className="bg-[#27548a]/10">
              <tr className="border-b border-[#170F49]">
                <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[50px]">#</th>
                <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">Receipt No</th>
                <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">Receipt Date</th>
                <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">Consumer Name</th>
                <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">Bill Month</th>
                <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">Connection Type</th>
                <th className="px-4 py-3 text-right text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">Amount</th>
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
                        {receipt.consumerName || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-center text-[14px] text-gray-700 font-['Poppins',sans-serif]">
                        {receipt.billMonth || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-['Poppins',sans-serif] bg-blue-50 text-blue-700 border border-blue-200">
                          {receipt.connectionType || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                        {receipt.amountDebited != null ? `\u20B9 ${receipt.amountDebited.toFixed(2)}` : 'N/A'}
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
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {getPageRange().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium font-['Poppins',sans-serif] transition-colors ${
                    page === currentPage ? 'bg-[#1f3a5f] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
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

      {/* ── Receipt View Modal ──────────────────────────────────────────── */}
      {viewReceipt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[720px] max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <h2 className="text-lg font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                Payment Receipt (Non-Metered)
              </h2>
              <button
                onClick={() => setViewReceipt(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Receipt Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div ref={receiptRef}>
                <div style={{ border: '0px solid transparent', padding: '0', background: '#fff' }}>

                  {/* ─── Receipt Header ─── */}
                  <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #ccc' }}>
                    <h2 style={{
                      fontSize: '18px', fontWeight: 700, color: '#111', margin: '0 0 4px',
                      fontFamily: "'Poppins', sans-serif",
                    }}>
                      Kundapura Town Municipal Council
                    </h2>
                    <p style={{
                      fontSize: '13.5px', fontWeight: 400, color: '#333', margin: '0 0 2px',
                      fontFamily: "'Poppins', sans-serif",
                    }}>
                      Jalanidhi &ndash; Drinking Water
                    </p>
                    <p style={{
                      fontSize: '14px', fontWeight: 600, color: '#111', margin: '0',
                      fontFamily: "'Poppins', sans-serif",
                    }}>
                      Payment Receipt (Auto-Debit)
                    </p>
                  </div>

                  {/* ─── Section 1: Receipt Info ─── */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
                    <tbody>
                      <tr>
                        <td style={labelStyle}>Receipt No</td>
                        <td style={valueStyle}>{viewReceipt.receiptNo || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={labelStyle}>Receipt Date &amp; Time</td>
                        <td style={valueStyle}>{viewReceipt.receiptDate || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={labelStyle}>Transaction Status</td>
                        <td style={{
                          ...valueStyle,
                          fontWeight: 600,
                          color: viewReceipt.transactionStatus === 'SUCCESS' ? '#111' : '#dc2626',
                        }}>
                          {viewReceipt.transactionStatus || 'N/A'}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* ─── Section 2: Bill / Consumer Info ─── */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
                    <tbody>
                      <tr>
                        <td style={labelStyle}>Bill No</td>
                        <td style={valueStyle}>{viewReceipt.billNo || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={labelStyle}>RR No</td>
                        <td style={valueStyle}>{viewReceipt.rrNo || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={labelStyle}>Bill Month</td>
                        <td style={valueStyle}>{viewReceipt.billMonth || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={labelStyle}>Consumer Name</td>
                        <td style={valueStyle}>{viewReceipt.consumerName || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={labelStyle}>Connection Type</td>
                        <td style={valueStyle}>{viewReceipt.connectionType || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* ─── Section 3: Payment Info ─── */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px' }}>
                    <tbody>
                      <tr>
                        <td style={labelStyle}>Amount Payable</td>
                        <td style={{ ...valueStyle, fontWeight: 600 }}>
                          {viewReceipt.amountPayable != null
                            ? `\u25A0 ${viewReceipt.amountPayable.toFixed(2)}`
                            : 'N/A'}
                        </td>
                      </tr>
                      <tr>
                        <td style={labelStyle}>Amount Debited</td>
                        <td style={{ ...valueStyle, fontWeight: 600 }}>
                          {viewReceipt.amountDebited != null
                            ? `\u25A0 ${viewReceipt.amountDebited.toFixed(2)}`
                            : 'N/A'}
                        </td>
                      </tr>
                      <tr>
                        <td style={labelStyle}>Payment Mode</td>
                        <td style={valueStyle}>{viewReceipt.paymentMode || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={labelStyle}>Gateway / System</td>
                        <td style={valueStyle}>{viewReceipt.gateway || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={labelStyle}>Reference No</td>
                        <td style={valueStyle}>{viewReceipt.referenceNo || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={labelStyle}>Credited To</td>
                        <td style={valueStyle}>{viewReceipt.creditedTo || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* ─── Footer Disclaimer ─── */}
                  <div style={{
                    borderTop: '1px solid #999',
                    paddingTop: '12px',
                    marginTop: '4px',
                  }}>
                    <p style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#111',
                      lineHeight: 1.65,
                      margin: 0,
                      fontFamily: "'Poppins', sans-serif",
                    }}>
                      This receipt confirms successful auto-debit of water charges from FBAS liability
                      and credit to the ULB account. The receipt is system-generated based on confirmation
                      received from FBAS.
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

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { FileSpreadsheet, Printer, Download, Search, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface NMDCBRow {
  id: number;
  connectionType: string;
  nonMetered: string;
  categoryType: string;
  tapRRNo: string;
  billDate: string;
  dueDate: string;
  slabFlatCharges: number;
  totalChargesToPay: number;
  month: string;
  // OB
  obPrincipal: number;
  obInterest: number;
  obTotal: number;
  // Additional charges
  additionalCharges: number;
  // Total Demand
  totalDemand: number;
  // Collection details
  colPrincipal: number;
  colInterest: number;
  colPenalty: number;
  colTotal: number;
  paid: 'YES' | 'NO';
  // Closing Balance
  remainingBalance: number;
  closingPrincipal: number;
  closingInterest: number;
  closingTotal: number;
}

// ── Mock Data ────────────────────────────────────────────────────────────────
function generateNMDCBData(): NMDCBRow[] {
  const rows: NMDCBRow[] = [];
  let id = 1;

  const months = [
    { month: 'Jun', billDate: '01-06-25', dueDate: '16-06-2025', obP: 90 },
    { month: 'July', billDate: '01-07-25', dueDate: '15-07-2025', obP: 0 },
    { month: 'Aug', billDate: '01-08-25', dueDate: '16-09-2025', obP: 90 },
    { month: 'Sep', billDate: '01-09-25', dueDate: '16-09-2025', obP: 0 },
    { month: 'Oct', billDate: '01-10-25', dueDate: '16-10-2025', obP: 0 },
    { month: 'Nov', billDate: '01-11-25', dueDate: '16-11-2025', obP: 0 },
    { month: 'Dec', billDate: '01-12-25', dueDate: '16-12-2025', obP: 0 },
    { month: 'Jan', billDate: '01-01-26', dueDate: '16-01-2026', obP: 0 },
    { month: 'Feb', billDate: '01-02-26', dueDate: '16-02-2026', obP: 0 },
  ];

  // Decreasing remaining balance from 880 by 80 each month (auto-debit)
  let remainingBal = 880;

  months.forEach((m) => {
    rows.push({
      id: id++,
      connectionType: 'NewTP',
      nonMetered: 'Non-Metered',
      categoryType: 'Domestic',
      tapRRNo: 'NALA_10012',
      billDate: m.billDate,
      dueDate: m.dueDate,
      slabFlatCharges: 80,
      totalChargesToPay: 80,
      month: m.month,
      obPrincipal: m.obP,
      obInterest: 0,
      obTotal: m.obP,
      additionalCharges: 0,
      totalDemand: 80,
      colPrincipal: 80,
      colInterest: 0,
      colPenalty: 0,
      colTotal: 80,
      paid: 'YES',
      remainingBalance: remainingBal,
      closingPrincipal: 0,
      closingInterest: 0,
      closingTotal: 0,
    });
    remainingBal -= 80;
  });

  return rows;
}

const ALL_NM_DCB_DATA = generateNMDCBData();

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(val: number | null): string {
  if (val === null || val === undefined) return '-';
  if (val === 0) return '0';
  return val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function PaidBadge({ status }: { status: 'YES' | 'NO' }) {
  return status === 'YES' ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 font-['Poppins',sans-serif]">
      YES
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 font-['Poppins',sans-serif]">
      NO
    </span>
  );
}

const PAGE_SIZE = 10;

// ── Helper: Group consecutive rows by connection type ───────────────────────
interface GroupedNMRow {
  row: NMDCBRow;
  isFirstInGroup: boolean;
  groupSize: number;
}

function groupConsecutiveRows(rows: NMDCBRow[]): GroupedNMRow[] {
  const grouped: GroupedNMRow[] = [];
  let i = 0;
  
  while (i < rows.length) {
    const currentType = rows[i].connectionType;
    let groupSize = 1;
    
    // Count consecutive rows with same connection type
    while (i + groupSize < rows.length && rows[i + groupSize].connectionType === currentType) {
      groupSize++;
    }
    
    // Mark first row in group
    for (let j = 0; j < groupSize; j++) {
      grouped.push({
        row: rows[i + j],
        isFirstInGroup: j === 0,
        groupSize: groupSize
      });
    }
    
    i += groupSize;
  }
  
  return grouped;
}

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════
export default function NonMeteredDCBStatement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Escape fullscreen
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
  }, [isFullscreen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isFullscreen]);

  // Filter
  const filtered = useMemo(() => {
    let data = ALL_NM_DCB_DATA;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter((r) =>
        r.tapRRNo.toLowerCase().includes(q) ||
        r.connectionType.toLowerCase().includes(q) ||
        r.categoryType.toLowerCase().includes(q) ||
        r.month.toLowerCase().includes(q) ||
        r.billDate.toLowerCase().includes(q)
      );
    }
    return data;
  }, [searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  // Group paginated data for row merging
  const groupedPaginatedData = useMemo(() => {
    return groupConsecutiveRows(paginatedData);
  }, [paginatedData]);

  const resetPage = () => setCurrentPage(1);

  // Summary
  const summary = useMemo(() => {
    let totalDemand = 0;
    let totalCollected = 0;
    let totalPenalty = 0;
    let lastRemaining = 0;
    filtered.forEach((r) => {
      totalDemand += r.totalDemand;
      if (r.paid === 'YES') totalCollected += r.colTotal;
      totalPenalty += r.colPenalty;
      lastRemaining = r.remainingBalance;
    });
    return { totalDemand, totalCollected, totalPenalty, lastRemaining };
  }, [filtered]);

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

  const handlePrint = () => window.print();

  const handleDownloadCSV = () => {
    const headers = [
      'Sl.No', 'Connection Type', 'Non-Metered', 'Category Type', 'Tap no/RR no',
      'Bill Date', 'Due Date', 'Slab-Flat Charges', 'Total Charges', 'Month',
      'OB Principal', 'OB Interest', 'OB Total', 'Addl. Charges', 'Total Demand',
      'Principal', 'Interest', 'Penalty', 'Total', 'Paid',
      'Remaining Balance', 'Closing Principal', 'Closing Interest', 'Closing Total',
    ];
    const csvRows = [headers.join(',')];
    filtered.forEach((r, i) => {
      csvRows.push([
        i + 1, r.connectionType, r.nonMetered, r.categoryType, r.tapRRNo,
        r.billDate, r.dueDate, r.slabFlatCharges, r.totalChargesToPay, r.month,
        r.obPrincipal, r.obInterest, r.obTotal, r.additionalCharges, r.totalDemand,
        r.colPrincipal, r.colInterest, r.colPenalty, r.colTotal, r.paid,
        r.remainingBalance, r.closingPrincipal, r.closingInterest, r.closingTotal,
      ].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DCB_Statement_NonMetered.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Header cell colors matching the reference image ────────────────────────
  // Row 1 group header styles
  const grpPink = 'bg-[#f2dede] text-[#4a2020]';       // Connection info
  const grpGreen = 'bg-[#4caf50] text-white';           // Total charges citizen has to pay
  const grpTeal = 'bg-[#80cbc4] text-[#004d40]';        // Month
  const grpBlueOB = 'bg-[#5c9bd1] text-white';          // OB
  const grpOrange = 'bg-[#f5a623] text-white';           // Additional charges
  const grpBlueDemand = 'bg-[#5c9bd1] text-white';      // Total Demand
  const grpCollection = 'bg-[#e8eaf6] text-[#283593]';  // Collection sub-headers
  const grpClosing = 'bg-[#4caf50] text-white';          // Closing balance

  // Shared cell style
  const thBase = "px-2.5 py-2 text-[10.5px] font-semibold uppercase tracking-wide font-['Poppins',sans-serif] whitespace-nowrap border border-gray-300";
  const thSub = "px-2.5 py-2 text-[10px] font-semibold font-['Poppins',sans-serif] whitespace-nowrap border border-gray-300 bg-gray-50 text-gray-600";
  const tdBase = "px-2.5 py-2.5 text-[12px] font-['Poppins',sans-serif] whitespace-nowrap border border-gray-200";

  // ── Render Table ───────────────────────────────────────────────────────────
  const renderTable = (data: NMDCBRow[], pageOffset: number) => (
    <table className="w-full border-collapse" style={{ minWidth: '2000px' }}>
      <thead>
        {/* Row 1: Group headers with reference colors */}
        <tr>
          {/* Connection Info — pink */}
          <th colSpan={7} className={`${thBase} ${grpPink} text-center`}>
            Connection Info
          </th>
          {/* Slab-flat charges — pink */}
          <th rowSpan={2} className={`${thBase} ${grpPink} text-center`}>
            Slab-flat<br />charges<br />in rupees
          </th>
          {/* Total charges citizen has to pay — green */}
          <th rowSpan={2} className={`${thBase} ${grpGreen} text-center`}>
            Total<br />charges<br />citizen has<br />to pay
          </th>
          {/* Month — teal */}
          <th rowSpan={2} className={`${thBase} ${grpTeal} text-center`}>
            Month
          </th>
          {/* OB — blue */}
          <th colSpan={3} className={`${thBase} ${grpBlueOB} text-center`}>
            OB
          </th>
          {/* Additional charges — orange */}
          <th rowSpan={2} className={`${thBase} ${grpOrange} text-center`}>
            Additional<br />charges due<br />to slab<br />change to be<br />paid
          </th>
          {/* Total Demand — blue */}
          <th rowSpan={2} className={`${thBase} ${grpBlueDemand} text-center`}>
            Total<br />Demand
          </th>
          {/* Collection — light blue */}
          <th colSpan={5} className={`${thBase} ${grpCollection} text-center`}>
            Collection Details
          </th>
          {/* Closing Balance — green */}
          <th colSpan={4} className={`${thBase} ${grpClosing} text-center`}>
            Closing Balance
          </th>
        </tr>

        {/* Row 2: Sub-headers */}
        <tr>
          {/* Connection Info sub-columns */}
          <th className={`${thSub} text-center w-[42px]`}>Sl.no</th>
          <th className={`${thSub} text-left`}>Connection<br />type</th>
          <th className={`${thSub} text-center`}>Non-Metered</th>
          <th className={`${thSub} text-left`}>Category<br />type</th>
          <th className={`${thSub} text-left`}>Tap no/<br />RR no</th>
          <th className={`${thSub} text-center`}>Bill Date</th>
          <th className={`${thSub} text-center`}>Due date</th>
          {/* (Slab-flat, Total charges, Month are rowSpan=2) */}
          {/* OB sub-columns */}
          <th className={`${thSub} text-right`}>Principle</th>
          <th className={`${thSub} text-right`}>Interest</th>
          <th className={`${thSub} text-right`}>Total</th>
          {/* (Additional charges, Total Demand are rowSpan=2) */}
          {/* Collection sub-columns */}
          <th className={`${thSub} text-right`}>Principal</th>
          <th className={`${thSub} text-right`}>Interest<br /><span className="text-[8px] font-normal italic">(to display<br />only)</span></th>
          <th className={`${thSub} text-right`}>Penalty<br /><span className="text-[8px] font-normal italic">(if any)</span></th>
          <th className={`${thSub} text-right`}>Total</th>
          <th className={`${thSub} text-center`}>Paid</th>
          {/* Closing Balance sub-columns */}
          <th className={`${thSub} text-right`}>Remaining<br />Balance</th>
          <th className={`${thSub} text-right`}>Principal</th>
          <th className={`${thSub} text-right`}>Interest<br /><span className="text-[8px] font-normal italic">(to display<br />only)</span></th>
          <th className={`${thSub} text-right`}>Total</th>
        </tr>
      </thead>

      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={25} className="px-6 py-12 text-center border border-gray-200">
              <FileSpreadsheet className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 font-['Poppins',sans-serif] font-medium text-sm">No records found</p>
              <p className="text-[12px] text-gray-400 font-['Poppins',sans-serif] mt-1">Try adjusting your search</p>
            </td>
          </tr>
        ) : (
          groupConsecutiveRows(data).map((groupedRow, idx) => {
            const row = groupedRow.row;
            const serial = pageOffset + idx + 1;
            const isEven = idx % 2 === 0;
            const rowBg = isEven ? 'bg-white' : 'bg-gray-50/60';

            return (
              <tr key={row.id} className={`${rowBg} hover:bg-blue-50/40 transition-colors`}>
                {/* Connection Info */}
                <td className={`${tdBase} text-center text-gray-500 font-medium`}>{serial}</td>
                {/* Only show Connection Type cell on first row of each group with rowspan */}
                {groupedRow.isFirstInGroup ? (
                  <td 
                    rowSpan={groupedRow.groupSize}
                    className={`${tdBase} text-left align-top`}
                  >
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-blue-50 text-blue-700 border border-blue-200 font-['Poppins',sans-serif]">
                      {row.connectionType || 'N/A'}
                    </span>
                  </td>
                ) : null}
                <td className={`${tdBase} text-center text-gray-700 font-medium`}>{row.nonMetered || 'N/A'}</td>
                <td className={`${tdBase} text-left text-gray-700`}>{row.categoryType || 'N/A'}</td>
                <td className={`${tdBase} text-left text-[#1f3a5f] font-medium`}>{row.tapRRNo || 'N/A'}</td>
                <td className={`${tdBase} text-center text-gray-600`}>{row.billDate || 'N/A'}</td>
                <td className={`${tdBase} text-center text-gray-600`}>{row.dueDate || 'N/A'}</td>
                {/* Slab-flat charges */}
                <td className={`${tdBase} text-right text-gray-700 font-medium`}>{fmt(row.slabFlatCharges)}</td>
                {/* Total charges — highlighted green bg */}
                <td className={`${tdBase} text-right font-bold text-white bg-[#4caf50]/80`}>{fmt(row.totalChargesToPay)}</td>
                {/* Month — highlighted teal bg */}
                <td className={`${tdBase} text-center font-medium text-[#004d40] bg-[#80cbc4]/30`}>{row.month || 'N/A'}</td>
                {/* OB */}
                <td className={`${tdBase} text-right text-gray-700`}>{fmt(row.obPrincipal)}</td>
                <td className={`${tdBase} text-right text-gray-600`}>{fmt(row.obInterest)}</td>
                <td className={`${tdBase} text-right font-medium text-gray-800`}>{fmt(row.obTotal)}</td>
                {/* Additional charges */}
                <td className={`${tdBase} text-right text-gray-600`}>{fmt(row.additionalCharges)}</td>
                {/* Total Demand */}
                <td className={`${tdBase} text-right font-bold text-[#1f3a5f]`}>{fmt(row.totalDemand)}</td>
                {/* Collection */}
                <td className={`${tdBase} text-right text-gray-700`}>{fmt(row.colPrincipal)}</td>
                <td className={`${tdBase} text-right text-gray-600`}>{fmt(row.colInterest)}</td>
                <td className={`${tdBase} text-right ${row.colPenalty > 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>{fmt(row.colPenalty)}</td>
                <td className={`${tdBase} text-right font-bold text-[#1f3a5f]`}>{fmt(row.colTotal)}</td>
                <td className={`${tdBase} text-center`}><PaidBadge status={row.paid} /></td>
                {/* Closing Balance */}
                <td className={`${tdBase} text-right font-bold ${row.remainingBalance > 0 ? 'text-emerald-700' : 'text-gray-600'}`}>{fmt(row.remainingBalance)}</td>
                <td className={`${tdBase} text-right text-gray-700`}>{fmt(row.closingPrincipal)}</td>
                <td className={`${tdBase} text-right text-gray-600`}>{fmt(row.closingInterest)}</td>
                <td className={`${tdBase} text-right font-medium text-gray-800`}>{fmt(row.closingTotal)}</td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6 print:bg-white print:px-2 print:py-2">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1f3a5f] flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
              DCB Statement &mdash; Non-Metered Connection
            </h1>
            <p className="text-sm text-gray-500 font-['Poppins',sans-serif]">
              Demand, Collection &amp; Balance report for non-metered water connections
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#1f3a5f] bg-white border-2 border-[#1f3a5f] rounded-lg hover:bg-[#f0f4f8] transition-colors font-['Poppins',sans-serif]"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#1f3a5f] rounded-lg hover:bg-[#2d4a6f] transition-colors font-['Poppins',sans-serif]"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          {isFullscreen ? (
            <button
              onClick={() => setIsFullscreen(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#1f3a5f] bg-white border-2 border-[#1f3a5f] rounded-lg hover:bg-[#f0f4f8] transition-colors font-['Poppins',sans-serif]"
            >
              <Minimize2 className="w-4 h-4" />
              Exit Fullscreen
            </button>
          ) : (
            <button
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#1f3a5f] bg-white border-2 border-[#1f3a5f] rounded-lg hover:bg-[#f0f4f8] transition-colors font-['Poppins',sans-serif]"
            >
              <Maximize2 className="w-4 h-4" />
              Fullscreen
            </button>
          )}
        </div>
      </div>

      {/* ── Print Title ─────────────────────────────────────────────── */}
      <div className="hidden print:block text-center mb-4">
        <h2 className="text-lg font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
          New tap connection person: with Non-Meter
        </h2>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 print:hidden">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 font-['Poppins',sans-serif] mb-1">Total Demand</p>
          <p className="text-xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
            {'\u20B9'} {fmt(summary.totalDemand)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 font-['Poppins',sans-serif] mb-1">Total Collected</p>
          <p className="text-xl font-bold text-emerald-600 font-['Poppins',sans-serif]">
            {'\u20B9'} {fmt(summary.totalCollected)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 font-['Poppins',sans-serif] mb-1">Remaining Balance</p>
          <p className="text-xl font-bold text-amber-600 font-['Poppins',sans-serif]">
            {'\u20B9'} {fmt(summary.lastRemaining)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 font-['Poppins',sans-serif] mb-1">Total Penalty</p>
          <p className="text-xl font-bold text-red-500 font-['Poppins',sans-serif]">
            {'\u20B9'} {fmt(summary.totalPenalty)}
          </p>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5 font-['Poppins',sans-serif]">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by RR no, month, bill date, connection type..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); resetPage(); }}
                className="w-full pl-10 pr-4 py-2.5 border-[1.5px] border-gray-300 rounded-md font-['Poppins',sans-serif] text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
              />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
              Showing <span className="font-semibold text-[#1f3a5f]">{paginatedData.length}</span> of{' '}
              <span className="font-semibold text-[#1f3a5f]">{filtered.length}</span> records
            </p>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); resetPage(); }}
                className="text-[12px] text-[#1f3a5f] hover:underline font-['Poppins',sans-serif] font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Statement sub-title ──────────────────────────────────────── */}
      <div className="bg-white rounded-t-lg border border-b-0 border-gray-200 px-5 py-3">
        <p className="text-[13px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
          New tap connection person: with Non-Meter
        </p>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div ref={tableRef} className="bg-white border border-gray-200 shadow-sm rounded-b-lg overflow-hidden">
        <div className="overflow-x-auto">
          {renderTable(paginatedData, (currentPage - 1) * PAGE_SIZE)}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between print:hidden">
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
              Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {getPageRange().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-medium font-['Poppins',sans-serif] transition-colors ${
                    page === currentPage
                      ? 'bg-[#1f3a5f] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer note ──────────────────────────────────────────── */}
      <div className="mt-4 px-1">
        <p className="text-[11px] text-gray-400 font-['Poppins',sans-serif] italic">
          * Non-metered connections are charged a flat slab rate per month. The "Remaining Balance" column indicates the
          remaining advance/credit balance from FBAS auto-debit. Penalty charges (if any) are applied for overdue payments.
          Interest is displayed for reference only.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          ══ FULLSCREEN OVERLAY ══
          ══════════════════════════════════════════════════════════════ */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
          {/* Top Bar */}
          <div className="shrink-0 bg-[#1f3a5f] px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-white" />
              <h2 className="text-base font-bold text-white font-['Poppins',sans-serif]">
                DCB Statement &mdash; Non-Metered
              </h2>
              <span className="text-[12px] text-white/60 font-['Poppins',sans-serif] ml-1">
                &mdash; {filtered.length} records
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrint} className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white" title="Print">
                <Printer className="w-4 h-4" />
              </button>
              <button onClick={handleDownloadCSV} className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white" title="Export CSV">
                <Download className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-white/20 mx-1" />
              <button
                onClick={() => setIsFullscreen(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors font-['Poppins',sans-serif]"
                title="Exit Fullscreen (Esc)"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                Exit
              </button>
            </div>
          </div>

          {/* Summary Strip */}
          <div className="shrink-0 bg-gray-50 border-b border-gray-200 px-5 py-2 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 font-['Poppins',sans-serif]">Demand:</span>
              <span className="text-[13px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">{'\u20B9'} {fmt(summary.totalDemand)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 font-['Poppins',sans-serif]">Collected:</span>
              <span className="text-[13px] font-bold text-emerald-600 font-['Poppins',sans-serif]">{'\u20B9'} {fmt(summary.totalCollected)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 font-['Poppins',sans-serif]">Remaining:</span>
              <span className="text-[13px] font-bold text-amber-600 font-['Poppins',sans-serif]">{'\u20B9'} {fmt(summary.lastRemaining)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 font-['Poppins',sans-serif]">Penalty:</span>
              <span className="text-[13px] font-bold text-red-500 font-['Poppins',sans-serif]">{'\u20B9'} {fmt(summary.totalPenalty)}</span>
            </div>
            <div className="ml-auto text-[11px] text-gray-400 font-['Poppins',sans-serif]">
              Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-[10px] font-mono font-semibold text-gray-600">Esc</kbd> to exit fullscreen
            </div>
          </div>

          {/* Fullscreen Table */}
          <div className="flex-1 overflow-auto">
            {renderTable(filtered, 0)}
          </div>
        </div>
      )}
    </div>
  );
}

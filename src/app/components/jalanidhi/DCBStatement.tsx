import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { FileSpreadsheet, Printer, Download, Search, ChevronLeft, ChevronRight, Info, Maximize2, Minimize2, X } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface DCBRow {
  id: number;
  connectionType: string;
  meterNo: string;
  tapRRNo: string;
  billDate: string;
  dueDate: string;
  // Meter Reading
  prevReading: number | null;
  currentReading: number | null;
  consumption: number | null;
  slabRateAmount: number | null;
  meterConnectionType: string;
  // Opening Balance
  openingPrincipal: number;
  openingInterest: number;
  openingTotal: number;
  // Current Month + Opening Balance
  additionalCharges: number;
  demandPrincipal: number;
  demandInterest: number;
  demandPenalty: number;
  demandTotal: number;
  paidStatus: 'YES' | 'NO';
  // Closing Balance
  extraAmountPaid: number;
  closingPrincipal: number;
  closingInterest: number;
  closingTotal: number;
}

// ── Mock Data ────────────────────────────────────────────────────────────────
function generateDCBData(): DCBRow[] {
  const rows: DCBRow[] = [];
  let id = 1;

  // ── New Tap Connection Rows ──
  rows.push({
    id: id++,
    connectionType: 'New Tap Connection',
    meterNo: 'MM-347604',
    tapRRNo: 'MDY_10012',
    billDate: '01-04-25',
    dueDate: '16-04-25',
    prevReading: 0,
    currentReading: 3,
    consumption: 3,
    slabRateAmount: 90.00,
    meterConnectionType: 'Domestic',
    openingPrincipal: 0.00,
    openingInterest: 0.00,
    openingTotal: 0.00,
    additionalCharges: 0.00,
    demandPrincipal: 90.00,
    demandInterest: 0.00,
    demandPenalty: 0.00,
    demandTotal: 90.00,
    paidStatus: 'NO',
    extraAmountPaid: 0.00,
    closingPrincipal: 90.00,
    closingInterest: 0.00,
    closingTotal: 90.00,
  });

  rows.push({
    id: id++,
    connectionType: 'New Tap Connection',
    meterNo: 'MM-347604',
    tapRRNo: 'MDY_10012',
    billDate: '01-05-25',
    dueDate: '16-05-25',
    prevReading: 3,
    currentReading: 15,
    consumption: 12,
    slabRateAmount: 400.00,
    meterConnectionType: 'Domestic',
    openingPrincipal: 90.00,
    openingInterest: 0.00,
    openingTotal: 90.00,
    additionalCharges: 0.00,
    demandPrincipal: 490.00,
    demandInterest: 0.00,
    demandPenalty: 0.00,
    demandTotal: 490.95,
    paidStatus: 'YES',
    extraAmountPaid: 3000.00,
    closingPrincipal: 2509.10,
    closingInterest: 0.00,
    closingTotal: 2509.10,
  });

  rows.push({
    id: id++,
    connectionType: 'New Tap Connection',
    meterNo: 'MM-347604',
    tapRRNo: 'MDY_10012',
    billDate: '01-06-25',
    dueDate: '16-06-25',
    prevReading: 15,
    currentReading: 26,
    consumption: 11,
    slabRateAmount: 360.00,
    meterConnectionType: 'Domestic',
    openingPrincipal: -2500.10,
    openingInterest: 0.00,
    openingTotal: -2500.00,
    additionalCharges: 6000.00,
    demandPrincipal: 3859.90,
    demandInterest: 0.00,
    demandPenalty: 0.00,
    demandTotal: 3859.90,
    paidStatus: 'NO',
    extraAmountPaid: 0.00,
    closingPrincipal: 3859.90,
    closingInterest: 0.00,
    closingTotal: 3859.90,
  });

  rows.push({
    id: id++,
    connectionType: 'New Tap Connection',
    meterNo: 'NA',
    tapRRNo: 'MDY_10012',
    billDate: '01-07-25',
    dueDate: '16-07-25',
    prevReading: 26,
    currentReading: 0,
    consumption: 8.5,
    slabRateAmount: 266.00,
    meterConnectionType: 'Domestic',
    openingPrincipal: 3859.31,
    openingInterest: 0.00,
    openingTotal: 3889.41,
    additionalCharges: 0.00,
    demandPrincipal: 4117.70,
    demandInterest: 38.51,
    demandPenalty: 0.00,
    demandTotal: 4156.21,
    paidStatus: 'YES',
    extraAmountPaid: 0.00,
    closingPrincipal: 0.00,
    closingInterest: 0.00,
    closingTotal: 0.00,
  });

  rows.push({
    id: id++,
    connectionType: 'New Tap Connection',
    meterNo: 'NA',
    tapRRNo: 'MDY_10012',
    billDate: '01-08-25',
    dueDate: '16-08-25',
    prevReading: 0,
    currentReading: 0,
    consumption: 8.5,
    slabRateAmount: 266.00,
    meterConnectionType: 'Domestic',
    openingPrincipal: 0.00,
    openingInterest: 0.00,
    openingTotal: 0.00,
    additionalCharges: 0.00,
    demandPrincipal: 266.00,
    demandInterest: 0.00,
    demandPenalty: 500.00,
    demandTotal: 766.00,
    paidStatus: 'NO',
    extraAmountPaid: 0.00,
    closingPrincipal: 766.00,
    closingInterest: 0.00,
    closingTotal: 766.00,
  });

  rows.push({
    id: id++,
    connectionType: 'New Tap Connection',
    meterNo: 'MM-347607',
    tapRRNo: 'MDY_10012',
    billDate: '01-09-25',
    dueDate: '16-09-25',
    prevReading: 0,
    currentReading: 5,
    consumption: 5,
    slabRateAmount: 140.00,
    meterConnectionType: 'Domestic',
    openingPrincipal: 766.00,
    openingInterest: 7.67,
    openingTotal: 774.47,
    additionalCharges: 0.00,
    demandPrincipal: 906.87,
    demandInterest: 7.67,
    demandPenalty: 110.00,
    demandTotal: 1024.47,
    paidStatus: 'YES',
    extraAmountPaid: 0.00,
    closingPrincipal: 0.00,
    closingInterest: 0.00,
    closingTotal: 0.00,
  });

  rows.push({
    id: id++,
    connectionType: 'New Tap Connection',
    meterNo: 'MM-347607',
    tapRRNo: 'MDY_10012',
    billDate: '01-10-25',
    dueDate: '16-10-25',
    prevReading: 5,
    currentReading: 1,
    consumption: 1,
    slabRateAmount: 30.00,
    meterConnectionType: 'Domestic',
    openingPrincipal: 0.00,
    openingInterest: 0.00,
    openingTotal: 0.00,
    additionalCharges: 0.00,
    demandPrincipal: 30.00,
    demandInterest: 0.00,
    demandPenalty: 0.00,
    demandTotal: 30.00,
    paidStatus: 'YES',
    extraAmountPaid: 0.00,
    closingPrincipal: 0.00,
    closingInterest: 0.00,
    closingTotal: 0.00,
  });

  // ── Connection Transfer Rows ──
  rows.push({
    id: id++,
    connectionType: 'Connection Transfer',
    meterNo: 'MM-347607',
    tapRRNo: 'MDY_10012',
    billDate: '03-11-25',
    dueDate: '18-11-25',
    prevReading: 6,
    currentReading: 0,
    consumption: 0,
    slabRateAmount: 0.00,
    meterConnectionType: 'Domestic',
    openingPrincipal: 0.00,
    openingInterest: 0.00,
    openingTotal: 0.00,
    additionalCharges: 200.00,
    demandPrincipal: 0.00,
    demandInterest: 0.00,
    demandPenalty: 0.00,
    demandTotal: 200.00,
    paidStatus: 'NO',
    extraAmountPaid: 0.00,
    closingPrincipal: 0.00,
    closingInterest: 0.00,
    closingTotal: 0.00,
  });

  // ── Disconnection Rows ──
  rows.push({
    id: id++,
    connectionType: 'Disconnection',
    meterNo: 'MM-347607',
    tapRRNo: 'MDY_10012',
    billDate: '03-12-25',
    dueDate: '17-12-25',
    prevReading: 0,
    currentReading: 5,
    consumption: 5,
    slabRateAmount: 30.00,
    meterConnectionType: 'Domestic',
    openingPrincipal: 0.00,
    openingInterest: 0.00,
    openingTotal: 0.00,
    additionalCharges: 0.00,
    demandPrincipal: 0.00,
    demandInterest: 0.00,
    demandPenalty: 250.00,
    demandTotal: 250.00,
    paidStatus: 'NO',
    extraAmountPaid: 0.00,
    closingPrincipal: 0.00,
    closingInterest: 0.00,
    closingTotal: 0.00,
  });

  rows.push({
    id: id++,
    connectionType: 'Disconnection',
    meterNo: 'MDY',
    tapRRNo: 'MDY_10012',
    billDate: '01-01-26',
    dueDate: '16-01-26',
    prevReading: 5,
    currentReading: 1,
    consumption: 1,
    slabRateAmount: 30.00,
    meterConnectionType: 'Domestic',
    openingPrincipal: 0.00,
    openingInterest: 0.00,
    openingTotal: 0.00,
    additionalCharges: 0.00,
    demandPrincipal: 0.00,
    demandInterest: 0.00,
    demandPenalty: 0.00,
    demandTotal: 0.00,
    paidStatus: 'NO',
    extraAmountPaid: 0.00,
    closingPrincipal: 0.00,
    closingInterest: 0.00,
    closingTotal: 0.00,
  });

  // ── Reconnection Row ──
  rows.push({
    id: id++,
    connectionType: 'Reconnection',
    meterNo: 'MM-347607',
    tapRRNo: 'MDY_10012',
    billDate: '04-02-26',
    dueDate: '19-02-26',
    prevReading: 9,
    currentReading: 5,
    consumption: 6.5,
    slabRateAmount: 30.00,
    meterConnectionType: 'Domestic',
    openingPrincipal: 0.00,
    openingInterest: 0.00,
    openingTotal: 0.00,
    additionalCharges: 0.00,
    demandPrincipal: 0.00,
    demandInterest: 0.00,
    demandPenalty: 0.00,
    demandTotal: 0.00,
    paidStatus: 'NO',
    extraAmountPaid: 0.00,
    closingPrincipal: 0.00,
    closingInterest: 0.00,
    closingTotal: 0.00,
  });

  rows.push({
    id: id++,
    connectionType: 'Reconnection',
    meterNo: 'MM-347608',
    tapRRNo: 'MDY_10013',
    billDate: '01-03-26',
    dueDate: '16-03-26',
    prevReading: 1,
    currentReading: 15,
    consumption: 14,
    slabRateAmount: 450.00,
    meterConnectionType: 'Domestic',
    openingPrincipal: 0.00,
    openingInterest: 0.00,
    openingTotal: 0.00,
    additionalCharges: 0.00,
    demandPrincipal: 450.00,
    demandInterest: 0.00,
    demandPenalty: 0.00,
    demandTotal: 450.00,
    paidStatus: 'NO',
    extraAmountPaid: 0.00,
    closingPrincipal: 450.00,
    closingInterest: 0.00,
    closingTotal: 450.00,
  });

  return rows;
}

const ALL_DCB_DATA = generateDCBData();

// ── Helpers ──────────────────────────────────────────────────────────────────
const CONNECTION_TYPE_OPTIONS = [
  { value: '__none__', label: 'All Types' },
  { value: 'New Tap Connection', label: 'New Tap Connection' },
  { value: 'Connection Transfer', label: 'Connection Transfer' },
  { value: 'Disconnection', label: 'Disconnection' },
  { value: 'Reconnection', label: 'Reconnection' },
];

// Extract unique years from bill dates for year filter
function getUniqueYears(data: DCBRow[]): string[] {
  const years = new Set<string>();
  data.forEach((row) => {
    // Parse date in DD-MM-YY format
    const parts = row.billDate.split('-');
    if (parts.length === 3) {
      const year = parts[2];
      // Convert 2-digit year to 4-digit (25 -> 2025, 26 -> 2026)
      const fullYear = year.length === 2 ? `20${year}` : year;
      years.add(fullYear);
    }
  });
  return Array.from(years).sort();
}

const AVAILABLE_YEARS = getUniqueYears(ALL_DCB_DATA);

function fmt(val: number | null): string {
  if (val === null || val === undefined) return '-';
  if (val === 0) return '0.00';
  return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtReading(val: number | null): string {
  if (val === null || val === undefined) return '-';
  return String(val);
}

// ── Connection Type Badge ────────────────────────────────────────────────────
function ConnectionBadge({ type }: { type: string }) {
  let bg = 'bg-gray-100 text-gray-700 border-gray-200';
  if (type === 'New Tap Connection') bg = 'bg-blue-50 text-blue-700 border-blue-200';
  else if (type === 'Connection Transfer') bg = 'bg-purple-50 text-purple-700 border-purple-200';
  else if (type === 'Disconnection') bg = 'bg-red-50 text-red-700 border-red-200';
  else if (type === 'Reconnection') bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap font-['Poppins',sans-serif] ${bg}`}>
      {type}
    </span>
  );
}

function PaidBadge({ status }: { status: 'YES' | 'NO' }) {
  return status === 'YES' ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 font-['Poppins',sans-serif]">
      Paid
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 font-['Poppins',sans-serif]">
      Unpaid
    </span>
  );
}

// ── Pagination ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

// ── Helper: Group consecutive rows by connection type ───────────────────────
interface GroupedRow {
  row: DCBRow;
  isFirstInGroup: boolean;
  groupSize: number;
}

function groupConsecutiveRows(rows: DCBRow[]): GroupedRow[] {
  const grouped: GroupedRow[] = [];
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
export default function DCBStatement() {
  const [selectedType, setSelectedType] = useState('__none__');
  const [selectedYear, setSelectedYear] = useState('__none__');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showLegend, setShowLegend] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Close fullscreen on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when fullscreen
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
    let data = ALL_DCB_DATA;

    // Connection type
    if (selectedType && selectedType !== '__none__') {
      data = data.filter((r) => r.connectionType === selectedType);
    }

    // Year
    if (selectedYear && selectedYear !== '__none__') {
      data = data.filter((r) => {
        const parts = r.billDate.split('-');
        if (parts.length === 3) {
          const year = parts[2];
          // Convert 2-digit year to 4-digit (25 -> 2025, 26 -> 2026)
          const fullYear = year.length === 2 ? `20${year}` : year;
          return fullYear === selectedYear;
        }
        return false;
      });
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter((r) =>
        r.meterNo.toLowerCase().includes(q) ||
        r.tapRRNo.toLowerCase().includes(q) ||
        r.connectionType.toLowerCase().includes(q) ||
        r.billDate.toLowerCase().includes(q)
      );
    }

    return data;
  }, [selectedType, selectedYear, searchQuery]);

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

  // Summary calculations
  const summary = useMemo(() => {
    let totalDemand = 0;
    let totalPaid = 0;
    let totalClosing = 0;
    let totalPenalty = 0;
    filtered.forEach((r) => {
      totalDemand += r.demandTotal;
      if (r.paidStatus === 'YES') totalPaid += r.demandTotal;
      totalClosing += r.closingTotal;
      totalPenalty += r.demandPenalty;
    });
    return { totalDemand, totalPaid, totalClosing, totalPenalty };
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

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Download CSV
  const handleDownloadCSV = () => {
    const headers = [
      'Sl.No', 'Connection Type', 'Meter No', 'Tap/RR No', 'Bill Date', 'Due Date',
      'Prev Reading', 'Current Reading', 'Consumption (KL)', 'Slab Amount', 'Type',
      'Opening Principal', 'Opening Interest', 'Opening Total',
      'Addl. Charges', 'Demand Principal', 'Demand Interest', 'Demand Penalty', 'Demand Total', 'Paid',
      'Extra Amt', 'Closing Principal', 'Closing Interest', 'Closing Total',
    ];
    const csvRows = [headers.join(',')];
    filtered.forEach((r, i) => {
      csvRows.push([
        i + 1, r.connectionType, r.meterNo, r.tapRRNo, r.billDate, r.dueDate,
        r.prevReading !== null ? r.prevReading : '', r.currentReading !== null ? r.currentReading : '',
        r.consumption !== null ? r.consumption : '', r.slabRateAmount !== null ? r.slabRateAmount : '', r.meterConnectionType,
        r.openingPrincipal, r.openingInterest, r.openingTotal,
        r.additionalCharges, r.demandPrincipal, r.demandInterest, r.demandPenalty, r.demandTotal, r.paidStatus,
        r.extraAmountPaid, r.closingPrincipal, r.closingInterest, r.closingTotal,
      ].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DCB_Statement.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Shared header cell style
  const thBase = "px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide font-['Poppins',sans-serif] whitespace-nowrap";
  const tdBase = "px-3 py-3 text-[12px] font-['Poppins',sans-serif] whitespace-nowrap";

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
              DCB Statement
            </h1>
            <p className="text-sm text-gray-500 font-['Poppins',sans-serif]">
              Demand, Collection & Balance report for your water connection
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

      {/* ── Legend Panel ─────────────────────────────────────────────── */}
      {showLegend && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-5 print:hidden">
          <h3 className="text-sm font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Column Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 text-[12px] font-['Poppins',sans-serif] text-gray-600">
            <div><span className="font-semibold text-gray-800">Prev Reading</span> — Previous meter reading in KL</div>
            <div><span className="font-semibold text-gray-800">Curr Reading</span> — Current meter reading in KL</div>
            <div><span className="font-semibold text-gray-800">Consumption</span> — Water consumed (Current − Previous)</div>
            <div><span className="font-semibold text-gray-800">Slab Amt</span> — Charge calculated based on slab rate</div>
            <div><span className="font-semibold text-gray-800">Opening Bal.</span> — Carried-forward balance from prior month</div>
            <div><span className="font-semibold text-gray-800">Addl. Charges</span> — Extra charges due to slab change</div>
            <div><span className="font-semibold text-gray-800">Demand</span> — Total amount due for the month</div>
            <div><span className="font-semibold text-gray-800">Penalty</span> — Late payment penalty, if applicable</div>
            <div><span className="font-semibold text-gray-800">Closing Bal.</span> — Remaining balance after payment</div>
          </div>
        </div>
      )}

      {/* ── Title for print ──────────────────────────────────────────── */}
      <div className="hidden print:block text-center mb-4">
        <h2 className="text-lg font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
          DCB Statement — New Tap Connection Person: with Meter Connection
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
            {'\u20B9'} {fmt(summary.totalPaid)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 font-['Poppins',sans-serif] mb-1">Outstanding</p>
          <p className="text-xl font-bold text-amber-600 font-['Poppins',sans-serif]">
            {'\u20B9'} {fmt(summary.totalClosing)}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Connection Type */}
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5 font-['Poppins',sans-serif]">Connection Type</label>
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); resetPage(); }}
              className="w-full px-3 py-2.5 border-[1.5px] border-gray-300 rounded-md font-['Poppins',sans-serif] text-[13px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
            >
              {CONNECTION_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          {/* Year */}
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5 font-['Poppins',sans-serif]">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); resetPage(); }}
              className="w-full px-3 py-2.5 border-[1.5px] border-gray-300 rounded-md font-['Poppins',sans-serif] text-[13px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
            >
              <option value="__none__">All Years</option>
              {AVAILABLE_YEARS.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5 font-['Poppins',sans-serif]">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by meter no, RR no, bill date..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); resetPage(); }}
                className="w-full pl-10 pr-4 py-2.5 border-[1.5px] border-gray-300 rounded-md font-['Poppins',sans-serif] text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
              />
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
            Showing <span className="font-semibold text-[#1f3a5f]">{paginatedData.length}</span> of{' '}
            <span className="font-semibold text-[#1f3a5f]">{filtered.length}</span> records
          </p>
          {(selectedType !== '__none__' || selectedYear !== '__none__' || searchQuery) && (
            <button
              onClick={() => { setSelectedType('__none__'); setSelectedYear('__none__'); setSearchQuery(''); resetPage(); }}
              className="text-[12px] text-[#1f3a5f] hover:underline font-['Poppins',sans-serif] font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* ── Statement sub-title ──────────────────────────────────────── */}
      <div className="bg-white rounded-t-lg border border-b-0 border-gray-200 px-5 py-3">
        <p className="text-[13px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
          New Tap Connection Person: with Meter Connection
        </p>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div ref={tableRef} className="bg-white border border-gray-200 shadow-sm rounded-b-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: '1600px' }}>
            {/* ── Group Headers (row 1) ──────────────────────────────── */}
            <thead>
              <tr className="bg-[#1f3a5f]">
                {/* Connection Details - span 6 */}
                <th colSpan={6} className={`${thBase} text-white text-center border-r border-[#2d4a6f]`}>
                  Connection Details
                </th>
                {/* Meter Reading - span 5 */}
                <th colSpan={5} className={`${thBase} text-white text-center border-r border-[#2d4a6f]`}>
                  Meter Reading &amp; Slab Calculation
                </th>
                {/* Opening Balance - span 3 */}
                <th colSpan={3} className={`${thBase} text-white text-center border-r border-[#2d4a6f]`}>
                  Opening Balance
                </th>
                {/* Current Month + Opening - span 6 */}
                <th colSpan={6} className={`${thBase} text-white text-center border-r border-[#2d4a6f]`}>
                  Current Month + Opening Balance
                </th>
                {/* Closing Balance - span 4 */}
                <th colSpan={4} className={`${thBase} text-white text-center`}>
                  Closing Balance
                </th>
              </tr>

              {/* ── Sub Headers (row 2) ──────────────────────────────── */}
              <tr className="bg-gray-50 border-b border-gray-200">
                {/* Connection Details */}
                <th className={`${thBase} text-gray-600 text-center border-r border-gray-200 w-[44px]`}>#</th>
                <th className={`${thBase} text-gray-600 text-left border-r border-gray-200`}>Type</th>
                <th className={`${thBase} text-gray-600 text-left border-r border-gray-200`}>Meter No</th>
                <th className={`${thBase} text-gray-600 text-left border-r border-gray-200`}>Tap / RR No</th>
                <th className={`${thBase} text-gray-600 text-center border-r border-gray-200`}>Bill Date</th>
                <th className={`${thBase} text-gray-600 text-center border-r border-gray-200`}>Due Date</th>
                {/* Meter Reading */}
                <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Prev<br/>Reading</th>
                <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Curr<br/>Reading</th>
                <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Consumption<br/>(KL)</th>
                <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Slab Amt<br/>({'\u20B9'})</th>
                <th className={`${thBase} text-gray-600 text-center border-r border-gray-200`}>Conn<br/>Type</th>
                {/* Opening Balance */}
                <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Principal<br/>({'\u20B9'})</th>
                <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Interest<br/>({'\u20B9'})</th>
                <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Total<br/>({'\u20B9'})</th>
                {/* Current Month + Opening */}
                <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Addl.<br/>Charges</th>
                <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Principal<br/>({'\u20B9'})</th>
                <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Interest<br/>({'\u20B9'})</th>
                <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Penalty<br/>({'\u20B9'})</th>
                <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Total<br/>({'\u20B9'})</th>
                <th className={`${thBase} text-gray-600 text-center border-r border-gray-200`}>Status</th>
                {/* Closing Balance */}
                <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Extra Amt<br/>Paid ({'\u20B9'})</th>
                <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Principal<br/>({'\u20B9'})</th>
                <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Interest<br/>({'\u20B9'})</th>
                <th className={`${thBase} text-gray-600 text-right`}>Total<br/>({'\u20B9'})</th>
              </tr>
            </thead>

            {/* ── Body ──────────────────────────────────────────────── */}
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={24} className="px-6 py-12 text-center">
                    <FileSpreadsheet className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 font-['Poppins',sans-serif] font-medium text-sm">No records found</p>
                    <p className="text-[12px] text-gray-400 font-['Poppins',sans-serif] mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                groupedPaginatedData.map((groupedRow, idx) => {
                  const row = groupedRow.row;
                  const serial = (currentPage - 1) * PAGE_SIZE + idx + 1;
                  const isEven = idx % 2 === 0;
                  const rowBg = isEven ? 'bg-white' : 'bg-gray-50/60';
                  const negativeClass = 'text-red-600';

                  return (
                    <tr key={row.id} className={`${rowBg} hover:bg-blue-50/40 transition-colors border-b border-gray-100`}>
                      {/* Connection Details */}
                      <td className={`${tdBase} text-center text-gray-500 font-medium border-r border-gray-100`}>{serial}</td>
                      {/* Only show Type cell on first row of each group with rowspan */}
                      {groupedRow.isFirstInGroup ? (
                        <td 
                          rowSpan={groupedRow.groupSize}
                          className={`${tdBase} border-r border-gray-100 align-middle`}
                        >
                          <ConnectionBadge type={row.connectionType} />
                        </td>
                      ) : null}
                      <td className={`${tdBase} text-gray-700 font-medium border-r border-gray-100`}>{row.meterNo || 'N/A'}</td>
                      <td className={`${tdBase} text-gray-700 border-r border-gray-100`}>{row.tapRRNo || 'N/A'}</td>
                      <td className={`${tdBase} text-center text-gray-600 border-r border-gray-100`}>{row.billDate || 'N/A'}</td>
                      <td className={`${tdBase} text-center text-gray-600 border-r border-gray-100`}>{row.dueDate || 'N/A'}</td>
                      {/* Meter Reading */}
                      <td className={`${tdBase} text-right text-gray-600 border-r border-gray-100`}>{fmtReading(row.prevReading)}</td>
                      <td className={`${tdBase} text-right text-gray-600 border-r border-gray-100`}>{fmtReading(row.currentReading)}</td>
                      <td className={`${tdBase} text-right font-medium text-gray-800 border-r border-gray-100`}>{fmtReading(row.consumption)}</td>
                      <td className={`${tdBase} text-right text-gray-700 border-r border-gray-100`}>{fmt(row.slabRateAmount)}</td>
                      <td className={`${tdBase} text-center text-gray-500 text-[11px] border-r border-gray-100`}>{row.meterConnectionType || 'N/A'}</td>
                      {/* Opening Balance */}
                      <td className={`${tdBase} text-right border-r border-gray-100 ${row.openingPrincipal < 0 ? negativeClass : 'text-gray-700'}`}>{fmt(row.openingPrincipal)}</td>
                      <td className={`${tdBase} text-right text-gray-600 border-r border-gray-100`}>{fmt(row.openingInterest)}</td>
                      <td className={`${tdBase} text-right font-medium border-r border-gray-100 ${row.openingTotal < 0 ? negativeClass : 'text-gray-800'}`}>{fmt(row.openingTotal)}</td>
                      {/* Current Month + Opening */}
                      <td className={`${tdBase} text-right border-r border-gray-100 ${row.additionalCharges > 0 ? 'text-[#1f3a5f] font-semibold' : 'text-gray-600'}`}>{fmt(row.additionalCharges)}</td>
                      <td className={`${tdBase} text-right text-gray-700 border-r border-gray-100`}>{fmt(row.demandPrincipal)}</td>
                      <td className={`${tdBase} text-right text-gray-600 border-r border-gray-100`}>{fmt(row.demandInterest)}</td>
                      <td className={`${tdBase} text-right border-r border-gray-100 ${row.demandPenalty > 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>{fmt(row.demandPenalty)}</td>
                      <td className={`${tdBase} text-right font-bold text-[#1f3a5f] border-r border-gray-100`}>{fmt(row.demandTotal)}</td>
                      <td className={`${tdBase} text-center border-r border-gray-100`}><PaidBadge status={row.paidStatus} /></td>
                      {/* Closing Balance */}
                      <td className={`${tdBase} text-right border-r border-gray-100 ${row.extraAmountPaid > 0 ? 'text-emerald-600 font-semibold' : 'text-gray-600'}`}>{fmt(row.extraAmountPaid)}</td>
                      <td className={`${tdBase} text-right text-gray-700 border-r border-gray-100`}>{fmt(row.closingPrincipal)}</td>
                      <td className={`${tdBase} text-right text-gray-600 border-r border-gray-100`}>{fmt(row.closingInterest)}</td>
                      <td className={`${tdBase} text-right font-bold ${row.closingTotal > 0 ? 'text-amber-600' : 'text-gray-700'}`}>{fmt(row.closingTotal)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────────────── */}
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
          * Negative opening principal indicates advance/overpayment carried forward.
          Penalty charges are applied for payments received after the due date.
          Interest is calculated on the outstanding balance and displayed for reference only.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          ══ FULLSCREEN OVERLAY ══
          ══════════════════════════════════════════════════════════════ */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
          {/* ── Fullscreen Top Bar ──────────────────────────────── */}
          <div className="shrink-0 bg-[#1f3a5f] px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-white" />
              <h2 className="text-base font-bold text-white font-['Poppins',sans-serif]">
                DCB Statement
              </h2>
              <span className="text-[12px] text-white/60 font-['Poppins',sans-serif] ml-1">
                &mdash; {filtered.length} records
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); resetPage(); }}
                className="px-2 py-1.5 text-[12px] rounded-md border border-white/20 bg-white/10 text-white font-['Poppins',sans-serif] focus:outline-none focus:ring-1 focus:ring-white/40"
              >
                {CONNECTION_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="text-gray-900">{o.label}</option>
                ))}
              </select>
              <div className="w-px h-6 bg-white/20 mx-1" />
              <button
                onClick={handlePrint}
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white"
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownloadCSV}
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white"
                title="Export CSV"
              >
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

          {/* ── Fullscreen Summary Strip ────────────────────────── */}
          <div className="shrink-0 bg-gray-50 border-b border-gray-200 px-5 py-2 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 font-['Poppins',sans-serif]">Demand:</span>
              <span className="text-[13px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">{'\u20B9'} {fmt(summary.totalDemand)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 font-['Poppins',sans-serif]">Collected:</span>
              <span className="text-[13px] font-bold text-emerald-600 font-['Poppins',sans-serif]">{'\u20B9'} {fmt(summary.totalPaid)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 font-['Poppins',sans-serif]">Outstanding:</span>
              <span className="text-[13px] font-bold text-amber-600 font-['Poppins',sans-serif]">{'\u20B9'} {fmt(summary.totalClosing)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 font-['Poppins',sans-serif]">Penalty:</span>
              <span className="text-[13px] font-bold text-red-500 font-['Poppins',sans-serif]">{'\u20B9'} {fmt(summary.totalPenalty)}</span>
            </div>
            <div className="ml-auto text-[11px] text-gray-400 font-['Poppins',sans-serif]">
              Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-[10px] font-mono font-semibold text-gray-600">Esc</kbd> to exit fullscreen
            </div>
          </div>

          {/* ── Fullscreen Table ────────────────────────────────── */}
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse" style={{ minWidth: '1600px' }}>
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#1f3a5f]">
                  <th colSpan={6} className={`${thBase} text-white text-center border-r border-[#2d4a6f]`}>Connection Details</th>
                  <th colSpan={5} className={`${thBase} text-white text-center border-r border-[#2d4a6f]`}>Meter Reading &amp; Slab Calculation</th>
                  <th colSpan={3} className={`${thBase} text-white text-center border-r border-[#2d4a6f]`}>Opening Balance</th>
                  <th colSpan={6} className={`${thBase} text-white text-center border-r border-[#2d4a6f]`}>Current Month + Opening Balance</th>
                  <th colSpan={4} className={`${thBase} text-white text-center`}>Closing Balance</th>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className={`${thBase} text-gray-600 text-center border-r border-gray-200 w-[44px]`}>#</th>
                  <th className={`${thBase} text-gray-600 text-left border-r border-gray-200`}>Type</th>
                  <th className={`${thBase} text-gray-600 text-left border-r border-gray-200`}>Meter No</th>
                  <th className={`${thBase} text-gray-600 text-left border-r border-gray-200`}>Tap / RR No</th>
                  <th className={`${thBase} text-gray-600 text-center border-r border-gray-200`}>Bill Date</th>
                  <th className={`${thBase} text-gray-600 text-center border-r border-gray-200`}>Due Date</th>
                  <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Prev<br/>Reading</th>
                  <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Curr<br/>Reading</th>
                  <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Consumption<br/>(KL)</th>
                  <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Slab Amt<br/>({'\u20B9'})</th>
                  <th className={`${thBase} text-gray-600 text-center border-r border-gray-200`}>Conn<br/>Type</th>
                  <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Principal<br/>({'\u20B9'})</th>
                  <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Interest<br/>({'\u20B9'})</th>
                  <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Total<br/>({'\u20B9'})</th>
                  <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Addl.<br/>Charges</th>
                  <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Principal<br/>({'\u20B9'})</th>
                  <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Interest<br/>({'\u20B9'})</th>
                  <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Penalty<br/>({'\u20B9'})</th>
                  <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Total<br/>({'\u20B9'})</th>
                  <th className={`${thBase} text-gray-600 text-center border-r border-gray-200`}>Status</th>
                  <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Extra Amt<br/>Paid ({'\u20B9'})</th>
                  <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Principal<br/>({'\u20B9'})</th>
                  <th className={`${thBase} text-gray-600 text-right border-r border-gray-200`}>Interest<br/>({'\u20B9'})</th>
                  <th className={`${thBase} text-gray-600 text-right`}>Total<br/>({'\u20B9'})</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={24} className="px-6 py-16 text-center">
                      <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-['Poppins',sans-serif] font-medium">No records found</p>
                    </td>
                  </tr>
                ) : (
                  groupConsecutiveRows(filtered).map((groupedRow, idx) => {
                    const row = groupedRow.row;
                    const isEven = idx % 2 === 0;
                    const rowBg = isEven ? 'bg-white' : 'bg-gray-50/60';
                    const negativeClass = 'text-red-600';
                    return (
                      <tr key={row.id} className={`${rowBg} hover:bg-blue-50/40 transition-colors border-b border-gray-100`}>
                        <td className={`${tdBase} text-center text-gray-500 font-medium border-r border-gray-100`}>{idx + 1}</td>
                        {/* Only show Type cell on first row of each group with rowspan */}
                        {groupedRow.isFirstInGroup ? (
                          <td 
                            rowSpan={groupedRow.groupSize}
                            className={`${tdBase} border-r border-gray-100 align-middle`}
                          >
                            <ConnectionBadge type={row.connectionType} />
                          </td>
                        ) : null}
                        <td className={`${tdBase} text-gray-700 font-medium border-r border-gray-100`}>{row.meterNo || 'N/A'}</td>
                        <td className={`${tdBase} text-gray-700 border-r border-gray-100`}>{row.tapRRNo || 'N/A'}</td>
                        <td className={`${tdBase} text-center text-gray-600 border-r border-gray-100`}>{row.billDate || 'N/A'}</td>
                        <td className={`${tdBase} text-center text-gray-600 border-r border-gray-100`}>{row.dueDate || 'N/A'}</td>
                        <td className={`${tdBase} text-right text-gray-600 border-r border-gray-100`}>{fmtReading(row.prevReading)}</td>
                        <td className={`${tdBase} text-right text-gray-600 border-r border-gray-100`}>{fmtReading(row.currentReading)}</td>
                        <td className={`${tdBase} text-right font-medium text-gray-800 border-r border-gray-100`}>{fmtReading(row.consumption)}</td>
                        <td className={`${tdBase} text-right text-gray-700 border-r border-gray-100`}>{fmt(row.slabRateAmount)}</td>
                        <td className={`${tdBase} text-center text-gray-500 text-[11px] border-r border-gray-100`}>{row.meterConnectionType || 'N/A'}</td>
                        <td className={`${tdBase} text-right border-r border-gray-100 ${row.openingPrincipal < 0 ? negativeClass : 'text-gray-700'}`}>{fmt(row.openingPrincipal)}</td>
                        <td className={`${tdBase} text-right text-gray-600 border-r border-gray-100`}>{fmt(row.openingInterest)}</td>
                        <td className={`${tdBase} text-right font-medium border-r border-gray-100 ${row.openingTotal < 0 ? negativeClass : 'text-gray-800'}`}>{fmt(row.openingTotal)}</td>
                        <td className={`${tdBase} text-right border-r border-gray-100 ${row.additionalCharges > 0 ? 'text-[#1f3a5f] font-semibold' : 'text-gray-600'}`}>{fmt(row.additionalCharges)}</td>
                        <td className={`${tdBase} text-right text-gray-700 border-r border-gray-100`}>{fmt(row.demandPrincipal)}</td>
                        <td className={`${tdBase} text-right text-gray-600 border-r border-gray-100`}>{fmt(row.demandInterest)}</td>
                        <td className={`${tdBase} text-right border-r border-gray-100 ${row.demandPenalty > 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>{fmt(row.demandPenalty)}</td>
                        <td className={`${tdBase} text-right font-bold text-[#1f3a5f] border-r border-gray-100`}>{fmt(row.demandTotal)}</td>
                        <td className={`${tdBase} text-center border-r border-gray-100`}><PaidBadge status={row.paidStatus} /></td>
                        <td className={`${tdBase} text-right border-r border-gray-100 ${row.extraAmountPaid > 0 ? 'text-emerald-600 font-semibold' : 'text-gray-600'}`}>{fmt(row.extraAmountPaid)}</td>
                        <td className={`${tdBase} text-right text-gray-700 border-r border-gray-100`}>{fmt(row.closingPrincipal)}</td>
                        <td className={`${tdBase} text-right text-gray-600 border-r border-gray-100`}>{fmt(row.closingInterest)}</td>
                        <td className={`${tdBase} text-right font-bold ${row.closingTotal > 0 ? 'text-amber-600' : 'text-gray-700'}`}>{fmt(row.closingTotal)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Fullscreen Footer ──────────────────────────────── */}
          <div className="shrink-0 bg-gray-50 border-t border-gray-200 px-5 py-2 flex items-center justify-between">
            <p className="text-[11px] text-gray-400 font-['Poppins',sans-serif] italic">
              * Negative opening principal indicates advance/overpayment. Penalty applied for late payments. Interest for reference only.
            </p>
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
              Total <span className="font-semibold text-[#1f3a5f]">{filtered.length}</span> records
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
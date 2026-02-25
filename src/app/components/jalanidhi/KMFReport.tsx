import { useState, useRef } from 'react';
import { FileText, Printer, Download, ArrowLeft, CalendarDays, Calendar } from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────
const MONTHS_FY = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March',
];

const FONT = "font-['Poppins',sans-serif]";

// ── Helpers ──────────────────────────────────────────────────────────────────
function getCurrentFYStartYear(): number {
  const now = new Date();
  return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
}

function fyLabel(startYear: number): string {
  return `${startYear}-${startYear + 1}`;
}

function getFYOptions(): { value: number; label: string }[] {
  const current = getCurrentFYStartYear();
  const opts: { value: number; label: string }[] = [];
  for (let y = current; y >= current - 10; y--) {
    opts.push({ value: y, label: `FY ${fyLabel(y)}` });
  }
  return opts;
}

function fmt(val: number | null | undefined): string {
  if (val === null || val === undefined) return '';
  if (val === 0) return '0.00';
  return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Types ────────────────────────────────────────────────────────────────────
interface MonthRow {
  month: string;
  amountDue: number;
  receiptNo: string;
  collectionAmount: number;
}

interface YearColumn {
  label: string;
  amountDue: number;
  receiptNo: string;
  collectionAmount: number;
  hasData: boolean;
}

interface KMFData {
  typeOfRevenue: string;
  personName: string;
  personAddress: string;
  tapRRNo: string;
  suspenseReceiptNo: string;
  suspenseAmount: number;
  year3: YearColumn;
  year2: YearColumn;
  year1: YearColumn;
  currentYearLabel: string;
  currentMonths: MonthRow[];
  adjustments: number;
  closingBalance: number;
  totalClosingBalance: number;
}

// ── Mock Data Generator ──────────────────────────────────────────────────────
function generateMockData(mode: 'current' | 'custom', fromStart: number, toStart: number): KMFData {
  const refYear = mode === 'current' ? getCurrentFYStartYear() : toStart;
  const yearsBack = mode === 'current' ? 0 : (toStart - fromStart);

  // Current year months mock data — fill up to current month
  const now = new Date();
  const currentFYMonth = now.getMonth() >= 3 ? now.getMonth() - 3 : now.getMonth() + 9;

  const mockAmounts = [120, 135, 110, 145, 160, 125, 130, 140, 155, 150, 115, 128];
  const currentMonths: MonthRow[] = MONTHS_FY.map((m, idx) => {
    const isFilled = idx <= currentFYMonth;
    return {
      month: m,
      amountDue: isFilled ? mockAmounts[idx] : 0,
      receiptNo: isFilled ? `RC/${refYear + (idx >= 9 ? 1 : 0)}/${String(idx + 1).padStart(3, '0')}` : '',
      collectionAmount: isFilled ? mockAmounts[idx] : 0,
    };
  });

  // Year 1
  const y1HasData = yearsBack >= 1;
  const year1: YearColumn = {
    label: fyLabel(refYear - 1),
    amountDue: y1HasData ? 1560.00 : 0,
    receiptNo: y1HasData ? `RC/${refYear - 1}/ANL` : '',
    collectionAmount: y1HasData ? 1450.00 : 0,
    hasData: y1HasData,
  };

  // Year 2
  const y2HasData = yearsBack >= 2;
  const year2: YearColumn = {
    label: fyLabel(refYear - 2),
    amountDue: y2HasData ? 1480.00 : 0,
    receiptNo: y2HasData ? `RC/${refYear - 2}/ANL` : '',
    collectionAmount: y2HasData ? 1320.00 : 0,
    hasData: y2HasData,
  };

  // Year 3
  const y3HasData = yearsBack >= 3;
  const year3: YearColumn = {
    label: `${fyLabel(refYear - 3)} & earlier`,
    amountDue: y3HasData ? 2850.00 : 0,
    receiptNo: y3HasData ? `RC/${refYear - 3}/CUM` : '',
    collectionAmount: y3HasData ? 2200.00 : 0,
    hasData: y3HasData,
  };

  const currentTotal = currentMonths.reduce((s, m) => s + m.amountDue, 0);
  const totalDemand = currentTotal
    + (y1HasData ? year1.amountDue : 0)
    + (y2HasData ? year2.amountDue : 0)
    + (y3HasData ? year3.amountDue : 0);
  const totalCollection = currentMonths.reduce((s, m) => s + m.collectionAmount, 0)
    + (y1HasData ? year1.collectionAmount : 0)
    + (y2HasData ? year2.collectionAmount : 0)
    + (y3HasData ? year3.collectionAmount : 0);

  return {
    typeOfRevenue: 'Water Tax',
    personName: 'Ramesh Kumar S.',
    personAddress: 'No. 45, 3rd Cross, Ward 12, Mandya Town, Karnataka - 571401',
    tapRRNo: 'MDY_10012',
    suspenseReceiptNo: '',
    suspenseAmount: 0,
    year3,
    year2,
    year1,
    currentYearLabel: fyLabel(refYear),
    currentMonths,
    adjustments: 0,
    closingBalance: totalDemand - totalCollection,
    totalClosingBalance: totalDemand - totalCollection,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════
export default function KMFReport() {
  const [phase, setPhase] = useState<'input' | 'report'>('input');
  const [yearMode, setYearMode] = useState<'current' | 'custom'>('current');
  const [fromFY, setFromFY] = useState<number>(getCurrentFYStartYear() - 3);
  const [toFY, setToFY] = useState<number>(getCurrentFYStartYear());
  const [typeOfRevenue, setTypeOfRevenue] = useState('Water Tax');
  const [formData, setFormData] = useState<KMFData | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const currentFYStart = getCurrentFYStartYear();

  const handleGenerate = () => {
    const data = generateMockData(yearMode, fromFY, toFY);
    data.typeOfRevenue = typeOfRevenue;
    setFormData(data);
    setPhase('report');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (!formData) return;

    const rows: string[] = [];
    rows.push('KMF NO 25 - SPECIAL DEMAND COLLECTION & BALANCE (DCB) REGISTER');
    rows.push(`Type of Revenue:,${formData.typeOfRevenue}`);
    rows.push(`Person:,${formData.personName}`);
    rows.push(`Address:,${formData.personAddress}`);
    rows.push(`Tap/RR No:,${formData.tapRRNo}`);
    rows.push('');

    const headers = ['Section', 'Detail', 'Amount Due', 'Receipt No', 'Collection Amount'];
    rows.push(headers.join(','));

    rows.push(`"${formData.year3.label}","",${formData.year3.hasData ? formData.year3.amountDue : ''},"${formData.year3.hasData ? formData.year3.receiptNo : ''}",${formData.year3.hasData ? formData.year3.collectionAmount : ''}`);
    rows.push(`"Arrears ${formData.year2.label}","",${formData.year2.hasData ? formData.year2.amountDue : ''},"${formData.year2.hasData ? formData.year2.receiptNo : ''}",${formData.year2.hasData ? formData.year2.collectionAmount : ''}`);
    rows.push(`"${formData.year1.label}","",${formData.year1.hasData ? formData.year1.amountDue : ''},"${formData.year1.hasData ? formData.year1.receiptNo : ''}",${formData.year1.hasData ? formData.year1.collectionAmount : ''}`);

    rows.push('');
    rows.push(`Current Year (${formData.currentYearLabel})`);
    rows.push('Month,Amount Due,Receipt No,Collection Amount');
    formData.currentMonths.forEach((m) => {
      rows.push(`${m.month},${m.amountDue},"${m.receiptNo}",${m.collectionAmount}`);
    });
    rows.push('');
    rows.push(`Adjustments,,${formData.adjustments}`);
    rows.push(`Closing Balance,,${formData.closingBalance}`);
    rows.push(`Total Closing Balance,,${formData.totalClosingBalance}`);

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KMF_Report_${formData.currentYearLabel}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Compute label for "From-To" display
  const rangeLabel = yearMode === 'current'
    ? `FY ${fyLabel(currentFYStart)} (Current Year)`
    : `FY ${fyLabel(fromFY)} to ${fyLabel(toFY)}`;

  // Determine year data flags for preview
  const previewYearsBack = yearMode === 'current' ? 0 : (toFY - fromFY);

  // ── Shared cell styles ─────────────────────────────────────────────────────
  const thCell = `border border-gray-400 px-2 py-1.5 text-[11px] font-semibold text-gray-800 ${FONT} bg-gray-100`;
  const tdCell = `border border-gray-300 px-2 py-1.5 text-[12px] text-gray-700 ${FONT}`;
  const tdCellR = `${tdCell} text-right`;

  // Total columns is always fixed: 1 + 2 + 3 + 3 + 3 + 4 = 16
  const totalCols = 16;

  // ══════════════════════════════════════════════════════════════════════════════
  // Phase 1: Input Form
  // ══════════════════════════════════════════════════════════════════════════════
  if (phase === 'input') {
    // Filter "To" options to only show years >= from
    const toOptions = getFYOptions().filter((o) => o.value >= fromFY);

    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1f3a5f] flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold text-[#1f3a5f] ${FONT}`}>
              KMF Report (KMF NO 25)
            </h1>
            <p className={`text-sm text-gray-500 ${FONT}`}>
              Special Demand, Collection &amp; Balance (DCB) Register
            </p>
          </div>
        </div>

        {/* Input Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="bg-[#1f3a5f] px-6 py-4">
              <h2 className={`text-base font-semibold text-white ${FONT}`}>
                Report Configuration
              </h2>
              <p className={`text-[12px] text-white/60 ${FONT} mt-0.5`}>
                Select the financial year range to generate the KMF NO 25 register
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Type of Revenue */}
              <div>
                <label className={`block text-[13px] font-medium text-gray-700 mb-1.5 ${FONT}`}>
                  Type of Revenue
                </label>
                <select
                  value={typeOfRevenue}
                  onChange={(e) => setTypeOfRevenue(e.target.value)}
                  className={`w-full px-3 py-2.5 border-[1.5px] border-gray-300 rounded-lg ${FONT} text-[13px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all`}
                >
                  <option value="Water Tax">Water Tax</option>
                  <option value="Sewerage Tax">Sewerage Tax</option>
                  <option value="Connection Charges">Connection Charges</option>
                  <option value="Meter Rent">Meter Rent</option>
                </select>
              </div>

              {/* ── Year Mode Toggle ───────────────────────────────── */}
              <div>
                <label className={`block text-[13px] font-medium text-gray-700 mb-2.5 ${FONT}`}>
                  Financial Year Selection
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Current Year Option */}
                  <button
                    type="button"
                    onClick={() => setYearMode('current')}
                    className={`relative flex items-center gap-3 px-4 py-3.5 rounded-lg border-2 transition-all ${
                      yearMode === 'current'
                        ? 'border-[#1f3a5f] bg-[#1f3a5f]/5'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      yearMode === 'current' ? 'border-[#1f3a5f]' : 'border-gray-300'
                    }`}>
                      {yearMode === 'current' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#1f3a5f]" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className={`text-[13px] font-semibold ${yearMode === 'current' ? 'text-[#1f3a5f]' : 'text-gray-700'} ${FONT}`}>
                        Current Year
                      </p>
                      <p className={`text-[11px] text-gray-400 ${FONT}`}>
                        FY {fyLabel(currentFYStart)}
                      </p>
                    </div>
                    <Calendar className={`w-4 h-4 ml-auto ${yearMode === 'current' ? 'text-[#1f3a5f]' : 'text-gray-300'}`} />
                  </button>

                  {/* Custom Range Option */}
                  <button
                    type="button"
                    onClick={() => setYearMode('custom')}
                    className={`relative flex items-center gap-3 px-4 py-3.5 rounded-lg border-2 transition-all ${
                      yearMode === 'custom'
                        ? 'border-[#1f3a5f] bg-[#1f3a5f]/5'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      yearMode === 'custom' ? 'border-[#1f3a5f]' : 'border-gray-300'
                    }`}>
                      {yearMode === 'custom' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#1f3a5f]" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className={`text-[13px] font-semibold ${yearMode === 'custom' ? 'text-[#1f3a5f]' : 'text-gray-700'} ${FONT}`}>
                        Custom Year Range
                      </p>
                      <p className={`text-[11px] text-gray-400 ${FONT}`}>
                        Select from &amp; to year
                      </p>
                    </div>
                    <CalendarDays className={`w-4 h-4 ml-auto ${yearMode === 'custom' ? 'text-[#1f3a5f]' : 'text-gray-300'}`} />
                  </button>
                </div>
              </div>

              {/* ── Custom Year Range Dropdowns ────────────────────── */}
              {yearMode === 'custom' && (
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* From FY */}
                    <div>
                      <label className={`block text-[13px] font-medium text-gray-700 mb-1.5 ${FONT}`}>
                        From Financial Year
                      </label>
                      <select
                        value={fromFY}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setFromFY(val);
                          // If "to" is now less than "from", adjust
                          if (toFY < val) setToFY(val);
                        }}
                        className={`w-full px-3 py-2.5 border-[1.5px] border-gray-300 rounded-lg ${FONT} text-[13px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all`}
                      >
                        {getFYOptions().map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* To FY */}
                    <div>
                      <label className={`block text-[13px] font-medium text-gray-700 mb-1.5 ${FONT}`}>
                        To Financial Year
                      </label>
                      <select
                        value={toFY}
                        onChange={(e) => setToFY(parseInt(e.target.value, 10))}
                        className={`w-full px-3 py-2.5 border-[1.5px] border-gray-300 rounded-lg ${FONT} text-[13px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all`}
                      >
                        {toOptions.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {toFY - fromFY > 3 && (
                    <p className={`text-[11px] text-amber-600 ${FONT}`}>
                      Note: The form supports up to 4 year columns (Current Year + 3 prior years).
                      Years beyond 3 years prior will be aggregated into &quot;Year 3 &amp; earlier&quot;.
                    </p>
                  )}
                </div>
              )}

              {/* ── Preview Info ───────────────────────────────────── */}
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="w-4 h-4 text-[#1f3a5f]" />
                  <span className={`text-[13px] font-semibold text-[#1f3a5f] ${FONT}`}>Report Preview</span>
                </div>
                <div className={`text-[12px] text-gray-600 ${FONT} space-y-1.5`}>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Range:</span>
                    <span className="font-medium text-gray-800">{rangeLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Current Year Column:</span>
                    <span className="font-medium text-emerald-600">
                      {yearMode === 'current' ? fyLabel(currentFYStart) : fyLabel(toFY)} (12 months)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Year 1:</span>
                    <span className={`font-medium ${previewYearsBack >= 1 ? 'text-blue-600' : 'text-gray-400 italic'}`}>
                      {previewYearsBack >= 1
                        ? fyLabel((yearMode === 'current' ? currentFYStart : toFY) - 1)
                        : 'Empty — no data for this column'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Year 2 (Arrears):</span>
                    <span className={`font-medium ${previewYearsBack >= 2 ? 'text-purple-600' : 'text-gray-400 italic'}`}>
                      {previewYearsBack >= 2
                        ? fyLabel((yearMode === 'current' ? currentFYStart : toFY) - 2)
                        : 'Empty — no data for this column'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Year 3 &amp; earlier:</span>
                    <span className={`font-medium ${previewYearsBack >= 3 ? 'text-amber-600' : 'text-gray-400 italic'}`}>
                      {previewYearsBack >= 3
                        ? `${fyLabel((yearMode === 'current' ? currentFYStart : toFY) - 3)} & earlier`
                        : 'Empty — no data for this column'}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-gray-500">Total Columns:</span>
                    <span className="font-medium text-gray-800">
                      16 (all columns always shown)
                    </span>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-2">
                <button
                  onClick={handleGenerate}
                  className={`w-full px-6 py-3 text-sm font-semibold text-white bg-[#1f3a5f] rounded-lg hover:bg-[#2d4a6f] transition-colors ${FONT} flex items-center justify-center gap-2`}
                >
                  <FileText className="w-4 h-4" />
                  Generate KMF Report
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 px-1">
            <p className={`text-[11px] text-gray-400 ${FONT} italic leading-relaxed`}>
              * This report generates the KMF NO 25 form as per Rule 59(1)(b), 64(1) &amp; 66(1).
              The full form structure with all columns is always displayed. Select &quot;Current Year&quot;
              for a report with only the current year data filled, or &quot;Custom Year Range&quot; to
              include arrears data for prior years.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // Phase 2: Report Display
  // ══════════════════════════════════════════════════════════════════════════════
  if (!formData) return null;

  // Current year totals
  const curDemandTotal = formData.currentMonths.reduce((s, m) => s + m.amountDue, 0);
  const curCollTotal = formData.currentMonths.reduce((s, m) => s + m.collectionAmount, 0);

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6 print:bg-white print:px-2 print:py-2">
      {/* ── Top Bar ──────────────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPhase('input')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${FONT}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-3 ml-2">
            <div className="w-10 h-10 rounded-lg bg-[#1f3a5f] flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold text-[#1f3a5f] ${FONT}`}>
                KMF Report
              </h1>
              <p className={`text-sm text-gray-500 ${FONT}`}>
                {rangeLabel} &middot; {formData.typeOfRevenue}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#1f3a5f] bg-white border-2 border-[#1f3a5f] rounded-lg hover:bg-[#f0f4f8] transition-colors ${FONT}`}
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownloadCSV}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#1f3a5f] rounded-lg hover:bg-[#2d4a6f] transition-colors ${FONT}`}
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>
      </div>

      {/* ── KMF Form ─────────────────────────────────────────────── */}
      <div ref={reportRef} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 print:p-4 print:shadow-none print:border-0">
        {/* Form Title */}
        <div className="text-center mb-5">
          <p className={`text-base font-bold text-gray-900 ${FONT}`}>KMF NO 25</p>
          <p className={`text-[11px] text-gray-500 ${FONT}`}>(Rule 59(1)(b), 64(1) &amp; 66(1))</p>
          <p className={`text-sm font-semibold text-gray-800 ${FONT} mt-2`}>
            SPECIAL DEMAND COLLECTION &amp; BALANCE (DCB) REGISTER
          </p>
          <p className={`text-[11px] text-gray-500 ${FONT} italic`}>
            (For demands liable to be collected on monthly basis)
          </p>
        </div>

        {/* Type of Revenue */}
        <div className={`mb-4 text-[13px] ${FONT}`}>
          <span className="font-semibold text-gray-800">Type of Revenue:</span>{' '}
          <span className="text-gray-700 border-b border-gray-400 pb-0.5 px-2">{formData.typeOfRevenue}</span>
        </div>

        {/* ── Main Table ─────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-400" style={{ minWidth: '1100px' }}>
            {/* ── Group Headers (Row 1) ──────────────────────────── */}
            <thead>
              <tr>
                <th rowSpan={3} className={`${thCell} text-center w-[180px] align-top`}>
                  Name, address<br/>of the Person<br/>and other<br/>particulars
                </th>
                <th colSpan={2} className={`${thCell} text-center`}>
                  Suspense Collection
                </th>
                <th colSpan={3} className={`${thCell} text-center`}>
                  {formData.year3.hasData
                    ? <>&lt;{formData.year3.label}&gt;</>
                    : <span className="text-gray-400">&lt;Year 3 &amp; earlier&gt;</span>
                  }
                </th>
                <th colSpan={3} className={`${thCell} text-center`}>
                  {formData.year2.hasData
                    ? <>Arrears &lt;{formData.year2.label}&gt;</>
                    : <span className="text-gray-400">Arrears &lt;Year 2&gt;</span>
                  }
                </th>
                <th colSpan={3} className={`${thCell} text-center`}>
                  {formData.year1.hasData
                    ? <>&lt;{formData.year1.label}&gt;</>
                    : <span className="text-gray-400">&lt;Year 1&gt;</span>
                  }
                </th>
                <th colSpan={4} className={`${thCell} text-center`}>
                  Current Year ({formData.currentYearLabel})
                </th>
              </tr>

              {/* ── Sub Headers (Row 2) ──────────────────────────── */}
              <tr>
                {/* Suspense */}
                <th rowSpan={2} className={`${thCell} text-center w-[80px]`}>
                  Receipt<br/>No/Challan<br/>No. &amp;Date
                </th>
                <th rowSpan={2} className={`${thCell} text-center w-[65px]`}>
                  Amount
                </th>
                {/* Year 3 */}
                <th rowSpan={2} className={`${thCell} text-center w-[65px]`}>Amount<br/>Due</th>
                <th colSpan={2} className={`${thCell} text-center`}>Collection</th>
                {/* Year 2 */}
                <th rowSpan={2} className={`${thCell} text-center w-[65px]`}>Amount<br/>Due</th>
                <th colSpan={2} className={`${thCell} text-center`}>Collection</th>
                {/* Year 1 */}
                <th rowSpan={2} className={`${thCell} text-center w-[65px]`}>Amount<br/>Due</th>
                <th colSpan={2} className={`${thCell} text-center`}>Collection</th>
                {/* Current Year */}
                <th rowSpan={2} className={`${thCell} text-center w-[75px]`}>Month</th>
                <th rowSpan={2} className={`${thCell} text-center w-[75px]`}>Amount<br/>due Rs</th>
                <th colSpan={2} className={`${thCell} text-center`}>Collection</th>
              </tr>

              {/* ── Sub-sub Headers (Row 3) ───────────────────────── */}
              <tr>
                {/* Year 3 collection sub-headers */}
                <th className={`${thCell} text-center w-[80px]`}>Receipt<br/>No/Challan<br/>No. &amp;Date</th>
                <th className={`${thCell} text-center w-[65px]`}>Amount</th>
                {/* Year 2 collection sub-headers */}
                <th className={`${thCell} text-center w-[80px]`}>Receipt<br/>No/Challan<br/>No. &amp;Date</th>
                <th className={`${thCell} text-center w-[65px]`}>Amount<br/>Rs</th>
                {/* Year 1 collection sub-headers */}
                <th className={`${thCell} text-center w-[80px]`}>Receipt<br/>No/Challan<br/>No. &amp;Date</th>
                <th className={`${thCell} text-center w-[65px]`}>Amount</th>
                {/* Current year collection sub-headers */}
                <th className={`${thCell} text-center w-[80px]`}>Receipt<br/>or Challan<br/>No/Date</th>
                <th className={`${thCell} text-center w-[65px]`}>Amount<br/>Rs</th>
              </tr>

              {/* ── Column Numbers Row ────────────────────────────── */}
              <tr className="bg-gray-50">
                {Array.from({ length: totalCols }, (_, i) => (
                  <th key={`cn-${i + 1}`} className={`${thCell} text-center text-[10px] text-gray-500`}>
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>

            {/* ── Body ──────────────────────────────────────────── */}
            <tbody>
              {/* Month rows - person info spans all 12 month rows */}
              {formData.currentMonths.map((monthRow, idx) => (
                <tr key={monthRow.month} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                  {/* Person details - only on first row, spans 12 */}
                  {idx === 0 && (
                    <td rowSpan={12} className={`${tdCell} align-top`}>
                      <div className={`text-[12px] ${FONT}`}>
                        <p className="font-semibold text-gray-900">{formData.personName}</p>
                        <p className="text-gray-600 mt-0.5">{formData.personAddress}</p>
                        <p className="text-gray-500 mt-1 text-[11px]">Tap/RR: {formData.tapRRNo}</p>
                      </div>
                    </td>
                  )}

                  {/* Suspense - only first row spans all */}
                  {idx === 0 && (
                    <>
                      <td rowSpan={12} className={`${tdCell} text-center align-top`}>
                        {formData.suspenseReceiptNo || '-'}
                      </td>
                      <td rowSpan={12} className={`${tdCellR} align-top`}>
                        {formData.suspenseAmount > 0 ? fmt(formData.suspenseAmount) : '-'}
                      </td>
                    </>
                  )}

                  {/* Year 3 - first row spans all */}
                  {idx === 0 && (
                    <>
                      <td rowSpan={12} className={`${tdCellR} align-top ${!formData.year3.hasData ? 'bg-gray-50/40' : ''}`}>
                        {formData.year3.hasData ? fmt(formData.year3.amountDue) : ''}
                      </td>
                      <td rowSpan={12} className={`${tdCell} text-center align-top text-[11px] ${!formData.year3.hasData ? 'bg-gray-50/40' : ''}`}>
                        {formData.year3.hasData ? formData.year3.receiptNo : ''}
                      </td>
                      <td rowSpan={12} className={`${tdCellR} align-top ${!formData.year3.hasData ? 'bg-gray-50/40' : ''}`}>
                        {formData.year3.hasData ? fmt(formData.year3.collectionAmount) : ''}
                      </td>
                    </>
                  )}

                  {/* Year 2 - first row spans all */}
                  {idx === 0 && (
                    <>
                      <td rowSpan={12} className={`${tdCellR} align-top ${!formData.year2.hasData ? 'bg-gray-50/40' : ''}`}>
                        {formData.year2.hasData ? fmt(formData.year2.amountDue) : ''}
                      </td>
                      <td rowSpan={12} className={`${tdCell} text-center align-top text-[11px] ${!formData.year2.hasData ? 'bg-gray-50/40' : ''}`}>
                        {formData.year2.hasData ? formData.year2.receiptNo : ''}
                      </td>
                      <td rowSpan={12} className={`${tdCellR} align-top ${!formData.year2.hasData ? 'bg-gray-50/40' : ''}`}>
                        {formData.year2.hasData ? fmt(formData.year2.collectionAmount) : ''}
                      </td>
                    </>
                  )}

                  {/* Year 1 - first row spans all */}
                  {idx === 0 && (
                    <>
                      <td rowSpan={12} className={`${tdCellR} align-top ${!formData.year1.hasData ? 'bg-gray-50/40' : ''}`}>
                        {formData.year1.hasData ? fmt(formData.year1.amountDue) : ''}
                      </td>
                      <td rowSpan={12} className={`${tdCell} text-center align-top text-[11px] ${!formData.year1.hasData ? 'bg-gray-50/40' : ''}`}>
                        {formData.year1.hasData ? formData.year1.receiptNo : ''}
                      </td>
                      <td rowSpan={12} className={`${tdCellR} align-top ${!formData.year1.hasData ? 'bg-gray-50/40' : ''}`}>
                        {formData.year1.hasData ? fmt(formData.year1.collectionAmount) : ''}
                      </td>
                    </>
                  )}

                  {/* Current Year month data */}
                  <td className={`${tdCell} font-semibold text-gray-800 text-[12px]`}>{monthRow.month}</td>
                  <td className={`${tdCellR} ${monthRow.amountDue > 0 ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                    {monthRow.amountDue > 0 ? fmt(monthRow.amountDue) : '-'}
                  </td>
                  <td className={`${tdCell} text-center text-[11px] ${monthRow.receiptNo ? 'text-gray-700' : 'text-gray-400'}`}>
                    {monthRow.receiptNo || '-'}
                  </td>
                  <td className={`${tdCellR} ${monthRow.collectionAmount > 0 ? 'text-emerald-700 font-medium' : 'text-gray-400'}`}>
                    {monthRow.collectionAmount > 0 ? fmt(monthRow.collectionAmount) : '-'}
                  </td>
                </tr>
              ))}

              {/* ── Current Year Totals Row ───────────────────────── */}
              <tr className="bg-blue-50/40">
                <td className={`${tdCell} font-semibold text-[#1f3a5f] text-right`} colSpan={12}>
                  Current Year Total
                </td>
                <td className={`${tdCell}`}></td>
                <td className={`${tdCellR} font-bold text-[#1f3a5f]`}>{fmt(curDemandTotal)}</td>
                <td className={`${tdCell}`}></td>
                <td className={`${tdCellR} font-bold text-emerald-700`}>{fmt(curCollTotal)}</td>
              </tr>

              {/* ── Adjustments ───────────────────────────────────── */}
              <tr>
                <td className={`${tdCell} font-semibold text-gray-800`} colSpan={totalCols - 1}>
                  Adjustments, if any
                </td>
                <td className={`${tdCellR} font-medium`}>{fmt(formData.adjustments)}</td>
              </tr>

              {/* ── Closing Balance ───────────────────────────────── */}
              <tr className="bg-amber-50/60">
                <td className={`${tdCell} font-semibold text-gray-800`} colSpan={totalCols - 1}>
                  Closing Balance
                </td>
                <td className={`${tdCellR} font-bold text-amber-700`}>{fmt(formData.closingBalance)}</td>
              </tr>

              {/* ── Total Closing Balance ─────────────────────────── */}
              <tr className="bg-[#1f3a5f]/5">
                <td className={`${tdCell} font-bold text-[#1f3a5f]`} colSpan={totalCols - 1}>
                  Total Closing Balance
                </td>
                <td className={`${tdCellR} font-bold text-[#1f3a5f] text-[13px]`}>{fmt(formData.totalClosingBalance)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Signatures ─────────────────────────────────────────── */}
        <div className={`mt-8 flex items-end justify-between ${FONT} text-[13px] text-gray-700`}>
          <div>
            <span className="font-semibold">Prepared by:</span>
            <span className="inline-block w-48 border-b border-gray-400 ml-2">&nbsp;</span>
          </div>
          <div>
            <span className="font-semibold">Verified by:</span>
            <span className="inline-block w-48 border-b border-gray-400 ml-2">&nbsp;</span>
          </div>
        </div>

        {/* ── Instructions ───────────────────────────────────────── */}
        <div className={`mt-8 pt-4 border-t border-gray-200 ${FONT}`}>
          <p className="text-[12px] font-semibold text-gray-800 mb-2 underline">Instructions:</p>
          <ol className="text-[11px] text-gray-600 space-y-1.5 list-decimal pl-4 leading-relaxed">
            <li>
              The Register shall be maintained for items such as water charges etc. which are required to be collected on monthly basis.
            </li>
            <li>
              The tax details are further classified into 4 year-wise rows. The first row &quot;suspense&quot; is used for recording collections for which assessment year could not be identified. As and when the assessment year is identified, the collection shall be taken to the appropriate assessment year, by cancelling the entry in the &quot;Suspense&quot; row under authorization by the Revenue Officer. The second row represents tax which pertains to five years or earlier (Year 3 and earlier), and progressively increases such that current year appears in the shaded row.
            </li>
          </ol>
        </div>
      </div>

      {/* ── Footer note ──────────────────────────────────────────── */}
      <div className="mt-4 px-1 print:hidden">
        <p className={`text-[11px] text-gray-400 ${FONT} italic`}>
          * Generated as per KMF NO 25 format — Rule 59(1)(b), 64(1) &amp; 66(1).
          Data shown is for the selected financial year range. Verify all figures before official use.
        </p>
      </div>
    </div>
  );
}

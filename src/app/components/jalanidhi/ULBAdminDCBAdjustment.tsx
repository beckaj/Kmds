import { useState, useEffect } from 'react';
import { Search, FileText, CheckCircle, AlertTriangle, Shield, Clock, History, Send, Lock } from 'lucide-react';
import { GovInput } from '../ui/gov-input';
import { GovButton } from '../ui/gov-button';
import { GovSelect } from '../ui/gov-select';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

const ADJUSTMENT_REASONS = [
  { value: '__none__', label: '-- Select Reason --' },
  { value: 'incorrect_meter_reading', label: 'Incorrect Meter Reading (Historical)' },
  { value: 'incorrect_arrears', label: 'Incorrect Arrears Calculation' },
  { value: 'legacy_opening_balance', label: 'Legacy Opening Balance Error' },
  { value: 'tariff_misapplication', label: 'Tariff Misapplication' },
  { value: 'duplicate_demand', label: 'Duplicate Demand Posted' },
  { value: 'court_order', label: 'Court Order / Legal Directive' },
  { value: 'data_migration_error', label: 'Data Migration Error' },
  { value: 'other', label: 'Other' },
];

const ADJUSTMENT_TYPES = [
  { value: '__none__', label: '-- Select Type --' },
  { value: 'credit', label: 'Credit (Reduce Demand)' },
  { value: 'debit', label: 'Debit (Increase Demand)' },
];

const ADJUSTMENT_CATEGORIES = [
  { value: '__none__', label: '-- Select Category --' },
  { value: 'principal', label: 'Principal Amount' },
  { value: 'interest', label: 'Interest' },
  { value: 'arrears', label: 'Arrears' },
  { value: 'penalty', label: 'Penalty' },
];

function generateFutureMonths(): { value: string; label: string }[] {
  const months = [{ value: '__none__', label: '-- Select Month --' }];
  const now = new Date();
  for (let i = 1; i <= 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const val = d.toISOString().substring(0, 7);
    const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    months.push({ value: val, label });
  }
  return months;
}

interface AdjustmentRecord {
  id: string;
  rrNumber: string;
  billNumber: string;
  adjustmentMonth: string;
  adjustmentType: string;
  adjustmentCategory: string;
  adjustmentAmount: number;
  reasonLabel: string;
  status: string;
  createdAt: string;
  adminName: string;
}

export default function ULBAdminDCBAdjustment() {
  // ── Tabs ──
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  
  // ── New Adjustment Form ──
  const [rrNumber, setRRNumber] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [billData, setBillData] = useState<any>(null);
  const [fetchError, setFetchError] = useState('');
  const [adjustmentMonth, setAdjustmentMonth] = useState('__none__');
  const [adjustmentType, setAdjustmentType] = useState('__none__');
  const [adjustmentCategory, setAdjustmentCategory] = useState('__none__');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [reasonCode, setReasonCode] = useState('__none__');
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReviewStep, setShowReviewStep] = useState(false);
  
  // ── History ──
  const [adjustments, setAdjustments] = useState<AdjustmentRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const futureMonths = generateFutureMonths();

  // Fetch bill data (simulated - same as caseworker)
  const handleFetchRR = async () => {
    if (!rrNumber.trim()) { setFetchError('Please enter an RR Number.'); return; }
    setFetching(true);
    setFetchError('');
    try {
      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/dcb/fetch-rr',
        {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + publicAnonKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ rrNumber: rrNumber.trim() }),
        }
      );
      const data = await response.json();
      if (data && data.success && data.dcbData) {
        setBillData(data.dcbData);
        setFetched(true);
      } else {
        setFetchError(data && data.error ? data.error : 'RR Number not found.');
      }
    } catch (err) {
      console.error('[ULB ADJ] Error:', err);
      setFetchError('Network error. Please try again.');
    } finally {
      setFetching(false);
    }
  };

  // Fetch adjustment history
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/dcb/ulb-admin/adjustments',
        { method: 'GET', headers: { 'Authorization': 'Bearer ' + publicAnonKey, 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      if (data && data.success) {
        setAdjustments(data.adjustments || []);
      }
    } catch (err) {
      console.error('[ULB ADJ HISTORY] Error:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);

  const handleReview = () => {
    if (adjustmentMonth === '__none__') { alert('Please select an adjustment month.'); return; }
    if (adjustmentType === '__none__') { alert('Please select an adjustment type.'); return; }
    if (adjustmentCategory === '__none__') { alert('Please select an adjustment category.'); return; }
    if (!adjustmentAmount || parseFloat(adjustmentAmount) <= 0) { alert('Please enter a valid adjustment amount.'); return; }
    if (reasonCode === '__none__') { alert('Please select a reason code.'); return; }
    if (!remarks.trim()) { alert('Justification remarks are mandatory.'); return; }
    setShowReviewStep(true);
  };

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const adminName = userData && userData.name ? userData.name : 'ULB Admin';
      const adminId = userData && userData.phone ? userData.phone : 'ulb-admin';

      const reasonObj = ADJUSTMENT_REASONS.find(r => r.value === reasonCode);

      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/dcb/ulb-admin/adjustment',
        {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + publicAnonKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rrNumber: rrNumber.trim(),
            billNumber: billData && billData.billNumber ? billData.billNumber : 'N/A',
            originalBillData: billData || {},
            adjustmentMonth,
            adjustmentType,
            adjustmentCategory,
            adjustmentAmount,
            reasonCode,
            reasonLabel: reasonObj ? reasonObj.label : reasonCode,
            remarks: remarks.trim(),
            adminName,
            adminId,
          }),
        }
      );
      const result = await response.json();
      if (result && result.success) {
        setShowConfirm(false);
        setShowReviewStep(false);
        setSubmitted(true);
        setSubmittedId(result.adjustmentId || '');
        alert('DCB Adjustment posted successfully!\n\nAdjustment ID: ' + (result.adjustmentId || 'N/A') + '\n\nThe adjustment will be reflected in the next billing cycle. Historical paid bill remains unchanged.\n\nNotifications sent to Commissioner and billing team.');
      } else {
        alert('Error: ' + (result && result.error ? result.error : 'Unknown error'));
      }
    } catch (err) {
      console.error('[ULB ADJ SUBMIT] Error:', err);
      alert('Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setRRNumber('');
    setFetched(false);
    setBillData(null);
    setFetchError('');
    setAdjustmentMonth('__none__');
    setAdjustmentType('__none__');
    setAdjustmentCategory('__none__');
    setAdjustmentAmount('');
    setReasonCode('__none__');
    setRemarks('');
    setSubmitted(false);
    setSubmittedId('');
    setShowReviewStep(false);
    setShowConfirm(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try { return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return dateStr; }
  };

  const getReasonLabel = (code: string) => {
    const r = ADJUSTMENT_REASONS.find(x => x.value === code);
    return r ? r.label : code;
  };

  const getTypeLabel = (t: string) => {
    const r = ADJUSTMENT_TYPES.find(x => x.value === t);
    return r ? r.label : t;
  };

  const getCategoryLabel = (c: string) => {
    const r = ADJUSTMENT_CATEGORIES.find(x => x.value === c);
    return r ? r.label : c;
  };

  const getMonthLabel = (m: string) => {
    const r = futureMonths.find(x => x.value === m);
    return r ? r.label : m;
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
          <FileText className="w-6 h-6" />
          DCB Correction - State Level
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
          Post future-cycle adjustments for paid bills or bills older than previous month
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('new')}
          className={`px-5 py-2 rounded-md text-sm font-semibold font-['Poppins',sans-serif] transition-colors ${
            activeTab === 'new' ? 'bg-[#1f3a5f] text-white' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          New Adjustment
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2 rounded-md text-sm font-semibold font-['Poppins',sans-serif] transition-colors ${
            activeTab === 'history' ? 'bg-[#1f3a5f] text-white' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          Adjustment History
        </button>
      </div>

      {/* ═══ NEW ADJUSTMENT TAB ═══ */}
      {activeTab === 'new' && (
        <>
          {/* Success */}
          {submitted && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <p className="text-green-800 font-semibold font-['Poppins',sans-serif]">Adjustment posted successfully!</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm font-['Poppins',sans-serif]">
                <div><span className="text-gray-500">Adjustment ID:</span> <span className="font-semibold text-green-800">{submittedId}</span></div>
                <div><span className="text-gray-500">RR Number:</span> <span className="font-medium text-gray-800">{rrNumber}</span></div>
                <div><span className="text-gray-500">Status:</span> <span className="font-medium text-green-700">Posted & Locked</span></div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Lock className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 font-['Poppins',sans-serif]">Historical paid bill unchanged. Adjustment will reflect in next cycle.</span>
              </div>
              <div className="mt-4">
                <GovButton variant="primary" size="sm" onClick={handleReset}>Post Another Adjustment</GovButton>
              </div>
            </div>
          )}

          {!submitted && (
            <>
              {/* Warning Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 mb-6">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 font-['Poppins',sans-serif]">ULB Admin Level Adjustment</p>
                  <p className="text-sm text-amber-700 font-['Poppins',sans-serif] mt-1">
                    This view is for paid bills or bills older than the previous month. Adjustments are posted to a future billing cycle without modifying historical records. Dual confirmation required (Review then Confirm).
                  </p>
                </div>
              </div>

              {/* Step 1: Fetch RR */}
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Step 1: Search Bill
                </h2>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <GovInput
                      label="RR Number"
                      value={rrNumber}
                      onChange={(e) => setRRNumber(e.target.value)}
                      placeholder="Enter RR Number..."
                      disabled={fetched}
                    />
                  </div>
                  {!fetched ? (
                    <GovButton variant="primary" onClick={handleFetchRR} disabled={fetching} loading={fetching}>
                      <Search className="w-4 h-4" /> Fetch Bill
                    </GovButton>
                  ) : (
                    <GovButton variant="outline" onClick={handleReset}>Clear</GovButton>
                  )}
                </div>
                {fetchError && <p className="text-red-600 text-sm mt-2 font-['Poppins',sans-serif]">{fetchError}</p>}
              </div>

              {/* Step 2: Historical Bill (read-only) */}
              {fetched && billData && (
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Step 2: Historical Bill (Read-Only)
                  </h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800 font-['Poppins',sans-serif]">This bill record is locked. No modifications to historical data.</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <GovInput label="District" value={billData.district || 'N/A'} disabled />
                    <GovInput label="ULB" value={billData.ulb || 'N/A'} disabled />
                    <GovInput label="Connection Type" value={billData.connectionType || 'N/A'} disabled />
                    <GovInput label="Bill Number" value={billData.billNumber || 'N/A'} disabled />
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <GovInput label="Arrears (Rs)" value={String(billData.arrears || 0)} disabled />
                    <GovInput label="Principal (Rs)" value={String(billData.principleAmount || 0)} disabled />
                    <GovInput label="Penalty (Rs)" value={String(billData.penalty || 0)} disabled />
                    <GovInput label="Total (Rs)" value={String(billData.totalAmount || 0)} disabled />
                  </div>
                </div>
              )}

              {/* Step 3: Adjustment Details */}
              {fetched && billData && !showReviewStep && (
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Step 3: Adjustment Details
                  </h2>
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <GovSelect label="Adjustment Month (Future Cycle)" value={adjustmentMonth} onChange={(e) => setAdjustmentMonth(e.target.value)} options={futureMonths} required />
                    <GovSelect label="Adjustment Type" value={adjustmentType} onChange={(e) => setAdjustmentType(e.target.value)} options={ADJUSTMENT_TYPES} required />
                  </div>
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <GovSelect label="Adjustment Category" value={adjustmentCategory} onChange={(e) => setAdjustmentCategory(e.target.value)} options={ADJUSTMENT_CATEGORIES} required />
                    <GovInput label="Adjustment Amount (Rs)" type="number" value={adjustmentAmount} onChange={(e) => setAdjustmentAmount(e.target.value)} placeholder="Enter amount..." required />
                  </div>
                  <div className="grid grid-cols-1 gap-6 mb-4">
                    <GovSelect label="Reason Code" value={reasonCode} onChange={(e) => setReasonCode(e.target.value)} options={ADJUSTMENT_REASONS} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                      Justification / Remarks <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-md font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/30 focus:border-[#1f3a5f]"
                      placeholder="Mandatory: Provide detailed justification for this adjustment..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <GovButton variant="primary" onClick={handleReview}>
                      <CheckCircle className="w-4 h-4" /> Review Adjustment
                    </GovButton>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Confirm (Dual Confirmation) */}
              {showReviewStep && (
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Step 4: Review & Confirm
                  </h2>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 font-['Poppins',sans-serif]">Review Carefully</p>
                      <p className="text-sm text-amber-700 font-['Poppins',sans-serif] mt-1">
                        Please review all details below. On confirmation, the adjustment will be posted to the future cycle and locked immediately. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
                    <div className="grid grid-cols-3 gap-6">
                      <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">RR Number</p><p className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">{rrNumber}</p></div>
                      <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Bill Number</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{billData && billData.billNumber ? billData.billNumber : 'N/A'}</p></div>
                      <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Original Total</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{'\u20B9'} {billData && billData.totalAmount ? billData.totalAmount : 'N/A'}</p></div>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="grid grid-cols-3 gap-6">
                      <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Adjustment Month</p><p className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">{getMonthLabel(adjustmentMonth)}</p></div>
                      <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Adjustment Type</p><p className={`text-[15px] font-semibold font-['Poppins',sans-serif] ${adjustmentType === 'credit' ? 'text-green-700' : 'text-red-700'}`}>{getTypeLabel(adjustmentType)}</p></div>
                      <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Category</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{getCategoryLabel(adjustmentCategory)}</p></div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Amount</p><p className="text-[15px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">{'\u20B9'} {adjustmentAmount}</p></div>
                      <div><p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Reason</p><p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{getReasonLabel(reasonCode)}</p></div>
                      <div></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Justification</p>
                      <p className="text-sm text-gray-700 font-['Poppins',sans-serif] bg-gray-50 p-3 rounded-md border border-gray-200">{remarks}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-5">
                    <GovButton variant="outline" onClick={() => setShowReviewStep(false)} disabled={processing}>Back to Edit</GovButton>
                    <GovButton variant="success" onClick={() => setShowConfirm(true)} disabled={processing}>
                      <CheckCircle className="w-4 h-4" /> Confirm & Post Adjustment
                    </GovButton>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ═══ HISTORY TAB ═══ */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1f3a5f] mx-auto"></div>
                <p className="mt-3 text-gray-500 font-['Poppins',sans-serif] text-sm">Loading adjustments...</p>
              </div>
            </div>
          ) : adjustments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-['Poppins',sans-serif]">No adjustments posted yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1f3a5f] text-white">
                    <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[13px]">S.No</th>
                    <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[13px]">Adjustment ID</th>
                    <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[13px]">RR Number</th>
                    <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[13px]">Type</th>
                    <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[13px]">Category</th>
                    <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[13px]">Amount</th>
                    <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[13px]">Adj. Month</th>
                    <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[13px]">Reason</th>
                    <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[13px]">Posted On</th>
                    <th className="px-4 py-3 text-left font-['Poppins',sans-serif] font-semibold text-[13px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {adjustments.map((adj, idx) => (
                    <tr key={adj.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600 font-['Poppins',sans-serif]">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] text-[13px]">{adj.id}</td>
                      <td className="px-4 py-3 text-gray-800 font-['Poppins',sans-serif]">{adj.rrNumber || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold font-['Poppins',sans-serif] ${
                          adj.adjustmentType === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {adj.adjustmentType === 'credit' ? 'Credit' : 'Debit'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-['Poppins',sans-serif] text-[13px] capitalize">{adj.adjustmentCategory || 'N/A'}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800 font-['Poppins',sans-serif]">{'\u20B9'} {adj.adjustmentAmount || 0}</td>
                      <td className="px-4 py-3 text-gray-700 font-['Poppins',sans-serif] text-[13px]">{adj.adjustmentMonth || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-700 font-['Poppins',sans-serif] text-[13px]">{adj.reasonLabel || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-600 font-['Poppins',sans-serif] text-[13px]">{formatDate(adj.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold font-['Poppins',sans-serif] bg-green-100 text-green-800 border border-green-200">
                          <Lock className="w-3 h-3" /> Posted & Locked
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ FINAL CONFIRM POPUP ═══ */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 backdrop-blur-[2px] bg-[rgba(0,0,0,0.4)]" onClick={() => setShowConfirm(false)} />
          <div className="relative z-10 bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,120,160,0.15)] w-[500px] px-[24px] py-[32px] flex flex-col gap-[20px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#170f49] font-['Poppins',sans-serif]">Final Confirmation</h3>
            </div>
            <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">
              You are about to post a <strong>{adjustmentType === 'credit' ? 'Credit' : 'Debit'}</strong> adjustment of <strong>{'\u20B9'} {adjustmentAmount}</strong> for <strong>RR {rrNumber}</strong> in <strong>{getMonthLabel(adjustmentMonth)}</strong>.
            </p>
            <div className="text-[13px] text-gray-600 font-['Poppins',sans-serif] space-y-1">
              <p>This will:</p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>Post the adjustment to the future billing cycle</li>
                <li>Recalculate running DCB</li>
                <li>Reflect in the next bill for this consumer</li>
                <li>Keep the historical paid bill unchanged</li>
                <li>Lock the adjustment entry</li>
                <li>Notify Commissioner and billing team</li>
              </ul>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} disabled={processing} className="px-6 py-2.5 rounded-[24px] border-[1.5px] border-gray-300 text-gray-700 font-['Poppins',sans-serif] font-medium text-sm hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={handleSubmit} disabled={processing} className="px-6 py-2.5 rounded-[24px] bg-[#1f3a5f] text-white font-['Poppins',sans-serif] font-medium text-sm hover:bg-[#1f3a5f]/90 disabled:opacity-50 flex items-center gap-2">
                {processing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Confirm & Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
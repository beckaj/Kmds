import { useState } from 'react';
import { Search, Edit3, X, Save, AlertTriangle, CheckCircle, Info, FileText } from 'lucide-react';
import { GovInput } from '../ui/gov-input';
import { GovSelect } from '../ui/gov-select';
import { GovButton } from '../ui/gov-button';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

// ── District / ULB Data ──────────────────────────────────────────────────────
const KARNATAKA_DISTRICTS = [
  { value: '__none__', label: '-- Select District --' },
  { value: 'bangalore-rural', label: 'Bangalore Rural' },
  { value: 'dakshina-kannada', label: 'Dakshina Kannada' },
  { value: 'dharwad', label: 'Dharwad' },
  { value: 'tumakuru', label: 'Tumakuru' },
];

const DISTRICT_ULB_DATA: Record<string, { value: string; label: string }[]> = {
  dharwad: [
    { value: 'hubballi-dharwad', label: 'Hubballi-Dharwad' },
    { value: 'annigeri', label: 'Annigeri' },
    { value: 'navalgund', label: 'Navalgund' },
    { value: 'alnavar', label: 'Alnavar' },
    { value: 'kalghatgi', label: 'Kalghatgi' },
    { value: 'kundgol', label: 'Kundgol' },
  ],
  'dakshina-kannada': [
    { value: 'mangaluru', label: 'Mangaluru' },
    { value: 'ullal', label: 'Ullal' },
    { value: 'puttur', label: 'Puttur' },
    { value: 'moodabidri', label: 'Moodabidri' },
    { value: 'bantwal', label: 'Bantwal' },
  ],
  'bangalore-rural': [
    { value: 'nelamangala', label: 'Nelamangala' },
    { value: 'devanahalli', label: 'Devanahalli' },
    { value: 'doddaballapura', label: 'Doddaballapura' },
    { value: 'hosakote', label: 'Hosakote' },
  ],
  tumakuru: [
    { value: 'tumakuru-city', label: 'Tumakuru' },
    { value: 'tiptur', label: 'Tiptur' },
    { value: 'madhugiri', label: 'Madhugiri' },
    { value: 'sira', label: 'Sira' },
    { value: 'kunigal', label: 'Kunigal' },
  ],
};

const CORRECTION_REASONS = [
  { value: '__none__', label: '-- Select Reason --' },
  { value: 'wrong_meter_reading', label: 'Wrong Meter Reading' },
  { value: 'duplicate_bill', label: 'Duplicate Bill' },
  { value: 'incorrect_tariff', label: 'Incorrect Tariff Applied' },
  { value: 'meter_defective', label: 'Meter Defective' },
  { value: 'billing_error', label: 'Billing Error' },
  { value: 'connection_type_mismatch', label: 'Connection Type Mismatch' },
  { value: 'arrears_dispute', label: 'Arrears Dispute' },
  { value: 'paid_bill_correction', label: 'Paid Bill Correction (Refund/Credit)' },
  { value: 'historical_bill_error', label: 'Historical Bill Error' },
  { value: 'court_order', label: 'Court Order / Legal Directive' },
  { value: 'other', label: 'Other' },
];

interface DCBData {
  district: string;
  ulb: string;
  ulbType: string;
  connectionType: string;
  meterCategory: string;
  meterStatus: string;
  meterInstalledDate: string;
  meterNumber: string;
  previousReading: string;
  currentReading: string;
  billGeneratedDate: string;
  billNumber: string;
  arrears: number;
  principleAmount: number;
  interest: number;
  interestAmount: number;
  penalty: number;
  totalAmount: number;
  applicantName: string;
  applicationNo: string;
  ward: string;
  paymentStatus: string;
}

export default function ULBAdminDCBCorrection() {
  // ── Search Fields ──
  const [district, setDistrict] = useState('');
  const [ulb, setUlb] = useState('');
  const [rrNumber, setRRNumber] = useState('');

  // ── Fetch State ──
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [dcbData, setDcbData] = useState<DCBData | null>(null);
  const [ineligibilityReason, setIneligibilityReason] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState('');

  // ── Edit Mode ──
  const [isEditing, setIsEditing] = useState(false);
  const [editCurrentReading, setEditCurrentReading] = useState('');
  const [editArrears, setEditArrears] = useState('');
  const [editPrincipleAmount, setEditPrincipleAmount] = useState('');
  const [editPenalty, setEditPenalty] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');

  // ── Save State ──
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedAppId, setSavedAppId] = useState('');

  // ── Handlers ──
  const handleDistrictChange = (value: string) => {
    setDistrict(value);
    setUlb('');
    resetFetchState();
  };

  const handleUlbChange = (value: string) => {
    setUlb(value);
    resetFetchState();
  };

  const resetFetchState = () => {
    setFetched(false);
    setDcbData(null);
    setFetchError('');
    setIsEditing(false);
    setSaveSuccess(false);
    setSavedAppId('');
    setIneligibilityReason(null);
  };

  const handleFetchDetails = async () => {
    if (!district || district === '__none__') {
      setFetchError('Please select a District.');
      return;
    }
    if (!ulb || ulb === '__none__') {
      setFetchError('Please select a ULB.');
      return;
    }
    if (!rrNumber.trim()) {
      setFetchError('Please enter an RR Number.');
      return;
    }

    setFetching(true);
    setFetchError('');
    setFetched(false);
    setDcbData(null);
    setSaveSuccess(false);
    setSavedAppId('');

    try {
      const districtLabel = KARNATAKA_DISTRICTS.find(d => d.value === district);
      const ulbList = DISTRICT_ULB_DATA[district] || [];
      const ulbLabel = ulbList.find(u => u.value === ulb);

      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/dcb/ulb-admin/fetch-rr',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + publicAnonKey,
          },
          body: JSON.stringify({
            rrNumber: rrNumber.trim(),
            district: districtLabel ? districtLabel.label : district,
            ulb: ulbLabel ? ulbLabel.label : ulb,
          }),
        }
      );

      const data = await response.json();
      if (data && data.success && data.dcbData) {
        setDcbData(data.dcbData);
        setIneligibilityReason(data.ineligibilityReason || null);
        setFetched(true);
        // Pre-populate edit fields with current values
        setEditCurrentReading(data.dcbData.currentReading || '');
        setEditArrears(String(data.dcbData.arrears || 0));
        setEditPrincipleAmount(String(data.dcbData.principleAmount || 0));
        setEditPenalty(String(data.dcbData.penalty || 0));
        setEffectiveDate('');
        setCorrectionReason('');
        setAdminRemarks('');
      } else {
        setFetchError(data && data.error ? data.error : 'Failed to fetch DCB details.');
      }
    } catch (err) {
      console.error('[ULB DCB CORR] Fetch error:', err);
      setFetchError('Network error. Please try again.');
    } finally {
      setFetching(false);
    }
  };

  const handleEdit = () => {
    if (!dcbData) return;
    setIsEditing(true);
    // Reset edit fields to current values
    setEditCurrentReading(dcbData.currentReading || '');
    setEditArrears(String(dcbData.arrears || 0));
    setEditPrincipleAmount(String(dcbData.principleAmount || 0));
    setEditPenalty(String(dcbData.penalty || 0));
    setEffectiveDate('');
    setCorrectionReason('');
    setAdminRemarks('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!dcbData) return;

    // Client-side validation
    if (!effectiveDate) {
      alert('Please select an Effective Date.');
      return;
    }
    if (!correctionReason || correctionReason === '__none__') {
      alert('Please select a Correction Reason.');
      return;
    }

    // Check at least one field was changed
    const origCR = dcbData.currentReading || '';
    const origArr = String(dcbData.arrears || 0);
    const origPrin = String(dcbData.principleAmount || 0);
    const origPen = String(dcbData.penalty || 0);

    const changed = (
      editCurrentReading !== origCR ||
      editArrears !== origArr ||
      editPrincipleAmount !== origPrin ||
      editPenalty !== origPen
    );

    if (!changed) {
      alert('No changes detected. Please modify at least one field before saving.');
      return;
    }

    // Validate corrected reading >= previous reading
    const prevReading = parseFloat(String(dcbData.previousReading || '0').replace(/[^0-9.]/g, ''));
    const corrReading = parseFloat(String(editCurrentReading).replace(/[^0-9.]/g, ''));
    if (!isNaN(corrReading) && !isNaN(prevReading) && corrReading < prevReading) {
      alert('Corrected meter reading (' + corrReading + ') cannot be less than the previous reading (' + prevReading + ').');
      return;
    }

    setSaving(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const adminName = userData && userData.name ? userData.name : 'ULB Admin';
      const adminId = userData && userData.id ? userData.id : 'ULB001';

      const districtLabel = KARNATAKA_DISTRICTS.find(d => d.value === district);
      const ulbList = DISTRICT_ULB_DATA[district] || [];
      const ulbLabel = ulbList.find(u => u.value === ulb);

      const reasonEntry = CORRECTION_REASONS.find(r => r.value === correctionReason);

      const payload = {
        rrNumber: rrNumber.trim(),
        district: districtLabel ? districtLabel.label : district,
        ulb: ulbLabel ? ulbLabel.label : ulb,
        originalData: dcbData,
        correctedData: {
          currentReading: editCurrentReading,
          arrears: parseFloat(editArrears) || 0,
          principleAmount: parseFloat(editPrincipleAmount) || 0,
          penalty: parseFloat(editPenalty) || 0,
        },
        effectiveDate,
        correctionReason,
        correctionReasonLabel: reasonEntry ? reasonEntry.label : correctionReason,
        ineligibilityReason,
        adminRemarks: adminRemarks.trim(),
        adminName,
        adminId,
      };

      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/dcb/ulb-admin/correction',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + publicAnonKey,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (result && result.success) {
        setSaveSuccess(true);
        setSavedAppId(result.applicationId || '');
        setIsEditing(false);
        alert(
          'DCB Correction saved successfully!\n\n' +
          'Application ID: ' + (result.applicationId || 'N/A') + '\n' +
          'Recalculated Total: Rs. ' + (result.recalculatedTotal || 'N/A') + '\n\n' +
          'The correction has been applied directly. Bill has been regenerated and locked.'
        );
      } else {
        alert('Error: ' + (result && result.error ? result.error : 'Unknown error'));
      }
    } catch (err) {
      console.error('[ULB DCB CORR] Save error:', err);
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const ulbOptions = district && district !== '__none__'
    ? [{ value: '__none__', label: '-- Select ULB --' }, ...(DISTRICT_ULB_DATA[district] || [])]
    : [{ value: '__none__', label: '-- Select District First --' }];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
          DCB Correction
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
          Correct DCB entries for paid bills or bills older than the previous month
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#1f3a5f] mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-[#1f3a5f] font-['Poppins',sans-serif] font-medium">
            ULB-Level Correction Authority
          </p>
          <p className="text-xs text-gray-600 font-['Poppins',sans-serif] mt-1">
            This module handles DCB corrections that cannot be processed at the Caseworker level — specifically for <strong>already-paid bills</strong> or <strong>bills older than the previous month</strong>. Corrections are applied directly with full audit trail.
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
          Search Consumer
        </h2>
        <div className="grid grid-cols-4 gap-6 items-end">
          <GovSelect
            label="District"
            required
            placeholder="-- Select District --"
            options={KARNATAKA_DISTRICTS}
            value={district}
            onValueChange={handleDistrictChange}
          />
          <GovSelect
            label="ULB"
            required
            placeholder="-- Select ULB --"
            options={ulbOptions}
            value={ulb}
            onValueChange={handleUlbChange}
            disabled={!district || district === '__none__'}
          />
          <GovInput
            label="RR Number"
            required
            placeholder="Enter RR Number"
            value={rrNumber}
            onChange={(e) => { setRRNumber(e.target.value); if (fetched) resetFetchState(); }}
          />
          <div className="pb-[2px]">
            <GovButton
              onClick={handleFetchDetails}
              disabled={fetching}
              className="w-full"
            >
              <div className="flex items-center justify-center gap-2">
                {fetching ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {fetching ? 'Fetching...' : 'Fetch Details'}
              </div>
            </GovButton>
          </div>
        </div>

        {fetchError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 font-['Poppins',sans-serif]">{fetchError}</p>
          </div>
        )}
      </div>

      {/* Success Banner */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-emerald-800 font-['Poppins',sans-serif] font-semibold">
              DCB Correction Applied Successfully
            </p>
            <p className="text-xs text-emerald-700 font-['Poppins',sans-serif] mt-1">
              Application ID: <strong>{savedAppId}</strong>. The bill has been recalculated, regenerated, and locked.
            </p>
          </div>
        </div>
      )}

      {/* Fetched Details */}
      {fetched && dcbData && (
        <>
          {/* Ineligibility Reason Banner */}
          {ineligibilityReason && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-amber-800 font-['Poppins',sans-serif] font-semibold">
                  {ineligibilityReason === 'bill_already_paid'
                    ? 'This bill has already been paid'
                    : ineligibilityReason === 'bill_outside_correction_window'
                      ? 'This bill is older than the previous month'
                      : 'This bill requires ULB-level correction authority'}
                </p>
                <p className="text-xs text-amber-700 font-['Poppins',sans-serif] mt-1">
                  {ineligibilityReason === 'bill_already_paid'
                    ? 'Payment Status: ' + (dcbData.paymentStatus || 'Paid') + '. This correction cannot be handled at the Caseworker level. As ULB Admin, you have elevated authority to process this correction.'
                    : ineligibilityReason === 'bill_outside_correction_window'
                      ? 'Bill Generated Date: ' + (dcbData.billGeneratedDate || 'N/A') + '. This bill falls outside the current/previous month correction window. As ULB Admin, you have elevated authority to process this correction.'
                      : 'This bill requires ULB Admin authority for correction.'}
                </p>
              </div>
            </div>
          )}

          {/* Connection Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Connection Details
            </h2>
            <div className="grid grid-cols-4 gap-6 mb-4">
              <GovInput label="District" value={dcbData.district || 'N/A'} disabled onChange={() => {}} />
              <GovInput label="ULB" value={dcbData.ulb || 'N/A'} disabled onChange={() => {}} />
              <GovInput label="ULB Type" value={dcbData.ulbType || 'N/A'} disabled onChange={() => {}} />
              <GovInput label="RR Number" value={rrNumber} disabled onChange={() => {}} />
            </div>
            <div className="grid grid-cols-4 gap-6 mb-4">
              <GovInput label="Connection Type" value={dcbData.connectionType || 'N/A'} disabled onChange={() => {}} />
              <GovInput label="Meter Category" value={dcbData.meterCategory || 'N/A'} disabled onChange={() => {}} />
              <GovInput label="Meter Status" value={dcbData.meterStatus || 'N/A'} disabled onChange={() => {}} />
              <GovInput label="Meter Installed Date" value={dcbData.meterInstalledDate || 'N/A'} disabled onChange={() => {}} />
            </div>
            <div className="grid grid-cols-4 gap-6">
              <GovInput label="Consumer Name" value={dcbData.applicantName || 'N/A'} disabled onChange={() => {}} />
              <GovInput label="Application No" value={dcbData.applicationNo || 'N/A'} disabled onChange={() => {}} />
              <GovInput label="Ward" value={dcbData.ward || 'N/A'} disabled onChange={() => {}} />
              <GovInput
                label="Payment Status"
                value={dcbData.paymentStatus || 'N/A'}
                disabled
                onChange={() => {}}
              />
            </div>
          </div>

          {/* DCB Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              DCB Details
            </h2>
            {/* Row 1: Readings + Bill Info */}
            <div className="grid grid-cols-4 gap-6 mb-4">
              <GovInput label="Previous Reading" value={dcbData.previousReading || 'N/A'} disabled onChange={() => {}} />
              {isEditing ? (
                <GovInput
                  label="Current Reading"
                  required
                  value={editCurrentReading}
                  onChange={(e) => setEditCurrentReading(e.target.value)}
                  placeholder="Enter corrected reading"
                />
              ) : (
                <GovInput label="Current Reading" value={dcbData.currentReading || 'N/A'} disabled onChange={() => {}} />
              )}
              <GovInput label="Bill Generated Date" value={dcbData.billGeneratedDate || 'N/A'} disabled onChange={() => {}} />
              <GovInput label="Bill Number" value={dcbData.billNumber || 'N/A'} disabled onChange={() => {}} />
            </div>

            {/* Row 2: Financial Fields */}
            <div className="grid grid-cols-4 gap-6 mb-4">
              {isEditing ? (
                <GovInput
                  label="Arrears (Rs)"
                  required
                  value={editArrears}
                  onChange={(e) => setEditArrears(e.target.value)}
                  placeholder="Enter corrected arrears"
                />
              ) : (
                <GovInput label="Arrears (Rs)" value={'\u20B9 ' + (dcbData.arrears || 0)} disabled onChange={() => {}} />
              )}
              {isEditing ? (
                <GovInput
                  label="Principle Amount (Rs)"
                  required
                  value={editPrincipleAmount}
                  onChange={(e) => setEditPrincipleAmount(e.target.value)}
                  placeholder="Enter corrected amount"
                />
              ) : (
                <GovInput label="Principle Amount (Rs)" value={'\u20B9 ' + (dcbData.principleAmount || 0)} disabled onChange={() => {}} />
              )}
              <GovInput label="Interest (%)" value={(dcbData.interest || 0) + '%'} disabled onChange={() => {}} />
              {isEditing ? (
                <GovInput
                  label="Penalty (Rs)"
                  required
                  value={editPenalty}
                  onChange={(e) => setEditPenalty(e.target.value)}
                  placeholder="Enter corrected penalty"
                />
              ) : (
                <GovInput label="Penalty (Rs)" value={'\u20B9 ' + (dcbData.penalty || 0)} disabled onChange={() => {}} />
              )}
            </div>

            {/* Row 3: Total + Interest Amount */}
            <div className="grid grid-cols-4 gap-6 mb-4">
              <GovInput label="Interest Amount (Rs)" value={'\u20B9 ' + (dcbData.interestAmount || 0)} disabled onChange={() => {}} />
              <GovInput label="Total Amount (Rs)" value={'\u20B9 ' + (dcbData.totalAmount || 0)} disabled onChange={() => {}} />
            </div>

            {/* Row 4: Edit-mode only fields */}
            {isEditing && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Correction Details
                </h3>
                <div className="grid grid-cols-3 gap-6 mb-4">
                  <div className="w-full">
                    <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                      Effective Date<span className="text-red-600 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="w-full px-4 py-2.5 font-['Poppins',sans-serif] text-[14px] text-gray-900 bg-white border-[1.5px] border-gray-300 rounded-md placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] hover:border-gray-400 appearance-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100"
                    />
                  </div>
                  <GovSelect
                    label="Correction Reason"
                    required
                    placeholder="-- Select Reason --"
                    options={CORRECTION_REASONS}
                    value={correctionReason}
                    onValueChange={setCorrectionReason}
                  />
                  <GovInput
                    label="Admin Remarks"
                    placeholder="Optional remarks..."
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!saveSuccess && (
            <div className="flex justify-end gap-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-['Poppins',sans-serif] font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 rounded-lg bg-[#1f3a5f] text-white font-['Poppins',sans-serif] font-semibold text-sm hover:bg-[#2d4a6f] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Correction'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={resetFetchState}
                    className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-['Poppins',sans-serif] font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleEdit}
                    className="px-6 py-3 rounded-lg bg-[#1f3a5f] text-white font-['Poppins',sans-serif] font-semibold text-sm hover:bg-[#2d4a6f] transition-colors flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
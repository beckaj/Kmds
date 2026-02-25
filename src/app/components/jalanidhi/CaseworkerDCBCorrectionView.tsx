import { useState } from 'react';
import { Search, Edit3, X, Send, FileText, Upload, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { GovInput } from '../ui/gov-input';
import { GovButton } from '../ui/gov-button';
import { GovSelect } from '../ui/gov-select';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface DCBData {
  // Location
  district: string;
  ulb: string;
  ulbType: string;
  // Connection Details
  connectionType: string;
  meterCategory: string;
  meterStatus: string;
  meterInstalledDate: string;
  // DCB Details
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
}

const CORRECTION_REASONS = [
  { value: '__none__', label: '-- Select Reason --' },
  { value: 'wrong_meter_reading', label: 'Wrong Meter Reading' },
  { value: 'duplicate_bill', label: 'Duplicate Bill' },
  { value: 'incorrect_tariff', label: 'Incorrect Tariff Applied' },
  { value: 'meter_defective', label: 'Meter Defective' },
  { value: 'billing_error', label: 'Billing Error' },
  { value: 'connection_type_mismatch', label: 'Connection Type Mismatch' },
  { value: 'arrears_dispute', label: 'Arrears Dispute' },
  { value: 'other', label: 'Other' },
];

export default function CaseworkerDCBCorrectionView() {
  const [rrNumber, setRRNumber] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [dcbData, setDcbData] = useState<DCBData | null>(null);
  const [fetchError, setFetchError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [forwarded, setForwarded] = useState(false);

  // Editable fields
  const [editCurrentReading, setEditCurrentReading] = useState('');
  const [editArrears, setEditArrears] = useState('');
  const [editPrincipleAmount, setEditPrincipleAmount] = useState('');
  const [editPenalty, setEditPenalty] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [supportingDocName, setSupportingDocName] = useState('');
  const [caseworkerRemarks, setCaseworkerRemarks] = useState('');

  const handleFetchRR = async () => {
    if (!rrNumber.trim()) {
      setFetchError('Please enter an RR Number');
      return;
    }
    setFetching(true);
    setFetchError('');
    setFetched(false);
    setDcbData(null);
    setIsEditing(false);
    setForwarded(false);

    try {
      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/dcb/fetch-rr',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + publicAnonKey,
          },
          body: JSON.stringify({ rrNumber: rrNumber.trim() }),
        }
      );
      const result = await response.json();
      if (result.success && result.dcbData) {
        setDcbData(result.dcbData);
        setFetched(true);
        // Pre-populate edit fields
        setEditCurrentReading(result.dcbData.currentReading || '');
        setEditArrears(String(result.dcbData.arrears || 0));
        setEditPrincipleAmount(String(result.dcbData.principleAmount || 0));
        setEditPenalty(String(result.dcbData.penalty || 0));
        setEffectiveDate('');
        setCorrectionReason('');
        setSupportingDocName('');
        setCaseworkerRemarks('');
      } else {
        setFetchError(result.error || 'Failed to fetch RR details');
      }
    } catch (err) {
      console.error('[DCB CORRECTION] Error fetching RR:', err);
      setFetchError('Network error. Please try again.');
    } finally {
      setFetching(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (isEditing) {
      // Reset edit fields to original values
      if (dcbData) {
        setEditCurrentReading(dcbData.currentReading || '');
        setEditArrears(String(dcbData.arrears || 0));
        setEditPrincipleAmount(String(dcbData.principleAmount || 0));
        setEditPenalty(String(dcbData.penalty || 0));
      }
      setEffectiveDate('');
      setCorrectionReason('');
      setSupportingDocName('');
      setCaseworkerRemarks('');
      setIsEditing(false);
    } else {
      // Cancel the entire fetch
      setFetched(false);
      setDcbData(null);
      setRRNumber('');
    }
  };

  const calculateEditedTotal = (): number => {
    const arr = parseFloat(editArrears) || 0;
    const prin = parseFloat(editPrincipleAmount) || 0;
    const pen = parseFloat(editPenalty) || 0;
    const interestAmt = dcbData ? dcbData.interestAmount : 0;
    return arr + prin + pen + interestAmt;
  };

  const handleFileUpload = () => {
    // Simulate file upload since we can't use actual file APIs in this env
    const fileName = prompt('Enter supporting document file name (e.g., meter_photo.pdf):');
    if (fileName && fileName.trim()) {
      setSupportingDocName(fileName.trim());
    }
  };

  const handleForward = async () => {
    if (!correctionReason || correctionReason === '__none__') {
      alert('Please select a Correction Reason before forwarding.');
      return;
    }
    if (!effectiveDate) {
      alert('Please select an Effective Date before forwarding.');
      return;
    }
    if (!confirm('Are you sure you want to forward this DCB correction to the Revenue Officer?')) {
      return;
    }

    setProcessing(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const caseworkerName = userData && userData.name ? userData.name : 'Caseworker';
      const caseworkerId = userData && userData.id ? userData.id : 'CW001';

      const correctionData = {
        rrNumber: rrNumber.trim(),
        originalData: dcbData,
        correctedData: {
          currentReading: editCurrentReading,
          arrears: parseFloat(editArrears) || 0,
          principleAmount: parseFloat(editPrincipleAmount) || 0,
          penalty: parseFloat(editPenalty) || 0,
          totalAmount: calculateEditedTotal(),
        },
        effectiveDate,
        correctionReason,
        correctionReasonLabel: CORRECTION_REASONS.find(r => r.value === correctionReason)
          ? (CORRECTION_REASONS.find(r => r.value === correctionReason) as any).label
          : correctionReason,
        supportingDocument: supportingDocName || null,
        caseworkerRemarks: caseworkerRemarks.trim() || '',
        caseworkerName,
        caseworkerId,
      };

      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/dcb/forward-to-ro',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + publicAnonKey,
          },
          body: JSON.stringify(correctionData),
        }
      );

      const result = await response.json();
      if (result.success) {
        setForwarded(true);
        alert('DCB Correction forwarded to Revenue Officer successfully!');
      } else {
        console.error('[DCB CORRECTION] Forward error:', result.error);
        alert('Failed to forward: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('[DCB CORRECTION] Error forwarding:', err);
      alert('Network error while forwarding. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleNewCorrection = () => {
    setRRNumber('');
    setFetched(false);
    setDcbData(null);
    setIsEditing(false);
    setForwarded(false);
    setFetchError('');
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
          DCB Correction
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
          Demand Collection Balance correction - Search by RR Number, review and forward corrections to Revenue Officer
        </p>
      </div>

      {/* Success Banner */}
      {forwarded && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-green-800 font-semibold font-['Poppins',sans-serif] text-sm">
              DCB Correction forwarded to Revenue Officer successfully!
            </p>
            <p className="text-green-700 font-['Poppins',sans-serif] text-xs mt-0.5">
              RR Number: {rrNumber}
            </p>
          </div>
          <GovButton variant="outline" size="sm" onClick={handleNewCorrection}>
            New Correction
          </GovButton>
        </div>
      )}

      {/* Section 1: RR Number Fetch */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Search by RR Number
        </h2>
        <div className="grid grid-cols-3 gap-6 items-end">
          <div className="col-span-1">
            <GovInput
              label="RR Number"
              required
              placeholder="Enter RR Number (e.g., HUB-DHAR123456)"
              value={rrNumber}
              onChange={(e) => setRRNumber(e.target.value)}
              disabled={fetched || fetching}
            />
          </div>
          <div className="col-span-1">
            <GovButton
              variant="success"
              onClick={handleFetchRR}
              disabled={fetching || fetched || !rrNumber.trim()}
              loading={fetching}
            >
              <Search className="w-4 h-4" />
              Fetch
            </GovButton>
          </div>
          {fetched && (
            <div className="col-span-1 flex justify-end">
              <GovButton variant="outline" size="sm" onClick={handleNewCorrection}>
                <ArrowLeft className="w-4 h-4" />
                Search Another
              </GovButton>
            </div>
          )}
        </div>
        {fetchError && (
          <p className="mt-3 text-red-600 text-sm font-['Poppins',sans-serif]">{fetchError}</p>
        )}
      </div>

      {/* Section 2: Location & Connection Details (Read-Only) */}
      {fetched && dcbData && (
        <>
          <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Location Details
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <GovInput label="District" value={dcbData.district} disabled />
              <GovInput label="ULB" value={dcbData.ulb} disabled />
              <GovInput label="ULB Type" value={dcbData.ulbType} disabled />
              <GovInput label="RR Number" value={rrNumber} disabled />
            </div>
          </div>

          {/* Section 3: Connection Details */}
          <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5">
              Connection Details:
            </h2>
            <div className="grid grid-cols-4 gap-6">
              <GovInput label="Connection Type" value={dcbData.connectionType} disabled />
              <GovInput label="Meter Category" value={dcbData.meterCategory} disabled />
              <GovInput label="Meter Status" value={dcbData.meterStatus} disabled />
              <GovInput label="Meter Installed Date" value={dcbData.meterInstalledDate} disabled />
            </div>
          </div>

          {/* Section 4: DCB Details */}
          <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5">
              DCB Details:
            </h2>

            {!isEditing ? (
              /* ── Read-Only View ── */
              <>
                <div className="grid grid-cols-3 gap-6 mb-4">
                  <GovInput label="Previous Reading" value={dcbData.previousReading} disabled />
                  <GovInput label="Current Reading" value={dcbData.currentReading} disabled />
                  <GovInput label="Bill Generated Date" value={dcbData.billGeneratedDate} disabled />
                </div>
                <div className="grid grid-cols-3 gap-6 mb-4">
                  <GovInput label="Bill Number" value={dcbData.billNumber} disabled />
                  <GovInput label="Arrears (In Rs)" value={String(dcbData.arrears)} disabled />
                  <GovInput label="Principle Amount (in Rs)" value={String(dcbData.principleAmount)} disabled />
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <GovInput label="Interest (in %)" value={dcbData.interest + '%'} disabled />
                  <GovInput label="Interest Amount (in Rs)" value={String(dcbData.interestAmount)} disabled />
                  <GovInput label="Penalty (in Rs)" value={String(dcbData.penalty)} disabled />
                </div>
                <div className="grid grid-cols-3 gap-6 mt-4">
                  <GovInput label="Total Amount (in Rs)" value={String(dcbData.totalAmount)} disabled />
                </div>
              </>
            ) : (
              /* ── Edit View ── */
              <>
                <div className="grid grid-cols-3 gap-6 mb-4">
                  <GovInput label="Previous Reading" value={dcbData.previousReading} disabled />
                  <GovInput
                    label="Current Reading"
                    required
                    value={editCurrentReading}
                    onChange={(e) => setEditCurrentReading(e.target.value)}
                  />
                  <GovInput label="Bill Generated Date" value={dcbData.billGeneratedDate} disabled />
                </div>
                <div className="grid grid-cols-3 gap-6 mb-4">
                  <GovInput label="Bill Number" value={dcbData.billNumber} disabled />
                  <GovInput
                    label="Arrears (In Rs)"
                    required
                    type="number"
                    value={editArrears}
                    onChange={(e) => setEditArrears(e.target.value)}
                  />
                  <GovInput
                    label="Principle Amount (in Rs)"
                    required
                    type="number"
                    value={editPrincipleAmount}
                    onChange={(e) => setEditPrincipleAmount(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-6 mb-4">
                  <GovInput label="Interest (in %)" value={dcbData.interest + '%'} disabled />
                  <GovInput
                    label="Penalty (in Rs)"
                    required
                    type="number"
                    value={editPenalty}
                    onChange={(e) => setEditPenalty(e.target.value)}
                  />
                  <GovInput
                    label="Total Amount (in Rs)"
                    value={String(calculateEditedTotal())}
                    disabled
                  />
                </div>
                <div className="grid grid-cols-3 gap-6 mb-4">
                  <GovInput
                    label="Effective Date"
                    required
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                  />
                  <GovSelect
                    label="Correction Reason"
                    required
                    placeholder="-- Select Reason --"
                    options={CORRECTION_REASONS}
                    value={correctionReason}
                    onValueChange={setCorrectionReason}
                  />
                  <div className="w-full">
                    <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                      Supporting Doc
                    </label>
                    <button
                      onClick={handleFileUpload}
                      className="h-10 px-4 bg-[#1f3a5f] text-white text-sm font-['Poppins',sans-serif] font-medium rounded-md hover:bg-[#2d4a6f] transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Document
                    </button>
                    {supportingDocName && (
                      <p className="mt-1 text-xs text-green-700 font-['Poppins',sans-serif]">
                        Uploaded: {supportingDocName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="w-full">
                    <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                      Caseworker Remarks
                    </label>
                    <textarea
                      className="w-full h-20 px-3 py-2 text-sm border border-gray-300 rounded-md font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/30 focus:border-[#1f3a5f]"
                      placeholder="Enter remarks for the correction (optional)"
                      value={caseworkerRemarks}
                      onChange={(e) => setCaseworkerRemarks(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          {!forwarded && (
            <div className="flex justify-end gap-4">
              {!isEditing ? (
                <>
                  <GovButton variant="primary" onClick={handleEdit}>
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </GovButton>
                  <GovButton variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4" />
                    Cancel
                  </GovButton>
                </>
              ) : (
                <>
                  <GovButton
                    variant="success"
                    onClick={handleForward}
                    disabled={processing}
                    loading={processing}
                  >
                    <Send className="w-4 h-4" />
                    Forward
                  </GovButton>
                  <GovButton variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4" />
                    Cancel
                  </GovButton>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

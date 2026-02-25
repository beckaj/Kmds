import { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle2,
  Save,
  ClipboardCheck,
  Square,
  CheckSquare,
  Calculator,
  AlertTriangle
} from 'lucide-react';

interface EstimationRow {
  id: string;
  attribute: string;
  measurement: string;
  price: number;
}

interface FieldVisitReportProps {
  applicationNo: string;
  engineerData: { mobile: string; name: string; id: string };
  checklistData: {
    verifiedLatitude: number;
    verifiedLongitude: number;
    locationVerified: boolean;
    photos: string[];
    documents: File[];
    siteNotes: string;
  };
  plumberEstimation: {
    rows: EstimationRow[];
    totalAmount: number;
    comments?: string;
  };
  onBack: () => void;
  onSubmit: (remarks: string, inspectionChecklist?: { id: string; label: string; checked: boolean }[], feEstimation?: { rows: EstimationRow[]; totalAmount: number }, unauthorizedTap?: { found: boolean; penaltyAmount: number }) => void;
}

export default function FieldVisitReport({
  applicationNo,
  engineerData,
  checklistData,
  plumberEstimation,
  onBack,
  onSubmit,
}: FieldVisitReportProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field Engineer's editable estimation - pre-populated with same rows as plumber but editable
  const [feEstimationRows, setFeEstimationRows] = useState<EstimationRow[]>(
    plumberEstimation.rows.map(row => ({
      id: row.id,
      attribute: row.attribute,
      measurement: row.measurement,
      price: row.price,
    }))
  );

  const feTotal = feEstimationRows.reduce((sum, row) => sum + row.price, 0);

  const updateFeRow = (id: string, field: 'measurement' | 'price', value: string) => {
    setFeEstimationRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      if (field === 'price') {
        const numValue = parseFloat(value) || 0;
        return { ...row, price: numValue };
      }
      return { ...row, [field]: value };
    }));
  };

  const INSPECTION_CHECKLIST = [
    { id: 'chk1', label: 'Water supply pipeline condition inspected' },
    { id: 'chk2', label: 'Meter installation point verified' },
    { id: 'chk3', label: 'No unauthorized tapping or illegal connections found' },
    { id: 'chk4', label: 'Road/pathway restoration requirement assessed' },
    { id: 'chk5', label: 'Drainage and sewage proximity checked' },
    { id: 'chk6', label: 'Property boundary and access point confirmed' },
    { id: 'chk7', label: 'Existing plumbing infrastructure reviewed' },
    { id: 'chk8', label: 'Water pressure at nearest distribution point tested' },
    { id: 'chk9', label: 'Environmental and safety hazards assessed' },
    { id: 'chk10', label: 'Plumber\'s cost estimation reviewed and found reasonable' },
  ];

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // ── Unauthorized Tap Connection state ──
  const [unauthorizedTap, setUnauthorizedTap] = useState<'no' | 'yes'>('no');
  const [penaltyAmount, setPenaltyAmount] = useState<string>('');
  const [penaltyError, setPenaltyError] = useState<string>('');

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  const handleSubmit = () => {
    // Validate: if unauthorized tap = yes, penalty amount is required
    if (unauthorizedTap === 'yes') {
      const amt = parseFloat(penaltyAmount);
      if (!penaltyAmount || isNaN(amt) || amt <= 0) {
        setPenaltyError('Please enter a valid penalty amount greater than ₹0');
        return;
      }
    }

    setIsSubmitting(true);
    
    // Build inspection checklist data to pass to parent
    const checklistResults = INSPECTION_CHECKLIST.map(item => ({
      id: item.id,
      label: item.label,
      checked: !!checkedItems[item.id],
    }));

    setTimeout(() => {
      onSubmit(
        '',
        checklistResults,
        { rows: feEstimationRows, totalAmount: feTotal },
        { found: unauthorizedTap === 'yes', penaltyAmount: parseFloat(penaltyAmount) || 0 }
      );
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Status Bar */}
      <div className="h-[28px] flex items-center justify-between px-4 pt-2 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-black/50"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-black/50"></div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <svg width="16" height="12" viewBox="0 0 24 24" fill="black">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
          </svg>
          <div className="w-4 h-2 border border-black rounded-sm relative">
            <div className="absolute left-0 top-0 w-3/4 h-full bg-black rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-[#1f3a5f] px-5 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-[16px] font-semibold font-['Poppins',sans-serif]">
              Field Visit Report
            </h1>
            <p className="text-white/80 text-[10px] font-['Poppins',sans-serif]">
              Application: {applicationNo}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-24">
        
        {/* Status Summary */}
        <div className="bg-green-50 border-l-4 border-green-500 m-4 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-green-800 text-[11px] font-semibold font-['Poppins',sans-serif]">
                Site Inspection Completed
              </p>
              <p className="text-green-700 text-[9px] font-['Poppins',sans-serif] mt-0.5">
                Location verified • {checklistData.photos.length} photos captured • {checklistData.documents.length} documents uploaded
              </p>
            </div>
          </div>
        </div>

        {/* Plumber Estimation Section */}
        <div className="mx-4 mb-4">
          <h3 className="text-[#1f3a5f] text-[13px] font-semibold font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Plumber's Cost Estimation
          </h3>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-[#1f3a5f] grid grid-cols-[2fr_1.5fr_1.5fr] gap-2 px-3 py-2.5">
              <p className="text-white text-[10px] font-semibold font-['Poppins',sans-serif]">
                Attribute
              </p>
              <p className="text-white text-[10px] font-semibold font-['Poppins',sans-serif] text-center">
                Measurement
              </p>
              <p className="text-white text-[10px] font-semibold font-['Poppins',sans-serif] text-right">
                Price (₹)
              </p>
            </div>

            {/* Editable Table Body */}
            <div className="divide-y divide-gray-100">
              {feEstimationRows.map((row, index) => (
                <div
                  key={row.id}
                  className={`grid grid-cols-[2fr_1.5fr_1.5fr] gap-2 px-3 py-2 items-center ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <p className="text-[#263238] text-[11px] font-medium font-['Poppins',sans-serif]">
                    {row.attribute}
                  </p>
                  <input
                    type="text"
                    value={row.measurement}
                    onChange={(e) => updateFeRow(row.id, 'measurement', e.target.value)}
                    className="w-full text-center text-[11px] font-['Poppins',sans-serif] text-[#263238] bg-blue-50 border border-blue-200 rounded px-1.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1f3a5f] focus:border-[#1f3a5f]"
                  />
                  <input
                    type="number"
                    value={row.price || ''}
                    onChange={(e) => updateFeRow(row.id, 'price', e.target.value)}
                    className="w-full text-right text-[11px] font-semibold font-['Poppins',sans-serif] text-[#263238] bg-blue-50 border border-blue-200 rounded px-1.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1f3a5f] focus:border-[#1f3a5f]"
                    min="0"
                    step="0.01"
                  />
                </div>
              ))}
            </div>

            {/* Total Amount */}
            <div className="bg-[#f9a825]/10 border-t-2 border-[#f9a825] px-3 py-3">
              <div className="grid grid-cols-[2fr_1.5fr_1.5fr] gap-2">
                <p className="text-[#1f3a5f] text-[12px] font-bold font-['Poppins',sans-serif]">
                  Total Amount
                </p>
                <div></div>
                <p className="text-[#1f3a5f] text-[13px] font-bold font-['Poppins',sans-serif] text-right">
                  ₹{feTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Difference indicator */}
          {feTotal !== plumberEstimation.totalAmount && (
            <div className={`mt-2 px-3 py-2 rounded-lg border text-[10px] font-['Poppins',sans-serif] flex items-center gap-2 ${
              feTotal > plumberEstimation.totalAmount
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}>
              <span className="font-semibold">
                {feTotal > plumberEstimation.totalAmount ? '▲' : '▼'} Difference from Plumber's Estimate:
              </span>
              <span className="font-bold ml-auto">
                ₹{Math.abs(feTotal - plumberEstimation.totalAmount).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Site Observations Summary */}
        {checklistData.siteNotes && (
          <div className="mx-4 mb-4">
            <h3 className="text-[#1f3a5f] text-[13px] font-semibold font-['Poppins',sans-serif] mb-3">
              Your Site Observations
            </h3>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <p className="text-[#263238] text-[11px] font-['Poppins',sans-serif] leading-relaxed whitespace-pre-wrap">
                {checklistData.siteNotes}
              </p>
            </div>
          </div>
        )}

        {/* Inspection Checklist */}
        <div className="mx-4 mb-4">
          <h3 className="text-[#1f3a5f] text-[13px] font-semibold font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Inspection Checklist
            <span className="ml-auto text-[9px] text-gray-400 font-normal">Optional</span>
          </h3>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Checklist Header */}
            <div className="bg-[#1f3a5f] px-3 py-2.5 flex items-center justify-between">
              <p className="text-white text-[10px] font-semibold font-['Poppins',sans-serif]">
                Site Verification Items
              </p>
              <p className="text-white/80 text-[9px] font-['Poppins',sans-serif]">
                {checkedCount}/{INSPECTION_CHECKLIST.length} checked
              </p>
            </div>

            {/* Scrollable Checklist */}
            <div className="max-h-[260px] overflow-y-auto divide-y divide-gray-100">
              {INSPECTION_CHECKLIST.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`w-full flex items-start gap-3 px-3 py-3 text-left transition-colors ${
                    checkedItems[item.id] ? 'bg-green-50/60' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  } active:bg-gray-100`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {checkedItems[item.id] ? (
                      <CheckSquare className="w-[18px] h-[18px] text-green-600" />
                    ) : (
                      <Square className="w-[18px] h-[18px] text-gray-300" />
                    )}
                  </div>
                  <p className={`text-[11px] font-['Poppins',sans-serif] leading-relaxed ${
                    checkedItems[item.id] ? 'text-green-800 font-medium' : 'text-[#263238]'
                  }`}>
                    {item.label}
                  </p>
                </button>
              ))}
            </div>

            {/* Checklist Footer */}
            {checkedCount > 0 && (
              <div className="bg-green-50 border-t border-green-200 px-3 py-2 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <p className="text-green-700 text-[9px] font-medium font-['Poppins',sans-serif]">
                  {checkedCount} of {INSPECTION_CHECKLIST.length} items verified
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Unauthorized Tap Connection ─────────────────────── */}
        <div className="mx-4 mb-4">
          <h3 className="text-[#1f3a5f] text-[13px] font-semibold font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Unauthorized Tap Connection
          </h3>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Question */}
            <div className="px-4 py-3.5 border-b border-gray-100">
              <p className="text-[12px] font-medium text-[#263238] font-['Poppins',sans-serif] mb-3">
                Is there any unauthorized tap connection at the site?
              </p>

              {/* Radio Buttons */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div
                    className={'w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-colors ' +
                      (unauthorizedTap === 'no'
                        ? 'border-[#1f3a5f] bg-[#1f3a5f]'
                        : 'border-gray-300 bg-white')}
                    onClick={() => { setUnauthorizedTap('no'); setPenaltyAmount(''); setPenaltyError(''); }}
                  >
                    {unauthorizedTap === 'no' && (
                      <div className="w-[8px] h-[8px] rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className={'text-[12px] font-medium font-[\'Poppins\',sans-serif] ' +
                    (unauthorizedTap === 'no' ? 'text-[#1f3a5f]' : 'text-gray-600')}>
                    No
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div
                    className={'w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-colors ' +
                      (unauthorizedTap === 'yes'
                        ? 'border-red-600 bg-red-600'
                        : 'border-gray-300 bg-white')}
                    onClick={() => setUnauthorizedTap('yes')}
                  >
                    {unauthorizedTap === 'yes' && (
                      <div className="w-[8px] h-[8px] rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className={'text-[12px] font-medium font-[\'Poppins\',sans-serif] ' +
                    (unauthorizedTap === 'yes' ? 'text-red-600' : 'text-gray-600')}>
                    Yes
                  </span>
                </label>
              </div>
            </div>

            {/* Penalty Amount — shown only when Yes is selected */}
            {unauthorizedTap === 'yes' && (
              <div className="px-4 py-3.5 bg-red-50/50">
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-red-700 font-['Poppins',sans-serif] leading-relaxed">
                    An unauthorized tap connection has been identified. Please enter the penalty amount to be levied as per Government norms. This will be added to the citizen's payment.
                  </p>
                </div>

                <label className="block text-[11px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1.5">
                  Penalty Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-gray-500 font-['Poppins',sans-serif]">₹</span>
                  <input
                    type="number"
                    value={penaltyAmount}
                    onChange={(e) => {
                      setPenaltyAmount(e.target.value);
                      if (e.target.value && parseFloat(e.target.value) > 0) {
                        setPenaltyError('');
                      }
                    }}
                    placeholder="Enter penalty amount"
                    min="0"
                    step="1"
                    className={'w-full h-[40px] pl-8 pr-3 text-[12px] font-semibold font-[\'Poppins\',sans-serif] text-[#263238] bg-white border-[1.5px] rounded-lg outline-none transition-colors ' +
                      (penaltyError
                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-[#1f3a5f] focus:ring-2 focus:ring-[#1f3a5f]/20')}
                  />
                </div>
                {penaltyError && (
                  <p className="mt-1 text-[10px] text-red-600 font-['Poppins',sans-serif]">{penaltyError}</p>
                )}

                {/* Penalty Preview */}
                {penaltyAmount && parseFloat(penaltyAmount) > 0 && (
                  <div className="mt-3 bg-white rounded-lg border border-red-200 p-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] text-gray-600 font-['Poppins',sans-serif]">Installation Charges</span>
                      <span className="text-[11px] font-semibold text-[#263238] font-['Poppins',sans-serif]">₹{feTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] text-red-600 font-medium font-['Poppins',sans-serif]">Unauthorized Tap Penalty</span>
                      <span className="text-[11px] font-semibold text-red-600 font-['Poppins',sans-serif]">+ ₹{parseFloat(penaltyAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-red-200">
                      <span className="text-[11px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">Total Payable by Citizen</span>
                      <span className="text-[12px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">₹{(feTotal + parseFloat(penaltyAmount)).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No unauthorized tap — green confirmation */}
            {unauthorizedTap === 'no' && (
              <div className="px-4 py-2.5 bg-green-50/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  <p className="text-[10px] text-green-700 font-medium font-['Poppins',sans-serif]">
                    No unauthorized tap connection found at this site.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Captured Photos Preview */}
        {checklistData.photos.length > 0 && (
          <div className="mx-4 mb-4">
            <h3 className="text-[#1f3a5f] text-[13px] font-semibold font-['Poppins',sans-serif] mb-3">
              Captured Photos ({checklistData.photos.length})
            </h3>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="grid grid-cols-3 gap-2">
                {checklistData.photos.map((photo, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={photo}
                      alt={`Site photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Documents Preview */}
        {checklistData.documents.length > 0 && (
          <div className="mx-4 mb-4">
            <h3 className="text-[#1f3a5f] text-[13px] font-semibold font-['Poppins',sans-serif] mb-3">
              Uploaded Documents ({checklistData.documents.length})
            </h3>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 space-y-2">
              {checklistData.documents.map((doc, index) => (
                <div key={index} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                  <FileText className="w-4 h-4 text-[#1f3a5f]" />
                  <p className="text-[11px] text-[#263238] font-medium font-['Poppins',sans-serif] flex-1 truncate">
                    {doc.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex items-center gap-3 max-w-[400px] mx-auto">
          <button
            onClick={onBack}
            className="h-[44px] px-6 bg-white border-2 border-gray-300 rounded-lg text-[#263238] text-[12px] font-semibold font-['Poppins',sans-serif] hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 h-[44px] bg-[#1f3a5f] rounded-lg text-white text-[13px] font-semibold font-['Poppins',sans-serif] shadow-md hover:bg-[#2d4a75] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
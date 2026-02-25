import { ChevronLeft, User, FileText, CheckCircle, XCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { BCCollectorData, BCApplication } from './BillCollectorMobileApp';

interface DCBData {
  billingDate: string;
  dueDate: string;
  billingMonth: string;
  previousReading: string;
  currentReading: string;
  unitsConsumed: string;
  forMonths: string;
  principal: string;
  previousInterest: string;
  currentInterest: string;
  total: string;
}

interface BillCollectorBillGenerationProps {
  collector: BCCollectorData;
  application: BCApplication;
  dcbData: DCBData;
  ward: string;
  onBack: () => void;
  onBillGenerated: () => void;
  onViewReceipt: (billData: any) => void;
}

interface BillForm {
  currentDemand: string;
  arrears: string;
  interest: string;
  others: string;
  penaltyReason: string;
  penaltyAmount: string;
  totalBillAmount: string;
  remarks: string;
}

const PENALTY_REASONS = [
  { value: '__none__', label: '-- Select --' },
  { value: 'late_payment', label: 'Late Payment' },
  { value: 'meter_tampering', label: 'Meter Tampering' },
  { value: 'unauthorized_connection', label: 'Unauthorized Connection' },
  { value: 'illegal_usage', label: 'Illegal Usage' },
  { value: 'other', label: 'Other' },
];

function getRatePerUnit(connectionType: string): number {
  const type = (connectionType || '').toLowerCase();
  if (type === 'domestic') return 5;
  if (type === 'non-domestic') return 8;
  if (type === 'commercial') return 10;
  if (type === 'industries' || type === 'industrial') return 12;
  return 5;
}

// Non-metered fixed monthly slab rates
function getFixedMonthlyRate(connectionType: string): number {
  const type = (connectionType || '').toLowerCase().replace(/[\s_-]+/g, '');
  if (type === 'domestic') return 80;
  if (type === 'nondomestic') return 120;
  if (type === 'commercial') return 160;
  if (type === 'industrial' || type === 'industries') return 320;
  return 80;
}

function formatBillDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return day + '/' + month + '/' + year;
}

export default function BillCollectorBillGeneration({
  collector,
  application,
  dcbData,
  ward,
  onBack,
  onBillGenerated,
  onViewReceipt,
}: BillCollectorBillGenerationProps) {
  // Determine if non-metered
  const isNonMetered = (() => {
    const mt = application && application.meteringType ? application.meteringType.toLowerCase() : '';
    const mc = application && application.meterCategory ? application.meterCategory.toLowerCase() : '';
    return mt === 'non-metered' || mc === 'non-meter' || mc === 'nonmeter';
  })();

  // Calculate current demand: for non-metered use fixed rate, for metered use units × rate
  const unitsConsumed = parseInt(dcbData && dcbData.unitsConsumed ? dcbData.unitsConsumed : '0', 10) || 0;
  const connectionType = application && application.connectionType ? application.connectionType : 'Domestic';
  const rate = getRatePerUnit(connectionType);
  const fixedMonthlyRate = getFixedMonthlyRate(connectionType);

  // For non-metered: parse forMonths to get month count
  const forMonthsStr = dcbData && dcbData.forMonths ? dcbData.forMonths : '1 month';
  const monthCount = parseInt(forMonthsStr, 10) || 1;

  const calculatedDemand = isNonMetered ? (fixedMonthlyRate * monthCount) : (unitsConsumed * rate);

  // Arrears from DCB principal, Interest from DCB previousInterest + currentInterest
  const dcbPrincipal = parseFloat(dcbData && dcbData.principal ? dcbData.principal : '0') || 0;
  const dcbPrevInterest = parseFloat(dcbData && dcbData.previousInterest ? dcbData.previousInterest : '0') || 0;
  const dcbCurrInterest = parseFloat(dcbData && dcbData.currentInterest ? dcbData.currentInterest : '0') || 0;
  const dcbInterestTotal = dcbPrevInterest + dcbCurrInterest;

  const [form, setForm] = useState<BillForm>({
    currentDemand: String(calculatedDemand),
    arrears: String(dcbPrincipal),
    interest: String(dcbInterestTotal),
    others: '0',
    penaltyReason: '__none__',
    penaltyAmount: '0',
    totalBillAmount: '0',
    remarks: '',
  });

  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-calculate total bill amount
  useEffect(() => {
    const demand = parseFloat(form.currentDemand) || 0;
    const arrears = parseFloat(form.arrears) || 0;
    const interest = parseFloat(form.interest) || 0;
    const others = parseFloat(form.others) || 0;
    const penalty = parseFloat(form.penaltyAmount) || 0;
    const total = demand + arrears + interest + others + penalty;
    setForm((f) => ({ ...f, totalBillAmount: String(total) }));
  }, [form.currentDemand, form.arrears, form.interest, form.others, form.penaltyAmount]);

  const updateField = (field: keyof BillForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.currentDemand && form.currentDemand !== '0') errs.currentDemand = 'Required';
    // If penalty reason is selected, penalty amount should be > 0
    if (form.penaltyReason !== '__none__' && (parseFloat(form.penaltyAmount) || 0) <= 0) {
      errs.penaltyAmount = 'Enter penalty amount';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGenerateBill = async () => {
    if (!validate()) return;
    setGenerating(true);
    try {
      const billEntry = {
        applicationId: application && application.id ? application.id : '',
        applicationNo: application && application.applicationNo ? application.applicationNo : '',
        rrNumber: application && application.rrNumber ? application.rrNumber : '',
        applicantName: application && application.applicantName ? application.applicantName : '',
        connectionType: connectionType,
        collectorId: collector && collector.id ? collector.id : '',
        collectorName: collector && collector.name ? collector.name : '',
        ward: ward,
        billingDate: dcbData && dcbData.billingDate ? dcbData.billingDate : '',
        dueDate: dcbData && dcbData.dueDate ? dcbData.dueDate : '',
        billingMonth: dcbData && dcbData.billingMonth ? dcbData.billingMonth : '',
        unitsConsumed: dcbData && dcbData.unitsConsumed ? dcbData.unitsConsumed : '0',
        ratePerUnit: String(rate),
        ...form,
        generatedAt: new Date().toISOString(),
        status: 'generated',
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/bill-collector/generate-bill`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ billEntry, wardNo: ward }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        const billId = data && data.billId ? data.billId : 'BILL-' + Date.now();
        setSuccessMsg('Bill Generated Successfully!');
        setTimeout(() => {
          setSuccessMsg('');
          onViewReceipt({ ...form, billId });
        }, 1200);
      } else {
        console.error('[BC BILL] Generate failed:', data && data.error ? data.error : 'Unknown error');
      }
    } catch (error) {
      console.error('[BC BILL] Error generating bill:', error);
    } finally {
      setGenerating(false);
    }
  };

  const billDate = formatBillDate();

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[420px] mx-auto border-x border-gray-200 shadow-xl">
      {/* Header */}
      <div className="bg-[#1f3a5f] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="cursor-pointer">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <span className="text-white text-[15px] font-semibold font-['Poppins',sans-serif]">KMDS - Jalanidhi</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white text-[12px] font-medium font-['Poppins',sans-serif]">
            {collector && collector.name ? collector.name.split(' ').slice(0, 2).join(' ') : 'User'}
          </span>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-[#f8f9fc] p-4">
        {/* Success */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-[12px] text-green-800 font-medium font-['Poppins',sans-serif]">{successMsg}</p>
          </div>
        )}

        {/* Bill Date Header */}
        <h2 className="text-[14px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">Bill Generation</h2>
        <p className="text-[12px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3 italic">
          Bill as on {billDate}
        </p>

        {/* Bill Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
          {/* Current Demand */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
              Current Demand<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Rs.</span>
              <input
                type="number"
                value={form.currentDemand}
                readOnly
                tabIndex={-1}
                className="w-full h-[36px] pl-9 pr-3 border border-gray-300 rounded-lg bg-[#f0f4f8] font-['Poppins',sans-serif] text-[12px] font-semibold text-[#1f3a5f] outline-none cursor-default"
              />
            </div>
            <p className="text-[9px] text-gray-500 mt-0.5 font-['Poppins',sans-serif]">
              {isNonMetered
                ? ('Fixed rate: Rs. ' + fixedMonthlyRate + '/month × ' + monthCount + ' month' + (monthCount > 1 ? 's' : '') + ' (' + connectionType + ')')
                : (unitsConsumed + ' units x Rs. ' + rate + '/unit (' + connectionType + ')')}
            </p>
          </div>

          {/* Arrears */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
              Arrears<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.arrears}
              onChange={(e) => updateField('arrears', e.target.value)}
              className="w-full h-[36px] px-3 border border-gray-300 rounded-lg bg-white font-['Poppins',sans-serif] text-[12px] text-gray-900 outline-none focus:border-[#1f3a5f]"
            />
          </div>

          {/* Interest */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
              Interest<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.interest}
              onChange={(e) => updateField('interest', e.target.value)}
              className="w-full h-[36px] px-3 border border-gray-300 rounded-lg bg-white font-['Poppins',sans-serif] text-[12px] text-gray-900 outline-none focus:border-[#1f3a5f]"
            />
          </div>

          {/* Others */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
              Others<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.others}
              onChange={(e) => updateField('others', e.target.value)}
              className="w-full h-[36px] px-3 border border-gray-300 rounded-lg bg-white font-['Poppins',sans-serif] text-[12px] text-gray-900 outline-none focus:border-[#1f3a5f]"
            />
          </div>

          {/* Penalty Reason */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
              Penalty Reason
            </label>
            <select
              value={form.penaltyReason}
              onChange={(e) => updateField('penaltyReason', e.target.value)}
              className="w-full h-[36px] px-3 border border-gray-300 rounded-lg bg-white font-['Poppins',sans-serif] text-[12px] text-gray-900 outline-none appearance-none cursor-pointer focus:border-[#1f3a5f]"
            >
              {PENALTY_REASONS.map((pr) => (
                <option key={pr.value} value={pr.value}>{pr.label}</option>
              ))}
            </select>
          </div>

          {/* Penalty Amount */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
              Penalty Amount
            </label>
            <input
              type="number"
              value={form.penaltyAmount}
              onChange={(e) => updateField('penaltyAmount', e.target.value)}
              className={
                'w-full h-[36px] px-3 border rounded-lg bg-white font-[\'Poppins\',sans-serif] text-[12px] text-gray-900 outline-none ' +
                (errors.penaltyAmount ? 'border-red-400' : 'border-gray-300 focus:border-[#1f3a5f]')
              }
            />
            {errors.penaltyAmount && <p className="text-red-500 text-[10px] mt-0.5 font-['Poppins',sans-serif]">{errors.penaltyAmount}</p>}
          </div>

          {/* Total Bill Amount */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
              Total Bill Amount<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">Rs.</span>
              <div className="h-[36px] pl-9 pr-3 border border-gray-300 rounded-lg bg-[#f0f4f8] flex items-center">
                <span className="text-[12px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">{form.totalBillAmount}</span>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
              Remarks
            </label>
            <textarea
              value={form.remarks}
              onChange={(e) => updateField('remarks', e.target.value)}
              placeholder="Enter remarks..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-['Poppins',sans-serif] text-[12px] text-gray-900 outline-none resize-none focus:border-[#1f3a5f]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={handleGenerateBill}
            disabled={generating}
            className="flex-1 h-[44px] bg-[#1F3A5F] hover:bg-[#f59e0b] text-[#FFFFFF] text-[13px] font-bold font-['Poppins',sans-serif] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1f3a5f]"></div>
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate Bill
              </>
            )}
          </button>
          <button
            onClick={onBack}
            disabled={generating}
            className="h-[44px] px-5 bg-white border border-gray-300 text-gray-600 text-[13px] font-semibold font-['Poppins',sans-serif] rounded-lg shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
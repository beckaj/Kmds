import { ChevronLeft, User, ArrowRight, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { BCCollectorData, BCApplication } from './BillCollectorMobileApp';

interface BillCollectorDCBFormProps {
  collector: BCCollectorData;
  application: BCApplication;
  ward: string;
  onBack: () => void;
  onSaved: () => void;
  onProceedToBillGen: (dcbData: any) => void;
}

interface DCBForm {
  billingDate: string;
  dueDate: string;
  billingMonth: string;
  previousReading: string;
  currentReading: string;
  unitsConsumed: string;
  forMonths: string;
  // Arrears
  principal: string;
  previousInterest: string;
  currentInterest: string;
  total: string;
}

const EMPTY_FORM: DCBForm = {
  billingDate: '',
  dueDate: '',
  billingMonth: '',
  previousReading: '0',
  currentReading: '',
  unitsConsumed: '0',
  forMonths: '1 month',
  principal: '0',
  previousInterest: '0',
  currentInterest: '0',
  total: '0',
};

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

function getCurrentMonthYear(): string {
  const now = new Date();
  return MONTHS[now.getMonth()] + ' ' + now.getFullYear();
}

function formatDateForInput(dateStr: string): string {
  if (!dateStr) return '';
  // If already in YYYY-MM-DD format, return as-is
  if (dateStr.indexOf('-') !== -1 && dateStr.length === 10) return dateStr;
  return dateStr;
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return day + '/' + month + '/' + year;
  } catch {
    return dateStr;
  }
}

export default function BillCollectorDCBForm({
  collector,
  application,
  ward,
  onBack,
  onSaved,
  onProceedToBillGen,
}: BillCollectorDCBFormProps) {
  // Determine if this is a non-metered connection
  const isNonMetered = (() => {
    const mt = application && application.meteringType ? application.meteringType.toLowerCase() : '';
    const mc = application && application.meterCategory ? application.meterCategory.toLowerCase() : '';
    return mt === 'non-metered' || mc === 'non-meter' || mc === 'nonmeter';
  })();

  // Non-metered fixed slab rates
  const NON_METERED_SLAB: Record<string, number> = {
    'domestic': 80,
    'non-domestic': 120,
    'nondomestic': 120,
    'commercial': 160,
    'industrial': 320,
    'industries': 320,
  };
  const connType = application && application.connectionType ? application.connectionType.toLowerCase().replace(/[\s_-]+/g, '') : 'domestic';
  const fixedMonthlyRate = NON_METERED_SLAB[connType] || NON_METERED_SLAB['domestic'] || 80;

  // Pre-fill from existing DCB entry if available
  const [form, setForm] = useState<DCBForm>(() => {
    // Derive the previous reading: from existing DCB entry, or from the application's last meter reading
    const fallbackPreviousReading = application && application.lastMeterReading != null
      ? String(application.lastMeterReading)
      : '0';

    if (application && application.dcbEntry) {
      const d = application.dcbEntry;
      return {
        billingDate: d.billingDate || '',
        dueDate: d.dueDate || '',
        billingMonth: d.billingMonth || getCurrentMonthYear(),
        previousReading: d.previousReading || fallbackPreviousReading,
        currentReading: d.currentReading || '0',
        unitsConsumed: d.unitsConsumed || '0',
        forMonths: d.forMonths || '1 month',
        principal: d.principal || '0',
        previousInterest: d.previousInterest || '0',
        currentInterest: d.currentInterest || '0',
        total: d.total || '0',
      };
    }
    // Default: set billing date to today, due date to 15 days later
    const today = new Date();
    const due = new Date(today);
    due.setDate(due.getDate() + 15);
    const toISO = (dt: Date) => {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return y + '-' + m + '-' + dd;
    };
    return {
      ...EMPTY_FORM,
      billingDate: toISO(today),
      dueDate: toISO(due),
      billingMonth: getCurrentMonthYear(),
      previousReading: fallbackPreviousReading,
    };
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-calculate units consumed
  useEffect(() => {
    const prev = parseInt(form.previousReading, 10) || 0;
    const curr = parseInt(form.currentReading, 10) || 0;
    const units = curr - prev;
    setForm((f) => ({ ...f, unitsConsumed: String(units >= 0 ? units : 0) }));
  }, [form.previousReading, form.currentReading]);

  // Auto-calculate total
  useEffect(() => {
    const principal = parseFloat(form.principal) || 0;
    const prevInterest = parseFloat(form.previousInterest) || 0;
    const currInterest = parseFloat(form.currentInterest) || 0;
    const total = principal + prevInterest + currInterest;
    setForm((f) => ({ ...f, total: String(total) }));
  }, [form.principal, form.previousInterest, form.currentInterest]);

  const updateField = (field: keyof DCBForm, value: string) => {
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
    if (!form.billingDate) errs.billingDate = 'Required';
    if (!form.dueDate) errs.dueDate = 'Required';
    if (!form.billingMonth) errs.billingMonth = 'Required';
    // Only validate meter readings for metered connections
    if (!isNonMetered) {
      if (!form.currentReading && form.currentReading !== '0') errs.currentReading = 'Required';
      const prev = parseInt(form.previousReading, 10) || 0;
      const curr = parseInt(form.currentReading, 10) || 0;
      if (curr < prev) errs.currentReading = 'Must be >= previous reading';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceed = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const dcbEntry = {
        applicationId: application && application.id ? application.id : '',
        applicationNo: application && application.applicationNo ? application.applicationNo : '',
        rrNumber: application && application.rrNumber ? application.rrNumber : '',
        applicantName: application && application.applicantName ? application.applicantName : '',
        connectionType: application && application.connectionType ? application.connectionType : '',
        collectorId: collector && collector.id ? collector.id : '',
        collectorName: collector && collector.name ? collector.name : '',
        ...form,
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/bill-collector/dcb`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ dcbEntry, wardNo: ward }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        setSuccessMsg('DCB details saved. Proceeding to Bill Generation...');
        setTimeout(() => {
          setSuccessMsg('');
          onProceedToBillGen(form);
        }, 1000);
      } else {
        console.error('[BC DCB] Save failed:', data && data.error ? data.error : 'Unknown error');
      }
    } catch (error) {
      console.error('[BC DCB] Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  // Arrears date display
  const arrearsDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    const day = '01';
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return day + '/' + month + '/' + year;
  })();

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

        {/* Title */}
        <h2 className="text-[14px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">DCB Details</h2>

        {/* DCB Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
          {/* Non-Metered Banner */}
          {isNonMetered && (
            <div className="mb-3 bg-[#1f3a5f]/5 border border-[#1f3a5f]/15 rounded-lg p-3">
              <p className="text-[11px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">
                NON-METERED CONNECTION
              </p>
              <p className="text-[11px] text-gray-600 font-['Poppins',sans-serif]">
                Fixed monthly rate: <span className="font-bold text-[#1f3a5f]">₹{fixedMonthlyRate}</span>/month ({application && application.connectionType ? application.connectionType : 'Domestic'})
              </p>
              <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif] mt-0.5 italic">
                Meter readings are not applicable for this connection.
              </p>
            </div>
          )}

          {/* Billing Date */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
              Billing Date<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formatDateForInput(form.billingDate)}
              onChange={(e) => updateField('billingDate', e.target.value)}
              className={
                'w-full h-[36px] px-3 border rounded-lg bg-white font-[\'Poppins\',sans-serif] text-[12px] text-gray-900 outline-none ' +
                (errors.billingDate ? 'border-red-400' : 'border-gray-300 focus:border-[#1f3a5f]')
              }
            />
            {errors.billingDate && <p className="text-red-500 text-[10px] mt-0.5 font-['Poppins',sans-serif]">{errors.billingDate}</p>}
          </div>

          {/* Due Date */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
              Due Date<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formatDateForInput(form.dueDate)}
              onChange={(e) => updateField('dueDate', e.target.value)}
              className={
                'w-full h-[36px] px-3 border rounded-lg bg-white font-[\'Poppins\',sans-serif] text-[12px] text-gray-900 outline-none ' +
                (errors.dueDate ? 'border-red-400' : 'border-gray-300 focus:border-[#1f3a5f]')
              }
            />
            {errors.dueDate && <p className="text-red-500 text-[10px] mt-0.5 font-['Poppins',sans-serif]">{errors.dueDate}</p>}
          </div>

          {/* Billing Month */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
              Billing Month<span className="text-red-500">*</span>
            </label>
            <select
              value={form.billingMonth}
              onChange={(e) => updateField('billingMonth', e.target.value)}
              className={
                'w-full h-[36px] px-3 border rounded-lg bg-white font-[\'Poppins\',sans-serif] text-[12px] text-gray-900 outline-none appearance-none cursor-pointer ' +
                (errors.billingMonth ? 'border-red-400' : 'border-gray-300 focus:border-[#1f3a5f]')
              }
            >
              {MONTHS.map((m) => {
                const year = new Date().getFullYear();
                const val = m + ' ' + year;
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
            {errors.billingMonth && <p className="text-red-500 text-[10px] mt-0.5 font-['Poppins',sans-serif]">{errors.billingMonth}</p>}
          </div>

          {/* Previous Reading - only for metered */}
          {!isNonMetered && (
            <div className="mb-3">
              <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
                Previous Reading<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.previousReading}
                readOnly
                tabIndex={-1}
                className="w-full h-[36px] px-3 border border-gray-300 rounded-lg bg-[#f0f4f8] font-['Poppins',sans-serif] text-[12px] font-semibold text-[#1f3a5f] outline-none cursor-default"
              />
            </div>
          )}

          {/* Current Reading - only for metered */}
          {!isNonMetered && (
            <div className="mb-3">
              <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
                Current Reading<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.currentReading}
                onChange={(e) => updateField('currentReading', e.target.value)}
                className={
                  'w-full h-[36px] px-3 border rounded-lg bg-white font-[\'Poppins\',sans-serif] text-[12px] text-gray-900 outline-none ' +
                  (errors.currentReading ? 'border-red-400' : 'border-gray-300 focus:border-[#1f3a5f]')
                }
              />
              {errors.currentReading && <p className="text-red-500 text-[10px] mt-0.5 font-['Poppins',sans-serif]">{errors.currentReading}</p>}
            </div>
          )}

          {/* Units Consumed (auto-calculated) - only for metered */}
          {!isNonMetered && (
            <div className="mb-3">
              <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
                Units Consumed<span className="text-red-500">*</span>
              </label>
              <div className="h-[36px] px-3 border border-gray-300 rounded-lg bg-[#f0f4f8] flex items-center">
                <span className="text-[12px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">{form.unitsConsumed}</span>
              </div>
            </div>
          )}

          {/* For Months */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
              For Months<span className="text-red-500">*</span>
            </label>
            <select
              value={form.forMonths}
              onChange={(e) => updateField('forMonths', e.target.value)}
              className="w-full h-[36px] px-3 border border-gray-300 rounded-lg bg-white font-['Poppins',sans-serif] text-[12px] text-gray-900 outline-none appearance-none cursor-pointer"
            >
              <option value="1 month">1 month</option>
              <option value="2 months">2 months</option>
              <option value="3 months">3 months</option>
              <option value="6 months">6 months</option>
              <option value="12 months">12 months</option>
            </select>
          </div>
        </div>

        {/* Arrears Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <h3 className="text-[12px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
            Arrears as on {arrearsDate}
          </h3>

          {/* Principal */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
              Principal<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.principal}
              onChange={(e) => updateField('principal', e.target.value)}
              className="w-full h-[36px] px-3 border border-gray-300 rounded-lg bg-white font-['Poppins',sans-serif] text-[12px] text-gray-900 outline-none focus:border-[#1f3a5f]"
            />
          </div>

          {/* Previous Interest */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
              Previous Interest<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.previousInterest}
              onChange={(e) => updateField('previousInterest', e.target.value)}
              className="w-full h-[36px] px-3 border border-gray-300 rounded-lg bg-white font-['Poppins',sans-serif] text-[12px] text-gray-900 outline-none focus:border-[#1f3a5f]"
            />
          </div>

          {/* Current Interest */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
              Current Interest<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.currentInterest}
              onChange={(e) => updateField('currentInterest', e.target.value)}
              className="w-full h-[36px] px-3 border border-gray-300 rounded-lg bg-white font-['Poppins',sans-serif] text-[12px] text-gray-900 outline-none focus:border-[#1f3a5f]"
            />
          </div>

          {/* Total (auto-calculated) */}
          <div>
            <label className="block text-[10px] font-semibold text-[#1f3a5f] mb-0.5 font-['Poppins',sans-serif]">
              Total<span className="text-red-500">*</span>
            </label>
            <div className="h-[36px] px-3 border border-gray-300 rounded-lg bg-[#f0f4f8] flex items-center">
              <span className="text-[12px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">{form.total}</span>
            </div>
          </div>
        </div>

        {/* Proceed to Bill Generation */}
        <button
          onClick={handleProceed}
          disabled={saving}
          className="w-full h-[44px] bg-[#1F3A5F] hover:bg-[#f59e0b] text-[#FFFFFF] text-[13px] font-bold font-['Poppins',sans-serif] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1f3a5f]"></div>
              Saving...
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4" />
              Next
            </>
          )}
        </button>
      </div>
    </div>
  );
}
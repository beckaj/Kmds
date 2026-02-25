import { useState, useEffect, useRef } from 'react';
import { Save, RotateCcw, CheckCircle, Loader2, Plus, Trash2, ChevronRight, X, Calendar, ChevronLeft, Eye, Pencil, ArrowLeft } from 'lucide-react';
import { GovInput } from '../ui/gov-input';
import { GovSelect } from '../ui/gov-select';
import { GovRadio } from '../ui/gov-radio';
import { GovButton } from '../ui/gov-button';
import { GovDatePicker } from '../ui/gov-date-picker';
import { GovTable, GovTableHeader, GovTableHeaderCell, GovTableBody, GovTableRow, GovTableCell, GovTableEmpty, GovTableLoading } from '../ui/gov-table';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

// ─── Options Data ───────────────────────────────────────────────────────────

const ULB_TYPE_OPTIONS = [
  { value: 'CC', label: 'CC (City Corporation)' },
  { value: 'CMC', label: 'CMC (City Municipal Corporation)' },
  { value: 'TMC', label: 'TMC (Town Municipal Corporation)' },
  { value: 'TP', label: 'TP (Town Panchayat)' },
];

const DISTRICT_OPTIONS = [
  { value: 'Dharwad', label: 'Dharwad' },
  { value: 'Dakshina Kannada', label: 'Dakshina Kannada' },
  { value: 'Davanagere', label: 'Davanagere' },
  { value: 'Belgaum', label: 'Belgaum' },
  { value: 'Mysuru', label: 'Mysuru' },
  { value: 'Bengaluru Urban', label: 'Bengaluru Urban' },
];

const ULB_OPTIONS: Record<string, { value: string; label: string }[]> = {
  'Dharwad': [
    { value: 'Hubballi-Dharwad', label: 'Hubballi-Dharwad' },
    { value: 'Annigeri', label: 'Annigeri' },
    { value: 'Navalgund', label: 'Navalgund' },
  ],
  'Dakshina Kannada': [
    { value: 'Mangaluru', label: 'Mangaluru' },
    { value: 'Ullal', label: 'Ullal' },
    { value: 'Puttur', label: 'Puttur' },
  ],
  'Davanagere': [
    { value: 'Davanagere', label: 'Davanagere' },
    { value: 'Harihar', label: 'Harihar' },
  ],
  'Belgaum': [
    { value: 'Belgaum', label: 'Belgaum' },
    { value: 'Gokak', label: 'Gokak' },
  ],
  'Mysuru': [
    { value: 'Mysuru', label: 'Mysuru' },
    { value: 'Nanjangud', label: 'Nanjangud' },
  ],
  'Bengaluru Urban': [
    { value: 'BBMP', label: 'BBMP' },
  ],
};

const AUTHORITY_TYPE_OPTIONS = [
  { value: 'Board', label: 'Board' },
  { value: 'Council', label: 'Council' },
];

const METER_CATEGORY_OPTIONS = [
  { value: 'Both', label: 'Both' },
  { value: 'Metered', label: 'Metered' },
  { value: 'Non-Metered', label: 'Non-Metered' },
];

const ROAD_CUTTING_CHARGE_OPTIONS = [
  { value: 'per_meter', label: 'Per Meter' },
  { value: 'lump_sum', label: 'Lump Sum' },
];

const ADVANCE_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

const PENALTY_REASON_OPTIONS = [
  { value: 'delay_in_due_payment', label: 'Delay in Due Payment' },
  { value: 'unauthorized_usage', label: 'Unauthorized Usage' },
  { value: 'meter_tampering', label: 'Meter Tampering' },
  { value: 'illegal_connection', label: 'Illegal Connection' },
];

// Pipe sizes per connection type
const DOMESTIC_PIPE_SIZES = ['1/2"', '3/4"', '1"', '2"'];
const NON_DOMESTIC_PIPE_SIZES = ['1/2"', '3/4"', '1"', '2"'];
const COMMERCIAL_PIPE_SIZES = ['1/2"', '3/4"', '4"', '6"'];
const INDUSTRIES_PIPE_SIZES = ['1/2"', '3/4"', '4"', '6"'];

// ─── Types ──────────────────────────────────────────────────────────────────

interface SlabRate {
  from: string;
  to: string;
  rate: string;
}

interface NonMeteredRate {
  half: string;      // 1/2"
  threeQuarter: string; // 3/4"
  one: string;       // 1"
  two: string;       // 2"
  four: string;      // 4"
  six: string;       // 6"
}

interface TariffConfigData {
  // Header section
  ulbType: string;
  district: string;
  ulb: string;
  authorityType: string;
  meterCategory: string;

  // Connection type pipe size selections
  domesticPipeSizes: string[];
  nonDomesticPipeSizes: string[];
  commercialPipeSizes: string[];
  industriesPipeSizes: string[];

  // New Tap Connection Charges
  domesticCharge: string;
  nonDomesticCharge: string;
  commercialCharge: string;
  industriesCharge: string;

  // Road Cutting
  roadCuttingChargeAs: string;
  lengthInMeter: string;
  mudRoadCharge: string;
  metalRoadCharge: string;
  asphaltRoadCharge: string;
  concreteRoadCharge: string;

  // Other charges
  stonePavingCharge: string;
  isAdvanceAmount: string;
  advanceMonths: string;
  advanceAmount: string;
  monthlyCharges: string;
  securityDeposit: string;

  // Penalty & Interest
  penaltyReason: string;
  penaltyAmount: string;
  rateOfInterestDCB: string;

  // Slab Rates – Metered Water Supply
  domesticSlabs: SlabRate[];
  nonDomesticSlabs: SlabRate[];
  commercialSlabs: SlabRate[];
  industriesSlabs: SlabRate[];

  // Slab Rates – Non Metered Water Supply
  nonMeteredDomestic: NonMeteredRate;
  nonMeteredNonDomestic: NonMeteredRate;
  nonMeteredCommercial: NonMeteredRate;
  nonMeteredIndustries: NonMeteredRate;

  // UGD Connection
  ugdIncludeWithTap: string;
  ugdAvailable: string;
  ugdDomesticCharge: string;
  ugdNonDomesticCharge: string;
  ugdCommercialCharge: string;
  ugdIndustriesCharge: string;
  ugdRegistrationFees: string;
  ugdRegistrationAmount: string;
  ugdStonePavingCharge: string;
  ugdPenaltyReason: string;
  ugdPenaltyAmount: string;
  ugdOtherCharges: string;

  // Bill Generation Period
  billGenerationPeriodFrom: string;
  billGenerationPeriodTo: string;
}

const defaultConfig: TariffConfigData = {
  ulbType: 'CC',
  district: 'Dharwad',
  ulb: 'Hubballi-Dharwad',
  authorityType: 'Board',
  meterCategory: 'Both',
  domesticPipeSizes: ['1/2"'],
  nonDomesticPipeSizes: ['1/2"'],
  commercialPipeSizes: ['3/4"'],
  industriesPipeSizes: ['4"'],
  domesticCharge: '3000',
  nonDomesticCharge: '5000',
  commercialCharge: '10000',
  industriesCharge: '12000',
  roadCuttingChargeAs: 'per_meter',
  lengthInMeter: '300',
  mudRoadCharge: '500',
  metalRoadCharge: '800',
  asphaltRoadCharge: '1300',
  concreteRoadCharge: '2100',
  stonePavingCharge: '100',
  isAdvanceAmount: 'yes',
  advanceMonths: '12',
  advanceAmount: '1300',
  monthlyCharges: '',
  securityDeposit: '2000',
  penaltyReason: 'delay_in_due_payment',
  penaltyAmount: '500',
  rateOfInterestDCB: '10',
  domesticSlabs: [
    { from: '0', to: '8', rate: '10' },
    { from: '8', to: '15', rate: '12' },
    { from: '15', to: '25', rate: '14' },
    { from: '25', to: 'Above', rate: '16' },
  ],
  nonDomesticSlabs: [
    { from: '0', to: '8', rate: '20' },
    { from: '8', to: '15', rate: '24' },
    { from: '15', to: '25', rate: '28' },
    { from: '25', to: 'Above', rate: '32' },
  ],
  commercialSlabs: [
    { from: '0', to: '8', rate: '40' },
    { from: '8', to: '15', rate: '48' },
    { from: '15', to: '25', rate: '56' },
    { from: '25', to: 'Above', rate: '64' },
  ],
  industriesSlabs: [
    { from: '0', to: '8', rate: '42' },
    { from: '8', to: '15', rate: '50' },
    { from: '15', to: '25', rate: '58' },
    { from: '25', to: 'Above', rate: '65' },
  ],
  nonMeteredDomestic: {
    half: '100',
    threeQuarter: '150',
    one: '200',
    two: '300',
    four: '',
    six: '',
  },
  nonMeteredNonDomestic: {
    half: '150',
    threeQuarter: '200',
    one: '300',
    two: '450',
    four: '',
    six: '',
  },
  nonMeteredCommercial: {
    half: '',
    threeQuarter: '250',
    one: '',
    two: '',
    four: '600',
    six: '800',
  },
  nonMeteredIndustries: {
    half: '',
    threeQuarter: '300',
    one: '',
    two: '',
    four: '700',
    six: '1000',
  },
  ugdIncludeWithTap: 'yes',
  ugdAvailable: 'yes',
  ugdDomesticCharge: '1000',
  ugdNonDomesticCharge: '1500',
  ugdCommercialCharge: '2000',
  ugdIndustriesCharge: '2500',
  ugdRegistrationFees: 'yes',
  ugdRegistrationAmount: '500',
  ugdStonePavingCharge: '100',
  ugdPenaltyReason: 'delay_in_due_payment',
  ugdPenaltyAmount: '500',
  ugdOtherCharges: '100',
  billGenerationPeriodFrom: '',
  billGenerationPeriodTo: '',
};

// ─── Checkbox Group Component ───────────────────────────────────────────────

function PipeSizeCheckboxGroup({ label, sizes, selectedSizes, onChange }: {
  label: string;
  sizes: string[];
  selectedSizes: string[];
  onChange: (selected: string[]) => void;
}) {
  const handleToggle = (size: string) => {
    if (selectedSizes.includes(size)) {
      onChange(selectedSizes.filter(s => s !== size));
    } else {
      onChange([...selectedSizes, size]);
    }
  };

  return (
    <div className="flex items-center gap-4 py-1.5">
      <span className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif] min-w-[120px]">
        {label}
      </span>
      <div className="flex items-center gap-5">
        {sizes.map(size => (
          <label key={size} className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedSizes.includes(size)}
              onChange={() => handleToggle(size)}
              className="w-4 h-4 rounded border-gray-300 text-[#1f3a5f] focus:ring-[#1f3a5f] cursor-pointer"
            />
            <span className="text-[14px] text-gray-700 font-['Poppins',sans-serif]">{size}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Helper: format date from YYYY-MM-DD to DD/MM/YYYY ─────────────────────
function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return 'N/A';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

// ─── Helper: Get ULB Type label ─────────────────────────────────────────────
function getUlbTypeLabel(value: string): string {
  const opt = ULB_TYPE_OPTIONS.find(o => o.value === value);
  return opt ? opt.label : value || 'N/A';
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function TariffRateConfiguration() {
  // Mode: 'list' = table view, 'form' = create/edit form, 'view' = read-only view
  const [mode, setMode] = useState<'list' | 'form' | 'view'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  // List of all saved configurations
  const [configList, setConfigList] = useState<any[]>([]);

  // Current form data
  const [config, setConfig] = useState<TariffConfigData>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Remarks modal state
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [remarksErrors, setRemarksErrors] = useState<Record<string, string>>({});

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllConfigs();
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // ─── API Calls ──────────────────────────────────────────────────────────

  const fetchAllConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/ulb-admin/tariff-rates`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      if (data && data.success && data.rates) {
        // Filter only new-format configs (those with ulbType field)
        const configs = data.rates.filter((r: any) => r.ulbType);
        setConfigList(configs);
        console.log('[TARIFF CONFIG] Loaded ' + configs.length + ' configurations');
      } else {
        setConfigList([]);
      }
    } catch (error) {
      console.error('[TARIFF CONFIG] Error fetching configs:', error);
      setConfigList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfig = async () => {
    if (!deleteTargetId) return;
    setDeleting(deleteTargetId);
    setShowDeleteModal(false);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/ulb-admin/tariff-rates/delete`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ rateId: deleteTargetId }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        setSuccessMsg('Configuration deleted successfully!');
        await fetchAllConfigs();
      } else {
        const errMsg = data && data.error ? data.error : 'Unknown error';
        alert('Error deleting configuration: ' + errMsg);
      }
    } catch (error) {
      console.error('[TARIFF CONFIG] Error deleting:', error);
      alert('Error deleting configuration: ' + error);
    } finally {
      setDeleting(null);
      setDeleteTargetId(null);
    }
  };

  // ─── Form Handlers ──────────────────────────────────────────────────────

  const handleNewConfig = () => {
    setConfig(defaultConfig);
    setEditingId(null);
    setErrors({});
    setMode('form');
  };

  const handleEditConfig = (configItem: any) => {
    setConfig({ ...defaultConfig, ...configItem });
    setEditingId(configItem.id || null);
    setErrors({});
    setMode('form');
  };

  const handleViewConfig = (configItem: any) => {
    setConfig({ ...defaultConfig, ...configItem });
    setEditingId(configItem.id || null);
    setMode('view');
  };

  const handleBackToList = () => {
    setMode('list');
    setEditingId(null);
    setConfig(defaultConfig);
    setErrors({});
  };

  const handleChange = (field: keyof TariffConfigData, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePipeSizeChange = (field: keyof TariffConfigData, sizes: string[]) => {
    setConfig(prev => ({ ...prev, [field]: sizes }));
  };

  const handleNonMeteredChange = (
    field: 'nonMeteredDomestic' | 'nonMeteredNonDomestic' | 'nonMeteredCommercial' | 'nonMeteredIndustries',
    key: keyof NonMeteredRate,
    value: string
  ) => {
    setConfig(prev => {
      const current = prev[field] && typeof prev[field] === 'object' ? prev[field] : defaultConfig[field];
      return { ...prev, [field]: { ...current, [key]: value } };
    });
  };

  const handleSlabChange = (
    field: 'domesticSlabs' | 'nonDomesticSlabs' | 'commercialSlabs' | 'industriesSlabs',
    index: number,
    key: keyof SlabRate,
    value: string
  ) => {
    setConfig(prev => {
      const slabs = prev[field] && Array.isArray(prev[field]) ? [...prev[field]] : [];
      if (slabs[index]) {
        slabs[index] = { ...slabs[index], [key]: value };
      }
      return { ...prev, [field]: slabs };
    });
  };

  const addSlab = (field: 'domesticSlabs' | 'nonDomesticSlabs' | 'commercialSlabs' | 'industriesSlabs') => {
    setConfig(prev => {
      const slabs = prev[field] && Array.isArray(prev[field]) ? [...prev[field]] : [];
      const lastTo = slabs.length > 0 ? slabs[slabs.length - 1].to : '0';
      const newFrom = lastTo === 'Above' ? '' : lastTo;
      slabs.push({ from: newFrom, to: '', rate: '' });
      return { ...prev, [field]: slabs };
    });
  };

  const removeSlab = (
    field: 'domesticSlabs' | 'nonDomesticSlabs' | 'commercialSlabs' | 'industriesSlabs',
    index: number
  ) => {
    setConfig(prev => {
      const slabs = prev[field] && Array.isArray(prev[field]) ? [...prev[field]] : [];
      slabs.splice(index, 1);
      return { ...prev, [field]: slabs };
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!config.ulbType) errs.ulbType = 'Required';
    if (!config.district) errs.district = 'Required';
    if (!config.ulb) errs.ulb = 'Required';
    if (!config.authorityType) errs.authorityType = 'Required';
    if (!config.meterCategory) errs.meterCategory = 'Required';
    if (!config.domesticCharge) errs.domesticCharge = 'Required';
    if (!config.nonDomesticCharge) errs.nonDomesticCharge = 'Required';
    if (!config.commercialCharge) errs.commercialCharge = 'Required';
    if (!config.industriesCharge) errs.industriesCharge = 'Required';
    if (!config.mudRoadCharge) errs.mudRoadCharge = 'Required';
    if (!config.metalRoadCharge) errs.metalRoadCharge = 'Required';
    if (!config.asphaltRoadCharge) errs.asphaltRoadCharge = 'Required';
    if (!config.concreteRoadCharge) errs.concreteRoadCharge = 'Required';
    if (!config.stonePavingCharge) errs.stonePavingCharge = 'Required';
    if (!config.securityDeposit) errs.securityDeposit = 'Required';
    if (config.isAdvanceAmount === 'yes') {
      if (!config.advanceMonths) errs.advanceMonths = 'Required';
    }
    if (config.isAdvanceAmount === 'no') {
      if (!config.monthlyCharges) errs.monthlyCharges = 'Required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setEffectiveDate('');
    setRemarks('');
    setRemarksErrors({});
    setShowRemarksModal(true);
  };

  const handleSubmitWithRemarks = async () => {
    const errs: Record<string, string> = {};
    if (!effectiveDate) errs.effectiveDate = 'Effective Date is required';
    if (!remarks.trim()) errs.remarks = 'Remarks is required';
    setRemarksErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    setShowRemarksModal(false);
    try {
      const ratePayload: any = {
        ...config,
        effectiveDate,
        remarks: remarks.trim(),
        submittedAt: new Date().toISOString(),
      };
      // If editing, include the id so the server updates it; otherwise, the server generates a new id
      if (editingId) {
        ratePayload.id = editingId;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/ulb-admin/tariff-rates`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ rate: ratePayload }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        setSuccessMsg(editingId ? 'Configuration updated successfully!' : 'Configuration saved successfully!');
        console.log('[TARIFF CONFIG] Configuration saved with effective date:', effectiveDate);
        await fetchAllConfigs();
        setMode('list');
        setEditingId(null);
      } else {
        const errMsg = data && data.error ? data.error : 'Unknown error';
        alert('Error saving configuration: ' + errMsg);
      }
    } catch (error) {
      console.error('[TARIFF CONFIG] Error saving:', error);
      alert('Error saving configuration: ' + error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    handleBackToList();
  };

  // ─── Table Columns (compositional API used below) ─────────────────────

  // ─── Loading ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-[#1f3a5f] animate-spin" />
          <span className="text-gray-600 font-['Poppins',sans-serif]">Loading tariff configurations...</span>
        </div>
      </div>
    );
  }

  // ─── Render: LIST MODE ──────────────────────────────────────────────────

  if (mode === 'list') {
    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">
              Tariff Rate Configuration
            </h1>
            <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
              Manage tariff rate configurations for water supply connections
            </p>
          </div>
          <GovButton variant="primary" onClick={handleNewConfig}>
            <Plus className="w-4 h-4" />
            New Configuration
          </GovButton>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800 font-['Poppins',sans-serif] font-medium">{successMsg}</p>
          </div>
        )}

        {/* Configurations Table */}
        <GovTable title="Tariff Rate Configurations" minWidth="1200px">
          <GovTableHeader>
            <GovTableHeaderCell width="60px" align="center">S.NO</GovTableHeaderCell>
            <GovTableHeaderCell width="160px">ULB TYPE</GovTableHeaderCell>
            <GovTableHeaderCell width="130px">DISTRICT</GovTableHeaderCell>
            <GovTableHeaderCell width="150px">ULB</GovTableHeaderCell>
            <GovTableHeaderCell width="120px" align="center">METER CATEGORY</GovTableHeaderCell>
            <GovTableHeaderCell width="120px" align="center">EFFECTIVE DATE</GovTableHeaderCell>
            <GovTableHeaderCell width="180px">REMARKS</GovTableHeaderCell>
            <GovTableHeaderCell width="100px" align="center">STATUS</GovTableHeaderCell>
            <GovTableHeaderCell width="140px" align="center">ACTIONS</GovTableHeaderCell>
          </GovTableHeader>
          <GovTableBody>
            {configList.length === 0 ? (
              <GovTableEmpty message="No tariff configurations found. Click 'New Configuration' to create one." colSpan={9} />
            ) : (
              configList.map((row: any, index: number) => {
                const effDate = row.effectiveDate;
                const today = new Date().toISOString().slice(0, 10);
                const isActive = effDate && effDate <= today;
                return (
                  <GovTableRow key={row.id || String(index)}>
                    <GovTableCell align="center">{index + 1}</GovTableCell>
                    <GovTableCell>{getUlbTypeLabel(row.ulbType)}</GovTableCell>
                    <GovTableCell>{row.district || 'N/A'}</GovTableCell>
                    <GovTableCell variant="id">{row.ulb || 'N/A'}</GovTableCell>
                    <GovTableCell align="center">{row.meterCategory || 'N/A'}</GovTableCell>
                    <GovTableCell align="center">{formatDateDisplay(row.effectiveDate || '')}</GovTableCell>
                    <GovTableCell>
                      <span className="truncate block max-w-[170px]" title={row.remarks || 'N/A'}>
                        {row.remarks || 'N/A'}
                      </span>
                    </GovTableCell>
                    <GovTableCell align="center">
                      <span className={
                        'inline-block px-2.5 py-1 rounded-full text-[12px] font-medium ' +
                        (isActive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')
                      }>
                        {isActive ? 'Active' : 'Upcoming'}
                      </span>
                    </GovTableCell>
                    <GovTableCell align="center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleViewConfig(row); }}
                          className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleEditConfig(row); }}
                          className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTargetId(row.id);
                            setShowDeleteModal(true);
                          }}
                          disabled={deleting === row.id}
                          className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === row.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </GovTableCell>
                  </GovTableRow>
                );
              })
            )}
          </GovTableBody>
        </GovTable>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-[420px] max-w-[90vw]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                  Confirm Delete
                </h2>
                <button
                  type="button"
                  onClick={() => { setShowDeleteModal(false); setDeleteTargetId(null); }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 py-5">
                <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif]">
                  Are you sure you want to delete this tariff rate configuration? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <GovButton
                  variant="outline"
                  onClick={() => { setShowDeleteModal(false); setDeleteTargetId(null); }}
                >
                  Cancel
                </GovButton>
                <button
                  type="button"
                  onClick={handleDeleteConfig}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[14px] font-medium font-['Poppins',sans-serif] rounded-md transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Render: FORM / VIEW MODE ───────────────────────────────────────────
  const isViewMode = mode === 'view';

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleBackToList}
          className="flex items-center gap-1.5 text-[14px] text-[#1f3a5f] font-medium font-['Poppins',sans-serif] mb-3 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Configurations
        </button>
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">
          {isViewMode ? 'View Configuration' : editingId ? 'Edit Configuration' : 'New Configuration'}
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
          {isViewMode
            ? 'Viewing tariff rate configuration details'
            : 'Configure tariff rates, connection charges, and deposits for water supply connections'}
        </p>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800 font-['Poppins',sans-serif] font-medium">{successMsg}</p>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-8 space-y-8">

          {/* ─── Section 1: Tariff Rates Configuration ────────────────── */}
          <div>
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Tariff Rates Configuration
            </h2>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-3 gap-x-8 gap-y-5 mb-6">
                <GovSelect
                  label="ULB Type"
                  required
                  placeholder="Select"
                  options={ULB_TYPE_OPTIONS}
                  value={config.ulbType}
                  onValueChange={(v) => handleChange('ulbType', v)}
                  error={errors.ulbType}
                  disabled={isViewMode}
                />
                <GovSelect
                  label="District"
                  required
                  placeholder="Select District"
                  options={DISTRICT_OPTIONS}
                  value={config.district}
                  onValueChange={(v) => {
                    handleChange('district', v);
                    handleChange('ulb', '');
                  }}
                  error={errors.district}
                  disabled={isViewMode}
                />
                <GovSelect
                  label="ULB"
                  required
                  placeholder="Select ULB"
                  options={ULB_OPTIONS[config.district] || []}
                  value={config.ulb}
                  onValueChange={(v) => handleChange('ulb', v)}
                  error={errors.ulb}
                  disabled={isViewMode}
                />
                <GovSelect
                  label="Authority Type"
                  required
                  placeholder="Select"
                  options={AUTHORITY_TYPE_OPTIONS}
                  value={config.authorityType}
                  onValueChange={(v) => handleChange('authorityType', v)}
                  error={errors.authorityType}
                  disabled={isViewMode}
                />
                <GovSelect
                  label="Meter Category"
                  required
                  placeholder="Select"
                  options={METER_CATEGORY_OPTIONS}
                  value={config.meterCategory}
                  onValueChange={(v) => handleChange('meterCategory', v)}
                  error={errors.meterCategory}
                  disabled={isViewMode}
                />
              </div>

              {/* Connection Type with Pipe Sizes */}
              <div>
                <label className="block text-[14px] font-medium text-gray-700 mb-3 font-['Poppins',sans-serif]">
                  Connection Type <span className="text-red-600 ml-1">*</span>
                </label>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className={'grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1' + (isViewMode ? ' pointer-events-none opacity-80' : '')}>
                    <PipeSizeCheckboxGroup
                      label="Domestic"
                      sizes={DOMESTIC_PIPE_SIZES}
                      selectedSizes={config.domesticPipeSizes}
                      onChange={(sizes) => handlePipeSizeChange('domesticPipeSizes', sizes)}
                    />
                    <PipeSizeCheckboxGroup
                      label="Commercial"
                      sizes={COMMERCIAL_PIPE_SIZES}
                      selectedSizes={config.commercialPipeSizes}
                      onChange={(sizes) => handlePipeSizeChange('commercialPipeSizes', sizes)}
                    />
                    <PipeSizeCheckboxGroup
                      label="Non-Domestic"
                      sizes={NON_DOMESTIC_PIPE_SIZES}
                      selectedSizes={config.nonDomesticPipeSizes}
                      onChange={(sizes) => handlePipeSizeChange('nonDomesticPipeSizes', sizes)}
                    />
                    <PipeSizeCheckboxGroup
                      label="Industries"
                      sizes={INDUSTRIES_PIPE_SIZES}
                      selectedSizes={config.industriesPipeSizes}
                      onChange={(sizes) => handlePipeSizeChange('industriesPipeSizes', sizes)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Section 2: New Tap Connection Charges ─────────────────── */}
          <div>
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              New Tap Connection Charges
            </h2>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                <GovInput
                  label="Domestic (in Rs.)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.domesticCharge}
                  onChange={(e) => handleChange('domesticCharge', e.target.value)}
                  error={errors.domesticCharge}
                  disabled={isViewMode}
                />
                <GovInput
                  label="Non-Domestic (in Rs.)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.nonDomesticCharge}
                  onChange={(e) => handleChange('nonDomesticCharge', e.target.value)}
                  error={errors.nonDomesticCharge}
                  disabled={isViewMode}
                />
                <GovInput
                  label="Commercial (in Rs.)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.commercialCharge}
                  onChange={(e) => handleChange('commercialCharge', e.target.value)}
                  error={errors.commercialCharge}
                  disabled={isViewMode}
                />
                <GovInput
                  label="Industries (in Rs.)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.industriesCharge}
                  onChange={(e) => handleChange('industriesCharge', e.target.value)}
                  error={errors.industriesCharge}
                  disabled={isViewMode}
                />
                <GovInput
                  label="Security Deposit (in Rs.)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.securityDeposit}
                  onChange={(e) => handleChange('securityDeposit', e.target.value)}
                  error={errors.securityDeposit}
                  disabled={isViewMode}
                />
                <GovRadio
                  label="Road Cutting Charges As"
                  required
                  name="roadCuttingChargeAs"
                  options={ROAD_CUTTING_CHARGE_OPTIONS}
                  value={config.roadCuttingChargeAs}
                  onChange={(v) => handleChange('roadCuttingChargeAs', v)}
                  disabled={isViewMode}
                />
                <GovInput
                  label="Length in Meter"
                  required
                  type="text"
                  placeholder="0 Meters"
                  value={config.lengthInMeter}
                  onChange={(e) => handleChange('lengthInMeter', e.target.value)}
                  error={errors.lengthInMeter}
                  disabled={isViewMode}
                />
                <GovInput
                  label="Stone Paving Charges (in Rs.)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.stonePavingCharge}
                  onChange={(e) => handleChange('stonePavingCharge', e.target.value)}
                  error={errors.stonePavingCharge}
                  disabled={isViewMode}
                />
                <GovInput
                  label="Mud Road (in Rs.)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.mudRoadCharge}
                  onChange={(e) => handleChange('mudRoadCharge', e.target.value)}
                  error={errors.mudRoadCharge}
                  disabled={isViewMode}
                />
                <GovInput
                  label="Metal Road (in Rs.)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.metalRoadCharge}
                  onChange={(e) => handleChange('metalRoadCharge', e.target.value)}
                  error={errors.metalRoadCharge}
                  disabled={isViewMode}
                />
                <GovInput
                  label="Asphalt Road (in Rs.)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.asphaltRoadCharge}
                  onChange={(e) => handleChange('asphaltRoadCharge', e.target.value)}
                  error={errors.asphaltRoadCharge}
                  disabled={isViewMode}
                />
                <GovInput
                  label="Concrete Road (in Rs.)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.concreteRoadCharge}
                  onChange={(e) => handleChange('concreteRoadCharge', e.target.value)}
                  error={errors.concreteRoadCharge}
                  disabled={isViewMode}
                />
              </div>
            </div>
          </div>

          {/* ─── Section 3: Advance Amount & Penalty ───────────────────── */}
          <div>
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Advance Amount & Penalty
            </h2>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 space-y-5">
              {/* Row 1: Upfront Amount toggle + conditional field */}
              <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                <GovRadio
                  label="Is Upfront Amount being taken?"
                  required
                  name="isAdvanceAmount"
                  options={ADVANCE_OPTIONS}
                  value={config.isAdvanceAmount}
                  onChange={(v) => handleChange('isAdvanceAmount', v)}
                  disabled={isViewMode}
                />
                {config.isAdvanceAmount === 'yes' && (
                  <GovInput
                    label="How Many Months"
                    required
                    type="number"
                    placeholder="0"
                    value={config.advanceMonths}
                    onChange={(e) => handleChange('advanceMonths', e.target.value)}
                    disabled={isViewMode}
                    error={errors.advanceMonths}
                  />
                )}
                {config.isAdvanceAmount === 'no' && (
                  <GovInput
                    label="Monthly Charges (in Rs.)"
                    required
                    type="number"
                    placeholder="0"
                    value={config.monthlyCharges}
                    onChange={(e) => handleChange('monthlyCharges', e.target.value)}
                    disabled={isViewMode}
                    error={errors.monthlyCharges}
                  />
                )}
              </div>
              {/* Row 2: Penalty & Interest */}
              <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                <GovSelect
                  label="Penalty Reason"
                  required
                  placeholder="Select Reason"
                  options={PENALTY_REASON_OPTIONS}
                  value={config.penaltyReason}
                  onValueChange={(v) => handleChange('penaltyReason', v)}
                  error={errors.penaltyReason}
                  disabled={isViewMode}
                />
                <GovInput
                  label="Penalty Amount (in Rs.)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.penaltyAmount}
                  onChange={(e) => handleChange('penaltyAmount', e.target.value)}
                  error={errors.penaltyAmount}
                  disabled={isViewMode}
                />
                <GovInput
                  label="Rate of Interest for DCB (%)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.rateOfInterestDCB}
                  onChange={(e) => handleChange('rateOfInterestDCB', e.target.value)}
                  error={errors.rateOfInterestDCB}
                  disabled={isViewMode}
                />
              </div>
            </div>
          </div>

          {/* ─── Section 4: Slab Rates ─────────────────────────────────── */}
          <div>
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Slab Rates
            </h2>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">

              {/* Sub-section: Metered Water Supply */}
              <div>
                <h3 className="text-[16px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
                  Metered Water Supply
                </h3>
                <div className="grid grid-cols-2 gap-5">
                  {([
                    { label: 'Domestic', field: 'domesticSlabs' as const },
                    { label: 'Non-Domestic', field: 'nonDomesticSlabs' as const },
                    { label: 'Commercial', field: 'commercialSlabs' as const },
                    { label: 'Industries', field: 'industriesSlabs' as const },
                  ]).map(({ label, field }) => {
                    const slabs = config[field] && Array.isArray(config[field]) ? config[field] : [];
                    return (
                      <div key={field} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {/* Card Header */}
                        <div className="bg-[#1f3a5f] px-4 py-2.5 flex items-center justify-between">
                          <span className="text-[13px] font-semibold text-white font-['Poppins',sans-serif]">
                            {label}
                          </span>
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={() => addSlab(field)}
                              className="flex items-center gap-1 text-[12px] text-white/80 hover:text-white font-['Poppins',sans-serif] transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Slab
                            </button>
                          )}
                        </div>
                        {/* Table Header */}
                        <div className={'grid gap-0 border-b border-gray-200 bg-gray-50' + (isViewMode ? ' grid-cols-3' : ' grid-cols-[1fr_1fr_1fr_36px]')}>
                          <div className="px-3 py-2 text-[12px] font-semibold text-gray-600 font-['Poppins',sans-serif] uppercase tracking-wide">
                            From (KL)
                          </div>
                          <div className="px-3 py-2 text-[12px] font-semibold text-gray-600 font-['Poppins',sans-serif] uppercase tracking-wide">
                            To (KL)
                          </div>
                          <div className="px-3 py-2 text-[12px] font-semibold text-gray-600 font-['Poppins',sans-serif] uppercase tracking-wide">
                            Rate (Rs.)
                          </div>
                          {!isViewMode && <div className="px-1 py-2" />}
                        </div>
                        {/* Table Rows */}
                        {slabs.length === 0 && (
                          <div className="px-3 py-4 text-center text-[13px] text-gray-400 font-['Poppins',sans-serif]">
                            No slabs configured
                          </div>
                        )}
                        {slabs.map((slab: SlabRate, idx: number) => (
                          <div
                            key={field + '-slab-' + idx}
                            className={'grid gap-0 border-b border-gray-100 last:border-b-0 items-center' + (isViewMode ? ' grid-cols-3' : ' grid-cols-[1fr_1fr_1fr_36px]')}
                          >
                            <div className="px-2 py-1.5">
                              {isViewMode ? (
                                <span className="px-2 py-1.5 text-[13px] font-['Poppins',sans-serif] text-gray-700">{slab.from || 'N/A'}</span>
                              ) : (
                                <input
                                  type="text"
                                  value={slab.from}
                                  onChange={(e) => handleSlabChange(field, idx, 'from', e.target.value)}
                                  className="w-full px-2 py-1.5 text-[13px] bg-transparent border border-gray-200 rounded focus:border-[#1f3a5f] focus:ring-1 focus:ring-[#1f3a5f]/20 outline-none font-['Poppins',sans-serif] text-gray-700"
                                  placeholder="0"
                                />
                              )}
                            </div>
                            <div className="px-2 py-1.5">
                              {isViewMode ? (
                                <span className="px-2 py-1.5 text-[13px] font-['Poppins',sans-serif] text-gray-700">{slab.to || 'N/A'}</span>
                              ) : (
                                <input
                                  type="text"
                                  value={slab.to}
                                  onChange={(e) => handleSlabChange(field, idx, 'to', e.target.value)}
                                  className="w-full px-2 py-1.5 text-[13px] bg-transparent border border-gray-200 rounded focus:border-[#1f3a5f] focus:ring-1 focus:ring-[#1f3a5f]/20 outline-none font-['Poppins',sans-serif] text-gray-700"
                                  placeholder="Above"
                                />
                              )}
                            </div>
                            <div className="px-2 py-1.5">
                              {isViewMode ? (
                                <span className="px-2 py-1.5 text-[13px] font-['Poppins',sans-serif] text-gray-700">{slab.rate || 'N/A'}</span>
                              ) : (
                                <input
                                  type="number"
                                  value={slab.rate}
                                  onChange={(e) => handleSlabChange(field, idx, 'rate', e.target.value)}
                                  className="w-full px-2 py-1.5 text-[13px] bg-transparent border border-gray-200 rounded focus:border-[#1f3a5f] focus:ring-1 focus:ring-[#1f3a5f]/20 outline-none font-['Poppins',sans-serif] text-gray-700"
                                  placeholder="0"
                                />
                              )}
                            </div>
                            {!isViewMode && (
                              <div className="flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => removeSlab(field, idx)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
                                  title="Remove slab"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sub-section: Non-Metered Water Supply */}
              <div className="mt-6 pt-5 border-t border-gray-200">
                <h3 className="text-[16px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
                  Non-Metered Water Supply
                </h3>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-[160px_repeat(6,1fr)] gap-0 bg-[#1f3a5f]">
                    <div className="px-4 py-3 text-[12px] font-semibold text-white font-['Poppins',sans-serif] uppercase tracking-wide">
                      Connection Type
                    </div>
                    {['1/2"', '3/4"', '1"', '2"', '4"', '6"'].map(size => (
                      <div key={size} className="px-3 py-3 text-[12px] font-semibold text-white font-['Poppins',sans-serif] uppercase tracking-wide text-center">
                        {size}
                      </div>
                    ))}
                  </div>
                  {/* Table Body Rows */}
                  {(() => {
                    const pipeSizeToKey: Record<string, keyof NonMeteredRate> = {
                      '1/2"': 'half',
                      '3/4"': 'threeQuarter',
                      '1"': 'one',
                      '2"': 'two',
                      '4"': 'four',
                      '6"': 'six',
                    };
                    const rows = [
                      { label: 'Domestic', field: 'nonMeteredDomestic' as const, selectedSizes: config.domesticPipeSizes },
                      { label: 'Non-Domestic', field: 'nonMeteredNonDomestic' as const, selectedSizes: config.nonDomesticPipeSizes },
                      { label: 'Commercial', field: 'nonMeteredCommercial' as const, selectedSizes: config.commercialPipeSizes },
                      { label: 'Industries', field: 'nonMeteredIndustries' as const, selectedSizes: config.industriesPipeSizes },
                    ];
                    const pipeKeys: (keyof NonMeteredRate)[] = ['half', 'threeQuarter', 'one', 'two', 'four', 'six'];
                    return rows.map(({ label, field, selectedSizes }, rowIdx) => {
                      const rates = config[field] && typeof config[field] === 'object' ? config[field] : defaultConfig[field];
                      const applicableKeys = Array.isArray(selectedSizes)
                        ? selectedSizes.map(s => pipeSizeToKey[s]).filter(Boolean)
                        : [];
                      return (
                        <div
                          key={field}
                          className={'grid grid-cols-[160px_repeat(6,1fr)] gap-0 items-center' + (rowIdx < 3 ? ' border-b border-gray-200' : '')}
                        >
                          <div className="px-4 py-3 text-[13px] font-medium text-[#1f3a5f] font-['Poppins',sans-serif] bg-gray-50">
                            {label}
                          </div>
                          {pipeKeys.map(key => {
                            const isApplicable = applicableKeys.includes(key);
                            return (
                              <div key={key} className="px-2 py-2 text-center">
                                {isApplicable ? (
                                  isViewMode ? (
                                    <span className="text-[13px] font-['Poppins',sans-serif] text-gray-700">{rates[key] || 'N/A'}</span>
                                  ) : (
                                    <input
                                      type="number"
                                      value={rates[key]}
                                      onChange={(e) => handleNonMeteredChange(field, key, e.target.value)}
                                      className="w-full px-2 py-1.5 text-[13px] bg-transparent border border-gray-200 rounded focus:border-[#1f3a5f] focus:ring-1 focus:ring-[#1f3a5f]/20 outline-none font-['Poppins',sans-serif] text-gray-700 text-center"
                                      placeholder="0"
                                    />
                                  )
                                ) : (
                                  <span className="text-[13px] text-gray-400 font-['Poppins',sans-serif] font-medium">NA</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

            </div>
          </div>

          {/* ─── Section 5: UGD Connection ─────────────────────────────── */}
          <div>
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              UGD Connection
            </h2>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                <GovRadio
                  label="Do you want to include UGD Bill details with Tap Connection Bill?"
                  required
                  name="ugdIncludeWithTap"
                  options={ADVANCE_OPTIONS}
                  value={config.ugdIncludeWithTap}
                  onChange={(v) => handleChange('ugdIncludeWithTap', v)}
                  disabled={isViewMode}
                />
                <GovRadio
                  label="Is UGD Available?"
                  required
                  name="ugdAvailable"
                  options={ADVANCE_OPTIONS}
                  value={config.ugdAvailable}
                  onChange={(v) => handleChange('ugdAvailable', v)}
                  disabled={isViewMode}
                />
                <div />
                <GovInput
                  label="Domestic (in Rs.)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.ugdDomesticCharge}
                  onChange={(e) => handleChange('ugdDomesticCharge', e.target.value)}
                  disabled={config.ugdAvailable !== 'yes' || isViewMode}
                />
                <GovInput
                  label="Non-Domestic (in Rs.)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.ugdNonDomesticCharge}
                  onChange={(e) => handleChange('ugdNonDomesticCharge', e.target.value)}
                  disabled={config.ugdAvailable !== 'yes' || isViewMode}
                />
                <GovInput
                  label="Commercial (in Rs.)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.ugdCommercialCharge}
                  onChange={(e) => handleChange('ugdCommercialCharge', e.target.value)}
                  disabled={config.ugdAvailable !== 'yes' || isViewMode}
                />
                <GovInput
                  label="Industries (in Rs.)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.ugdIndustriesCharge}
                  onChange={(e) => handleChange('ugdIndustriesCharge', e.target.value)}
                  disabled={config.ugdAvailable !== 'yes' || isViewMode}
                />
                <GovRadio
                  label="UGD Registration Fees?"
                  required
                  name="ugdRegistrationFees"
                  options={ADVANCE_OPTIONS}
                  value={config.ugdRegistrationFees}
                  onChange={(v) => handleChange('ugdRegistrationFees', v)}
                  disabled={isViewMode}
                />
                <GovInput
                  label="Amount (in Rs.)"
                  required={config.ugdRegistrationFees === 'yes'}
                  type="number"
                  placeholder="0"
                  value={config.ugdRegistrationAmount}
                  onChange={(e) => handleChange('ugdRegistrationAmount', e.target.value)}
                  disabled={config.ugdRegistrationFees !== 'yes' || isViewMode}
                />
                <GovInput
                  label="Stone Paving Charges (in Rs.)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.ugdStonePavingCharge}
                  onChange={(e) => handleChange('ugdStonePavingCharge', e.target.value)}
                  disabled={isViewMode}
                />
                <GovSelect
                  label="Penalty Reasons"
                  required
                  placeholder="Select Reason"
                  options={PENALTY_REASON_OPTIONS}
                  value={config.ugdPenaltyReason}
                  onValueChange={(v) => handleChange('ugdPenaltyReason', v)}
                  disabled={isViewMode}
                />
                <GovInput
                  label="Penalty Amount (in Rs.)"
                  required
                  type="number"
                  placeholder="0"
                  value={config.ugdPenaltyAmount}
                  onChange={(e) => handleChange('ugdPenaltyAmount', e.target.value)}
                  disabled={isViewMode}
                />
                <GovInput
                  label="Other Charges (in Rs.)"
                  type="number"
                  placeholder="0"
                  value={config.ugdOtherCharges}
                  onChange={(e) => handleChange('ugdOtherCharges', e.target.value)}
                  disabled={isViewMode}
                />
              </div>
            </div>
          </div>

          {/* ─── Section 6: Bill Generation Period ──────────────────────── */}
          <div>
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Bill Generation Period
            </h2>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-5 leading-relaxed">
                Define the billing period for which water supply bills will be generated. Select the start and end dates of the billing cycle.
              </p>
              <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                {/* From Date */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#414141] font-['Poppins',sans-serif] mb-1.5">
                    Period From <span className="text-red-500">*</span>
                  </label>
                  <GovDatePicker
                    value={config.billGenerationPeriodFrom}
                    onChange={(v) => handleChange('billGenerationPeriodFrom', v)}
                    placeholder="DD/MM/YYYY"
                    disabled={isViewMode}
                    error={!!(errors as any).billGenerationPeriodFrom}
                  />
                  {(errors as any).billGenerationPeriodFrom && (
                    <p className="mt-1 text-[11px] text-red-500 font-['Poppins',sans-serif]">{(errors as any).billGenerationPeriodFrom}</p>
                  )}
                </div>

                {/* To Date */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#414141] font-['Poppins',sans-serif] mb-1.5">
                    Period To <span className="text-red-500">*</span>
                  </label>
                  <GovDatePicker
                    value={config.billGenerationPeriodTo}
                    onChange={(v) => handleChange('billGenerationPeriodTo', v)}
                    placeholder="DD/MM/YYYY"
                    disabled={isViewMode}
                    error={!!(errors as any).billGenerationPeriodTo}
                  />
                  {(errors as any).billGenerationPeriodTo && (
                    <p className="mt-1 text-[11px] text-red-500 font-['Poppins',sans-serif]">{(errors as any).billGenerationPeriodTo}</p>
                  )}
                </div>

                {/* Period Summary */}
                <div className="flex items-end">
                  {config.billGenerationPeriodFrom && config.billGenerationPeriodTo && (
                    <div className="w-full bg-[#1f3a5f]/5 border border-[#1f3a5f]/15 rounded-lg px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 font-['Poppins',sans-serif] font-medium mb-1">
                        Billing Duration
                      </p>
                      {(() => {
                        const from = new Date(config.billGenerationPeriodFrom + 'T00:00:00');
                        const to = new Date(config.billGenerationPeriodTo + 'T00:00:00');
                        if (isNaN(from.getTime()) || isNaN(to.getTime())) return null;
                        const diffTime = to.getTime() - from.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const diffMonths = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
                        const isValid = diffDays > 0;
                        const fromDisplay = from.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                        const toDisplay = to.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                        return isValid ? (
                          <div>
                            <p className="text-[14px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                              {diffMonths > 0 ? diffMonths + (diffMonths === 1 ? ' Month' : ' Months') : diffDays + (diffDays === 1 ? ' Day' : ' Days')}
                            </p>
                            <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] mt-0.5">
                              {fromDisplay} — {toDisplay}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[12px] font-medium text-red-500 font-['Poppins',sans-serif]">
                            End date must be after start date
                          </p>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Action Buttons ────────────────────────────────────────── */}
          <div className="flex justify-end gap-4 mt-6">
            {isViewMode ? (
              <>
                <GovButton variant="outline" onClick={handleBackToList}>
                  Back to List
                </GovButton>
                <GovButton
                  variant="primary"
                  onClick={() => setMode('form')}
                >
                  <Pencil className="w-4 h-4" />
                  Edit Configuration
                </GovButton>
              </>
            ) : (
              <>
                <GovButton
                  variant="outline"
                  onClick={handleReset}
                  disabled={saving}
                >
                  Cancel
                </GovButton>
                <GovButton
                  variant="primary"
                  onClick={handleSave}
                  loading={saving}
                >
                  <Save className="w-4 h-4" />
                  Save Configuration
                </GovButton>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Remarks Modal */}
      {showRemarksModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-[480px] max-w-[90vw]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                Remarks:
              </h2>
              <button
                type="button"
                onClick={() => setShowRemarksModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Effective Date */}
              <div>
                <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                  Effective Date<span className="text-red-600 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <GovDatePicker
                    value={effectiveDate}
                    onChange={(date) => {
                      setEffectiveDate(date);
                      if (remarksErrors.effectiveDate) {
                        setRemarksErrors(prev => { const n = { ...prev }; delete n.effectiveDate; return n; });
                      }
                    }}
                    error={!!remarksErrors.effectiveDate}
                  />
                </div>
                {remarksErrors.effectiveDate && (
                  <p className="mt-1.5 text-[13px] text-red-600 font-['Poppins',sans-serif]">{remarksErrors.effectiveDate}</p>
                )}
              </div>

              {/* Remarks Textarea */}
              <div>
                <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                  Remarks<span className="text-red-600 ml-0.5">*</span>:
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => {
                    setRemarks(e.target.value);
                    if (remarksErrors.remarks) {
                      setRemarksErrors(prev => { const n = { ...prev }; delete n.remarks; return n; });
                    }
                  }}
                  rows={4}
                  placeholder="Enter remarks for this configuration change..."
                  className={
                    "w-full px-4 py-2.5 font-['Poppins',sans-serif] text-[14px] text-gray-900 bg-white border-[1.5px] rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] hover:border-gray-400 resize-none" +
                    (remarksErrors.remarks ? ' border-red-500 focus:border-red-500 focus:ring-red-500/20' : ' border-gray-300')
                  }
                />
                {remarksErrors.remarks && (
                  <p className="mt-1.5 text-[13px] text-red-600 font-['Poppins',sans-serif]">{remarksErrors.remarks}</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-center gap-4 px-6 py-4 border-t border-gray-200">
              <GovButton
                variant="primary"
                onClick={handleSubmitWithRemarks}
                loading={saving}
              >
                Submit
              </GovButton>
              <GovButton
                variant="outline"
                onClick={() => setShowRemarksModal(false)}
                disabled={saving}
              >
                Cancel
              </GovButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

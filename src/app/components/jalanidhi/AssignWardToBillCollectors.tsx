import { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle, ChevronLeft, Save, MapPin, Send, Eye, X, Pencil } from 'lucide-react';
import { GovInput } from '../ui/gov-input';
import { GovSelect } from '../ui/gov-select';
import { GovButton } from '../ui/gov-button';
import { GovTable, GovTableHeader, GovTableHeaderCell, GovTableBody, GovTableRow, GovTableCell, GovTableEmpty, GovTableLoading } from '../ui/gov-table';
import { GovDatePicker } from '../ui/gov-date-picker';
import { GovMultiSelect } from '../ui/gov-multi-select';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

// ─── Types ──────────────────────────────────────────────────────────────────

interface BillCollectorRecord {
  id: string;
  billCollectorId: string;
  district: string;
  ulb: string;
  ulbType: string;
  zone: string;
  authorityType: string;
  plumberType: string;
  selectedPlumberId: string;
  selectedPlumberName: string;
  plumberDetails: any;
  bcFullName: string;
  bcDateOfBirth: string;
  bcAddress: string;
  bcDistrict: string;
  bcCity: string;
  bcState: string;
  bcPincode: string;
  bcDesignation: string;
  bcEmployeeType: string;
  bcPhoneNo: string;
  bcEmail: string;
  bcActive: boolean;
  bcSupportingDoc: string;
  bcPhotoCopy: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface WardAssignment {
  id: string;
  billCollectorId: string;
  billCollectorName: string;
  billCollectorRecordId: string;
  wardNumbers: string[];
  billingDays: string;
  billingStartDate: string;
  billingEndDate: string;
  billingMachineNo: string;
  assetId: string;
  effectiveDate: string;
  remarks: string;
  status: string;
  assignedDate: string;
  createdAt: string;
  updatedAt: string;
}

interface AssignmentForm {
  wardNumbers: string[];
  billingDays: string;
  billingStartDate: string;
  billingEndDate: string;
  billingMachineNo: string;
  assetId: string;
  effectiveDate: string;
  remarks: string;
}

// ─── Options ────────────────────────────────────────────────────────────────

const WARD_OPTIONS = [
  { value: 'Ward 1', label: 'Ward 1' },
  { value: 'Ward 2', label: 'Ward 2' },
  { value: 'Ward 3', label: 'Ward 3' },
  { value: 'Ward 4', label: 'Ward 4' },
  { value: 'Ward 5', label: 'Ward 5' },
  { value: 'Ward 6', label: 'Ward 6' },
  { value: 'Ward 7', label: 'Ward 7' },
  { value: 'Ward 8', label: 'Ward 8' },
  { value: 'Ward 9', label: 'Ward 9' },
  { value: 'Ward 10', label: 'Ward 10' },
  { value: 'Ward 11', label: 'Ward 11' },
  { value: 'Ward 12', label: 'Ward 12' },
  { value: 'Ward 13', label: 'Ward 13' },
  { value: 'Ward 14', label: 'Ward 14' },
  { value: 'Ward 15', label: 'Ward 15' },
];

const BILLING_DAY_OPTIONS = [
  { value: '1st-10th', label: '1st - 10th' },
  { value: '11th-20th', label: '11th - 20th' },
  { value: '21st-End', label: '21st - End of Month' },
  { value: 'All Month', label: 'All Month' },
];

const EMPTY_FORM: AssignmentForm = {
  wardNumbers: [],
  billingDays: '',
  billingStartDate: '',
  billingEndDate: '',
  billingMachineNo: '',
  assetId: '',
  effectiveDate: '',
  remarks: '',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return 'N/A';
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

function formatDesignation(val: string): string {
  if (!val) return 'N/A';
  if (val === 'bill-collector') return 'Bill Collector';
  if (val === 'senior-bill-collector') return 'Senior Bill Collector';
  if (val === 'meter-reader') return 'Meter Reader';
  return val;
}

function formatEmployeeType(val: string): string {
  if (!val) return 'N/A';
  return val.charAt(0).toUpperCase() + val.slice(1);
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AssignWardToBillCollectors() {
  // ─── Page state ─────────────────────────────────────────────────────────
  const [page, setPage] = useState<'list' | 'assign' | 'view'>(() => {
    const saved = localStorage.getItem('assignWard_page');
    return (saved === 'assign' || saved === 'view') ? saved : 'list';
  });

  // ─── Data ───────────────────────────────────────────────────────────────
  const [collectors, setCollectors] = useState<BillCollectorRecord[]>([]);
  const [assignments, setAssignments] = useState<WardAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Selected collector ────────────────────────────────────────────────
  const [selectedCollector, setSelectedCollector] = useState<BillCollectorRecord | null>(() => {
    const saved = localStorage.getItem('assignWard_selectedCollector');
    return saved ? JSON.parse(saved) : null;
  });

  // ─── Assignment form ────────────────────────────────────────────────────
  const [form, setForm] = useState<AssignmentForm>(() => {
    const saved = localStorage.getItem('assignWard_form');
    return saved ? JSON.parse(saved) : EMPTY_FORM;
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');

  // ─── View assignment state ──────────────────────────────────────────────
  const [viewAssignment, setViewAssignment] = useState<WardAssignment | null>(() => {
    const saved = localStorage.getItem('assignWard_viewAssignment');
    return saved ? JSON.parse(saved) : null;
  });

  // ─── Persist state ──────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem('assignWard_page', page); }, [page]);
  useEffect(() => {
    if (selectedCollector) {
      localStorage.setItem('assignWard_selectedCollector', JSON.stringify(selectedCollector));
    } else {
      localStorage.removeItem('assignWard_selectedCollector');
    }
  }, [selectedCollector]);
  useEffect(() => { localStorage.setItem('assignWard_form', JSON.stringify(form)); }, [form]);
  useEffect(() => {
    if (viewAssignment) {
      localStorage.setItem('assignWard_viewAssignment', JSON.stringify(viewAssignment));
    } else {
      localStorage.removeItem('assignWard_viewAssignment');
    }
  }, [viewAssignment]);

  // ─── Fetch data ─────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [collRes, assignRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-698be164/meter-management/bill-collectors`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-698be164/meter-management/ward-assignments`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
        }),
      ]);
      const collData = await collRes.json();
      const assignData = await assignRes.json();
      if (collData && collData.success && collData.collectors) {
        setCollectors(collData.collectors);
      }
      if (assignData && assignData.success && assignData.assignments) {
        setAssignments(assignData.assignments);
      }
    } catch (error) {
      console.error('[ASSIGN WARD] Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ─── Get assigned status for a collector ────────────────────────────────
  const getAssignedStatus = (collectorId: string): string => {
    const found = assignments.find((a) => a.billCollectorRecordId === collectorId);
    if (found && found.status) return found.status;
    return 'Not Assigned';
  };

  // ─── Get assignment for a collector ─────────────────────────────────────
  const getAssignmentForCollector = (collectorId: string): WardAssignment | null => {
    const found = assignments.find((a) => a.billCollectorRecordId === collectorId);
    return found || null;
  };

  // ─── Filtered collectors ────────────────────────────────────────────────
  const filteredCollectors = collectors.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = c && c.bcFullName ? c.bcFullName.toLowerCase() : '';
    const cid = c && c.billCollectorId ? c.billCollectorId.toLowerCase() : '';
    const phone = c && c.bcPhoneNo ? c.bcPhoneNo.toLowerCase() : '';
    return name.indexOf(q) !== -1 || cid.indexOf(q) !== -1 || phone.indexOf(q) !== -1;
  });

  // ─── Handle Assign button click ────────────────────────────────────────
  const handleAssignClick = (collector: BillCollectorRecord) => {
    setSelectedCollector(collector);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setSuccessMsg('');
    setPage('assign');
  };

  // ─── Handle Edit existing assignment ───────────────────────────────────
  const handleEditClick = (collector: BillCollectorRecord) => {
    const existing = assignments.find((a) => a.billCollectorRecordId === collector.id);
    if (existing) {
      setSelectedCollector(collector);
      setForm({
        wardNumbers: existing.wardNumbers && existing.wardNumbers.length > 0 ? existing.wardNumbers : [],
        billingDays: existing.billingDays || '',
        billingStartDate: existing.billingStartDate || '',
        billingEndDate: existing.billingEndDate || '',
        billingMachineNo: existing.billingMachineNo || '',
        assetId: existing.assetId || '',
        effectiveDate: existing.effectiveDate || '',
        remarks: existing.remarks || '',
      });
      setFormErrors({});
      setSuccessMsg('');
      setPage('assign');
    }
  };

  // ─── Handle View assignment ────────────────────────────────────────────
  const handleViewClick = (assignment: WardAssignment) => {
    setViewAssignment(assignment);
    setPage('view');
  };

  // ─── Validate form ─────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.wardNumbers || form.wardNumbers.length === 0) errors.wardNumbers = 'At least one ward is required';
    if (!form.billingDays) errors.billingDays = 'Billing days is required';
    if (!form.billingStartDate) errors.billingStartDate = 'Billing start date is required';
    if (!form.billingEndDate) errors.billingEndDate = 'Billing end date is required';
    if (!form.effectiveDate) errors.effectiveDate = 'Effective date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Save assignment ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateForm()) return;
    if (!selectedCollector) return;
    setSaving(true);
    try {
      const existingAssignment = assignments.find((a) => a.billCollectorRecordId === selectedCollector.id);
      const assignment: any = {
        ...form,
        billCollectorId: selectedCollector.billCollectorId,
        billCollectorName: selectedCollector.bcFullName,
        billCollectorRecordId: selectedCollector.id,
        status: 'Assigned',
        assignedDate: new Date().toISOString(),
      };
      if (existingAssignment) {
        assignment.id = existingAssignment.id;
      }
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/meter-management/ward-assignments`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignment }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        setSuccessMsg(existingAssignment ? 'Ward assignment updated successfully!' : 'Ward assignment saved successfully!');
        await fetchData();
        setTimeout(() => {
          setSuccessMsg('');
          setPage('list');
          setSelectedCollector(null);
          setForm(EMPTY_FORM);
        }, 1500);
      } else {
        console.error('[ASSIGN WARD] Save failed:', data && data.error ? data.error : 'Unknown error');
      }
    } catch (error) {
      console.error('[ASSIGN WARD] Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  // ─── Forward to Field Engineer ─────────────────────────────────────────
  const handleForwardToFE = async () => {
    if (!validateForm()) return;
    if (!selectedCollector) return;
    setSaving(true);
    try {
      const existingAssignment = assignments.find((a) => a.billCollectorRecordId === selectedCollector.id);
      const assignment: any = {
        ...form,
        billCollectorId: selectedCollector.billCollectorId,
        billCollectorName: selectedCollector.bcFullName,
        billCollectorRecordId: selectedCollector.id,
        status: 'Sent for Approval',
        assignedDate: new Date().toISOString(),
      };
      if (existingAssignment) {
        assignment.id = existingAssignment.id;
      }
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/meter-management/ward-assignments`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignment }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        setSuccessMsg('Ward assignment sent for approval to Field Engineer!');
        await fetchData();
        setTimeout(() => {
          setSuccessMsg('');
          setPage('list');
          setSelectedCollector(null);
          setForm(EMPTY_FORM);
        }, 1500);
      } else {
        console.error('[ASSIGN WARD] Forward failed:', data && data.error ? data.error : 'Unknown error');
      }
    } catch (error) {
      console.error('[ASSIGN WARD] Error forwarding:', error);
    } finally {
      setSaving(false);
    }
  };

  // ─── Back to list ──────────────────────────────────────────────────────
  const handleBackToList = () => {
    setPage('list');
    setSelectedCollector(null);
    setViewAssignment(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setSuccessMsg('');
  };

  // ─── Update form field ─────────────────────────────────────────────────
  const updateForm = (field: keyof AssignmentForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // =====================================================================
  // RENDER: ASSIGN FORM PAGE
  // =====================================================================
  if (page === 'assign' && selectedCollector) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        {/* Back Button */}
        <button
          onClick={handleBackToList}
          className="flex items-center gap-1.5 text-[14px] text-[#1f3a5f] font-medium font-['Poppins',sans-serif] mb-3 hover:underline cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to List
        </button>

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">
          Assign Ward to Bill Collector
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-6">
          Assign ward numbers and billing details for <span className="font-semibold text-[#1f3a5f]">{selectedCollector.bcFullName}</span> ({selectedCollector.billCollectorId})
        </p>

        {/* Success Message */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-800 font-medium font-['Poppins',sans-serif]">{successMsg}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-8">

            {/* Section 1: Bill Collector Details (Read-Only) */}
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Bill Collector Details
            </h2>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Bill Collector ID</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {selectedCollector && selectedCollector.billCollectorId ? selectedCollector.billCollectorId : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Bill Collector Name</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {selectedCollector && selectedCollector.bcFullName ? selectedCollector.bcFullName : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Date of Birth</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {selectedCollector && selectedCollector.bcDateOfBirth ? formatDateDisplay(selectedCollector.bcDateOfBirth) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Designation</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {selectedCollector && selectedCollector.bcDesignation ? formatDesignation(selectedCollector.bcDesignation) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Employee Type</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {selectedCollector && selectedCollector.bcEmployeeType ? formatEmployeeType(selectedCollector.bcEmployeeType) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Phone Number</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {selectedCollector && selectedCollector.bcPhoneNo ? selectedCollector.bcPhoneNo : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Status</label>
                  <p className="text-[14px] font-['Poppins',sans-serif]">
                    {selectedCollector && selectedCollector.bcActive ? (
                      <span className="inline-block px-2.5 py-1 rounded-full text-[12px] font-medium bg-green-100 text-green-700">Active</span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-full text-[12px] font-medium bg-gray-100 text-gray-600">Inactive</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Email</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {selectedCollector && selectedCollector.bcEmail ? selectedCollector.bcEmail : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">District</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {selectedCollector && selectedCollector.bcDistrict ? selectedCollector.bcDistrict : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Ward Assignment Details */}
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Ward Assignment Details
            </h2>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                <GovMultiSelect
                  label="Ward Number(s)"
                  required
                  placeholder="Select ward(s)"
                  options={WARD_OPTIONS}
                  value={form.wardNumbers}
                  onChange={(val) => updateForm('wardNumbers', val)}
                  error={formErrors.wardNumbers}
                />
                <GovSelect
                  label="Billing Days"
                  required
                  placeholder="Select billing days"
                  options={BILLING_DAY_OPTIONS}
                  value={form.billingDays}
                  onValueChange={(val) => updateForm('billingDays', val)}
                  error={formErrors.billingDays}
                />
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                    Effective Date <span className="text-red-600 ml-1">*</span>
                  </label>
                  <GovDatePicker
                    value={form.effectiveDate}
                    onChange={(val) => updateForm('effectiveDate', val)}
                    placeholder="DD/MM/YYYY"
                    error={formErrors.effectiveDate ? true : false}
                  />
                  {formErrors.effectiveDate && (
                    <p className="mt-1.5 text-[13px] text-red-600 font-['Poppins',sans-serif]">{formErrors.effectiveDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                    Billing Start Date <span className="text-red-600 ml-1">*</span>
                  </label>
                  <GovDatePicker
                    value={form.billingStartDate}
                    onChange={(val) => updateForm('billingStartDate', val)}
                    placeholder="DD/MM/YYYY"
                    error={formErrors.billingStartDate ? true : false}
                  />
                  {formErrors.billingStartDate && (
                    <p className="mt-1.5 text-[13px] text-red-600 font-['Poppins',sans-serif]">{formErrors.billingStartDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                    Billing End Date <span className="text-red-600 ml-1">*</span>
                  </label>
                  <GovDatePicker
                    value={form.billingEndDate}
                    onChange={(val) => updateForm('billingEndDate', val)}
                    placeholder="DD/MM/YYYY"
                    error={formErrors.billingEndDate ? true : false}
                  />
                  {formErrors.billingEndDate && (
                    <p className="mt-1.5 text-[13px] text-red-600 font-['Poppins',sans-serif]">{formErrors.billingEndDate}</p>
                  )}
                </div>
                <GovInput
                  label="Billing Machine No"
                  placeholder="Enter billing machine number"
                  value={form.billingMachineNo}
                  onChange={(e) => updateForm('billingMachineNo', e.target.value)}
                />
                <GovInput
                  label="Asset ID"
                  placeholder="Enter asset ID"
                  value={form.assetId}
                  onChange={(e) => updateForm('assetId', e.target.value)}
                />
                <div className="col-span-2">
                  <GovInput
                    label="Remarks"
                    placeholder="Enter remarks (optional)"
                    value={form.remarks}
                    onChange={(e) => updateForm('remarks', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <GovButton variant="outline" onClick={handleBackToList} disabled={saving}>
                Cancel
              </GovButton>
              <GovButton variant="primary" onClick={handleSave} loading={saving}>
                <Save className="w-4 h-4" />
                Save Assignment
              </GovButton>
              <GovButton variant="accent" onClick={handleForwardToFE} loading={saving}>
                <Send className="w-4 h-4" />
                Forward to Field Engineer
              </GovButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================================
  // RENDER: VIEW ASSIGNMENT DETAILS PAGE
  // =====================================================================
  if (page === 'view' && viewAssignment) {
    // Find the collector record to show full details
    const collector = collectors.find((c) => c.id === viewAssignment.billCollectorRecordId);

    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        {/* Back Button */}
        <button
          onClick={handleBackToList}
          className="flex items-center gap-1.5 text-[14px] text-[#1f3a5f] font-medium font-['Poppins',sans-serif] mb-3 hover:underline cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to List
        </button>

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">
          Ward Assignment Details
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-6">
          Viewing assignment for <span className="font-semibold text-[#1f3a5f]">{viewAssignment && viewAssignment.billCollectorName ? viewAssignment.billCollectorName : 'N/A'}</span>
        </p>

        {/* Detail Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-8">

            {/* Section 1: Bill Collector Info */}
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Bill Collector Details
            </h2>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Bill Collector ID</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.billCollectorId ? viewAssignment.billCollectorId : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Bill Collector Name</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.billCollectorName ? viewAssignment.billCollectorName : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Designation</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {collector && collector.bcDesignation ? formatDesignation(collector.bcDesignation) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Employee Type</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {collector && collector.bcEmployeeType ? formatEmployeeType(collector.bcEmployeeType) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Phone Number</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {collector && collector.bcPhoneNo ? collector.bcPhoneNo : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Status</label>
                  <p className="text-[14px] font-['Poppins',sans-serif]">
                    <span className={
                      'inline-block px-2.5 py-1 rounded-full text-[12px] font-medium font-[\'Poppins\',sans-serif] ' +
                      (viewAssignment && viewAssignment.status === 'Assigned' ? 'bg-green-100 text-green-700' :
                       viewAssignment && viewAssignment.status === 'Sent for Approval' ? 'bg-blue-100 text-blue-700' :
                       viewAssignment && viewAssignment.status === 'Forwarded to Field Engineer' ? 'bg-blue-100 text-blue-700' :
                       viewAssignment && viewAssignment.status === 'Approved by Field Engineer' || viewAssignment && viewAssignment.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                       viewAssignment && viewAssignment.status === 'Rejected by Field Engineer' || viewAssignment && viewAssignment.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                       'bg-gray-100 text-gray-600')
                    }>
                      {viewAssignment && viewAssignment.status ? viewAssignment.status : 'N/A'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Ward Assignment Info */}
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Ward Assignment Details
            </h2>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Ward Number(s)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {viewAssignment && viewAssignment.wardNumbers && viewAssignment.wardNumbers.length > 0
                      ? viewAssignment.wardNumbers.map((w: string) => (
                          <span key={w} className="inline-block px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#1f3a5f]/10 text-[#1f3a5f] font-['Poppins',sans-serif]">{w}</span>
                        ))
                      : <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">N/A</p>
                    }
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Billing Days</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.billingDays ? viewAssignment.billingDays : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Effective Date</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.effectiveDate ? formatDateDisplay(viewAssignment.effectiveDate) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Billing Start Date</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.billingStartDate ? formatDateDisplay(viewAssignment.billingStartDate) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Billing End Date</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.billingEndDate ? formatDateDisplay(viewAssignment.billingEndDate) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Billing Machine No</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.billingMachineNo ? viewAssignment.billingMachineNo : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Asset ID</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.assetId ? viewAssignment.assetId : 'N/A'}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Remarks</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.remarks ? viewAssignment.remarks : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <GovButton variant="outline" onClick={handleBackToList}>
                Back to List
              </GovButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================================
  // RENDER: MAIN LIST PAGE
  // =====================================================================

  // ─── Collector table columns ────────────────────────────────────────────
  // (Removed column-based API — using compositional GovTable below)

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">
          Assign Ward to Bill Collectors
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
          View bill collectors and assign wards for billing operations
        </p>
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, Name, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
          />
        </div>
      </div>

      {/* Collector Table */}
      <GovTable title="Assign Ward to Bill Collectors" minWidth="1300px">
        <GovTableHeader>
          <GovTableHeaderCell width="60px" align="center">SL. NO</GovTableHeaderCell>
          <GovTableHeaderCell width="170px">BILL COLLECTOR ID</GovTableHeaderCell>
          <GovTableHeaderCell width="160px">BILL COLLECTOR NAME</GovTableHeaderCell>
          <GovTableHeaderCell width="130px" align="center">DATE OF BIRTH</GovTableHeaderCell>
          <GovTableHeaderCell width="140px" align="center">DESIGNATION</GovTableHeaderCell>
          <GovTableHeaderCell width="130px" align="center">EMPLOYEE TYPE</GovTableHeaderCell>
          <GovTableHeaderCell width="140px" align="center">PHONE NUMBER</GovTableHeaderCell>
          <GovTableHeaderCell width="100px" align="center">STATUS</GovTableHeaderCell>
          <GovTableHeaderCell width="160px" align="center">ASSIGNED STATUS</GovTableHeaderCell>
          <GovTableHeaderCell width="130px" align="center">ACTION</GovTableHeaderCell>
        </GovTableHeader>
        <GovTableBody>
          {loading ? (
            <GovTableLoading colSpan={10} />
          ) : filteredCollectors.length === 0 ? (
            <GovTableEmpty message="No bill collectors found. Please add bill collectors first." colSpan={10} />
          ) : (
            filteredCollectors.map((row, index) => {
              const assignedStatus = getAssignedStatus(row.id);
              const assignment = getAssignmentForCollector(row.id);
              const isActive = row && row.bcActive;

              let assignedBadgeClass = 'bg-orange-100 text-orange-700';
              if (assignedStatus === 'Assigned') assignedBadgeClass = 'bg-green-100 text-green-700';
              if (assignedStatus === 'Sent for Approval') assignedBadgeClass = 'bg-blue-100 text-blue-700';
              if (assignedStatus === 'Approved by Field Engineer' || assignedStatus === 'Approved') assignedBadgeClass = 'bg-emerald-100 text-emerald-700';
              if (assignedStatus === 'Rejected by Field Engineer' || assignedStatus === 'Rejected') assignedBadgeClass = 'bg-red-100 text-red-700';

              return (
                <GovTableRow key={row.id}>
                  <GovTableCell align="center">{index + 1}</GovTableCell>
                  <GovTableCell variant="id">{row.billCollectorId || 'N/A'}</GovTableCell>
                  <GovTableCell>{row.bcFullName || 'N/A'}</GovTableCell>
                  <GovTableCell align="center">{row && row.bcDateOfBirth ? formatDateDisplay(row.bcDateOfBirth) : 'N/A'}</GovTableCell>
                  <GovTableCell align="center">{row && row.bcDesignation ? formatDesignation(row.bcDesignation) : 'N/A'}</GovTableCell>
                  <GovTableCell align="center">{row && row.bcEmployeeType ? formatEmployeeType(row.bcEmployeeType) : 'N/A'}</GovTableCell>
                  <GovTableCell align="center">{row && row.bcPhoneNo ? row.bcPhoneNo : 'N/A'}</GovTableCell>
                  <GovTableCell align="center">
                    <span className={
                      'inline-block px-2.5 py-1 rounded-full text-[12px] font-medium font-[\'Poppins\',sans-serif] ' +
                      (isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')
                    }>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </GovTableCell>
                  <GovTableCell align="center">
                    <span className={
                      'inline-block px-2.5 py-1 rounded-full text-[12px] font-medium font-[\'Poppins\',sans-serif] ' + assignedBadgeClass
                    }>
                      {assignedStatus}
                    </span>
                  </GovTableCell>
                  <GovTableCell align="center">
                    {assignedStatus === 'Not Assigned' ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAssignClick(row); }}
                        className="px-5 py-1.5 text-[12px] font-semibold rounded font-['Poppins',sans-serif] transition-colors cursor-pointer border border-[#2c5282] bg-[#1f3a5f] text-white hover:bg-[#2c5282]"
                      >
                        Assign
                      </button>
                    ) : assignedStatus === 'Assigned' ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditClick(row); }}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold rounded font-['Poppins',sans-serif] transition-colors cursor-pointer border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (assignment) { handleViewClick(assignment); }
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold rounded font-['Poppins',sans-serif] transition-colors cursor-pointer bg-[#1f3a5f] text-white hover:bg-[#2d4a6f]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    )}
                  </GovTableCell>
                </GovTableRow>
              );
            })
          )}
        </GovTableBody>
      </GovTable>
    </div>
  );
}
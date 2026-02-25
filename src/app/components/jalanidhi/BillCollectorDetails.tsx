import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Loader2, CheckCircle, Pencil, Trash2, X, Eye, Save, UserPlus, ChevronDown, ChevronRight, ChevronLeft, Upload, FileCheck, FileText } from 'lucide-react';
import { GovInput } from '../ui/gov-input';
import { GovSelect } from '../ui/gov-select';
import { GovButton } from '../ui/gov-button';
import { GovTable, GovTableHeader, GovTableHeaderCell, GovTableBody, GovTableRow, GovTableCell, GovTableEmpty, GovTableActionButton } from '../ui/gov-table';
import { GovDatePicker } from '../ui/gov-date-picker';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

// ─── Types ──────────────────────────────────────────────────────────────────

interface BillCollectorRecord {
  id: string;
  billCollectorId: string;
  // Region auto-populated
  district: string;
  ulb: string;
  ulbType: string;
  zone: string;
  authorityType: string;
  // User-selected
  plumberType: string;       // 'contractor' | 'individual'
  selectedPlumberId: string;  // plumber license id
  selectedPlumberName: string;
  // Stored plumber details snapshot
  plumberDetails: any;
  // Bill collector personal details (Step 2)
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

interface ContractorData {
  id: string;
  applicationNo: string;
  firmName: string;
  typeOfFirm: string;
  officeAddress: string;
  district: string;
  taluk: string;
  pincode: string;
  mobile: string;
  email: string;
  panNumber: string;
  gstNumber: string;
  authFullName: string;
  authDesignation: string;
  authMobile: string;
  authEmail: string;
  status: string;
  registrationType: string;
}

interface IndividualData {
  id: string;
  applicationNo: string;
  plumberName: string;
  district: string;
  city: string;
  street: string;
  wardNo: string;
  pincode: string;
  mobile: string;
  qualification: string;
  yearOfExperience: string;
  status: string;
  registrationType: string;
}

const PLUMBER_TYPE_OPTIONS = [
  { value: 'contractor', label: 'Contractor' },
  { value: 'individual', label: 'Individual' },
];

const DESIGNATION_OPTIONS = [
  { value: 'bill-collector', label: 'Bill Collector' },
  { value: 'senior-bill-collector', label: 'Senior Bill Collector' },
  { value: 'meter-reader', label: 'Meter Reader' },
];

const EMPLOYEE_TYPE_OPTIONS = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'outsourced', label: 'Outsourced' },
];

const DISTRICT_OPTIONS = [
  { value: 'Dharwad', label: 'Dharwad' },
  { value: 'Belgaum', label: 'Belgaum' },
  { value: 'Bangalore Urban', label: 'Bangalore Urban' },
  { value: 'Mysore', label: 'Mysore' },
  { value: 'Mangalore', label: 'Mangalore' },
  { value: 'Gulbarga', label: 'Gulbarga' },
  { value: 'Bellary', label: 'Bellary' },
  { value: 'Shimoga', label: 'Shimoga' },
  { value: 'Davangere', label: 'Davangere' },
  { value: 'Tumkur', label: 'Tumkur' },
];

const CITY_OPTIONS: Record<string, { value: string; label: string }[]> = {
  'Dharwad': [
    { value: 'Hubballi', label: 'Hubballi' },
    { value: 'Dharwad', label: 'Dharwad' },
    { value: 'Navalgund', label: 'Navalgund' },
    { value: 'Kundgol', label: 'Kundgol' },
  ],
  'Belgaum': [
    { value: 'Belgaum', label: 'Belgaum' },
    { value: 'Gokak', label: 'Gokak' },
    { value: 'Bailhongal', label: 'Bailhongal' },
  ],
  'Bangalore Urban': [
    { value: 'Bangalore', label: 'Bangalore' },
    { value: 'Yelahanka', label: 'Yelahanka' },
  ],
  'Mysore': [
    { value: 'Mysore', label: 'Mysore' },
    { value: 'Nanjangud', label: 'Nanjangud' },
  ],
};

// ─── Dummy Contractor Firms ─────────────────────────────────────────────────
const DUMMY_CONTRACTORS: ContractorData[] = [
  {
    id: 'dummy-firm-001',
    applicationNo: 'PLB-CONT-2025-001',
    firmName: 'L&T',
    typeOfFirm: 'Private Limited',
    officeAddress: 'Akashya Nagar',
    district: 'Dharwad',
    taluk: 'Hubballi',
    pincode: '580017',
    mobile: '9876543210',
    email: 'L&T@gmail.com',
    panNumber: '8765434567',
    gstNumber: 'GST856822332',
    authFullName: 'Ramesh',
    authDesignation: 'Project Manager',
    authMobile: '9876543211',
    authEmail: 'ramesh@lnt.com',
    status: 'approved',
    registrationType: 'contractor',
  },
  {
    id: 'dummy-firm-002',
    applicationNo: 'PLB-CONT-2025-002',
    firmName: 'Kumar Plumbing Services Pvt Ltd',
    typeOfFirm: 'Private Limited',
    officeAddress: '123 Industrial Area',
    district: 'Dharwad',
    taluk: 'Dharwad',
    pincode: '580031',
    mobile: '9876543220',
    email: 'kumar.plumbing@example.com',
    panNumber: 'ABCDE1234F',
    gstNumber: '29ABCDE1234F1Z5',
    authFullName: 'Suresh Kumar',
    authDesignation: 'Director',
    authMobile: '9876543221',
    authEmail: 'suresh@kumarplumbing.com',
    status: 'approved',
    registrationType: 'contractor',
  },
  {
    id: 'dummy-firm-003',
    applicationNo: 'PLB-CONT-2025-003',
    firmName: 'Nirmala Water Solutions LLP',
    typeOfFirm: 'LLP',
    officeAddress: 'KHB Colony, Navanagar',
    district: 'Dharwad',
    taluk: 'Hubballi',
    pincode: '580025',
    mobile: '9876543230',
    email: 'nirmala.water@example.com',
    panNumber: 'FGHIJ5678K',
    gstNumber: '29FGHIJ5678K1Z8',
    authFullName: 'Manjunath Patil',
    authDesignation: 'Managing Partner',
    authMobile: '9876543231',
    authEmail: 'manjunath@nirmalaws.com',
    status: 'approved',
    registrationType: 'contractor',
  },
];

// ─── Dummy Individual Plumbers ──────────────────────────────────────────────
const DUMMY_INDIVIDUALS: IndividualData[] = [
  {
    id: 'dummy-ind-001',
    applicationNo: 'PLB-IND-2025-001',
    plumberName: 'Ramesh Kumar',
    district: 'Dharwad',
    city: 'Hubballi',
    street: 'Vidyanagar',
    wardNo: 'Ward No.15',
    pincode: '580031',
    mobile: '9876543240',
    qualification: 'ITI',
    yearOfExperience: '5 Years',
    status: 'approved',
    registrationType: 'individual',
  },
  {
    id: 'dummy-ind-002',
    applicationNo: 'PLB-IND-2025-002',
    plumberName: 'Basavaraj Hiremath',
    district: 'Dharwad',
    city: 'Dharwad',
    street: 'Saptapur',
    wardNo: 'Ward No.8',
    pincode: '580001',
    mobile: '9876543250',
    qualification: 'Diploma in Plumbing',
    yearOfExperience: '8 Years',
    status: 'approved',
    registrationType: 'individual',
  },
  {
    id: 'dummy-ind-003',
    applicationNo: 'PLB-IND-2025-003',
    plumberName: 'Shivaraj Goudar',
    district: 'Dharwad',
    city: 'Hubballi',
    street: 'Gokul Road',
    wardNo: 'Ward No.22',
    pincode: '580030',
    mobile: '9876543260',
    qualification: 'Experience Based',
    yearOfExperience: '12 Years',
    status: 'approved',
    registrationType: 'individual',
  },
];

// ─── Helper: Qualification label ────────────────────────────────────────────
function getQualificationLabel(val: string): string {
  const map: Record<string, string> = {
    'iti': 'ITI',
    'diploma': 'Diploma in Plumbing',
    'certificate': 'Certificate Course',
    'bsc': 'B.Sc. (Plumbing Technology)',
    'experience-based': 'Experience Based',
  };
  return map[val] || val || 'N/A';
}

// ─── Helper: Firm type label ────────────────────────────────────────────────
function getFirmTypeLabel(val: string): string {
  const map: Record<string, string> = {
    'private-limited': 'Private Limited',
    'public-limited': 'Public Limited',
    'partnership': 'Partnership',
    'sole-proprietorship': 'Sole Proprietorship',
    'llp': 'LLP',
  };
  return map[val] || val || 'N/A';
}

// ─── Helper: Generate Bill Collector ID ─────────────────────────────────────
function generateBillCollectorId(ulb: string): string {
  // Format: HUB-DHAR_XXXXX based on ULB name
  const parts = ulb.split('-').map(p => p.trim());
  let prefix = 'BC';
  if (parts.length >= 2) {
    prefix = parts[0].substring(0, 3).toUpperCase() + '-' + parts[1].substring(0, 4).toUpperCase();
  } else if (parts.length === 1 && parts[0]) {
    prefix = parts[0].substring(0, 4).toUpperCase();
  }
  const num = Math.floor(10000 + Math.random() * 90000);
  return prefix + '_' + num;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function BillCollectorDetails() {
  const [mode, setMode] = useState<'list' | 'form' | 'view'>('list');
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [records, setRecords] = useState<BillCollectorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Auto-populated region from caseworker
  const [region, setRegion] = useState({
    district: 'Dharwad',
    ulb: 'Hubli-Dharwad',
    ulbType: 'CC',
    zone: 'Zone 1',
    authorityType: 'Board',
  });

  // Step 1: Form state
  const [plumberType, setPlumberType] = useState('');
  const [selectedPlumberId, setSelectedPlumberId] = useState('');

  // Plumber data from server
  const [contractors, setContractors] = useState<ContractorData[]>([]);
  const [individuals, setIndividuals] = useState<IndividualData[]>([]);
  const [loadingPlumbers, setLoadingPlumbers] = useState(false);

  // Preserve bill collector ID during edits
  const [editingBcId, setEditingBcId] = useState('');

  // Step 2: Bill Collector personal details
  const [bcFullName, setBcFullName] = useState('');
  const [bcDateOfBirth, setBcDateOfBirth] = useState('');
  const [bcAddress, setBcAddress] = useState('');
  const [bcDistrict, setBcDistrict] = useState('');
  const [bcCity, setBcCity] = useState('');
  const [bcState, setBcState] = useState('Karnataka');
  const [bcPincode, setBcPincode] = useState('');
  const [bcDesignation, setBcDesignation] = useState('');
  const [bcEmployeeType, setBcEmployeeType] = useState('');
  const [bcPhoneNo, setBcPhoneNo] = useState('');
  const [bcEmail, setBcEmail] = useState('');
  const [bcActive, setBcActive] = useState(true);
  const [bcSupportingDoc, setBcSupportingDoc] = useState<File | null>(null);
  const [bcPhotoCopy, setBcPhotoCopy] = useState<File | null>(null);
  const [bcSupportingDocName, setBcSupportingDocName] = useState('');
  const [bcPhotoCopyName, setBcPhotoCopyName] = useState('');

  // File input refs
  const supportingDocRef = useRef<HTMLInputElement>(null);
  const photoCopyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load caseworker region from localStorage
    const raw = localStorage.getItem('userData');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user && user.district) {
          setRegion({
            district: user.district || 'Dharwad',
            ulb: user.ulb || 'Hubli-Dharwad',
            ulbType: user.ulbType || 'CC',
            zone: user.zone || 'Zone 1',
            authorityType: user.authorityType || 'Board',
          });
        }
      } catch { /* fallback defaults */ }
    }
    fetchRecords();
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // ─── API Calls ──────────────────────────────────────────────────────────

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/meter-management/bill-collectors`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      if (data && data.success && data.collectors) {
        setRecords(data.collectors);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error('[BILL COLLECTOR] Error fetching:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlumbers = async () => {
    try {
      setLoadingPlumbers(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/meter-management/approved-plumbers`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      // Merge server data with dummy data, avoiding duplicate IDs
      const serverContractors: ContractorData[] = (data && data.success && data.contractors) ? data.contractors : [];
      const serverIndividuals: IndividualData[] = (data && data.success && data.individuals) ? data.individuals : [];
      const serverContractorIds = new Set(serverContractors.map(c => c.id));
      const serverIndividualIds = new Set(serverIndividuals.map(i => i.id));
      const mergedContractors = [
        ...DUMMY_CONTRACTORS.filter(d => !serverContractorIds.has(d.id)),
        ...serverContractors,
      ];
      const mergedIndividuals = [
        ...DUMMY_INDIVIDUALS.filter(d => !serverIndividualIds.has(d.id)),
        ...serverIndividuals,
      ];
      setContractors(mergedContractors);
      setIndividuals(mergedIndividuals);
      console.log('[BILL COLLECTOR] Loaded', mergedContractors.length, 'contractors,', mergedIndividuals.length, 'individuals (incl. dummy)');
    } catch (error) {
      console.error('[BILL COLLECTOR] Error fetching plumbers:', error);
      // On error, still show dummy data
      setContractors(DUMMY_CONTRACTORS);
      setIndividuals(DUMMY_INDIVIDUALS);
    } finally {
      setLoadingPlumbers(false);
    }
  };

  const handleSave = async () => {
    // Validate Step 2 fields
    const errs: Record<string, string> = {};
    if (!bcFullName.trim()) errs.bcFullName = 'Full Name is required';
    if (!bcDateOfBirth) errs.bcDateOfBirth = 'Date of Birth is required';
    if (!bcAddress.trim()) errs.bcAddress = 'Address is required';
    if (!bcDistrict) errs.bcDistrict = 'District is required';
    if (!bcCity) errs.bcCity = 'City is required';
    if (!bcPincode.trim()) errs.bcPincode = 'Pincode is required';
    if (!bcDesignation) errs.bcDesignation = 'Designation is required';
    if (!bcEmployeeType) errs.bcEmployeeType = 'Employee Type is required';
    if (!bcPhoneNo.trim()) errs.bcPhoneNo = 'Phone No is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      // Get selected plumber details
      let plumberDetails: any = {};
      let plumberName = '';
      if (plumberType === 'contractor') {
        const found = contractors.find(c => c.id === selectedPlumberId);
        if (found) {
          plumberDetails = found;
          plumberName = found.firmName;
        }
      } else {
        const found = individuals.find(i => i.id === selectedPlumberId);
        if (found) {
          plumberDetails = found;
          plumberName = found.plumberName;
        }
      }

      const payload: any = {
        ...region,
        plumberType,
        selectedPlumberId,
        selectedPlumberName: plumberName,
        plumberDetails,
        billCollectorId: editingId ? editingBcId : generateBillCollectorId(region.ulb),
        // Bill collector details
        bcFullName: bcFullName.trim(),
        bcDateOfBirth,
        bcAddress: bcAddress.trim(),
        bcDistrict,
        bcCity,
        bcState,
        bcPincode: bcPincode.trim(),
        bcDesignation,
        bcEmployeeType,
        bcPhoneNo: bcPhoneNo.trim(),
        bcEmail: bcEmail.trim(),
        bcActive,
        bcSupportingDoc: bcSupportingDocName || '',
        bcPhotoCopy: bcPhotoCopyName || '',
        status: bcActive ? 'Active' : 'Inactive',
      };
      if (editingId) payload.id = editingId;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/meter-management/bill-collectors`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ collector: payload }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        setSuccessMsg(editingId ? 'Record updated successfully!' : 'Bill collector details saved successfully!');
        await fetchRecords();
        setMode('list');
        setFormStep(1);
        resetForm();
      } else {
        const errMsg = data && data.error ? data.error : 'Unknown error';
        alert('Error saving: ' + errMsg);
      }
    } catch (error) {
      console.error('[BILL COLLECTOR] Error saving:', error);
      alert('Error saving: ' + error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setShowDeleteModal(false);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/meter-management/bill-collectors/delete`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectorId: deleteTargetId }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        setSuccessMsg('Record deleted successfully!');
        await fetchRecords();
      } else {
        alert('Error deleting: ' + ((data && data.error) ? data.error : 'Unknown error'));
      }
    } catch (error) {
      console.error('[BILL COLLECTOR] Error deleting:', error);
      alert('Error deleting: ' + error);
    } finally {
      setDeleteTargetId(null);
    }
  };

  // ─── Handlers ───────────────────────────────────────────────────────────

  const resetForm = () => {
    setPlumberType('');
    setSelectedPlumberId('');
    setEditingId(null);
    setEditingBcId('');
    setErrors({});
    setFormStep(1);
    // Reset step 2 fields
    setBcFullName('');
    setBcDateOfBirth('');
    setBcAddress('');
    setBcDistrict('');
    setBcCity('');
    setBcState('Karnataka');
    setBcPincode('');
    setBcDesignation('');
    setBcEmployeeType('');
    setBcPhoneNo('');
    setBcEmail('');
    setBcActive(true);
    setBcSupportingDoc(null);
    setBcPhotoCopy(null);
    setBcSupportingDocName('');
    setBcPhotoCopyName('');
  };

  const handleNew = () => {
    resetForm();
    setMode('form');
    setFormStep(1);
    fetchPlumbers();
  };

  const handleEdit = (record: BillCollectorRecord) => {
    setPlumberType(record.plumberType || '');
    setSelectedPlumberId(record.selectedPlumberId || '');
    setEditingId(record.id);
    setEditingBcId(record.billCollectorId || '');
    setErrors({});
    setMode('form');
    setFormStep(1);
    fetchPlumbers();
    // Populate step 2 fields from record
    setBcFullName(record.bcFullName || '');
    setBcDateOfBirth(record.bcDateOfBirth || '');
    setBcAddress(record.bcAddress || '');
    setBcDistrict(record.bcDistrict || '');
    setBcCity(record.bcCity || '');
    setBcState(record.bcState || 'Karnataka');
    setBcPincode(record.bcPincode || '');
    setBcDesignation(record.bcDesignation || '');
    setBcEmployeeType(record.bcEmployeeType || '');
    setBcPhoneNo(record.bcPhoneNo || '');
    setBcEmail(record.bcEmail || '');
    setBcActive(record.bcActive !== undefined ? record.bcActive : true);
    setBcSupportingDocName(record.bcSupportingDoc || '');
    setBcPhotoCopyName(record.bcPhotoCopy || '');
  };

  const handleView = (record: BillCollectorRecord) => {
    setPlumberType(record.plumberType || '');
    setSelectedPlumberId(record.selectedPlumberId || '');
    setEditingId(record.id);
    setEditingBcId(record.billCollectorId || '');
    setMode('view');
    setFormStep(1);
    // For view mode, load contractor/individual data from the record's snapshot
    if (record.plumberDetails) {
      if (record.plumberType === 'contractor') {
        setContractors([record.plumberDetails as ContractorData]);
      } else {
        setIndividuals([record.plumberDetails as IndividualData]);
      }
    }
    // Populate step 2 fields for view
    setBcFullName(record.bcFullName || '');
    setBcDateOfBirth(record.bcDateOfBirth || '');
    setBcAddress(record.bcAddress || '');
    setBcDistrict(record.bcDistrict || '');
    setBcCity(record.bcCity || '');
    setBcState(record.bcState || 'Karnataka');
    setBcPincode(record.bcPincode || '');
    setBcDesignation(record.bcDesignation || '');
    setBcEmployeeType(record.bcEmployeeType || '');
    setBcPhoneNo(record.bcPhoneNo || '');
    setBcEmail(record.bcEmail || '');
    setBcActive(record.bcActive !== undefined ? record.bcActive : true);
    setBcSupportingDocName(record.bcSupportingDoc || '');
    setBcPhotoCopyName(record.bcPhotoCopy || '');
  };

  const handleBack = () => {
    setMode('list');
    setFormStep(1);
    resetForm();
  };

  const handlePlumberTypeChange = (value: string) => {
    setPlumberType(value);
    setSelectedPlumberId('');
    if (errors.plumberType) {
      setErrors(prev => { const n = { ...prev }; delete n.plumberType; return n; });
    }
    if (errors.selectedPlumberId) {
      setErrors(prev => { const n = { ...prev }; delete n.selectedPlumberId; return n; });
    }
    // Ensure plumber data is loaded when type changes
    if (value === 'contractor' && contractors.length === 0) {
      fetchPlumbers();
    }
    if (value === 'individual' && individuals.length === 0) {
      fetchPlumbers();
    }
  };

  const handlePlumberSelect = (value: string) => {
    setSelectedPlumberId(value);
    if (errors.selectedPlumberId) {
      setErrors(prev => { const n = { ...prev }; delete n.selectedPlumberId; return n; });
    }
  };

  const handleNextStep = () => {
    // Validate Step 1
    const errs: Record<string, string> = {};
    if (!plumberType) errs.plumberType = 'Plumber Type is required';
    if (!selectedPlumberId) {
      errs.selectedPlumberId = plumberType === 'contractor'
        ? 'Please select a firm'
        : 'Please select a plumber';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Pre-populate district from region if empty
    if (!bcDistrict) {
      setBcDistrict(region.district);
    }
    setFormStep(2);
    setErrors({});
  };

  const handlePreviousStep = () => {
    setFormStep(1);
    setErrors({});
  };

  const handleBcDistrictChange = (value: string) => {
    setBcDistrict(value);
    setBcCity(''); // Reset city when district changes
    if (errors.bcDistrict) {
      setErrors(prev => { const n = { ...prev }; delete n.bcDistrict; return n; });
    }
  };

  // ─── Derived data ──────────────────────────────────────────────────────

  const selectedContractor = plumberType === 'contractor'
    ? contractors.find(c => c.id === selectedPlumberId) || null
    : null;

  const selectedIndividual = plumberType === 'individual'
    ? individuals.find(i => i.id === selectedPlumberId) || null
    : null;

  const firmOptions = contractors.map(c => ({
    value: c.id,
    label: c.firmName,
  }));

  const individualOptions = individuals.map(i => ({
    value: i.id,
    label: i.plumberName,
  }));

  // City options based on selected BC district
  const availableCities = (bcDistrict && CITY_OPTIONS[bcDistrict]) ? CITY_OPTIONS[bcDistrict] : [
    { value: 'Hubballi', label: 'Hubballi' },
    { value: 'Dharwad', label: 'Dharwad' },
  ];

  // Filtered table data
  const filtered = records.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (r.bcFullName && r.bcFullName.toLowerCase().includes(q)) ||
      (r.billCollectorId && r.billCollectorId.toLowerCase().includes(q)) ||
      (r.bcPhoneNo && r.bcPhoneNo.toLowerCase().includes(q)) ||
      (r.bcDesignation && r.bcDesignation.toLowerCase().includes(q)) ||
      (r.selectedPlumberName && r.selectedPlumberName.toLowerCase().includes(q)) ||
      (r.status && r.status.toLowerCase().includes(q));
  });

  // ─── Table rendering helper removed — using compositional GovTable API ──

  // ─── Loading ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-[#1f3a5f] animate-spin" />
          <span className="text-gray-600 font-['Poppins',sans-serif]">Loading bill collector details...</span>
        </div>
      </div>
    );
  }

  // ─── LIST MODE ──────────────────────────────────────────────────────────

  if (mode === 'list') {
    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">
              Bill Collector Details
            </h1>
            <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
              Manage bill collector records linked to approved plumbers and contractors
            </p>
          </div>
          <GovButton variant="primary" onClick={handleNew}>
            <UserPlus className="w-4 h-4" />
            Add Bill Collector
          </GovButton>
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800 font-['Poppins',sans-serif] font-medium">{successMsg}</p>
          </div>
        )}

        {/* Search */}
        <div className="mb-5">
          <div className="relative w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md text-[14px] font-['Poppins',sans-serif] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f]"
            />
          </div>
        </div>

        <GovTable title="Bill Collector Details">
          <GovTableHeader>
            <GovTableHeaderCell width="60px" align="center">SL. NO</GovTableHeaderCell>
            <GovTableHeaderCell width="170px">BILL COLLECTOR ID</GovTableHeaderCell>
            <GovTableHeaderCell width="160px">BILL COLLECTOR NAME</GovTableHeaderCell>
            <GovTableHeaderCell width="120px" align="center">DATE OF BIRTH</GovTableHeaderCell>
            <GovTableHeaderCell width="130px" align="center">DESIGNATION</GovTableHeaderCell>
            <GovTableHeaderCell width="130px" align="center">EMPLOYEE TYPE</GovTableHeaderCell>
            <GovTableHeaderCell width="130px" align="center">PHONE NUMBER</GovTableHeaderCell>
            <GovTableHeaderCell width="90px" align="center">STATUS</GovTableHeaderCell>
            <GovTableHeaderCell width="90px" align="center">ACTION</GovTableHeaderCell>
          </GovTableHeader>
          <GovTableBody>
            {filtered.length === 0 ? (
              <GovTableEmpty message="No bill collector records found. Click 'Add Bill Collector' to create one." colSpan={9} />
            ) : (
              filtered.map((row, index) => (
                <GovTableRow key={row.id}>
                  <GovTableCell align="center">{index + 1}</GovTableCell>
                  <GovTableCell variant="id">{row.billCollectorId || 'N/A'}</GovTableCell>
                  <GovTableCell>{row.bcFullName || row.selectedPlumberName || 'N/A'}</GovTableCell>
                  <GovTableCell align="center">{row.bcDateOfBirth ? formatDateDisplay(row.bcDateOfBirth) : 'N/A'}</GovTableCell>
                  <GovTableCell align="center">{row.bcDesignation ? getDesignationLabel(row.bcDesignation) : 'N/A'}</GovTableCell>
                  <GovTableCell align="center">{row.bcEmployeeType ? getEmployeeTypeLabel(row.bcEmployeeType) : 'N/A'}</GovTableCell>
                  <GovTableCell align="center">{row.bcPhoneNo || 'N/A'}</GovTableCell>
                  <GovTableCell align="center">
                    <span className={
                      'inline-block px-2.5 py-1 rounded-full text-[12px] font-medium ' +
                      (row.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')
                    }>
                      {row.status || 'N/A'}
                    </span>
                  </GovTableCell>
                  <GovTableCell align="center">
                    <GovTableActionButton
                      label="View"
                      onClick={() => handleView(row)}
                    />
                  </GovTableCell>
                </GovTableRow>
              ))
            )}
          </GovTableBody>
        </GovTable>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-[420px] max-w-[90vw]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Confirm Delete</h2>
                <button type="button" onClick={() => { setShowDeleteModal(false); setDeleteTargetId(null); }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 py-5">
                <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif]">
                  Are you sure you want to delete this bill collector record? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <GovButton variant="outline" onClick={() => { setShowDeleteModal(false); setDeleteTargetId(null); }}>Cancel</GovButton>
                <button type="button" onClick={handleDelete}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[14px] font-medium font-['Poppins',sans-serif] rounded-md transition-colors flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── FORM / VIEW MODE ──────────────────────────────────────────────────

  const isViewMode = mode === 'view';

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <button type="button" onClick={handleBack}
          className="flex items-center gap-1.5 text-[14px] text-[#1f3a5f] font-medium font-['Poppins',sans-serif] mb-3 hover:underline">
          <span>&larr;</span> Back to Bill Collectors
        </button>
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">
          {isViewMode ? 'View Bill Collector Details' : editingId ? 'Edit Bill Collector Details' : 'Add Bill Collector Details'}
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
          {isViewMode
            ? 'Viewing bill collector record'
            : formStep === 1
              ? 'Step 1: Select plumber type and choose a firm or individual.'
              : 'Step 2: Fill in the bill collector personal details.'}
        </p>
      </div>

      {/* ─── Step Indicator ──────────────────────────────────────────── */}
      {!isViewMode && (
        <div className="mb-6">
          <div className="flex items-center gap-2">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div className={
                'w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold font-[\'Poppins\',sans-serif] ' +
                (formStep === 1 ? 'bg-[#1f3a5f] text-white' : 'bg-green-500 text-white')
              }>
                {formStep > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <span className={
                'text-[13px] font-medium font-[\'Poppins\',sans-serif] ' +
                (formStep === 1 ? 'text-[#1f3a5f]' : 'text-green-600')
              }>
                Plumber / Firm Selection
              </span>
            </div>

            <div className="w-16 h-[2px] bg-gray-300 mx-1"></div>

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div className={
                'w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold font-[\'Poppins\',sans-serif] ' +
                (formStep === 2 ? 'bg-[#1f3a5f] text-white' : 'bg-gray-300 text-gray-600')
              }>
                2
              </div>
              <span className={
                'text-[13px] font-medium font-[\'Poppins\',sans-serif] ' +
                (formStep === 2 ? 'text-[#1f3a5f]' : 'text-gray-500')
              }>
                Bill Collector Details
              </span>
            </div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800 font-['Poppins',sans-serif] font-medium">{successMsg}</p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-8 space-y-8">

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* STEP 1: Plumber / Firm Selection                          */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {(formStep === 1 || isViewMode) && (
            <>
              {/* ─── Section 1: Region Info (Auto-populated) ──────────── */}
              <div>
                <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Region Details
                </h2>
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                    <GovInput
                      label="District"
                      value={region.district}
                      disabled
                      onChange={() => {}}
                    />
                    <GovInput
                      label="ULB"
                      value={region.ulb}
                      disabled
                      onChange={() => {}}
                    />
                    <GovInput
                      label="ULB Type"
                      value={region.ulbType}
                      disabled
                      onChange={() => {}}
                    />
                    <GovInput
                      label="Zone"
                      value={region.zone}
                      disabled
                      onChange={() => {}}
                    />
                    <GovInput
                      label="Authority Type"
                      value={region.authorityType}
                      disabled
                      onChange={() => {}}
                    />
                    <GovSelect
                      label="Plumber Type"
                      required
                      placeholder="Select Plumber Type"
                      options={PLUMBER_TYPE_OPTIONS}
                      value={plumberType}
                      onValueChange={handlePlumberTypeChange}
                      error={errors.plumberType}
                      disabled={isViewMode}
                    />
                  </div>

                  {/* Note when authority type is Board */}
                  {region.authorityType === 'Board' && plumberType === 'contractor' && (
                    <p className="mt-3 text-[13px] text-[#1f3a5f] font-medium font-['Poppins',sans-serif] italic">
                      (Note: If Authority Type is Board, system should display Firm Name field)
                    </p>
                  )}
                </div>
              </div>

              {/* ─── Section 2: Firm / Individual Selection ───────────── */}
              {plumberType && (
                <div>
                  <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                    {plumberType === 'contractor' ? 'Select Firm' : 'Select Individual Plumber'}
                  </h2>
                  <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                    {loadingPlumbers ? (
                      <div className="flex items-center gap-3 justify-center py-6">
                        <Loader2 className="w-5 h-5 text-[#1f3a5f] animate-spin" />
                        <span className="text-gray-600 font-['Poppins',sans-serif] text-[14px]">
                          Loading {plumberType === 'contractor' ? 'firms' : 'plumbers'}...
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                        {plumberType === 'contractor' ? (
                          <GovSelect
                            label="Firm Name / Agreement No"
                            required
                            placeholder="Select Firm"
                            options={firmOptions.length > 0 ? firmOptions : [{ value: '__none__', label: 'No approved firms found' }]}
                            value={selectedPlumberId}
                            onValueChange={handlePlumberSelect}
                            error={errors.selectedPlumberId}
                            disabled={isViewMode}
                          />
                        ) : (
                          <GovSelect
                            label="Select Plumber"
                            required
                            placeholder="Select Individual Plumber"
                            options={individualOptions.length > 0 ? individualOptions : [{ value: '__none__', label: 'No approved plumbers found' }]}
                            value={selectedPlumberId}
                            onValueChange={handlePlumberSelect}
                            error={errors.selectedPlumberId}
                            disabled={isViewMode}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── Section 3: Selected Contractor Details ───────────── */}
              {plumberType === 'contractor' && selectedContractor && (
                <div>
                  <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                    Firm Details
                  </h2>
                  <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 space-y-6">
                    {/* Contractors Information */}
                    <div>
                      <h3 className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
                        Contractors Information
                      </h3>
                      <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                        <ReadOnlyField label="Firm Name" value={selectedContractor.firmName} required />
                        <ReadOnlyField label="Type of Firm" value={getFirmTypeLabel(selectedContractor.typeOfFirm)} />
                        <ReadOnlyField label="Office Address" value={selectedContractor.officeAddress} />
                        <ReadOnlyField label="District" value={selectedContractor.district} />
                        <ReadOnlyField label="Taluk" value={selectedContractor.taluk} />
                        <ReadOnlyField label="Pincode" value={selectedContractor.pincode} />
                        <ReadOnlyField label="Mobile Number" value={selectedContractor.mobile} />
                        <ReadOnlyField label="Email ID" value={selectedContractor.email} />
                        <ReadOnlyField label="PAN Number" value={selectedContractor.panNumber} />
                        <ReadOnlyField label="GST Number" value={selectedContractor.gstNumber} />
                      </div>
                    </div>

                    {/* Authorized Person Details */}
                    <div className="pt-5 border-t border-gray-200">
                      <h3 className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
                        Authorized Person Details:
                      </h3>
                      <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                        <ReadOnlyField label="Full Name" value={selectedContractor.authFullName} required />
                        <ReadOnlyField label="Designation" value={selectedContractor.authDesignation} required />
                        <ReadOnlyField label="Mobile No" value={selectedContractor.authMobile} required />
                        <ReadOnlyField label="Email Id" value={selectedContractor.authEmail} required />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Section 3: Selected Individual Details ───────────── */}
              {plumberType === 'individual' && selectedIndividual && (
                <div>
                  <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                    Personal Details
                  </h2>
                  <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                      <ReadOnlyField label="Plumber Name" value={selectedIndividual.plumberName} />
                      <ReadOnlyField label="District" value={selectedIndividual.district} />
                      <ReadOnlyField label="City" value={selectedIndividual.city} />
                      <ReadOnlyField label="Street" value={selectedIndividual.street} />
                      <ReadOnlyField label="Ward No." value={selectedIndividual.wardNo} />
                      <ReadOnlyField label="Pincode" value={selectedIndividual.pincode} />
                      <ReadOnlyField label="Mobile Number" value={selectedIndividual.mobile} />
                      <ReadOnlyField label="Qualification" value={getQualificationLabel(selectedIndividual.qualification)} />
                      <ReadOnlyField label="Years of Experience" value={selectedIndividual.yearOfExperience} />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── View Mode: Show Bill Collector Details inline ─────── */}
              {isViewMode && bcFullName && (
                <div>
                  <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                    Bill Collector Details
                  </h2>
                  <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 space-y-6">
                    {/* Region Info */}
                    <div>
                      <h3 className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
                        Region Information
                      </h3>
                      <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                        <ReadOnlyField label="District" value={region.district} />
                        <ReadOnlyField label="ULB" value={region.ulb} />
                        <ReadOnlyField label="ULB Type" value={region.ulbType} />
                        <ReadOnlyField label="Authority Type" value={region.authorityType} />
                      </div>
                    </div>
                    {/* Personal Details */}
                    <div className="pt-5 border-t border-gray-200">
                      <h3 className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
                        Personal Details
                      </h3>
                      <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                        <ReadOnlyField label="Full Name" value={bcFullName} required />
                        <ReadOnlyField label="Date of Birth" value={bcDateOfBirth ? formatDateDisplay(bcDateOfBirth) : 'N/A'} required />
                        <ReadOnlyField label="Address" value={bcAddress} required />
                        <ReadOnlyField label="District" value={bcDistrict} required />
                        <ReadOnlyField label="City" value={bcCity} required />
                        <ReadOnlyField label="State" value={bcState} required />
                        <ReadOnlyField label="Pincode" value={bcPincode} required />
                        <ReadOnlyField label="Designation" value={getDesignationLabel(bcDesignation)} required />
                        <ReadOnlyField label="Employee Type" value={getEmployeeTypeLabel(bcEmployeeType)} required />
                        <ReadOnlyField label="Phone No" value={bcPhoneNo} required />
                        <ReadOnlyField label="e-Mail Id" value={bcEmail || 'N/A'} />
                        <div>
                          <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">
                            Active / Inactive<span className="text-red-500">*</span>
                          </label>
                          <div className="px-4 py-2.5 bg-white border border-gray-200 rounded-md text-[14px] text-gray-900 font-['Poppins',sans-serif] min-h-[42px] flex items-center">
                            <span className={bcActive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {bcActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Upload Documents */}
                    {(bcSupportingDocName || bcPhotoCopyName) && (
                      <div className="pt-5 border-t border-gray-200">
                        <h3 className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
                          Upload Documents
                        </h3>
                        <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                          <ReadOnlyField label="Supporting Doc" value={bcSupportingDocName || 'Not uploaded'} required />
                          <ReadOnlyField label="Photo Copy" value={bcPhotoCopyName || 'Not uploaded'} required />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* STEP 2: Bill Collector Personal Details                    */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {formStep === 2 && !isViewMode && (
            <>
              {/* ─── Region Info (Read-only from caseworker) ──────────── */}
              <div>
                <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Region Details
                </h2>
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                    <GovInput label="District" value={region.district} disabled onChange={() => {}} />
                    <GovInput label="ULB" value={region.ulb} disabled onChange={() => {}} />
                    <GovInput label="ULB Type" value={region.ulbType} disabled onChange={() => {}} />
                    <GovInput label="Authority Type" value={region.authorityType} disabled onChange={() => {}} />
                  </div>
                  {region.authorityType === 'ULB' && (
                    <p className="mt-3 text-[13px] text-[#1f3a5f] font-medium font-['Poppins',sans-serif] italic">
                      (Note: If Authority Type is ULB, system should capture the Bill Collected details)
                    </p>
                  )}
                </div>
              </div>

              {/* ─── Personal Details Section ────────────────────────── */}
              <div>
                <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Personal Details:
                </h2>
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                    {/* Row 1 */}
                    <GovInput
                      label="Full Name"
                      required
                      placeholder="Enter full name"
                      value={bcFullName}
                      onChange={(e) => {
                        setBcFullName(e.target.value);
                        if (errors.bcFullName) setErrors(prev => { const n = { ...prev }; delete n.bcFullName; return n; });
                      }}
                      error={errors.bcFullName}
                    />
                    <div>
                      <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                        Date of Birth<span className="text-red-600 ml-1">*</span>
                      </label>
                      <GovDatePicker
                        value={bcDateOfBirth}
                        onChange={(val) => {
                          setBcDateOfBirth(val);
                          if (errors.bcDateOfBirth) setErrors(prev => { const n = { ...prev }; delete n.bcDateOfBirth; return n; });
                        }}
                        placeholder="DD/MM/YYYY"
                        error={!!errors.bcDateOfBirth}
                      />
                      {errors.bcDateOfBirth && (
                        <p className="text-red-500 text-[12px] mt-1 font-['Poppins',sans-serif]">{errors.bcDateOfBirth}</p>
                      )}
                    </div>
                    <GovInput
                      label="Address"
                      required
                      placeholder="Enter address"
                      value={bcAddress}
                      onChange={(e) => {
                        setBcAddress(e.target.value);
                        if (errors.bcAddress) setErrors(prev => { const n = { ...prev }; delete n.bcAddress; return n; });
                      }}
                      error={errors.bcAddress}
                    />

                    {/* Row 2 */}
                    <GovSelect
                      label="District"
                      required
                      placeholder="Select District"
                      options={DISTRICT_OPTIONS}
                      value={bcDistrict}
                      onValueChange={handleBcDistrictChange}
                      error={errors.bcDistrict}
                    />
                    <GovSelect
                      label="City"
                      required
                      placeholder="Select City"
                      options={availableCities}
                      value={bcCity}
                      onValueChange={(val) => {
                        setBcCity(val);
                        if (errors.bcCity) setErrors(prev => { const n = { ...prev }; delete n.bcCity; return n; });
                      }}
                      error={errors.bcCity}
                    />
                    <GovInput
                      label="State"
                      required
                      value={bcState}
                      disabled
                      onChange={() => {}}
                    />

                    {/* Row 3 */}
                    <GovInput
                      label="Pincode"
                      required
                      placeholder="Enter pincode"
                      value={bcPincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setBcPincode(val);
                        if (errors.bcPincode) setErrors(prev => { const n = { ...prev }; delete n.bcPincode; return n; });
                      }}
                      error={errors.bcPincode}
                    />
                    <GovSelect
                      label="Designation"
                      required
                      placeholder="Select Designation"
                      options={DESIGNATION_OPTIONS}
                      value={bcDesignation}
                      onValueChange={(val) => {
                        setBcDesignation(val);
                        if (errors.bcDesignation) setErrors(prev => { const n = { ...prev }; delete n.bcDesignation; return n; });
                      }}
                      error={errors.bcDesignation}
                    />
                    <GovSelect
                      label="Employee Type"
                      required
                      placeholder="Select Employee Type"
                      options={EMPLOYEE_TYPE_OPTIONS}
                      value={bcEmployeeType}
                      onValueChange={(val) => {
                        setBcEmployeeType(val);
                        if (errors.bcEmployeeType) setErrors(prev => { const n = { ...prev }; delete n.bcEmployeeType; return n; });
                      }}
                      error={errors.bcEmployeeType}
                    />

                    {/* Row 4 */}
                    <GovInput
                      label="Phone No"
                      required
                      placeholder="Enter phone number"
                      value={bcPhoneNo}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setBcPhoneNo(val);
                        if (errors.bcPhoneNo) setErrors(prev => { const n = { ...prev }; delete n.bcPhoneNo; return n; });
                      }}
                      error={errors.bcPhoneNo}
                    />
                    <GovInput
                      label="e-Mail Id"
                      placeholder="Enter email address"
                      value={bcEmail}
                      onChange={(e) => setBcEmail(e.target.value)}
                    />
                    {/* Active / Inactive Toggle */}
                    <div>
                      <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                        Active / Inactive<span className="text-red-600 ml-1">*</span>
                      </label>
                      <div className="flex items-center gap-3 min-h-[42px]">
                        <button
                          type="button"
                          onClick={() => setBcActive(!bcActive)}
                          className={
                            'relative inline-flex h-7 w-[52px] items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 ' +
                            (bcActive ? 'bg-[#1f3a5f]' : 'bg-gray-300')
                          }
                        >
                          <span className={
                            'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ' +
                            (bcActive ? 'translate-x-[27px]' : 'translate-x-[3px]')
                          } />
                        </button>
                        <span className={
                          'text-[14px] font-medium font-[\'Poppins\',sans-serif] ' +
                          (bcActive ? 'text-green-600' : 'text-gray-500')
                        }>
                          {bcActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Upload Documents Section ────────────────────────── */}
              <div>
                <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Upload Documents:
                </h2>
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                    {/* Supporting Doc */}
                    <div>
                      <p className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif] mb-3">
                        Supporting Doc <span className="text-red-600">*</span>
                      </p>
                      <input
                        ref={supportingDocRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert('File size must be less than 5MB');
                              return;
                            }
                            setBcSupportingDoc(file);
                            setBcSupportingDocName(file.name);
                          }
                        }}
                      />
                      {bcSupportingDoc ? (
                        <div className="flex items-center gap-3 bg-white border border-green-300 rounded-lg px-4 py-3">
                          <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 font-['Poppins',sans-serif] truncate">
                              {bcSupportingDocName}
                            </p>
                            <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                              {(bcSupportingDoc.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <button
                            type="button"
                            onClick={() => { setBcSupportingDoc(null); setBcSupportingDocName(''); }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <GovButton variant="primary" size="sm" onClick={() => supportingDocRef.current && supportingDocRef.current.click()}>
                          <Upload className="w-4 h-4" />
                          Upload Document
                        </GovButton>
                      )}
                      <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1.5">
                        PDF, JPG, PNG (Max 5MB)
                      </p>
                    </div>

                    {/* Photo Copy */}
                    <div>
                      <p className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif] mb-3">
                        Photo Copy <span className="text-red-600">*</span>
                      </p>
                      <input
                        ref={photoCopyRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert('File size must be less than 5MB');
                              return;
                            }
                            setBcPhotoCopy(file);
                            setBcPhotoCopyName(file.name);
                          }
                        }}
                      />
                      {bcPhotoCopy ? (
                        <div className="flex items-center gap-3 bg-white border border-green-300 rounded-lg px-4 py-3">
                          <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 font-['Poppins',sans-serif] truncate">
                              {bcPhotoCopyName}
                            </p>
                            <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                              {(bcPhotoCopy.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <button
                            type="button"
                            onClick={() => { setBcPhotoCopy(null); setBcPhotoCopyName(''); }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <GovButton variant="primary" size="sm" onClick={() => photoCopyRef.current && photoCopyRef.current.click()}>
                          <Upload className="w-4 h-4" />
                          Upload Document
                        </GovButton>
                      )}
                      <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1.5">
                        PDF, JPG, PNG (Max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── Action Buttons ────────────────────────────────────────── */}
          <div className="flex justify-end gap-4 mt-6">
            {isViewMode ? (
              <>
                <GovButton variant="outline" onClick={handleBack}>Back to List</GovButton>
                <GovButton variant="primary" onClick={() => { setMode('form'); setFormStep(1); fetchPlumbers(); }}>
                  <Pencil className="w-4 h-4" />
                  Edit
                </GovButton>
              </>
            ) : formStep === 1 ? (
              <>
                <GovButton variant="outline" onClick={handleBack}>Cancel</GovButton>
                <GovButton
                  variant="primary"
                  onClick={handleNextStep}
                  disabled={!plumberType || !selectedPlumberId}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </GovButton>
              </>
            ) : (
              <>
                <GovButton variant="outline" onClick={handlePreviousStep}>
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </GovButton>
                <GovButton variant="primary" onClick={handleSave} loading={saving}>
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update' : 'Save'}
                </GovButton>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper: Format date for display ────────────────────────────────────────
function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
  } catch {
    return dateStr;
  }
}

// ─── Helper: Designation label ──────────────────────────────────────────────
function getDesignationLabel(val: string): string {
  const map: Record<string, string> = {
    'bill-collector': 'Bill Collector',
    'senior-bill-collector': 'Senior Bill Collector',
    'meter-reader': 'Meter Reader',
  };
  return map[val] || val || 'N/A';
}

// ─── Helper: Employee Type label ────────────────────────────────────────────
function getEmployeeTypeLabel(val: string): string {
  const map: Record<string, string> = {
    'permanent': 'Permanent',
    'contract': 'Contract',
    'temporary': 'Temporary',
    'outsourced': 'Outsourced',
  };
  return map[val] || val || 'N/A';
}

// ─── Read-Only Field Component ──────────────────────────────────────────────

function ReadOnlyField({ label, value, required }: { label: string; value: string; required?: boolean }) {
  const displayValue = value && value !== 'N/A' && value !== '' ? value : 'N/A';
  return (
    <div>
      <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="px-4 py-2.5 bg-white border border-gray-200 rounded-md text-[14px] text-gray-900 font-['Poppins',sans-serif] min-h-[42px] flex items-center">
        {displayValue}
      </div>
    </div>
  );
}

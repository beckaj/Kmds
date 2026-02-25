import { useState, useEffect } from 'react';
import { Award, RefreshCw, CheckCircle, AlertCircle, Send, Search, Pencil, X } from 'lucide-react';
import { GovButton } from '../ui/gov-button';
import SectionTitle from './SectionTitle';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface LicenseApp {
  id: string;
  registrationType: string;
  status: string;
  submittedAt: string;
  updatedAt: string;
  applicantName: string;
  district: string;
  ulb: string;
  financialYear: string;
  registrationFees: string;
  licenseNumber: string;
  licenseIssuedAt: string;
  licenseValidUntil: string;
  plumberName: string;
  addressDistrict: string;
  city: string;
  street: string;
  wardNo: string;
  pincode: string;
  mobileNumber: string;
  qualification: string;
  yearOfExperience: string;
  // Contractor fields
  firmName: string;
  typeOfFirm: string;
  officeAddress: string;
  contDistrict: string;
  taluk: string;
  emailId: string;
  panNumber: string;
  gstNumber: string;
  authFullName: string;
  authDesignation: string;
  authMobile: string;
  authEmail: string;
  documents: any;
  workflow: any;
  paymentDetails: any;
  dscDetails: any;
  renewalApplicationId?: string;
  blacklisted?: boolean;
}

const QUALIFICATION_LABELS: Record<string, string> = {
  'iti': 'ITI',
  'diploma': 'Diploma in Plumbing',
  'certificate': 'Certificate Course',
  'bsc': 'B.Sc. (Plumbing Technology)',
  'experience-based': 'Experience Based',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  '1': '1 Year',
  '2': '2 Years',
  '3': '3 Years',
  '4': '4 Years',
  '5': '5 Years',
  '6-10': '6-10 Years',
  '10+': '10+ Years',
};

const formatLabel = (value: string | undefined | null): string => {
  if (!value) return 'N/A';
  return value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDateFull = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Demo approved license — used as fallback; expiry set within 30-day window of today
const DEMO_APPROVED_LICENSE: LicenseApp = {
  id: 'PLR-2024-00001',
  registrationType: 'individual',
  status: 'approved',
  submittedAt: '2023-06-15T10:30:00.000Z',
  updatedAt: '2023-08-01T14:00:00.000Z',
  applicantName: 'Ramesh A R',
  district: 'davanagere',
  ulb: 'hubli-dharwad',
  financialYear: '2023-2024',
  registrationFees: '500',
  licenseNumber: 'HUB-DHAR/0001/PLN',
  licenseIssuedAt: '2024-03-15T00:00:00.000Z',
  licenseValidUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
  plumberName: 'Ramesh A R',
  addressDistrict: 'davanagere',
  city: 'Davanagere',
  street: 'Ayodhya Nagar',
  wardNo: 'Ward No 12',
  pincode: '580017',
  mobileNumber: '9988776655',
  qualification: 'iti',
  yearOfExperience: '2',
  firmName: '',
  typeOfFirm: '',
  officeAddress: '',
  contDistrict: '',
  taluk: '',
  emailId: '',
  panNumber: '',
  gstNumber: '',
  authFullName: '',
  authDesignation: '',
  authMobile: '',
  authEmail: '',
  documents: {},
  workflow: {
    currentStep: 'approved',
    caseworker: { status: 'approved', remarks: 'Verified and approved', updatedAt: '2023-07-10T10:00:00.000Z' },
    fieldEngineer: { status: 'approved', remarks: 'Field inspection passed', updatedAt: '2023-07-20T14:00:00.000Z' },
    commissioner: { status: 'approved', remarks: 'Approved for license issuance', updatedAt: '2023-08-01T14:00:00.000Z' },
  },
  paymentDetails: { amount: '500', transactionId: 'TXN-2023-08-001', paidAt: '2023-06-15T10:35:00.000Z' },
  dscDetails: { applied: true, appliedAt: '2023-08-01T14:30:00.000Z' },
};

// ── Readonly Field Component ─────────────────────────────────────────────────
function ReadonlyField({ label, value, required }: { label: string; value: string; required?: boolean }) {
  return (
    <div>
      <p className="font-['Poppins',sans-serif] text-[13px] font-medium text-gray-600 mb-1.5">
        {label}{required && <span className="text-[#ea1c1c] ml-0.5">*</span>}
      </p>
      <div className="bg-[#f0f0f0] border border-[rgba(0,0,0,0.2)] rounded-[6px] h-[40px] w-full flex items-center px-3.5">
        <p className="font-['Poppins',sans-serif] text-[13px] text-[#170f49] truncate">
          {value || 'N/A'}
        </p>
      </div>
    </div>
  );
}

// ── Editable Field Component ─────────────────────────────────────────────────
function EditableField({
  label, value, onChange, required, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <p className="font-['Poppins',sans-serif] text-[13px] font-medium text-gray-600 mb-1.5">
        {label}{required && <span className="text-[#ea1c1c] ml-0.5">*</span>}
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ''}
        className="w-full h-[40px] px-3.5 border-[1.5px] border-[#1f3a5f] rounded-[6px] font-['Poppins',sans-serif] text-[13px] text-[#170f49] bg-white focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
      />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function PlumberLicenseRenewal() {
  // Step 1: Lookup
  const [licenseInput, setLicenseInput] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Step 2: Fetched license data
  const [fetchedLicense, setFetchedLicense] = useState<LicenseApp | null>(null);
  const [renewalEligible, setRenewalEligible] = useState(false);
  const [renewalMessage, setRenewalMessage] = useState('');

  // Address editing
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editStreet, setEditStreet] = useState('');
  const [editWardNo, setEditWardNo] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPincode, setEditPincode] = useState('');

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [renewalSuccess, setRenewalSuccess] = useState(false);
  const [renewalAppId, setRenewalAppId] = useState('');

  // Seed demo on mount
  useEffect(() => {
    seedDemoLicense();
  }, []);

  const seedDemoLicense = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const citizenId = userData && userData.phone ? userData.phone : '9988776655';
      const demoWithCitizen = { ...DEMO_APPROVED_LICENSE, citizenId };
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/seed-demo`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ demoApplication: demoWithCitizen }),
        }
      );
    } catch (err) {
      console.error('[PLUMBER RENEWAL] Error seeding demo license:', err);
    }
  };

  const handleFetch = async () => {
    const trimmed = licenseInput.trim();
    if (!trimmed) {
      setFetchError('Please enter a valid license number.');
      return;
    }

    setFetching(true);
    setFetchError('');
    setFetchedLicense(null);
    setRenewalEligible(false);
    setRenewalMessage('');
    setIsEditingAddress(false);

    try {
      console.log('[PLUMBER RENEWAL] Looking up license:', trimmed);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/lookup-by-license/${encodeURIComponent(trimmed)}`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      console.log('[PLUMBER RENEWAL] Lookup response:', JSON.stringify(data).substring(0, 500));

      if (data && data.success && data.application) {
        setFetchedLicense(data.application);
        setRenewalEligible(!!data.renewalEligible);
        setRenewalMessage(data.renewalMessage || '');
        // Initialise editable address fields
        const app = data.application;
        setEditStreet(app.street || '');
        setEditWardNo(app.wardNo || '');
        setEditCity(app.city || '');
        setEditPincode(app.pincode || '');
      } else {
        const errMsg = data && data.error ? data.error : 'License not found. Please check the number and try again.';
        setFetchError(errMsg);
      }
    } catch (error) {
      console.error('[PLUMBER RENEWAL] Fetch error:', error);
      setFetchError('Failed to connect to the server. Please try again.');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmitRenewal = async () => {
    if (!fetchedLicense) return;

    setSubmitting(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const citizenId = userData && userData.phone ? userData.phone : '';

      const body: any = {
        originalApplicationId: fetchedLicense.id,
        licenseNumber: fetchedLicense.licenseNumber,
        citizenId,
      };

      // Include updated address if the user edited it
      if (isEditingAddress) {
        body.updatedAddress = {
          street: editStreet,
          wardNo: editWardNo,
          city: editCity,
          pincode: editPincode,
        };
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/renew`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      const result = await response.json();
      console.log('[PLUMBER RENEWAL] Submit response:', JSON.stringify(result));

      if (result && result.success) {
        setRenewalSuccess(true);
        setRenewalAppId(result.applicationId || '');
      } else {
        const errorMsg = result && result.error ? result.error : 'Unknown error';
        console.error('[PLUMBER RENEWAL] Error:', errorMsg);
        alert('Error submitting renewal: ' + errorMsg);
      }
    } catch (error) {
      console.error('[PLUMBER RENEWAL] Error:', error);
      alert('Error submitting renewal: ' + error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setLicenseInput('');
    setFetchedLicense(null);
    setRenewalEligible(false);
    setRenewalMessage('');
    setFetchError('');
    setIsEditingAddress(false);
    setRenewalSuccess(false);
    setRenewalAppId('');
  };

  const isIndividual = fetchedLicense ? fetchedLicense.registrationType !== 'contractor' : true;

  // ─── Renewal Success Screen ────────────────────────────────────────────────
  if (renewalSuccess) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <SectionTitle title="Renewal of License" className="mb-6" />

        <div className="bg-white rounded-[8px] border border-gray-200 shadow-sm p-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Renewal Application Submitted!
            </h2>
            <p className="text-gray-600 font-['Poppins',sans-serif] mb-2 text-lg">
              Your plumber license renewal application has been submitted successfully.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 mb-4 inline-block">
              <p className="text-sm text-blue-700 font-['Poppins',sans-serif]">
                Renewal Application ID: <span className="font-bold font-mono text-[#1f3a5f]">{renewalAppId}</span>
              </p>
            </div>
            {fetchedLicense && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-6 py-3 mb-6 inline-block">
                <p className="text-sm text-gray-700 font-['Poppins',sans-serif]">
                  Original License: <span className="font-bold">{fetchedLicense.licenseNumber}</span>
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-8 max-w-lg">
              Your renewal application has been forwarded to the Caseworker for verification.
              You can track the status from the Application Status page.
            </p>
            <div className="flex gap-4">
              <GovButton variant="primary" onClick={handleReset}>
                <RefreshCw className="w-4 h-4" />
                Renew Another License
              </GovButton>
              <GovButton
                variant="outline"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate', { detail: '/jalanidhi/plumber/application-status' }));
                }}
              >
                Track Application Status
              </GovButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main View ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <SectionTitle title="Renewal of License" className="mb-2" />
      <p className="text-gray-600 font-['Poppins',sans-serif] text-sm mb-6">
        Enter your existing license number to fetch details and submit a renewal application
      </p>

      {/* ─── License Number Input ─── */}
      <div className="bg-white rounded-[8px] border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-end gap-4">
          <div className="flex-1 max-w-[480px]">
            <label className="block font-['Poppins',sans-serif] text-[14px] font-medium text-gray-700 mb-2">
              License Number <span className="text-[#ea1c1c]">*</span>
            </label>
            <input
              type="text"
              value={licenseInput}
              onChange={(e) => { setLicenseInput(e.target.value); setFetchError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleFetch(); }}
              placeholder="e.g. HUB-DHAR/0001/PLN"
              disabled={fetching}
              className="w-full h-[44px] px-4 border-[1.5px] border-gray-300 rounded-[6px] font-['Poppins',sans-serif] text-[14px] text-[#170f49] bg-white focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <GovButton
            variant="primary"
            size="lg"
            onClick={handleFetch}
            disabled={fetching || !licenseInput.trim()}
            loading={fetching}
          >
            <Search className="w-4 h-4" />
            {fetching ? 'Fetching...' : 'Fetch'}
          </GovButton>
          {fetchedLicense && (
            <GovButton variant="outline" size="lg" onClick={handleReset}>
              <X className="w-4 h-4" />
              Clear
            </GovButton>
          )}
        </div>

        {/* Error message */}
        {fetchError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-['Poppins',sans-serif]">{fetchError}</p>
          </div>
        )}

        {/* Hint */}
        {!fetchedLicense && !fetchError && (
          <p className="mt-3 text-xs text-gray-400 font-['Poppins',sans-serif]">
            Demo license number: <span className="font-mono text-gray-500 font-medium">HUB-DHAR/0001/PLN</span>
          </p>
        )}
      </div>

      {/* ─── Fetched License Details ─── */}
      {fetchedLicense && (
        <div className="bg-white rounded-[8px] border border-gray-200 shadow-sm overflow-hidden">

          {/* Eligibility Banner */}
          {renewalEligible ? (
            <div className="bg-green-50 border-b border-green-200 px-6 py-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[14px] font-semibold text-green-800 font-['Poppins',sans-serif]">Eligible for Renewal</p>
                <p className="text-[13px] text-green-700 font-['Poppins',sans-serif]">{renewalMessage}</p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[14px] font-semibold text-amber-800 font-['Poppins',sans-serif]">Not Eligible for Renewal</p>
                <p className="text-[13px] text-amber-700 font-['Poppins',sans-serif]">{renewalMessage}</p>
              </div>
            </div>
          )}

          <div className="p-6 space-y-8">

            {/* ── License Status Summary ── */}
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1f3a5f]/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#1f3a5f]" />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">{fetchedLicense.licenseNumber}</p>
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                      {isIndividual ? 'Individual Plumber' : 'Contractor'} &middot; {fetchedLicense.financialYear || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-['Poppins',sans-serif] bg-green-100 text-green-800 border border-green-200">
                    Active
                  </span>
                  <div className="text-right">
                    <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">Valid Until</p>
                    <p className="text-[13px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">{formatDateFull(fetchedLicense.licenseValidUntil)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 1: District & ULB ── */}
            <div>
              <SectionTitle title="District & ULB" className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
                <ReadonlyField label="District" value={formatLabel(fetchedLicense.district)} required />
                <ReadonlyField label="ULB" value={formatLabel(fetchedLicense.ulb)} required />
                <ReadonlyField label="Financial Year" value={fetchedLicense.financialYear || 'N/A'} />
                <ReadonlyField label="Registration Fees" value={fetchedLicense.registrationFees ? '\u20B9 ' + fetchedLicense.registrationFees : 'N/A'} />
              </div>
            </div>

            {/* ── Section 2: Personal Details (Individual) ── */}
            {isIndividual && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle title="Personal Details" />
                  {renewalEligible && (
                    <button
                      onClick={() => setIsEditingAddress(!isEditingAddress)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold font-['Poppins',sans-serif] border transition-colors cursor-pointer
                        bg-white border-[#1f3a5f] text-[#1f3a5f] hover:bg-[#1f3a5f]/5"
                    >
                      {isEditingAddress ? (
                        <><X className="w-3.5 h-3.5" /> Cancel Edit</>
                      ) : (
                        <><Pencil className="w-3.5 h-3.5" /> Edit Address</>
                      )}
                    </button>
                  )}
                </div>

                {/* Non-editable fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4 mb-4">
                  <ReadonlyField label="Plumber Name" value={fetchedLicense.plumberName || fetchedLicense.applicantName || 'N/A'} required />
                  <ReadonlyField label="Mobile Number" value={fetchedLicense.mobileNumber || 'N/A'} required />
                  <ReadonlyField
                    label="Qualification"
                    value={fetchedLicense.qualification && QUALIFICATION_LABELS[fetchedLicense.qualification]
                      ? QUALIFICATION_LABELS[fetchedLicense.qualification]
                      : (fetchedLicense.qualification || 'N/A')}
                    required
                  />
                  <ReadonlyField
                    label="Experience"
                    value={fetchedLicense.yearOfExperience && EXPERIENCE_LABELS[fetchedLicense.yearOfExperience]
                      ? EXPERIENCE_LABELS[fetchedLicense.yearOfExperience]
                      : (fetchedLicense.yearOfExperience || 'N/A')}
                  />
                </div>

                {/* Address fields — editable when isEditingAddress is true */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
                  <ReadonlyField label="District (Address)" value={formatLabel(fetchedLicense.addressDistrict)} required />
                  {isEditingAddress ? (
                    <>
                      <EditableField label="City" value={editCity} onChange={setEditCity} required placeholder="Enter city" />
                      <EditableField label="Street" value={editStreet} onChange={setEditStreet} required placeholder="Enter street" />
                      <EditableField label="Ward No" value={editWardNo} onChange={setEditWardNo} required placeholder="Enter ward no" />
                    </>
                  ) : (
                    <>
                      <ReadonlyField label="City" value={fetchedLicense.city || 'N/A'} required />
                      <ReadonlyField label="Street" value={fetchedLicense.street || 'N/A'} required />
                      <ReadonlyField label="Ward No" value={fetchedLicense.wardNo || 'N/A'} required />
                    </>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4 mt-4">
                  {isEditingAddress ? (
                    <EditableField label="Pincode" value={editPincode} onChange={setEditPincode} required placeholder="Enter pincode" />
                  ) : (
                    <ReadonlyField label="Pincode" value={fetchedLicense.pincode || 'N/A'} required />
                  )}
                </div>

                {isEditingAddress && (
                  <p className="mt-3 text-xs text-blue-600 font-['Poppins',sans-serif] italic">
                    Only address fields (City, Street, Ward No, Pincode) can be updated. All other details are carried forward from the existing license.
                  </p>
                )}
              </div>
            )}

            {/* ── Section 2 (Contractor) ── */}
            {!isIndividual && (
              <div>
                <SectionTitle title="Contractor Details" className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
                  <ReadonlyField label="Firm Name" value={fetchedLicense.firmName || fetchedLicense.applicantName || 'N/A'} required />
                  <ReadonlyField label="Type of Firm" value={formatLabel(fetchedLicense.typeOfFirm)} />
                  <ReadonlyField label="Mobile Number" value={fetchedLicense.mobileNumber || 'N/A'} required />
                  <ReadonlyField label="Email" value={fetchedLicense.emailId || 'N/A'} />
                  <ReadonlyField label="Office Address" value={fetchedLicense.officeAddress || 'N/A'} />
                  <ReadonlyField label="District" value={formatLabel(fetchedLicense.contDistrict)} />
                  <ReadonlyField label="Taluk" value={fetchedLicense.taluk || 'N/A'} />
                  <ReadonlyField label="PAN Number" value={fetchedLicense.panNumber || 'N/A'} />
                  <ReadonlyField label="GST Number" value={fetchedLicense.gstNumber || 'N/A'} />
                </div>
              </div>
            )}

            {/* ── Section 3: License Period & Fees ── */}
            <div>
              <SectionTitle title="License Period & Renewal Fees" className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
                <ReadonlyField label="License Issued On" value={formatDate(fetchedLicense.licenseIssuedAt)} required />
                <ReadonlyField label="Valid Until" value={formatDate(fetchedLicense.licenseValidUntil)} required />
                <ReadonlyField label="Renewal Fees" value={'\u20B9 1,000'} required />
                <ReadonlyField label="Renewal Period" value="2 Years (from approval date)" />
              </div>
            </div>
          </div>

          {/* ── Submit Bar ── */}
          <div className="border-t border-gray-200 px-6 py-5 bg-[#f8f9fa] flex items-center justify-between">
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] max-w-md">
              {renewalEligible
                ? 'By clicking submit, your renewal application will be forwarded to the Caseworker for verification. Renewal fee of \u20B9 1,000 will be collected after approval.'
                : 'Renewal submission is currently unavailable. Please see the eligibility message above.'
              }
            </p>
            <div className="flex items-center gap-3">
              <GovButton variant="outline" size="lg" onClick={handleReset} disabled={submitting}>
                Cancel
              </GovButton>
              <GovButton
                variant="primary"
                size="lg"
                onClick={handleSubmitRenewal}
                loading={submitting}
                disabled={submitting || !renewalEligible}
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Submit Renewal'}
              </GovButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

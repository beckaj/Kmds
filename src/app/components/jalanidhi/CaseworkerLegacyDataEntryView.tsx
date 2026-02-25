import { useState } from 'react';
import { GovInput } from '../ui/gov-input';
import { GovButton } from '../ui/gov-button';
import { GovSelect } from '../ui/gov-select';
import { GovRadio } from '../ui/gov-radio';
import {
  MapPin,
  Plug,
  IndianRupee,
  Send,
  CheckCircle,
  Phone,
  Gauge,
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

// ─── Constants ──────────────────────────────────────────────────────────────

const STATES = [
  { value: '__none__', label: '-- Select State --' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Goa', label: 'Goa' },
];

const DISTRICTS = [
  { value: '__none__', label: '-- Select District --' },
  { value: 'Dharwad', label: 'Dharwad' },
  { value: 'Belgaum', label: 'Belgaum' },
  { value: 'Bangalore Urban', label: 'Bangalore Urban' },
  { value: 'Mysore', label: 'Mysore' },
  { value: 'Mangalore', label: 'Mangalore' },
  { value: 'Gulbarga', label: 'Gulbarga' },
  { value: 'Bellary', label: 'Bellary' },
];

const CITIES = [
  { value: '__none__', label: '-- Select City --' },
  { value: 'Hubballi', label: 'Hubballi' },
  { value: 'Dharwad', label: 'Dharwad' },
  { value: 'Belgaum', label: 'Belgaum' },
  { value: 'Bangalore', label: 'Bangalore' },
  { value: 'Mysore', label: 'Mysore' },
];

const CONNECTION_TYPES = [
  { value: '__none__', label: '-- Select Connection Type --' },
  { value: 'Domestic ½"', label: 'Domestic ½"' },
  { value: 'Domestic ¾"', label: 'Domestic ¾"' },
  { value: 'Domestic 1"', label: 'Domestic 1"' },
  { value: 'Non-Domestic ½"', label: 'Non-Domestic ½"' },
  { value: 'Non-Domestic ¾"', label: 'Non-Domestic ¾"' },
  { value: 'Commercial ¾"', label: 'Commercial ¾"' },
  { value: 'Commercial 4"', label: 'Commercial 4"' },
  { value: 'Industries 4"', label: 'Industries 4"' },
  { value: 'Industries 6"', label: 'Industries 6"' },
];

const METER_CATEGORIES = [
  { value: '__none__', label: '-- Select Meter Category --' },
  { value: 'Metered', label: 'Metered' },
  { value: 'Non-Metered', label: 'Non-Metered' },
];

const CONNECTION_STATUSES = [
  { value: '__none__', label: '-- Select Status --' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Disconnected', label: 'Disconnected' },
  { value: 'Temporarily Disconnected', label: 'Temporarily Disconnected' },
];

export default function CaseworkerLegacyDataEntryView() {
  // Owner/Tenant
  const [applicantType, setApplicantType] = useState('owner');

  // Location of Tap Connection
  const [fullName, setFullName] = useState('');
  const [houseDoorNo, setHouseDoorNo] = useState('');
  const [wardNumber, setWardNumber] = useState('');
  const [street, setStreet] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('Dharwad');
  const [city, setCity] = useState('Hubballi');
  const [pincode, setPincode] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [mobileVerified, setMobileVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Existing Connection Details
  const [rrNumber, setRRNumber] = useState('');
  const [connectionType, setConnectionType] = useState('');
  const [meterCategory, setMeterCategory] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');

  // Financial Details - dynamically compute FY and date
  const [currentFY, setCurrentFY] = useState(() => {
    const now = new Date();
    const month = now.getMonth(); // 0-indexed: Jan=0, Mar=2, Apr=3
    const year = now.getFullYear();
    if (month <= 2) {
      return (year - 1) + '-' + year;
    }
    return year + '-' + (year + 1);
  });
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return yyyy + '-' + mm + '-' + dd;
  });
  const [openingBalance, setOpeningBalance] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [interestAmount, setInterestAmount] = useState('');
  const [interestPercent, setInterestPercent] = useState('');

  // Billing Details
  const [isVolumetricBilling, setIsVolumetricBilling] = useState('yes');
  const [previousMeterReading, setPreviousMeterReading] = useState('');

  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  const handleVerifyMobile = () => {
    if (!mobileNo || mobileNo.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    setVerifying(true);
    // Simulate OTP send
    setTimeout(() => {
      setOtpSent(true);
      setVerifying(false);
      alert('OTP sent to ' + mobileNo + ' (for demo, use 1234)');
    }, 1000);
  };

  const handleVerifyOTP = () => {
    if (otp === '1234') {
      setMobileVerified(true);
      alert('Mobile number verified successfully!');
    } else {
      alert('Invalid OTP. Please try again. (Hint: use 1234)');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!fullName.trim()) { alert('Please enter Full Name.'); return; }
    if (!houseDoorNo.trim()) { alert('Please enter House/Door No.'); return; }
    if (!wardNumber.trim()) { alert('Please enter Ward Number.'); return; }
    if (!street.trim()) { alert('Please enter Street.'); return; }
    if (!address.trim()) { alert('Please enter Address.'); return; }
    if (!mobileNo.trim()) { alert('Please enter Mobile No.'); return; }
    if (!rrNumber.trim()) { alert('Please enter RR Number.'); return; }
    if (!connectionType || connectionType === '__none__') { alert('Please select Connection Type.'); return; }
    if (!meterCategory || meterCategory === '__none__') { alert('Please select Meter Category.'); return; }
    if (!connectionStatus || connectionStatus === '__none__') { alert('Please select Connection Status.'); return; }

    if (!confirm('Are you sure you want to submit this Legacy Data Entry?')) return;

    setSubmitting(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const caseworkerName = userData && userData.name ? userData.name : 'Caseworker';
      const caseworkerId = userData && userData.id ? userData.id : 'CW001';

      const payload = {
        applicantType,
        locationDetails: {
          fullName: fullName.trim(),
          houseDoorNo: houseDoorNo.trim(),
          wardNumber: wardNumber.trim(),
          street: street.trim(),
          address: address.trim(),
          state,
          district,
          city,
          pincode: pincode.trim(),
          mobileNo: mobileNo.trim(),
          mobileVerified,
        },
        existingConnection: {
          rrNumber: rrNumber.trim(),
          connectionType,
          meterCategory,
          connectionStatus,
        },
        financialDetails: {
          currentFY,
          currentDate,
          openingBalance: openingBalance.trim(),
          principalAmount: principalAmount.trim(),
          interestAmount: interestAmount.trim(),
          interestPercent: interestPercent.trim(),
        },
        billingDetails: {
          isVolumetricBilling,
          previousMeterReading: previousMeterReading.trim(),
        },
        caseworkerName,
        caseworkerId,
        // Read-only header data
        headerDetails: {
          district: 'Dharwad',
          ulb: 'Hubli-Dharwad',
          authorityType: 'Board',
          ulbType: 'CC',
        },
      };

      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/legacy-data/submit',
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
      if (result.success) {
        setSubmitted(true);
        setSubmittedId(result.applicationId || '');
      } else {
        console.error('[LEGACY DATA] Submit error:', result.error);
        alert('Failed to submit: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('[LEGACY DATA] Error submitting:', err);
      alert('Network error while submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setApplicantType('owner');
    setFullName('');
    setHouseDoorNo('');
    setWardNumber('');
    setStreet('');
    setAddress('');
    setState('Karnataka');
    setDistrict('Dharwad');
    setCity('Hubballi');
    setPincode('');
    setMobileNo('');
    setOtpSent(false);
    setOtp('');
    setMobileVerified(false);
    setRRNumber('');
    setConnectionType('');
    setMeterCategory('');
    setConnectionStatus('');
    setCurrentFY(() => {
      const now = new Date();
      const month = now.getMonth(); // 0-indexed: Jan=0, Mar=2, Apr=3
      const year = now.getFullYear();
      if (month <= 2) {
        return (year - 1) + '-' + year;
      }
      return year + '-' + (year + 1);
    });
    setCurrentDate(() => {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      return yyyy + '-' + mm + '-' + dd;
    });
    setOpeningBalance('');
    setPrincipalAmount('');
    setInterestAmount('');
    setInterestPercent('');
    setIsVolumetricBilling('yes');
    setPreviousMeterReading('');
    setSubmitted(false);
    setSubmittedId('');
  };

  // Success state
  if (submitted) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-green-800 font-['Poppins',sans-serif] mb-2">
            Legacy Data Entry Submitted Successfully!
          </h2>
          <p className="text-green-700 font-['Poppins',sans-serif] text-sm mb-1">
            Application ID: <span className="font-semibold">{submittedId}</span>
          </p>
          <p className="text-green-600 font-['Poppins',sans-serif] text-xs mb-6">
            The application has been submitted and forwarded to the Field Engineer for verification.
          </p>
          <GovButton variant="primary" onClick={handleReset}>
            Submit Another Entry
          </GovButton>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
          Legacy Data Entry
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
          Enter legacy connection details - Basic Details, Financial Details & Billing Details
        </p>
      </div>

      {/* Section 1: Read-Only Summary Header */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
              District<span className="text-red-600 ml-1">*</span>
            </label>
            <div className="h-10 px-3 flex items-center bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-800 font-['Poppins',sans-serif] font-medium">
              Dharwad
            </div>
          </div>
          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
              ULB<span className="text-red-600 ml-1">*</span>
            </label>
            <div className="h-10 px-3 flex items-center bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-800 font-['Poppins',sans-serif] font-medium">
              Hubli-Dharwad
            </div>
          </div>
          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
              Authority Type<span className="text-red-600 ml-1">*</span>
            </label>
            <div className="h-10 px-3 flex items-center bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-800 font-['Poppins',sans-serif] font-medium">
              Board
            </div>
          </div>
          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
              ULB Type<span className="text-red-600 ml-1">*</span>
            </label>
            <div className="h-10 px-3 flex items-center bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-800 font-['Poppins',sans-serif] font-medium">
              CC
            </div>
          </div>
        </div>

        {/* Owner / Tenant Radio */}
        <div className="mt-5 flex items-center gap-6">
          <GovRadio
            name="applicantType"
            options={[
              { value: 'owner', label: 'Owner' },
              { value: 'tenant', label: 'Tenant' },
            ]}
            value={applicantType}
            onChange={(val) => setApplicantType(val)}
          />
          
        </div>
      </div>

      {/* Section 2: Location of Tap Connection */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location of the Tap Connection:
        </h2>

        {/* Row 1 */}
        <div className="grid grid-cols-3 gap-6 mb-5">
          <GovInput
            label="Full Name"
            required
            placeholder="Enter Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <GovInput
            label="House/Door No"
            required
            placeholder="Enter Door No"
            value={houseDoorNo}
            onChange={(e) => setHouseDoorNo(e.target.value)}
          />
          <GovInput
            label="Ward Number"
            required
            placeholder="e.g., Ward No.10"
            value={wardNumber}
            onChange={(e) => setWardNumber(e.target.value)}
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-3 gap-6 mb-5">
          <GovInput
            label="Street"
            required
            placeholder="Enter Street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
          <GovInput
            label="Address"
            required
            placeholder="Enter Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <GovSelect
            label="State"
            required
            placeholder="-- Select State --"
            options={STATES}
            value={state}
            onValueChange={setState}
          />
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-3 gap-6 mb-5">
          <GovSelect
            label="District"
            required
            placeholder="-- Select District --"
            options={DISTRICTS}
            value={district}
            onValueChange={setDistrict}
          />
          <GovSelect
            label="City"
            required
            placeholder="-- Select City --"
            options={CITIES}
            value={city}
            onValueChange={setCity}
          />
          <GovInput
            label="Pincode"
            required
            placeholder="Enter Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            maxLength={6}
          />
        </div>

        {/* Row 4: Mobile + Get OTP + OTP */}
        <div className="grid grid-cols-[1fr_auto_1fr_1fr] gap-4 items-end">
          <GovInput
            label="Mobile No"
            required
            placeholder="Enter Mobile No"
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            maxLength={10}
          />
          <div>
            {!mobileVerified ? (
              <GovButton
                variant="success"
                onClick={handleVerifyMobile}
                disabled={verifying || otpSent || !mobileNo || mobileNo.length < 10}
                loading={verifying}
              >
                <Phone className="w-4 h-4" />
                Get OTP
              </GovButton>
            ) : (
              <div className="h-10 flex items-center gap-1.5 text-green-700 text-sm font-semibold font-['Poppins',sans-serif] whitespace-nowrap">
                <CheckCircle className="w-4 h-4" />
                Verified
              </div>
            )}
          </div>
          <div>
            <GovInput
              label="OTP"
              required
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={4}
              disabled={!otpSent || mobileVerified}
            />
            {otpSent && !mobileVerified && (
              <button
                onClick={handleVerifyOTP}
                className="mt-1.5 text-[12px] text-[#1f3a5f] font-semibold font-['Poppins',sans-serif] hover:underline"
              >
                Verify OTP
              </button>
            )}
          </div>
          {/* Empty fourth column for alignment */}
          <div />
        </div>
      </div>

      {/* Section 3: Existing Connection Details */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
          <Plug className="w-5 h-5" />
          Existing Connection Details:
        </h2>
        <div className="grid grid-cols-4 gap-6">
          <GovInput
            label="RR Number"
            required
            placeholder="Enter RR Number"
            value={rrNumber}
            onChange={(e) => setRRNumber(e.target.value)}
          />
          <GovSelect
            label="Connection Type"
            required
            placeholder="-- Select Connection Type --"
            options={CONNECTION_TYPES}
            value={connectionType}
            onValueChange={setConnectionType}
          />
          <GovSelect
            label="Meter Category"
            required
            placeholder="-- Select Meter Category --"
            options={METER_CATEGORIES}
            value={meterCategory}
            onValueChange={setMeterCategory}
          />
          <GovSelect
            label="Connection Status"
            required
            placeholder="-- Select Status --"
            options={CONNECTION_STATUSES}
            value={connectionStatus}
            onValueChange={setConnectionStatus}
          />
        </div>
      </div>

      {/* Section 4: DCB Financial Details */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
          <IndianRupee className="w-5 h-5" />
          DCB Financial Details:
        </h2>
        <div className="grid grid-cols-3 gap-6 mb-5">
          <GovInput
            label="Current FY"
            required
            placeholder="e.g., 2025-2026"
            value={currentFY}
            onChange={(e) => setCurrentFY(e.target.value)}
            disabled
          />
          <GovInput
            label="Current Date"
            required
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
          />
          <GovInput
            label="Opening Balance"
            required
            placeholder="Enter opening balance"
            type="number"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <GovInput
            label="Principal Amount"
            required
            placeholder="Enter principal amount"
            type="number"
            value={principalAmount}
            onChange={(e) => setPrincipalAmount(e.target.value)}
          />
          <GovInput
            label="Interest Amount"
            required
            placeholder="Enter interest amount"
            type="number"
            value={interestAmount}
            onChange={(e) => setInterestAmount(e.target.value)}
          />
          <GovInput
            label="% of Interest"
            required
            placeholder="e.g., 5%"
            value={interestPercent}
            onChange={(e) => setInterestPercent(e.target.value)}
          />
        </div>
      </div>

      {/* Section 5: Billing Details */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
          <Gauge className="w-5 h-5" />
          Billing Details:
        </h2>
        <div className="mb-5">
          <GovRadio
            name="isVolumetricBilling"
            label="Is billing based on volumetric (meter) billing?"
            required
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
            value={isVolumetricBilling}
            onChange={(val) => setIsVolumetricBilling(val)}
          />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <GovInput
            label="Previous Meter Reading"
            required
            placeholder="Enter previous meter reading"
            value={previousMeterReading}
            onChange={(e) => setPreviousMeterReading(e.target.value)}
          />
          <div />
          <div />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <GovButton
          variant="primary"
          onClick={handleSubmit}
          disabled={submitting}
          loading={submitting}
        >
          <Send className="w-4 h-4" />
          Submit Application
        </GovButton>
        <GovButton variant="outline" onClick={handleReset}>
          Reset
        </GovButton>
      </div>
    </div>
  );
}
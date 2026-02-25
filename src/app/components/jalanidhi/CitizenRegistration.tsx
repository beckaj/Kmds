import { ChevronLeft, UserPlus, Phone, CheckCircle, Eye, EyeOff, Shield, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface CitizenRegistrationProps {
  onBack: () => void;
  onRegistrationComplete: () => void;
}

const DISTRICT_OPTIONS = [
  { value: '__none__', label: '-- Select District --' },
  { value: 'Bagalkot', label: 'Bagalkot' },
  { value: 'Ballari', label: 'Ballari (Bellary)' },
  { value: 'Belagavi', label: 'Belagavi (Belgaum)' },
  { value: 'Bengaluru Rural', label: 'Bengaluru Rural' },
  { value: 'Bengaluru Urban', label: 'Bengaluru Urban' },
  { value: 'Bidar', label: 'Bidar' },
  { value: 'Chamarajanagar', label: 'Chamarajanagar' },
  { value: 'Chikballapur', label: 'Chikballapur' },
  { value: 'Chikkamagaluru', label: 'Chikkamagaluru' },
  { value: 'Chitradurga', label: 'Chitradurga' },
  { value: 'Dakshina Kannada', label: 'Dakshina Kannada' },
  { value: 'Davanagere', label: 'Davanagere' },
  { value: 'Dharwad', label: 'Dharwad' },
  { value: 'Gadag', label: 'Gadag' },
  { value: 'Hassan', label: 'Hassan' },
  { value: 'Haveri', label: 'Haveri' },
  { value: 'Kalaburagi', label: 'Kalaburagi (Gulbarga)' },
  { value: 'Kodagu', label: 'Kodagu' },
  { value: 'Kolar', label: 'Kolar' },
  { value: 'Koppal', label: 'Koppal' },
  { value: 'Mandya', label: 'Mandya' },
  { value: 'Mysuru', label: 'Mysuru (Mysore)' },
  { value: 'Raichur', label: 'Raichur' },
  { value: 'Ramanagara', label: 'Ramanagara' },
  { value: 'Shivamogga', label: 'Shivamogga (Shimoga)' },
  { value: 'Tumakuru', label: 'Tumakuru' },
  { value: 'Udupi', label: 'Udupi' },
  { value: 'Uttara Kannada', label: 'Uttara Kannada' },
  { value: 'Vijayapura', label: 'Vijayapura (Bijapur)' },
  { value: 'Yadgir', label: 'Yadgir' },
];

const GENDER_OPTIONS = [
  { value: '__none__', label: '-- Select Gender --' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

export default function CitizenRegistration({ onBack, onRegistrationComplete }: CitizenRegistrationProps) {
  const [step, setStep] = useState<'phone_verify' | 'details' | 'success'>('phone_verify');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [hint, setHint] = useState('');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('__none__');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('__none__');
  const [ulb, setUlb] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOtp = async () => {
    setError('');
    setHint('');
    if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setSendingOtp(true);
    try {
      const url = 'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/auth/register/send-otp';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + publicAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      console.log('[REGISTER] Send OTP response:', data);

      if (data.success) {
        setOtpSent(true);
        setSuccessMsg(data.message || 'OTP sent successfully');
        setHint(data.hint || '');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('[REGISTER] Send OTP error:', err);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setVerifyingOtp(true);
    try {
      const url = 'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/auth/register/verify-otp';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + publicAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await response.json();
      console.log('[REGISTER] Verify OTP response:', data);

      if (data.success) {
        setPhoneVerified(true);
        setSuccessMsg('Phone number verified!');
        setHint('');
        // Move to details step after a brief pause
        setTimeout(() => {
          setStep('details');
          setError('');
          setSuccessMsg('');
        }, 800);
      } else {
        setError(data.error || 'OTP verification failed');
      }
    } catch (err) {
      console.error('[REGISTER] Verify OTP error:', err);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmitRegistration = async () => {
    setError('');
    setSuccessMsg('');

    // Validations
    if (!fullName.trim()) { setError('Full Name is required'); return; }
    if (!password) { setError('Password is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    setSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        phone,
        email: email.trim(),
        aadhaarNumber: aadhaarNumber.trim(),
        dateOfBirth,
        gender: gender !== '__none__' ? gender : '',
        address: address.trim(),
        district: district !== '__none__' ? district : '',
        ulb: ulb.trim(),
        ulbType: '',
        password,
      };

      const url = 'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/auth/register';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + publicAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('[REGISTER] Registration response:', data);

      if (data.success) {
        setStep('success');
        setSuccessMsg(data.message || 'Registration successful!');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('[REGISTER] Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 1: Phone verification
  if (step === 'phone_verify') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-xl">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="mb-6 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Login
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {/* Header */}
              <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-[#1f3a5f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-[#1f3a5f]" />
                </div>
                <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
                  New Citizen Registration
                </h2>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
                  Step 1 of 2: Verify your mobile number
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-['Poppins',sans-serif]">
                  {error}
                </div>
              )}

              {/* Success */}
              {successMsg && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-['Poppins',sans-serif]">
                  {successMsg}
                  {hint && (
                    <p className="mt-1 text-[12px] text-green-600 font-semibold">{hint}</p>
                  )}
                </div>
              )}

              <div className="space-y-5">
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 font-['Poppins',sans-serif] mb-2">
                    Mobile Number <span className="text-red-600">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm font-['Poppins',sans-serif] text-gray-500">
                      +91
                    </div>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(val);
                      }}
                      maxLength={10}
                      disabled={phoneVerified}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>

                {/* Send OTP Button */}
                {!otpSent && !phoneVerified && (
                  <button
                    onClick={handleSendOtp}
                    disabled={sendingOtp || phone.length !== 10}
                    className="w-full bg-[#f9a825] hover:bg-[#f9a825]/90 text-white font-semibold py-3 px-6 rounded-lg font-['Poppins',sans-serif] text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sendingOtp ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4" />
                        Send OTP
                      </>
                    )}
                  </button>
                )}

                {/* OTP Field */}
                {otpSent && !phoneVerified && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 font-['Poppins',sans-serif] mb-2">
                        Enter OTP <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(val);
                        }}
                        maxLength={6}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent transition-all tracking-[8px] text-center text-lg font-mono"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleVerifyOtp}
                        disabled={verifyingOtp || otp.length !== 6}
                        className="flex-1 bg-[#1f3a5f] hover:bg-[#1f3a5f]/90 text-white font-semibold py-3 px-6 rounded-lg font-['Poppins',sans-serif] text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {verifyingOtp ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            Verify OTP
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => { setOtpSent(false); setOtp(''); setError(''); setSuccessMsg(''); setHint(''); }}
                        className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-['Poppins',sans-serif] font-medium text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Resend
                      </button>
                    </div>
                  </>
                )}

                {/* Phone Verified Badge */}
                {phoneVerified && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-700 font-['Poppins',sans-serif]">Phone number verified successfully!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-gray-500 text-xs font-['Poppins',sans-serif]">
                Already have an account?{' '}
                <button onClick={onBack} className="text-[#1f3a5f] font-semibold underline hover:text-[#2d4a6f]">
                  Login here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Success
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-xl">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-700 font-['Poppins',sans-serif] mb-3">
                Registration Successful!
              </h2>
              <p className="text-gray-600 font-['Poppins',sans-serif] mb-2">
                {successMsg}
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-6">
                <p className="text-sm text-green-800 font-['Poppins',sans-serif]">
                  <span className="font-semibold">Your Phone Number:</span> {phone}
                </p>
                <p className="text-xs text-green-600 font-['Poppins',sans-serif] mt-1">
                  Use this phone number and your password to log in.
                </p>
              </div>
              <button
                onClick={onRegistrationComplete}
                className="w-full bg-[#1f3a5f] hover:bg-[#1f3a5f]/90 text-white font-semibold py-3.5 px-6 rounded-full font-['Poppins',sans-serif] text-sm transition-all uppercase tracking-wide"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Details form
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-3xl">
          {/* Back Button */}
          <button
            onClick={() => { setStep('phone_verify'); setError(''); setSuccessMsg(''); }}
            className="mb-6 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-8 py-5 border-b border-gray-200 bg-[#1f3a5f]/5">
              <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                New Citizen Registration
              </h2>
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
                Step 2 of 2: Enter your details to complete registration
              </p>
            </div>

            <div className="p-8">
              {/* Error */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-['Poppins',sans-serif]">
                  {error}
                </div>
              )}

              {/* Verified phone badge */}
              <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-700 font-['Poppins',sans-serif]">
                  Verified Mobile: <span className="font-semibold">+91 {phone}</span>
                </span>
              </div>

              {/* Personal Information Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
                  Personal Information
                </h3>
                <div className="bg-[#f8fafc] rounded-lg p-5">
                  <div className="grid grid-cols-3 gap-5 mb-5">
                    <div className="col-span-2">
                      <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                        Full Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border-[1.5px] border-gray-300 rounded-md text-gray-900 text-[14px] font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border-[1.5px] border-gray-300 rounded-md text-gray-900 text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
                      >
                        {GENDER_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-5 mb-5">
                    <div>
                      <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border-[1.5px] border-gray-300 rounded-md text-gray-900 text-[14px] font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                        Aadhaar Number
                      </label>
                      <input
                        type="text"
                        placeholder="XXXX XXXX XXXX"
                        value={aadhaarNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                          setAadhaarNumber(val);
                        }}
                        maxLength={12}
                        className="w-full px-4 py-2.5 bg-white border-[1.5px] border-gray-300 rounded-md text-gray-900 text-[14px] font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border-[1.5px] border-gray-300 rounded-md text-gray-900 text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
                  Address Information
                </h3>
                <div className="bg-[#f8fafc] rounded-lg p-5">
                  <div className="mb-5">
                    <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                      Residential Address
                    </label>
                    <textarea
                      placeholder="Enter your complete residential address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 bg-white border-[1.5px] border-gray-300 rounded-md text-gray-900 text-[14px] font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                    <div>
                      <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                        District
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border-[1.5px] border-gray-300 rounded-md text-gray-900 text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
                      >
                        {DISTRICT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                        ULB / City / Town
                      </label>
                      <input
                        type="text"
                        placeholder="Enter ULB name"
                        value={ulb}
                        onChange={(e) => setUlb(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border-[1.5px] border-gray-300 rounded-md text-gray-900 text-[14px] font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        value={'+91 ' + phone}
                        disabled
                        className="w-full px-4 py-2.5 bg-gray-100 border-[1.5px] border-gray-200 rounded-md text-gray-500 text-[14px] font-['Poppins',sans-serif] cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
                  Set Password
                </h3>
                <div className="bg-[#f8fafc] rounded-lg p-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                        Password <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-2.5 pr-11 bg-white border-[1.5px] border-gray-300 rounded-md text-gray-900 text-[14px] font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                        Confirm Password <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2.5 pr-11 bg-white border-[1.5px] border-gray-300 rounded-md text-gray-900 text-[14px] font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="mt-1.5 text-[13px] text-red-600 font-['Poppins',sans-serif]">Passwords do not match</p>
                      )}
                    </div>
                  </div>
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-3">
                    Password must be at least 6 characters. You will use this password along with your mobile number to log in.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmitRegistration}
                  disabled={submitting || !fullName.trim() || !password || password.length < 6 || password !== confirmPassword}
                  className="px-10 py-3 bg-[#1f3a5f] hover:bg-[#1f3a5f]/90 text-white font-semibold rounded-full font-['Poppins',sans-serif] text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 uppercase tracking-wide"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Complete Registration
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-gray-500 text-xs font-['Poppins',sans-serif]">
                Already have an account?{' '}
                <button onClick={onBack} className="text-[#1f3a5f] font-semibold underline hover:text-[#2d4a6f]">
                  Login here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
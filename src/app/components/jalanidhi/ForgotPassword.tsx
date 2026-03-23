import { useState } from 'react';
import { ChevronLeft, KeyRound, Phone, Shield, CheckCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface ForgotPasswordProps {
  onBack: () => void;
  onResetComplete: () => void;
  userType: 'citizen' | 'department';
}

export default function ForgotPassword({ onBack, onResetComplete, userType }: ForgotPasswordProps) {
  const [step, setStep] = useState<'enter_phone' | 'verify_otp' | 'new_password' | 'success'>('enter_phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setError('');
    setSuccessMsg('');
    setHint('');

    if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const url = 'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/auth/forgot-password/send-otp';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + publicAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      console.log('[FORGOT PWD] Send OTP response:', data);

      if (data.success) {
        setStep('verify_otp');
        setSuccessMsg(data.message || 'OTP sent successfully');
        setHint(data.hint || '');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('[FORGOT PWD] Send OTP error:', err);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async () => {
    setError('');
    setSuccessMsg('');

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const url = 'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/auth/forgot-password/reset';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + publicAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp, newPassword }),
      });
      const data = await response.json();
      console.log('[FORGOT PWD] Reset response:', data);

      if (data.success) {
        setStep('success');
        setSuccessMsg(data.message || 'Password reset successfully!');
      } else {
        setError(data.error || 'Password reset failed');
      }
    } catch (err) {
      console.error('[FORGOT PWD] Reset error:', err);
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
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
                Password Reset Successful!
              </h2>
              <p className="text-gray-600 font-['Poppins',sans-serif] mb-6">
                {successMsg}
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800 font-['Poppins',sans-serif]">
                  You can now log in using your phone number <span className="font-semibold">+91 {phone}</span> and your new password.
                </p>
              </div>
              <button
                onClick={onResetComplete}
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
              <div className="w-16 h-16 bg-[#f9a825]/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-[#f9a825]" />
              </div>
              <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
                Forgot Password
              </h2>
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
                {step === 'enter_phone'
                  ? 'Enter your registered mobile number to receive a verification OTP'
                  : 'Enter the OTP and set your new password'}
              </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={'w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold ' + (step === 'enter_phone' ? 'bg-[#1f3a5f] text-white' : 'bg-green-500 text-white')}>
                {step === 'enter_phone' ? '1' : <CheckCircle className="w-4 h-4" />}
              </div>
              <div className={'h-0.5 w-12 ' + (step === 'verify_otp' ? 'bg-[#1f3a5f]' : 'bg-gray-200')} />
              <div className={'w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold ' + (step === 'verify_otp' ? 'bg-[#1f3a5f] text-white' : 'bg-gray-200 text-gray-500')}>
                2
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-['Poppins',sans-serif]">
                {error}
              </div>
            )}

            {/* Success */}
            {successMsg && step !== 'success' && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-['Poppins',sans-serif]">
                {successMsg}
                {hint && (
                  <p className="mt-1 text-[12px] text-green-600 font-semibold">{hint}</p>
                )}
              </div>
            )}

            {/* Step 1: Enter Phone */}
            {step === 'enter_phone' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-900 font-['Poppins',sans-serif] mb-2">
                    Registered Mobile Number <span className="text-red-600">*</span>
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
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loading || phone.length !== 10}
                  className="w-full bg-[#1f3a5f] hover:bg-[#1f3a5f]/90 text-white font-semibold py-3 px-6 rounded-lg font-['Poppins',sans-serif] text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-[12px] text-blue-700 font-['Poppins',sans-serif]">
                    <span className="font-semibold">Note:</span> This feature is only available for users who registered through the portal. 
                    For demo/hardcoded accounts, OTP <span className="font-mono font-semibold">123456</span> is used for login.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Verify OTP & New Password */}
            {step === 'verify_otp' && (
              <div className="space-y-5">
                {/* Phone (readonly) */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 font-['Poppins',sans-serif] mb-2">
                    Mobile Number
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={'+91 ' + phone}
                      disabled
                      className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 text-sm font-['Poppins',sans-serif] cursor-not-allowed"
                    />
                    <button
                      onClick={() => { setStep('enter_phone'); setOtp(''); setNewPassword(''); setConfirmPassword(''); setError(''); setSuccessMsg(''); setHint(''); }}
                      className="px-3 py-3 text-[#1f3a5f] hover:bg-gray-100 rounded-lg transition-colors"
                      title="Change number"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* OTP Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 font-['Poppins',sans-serif] mb-2">
                    Enter OTP <span className="text-red-600">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(val);
                      }}
                      maxLength={6}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent transition-all tracking-[8px] text-center text-lg font-mono"
                    />
                    <button
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="px-3 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Resend OTP"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 font-['Poppins',sans-serif] mb-2">
                    New Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password (min. 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent transition-all"
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 font-['Poppins',sans-serif] mb-2">
                    Confirm New Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-1.5 text-[13px] text-red-600 font-['Poppins',sans-serif]">Passwords do not match</p>
                  )}
                </div>

                {/* Reset Button */}
                <button
                  onClick={handleVerifyAndReset}
                  disabled={loading || otp.length !== 6 || !newPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="w-full bg-[#1f3a5f] hover:bg-[#1f3a5f]/90 text-white font-semibold py-3 px-6 rounded-lg font-['Poppins',sans-serif] text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Reset Password
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-xs font-['Poppins',sans-serif]">
              Remember your password?{' '}
              <button onClick={onBack} className="text-[#1f3a5f] font-semibold underline hover:text-[#2d4a6f]">
                Back to Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
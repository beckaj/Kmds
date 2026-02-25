import { useState } from 'react';
import { Menu } from 'lucide-react';
import imgLogo from "figma:asset/3c50e13153bb681d1539034907291adbb79a64eb.png";
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { BCCollectorData } from './BillCollectorMobileApp';

interface BillCollectorLoginProps {
  onLoginSuccess: (data: { collector: BCCollectorData; wards: string[] }) => void;
}

export default function BillCollectorLogin({ onLoginSuccess }: BillCollectorLoginProps) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');

    // Validate phone against server
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/bill-collector/login`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: mobile }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        setShowOtpField(true);
        // Store response for later use
        localStorage.setItem('bc_login_data', JSON.stringify(data));
        setError('');
      } else {
        setError(data && data.error ? data.error : 'Mobile number not registered');
      }
    } catch (err) {
      console.error('[BC LOGIN] Error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    if (!otp || otp.length !== 4) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }

    // Demo OTP: 1234
    if (otp !== '1234') {
      setError('Invalid OTP. Please try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const savedData = localStorage.getItem('bc_login_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        onLoginSuccess({
          collector: parsed.collector,
          wards: parsed.wards || [],
        });
        localStorage.removeItem('bc_login_data');
      } else {
        setError('Login session expired. Please try again.');
        setShowOtpField(false);
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[420px] mx-auto border-x border-gray-200 shadow-xl">
      {/* Mobile Header Bar */}
      <div className="bg-[#1f3a5f] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Menu className="w-5 h-5 text-white" />
          <span className="text-white text-[15px] font-semibold font-['Poppins',sans-serif]">KMDS - Jalanidhi</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 bg-[#f0f4f8]">
        <div className="bg-white rounded-2xl shadow-lg w-full p-8">
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-[72px] h-[72px] rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center border-2 border-[#f9a825] mb-4">
              <img src={imgLogo} alt="Karnataka Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-[#1f3a5f] text-[22px] font-bold font-['Poppins',sans-serif]">LOGIN</h2>
            <p className="text-gray-500 text-[12px] font-['Poppins',sans-serif] mt-1">Bill Collector Portal</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-center">
              <p className="text-red-600 text-[12px] font-['Poppins',sans-serif]">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-5">
            {/* Mobile No */}
            <div>
              <label className="block text-[12px] font-semibold text-[#1f3a5f] mb-1.5 font-['Poppins',sans-serif]">
                Mobile No<span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit mobile number"
                className="w-full h-[44px] px-3 border-2 border-[#1f3a5f]/30 rounded-lg font-['Poppins',sans-serif] text-[14px] text-gray-900 outline-none focus:border-[#1f3a5f] transition-colors"
                disabled={showOtpField}
              />
            </div>

            {/* OTP */}
            {showOtpField && (
              <div>
                <label className="block text-[12px] font-semibold text-[#1f3a5f] mb-1.5 font-['Poppins',sans-serif]">
                  OTP<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 4-digit OTP"
                  className="w-full h-[44px] px-3 border-2 border-[#1f3a5f]/30 rounded-lg font-['Poppins',sans-serif] text-[14px] text-gray-900 outline-none focus:border-[#1f3a5f] transition-colors"
                />
                <button
                  onClick={() => { setShowOtpField(false); setOtp(''); setError(''); }}
                  className="text-[#1f3a5f] text-[11px] font-medium font-['Poppins',sans-serif] mt-1 hover:underline cursor-pointer"
                >
                  Change Mobile Number
                </button>
              </div>
            )}
          </div>

          {/* Login Button */}
          <button
            onClick={showOtpField ? handleLogin : handleSendOtp}
            disabled={isLoading}
            className="w-full h-[44px] bg-[#f9a825] hover:bg-[#f59e0b] text-[#1f3a5f] text-[14px] font-bold font-['Poppins',sans-serif] rounded-lg shadow-md hover:shadow-lg transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? 'Please wait...' : showOtpField ? 'Login' : 'Send OTP'}
          </button>

          {/* Help */}
          <div className="mt-5 bg-[#f0f4f8] rounded-lg p-3">
            <p className="text-[#1f3a5f] text-[11px] font-bold font-['Poppins',sans-serif] mb-1">Demo Credentials</p>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-gray-600 text-[10px] font-['Poppins',sans-serif]">Mobile: <span className="font-semibold text-[#1f3a5f]">9000000001</span></p>
                <p className="text-gray-600 text-[10px] font-['Poppins',sans-serif]">OTP: <span className="font-semibold text-[#1f3a5f]">1234</span></p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-[10px] font-['Poppins',sans-serif]">Rahul M S</p>
                <p className="text-gray-400 text-[9px] font-['Poppins',sans-serif]">Ward 25 & 26</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Web */}
        <button
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          className="mt-6 text-[#1f3a5f] text-[12px] font-semibold font-['Poppins',sans-serif] hover:underline cursor-pointer flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          Go to Web Version
        </button>
      </div>
    </div>
  );
}
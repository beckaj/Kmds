import { useState } from 'react';
import imgLogo from "figma:asset/3c50e13153bb681d1539034907291adbb79a64eb.png";

interface PlumberMobileLoginProps {
  onLoginSuccess: (plumberData: { mobile: string; name: string; id: string }) => void;
}

export default function PlumberMobileLogin({ onLoginSuccess }: PlumberMobileLoginProps) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Hardcoded Plumber credentials for demo
  const plumbers = [
    { mobile: '9888888888', otp: '1234', name: 'Ramesh Kumar', id: 'PLB-001' },
    { mobile: '9888888889', otp: '1234', name: 'Suresh Gowda', id: 'PLB-002' },
    { mobile: '9888888890', otp: '1234', name: 'Manoj Patil', id: 'PLB-003' },
  ];

  const handleSendOtp = () => {
    if (!mobile || mobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    const plumber = plumbers.find(p => p.mobile === mobile);
    if (!plumber) {
      alert('Mobile number not registered as a licensed plumber. Please contact admin.');
      return;
    }

    setShowOtpField(true);
    alert('OTP sent to ' + mobile + '. Use 1234 for demo.');
  };

  const handleLogin = () => {
    if (!otp || otp.length !== 4) {
      alert('Please enter a valid 4-digit OTP');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const plumber = plumbers.find(p => p.mobile === mobile && p.otp === otp);
      
      if (plumber) {
        onLoginSuccess({ mobile: plumber.mobile, name: plumber.name, id: plumber.id });
      } else {
        alert('Invalid OTP. Please try again.');
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f3a5f] to-[#0078a0] flex flex-col">
      {/* Status Bar */}
      <div className="h-[28px] flex items-center justify-between px-4 pt-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <svg width="16" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
          </svg>
          <div className="w-4 h-2 border border-white rounded-sm relative">
            <div className="absolute left-0 top-0 w-3/4 h-full bg-white rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="px-5 pt-6 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <h1 className="text-white text-[18px] font-medium font-['Roboto',sans-serif]">
            Plumber Login
          </h1>
        </div>
        <p className="text-white text-[14px] font-['Roboto',sans-serif] opacity-90">
          Licensed Plumber - Reconnection Work
        </p>
      </div>

      {/* White Card Section */}
      <div className="flex-1 bg-white rounded-t-[32px] px-6 pt-8 pb-6 shadow-lg">
        {/* Logo and Title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-[56px] h-[56px] rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center">
            <img src={imgLogo} alt="Karnataka Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-[#1f3a5f] text-[24px] font-bold font-['Poppins',sans-serif]">
              LOGIN
            </h2>
            <p className="text-[#1f3a5f]/60 text-[11px] font-['Poppins',sans-serif]">
              KMDS Jalanidhi - Plumber
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Mobile Number Field */}
          <div className="space-y-2">
            <label className="block text-[#170f49] text-[12px] font-medium font-['Poppins',sans-serif]">
              Mobile Number
            </label>
            <input
              type="tel"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 10-digit mobile number"
              className="w-full h-[48px] px-4 bg-white border border-[#c5ccff] rounded-[16px] font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none focus:border-[#1f3a5f] focus:ring-2 focus:ring-[#1f3a5f]/20 transition-all"
              disabled={showOtpField}
            />
          </div>

          {/* OTP Field */}
          {showOtpField && (
            <div className="space-y-2">
              <label className="block text-[#170f49] text-[12px] font-medium font-['Poppins',sans-serif]">
                OTP
              </label>
              <input
                type="tel"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 4-digit OTP"
                className="w-full h-[48px] px-4 bg-white border border-[#c5ccff] rounded-[16px] font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none focus:border-[#1f3a5f] focus:ring-2 focus:ring-[#1f3a5f]/20 transition-all"
              />
              <button
                onClick={() => setShowOtpField(false)}
                className="text-[#0078a0] text-[12px] font-medium font-['Poppins',sans-serif] hover:underline"
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
          className="w-full h-[50px] bg-[#f9a825] hover:bg-[#f57c00] text-white text-[14px] font-bold font-['Poppins',sans-serif] rounded-[20px] shadow-md hover:shadow-lg transition-all mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Please wait...' : showOtpField ? 'LOGIN' : 'SEND OTP'}
        </button>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-[#170f49]/60 text-[11px] font-['Poppins',sans-serif]">
            Demo: 9888888888 / OTP: 1234
          </p>
        </div>

        {/* Go to Web Version Button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="text-[#1f3a5f] text-[12px] font-semibold font-['Poppins',sans-serif] hover:underline flex items-center justify-center gap-1 mx-auto"
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
    </div>
  );
}

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import svgPaths from '../../../imports/svg-qk3lb0xs89';
import imgLogo from "figma:asset/3c50e13153bb681d1539034907291adbb79a64eb.png";

interface FieldEngineerLoginProps {
  onLoginSuccess: (engineerData: { mobile: string; name: string; id: string }) => void;
}

export default function FieldEngineerLogin({ onLoginSuccess }: FieldEngineerLoginProps) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Hardcoded Field Engineer credentials for demo
  const fieldEngineers = [
    { mobile: '9876543210', otp: '1234', name: 'Rajesh Kumar', id: 'FE001' },
    { mobile: '9876543211', otp: '1234', name: 'Suresh Patil', id: 'FE002' },
    { mobile: '9876543212', otp: '1234', name: 'Mahesh Reddy', id: 'FE003' },
  ];

  const handleSendOtp = () => {
    if (!mobile || mobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    const engineer = fieldEngineers.find(fe => fe.mobile === mobile);
    if (!engineer) {
      alert('Mobile number not registered. Please contact admin.');
      return;
    }

    setShowOtpField(true);
    alert(`OTP sent to ${mobile}. Use 1234 for demo.`);
  };

  const handleLogin = () => {
    if (!otp || otp.length !== 4) {
      alert('Please enter a valid 4-digit OTP');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const engineer = fieldEngineers.find(fe => fe.mobile === mobile && fe.otp === otp);
      
      if (engineer) {
        onLoginSuccess({ mobile: engineer.mobile, name: engineer.name, id: engineer.id });
      } else {
        alert('Invalid OTP. Please try again.');
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#27548a] to-[#00859f] flex flex-col">
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <div className="flex items-center gap-1">
          <svg width="16" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
          </svg>
          <div className="flex items-center gap-0.5">
            <div className="w-4 h-2 border border-white rounded-sm relative">
              <div className="absolute left-0 top-0 w-3/4 h-full bg-white rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="px-5 pt-6 pb-8">
        <h1 className="text-white text-[18px] font-medium font-['Roboto',sans-serif] mb-2">
          Hello !
        </h1>
        <p className="text-white text-[14px] font-['Roboto',sans-serif] opacity-90">
          Please Login to get connected
        </p>
      </div>

      {/* White Card Section */}
      <div className="flex-1 bg-white rounded-t-[32px] px-6 pt-8 pb-6 shadow-lg">
        {/* Logo and Title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-[56px] h-[56px] rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center">
            <img src={imgLogo} alt="Karnataka Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-[#27548a] text-[28px] font-bold font-['Poppins',sans-serif]">
            LOGIN
          </h2>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Mobile Number Field */}
          <div className="space-y-2">
            <label className="block text-[#170f49] text-[12px] font-medium font-['Poppins',sans-serif]">
              Mobile Number
            </label>
            <div className="relative">
              <input
                type="tel"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit mobile number"
                className="w-full h-[48px] px-4 bg-white border border-[#c5ccff] rounded-[16px] font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none focus:border-[#27548a] focus:ring-2 focus:ring-[#27548a]/20 transition-all"
                disabled={showOtpField}
              />
            </div>
          </div>

          {/* OTP Field */}
          {showOtpField && (
            <div className="space-y-2">
              <label className="block text-[#170f49] text-[12px] font-medium font-['Poppins',sans-serif]">
                OTP
              </label>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 4-digit OTP"
                  className="w-full h-[48px] px-4 bg-white border border-[#c5ccff] rounded-[16px] font-['Poppins',sans-serif] text-[14px] text-[#170f49] outline-none focus:border-[#27548a] focus:ring-2 focus:ring-[#27548a]/20 transition-all"
                />
              </div>
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
          className="w-full h-[50px] bg-[#feb536] hover:bg-[#f9a825] text-black text-[14px] font-bold font-['Poppins',sans-serif] rounded-[20px] shadow-md hover:shadow-lg transition-all mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Please wait...' : showOtpField ? 'LOGIN' : 'SEND OTP'}
        </button>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-[#170f49]/60 text-[11px] font-['Poppins',sans-serif]">
            Demo Credentials: 9876543210 / OTP: 1234
          </p>
        </div>

        {/* Go to Web Version Button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              // Clear localStorage and navigate to web login
              localStorage.clear();
              window.location.reload();
            }}
            className="text-[#27548a] text-[12px] font-semibold font-['Poppins',sans-serif] hover:underline flex items-center justify-center gap-1 mx-auto"
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
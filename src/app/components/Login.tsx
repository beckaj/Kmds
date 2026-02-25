import { useState, FormEvent } from 'react';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';
import Header from '../../imports/Header';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import CitizenRegistration from './jalanidhi/CitizenRegistration';
import ForgotPassword from './jalanidhi/ForgotPassword';

interface LoginProps {
  onLogin: (userType: 'citizen' | 'department', userData: any) => void;
}

// Hardcoded credentials (fallback for demo accounts)
const CREDENTIALS: Record<string, any> = {
  // General Citizen - Can only access general services
  '9876543210': {
    otp: '123456',
    type: 'citizen',
    role: 'citizen',
    isPlumber: false,
    name: 'Rajesh Kumar',
    phone: '9876543210'
  },
  // Citizen with Plumber License - Can access plumber section
  '9988776655': {
    otp: '123456',
    type: 'citizen',
    role: 'plumber',
    isPlumber: true,
    plumberLicense: 'PLB12345',
    name: 'Suresh Plumber',
    phone: '9988776655'
  },
  // Caseworker
  '9111111111': {
    otp: '123456',
    type: 'department',
    role: 'caseworker',
    name: 'Priya Verma',
    phone: '9111111111',
    employeeId: 'CW001',
    district: 'Dharwad',
    ulb: 'Hubli-Dharwad',
    ulbType: 'CC',
    zone: 'Zone 1',
    authorityType: 'Board'
  },
  // Revenue Officer
  '9222222222': {
    otp: '123456',
    type: 'department',
    role: 'revenue_officer',
    name: 'Anil Reddy',
    phone: '9222222222',
    employeeId: 'RO001'
  },
  // Field Engineer
  '9333333333': {
    otp: '123456',
    type: 'department',
    role: 'field_engineer',
    name: 'Karthik Rao',
    phone: '9333333333',
    employeeId: 'FE001'
  },
  // Commissioner/CO
  '9444444444': {
    otp: '123456',
    type: 'department',
    role: 'commissioner',
    name: 'Dr. Sudha Sharma',
    phone: '9444444444',
    employeeId: 'COM001'
  },
  // ULB Admin
  '9555555555': {
    otp: '123456',
    type: 'department',
    role: 'ulb_admin',
    name: 'Mahesh Gowda',
    phone: '9555555555',
    employeeId: 'ULB001'
  },
  // Project Director
  '9666666666': {
    otp: '123456',
    type: 'department',
    role: 'project_director',
    name: 'Ramesh Patil',
    phone: '9666666666',
    employeeId: 'PD001',
    district: 'Dharwad',
    ulb: 'Hubli-Dharwad',
    ulbType: 'CC'
  },
  // DMA Admin
  '9777777777': {
    otp: '123456',
    type: 'department',
    role: 'dma_admin',
    name: 'Dr. Kavitha Rajan',
    phone: '9777777777',
    employeeId: 'DMA001',
    designation: 'Director of Municipal Administration'
  },
  // Department User (backward compatibility)
  'DEPT001': {
    otp: '123456',
    type: 'department',
    role: 'caseworker',
    name: 'Department Officer',
    employeeId: 'DEPT001'
  }
};

function LoginForm({ 
  userType, 
  onSubmit,
  onForgotPassword,
  onRegister,
}: { 
  userType: 'citizen' | 'department';
  onSubmit: (userData: any) => void;
  onForgotPassword: () => void;
  onRegister: () => void;
}) {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [error, setError] = useState('');
  const [captchaText] = useState('C1ad'); // In real app, this would be dynamic
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !otp.trim() || !captcha.trim()) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Try server-side login first (for registered users)
      const url = 'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/auth/login';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + publicAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: identifier.trim(), otp: otp.trim(), userType }),
      });
      const data = await response.json();
      console.log('[LOGIN] Server response:', data);

      if (data.success && data.user) {
        // Server-registered user logged in successfully
        localStorage.setItem('userData', JSON.stringify(data.user));
        onSubmit(data.user);
        return;
      }

      // Step 2: If server returns not_found, fall back to hardcoded credentials
      if (data.error === 'not_found') {
        const user = CREDENTIALS[identifier.trim()];
        
        if (!user) {
          setError('Invalid credentials. Please check your phone number/employee ID.');
          return;
        }

        if (user.type !== userType) {
          setError('This ' + identifier + ' is not registered as ' + userType);
          return;
        }

        if (user.otp !== otp) {
          setError('Invalid OTP/Password');
          return;
        }

        // Store user data
        localStorage.setItem('userData', JSON.stringify(user));
        onSubmit(user);
        return;
      }

      // Server returned a specific error (e.g., wrong password for registered user)
      setError(data.error || 'Login failed. Please try again.');
    } catch (err) {
      console.error('[LOGIN] Error:', err);
      // If server is unreachable, fall back to hardcoded credentials silently
      const user = CREDENTIALS[identifier.trim()];
      
      if (!user) {
        setError('Invalid credentials');
        return;
      }

      if (user.type !== userType) {
        setError('This ' + identifier + ' is not registered as ' + userType);
        return;
      }

      if (user.otp !== otp) {
        setError('Invalid OTP/Password');
        return;
      }

      localStorage.setItem('userData', JSON.stringify(user));
      onSubmit(user);
    } finally {
      setLoading(false);
    }
  };

  const placeholderText = userType === 'citizen' 
    ? 'Enter Phone Number' 
    : 'Enter Employee ID';

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 font-['Poppins',sans-serif] mb-2">
            Login Credentials
          </h2>
          <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
            Enter your credentials to access services.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-['Poppins',sans-serif]">
            {error}
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Phone Number / Employee ID */}
          <div>
            <label className="block text-sm font-medium text-gray-900 font-['Poppins',sans-serif] mb-2">
              {userType === 'citizen' ? 'Phone Number' : 'Employee ID'}
            </label>
            <input
              type={userType === 'citizen' ? 'tel' : 'text'}
              placeholder={placeholderText}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent transition-all"
            />
          </div>

          {/* OTP / Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 font-['Poppins',sans-serif] mb-2">
              OTP / Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter OTP or Password"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={20}
                required
                className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Captcha */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-900 font-['Poppins',sans-serif]">
                Captcha
              </label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-lg font-bold text-gray-700 font-mono tracking-wider select-none">
                  {captchaText}
                </span>
                <button
                  type="button"
                  className="text-gray-600 hover:text-[#1f3a5f] transition-colors"
                  aria-label="Refresh captcha"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <input
              type="text"
              placeholder="Enter Captcha"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent transition-all"
            />
          </div>

          {/* Links */}
          <div className="flex items-center justify-between pt-2">
            <button 
              type="button" 
              onClick={onForgotPassword}
              className="text-sm text-gray-600 font-['Poppins',sans-serif] underline hover:text-[#1f3a5f] transition-colors"
            >
              Forgot Password
            </button>
            {userType === 'citizen' && (
              <button 
                type="button" 
                onClick={onRegister}
                className="text-sm text-blue-600 font-['Poppins',sans-serif] underline hover:text-[#1f3a5f] transition-colors"
              >
                New Register?
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1f3a5f] hover:bg-[#1f3a5f]/90 text-white font-semibold py-3.5 px-6 rounded-full font-['Poppins',sans-serif] text-sm shadow-md hover:shadow-lg transition-all duration-200 uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </button>
    </form>
  );
}

export default function Login({ onLogin }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'citizen' | 'department'>('citizen');
  const [view, setView] = useState<'login' | 'forgot_password' | 'register'>('login');

  // Show registration view
  if (view === 'register') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="w-full sticky top-0 z-50">
          <Header showUserControls={false} />
        </div>
        <CitizenRegistration
          onBack={() => setView('login')}
          onRegistrationComplete={() => setView('login')}
        />
      </div>
    );
  }

  // Show forgot password view
  if (view === 'forgot_password') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="w-full sticky top-0 z-50">
          <Header showUserControls={false} />
        </div>
        <ForgotPassword
          userType={activeTab}
          onBack={() => setView('login')}
          onResetComplete={() => setView('login')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Government Portal Header */}
      <div className="w-full sticky top-0 z-50">
        <Header showUserControls={false} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl">
          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 mb-6">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('citizen')}
                className={`py-3.5 px-6 rounded-xl font-['Poppins',sans-serif] text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'citizen'
                    ? 'bg-[#1f3a5f] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Citizen Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('department')}
                className={`py-3.5 px-6 rounded-xl font-['Poppins',sans-serif] text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'department'
                    ? 'bg-[#1f3a5f] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Department Login
              </button>
            </div>
          </div>

          {/* Form Content */}
          {activeTab === 'citizen' ? (
            <LoginForm 
              userType="citizen" 
              onSubmit={(userData) => onLogin('citizen', userData)} 
              onForgotPassword={() => setView('forgot_password')}
              onRegister={() => setView('register')}
            />
          ) : (
            <LoginForm 
              userType="department" 
              onSubmit={(userData) => onLogin('department', userData)} 
              onForgotPassword={() => setView('forgot_password')}
              onRegister={() => {}}
            />
          )}

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm font-['Poppins',sans-serif]">
              &copy; 2025 Government of Karnataka. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs font-['Poppins',sans-serif] mt-1">
              For technical support, contact: support@kmds.karnataka.gov.in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
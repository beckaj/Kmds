import svgPaths from "./svg-0huj6hvge1";
import imgImage1432 from "figma:asset/ef2695e4c3c123f3a8a9e7eb050d6ed390b348a5.png";
import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";

// Font size levels: 0 = small, 1 = normal, 2 = large
type FontSizeLevel = 0 | 1 | 2;

function Group3({ level }: { level: FontSizeLevel }) {
  const positions = [0, 41.33, 82.67]; // positions for the indicator
  const position = positions[level];
  
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <div className="bg-white col-1 h-[5.333px] ml-0 mt-[6.33px] rounded-[16px] row-1 w-[88px]" />
      <div className="bg-[#91c7ff] col-1 h-[5.333px] ml-0 mt-[6.33px] rounded-[16px] row-1 w-[46.667px]" />
      <div 
        className="bg-[#1f3a5f] border-[#009fbc] border-[3.333px] border-solid col-1 mt-0 rounded-[16px] row-1 size-[17.333px] transition-all duration-300" 
        style={{ marginLeft: `${position}px` }}
      />
    </div>
  );
}

function Frame5({ 
  fontSize, 
  onDecrease, 
  onIncrease 
}: { 
  fontSize: FontSizeLevel;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="content-stretch flex gap-[10.667px] items-center relative shrink-0 w-[153px]">
      <button 
        onClick={onDecrease}
        disabled={fontSize === 0}
        className="font-['Outfit:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[17.333px] text-white hover:text-[#91c7ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Decrease font size"
        title="Decrease font size"
      >
        A-
      </button>
      <Group3 level={fontSize} />
      <button 
        onClick={onIncrease}
        disabled={fontSize === 2}
        className="font-['Outfit:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[17.333px] text-white hover:text-[#91c7ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Increase font size"
        title="Increase font size"
      >
        A+
      </button>
    </div>
  );
}

function Layer({ isActive }: { isActive: boolean }) {
  return (
    <div className="absolute inset-[19.54%_45.83%_8.33%_8.34%]" data-name="Layer 2">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9167 18.753">
        <g id="Layer 2">
          <path d={svgPaths.p2bb76cc0} fill={isActive ? "#FFD700" : "#F9FDF2"} id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group({ isActive }: { isActive: boolean }) {
  return (
    <div className="absolute contents inset-[19.54%_45.83%_8.33%_8.34%]" data-name="Group">
      <Layer isActive={isActive} />
    </div>
  );
}

function Frame({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="overflow-clip relative shrink-0 size-[26px] cursor-pointer hover:opacity-80 transition-opacity"
      aria-label={isActive ? "Disable high contrast mode" : "Enable high contrast mode"}
      title={isActive ? "Disable high contrast mode" : "Enable high contrast mode"}
    >
      <Group isActive={isActive} />
      <div className="absolute bottom-[19.33%] left-1/4 right-[8.34%] top-[8.33%]" data-name="Subtract">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.3328 18.8085">
          <path d={svgPaths.p3563b800} fill={isActive ? "#FFD700" : "#F9FDF2"} id="Subtract" />
        </svg>
      </div>
    </button>
  );
}

function Toggle({ isKannada }: { isKannada: boolean }) {
  return (
    <div className="overflow-clip relative shrink-0 size-[40px]" data-name="Toggle">
      <div className="absolute bg-white border-[#acacac] border-[1.111px] border-solid inset-[22.22%_0] rounded-[55.556px]" />
      <div 
        className="absolute bg-[#1f3a5f] rounded-[55.556px] bottom-[27.78%] top-[27.78%] transition-all duration-300" 
        style={{
          left: isKannada ? '5.56%' : '50%',
          right: isKannada ? '50%' : '5.56%'
        }}
      />
    </div>
  );
}

function Component({ isKannada, onClick }: { isKannada: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="content-stretch flex gap-[13.333px] items-center relative shrink-0 w-[97px] cursor-pointer hover:opacity-80 transition-opacity" 
      data-name="Component 19"
      aria-label={isKannada ? "Switch to English" : "Switch to Kannada"}
      title={isKannada ? "Switch to English" : "Switch to Kannada"}
    >
      <p className={`font-['Outfit:Bold','Noto_Sans_Kannada:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[17.778px] transition-colors ${isKannada ? 'text-white' : 'text-[#dbdbdb]'}`}>
        ಅ
      </p>
      <Toggle isKannada={isKannada} />
      <p className={`font-['Outfit:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[17.778px] transition-colors ${isKannada ? 'text-[#dbdbdb]' : 'text-white'}`}>
        A
      </p>
    </button>
  );
}

function Frame6({
  fontSize,
  onDecrease,
  onIncrease,
  isHighContrast,
  toggleContrast,
  isKannada,
  toggleLanguage
}: {
  fontSize: FontSizeLevel;
  onDecrease: () => void;
  onIncrease: () => void;
  isHighContrast: boolean;
  toggleContrast: () => void;
  isKannada: boolean;
  toggleLanguage: () => void;
}) {
  return (
    <div className="content-stretch flex gap-[32px] items-center relative shrink-0">
      <Frame5 fontSize={fontSize} onDecrease={onDecrease} onIncrease={onIncrease} />
      <Frame isActive={isHighContrast} onClick={toggleContrast} />
      <Component isKannada={isKannada} onClick={toggleLanguage} />
    </div>
  );
}

function Frame4({
  fontSize,
  onDecrease,
  onIncrease,
  isHighContrast,
  toggleContrast,
  isKannada,
  toggleLanguage
}: {
  fontSize: FontSizeLevel;
  onDecrease: () => void;
  onIncrease: () => void;
  isHighContrast: boolean;
  toggleContrast: () => void;
  isKannada: boolean;
  toggleLanguage: () => void;
}) {
  return (
    <div className="bg-[#1f3a5f] h-[40px] relative shrink-0 w-full">
      <div className="flex flex-col items-end justify-center size-full">
        <div className="content-stretch flex flex-col items-end justify-center px-[32px] py-[10px] relative size-full">
          <Frame6 
            fontSize={fontSize}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            isHighContrast={isHighContrast}
            toggleContrast={toggleContrast}
            isKannada={isKannada}
            toggleLanguage={toggleLanguage}
          />
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-black tracking-[0.16px] w-[306px] whitespace-pre-wrap">Government of Karnataka</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[auto]">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[20px] text-black tracking-[0.2px]">Department of Municipal Administration</p>
      <Frame1 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[516px]">
      <div className="h-[80px] relative shrink-0 w-[93px]" data-name="image 1432">
        <img alt="Karnataka Government Logo" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1432} />
      </div>
      <Frame2 />
    </div>
  );
}

function Group1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Group">
          <g id="Vector" />
          <path d={svgPaths.p2b71a000} fill="var(--fill-0, #212121)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Frame10({ userData }: { userData?: any }) {
  // Role display mapping
  const getRoleDisplay = () => {
    if (!userData) return null;
    
    const roleMap: { [key: string]: { label: string; color: string; bgColor: string } } = {
      'caseworker': { label: 'Caseworker', color: '#1f3a5f', bgColor: '#e3f2fd' },
      'field-engineer': { label: 'Field Engineer', color: '#1f3a5f', bgColor: '#e3f2fd' },
      'field_engineer': { label: 'Field Engineer', color: '#1f3a5f', bgColor: '#e3f2fd' },
      'revenue_officer': { label: 'Revenue Officer', color: '#1f3a5f', bgColor: '#e3f2fd' },
      'commissioner': { label: 'Commissioner', color: '#1f3a5f', bgColor: '#e3f2fd' },
      'plumber': { label: 'Plumber', color: '#f9a825', bgColor: '#fff8e1' },
    };
    
    const role = userData.role || (userData.isPlumber ? 'plumber' : null);
    if (!role) return null;
    
    const roleInfo = roleMap[role];
    if (!roleInfo) return null;
    
    return (
      <div 
        className="flex items-center gap-2 px-3 py-1.5 rounded-full"
        style={{ backgroundColor: roleInfo.bgColor }}
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: roleInfo.color }}
        />
        <span 
          className="font-['Poppins',sans-serif] font-semibold text-sm"
          style={{ color: roleInfo.color }}
        >
          {roleInfo.label}
        </span>
      </div>
    );
  };

  const roleDisplay = getRoleDisplay();
  
  if (!roleDisplay) return null;
  
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      {roleDisplay}
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute inset-[8.33%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Group">
          <path d={svgPaths.p15b6e5f0} fill="var(--fill-0, black)" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.pea791c0} fill="var(--fill-0, black)" fillRule="evenodd" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function HealthiconsUiUserProfile() {
  return (
    <button 
      className="relative shrink-0 size-[24px] hover:opacity-70 transition-opacity cursor-pointer" 
      data-name="healthicons:ui-user-profile"
      aria-label="User Profile"
      title="User Profile"
    >
      <Group2 />
    </button>
  );
}

function Notifications() {
  return (
    <button 
      className="relative shrink-0 size-[24px] hover:opacity-70 transition-opacity cursor-pointer" 
      data-name="notifications"
      aria-label="Notifications"
      title="Notifications"
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_3_3406)" id="notifications">
          <g id="Vector" />
          <path d={svgPaths.p3658bc00} fill="var(--fill-0, #212121)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_3_3406">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </button>
  );
}

function Frame9({ userData, showUserControls = true }: { userData?: any; showUserControls?: boolean }) {
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      // Clear all localStorage
      localStorage.clear();
      // Reload page to trigger login screen
      window.location.reload();
    }
  };

  if (!showUserControls) {
    return null;
  }

  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0">
      <Frame10 userData={userData} />
      <HealthiconsUiUserProfile />
      <Notifications />
      <button
        onClick={handleLogout}
        className="relative shrink-0 hover:opacity-70 transition-opacity cursor-pointer flex items-center gap-1 text-[#d32f2f]"
        aria-label="Logout"
        title="Logout"
      >
        <LogOut className="w-[24px] h-[24px]" />
      </button>
    </div>
  );
}

function Frame7({ showUserControls = true }: { showUserControls?: boolean }) {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-[32px] right-[32px] top-[10px]">
      <Frame3 />
      <Frame9 userData={JSON.parse(localStorage.getItem('userData') || '{}')} showUserControls={showUserControls} />
    </div>
  );
}

function Frame8({ showUserControls = true }: { showUserControls?: boolean }) {
  return (
    <div className="h-[100px] relative shadow-[0px_1px_6px_0px_rgba(0,0,0,0.25)] shrink-0 w-full">
      <div className="absolute bg-white border-[#e8e8e8] border-b border-solid inset-0" />
      <Frame7 showUserControls={showUserControls} />
    </div>
  );
}

export default function Header({ showUserControls = true }: { showUserControls?: boolean }) {
  const [fontSize, setFontSize] = useState<FontSizeLevel>(1);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isKannada, setIsKannada] = useState(false);

  // Apply font size to document root
  useEffect(() => {
    const sizes = ['0.875rem', '1rem', '1.125rem'];
    document.documentElement.style.setProperty('--app-font-size', sizes[fontSize]);
    
    // Apply to body for global effect
    const scale = [0.9, 1, 1.1][fontSize];
    document.body.style.fontSize = `${scale}rem`;
  }, [fontSize]);

  // Apply high contrast mode
  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
      document.body.style.filter = 'contrast(1.2)';
    } else {
      document.documentElement.classList.remove('high-contrast');
      document.body.style.filter = '';
    }
  }, [isHighContrast]);

  // Store language preference
  useEffect(() => {
    document.documentElement.lang = isKannada ? 'kn' : 'en';
    localStorage.setItem('language', isKannada ? 'kn' : 'en');
  }, [isKannada]);

  const handleDecrease = () => {
    if (fontSize > 0) {
      setFontSize((prev) => Math.max(0, prev - 1) as FontSizeLevel);
    }
  };

  const handleIncrease = () => {
    if (fontSize < 2) {
      setFontSize((prev) => Math.min(2, prev + 1) as FontSizeLevel);
    }
  };

  const toggleContrast = () => {
    setIsHighContrast((prev) => !prev);
  };

  const toggleLanguage = () => {
    setIsKannada((prev) => !prev);
  };

  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="Header">
      <Frame4 
        fontSize={fontSize}
        onDecrease={handleDecrease}
        onIncrease={handleIncrease}
        isHighContrast={isHighContrast}
        toggleContrast={toggleContrast}
        isKannada={isKannada}
        toggleLanguage={toggleLanguage}
      />
      <Frame8 showUserControls={showUserControls} />
    </div>
  );
}
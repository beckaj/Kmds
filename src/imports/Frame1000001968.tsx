import { useState } from 'react';
import { GovButton } from '../app/components/ui/gov-button';
import { MapPin, X } from 'lucide-react';

function WeuiBackOutlined() {
  return (
    <div className="h-[16px] relative w-[8px]" data-name="weui:back-outlined">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 16">
        <g id="weui:back-outlined" />
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="bg-[rgba(145,145,145,0.08)] h-[32.343px] relative rounded-[22.542px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#dadfff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] relative size-full">
          <p className="font-['Poppins:Regular',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#170f49] text-[12px]">Rajesh S</p>
          <div className="flex h-[8px] items-center justify-center relative shrink-0 w-[16px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
            <div className="-rotate-90 flex-none">
              <WeuiBackOutlined />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
        <span className="leading-[9.801px]">{`Owner Name `}</span>
        <span className="leading-[9.801px] text-[#ff5f57]">*</span>
      </p>
      <Frame />
    </div>
  );
}

function WeuiBackOutlined1() {
  return (
    <div className="h-[16px] relative w-[8px]" data-name="weui:back-outlined">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 16">
        <g id="weui:back-outlined" />
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-[rgba(145,145,145,0.08)] h-[32.343px] relative rounded-[22.542px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#dadfff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] py-[11px] relative size-full">
          <p className="font-['Poppins:Regular',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#170f49] text-[12px]">191</p>
          <div className="flex h-[8px] items-center justify-center relative shrink-0 w-[16px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
            <div className="-rotate-90 flex-none">
              <WeuiBackOutlined1 />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
        <span className="leading-[9.801px]">{`Door Number `}</span>
        <span className="leading-[9.801px] text-[#ff5f57]">*</span>
      </p>
      <Frame2 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="bg-[rgba(145,145,145,0.08)] h-[32.343px] relative rounded-[22.542px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#dadfff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[11px] relative size-full">
          <p className="font-['Poppins:Regular',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#170f49] text-[12px]">Ward No.10</p>
        </div>
      </div>
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
        <span className="leading-[9.801px]">{`Ward Number `}</span>
        <span className="leading-[9.801px] text-[#ff5f57]">*</span>
      </p>
      <Frame3 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="bg-[rgba(145,145,145,0.08)] h-[32.343px] relative rounded-[22.542px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#dadfff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[11px] relative size-full">
          <p className="font-['Poppins:Regular',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#170f49] text-[12px]">Ayodhya Nagar</p>
        </div>
      </div>
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
        <span className="leading-[9.801px]">{`Street `}</span>
        <span className="leading-[9.801px] text-[#ff5f57]">*</span>
      </p>
      <Frame4 />
    </div>
  );
}

function Frame25() {
  return (
    <div className="content-between flex flex-wrap h-[52px] items-start justify-between relative shrink-0 w-full">
      <Frame1 />
      <Frame16 />
      <Frame17 />
      <Frame19 />
    </div>
  );
}

function WeuiBackOutlined2() {
  return (
    <div className="h-[16px] relative w-[8px]" data-name="weui:back-outlined">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 16">
        <g id="weui:back-outlined" />
      </svg>
    </div>
  );
}

function Frame6() {
  return (
    <div className="bg-[rgba(145,145,145,0.08)] h-[32.343px] relative rounded-[22.542px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#dadfff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] relative size-full">
          <p className="font-['Poppins:Regular',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#170f49] text-[12px]">{`4th Cross  GV Nagar`}</p>
          <div className="flex h-[8px] items-center justify-center relative shrink-0 w-[16px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
            <div className="-rotate-90 flex-none">
              <WeuiBackOutlined2 />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
        <span className="leading-[9.801px]">{`Address `}</span>
        <span className="leading-[9.801px] text-[#ff5f57]">*</span>
      </p>
      <Frame6 />
    </div>
  );
}

function WeuiBackOutlined3() {
  return (
    <div className="h-[16px] relative w-[8px]" data-name="weui:back-outlined">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 16">
        <g id="weui:back-outlined" />
      </svg>
    </div>
  );
}

function Frame7() {
  return (
    <div className="bg-[rgba(145,145,145,0.08)] h-[32.343px] relative rounded-[22.542px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#dadfff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] py-[11px] relative size-full">
          <p className="font-['Poppins:Regular',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#170f49] text-[12px]">Hubballi</p>
          <div className="flex h-[8px] items-center justify-center relative shrink-0 w-[16px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
            <div className="-rotate-90 flex-none">
              <WeuiBackOutlined3 />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
        <span className="leading-[9.801px]">{`City `}</span>
        <span className="leading-[9.801px] text-[#ff5f57]">*</span>
      </p>
      <Frame7 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="bg-[rgba(145,145,145,0.08)] h-[32.343px] relative rounded-[22.542px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#dadfff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[11px] relative size-full">
          <p className="font-['Poppins:Regular',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#170f49] text-[12px]">Dharwad</p>
        </div>
      </div>
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
        <span className="leading-[9.801px]">{`District `}</span>
        <span className="leading-[9.801px] text-[#ff5f57]">*</span>
      </p>
      <Frame8 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="bg-[rgba(145,145,145,0.08)] h-[32.343px] relative rounded-[22.542px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#dadfff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[11px] relative size-full">
          <p className="font-['Poppins:Regular',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#170f49] text-[12px]">Karnataka</p>
        </div>
      </div>
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
        <span className="leading-[9.801px]">{`State `}</span>
        <span className="leading-[9.801px] text-[#ff5f57]">*</span>
      </p>
      <Frame9 />
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-between flex flex-wrap h-[52px] items-start justify-between relative shrink-0 w-full">
      <Frame5 />
      <Frame18 />
      <Frame20 />
      <Frame21 />
    </div>
  );
}

function WeuiBackOutlined4() {
  return (
    <div className="h-[16px] relative w-[8px]" data-name="weui:back-outlined">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 16">
        <g id="weui:back-outlined" />
      </svg>
    </div>
  );
}

function Frame11() {
  return (
    <div className="bg-[rgba(145,145,145,0.08)] h-[32.343px] relative rounded-[22.542px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#dadfff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] relative size-full">
          <p className="font-['Poppins:Regular',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#170f49] text-[12px]">580026</p>
          <div className="flex h-[8px] items-center justify-center relative shrink-0 w-[16px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
            <div className="-rotate-90 flex-none">
              <WeuiBackOutlined4 />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
        <span className="leading-[9.801px]">{`Pincode `}</span>
        <span className="leading-[9.801px] text-[#ff5f57]">*</span>
      </p>
      <Frame11 />
    </div>
  );
}

function WeuiBackOutlined5() {
  return (
    <div className="h-[16px] relative w-[8px]" data-name="weui:back-outlined">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 16">
        <g id="weui:back-outlined" />
      </svg>
    </div>
  );
}

function Frame12() {
  return (
    <div className="bg-[rgba(145,145,145,0.08)] h-[32.343px] relative rounded-[22.542px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#dadfff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] py-[11px] relative size-full">
          <p className="font-['Poppins:Regular',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#170f49] text-[12px]">22-108-T819</p>
          <div className="flex h-[8px] items-center justify-center relative shrink-0 w-[16px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
            <div className="-rotate-90 flex-none">
              <WeuiBackOutlined5 />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame22() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
        <span className="leading-[9.801px]">{`Khata Number `}</span>
        <span className="leading-[9.801px] text-[#ff5f57]">*</span>
      </p>
      <Frame12 />
    </div>
  );
}

function Frame13() {
  return (
    <div className="bg-[rgba(145,145,145,0.08)] h-[32.343px] relative rounded-[22.542px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#dadfff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[11px] relative size-full">
          <p className="font-['Poppins:Regular',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#170f49] text-[12px]">12.9716</p>
        </div>
      </div>
    </div>
  );
}

function Frame23() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
        <span className="leading-[9.801px]">{`Latitude `}</span>
        <span className="leading-[9.801px] text-[#ff5f57]">*</span>
      </p>
      <Frame13 />
    </div>
  );
}

function Frame14() {
  return (
    <div className="bg-[rgba(145,145,145,0.08)] h-[32.343px] relative rounded-[22.542px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#dadfff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[11px] relative size-full">
          <p className="font-['Poppins:Regular',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#170f49] text-[12px]">77.5946</p>
        </div>
      </div>
    </div>
  );
}

function Frame24() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
        <span className="leading-[9.801px]">{`Longitude `}</span>
        <span className="leading-[9.801px] text-[#ff5f57]">*</span>
      </p>
      <Frame14 />
    </div>
  );
}

function Frame27() {
  return (
    <div className="content-between flex flex-wrap h-[52px] items-start justify-between relative shrink-0 w-full">
      <Frame10 />
      <Frame22 />
      <Frame23 />
      <Frame24 />
    </div>
  );
}

function Frame15() {
  return (
    <div className="bg-[#0078a0] h-[32px] relative rounded-[24px] shadow-[0px_2.45px_7.841px_0px_rgba(8,15,52,0.06)] shrink-0">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] h-full items-center px-[14px] py-[28px] relative">
          <p className="font-['Poppins:Medium',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[12px] text-white">View on Map</p>
        </div>
      </div>
    </div>
  );
}

function Frame29() {
  return (
    <div className="content-stretch flex flex-col items-end justify-center relative shrink-0 w-full">
      <Frame15 />
    </div>
  );
}

export default function Frame28() {
  const [showMap, setShowMap] = useState(false);
  const latitude = 12.9716;
  const longitude = 77.5946;

  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative size-full">
      <div className="flex flex-col font-['Poppins',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#414141] text-[18px] w-full">
        <p className="leading-[normal] whitespace-pre-wrap">Fetched Property Details</p>
      </div>
      
      {/* Summary Data Grid */}
      <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-4 gap-x-8 gap-y-5">
          {/* Row 1 */}
          <div>
            <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Owner Name</p>
            <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">Rajesh S</p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Door Number</p>
            <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">191</p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Ward Number</p>
            <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">Ward No.10</p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Street</p>
            <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">Ayodhya Nagar</p>
          </div>
          
          {/* Row 2 */}
          <div>
            <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Address</p>
            <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">4th Cross GV Nagar</p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">City</p>
            <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">Hubballi</p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">District</p>
            <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">Dharwad</p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">State</p>
            <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">Karnataka</p>
          </div>
          
          {/* Row 3 */}
          <div>
            <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Pincode</p>
            <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">580026</p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Khata Number</p>
            <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">22-108-T819</p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Latitude</p>
            <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{latitude}</p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Longitude</p>
            <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{longitude}</p>
          </div>
        </div>
        
        {/* View on Map Button */}
        <div className="mt-6 flex justify-end">
          <GovButton
            variant="secondary"
            onClick={() => setShowMap(true)}
            className="gap-2"
          >
            <MapPin className="w-4 h-4" />
            View on Map
          </GovButton>
        </div>
      </div>

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowMap(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#1f3a5f] rounded-t-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#f9a825]" />
                <h3 className="text-lg font-semibold text-white font-['Poppins',sans-serif]">
                  Property Location
                </h3>
              </div>
              <button
                onClick={() => setShowMap(false)}
                className="text-white hover:text-[#f9a825] transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body - Map */}
            <div className="p-4">
              <div className="w-full h-[500px] rounded-lg overflow-hidden border border-gray-200">
                <iframe
                  src={`https://www.google.com/maps?q=${latitude},${longitude}&hl=en&z=15&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Property Location Map"
                />
              </div>
              
              {/* Location Details */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1">
                      Coordinates
                    </p>
                    <p className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                      {latitude}, {longitude}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1">
                      Address
                    </p>
                    <p className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                      4th Cross GV Nagar, Hubballi
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <GovButton
                variant="secondary"
                onClick={() => window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank')}
              >
                Open in Google Maps
              </GovButton>
              <GovButton
                variant="primary"
                onClick={() => setShowMap(false)}
              >
                Close
              </GovButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
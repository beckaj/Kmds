import imgCsgLogo30011 from "figma:asset/9265fb55faad4104a86d410c6ade200a9ba791f6.png";

function Frame() {
  return (
    <div className="content-stretch flex h-[20px] items-start relative shrink-0">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white tracking-[0.14px]">Copyright © 2025 This document is prepared by Center for Smart Governance exclusively for KMDS</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-[#1f3a5f] flex flex-col w-full items-center px-[32px] py-[24px]">
      <Frame />
    </div>
  );
}

function Frame2() {
  return null;
}

export default function Footer() {
  return (
    <div className="relative size-full" data-name="Footer">
      <Frame1 />
      <Frame2 />
    </div>
  );
}
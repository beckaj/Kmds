import svgPaths from "./svg-a2c2qft110";

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center justify-center relative shrink-0 w-full">
      <p className="font-['Poppins:Bold',sans-serif] leading-[17.152px] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">Comments</p>
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-0.49px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 422 0.490046">
            <line id="Line 133" stroke="var(--stroke-0, #D9DBE9)" strokeWidth="0.490046" x2="422" y1="0.245023" y2="0.245023" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full">
      <p className="flex-[1_0_0] font-['Poppins:Medium',sans-serif] leading-[0] min-h-px min-w-px not-italic relative text-[#170f49] text-[14px] whitespace-pre-wrap">
        <span className="leading-[9.801px]">{`Comments `}</span>
        <span className="leading-[9.801px] text-[#ff0c10]">*</span>
      </p>
    </div>
  );
}

function Frame() {
  return (
    <div className="bg-white h-[32px] relative rounded-[22.542px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#d3d8ff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[10px] py-[11px] relative size-full">
          <p className="font-['Poppins:Regular',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#170f49] text-[12px]">Application Verified and Forwarded to Field Engineer</p>
        </div>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-full">
      <Frame5 />
      <Frame />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full">
      <p className="flex-[1_0_0] font-['Poppins:Medium',sans-serif] leading-[0] min-h-px min-w-px not-italic relative text-[#170f49] text-[14px] whitespace-pre-wrap">
        <span className="leading-[9.801px]">{`Forward To `}</span>
        <span className="leading-[9.801px] text-[#ff0c10]">*</span>
      </p>
    </div>
  );
}

function WeuiBackOutlined() {
  return (
    <div className="h-[16px] relative w-[8px]" data-name="weui:back-outlined">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 16">
        <g id="weui:back-outlined">
          <path clipRule="evenodd" d={svgPaths.p313bbf80} fill="var(--fill-0, black)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-white h-[32px] relative rounded-[22.542px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#d3d8ff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[10px] py-[11px] relative size-full">
          <p className="font-['Poppins:Regular',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#170f49] text-[12px]">Field Engineer</p>
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

function Frame10() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-full">
      <Frame6 />
      <Frame1 />
    </div>
  );
}

function Frame2() {
  return (
    <button className="bg-white cursor-pointer h-[32px] relative rounded-[24px] shrink-0">
      <div aria-hidden="true" className="absolute border-[#0078a0] border-[0.49px] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_2.45px_7.841px_0px_rgba(8,15,52,0.06)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] h-full items-center px-[14px] py-[28px] relative">
          <p className="font-['Poppins:Medium',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#0078a0] text-[12px] text-left">Cancel</p>
        </div>
      </div>
    </button>
  );
}

function Frame7() {
  return (
    <div className="bg-[#0078a0] h-[32px] relative rounded-[24px] shadow-[0px_2.45px_7.841px_0px_rgba(8,15,52,0.06)] shrink-0">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] h-full items-center px-[14px] py-[28px] relative">
          <p className="font-['Poppins:Medium',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[12px] text-white">Submit</p>
        </div>
      </div>
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <Frame2 />
      <Frame7 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[24px] items-center left-[485px] px-[24px] py-[32px] rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,120,160,0.15)] top-[164px] w-[470px]">
      <Frame4 />
      <Frame3 />
      <Frame10 />
      <Frame9 />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_8px_0px_rgba(0,0,0,0.25)]" />
    </div>
  );
}

export default function Group() {
  return (
    <div className="relative size-full">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute backdrop-blur-[2px] bg-[rgba(0,0,0,0.4)] h-[1125px] left-1/2 top-1/2 w-[1440px]" data-name="Over lay" />
      <Frame8 />
    </div>
  );
}
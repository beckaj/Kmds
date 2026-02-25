import svgPaths from "./svg-8fkmd8ut8r";

function Component() {
  return (
    <div className="relative size-[24px]" data-name="Component 15">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Component 15">
          <path d={svgPaths.p89c0f00} fill="var(--fill-0, #170F49)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="flex-none rotate-180">
          <Component />
        </div>
      </div>
      <div className="flex flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#263238] text-[18px] whitespace-nowrap">
        <p className="leading-[1.2]">Yes</p>
      </div>
    </div>
  );
}

function Component1() {
  return (
    <div className="relative size-[24px]" data-name="Component 15">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Component 15">
          <path d={svgPaths.p26216680} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="flex-none rotate-180">
          <Component1 />
        </div>
      </div>
      <div className="flex flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#263238] text-[18px] whitespace-nowrap">
        <p className="leading-[1.2]">No</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[40px] items-center relative shrink-0">
      <Frame />
      <Frame1 />
    </div>
  );
}

export default function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative size-full">
      <div className="flex flex-col font-['Poppins:SemiBold',sans-serif] justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#414141] text-[18px] w-[min-content]">
        <p className="font-['Poppins:Medium',sans-serif] whitespace-pre-wrap">
          <span className="leading-[normal]">{`Is Premises Details and Communication Details are Same? `}</span>
          <span className="leading-[normal] text-[#f44336]">*</span>
        </p>
      </div>
      <Frame2 />
    </div>
  );
}
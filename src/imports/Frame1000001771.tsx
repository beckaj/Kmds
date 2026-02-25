function Frame2() {
  return (
    <div className="bg-white content-stretch flex h-[32px] items-center px-[14px] py-[11px] relative rounded-[22.542px] shrink-0 w-[400px]">
      <div aria-hidden="true" className="absolute border-[#b3bcff] border-[0.49px] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
      <p className="font-['Poppins:Medium',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#170f49] text-[14px]">716718</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0">
      <Frame2 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start justify-center relative shrink-0">
      <div className="flex flex-col font-['Poppins:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#414141] text-[20px] whitespace-nowrap">
        <p>
          <span className="leading-[normal]">{`RR Number `}</span>
          <span className="leading-[normal] text-[#ff5f57]">*</span>
        </p>
      </div>
      <Frame4 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-white">Fetch Details</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-[#0075aa] content-stretch flex flex-col h-[40px] items-center justify-center px-[24px] py-[12px] relative rounded-[32px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#8bdbff] border-solid inset-0 pointer-events-none rounded-[32px]" />
      <Frame />
    </div>
  );
}

export default function Frame5() {
  return (
    <div className="content-stretch flex gap-[40px] items-end relative size-full">
      <Frame3 />
      <Frame1 />
    </div>
  );
}
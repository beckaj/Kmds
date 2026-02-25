function Frame() {
  return (
    <div className="bg-[rgba(145,145,145,0.08)] h-[32.343px] relative rounded-[22.542px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#dadfff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] relative size-full">
          <p className="font-['Poppins:Regular',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#170f49] text-[12px]">Change of Residence</p>
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
        <span className="leading-[9.801px]">{`Disconnection Reason `}</span>
        <span className="font-['Poppins:Bold',sans-serif] leading-[9.801px] text-[#ff5f57]">*</span>
      </p>
      <Frame />
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-[rgba(145,145,145,0.08)] h-[32.343px] relative rounded-[22.542px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#dadfff] border-solid inset-0 pointer-events-none rounded-[22.542px] shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[11px] relative size-full">
          <p className="font-['Poppins:Regular',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-[#170f49] text-[12px]">10/10/2025</p>
        </div>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
        <span className="leading-[9.801px]">{`Date of Approval `}</span>
        <span className="leading-[9.801px] text-[#ff5f57]">*</span>
      </p>
      <Frame2 />
    </div>
  );
}

export default function Frame4() {
  return (
    <div className="content-between flex flex-wrap gap-[40px] items-start relative size-full">
      <Frame1 />
      <Frame3 />
    </div>
  );
}
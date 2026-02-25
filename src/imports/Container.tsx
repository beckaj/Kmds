import svgPaths from "./svg-ojdi231zln";

function Container2() {
  return <div className="bg-[#f54900] h-[24px] rounded-[26843500px] shrink-0 w-[4px]" data-name="Container" />;
}

function Heading() {
  return (
    <div className="h-[28px] relative shrink-0 w-[203.425px]" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[28px] left-0 not-italic text-[#170f49] text-[18px] top-[0.8px]">{`COMMENTS & HISTORY`}</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex gap-[8px] h-[28px] items-center relative shrink-0 w-full" data-name="Container">
      <Container2 />
      <Heading />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p2026e800} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p32ab0300} id="Vector_2" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-[#e5e7eb] relative rounded-[26843500px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon />
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[20px] relative shrink-0 w-[69.175px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Poppins:Regular',sans-serif] leading-[20px] left-0 not-italic text-[#101828] text-[14px] top-[-1.2px]">Rohit Joshi</p>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[15.988px] relative shrink-0 w-[4.875px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#6a7282] text-[12px]">•</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="bg-[#f3f4f6] h-[22px] relative rounded-[26843500px] shrink-0 w-[68px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[8px] py-[2px] relative size-full">
        <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364153] text-[14px]">Creator</p>
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[15.988px] relative shrink-0 w-[4.875px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#6a7282] text-[12px]">•</p>
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[15.988px] relative shrink-0 w-[116.888px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#6a7282] text-[14px]">Feb 5, 2026, 10:30 AM</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="Container">
      <Paragraph />
      <Text />
      <Text1 />
      <Text2 />
      <Text3 />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Poppins:Regular',sans-serif] leading-[20px] left-0 not-italic text-[#364153] text-[14px] top-[-1.2px]">Request created for asset disposal</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="flex-[1_0_0] h-[44px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Container6 />
        <Paragraph1 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex gap-[16px] h-[44px] items-start relative shrink-0 w-full" data-name="Container">
      <Container4 />
      <Container5 />
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[16px] items-start pb-[0.8px] pt-[24.8px] px-[24.8px] relative rounded-[10px] size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1)]" />
      <Container1 />
      <Container3 />
    </div>
  );
}
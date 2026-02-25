function Container2() {
  return <div className="bg-[#00a63e] h-[24px] rounded-[26843500px] shrink-0 w-[4px]" data-name="Container" />;
}

function Heading() {
  return (
    <div className="h-[28px] relative shrink-0 w-[163.938px]" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[28px] left-0 not-italic text-[#170f49] text-[18px] top-[0.8px]">TRANSFER DETAILS</p>
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

function Paragraph() {
  return (
    <div className="content-stretch flex h-[20px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="flex-[1_0_0] font-['Poppins:Regular',sans-serif] leading-[20px] min-h-px min-w-px not-italic relative text-[#6e7191] text-[14px] whitespace-pre-wrap">Reason for Transfer</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[26px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Poppins:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#414141] text-[16px] top-[0.6px]">Better resource utilization and maintenance capability</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[54px] items-start relative shrink-0 w-full" data-name="Container">
      <Paragraph />
      <Paragraph1 />
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
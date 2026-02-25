function ColumnHeader() {
  return (
    <div className="content-stretch flex gap-[2px] items-center py-[12px] relative shrink-0 w-[13px]" data-name="column-header">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] tracking-[0.56px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">#</p>
      </div>
    </div>
  );
}

function ColumnHeader1() {
  return (
    <div className="content-stretch flex h-[40px] items-center justify-center py-[12px] relative shrink-0 w-[239px]" data-name="column-header">
      <div className="flex flex-col font-['Poppins:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] tracking-[0.56px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">Application No</p>
      </div>
    </div>
  );
}

function ColumnHeader2() {
  return (
    <div className="content-stretch flex h-[40px] items-center justify-center py-[12px] relative shrink-0 w-[100px]" data-name="column-header">
      <div className="flex flex-col font-['Poppins:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] tracking-[0.56px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">Plumber Name</p>
      </div>
    </div>
  );
}

function ColumnHeader3() {
  return (
    <div className="content-stretch flex h-[40px] items-center justify-center py-[12px] relative shrink-0 w-[125px]" data-name="column-header">
      <div className="flex flex-col font-['Poppins:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] text-center tracking-[0.56px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">Applicant As</p>
      </div>
    </div>
  );
}

function ColumnHeader4() {
  return (
    <div className="content-stretch flex h-[40px] items-center justify-center py-[12px] relative shrink-0 w-[94px]" data-name="column-header">
      <div className="flex flex-col font-['Poppins:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] text-center tracking-[0.56px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">Applicant Name</p>
      </div>
    </div>
  );
}

function ColumnHeader5() {
  return (
    <div className="content-stretch flex h-[40px] items-center justify-center py-[12px] relative shrink-0 w-[108px]" data-name="column-header">
      <div className="flex flex-col font-['Poppins:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] text-center tracking-[0.56px] uppercase w-[112px]">
        <p className="leading-[16px] whitespace-pre-wrap">Connection Type</p>
      </div>
    </div>
  );
}

function ColumnHeader6() {
  return (
    <div className="content-stretch flex h-[40px] items-center py-[12px] relative shrink-0 w-[78px]" data-name="column-header">
      <div className="flex flex-col font-['Poppins:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] tracking-[0.56px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">Status</p>
      </div>
    </div>
  );
}

function ColumnHeader7() {
  return (
    <div className="content-stretch flex h-[40px] items-center py-[12px] relative shrink-0 w-[72px]" data-name="column-header">
      <div className="flex flex-col font-['Poppins:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] tracking-[0.56px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">Queue</p>
      </div>
    </div>
  );
}

function ColumnHeader8() {
  return (
    <div className="content-stretch flex gap-[2px] h-[40px] items-center justify-center px-[20px] py-[12px] relative shrink-0 w-[132px]" data-name="column-header">
      <div className="flex flex-col font-['Poppins:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] tracking-[0.56px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">Action</p>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-[24.28px] pl-[10px] top-[11px] w-[1327.435px]">
      <ColumnHeader />
      <div className="flex h-[18px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[18px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 1">
                <line id="Line 32" stroke="var(--stroke-0, #170F49)" x2="18" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <ColumnHeader1 />
      <div className="flex h-[18px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[18px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 1">
                <line id="Line 32" stroke="var(--stroke-0, #170F49)" x2="18" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <ColumnHeader2 />
      <div className="flex h-[18px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[18px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 1">
                <line id="Line 32" stroke="var(--stroke-0, #170F49)" x2="18" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <ColumnHeader3 />
      <div className="flex h-[18px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[18px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 1">
                <line id="Line 32" stroke="var(--stroke-0, #170F49)" x2="18" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <ColumnHeader4 />
      <div className="flex h-[18px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[18px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 1">
                <line id="Line 32" stroke="var(--stroke-0, #170F49)" x2="18" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <ColumnHeader5 />
      <div className="flex h-[18px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[18px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 1">
                <line id="Line 32" stroke="var(--stroke-0, #170F49)" x2="18" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <ColumnHeader6 />
      <div className="flex h-[18px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[18px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 1">
                <line id="Line 32" stroke="var(--stroke-0, #170F49)" x2="18" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <ColumnHeader7 />
      <ColumnHeader8 />
    </div>
  );
}

export default function Group() {
  return (
    <div className="relative size-full">
      <div className="absolute backdrop-blur-[4px] bg-[#27548a] h-[60px] left-0 opacity-10 top-0 w-[1376px]" />
      <Frame />
    </div>
  );
}
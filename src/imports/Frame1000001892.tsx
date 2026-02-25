interface VerificationSectionProps {
  propertyId: string;
  onPropertyIdChange: (value: string) => void;
  onVerify: () => void;
}

function Frame({ propertyId, onPropertyIdChange }: { propertyId: string; onPropertyIdChange: (value: string) => void }) {
  return (
    <input
      type="text"
      placeholder="Enter Property ID/Khata No/Survey No"
      value={propertyId}
      onChange={(e) => onPropertyIdChange(e.target.value)}
      className="w-full px-4 py-2.5 font-['Poppins',sans-serif] text-[14px] text-gray-900 bg-white border-[1.5px] border-gray-300 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] hover:border-gray-400 placeholder:text-gray-400"
    />
  );
}

function Frame1({ propertyId, onPropertyIdChange }: { propertyId: string; onPropertyIdChange: (value: string) => void }) {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px]">
        <span className="leading-[9.801px]">{`Property Id/Khata No `}</span>
        <span className="leading-[9.801px] text-[#ff5f57]">*</span>
      </p>
      <Frame propertyId={propertyId} onPropertyIdChange={onPropertyIdChange} />
    </div>
  );
}

function Frame2({ onVerify }: { onVerify: () => void }) {
  return (
    <button
      onClick={onVerify}
      className="bg-[#1f3a5f] hover:bg-[#2d4a6f] active:bg-[#16293d] content-stretch flex gap-[10px] h-[32px] items-center px-[16px] py-[8px] relative rounded-md shrink-0 transition-all duration-200"
    >
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[9.801px] not-italic relative shrink-0 text-white text-[12px]">Verify</p>
    </button>
  );
}

function Frame3({ propertyId, onPropertyIdChange, onVerify }: { propertyId: string; onPropertyIdChange: (value: string) => void; onVerify: () => void }) {
  return (
    <div className="content-stretch flex gap-[40px] h-[52px] items-center relative shrink-0 w-full">
      <Frame1 propertyId={propertyId} onPropertyIdChange={onPropertyIdChange} />
      <Frame2 onVerify={onVerify} />
    </div>
  );
}

export default function Frame4({ propertyId, onPropertyIdChange, onVerify }: VerificationSectionProps) {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative size-full">
      <div className="flex flex-col font-['Poppins:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#414141] text-[18px] w-full">
        <p className="leading-[normal] whitespace-pre-wrap">Verification of Property</p>
      </div>
      <Frame3 propertyId={propertyId} onPropertyIdChange={onPropertyIdChange} onVerify={onVerify} />
    </div>
  );
}
/**
 * SectionTitle – Figma-matched card section header
 * Green vertical bar + uppercase semibold title in #170f49
 */
interface SectionTitleProps {
  title: string;
  className?: string;
}

export default function SectionTitle({ title, className = '' }: SectionTitleProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-[4px] h-[24px] bg-[#00a63e] rounded-full flex-shrink-0" />
      <h2 className="text-[18px] font-semibold text-[#170f49] font-['Poppins',sans-serif] leading-[28px] uppercase tracking-[0.01em]">
        {title}
      </h2>
    </div>
  );
}

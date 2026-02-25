import { ChevronLeft, User, Droplets, FileSpreadsheet } from 'lucide-react';
import { BCCollectorData, BCApplication } from './BillCollectorMobileApp';

interface BillCollectorAppDetailProps {
  collector: BCCollectorData;
  application: BCApplication;
  onBack: () => void;
  onOpenDCB: (app: BCApplication) => void;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return day + '/' + month + '/' + year;
  } catch {
    return dateStr;
  }
}

// ─── Detail Field Component ─────────────────────────────────────────────────

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <label className="block text-[10px] font-semibold text-gray-500 mb-1 font-['Poppins',sans-serif] uppercase tracking-wide leading-tight">
        {label}
      </label>
      <div className="min-h-[34px] px-2.5 py-1.5 border border-gray-200 rounded-md bg-gray-50 flex items-center">
        <span className="text-[12px] text-[#414141] font-['Poppins',sans-serif] leading-snug break-words">
          {value || 'N/A'}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function BillCollectorAppDetail({
  collector,
  application,
  onBack,
  onOpenDCB,
}: BillCollectorAppDetailProps) {
  return (
    <div className="min-h-screen bg-[#f5f5fa] flex flex-col max-w-[420px] mx-auto border-x border-gray-200 shadow-xl">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="bg-[#1f3a5f] px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="cursor-pointer p-0.5">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#f9a825]" />
            <span className="text-white text-[14px] font-semibold font-['Poppins',sans-serif] tracking-wide">
              Jalanidhi
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-white/90 text-[12px] font-medium font-['Poppins',sans-serif]">
            {collector && collector.name ? collector.name.split(' ').slice(0, 2).join(' ') : 'User'}
          </span>
          <div className="w-7 h-7 rounded-full bg-white/15 border border-white/30 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Section Title */}
        <h2 className="text-[16px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
          New Tap Application Details
        </h2>

        {/* ─── Location Details ─── */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 bg-[#f8fafc]">
            <h3 className="text-[13px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Location Details
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-x-3 gap-y-3">
              <DetailField
                label="District"
                value={application && application.district ? application.district : 'N/A'}
              />
              <DetailField
                label="ULB"
                value={application && application.ulb ? application.ulb : 'N/A'}
              />
              <DetailField
                label="ULB Type"
                value={application && application.ulbType ? application.ulbType : 'N/A'}
              />
            </div>
          </div>
        </div>

        {/* ─── Connection Details ─── */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 bg-[#f8fafc]">
            <h3 className="text-[13px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Connection Details
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <DetailField
                label="RR No"
                value={application && application.rrNumber ? application.rrNumber : 'N/A'}
              />
              <DetailField
                label="Connection Type"
                value={application && application.connectionType ? application.connectionType : 'N/A'}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DetailField
                label="Metering Type"
                value={application && application.meteringType ? application.meteringType : (application && application.meterCategory === 'Non-Meter' ? 'Non-Metered' : 'Metered')}
              />
              <DetailField
                label="Meter Status"
                value={application && application.meterStatus ? application.meterStatus : 'N/A'}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DetailField
                label="Meter Installed Date"
                value={application && application.meterInstalledDate ? formatDate(application.meterInstalledDate) : 'N/A'}
              />
              <DetailField
                label="Meter Number"
                value={application && application.meterNumber ? application.meterNumber : 'N/A'}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DetailField
                label="Ward"
                value={application && application.ward ? application.ward : 'N/A'}
              />
              <DetailField
                label="Applicant Name"
                value={application && application.applicantName ? application.applicantName : 'N/A'}
              />
            </div>
          </div>
        </div>

        {/* ─── Generate DCB Button ─── */}
        <div className="pt-1 pb-2">
          <button
            onClick={() => onOpenDCB(application)}
            className="w-full h-[44px] bg-[#1f3a5f] hover:bg-[#2d4f7f] active:bg-[#15283f] text-white text-[14px] font-semibold font-['Poppins',sans-serif] rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
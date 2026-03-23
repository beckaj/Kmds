import { GovInput } from "../ui/gov-input";
import { GovSelect } from "../ui/gov-select";
import { GovMultiSelect } from "../ui/gov-multi-select";
import { IndianRupee, Info } from "lucide-react";
import svgPaths from "../../../imports/svg-i1fu7njk59";
import { filterDigitsOnly } from "../../utils/validation";

interface MeteringConfig {
  meterType: 'metered' | 'non-metered';
  nonMeterBillingMode?: 'upfront' | 'monthly';
}

interface ConnectionDetailsStepProps {
  formData: {
    serviceAppliedFor: string;
    connectionType: string;
    propertyTypeCategory: string;
    flatsOrHouses: string;
    plumberType: string;
    firmName: string;
    plumberList: string;
  };
  errors: Record<string, string | undefined>;
  onInputChange: (field: string, value: string) => void;
  meteringConfig?: MeteringConfig | null;
  slabRates?: Record<string, { label: string; rate: number }>;
}

const SERVICE_APPLIED_FOR_OPTIONS = [
  { value: "new-tap-connection", label: "New Tap Connection" },
  { value: "water-supply", label: "Water Supply" },
  { value: "sewerage", label: "Sewerage" },
];

const CONNECTION_TYPE_OPTIONS = [
  { value: "domestic", label: "Domestic" },
  { value: "non-domestic", label: "Non-Domestic" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
];

const PLUMBER_TYPE_OPTIONS = [
  { value: "contractor", label: "Contractor" },
  { value: "individual", label: "Individual" },
];

const FIRM_NAME_OPTIONS = [
  { value: "l-and-t", label: "L & T" },
  { value: "abc-contractors", label: "ABC Contractors" },
  { value: "xyz-plumbing", label: "XYZ Plumbing" },
  { value: "other", label: "Other" },
];

const PLUMBER_LIST_OPTIONS = [
  { value: "rajesh-kumar", label: "Rajesh Kumar" },
  { value: "suresh-babu", label: "Suresh Babu" },
  { value: "mahesh-gowda", label: "Mahesh Gowda" },
  { value: "venkatesh-murthy", label: "Venkatesh Murthy" },
  { value: "ganesh-hegde", label: "Ganesh Hegde" },
  { value: "ramesh-shetty", label: "Ramesh Shetty" },
];

export default function ConnectionDetailsStep({ 
  formData, 
  errors, 
  onInputChange,
  meteringConfig,
  slabRates,
}: ConnectionDetailsStepProps) {
  // Determine if the ULB is non-metered and compute billing details
  const isNonMetered = meteringConfig && meteringConfig.meterType === 'non-metered';
  const isUpfront = isNonMetered && meteringConfig && meteringConfig.nonMeterBillingMode === 'upfront';
  const isMonthly = isNonMetered && meteringConfig && meteringConfig.nonMeterBillingMode === 'monthly';

  // Get selected connection type slab rate
  const selectedSlab = (isNonMetered && slabRates && formData.connectionType)
    ? (slabRates[formData.connectionType] || null)
    : null;
  const monthlyRate = selectedSlab ? selectedSlab.rate : 0;
  const upfrontTotal = monthlyRate * 12;

  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative size-full">
      {/* Header */}
      <div className="flex flex-col font-['Poppins',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#414141] text-[18px] whitespace-nowrap">
        <p className="leading-[normal]">Connection Details</p>
      </div>

      {/* Form Fields */}
      <div className="content-start flex flex-wrap gap-[24px_40px] items-start relative shrink-0 w-full">
        {/* Service Applied For */}
        <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
          <p className="font-['Poppins',sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
            <span className="leading-[9.801px]">Service Applied For </span>
            <span className="leading-[9.801px] text-[#ff5f57]">*</span>
          </p>
          <GovInput
            value="New Tap Connection"
            disabled
          />
        </div>

        {/* Connection Type */}
        <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
          <p className="font-['Poppins',sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
            <span className="leading-[9.801px]">Connection Type </span>
            <span className="leading-[9.801px] text-[#ff5f57]">*</span>
          </p>
          <GovSelect
            placeholder="Select Connection Type"
            options={CONNECTION_TYPE_OPTIONS}
            value={formData.connectionType}
            onValueChange={(value) => onInputChange("connectionType", value)}
            error={errors.connectionType}
          />
        </div>

        {/* Property Type Category - Radio Buttons */}
        <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
          <p className="font-['Poppins',sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap mb-1">
            <span className="leading-[9.801px]">Property Type </span>
            <span className="leading-[9.801px] text-[#ff5f57]">*</span>
          </p>
          
          {/* Apartment Radio */}
          <div 
            className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0 w-full cursor-pointer"
            onClick={() => onInputChange("propertyTypeCategory", "apartment")}
          >
            <div className="flex items-center justify-center relative shrink-0">
              <div className="flex-none rotate-180">
                <div className="relative size-[24px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                    <g>
                      <path 
                        d={svgPaths.p89c0f00} 
                        fill={formData.propertyTypeCategory === "apartment" ? "#1f3a5f" : "#170F49"} 
                      />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
            <p className="flex-[1_0_0] font-['Poppins',sans-serif] font-medium leading-[9.801px] min-h-px min-w-px not-italic relative text-[#170f49] text-[14px] whitespace-pre-wrap">
              Apartment
            </p>
          </div>

          {/* Building Radio */}
          <div 
            className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0 w-full cursor-pointer"
            onClick={() => onInputChange("propertyTypeCategory", "building")}
          >
            <div className="flex items-center justify-center relative shrink-0">
              <div className="flex-none rotate-180">
                <div className="relative size-[24px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                    <g>
                      <path 
                        d={svgPaths.p9db9e80} 
                        fill={formData.propertyTypeCategory === "building" ? "#1f3a5f" : "#170F49"} 
                      />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
            <p className="flex-[1_0_0] font-['Poppins',sans-serif] font-medium leading-[9.801px] min-h-px min-w-px not-italic relative text-[#170f49] text-[14px] whitespace-pre-wrap">
              Building
            </p>
          </div>

          {errors.propertyTypeCategory && (
            <p className="text-[13px] text-red-600 font-['Poppins',sans-serif] mt-1">
              {errors.propertyTypeCategory}
            </p>
          )}
        </div>

        {/* Flats/No of House */}
        <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
          <p className="font-['Poppins',sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
            <span className="leading-[9.801px]">Flats/No of House </span>
            <span className="leading-[9.801px] text-[#ff5f57]">*</span>
          </p>
          <GovInput
            type="text"
            placeholder="Enter number"
            value={formData.flatsOrHouses}
            onChange={(e) => onInputChange("flatsOrHouses", filterDigitsOnly(e.target.value))}
            error={errors.flatsOrHouses}
            maxLength={4}
            inputMode="numeric"
          />
        </div>

        {/* Plumber Type */}
        <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
          <p className="font-['Poppins',sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
            <span className="leading-[9.801px]">Plumber Type </span>
            <span className="leading-[9.801px] text-[#ff5f57]">*</span>
          </p>
          <GovSelect
            placeholder="Select Plumber Type"
            options={PLUMBER_TYPE_OPTIONS}
            value={formData.plumberType}
            onValueChange={(value) => {
              onInputChange("plumberType", value);
              // Reset both fields when plumber type changes
              onInputChange("firmName", "");
              onInputChange("plumberList", "");
            }}
            error={errors.plumberType}
          />
        </div>

        {/* Firm Name - shown when Contractor is selected */}
        {formData.plumberType === "contractor" && (
        <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
          <p className="font-['Poppins',sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
            <span className="leading-[9.801px]">Firm Name </span>
            <span className="leading-[9.801px] text-[#ff5f57]">*</span>
          </p>
          <GovSelect
            placeholder="Select Firm"
            options={FIRM_NAME_OPTIONS}
            value={formData.firmName}
            onValueChange={(value) => onInputChange("firmName", value)}
            error={errors.firmName}
          />
        </div>
        )}

        {/* Plumber List - shown when Individual is selected */}
        {formData.plumberType === "individual" && (
        <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-[300px]">
          <p className="font-['Poppins',sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#170f49] text-[14px] w-full whitespace-pre-wrap">
            <span className="leading-[9.801px]">Plumber List </span>
            <span className="leading-[9.801px] text-[#ff5f57]">*</span>
          </p>
          <GovMultiSelect
            placeholder="Select Plumber(s)"
            options={PLUMBER_LIST_OPTIONS}
            value={formData.plumberList ? formData.plumberList.split(",") : []}
            onChange={(values) => onInputChange("plumberList", values.join(","))}
            error={errors.plumberList}
          />
        </div>
        )}
      </div>

      {/* ── Non-Metered Billing Summary Panel ── */}
      {isNonMetered && formData.connectionType && selectedSlab && (
        <div className="w-full mt-4">
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
              Billing Summary
            </h3>

            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-5">
              {/* Billing mode + connection type */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                  {selectedSlab.label} Connection &middot; {isUpfront ? 'Upfront (12-month advance)' : 'Monthly payable'}
                </p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium font-['Poppins',sans-serif] bg-[#1f3a5f]/10 text-[#1f3a5f]">
                  Non-Metered
                </span>
              </div>

              {/* Key figures */}
              <div className={`grid ${isUpfront ? 'grid-cols-2' : 'grid-cols-2'} gap-4`}>
                <div className="bg-white rounded-md border border-gray-200 px-4 py-3">
                  <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] mb-0.5">Monthly Rate</p>
                  <p className="text-[18px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                    &#8377;{monthlyRate}<span className="text-[11px] font-normal text-gray-400">/month</span>
                  </p>
                </div>

                {isUpfront && (
                  <div className="bg-white rounded-md border border-gray-200 px-4 py-3">
                    <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] mb-0.5">Total Upfront (12 months)</p>
                    <p className="text-[18px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                      &#8377;{upfrontTotal.toLocaleString('en-IN')}
                    </p>
                  </div>
                )}

                {isMonthly && (
                  <div className="bg-white rounded-md border border-gray-200 px-4 py-3">
                    <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] mb-0.5">Annual Estimate</p>
                    <p className="text-[18px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                      &#8377;{upfrontTotal.toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
              </div>

              {/* Single note */}
              <p className="mt-3 text-[11px] text-gray-500 font-['Poppins',sans-serif]">
                {isUpfront
                  ? 'The upfront amount will be collected after approval. Monthly deductions are auto-processed.'
                  : 'Bills are auto-generated per ULB configuration. Auto-debit starts from the 7th day of each billing cycle.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { GovInput } from '../ui/gov-input';
import { GovSelect } from '../ui/gov-select';
import { GovButton } from '../ui/gov-button';
import {
  filterDigitsOnly,
  filterAlphaOnly,
  filterAddress,
  validateMobile,
} from "../../utils/validation";

interface ApplicantDetailsStepProps {
  formData: {
    existingRRNumber: string;
    meterCategory: string;
    connectionStatus: string;
    applicantName: string;
    fatherName: string;
    doorNumber: string;
    wardNumber: string;
    street: string;
    address: string;
    state: string;
    districtApplicant: string;
    city: string;
    pincode: string;
    mobile: string;
    email: string;
    aadharNumber: string;
  };
  errors: Record<string, string | undefined>;
  onInputChange: (field: string, value: string) => void;
}

const METER_CATEGORIES = [
  { value: "metered", label: "Metered" },
  { value: "non-metered", label: "Non-Metered" },
];

const CONNECTION_STATUS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function ApplicantDetailsStep({ formData, errors, onInputChange }: ApplicantDetailsStepProps) {
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");

  return (
    <div className="space-y-8">
      {/* Existing Connection Details Section */}
      <div className="space-y-4">
        <h3 className="text-[18px] font-semibold text-[#414141] font-['Poppins',sans-serif]">
          Existing Connection Details
        </h3>
        
        <div className="grid grid-cols-3 gap-6">
          <GovInput
            label="RR Number"
            placeholder=""
            value={formData.existingRRNumber || "RR-2026-004587"}
            onChange={(e) => onInputChange("existingRRNumber", e.target.value)}
            disabled
            helperText="Revenue Receipt Number (if existing connection)"
          />

          <GovSelect
            label="Meter Category"
            placeholder="Select Meter Category"
            options={METER_CATEGORIES}
            value={formData.meterCategory || ""}
            onValueChange={(value) => onInputChange("meterCategory", value)}
            error={errors.meterCategory}
          />

          <GovSelect
            label="Connection Status"
            placeholder="Select Status"
            options={CONNECTION_STATUS}
            value={formData.connectionStatus || ""}
            onValueChange={(value) => onInputChange("connectionStatus", value)}
            error={errors.connectionStatus}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Details of the Premises Section */}
      <div className="space-y-4">
        <h3 className="text-[18px] font-semibold text-[#414141] font-['Poppins',sans-serif]">
          Details of the Premises where Tap Connection is Required
        </h3>
        
        {/* Row 1 */}
        <div className="grid grid-cols-4 gap-6">
          <GovInput
            label="Full Name"
            required
            placeholder="Enter full name"
            value={formData.applicantName}
            onChange={(e) => onInputChange("applicantName", filterAlphaOnly(e.target.value))}
            error={errors.applicantName}
            maxLength={100}
          />

          <GovInput
            label="House/Door No"
            required
            placeholder="Enter door number"
            value={formData.doorNumber || ""}
            onChange={(e) => onInputChange("doorNumber", filterAddress(e.target.value))}
            error={errors.doorNumber}
            maxLength={20}
          />

          <GovInput
            label="Ward Number"
            required
            placeholder="Enter ward number"
            value={formData.wardNumber || ""}
            onChange={(e) => onInputChange("wardNumber", filterDigitsOnly(e.target.value))}
            error={errors.wardNumber}
            maxLength={3}
            inputMode="numeric"
          />

          <GovInput
            label="Street"
            required
            placeholder="Enter street name"
            value={formData.street || ""}
            onChange={(e) => onInputChange("street", filterAddress(e.target.value))}
            error={errors.street}
            maxLength={100}
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-4 gap-6">
          <GovInput
            label="Address"
            required
            placeholder="Enter address"
            value={formData.address}
            onChange={(e) => onInputChange("address", filterAddress(e.target.value))}
            error={errors.address}
            maxLength={200}
          />

          <GovInput
            label="State"
            required
            placeholder="Enter state"
            value={formData.state || "Karnataka"}
            onChange={(e) => onInputChange("state", filterAlphaOnly(e.target.value))}
            error={errors.state}
            maxLength={50}
          />

          <GovInput
            label="District"
            required
            placeholder="Enter district"
            value={formData.districtApplicant || ""}
            onChange={(e) => onInputChange("districtApplicant", filterAlphaOnly(e.target.value))}
            error={errors.districtApplicant}
            maxLength={50}
          />

          <GovInput
            label="City"
            required
            placeholder="Enter city"
            value={formData.city || ""}
            onChange={(e) => onInputChange("city", filterAlphaOnly(e.target.value))}
            error={errors.city}
            maxLength={50}
          />
        </div>

        {/* Row 3 - Pincode and Mobile with Get OTP */}
        <div className="grid grid-cols-4 gap-6">
          <GovInput
            label="Pincode"
            required
            type="text"
            placeholder="Enter 6-digit pincode"
            value={formData.pincode}
            onChange={(e) => onInputChange("pincode", filterDigitsOnly(e.target.value))}
            error={errors.pincode}
            maxLength={6}
            inputMode="numeric"
          />

          <GovInput
            label="Mobile No"
            required
            type="tel"
            placeholder="Enter 10-digit mobile number"
            value={formData.mobile}
            onChange={(e) => onInputChange("mobile", filterDigitsOnly(e.target.value))}
            error={errors.mobile}
            maxLength={10}
            inputMode="numeric"
          />

          {otpSent && (
            <GovInput
              label="Enter OTP"
              required
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otpValue}
              onChange={(e) => {
                const filtered = filterDigitsOnly(e.target.value);
                setOtpValue(filtered);
                if (otpError) setOtpError("");
              }}
              error={otpError}
              maxLength={6}
              inputMode="numeric"
            />
          )}

          <div className="flex items-end pb-1">
            {!otpSent ? (
              <GovButton
                variant="primary"
                onClick={() => {
                  const mobileErr = validateMobile(formData.mobile);
                  if (mobileErr) {
                    onInputChange("mobile", formData.mobile); // trigger re-render
                    alert(mobileErr);
                    return;
                  }
                  alert(`OTP sent to ${formData.mobile}`);
                  setOtpSent(true);
                }}
                className="w-full"
              >
                Get OTP
              </GovButton>
            ) : otpVerified ? (
              <GovButton
                variant="primary"
                disabled
                className="w-full bg-[#10b981] hover:bg-[#10b981] border-[#10b981] cursor-default"
              >
                Verified
              </GovButton>
            ) : (
              <GovButton
                variant="primary"
                onClick={() => {
                  if (!otpValue || otpValue.length !== 6) {
                    setOtpError("Please enter a valid 6-digit OTP");
                    return;
                  }
                  // Here you would verify the OTP with backend
                  alert("OTP verified successfully!");
                  setOtpVerified(true);
                  setOtpError("");
                }}
                className="w-full"
              >
                Verify
              </GovButton>
            )}
          </div>
        </div>

        {/* Row 4 - Father Name, Email, Aadhar Number */}
        
      </div>
    </div>
  );
}
import { useState, useRef } from "react";
import { GovInput } from "../ui/gov-input";
import { GovButton } from "../ui/gov-button";
import { GovSelect } from "../ui/gov-select";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldAlert,
  CreditCard,
  BadgeCheck,
  ClipboardCheck,
  ArrowRightLeft,
  Upload,
} from "lucide-react";
import { projectId, publicAnonKey } from "../../../../utils/supabase/info";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChangeRRData {
  // Applicant Details
  district: string;
  ulb: string;
  ulbType: string;

  // Property Details
  ownerName: string;
  doorNumber: string;
  wardNumber: string;
  street: string;
  address: string;
  city: string;
  propertyDistrict: string;
  state: string;
  pincode: string;
  mobileNo: string;

  // Connection Details
  connectionType: string;
  meterCategory: string;
  meterStatus: string;
  meterInstalledDate: string;
  schemeName: string;

  // Arrears
  currentDemand: number;
  arrears: number;
  totalBill: number;
}

interface PaymentDetails {
  serviceAppliedFor: string;
  paymentDate: string;
  orderNo: string;
  transactionNo: string;
  paymentStatus: string;
  amountPaid: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const CONNECTION_TYPES = [
  { value: "Domestic", label: "Domestic" },
  { value: "Non-Domestic", label: "Non-Domestic" },
  { value: "Commercial", label: "Commercial" },
  { value: "Industries", label: "Industries" },
];

// Fee matrix: { from -> to -> { applicationFees, securityDeposit } }
function getFees(
  existingType: string,
  newType: string
): { applicationFees: number; securityDeposit: number } {
  const feeMap: Record<string, Record<string, { applicationFees: number; securityDeposit: number }>> = {
    Domestic: {
      "Non-Domestic": { applicationFees: 150, securityDeposit: 5000 },
      Commercial: { applicationFees: 200, securityDeposit: 10000 },
      Industries: { applicationFees: 300, securityDeposit: 15000 },
    },
    "Non-Domestic": {
      Domestic: { applicationFees: 100, securityDeposit: 2000 },
      Commercial: { applicationFees: 200, securityDeposit: 10000 },
      Industries: { applicationFees: 300, securityDeposit: 15000 },
    },
    Commercial: {
      Domestic: { applicationFees: 100, securityDeposit: 2000 },
      "Non-Domestic": { applicationFees: 150, securityDeposit: 5000 },
      Industries: { applicationFees: 300, securityDeposit: 15000 },
    },
    Industries: {
      Domestic: { applicationFees: 100, securityDeposit: 2000 },
      "Non-Domestic": { applicationFees: 150, securityDeposit: 5000 },
      Commercial: { applicationFees: 200, securityDeposit: 10000 },
    },
  };

  // Normalize the existing type (strip sizes like "1/3"" etc.)
  const normalizedExisting = existingType.split(" ")[0] || existingType;
  const fromKey = Object.keys(feeMap).find(
    (k) => normalizedExisting.toLowerCase().startsWith(k.toLowerCase())
  );
  if (fromKey && feeMap[fromKey] && feeMap[fromKey][newType]) {
    return feeMap[fromKey][newType];
  }
  return { applicationFees: 200, securityDeposit: 10000 };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ChangeOfConnectionTypeForm() {
  // RR verification state
  const [rrNumber, setRrNumber] = useState("");
  const [isRrVerified, setIsRrVerified] = useState(false);
  const [rrData, setRrData] = useState<ChangeRRData | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // UGD connection
  const [hasUGDConnection, setHasUGDConnection] = useState<string>("");

  // Payment state
  const [wantToClearBill, setWantToClearBill] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  // Change of Connection Type details
  const [newConnectionType, setNewConnectionType] = useState<string>("");
  const [supportingDocName, setSupportingDocName] = useState<string>("");
  const [saveToDigiLocker, setSaveToDigiLocker] = useState<string>("");

  // Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if there are arrears
  const hasArrears = rrData && rrData.totalBill !== undefined && rrData.totalBill > 0;

  // Calculate fees based on selected types
  const existingConnectionType =
    rrData && rrData.connectionType ? rrData.connectionType : "";
  const fees =
    existingConnectionType && newConnectionType
      ? getFees(existingConnectionType, newConnectionType)
      : null;

  // Determine if Change of Connection section should be enabled
  const changeDetailsEnabled = isRrVerified && rrData && (!hasArrears || paymentCompleted);

  // Available new connection type options (exclude the existing type)
  const availableNewTypes = CONNECTION_TYPES.filter((ct) => {
    const normalized = existingConnectionType.split(" ")[0] || "";
    return !ct.value.toLowerCase().startsWith(normalized.toLowerCase());
  });

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleFetchDetails = async () => {
    if (!rrNumber.trim()) {
      alert("Please enter RR Number");
      return;
    }
    setIsFetching(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/change-connection/verify-rr`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ rrNumber }),
        }
      );
      const result = await response.json();
      if (result && result.success) {
        console.log("RR Number verified for change of connection:", result.rrData);
        setIsRrVerified(true);
        setRrData(result.rrData);
      } else {
        console.error(
          "Error verifying RR Number:",
          result && result.error ? result.error : "Unknown error"
        );
        alert(
          "Error verifying RR Number: " +
            (result && result.error ? result.error : "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error verifying RR Number:", error);
      alert("Error verifying RR Number: " + error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleProcessPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      const now = new Date();
      const dateStr =
        String(now.getDate()).padStart(2, "0") +
        "/" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "/" +
        now.getFullYear();
      const orderNo = String(Math.floor(100000 + Math.random() * 900000));
      const transNo = String(
        Math.floor(10000000000000 + Math.random() * 90000000000000)
      );

      const details: PaymentDetails = {
        serviceAppliedFor: "Change of Connection Type - Arrear Clearance",
        paymentDate: dateStr,
        orderNo: orderNo,
        transactionNo: transNo,
        paymentStatus: "Success",
        amountPaid: rrData && rrData.totalBill !== undefined ? rrData.totalBill : 0,
      };
      setPaymentDetails(details);
      setPaymentCompleted(true);
      setIsProcessingPayment(false);
    }, 2000);
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSupportingDocName(files[0].name);
    }
  };

  const handleSubmit = async () => {
    if (!isRrVerified || !rrData) {
      alert("Please fetch and verify RR details first");
      return;
    }
    if (hasArrears && !paymentCompleted) {
      alert("Please clear your outstanding arrears before submitting");
      return;
    }
    if (!newConnectionType) {
      alert("Please select a new connection type");
      return;
    }
    if (!supportingDocName) {
      alert("Please upload a supporting document");
      return;
    }
    if (!declarationAccepted) {
      alert("Please accept the declaration to proceed");
      return;
    }

    setIsSubmitting(true);
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const loggedInMobile = userData && userData.phone ? userData.phone : "";

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/change-connection/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            rrNumber,
            citizenId: "CITIZEN-" + loggedInMobile,
            rrData,
            hasUGDConnection,
            existingConnectionType: existingConnectionType,
            newConnectionType,
            applicationFees: fees ? fees.applicationFees : 0,
            securityDeposit: fees ? fees.securityDeposit : 0,
            supportingDocName,
            saveToDigiLocker,
            arrearDetails: {
              currentDemand: rrData.currentDemand,
              arrears: rrData.arrears,
              totalBill: rrData.totalBill,
            },
            paymentDetails: paymentDetails || null,
            declarationAccepted: true,
          }),
        }
      );

      const result = await response.json();

      if (result && result.success) {
        console.log("Change of connection application submitted:", result.applicationId);
        const confirmMsg =
          "Application for Change of Connection Type Submitted Successfully!\n\n" +
          "Your application has been submitted to the Caseworker for review.\n\n" +
          "Application ID: " +
          result.applicationId +
          "\n\n" +
          "You will be notified once the Caseworker reviews your application.";
        alert(confirmMsg);
        handleCancel();
      } else {
        console.error(
          "Error submitting change of connection:",
          result && result.error ? result.error : "Unknown error"
        );
        alert(
          "Error submitting application: " +
            (result && result.error ? result.error : "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error submitting change of connection:", error);
      alert("Error submitting application: " + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRrNumber("");
    setIsRrVerified(false);
    setRrData(null);
    setHasUGDConnection("");
    setWantToClearBill("");
    setPaymentCompleted(false);
    setPaymentDetails(null);
    setNewConnectionType("");
    setSupportingDocName("");
    setSaveToDigiLocker("");
    setDeclarationAccepted(false);
  };

  // Can submit?
  const canSubmit =
    isRrVerified &&
    rrData &&
    (!hasArrears || paymentCompleted) &&
    newConnectionType &&
    supportingDocName &&
    declarationAccepted;

  // ─── Summary Field ────────────────────────────────────────────────────────

  const SummaryField = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">
        {label}
      </p>
      <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">
        {value || "N/A"}
      </p>
    </div>
  );

  const PaymentField = ({
    label,
    value,
    required,
  }: {
    label: string;
    value: string;
    required?: boolean;
  }) => (
    <div>
      <p className="text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif] mb-2">
        {label} {required && <span className="text-red-600">*</span>}
      </p>
      <div className="h-[44px] bg-white border border-gray-300 rounded-lg flex items-center px-4">
        <p className="text-[14px] font-medium text-[#263238] font-['Poppins',sans-serif]">
          {value}
        </p>
      </div>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Application for Change of Connection Type
            </h1>
            <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
              Apply to change your existing water connection type
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Section: RR Number Input */}
          <div className="space-y-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">
                Application Details
              </h2>
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
                Enter your RR Number to fetch existing connection details
              </p>
            </div>

            {/* RR Number Input */}
            <div className="flex gap-[40px] items-end">
              <div className="flex-1 max-w-md">
                <GovInput
                  label="RR Number"
                  required
                  placeholder="Enter RR Number"
                  value={rrNumber}
                  onChange={(e) => setRrNumber(e.target.value)}
                  disabled={isRrVerified}
                />
              </div>

              {!isRrVerified ? (
                <GovButton
                  variant="primary"
                  onClick={handleFetchDetails}
                  loading={isFetching}
                >
                  Fetch Details
                </GovButton>
              ) : (
                <GovButton
                  variant="secondary"
                  onClick={() => {
                    setIsRrVerified(false);
                    setRrData(null);
                    setRrNumber("");
                    setHasUGDConnection("");
                    setWantToClearBill("");
                    setPaymentCompleted(false);
                    setPaymentDetails(null);
                    setNewConnectionType("");
                    setSupportingDocName("");
                    setSaveToDigiLocker("");
                    setDeclarationAccepted(false);
                  }}
                >
                  Change RR Number
                </GovButton>
              )}
            </div>

            {/* Verified Success Badge */}
            {isRrVerified && (
              <div className="flex items-center gap-2 mt-3 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[13px] font-medium font-['Poppins',sans-serif]">
                  RR Number verified successfully
                </span>
              </div>
            )}
          </div>

          {/* ─── Fetched Details ──────────────────────────────────────────────── */}
          {isRrVerified && rrData && (
            <>
              {/* 1. Applicant / Location Details */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Applicant Details
                </h3>
                <div className="grid grid-cols-3 gap-x-8 gap-y-5 bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <SummaryField
                    label="District"
                    value={rrData && rrData.district ? rrData.district : "N/A"}
                  />
                  <SummaryField
                    label="ULB"
                    value={rrData && rrData.ulb ? rrData.ulb : "N/A"}
                  />
                  <SummaryField
                    label="ULB Type"
                    value={rrData && rrData.ulbType ? rrData.ulbType : "N/A"}
                  />
                </div>
              </div>

              {/* 2. Property Details */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Property Details
                </h3>
                <div className="grid grid-cols-4 gap-x-8 gap-y-5 bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <SummaryField
                    label="Owner Name"
                    value={rrData && rrData.ownerName ? rrData.ownerName : "N/A"}
                  />
                  <SummaryField
                    label="Door Number"
                    value={rrData && rrData.doorNumber ? rrData.doorNumber : "N/A"}
                  />
                  <SummaryField
                    label="Ward Number"
                    value={rrData && rrData.wardNumber ? rrData.wardNumber : "N/A"}
                  />
                  <SummaryField
                    label="Street"
                    value={rrData && rrData.street ? rrData.street : "N/A"}
                  />
                  <SummaryField
                    label="Address"
                    value={rrData && rrData.address ? rrData.address : "N/A"}
                  />
                  <SummaryField
                    label="City"
                    value={rrData && rrData.city ? rrData.city : "N/A"}
                  />
                  <SummaryField
                    label="District"
                    value={
                      rrData && rrData.propertyDistrict
                        ? rrData.propertyDistrict
                        : "N/A"
                    }
                  />
                  <SummaryField
                    label="State"
                    value={rrData && rrData.state ? rrData.state : "N/A"}
                  />
                  <SummaryField
                    label="Pincode"
                    value={rrData && rrData.pincode ? rrData.pincode : "N/A"}
                  />
                  <SummaryField
                    label="Mobile No"
                    value={rrData && rrData.mobileNo ? rrData.mobileNo : "N/A"}
                  />
                </div>
              </div>

              {/* 3. Connection Details */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Connection Details
                </h3>
                <div className="grid grid-cols-3 gap-x-8 gap-y-5 bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <SummaryField
                    label="Connection Type"
                    value={
                      rrData && rrData.connectionType
                        ? rrData.connectionType
                        : "N/A"
                    }
                  />
                  <SummaryField
                    label="Meter Category"
                    value={
                      rrData && rrData.meterCategory
                        ? rrData.meterCategory
                        : "N/A"
                    }
                  />
                  <SummaryField
                    label="Meter Status"
                    value={
                      rrData && rrData.meterStatus ? rrData.meterStatus : "N/A"
                    }
                  />
                  <SummaryField
                    label="Meter Installed Date"
                    value={
                      rrData && rrData.meterInstalledDate
                        ? rrData.meterInstalledDate
                        : "N/A"
                    }
                  />
                  <SummaryField
                    label="Scheme Name"
                    value={
                      rrData && rrData.schemeName ? rrData.schemeName : "N/A"
                    }
                  />
                </div>
              </div>

              {/* UGD Connection */}
              <div className="mb-6">
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <p className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif] mb-3">
                    Is there any UGD Connection Linked?{" "}
                    <span className="text-red-600">*</span>
                  </p>
                  <div className="flex gap-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ugdConnection"
                        value="yes"
                        checked={hasUGDConnection === "yes"}
                        onChange={(e) => setHasUGDConnection(e.target.value)}
                        className="w-5 h-5 accent-[#1f3a5f]"
                      />
                      <span className="text-[15px] font-medium text-[#263238] font-['Poppins',sans-serif]">
                        Yes
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ugdConnection"
                        value="no"
                        checked={hasUGDConnection === "no"}
                        onChange={(e) => setHasUGDConnection(e.target.value)}
                        className="w-5 h-5 accent-[#1f3a5f]"
                      />
                      <span className="text-[15px] font-medium text-[#263238] font-['Poppins',sans-serif]">
                        No
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 4. Arrears Pending Details */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Arrears Pending Details
                </h3>
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-3 gap-x-8 gap-y-5 mb-6">
                    <div>
                      <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">
                        Current Demand
                      </p>
                      <p className="text-[16px] font-bold text-[#170f49] font-['Poppins',sans-serif]">
                        {"Rs."}{" "}
                        {rrData && rrData.currentDemand !== undefined
                          ? rrData.currentDemand
                          : 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">
                        Arrears
                      </p>
                      <p className="text-[16px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                        {"Rs."}{" "}
                        {rrData && rrData.arrears !== undefined
                          ? rrData.arrears
                          : 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">
                        Total Bill
                      </p>
                      <p className="text-[16px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                        {"Rs."}{" "}
                        {rrData && rrData.totalBill !== undefined
                          ? rrData.totalBill
                          : 0}
                      </p>
                    </div>
                  </div>

                  {/* Show "Do you want to clear your Bill?" only if there are arrears and not yet paid */}
                  {hasArrears && !paymentCompleted && (
                    <div className="border-t border-gray-200 pt-5">
                      <p className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif] mb-3">
                        Do you want to clear your Bill?{" "}
                        <span className="text-red-600">*</span>
                      </p>
                      <div className="flex gap-8 items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="clearBill"
                            value="yes"
                            checked={wantToClearBill === "yes"}
                            onChange={(e) => setWantToClearBill(e.target.value)}
                            className="w-5 h-5 accent-[#1f3a5f]"
                          />
                          <span className="text-[15px] font-medium text-[#263238] font-['Poppins',sans-serif]">
                            Yes
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="clearBill"
                            value="no"
                            checked={wantToClearBill === "no"}
                            onChange={(e) => setWantToClearBill(e.target.value)}
                            className="w-5 h-5 accent-[#1f3a5f]"
                          />
                          <span className="text-[15px] font-medium text-[#263238] font-['Poppins',sans-serif]">
                            No
                          </span>
                        </label>
                      </div>

                      {/* Blocking Warning if No */}
                      {wantToClearBill === "no" && (
                        <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-300 rounded-lg p-4">
                          <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[14px] font-semibold text-red-700 font-['Poppins',sans-serif] mb-1">
                              Outstanding Arrears Must Be Cleared
                            </p>
                            <p className="text-[13px] text-red-600 font-['Poppins',sans-serif]">
                              You have pending arrears of{" "}
                              <strong>
                                Rs.{" "}
                                {rrData && rrData.totalBill !== undefined
                                  ? rrData.totalBill
                                  : 0}
                              </strong>
                              . As per department regulations, all outstanding
                              bills must be cleared before a Change of Connection
                              Type request can be processed. Please select{" "}
                              <strong>&quot;Yes&quot;</strong> to proceed with the
                              payment.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Pay Now button if Yes */}
                      {wantToClearBill === "yes" && (
                        <div className="mt-4">
                          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[14px] font-semibold text-blue-700 font-['Poppins',sans-serif] mb-1">
                                Payment Required
                              </p>
                              <p className="text-[13px] text-blue-600 font-['Poppins',sans-serif]">
                                You need to pay{" "}
                                <strong>
                                  Rs.{" "}
                                  {rrData && rrData.totalBill !== undefined
                                    ? rrData.totalBill
                                    : 0}
                                </strong>{" "}
                                to clear your outstanding arrears before
                                proceeding with the Change of Connection Type
                                application.
                              </p>
                            </div>
                          </div>
                          <GovButton
                            variant="primary"
                            onClick={handleProcessPayment}
                            loading={isProcessingPayment}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now - Rs.{" "}
                            {rrData && rrData.totalBill !== undefined
                              ? rrData.totalBill
                              : 0}
                          </GovButton>
                          <span className="ml-3 text-[12px] italic text-gray-400 font-['Poppins',sans-serif]">
                            (Note: The system displays this field only if arrears
                            are pending)
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Completed Badge */}
                  {hasArrears && paymentCompleted && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-[14px] font-semibold font-['Poppins',sans-serif]">
                          Arrears cleared successfully — Payment of Rs.{" "}
                          {paymentDetails && paymentDetails.amountPaid !== undefined
                            ? paymentDetails.amountPaid
                            : 0}{" "}
                          received
                        </span>
                      </div>
                    </div>
                  )}

                  {/* No Arrears Message */}
                  {!hasArrears && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-[14px] font-semibold font-['Poppins',sans-serif]">
                          No pending arrears — You can proceed with the
                          application
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Payment Details (shown after arrear payment) */}
              {paymentCompleted && paymentDetails && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4" />
                    Payment Details
                  </h3>
                  <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                      <PaymentField
                        label="Service Applied For"
                        value={paymentDetails.serviceAppliedFor}
                        required
                      />
                      <PaymentField
                        label="Payment Date"
                        value={paymentDetails.paymentDate}
                        required
                      />
                      <PaymentField
                        label="Order No"
                        value={paymentDetails.orderNo}
                        required
                      />
                      <PaymentField
                        label="Transaction No"
                        value={paymentDetails.transactionNo}
                        required
                      />
                      <PaymentField
                        label="Payment Status"
                        value={paymentDetails.paymentStatus}
                        required
                      />
                      <PaymentField
                        label="Amount Paid"
                        value={"Rs. " + paymentDetails.amountPaid}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Change of Connection Type Details — Enabled only after payment / no arrears */}
              <div className="mb-6">
                <h3
                  className={
                    "text-md font-semibold font-['Poppins',sans-serif] mb-3 flex items-center gap-2 " +
                    (changeDetailsEnabled ? "text-[#1f3a5f]" : "text-gray-400")
                  }
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Change of Connection Type Details
                </h3>
                {!changeDetailsEnabled && (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
                    <p className="text-[13px] text-gray-400 font-['Poppins',sans-serif]">
                      This section will be enabled after pending arrears are
                      cleared.
                    </p>
                  </div>
                )}
                {changeDetailsEnabled && (
                  <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                      {/* Existing (read-only) */}
                      <div>
                        <p className="text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif] mb-2">
                          Existing <span className="text-red-600">*</span>
                        </p>
                        <div className="h-[44px] bg-white border border-gray-300 rounded-lg flex items-center px-4">
                          <p className="text-[14px] font-medium text-[#263238] font-['Poppins',sans-serif]">
                            {existingConnectionType || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* New (dropdown) */}
                      <div>
                        <GovSelect
                          label="New"
                          required
                          placeholder="Select new type"
                          options={availableNewTypes}
                          value={newConnectionType}
                          onValueChange={setNewConnectionType}
                        />
                      </div>

                      {/* Application Fees (auto-calculated, read-only) */}
                      <div>
                        <p className="text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif] mb-2">
                          Application Fees{" "}
                          <span className="text-red-600">*</span>
                        </p>
                        <div className="h-[44px] bg-white border border-gray-300 rounded-lg flex items-center px-4">
                          <p className="text-[14px] font-medium text-[#263238] font-['Poppins',sans-serif]">
                            {fees ? "Rs. " + fees.applicationFees : "--"}
                          </p>
                        </div>
                      </div>

                      {/* Security Deposit (auto-calculated, read-only) */}
                      <div>
                        <p className="text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif] mb-2">
                          Security Deposit{" "}
                          <span className="text-red-600">*</span>
                        </p>
                        <div className="h-[44px] bg-white border border-gray-300 rounded-lg flex items-center px-4">
                          <p className="text-[14px] font-medium text-[#263238] font-['Poppins',sans-serif]">
                            {fees ? "Rs. " + fees.securityDeposit : "--"}
                          </p>
                        </div>
                      </div>

                      {/* Supporting Document Upload */}
                      <div>
                        <p className="text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif] mb-2">
                          Supporting Doc{" "}
                          <span className="text-red-600">*</span>
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                        />
                        <button
                          onClick={handleFileUpload}
                          className="h-[44px] px-6 bg-[#1f3a5f] text-white rounded-lg text-[13px] font-semibold font-['Poppins',sans-serif] flex items-center gap-2 hover:bg-[#162d4a] transition-colors cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Document
                        </button>
                        {supportingDocName && (
                          <p className="text-[11px] text-green-600 font-['Poppins',sans-serif] mt-1.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {supportingDocName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Digi-locker question */}
                    <div className="mt-6 pt-5 border-t border-gray-200">
                      <p className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif] mb-3">
                        Do you want to save your document automatically in
                        Digi-locker?{" "}
                        <span className="text-red-600">*</span>
                      </p>
                      <div className="flex gap-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="digiLocker"
                            value="yes"
                            checked={saveToDigiLocker === "yes"}
                            onChange={(e) =>
                              setSaveToDigiLocker(e.target.value)
                            }
                            className="w-5 h-5 accent-[#1f3a5f]"
                          />
                          <span className="text-[15px] font-medium text-[#263238] font-['Poppins',sans-serif]">
                            Yes
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="digiLocker"
                            value="no"
                            checked={saveToDigiLocker === "no"}
                            onChange={(e) =>
                              setSaveToDigiLocker(e.target.value)
                            }
                            className="w-5 h-5 accent-[#1f3a5f]"
                          />
                          <span className="text-[15px] font-medium text-[#263238] font-['Poppins',sans-serif]">
                            No
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 7. Declaration */}
              {changeDetailsEnabled && newConnectionType && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" />
                    Declaration
                  </h3>
                  <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="declaration"
                        checked={declarationAccepted}
                        onChange={(e) =>
                          setDeclarationAccepted(e.target.checked)
                        }
                        className="w-5 h-5 mt-0.5 accent-[#1f3a5f] cursor-pointer shrink-0"
                      />
                      <label htmlFor="declaration" className="cursor-pointer">
                        <p className="text-[14px] font-medium text-[#263238] font-['Poppins',sans-serif] leading-relaxed">
                          I hereby declare that the information provided above is
                          true and accurate to the best of my knowledge.{" "}
                          <span className="text-red-600">*</span>
                        </p>
                      </label>
                    </div>

                    {!declarationAccepted && (
                      <div className="mt-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <p className="text-[12px] text-amber-600 font-['Poppins',sans-serif]">
                          You must accept the declaration before submitting the
                          application.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-200">
                <GovButton
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  disabled={!canSubmit}
                >
                  Submit Application
                </GovButton>
                <GovButton
                  variant="outline"
                  size="lg"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </GovButton>
              </div>
            </>
          )}

          {/* Empty State - Before fetch */}
          {!isRrVerified && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-500 font-['Poppins',sans-serif] mb-1">
                Enter RR Number to Fetch Details
              </h3>
              <p className="text-sm text-gray-400 font-['Poppins',sans-serif]">
                Your connection and property details will appear here after
                verification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

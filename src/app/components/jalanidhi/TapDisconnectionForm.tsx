import { useState } from "react";
import { GovInput } from "../ui/gov-input";
import { GovButton } from "../ui/gov-button";
import { GovSelect } from "../ui/gov-select";
import { Search, CheckCircle2, AlertCircle, FileText, ShieldAlert, CreditCard, BadgeCheck, ClipboardCheck } from "lucide-react";
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface DisconnectionRRData {
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
  
  // Current Arrears
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

const disconnectionReasons = [
  { value: "change_of_residence", label: "Change of Residence" },
  { value: "property_demolition", label: "Property Demolition" },
  { value: "duplicate_connection", label: "Duplicate Connection" },
  { value: "no_longer_required", label: "No Longer Required" },
  { value: "shifting_to_borewell", label: "Shifting to Borewell" },
  { value: "financial_reasons", label: "Financial Reasons" },
  { value: "other", label: "Other" },
];

export default function TapDisconnectionForm() {
  const [disconnectionType, setDisconnectionType] = useState<string>("");
  const [rrNumber, setRrNumber] = useState("");
  const [isRrVerified, setIsRrVerified] = useState(false);
  const [rrData, setRrData] = useState<DisconnectionRRData | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // User input fields
  const [hasUGDConnection, setHasUGDConnection] = useState<string>("");
  const [disconnectionReason, setDisconnectionReason] = useState<string>("");
  const [wantToClearBill, setWantToClearBill] = useState<string>("");
  
  // Payment state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  
  // Declaration state
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if there are arrears
  const hasArrears = rrData && rrData.totalBill !== undefined && rrData.totalBill > 0;

  const handleFetchDetails = async () => {
    if (!rrNumber.trim()) {
      alert("Please enter RR Number");
      return;
    }

    if (!disconnectionType) {
      alert("Please select disconnection type first");
      return;
    }

    setIsFetching(true);
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-698be164/tap-disconnection/verify-rr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ rrNumber })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log("RR Number verified for disconnection:", result.rrData);
        setIsRrVerified(true);
        setRrData(result.rrData);
      } else {
        console.error("Error verifying RR Number:", result.error);
        alert("Error verifying RR Number: " + (result.error || 'Unknown error'));
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

    // Simulate payment processing
    setTimeout(() => {
      const now = new Date();
      const dateStr = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
      const orderNo = String(Math.floor(100000 + Math.random() * 900000));
      const transNo = String(Math.floor(10000000000000 + Math.random() * 90000000000000));

      const details: PaymentDetails = {
        serviceAppliedFor: "Tap Disconnection",
        paymentDate: dateStr,
        orderNo: orderNo,
        transactionNo: transNo,
        paymentStatus: "Success",
        amountPaid: rrData && rrData.totalBill !== undefined ? rrData.totalBill : 0
      };

      setPaymentDetails(details);
      setPaymentCompleted(true);
      setIsProcessingPayment(false);
    }, 2000);
  };

  const handleSubmit = async () => {
    if (!isRrVerified || !rrData) {
      alert("Please fetch and verify RR details first");
      return;
    }

    if (!disconnectionReason) {
      alert("Please select a reason for disconnection");
      return;
    }

    if (!hasUGDConnection) {
      alert("Please select whether UGD connection is linked");
      return;
    }

    if (hasArrears && !paymentCompleted) {
      alert("Please clear your outstanding arrears before submitting");
      return;
    }

    if (!declarationAccepted) {
      alert("Please accept the declaration to proceed");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const loggedInMobile = userData && userData.phone ? userData.phone : '';
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-698be164/tap-disconnection/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          rrNumber,
          citizenId: "CITIZEN-" + loggedInMobile,
          disconnectionType,
          rrData,
          hasUGDConnection,
          disconnectionReason,
          wantToClearBill: hasArrears ? "yes" : "not_applicable",
          arrearDetails: {
            currentDemand: rrData.currentDemand,
            arrears: rrData.arrears,
            totalBill: rrData.totalBill
          },
          paymentDetails: paymentDetails || null,
          declarationAccepted: true
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log("Disconnection application submitted:", result.applicationId);
        
        const confirmationMessage = "Request for Tap Disconnection Submitted Successfully!\n\n" +
          "Your application has been submitted to the Caseworker for review.\n\n" +
          "Application ID: " + result.applicationId + "\n\n" +
          "You will be notified once the Caseworker reviews your application.";
        
        alert(confirmationMessage);
        
        // Reset form
        handleCancel();
      } else {
        console.error("Error submitting disconnection:", result.error);
        alert("Error submitting application: " + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error("Error submitting disconnection:", error);
      alert("Error submitting application: " + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setDisconnectionType("");
    setRrNumber("");
    setIsRrVerified(false);
    setRrData(null);
    setHasUGDConnection("");
    setDisconnectionReason("");
    setWantToClearBill("");
    setPaymentCompleted(false);
    setPaymentDetails(null);
    setIsProcessingPayment(false);
    setDeclarationAccepted(false);
  };

  // Summary field renderer
  const SummaryField = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">{label}</p>
      <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{value || 'N/A'}</p>
    </div>
  );

  // Read-only field for payment status
  const PaymentField = ({ label, value, required }: { label: string; value: string; required?: boolean }) => (
    <div>
      <p className="text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif] mb-2">
        {label} {required && <span className="text-red-600">*</span>}
      </p>
      <div className="h-[44px] bg-white border border-gray-300 rounded-lg flex items-center px-4">
        <p className="text-[14px] font-medium text-[#263238] font-['Poppins',sans-serif]">{value}</p>
      </div>
    </div>
  );

  // Check if the form is ready for submission
  const canSubmit = isRrVerified && rrData && disconnectionReason && hasUGDConnection && declarationAccepted &&
    (!hasArrears || paymentCompleted);

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Application for Tap Disconnection
            </h1>
            <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
              Apply for permanent or temporary tap water disconnection
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          
          {/* Section: Disconnection Type Selection */}
          <div className="space-y-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">
                Application Details
              </h2>
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
                Select disconnection type and enter your RR Number to fetch connection details
              </p>
            </div>

            {/* Disconnection Type */}
            <div className="space-y-3">
              <p className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif]">
                Disconnection Type <span className="text-red-600">*</span>
              </p>
              <div className="flex gap-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="disconnectionType"
                    value="permanent"
                    checked={disconnectionType === "permanent"}
                    onChange={(e) => {
                      setDisconnectionType(e.target.value);
                      if (isRrVerified) {
                        setIsRrVerified(false);
                        setRrData(null);
                        setPaymentCompleted(false);
                        setPaymentDetails(null);
                        setDeclarationAccepted(false);
                      }
                    }}
                    className="w-5 h-5 accent-[#1f3a5f]"
                  />
                  <span className="text-[15px] font-medium text-[#263238] font-['Poppins',sans-serif]">Permanent Disconnection</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="disconnectionType"
                    value="temporary"
                    checked={disconnectionType === "temporary"}
                    onChange={(e) => {
                      setDisconnectionType(e.target.value);
                      if (isRrVerified) {
                        setIsRrVerified(false);
                        setRrData(null);
                        setPaymentCompleted(false);
                        setPaymentDetails(null);
                        setDeclarationAccepted(false);
                      }
                    }}
                    className="w-5 h-5 accent-[#1f3a5f]"
                  />
                  <span className="text-[15px] font-medium text-[#263238] font-['Poppins',sans-serif]">Temporary Disconnection</span>
                </label>
              </div>
            </div>

            {/* RR Number Input */}
            {disconnectionType && (
              <>
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
                        setPaymentCompleted(false);
                        setPaymentDetails(null);
                        setWantToClearBill("");
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
              </>
            )}
          </div>

          {/* Fetched Details - Shown as Summary */}
          {isRrVerified && rrData && (
            <>
              {/* Applicant / Location Details */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Applicant Details
                </h3>
                <div className="grid grid-cols-3 gap-x-8 gap-y-5 bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <SummaryField label="District" value={rrData && rrData.district ? rrData.district : 'N/A'} />
                  <SummaryField label="ULB" value={rrData && rrData.ulb ? rrData.ulb : 'N/A'} />
                  <SummaryField label="ULB Type" value={rrData && rrData.ulbType ? rrData.ulbType : 'N/A'} />
                </div>
              </div>

              {/* Property Details */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Property Details
                </h3>
                <div className="grid grid-cols-4 gap-x-8 gap-y-5 bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <SummaryField label="Owner Name" value={rrData && rrData.ownerName ? rrData.ownerName : 'N/A'} />
                  <SummaryField label="Door Number" value={rrData && rrData.doorNumber ? rrData.doorNumber : 'N/A'} />
                  <SummaryField label="Ward Number" value={rrData && rrData.wardNumber ? rrData.wardNumber : 'N/A'} />
                  <SummaryField label="Street" value={rrData && rrData.street ? rrData.street : 'N/A'} />
                  <SummaryField label="Address" value={rrData && rrData.address ? rrData.address : 'N/A'} />
                  <SummaryField label="City" value={rrData && rrData.city ? rrData.city : 'N/A'} />
                  <SummaryField label="District" value={rrData && rrData.propertyDistrict ? rrData.propertyDistrict : 'N/A'} />
                  <SummaryField label="State" value={rrData && rrData.state ? rrData.state : 'N/A'} />
                  <SummaryField label="Pincode" value={rrData && rrData.pincode ? rrData.pincode : 'N/A'} />
                  <SummaryField label="Phone No" value={rrData && rrData.mobileNo ? rrData.mobileNo : 'N/A'} />
                </div>
              </div>

              {/* Connection Details */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Connection Details
                </h3>
                <div className="grid grid-cols-4 gap-x-8 gap-y-5 bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <SummaryField label="Connection Type" value={rrData && rrData.connectionType ? rrData.connectionType : 'N/A'} />
                  <SummaryField label="Meter Category" value={rrData && rrData.meterCategory ? rrData.meterCategory : 'N/A'} />
                  <SummaryField label="Meter Status" value={rrData && rrData.meterStatus ? rrData.meterStatus : 'N/A'} />
                  <SummaryField label="Meter Installed Date" value={rrData && rrData.meterInstalledDate ? rrData.meterInstalledDate : 'N/A'} />
                  <SummaryField label="Scheme Name" value={rrData && rrData.schemeName ? rrData.schemeName : 'N/A'} />
                </div>
              </div>

              {/* Disconnection Information */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Disconnection Information
                </h3>
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    {/* UGD Connection */}
                    <div>
                      <p className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif] mb-3">
                        Is there any UGD Connection Linked? <span className="text-red-600">*</span>
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
                          <span className="text-[15px] font-medium text-[#263238] font-['Poppins',sans-serif]">Yes</span>
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
                          <span className="text-[15px] font-medium text-[#263238] font-['Poppins',sans-serif]">No</span>
                        </label>
                      </div>
                    </div>

                    {/* Reason for Disconnection */}
                    <div>
                      <GovSelect
                        label="Reason for Disconnection"
                        required
                        placeholder="Select reason"
                        options={disconnectionReasons}
                        value={disconnectionReason}
                        onValueChange={setDisconnectionReason}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Arrears Details */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Current Arrears Details
                </h3>
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-3 gap-x-8 gap-y-5 mb-6">
                    <div>
                      <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Current Demand</p>
                      <p className="text-[16px] font-bold text-[#170f49] font-['Poppins',sans-serif]">
                        {"Rs."} {rrData && rrData.currentDemand !== undefined ? rrData.currentDemand : 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Arrears</p>
                      <p className="text-[16px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                        {"Rs."} {rrData && rrData.arrears !== undefined ? rrData.arrears : 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Total Bill</p>
                      <p className="text-[16px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                        {"Rs."} {rrData && rrData.totalBill !== undefined ? rrData.totalBill : 0}
                      </p>
                    </div>
                  </div>

                  {/* Do you want to clear bill - Only show if there are arrears */}
                  {hasArrears && !paymentCompleted && (
                    <div className="border-t border-gray-200 pt-5">
                      <p className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif] mb-3">
                        Do you want to clear your Bill? <span className="text-red-600">*</span>
                      </p>
                      <div className="flex gap-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="clearBill"
                            value="yes"
                            checked={wantToClearBill === "yes"}
                            onChange={(e) => setWantToClearBill(e.target.value)}
                            className="w-5 h-5 accent-[#1f3a5f]"
                          />
                          <span className="text-[15px] font-medium text-[#263238] font-['Poppins',sans-serif]">Yes</span>
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
                          <span className="text-[15px] font-medium text-[#263238] font-['Poppins',sans-serif]">No</span>
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
                              You have pending arrears of <strong>Rs. {rrData && rrData.totalBill !== undefined ? rrData.totalBill : 0}</strong>. 
                              As per department regulations, all outstanding bills must be cleared before a disconnection request can be processed. 
                              Please select <strong>"Yes"</strong> to proceed with the payment.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Proceed to Pay button if Yes */}
                      {wantToClearBill === "yes" && (
                        <div className="mt-4">
                          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[14px] font-semibold text-blue-700 font-['Poppins',sans-serif] mb-1">
                                Payment Required
                              </p>
                              <p className="text-[13px] text-blue-600 font-['Poppins',sans-serif]">
                                You need to pay <strong>Rs. {rrData && rrData.totalBill !== undefined ? rrData.totalBill : 0}</strong> to clear your outstanding arrears before proceeding with the disconnection application.
                              </p>
                            </div>
                          </div>
                          <GovButton
                            variant="primary"
                            onClick={handleProcessPayment}
                            loading={isProcessingPayment}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Proceed to Pay Rs. {rrData && rrData.totalBill !== undefined ? rrData.totalBill : 0}
                          </GovButton>
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
                          Arrears cleared successfully — Payment of Rs. {paymentDetails && paymentDetails.amountPaid !== undefined ? paymentDetails.amountPaid : 0} received
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Status Section - Shown after payment is completed */}
              {paymentCompleted && paymentDetails && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4" />
                    Payment Status
                  </h3>
                  <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                      <PaymentField label="Service Applied For" value={paymentDetails.serviceAppliedFor} required />
                      <PaymentField label="Payment Date" value={paymentDetails.paymentDate} required />
                      <PaymentField label="Order No" value={paymentDetails.orderNo} required />
                      <PaymentField label="Transaction No" value={paymentDetails.transactionNo} required />
                      <PaymentField label="Payment Status" value={paymentDetails.paymentStatus} required />
                    </div>
                  </div>
                </div>
              )}

              {/* Declaration Section - Shown after payment is completed (or immediately if no arrears) */}
              {(!hasArrears || paymentCompleted) && disconnectionReason && hasUGDConnection && (
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
                        onChange={(e) => setDeclarationAccepted(e.target.checked)}
                        className="w-5 h-5 mt-0.5 accent-[#1f3a5f] cursor-pointer shrink-0"
                      />
                      <label htmlFor="declaration" className="cursor-pointer">
                        <p className="text-[14px] font-medium text-[#263238] font-['Poppins',sans-serif] leading-relaxed">
                          I hereby declare that the information provided above is true and accurate to the best of my knowledge. <span className="text-red-600">*</span>
                        </p>
                      </label>
                    </div>

                    {!declarationAccepted && (
                      <div className="mt-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <p className="text-[12px] text-amber-600 font-['Poppins',sans-serif]">
                          You must accept the declaration before submitting the application.
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
                  Submit
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

          {/* Empty State - Before type selection */}
          {!disconnectionType && (
            null
          )}

          {/* Empty State - Type selected but not fetched */}
          {disconnectionType && !isRrVerified && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-500 font-['Poppins',sans-serif] mb-1">
                Enter RR Number to Fetch Details
              </h3>
              <p className="text-sm text-gray-400 font-['Poppins',sans-serif]">
                Your connection and property details will appear here after verification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
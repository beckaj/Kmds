import { useState, useEffect } from "react";
import { GovInput } from "../ui/gov-input";
import { GovButton } from "../ui/gov-button";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface RRData {
  // Applicant Details
  district: string;
  ulb: string;
  ulbType: string;
  authorityType: string;
  
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
  motorStatus: string;
  meterInstalledDate: string;
  schemeName: string;
}

const steps = [
  { number: 1, label: "Application Details" },
  { number: 2, label: "Charges Details" },
  { number: 3, label: "Reconnection Details" },
];

export default function TapReconnectionForm() {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('tapReconnectionFormStep');
    return saved ? parseInt(saved, 10) : 1;
  });
  
  const [rrNumber, setRrNumber] = useState(() => {
    const saved = localStorage.getItem('tapReconnectionRrNumber');
    return saved || "";
  });
  
  const [isRrVerified, setIsRrVerified] = useState(() => {
    const saved = localStorage.getItem('tapReconnectionRrVerified');
    return saved === 'true';
  });
  
  const [rrData, setRrData] = useState<RRData | null>(() => {
    const saved = localStorage.getItem('tapReconnectionRrData');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Step 2 form fields
  const [hasUGDConnection, setHasUGDConnection] = useState<string>("");
  
  // Step 3 form fields
  const [wantToChangeConnectionType, setWantToChangeConnectionType] = useState<string>("");
  const [newConnectionType, setNewConnectionType] = useState<string>("Commercial");
  const [wantDigiLocker, setWantDigiLocker] = useState<string>("");
  const [agreedToDeclaration, setAgreedToDeclaration] = useState(false);
  
  // Payment state
  const [isPaymentPaid, setIsPaymentPaid] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    serviceAppliedFor: "Tap Reconnection",
    paymentDate: "",
    orderNo: "",
    transactionNo: "",
    paymentStatus: "Success"
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reconnectionCharges] = useState({
    reconnectionFee: 500,
    inspectionFee: 200,
    serviceTax: 105,
    total: 805
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('tapReconnectionFormStep', currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem('tapReconnectionRrNumber', rrNumber);
  }, [rrNumber]);

  useEffect(() => {
    localStorage.setItem('tapReconnectionRrVerified', isRrVerified.toString());
  }, [isRrVerified]);

  useEffect(() => {
    if (rrData) {
      localStorage.setItem('tapReconnectionRrData', JSON.stringify(rrData));
    }
  }, [rrData]);

  const clearFormStorage = () => {
    localStorage.removeItem('tapReconnectionFormStep');
    localStorage.removeItem('tapReconnectionRrNumber');
    localStorage.removeItem('tapReconnectionRrVerified');
    localStorage.removeItem('tapReconnectionRrData');
  };

  const handleVerifyRrNumber = async () => {
    if (!rrNumber.trim()) {
      alert("Please enter RR Number");
      return;
    }
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-698be164/tap-reconnection/verify-rr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ rrNumber })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log("RR Number verified:", result.rrData);
        setIsRrVerified(true);
        setRrData(result.rrData);
        alert("RR Number verified successfully!");
      } else {
        console.error("Error verifying RR Number:", result.error);
        alert(`Error verifying RR Number: ${result.error}`);
      }
    } catch (error) {
      console.error("Error verifying RR Number:", error);
      alert(`Error verifying RR Number: ${error}`);
    }
  };

  const handlePayArrears = () => {
    // Simulate payment process
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const orderNo = Math.floor(100000 + Math.random() * 900000).toString();
    const transactionNo = Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
    
    setPaymentDetails({
      serviceAppliedFor: "Tap Reconnection",
      paymentDate: formattedDate,
      orderNo: orderNo,
      transactionNo: transactionNo,
      paymentStatus: "Success"
    });
    
    setIsPaymentPaid(true);
    alert("Payment Successful! ✓\n\nYour arrears payment has been processed.");
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!isRrVerified) {
        alert("Please verify RR Number before proceeding");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!isPaymentPaid) {
        alert("Please pay arrears before proceeding");
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    console.log("Previous clicked, current step:", currentStep);
    if (currentStep === 2) {
      setCurrentStep(1);
      console.log("Moving to step 1");
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      console.log("Moving to step:", currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isRrVerified || !rrData) {
      alert("Please verify RR Number before submitting");
      return;
    }

    if (!agreedToDeclaration) {
      alert("Please agree to the declaration before submitting");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const loggedInMobile = userData.phone || '';
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-698be164/tap-reconnection/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          rrNumber,
          citizenId: `CITIZEN-${loggedInMobile}`,
          rrData,
          charges: reconnectionCharges,
          hasUGDConnection,
          disconnectionDetails: {
            disconnectionReason: "Change of Residence",
            dateOfApproval: "10/10/2025"
          },
          arrearDetails: {
            currentDemand: 200,
            arrears: 150,
            totalBill: 350
          },
          paymentDetails: isPaymentPaid ? paymentDetails : null,
          wantToChangeConnectionType,
          newConnectionType: wantToChangeConnectionType === "yes" ? newConnectionType : null,
          reconnectionReason: "Due are cleared",
          applicationFees: 500,
          existingConnection: "Domestic",
          securityDeposit: 350,
          wantDigiLocker
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log("Reconnection application submitted:", result.applicationId);
        
        // Show confirmation popup
        const confirmationMessage = `✓ Request for Tap Reconnection Submitted Successfully!\n\n` +
          `Your application has been submitted to the Caseworker for review.\n\n` +
          `Application ID: ${result.applicationId}\n\n` +
          `You will be notified once the Caseworker reviews your application.`;
        
        alert(confirmationMessage);
        
        // Reset form
        setRrNumber("");
        setIsRrVerified(false);
        setRrData(null);
        setHasUGDConnection("");
        setWantToChangeConnectionType("");
        setNewConnectionType("Commercial");
        setWantDigiLocker("");
        setAgreedToDeclaration(false);
        setIsPaymentPaid(false);
        setCurrentStep(1);
        clearFormStorage();
      } else {
        console.error("Error submitting application:", result.error);
        alert(`Error submitting application: ${result.error}`);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert(`Error submitting application: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Tap Reconnection Request
            </h1>
            <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
              Apply for tap water reconnection service
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stepper */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold font-['Poppins',sans-serif] transition-all shadow-sm ${
                      currentStep === step.number
                        ? "bg-[#1f3a5f] text-white ring-4 ring-[#1f3a5f]/20"
                        : currentStep > step.number
                        ? "bg-[#4caf50] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <p
                      className={`text-[11px] font-semibold tracking-wider font-['Poppins',sans-serif] mb-1 ${
                        currentStep === step.number
                          ? "text-[#1f3a5f]"
                          : "text-gray-400"
                      }`}
                    >
                      STEP {step.number}
                    </p>
                    <p
                      className={`text-[13px] font-semibold font-['Poppins',sans-serif] ${
                        currentStep === step.number
                          ? "text-[#1f3a5f]"
                          : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-[2px] bg-gray-200 mx-6 -mt-16 relative">
                    <div 
                      className={`h-full transition-all ${
                        currentStep > step.number ? "bg-[#4caf50]" : "bg-gray-200"
                      }`}
                      style={{ width: currentStep > step.number ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Step 1: Application Details */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">
                  Application Details
                </h2>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
                  Enter your RR Number to fetch connection details
                </p>
              </div>

              {/* RR Number Input - Figma Design */}
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
                    onClick={handleVerifyRrNumber}
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
                    }}
                  >
                    Change RR Number
                  </GovButton>
                )}
              </div>

              {/* Fetched Data Summary */}
              {isRrVerified && rrData && (
                <>
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4">
                      Fetched Connection Details
                    </h3>
                    
                    {/* Applicant Details */}
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                        Applicant Details
                      </h4>
                      <div className="grid grid-cols-4 gap-x-8 gap-y-5 bg-white rounded-lg border border-gray-200 p-6">
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">District</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.district}</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">ULB</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.ulb}</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">ULB Type</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.ulbType}</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Authority Type</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.authorityType}</p>
                        </div>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                        Property Details
                      </h4>
                      <div className="grid grid-cols-4 gap-x-8 gap-y-5 bg-white rounded-lg border border-gray-200 p-6">
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Owner Name</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.ownerName}</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Door Number</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.doorNumber}</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Ward Number</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.wardNumber}</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Street</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.street}</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Address</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.address}</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">City</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.city}</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">District</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.propertyDistrict}</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">State</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.state}</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Pincode</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.pincode}</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Mobile No</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.mobileNo}</p>
                        </div>
                      </div>
                    </div>

                    {/* Connection Details */}
                    <div>
                      <h4 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                        Connection Details
                      </h4>
                      <div className="grid grid-cols-4 gap-x-8 gap-y-5 bg-white rounded-lg border border-gray-200 p-6">
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Connection Type</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.connectionType}</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Meter Category</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.meterCategory}</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Motor Status</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.motorStatus}</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Meter Installed Date</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.meterInstalledDate}</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Scheme Name</p>
                          <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{rrData.schemeName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Charges Details */}
          {currentStep === 2 && (
            <div className="space-y-8">
              {/* Application for Tap Reconnection Heading */}
              <div className="border-b border-[#DEE2E6] pb-4">
                <h2 className="text-[20px] font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  Application for Tap Reconnection
                </h2>
              </div>

              {/* UGD Connection Question */}
              <div className="space-y-3">
                <p className="text-[16px] font-medium text-[#170f49] font-['Poppins',sans-serif]">
                  Is there any UGD Connection Linked? <span className="text-[#ff5f57]">*</span>
                </p>
                <div className="flex gap-10">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ugdConnection"
                      value="yes"
                      checked={hasUGDConnection === "yes"}
                      onChange={(e) => setHasUGDConnection(e.target.value)}
                      className="w-5 h-5 accent-[#170f49]"
                    />
                    <span className="text-[18px] font-medium text-[#263238] font-['Poppins',sans-serif]">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ugdConnection"
                      value="no"
                      checked={hasUGDConnection === "no"}
                      onChange={(e) => setHasUGDConnection(e.target.value)}
                      className="w-5 h-5 accent-[#170f49]"
                    />
                    <span className="text-[18px] font-medium text-[#263238] font-['Poppins',sans-serif]">No</span>
                  </label>
                </div>
              </div>

              {/* Disconnection Details - Summary View */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                  Disconnection Details
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-5 bg-white rounded-lg border border-gray-200 p-6">
                  <div>
                    <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Disconnection Reason</p>
                    <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">Change of Residence</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Date of Approval</p>
                    <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">10/10/2025</p>
                  </div>
                </div>
              </div>

              {/* Current Arrear Details - Summary View */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                  Current Arrear Details
                </h3>
                <div className="grid grid-cols-3 gap-x-8 gap-y-5 bg-white rounded-lg border border-gray-200 p-6">
                  <div>
                    <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Current Demand</p>
                    <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">₹200</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Arrears</p>
                    <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">₹150</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Total Bill</p>
                    <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">₹350</p>
                  </div>
                </div>
              </div>

              {/* Payment Status - Summary View (shown after payment) */}
              {isPaymentPaid && (
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                    Payment Status
                  </h3>
                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                      <div>
                        <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Service Applied For <span className="text-[#ff5f57]">*</span></p>
                        <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{paymentDetails.serviceAppliedFor}</p>
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Payment Date <span className="text-[#ff5f57]">*</span></p>
                        <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{paymentDetails.paymentDate}</p>
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Order No <span className="text-[#ff5f57]">*</span></p>
                        <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{paymentDetails.orderNo}</p>
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Transaction No <span className="text-[#ff5f57]">*</span></p>
                        <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">{paymentDetails.transactionNo}</p>
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">Payment Status <span className="text-[#ff5f57]">*</span></p>
                        <p className="text-[14px] font-semibold text-[#4caf50] font-['Poppins',sans-serif]">{paymentDetails.paymentStatus}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reconnection Charges - Summary View */}
              
            </div>
          )}

          {/* Step 3: Reconnection Details */}
          {currentStep === 3 && (
            <div className="space-y-8">
              {/* Application for Tap Reconnection Heading */}
              <div className="border-b border-[#DEE2E6] pb-4">
                <h2 className="text-[24px] font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  Application for Tap Reconnection
                </h2>
              </div>

              {/* Reconnection Details Section */}
              <div className="space-y-6">
                <h3 className="text-[20px] font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  Reconnection Details
                </h3>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-5 bg-white rounded-lg border border-gray-200 p-6">
                  {/* Reconnection Reason - Summary View */}
                  <div>
                    <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">
                      Reconnection Reason <span className="text-[#ff5f57] font-bold">*</span>
                    </p>
                    <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">Due are cleared</p>
                  </div>

                  {/* Application Fees - Summary View */}
                  <div>
                    <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">
                      Application Fees <span className="text-[#ff5f57]">*</span>
                    </p>
                    <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">Rs.500</p>
                  </div>
                </div>
              </div>

              {/* Change Connection Type Question */}
              <div className="space-y-4">
                <p className="text-[18px] font-medium text-[#414141] font-['Poppins',sans-serif]">
                  Do you want to change the Connection Type? <span className="text-[#ff5f57]">*</span>
                </p>
                <div className="flex gap-10">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        {wantToChangeConnectionType === "yes" && (
                          <div className="w-3.5 h-3.5 rounded-full bg-[#170f49]" />
                        )}
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="changeConnectionType"
                      value="yes"
                      checked={wantToChangeConnectionType === "yes"}
                      onChange={(e) => setWantToChangeConnectionType(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-[18px] font-medium text-[#263238] font-['Poppins',sans-serif]">Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        {wantToChangeConnectionType === "no" && (
                          <div className="w-3.5 h-3.5 rounded-full bg-[#170f49]" />
                        )}
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="changeConnectionType"
                      value="no"
                      checked={wantToChangeConnectionType === "no"}
                      onChange={(e) => setWantToChangeConnectionType(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-[18px] font-medium text-[#263238] font-['Poppins',sans-serif]">No</span>
                  </label>
                </div>
              </div>

              {/* Current Arrears Details Section */}
              <div className="space-y-6">
                <h3 className="text-[18px] font-semibold text-[#414141] font-['Poppins',sans-serif]">
                  Current Arrears Details
                </h3>
                
                <div className="grid grid-cols-3 gap-x-8 gap-y-5 bg-white rounded-lg border border-gray-200 p-6">
                  {/* Existing Connection - Summary View */}
                  <div>
                    <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">
                      Existing Connection <span className="text-[#ff5f57] font-bold">*</span>
                    </p>
                    <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">Domestic</p>
                  </div>

                  {/* New Connection - Summary View */}
                  <div>
                    <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">
                      New Connection <span className="text-[#ff5f57]">*</span>
                    </p>
                    <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">Commercial</p>
                  </div>

                  {/* Security Deposit - Summary View */}
                  <div>
                    <p className="text-[12px] font-medium text-gray-500 font-['Poppins',sans-serif] mb-1.5">
                      Security Deposit
                    </p>
                    <p className="text-[14px] font-semibold text-[#170f49] font-['Poppins',sans-serif]">350</p>
                  </div>
                </div>
              </div>

              {/* Digi-locker Question */}
              <div className="space-y-4">
                <p className="text-[18px] font-medium text-[#414141] font-['Poppins',sans-serif]">
                  Do you want to save your document automatically in Digi-locker? <span className="text-[#ff5f57]">*</span>
                </p>
                <div className="flex gap-10">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        {wantDigiLocker === "yes" && (
                          <div className="w-3.5 h-3.5 rounded-full bg-[#170f49]" />
                        )}
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="digiLocker"
                      value="yes"
                      checked={wantDigiLocker === "yes"}
                      onChange={(e) => setWantDigiLocker(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-[18px] font-medium text-[#263238] font-['Poppins',sans-serif]">Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        {wantDigiLocker === "no" && (
                          <div className="w-3.5 h-3.5 rounded-full bg-[#170f49]" />
                        )}
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="digiLocker"
                      value="no"
                      checked={wantDigiLocker === "no"}
                      onChange={(e) => setWantDigiLocker(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-[18px] font-medium text-[#263238] font-['Poppins',sans-serif]">No</span>
                  </label>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#DEE2E6]"></div>

              {/* Declaration Checkbox */}
              <div className="flex items-start gap-3">
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    checked={agreedToDeclaration}
                    onChange={(e) => setAgreedToDeclaration(e.target.checked)}
                    className="w-6 h-6 rounded border-2 border-gray-300 accent-[#170f49] cursor-pointer"
                  />
                </div>
                <label className="text-[16px] font-medium text-[#414141] font-['Poppins',sans-serif] cursor-pointer">
                  I hereby declare that the information provided above is true and accurate to the best of my knowledge.
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6">
            <div>
              {currentStep > 1 && (
                <GovButton
                  variant="secondary"
                  onClick={handlePrevious}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </GovButton>
              )}
            </div>
            
            <div className="flex gap-3">
              {currentStep === 1 ? (
                isRrVerified && (
                  <GovButton
                    variant="primary"
                    onClick={handleNext}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </GovButton>
                )
              ) : currentStep === 2 ? (
                <GovButton
                  variant="primary"
                  onClick={isPaymentPaid ? handleNext : handlePayArrears}
                >
                  {isPaymentPaid ? "Next" : "Pay Arrears"}
                </GovButton>
              ) : (
                <GovButton
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </GovButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import SectionTitle from './SectionTitle';
import { GovInput } from "../ui/gov-input";
import { GovSelect } from "../ui/gov-select";
import { GovButton } from "../ui/gov-button";
import { GovRadio } from "../ui/gov-radio";
import { Check, ChevronLeft, ChevronRight, Info, IndianRupee, Zap } from "lucide-react";
import Frame1000001892 from "../../../imports/Frame1000001892";
import Frame1000001968 from "../../../imports/Frame1000001968";
import ApplicantDetailsStep from "./ApplicantDetailsStep";
import ConnectionDetailsStep from "./ConnectionDetailsStep";
import svgPaths from "../../../imports/svg-tguheetddh";
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { filterDigitsOnly, filterAlphaOnly, filterAddress } from "../../utils/validation";

// Hierarchical District → ULB data with ULB Type and Authority Type
const DISTRICT_ULB_DATA: Record<string, { value: string; label: string; ulbType: string; authorityType: string }[]> = {
  dharwad: [
    { value: "hubballi-dharwad", label: "Hubballi-Dharwad", ulbType: "City Corporation", authorityType: "Board" },
    { value: "annigeri", label: "Annigeri", ulbType: "City Municipal Corporation", authorityType: "Board" },
    { value: "navalgund", label: "Navalgund", ulbType: "City Municipal Corporation", authorityType: "Board" },
    { value: "alnavar", label: "Alnavar", ulbType: "Town Panchayat", authorityType: "Board" },
    { value: "kalghatgi", label: "Kalghatgi", ulbType: "Town Panchayat", authorityType: "Board" },
    { value: "kundgol", label: "Kundgol", ulbType: "Town Panchayat", authorityType: "Board" },
  ],
  "dakshina-kannada": [
    { value: "mangaluru", label: "Mangaluru", ulbType: "City Corporation", authorityType: "Board" },
    { value: "ullal", label: "Ullal", ulbType: "City Municipal Corporation", authorityType: "Board" },
    { value: "puttur", label: "Puttur", ulbType: "City Municipal Corporation", authorityType: "Board" },
    { value: "moodabidri", label: "Moodabidri", ulbType: "Town Municipal Corporation", authorityType: "Board" },
    { value: "bantwal", label: "Bantwal", ulbType: "Town Municipal Corporation", authorityType: "Board" },
    { value: "someshwar", label: "Someshwar", ulbType: "Town Municipal Corporation", authorityType: "Board" },
    { value: "mulki", label: "Mulki", ulbType: "Town Panchayat", authorityType: "Board" },
    { value: "kotekar", label: "Kotekar", ulbType: "Town Panchayat", authorityType: "Board" },
    { value: "vittla", label: "Vittla", ulbType: "Town Panchayat", authorityType: "Board" },
    { value: "belthangady", label: "Belthangady", ulbType: "Town Panchayat", authorityType: "Board" },
    { value: "sullia", label: "Sullia", ulbType: "Town Panchayat", authorityType: "Board" },
    { value: "sulya", label: "Sulya", ulbType: "Town Panchayat", authorityType: "Board" },
  ],
  "bangalore-rural": [
    { value: "nelamangala", label: "Nelamangala", ulbType: "City Municipal Council", authorityType: "Plumber" },
    { value: "devanahalli", label: "Devanahalli", ulbType: "Town Municipal Council", authorityType: "Plumber" },
    { value: "doddaballapura", label: "Doddaballapura", ulbType: "Town Municipal Council", authorityType: "Plumber" },
    { value: "hosakote", label: "Hosakote", ulbType: "Town Municipal Council", authorityType: "Plumber" },
  ],
  tumakuru: [
    { value: "tumakuru-city", label: "Tumakuru", ulbType: "City Corporation", authorityType: "Plumber" },
    { value: "tiptur", label: "Tiptur", ulbType: "City Municipal Council", authorityType: "Plumber" },
    { value: "madhugiri", label: "Madhugiri", ulbType: "Town Municipal Council", authorityType: "Plumber" },
    { value: "sira", label: "Sira", ulbType: "Town Municipal Council", authorityType: "Plumber" },
    { value: "kunigal", label: "Kunigal", ulbType: "Town Municipal Council", authorityType: "Plumber" },
  ],
};

// Karnataka Districts
const KARNATAKA_DISTRICTS = [
  { value: "bangalore-rural", label: "Bangalore Rural" },
  { value: "dakshina-kannada", label: "Dakshina Kannada" },
  { value: "dharwad", label: "Dharwad" },
  { value: "tumakuru", label: "Tumakuru" },
];

// ── ULB Metering Configuration ──────────────────────────────────────────────
// Determines whether a ULB uses metered or non-metered billing.
// Non-metered ULBs further specify 'upfront' (12-month advance) or 'monthly' billing.
interface ULBMeteringConfig {
  meterType: 'metered' | 'non-metered';
  nonMeterBillingMode?: 'upfront' | 'monthly';
}

const ULB_METERING_CONFIG: Record<string, ULBMeteringConfig> = {
  // Bangalore Rural District — Non-Metered (Upfront)
  "nelamangala":      { meterType: 'non-metered', nonMeterBillingMode: 'upfront' },
  "devanahalli":      { meterType: 'non-metered', nonMeterBillingMode: 'upfront' },
  "doddaballapura":   { meterType: 'non-metered', nonMeterBillingMode: 'upfront' },
  "hosakote":         { meterType: 'non-metered', nonMeterBillingMode: 'upfront' },
  // Tumakuru District — Non-Metered (Monthly)
  "tumakuru-city":    { meterType: 'non-metered', nonMeterBillingMode: 'monthly' },
  "tiptur":           { meterType: 'non-metered', nonMeterBillingMode: 'monthly' },
  "madhugiri":        { meterType: 'non-metered', nonMeterBillingMode: 'monthly' },
  "sira":             { meterType: 'non-metered', nonMeterBillingMode: 'monthly' },
  "kunigal":          { meterType: 'non-metered', nonMeterBillingMode: 'monthly' },
  // Dharwad & Dakshina Kannada — Metered (default)
};

// Slab rates for non-metered connections (ULB Admin defined)
const NON_METER_SLAB_RATES: Record<string, { label: string; rate: number }> = {
  domestic:       { label: "Domestic",     rate: 80 },
  commercial:     { label: "Commercial",   rate: 160 },
  "non-domestic": { label: "Non-Domestic", rate: 120 },
  industrial:     { label: "Industrial",   rate: 320 },
};

// Helper to get metering config for a ULB
function getULBMeteringConfig(ulbValue: string): ULBMeteringConfig {
  const config = ULB_METERING_CONFIG[ulbValue];
  if (config) return config;
  return { meterType: 'metered' };
}

const CONNECTION_TYPES = [
  { value: "metered", label: "Metered Connection" },
  { value: "non-metered", label: "Non-Metered Connection" },
];

const PROPERTY_TYPES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "institutional", label: "Institutional" },
];

const ULB_TYPES = [
  { value: "City Corporation", label: "City Corporation (CC)" },
  { value: "City Municipal Corporation", label: "City Municipal Corporation (CMP)" },
  { value: "City Municipal Council", label: "City Municipal Council (CMC)" },
  { value: "Town Municipal Corporation", label: "Town Municipal Corporation (TMC)" },
  { value: "Town Municipal Council", label: "Town Municipal Council (TMP)" },
  { value: "Town Panchayat", label: "Town Panchayat (TP)" },
];

interface FormData {
  // Step 1: Property Details
  district: string;
  ulb: string;
  authorityType: string;
  ulbType: string;
  ownershipType: string;
  
  // Step 2: Applicant Details
  existingRRNumber: string;
  meterCategory: string;
  connectionStatus: string;
  applicantName: string;
  doorNumber: string;
  wardNumber: string;
  street: string;
  address: string;
  state: string;
  districtApplicant: string;
  city: string;
  pincode: string;
  mobile: string;
  fatherName: string;
  email: string;
  aadharNumber: string;
  
  // Step 2: Communication Details (if different from applicant)
  communicationHouseDoorNo: string;
  communicationWardNo: string;
  communicationStreet: string;
  communicationAddress: string;
  communicationState: string;
  communicationDistrict: string;
  communicationCity: string;
  communicationPincode: string;
  
  // Step 3: Connection Details
  serviceAppliedFor: string;
  connectionType: string;
  propertyTypeCategory: string; // Apartment or Building
  flatsOrHouses: string;
  plumberType: string;
  firmName: string;
  plumberList: string;
}

const steps = [
  { id: 1, name: "Property Details", description: "Location and ownership information" },
  { id: 2, name: "Applicant Details", description: "Personal information" },
  { id: 3, name: "Connection Details", description: "Connection specifications" },
];

export default function NewTapConnectionForm() {
  const [currentStep, setCurrentStep] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('tapConnectionFormStep');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [propertyId, setPropertyId] = useState(() => {
    const saved = localStorage.getItem('tapConnectionPropertyId');
    return saved || "";
  });
  const [isPropertyVerified, setIsPropertyVerified] = useState(() => {
    const saved = localStorage.getItem('tapConnectionPropertyVerified');
    return saved === 'true';
  });
  const [verifiedPropertyData, setVerifiedPropertyData] = useState<any>(() => {
    const saved = localStorage.getItem('tapConnectionVerifiedPropertyData');
    return saved ? JSON.parse(saved) : null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressSameAsProperty, setAddressSameAsProperty] = useState(() => {
    const saved = localStorage.getItem('tapConnectionAddressSameAsProperty');
    return saved || "";
  });
  
  // Persist currentStep to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tapConnectionFormStep', currentStep.toString());
  }, [currentStep]);

  // Persist propertyId to localStorage
  useEffect(() => {
    localStorage.setItem('tapConnectionPropertyId', propertyId);
  }, [propertyId]);

  // Persist isPropertyVerified to localStorage
  useEffect(() => {
    localStorage.setItem('tapConnectionPropertyVerified', isPropertyVerified.toString());
  }, [isPropertyVerified]);

  // Persist verifiedPropertyData to localStorage
  useEffect(() => {
    if (verifiedPropertyData) {
      localStorage.setItem('tapConnectionVerifiedPropertyData', JSON.stringify(verifiedPropertyData));
    }
  }, [verifiedPropertyData]);

  // Persist addressSameAsProperty to localStorage
  useEffect(() => {
    localStorage.setItem('tapConnectionAddressSameAsProperty', addressSameAsProperty);
  }, [addressSameAsProperty]);

  const [formData, setFormData] = useState<FormData>(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('tapConnectionFormData');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      district: "",
      ulb: "",
      authorityType: "",
      ulbType: "",
      ownershipType: "",
      existingRRNumber: "",
      meterCategory: "",
      connectionStatus: "",
      applicantName: "",
      doorNumber: "",
      wardNumber: "",
      street: "",
      address: "",
      state: "",
      districtApplicant: "",
      city: "",
      pincode: "",
      mobile: "",
      fatherName: "",
      email: "",
      aadharNumber: "",
      communicationHouseDoorNo: "",
      communicationWardNo: "",
      communicationStreet: "",
      communicationAddress: "",
      communicationState: "",
      communicationDistrict: "",
      communicationCity: "",
      communicationPincode: "",
      serviceAppliedFor: "new-tap-connection",
      connectionType: "metered",
      propertyTypeCategory: "",
      flatsOrHouses: "",
      plumberType: "",
      firmName: "",
      plumberList: "",
    };
  });

  // Persist formData to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tapConnectionFormData', JSON.stringify(formData));
  }, [formData]);

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Function to clear all localStorage data
  const clearFormStorage = () => {
    localStorage.removeItem('tapConnectionFormData');
    localStorage.removeItem('tapConnectionFormStep');
    localStorage.removeItem('tapConnectionPropertyId');
    localStorage.removeItem('tapConnectionPropertyVerified');
    localStorage.removeItem('tapConnectionVerifiedPropertyData');
    localStorage.removeItem('tapConnectionAddressSameAsProperty');
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Handle cascading resets for district → ULB Type → ULB → Authority Type
    if (field === "district") {
      setFormData(prev => ({
        ...prev,
        district: value,
        ulb: "",
        ulbType: "",
        authorityType: "",
      }));
      if (errors.district) {
        setErrors(prev => ({ ...prev, district: undefined, ulb: undefined, ulbType: undefined, authorityType: undefined }));
      }
      return;
    }

    if (field === "ulbType") {
      // When ULB Type changes, reset ULB and Authority Type (cascade)
      setFormData(prev => ({
        ...prev,
        ulbType: value,
        ulb: "",
        authorityType: "",
      }));
      if (errors.ulbType) {
        setErrors(prev => ({ ...prev, ulbType: undefined, ulb: undefined, authorityType: undefined }));
      }
      return;
    }

    if (field === "ulb") {
      // Look up the selected ULB's data to auto-populate both ULB Type and Authority Type
      const ulbList = DISTRICT_ULB_DATA[formData.district] || [];
      const selectedUlb = ulbList.find(u => u.value === value);
      setFormData(prev => ({
        ...prev,
        ulb: value,
        ulbType: selectedUlb ? selectedUlb.ulbType : prev.ulbType,
        authorityType: selectedUlb ? selectedUlb.authorityType : "",
      }));
      if (errors.ulb) {
        setErrors(prev => ({ ...prev, ulb: undefined, ulbType: undefined, authorityType: undefined }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      if (!formData.district) newErrors.district = "Please select a district";
      if (!formData.ulb) newErrors.ulb = "Please select a ULB";
      if (!formData.ownershipType) newErrors.ownershipType = "Please select ownership type";
      
      // Check if property is verified
      if (!isPropertyVerified) {
        alert("Please verify the property before proceeding to the next step.");
        return false;
      }
    } else if (step === 2) {
      if (!formData.applicantName) newErrors.applicantName = "Please enter applicant name";
      if (!formData.doorNumber) newErrors.doorNumber = "Please enter door number";
      if (!formData.wardNumber) newErrors.wardNumber = "Please enter ward number";
      if (!formData.street) newErrors.street = "Please enter street name";
      if (!formData.address) newErrors.address = "Please enter address";
      if (!formData.state) newErrors.state = "Please enter state";
      if (!formData.districtApplicant) newErrors.districtApplicant = "Please enter district";
      if (!formData.city) newErrors.city = "Please enter city";
      if (!formData.pincode) newErrors.pincode = "Please enter pincode";
      else if (!/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = "Pincode must be 6 digits";
      }
      if (!formData.mobile) newErrors.mobile = "Please enter mobile number";
      else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
        newErrors.mobile = "Please enter a valid 10-digit mobile number";
      }
      
      // Validate address confirmation selection
      if (!addressSameAsProperty) {
        alert("Please select whether Premises Details and Communication Details are the same");
        return false;
      }
      
      // Validate communication details if "No" is selected
      if (addressSameAsProperty === "no") {
        if (!formData.communicationHouseDoorNo) {
          newErrors.communicationHouseDoorNo = "Please enter house/door number";
        }
        if (!formData.communicationWardNo) {
          newErrors.communicationWardNo = "Please enter ward number";
        }
        if (!formData.communicationStreet) {
          newErrors.communicationStreet = "Please enter street name";
        }
        if (!formData.communicationAddress) {
          newErrors.communicationAddress = "Please enter address";
        }
        if (!formData.communicationState) {
          newErrors.communicationState = "Please enter state";
        }
        if (!formData.communicationDistrict) {
          newErrors.communicationDistrict = "Please enter district";
        }
        if (!formData.communicationCity) {
          newErrors.communicationCity = "Please enter city";
        }
        if (!formData.communicationPincode) {
          newErrors.communicationPincode = "Please enter pincode";
        } else if (!/^\d{6}$/.test(formData.communicationPincode)) {
          newErrors.communicationPincode = "Pincode must be 6 digits";
        }
      }
    } else if (step === 3) {
      if (!formData.serviceAppliedFor) newErrors.serviceAppliedFor = "Please select service applied for";
      if (!formData.connectionType) newErrors.connectionType = "Please select connection type";
      if (!formData.propertyTypeCategory) newErrors.propertyTypeCategory = "Please select property type category";
      if (!formData.flatsOrHouses) newErrors.flatsOrHouses = "Please enter number of flats/houses";
      if (!formData.plumberType) newErrors.plumberType = "Please select plumber type";
      if (formData.plumberType === "contractor" && !formData.firmName) newErrors.firmName = "Please select firm name";
      if (formData.plumberType === "individual" && !formData.plumberList) newErrors.plumberList = "Please select at least one plumber";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get logged-in user data to use the correct citizenId
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const loggedInMobile = userData.phone || formData.mobile;
      
      console.log('Submitting application with mobile:', loggedInMobile);
      console.log('User data:', userData);
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-698be164/tap-connection/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          // Property Details (Step 1)
          district: formData.district,
          ulb: formData.ulb,
          authorityType: formData.authorityType,
          ulbType: formData.ulbType,
          ownershipType: formData.ownershipType,
          propertyId: propertyId,
          verifiedPropertyData: verifiedPropertyData,
          
          // Applicant Details (Step 2)
          applicantName: formData.applicantName,
          fatherName: formData.fatherName || '',
          mobile: loggedInMobile, // Use logged-in user's phone number for citizenId
          email: formData.email || '',
          aadharNumber: formData.aadharNumber || '',
          address: formData.address,
          
          // Connection Details (Step 3) - Map frontend fields to backend fields
          propertyType: formData.connectionType, // Usage category: domestic, commercial, non-domestic, industrial
          connectionType: (() => {
            const mc = formData.ulb ? getULBMeteringConfig(formData.ulb) : null;
            return (mc && mc.meterType === 'non-metered') ? 'Non-Metered' : 'Metered';
          })(),
          nonMeterBillingMode: (() => {
            const mc = formData.ulb ? getULBMeteringConfig(formData.ulb) : null;
            if (mc && mc.meterType === 'non-metered' && mc.nonMeterBillingMode) {
              return mc.nonMeterBillingMode; // 'upfront' or 'monthly'
            }
            return '';
          })(),
          plotNumber: formData.doorNumber || '',
          surveyNumber: propertyId || '',
          propertyAddress: formData.address || '',
          pincode: formData.pincode || ''
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log("Application submitted successfully:", result.applicationId);
        alert(`Application submitted successfully!\n\nApplication ID: ${result.applicationId}\n\nYour application has been submitted to the plumber for review.`);
        
        // Reset form
        setFormData({
          district: "",
          ulb: "",
          authorityType: "",
          ulbType: "",
          ownershipType: "",
          existingRRNumber: "",
          meterCategory: "",
          connectionStatus: "",
          applicantName: "",
          doorNumber: "",
          wardNumber: "",
          street: "",
          address: "",
          state: "",
          districtApplicant: "",
          city: "",
          pincode: "",
          mobile: "",
          fatherName: "",
          email: "",
          aadharNumber: "",
          communicationHouseDoorNo: "",
          communicationWardNo: "",
          communicationStreet: "",
          communicationAddress: "",
          communicationState: "",
          communicationDistrict: "",
          communicationCity: "",
          communicationPincode: "",
          serviceAppliedFor: "new-tap-connection",
          connectionType: "metered",
          propertyTypeCategory: "",
          flatsOrHouses: "",
          plumberType: "",
          firmName: "",
          plumberList: "",
        });
        setPropertyId("");
        setIsPropertyVerified(false);
        setVerifiedPropertyData(null);
        setCurrentStep(1);
        setErrors({});
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

  const handleVerifyProperty = async () => {
    if (!propertyId.trim()) {
      alert("Please enter Property ID/Khata No/Survey No");
      return;
    }
    
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-698be164/tap-connection/verify-property`;
    console.log('[VERIFY] Calling:', url, 'with propertyId:', propertyId);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ propertyId })
      });
      
      console.log('[VERIFY] Response status:', response.status);
      const result = await response.json();
      console.log('[VERIFY] Response body:', result);
      
      if (result.success) {
        console.log("Property verified:", result.propertyData);
        setIsPropertyVerified(true);
        setVerifiedPropertyData(result.propertyData);
        alert("Property verified successfully!");
      } else {
        console.error("Error verifying property:", result.error);
        alert(`Error verifying property: ${result.error}`);
      }
    } catch (error) {
      console.error("[VERIFY] Network/fetch error:", error);
      alert(`Error verifying property: ${error}\n\nThis may be a temporary network issue. Please try again.`);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div>
          <SectionTitle title="New Tap Connection Application" className="mb-2" />
          <p className="text-gray-600 font-['Poppins',sans-serif]">
            Complete the form in 3 simple steps to apply for a new water tap connection
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="relative flex items-start justify-between px-[30px] py-[0px]">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-start" style={{ width: index === steps.length - 1 ? 'auto' : '100%' }}>
              <div className="flex items-center w-full">
                {/* Step Circle */}
                <div className="relative z-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold font-['Poppins',sans-serif] text-base transition-all duration-300 ${
                      currentStep > step.id
                        ? "bg-[#10b981] text-white"
                        : currentStep === step.id
                        ? "bg-[#1f3a5f] text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-6 h-6 stroke-[2.5]" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-[2px] mx-4">
                    <div
                      className={`h-full transition-all duration-300 ${
                        currentStep > step.id ? "bg-[#10b981]" : "bg-gray-300"
                      }`}
                    />
                  </div>
                )}
              </div>
              
              {/* Step Label */}
              <div className="mt-3" style={{ maxWidth: '300' }}>
                <p
                  className={`text-sm font-semibold font-['Poppins',sans-serif] whitespace-nowrap text-center ${
                    currentStep >= step.id ? "text-[#1f3a5f]" : "text-gray-500"
                  }`}
                >
                  {step.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-8">
          {/* Step 1: Property Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">
                  Property Details
                </h2>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
                  Provide information about the property location and ownership
                </p>
              </div>

              <div className="grid grid-cols-4 gap-6">
                <GovSelect
                  label="District"
                  required
                  placeholder="Select District"
                  options={KARNATAKA_DISTRICTS}
                  value={formData.district}
                  onValueChange={(value) => handleInputChange("district", value)}
                  error={errors.district}
                />

                <GovSelect
                  label="ULB"
                  required
                  placeholder="Select ULB"
                  options={DISTRICT_ULB_DATA[formData.district] || []}
                  value={formData.ulb}
                  onValueChange={(value) => handleInputChange("ulb", value)}
                  error={errors.ulb}
                />

                <GovInput
                  label="ULB Type"
                  placeholder="Auto-populated from ULB"
                  value={formData.ulbType ? (ULB_TYPES.find(t => t.value === formData.ulbType) || { label: formData.ulbType }).label : ""}
                  onChange={() => {}}
                  disabled
                />

                <GovInput
                  label="Authority Type"
                  placeholder="Auto-populated from ULB"
                  value={formData.authorityType}
                  onChange={(e) => handleInputChange("authorityType", e.target.value)}
                  disabled
                />
              </div>

              <div className="pt-2">
                <GovRadio
                  label="Ownership Type"
                  required
                  name="ownershipType"
                  options={[
                    { value: "owner", label: "Owner" },
                    { value: "tenant", label: "Tenant" },
                  ]}
                  value={formData.ownershipType}
                  onChange={(value) => handleInputChange("ownershipType", value)}
                  error={errors.ownershipType}
                />
              </div>

              {/* ── Metering Configuration Info Panel ── */}
              {formData.ulb && (() => {
                const meteringConfig = getULBMeteringConfig(formData.ulb);
                const ulbList = DISTRICT_ULB_DATA[formData.district] || [];
                const selectedUlb = ulbList.find(u => u.value === formData.ulb);
                const ulbLabel = selectedUlb ? selectedUlb.label : formData.ulb;
                const districtEntry = KARNATAKA_DISTRICTS.find(d => d.value === formData.district);
                const districtLabel = districtEntry ? districtEntry.label : formData.district;

                if (meteringConfig.meterType === 'metered') {
                  return null;
                }

                // Non-metered
                const billingMode = meteringConfig.nonMeterBillingMode || 'monthly';
                const isUpfront = billingMode === 'upfront';

                return (
                  null
                );
              })()}

              {/* Verification of Property */}
              <div className="pt-4">
                <Frame1000001892 
                  propertyId={propertyId}
                  onPropertyIdChange={setPropertyId}
                  onVerify={handleVerifyProperty}
                />
              </div>

              {/* Property Details - Show after verification */}
              {isPropertyVerified && (
                <div className="pt-6 border-t border-gray-200">
                  <Frame1000001968 />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Applicant Details */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <ApplicantDetailsStep
                formData={formData}
                onInputChange={handleInputChange}
                errors={errors}
              />

              {/* Address Confirmation */}
              <div className="content-stretch flex flex-col gap-[16px] items-start relative">
                <div className="flex flex-col font-['Poppins',sans-serif] justify-center leading-[0] not-italic text-[#414141] text-[18px]">
                  <p className="font-medium whitespace-pre-wrap">
                    <span className="leading-[normal]">Is Premises Details and Communication Details are Same? </span>
                    <span className="leading-[normal] text-[#f44336]">*</span>
                  </p>
                </div>
                <div className="content-stretch flex gap-[40px] items-center">
                  {/* Yes Option */}
                  <div
                    className="content-stretch flex gap-[6px] items-center cursor-pointer"
                    onClick={() => setAddressSameAsProperty("yes")}
                  >
                    <div className="flex items-center justify-center relative shrink-0 w-[24px] h-[24px]">
                      <div 
                        className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-all ${
                          addressSameAsProperty === "yes" 
                            ? "border-[#1f3a5f] bg-white" 
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {addressSameAsProperty === "yes" && (
                          <div className="w-[10px] h-[10px] rounded-full bg-[#1f3a5f]" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col font-['Poppins',sans-serif] justify-center leading-[0] not-italic shrink-0 text-[#263238] text-[18px] whitespace-nowrap">
                      <p className="leading-[1.2] font-medium">Yes</p>
                    </div>
                  </div>

                  {/* No Option */}
                  <div
                    className="content-stretch flex gap-[6px] items-center cursor-pointer"
                    onClick={() => setAddressSameAsProperty("no")}
                  >
                    <div className="flex items-center justify-center relative shrink-0 w-[24px] h-[24px]">
                      <div 
                        className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-all ${
                          addressSameAsProperty === "no" 
                            ? "border-[#1f3a5f] bg-white" 
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {addressSameAsProperty === "no" && (
                          <div className="w-[10px] h-[10px] rounded-full bg-[#1f3a5f]" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col font-['Poppins',sans-serif] justify-center leading-[0] not-italic shrink-0 text-[#263238] text-[18px] whitespace-nowrap">
                      <p className="leading-[1.2] font-medium">No</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Communication Details - Show when "No" is selected */}
              {addressSameAsProperty === "no" && (
                <>
                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">
                        Communication Details
                      </h2>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
                        Provide separate communication details
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <GovInput
                        label="House/Door No"
                        required
                        placeholder="Enter house/door number"
                        value={formData.communicationHouseDoorNo}
                        onChange={(e) => handleInputChange("communicationHouseDoorNo", filterAddress(e.target.value))}
                        error={errors.communicationHouseDoorNo}
                        maxLength={20}
                      />

                      <GovInput
                        label="Ward Number"
                        required
                        placeholder="Enter ward number"
                        value={formData.communicationWardNo}
                        onChange={(e) => handleInputChange("communicationWardNo", filterDigitsOnly(e.target.value))}
                        error={errors.communicationWardNo}
                        maxLength={3}
                        inputMode="numeric"
                      />

                      <GovInput
                        label="Street Name"
                        required
                        placeholder="Enter street name"
                        value={formData.communicationStreet}
                        onChange={(e) => handleInputChange("communicationStreet", filterAddress(e.target.value))}
                        error={errors.communicationStreet}
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                        Address <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        placeholder="Enter complete communication address"
                        value={formData.communicationAddress}
                        onChange={(e) => handleInputChange("communicationAddress", e.target.value)}
                        rows={3}
                        className={`w-full px-4 py-2.5 font-['Poppins',sans-serif] text-[14px] text-gray-900 bg-white border-[1.5px] rounded-md placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] hover:border-gray-400 ${
                          errors.communicationAddress ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.communicationAddress && (
                        <p className="mt-1.5 text-[13px] text-red-600 font-['Poppins',sans-serif]">
                          {errors.communicationAddress}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <GovInput
                        label="State"
                        required
                        placeholder="Enter state"
                        value={formData.communicationState}
                        onChange={(e) => handleInputChange("communicationState", filterAlphaOnly(e.target.value))}
                        error={errors.communicationState}
                        maxLength={50}
                      />

                      <GovInput
                        label="District"
                        required
                        placeholder="Enter district"
                        value={formData.communicationDistrict}
                        onChange={(e) => handleInputChange("communicationDistrict", filterAlphaOnly(e.target.value))}
                        error={errors.communicationDistrict}
                        maxLength={50}
                      />

                      <GovInput
                        label="City"
                        required
                        placeholder="Enter city"
                        value={formData.communicationCity}
                        onChange={(e) => handleInputChange("communicationCity", filterAlphaOnly(e.target.value))}
                        error={errors.communicationCity}
                        maxLength={50}
                      />

                      <GovInput
                        label="Pincode"
                        required
                        type="text"
                        placeholder="Enter 6-digit pincode"
                        value={formData.communicationPincode}
                        onChange={(e) => handleInputChange("communicationPincode", filterDigitsOnly(e.target.value))}
                        error={errors.communicationPincode}
                        maxLength={6}
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Connection Details */}
          {currentStep === 3 && (
            <ConnectionDetailsStep
              formData={formData}
              onInputChange={handleInputChange}
              errors={errors}
              meteringConfig={formData.ulb ? getULBMeteringConfig(formData.ulb) : null}
              slabRates={NON_METER_SLAB_RATES}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-between rounded-b-lg">
          <div>
            {currentStep > 1 && (
              <GovButton
                variant="outline"
                onClick={handleBack}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </GovButton>
            )}
          </div>
          <div className="flex gap-3">
            <GovButton
              variant="ghost"
              onClick={() => {
                if (confirm("Are you sure you want to cancel? All progress will be lost.")) {
                  setFormData({
                    district: "",
                    ulb: "",
                    authorityType: "",
                    ulbType: "",
                    ownershipType: "",
                    existingRRNumber: "",
                    meterCategory: "",
                    connectionStatus: "",
                    applicantName: "",
                    doorNumber: "",
                    wardNumber: "",
                    street: "",
                    address: "",
                    state: "",
                    districtApplicant: "",
                    city: "",
                    pincode: "",
                    mobile: "",
                    fatherName: "",
                    email: "",
                    aadharNumber: "",
                    communicationHouseDoorNo: "",
                    communicationWardNo: "",
                    communicationStreet: "",
                    communicationAddress: "",
                    communicationState: "",
                    communicationDistrict: "",
                    communicationCity: "",
                    communicationPincode: "",
                    serviceAppliedFor: "new-tap-connection",
                    connectionType: "metered",
                    propertyTypeCategory: "",
                    flatsOrHouses: "",
                    plumberType: "",
                    firmName: "",
                    plumberList: "",
                  });
                  setCurrentStep(1);
                  setErrors({});
                  clearFormStorage();
                }
              }}
            >
              Cancel
            </GovButton>
            {currentStep < 3 ? (
              <GovButton
                variant="primary"
                onClick={handleNext}
                className="gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </GovButton>
            ) : (
              <GovButton
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </GovButton>
            )}
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 font-['Poppins',sans-serif]">
          <strong>Note:</strong> Make sure all the information provided is accurate. You can save your progress and return later to complete the application.
        </p>
      </div>
    </div>
  );
}
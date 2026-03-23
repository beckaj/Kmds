import { useState, useEffect } from "react";
import { GovInput } from "../ui/gov-input";
import { GovSelect } from "../ui/gov-select";
import { GovButton } from "../ui/gov-button";
import { GovRadio } from "../ui/gov-radio";
import { Upload, FileText, CheckCircle2, X, AlertCircle, ClipboardList, ClipboardCheck, Info } from "lucide-react";
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import {
  filterDigitsOnly,
  filterAlphaOnly,
  filterAddress,
  filterAlphanumeric,
  filterEmail,
  validateEmail,
  validatePAN,
  validateGST,
} from "../../utils/validation";

// Karnataka Districts
const KARNATAKA_DISTRICTS = [
  { value: "dharwad", label: "Dharwad" },
  { value: "dakshina-kannada", label: "Dakshina Kannada" },
];

// Hierarchical District → ULB data
const DISTRICT_ULB_DATA: Record<string, { value: string; label: string }[]> = {
  dharwad: [
    { value: "hubballi-dharwad", label: "Hubballi-Dharwad" },
    { value: "annigeri", label: "Annigeri" },
    { value: "navalgund", label: "Navalgund" },
  ],
  "dakshina-kannada": [
    { value: "mangaluru", label: "Mangaluru" },
    { value: "ullal", label: "Ullal" },
    { value: "puttur", label: "Puttur" },
  ],
};

const QUALIFICATION_OPTIONS = [
  { value: "iti", label: "ITI" },
  { value: "diploma", label: "Diploma in Plumbing" },
  { value: "certificate", label: "Certificate Course" },
  { value: "bsc", label: "B.Sc. (Plumbing Technology)" },
  { value: "experience-based", label: "Experience Based" },
];

const EXPERIENCE_OPTIONS = [
  { value: "1", label: "1 Year" },
  { value: "2", label: "2 Years" },
  { value: "3", label: "3 Years" },
  { value: "4", label: "4 Years" },
  { value: "5", label: "5 Years" },
  { value: "6-10", label: "6-10 Years" },
  { value: "10+", label: "10+ Years" },
];

const FIRM_TYPE_OPTIONS = [
  { value: "private-limited", label: "Private Limited" },
  { value: "public-limited", label: "Public Limited" },
  { value: "partnership", label: "Partnership" },
  { value: "sole-proprietorship", label: "Sole Proprietorship" },
  { value: "llp", label: "LLP" },
];

const TALUK_OPTIONS: Record<string, { value: string; label: string }[]> = {
  dharwad: [
    { value: "hubballi", label: "Hubballi" },
    { value: "dharwad", label: "Dharwad" },
    { value: "navalgund", label: "Navalgund" },
    { value: "kundgol", label: "Kundgol" },
  ],
  "dakshina-kannada": [
    { value: "mangaluru", label: "Mangaluru" },
    { value: "bantwal", label: "Bantwal" },
    { value: "puttur", label: "Puttur" },
    { value: "sullia", label: "Sullia" },
  ],
};

interface PlumberFormData {
  // Basic Information
  district: string;
  ulb: string;
  financialYear: string;
  registrationFees: string;
  // Personal Details
  plumberName: string;
  addressDistrict: string;
  city: string;
  street: string;
  wardNo: string;
  pincode: string;
  mobileNumber: string;
  qualification: string;
  yearOfExperience: string;
}

interface ContractorFormData {
  // ULB Information
  district: string;
  ulb: string;
  financialYear: string;
  registrationFees: string;
  // Contractors Information
  firmName: string;
  typeOfFirm: string;
  officeAddress: string;
  contDistrict: string;
  taluk: string;
  pincode: string;
  mobileNumber: string;
  emailId: string;
  panNumber: string;
  gstNumber: string;
  // Authorized Person Details
  authFullName: string;
  authDesignation: string;
  authMobile: string;
  authEmail: string;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

export default function PlumberRegistrationForm() {
  const [registrationType, setRegistrationType] = useState<string>(() => {
    const saved = localStorage.getItem('plumberReg_type');
    return saved || "";
  });

  // Detect if user is an existing licensed plumber
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isExistingPlumber = userData && userData.isPlumber === true;
  const existingLicense = userData && userData.plumberLicense ? userData.plumberLicense : '';
  const plumberUserName = userData && userData.name ? userData.name : '';

  const [formData, setFormData] = useState<PlumberFormData>(() => {
    const saved = localStorage.getItem('plumberReg_formData');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      district: "",
      ulb: "",
      financialYear: "2025-2026",
      registrationFees: "1000",
      plumberName: "",
      addressDistrict: "",
      city: "",
      street: "",
      wardNo: "",
      pincode: "",
      mobileNumber: "",
      qualification: "",
      yearOfExperience: "",
    };
  });

  const CONTRACTOR_INITIAL: ContractorFormData = {
    district: "", ulb: "", financialYear: "2025-2026", registrationFees: "1000",
    firmName: "", typeOfFirm: "", officeAddress: "", contDistrict: "", taluk: "",
    pincode: "", mobileNumber: "", emailId: "", panNumber: "", gstNumber: "",
    authFullName: "", authDesignation: "", authMobile: "", authEmail: "",
  };

  const [contFormData, setContFormData] = useState<ContractorFormData>(() => {
    const saved = localStorage.getItem('plumberReg_contFormData');
    return saved ? JSON.parse(saved) : CONTRACTOR_INITIAL;
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PlumberFormData, string>>>({});
  const [contErrors, setContErrors] = useState<Partial<Record<keyof ContractorFormData, string>>>({});
  const [aadharDocument, setAadharDocument] = useState<UploadedFile | null>(() => {
    const saved = localStorage.getItem('plumberReg_aadhar');
    return saved ? JSON.parse(saved) : null;
  });
  const [experienceLetter, setExperienceLetter] = useState<UploadedFile | null>(() => {
    const saved = localStorage.getItem('plumberReg_experience');
    return saved ? JSON.parse(saved) : null;
  });
  const [contSupportingDoc, setContSupportingDoc] = useState<UploadedFile | null>(() => {
    const saved = localStorage.getItem('plumberReg_contSupporting');
    return saved ? JSON.parse(saved) : null;
  });
  const [contAadharDoc, setContAadharDoc] = useState<UploadedFile | null>(() => {
    const saved = localStorage.getItem('plumberReg_contAadhar');
    return saved ? JSON.parse(saved) : null;
  });
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string>("");

  // Pre-fill mobile number from user data
  useEffect(() => {
    if (userData && userData.phone && !formData.mobileNumber) {
      setFormData(prev => ({ ...prev, mobileNumber: userData.phone }));
    }
    if (userData && userData.phone && !contFormData.mobileNumber) {
      setContFormData(prev => ({ ...prev, mobileNumber: userData.phone, authMobile: userData.phone }));
    }
    // Pre-fill plumber name for existing licensed plumbers
    if (isExistingPlumber && plumberUserName && !formData.plumberName) {
      setFormData(prev => ({ ...prev, plumberName: plumberUserName }));
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('plumberReg_type', registrationType);
  }, [registrationType]);

  useEffect(() => {
    localStorage.setItem('plumberReg_formData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (aadharDocument) {
      localStorage.setItem('plumberReg_aadhar', JSON.stringify(aadharDocument));
    }
  }, [aadharDocument]);

  useEffect(() => {
    if (experienceLetter) {
      localStorage.setItem('plumberReg_experience', JSON.stringify(experienceLetter));
    }
  }, [experienceLetter]);

  useEffect(() => {
    localStorage.setItem('plumberReg_contFormData', JSON.stringify(contFormData));
  }, [contFormData]);

  useEffect(() => {
    if (contSupportingDoc) {
      localStorage.setItem('plumberReg_contSupporting', JSON.stringify(contSupportingDoc));
    }
  }, [contSupportingDoc]);

  useEffect(() => {
    if (contAadharDoc) {
      localStorage.setItem('plumberReg_contAadhar', JSON.stringify(contAadharDoc));
    }
  }, [contAadharDoc]);

  const handleInputChange = (field: keyof PlumberFormData, value: string) => {
    if (field === "district") {
      setFormData(prev => ({
        ...prev,
        district: value,
        ulb: "",
      }));
      if (errors.district) {
        setErrors(prev => ({ ...prev, district: undefined, ulb: undefined }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleContInputChange = (field: keyof ContractorFormData, value: string) => {
    if (field === "district") {
      setContFormData(prev => ({ ...prev, district: value, ulb: "" }));
      if (contErrors.district) {
        setContErrors(prev => ({ ...prev, district: undefined, ulb: undefined }));
      }
      return;
    }
    if (field === "contDistrict") {
      setContFormData(prev => ({ ...prev, contDistrict: value, taluk: "" }));
      if (contErrors.contDistrict) {
        setContErrors(prev => ({ ...prev, contDistrict: undefined, taluk: undefined }));
      }
      return;
    }
    setContFormData(prev => ({ ...prev, [field]: value }));
    if (contErrors[field]) {
      setContErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleContFileUpload = (type: 'supporting' | 'aadhar') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target && target.files && target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const uploadedFile: UploadedFile = {
          name: file.name, size: file.size, type: file.type, dataUrl: reader.result as string,
        };
        if (type === 'supporting') {
          setContSupportingDoc(uploadedFile);
        } else {
          setContAadharDoc(uploadedFile);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleFileUpload = (type: 'aadhar' | 'experience') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target && target.files && target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const uploadedFile: UploadedFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: reader.result as string,
        };
        if (type === 'aadhar') {
          setAadharDocument(uploadedFile);
        } else {
          setExperienceLetter(uploadedFile);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const validateContractorForm = (): boolean => {
    const e: Partial<Record<keyof ContractorFormData, string>> = {};
    if (!contFormData.district) e.district = "District is required";
    if (!contFormData.ulb) e.ulb = "ULB is required";
    if (!contFormData.firmName.trim()) e.firmName = "Firm name is required";
    if (!contFormData.typeOfFirm) e.typeOfFirm = "Type of firm is required";
    if (!contFormData.officeAddress.trim()) e.officeAddress = "Office address is required";
    if (!contFormData.contDistrict) e.contDistrict = "District is required";
    if (!contFormData.taluk) e.taluk = "Taluk is required";
    if (!contFormData.pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(contFormData.pincode)) e.pincode = "Pincode must be exactly 6 digits";
    else if (/^0/.test(contFormData.pincode)) e.pincode = "Pincode cannot start with 0";
    if (!contFormData.mobileNumber.trim()) e.mobileNumber = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(contFormData.mobileNumber)) e.mobileNumber = "Enter a valid 10-digit mobile number starting with 6-9";
    if (!contFormData.emailId.trim()) e.emailId = "Email ID is required";
    else { const emailErr = validateEmail(contFormData.emailId); if (emailErr) e.emailId = emailErr; }
    if (!contFormData.authFullName.trim()) e.authFullName = "Full name is required";
    if (!contFormData.authDesignation.trim()) e.authDesignation = "Designation is required";
    if (!contFormData.authMobile.trim()) e.authMobile = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(contFormData.authMobile)) e.authMobile = "Enter a valid 10-digit mobile number";
    if (!contFormData.authEmail.trim()) e.authEmail = "Email ID is required";
    else { const aEmailErr = validateEmail(contFormData.authEmail); if (aEmailErr) e.authEmail = aEmailErr; }
    setContErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContractorSubmit = async () => {
    if (!validateContractorForm()) return;
    if (!contSupportingDoc) { alert("Please upload Supporting Document"); return; }
    if (!contAadharDoc) { alert("Please upload Aadhar Document"); return; }
    if (!declarationAccepted) { alert("Please accept the declaration to proceed"); return; }

    setIsSubmitting(true);
    try {
      const citizenId = userData && userData.phone ? userData.phone : '';
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({
          registrationType: 'contractor',
          ...contFormData,
          citizenId,
          applicantName: contFormData.firmName,
          documents: {
            supportingDoc: { name: contSupportingDoc.name, size: contSupportingDoc.size, type: contSupportingDoc.type },
            aadhar: { name: contAadharDoc.name, size: contAadharDoc.size, type: contAadharDoc.type },
          },
        })
      });
      const result = await response.json();
      if (result && result.success) {
        setSubmitSuccess(true);
        setSubmittedAppId(result.applicationId || "");
        clearFormStorage();
      } else {
        const errorMsg = result && result.error ? result.error : 'Unknown error';
        console.error("Error submitting contractor registration:", errorMsg);
        alert("Error submitting registration: " + errorMsg);
      }
    } catch (error) {
      console.error("Error submitting contractor registration:", error);
      alert("Error submitting registration: " + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PlumberFormData, string>> = {};

    if (!formData.district) newErrors.district = "District is required";
    if (!formData.ulb) newErrors.ulb = "ULB is required";
    if (!formData.plumberName.trim()) newErrors.plumberName = "Plumber name is required";
    if (!formData.addressDistrict.trim()) newErrors.addressDistrict = "District is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.street.trim()) newErrors.street = "Street is required";
    if (!formData.wardNo.trim()) newErrors.wardNo = "Ward No is required";
    else if (!/^\d{1,3}$/.test(formData.wardNo)) newErrors.wardNo = "Ward number must be 1 to 3 digits";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Pincode must be exactly 6 digits";
    else if (/^0/.test(formData.pincode)) newErrors.pincode = "Pincode cannot start with 0";
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) newErrors.mobileNumber = "Enter a valid 10-digit mobile number starting with 6-9";
    if (!formData.qualification) newErrors.qualification = "Qualification is required";
    if (!formData.yearOfExperience) newErrors.yearOfExperience = "Year of experience is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!aadharDocument) {
      alert("Please upload Aadhar Document");
      return;
    }

    if (!experienceLetter) {
      alert("Please upload Experience Letter");
      return;
    }

    if (!declarationAccepted) {
      alert("Please accept the declaration to proceed");
      return;
    }

    setIsSubmitting(true);

    try {
      const citizenId = userData && userData.phone ? userData.phone : '';

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          registrationType,
          ...formData,
          citizenId,
          applicantName: userData && userData.name ? userData.name : formData.plumberName,
          documents: {
            aadhar: {
              name: aadharDocument.name,
              size: aadharDocument.size,
              type: aadharDocument.type,
            },
            experienceLetter: {
              name: experienceLetter.name,
              size: experienceLetter.size,
              type: experienceLetter.type,
            },
          },
        })
      });

      const result = await response.json();

      if (result && result.success) {
        console.log("Plumber registration submitted:", result.applicationId);
        setSubmitSuccess(true);
        setSubmittedAppId(result.applicationId || "");
        clearFormStorage();
      } else {
        const errorMsg = result && result.error ? result.error : 'Unknown error';
        console.error("Error submitting registration:", errorMsg);
        alert("Error submitting registration: " + errorMsg);
      }
    } catch (error) {
      console.error("Error submitting plumber registration:", error);
      alert("Error submitting registration: " + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFormStorage = () => {
    localStorage.removeItem('plumberReg_type');
    localStorage.removeItem('plumberReg_formData');
    localStorage.removeItem('plumberReg_aadhar');
    localStorage.removeItem('plumberReg_experience');
    localStorage.removeItem('plumberReg_contFormData');
    localStorage.removeItem('plumberReg_contSupporting');
    localStorage.removeItem('plumberReg_contAadhar');
  };

  const handleReset = () => {
    setRegistrationType("");
    setFormData({
      district: "",
      ulb: "",
      financialYear: "2025-2026",
      registrationFees: "1000",
      plumberName: "",
      addressDistrict: "",
      city: "",
      street: "",
      wardNo: "",
      pincode: "",
      mobileNumber: "",
      qualification: "",
      yearOfExperience: "",
    });
    setContFormData(CONTRACTOR_INITIAL);
    setAadharDocument(null);
    setExperienceLetter(null);
    setContSupportingDoc(null);
    setContAadharDoc(null);
    setDeclarationAccepted(false);
    setErrors({});
    setContErrors({});
    setSubmitSuccess(false);
    setSubmittedAppId("");
    clearFormStorage();
  };

  // Success screen
  if (submitSuccess) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-6">
            Registration Submitted Successfully
          </h1>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Application Submitted!
            </h2>
            <p className="text-gray-600 font-['Poppins',sans-serif] mb-2 text-lg">
              Your Plumber License Registration has been submitted successfully.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 mb-6 inline-block">
              <p className="text-sm text-blue-700 font-['Poppins',sans-serif]">
                Application ID: <span className="font-bold font-mono text-[#1f3a5f]">{submittedAppId}</span>
              </p>
            </div>
            <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-8 max-w-lg">
              Your application has been forwarded to the Caseworker for verification. You can track the status of your application from the Application Status page.
            </p>
            <div className="flex gap-4">
              <GovButton variant="primary" onClick={handleReset}>
                Submit Another Application
              </GovButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
          Plumber License - New Registration
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Apply for a new plumber license registration under the Department of Municipal Administration
        </p>
      </div>

      {/* Existing Plumber Info Banner */}
      {isExistingPlumber && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">
                Additional License Registration
              </h3>
              <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed mb-2">
                You already hold an active plumber license{existingLicense ? ' (' + existingLicense + ')' : ''}. You can apply for an additional license to operate in a different ULB jurisdiction. Please select a different District and ULB from your existing license.
              </p>
              <div className="flex items-center gap-4 text-[12.5px] font-['Poppins',sans-serif]">
                <span className="text-gray-500">Name: <span className="font-semibold text-[#1f3a5f]">{plumberUserName || 'N/A'}</span></span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500">Existing License: <span className="font-semibold text-[#1f3a5f]">{existingLicense || 'N/A'}</span></span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500">Mobile: <span className="font-semibold text-[#1f3a5f]">{userData && userData.phone ? userData.phone : 'N/A'}</span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Type Selection Card */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <ClipboardList className="w-5 h-5 text-[#1f3a5f]" />
          <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
            Registration Type
          </h2>
        </div>
        <div>
          <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-4">
            Please select the type of registration you want to apply for:
          </p>
          <GovRadio
            name="registrationType"
            label="Do you want to register as:"
            required
            options={[
              { value: "individual", label: "Individual Plumber" },
              { value: "contractor", label: "Contractor" },
            ]}
            value={registrationType}
            onChange={(val) => setRegistrationType(val)}
          />
        </div>
      </div>

      {/* Contractor - Coming Soon */}
      {registrationType === "contractor" && (
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
            Contractor Registration Form
          </h2>

          <div className="space-y-8">
            {/* ====== ULB Information Section ====== */}
            <div>
              <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                ULB Information
              </h3>
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                  <GovSelect
                    label="District"
                    required
                    placeholder="Select District"
                    options={KARNATAKA_DISTRICTS}
                    value={contFormData.district}
                    onValueChange={(value) => handleContInputChange("district", value)}
                    error={contErrors.district}
                  />
                  <GovSelect
                    label="ULB"
                    required
                    placeholder="Select ULB"
                    options={contFormData.district && DISTRICT_ULB_DATA[contFormData.district] ? DISTRICT_ULB_DATA[contFormData.district] : DISTRICT_ULB_DATA["dharwad"]}
                    value={contFormData.ulb}
                    onValueChange={(value) => handleContInputChange("ulb", value)}
                    error={contErrors.ulb}
                  />
                  <GovInput
                    label="Financial Year"
                    required
                    value={contFormData.financialYear}
                    disabled
                  />
                  <GovInput
                    label="Registration Fees (in Rs.)"
                    required
                    value={contFormData.registrationFees}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* ====== Contractors Information Section ====== */}
            <div>
              <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                Contractors Information
              </h3>
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                  <GovInput
                    label="Firm Name"
                    required
                    placeholder="Enter firm name"
                    value={contFormData.firmName}
                    onChange={(e) => handleContInputChange("firmName", e.target.value)}
                    error={contErrors.firmName}
                  />
                  <GovSelect
                    label="Type of Firm"
                    required
                    placeholder="Select Type"
                    options={FIRM_TYPE_OPTIONS}
                    value={contFormData.typeOfFirm}
                    onValueChange={(value) => handleContInputChange("typeOfFirm", value)}
                    error={contErrors.typeOfFirm}
                  />
                  <GovInput
                    label="Office Address"
                    required
                    placeholder="Enter office address"
                    value={contFormData.officeAddress}
                    onChange={(e) => handleContInputChange("officeAddress", e.target.value)}
                    error={contErrors.officeAddress}
                  />
                  <GovSelect
                    label="District"
                    required
                    placeholder="Select District"
                    options={KARNATAKA_DISTRICTS}
                    value={contFormData.contDistrict}
                    onValueChange={(value) => handleContInputChange("contDistrict", value)}
                    error={contErrors.contDistrict}
                  />
                  <GovSelect
                    label="Taluk"
                    required
                    placeholder="Select Taluk"
                    options={contFormData.contDistrict && TALUK_OPTIONS[contFormData.contDistrict] ? TALUK_OPTIONS[contFormData.contDistrict] : []}
                    value={contFormData.taluk}
                    onValueChange={(value) => handleContInputChange("taluk", value)}
                    error={contErrors.taluk}
                    disabled={!contFormData.contDistrict}
                  />
                  <GovInput
                    label="Pincode"
                    required
                    placeholder="Enter pincode"
                    value={contFormData.pincode}
                    onChange={(e) => handleContInputChange("pincode", filterDigitsOnly(e.target.value))}
                    error={contErrors.pincode}
                    maxLength={6}
                    inputMode="numeric"
                  />
                  <GovInput
                    label="Mobile Number"
                    required
                    placeholder="Enter mobile number"
                    value={contFormData.mobileNumber}
                    onChange={(e) => handleContInputChange("mobileNumber", filterDigitsOnly(e.target.value))}
                    error={contErrors.mobileNumber}
                    maxLength={10}
                    inputMode="numeric"
                  />
                  <GovInput
                    label="Email ID"
                    required
                    placeholder="Enter email"
                    value={contFormData.emailId}
                    onChange={(e) => handleContInputChange("emailId", filterEmail(e.target.value))}
                    error={contErrors.emailId}
                  />
                  <GovInput
                    label="PAN Number"
                    required
                    placeholder="Enter PAN number"
                    value={contFormData.panNumber}
                    onChange={(e) => handleContInputChange("panNumber", e.target.value.toUpperCase())}
                    maxLength={10}
                  />
                  <GovInput
                    label="GST Number"
                    required
                    placeholder="Enter GST number"
                    value={contFormData.gstNumber}
                    onChange={(e) => handleContInputChange("gstNumber", e.target.value.toUpperCase())}
                    maxLength={15}
                  />
                  <div>
                    <p className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif] mb-3">
                      Supporting Doc <span className="text-red-600">*</span>
                    </p>
                    {contSupportingDoc ? (
                      <div className="flex items-center gap-3 bg-white border border-green-300 rounded-lg px-4 py-3">
                        <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 font-['Poppins',sans-serif] truncate">
                            {contSupportingDoc.name}
                          </p>
                          <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                            {(contSupportingDoc.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <button
                          onClick={() => { setContSupportingDoc(null); localStorage.removeItem('plumberReg_contSupporting'); }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <GovButton variant="primary" size="sm" onClick={() => handleContFileUpload('supporting')}>
                        <Upload className="w-4 h-4" />
                        Upload Document
                      </GovButton>
                    )}
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1.5">
                      PDF, JPG, PNG (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ====== Authorized Person Details Section ====== */}
            <div>
              <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                Authorized Person Details
              </h3>
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                  <GovInput
                    label="Full Name"
                    required
                    placeholder="Enter full name"
                    value={contFormData.authFullName}
                    onChange={(e) => handleContInputChange("authFullName", e.target.value)}
                    error={contErrors.authFullName}
                  />
                  <GovInput
                    label="Designation"
                    required
                    placeholder="Enter designation"
                    value={contFormData.authDesignation}
                    onChange={(e) => handleContInputChange("authDesignation", e.target.value)}
                    error={contErrors.authDesignation}
                  />
                  <GovInput
                    label="Mobile Number"
                    required
                    placeholder="Enter mobile number"
                    value={contFormData.authMobile}
                    onChange={(e) => handleContInputChange("authMobile", filterDigitsOnly(e.target.value))}
                    error={contErrors.authMobile}
                    maxLength={10}
                    inputMode="numeric"
                  />
                  <GovInput
                    label="Email ID"
                    required
                    placeholder="Enter email"
                    value={contFormData.authEmail}
                    onChange={(e) => handleContInputChange("authEmail", filterEmail(e.target.value))}
                    error={contErrors.authEmail}
                  />
                  <div>
                    <p className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif] mb-3">
                      Aadhar Document <span className="text-red-600">*</span>
                    </p>
                    {contAadharDoc ? (
                      <div className="flex items-center gap-3 bg-white border border-green-300 rounded-lg px-4 py-3">
                        <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 font-['Poppins',sans-serif] truncate">
                            {contAadharDoc.name}
                          </p>
                          <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                            {(contAadharDoc.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <button
                          onClick={() => { setContAadharDoc(null); localStorage.removeItem('plumberReg_contAadhar'); }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <GovButton variant="primary" size="sm" onClick={() => handleContFileUpload('aadhar')}>
                        <Upload className="w-4 h-4" />
                        Upload Document
                      </GovButton>
                    )}
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1.5">
                      PDF, JPG, PNG (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ====== Declaration Section ====== */}
            <div>
              <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Declaration
              </h3>
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="contractor-declaration"
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    className="w-5 h-5 mt-0.5 accent-[#1f3a5f] cursor-pointer shrink-0"
                  />
                  <label htmlFor="contractor-declaration" className="cursor-pointer">
                    <p className="text-[14px] font-medium text-[#263238] font-['Poppins',sans-serif] leading-relaxed">
                      I declare that the information provided is true and correct. I understand that false information may lead to rejection or cancellation of my license. I agree to abide by the rules of the Department of Municipal Administration, Govt. of Karnataka. <span className="text-red-600">*</span>
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

            {/* ====== Action Buttons ====== */}
            <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-200">
              <GovButton
                variant="primary"
                size="lg"
                onClick={handleContractorSubmit}
                loading={isSubmitting}
                disabled={isSubmitting || !declarationAccepted}
              >
                Submit
              </GovButton>
              <GovButton
                variant="outline"
                size="lg"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Cancel
              </GovButton>
            </div>
          </div>
        </div>
      )}

      {/* Individual Plumber Registration Form */}
      {registrationType === "individual" && (
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
            Individual Plumber Registration Form
          </h2>

          <div className="space-y-8">
            {/* ====== Basic Information Section ====== */}
            <div>
              <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                Basic Information
              </h3>
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-3 gap-x-8 gap-y-5">
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
                    options={formData.district && DISTRICT_ULB_DATA[formData.district] ? DISTRICT_ULB_DATA[formData.district] : DISTRICT_ULB_DATA["dharwad"]}
                    value={formData.ulb}
                    onValueChange={(value) => handleInputChange("ulb", value)}
                    error={errors.ulb}
                  />

                  <GovInput
                    label="Financial Year"
                    required
                    value={formData.financialYear}
                    disabled
                  />

                  <GovInput
                    label="Registration Fees (in Rs.)"
                    required
                    value={formData.registrationFees}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* ====== Personal Details Section ====== */}
            <div>
              <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                Personal Details
              </h3>
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                  <GovInput
                    label="Plumber Name"
                    required
                    placeholder="Enter full name"
                    value={formData.plumberName}
                    onChange={(e) => handleInputChange("plumberName", filterAlphaOnly(e.target.value))}
                    error={errors.plumberName}
                    maxLength={100}
                  />

                  <GovSelect
                    label="District"
                    required
                    placeholder="Select District"
                    options={KARNATAKA_DISTRICTS}
                    value={formData.addressDistrict}
                    onValueChange={(value) => handleInputChange("addressDistrict", value)}
                    error={errors.addressDistrict}
                  />

                  <GovInput
                    label="City"
                    required
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", filterAlphaOnly(e.target.value))}
                    error={errors.city}
                    maxLength={50}
                  />

                  <GovInput
                    label="Street"
                    required
                    placeholder="Enter street"
                    value={formData.street}
                    onChange={(e) => handleInputChange("street", filterAddress(e.target.value))}
                    error={errors.street}
                    maxLength={100}
                  />

                  <GovInput
                    label="Ward No"
                    required
                    placeholder="Enter ward number"
                    value={formData.wardNo}
                    onChange={(e) => handleInputChange("wardNo", filterDigitsOnly(e.target.value))}
                    error={errors.wardNo}
                    maxLength={3}
                    inputMode="numeric"
                  />

                  <GovInput
                    label="Pincode"
                    required
                    placeholder="Enter pincode"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange("pincode", filterDigitsOnly(e.target.value))}
                    error={errors.pincode}
                    maxLength={6}
                    inputMode="numeric"
                  />

                  <GovInput
                    label="Mobile Number"
                    required
                    placeholder="Enter mobile number"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange("mobileNumber", filterDigitsOnly(e.target.value))}
                    error={errors.mobileNumber}
                    maxLength={10}
                    inputMode="numeric"
                  />

                  <GovSelect
                    label="Qualification"
                    required
                    placeholder="Select Qualification"
                    options={QUALIFICATION_OPTIONS}
                    value={formData.qualification}
                    onValueChange={(value) => handleInputChange("qualification", value)}
                    error={errors.qualification}
                  />

                  <GovSelect
                    label="Year of Experience"
                    required
                    placeholder="Select Experience"
                    options={EXPERIENCE_OPTIONS}
                    value={formData.yearOfExperience}
                    onValueChange={(value) => handleInputChange("yearOfExperience", value)}
                    error={errors.yearOfExperience}
                  />
                </div>
              </div>
            </div>

            {/* ====== Upload Documents Section ====== */}
            <div>
              <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                Upload Documents
              </h3>
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  {/* Aadhar Document */}
                  <div>
                    <p className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif] mb-3">
                      Aadhar Document <span className="text-red-600">*</span>
                    </p>
                    {aadharDocument ? (
                      <div className="flex items-center gap-3 bg-white border border-green-300 rounded-lg px-4 py-3">
                        <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 font-['Poppins',sans-serif] truncate">
                            {aadharDocument.name}
                          </p>
                          <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                            {(aadharDocument.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <button
                          onClick={() => {
                            setAadharDocument(null);
                            localStorage.removeItem('plumberReg_aadhar');
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <GovButton
                        variant="primary"
                        size="sm"
                        onClick={() => handleFileUpload('aadhar')}
                      >
                        <Upload className="w-4 h-4" />
                        Upload Document
                      </GovButton>
                    )}
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1.5">
                      Accepted formats: PDF, JPG, PNG (Max 5MB)
                    </p>
                  </div>

                  {/* Experience Letter */}
                  <div>
                    <p className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif] mb-3">
                      Experience Letter <span className="text-red-600">*</span>
                    </p>
                    {experienceLetter ? (
                      <div className="flex items-center gap-3 bg-white border border-green-300 rounded-lg px-4 py-3">
                        <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 font-['Poppins',sans-serif] truncate">
                            {experienceLetter.name}
                          </p>
                          <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                            {(experienceLetter.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <button
                          onClick={() => {
                            setExperienceLetter(null);
                            localStorage.removeItem('plumberReg_experience');
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <GovButton
                        variant="primary"
                        size="sm"
                        onClick={() => handleFileUpload('experience')}
                      >
                        <Upload className="w-4 h-4" />
                        Upload Document
                      </GovButton>
                    )}
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1.5">
                      Accepted formats: PDF, JPG, PNG (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ====== Declaration Section ====== */}
            <div>
              <h3 className="text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Declaration
              </h3>
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="plumber-declaration"
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    className="w-5 h-5 mt-0.5 accent-[#1f3a5f] cursor-pointer shrink-0"
                  />
                  <label htmlFor="plumber-declaration" className="cursor-pointer">
                    <p className="text-[14px] font-medium text-[#263238] font-['Poppins',sans-serif] leading-relaxed">
                      I declare that the information provided is true and correct. I understand that false information may lead to rejection or cancellation of my license. I agree to abide by the rules of the Department of Municipal Administration, Govt. of Karnataka. <span className="text-red-600">*</span>
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

            {/* ====== Action Buttons ====== */}
            <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-200">
              <GovButton
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting || !declarationAccepted}
              >
                Submit
              </GovButton>
              <GovButton
                variant="outline"
                size="lg"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Cancel
              </GovButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
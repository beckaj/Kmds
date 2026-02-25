import { useState } from "react";
import { GovInput } from "../ui/gov-input";
import { GovSelect } from "../ui/gov-select";
import { GovButton } from "../ui/gov-button";
import { Upload, FileText, CheckCircle2, X, AlertCircle, ChevronLeft, Send, RotateCcw, ClipboardCheck } from "lucide-react";
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

// Karnataka Districts
const KARNATAKA_DISTRICTS = [
  { value: "dharwad", label: "Dharwad" },
  { value: "dakshina-kannada", label: "Dakshina Kannada" },
];

// Hierarchical District -> ULB data
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

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

interface PlumberLicenseResubmitFormProps {
  application: any;
  onBack: () => void;
  onSuccess: () => void;
}

export default function PlumberLicenseResubmitForm({ application, onBack, onSuccess }: PlumberLicenseResubmitFormProps) {
  const isIndividual = application && application.registrationType !== 'contractor';

  // Sendback info
  const sendBackInfo = application && application.workflow && application.workflow.sendBack ? application.workflow.sendBack : null;
  const sentBackByLabel = sendBackInfo && sendBackInfo.sentBackByLabel ? sendBackInfo.sentBackByLabel : 'Reviewer';
  const sendBackComment = sendBackInfo && sendBackInfo.comment ? sendBackInfo.comment : '';
  const sendBackTimestamp = sendBackInfo && sendBackInfo.timestamp ? sendBackInfo.timestamp : '';

  // Individual form data - pre-filled from application
  const [formData, setFormData] = useState({
    district: application && application.district ? application.district : '',
    ulb: application && application.ulb ? application.ulb : '',
    financialYear: application && application.financialYear ? application.financialYear : '2025-2026',
    registrationFees: application && application.registrationFees ? application.registrationFees : '1000',
    plumberName: application && application.plumberName ? application.plumberName : '',
    addressDistrict: application && application.addressDistrict ? application.addressDistrict : '',
    city: application && application.city ? application.city : '',
    street: application && application.street ? application.street : '',
    wardNo: application && application.wardNo ? application.wardNo : '',
    pincode: application && application.pincode ? application.pincode : '',
    mobileNumber: application && application.mobileNumber ? application.mobileNumber : '',
    qualification: application && application.qualification ? application.qualification : '',
    yearOfExperience: application && application.yearOfExperience ? application.yearOfExperience : '',
  });

  // Contractor form data - pre-filled from application
  const [contFormData, setContFormData] = useState({
    district: application && application.district ? application.district : '',
    ulb: application && application.ulb ? application.ulb : '',
    financialYear: application && application.financialYear ? application.financialYear : '2025-2026',
    registrationFees: application && application.registrationFees ? application.registrationFees : '1000',
    firmName: application && application.firmName ? application.firmName : '',
    typeOfFirm: application && application.typeOfFirm ? application.typeOfFirm : '',
    officeAddress: application && application.officeAddress ? application.officeAddress : '',
    contDistrict: application && application.contDistrict ? application.contDistrict : '',
    taluk: application && application.taluk ? application.taluk : '',
    pincode: application && application.pincode ? application.pincode : '',
    mobileNumber: application && application.mobileNumber ? application.mobileNumber : '',
    emailId: application && application.emailId ? application.emailId : '',
    panNumber: application && application.panNumber ? application.panNumber : '',
    gstNumber: application && application.gstNumber ? application.gstNumber : '',
    authFullName: application && application.authFullName ? application.authFullName : '',
    authDesignation: application && application.authDesignation ? application.authDesignation : '',
    authMobile: application && application.authMobile ? application.authMobile : '',
    authEmail: application && application.authEmail ? application.authEmail : '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [routedTo, setRoutedTo] = useState('');

  // Document states - existing docs from application
  const existingDocs = application && application.documents ? application.documents : {};
  const [aadharDocument, setAadharDocument] = useState<UploadedFile | null>(null);
  const [experienceLetter, setExperienceLetter] = useState<UploadedFile | null>(null);
  const [contSupportingDoc, setContSupportingDoc] = useState<UploadedFile | null>(null);
  const [contAadharDoc, setContAadharDoc] = useState<UploadedFile | null>(null);

  // Track if user wants to keep existing docs
  const [keepExistingAadhar, setKeepExistingAadhar] = useState(true);
  const [keepExistingExperience, setKeepExistingExperience] = useState(true);
  const [keepExistingContSupporting, setKeepExistingContSupporting] = useState(true);
  const [keepExistingContAadhar, setKeepExistingContAadhar] = useState(true);

  const handleInputChange = (field: string, value: string) => {
    if (field === "district") {
      setFormData(prev => ({ ...prev, district: value, ulb: "" }));
      if (errors.district) {
        setErrors(prev => ({ ...prev, district: '', ulb: '' }));
      }
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContInputChange = (field: string, value: string) => {
    if (field === "district") {
      setContFormData(prev => ({ ...prev, district: value, ulb: "" }));
      if (errors.district) {
        setErrors(prev => ({ ...prev, district: '', ulb: '' }));
      }
      return;
    }
    if (field === "contDistrict") {
      setContFormData(prev => ({ ...prev, contDistrict: value, taluk: "" }));
      if (errors.contDistrict) {
        setErrors(prev => ({ ...prev, contDistrict: '', taluk: '' }));
      }
      return;
    }
    setContFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (type: 'aadhar' | 'experience' | 'contSupporting' | 'contAadhar') => {
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
          setKeepExistingAadhar(false);
        } else if (type === 'experience') {
          setExperienceLetter(uploadedFile);
          setKeepExistingExperience(false);
        } else if (type === 'contSupporting') {
          setContSupportingDoc(uploadedFile);
          setKeepExistingContSupporting(false);
        } else if (type === 'contAadhar') {
          setContAadharDoc(uploadedFile);
          setKeepExistingContAadhar(false);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const validateIndividualForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.district) e.district = "District is required";
    if (!formData.ulb) e.ulb = "ULB is required";
    if (!formData.plumberName.trim()) e.plumberName = "Plumber name is required";
    if (!formData.addressDistrict.trim()) e.addressDistrict = "District is required";
    if (!formData.city.trim()) e.city = "City is required";
    if (!formData.street.trim()) e.street = "Street is required";
    if (!formData.wardNo.trim()) e.wardNo = "Ward No is required";
    if (!formData.pincode.trim()) e.pincode = "Pincode is required";
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) e.pincode = "Enter valid 6-digit pincode";
    if (!formData.mobileNumber.trim()) e.mobileNumber = "Mobile number is required";
    if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) e.mobileNumber = "Enter valid 10-digit mobile number";
    if (!formData.qualification) e.qualification = "Qualification is required";
    if (!formData.yearOfExperience) e.yearOfExperience = "Year of experience is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateContractorForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!contFormData.district) e.district = "District is required";
    if (!contFormData.ulb) e.ulb = "ULB is required";
    if (!contFormData.firmName.trim()) e.firmName = "Firm name is required";
    if (!contFormData.typeOfFirm) e.typeOfFirm = "Type of firm is required";
    if (!contFormData.officeAddress.trim()) e.officeAddress = "Office address is required";
    if (!contFormData.contDistrict) e.contDistrict = "District is required";
    if (!contFormData.taluk) e.taluk = "Taluk is required";
    if (!contFormData.pincode.trim()) e.pincode = "Pincode is required";
    if (contFormData.pincode && !/^\d{6}$/.test(contFormData.pincode)) e.pincode = "Enter valid 6-digit pincode";
    if (!contFormData.mobileNumber.trim()) e.mobileNumber = "Mobile number is required";
    if (contFormData.mobileNumber && !/^\d{10}$/.test(contFormData.mobileNumber)) e.mobileNumber = "Enter valid 10-digit mobile";
    if (!contFormData.emailId.trim()) e.emailId = "Email ID is required";
    if (!contFormData.panNumber.trim()) e.panNumber = "PAN number is required";
    if (!contFormData.gstNumber.trim()) e.gstNumber = "GST number is required";
    if (!contFormData.authFullName.trim()) e.authFullName = "Full name is required";
    if (!contFormData.authDesignation.trim()) e.authDesignation = "Designation is required";
    if (!contFormData.authMobile.trim()) e.authMobile = "Mobile number is required";
    if (!contFormData.authEmail.trim()) e.authEmail = "Email ID is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleResubmit = async () => {
    const valid = isIndividual ? validateIndividualForm() : validateContractorForm();
    if (!valid) return;

    if (!declarationAccepted) {
      alert("Please accept the declaration to proceed");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build updated fields
      let updatedFields: Record<string, any> = {};

      if (isIndividual) {
        updatedFields = { ...formData };
        // Include updated documents if re-uploaded
        const documents: Record<string, any> = {};
        if (!keepExistingAadhar && aadharDocument) {
          documents.aadhar = { name: aadharDocument.name, size: aadharDocument.size, type: aadharDocument.type };
        } else if (existingDocs && existingDocs.aadhar) {
          documents.aadhar = existingDocs.aadhar;
        }
        if (!keepExistingExperience && experienceLetter) {
          documents.experienceLetter = { name: experienceLetter.name, size: experienceLetter.size, type: experienceLetter.type };
        } else if (existingDocs && existingDocs.experienceLetter) {
          documents.experienceLetter = existingDocs.experienceLetter;
        }
        updatedFields.documents = documents;
        updatedFields.applicantName = formData.plumberName;
      } else {
        updatedFields = { ...contFormData };
        const documents: Record<string, any> = {};
        if (!keepExistingContSupporting && contSupportingDoc) {
          documents.supportingDoc = { name: contSupportingDoc.name, size: contSupportingDoc.size, type: contSupportingDoc.type };
        } else if (existingDocs && existingDocs.supportingDoc) {
          documents.supportingDoc = existingDocs.supportingDoc;
        }
        if (!keepExistingContAadhar && contAadharDoc) {
          documents.aadhar = { name: contAadharDoc.name, size: contAadharDoc.size, type: contAadharDoc.type };
        } else if (existingDocs && existingDocs.aadhar) {
          documents.aadhar = existingDocs.aadhar;
        }
        updatedFields.documents = documents;
        updatedFields.applicantName = contFormData.firmName;
      }

      console.log('[PLUMBER RESUBMIT] Submitting resubmit for:', application.id, 'updatedFields:', JSON.stringify(updatedFields).substring(0, 500));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/citizen/resubmit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            applicationId: application.id,
            updatedFields,
          }),
        }
      );

      const result = await response.json();
      console.log('[PLUMBER RESUBMIT] Response:', JSON.stringify(result));

      if (result && result.success) {
        setSubmitSuccess(true);
        setRoutedTo(result.routedTo || 'Reviewer');
      } else {
        const errorMsg = result && result.error ? result.error : 'Unknown error';
        console.error('[PLUMBER RESUBMIT] Error:', errorMsg);
        alert('Error resubmitting application: ' + errorMsg);
      }
    } catch (error) {
      console.error('[PLUMBER RESUBMIT] Error:', error);
      alert('Error resubmitting application: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Build remarks entries for the send-back history
  const buildSendBackRemarks = (): RemarkEntry[] => {
    const remarks: RemarkEntry[] = [];
    // Previous send-backs (from previous cycles)
    const prevSendBacks = application && application.workflow && application.workflow.previousSendBacks ? application.workflow.previousSendBacks : [];
    prevSendBacks.forEach((sb: any) => {
      if (sb && sb.comment) {
        remarks.push({
          role: sb.sentBackByLabel || 'Reviewer',
          comment: sb.comment,
          timestamp: sb.timestamp || '',
          variant: 'sent_back' as const,
        });
      }
    });
    // Current send-back
    if (sendBackComment) {
      remarks.push({
        role: sentBackByLabel,
        comment: sendBackComment,
        timestamp: sendBackTimestamp,
        variant: 'sent_back' as const,
      });
    }
    // Also include any caseworker/FE/commissioner comments from workflow
    if (application && application.caseworkerComments) {
      const cwTimestamp = application.workflow && application.workflow.caseworker && application.workflow.caseworker.timestamp ? application.workflow.caseworker.timestamp : '';
      remarks.push({ role: 'Caseworker', comment: application.caseworkerComments, timestamp: cwTimestamp });
    }
    if (application && application.workflow && application.workflow.fieldEngineer && application.workflow.fieldEngineer.comment) {
      remarks.push({ role: 'Field Engineer', comment: application.workflow.fieldEngineer.comment, timestamp: application.workflow.fieldEngineer.timestamp || '' });
    }
    return remarks;
  };

  // Success screen
  if (submitSuccess) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-6">
            Application Resubmitted Successfully
          </h1>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Corrections Submitted!
            </h2>
            <p className="text-gray-600 font-['Poppins',sans-serif] mb-2 text-lg">
              Your corrected application has been resubmitted successfully.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 mb-4 inline-block">
              <p className="text-sm text-blue-700 font-['Poppins',sans-serif]">
                Application ID: <span className="font-bold font-mono text-[#1f3a5f]">{application.id}</span>
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-3 mb-6 inline-block">
              <p className="text-sm text-green-700 font-['Poppins',sans-serif]">
                Routed back to: <span className="font-bold">{routedTo}</span> for re-review
              </p>
            </div>
            <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-8 max-w-lg">
              Your application has been sent back to the {routedTo} who originally requested corrections.
              You can track the updated status from the Application Status page.
            </p>
            <div className="flex gap-4">
              <GovButton variant="primary" onClick={onSuccess}>
                Back to Application Status
              </GovButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render existing doc info
  const renderExistingDoc = (docObj: any, label: string) => {
    if (!docObj) return null;
    const docName = docObj && docObj.name ? docObj.name : 'Document';
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 font-['Poppins',sans-serif]">
        <FileText className="w-4 h-4 text-gray-400" />
        <span>Current: <span className="font-medium text-gray-800">{docName}</span></span>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Application Details
      </button>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
          Edit & Resubmit Application
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{application.id}</span> &mdash;
          Make corrections and resubmit your plumber license registration application
        </p>
      </div>

      {/* Send-back Reason Banner */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <RotateCcw className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-orange-800 font-['Poppins',sans-serif] mb-1">
              Application Sent Back by {sentBackByLabel}
            </p>
            <p className="text-sm text-orange-700 font-['Poppins',sans-serif] leading-relaxed mb-2">
              Please review the comments below, make the necessary corrections, and resubmit your application.
              It will be routed back to the {sentBackByLabel} for re-review.
            </p>
            {sendBackComment && (
              <div className="mt-2 p-3 bg-white rounded-lg border border-orange-100">
                <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Reason for Send Back:</p>
                <p className="text-sm text-gray-800 font-['Poppins',sans-serif] font-medium">{sendBackComment}</p>
                {sendBackTimestamp && (
                  <p className="text-xs text-gray-400 font-['Poppins',sans-serif] mt-1">{formatDate(sendBackTimestamp)}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remarks Timeline */}
      {(() => {
        const remarks = buildSendBackRemarks();
        return remarks.length > 0 ? (
          <div className="mb-6">
            <RemarksTimeline remarks={remarks} title="Review Remarks" />
          </div>
        ) : null;
      })()}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="p-8 space-y-8">

          {/* ====== Individual Plumber Form ====== */}
          {isIndividual && (
            <>
              {/* ULB Information */}
              <div>
                <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  ULB Information
                </h3>
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
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

              {/* Personal Details */}
              <div>
                <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Personal Details
                </h3>
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                    <GovInput
                      label="Plumber Name"
                      required
                      placeholder="Enter full name"
                      value={formData.plumberName}
                      onChange={(e) => handleInputChange("plumberName", e.target.value)}
                      error={errors.plumberName}
                    />
                    <GovSelect
                      label="District (Address)"
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
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      error={errors.city}
                    />
                    <GovInput
                      label="Street"
                      required
                      placeholder="Enter street"
                      value={formData.street}
                      onChange={(e) => handleInputChange("street", e.target.value)}
                      error={errors.street}
                    />
                    <GovInput
                      label="Ward No"
                      required
                      placeholder="Enter ward number"
                      value={formData.wardNo}
                      onChange={(e) => handleInputChange("wardNo", e.target.value)}
                      error={errors.wardNo}
                    />
                    <GovInput
                      label="Pincode"
                      required
                      placeholder="Enter pincode"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange("pincode", e.target.value)}
                      error={errors.pincode}
                      maxLength={6}
                    />
                    <GovInput
                      label="Mobile Number"
                      required
                      placeholder="Enter mobile number"
                      value={formData.mobileNumber}
                      onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                      error={errors.mobileNumber}
                      maxLength={10}
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

              {/* Upload Documents */}
              <div>
                <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Upload Documents
                </h3>
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {/* Aadhar Document */}
                    <div>
                      <p className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                        Aadhar Document <span className="text-red-600">*</span>
                      </p>
                      {renderExistingDoc(existingDocs && existingDocs.aadhar ? existingDocs.aadhar : null, 'Aadhar')}
                      {keepExistingAadhar && existingDocs && existingDocs.aadhar ? (
                        <div className="mt-2 flex items-center gap-3 bg-white border border-green-300 rounded-lg px-4 py-3">
                          <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 font-['Poppins',sans-serif] truncate">
                              {existingDocs.aadhar.name || 'Uploaded'}
                            </p>
                            <p className="text-xs text-green-600 font-['Poppins',sans-serif]">Keeping existing document</p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <button
                            onClick={() => setKeepExistingAadhar(false)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-['Poppins',sans-serif] underline"
                          >
                            Replace
                          </button>
                        </div>
                      ) : aadharDocument ? (
                        <div className="mt-2 flex items-center gap-3 bg-white border border-green-300 rounded-lg px-4 py-3">
                          <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 font-['Poppins',sans-serif] truncate">
                              {aadharDocument.name}
                            </p>
                            <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                              {(aadharDocument.size / 1024).toFixed(1)} KB (New upload)
                            </p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <button
                            onClick={() => {
                              setAadharDocument(null);
                              if (existingDocs && existingDocs.aadhar) setKeepExistingAadhar(true);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <GovButton variant="primary" size="sm" onClick={() => handleFileUpload('aadhar')}>
                            <Upload className="w-4 h-4" />
                            Upload New Document
                          </GovButton>
                        </div>
                      )}
                      <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1.5">
                        PDF, JPG, PNG (Max 5MB)
                      </p>
                    </div>

                    {/* Experience Letter */}
                    <div>
                      <p className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                        Experience Letter <span className="text-red-600">*</span>
                      </p>
                      {renderExistingDoc(existingDocs && existingDocs.experienceLetter ? existingDocs.experienceLetter : null, 'Experience Letter')}
                      {keepExistingExperience && existingDocs && existingDocs.experienceLetter ? (
                        <div className="mt-2 flex items-center gap-3 bg-white border border-green-300 rounded-lg px-4 py-3">
                          <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 font-['Poppins',sans-serif] truncate">
                              {existingDocs.experienceLetter.name || 'Uploaded'}
                            </p>
                            <p className="text-xs text-green-600 font-['Poppins',sans-serif]">Keeping existing document</p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <button
                            onClick={() => setKeepExistingExperience(false)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-['Poppins',sans-serif] underline"
                          >
                            Replace
                          </button>
                        </div>
                      ) : experienceLetter ? (
                        <div className="mt-2 flex items-center gap-3 bg-white border border-green-300 rounded-lg px-4 py-3">
                          <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 font-['Poppins',sans-serif] truncate">
                              {experienceLetter.name}
                            </p>
                            <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                              {(experienceLetter.size / 1024).toFixed(1)} KB (New upload)
                            </p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <button
                            onClick={() => {
                              setExperienceLetter(null);
                              if (existingDocs && existingDocs.experienceLetter) setKeepExistingExperience(true);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <GovButton variant="primary" size="sm" onClick={() => handleFileUpload('experience')}>
                            <Upload className="w-4 h-4" />
                            Upload New Document
                          </GovButton>
                        </div>
                      )}
                      <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1.5">
                        PDF, JPG, PNG (Max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ====== Contractor Form ====== */}
          {!isIndividual && (
            <>
              {/* ULB Information */}
              <div>
                <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  ULB Information
                </h3>
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                    <GovSelect
                      label="District"
                      required
                      placeholder="Select District"
                      options={KARNATAKA_DISTRICTS}
                      value={contFormData.district}
                      onValueChange={(value) => handleContInputChange("district", value)}
                      error={errors.district}
                    />
                    <GovSelect
                      label="ULB"
                      required
                      placeholder="Select ULB"
                      options={contFormData.district && DISTRICT_ULB_DATA[contFormData.district] ? DISTRICT_ULB_DATA[contFormData.district] : DISTRICT_ULB_DATA["dharwad"]}
                      value={contFormData.ulb}
                      onValueChange={(value) => handleContInputChange("ulb", value)}
                      error={errors.ulb}
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

              {/* Contractors Information */}
              <div>
                <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Contractors Information
                </h3>
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                    <GovInput
                      label="Firm Name"
                      required
                      placeholder="Enter firm name"
                      value={contFormData.firmName}
                      onChange={(e) => handleContInputChange("firmName", e.target.value)}
                      error={errors.firmName}
                    />
                    <GovSelect
                      label="Type of Firm"
                      required
                      placeholder="Select Type"
                      options={FIRM_TYPE_OPTIONS}
                      value={contFormData.typeOfFirm}
                      onValueChange={(value) => handleContInputChange("typeOfFirm", value)}
                      error={errors.typeOfFirm}
                    />
                    <GovInput
                      label="Office Address"
                      required
                      placeholder="Enter office address"
                      value={contFormData.officeAddress}
                      onChange={(e) => handleContInputChange("officeAddress", e.target.value)}
                      error={errors.officeAddress}
                    />
                    <GovSelect
                      label="District"
                      required
                      placeholder="Select District"
                      options={KARNATAKA_DISTRICTS}
                      value={contFormData.contDistrict}
                      onValueChange={(value) => handleContInputChange("contDistrict", value)}
                      error={errors.contDistrict}
                    />
                    <GovSelect
                      label="Taluk"
                      required
                      placeholder="Select Taluk"
                      options={contFormData.contDistrict && TALUK_OPTIONS[contFormData.contDistrict] ? TALUK_OPTIONS[contFormData.contDistrict] : []}
                      value={contFormData.taluk}
                      onValueChange={(value) => handleContInputChange("taluk", value)}
                      error={errors.taluk}
                      disabled={!contFormData.contDistrict}
                    />
                    <GovInput
                      label="Pincode"
                      required
                      placeholder="Enter pincode"
                      value={contFormData.pincode}
                      onChange={(e) => handleContInputChange("pincode", e.target.value)}
                      error={errors.pincode}
                      maxLength={6}
                    />
                    <GovInput
                      label="Mobile Number"
                      required
                      placeholder="Enter mobile number"
                      value={contFormData.mobileNumber}
                      onChange={(e) => handleContInputChange("mobileNumber", e.target.value)}
                      error={errors.mobileNumber}
                      maxLength={10}
                    />
                    <GovInput
                      label="Email ID"
                      required
                      placeholder="Enter email"
                      value={contFormData.emailId}
                      onChange={(e) => handleContInputChange("emailId", e.target.value)}
                      error={errors.emailId}
                    />
                    <GovInput
                      label="PAN Number"
                      required
                      placeholder="Enter PAN number"
                      value={contFormData.panNumber}
                      onChange={(e) => handleContInputChange("panNumber", e.target.value)}
                      error={errors.panNumber}
                    />
                    <GovInput
                      label="GST Number"
                      required
                      placeholder="Enter GST number"
                      value={contFormData.gstNumber}
                      onChange={(e) => handleContInputChange("gstNumber", e.target.value)}
                      error={errors.gstNumber}
                    />
                    {/* Supporting Document */}
                    <div>
                      <p className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                        Supporting Doc <span className="text-red-600">*</span>
                      </p>
                      {renderExistingDoc(existingDocs && existingDocs.supportingDoc ? existingDocs.supportingDoc : null, 'Supporting Doc')}
                      {keepExistingContSupporting && existingDocs && existingDocs.supportingDoc ? (
                        <div className="mt-2 flex items-center gap-3 bg-white border border-green-300 rounded-lg px-4 py-3">
                          <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 font-['Poppins',sans-serif] truncate">
                              {existingDocs.supportingDoc.name || 'Uploaded'}
                            </p>
                            <p className="text-xs text-green-600 font-['Poppins',sans-serif]">Keeping existing document</p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <button
                            onClick={() => setKeepExistingContSupporting(false)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-['Poppins',sans-serif] underline"
                          >
                            Replace
                          </button>
                        </div>
                      ) : contSupportingDoc ? (
                        <div className="mt-2 flex items-center gap-3 bg-white border border-green-300 rounded-lg px-4 py-3">
                          <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 font-['Poppins',sans-serif] truncate">
                              {contSupportingDoc.name}
                            </p>
                            <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                              {(contSupportingDoc.size / 1024).toFixed(1)} KB (New upload)
                            </p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <button
                            onClick={() => {
                              setContSupportingDoc(null);
                              if (existingDocs && existingDocs.supportingDoc) setKeepExistingContSupporting(true);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <GovButton variant="primary" size="sm" onClick={() => handleFileUpload('contSupporting')}>
                            <Upload className="w-4 h-4" />
                            Upload New Document
                          </GovButton>
                        </div>
                      )}
                      <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1.5">
                        PDF, JPG, PNG (Max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authorized Person Details */}
              <div>
                <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Authorized Person Details
                </h3>
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                    <GovInput
                      label="Full Name"
                      required
                      placeholder="Enter full name"
                      value={contFormData.authFullName}
                      onChange={(e) => handleContInputChange("authFullName", e.target.value)}
                      error={errors.authFullName}
                    />
                    <GovInput
                      label="Designation"
                      required
                      placeholder="Enter designation"
                      value={contFormData.authDesignation}
                      onChange={(e) => handleContInputChange("authDesignation", e.target.value)}
                      error={errors.authDesignation}
                    />
                    <GovInput
                      label="Mobile Number"
                      required
                      placeholder="Enter mobile number"
                      value={contFormData.authMobile}
                      onChange={(e) => handleContInputChange("authMobile", e.target.value)}
                      error={errors.authMobile}
                      maxLength={10}
                    />
                    <GovInput
                      label="Email ID"
                      required
                      placeholder="Enter email"
                      value={contFormData.authEmail}
                      onChange={(e) => handleContInputChange("authEmail", e.target.value)}
                      error={errors.authEmail}
                    />
                    {/* Aadhar Document for Contractor */}
                    <div>
                      <p className="text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
                        Aadhar Document <span className="text-red-600">*</span>
                      </p>
                      {renderExistingDoc(existingDocs && existingDocs.aadhar ? existingDocs.aadhar : null, 'Aadhar')}
                      {keepExistingContAadhar && existingDocs && existingDocs.aadhar ? (
                        <div className="mt-2 flex items-center gap-3 bg-white border border-green-300 rounded-lg px-4 py-3">
                          <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 font-['Poppins',sans-serif] truncate">
                              {existingDocs.aadhar.name || 'Uploaded'}
                            </p>
                            <p className="text-xs text-green-600 font-['Poppins',sans-serif]">Keeping existing document</p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <button
                            onClick={() => setKeepExistingContAadhar(false)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-['Poppins',sans-serif] underline"
                          >
                            Replace
                          </button>
                        </div>
                      ) : contAadharDoc ? (
                        <div className="mt-2 flex items-center gap-3 bg-white border border-green-300 rounded-lg px-4 py-3">
                          <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 font-['Poppins',sans-serif] truncate">
                              {contAadharDoc.name}
                            </p>
                            <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                              {(contAadharDoc.size / 1024).toFixed(1)} KB (New upload)
                            </p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <button
                            onClick={() => {
                              setContAadharDoc(null);
                              if (existingDocs && existingDocs.aadhar) setKeepExistingContAadhar(true);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <GovButton variant="primary" size="sm" onClick={() => handleFileUpload('contAadhar')}>
                            <Upload className="w-4 h-4" />
                            Upload New Document
                          </GovButton>
                        </div>
                      )}
                      <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1.5">
                        PDF, JPG, PNG (Max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ====== Declaration Section ====== */}
          <div>
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              Declaration
            </h3>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="resubmit-declaration"
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-[#1f3a5f] cursor-pointer shrink-0"
                />
                <label htmlFor="resubmit-declaration" className="cursor-pointer">
                  <p className="text-[14px] font-medium text-[#263238] font-['Poppins',sans-serif] leading-relaxed">
                    I declare that I have made the necessary corrections as requested. The information provided is true and correct.
                    I understand that false information may lead to rejection or cancellation of my license.
                    I agree to abide by the rules of the Department of Municipal Administration, Govt. of Karnataka. <span className="text-red-600">*</span>
                  </p>
                </label>
              </div>
              {!declarationAccepted && (
                <div className="mt-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <p className="text-[12px] text-amber-600 font-['Poppins',sans-serif]">
                    You must accept the declaration before resubmitting the application.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ====== Action Buttons ====== */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <GovButton
              variant="outline"
              size="lg"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Cancel
            </GovButton>
            <GovButton
              variant="primary"
              size="lg"
              onClick={handleResubmit}
              loading={isSubmitting}
              disabled={isSubmitting || !declarationAccepted}
            >
              <Send className="w-4 h-4" />
              Resubmit Application
            </GovButton>
          </div>
        </div>
      </div>
    </div>
  );
}
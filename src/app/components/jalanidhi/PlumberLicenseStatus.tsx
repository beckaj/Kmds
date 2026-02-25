import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Eye, ChevronLeft, Search, AlertCircle, ArrowRight, FileText, CreditCard, Award, RotateCcw, Edit3, Send, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import PlumberLicensePaymentView from './PlumberLicensePaymentView';
import PlumberLicenseResubmitForm from './PlumberLicenseResubmitForm';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface PlumberLicenseApp {
  id: string;
  registrationType: string;
  status: string;
  submittedAt: string;
  updatedAt: string;
  applicantName: string;
  district: string;
  ulb: string;
  financialYear: string;
  registrationFees: string;
  // Individual fields
  plumberName: string;
  addressDistrict: string;
  city: string;
  street: string;
  wardNo: string;
  pincode: string;
  mobileNumber: string;
  qualification: string;
  yearOfExperience: string;
  // Contractor fields
  firmName: string;
  typeOfFirm: string;
  officeAddress: string;
  contDistrict: string;
  taluk: string;
  emailId: string;
  panNumber: string;
  gstNumber: string;
  authFullName: string;
  authDesignation: string;
  authMobile: string;
  authEmail: string;
  // Common
  documents: any;
  workflow: any;
  caseworkerComments: string;
  // Renewal fields
  isRenewal?: boolean;
  renewalOf?: string;
  originalLicenseNumber?: string;
}

const QUALIFICATION_LABELS: Record<string, string> = {
  'iti': 'ITI',
  'diploma': 'Diploma in Plumbing',
  'certificate': 'Certificate Course',
  'bsc': 'B.Sc. (Plumbing Technology)',
  'experience-based': 'Experience Based',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  '1': '1 Year',
  '2': '2 Years',
  '3': '3 Years',
  '4': '4 Years',
  '5': '5 Years',
  '6-10': '6-10 Years',
  '10+': '10+ Years',
};

const FIRM_TYPE_LABELS: Record<string, string> = {
  'private-limited': 'Private Limited',
  'public-limited': 'Public Limited',
  'partnership': 'Partnership',
  'sole-proprietorship': 'Sole Proprietorship',
  'llp': 'LLP',
};

const formatLabel = (value: string | undefined | null): string => {
  if (!value) return 'N/A';
  return value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function PlumberLicenseStatus() {
  const [applications, setApplications] = useState<PlumberLicenseApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<PlumberLicenseApp | null>(null);
  const [paymentApp, setPaymentApp] = useState<PlumberLicenseApp | null>(null);
  const [resubmitApp, setResubmitApp] = useState<PlumberLicenseApp | null>(null);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const citizenId = userData && userData.phone ? userData.phone : '';
      console.log('[PLUMBER STATUS] userData:', userData);
      console.log('[PLUMBER STATUS] citizenId for fetch:', citizenId);
      if (!citizenId) {
        console.warn('[PLUMBER STATUS] No citizenId (phone) found in userData, cannot fetch apps');
        setApplications([]);
        setLoading(false);
        return;
      }
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-698be164/plumber-license/my-applications/${citizenId}`;
      console.log('[PLUMBER STATUS] Fetching from:', url);
      const response = await fetch(
        url,
        { method: 'GET', headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      console.log('[PLUMBER STATUS] Response:', JSON.stringify(data).substring(0, 500));
      if (data && data.success) {
        const apps = data.applications || [];
        console.log(`[PLUMBER STATUS] Received ${apps.length} applications:`);
        apps.forEach((app: any) => {
          console.log(`[PLUMBER STATUS]   - ${app && app.id ? app.id : 'NO_ID'} | status=${app && app.status ? app.status : 'N/A'} | citizenId=${app && app.citizenId ? app.citizenId : 'N/A'}`);
        });
        setApplications(apps);
      } else {
        console.error('[PLUMBER STATUS] Error:', data && data.error ? data.error : 'Unknown');
        setApplications([]);
      }
    } catch (error) {
      console.error('[PLUMBER STATUS] Error fetching:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bgColor: string; step: number }> = {
      'submitted': { label: 'Submitted - Under Caseworker Review', color: 'text-blue-800', bgColor: 'bg-blue-100 border-blue-300', step: 1 },
      'sentToFieldEngineer': { label: 'Sent to Field Engineer', color: 'text-indigo-800', bgColor: 'bg-indigo-100 border-indigo-300', step: 2 },
      'sentToCommissioner': { label: 'Sent to Commissioner', color: 'text-purple-800', bgColor: 'bg-purple-100 border-purple-300', step: 3 },
      'pendingPayment': { label: 'Approved - Pending Payment', color: 'text-amber-800', bgColor: 'bg-amber-100 border-amber-300', step: 4 },
      'paymentCompleted': { label: 'Payment Done - Awaiting Certificate', color: 'text-cyan-800', bgColor: 'bg-cyan-100 border-cyan-300', step: 4.5 },
      'approved': { label: 'Approved - License Issued', color: 'text-green-800', bgColor: 'bg-green-100 border-green-300', step: 5 },
      'rejected': { label: 'Rejected by Commissioner', color: 'text-red-800', bgColor: 'bg-red-100 border-red-300', step: 3 },
      'sentBackToCitizen': { label: 'Sent Back - Corrections Required', color: 'text-orange-800', bgColor: 'bg-orange-100 border-orange-300', step: 1 },
    };
    return configs[status] || configs['submitted'];
  };

  // Payment/Certificate view
  if (paymentApp) {
    return (
      <PlumberLicensePaymentView
        application={paymentApp as any}
        onBack={() => setPaymentApp(null)}
        onRefresh={() => {
          setPaymentApp(null);
          fetchMyApplications();
        }}
      />
    );
  }

  // Resubmit form view
  if (resubmitApp) {
    return (
      <PlumberLicenseResubmitForm
        application={resubmitApp}
        onBack={() => setResubmitApp(null)}
        onSuccess={() => {
          setResubmitApp(null);
          setSelectedApp(null);
          fetchMyApplications();
        }}
      />
    );
  }

  // Detail view of single application
  if (selectedApp) {
    const statusConfig = getStatusConfig(selectedApp.status);
    const isIndividual = selectedApp.registrationType !== 'contractor';
    const docs = selectedApp.documents || {};

    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <button
          onClick={() => setSelectedApp(null)}
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Applications
        </button>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
              Application Details
            </h1>
            <p className="text-gray-600 font-['Poppins',sans-serif]">
              Application ID: <span className="font-semibold">{selectedApp.id}</span>
            </p>
          </div>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-['Poppins',sans-serif] font-medium border ${statusConfig.bgColor} ${statusConfig.color}`}>
            <Clock className="w-4 h-4" />
            {statusConfig.label}
          </span>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-6">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5">
              Application Progress
            </h3>
            {(() => {
              const steps = [
                { key: 'submitted', label: 'Submitted', description: 'Application submitted by citizen' },
                { key: 'caseworker', label: 'Caseworker Review', description: 'Document verification by caseworker' },
                { key: 'fieldEngineer', label: 'Field Engineer', description: 'Field verification by engineer' },
                { key: 'commissioner', label: 'Commissioner Review', description: 'Final review by commissioner' },
                { key: 'payment', label: 'Payment', description: 'Registration fee payment' },
                { key: 'certificate', label: 'Certificate Issued', description: 'License certificate with DSC' },
              ];

              const statusStepMap: Record<string, number> = {
                'submitted': 1,
                'sentToFieldEngineer': 2,
                'sentToCommissioner': 3,
                'pendingPayment': 4,
                'paymentCompleted': 5,
                'approved': 6,
                'rejected': 4,
              };

              const currentStepNum = statusStepMap[selectedApp.status] || 1;
              const isRejected = selectedApp.status === 'rejected';

              return (
                <div className="flex items-start justify-between relative">
                  {/* Connector line */}
                  <div className="absolute top-[18px] left-[30px] right-[30px] h-[2px] bg-gray-200 z-0" />
                  <div
                    className={`absolute top-[18px] left-[30px] h-[2px] z-0 transition-all ${isRejected ? 'bg-red-400' : 'bg-[#1f3a5f]'}`}
                    style={{ width: `${Math.min(100, ((currentStepNum - 1) / (steps.length - 1)) * 100)}%`, maxWidth: 'calc(100% - 60px)' }}
                  />

                  {steps.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isCompleted = stepNum < currentStepNum;
                    const isCurrent = stepNum === currentStepNum;
                    const isRejectedStep = isRejected && stepNum === currentStepNum;

                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10" style={{ width: `${100 / steps.length}%` }}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold font-['Poppins',sans-serif] border-2 transition-all ${
                          isRejectedStep
                            ? 'bg-red-500 border-red-500 text-white'
                            : isCompleted
                            ? 'bg-[#1f3a5f] border-[#1f3a5f] text-white'
                            : isCurrent
                            ? 'bg-white border-[#1f3a5f] text-[#1f3a5f] ring-4 ring-[#1f3a5f]/20'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}>
                          {isRejectedStep ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          ) : isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            stepNum
                          )}
                        </div>
                        <p className={`text-xs font-['Poppins',sans-serif] font-medium mt-2 text-center leading-tight ${
                          isRejectedStep ? 'text-red-700'
                            : isCompleted || isCurrent ? 'text-[#1f3a5f]' : 'text-gray-400'
                        }`}>
                          {isRejectedStep ? 'Rejected' : step.label}
                        </p>
                        {(isCompleted || isCurrent) && (
                          <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif] mt-0.5 text-center max-w-[100px]">
                            {step.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden">
          <div className="p-8 space-y-8">

            {/* Rejection Banner for rejected applications */}
            {selectedApp.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[15px] font-semibold text-red-800 font-['Poppins',sans-serif] mb-1">
                      Application Rejected by Commissioner
                    </p>
                    <p className="text-sm text-red-700 font-['Poppins',sans-serif] leading-relaxed">
                      Your plumber license registration application has been rejected. Please review the Commissioner's comments below for the reason.
                    </p>
                    {selectedApp.workflow && selectedApp.workflow.commissioner && selectedApp.workflow.commissioner.comment && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-red-100">
                        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Reason for Rejection:</p>
                        <p className="text-sm text-gray-800 font-['Poppins',sans-serif] font-medium">{selectedApp.workflow.commissioner.comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sent Back Banner - when commissioner sent back to Field Engineer */}
            {selectedApp.status === 'sentToFieldEngineer' && selectedApp.workflow && selectedApp.workflow.commissioner && selectedApp.workflow.commissioner.decision === 'sent_back' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[15px] font-semibold text-amber-800 font-['Poppins',sans-serif] mb-1">
                      Application Sent Back for Re-review
                    </p>
                    <p className="text-sm text-amber-700 font-['Poppins',sans-serif] leading-relaxed">
                      The Commissioner has sent your application back to the Field Engineer for additional review. This does not mean your application is rejected.
                    </p>
                    {selectedApp.workflow.commissioner.comment && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-amber-100">
                        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Commissioner's Comments:</p>
                        <p className="text-sm text-gray-800 font-['Poppins',sans-serif] font-medium">{selectedApp.workflow.commissioner.comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sent Back to Citizen Banner - when caseworker or field engineer sent back */}
            {selectedApp.status === 'sentBackToCitizen' && (() => {
              const sbInfo = selectedApp.workflow && selectedApp.workflow.sendBack ? selectedApp.workflow.sendBack : null;
              const sbByLabel = sbInfo && sbInfo.sentBackByLabel ? sbInfo.sentBackByLabel : 'Reviewer';
              const sbComment = sbInfo && sbInfo.comment ? sbInfo.comment : '';
              return (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <RotateCcw className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[15px] font-semibold text-orange-800 font-['Poppins',sans-serif] mb-1">
                        Application Sent Back by {sbByLabel}
                      </p>
                      <p className="text-sm text-orange-700 font-['Poppins',sans-serif] leading-relaxed">
                        The {sbByLabel} has sent your application back for corrections. Please review the comments, make the necessary changes, and resubmit.
                      </p>
                      {sbComment && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-orange-100">
                          <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Reason for Send Back:</p>
                          <p className="text-sm text-gray-800 font-['Poppins',sans-serif] font-medium">{sbComment}</p>
                        </div>
                      )}
                      <div className="mt-4">
                        <button
                          onClick={() => setResubmitApp(selectedApp)}
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[14px] hover:bg-[#1f3a5f]/90 transition-colors shadow-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit & Resubmit Application
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Renewal Info Banner */}
            {selectedApp.isRenewal && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] font-semibold text-amber-800 font-['Poppins',sans-serif] mb-1">
                      This is a License Renewal Application
                    </p>
                    <p className="text-sm text-amber-700 font-['Poppins',sans-serif] leading-relaxed">
                      Original Application: <span className="font-medium">{selectedApp.renewalOf || 'N/A'}</span> | Certificate: <span className="font-medium">{selectedApp.originalLicenseNumber || 'N/A'}</span> | Renewal Fee: Rs. {selectedApp.registrationFees || '1000'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ULB Information Section */}
            <div>
              <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                ULB Information
              </h3>
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Application ID</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{selectedApp.id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Registration Type</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {isIndividual ? 'Individual Plumber' : 'Contractor'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">District</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {formatLabel(selectedApp.district)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">ULB</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {formatLabel(selectedApp.ulb)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Financial Year</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {selectedApp.financialYear || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Registration Fees (in Rs.)</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {selectedApp.registrationFees || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Plumber - Personal Details */}
            {isIndividual && (
              <div>
                <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Personal Details
                </h3>
                <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Plumber Name</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {selectedApp.plumberName || selectedApp.applicantName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">District (Address)</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {selectedApp.addressDistrict || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">City</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {selectedApp.city || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Street</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {selectedApp.street || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Ward No</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {selectedApp.wardNo || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Pincode</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {selectedApp.pincode || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Mobile Number</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {selectedApp.mobileNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Qualification</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {selectedApp.qualification && QUALIFICATION_LABELS[selectedApp.qualification] ? QUALIFICATION_LABELS[selectedApp.qualification] : (selectedApp.qualification || 'N/A')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Year of Experience</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                        {selectedApp.yearOfExperience && EXPERIENCE_LABELS[selectedApp.yearOfExperience] ? EXPERIENCE_LABELS[selectedApp.yearOfExperience] : (selectedApp.yearOfExperience || 'N/A')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contractor - Contractor Information */}
            {!isIndividual && (
              <>
                <div>
                  <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                    Contractors Information
                  </h3>
                  <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                      <div>
                        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Firm Name</p>
                        <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                          {selectedApp.firmName || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Type of Firm</p>
                        <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                          {selectedApp.typeOfFirm && FIRM_TYPE_LABELS[selectedApp.typeOfFirm] ? FIRM_TYPE_LABELS[selectedApp.typeOfFirm] : (selectedApp.typeOfFirm || 'N/A')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Office Address</p>
                        <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                          {selectedApp.officeAddress || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">District</p>
                        <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                          {formatLabel(selectedApp.contDistrict)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Taluk</p>
                        <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                          {formatLabel(selectedApp.taluk)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Pincode</p>
                        <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                          {selectedApp.pincode || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Mobile Number</p>
                        <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                          {selectedApp.mobileNumber || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Email ID</p>
                        <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                          {selectedApp.emailId || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">PAN Number</p>
                        <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                          {selectedApp.panNumber || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">GST Number</p>
                        <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                          {selectedApp.gstNumber || 'N/A'}
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
                      <div>
                        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Full Name</p>
                        <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                          {selectedApp.authFullName || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Designation</p>
                        <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                          {selectedApp.authDesignation || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Mobile Number</p>
                        <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                          {selectedApp.authMobile || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Email ID</p>
                        <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                          {selectedApp.authEmail || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Uploaded Documents Section */}
            <div>
              <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                Uploaded Documents
              </h3>
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                  {isIndividual ? (
                    <>
                      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4">
                        <FileText className="w-8 h-8 text-[#1f3a5f] flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 font-['Poppins',sans-serif]">Aadhar Document</p>
                          <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                            {docs && docs.aadhar && docs.aadhar.name ? docs.aadhar.name : 'Not uploaded'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4">
                        <FileText className="w-8 h-8 text-[#1f3a5f] flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 font-['Poppins',sans-serif]">Experience Letter</p>
                          <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                            {docs && docs.experienceLetter && docs.experienceLetter.name ? docs.experienceLetter.name : 'Not uploaded'}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4">
                        <FileText className="w-8 h-8 text-[#1f3a5f] flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 font-['Poppins',sans-serif]">Supporting Document</p>
                          <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                            {docs && docs.supportingDoc && docs.supportingDoc.name ? docs.supportingDoc.name : 'Not uploaded'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4">
                        <FileText className="w-8 h-8 text-[#1f3a5f] flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 font-['Poppins',sans-serif]">Aadhar Document</p>
                          <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                            {docs && docs.aadhar && docs.aadhar.name ? docs.aadhar.name : 'Not uploaded'}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submission Info */}
            <div>
              <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                Submission Info
              </h3>
              <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Submitted Date</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {formatDate(selectedApp.submittedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Last Updated</p>
                    <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                      {formatDate(selectedApp.updatedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Current Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium border ${statusConfig.bgColor} ${statusConfig.color}`}>
                      <Clock className="w-3.5 h-3.5" />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Consolidated Workflow Remarks */}
            {(() => {
              const remarkEntries: RemarkEntry[] = [];
              // Previous send-back remarks (from previous cycles)
              const prevSendBacks = selectedApp.workflow && selectedApp.workflow.previousSendBacks ? selectedApp.workflow.previousSendBacks : [];
              prevSendBacks.forEach((sb: any) => {
                if (sb && sb.comment) {
                  remarkEntries.push({
                    role: sb.sentBackByLabel || 'Reviewer',
                    comment: sb.comment + ' (Send Back to Citizen)',
                    timestamp: sb.timestamp || '',
                    variant: 'sent_back' as const,
                  });
                }
              });
              if (selectedApp.caseworkerComments) {
                const cwTimestamp = selectedApp.workflow && selectedApp.workflow.caseworker && selectedApp.workflow.caseworker.timestamp ? selectedApp.workflow.caseworker.timestamp : '';
                remarkEntries.push({ role: 'Caseworker', comment: selectedApp.caseworkerComments, timestamp: cwTimestamp });
              }
              if (selectedApp.workflow && selectedApp.workflow.fieldEngineer && selectedApp.workflow.fieldEngineer.comment) {
                remarkEntries.push({ role: 'Field Engineer', comment: selectedApp.workflow.fieldEngineer.comment, timestamp: selectedApp.workflow.fieldEngineer.timestamp || '' });
              }
              if (selectedApp.workflow && selectedApp.workflow.commissioner && selectedApp.workflow.commissioner.comment) {
                const commDecision = selectedApp.workflow.commissioner.decision || 'default';
                const variant = commDecision === 'rejected' ? 'rejected' : commDecision === 'sent_back' ? 'sent_back' : commDecision === 'approved' ? 'approved' : 'default';
                remarkEntries.push({ role: 'Commissioner', comment: selectedApp.workflow.commissioner.comment, timestamp: selectedApp.workflow.commissioner.timestamp || '', variant: variant as RemarkEntry['variant'] });
              }
              // Current send-back remark
              if (selectedApp.workflow && selectedApp.workflow.sendBack && selectedApp.workflow.sendBack.comment) {
                remarkEntries.push({
                  role: selectedApp.workflow.sendBack.sentBackByLabel || 'Reviewer',
                  comment: selectedApp.workflow.sendBack.comment + ' (Send Back to Citizen)',
                  timestamp: selectedApp.workflow.sendBack.timestamp || '',
                  variant: 'sent_back' as const,
                });
              }
              return remarkEntries.length > 0 ? (
                <RemarksTimeline remarks={remarkEntries} title="Remarks" />
              ) : null;
            })()}

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
          Plumber License - Application Status
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Track the status of your plumber license registration applications
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f]"></div>
            <p className="mt-4 text-gray-600 font-['Poppins',sans-serif]">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-['Poppins',sans-serif] mb-2">No applications found.</p>
            <p className="text-sm text-gray-500 font-['Poppins',sans-serif]">
              Submit a new plumber license registration to see it here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto gov-table-scroll">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-[#27548a]/10 backdrop-blur-[4px]">
                <tr className="border-b border-[#170F49]">
                  <th className="px-4 py-3 text-center text-[14px] font-bold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[50px]">#</th>
                  <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[200px]">Application No</th>
                  <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[120px]">Type</th>
                  <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[150px]">ULB</th>
                  <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[150px]">Submitted</th>
                  <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[160px]">Status</th>
                  <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[120px]">Queue</th>
                  <th className="px-4 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif] w-[120px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map((app, index) => {
                  const sc = getStatusConfig(app.status);
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-center text-[14px] font-medium text-gray-700 font-['Poppins',sans-serif]">{index + 1}</td>
                      <td className="px-4 py-4 text-center text-[14px] font-medium text-[#1f3a5f] font-['Poppins',sans-serif]">{app.id}</td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-['Poppins',sans-serif] border ${
                            app.registrationType === 'contractor' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-teal-100 text-teal-800 border-teal-200'
                          }`}>
                            {app.registrationType === 'contractor' ? 'Contractor' : 'Individual'}
                          </span>
                          {(app as any).isRenewal && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium font-['Poppins',sans-serif] bg-amber-100 text-amber-800 border border-amber-200">
                              <RefreshCw className="w-2.5 h-2.5" />
                              Renewal
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-[14px] text-gray-700 font-['Poppins',sans-serif] capitalize">{(app.ulb || 'N/A').replace(/-/g, ' ')}</td>
                      <td className="px-4 py-4 text-center text-[14px] text-gray-700 font-['Poppins',sans-serif]">{formatDate(app.submittedAt)}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium border ${sc.bgColor} ${sc.color}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {sc.label.split(' - ')[0]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {(() => {
                          const queueMap: Record<string, { label: string; color: string }> = {
                            'submitted': { label: 'Caseworker', color: 'bg-blue-100 text-blue-800 border border-blue-200' },
                            'sentToFieldEngineer': { label: 'Field Engineer', color: 'bg-indigo-100 text-indigo-800 border border-indigo-200' },
                            'sentToCommissioner': { label: 'Commissioner', color: 'bg-purple-100 text-purple-800 border border-purple-200' },
                            'pendingPayment': { label: 'Citizen (Payment)', color: 'bg-amber-100 text-amber-800 border border-amber-200' },
                            'paymentCompleted': { label: 'Commissioner (Certificate)', color: 'bg-cyan-100 text-cyan-800 border border-cyan-200' },
                            'approved': { label: 'Completed', color: 'bg-green-100 text-green-800 border border-green-200' },
                            'rejected': { label: 'Rejected', color: 'bg-red-100 text-red-800 border border-red-200' },
                            'sentBackToCitizen': { label: 'Citizen (Corrections)', color: 'bg-orange-100 text-orange-800 border border-orange-200' },
                          };
                          const q = queueMap[app.status] || queueMap['submitted'];
                          return (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium ${q.color}`}>
                              {q.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {app.status === 'pendingPayment' ? (
                          <button
                            onClick={() => setPaymentApp(app)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-sm hover:bg-[#1f3a5f]/90 transition-colors mx-auto"
                          >
                            <CreditCard className="w-4 h-4" />
                            Pay Now
                          </button>
                        ) : app.status === 'paymentCompleted' ? (
                          <button
                            onClick={() => setPaymentApp(app)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 text-white rounded-lg font-['Poppins',sans-serif] font-medium text-sm hover:bg-cyan-700 transition-colors mx-auto"
                          >
                            <Clock className="w-4 h-4" />
                            Awaiting Certificate
                          </button>
                        ) : app.status === 'approved' ? (
                          <button
                            onClick={() => setPaymentApp(app)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg font-['Poppins',sans-serif] font-medium text-sm hover:bg-green-700 transition-colors mx-auto"
                          >
                            <Award className="w-4 h-4" />
                            Certificate
                          </button>
                        ) : app.status === 'sentBackToCitizen' ? (
                          <button
                            onClick={() => setResubmitApp(app)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-semibold text-sm hover:bg-[#1f3a5f]/90 transition-colors mx-auto"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit & Resubmit
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1f3a5f] text-white rounded-lg font-['Poppins',sans-serif] font-medium text-sm hover:bg-[#2d4a6f] transition-colors mx-auto"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
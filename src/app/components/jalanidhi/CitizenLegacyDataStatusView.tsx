import { useState, useRef } from 'react';
import {
  ChevronLeft, Shield, CheckCircle, XCircle, MapPin, Plug,
  IndianRupee, Download, Printer, Clock, Database
} from 'lucide-react';
import { GovButton } from '../ui/gov-button';

interface CitizenLegacyDataStatusViewProps {
  application: any;
  onBack: () => void;
}

export default function CitizenLegacyDataStatusView({ application, onBack }: CitizenLegacyDataStatusViewProps) {
  const letterRef = useRef<HTMLDivElement>(null);

  const safe = (val: any) => (val !== null && val !== undefined && val !== '' ? val : 'N/A');

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const formatDateOnly = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const handlePrint = () => {
    if (letterRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Permission Letter</title>');
        printWindow.document.write('<style>');
        printWindow.document.write('body { font-family: "Poppins", "Segoe UI", sans-serif; padding: 40px; color: #1a1a1a; }');
        printWindow.document.write('@media print { body { padding: 20px; } }');
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(letterRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const loc = application && application.locationDetails ? application.locationDetails : {};
  const conn = application && application.existingConnection ? application.existingConnection : {};
  const fin = application && application.financialDetails ? application.financialDetails : {};
  const header = application && application.headerDetails ? application.headerDetails : {};
  const wf = application && application.workflow ? application.workflow : {};
  const comDetails = wf && wf.commissioner ? wf.commissioner : {};
  const permLetter = application && application.permissionLetter ? application.permissionLetter : null;

  const isApproved = application.status === 'sent_to_citizen' || application.status === 'approved';
  const isRejected = application.status === 'rejected';

  // Status timeline steps
  const steps = [
    {
      label: 'Caseworker Submitted',
      done: true,
      timestamp: application.submittedAt || '',
    },
    {
      label: 'Field Engineer Verified',
      done: !!(wf && wf.fieldEngineer && wf.fieldEngineer.status === 'verified'),
      timestamp: wf && wf.fieldEngineer ? wf.fieldEngineer.timestamp || '' : '',
    },
    {
      label: 'Commissioner Review',
      done: isApproved || isRejected,
      timestamp: comDetails ? comDetails.timestamp || '' : '',
      status: isApproved ? 'approved' : isRejected ? 'rejected' : 'pending',
    },
    {
      label: isRejected ? 'Rejected' : 'Permission Letter Issued',
      done: isApproved || isRejected,
      timestamp: isApproved ? (application.approvedAt || '') : isRejected ? (application.rejectedAt || '') : '',
      status: isApproved ? 'approved' : isRejected ? 'rejected' : 'pending',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to My Applications
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2 flex items-center gap-3">
          <Database className="w-7 h-7" />
          Legacy Data Application
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{safe(application.id)}</span>
        </p>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        {isApproved && (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-100 border border-green-300 rounded-lg text-green-800 font-semibold font-['Poppins',sans-serif]">
            <CheckCircle className="w-5 h-5" />
            Approved - Permission Letter Available
          </div>
        )}
        {isRejected && (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-100 border border-red-300 rounded-lg text-red-800 font-semibold font-['Poppins',sans-serif]">
            <XCircle className="w-5 h-5" />
            Application Rejected
          </div>
        )}
      </div>

      {/* Progress Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5">
          Application Progress
        </h2>
        <div className="flex items-center justify-between relative">
          {/* Connecting Line */}
          <div className="absolute top-5 left-8 right-8 h-[2px] bg-gray-200 z-0"></div>
          <div
            className="absolute top-5 left-8 h-[2px] bg-green-500 z-0 transition-all duration-500"
            style={{
              width: (steps.filter(s => s.done).length - 1) / (steps.length - 1) * 100 + '%',
              maxWidth: 'calc(100% - 64px)',
            }}
          ></div>

          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center z-10 relative" style={{ width: '25%' }}>
              <div className={'w-10 h-10 rounded-full flex items-center justify-center border-2 ' + (
                step.done
                  ? step.status === 'rejected'
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'bg-green-500 border-green-500 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              )}>
                {step.done ? (
                  step.status === 'rejected' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
              <p className={'text-[12px] font-medium font-[\'Poppins\',sans-serif] mt-2 text-center ' + (
                step.done ? 'text-gray-900' : 'text-gray-400'
              )}>
                {step.label}
              </p>
              {step.timestamp && (
                <p className="text-[10px] text-gray-500 font-['Poppins',sans-serif] mt-0.5 text-center">
                  {formatDate(step.timestamp)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rejection Reason */}
      {isRejected && comDetails && comDetails.comments && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-6">
          <h3 className="text-[15px] font-semibold text-red-800 font-['Poppins',sans-serif] mb-2">
            Rejection Reason
          </h3>
          <p className="text-[14px] text-red-700 font-['Poppins',sans-serif]">
            {comDetails.comments}
          </p>
        </div>
      )}

      {/* Application Summary */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-5 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Connection Details
        </h2>
        <div className="grid grid-cols-3 gap-6 mb-5">
          <SummaryField label="Applicant Name" value={safe(loc.fullName)} />
          <SummaryField label="Applicant Type" value={safe(application.applicantType)} />
          <SummaryField label="Ward Number" value={safe(loc.wardNumber)} />
        </div>
        <div className="grid grid-cols-3 gap-6 mb-5">
          <SummaryField label="Address" value={[safe(loc.houseDoorNo), safe(loc.street), safe(loc.address)].filter(v => v !== 'N/A').join(', ')} />
          <SummaryField label="City / District" value={safe(loc.city) + ', ' + safe(loc.district)} />
          <SummaryField label="Mobile No" value={safe(loc.mobileNo)} />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <SummaryField label="Old RR Number" value={safe(conn.rrNumber)} />
          <SummaryField label="Connection Type" value={safe(conn.connectionType)} />
          <SummaryField label="Meter Category" value={safe(conn.meterCategory)} />
        </div>
      </div>

      {/* New RR Number */}
      {isApproved && application.newRRNumber && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-[18px] font-bold text-green-800 font-['Poppins',sans-serif]">
              Your New RR Number
            </h3>
          </div>
          <p className="text-[26px] font-bold text-green-700 font-['Poppins',sans-serif] tracking-wider text-center py-4 bg-white rounded-md border border-green-200">
            {safe(application.newRRNumber)}
          </p>
          <p className="text-[13px] text-green-600 font-['Poppins',sans-serif] text-center mt-2">
            Please note down your new RR Number for future reference
          </p>
        </div>
      )}

      {/* Permission Letter */}
      {isApproved && permLetter && (
        <>
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mb-4">
            <GovButton variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
              Print Letter
            </GovButton>
            <GovButton variant="primary" onClick={handlePrint}>
              <Download className="w-4 h-4" />
              Download PDF
            </GovButton>
          </div>

          {/* Letter */}
          <div ref={letterRef} className="bg-white rounded-lg border-2 border-gray-300 shadow-lg p-10 mb-6">
            {/* Letter Header */}
            <div className="text-center border-b-[3px] border-double border-[#1f3a5f] pb-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-[#1f3a5f]" />
                <div>
                  <h1 className="text-[20px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] tracking-wide uppercase">
                    Government of Karnataka
                  </h1>
                  <h2 className="text-[16px] font-semibold text-gray-700 font-['Poppins',sans-serif]">
                    Department of Municipal Administration
                  </h2>
                </div>
                <Shield className="w-8 h-8 text-[#1f3a5f]" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mt-2">
                JALANIDHI - Karnataka Municipal Data System (KMDS)
              </h3>
              <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mt-1">
                Legacy Data Process - Permission Letter
              </p>
            </div>

            {/* Letter Info */}
            <div className="flex justify-between mb-8">
              <div>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                  <span className="font-semibold">Letter No:</span> {safe(permLetter.letterNumber)}
                </p>
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                  <span className="font-semibold">Application ID:</span> {safe(application.id)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                  <span className="font-semibold">Date:</span> {formatDateOnly(permLetter.generatedAt)}
                </p>
              </div>
            </div>

            {/* Subject */}
            <div className="mb-6">
              <p className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                Subject: Approval of Legacy Water Connection Data Entry
              </p>
            </div>

            {/* Body */}
            <div className="text-[13px] text-gray-800 font-['Poppins',sans-serif] leading-relaxed mb-8">
              <p className="mb-4">
                This is to certify that the legacy data entry for the following water connection has been verified by the Field Engineer and approved by the Commissioner. A new RR Number has been assigned as detailed below.
              </p>
            </div>

            {/* Connection Details */}
            <div className="bg-[#f8fafc] border border-gray-200 rounded-lg p-6 mb-6">
              <h4 className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4 border-b border-gray-200 pb-2">
                Connection Details
              </h4>
              <div className="space-y-2.5">
                <LetterField label="Applicant Name" value={safe(loc.fullName)} />
                <LetterField label="Old RR Number" value={safe(conn.rrNumber)} />
                <LetterField label="New RR Number" value={safe(permLetter.newRRNumber || application.newRRNumber)} />
                <LetterField label="Connection Type" value={safe(conn.connectionType)} />
                <LetterField label="Ward Number" value={safe(loc.wardNumber)} />
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#f8fafc] border border-gray-200 rounded-lg p-6 mb-6">
              <h4 className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4 border-b border-gray-200 pb-2">
                Financial Summary (DCB)
              </h4>
              <div className="space-y-2.5">
                <LetterField label="Financial Year" value={safe(fin.currentFY)} />
                <LetterField label="Opening Balance" value={fin.openingBalance ? 'Rs. ' + fin.openingBalance : 'N/A'} />
                <LetterField label="Principal Amount" value={fin.principalAmount ? 'Rs. ' + fin.principalAmount : 'N/A'} />
                <LetterField label="Interest Amount" value={fin.interestAmount ? 'Rs. ' + fin.interestAmount : 'N/A'} />
              </div>
            </div>

            {/* DSC Block */}
            <div className="border-2 border-[#1f3a5f] rounded-lg p-6 mt-8 bg-[#f8fafc]">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-[#1f3a5f]" />
                <h4 className="text-[14px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                  Digital Signature Certificate (DSC)
                </h4>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-[#1f3a5f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-7 h-7 text-[#1f3a5f]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">
                      <span className="font-semibold">Signed By:</span> {safe(permLetter.dscSignedBy)}
                    </p>
                    <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif] mt-1">
                      <span className="font-semibold">Designation:</span> Commissioner, {safe(header.ulb)} Municipal Corporation
                    </p>
                    <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif] mt-1">
                      <span className="font-semibold">Signed At:</span> {formatDate(permLetter.dscSignedAt)}
                    </p>
                    <p className="text-[13px] text-gray-700 font-['Poppins',sans-serif] mt-1">
                      <span className="font-semibold">Status:</span>{' '}
                      <span className="text-green-700 font-semibold">Valid - Digitally Signed</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-300 text-center">
              <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">
                This is a system-generated document. No physical signature is required.
              </p>
              <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                KMDS - Jalanidhi | Department of Municipal Administration, Government of Karnataka
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-gray-500 mb-1 font-['Poppins',sans-serif]">{label}</label>
      <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{value}</p>
    </div>
  );
}

function LetterField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <span className="text-[13px] font-semibold text-gray-600 font-['Poppins',sans-serif] w-[200px] flex-shrink-0">
        {label}:
      </span>
      <span className="text-[13px] text-gray-900 font-['Poppins',sans-serif]">
        {value}
      </span>
    </div>
  );
}

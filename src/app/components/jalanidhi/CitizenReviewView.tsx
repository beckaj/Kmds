import { useState, useEffect } from 'react';
import { ChevronLeft, User, MapPin, Droplet } from 'lucide-react';
import CitizenBankDetailsForm from './CitizenBankDetailsForm';

interface EstimationRow {
  id: string;
  attribute: string;
  unitOfMeasurement: string;
  amount: string;
}

interface PlumberConnectionData {
  estimationRows: EstimationRow[];
  totalAmount: number;
  siteSketchUploaded: boolean;
  estimateUploaded: boolean;
  comments?: string;
}

interface Application {
  id: string;
  status: string;
  submittedAt: string;
  propertyDetails: {
    district: string;
    ulb: string;
    ulbType: string;
    authorityType: string;
    ownershipType: string;
  };
  applicantDetails: {
    applicantName: string;
    mobile: string;
    email?: string;
    fatherName?: string;
    aadharNumber?: string;
    doorNumber?: string;
    wardNumber?: string;
    street?: string;
    address?: string;
    state?: string;
    district?: string;
    city?: string;
    pincode?: string;
  };
  connectionDetails: {
    connectionType: string;
    propertyType: string;
    propertyTypeCategory?: string;
    flatsOrHouses?: string;
  };
  plumberConnectionData?: PlumberConnectionData;
  plumberDetails?: {
    plumberName: string;
    plumberType?: string;
    firmName?: string;
  };
}

interface CitizenReviewViewProps {
  application: Application;
  onBack: () => void;
}

export default function CitizenReviewView({ application, onBack }: CitizenReviewViewProps) {
  const [showBankDetailsForm, setShowBankDetailsForm] = useState(false);

  const connectionData = application.plumberConnectionData;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Show bank details form if user clicked Next
  if (showBankDetailsForm) {
    return (
      <CitizenBankDetailsForm
        applicationId={application.id}
        onBack={() => setShowBankDetailsForm(false)}
        onSuccess={onBack}
      />
    );
  }

  if (!connectionData) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 font-['Poppins',sans-serif]">
            No connection details available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Applications
      </button>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
          Review Connection Details
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{application.id}</span>
        </p>
        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mt-1">
          Submitted on: {formatDate(application.submittedAt)}
        </p>
      </div>

      {/* Application Summary Card */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
          Application Summary
        </h2>
        
        <div className="space-y-6">
          {/* Property Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Property Details
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">District</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                  {application.propertyDetails.district.replace(/-/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">ULB</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.propertyDetails.ulb.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Ownership Type</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                  {application.propertyDetails.ownershipType}
                </p>
              </div>
            </div>
          </div>

          {/* Applicant Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Applicant Details
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Name</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.applicantDetails.applicantName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Mobile</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                  {application.applicantDetails.mobile}
                </p>
              </div>
              {application.applicantDetails.email && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Email</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.applicantDetails.email}
                  </p>
                </div>
              )}
              {application.applicantDetails.address && (
                <div className="md:col-span-3">
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Address</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.applicantDetails.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Connection Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="w-5 h-5 text-[#1f3a5f]" />
              <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">
                Connection Details
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Connection Type</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                  {application.connectionDetails.connectionType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Property Type</p>
                <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">
                  {application.connectionDetails.propertyType}
                </p>
              </div>
              {application.plumberDetails && application.plumberDetails.plumberName && (
                <div>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Assigned Plumber</p>
                  <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    {application.plumberDetails.plumberName}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Plumber's Connection Details Card */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
            Plumber's Estimation & Documents
          </h2>
        </div>
        <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-4">
          Submitted by: {(application.plumberDetails && application.plumberDetails.plumberName) || 'Plumber'}
        </p>

        <div className="space-y-6">
          {/* Uploaded Documents Section */}
          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Uploaded Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Site Sketch */}
              <div className={`rounded-lg p-5 transition-all ${
                connectionData.siteSketchUploaded 
                  ? 'border-2 border-green-500 bg-green-50' 
                  : 'border-2 border-gray-300 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-['Poppins',sans-serif] font-semibold text-[15px] text-gray-900 mb-1">
                      Site Sketch
                    </p>
                    <p className="text-xs text-gray-600 font-['Poppins',sans-serif]">
                      Layout and measurement details
                    </p>
                  </div>
                  {connectionData.siteSketchUploaded && (
                    <div className="flex items-center gap-1 bg-green-600 text-white px-2.5 py-1 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-xs font-['Poppins',sans-serif] font-medium">Uploaded</span>
                    </div>
                  )}
                </div>
                
                {connectionData.siteSketchUploaded ? (
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white border border-green-600 text-green-700 px-4 py-2 rounded-md font-['Poppins',sans-serif] font-medium text-[13px] hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      View
                    </button>
                    <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md font-['Poppins',sans-serif] font-medium text-[13px] hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                      Download
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-dashed border-gray-400 rounded-md px-4 py-3 text-center">
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif]">
                      Not uploaded yet
                    </p>
                  </div>
                )}
              </div>

              {/* Estimate */}
              <div className={`rounded-lg p-5 transition-all ${
                connectionData.estimateUploaded 
                  ? 'border-2 border-green-500 bg-green-50' 
                  : 'border-2 border-gray-300 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-['Poppins',sans-serif] font-semibold text-[15px] text-gray-900 mb-1">
                      Estimate Document
                    </p>
                    <p className="text-xs text-gray-600 font-['Poppins',sans-serif]">
                      Cost breakdown and quotation
                    </p>
                  </div>
                  {connectionData.estimateUploaded && (
                    <div className="flex items-center gap-1 bg-green-600 text-white px-2.5 py-1 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-xs font-['Poppins',sans-serif] font-medium">Uploaded</span>
                    </div>
                  )}
                </div>
                
                {connectionData.estimateUploaded ? (
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white border border-green-600 text-green-700 px-4 py-2 rounded-md font-['Poppins',sans-serif] font-medium text-[13px] hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      View
                    </button>
                    <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md font-['Poppins',sans-serif] font-medium text-[13px] hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                      Download
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-dashed border-gray-400 rounded-md px-4 py-3 text-center">
                    <p className="text-sm text-gray-500 font-['Poppins',sans-serif]">
                      Not uploaded yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estimation Details Section */}
          <div>
            <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
              Estimation Details
            </h3>

            {/* Simple Clean Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              {/* Table Header */}
              <div className="bg-gray-50 grid grid-cols-[60px_2fr_1.5fr_1fr] gap-4 px-6 py-3 border-b border-gray-200">
                <div className="font-['Poppins',sans-serif] font-semibold text-[13px] text-gray-700 text-center">
                  S.No
                </div>
                <div className="font-['Poppins',sans-serif] font-semibold text-[13px] text-gray-700">
                  Attributes
                </div>
                <div className="font-['Poppins',sans-serif] font-semibold text-[13px] text-gray-700 text-center">
                  Unit of Measurement
                </div>
                <div className="font-['Poppins',sans-serif] font-semibold text-[13px] text-gray-700 text-right">
                  Amount (₹)
                </div>
              </div>

              {/* Table Body */}
              <div className="bg-white">
                {connectionData.estimationRows.map((row, index) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[60px_2fr_1.5fr_1fr] gap-4 px-6 py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="font-['Poppins',sans-serif] text-[14px] text-gray-600 text-center">
                      {index + 1}
                    </div>
                    <div className="font-['Poppins',sans-serif] text-[14px] text-gray-900">
                      {row.attribute}
                    </div>
                    <div className="font-['Poppins',sans-serif] text-[14px] text-gray-700 text-center">
                      {row.unitOfMeasurement}
                    </div>
                    <div className="font-['Poppins',sans-serif] text-[14px] text-gray-900 text-right">
                      ₹{parseFloat(row.amount).toFixed(2)}
                    </div>
                  </div>
                ))}

                {/* Total Amount Row */}
                <div className="bg-gray-50 grid grid-cols-[60px_2fr_1.5fr_1fr] gap-4 px-6 py-4 border-t-2 border-gray-300">
                  <div></div>
                  <div className="font-['Poppins',sans-serif] font-semibold text-[15px] text-[#1f3a5f]">
                    Total Estimated Amount
                  </div>
                  <div></div>
                  <div className="font-['Poppins',sans-serif] font-bold text-[16px] text-[#1f3a5f] text-right">
                    ₹{connectionData.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plumber Comments Section */}
          {connectionData.comments && (
            <div>
              <h3 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif] mb-4 pb-2 border-b border-gray-200">
                Plumber's Remarks
              </h3>
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <p className="font-['Poppins',sans-serif] text-[14px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {connectionData.comments}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={onBack}
              className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Back
            </button>

            <button
              onClick={() => setShowBankDetailsForm(true)}
              className="px-8 py-3 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-semibold text-[15px] hover:bg-[#152d4a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
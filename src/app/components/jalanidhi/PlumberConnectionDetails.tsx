import { useState } from 'react';
import { ChevronLeft, Plus, Trash2, Upload } from 'lucide-react';
import { GovInput } from '../ui/gov-input';

interface EstimationRow {
  id: string;
  attribute: string;
  unitOfMeasurement: string;
  amount: string;
}

interface PlumberConnectionDetailsProps {
  application: any; // Application object
  onBack: () => void;
  onSubmit: (data: ConnectionDetailsData) => void;
  processing?: boolean;
}

export interface ConnectionDetailsData {
  siteSketch: File | null;
  estimate: File | null;
  estimationRows: EstimationRow[];
  totalAmount: number;
  comments: string;
}

export default function PlumberConnectionDetails({
  application,
  onBack,
  onSubmit,
  processing = false,
}: PlumberConnectionDetailsProps) {
  const [siteSketch, setSiteSketch] = useState<File | null>(null);
  const [estimate, setEstimate] = useState<File | null>(null);
  const [estimationRows, setEstimationRows] = useState<EstimationRow[]>([
    { id: '1', attribute: 'Labor Charges', unitOfMeasurement: '3 members', amount: '600' },
  ]);
  const [comments, setComments] = useState<string>('');

  const handleFileChange = (type: 'siteSketch' | 'estimate', file: File | null) => {
    if (type === 'siteSketch') {
      setSiteSketch(file);
    } else {
      setEstimate(file);
    }
  };

  const addRow = () => {
    const newRow: EstimationRow = {
      id: Date.now().toString(),
      attribute: '',
      unitOfMeasurement: '',
      amount: '',
    };
    setEstimationRows([...estimationRows, newRow]);
  };

  const deleteRow = (id: string) => {
    if (estimationRows.length > 1) {
      setEstimationRows(estimationRows.filter(row => row.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof EstimationRow, value: string) => {
    setEstimationRows(
      estimationRows.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const calculateTotal = () => {
    return estimationRows.reduce((sum, row) => {
      const amount = parseFloat(row.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const handleSave = () => {
    // Validate
    if (!siteSketch || !estimate) {
      alert('Please upload both Site Sketch and Estimate documents');
      return;
    }

    const hasEmptyFields = estimationRows.some(
      row => !row.attribute || !row.unitOfMeasurement || !row.amount
    );

    if (hasEmptyFields) {
      alert('Please fill in all estimation details');
      return;
    }

    const data: ConnectionDetailsData = {
      siteSketch,
      estimate,
      estimationRows,
      totalAmount: calculateTotal(),
      comments,
    };

    onSubmit(data);
  };

  const totalAmount = calculateTotal();

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
          Connection Details
        </h1>
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Application ID: <span className="font-semibold">{application.id}</span>
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="p-6 space-y-8">
          {/* Upload Documents Section */}
          <div>
            <h2 className="text-xl font-semibold text-[#414141] font-['Poppins',sans-serif] mb-6">
              Upload Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Site Sketch Upload */}
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-[#0078a0] transition-colors">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 bg-[#e2e6ec] rounded-lg flex items-center justify-center">
                    <Upload className="w-6 h-6 text-[#0078a0]" />
                  </div>
                  <div className="text-center">
                    <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49] mb-2">
                      Site Sketch <span className="text-red-500">*</span>
                    </p>
                    {siteSketch ? (
                      <p className="text-sm text-green-600 font-['Poppins',sans-serif] mb-2">
                        ✓ {siteSketch.name}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-2">
                        No file chosen
                      </p>
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('siteSketch', (e.target.files && e.target.files[0]) || null)}
                      />
                      <span className="inline-block px-5 py-2 bg-white border border-[rgba(0,120,160,0.4)] text-[#0078a0] rounded-full font-['Poppins',sans-serif] font-medium text-[12px] hover:bg-[#0078a0] hover:text-white transition-colors">
                        Upload Document
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Estimate Upload */}
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-[#0078a0] transition-colors">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 bg-[#e2e6ec] rounded-lg flex items-center justify-center">
                    <Upload className="w-6 h-6 text-[#0078a0]" />
                  </div>
                  <div className="text-center">
                    <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49] mb-2">
                      Estimate <span className="text-red-500">*</span>
                    </p>
                    {estimate ? (
                      <p className="text-sm text-green-600 font-['Poppins',sans-serif] mb-2">
                        ✓ {estimate.name}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-2">
                        No file chosen
                      </p>
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('estimate', (e.target.files && e.target.files[0]) || null)}
                      />
                      <span className="inline-block px-5 py-2 bg-white border border-[rgba(0,120,160,0.4)] text-[#0078a0] rounded-full font-['Poppins',sans-serif] font-medium text-[12px] hover:bg-[#0078a0] hover:text-white transition-colors">
                        Upload Document
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Estimation Details Section */}
          <div>
            <h2 className="text-xl font-semibold text-[#414141] font-['Poppins',sans-serif] mb-6">
              Estimation Details
            </h2>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-300 shadow-sm">
              {/* Table Header */}
              <div className="bg-[#1f3a5f] grid grid-cols-[80px_2fr_1.5fr_1fr_100px] gap-4 px-6 py-4">
                <div className="font-['Poppins',sans-serif] font-semibold text-[13px] text-white uppercase tracking-wider text-center">
                  S.No
                </div>
                <div className="font-['Poppins',sans-serif] font-semibold text-[13px] text-white uppercase tracking-wider">
                  Attributes
                </div>
                <div className="font-['Poppins',sans-serif] font-semibold text-[13px] text-white uppercase tracking-wider text-center">
                  Unit of Measurement
                </div>
                <div className="font-['Poppins',sans-serif] font-semibold text-[13px] text-white uppercase tracking-wider text-center">
                  Amount (₹)
                </div>
                <div className="font-['Poppins',sans-serif] font-semibold text-[13px] text-white uppercase tracking-wider text-center">
                  Action
                </div>
              </div>

              {/* Table Body */}
              <div className="bg-white">
                {estimationRows.map((row, index) => (
                  <div key={row.id}>
                    <div className={`grid grid-cols-[80px_2fr_1.5fr_1fr_100px] gap-4 px-6 py-4 items-center ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                      {/* Serial Number */}
                      <div className="font-['Poppins',sans-serif] text-[14px] font-semibold text-[#1f3a5f] text-center">
                        {index + 1}
                      </div>

                      {/* Attribute Input */}
                      <input
                        type="text"
                        value={row.attribute}
                        onChange={(e) => updateRow(row.id, 'attribute', e.target.value)}
                        placeholder="Enter attribute name"
                        className="px-4 py-2.5 border-2 border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1f3a5f] focus:ring-2 focus:ring-[#1f3a5f]/20 hover:border-gray-400 transition-colors"
                      />

                      {/* Unit of Measurement Input */}
                      <input
                        type="text"
                        value={row.unitOfMeasurement}
                        onChange={(e) => updateRow(row.id, 'unitOfMeasurement', e.target.value)}
                        placeholder="e.g., 3 members"
                        className="px-4 py-2.5 border-2 border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 placeholder-gray-400 text-center focus:outline-none focus:border-[#1f3a5f] focus:ring-2 focus:ring-[#1f3a5f]/20 hover:border-gray-400 transition-colors"
                      />

                      {/* Amount Input */}
                      <input
                        type="number"
                        value={row.amount}
                        onChange={(e) => updateRow(row.id, 'amount', e.target.value)}
                        placeholder="0.00"
                        className="px-4 py-2.5 border-2 border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 placeholder-gray-400 text-center focus:outline-none focus:border-[#1f3a5f] focus:ring-2 focus:ring-[#1f3a5f]/20 hover:border-gray-400 transition-colors"
                      />

                      {/* Delete Button */}
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => deleteRow(row.id)}
                          disabled={estimationRows.length === 1}
                          className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          title="Delete row"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total Amount Row */}
                <div className="bg-[rgb(235,240,255)] grid grid-cols-[80px_2fr_1.5fr_1fr_100px] gap-4 px-6 py-4">
                  <div></div>
                  <div className="font-['Poppins',sans-serif] font-bold text-[15px] text-[rgb(43,44,51)] uppercase">
                    Total Estimated Amount
                  </div>
                  <div></div>
                  <div className="font-['Poppins',sans-serif] font-bold text-[16px] text-[rgb(33,33,33)] text-center">
                    ₹ {totalAmount.toFixed(2)}
                  </div>
                  <div></div>
                </div>
              </div>
            </div>

            {/* Add New Row Button - Outside Table */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={addRow}
                className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New Row
              </button>
            </div>

            {/* Comments/Remarks Section */}
            <div className="mt-8">
              <label className="block mb-3">
                <span className="font-['Poppins',sans-serif] font-semibold text-[15px] text-[#414141]">
                  Remarks/Comments <span className="text-gray-400 font-normal text-[13px]">(Optional)</span>
                </span>
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter any additional remarks or comments regarding the estimation..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1f3a5f] focus:ring-2 focus:ring-[#1f3a5f]/20 hover:border-gray-400 transition-colors resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="font-['Poppins',sans-serif] text-[12px] text-gray-500">
                  Add any additional notes or special instructions
                </p>
                <p className="font-['Poppins',sans-serif] text-[12px] text-gray-500">
                  {comments.length}/500 characters
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={onBack}
              disabled={processing}
              className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={processing}
              className="px-8 py-3 bg-[#1f3a5f] text-white rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-[#152d4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {processing ? 'Saving...' : 'Save & Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
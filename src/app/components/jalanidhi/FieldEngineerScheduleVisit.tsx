import { useState } from 'react';
import { Calendar, Save, ArrowLeft } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface FieldEngineerScheduleVisitProps {
  applicationId: string;
}

export default function FieldEngineerScheduleVisit({ applicationId }: FieldEngineerScheduleVisitProps) {
  const [visitDate, setVisitDate] = useState('');
  const [visitPurpose, setVisitPurpose] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const visitPurposes = [
    'Verification',
    'Site Inspection',
    'Property Assessment',
    'Document Verification',
    'Technical Evaluation',
    'Measurement Survey',
  ];

  const handleSave = async () => {
    if (!visitDate || !visitPurpose) {
      setError('Please fill all fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/field-engineer/schedule-visit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId,
            visitDate,
            visitPurpose,
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        alert('Visit scheduled successfully! This will be synced to the mobile application.');
        // Navigate back to dashboard
        const event = new CustomEvent('navigate', { 
          detail: '/jalanidhi/field-engineer/tap-connection/new-requests' 
        });
        window.dispatchEvent(event);
      } else {
        setError(data.error || 'Failed to schedule visit');
      }
    } catch (err) {
      console.error('Error scheduling visit:', err);
      setError('Failed to schedule visit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    const event = new CustomEvent('navigate', { 
      detail: `/jalanidhi/field-engineer/tap-connection/view/${applicationId}` 
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#1f3a5f] hover:text-[#2d4a6f] mb-4 font-['Poppins',sans-serif]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Application
        </button>
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
          Schedule Field Visit
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
          Schedule a field verification visit for this application
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Visit Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-['Poppins',sans-serif]">
              Visit Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent font-['Poppins',sans-serif]"
              />
            </div>
          </div>

          {/* Visit Purpose */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-['Poppins',sans-serif]">
              Visit Purpose <span className="text-red-500">*</span>
            </label>
            <select
              value={visitPurpose}
              onChange={(e) => setVisitPurpose(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent font-['Poppins',sans-serif]"
            >
              <option value="">Select visit purpose</option>
              {visitPurposes.map((purpose) => (
                <option key={purpose} value={purpose}>
                  {purpose}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-['Poppins',sans-serif]">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-['Poppins',sans-serif]">
              <strong>Note:</strong> Once saved, this visit information will be synced to the mobile application 
              for field verification. You will be able to complete the verification using the mobile app.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleBack}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-['Poppins',sans-serif] font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#1f3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors font-['Poppins',sans-serif] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save & Schedule Visit
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

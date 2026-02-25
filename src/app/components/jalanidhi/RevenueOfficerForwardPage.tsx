import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface RevenueOfficerForwardPageProps {
  applicationId: string;
}

export default function RevenueOfficerForwardPage({ applicationId }: RevenueOfficerForwardPageProps) {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      alert('Please enter a comment before forwarding');
      return;
    }

    setSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Show success message
      alert('✅ Application forwarded to Field Engineer successfully!\\n\\nThe Field Engineer will review the application and schedule a site visit.');
      
      // Navigate back to dashboard
      const event = new CustomEvent('navigate', { 
        detail: '/jalanidhi/revenue-officer/tap-connection/new-requests' 
      });
      window.dispatchEvent(event);
      
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
          Forward to Field Engineer
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
          Application ID: {applicationId}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Comment Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-['Poppins',sans-serif] mb-2">
              Comments / Instructions for Field Engineer *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent font-['Poppins',sans-serif] text-sm"
              placeholder="Enter your review comments and instructions for the field engineer..."
            />
            <p className="mt-1 text-xs text-gray-500 font-['Poppins',sans-serif]">
              Please provide clear instructions for the field verification
            </p>
          </div>

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-gray-700 font-['Poppins',sans-serif] space-y-1">
              <li>• Application will be forwarded to Field Engineer</li>
              <li>• Field Engineer will review your comments</li>
              <li>• Field Engineer will schedule a site visit</li>
              <li>• You'll be notified once the field verification is complete</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={() => {
                const event = new CustomEvent('navigate', { 
                  detail: `/jalanidhi/revenue-officer/tap-connection/view/${applicationId}` 
                });
                window.dispatchEvent(event);
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-['Poppins',sans-serif] font-medium"
            >
              Go Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !comment.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-[#1f3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors font-['Poppins',sans-serif] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Forwarding...
                </>
              ) : (
                <>
                  Forward Application
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
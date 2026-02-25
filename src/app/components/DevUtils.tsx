import { useState } from 'react';
import { Trash2, RefreshCw, Database, Wrench } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface DevUtilsProps {
  onClose: () => void;
}

export default function DevUtils({ onClose }: DevUtilsProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isCreatingPlDummy, setIsCreatingPlDummy] = useState(false);
  const [plDummyQueue, setPlDummyQueue] = useState('caseworker');
  const [plDummyType, setPlDummyType] = useState('individual');

  const clearAllApplications = async () => {
    try {
      setIsClearing(true);
      console.log('🧹 Starting application data clear...');

      // Step 1: Clear data from server
      console.log('Step 1: Clearing server data...');
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-698be164/dev/clear-applications`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Server response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to clear server data');
      }

      console.log(`✅ Server data cleared: ${data.deletedCount} keys deleted`);

      // Step 2: Clear localStorage
      console.log('Step 2: Clearing localStorage...');
      const keysToRemove = [
        // Application data
        'plumber_applications',
        'appStatus_applications',
        'caseworker_applications',
        'fieldEngineer_applications',
        'revenueOfficer_applications',
        'commissionerDash_applications',
        // Plumber state
        'plumber_searchTerm',
        'plumber_selectedApplication',
        'plumber_showSummaryView',
        'plumber_showConnectionDetails',
        'plumber_actionApp',
        'plumber_activeTab',
        // Citizen/Application Status state
        'appStatus_searchTerm',
        'appStatus_selectedApplication',
        'appStatus_showSummaryView',
        'appStatus_showCitizenReviewView',
        'appStatus_showCitizenPaymentView',
        'appStatus_showCertificateView',
        // Caseworker state
        'caseworker_selectedApplication',
        'caseworker_searchQuery',
        'caseworker_statusFilter',
        // Field Engineer state
        'fieldEngineer_selectedApp',
        // Commissioner state
        'commissionerDash_filter',
        // Form data
        'tapConnectionFormStep',
        'tapConnectionPropertyId',
        'tapConnectionPropertyVerified',
        'tapConnectionVerifiedPropertyData',
        'tapConnectionAddressSameAsProperty',
        'tapConnectionFormData',
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`  ✓ Removed: ${key}`);
      });

      console.log('✅ localStorage cleared');

      alert(`✅ All application data cleared successfully!\n\n${data.deletedCount} records deleted from server\n${keysToRemove.length} localStorage keys cleared\n\nReloading page...`);
      
      // Close the modal first
      onClose();
      
      // Force reload after a short delay
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 500);

    } catch (error) {
      console.error('❌ Error clearing applications:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to clear applications'}\n\nPlease check the console for details.`);
      setIsClearing(false);
    }
  };

  const clearAllData = () => {
    localStorage.clear();
    alert('✅ All localStorage data cleared!\n\nReloading page...');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const createDummyPlumberLicense = async () => {
    try {
      setIsCreatingPlDummy(true);
      console.log(`[DEV] Creating dummy plumber license app for ${plDummyQueue} queue, type: ${plDummyType}...`);

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-698be164/dev/create-dummy-plumber-license`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetQueue: plDummyQueue,
          registrationType: plDummyType,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create dummy app');
      }

      const queueLabels: Record<string, string> = {
        'caseworker': 'Caseworker',
        'field_engineer': 'Field Engineer',
        'commissioner': 'Commissioner (Review)',
        'pending_payment': 'Citizen (Pending Payment)',
        'commissioner_payment': 'Commissioner (Certificate Gen)',
        'approved_with_license': 'Approved (License Issued)',
        'rejected': 'Rejected',
        'sendback_at_fe': 'Field Engineer (Sent Back)',
      };

      alert(`Dummy Plumber License App Created!\n\nApp ID: ${data.applicationId}\nStatus: ${data.status}\nQueue: ${queueLabels[plDummyQueue] || plDummyQueue}\nType: ${plDummyType === 'individual' ? 'Individual' : 'Contractor'}\n\nRefresh the target dashboard to see it.`);
    } catch (error) {
      console.error('[DEV] Error creating dummy plumber license:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to create dummy app'}`);
    } finally {
      setIsCreatingPlDummy(false);
    }
  };

  const recoverRevenueOfficerApplications = async () => {
    try {
      setIsRecovering(true);
      console.log('🔄 Recovering Revenue Officer applications...');

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-698be164/dev/recover-revenue-officer-applications`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Recovery response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to recover applications');
      }

      console.log(`✅ Recovered ${data.recovered} applications`);

      alert(`✅ Recovery Complete!\n\n${data.recovered} application(s) restored to Revenue Officer queue\nTotal applications in queue: ${data.totalInQueue}\n\nRefreshing page...`);
      
      // Reload to show recovered applications
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('❌ Error recovering applications:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to recover applications'}\n\nPlease check the console for details.`);
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#1f3a5f]" />
            <h2 className="text-[#1f3a5f] text-lg font-semibold font-['Poppins',sans-serif]">
              Developer Utilities
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
            Use these utilities to reset application data for testing purposes.
          </p>

          {/* Clear Applications Button */}
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-['Poppins',sans-serif] font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Applications
          </button>

          {/* Clear All Data Button */}
          <button
            onClick={clearAllData}
            className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-['Poppins',sans-serif] font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Clear All Data & Logout
          </button>

          {/* Recover Revenue Officer Applications Button */}
          <button
            onClick={recoverRevenueOfficerApplications}
            disabled={isRecovering}
            className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-['Poppins',sans-serif] font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRecovering ? 'animate-spin' : ''}`} />
            {isRecovering ? 'Recovering...' : 'Recover Revenue Officer Applications'}
          </button>

          {/* Plumber License Dummy App Creator */}
          <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-purple-700" />
              <p className="text-sm font-semibold text-purple-800 font-['Poppins',sans-serif]">
                Create Dummy Plumber License App
              </p>
            </div>
            <div className="flex gap-2 mb-3">
              <select
                value={plDummyQueue}
                onChange={(e) => setPlDummyQueue(e.target.value)}
                className="flex-1 px-3 py-2 border border-purple-300 rounded-md text-xs font-['Poppins',sans-serif] bg-white"
              >
                <option value="caseworker">Caseworker Queue</option>
                <option value="field_engineer">Field Engineer Queue</option>
                <option value="commissioner">Commissioner (Review)</option>
                <option value="pending_payment">Citizen (Pending Payment)</option>
                <option value="commissioner_payment">Commissioner (Certificate Gen)</option>
                <option value="approved_with_license">Approved (License Issued)</option>
                <option value="rejected">Rejected</option>
                <option value="sendback_at_fe">FE Queue (Sent Back)</option>
              </select>
              <select
                value={plDummyType}
                onChange={(e) => setPlDummyType(e.target.value)}
                className="w-28 px-3 py-2 border border-purple-300 rounded-md text-xs font-['Poppins',sans-serif] bg-white"
              >
                <option value="individual">Individual</option>
                <option value="contractor">Contractor</option>
              </select>
            </div>
            <button
              onClick={createDummyPlumberLicense}
              disabled={isCreatingPlDummy}
              className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-['Poppins',sans-serif] font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wrench className={`w-4 h-4 ${isCreatingPlDummy ? 'animate-spin' : ''}`} />
              {isCreatingPlDummy ? 'Creating...' : 'Create Dummy Plumber License App'}
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800 font-['Poppins',sans-serif]">
              <strong>Clear All Applications:</strong> Removes all application data from all role dashboards while keeping login sessions intact.
            </p>
            <p className="text-xs text-blue-800 font-['Poppins',sans-serif] mt-2">
              <strong>Clear All Data & Logout:</strong> Completely resets the application including login sessions.
            </p>
            <p className="text-xs text-blue-800 font-['Poppins',sans-serif] mt-2">
              <strong>Recover Revenue Officer:</strong> Restores applications to the Revenue Officer queue.
            </p>
            <p className="text-xs text-blue-800 font-['Poppins',sans-serif] mt-2">
              <strong>Dummy Plumber License:</strong> Creates a test plumber license app at any stage of the workflow for quick testing.
            </p>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="px-6 pb-6">
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <p className="text-sm text-yellow-800 font-['Poppins',sans-serif] font-semibold mb-3">
                ⚠️ Are you sure you want to clear all applications?
              </p>
              <p className="text-xs text-yellow-700 font-['Poppins',sans-serif] mb-4">
                This will remove all application data from:
              </p>
              <ul className="text-xs text-yellow-700 font-['Poppins',sans-serif] space-y-1 mb-4 ml-4 list-disc">
                <li>Citizen Application Status</li>
                <li>Plumber Dashboard</li>
                <li>Caseworker Dashboard</li>
                <li>Field Engineer Dashboard</li>
                <li>Revenue Officer Dashboard</li>
                <li>Commissioner Dashboard</li>
              </ul>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    clearAllApplications();
                    setShowConfirm(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-['Poppins',sans-serif] text-sm font-medium transition-colors"
                >
                  Yes, Clear All
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-['Poppins',sans-serif] text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
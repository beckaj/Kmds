/**
 * Database Reset Utility
 * Clears ALL application data from localStorage across all roles
 */

export function resetAllApplications() {
  console.log('🗑️ Starting database reset...');
  
  // List of all localStorage keys used by the application
  const keysToDelete = [
    // Citizen/Applicant keys
    'appStatus_applications',
    'appStatus_searchTerm',
    'appStatus_selectedApplication',
    'appStatus_showSummaryView',
    'appStatus_showCitizenReviewView',
    'appStatus_showCitizenPaymentView',
    'appStatus_showCertificateView',
    
    // Plumber keys
    'plumber_applications',
    'plumber_searchTerm',
    'plumber_selectedApplication',
    'plumber_showSummaryView',
    'plumber_showConnectionDetails',
    'plumber_actionApp',
    'plumber_activeTab',
    
    // Caseworker keys
    'caseworker_applications',
    'caseworker_selectedApplication',
    'caseworker_searchQuery',
    'caseworker_statusFilter',
    
    // Revenue Officer keys
    'revenueOfficer_applications',
    'revenueOfficer_selectedApplication',
    
    // Field Engineer keys
    'fieldEngineer_applications',
    'fieldEngineer_selectedApp',
    
    // Commissioner keys
    'commissionerDash_applications',
    'commissionerDash_filter',
  ];
  
  let deletedCount = 0;
  
  keysToDelete.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      deletedCount++;
      console.log(`✅ Deleted: ${key}`);
    }
  });
  
  console.log(`🎉 Database reset complete! Deleted ${deletedCount} keys.`);
  console.log('📝 Note: User login data (userData, loggedInUser) was preserved.');
  
  return {
    success: true,
    deletedCount,
    message: `Successfully deleted ${deletedCount} application records`
  };
}

// Export for console access
if (typeof window !== 'undefined') {
  (window as any).resetAllApplications = resetAllApplications;
}

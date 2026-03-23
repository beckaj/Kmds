import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// Main application instance
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ========================================
// DEVELOPER UTILITY ENDPOINTS
// ========================================

// Create dummy application for demo purposes
app.post("/make-server-698be164/dev/create-dummy-application", async (c) => {
  try {
    const body = await c.req.json();
    const { application, role } = body;
    
    if (!application || !application.id) {
      return c.json({ success: false, error: 'Application data required' }, 400);
    }
    
    console.log(`[CREATE DUMMY] Creating dummy application for role ${role}: ${application.id}`);
    
    // Save the application
    await kv.set(`application:${application.id}`, application);
    
    // Add to appropriate queue based on role
    if (role === 'caseworker') {
      const queue = await kv.get('caseworker:queue') || [];
      if (!queue.includes(application.id)) {
        queue.push(application.id);
      }
      await kv.set('caseworker:queue', queue);
      console.log(`[CREATE DUMMY] Added to caseworker:queue`);
    } else if (role === 'revenue_officer') {
      const queue = await kv.get('revenue_officer:queue') || [];
      if (!queue.includes(application.id)) {
        queue.push(application.id);
      }
      await kv.set('revenue_officer:queue', queue);
      console.log(`[CREATE DUMMY] Added to revenue_officer:queue`);
    } else if (role === 'field_engineer') {
      const queue = await kv.get('field_engineer:queue') || [];
      if (!queue.includes(application.id)) {
        queue.push(application.id);
      }
      await kv.set('field_engineer:queue', queue);
      console.log(`[CREATE DUMMY] Added to field_engineer:queue`);
    } else if (role === 'commissioner') {
      const queue = await kv.get('commissioner:queue') || [];
      if (!queue.includes(application.id)) {
        queue.push(application.id);
      }
      await kv.set('commissioner:queue', queue);
      console.log(`[CREATE DUMMY] Added to commissioner:queue`);
    }
    
    return c.json({ 
      success: true, 
      message: 'Dummy application created successfully',
      applicationId: application.id 
    });
    
  } catch (error) {
    console.log(`[CREATE DUMMY] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete specific application by ID or applicationNo
app.post("/make-server-698be164/dev/delete-application", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId } = body;
    
    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID required' }, 400);
    }
    
    console.log(`[DELETE APP] Deleting application: ${applicationId}`);
    
    // Find the application (check both application: and plumber_license: prefixes)
    const allApps = await kv.getByPrefix('application:');
    const allPlumberLicenseApps = await kv.getByPrefix('plumber_license:');
    const combinedApps = [...allApps, ...allPlumberLicenseApps];
    const application = combinedApps.find(app => 
      app.id === applicationId || 
      app.applicationNo === applicationId
    );
    
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    
    // Delete from the correct prefix
    const isPlumberLicense = application.applicationType === 'plumber_license';
    const appKey = isPlumberLicense ? `plumber_license:${application.id}` : `application:${application.id}`;
    
    // Delete the application
    await kv.del(appKey);
    console.log(`[DELETE APP] Deleted: ${appKey}`);
    
    // Remove from all queues (including plumber license queues)
    const queues = [
      'field_engineer:queue',
      'revenue_officer:queue', 
      'caseworker:queue',
      'commissioner:queue',
      'mobile:sync_queue',
      'caseworker:plumber_license_queue',
      'field_engineer:plumber_license_queue',
      'commissioner:plumber_license_queue'
    ];
    
    for (const queueKey of queues) {
      const queue = await kv.get(queueKey) || [];
      const updated = queue.filter((id: string) => !id.includes(application.id));
      if (updated.length !== queue.length) {
        await kv.set(queueKey, updated);
        console.log(`[DELETE APP] Removed from ${queueKey}`);
      }
    }
    
    return c.json({ 
      success: true, 
      message: 'Application deleted successfully',
      deletedId: application.id,
      deletedApplicationNo: application.applicationNo
    });
    
  } catch (error) {
    console.log(`[DELETE APP] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Patch specific fields of an application
app.post("/make-server-698be164/dev/patch-application", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, patch } = body;

    if (!applicationId || !patch) {
      return c.json({ success: false, error: 'applicationId and patch object are required' }, 400);
    }

    console.log(`[PATCH APP] Patching application: ${applicationId}, fields:`, Object.keys(patch));

    let application = await kv.get(`application:${applicationId}`);
    if (!application) {
      // Try by applicationNo
      const allApps = await kv.getByPrefix('application:');
      application = allApps.find((app: any) => app.applicationNo === applicationId || app.id === applicationId);
    }

    if (!application) {
      return c.json({ success: false, error: `Application not found: ${applicationId}` }, 404);
    }

    // Deep merge patch into application
    for (const key of Object.keys(patch)) {
      if (typeof patch[key] === 'object' && patch[key] !== null && !Array.isArray(patch[key]) && typeof application[key] === 'object' && application[key] !== null) {
        application[key] = { ...application[key], ...patch[key] };
      } else {
        application[key] = patch[key];
      }
    }

    application.updatedAt = new Date().toISOString();
    await kv.set(`application:${application.id}`, application);

    console.log(`[PATCH APP] Successfully patched application: ${application.id}`);
    return c.json({
      success: true,
      message: `Application ${application.id} patched successfully`,
      updatedFields: Object.keys(patch),
      connectionDetails: application.connectionDetails,
    });
  } catch (error) {
    console.log(`[PATCH APP] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Clear all application data (for testing purposes)
app.post("/make-server-698be164/dev/clear-applications", async (c) => {
  try {
    console.log('🧹 Clearing all application data...');

    // We need to query the database directly to get all keys with specific prefixes
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    );

    // Get all keys that match our patterns
    const prefixes = [
      'application:',
      'citizen:',
      'plumber:',
      'plumber_license:',
      'caseworker:',
      'field_engineer:',
      'field-engineer:',
      'revenue_officer:',
      'revenue-officer:',
      'commissioner:',
      'mobile:',
      'property:',
    ];

    let allKeysToDelete: string[] = [];

    // Query for each prefix
    for (const prefix of prefixes) {
      const { data, error } = await supabase
        .from('kv_store_698be164')
        .select('key')
        .like('key', `${prefix}%`);
      
      if (error) {
        console.error(`Error querying keys with prefix ${prefix}:`, error);
        continue;
      }

      if (data && data.length > 0) {
        const keys = data.map(item => item.key);
        allKeysToDelete.push(...keys);
        console.log(`Found ${keys.length} keys with prefix '${prefix}':`, keys);
      }
    }

    console.log(`Total keys to delete: ${allKeysToDelete.length}`);

    // Delete all keys
    if (allKeysToDelete.length > 0) {
      await kv.mdel(allKeysToDelete);
      console.log(`✅ Deleted ${allKeysToDelete.length} keys`);
    } else {
      console.log('No keys to delete');
    }

    console.log('✅ All application data cleared successfully');
    return c.json({ 
      success: true, 
      message: 'All application data cleared',
      deletedCount: allKeysToDelete.length 
    });
  } catch (error) {
    console.error('❌ Error clearing application data:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// GET endpoint for easier browser access
app.get("/make-server-698be164/dev/clear-applications", async (c) => {
  try {
    console.log('🧹 Clearing all application data (via GET)...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    );

    const prefixes = [
      'application:',
      'citizen:',
      'plumber:',
      'plumber_license:',
      'caseworker:',
      'field_engineer:',
      'field-engineer:',
      'revenue_officer:',
      'revenue-officer:',
      'commissioner:',
      'mobile:',
      'property:',
    ];

    let allKeysToDelete: string[] = [];

    for (const prefix of prefixes) {
      const { data, error } = await supabase
        .from('kv_store_698be164')
        .select('key')
        .like('key', `${prefix}%`);
      
      if (error) {
        console.error(`Error querying keys with prefix ${prefix}:`, error);
        continue;
      }

      if (data && data.length > 0) {
        const keys = data.map(item => item.key);
        allKeysToDelete.push(...keys);
        console.log(`Found ${keys.length} keys with prefix '${prefix}'`);
      }
    }

    console.log(`Total keys to delete: ${allKeysToDelete.length}`);

    if (allKeysToDelete.length > 0) {
      await kv.mdel(allKeysToDelete);
      console.log(`✅ Deleted ${allKeysToDelete.length} keys`);
    } else {
      console.log('No keys to delete');
    }

    console.log('✅ All application data cleared successfully');
    
    // Return HTML response for browser
    return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Database Cleared</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 100px auto;
            padding: 20px;
            text-align: center;
          }
          .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          h1 { color: #155724; margin: 0 0 10px 0; }
          .count { font-size: 48px; font-weight: bold; color: #28a745; }
          .label { color: #666; font-size: 14px; }
          button {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
          }
          button:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <div class="success">
          <h1>✅ Database Cleared Successfully!</h1>
          <div class="count">${allKeysToDelete.length}</div>
          <div class="label">records deleted</div>
        </div>
        <p>All application data has been cleared from the database.</p>
        <p>You can now test the workflow from scratch.</p>
        <button onclick="window.close()">Close</button>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Error clearing application data:', error);
    return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 100px auto;
            padding: 20px;
            text-align: center;
          }
          .error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 20px;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>❌ Error</h1>
          <p>${String(error)}</p>
        </div>
      </body>
      </html>
    `);
  }
});

// Recovery endpoint: Restore applications to Revenue Officer queue
app.post("/make-server-698be164/dev/recover-revenue-officer-applications", async (c) => {
  try {
    console.log('[RECOVERY] ======== RECOVERING REVENUE OFFICER APPLICATIONS ========');
    
    // Get all applications
    const allApps = await kv.getByPrefix('application:');
    console.log(`[RECOVERY] Found ${allApps.length} total applications in database`);
    
    // Get current revenue officer queue
    const currentQueue = await kv.get('revenue_officer:queue') || [];
    console.log(`[RECOVERY] Current revenue_officer:queue has ${currentQueue.length} items:`, currentQueue);
    
    let recovered = 0;
    const recoveredApps = [];
    
    // Find applications that should be in revenue officer queue
    for (const item of allApps) {
      // Check if this application has been processed by caseworker and sent to revenue officer
      const hasRevenueOfficerWorkflow = item.workflow?.revenueOfficer || item.currentStage === 'revenue_officer' || item.status === 'sentToRevenueOfficer' || item.status === 'sentToFieldEngineer';
      const sentFromCaseworker = item.workflow?.caseworker?.status === 'reviewed';
      
      if ((hasRevenueOfficerWorkflow || sentFromCaseworker) && !currentQueue.includes(item.id)) {
        console.log(`[RECOVERY] Adding ${item.id} to revenue_officer:queue (status: ${item.status})`);
        currentQueue.push(item.id);
        recovered++;
        recoveredApps.push({
          id: item.id,
          status: item.status,
          currentStage: item.currentStage
        });
      }
    }
    
    // Save updated queue
    if (recovered > 0) {
      await kv.set('revenue_officer:queue', currentQueue);
      console.log(`[RECOVERY] ✅ Added ${recovered} applications to revenue_officer:queue`);
    } else {
      console.log(`[RECOVERY] No applications needed to be recovered`);
    }
    
    console.log(`[RECOVERY] Final revenue_officer:queue has ${currentQueue.length} items`);
    
    return c.json({ 
      success: true, 
      message: `Recovered ${recovered} applications`,
      recovered,
      recoveredApps,
      totalInQueue: currentQueue.length
    });
  } catch (error) {
    console.error('[RECOVERY] ERROR:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create dummy plumber license application for testing
app.post("/make-server-698be164/dev/create-dummy-plumber-license", async (c) => {
  try {
    const body = await c.req.json();
    const { targetQueue, registrationType } = body;
    
    const regType = registrationType || 'individual';
    const random = Math.floor(1000 + Math.random() * 9000);
    const applicationId = `PLR-${new Date().getFullYear()}-${String(random).padStart(4, '0')}`;
    const now = new Date().toISOString();
    
    console.log(`[DEV DUMMY PL] Creating dummy plumber license app: ${applicationId} for queue: ${targetQueue}, type: ${regType}`);
    
    // Build base application
    const application: any = {
      id: applicationId,
      applicationNo: applicationId,
      applicationType: 'plumber_license',
      registrationType: regType,
      status: 'submitted',
      submittedAt: now,
      updatedAt: now,
      district: 'dharwad',
      ulb: 'hubballi-dharwad-municipal-corporation',
      financialYear: '2025-2026',
      registrationFees: '1000',
      citizenId: '9876543210',
      mobileNumber: '9876543210',
      documents: { aadhar: { name: 'aadhar_sample.pdf' }, experienceLetter: { name: 'experience_sample.pdf' } },
      workflow: { currentStep: 'caseworker_review', steps: [{ step: 'submitted', actor: 'citizen', timestamp: now, status: 'completed' }] },
    };
    
    if (regType === 'individual') {
      application.plumberName = 'Ramesh Kumar';
      application.applicantName = 'Ramesh Kumar';
      application.addressDistrict = 'dharwad';
      application.city = 'Hubballi';
      application.street = 'Vidyanagar';
      application.wardNo = 'Ward No.15';
      application.pincode = '580031';
      application.qualification = 'iti';
      application.yearOfExperience = '5';
    } else {
      application.firmName = 'Kumar Plumbing Services Pvt Ltd';
      application.applicantName = 'Kumar Plumbing Services Pvt Ltd';
      application.typeOfFirm = 'private-limited';
      application.officeAddress = '123 Industrial Area, Hubballi';
      application.contDistrict = 'dharwad';
      application.taluk = 'hubballi';
      application.pincode = '580031';
      application.emailId = 'kumar.plumbing@example.com';
      application.panNumber = 'ABCDE1234F';
      application.gstNumber = '29ABCDE1234F1Z5';
      application.authFullName = 'Suresh Kumar';
      application.authDesignation = 'Director';
      application.authMobile = '9876543211';
      application.authEmail = 'suresh@kumarplumbing.com';
    }
    
    // Set status and queue based on target
    if (targetQueue === 'caseworker') {
      application.status = 'submitted';
      application.workflow.currentStep = 'caseworker_review';
    } else if (targetQueue === 'field_engineer') {
      application.status = 'sentToFieldEngineer';
      application.caseworkerComments = 'Documents verified. Please proceed with field verification.';
      application.workflow.currentStep = 'field_engineer_review';
      application.workflow.caseworker = { status: 'reviewed', comment: 'Documents verified.', forwardedTo: 'Field Engineer', timestamp: now };
      application.workflow.steps.push({ step: 'caseworker_reviewed', actor: 'caseworker', timestamp: now, status: 'completed', comment: 'Documents verified.' });
    } else if (targetQueue === 'commissioner') {
      application.status = 'sentToCommissioner';
      application.caseworkerComments = 'Documents verified. Please proceed with field verification.';
      application.fieldEngineerComments = 'Field verification completed. All details are valid.';
      application.workflow.currentStep = 'commissioner_review';
      application.workflow.caseworker = { status: 'reviewed', comment: 'Documents verified.', forwardedTo: 'Field Engineer', timestamp: now };
      application.workflow.fieldEngineer = { status: 'reviewed', comment: 'Field verification completed. All details are valid.', forwardedTo: 'Commissioner', timestamp: now };
      application.workflow.commissioner = { status: 'pending' };
      application.workflow.steps.push({ step: 'caseworker_reviewed', actor: 'caseworker', timestamp: now, status: 'completed' });
      application.workflow.steps.push({ step: 'field_engineer_reviewed', actor: 'field_engineer', timestamp: now, status: 'completed' });
    } else if (targetQueue === 'pending_payment') {
      application.status = 'pendingPayment';
      application.caseworkerComments = 'Documents verified. Forwarding to Field Engineer.';
      application.fieldEngineerComments = 'Field verification completed. All details are valid.';
      application.commissionerComments = 'Application approved. Citizen may proceed with payment.';
      application.commissionerDecision = 'approved';
      application.workflow.currentStep = 'pending_payment';
      application.workflow.caseworker = { status: 'reviewed', comment: 'Documents verified.', timestamp: now };
      application.workflow.fieldEngineer = { status: 'reviewed', comment: 'Field verification completed.', timestamp: now };
      application.workflow.commissioner = { status: 'approved', comment: 'Application approved. Citizen may proceed with payment.', decision: 'approved', timestamp: now };
      application.workflow.steps.push({ step: 'caseworker_reviewed', actor: 'caseworker', timestamp: now, status: 'completed' });
      application.workflow.steps.push({ step: 'field_engineer_reviewed', actor: 'field_engineer', timestamp: now, status: 'completed' });
      application.workflow.steps.push({ step: 'commissioner_approved', actor: 'commissioner', timestamp: now, status: 'completed', decision: 'approved' });
    } else if (targetQueue === 'commissioner_payment') {
      application.status = 'paymentCompleted';
      application.caseworkerComments = 'Documents verified.';
      application.fieldEngineerComments = 'Field verification completed.';
      application.commissionerComments = 'Application approved for license.';
      application.commissionerDecision = 'approved';
      application.paymentDetails = {
        status: 'completed', paidAt: now,
        transactionId: `TXN-PL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        paymentMethod: 'online', amount: '1000',
      };
      application.workflow.currentStep = 'pending_certificate';
      application.workflow.caseworker = { status: 'reviewed', comment: 'Documents verified.', timestamp: now };
      application.workflow.fieldEngineer = { status: 'reviewed', comment: 'Field verification completed.', timestamp: now };
      application.workflow.commissioner = { status: 'approved', comment: 'Application approved for license.', decision: 'approved', timestamp: now };
      application.workflow.steps.push({ step: 'caseworker_reviewed', actor: 'caseworker', timestamp: now, status: 'completed' });
      application.workflow.steps.push({ step: 'field_engineer_reviewed', actor: 'field_engineer', timestamp: now, status: 'completed' });
      application.workflow.steps.push({ step: 'commissioner_approved', actor: 'commissioner', timestamp: now, status: 'completed', decision: 'approved' });
      application.workflow.steps.push({ step: 'payment_completed', actor: 'citizen', timestamp: now, status: 'completed' });
    } else if (targetQueue === 'approved_with_license') {
      const licenseNo = `PL-${(application.district || 'kar').substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      application.status = 'approved';
      application.caseworkerComments = 'Documents verified.';
      application.fieldEngineerComments = 'Field verification completed.';
      application.commissionerComments = 'Application approved for license.';
      application.commissionerDecision = 'approved';
      application.licenseNumber = licenseNo;
      application.licenseIssuedAt = now;
      application.licenseValidUntil = new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString();
      application.paymentDetails = {
        status: 'completed', paidAt: now,
        transactionId: `TXN-PL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        paymentMethod: 'online', amount: '1000',
      };
      application.dscDetails = {
        signedBy: 'Commissioner', signedAt: now,
        certificateId: `DSC-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        serialNumber: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        validFrom: now, validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
      };
      application.workflow.currentStep = 'license_issued';
      application.workflow.caseworker = { status: 'reviewed', comment: 'Documents verified.', timestamp: now };
      application.workflow.fieldEngineer = { status: 'reviewed', comment: 'Field verification completed.', timestamp: now };
      application.workflow.commissioner = { status: 'approved', comment: 'License approved.', decision: 'approved', timestamp: now, certificateGenerated: true, dscApplied: true, licenseNumber: licenseNo, licenseIssuedAt: now };
      application.workflow.steps.push({ step: 'caseworker_reviewed', actor: 'caseworker', timestamp: now, status: 'completed' });
      application.workflow.steps.push({ step: 'field_engineer_reviewed', actor: 'field_engineer', timestamp: now, status: 'completed' });
      application.workflow.steps.push({ step: 'commissioner_approved', actor: 'commissioner', timestamp: now, status: 'completed', decision: 'approved' });
      application.workflow.steps.push({ step: 'payment_completed', actor: 'citizen', timestamp: now, status: 'completed' });
      application.workflow.steps.push({ step: 'license_issued', actor: 'commissioner', timestamp: now, status: 'completed', licenseNumber: licenseNo });
    } else if (targetQueue === 'rejected') {
      application.status = 'rejected';
      application.caseworkerComments = 'Documents verified.';
      application.fieldEngineerComments = 'Field verification completed. Some discrepancies found.';
      application.commissionerComments = 'Application rejected due to insufficient qualifications and incomplete documentation.';
      application.commissionerDecision = 'rejected';
      application.workflow.currentStep = 'rejected';
      application.workflow.caseworker = { status: 'reviewed', comment: 'Documents verified.', timestamp: now };
      application.workflow.fieldEngineer = { status: 'reviewed', comment: 'Field verification completed.', timestamp: now };
      application.workflow.commissioner = { status: 'rejected', comment: 'Application rejected due to insufficient qualifications and incomplete documentation.', decision: 'rejected', timestamp: now };
      application.workflow.steps.push({ step: 'caseworker_reviewed', actor: 'caseworker', timestamp: now, status: 'completed' });
      application.workflow.steps.push({ step: 'field_engineer_reviewed', actor: 'field_engineer', timestamp: now, status: 'completed' });
      application.workflow.steps.push({ step: 'commissioner_rejected', actor: 'commissioner', timestamp: now, status: 'completed', decision: 'rejected' });
    } else if (targetQueue === 'sendback_at_fe') {
      application.status = 'sentToFieldEngineer';
      application.caseworkerComments = 'Documents verified.';
      application.fieldEngineerComments = 'Field verification completed.';
      application.commissionerComments = 'Please verify the plumber qualification certificates again. The experience letter seems outdated.';
      application.commissionerDecision = 'sent_back';
      application.workflow.currentStep = 'field_engineer_review';
      application.workflow.caseworker = { status: 'reviewed', comment: 'Documents verified.', timestamp: now };
      application.workflow.fieldEngineer = { status: 'reviewed', comment: 'Field verification completed.', timestamp: now };
      application.workflow.commissioner = { status: 'sent_back', comment: 'Please verify the plumber qualification certificates again. The experience letter seems outdated.', decision: 'sent_back', timestamp: now };
      application.workflow.steps.push({ step: 'caseworker_reviewed', actor: 'caseworker', timestamp: now, status: 'completed' });
      application.workflow.steps.push({ step: 'field_engineer_reviewed', actor: 'field_engineer', timestamp: now, status: 'completed' });
      application.workflow.steps.push({ step: 'commissioner_sent_back', actor: 'commissioner', timestamp: now, status: 'completed', decision: 'sent_back' });
    }
    
    // Save application
    await kv.set(`plumber_license:${applicationId}`, application);
    
    // Add to appropriate queue
    if (targetQueue === 'caseworker') {
      const queue = await kv.get('caseworker:plumber_license_queue') || [];
      if (!queue.includes(applicationId)) { queue.push(applicationId); }
      await kv.set('caseworker:plumber_license_queue', queue);
    } else if (targetQueue === 'field_engineer' || targetQueue === 'sendback_at_fe') {
      const queue = await kv.get('field_engineer:plumber_license_queue') || [];
      if (!queue.includes(applicationId)) { queue.push(applicationId); }
      await kv.set('field_engineer:plumber_license_queue', queue);
    } else if (targetQueue === 'commissioner' || targetQueue === 'commissioner_payment') {
      const queue = await kv.get('commissioner:plumber_license_queue') || [];
      if (!queue.includes(applicationId)) { queue.push(applicationId); }
      await kv.set('commissioner:plumber_license_queue', queue);
    }
    // pending_payment, approved_with_license, rejected don't need queue pushes (not in any active queue)
    
    // Also add to citizen's plumber license apps list
    const citizenApps = await kv.get(`citizen:${application.citizenId}:plumber_license_apps`) || [];
    if (!citizenApps.includes(applicationId)) {
      citizenApps.push(applicationId);
      await kv.set(`citizen:${application.citizenId}:plumber_license_apps`, citizenApps);
    }
    
    console.log(`[DEV DUMMY PL] Created dummy plumber license app: ${applicationId}, status: ${application.status}, queue: ${targetQueue}`);
    
    return c.json({
      success: true,
      message: `Dummy plumber license app created for ${targetQueue} queue`,
      applicationId,
      status: application.status,
      targetQueue,
    });
  } catch (error) {
    console.log(`[DEV DUMMY PL] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Health check endpoint
app.get("/make-server-698be164/health", (c) => {
  return c.json({ status: "ok" });
});

// DEBUG: Check queue status
app.get("/make-server-698be164/debug/queues", async (c) => {
  try {
    const caseworkerQueue = await kv.get('caseworker:queue') || [];
    const fieldEngineerQueue = await kv.get('field_engineer:queue') || [];
    const revenueOfficerQueue = await kv.get('revenue_officer:queue') || [];
    const commissionerQueue = await kv.get('commissioner:queue') || [];
    
    // Plumber License queues
    const caseworkerPlumberLicenseQueue = await kv.get('caseworker:plumber_license_queue') || [];
    const fieldEngineerPlumberLicenseQueue = await kv.get('field_engineer:plumber_license_queue') || [];
    const commissionerPlumberLicenseQueue = await kv.get('commissioner:plumber_license_queue') || [];
    
    const allApps = await kv.getByPrefix('application:');
    const allPlumberLicenseApps = await kv.getByPrefix('plumber_license:');
    
    console.log('=== QUEUE STATUS DEBUG ===');
    console.log('Caseworker Queue:', caseworkerQueue);
    console.log('Field Engineer Queue:', fieldEngineerQueue);
    console.log('Revenue Officer Queue:', revenueOfficerQueue);
    console.log('Commissioner Queue:', commissionerQueue);
    console.log('--- Plumber License Queues ---');
    console.log('Caseworker PL Queue:', caseworkerPlumberLicenseQueue);
    console.log('Field Engineer PL Queue:', fieldEngineerPlumberLicenseQueue);
    console.log('Commissioner PL Queue:', commissionerPlumberLicenseQueue);
    console.log('Total Applications in DB:', allApps.length);
    console.log('Total Plumber License Apps in DB:', allPlumberLicenseApps.length);
    
    return c.json({
      success: true,
      queues: {
        caseworker: caseworkerQueue,
        fieldEngineer: fieldEngineerQueue,
        revenueOfficer: revenueOfficerQueue,
        commissioner: commissionerQueue,
      },
      plumberLicenseQueues: {
        caseworker: caseworkerPlumberLicenseQueue,
        fieldEngineer: fieldEngineerPlumberLicenseQueue,
        commissioner: commissionerPlumberLicenseQueue,
      },
      applications: allApps.map(app => ({
        id: app.id,
        status: app.status,
        currentStage: app.currentStage,
      })),
      plumberLicenseApplications: allPlumberLicenseApps.map(app => ({
        id: app.id,
        status: app.status,
        applicantName: app.applicantName || app.plumberName || app.firmName || 'N/A',
        registrationType: app.registrationType,
      })),
    });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// DEBUG: Check specific application
app.get("/make-server-698be164/debug/application/:id", async (c) => {
  try {
    const appId = c.req.param('id');
    console.log(`[DEBUG] Looking for application: ${appId}`);
    
    // Check both application: and plumber_license: prefixes
    let application = await kv.get(`application:${appId}`);
    let appType = 'tap_connection';
    
    if (!application) {
      application = await kv.get(`plumber_license:${appId}`);
      if (application) {
        appType = 'plumber_license';
      }
    }
    
    if (!application) {
      console.log(`[DEBUG] Application ${appId} NOT FOUND in database`);
      
      // Check if it exists with a different key
      const allApps = await kv.getByPrefix('application:');
      const allPlumberLicenseApps = await kv.getByPrefix('plumber_license:');
      const combinedApps = [...allApps, ...allPlumberLicenseApps];
      console.log(`[DEBUG] Total applications in DB: ${allApps.length}, Plumber License: ${allPlumberLicenseApps.length}`);
      const found = combinedApps.find(app => app.id === appId);
      
      if (found) {
        console.log(`[DEBUG] Found application in DB but with different key format`);
        return c.json({
          success: true,
          found: true,
          application: found,
          message: 'Application exists but key format issue'
        });
      }
      
      return c.json({
        success: false,
        found: false,
        message: `Application ${appId} not found in database`,
        totalApplications: allApps.length,
        totalPlumberLicenseApps: allPlumberLicenseApps.length,
        allApplicationIds: combinedApps.map(a => a.id)
      });
    }
    
    // Check which queues contain this application (both tap connection and plumber license queues)
    const caseworkerQueue = await kv.get('caseworker:queue') || [];
    const fieldEngineerQueue = await kv.get('field_engineer:queue') || [];
    const revenueOfficerQueue = await kv.get('revenue_officer:queue') || [];
    const commissionerQueue = await kv.get('commissioner:queue') || [];
    const caseworkerPlQueue = await kv.get('caseworker:plumber_license_queue') || [];
    const fieldEngineerPlQueue = await kv.get('field_engineer:plumber_license_queue') || [];
    const commissionerPlQueue = await kv.get('commissioner:plumber_license_queue') || [];
    
    const inQueues = {
      caseworker: caseworkerQueue.includes(appId),
      fieldEngineer: fieldEngineerQueue.includes(appId),
      revenueOfficer: revenueOfficerQueue.includes(appId),
      commissioner: commissionerQueue.includes(appId),
      caseworkerPlumberLicense: caseworkerPlQueue.includes(appId),
      fieldEngineerPlumberLicense: fieldEngineerPlQueue.includes(appId),
      commissionerPlumberLicense: commissionerPlQueue.includes(appId),
    };
    
    console.log(`[DEBUG] Application ${appId} found! (type: ${appType})`);
    console.log(`[DEBUG] Status: ${application.status}`);
    console.log(`[DEBUG] Current Stage: ${application.currentStage || 'N/A'}`);
    console.log(`[DEBUG] In Queues:`, inQueues);
    
    return c.json({
      success: true,
      found: true,
      appType,
      application: {
        id: application.id,
        status: application.status,
        currentStage: application.currentStage,
        workflow: application.workflow,
        caseworkerComments: application.caseworkerComments,
        fieldEngineerComments: application.fieldEngineerComments,
        commissionerComments: application.commissionerComments,
        commissionerDecision: application.commissionerDecision,
        submittedAt: application.submittedAt,
        updatedAt: application.updatedAt,
      },
      inQueues,
      fullApplication: application
    });
  } catch (error) {
    console.log(`[DEBUG] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// JALANIDHI TAP CONNECTION WORKFLOW ROUTES
// ========================================

// 0. Verify property by Property ID/Khata No/Survey No
app.post("/make-server-698be164/tap-connection/verify-property", async (c) => {
  try {
    console.log('[VERIFY PROPERTY] Received property verification request');
    const body = await c.req.json();
    const { propertyId } = body;

    if (!propertyId) {
      return c.json({ success: false, error: "Property ID is required" }, 400);
    }

    // Simulate property verification (in production, this would query a property database)
    // For now, return mock data for any property ID
    const propertyData = {
      propertyId,
      ownerName: "Rajesh S",
      doorNumber: "191",
      wardNumber: "Ward No.10",
      street: "Ayodhya Nagar",
      address: "4th Cross GV Nagar",
      city: "Hubballi",
      district: "Dharwad",
      state: "Karnataka",
      pincode: "580026",
      khataNumber: "22-108-T819",
      latitude: "12.9716",
      longitude: "77.5946",
      verifiedAt: new Date().toISOString()
    };

    // Store verified property data
    await kv.set(`property:${propertyId}`, propertyData);

    console.log(`Property verified: ${propertyId}`);
    return c.json({ success: true, propertyData });
  } catch (error) {
    console.log(`Error verifying property: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 1. Citizen submits new tap connection application
app.post("/make-server-698be164/tap-connection/apply", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      // Property Details (Step 1)
      district,
      ulb,
      authorityType,
      ulbType,
      ownershipType,
      propertyId,
      verifiedPropertyData,
      
      // Applicant Details (Step 2)
      applicantName,
      fatherName,
      mobile,
      email,
      aadharNumber,
      address,
      
      // Connection Details (Step 3)
      propertyType,
      connectionType,
      nonMeterBillingMode,
      plotNumber,
      surveyNumber,
      propertyAddress,
      pincode
    } = body;

    // Validate required fields
    if (!district || !ulb || !applicantName || !mobile || !propertyType) {
      return c.json({ 
        success: false, 
        error: "Missing required fields" 
      }, 400);
    }

    // Generate unique application ID
    const applicationId = `TAP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    // Generate citizen ID from mobile number if not provided
    const citizenId = `CITIZEN-${mobile}`;
    
    const application = {
      id: applicationId,
      type: "newConnection", // Application type for filtering
      citizenId,
      
      // Step 1: Property Details
      propertyDetails: {
        district,
        ulb,
        authorityType,
        ulbType,
        ownershipType,
        propertyId,
        verifiedPropertyData
      },
      
      // Step 2: Applicant Details
      applicantDetails: {
        applicantName,
        fatherName,
        mobile,
        email,
        aadharNumber,
        address
      },
      
      // Step 3: Connection Details
      connectionDetails: {
        propertyType,
        connectionType,
        nonMeterBillingMode: nonMeterBillingMode || '',
        plotNumber,
        surveyNumber,
        propertyAddress,
        pincode
      },
      
      status: "pending_plumber", // Initial status
      currentStage: "plumber",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workflow: {
        citizen: { status: "completed", timestamp: new Date().toISOString() },
        plumber: { status: "pending" },
        caseworker: { status: "not_started" },
        fieldEngineer1: { status: "not_started" },
        revenueOfficer: { status: "not_started" },
        commissioner: { status: "not_started" },
        fieldEngineer2: { status: "not_started" }
      }
    };

    await kv.set(`application:${applicationId}`, application);
    
    // Add to citizen's applications list
    const citizenApps = await kv.get(`citizen:${citizenId}:applications`) || [];
    if (!citizenApps.includes(applicationId)) {
      citizenApps.push(applicationId);
    }
    await kv.set(`citizen:${citizenId}:applications`, citizenApps);

    // Add to plumber queue
    const plumberQueue = await kv.get('plumber:queue') || [];
    if (!plumberQueue.includes(applicationId)) {
      plumberQueue.push(applicationId);
    }
    await kv.set('plumber:queue', plumberQueue);

    console.log(`New tap connection application created: ${applicationId} by citizen ${citizenId}`);
    return c.json({ success: true, applicationId, application });
  } catch (error) {
    console.log(`Error creating tap connection application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 2. Get all applications in plumber queue
app.get("/make-server-698be164/plumber/applications", async (c) => {
  try {
    // Fetch from all plumber queues
    const plumberQueue = await kv.get('plumber:queue') || [];
    const mobileReconQueue = await kv.get('plumber:mobile_reconnection_queue') || [];
    const mobileInstallQueue = await kv.get('plumber:mobile_installation_queue') || [];
    const mobileChangeConnQueue = await kv.get('plumber:mobile_change_connection_queue') || [];
    
    // Combine unique IDs
    const allIds = [...new Set([...plumberQueue, ...mobileReconQueue, ...mobileInstallQueue, ...mobileChangeConnQueue])];
    const applications = [];

    for (const appId of allIds) {
      const app = await kv.get(`application:${appId}`);
      if (app) {
        applications.push(app);
      }
    }

    // Also fetch any reconnection/installation apps that have been submitted
    const allApps = await kv.getByPrefix('application:');
    for (const item of allApps) {
      const isRelevant = item.status === 'reconnection_work_submitted' ||
                         item.status === 'installation_work_submitted' ||
                         item.status === 'plumber_accepted_installation' ||
                         item.status === 'installation_completed' ||
                         item.status === 'installation_approved' ||
                         item.status === 'approved' ||
                         item.status === 'sentToPlumberForDisconnection' ||
                         item.status === 'plumber_accepted_disconnection' ||
                         item.status === 'disconnection_work_submitted' ||
                         item.status === 'sentToPlumberForChangeConnection' ||
                         item.status === 'plumber_accepted_change_connection' ||
                         item.status === 'change_connection_work_submitted' ||
                         item.status === 'change_connection_forwarded_to_fe';
      if (isRelevant && !applications.find((a: any) => a.id === item.id)) {
        applications.push(item);
      }
    }

    console.log(`Retrieved ${applications.length} applications for plumber (queue: ${plumberQueue.length}, mobileRecon: ${mobileReconQueue.length}, mobileInstall: ${mobileInstallQueue.length}, mobileChangeConn: ${mobileChangeConnQueue.length})`);
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`Error retrieving plumber applications: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 3. Plumber accepts/declines and enters connection details
app.post("/make-server-698be164/plumber/process", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      applicationId, 
      plumberId,
      plumberName,
      action, // "accept" or "decline"
      connectionDetails, // { estimationRows, totalAmount, siteSketchUploaded, estimateUploaded, comments }
      declineReason
    } = body;

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: "Application not found" }, 404);
    }

    if (action === "decline") {
      application.status = "declined_by_plumber";
      application.declineReason = declineReason;
      application.workflow.plumber = { 
        status: "declined", 
        timestamp: new Date().toISOString(),
        plumberId,
        plumberName,
        reason: declineReason
      };
      
      // Remove from plumber queue for declined applications
      const plumberQueue = await kv.get('plumber:queue') || [];
      const updatedQueue = plumberQueue.filter(id => id !== applicationId);
      await kv.set('plumber:queue', updatedQueue);
      
    } else if (action === "accept") {
      // Change status to estimation_sent instead of pending_applicant_review
      application.status = "estimation_sent";
      application.currentStage = "applicant_review";
      application.plumberDetails = {
        plumberId,
        plumberName,
      };
      application.plumberConnectionData = connectionDetails;
      application.workflow.plumber = { 
        status: "completed", 
        timestamp: new Date().toISOString(),
        plumberId,
        plumberName
      };
      
      // Keep application in plumber queue but update status
      // Do NOT remove from queue - plumber should still see it in "Estimation Sent" tab
    }

    application.updatedAt = new Date().toISOString();
    await kv.set(`application:${applicationId}`, application);

    console.log(`Plumber ${plumberId} ${action}ed application ${applicationId}`);
    return c.json({ success: true, application });
  } catch (error) {
    console.log(`Error processing plumber action: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 3b. Plumber accepts/rejects reconnection work
app.post("/make-server-698be164/plumber/reconnection-action", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, plumberId, plumberName, action, rejectReason } = body;

    console.log(`[PLUMBER RECON ACTION] ${action} reconnection work: ${applicationId} by ${plumberName}`);

    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      console.log(`[PLUMBER RECON ACTION] Application not found: ${applicationId}`);
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    if (application.status !== 'sentToPlumberForReconnection') {
      console.log(`[PLUMBER RECON ACTION] Invalid status: ${application.status}`);
      return c.json({ success: false, error: `Cannot ${action} application with status: ${application.status}` }, 400);
    }

    if (action === 'accept') {
      // Don't complete yet - set to accepted so plumber mobile app can pick it up for field visit
      application.status = 'plumber_accepted_reconnection';
      application.currentStage = 'plumber_field_visit';
      application.workflow.plumberReconnection = {
        status: 'accepted',
        action: 'accepted',
        plumberId,
        plumberName,
        acceptedAt: new Date().toISOString(),
        timestamp: new Date().toISOString()
      };

      // Remove from plumber web queue (will appear in mobile app now)
      const plumberQueue = await kv.get('plumber:queue') || [];
      const updatedQueue = plumberQueue.filter((id: string) => id !== applicationId);
      await kv.set('plumber:queue', updatedQueue);

      // Add to plumber mobile queue
      const plumberMobileQueue = await kv.get('plumber:mobile_reconnection_queue') || [];
      if (!plumberMobileQueue.includes(applicationId)) {
        plumberMobileQueue.push(applicationId);
        await kv.set('plumber:mobile_reconnection_queue', plumberMobileQueue);
      }

      console.log(`[PLUMBER RECON ACTION] Reconnection accepted by plumber: ${plumberName}. Sent to mobile app for field visit.`);
    } else if (action === 'reject') {
      if (!rejectReason || !rejectReason.trim()) {
        return c.json({ success: false, error: 'Rejection reason is required' }, 400);
      }

      application.status = 'reconnection_rejected_by_plumber';
      application.currentStage = 'commissioner';
      application.workflow.plumberReconnection = {
        status: 'rejected',
        action: 'rejected',
        plumberId,
        plumberName,
        rejectReason: rejectReason.trim(),
        rejectedAt: new Date().toISOString(),
        timestamp: new Date().toISOString()
      };

      // Remove from plumber queue
      const plumberQueue = await kv.get('plumber:queue') || [];
      const updatedQueue = plumberQueue.filter((id: string) => id !== applicationId);
      await kv.set('plumber:queue', updatedQueue);

      console.log(`[PLUMBER RECON ACTION] Reconnection rejected by plumber: ${plumberName}. Reason: ${rejectReason}`);
    } else {
      return c.json({ success: false, error: `Invalid action: ${action}` }, 400);
    }

    application.updatedAt = new Date().toISOString();
    await kv.set(`application:${applicationId}`, application);

    return c.json({ 
      success: true, 
      message: action === 'accept' 
        ? 'Reconnection work accepted and completed successfully' 
        : 'Reconnection work rejected',
      application 
    });
  } catch (error) {
    console.log(`[PLUMBER RECON ACTION] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 3b2. Plumber accepts/rejects change of connection type work
app.post("/make-server-698be164/plumber/change-connection-action", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, plumberId, plumberName, action, rejectReason } = body;

    console.log(`[PLUMBER CC ACTION] ${action} change connection work: ${applicationId} by ${plumberName}`);

    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      console.log(`[PLUMBER CC ACTION] Application not found: ${applicationId}`);
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    if (application.status !== 'sentToPlumberForChangeConnection') {
      console.log(`[PLUMBER CC ACTION] Invalid status: ${application.status}`);
      return c.json({ success: false, error: `Cannot ${action} application with status: ${application.status}` }, 400);
    }

    if (action === 'accept') {
      application.status = 'plumber_accepted_change_connection';
      application.currentStage = 'plumber_field_visit';
      application.workflow = application.workflow || {};
      application.workflow.plumberChangeConnection = {
        status: 'accepted',
        action: 'accepted',
        plumberId,
        plumberName,
        acceptedAt: new Date().toISOString(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        timestamp: new Date().toISOString()
      };

      // Add to plumber mobile queue for field visit
      const plumberMobileQueue = await kv.get('plumber:mobile_change_connection_queue') || [];
      if (!plumberMobileQueue.includes(applicationId)) {
        plumberMobileQueue.push(applicationId);
        await kv.set('plumber:mobile_change_connection_queue', plumberMobileQueue);
      }

      console.log(`[PLUMBER CC ACTION] Change connection accepted by plumber: ${plumberName}. 7-day deadline set. Sent to mobile app for field visit.`);
    } else if (action === 'reject') {
      if (!rejectReason || !rejectReason.trim()) {
        return c.json({ success: false, error: 'Rejection reason is required' }, 400);
      }

      application.status = 'change_connection_rejected_by_plumber';
      application.currentStage = 'commissioner';
      application.workflow = application.workflow || {};
      application.workflow.plumberChangeConnection = {
        status: 'rejected',
        action: 'rejected',
        plumberId,
        plumberName,
        rejectReason: rejectReason.trim(),
        rejectedAt: new Date().toISOString(),
        timestamp: new Date().toISOString()
      };

      // Remove from plumber queue
      const plumberQueue = await kv.get('plumber:queue') || [];
      const updatedQueue = plumberQueue.filter((id: string) => id !== applicationId);
      await kv.set('plumber:queue', updatedQueue);

      console.log(`[PLUMBER CC ACTION] Change connection rejected by plumber: ${plumberName}. Reason: ${rejectReason}`);
    } else {
      return c.json({ success: false, error: `Invalid action: ${action}` }, 400);
    }

    application.updatedAt = new Date().toISOString();
    await kv.set(`application:${applicationId}`, application);

    return c.json({ 
      success: true, 
      message: action === 'accept' 
        ? 'Change of connection work accepted. Please complete within 7 days.' 
        : 'Change of connection work rejected',
      application 
    });
  } catch (error) {
    console.log(`[PLUMBER CC ACTION] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 3b3. Plumber submits change connection field report from mobile app
app.post("/make-server-698be164/plumber/change-connection-submit-report", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, plumberId, plumberName, fieldReport } = body;

    console.log(`[PLUMBER CC REPORT] Submitting change connection field report: ${applicationId} by ${plumberName}`);

    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    if (application.status !== 'plumber_accepted_change_connection') {
      return c.json({ success: false, error: `Cannot submit report for status: ${application.status}` }, 400);
    }

    // Store the field report
    application.changeConnectionFieldReport = {
      ...fieldReport,
      plumberId,
      plumberName,
      submittedAt: new Date().toISOString()
    };

    application.status = 'change_connection_work_submitted';
    application.currentStage = 'plumber_web_review';
    application.workflow = application.workflow || {};
    application.workflow.plumberChangeConnection = {
      ...application.workflow.plumberChangeConnection,
      fieldReportSubmitted: true,
      fieldReportSubmittedAt: new Date().toISOString()
    };
    application.updatedAt = new Date().toISOString();

    await kv.set(`application:${applicationId}`, application);

    // Remove from mobile queue
    const mobileQueue = await kv.get('plumber:mobile_change_connection_queue') || [];
    const updatedMobileQueue = mobileQueue.filter((id: string) => id !== applicationId);
    await kv.set('plumber:mobile_change_connection_queue', updatedMobileQueue);

    // Re-add to plumber web queue for final review
    const plumberQueue = await kv.get('plumber:queue') || [];
    if (!plumberQueue.includes(applicationId)) {
      plumberQueue.push(applicationId);
      await kv.set('plumber:queue', plumberQueue);
    }

    console.log(`[PLUMBER CC REPORT] Field report submitted. Application ready for plumber web review before sending to FE.`);

    return c.json({ 
      success: true, 
      message: 'Field report submitted successfully. Please review and submit to Field Engineer from the web portal.' 
    });
  } catch (error) {
    console.log(`[PLUMBER CC REPORT] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 3b4. Plumber forwards change connection report to Field Engineer
app.post("/make-server-698be164/plumber/change-connection-forward-to-fe", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, plumberId, plumberName, remarks } = body;

    console.log(`[PLUMBER CC FORWARD] Forwarding change connection to FE: ${applicationId} by ${plumberName}`);

    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    if (application.status !== 'change_connection_work_submitted') {
      return c.json({ success: false, error: `Cannot forward application with status: ${application.status}` }, 400);
    }

    application.status = 'change_connection_forwarded_to_fe';
    application.currentStage = 'field_engineer_verification';
    application.workflow = application.workflow || {};
    application.workflow.plumberChangeConnection = {
      ...application.workflow.plumberChangeConnection,
      forwardedToFE: true,
      forwardedAt: new Date().toISOString(),
      forwardRemarks: remarks || 'Change of connection work completed and forwarded to Field Engineer for verification.'
    };
    application.updatedAt = new Date().toISOString();

    await kv.set(`application:${applicationId}`, application);

    // Remove from plumber queue
    const plumberQueue = await kv.get('plumber:queue') || [];
    const updatedQueue = plumberQueue.filter((id: string) => id !== applicationId);
    await kv.set('plumber:queue', updatedQueue);

    // Add to field engineer queue
    const feQueue = await kv.get('field_engineer:queue') || [];
    if (!feQueue.includes(applicationId)) {
      feQueue.push(applicationId);
      await kv.set('field_engineer:queue', feQueue);
    }

    console.log(`[PLUMBER CC FORWARD] Change connection forwarded to FE. Application ${applicationId}`);

    return c.json({ 
      success: true, 
      message: 'Change of connection report forwarded to Field Engineer for verification.' 
    });
  } catch (error) {
    console.log(`[PLUMBER CC FORWARD] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 3c. Get plumber mobile reconnection queue
app.get("/make-server-698be164/plumber/mobile/reconnection-apps", async (c) => {
  try {
    const mobileQueue = await kv.get('plumber:mobile_reconnection_queue') || [];
    const applications = [];

    for (const appId of mobileQueue) {
      const app = await kv.get(`application:${appId}`);
      if (app && (app.status === 'plumber_accepted_reconnection' || app.status === 'reconnection_work_submitted')) {
        applications.push(app);
      }
    }

    console.log(`[PLUMBER MOBILE] Retrieved ${applications.length} reconnection apps for mobile`);
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`[PLUMBER MOBILE] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 3d. Plumber mobile submits reconnection field report
app.post("/make-server-698be164/plumber/mobile/submit-reconnection-report", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, plumberId, plumberName, reconnectionReport } = body;

    console.log(`[PLUMBER MOBILE REPORT] Submitting reconnection report for: ${applicationId}`);

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    if (application.status !== 'plumber_accepted_reconnection') {
      return c.json({ success: false, error: `Invalid status for report submission: ${application.status}` }, 400);
    }

    // Save reconnection report data
    application.reconnectionFieldReport = {
      plumberId,
      plumberName,
      submittedAt: new Date().toISOString(),
      locationVerification: {
        verified: reconnectionReport.locationVerified,
        latitude: reconnectionReport.verifiedLatitude,
        longitude: reconnectionReport.verifiedLongitude,
        verifiedAt: new Date().toISOString(),
      },
      reconnectionRemarks: reconnectionReport.reconnectionRemarks,
      siteObservations: reconnectionReport.siteObservations,
      photoCount: reconnectionReport.photoCount || 0,
      documentCount: reconnectionReport.documentCount || 0,
      photos: reconnectionReport.photos || [],
      workCompletedAt: new Date().toISOString(),
    };

    // Update status to submitted - send to field engineer for verification
    application.status = 'reconnection_work_submitted';
    application.currentStage = 'field_engineer_verification';
    
    if (!application.workflow) application.workflow = {};
    application.workflow.plumberReconnection = {
      ...application.workflow.plumberReconnection,
      status: 'field_visit_completed',
      reportSubmittedAt: new Date().toISOString(),
    };

    application.updatedAt = new Date().toISOString();
    await kv.set(`application:${applicationId}`, application);

    // Remove from plumber mobile queue
    const mobileQueue = await kv.get('plumber:mobile_reconnection_queue') || [];
    const updatedQueue = mobileQueue.filter((id: string) => id !== applicationId);
    await kv.set('plumber:mobile_reconnection_queue', updatedQueue);

    // Add to field engineer queue for verification
    const feQueue = await kv.get('field_engineer:reconnection_queue') || [];
    if (!feQueue.includes(applicationId)) {
      feQueue.push(applicationId);
      await kv.set('field_engineer:reconnection_queue', feQueue);
    }

    console.log(`[PLUMBER MOBILE REPORT] Report submitted for ${applicationId}. Sent to field engineer for verification.`);

    return c.json({ 
      success: true, 
      message: 'Reconnection work report submitted. Sent to Field Engineer for verification.',
      application 
    });
  } catch (error) {
    console.log(`[PLUMBER MOBILE REPORT] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// NEW TAP CONNECTION - INSTALLATION FLOW
// ========================================

// Plumber web: accept installation work
app.post("/make-server-698be164/plumber/installation-action", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, plumberId, plumberName, action } = body;

    console.log(`[PLUMBER INSTALL] ${action} installation for: ${applicationId}`);

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    if (!application.workflow) application.workflow = {};

    if (action === 'accept') {
      application.status = 'plumber_accepted_installation';
      application.currentStage = 'plumber_installation';
      application.workflow.plumberInstallation = {
        status: 'accepted',
        plumberId,
        plumberName,
        acceptedAt: new Date().toISOString(),
      };

      // Add to mobile installation queue
      const mobileQueue = await kv.get('plumber:mobile_installation_queue') || [];
      if (!mobileQueue.includes(applicationId)) {
        mobileQueue.push(applicationId);
        await kv.set('plumber:mobile_installation_queue', mobileQueue);
      }
    }

    application.updatedAt = new Date().toISOString();
    await kv.set(`application:${applicationId}`, application);

    // If this was an appeal-approved application, update the appeal record
    if (application.isAppealApproved && application.appealId && action === 'accept') {
      try {
        const appeal = await kv.get(`appeal:${application.appealId}`);
        if (appeal) {
          appeal.currentStage = 'plumber_work_in_progress';
          appeal.updatedAt = new Date().toISOString();
          if (!appeal.workflow) appeal.workflow = {};
          appeal.workflow.plumberInstallation = { status: 'accepted', plumberName, acceptedAt: new Date().toISOString() };
          await kv.set(`appeal:${application.appealId}`, appeal);
          console.log(`[PLUMBER INSTALL] Updated appeal ${application.appealId} with plumber acceptance`);
        }
      } catch (appealErr) {
        console.log(`[PLUMBER INSTALL] Warning: Could not update appeal record: ${appealErr}`);
      }
    }

    console.log(`[PLUMBER INSTALL] ${action} done for ${applicationId}. Status: ${application.status}`);
    return c.json({ success: true, message: `Installation work ${action}ed`, application });
  } catch (error) {
    console.log(`[PLUMBER INSTALL] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Plumber mobile: get installation apps
app.get("/make-server-698be164/plumber/mobile/installation-apps", async (c) => {
  try {
    const mobileQueue = await kv.get('plumber:mobile_installation_queue') || [];
    const applications = [];

    for (const appId of mobileQueue) {
      const app = await kv.get(`application:${appId}`);
      if (app && (app.status === 'sentToCitizenForPayment' || app.status === 'installation_approved' || app.status === 'approved' || app.status === 'plumber_accepted_installation' || app.status === 'installation_work_submitted')) {
        // Only include new connection apps (not reconnection or disconnection)
        if (!app.type || app.type === 'newConnection') {
          applications.push(app);
        }
      }
    }

    console.log(`[PLUMBER MOBILE INSTALL] Retrieved ${applications.length} installation apps`);
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`[PLUMBER MOBILE INSTALL] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Plumber mobile: submit installation report
app.post("/make-server-698be164/plumber/mobile/submit-installation-report", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, plumberId, plumberName, installationReport } = body;

    console.log(`[PLUMBER INSTALL REPORT] Submitting for: ${applicationId}`);

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    // Save installation report
    application.installationReport = {
      plumberId,
      plumberName,
      submittedAt: new Date().toISOString(),
      locationVerification: {
        verified: installationReport.locationVerified,
        latitude: installationReport.verifiedLatitude,
        longitude: installationReport.verifiedLongitude,
        verifiedAt: new Date().toISOString(),
      },
      installationRemarks: installationReport.installationRemarks,
      siteObservations: installationReport.siteObservations,
      photoCount: installationReport.photoCount || 0,
      photos: installationReport.photos || [],
      meterNumber: installationReport.meterNumber || '',
      pipeSize: installationReport.pipeSize || '',
      connectionPoint: installationReport.connectionPoint || '',
      installationChecklist: installationReport.installationChecklist || [],
      workCompletedAt: new Date().toISOString(),
    };

    application.status = 'installation_work_submitted';
    application.currentStage = 'field_engineer_verification';

    if (!application.workflow) application.workflow = {};
    application.workflow.plumberInstallation = {
      ...application.workflow.plumberInstallation,
      status: 'field_visit_completed',
      reportSubmittedAt: new Date().toISOString(),
    };

    // Ensure workflow.fieldEngineer exists so FE dashboard three-tier filter includes this app
    if (!application.workflow.fieldEngineer) {
      application.workflow.fieldEngineer = {
        status: 'pending_installation_verification',
        timestamp: new Date().toISOString(),
      };
    } else {
      // Update existing FE workflow to reflect installation verification stage
      application.workflow.fieldEngineer = {
        ...application.workflow.fieldEngineer,
        installationVerificationPending: true,
        installationReturnedAt: new Date().toISOString(),
      };
    }

    // Push a workflow step so FE timeline is complete
    if (!application.workflow.steps) application.workflow.steps = [];
    application.workflow.steps.push({
      step: 'plumber_installation_submitted',
      actor: 'plumber',
      actorName: plumberName,
      timestamp: new Date().toISOString(),
      status: 'completed',
      comment: 'Installation work completed. Report submitted for Field Engineer verification.',
    });

    application.updatedAt = new Date().toISOString();
    await kv.set(`application:${applicationId}`, application);

    // Remove from plumber mobile queue
    const mobileQueue = await kv.get('plumber:mobile_installation_queue') || [];
    const updatedMQ = mobileQueue.filter((id: string) => id !== applicationId);
    await kv.set('plumber:mobile_installation_queue', updatedMQ);

    // Add to field engineer installation verification queue
    const feQueue = await kv.get('field_engineer:installation_queue') || [];
    if (!feQueue.includes(applicationId)) {
      feQueue.push(applicationId);
      await kv.set('field_engineer:installation_queue', feQueue);
    }

    // ALSO add to main field_engineer:queue so FE dashboard reliably picks it up
    const feMainQueue = await kv.get('field_engineer:queue') || [];
    if (!feMainQueue.includes(applicationId)) {
      feMainQueue.push(applicationId);
      await kv.set('field_engineer:queue', feMainQueue);
    }
    console.log(`[PLUMBER INSTALL REPORT] Added ${applicationId} to field_engineer:queue and field_engineer:installation_queue`);

    // If this was an appeal-approved application, update the appeal record
    if (application.isAppealApproved && application.appealId) {
      try {
        const appeal = await kv.get(`appeal:${application.appealId}`);
        if (appeal) {
          appeal.currentStage = 'plumber_work_done';
          appeal.updatedAt = new Date().toISOString();
          if (!appeal.workflow) appeal.workflow = {};
          appeal.workflow.plumberInstallation = { status: 'completed', submittedAt: new Date().toISOString(), plumberName };
          await kv.set(`appeal:${application.appealId}`, appeal);
          console.log(`[PLUMBER INSTALL REPORT] Updated appeal ${application.appealId} with plumber completion`);
        }
      } catch (appealErr) {
        console.log(`[PLUMBER INSTALL REPORT] Warning: Could not update appeal record: ${appealErr}`);
      }
    }

    console.log(`[PLUMBER INSTALL REPORT] Report submitted for ${applicationId}. Sent to FE for verification.`);
    return c.json({ success: true, message: 'Installation report submitted. Sent to Field Engineer for verification.', application });
  } catch (error) {
    console.log(`[PLUMBER INSTALL REPORT] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Plumber mobile: get change connection apps
app.get("/make-server-698be164/plumber/mobile/change-connection-apps", async (c) => {
  try {
    const plumberQueue = await kv.get('plumber:queue') || [];
    const mobileQueue = await kv.get('plumber:mobile_change_connection_queue') || [];
    const allIds = [...new Set([...plumberQueue, ...mobileQueue])];
    const applications = [];

    for (const appId of allIds) {
      const app = await kv.get(`application:${appId}`);
      if (app && app.type === 'changeConnection' && (
        app.status === 'sentToPlumberForChangeConnection' ||
        app.status === 'plumber_accepted_change_connection' ||
        app.status === 'change_connection_work_submitted'
      )) {
        applications.push(app);
      }
    }

    // Also scan all apps for any that may have been missed from queues
    const allApps = await kv.getByPrefix('application:');
    for (const item of allApps) {
      if (item.type === 'changeConnection' && (
        item.status === 'plumber_accepted_change_connection'
      ) && !applications.find((a: any) => a.id === item.id)) {
        applications.push(item);
      }
    }

    console.log(`[PLUMBER MOBILE CC] Retrieved ${applications.length} change connection apps`);
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`[PLUMBER MOBILE CC] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Plumber mobile: submit change connection field report
app.post("/make-server-698be164/plumber/mobile/submit-change-connection-report", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, plumberId, plumberName, changeConnectionReport } = body;

    console.log(`[PLUMBER CC MOBILE REPORT] Submitting for: ${applicationId}`);

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    // Save change connection field report
    application.changeConnectionFieldReport = {
      plumberId,
      plumberName,
      submittedAt: new Date().toISOString(),
      locationVerification: {
        verified: changeConnectionReport.locationVerified,
        latitude: changeConnectionReport.verifiedLatitude,
        longitude: changeConnectionReport.verifiedLongitude,
        verifiedAt: new Date().toISOString(),
      },
      workDescription: changeConnectionReport.workDescription || '',
      changeConnectionRemarks: changeConnectionReport.changeConnectionRemarks || '',
      siteObservations: changeConnectionReport.siteObservations || '',
      previousConnectionType: changeConnectionReport.previousConnectionType || '',
      newConnectionType: changeConnectionReport.newConnectionType || '',
      photoCount: changeConnectionReport.photoCount || 0,
      photos: changeConnectionReport.photos || [],
      workCompletedAt: new Date().toISOString(),
    };

    application.status = 'change_connection_work_submitted';
    application.currentStage = 'plumber_web_review';

    if (!application.workflow) application.workflow = {};
    application.workflow.plumberChangeConnection = {
      ...application.workflow.plumberChangeConnection,
      status: 'field_visit_completed',
      fieldReportSubmitted: true,
      fieldReportSubmittedAt: new Date().toISOString(),
    };

    application.updatedAt = new Date().toISOString();
    await kv.set(`application:${applicationId}`, application);

    // Remove from mobile queue
    const mobileQueue = await kv.get('plumber:mobile_change_connection_queue') || [];
    const updatedMobileQueue = mobileQueue.filter((id: string) => id !== applicationId);
    await kv.set('plumber:mobile_change_connection_queue', updatedMobileQueue);

    // Re-add to plumber web queue for final review before forwarding to FE
    const plumberQueue = await kv.get('plumber:queue') || [];
    if (!plumberQueue.includes(applicationId)) {
      plumberQueue.push(applicationId);
      await kv.set('plumber:queue', plumberQueue);
    }

    console.log(`[PLUMBER CC MOBILE REPORT] Report submitted for ${applicationId}. Ready for plumber web review.`);
    return c.json({ success: true, message: 'Change connection report submitted. Please review and forward to Field Engineer from the web portal.', application });
  } catch (error) {
    console.log(`[PLUMBER CC MOBILE REPORT] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Plumber mobile: get disconnection apps
app.get("/make-server-698be164/plumber/mobile/disconnection-apps", async (c) => {
  try {
    const plumberQueue = await kv.get('plumber:queue') || [];
    const applications = [];

    for (const appId of plumberQueue) {
      const app = await kv.get(`application:${appId}`);
      if (app && app.type === 'disconnection' && (
        app.status === 'sentToPlumberForDisconnection' ||
        app.status === 'plumber_accepted_disconnection' ||
        app.status === 'disconnection_work_submitted'
      )) {
        applications.push(app);
      }
    }

    console.log(`[PLUMBER MOBILE DISCON] Retrieved ${applications.length} disconnection apps`);
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`[PLUMBER MOBILE DISCON] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Plumber accept/decline disconnection application
app.post("/make-server-698be164/plumber/accept-disconnection", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, action, plumberName, plumberId, declineReason } = body;

    console.log(`[PLUMBER DISCON] ${action} disconnection for: ${applicationId}`);

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    if (!application.workflow) application.workflow = {};

    if (action === 'accept') {
      application.status = 'plumber_accepted_disconnection';
      application.currentStage = 'plumber_disconnection_field_work';
      application.workflow.plumberDisconnection = {
        status: 'accepted',
        plumberName: plumberName || 'Plumber',
        plumberId: plumberId || '',
        acceptedAt: new Date().toISOString(),
      };
    } else {
      application.status = 'plumber_declined_disconnection';
      application.currentStage = 'field_engineer';
      application.workflow.plumberDisconnection = {
        status: 'declined',
        plumberName: plumberName || 'Plumber',
        plumberId: plumberId || '',
        declinedAt: new Date().toISOString(),
        declineReason: declineReason || '',
      };
      // Send back to FE queue
      const feQueue = await kv.get('field_engineer:queue') || [];
      if (!feQueue.includes(applicationId)) {
        feQueue.push(applicationId);
        await kv.set('field_engineer:queue', feQueue);
      }
    }

    application.updatedAt = new Date().toISOString();
    await kv.set(`application:${applicationId}`, application);

    return c.json({ success: true, message: `Application ${action}ed`, application });
  } catch (error) {
    console.log(`[PLUMBER DISCON] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Plumber mobile: submit disconnection field report
app.post("/make-server-698be164/plumber/mobile/submit-disconnection-report", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, plumberId, plumberName, disconnectionReport } = body;

    console.log(`[PLUMBER DISCON REPORT] Submitting for: ${applicationId}`);

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    // Save disconnection field report
    application.disconnectionFieldReport = {
      plumberId,
      plumberName,
      submittedAt: new Date().toISOString(),
      locationVerification: {
        verified: disconnectionReport.locationVerified,
        latitude: disconnectionReport.verifiedLatitude,
        longitude: disconnectionReport.verifiedLongitude,
        verifiedAt: new Date().toISOString(),
      },
      disconnectionRemarks: disconnectionReport.disconnectionRemarks,
      siteObservations: disconnectionReport.siteObservations,
      meterReadingFinal: disconnectionReport.meterReadingFinal || '',
      disconnectionMethod: disconnectionReport.disconnectionMethod || '',
      sealNumber: disconnectionReport.sealNumber || '',
      photoCount: disconnectionReport.photoCount || 0,
      photos: disconnectionReport.photos || [],
      disconnectionChecklist: disconnectionReport.disconnectionChecklist || [],
      workCompletedAt: new Date().toISOString(),
    };

    application.status = 'disconnection_work_submitted';
    application.currentStage = 'field_engineer_verification';

    if (!application.workflow) application.workflow = {};
    application.workflow.plumberDisconnection = {
      ...application.workflow.plumberDisconnection,
      status: 'field_visit_completed',
      reportSubmittedAt: new Date().toISOString(),
    };

    application.updatedAt = new Date().toISOString();
    await kv.set(`application:${applicationId}`, application);

    // Add to field engineer queue for verification
    const feQueue = await kv.get('field_engineer:queue') || [];
    if (!feQueue.includes(applicationId)) {
      feQueue.push(applicationId);
      await kv.set('field_engineer:queue', feQueue);
    }

    console.log(`[PLUMBER DISCON REPORT] Report submitted for ${applicationId}. Sent to FE for verification.`);
    return c.json({ success: true, message: 'Disconnection report submitted. Sent to Field Engineer for verification.', application });
  } catch (error) {
    console.log(`[PLUMBER DISCON REPORT] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Field Engineer: verify installation and close application
app.post("/make-server-698be164/field_engineer/verify-installation", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, action, remarks, engineerName, siteVisitDone, siteVisitRemarks } = body;

    console.log(`[FE INSTALL VERIFY] ${action} installation for: ${applicationId}`);

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    if (!application.workflow) application.workflow = {};

    if (action === 'approve') {
      application.status = 'installation_completed';
      application.currentStage = 'completed';
      application.workflow.installationVerification = {
        status: 'verified',
        action: 'approved',
        engineerName,
        remarks,
        siteVisitDone: siteVisitDone || 'no',
        siteVisitRemarks: siteVisitRemarks || '',
        verifiedAt: new Date().toISOString(),
      };
    } else if (action === 'rework') {
      application.status = 'plumber_accepted_installation';
      application.currentStage = 'plumber_installation';
      application.workflow.installationVerification = {
        status: 'rework_requested',
        action: 'rework',
        engineerName,
        remarks,
        requestedAt: new Date().toISOString(),
      };
      // Re-add to plumber mobile queue
      const mobileQueue = await kv.get('plumber:mobile_installation_queue') || [];
      if (!mobileQueue.includes(applicationId)) {
        mobileQueue.push(applicationId);
        await kv.set('plumber:mobile_installation_queue', mobileQueue);
      }
    }

    application.updatedAt = new Date().toISOString();
    await kv.set(`application:${applicationId}`, application);

    // Remove from FE queue
    const feQueue = await kv.get('field_engineer:installation_queue') || [];
    const updated = feQueue.filter((id: string) => id !== applicationId);
    await kv.set('field_engineer:installation_queue', updated);

    // If this was an appeal-approved application, update the appeal record
    if (application.isAppealApproved && application.appealId) {
      try {
        const appeal = await kv.get(`appeal:${application.appealId}`);
        if (appeal) {
          if (action === 'approve') {
            appeal.status = 'completed';
            appeal.currentStage = 'completed';
          } else {
            appeal.currentStage = 'plumber_rework';
          }
          appeal.updatedAt = new Date().toISOString();
          if (!appeal.workflow) appeal.workflow = {};
          appeal.workflow.fieldEngineerVerification = { status: action === 'approve' ? 'verified' : 'rework', engineerName, verifiedAt: new Date().toISOString() };
          await kv.set(`appeal:${application.appealId}`, appeal);
          console.log(`[FE INSTALL VERIFY] Updated appeal ${application.appealId} with FE ${action}`);
        }
      } catch (appealErr) {
        console.log(`[FE INSTALL VERIFY] Warning: Could not update appeal record: ${appealErr}`);
      }
    }

    console.log(`[FE INSTALL VERIFY] ${action} done for ${applicationId}. Status: ${application.status}`);
    return c.json({ success: true, message: action === 'approve' ? 'Installation verified. Application closed.' : 'Rework requested.', application });
  } catch (error) {
    console.log(`[FE INSTALL VERIFY] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Field Engineer: verify change of connection type and close application
app.post("/make-server-698be164/field_engineer/verify-change-connection", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, action, remarks, engineerName, siteVisitDone, siteVisitRemarks } = body;

    console.log(`[FE CC VERIFY] ${action} change connection for: ${applicationId}`);

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    if (!application.workflow) application.workflow = {};

    if (action === 'approve') {
      application.status = 'change_connection_completed';
      application.currentStage = 'completed';
      application.workflow.changeConnectionVerification = {
        status: 'verified',
        action: 'approved',
        engineerName,
        remarks,
        siteVisitDone: siteVisitDone || 'no',
        siteVisitRemarks: siteVisitRemarks || '',
        verifiedAt: new Date().toISOString(),
      };
    } else if (action === 'rework') {
      application.status = 'plumber_accepted_change_connection';
      application.currentStage = 'plumber_field_visit';
      application.workflow.changeConnectionVerification = {
        status: 'rework_requested',
        action: 'rework',
        engineerName,
        remarks,
        requestedAt: new Date().toISOString(),
      };
      // Re-add to plumber mobile queue
      const mobileQueue = await kv.get('plumber:mobile_change_connection_queue') || [];
      if (!mobileQueue.includes(applicationId)) {
        mobileQueue.push(applicationId);
        await kv.set('plumber:mobile_change_connection_queue', mobileQueue);
      }
    }

    application.updatedAt = new Date().toISOString();
    await kv.set(`application:${applicationId}`, application);

    // Remove from FE queue
    const feQueue = await kv.get('field_engineer:queue') || [];
    const updated = feQueue.filter((id: string) => id !== applicationId);
    await kv.set('field_engineer:queue', updated);

    console.log(`[FE CC VERIFY] ${action} done for ${applicationId}. Status: ${application.status}`);
    return c.json({ success: true, message: action === 'approve' ? 'Change of connection verified. Application closed.' : 'Rework requested.', application });
  } catch (error) {
    console.log(`[FE CC VERIFY] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Field Engineer: verify disconnection and close application
app.post("/make-server-698be164/field_engineer/verify-disconnection", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, action, remarks, engineerName, siteVisitDone, siteVisitRemarks } = body;

    console.log(`[FE DISCON VERIFY] ${action} disconnection for: ${applicationId}`);

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    if (!application.workflow) application.workflow = {};

    if (action === 'approve') {
      application.status = 'disconnection_completed';
      application.currentStage = 'completed';
      application.workflow.disconnectionVerification = {
        status: 'verified',
        action: 'approved',
        engineerName,
        remarks,
        siteVisitDone: siteVisitDone || 'no',
        siteVisitRemarks: siteVisitRemarks || '',
        verifiedAt: new Date().toISOString(),
      };
    } else if (action === 'rework') {
      application.status = 'plumber_accepted_disconnection';
      application.currentStage = 'plumber_disconnection';
      application.workflow.disconnectionVerification = {
        status: 'rework_requested',
        action: 'rework',
        engineerName,
        remarks,
        requestedAt: new Date().toISOString(),
      };
      // Re-add to plumber mobile disconnection queue
      const mobileQueue = await kv.get('plumber:mobile_disconnection_queue') || [];
      if (!mobileQueue.includes(applicationId)) {
        mobileQueue.push(applicationId);
        await kv.set('plumber:mobile_disconnection_queue', mobileQueue);
      }
    }

    application.updatedAt = new Date().toISOString();
    await kv.set(`application:${applicationId}`, application);

    // Remove from FE queue
    const feQueue = await kv.get('field_engineer:queue') || [];
    const updated = feQueue.filter((id: string) => id !== applicationId);
    await kv.set('field_engineer:queue', updated);

    console.log(`[FE DISCON VERIFY] ${action} done for ${applicationId}. Status: ${application.status}`);
    return c.json({ success: true, message: action === 'approve' ? 'Disconnection verified. Application closed.' : 'Rework requested.', application });
  } catch (error) {
    console.log(`[FE DISCON VERIFY] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 4. Get application details for citizen review
app.get("/make-server-698be164/application/:id", async (c) => {
  try {
    const applicationId = c.req.param('id');
    console.log(`[GET APPLICATION] ======== FETCHING APPLICATION ${applicationId} ========`);
    
    const application = await kv.get(`application:${applicationId}`);
    
    if (!application) {
      console.log(`[GET APPLICATION] Application ${applicationId} not found`);
      return c.json({ success: false, error: "Application not found" }, 404);
    }
    
    // Log the complete application data for debugging
    console.log(`[GET APPLICATION] Application found:`, {
      id: application.id,
      status: application.status,
      fieldVisit: application.fieldVisit,
      hasFieldVisitReport: !!application.fieldVisitReport,
      fieldVisitReportKeys: application.fieldVisitReport ? Object.keys(application.fieldVisitReport) : [],
    });
    
    if (application.fieldVisitReport) {
      console.log(`[GET APPLICATION] ✅ Field Visit Report EXISTS:`, application.fieldVisitReport);
    } else {
      console.log(`[GET APPLICATION] ❌ Field Visit Report MISSING`);
    }

    return c.json({ success: true, application });
  } catch (error) {
    console.log(`[GET APPLICATION] Error retrieving application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 5. Citizen submits application to caseworker after reviewing plumber details
app.post("/make-server-698be164/citizen/submit-application", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, bankDetails, autoDebitWaterBill, comments } = body;
    
    console.log(`[SUBMIT TO CASEWORKER] Processing application ${applicationId}`);
    
    const application = await kv.get(`application:${applicationId}`);
    
    if (!application) {
      console.log(`[SUBMIT TO CASEWORKER] ERROR: Application ${applicationId} not found`);
      return c.json({ success: false, error: "Application not found" }, 404);
    }

    console.log(`[SUBMIT TO CASEWORKER] Current application status: ${application.status}`);
    console.log(`[SUBMIT TO CASEWORKER] Current application stage: ${application.currentStage}`);

    // Add bank details and other info from citizen
    application.bankDetails = bankDetails;
    application.autoDebitWaterBill = autoDebitWaterBill;
    application.comments = comments;
    application.status = "submitted";
    application.currentStage = "caseworker";
    application.workflow.applicantReview = { 
      status: "completed", 
      timestamp: new Date().toISOString() 
    };
    application.workflow.caseworker = { 
      status: "pending" 
    };
    application.updatedAt = new Date().toISOString();
    
    await kv.set(`application:${applicationId}`, application);
    console.log(`[SUBMIT TO CASEWORKER] Application ${applicationId} updated with status: ${application.status}`);

    // Add to caseworker queue
    const caseworkerQueue = await kv.get('caseworker:queue') || [];
    if (!caseworkerQueue.includes(applicationId)) {
      caseworkerQueue.push(applicationId);
    }
    await kv.set('caseworker:queue', caseworkerQueue);
    console.log(`[SUBMIT TO CASEWORKER] Added ${applicationId} to caseworker queue. Queue length: ${caseworkerQueue.length}`);

    console.log(`[SUBMIT TO CASEWORKER] Application ${applicationId} submitted to caseworker queue successfully`);
    return c.json({ success: true, application });
  } catch (error) {
    console.log(`[SUBMIT TO CASEWORKER] ERROR: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 6. Get all citizen applications - DIRECT DB SCAN with broad matching
app.get("/make-server-698be164/citizen/:citizenId/applications", async (c) => {
  try {
    const citizenId = c.req.param('citizenId');
    console.log(`[CITIZEN APPS] Fetching ALL applications for citizen: "${citizenId}"`);
    
    // Extract phone number from citizenId for broader matching
    const phoneFromCitizenId = citizenId.replace('CITIZEN-', '');
    
    // DIRECT SCAN: Query all applications from DB and filter by citizenId
    const allApps = await kv.getByPrefix('application:');
    console.log(`[CITIZEN APPS] Total applications in DB: ${allApps.length}`);
    
    const applications: any[] = [];
    const appIds: string[] = [];
    const debugAllApps: any[] = [];
    
    for (const item of allApps) {
      if (!item) continue;
      
      // Collect debug info for ALL apps in DB
      debugAllApps.push({
        id: item.id || 'NO_ID',
        type: item.type || 'NO_TYPE',
        citizenId: item.citizenId || 'NO_CITIZEN_ID',
        status: item.status || 'NO_STATUS',
        mobile: (item.applicantDetails && item.applicantDetails.mobile) || (item.rrData && item.rrData.mobileNo) || 'NO_MOBILE'
      });
      
      if (!item.citizenId) {
        console.log(`[CITIZEN APPS] SKIP (no citizenId): ${item.id}`);
        continue;
      }
      
      const appCid = String(item.citizenId).trim();
      const queryCid = String(citizenId).trim();
      
      // Match by exact citizenId OR by phone number in citizenId/mobile fields
      const exactMatch = appCid === queryCid;
      const phoneMatch = phoneFromCitizenId && phoneFromCitizenId.length > 5 && (
        appCid.includes(phoneFromCitizenId) ||
        ((item.applicantDetails && item.applicantDetails.mobile) ? String(item.applicantDetails.mobile).includes(phoneFromCitizenId) : false) ||
        ((item.rrData && item.rrData.mobileNo) ? String(item.rrData.mobileNo).includes(phoneFromCitizenId) : false)
      );
      
      if (exactMatch || phoneMatch) {
        applications.push(item);
        appIds.push(item.id);
        console.log(`[CITIZEN APPS] MATCH: ${item.id} | type=${item.type} | status=${item.status} | matchType=${exactMatch ? 'exact' : 'phone'}`);
      }
    }
    
    // Rebuild the citizen list index
    if (appIds.length > 0) {
      await kv.set(`citizen:${citizenId}:applications`, appIds);
    }
    
    console.log(`[CITIZEN APPS] Returning ${applications.length} applications for ${citizenId}`);
    return c.json({ 
      success: true, 
      applications,
      _debug: {
        queriedCitizenId: citizenId,
        phoneExtracted: phoneFromCitizenId,
        totalAppsInDb: allApps.length,
        matchedCount: applications.length,
        allAppsInDb: debugAllApps
      }
    });
  } catch (error) {
    console.log(`[CITIZEN APPS] ERROR: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 6c. Get ALL applications - no filtering, raw dump for client-side matching
app.get("/make-server-698be164/citizen/all-apps-raw", async (c) => {
  try {
    console.log(`[ALL APPS RAW] Fetching ALL applications from DB`);
    const allApps = await kv.getByPrefix('application:');
    // Also fetch legacy data applications that have been sent to citizen
    const legacyApps = await kv.getByPrefix('legacy_data:');
    const citizenLegacyApps = (legacyApps || []).filter((app: any) =>
      app && (app.status === 'sent_to_citizen' || app.status === 'approved' || app.status === 'rejected')
    );
    const combined = [...(allApps || []), ...citizenLegacyApps];
    console.log(`[ALL APPS RAW] Found ${(allApps || []).length} regular + ${citizenLegacyApps.length} legacy = ${combined.length} total`);
    return c.json({ success: true, applications: combined, total: combined.length });
  } catch (error) {
    console.log(`[ALL APPS RAW] ERROR: ${error}`);
    return c.json({ success: false, error: String(error), applications: [] }, 500);
  }
});

// ========================================
// CASEWORKER ROUTES
// ========================================

// Create dummy application for testing
app.post("/make-server-698be164/create-dummy-application", async (c) => {
  try {
    const applicationId = 'TAP-2026-DEMO001';
    
    // Check if dummy already exists
    const existingApp = await kv.get(`application:${applicationId}`);
    if (existingApp) {
      console.log(`[DUMMY] Dummy application ${applicationId} already exists`);
      return c.json({ success: true, application: existingApp });
    }
    
    const dummyApplication = {
      id: applicationId,
      citizenId: 'CITIZEN-9876543210',
      
      propertyDetails: {
        district: 'Dharwad',
        ulb: 'Hubballi-Dharwad Municipal Corporation',
        authorityType: 'Municipal Corporation',
        ulbType: 'ULB',
        ownershipType: 'owner',
        propertyId: 'PROP-12345',
      },
      
      applicantDetails: {
        applicantName: 'Rajesh Kumar S',
        fatherName: 'Suresh Kumar',
        mobile: '9876543210',
        email: 'rajesh.kumar@example.com',
        aadharNumber: '1234-5678-9012',
        address: '123, MG Road, Hubballi, Karnataka - 580020',
      },
      
      connectionDetails: {
        propertyType: 'residential',
        connectionType: 'domestic',
        plotNumber: '123',
        surveyNumber: 'SY-456',
        propertyAddress: '123, MG Road, Hubballi',
        pincode: '580020',
      },
      
      plumberDetails: {
        plumberId: 'PLUMBER-001',
        plumberName: 'Ramesh Plumbing Services',
      },
      
      plumberConnectionData: {
        estimationRows: [
          {
            id: '1',
            attribute: 'PVC Pipes (20mm)',
            unitOfMeasurement: 'Meters',
            amount: '5000',
          },
          {
            id: '2',
            attribute: 'Water Meter',
            unitOfMeasurement: 'Units',
            amount: '3000',
          },
          {
            id: '3',
            attribute: 'Installation Charges',
            unitOfMeasurement: 'Lump Sum',
            amount: '7000',
          },
        ],
        totalAmount: 15000,
        siteSketchUploaded: true,
        estimateUploaded: true,
        comments: 'Property is ready for connection. All required infrastructure is in place.',
      },
      
      bankDetails: {
        fullName: 'Rajesh Kumar S',
        bankName: 'State Bank of India',
        branchName: 'Hubballi Main Branch',
        bankAddress: 'MG Road, Hubballi',
        accountNumber: '123456789012',
        ifscCode: 'SBIN0001234',
      },
      
      autoDebitWaterBill: 'yes',
      
      status: 'submitted',
      currentStage: 'caseworker',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      workflow: {
        citizen: { status: 'completed', timestamp: new Date().toISOString() },
        plumber: { status: 'completed', timestamp: new Date().toISOString() },
        applicantReview: { status: 'completed', timestamp: new Date().toISOString() },
        caseworker: { status: 'pending' },
        fieldEngineer: { status: 'not_started' },
        revenueOfficer: { status: 'not_started' },
        commissioner: { status: 'not_started' },
      }
    };
    
    await kv.set(`application:${applicationId}`, dummyApplication);
    console.log(`[DUMMY] Created dummy application: ${applicationId}`);
    
    return c.json({ success: true, application: dummyApplication });
  } catch (error) {
    console.log(`[DUMMY] Error creating dummy application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all applications for caseworker review (application status list)
app.get("/make-server-698be164/caseworker/applications", async (c) => {
  try {
    console.log('[CASEWORKER] Fetching all applications for caseworker review');
    
    // Get all applications from the database
    const allApps = await kv.getByPrefix('application:');
    const appCount = allApps ? allApps.length : 0;
    console.log(`[CASEWORKER] Found ${appCount} total applications in database`);
    
    if (!allApps || appCount === 0) {
      return c.json({ success: true, applications: [] });
    }
    
    const applications: any[] = [];

    for (const item of allApps) {
      try {
        // Include ALL applications that have ever been assigned to or passed through the caseworker.
        if (!item || !item.id) continue;
        
        const hasCaseworkerWorkflow = item.workflow?.caseworker && item.workflow.caseworker.status !== 'not_started';
        const isAtCaseworkerStage = item.status === 'submitted' || 
          item.status === 'sentToCaseworker' ||
          item.status === 'pending_caseworker' ||
          item.status === 'underReview';
        const hasPassedCaseworker = item.status === 'sentToFieldEngineer' ||
          item.status === 'sentToRevenueOfficer' ||
          item.status === 'sentToCommissioner' ||
          item.status === 'fieldVisitScheduled' ||
          item.status === 'sentToCitizenForPayment' ||
          item.status === 'paymentCompleted' ||
          item.status === 'pendingPayment' ||
          item.status === 'sentToPlumberForDisconnection' ||
          item.status === 'sentToPlumberForInstallation' ||
          item.status === 'sentToPlumberForReconnection' ||
          item.status === 'plumber_accepted_disconnection' ||
          item.status === 'plumber_accepted_installation' ||
          item.status === 'disconnection_work_submitted' ||
          item.status === 'disconnection_completed' ||
          item.status === 'reconnection_work_submitted' ||
          item.status === 'installation_work_submitted' ||
          item.status === 'installation_completed' ||
          item.status === 'installation_approved' ||
          item.status === 'approved' || 
          item.status === 'rejected';
        
        if (hasCaseworkerWorkflow || isAtCaseworkerStage || hasPassedCaseworker) {
          applications.push(item);
        }
      } catch (itemErr) {
        console.log(`[CASEWORKER] Skipping bad item: ${itemErr}`);
      }
    }

    // Sort by submission date (newest first)
    applications.sort((a: any, b: any) => new Date(b.submittedAt || b.createdAt || 0).getTime() - new Date(a.submittedAt || a.createdAt || 0).getTime());

    console.log(`[CASEWORKER] Retrieved ${applications.length} applications for caseworker`);
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`[CASEWORKER] ERROR: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Caseworker approves application
app.post("/make-server-698be164/caseworker/approve", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, comments, scheme } = body;
    
    const application = await kv.get(`application:${applicationId}`);
    
    if (!application) {
      return c.json({ success: false, error: "Application not found" }, 404);
    }

    application.status = "approved";
    application.currentStage = "completed";
    application.caseworkerComments = comments;
    application.scheme = scheme; // Save scheme information
    application.workflow.caseworker = { 
      status: "approved", 
      timestamp: new Date().toISOString(),
      comments,
      scheme 
    };
    application.updatedAt = new Date().toISOString();
    application.approvedAt = new Date().toISOString();
    
    await kv.set(`application:${applicationId}`, application);

    // Remove from caseworker queue
    const caseworkerQueue = await kv.get('caseworker:queue') || [];
    const updatedQueue = caseworkerQueue.filter(id => id !== applicationId);
    await kv.set('caseworker:queue', updatedQueue);

    console.log(`Application ${applicationId} approved by caseworker`);
    return c.json({ success: true, application });
  } catch (error) {
    console.log(`Error approving application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Caseworker rejects application
app.post("/make-server-698be164/caseworker/reject", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, comments } = body;
    
    const application = await kv.get(`application:${applicationId}`);
    
    if (!application) {
      return c.json({ success: false, error: "Application not found" }, 404);
    }

    if (!comments || !comments.trim()) {
      return c.json({ success: false, error: "Rejection reason is required" }, 400);
    }

    application.status = "rejected";
    application.currentStage = "rejected";
    application.caseworkerComments = comments;
    application.workflow.caseworker = { 
      status: "rejected", 
      timestamp: new Date().toISOString(),
      comments 
    };
    application.updatedAt = new Date().toISOString();
    application.rejectedAt = new Date().toISOString();
    
    await kv.set(`application:${applicationId}`, application);

    // Remove from caseworker queue
    const caseworkerQueue = await kv.get('caseworker:queue') || [];
    const updatedQueue = caseworkerQueue.filter(id => id !== applicationId);
    await kv.set('caseworker:queue', updatedQueue);

    console.log(`Application ${applicationId} rejected by caseworker`);
    return c.json({ success: true, application });
  } catch (error) {
    console.log(`Error rejecting application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Caseworker forwards application to next actor
app.post("/make-server-698be164/caseworker/forward", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, comment, forwardTo, scheme } = body;
    
    console.log(`[FORWARD] ======== START FORWARD REQUEST ========`);
    console.log(`[FORWARD] Application ID: ${applicationId}`);
    console.log(`[FORWARD] Forward to: ${forwardTo}`);
    console.log(`[FORWARD] Comment: ${comment}`);
    console.log(`[FORWARD] Scheme:`, scheme);
    
    const application = await kv.get(`application:${applicationId}`);
    
    if (!application) {
      console.log(`[FORWARD] ERROR: Application ${applicationId} not found in database`);
      // Let's check what applications exist
      const allApps = await kv.getByPrefix('application:');
      console.log(`[FORWARD] Available applications (total ${allApps.length}):`);
      allApps.forEach(app => {
        console.log(`  - ID: ${app?.id}, Status: ${app?.status}`);
      });
      return c.json({ success: false, error: "Application not found" }, 404);
    }

    console.log(`[FORWARD] Found application: ${applicationId}, current status: ${application.status}`);

    if (!comment || !comment.trim()) {
      return c.json({ success: false, error: "Comment is required" }, 400);
    }

    if (!forwardTo) {
      return c.json({ success: false, error: "Forward recipient is required" }, 400);
    }

    // Update application with caseworker review
    application.caseworkerComments = comment;
    application.scheme = scheme; // Save scheme information
    application.workflow.caseworker = { 
      status: "reviewed", 
      timestamp: new Date().toISOString(),
      comments: comment,
      forwardedTo: forwardTo,
      scheme 
    };
    application.updatedAt = new Date().toISOString();

    // Set next stage and status based on forward recipient
    if (forwardTo === "Field Engineer") {
      application.currentStage = "field_engineer";
      application.status = "sentToFieldEngineer";
      application.workflow.fieldEngineer = { status: "pending" };
      // Add to field engineer queue
      const fieldEngineerQueue = await kv.get('field_engineer:queue') || [];
      if (!fieldEngineerQueue.includes(applicationId)) {
        fieldEngineerQueue.push(applicationId);
        await kv.set('field_engineer:queue', fieldEngineerQueue);
        console.log(`[FORWARD] Added ${applicationId} to field_engineer:queue. Queue length: ${fieldEngineerQueue.length}`);
      }
    } else if (forwardTo === "Revenue Officer") {
      application.currentStage = "revenue_officer";
      application.status = "sentToRevenueOfficer";
      application.workflow.revenueOfficer = { status: "pending" };
      // Add to revenue officer queue
      const revenueOfficerQueue = await kv.get('revenue_officer:queue') || [];
      console.log(`[FORWARD] Current revenue_officer:queue before adding:`, revenueOfficerQueue);
      if (!revenueOfficerQueue.includes(applicationId)) {
        revenueOfficerQueue.push(applicationId);
        await kv.set('revenue_officer:queue', revenueOfficerQueue);
        console.log(`[FORWARD] ✅ Added ${applicationId} to revenue_officer:queue. Queue length: ${revenueOfficerQueue.length}`);
        console.log(`[FORWARD] New queue contents:`, revenueOfficerQueue);
      } else {
        console.log(`[FORWARD] Application ${applicationId} already in revenue_officer:queue`);
      }
    } else if (forwardTo === "Commissioner") {
      application.currentStage = "commissioner";
      application.status = "sentToCommissioner";
      application.workflow.commissioner = { status: "pending" };
      // Add to commissioner queue
      const commissionerQueue = await kv.get('commissioner:queue') || [];
      if (!commissionerQueue.includes(applicationId)) {
        commissionerQueue.push(applicationId);
        await kv.set('commissioner:queue', commissionerQueue);
      }
    }
    
    await kv.set(`application:${applicationId}`, application);
    console.log(`[FORWARD] Updated application ${applicationId} with new status and queue`);

    // Remove from caseworker queue
    const caseworkerQueue = await kv.get('caseworker:queue') || [];
    const updatedQueue = caseworkerQueue.filter(id => id !== applicationId);
    await kv.set('caseworker:queue', updatedQueue);

    // Also remove from dedicated change-connection queue if applicable
    if (application.type === 'changeConnection') {
      const changeQueue = await kv.get('caseworker:change-connection:queue') || [];
      const updatedChangeQueue = changeQueue.filter((id: string) => id !== applicationId);
      await kv.set('caseworker:change-connection:queue', updatedChangeQueue);
      console.log(`[FORWARD] Removed ${applicationId} from caseworker:change-connection:queue`);
    }

    console.log(`Application ${applicationId} forwarded to ${forwardTo} by caseworker`);
    return c.json({ success: true, application });
  } catch (error) {
    console.log(`Error forwarding application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// FIELD ENGINEER MOBILE APP ROUTES
// ========================================

// Get all applications for field engineer review
app.get("/make-server-698be164/field_engineer/applications", async (c) => {
  try {
    console.log('[FIELD ENGINEER] ======== FETCHING APPLICATIONS ========');
    console.log('[FIELD ENGINEER] Fetching all applications for field engineer review');
    
    // Get all applications from the database
    const allApps = await kv.getByPrefix('application:');
    console.log(`[FIELD ENGINEER] Found ${allApps.length} total applications in database`);
    
    const applications = [];

    // THREE-TIER inclusion strategy (same pattern as caseworker fix):
    // Tier 1: Has field engineer workflow data (app was assigned to or processed by FE)
    // Tier 2: Current status is at field engineer stage
    // Tier 3: Comprehensive list of ALL downstream statuses (app has passed through FE)
    for (const item of allApps) {
      if (item && item.id) {
        // Tier 1: Has field engineer workflow data
        const hasFieldEngineerWorkflow = item.workflow?.fieldEngineer && item.workflow.fieldEngineer.status !== 'not_started';
        
        // Tier 2: Currently at field engineer stage
        const isAtFieldEngineerStage = item.status === 'sentToFieldEngineer' || 
                          item.status === 'sentToFieldEngineerForReconnection' ||
                          item.currentStage === 'field_engineer' ||
                          item.currentStage === 'field_engineer_verification' ||
                          item.currentStage === 'field_engineer_plumber_assignment' ||
                          item.status === 'fieldVisitScheduled' ||
                          item.fieldVisit;
        
        // Tier 3: All downstream statuses (app has passed through FE to next actors)
        const hasPassedFieldEngineer = item.status === 'sentToCommissioner' ||
                          item.status === 'sentToRevenueOfficer' ||
                          item.status === 'sentToCitizenForPayment' ||
                          item.status === 'paymentCompleted' ||
                          item.status === 'pendingPayment' ||
                          item.status === 'sentToPlumberForDisconnection' ||
                          item.status === 'sentToPlumberForInstallation' ||
                          item.status === 'sentToPlumberForReconnection' ||
                          item.status === 'plumber_accepted_disconnection' ||
                          item.status === 'plumber_accepted_installation' ||
                          item.status === 'plumber_accepted_reconnection' ||
                          item.status === 'reconnection_work_submitted' ||
                          item.status === 'installation_work_submitted' ||
                          item.status === 'installation_completed' ||
                          item.status === 'installation_approved' ||
                          item.status === 'disconnection_work_submitted' ||
                          item.status === 'disconnection_completed' ||
                          item.status === 'reconnection_completed' ||
                          item.status === 'change_connection_forwarded_to_fe' ||
                          item.status === 'change_connection_completed' ||
                          item.status === 'approved' || 
                          item.status === 'rejected';
        
        // For Tier 3 downstream, only include if FE was actually involved
        const shouldInclude = hasFieldEngineerWorkflow || isAtFieldEngineerStage || 
          (hasPassedFieldEngineer && item.workflow?.fieldEngineer);
        
        console.log(`[FIELD ENGINEER] Checking app ${item.id}: status=${item.status}, hasFEWorkflow=${!!hasFieldEngineerWorkflow}, isAtFEStage=${!!isAtFieldEngineerStage}, hasPassedFE=${!!hasPassedFieldEngineer}, include=${!!shouldInclude}`);
        
        if (shouldInclude) {
          console.log(`[FIELD ENGINEER] ✓ INCLUDING application ${item.id} with status ${item.status}`);
          applications.push(item);
        } else {
          console.log(`[FIELD ENGINEER] ✗ EXCLUDING application ${item.id}`);
        }
      }
    }

    // Sort by forwarded date (newest first)
    applications.sort((a, b) => {
      const dateA = a.workflow?.fieldEngineer?.timestamp || a.workflow?.caseworker?.timestamp || a.submittedAt;
      const dateB = b.workflow?.fieldEngineer?.timestamp || b.workflow?.caseworker?.timestamp || b.submittedAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    console.log(`[FIELD ENGINEER] Retrieved ${applications.length} applications for Field Engineer`);
    console.log('[FIELD ENGINEER] ======== END FETCH ========');
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`[FIELD ENGINEER] ERROR: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all applications for revenue officer review
app.get("/make-server-698be164/revenue_officer/applications", async (c) => {
  try {
    console.log('[REVENUE OFFICER] ======== FETCHING APPLICATIONS ========');
    
    // THREE-TIER inclusion strategy (same pattern as caseworker/FE fix):
    // Previously used queue-only approach which lost apps after forwarding.
    const allApps = await kv.getByPrefix('application:');
    console.log(`[REVENUE OFFICER] Found ${allApps.length} total applications in database`);
    
    const applications: any[] = [];

    for (const item of allApps) {
      if (item && item.id) {
        // Tier 1: Has revenue officer workflow data
        const hasROWorkflow = item.workflow?.revenueOfficer && item.workflow.revenueOfficer.status !== 'not_started';
        
        // Tier 2: Currently at revenue officer stage
        const isAtROStage = item.status === 'sentToRevenueOfficer' ||
          item.currentStage === 'revenue_officer' ||
          item.status === 'pending_revenue_officer';
        
        // Tier 3: All downstream statuses (app has passed through RO)
        const hasPassedRO = item.status === 'sentToFieldEngineer' ||
          item.status === 'sentToCommissioner' ||
          item.status === 'fieldVisitScheduled' ||
          item.status === 'sentToCitizenForPayment' ||
          item.status === 'paymentCompleted' ||
          item.status === 'pendingPayment' ||
          item.status === 'sentToPlumberForInstallation' ||
          item.status === 'sentToPlumberForReconnection' ||
          item.status === 'plumber_accepted_installation' ||
          item.status === 'plumber_accepted_reconnection' ||
          item.status === 'reconnection_work_submitted' ||
          item.status === 'installation_work_submitted' ||
          item.status === 'installation_completed' ||
          item.status === 'installation_approved' ||
          item.status === 'reconnection_completed' ||
          item.status === 'approved' || 
          item.status === 'rejected';

        // For Tier 3 downstream, only include if RO was actually involved
        const shouldInclude = hasROWorkflow || isAtROStage || 
          (hasPassedRO && item.workflow?.revenueOfficer);

        console.log(`[REVENUE OFFICER] Checking app ${item.id}: status=${item.status}, hasROWorkflow=${!!hasROWorkflow}, isAtROStage=${!!isAtROStage}, include=${!!shouldInclude}`);

        if (shouldInclude) {
          console.log(`[REVENUE OFFICER] ✓ Including application ${item.id} with status ${item.status}`);
          applications.push(item);
        }
      }
    }

    // Sort by forwarded date (newest first)
    applications.sort((a: any, b: any) => {
      const wfA = a.workflow || {};
      const wfB = b.workflow || {};
      const feA = wfA.fieldEngineer || {};
      const feB = wfB.fieldEngineer || {};
      const cwA = wfA.caseworker || {};
      const cwB = wfB.caseworker || {};
      const dateA = feA.timestamp || cwA.timestamp || a.submittedAt;
      const dateB = feB.timestamp || cwB.timestamp || b.submittedAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    console.log(`[REVENUE OFFICER] Retrieved ${applications.length} applications`);
    console.log(`[REVENUE OFFICER] ======== END FETCH ========`);
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`[REVENUE OFFICER] ERROR: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all applications for commissioner review
app.get("/make-server-698be164/commissioner/applications", async (c) => {
  try {
    console.log('[COMMISSIONER] ======== FETCHING APPLICATIONS ========');
    console.log('[COMMISSIONER] Fetching all applications for commissioner review');
    
    // Get all applications from the database
    const allApps = await kv.getByPrefix('application:');
    console.log(`[COMMISSIONER] Found ${allApps.length} total applications in database`);
    
    const applications = [];

    // THREE-TIER inclusion strategy (same pattern as caseworker/FE/RO fix):
    for (const item of allApps) {
      if (item && item.id) {
        // Tier 1: Has commissioner workflow data
        const hasCommissionerWorkflow = item.workflow?.commissioner && item.workflow.commissioner.status !== 'not_started';
        
        // Tier 2: Currently at commissioner stage
        const isAtCommissionerStage = item.status === 'sentToCommissioner' || 
                                     item.currentStage === 'commissioner';
        
        // Tier 3: All downstream statuses (app has passed through commissioner)
        const hasPassedCommissioner = item.status === 'sentToCitizenForPayment' ||
                                     item.status === 'paymentCompleted' ||
                                     item.status === 'pendingPayment' ||
                                     item.status === 'sentToPlumberForDisconnection' ||
                                     item.status === 'sentToPlumberForInstallation' ||
                                     item.status === 'sentToPlumberForReconnection' ||
                                     item.status === 'plumber_accepted_disconnection' ||
                                     item.status === 'plumber_accepted_installation' ||
                                     item.status === 'plumber_accepted_reconnection' ||
                                     item.status === 'reconnection_work_submitted' ||
                                     item.status === 'installation_work_submitted' ||
                                     item.status === 'installation_completed' ||
                                     item.status === 'installation_approved' ||
                                     item.status === 'disconnection_work_submitted' ||
                                     item.status === 'disconnection_completed' ||
                                     item.status === 'reconnection_completed' ||
                                     item.status === 'approved' || 
                                     item.status === 'rejected';
        
        // Also catch sent-back scenarios
        const isSentBack = item.workflow?.commissioner?.status === 'sent_back';
        
        // For Tier 3, only include if commissioner was actually involved
        const shouldInclude = hasCommissionerWorkflow || isAtCommissionerStage || isSentBack ||
          (hasPassedCommissioner && item.workflow?.commissioner);
        
        console.log(`[COMMISSIONER] Checking app ${item.id}: status=${item.status}, hasCommWorkflow=${!!hasCommissionerWorkflow}, isAtCommStage=${!!isAtCommissionerStage}, include=${!!shouldInclude}`);
        
        if (shouldInclude) {
          console.log(`[COMMISSIONER] ✓ Including application ${item.id}`);
          applications.push(item);
        } else {
          console.log(`[COMMISSIONER] ✗ EXCLUDING application ${item.id}`);
        }
      }
    }

    // Sort by forwarded date (newest first)
    applications.sort((a, b) => {
      const dateA = a.workflow?.fieldEngineer?.timestamp || a.submittedAt;
      const dateB = b.workflow?.fieldEngineer?.timestamp || b.submittedAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    console.log(`[COMMISSIONER] Retrieved ${applications.length} applications for Commissioner`);
    console.log('[COMMISSIONER] ======== END FETCH ========');
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`[COMMISSIONER] ERROR: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Field Engineer assigns plumber and forwards reconnection to plumber (post-payment)
app.post("/make-server-698be164/field_engineer/assign-plumber-reconnection", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, plumberId, plumberName, engineerName, comments, siteVisitDone, siteVisitRemarks } = body;

    console.log(`[FE ASSIGN PLUMBER RECON] Assigning plumber for reconnection: ${applicationId}`);

    if (!applicationId) return c.json({ success: false, error: 'Application ID is required' }, 400);
    if (!plumberName) return c.json({ success: false, error: 'Plumber must be selected' }, 400);

    const application = await kv.get(`application:${applicationId}`);
    if (!application) return c.json({ success: false, error: 'Application not found' }, 404);

    if (application.status !== 'sentToFieldEngineerForReconnection') {
      return c.json({ success: false, error: `Invalid status: ${application.status}. Expected sentToFieldEngineerForReconnection.` }, 400);
    }

    // Update application
    application.status = 'sentToPlumberForReconnection';
    application.currentStage = 'plumber_reconnection';
    application.assignedPlumber = plumberName;
    application.assignedPlumberId = plumberId || '';

    if (!application.workflow) application.workflow = {};
    application.workflow.fieldEngineerReconnectionAssignment = {
      status: 'plumber_assigned',
      engineerName: engineerName || 'Field Engineer',
      comments: comments || '',
      plumberAssigned: plumberName,
      plumberId: plumberId || '',
      siteVisitDone: siteVisitDone || 'no',
      siteVisitRemarks: siteVisitRemarks || '',
      assignedAt: new Date().toISOString(),
    };
    application.updatedAt = new Date().toISOString();

    await kv.set(`application:${applicationId}`, application);

    // Add to plumber queue
    const plumberQueue = await kv.get('plumber:queue') || [];
    if (!plumberQueue.includes(applicationId)) {
      plumberQueue.push(applicationId);
      await kv.set('plumber:queue', plumberQueue);
    }

    // Remove from field engineer reconnection queue
    const feQueue = await kv.get('field_engineer:reconnection_queue') || [];
    const updatedFeQueue = feQueue.filter((id: string) => id !== applicationId);
    await kv.set('field_engineer:reconnection_queue', updatedFeQueue);

    console.log(`[FE ASSIGN PLUMBER RECON] Plumber ${plumberName} assigned. App sent to plumber queue.`);
    return c.json({ success: true, message: `Plumber ${plumberName} assigned. Application forwarded to plumber for reconnection work.` });
  } catch (error) {
    console.log(`[FE ASSIGN PLUMBER RECON] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Field Engineer verifies plumber reconnection work
app.post("/make-server-698be164/field_engineer/verify-reconnection", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, action, verificationRemarks, engineerName, siteVisitDone, siteVisitRemarks } = body;

    console.log(`[FIELD ENGINEER VERIFY] Reviewing reconnection for: ${applicationId}, action: ${action}, siteVisit: ${siteVisitDone}`);

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    if (application.status !== 'reconnection_work_submitted') {
      return c.json({ success: false, error: `Invalid status for verification: ${application.status}. Expected reconnection_work_submitted.` }, 400);
    }

    if (!application.workflow) application.workflow = {};

    if (action === 'approve') {
      application.status = 'reconnection_completed';
      application.currentStage = 'completed';

      application.workflow.fieldEngineerVerification = {
        status: 'approved',
        engineerName: engineerName || 'Field Engineer',
        remarks: verificationRemarks || 'Reconnection work reviewed and application closed',
        verifiedAt: new Date().toISOString(),
        siteVisitDone: siteVisitDone || 'no',
        siteVisitRemarks: siteVisitRemarks || '',
      };

      // Remove from field engineer reconnection queue
      const feQueue = await kv.get('field_engineer:reconnection_queue') || [];
      const updatedQueue = feQueue.filter((id: string) => id !== applicationId);
      await kv.set('field_engineer:reconnection_queue', updatedQueue);

      console.log(`[FIELD ENGINEER VERIFY] Application CLOSED for ${applicationId}. Status: reconnection_completed, siteVisit: ${siteVisitDone}`);
    } else if (action === 'rework') {
      application.status = 'plumber_accepted_reconnection';
      application.currentStage = 'plumber_rework';

      application.workflow.fieldEngineerVerification = {
        status: 'rework_requested',
        engineerName: engineerName || 'Field Engineer',
        remarks: verificationRemarks || 'Rework required',
        requestedAt: new Date().toISOString(),
      };

      // Add back to plumber mobile queue for rework
      const mobileQueue = await kv.get('plumber:mobile_reconnection_queue') || [];
      if (!mobileQueue.includes(applicationId)) {
        mobileQueue.push(applicationId);
        await kv.set('plumber:mobile_reconnection_queue', mobileQueue);
      }

      // Remove from field engineer reconnection queue
      const feQueue = await kv.get('field_engineer:reconnection_queue') || [];
      const updatedQueue = feQueue.filter((id: string) => id !== applicationId);
      await kv.set('field_engineer:reconnection_queue', updatedQueue);

      console.log(`[FIELD ENGINEER VERIFY] REWORK requested for ${applicationId}. Sent back to plumber.`);
    } else {
      return c.json({ success: false, error: `Invalid action: ${action}. Expected 'approve' or 'rework'.` }, 400);
    }

    application.updatedAt = new Date().toISOString();
    await kv.set(`application:${applicationId}`, application);

    return c.json({
      success: true,
      message: action === 'approve'
        ? 'Reconnection work verified and approved. Connection is now active.'
        : 'Rework requested. Application sent back to plumber.',
      application,
    });
  } catch (error) {
    console.log(`[FIELD ENGINEER VERIFY] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Field Engineer saves plumber assignment and site visit preference (partial save before forward)
app.post("/make-server-698be164/field_engineer/save-assignment", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, assignedPlumber, wantsSiteVisit } = body;

    console.log(`[FE SAVE-ASSIGNMENT] Application: ${applicationId}, Plumber: ${assignedPlumber}, SiteVisit: ${wantsSiteVisit}`);

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: "Application not found" }, 404);
    }

    // Save plumber assignment and site visit preference at top level
    if (assignedPlumber) {
      application.fieldEngineerAssignedPlumber = assignedPlumber;
    }
    if (wantsSiteVisit) {
      application.fieldEngineerWantsSiteVisit = wantsSiteVisit;
    }

    // Also update workflow partial data
    if (!application.workflow) application.workflow = {};
    if (!application.workflow.fieldEngineer) application.workflow.fieldEngineer = { status: 'pending' };
    application.workflow.fieldEngineer.assignedPlumber = assignedPlumber || null;
    application.workflow.fieldEngineer.wantsSiteVisit = wantsSiteVisit || null;
    application.updatedAt = new Date().toISOString();

    await kv.set(`application:${applicationId}`, application);
    console.log(`[FE SAVE-ASSIGNMENT] Saved assignment for ${applicationId}`);

    return c.json({ success: true, application });
  } catch (error) {
    console.log(`[FE SAVE-ASSIGNMENT] ERROR: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Field Engineer forwards application to Revenue Officer/Commissioner
app.post("/make-server-698be164/field_engineer/forward", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, comment, forwardTo, visitDate, visitPurpose, assignedPlumber, wantsSiteVisit } = body;
    
    console.log(`[FIELD ENGINEER FORWARD] ======== START FORWARD REQUEST ========`);
    console.log(`[FIELD ENGINEER FORWARD] Application ID: ${applicationId}`);
    console.log(`[FIELD ENGINEER FORWARD] Forward to: ${forwardTo}`);
    console.log(`[FIELD ENGINEER FORWARD] Comment: ${comment}`);
    console.log(`[FIELD ENGINEER FORWARD] Assigned Plumber: ${assignedPlumber || 'None'}`);
    console.log(`[FIELD ENGINEER FORWARD] Wants Site Visit: ${wantsSiteVisit || 'Not specified'}`);
    
    const application = await kv.get(`application:${applicationId}`);
    
    if (!application) {
      console.log(`[FIELD ENGINEER FORWARD] ERROR: Application ${applicationId} not found`);
      return c.json({ success: false, error: "Application not found" }, 404);
    }

    if (!comment || !comment.trim()) {
      return c.json({ success: false, error: "Comment is required" }, 400);
    }

    if (!forwardTo) {
      return c.json({ success: false, error: "Forward recipient is required" }, 400);
    }

    // Update application with field engineer review
    application.fieldEngineerComments = comment;
    application.visitScheduled = visitDate ? {
      visitDate,
      visitPurpose,
      scheduledAt: new Date().toISOString()
    } : null;
    application.workflow.fieldEngineer = { 
      status: "reviewed", 
      timestamp: new Date().toISOString(),
      comments: comment,
      forwardedTo: forwardTo,
      assignedPlumber: assignedPlumber || null,
      wantsSiteVisit: wantsSiteVisit || null
    };
    // Also store at top level for easy access
    if (assignedPlumber) {
      application.fieldEngineerAssignedPlumber = assignedPlumber;
    }
    if (wantsSiteVisit) {
      application.fieldEngineerWantsSiteVisit = wantsSiteVisit;
    }
    application.updatedAt = new Date().toISOString();

    // Set next stage and status based on forward recipient
    if (forwardTo === "Revenue Officer") {
      application.currentStage = "revenue_officer";
      application.status = "sentToRevenueOfficer";
      application.workflow.revenueOfficer = { status: "pending" };
      
      // Add to revenue officer queue
      const revenueOfficerQueue = await kv.get('revenue_officer:queue') || [];
      if (!revenueOfficerQueue.includes(applicationId)) {
        revenueOfficerQueue.push(applicationId);
        await kv.set('revenue_officer:queue', revenueOfficerQueue);
        console.log(`[FIELD ENGINEER FORWARD] Added ${applicationId} to revenue_officer:queue`);
      }
      
      // Remove from field engineer queue
      const fieldEngineerQueue = await kv.get('field_engineer:queue') || [];
      const updatedQueue = fieldEngineerQueue.filter(id => id !== applicationId);
      await kv.set('field_engineer:queue', updatedQueue);
      
    } else if (forwardTo === "Commissioner") {
      console.log(`[FIELD ENGINEER FORWARD] ✅ Forwarding to Commissioner`);
      console.log(`[FIELD ENGINEER FORWARD] Current application status: ${application.status}`);
      console.log(`[FIELD ENGINEER FORWARD] Current application stage: ${application.currentStage}`);
      
      application.currentStage = "commissioner";
      application.status = "sentToCommissioner";
      application.workflow.commissioner = { status: "pending" };
      
      console.log(`[FIELD ENGINEER FORWARD] Updated application status to: ${application.status}`);
      console.log(`[FIELD ENGINEER FORWARD] Updated application stage to: ${application.currentStage}`);
      
      // Add to commissioner queue
      const commissionerQueue = await kv.get('commissioner:queue') || [];
      console.log(`[FIELD ENGINEER FORWARD] Current commissioner queue:`, commissionerQueue);
      if (!commissionerQueue.includes(applicationId)) {
        commissionerQueue.push(applicationId);
        await kv.set('commissioner:queue', commissionerQueue);
        console.log(`[FIELD ENGINEER FORWARD] ✅ Added ${applicationId} to commissioner:queue. New length: ${commissionerQueue.length}`);
      } else {
        console.log(`[FIELD ENGINEER FORWARD] Application ${applicationId} already in commissioner:queue`);
      }
      
      // Remove from field engineer queue
      const fieldEngineerQueue = await kv.get('field_engineer:queue') || [];
      console.log(`[FIELD ENGINEER FORWARD] Current field_engineer queue before removal:`, fieldEngineerQueue);
      const updatedQueue = fieldEngineerQueue.filter(id => id !== applicationId);
      await kv.set('field_engineer:queue', updatedQueue);
      console.log(`[FIELD ENGINEER FORWARD] ✅ Removed ${applicationId} from field_engineer:queue. New length: ${updatedQueue.length}`);
    }
    
    console.log(`[FIELD ENGINEER FORWARD] ✅ Saving application to database...`);
    await kv.set(`application:${applicationId}`, application);
    console.log(`[FIELD ENGINEER FORWARD] ✅ Application ${applicationId} saved successfully`);
    console.log(`[FIELD ENGINEER FORWARD] Final application data:`, {
      id: application.id,
      status: application.status,
      currentStage: application.currentStage,
      workflow: application.workflow
    });
    console.log(`[FIELD ENGINEER FORWARD] ======== Application ${applicationId} forwarded to ${forwardTo} ========`);

    return c.json({ success: true, application });
  } catch (error) {
    console.log(`[FIELD ENGINEER FORWARD] ERROR: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Revenue Officer forwards application to Commissioner
app.post("/make-server-698be164/revenue_officer/forward", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, comment, forwardTo } = body;
    
    console.log(`[REVENUE OFFICER FORWARD] ======== START FORWARD REQUEST ========`);
    console.log(`[REVENUE OFFICER FORWARD] Application ID: ${applicationId}`);
    console.log(`[REVENUE OFFICER FORWARD] Forward to: ${forwardTo}`);
    console.log(`[REVENUE OFFICER FORWARD] Comment: ${comment}`);
    
    const application = await kv.get(`application:${applicationId}`);
    
    if (!application) {
      console.log(`[REVENUE OFFICER FORWARD] ERROR: Application ${applicationId} not found`);
      return c.json({ success: false, error: "Application not found" }, 404);
    }

    if (!comment || !comment.trim()) {
      return c.json({ success: false, error: "Comment is required" }, 400);
    }

    // Update application with revenue officer review
    application.revenueOfficerComments = comment;
    application.workflow.revenueOfficer = { 
      status: "reviewed", 
      timestamp: new Date().toISOString(),
      comments: comment,
      forwardedTo: forwardTo || "Field Engineer"
    };
    application.updatedAt = new Date().toISOString();

    // Forward to Field Engineer or Commissioner
    if (forwardTo === "Field Engineer") {
      application.currentStage = "field_engineer";
      application.status = "sentToFieldEngineer";
      application.workflow.fieldEngineer = { status: "pending" };
      
      // Add to field engineer queue
      const fieldEngineerQueue = await kv.get('field_engineer:queue') || [];
      if (!fieldEngineerQueue.includes(applicationId)) {
        fieldEngineerQueue.push(applicationId);
        await kv.set('field_engineer:queue', fieldEngineerQueue);
        console.log(`[REVENUE OFFICER FORWARD] Added ${applicationId} to field_engineer:queue`);
      }
      
      // DO NOT remove from revenue officer queue - keep for history/tracking
      // Revenue officer should still see forwarded applications with updated status
      console.log(`[REVENUE OFFICER FORWARD] Application ${applicationId} remains in revenue_officer:queue with status: sentToFieldEngineer`);
      
    } else {
      // Default to Commissioner
      application.currentStage = "commissioner";
      application.status = "sentToCommissioner";
      application.workflow.commissioner = { status: "pending" };
      
      // Add to commissioner queue
      const commissionerQueue = await kv.get('commissioner:queue') || [];
      if (!commissionerQueue.includes(applicationId)) {
        commissionerQueue.push(applicationId);
        await kv.set('commissioner:queue', commissionerQueue);
        console.log(`[REVENUE OFFICER FORWARD] Added ${applicationId} to commissioner:queue`);
      }
      
      // DO NOT remove from revenue officer queue - keep for history/tracking
      // Revenue officer should still see forwarded applications with updated status
      console.log(`[REVENUE OFFICER FORWARD] Application ${applicationId} remains in revenue_officer:queue with status: sentToCommissioner`);
    }
    
    await kv.set(`application:${applicationId}`, application);
    console.log(`[REVENUE OFFICER FORWARD] Application ${applicationId} forwarded to ${forwardTo || 'Commissioner'}`);

    return c.json({ success: true, application });
  } catch (error) {
    console.log(`[REVENUE OFFICER FORWARD] ERROR: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Field Engineer schedules a field visit
app.post("/make-server-698be164/field-engineer/schedule-visit", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, visitDate, visitPurpose } = body;
    
    console.log(`[FIELD ENGINEER SCHEDULE] ======== START SCHEDULE REQUEST ========`);
    console.log(`[FIELD ENGINEER SCHEDULE] Application ID: ${applicationId}`);
    console.log(`[FIELD ENGINEER SCHEDULE] Visit Date: ${visitDate}`);
    console.log(`[FIELD ENGINEER SCHEDULE] Visit Purpose: ${visitPurpose}`);
    
    const application = await kv.get(`application:${applicationId}`);
    
    if (!application) {
      console.log(`[FIELD ENGINEER SCHEDULE] ERROR: Application ${applicationId} not found`);
      return c.json({ success: false, error: "Application not found" }, 404);
    }

    if (!visitDate || !visitPurpose) {
      return c.json({ success: false, error: "Visit date and purpose are required" }, 400);
    }

    // Create a visit record for the mobile app
    const visitId = `visit:${applicationId}:${Date.now()}`;
    const visitRecord = {
      visitId,
      applicationNo: application.id,
      applicationId: application.id,
      applicantDetails: application.applicantDetails,
      propertyDetails: application.propertyDetails,
      visitDate,
      visitPurpose,
      status: 'pending',
      scheduledBy: 'Field Engineer',
      scheduledAt: new Date().toISOString(),
      plumberEstimation: application.plumberConnectionData,
      scheme: application.scheme,
      caseworkerComments: application.workflow?.caseworker?.comments,
      revenueOfficerComments: application.workflow?.revenueOfficer?.comments,
    };

    // Save the visit record
    await kv.set(visitId, visitRecord);
    console.log(`[FIELD ENGINEER SCHEDULE] Created visit record: ${visitId}`);

    // Add to mobile sync queue
    const mobileQueue = await kv.get('mobile:sync_queue') || [];
    if (!mobileQueue.includes(visitId)) {
      mobileQueue.push(visitId);
      await kv.set('mobile:sync_queue', mobileQueue);
      console.log(`[FIELD ENGINEER SCHEDULE] Added ${visitId} to mobile:sync_queue`);
    }

    // Update the application with visit details
    application.fieldVisit = {
      visitDate,
      visitPurpose,
      status: 'scheduled',
      scheduledAt: new Date().toISOString(),
    };
    application.status = 'fieldVisitScheduled';
    application.workflow.fieldEngineer = {
      status: 'visit_scheduled',
      timestamp: new Date().toISOString(),
      visitDate,
      visitPurpose,
    };
    application.updatedAt = new Date().toISOString();
    
    await kv.set(`application:${applicationId}`, application);
    console.log(`[FIELD ENGINEER SCHEDULE] Updated application ${applicationId} with visit details`);

    return c.json({ 
      success: true, 
      message: 'Field visit scheduled successfully',
      visitId,
      application 
    });
  } catch (error) {
    console.log(`[FIELD ENGINEER SCHEDULE] ERROR: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get applications with scheduled field visits for mobile app
app.get("/make-server-698be164/jalanidhi/applications", async (c) => {
  try {
    const status = c.req.query('status');
    
    if (status === 'field_visit_scheduled') {
      // Get all scheduled visits from mobile sync queue
      const mobileQueue = await kv.get('mobile:sync_queue') || [];
      console.log(`[MOBILE APP] Fetching ${mobileQueue.length} scheduled visits`);
      
      const applications = [];
      for (const visitId of mobileQueue) {
        const visit = await kv.get(visitId);
        if (visit) {
          // Determine display status based on visit status
          let displayStatus = 'Verification'; // Default for pending visits
          
          if (visit.status === 'completed') {
            displayStatus = 'Verified';
          } else if (visit.status === 'pending') {
            displayStatus = 'Verification';
          }
          
          applications.push({
            applicationNo: visit.applicationNo,
            applicantName: visit.applicantDetails?.applicantName || 'N/A',
            address: visit.propertyDetails?.address || 'N/A',
            visitDate: visit.visitDate,
            visitPurpose: visit.visitPurpose,
            status: displayStatus,
            visitStatus: visit.status, // Include raw status for reference
          });
        }
      }
      
      console.log(`[MOBILE APP] Returning ${applications.length} applications (pending + completed)`);
      return c.json({ success: true, applications });
    }
    
    return c.json({ success: false, error: 'Invalid status parameter' }, 400);
  } catch (error) {
    console.log(`[MOBILE APP] Error fetching applications: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single application details for mobile app
app.get("/make-server-698be164/jalanidhi/applications/:applicationNo", async (c) => {
  try {
    const applicationNo = c.req.param('applicationNo');
    
    // Find the application
    const allApps = await kv.getByPrefix('application:');
    const application = allApps.find(app => app.applicationNo === applicationNo);
    
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    
    // Find the scheduled visit
    const mobileQueue = await kv.get('mobile:sync_queue') || [];
    let visitData = null;
    
    for (const visitId of mobileQueue) {
      const visit = await kv.get(visitId);
      if (visit && visit.applicationNo === applicationNo) {
        visitData = visit;
        break;
      }
    }
    
    const response = {
      applicationNo: application.applicationNo,
      applicantName: application.applicantDetails?.applicantName || 'N/A',
      mobileNumber: application.applicantDetails?.mobileNumber || 'N/A',
      address: application.propertyDetails?.address || 'N/A',
      propertyType: application.propertyDetails?.propertyType || 'N/A',
      connectionType: application.connectionDetails?.connectionType || 'N/A',
      visitDate: visitData?.visitDate || '',
      visitPurpose: visitData?.visitPurpose || '',
      status: application.status,
    };
    
    return c.json(response);
  } catch (error) {
    console.log(`[MOBILE APP] Error fetching application details: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Submit field engineer site visit report from mobile app
app.post("/make-server-698be164/jalanidhi/field-engineer/submit-report", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      applicationNo, engineerId, engineerName, visitStatus, remarks, photoCount, visitDate,
      locationVerification, siteObservations, photos, documents,
      plumberEstimation, fieldEngineerEstimation, inspectionChecklist,
      unauthorizedTapConnection
    } = body;
    
    if (!applicationNo || !visitStatus) {
      return c.json({ 
        success: false, 
        error: 'Application number and visit status are required' 
      }, 400);
    }
    
    console.log(`[MOBILE APP] Field engineer ${engineerName} submitting report for application: ${applicationNo}`);
    
    // Find and update the visit record
    const mobileQueue = await kv.get('mobile:sync_queue') || [];
    let visitId = null;
    
    for (const id of mobileQueue) {
      const visit = await kv.get(id);
      if (visit && (visit.applicationNo === applicationNo || visit.applicationId === applicationNo)) {
        visitId = id;
        // Update visit with report data
        visit.status = 'completed';
        visit.visitStatus = visitStatus;
        visit.engineerRemarks = remarks;
        visit.photoCount = photoCount || 0;
        visit.completedAt = visitDate;
        visit.engineerId = engineerId;
        visit.engineerName = engineerName;
        await kv.set(visitId, visit);
        console.log(`[MOBILE APP] Updated visit record: ${visitId}`);
        break;
      }
    }
    
    // Update application status based on visit outcome
    const allApps = await kv.getByPrefix('application:');
    console.log(`[MOBILE APP] Searching for application with applicationNo/id: ${applicationNo} in ${allApps.length} applications`);
    const application = allApps.find(app => app.id === applicationNo || app.applicationNo === applicationNo);
    
    if (application) {
      console.log(`[MOBILE APP] Found application: ${application.id}, current status: ${application.status}, fieldVisit status: ${application.fieldVisit?.status}`);
      const appKey = `application:${application.id}`;
      
      // Get the visit data for the full report
      const visitData = visitId ? await kv.get(visitId) : null;
      
      if (visitStatus === 'approved') {
        console.log(`[MOBILE APP] Updating application ${application.id} to field_visit_completed`);
        application.status = 'field_visit_completed';
        
        // Update the fieldVisit status to completed
        if (application.fieldVisit) {
          application.fieldVisit.status = 'completed';
          application.fieldVisit.completedAt = visitDate;
        }
        
        // Add the field visit report to application with full data from mobile
        application.fieldVisitReport = {
          engineerName: engineerName || 'Field Engineer',
          submittedAt: visitDate || new Date().toISOString(),
          locationVerification: {
            verified: locationVerification?.verified ?? true,
            latitude: locationVerification?.latitude || visitData?.propertyDetails?.latitude || 12.9716,
            longitude: locationVerification?.longitude || visitData?.propertyDetails?.longitude || 77.5946,
            address: visitData?.propertyDetails?.address || application.propertyDetails?.address || 'N/A',
            verifiedAt: visitDate || new Date().toISOString(),
          },
          siteObservations: siteObservations || remarks || 'Site visit completed successfully.',
          engineerRemarks: remarks || 'Property verified and ready for connection.',
          photos: photos || [],
          documents: documents || [],
          plumberEstimation: plumberEstimation || null,
          fieldEngineerEstimation: fieldEngineerEstimation || null,
          inspectionChecklist: inspectionChecklist || [],
          unauthorizedTapConnection: unauthorizedTapConnection || { found: false, penaltyAmount: 0 },
        };
        
        application.fieldEngineerApproval = {
          engineerId,
          engineerName,
          status: 'approved',
          remarks,
          photoCount: photoCount || 0,
          completedAt: visitDate,
        };
        
        // Update workflow status
        application.workflow.fieldEngineer = {
          status: 'completed',
          timestamp: new Date().toISOString(),
        };
        
        // Move to next stage (Commissioner/CO for final approval)
        const commissionerQueue = await kv.get('commissioner:queue') || [];
        if (!commissionerQueue.includes(application.id)) {
          commissionerQueue.push(application.id);
          await kv.set('commissioner:queue', commissionerQueue);
        }
        
        // Keep the application in field_engineer queue so they can still view completed visits
        // (The dashboard will filter by status to show appropriate actions)
        console.log(`[MOBILE APP] ✓ Added application ${application.id} to commissioner:queue`);
        
      } else if (visitStatus === 'rejected') {
        application.status = 'field_visit_rejected';
        
        // Update the fieldVisit status to rejected
        if (application.fieldVisit) {
          application.fieldVisit.status = 'rejected';
          application.fieldVisit.completedAt = visitDate;
        }
        
        application.fieldEngineerApproval = {
          engineerId,
          engineerName,
          status: 'rejected',
          remarks,
          photoCount: photoCount || 0,
          completedAt: visitDate,
        };
        
        // Update workflow status
        application.workflow.fieldEngineer = {
          status: 'rejected',
          timestamp: new Date().toISOString(),
        };
      }
      
      application.updatedAt = new Date().toISOString();
      await kv.set(appKey, application);
      console.log(`[MOBILE APP] ✓ Saved application ${application.id} with status: ${application.status}, fieldVisit.status: ${application.fieldVisit?.status}`);
      
      // Remove from mobile sync queue
      if (visitId) {
        const updatedQueue = mobileQueue.filter(id => id !== visitId);
        await kv.set('mobile:sync_queue', updatedQueue);
        console.log(`[MOBILE APP] ✓ Removed ${visitId} from mobile sync queue`);
      }
      
      console.log(`[MOBILE APP] ✅ Site visit report submitted successfully for ${applicationNo}`);
      return c.json({ 
        success: true, 
        message: 'Site visit report submitted successfully',
        applicationStatus: application.status
      });
    }
    
    return c.json({ success: false, error: 'Application not found' }, 404);
    
  } catch (error) {
    console.log(`[MOBILE APP] Error submitting report: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Debug endpoint to check application data by applicationNo or id
app.get("/make-server-698be164/debug/application/:searchTerm", async (c) => {
  try {
    const searchTerm = c.req.param('searchTerm');
    console.log(`[DEBUG] Searching for application with term: ${searchTerm}`);
    
    // Search all applications
    const allApps = await kv.getByPrefix('application:');
    console.log(`[DEBUG] Total applications in database: ${allApps.length}`);
    
    const application = allApps.find(app => 
      app.id === searchTerm || 
      app.applicationNo === searchTerm ||
      app.id?.includes(searchTerm) ||
      app.applicationNo?.includes(searchTerm)
    );
    
    if (!application) {
      console.log(`[DEBUG] Application not found for: ${searchTerm}`);
      console.log(`[DEBUG] Available application IDs/Nos:`, allApps.map(a => ({ id: a.id, applicationNo: a.applicationNo })));
      return c.json({ 
        success: false, 
        error: 'Application not found',
        available: allApps.map(a => ({ id: a.id, applicationNo: a.applicationNo }))
      }, 404);
    }
    
    console.log(`[DEBUG] Found application:`, {
      id: application.id,
      applicationNo: application.applicationNo,
      status: application.status,
      fieldVisit: application.fieldVisit,
      hasFieldVisitReport: !!application.fieldVisitReport,
      workflow: application.workflow,
    });
    
    return c.json({ 
      success: true, 
      application,
      queues: {
        fieldEngineer: await kv.get('field_engineer:queue') || [],
        commissioner: await kv.get('commissioner:queue') || [],
        mobileSync: await kv.get('mobile:sync_queue') || [],
      }
    });
    
  } catch (error) {
    console.log(`[DEBUG] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Remove application from field engineer queue and send back to revenue officer
app.post("/make-server-698be164/remove-from-field-engineer", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId } = body;
    
    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }
    
    console.log(`[REMOVE FROM FE] Removing application ${applicationId} from field engineer queue`);
    
    // Search for application by ID or applicationNo
    const allApps = await kv.getByPrefix('application:');
    const application = allApps.find(app => 
      app.id === applicationId || 
      app.applicationNo === applicationId
    );
    
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    
    const appKey = `application:${application.id}`;
    
    // Reset to revenue officer stage
    application.status = 'sentToRevenueOfficer';
    
    // Clear field engineer data
    delete application.fieldVisit;
    delete application.fieldVisitReport;
    delete application.fieldEngineerApproval;
    
    // Reset workflow
    if (application.workflow) {
      delete application.workflow.fieldEngineer;
    }
    
    // Update application
    await kv.set(appKey, application);
    
    // Remove from field engineer queue
    const fieldEngineerQueue = await kv.get('field_engineer:queue') || [];
    const updatedFEQueue = fieldEngineerQueue.filter(id => id !== application.id);
    await kv.set('field_engineer:queue', updatedFEQueue);
    console.log(`[REMOVE FROM FE] Removed from field_engineer:queue. Queue size: ${fieldEngineerQueue.length} -> ${updatedFEQueue.length}`);
    
    // Remove from mobile sync queue
    const mobileQueue = await kv.get('mobile:sync_queue') || [];
    const updatedMobileQueue = mobileQueue.filter(id => !id.includes(application.id));
    await kv.set('mobile:sync_queue', updatedMobileQueue);
    console.log(`[REMOVE FROM FE] Removed from mobile:sync_queue. Queue size: ${mobileQueue.length} -> ${updatedMobileQueue.length}`);
    
    // Remove from commissioner queue
    const commissionerQueue = await kv.get('commissioner:queue') || [];
    const updatedCommQueue = commissionerQueue.filter(id => id !== application.id);
    await kv.set('commissioner:queue', updatedCommQueue);
    console.log(`[REMOVE FROM FE] Removed from commissioner:queue. Queue size: ${commissionerQueue.length} -> ${updatedCommQueue.length}`);
    
    // Add back to revenue officer queue
    const revenueOfficerQueue = await kv.get('revenue_officer:queue') || [];
    if (!revenueOfficerQueue.includes(application.id)) {
      revenueOfficerQueue.push(application.id);
      await kv.set('revenue_officer:queue', revenueOfficerQueue);
      console.log(`[REMOVE FROM FE] Added to revenue_officer:queue. Queue size: ${revenueOfficerQueue.length}`);
    }
    
    console.log(`[REMOVE FROM FE] ✅ Application ${application.id} removed from field engineer and sent back to revenue officer`);
    
    return c.json({ 
      success: true, 
      message: 'Application removed from field engineer and sent back to revenue officer',
      applicationId: application.id,
      applicationNo: application.applicationNo,
      newStatus: application.status
    });
    
  } catch (error) {
    console.log(`[REMOVE FROM FE] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Reset application status back to "Received from Revenue Officer" (for testing)
app.post("/make-server-698be164/reset-application-status", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId } = body;
    
    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }
    
    console.log(`[RESET STATUS] Resetting application ${applicationId} to Received from Revenue Officer`);
    
    const application = await kv.get(`application:${applicationId}`);
    
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    
    // Reset status back to sent to Field Engineer
    application.status = 'sentToFieldEngineer';
    
    // Remove fieldVisit data
    delete application.fieldVisit;
    delete application.fieldVisitReport;
    delete application.fieldEngineerApproval;
    
    // Reset workflow status
    if (application.workflow.fieldEngineer) {
      application.workflow.fieldEngineer.status = 'pending';
    }
    
    // Update application
    await kv.set(`application:${applicationId}`, application);
    
    // Remove from mobile sync queue if present
    const mobileQueue = await kv.get('mobile:sync_queue') || [];
    const updatedQueue = mobileQueue.filter(id => !id.includes(applicationId));
    await kv.set('mobile:sync_queue', updatedQueue);
    
    // Remove from commissioner queue if present
    const commissionerQueue = await kv.get('commissioner:queue') || [];
    const updatedCommissionerQueue = commissionerQueue.filter(id => id !== applicationId);
    await kv.set('commissioner:queue', updatedCommissionerQueue);
    
    // Ensure it's in the field engineer queue
    const fieldEngineerQueue = await kv.get('field_engineer:queue') || [];
    if (!fieldEngineerQueue.includes(applicationId)) {
      fieldEngineerQueue.push(applicationId);
      await kv.set('field_engineer:queue', fieldEngineerQueue);
    }
    
    console.log(`[RESET STATUS] ✅ Application ${applicationId} reset successfully`);
    
    return c.json({ 
      success: true, 
      message: 'Application status reset successfully',
      application 
    });
    
  } catch (error) {
    console.log(`[RESET STATUS] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// PAYMENT ROUTES
// ========================================

// Submit payment from citizen
app.post("/make-server-698be164/payment/submit", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, amount, paymentMethod, transactionId } = body;
    
    console.log(`[PAYMENT] Processing payment for application: ${applicationId}`);
    
    // Get the application
    const application = await kv.get(`application:${applicationId}`);
    
    if (!application) {
      console.log(`[PAYMENT] Application not found: ${applicationId}`);
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    
    // Update application with payment details
    application.status = 'payment_done';
    application.currentStage = 'commissioner_payment_verification';
    application.paymentDetails = {
      amount,
      paymentMethod,
      transactionId,
      paidAt: new Date().toISOString(),
      status: 'completed'
    };
    if (!application.workflow) application.workflow = {};
    application.workflow.payment = {
      status: 'completed',
      amount,
      transactionId,
      paidAt: new Date().toISOString()
    };
    application.updatedAt = new Date().toISOString();
    
    // If this was an appeal-approved application, also update the appeal record
    if (application.isAppealApproved && application.appealId) {
      try {
        const appeal = await kv.get(`appeal:${application.appealId}`);
        if (appeal) {
          appeal.currentStage = 'payment_completed';
          appeal.updatedAt = new Date().toISOString();
          if (!appeal.workflow) appeal.workflow = {};
          appeal.workflow.payment = { status: 'completed', amount, transactionId, paidAt: new Date().toISOString() };
          await kv.set(`appeal:${application.appealId}`, appeal);
          console.log(`[PAYMENT] Updated appeal ${application.appealId} with payment completion`);
        }
      } catch (appealErr) {
        console.log(`[PAYMENT] Warning: Could not update appeal record: ${appealErr}`);
      }
    }
    
    // Save updated application
    await kv.set(`application:${application.id}`, application);
    
    // Add to commissioner's payment verification queue
    const commissionerPaymentQueue = await kv.get('commissioner:payment_verification_queue') || [];
    if (!commissionerPaymentQueue.includes(application.id)) {
      commissionerPaymentQueue.push(application.id);
      await kv.set('commissioner:payment_verification_queue', commissionerPaymentQueue);
    }
    
    console.log(`[PAYMENT] Payment completed for ${application.id}. Sent to commissioner for verification.`);
    
    return c.json({ 
      success: true, 
      message: 'Payment completed successfully. Application sent to Commissioner for verification.',
      application 
    });
  } catch (error) {
    console.log(`[PAYMENT] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// COMMISSIONER ROUTES - CERTIFICATE GENERATION
// ========================================

// Get payment verification queue for commissioner
app.get("/make-server-698be164/commissioner/payment-queue", async (c) => {
  try {
    console.log(`[COMMISSIONER PAYMENT QUEUE] Fetching payment verification queue`);
    
    // Get the payment verification queue
    const paymentQueue = await kv.get('commissioner:payment_verification_queue') || [];
    
    console.log(`[COMMISSIONER PAYMENT QUEUE] Found ${paymentQueue.length} applications in queue`);
    
    // Fetch all applications from the queue
    const applications = [];
    for (const appId of paymentQueue) {
      const app = await kv.get(`application:${appId}`);
      if (app && (app.status === 'payment_done' || app.status === 'commissioner_payment_verification')) {
        applications.push(app);
      }
    }
    
    console.log(`[COMMISSIONER PAYMENT QUEUE] Returning ${applications.length} applications`);
    
    return c.json({ 
      success: true, 
      applications,
      count: applications.length
    });
    
  } catch (error) {
    console.log(`[COMMISSIONER PAYMENT QUEUE] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Commissioner approves application and sends payment letter to citizen
app.post("/make-server-698be164/commissioner/approve-for-payment", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, applicationNo, remarks, estimationRows, totalAmount, unauthorizedTapPenalty } = body;

    console.log(`[COMMISSIONER APPROVE] Approving application for payment: ${applicationId}`);

    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }

    // Find the application
    const allApps = await kv.getByPrefix('application:');
    let application = allApps.find(app => app.id === applicationId || app.applicationNo === applicationNo);

    if (!application) {
      console.log(`[COMMISSIONER APPROVE] Application not found: ${applicationId || applicationNo}`);
      return c.json({ success: false, error: "Application not found" }, 404);
    }

    console.log(`[COMMISSIONER APPROVE] Found application: ${application.id}, current status: ${application.status}`);

    // Update application status to send to citizen for payment
    application.status = 'sentToCitizenForPayment';
    application.currentStage = 'payment';

    // Clear any stale paymentDetails so citizen sees payment form (not receipt)
    delete application.paymentDetails;

    // Save commissioner's approved estimation (may have edited prices)
    if (estimationRows && estimationRows.length > 0) {
      application.approvedEstimation = {
        rows: estimationRows,
        totalAmount: totalAmount || estimationRows.reduce((sum: number, row: any) => sum + (row.price || 0), 0),
        approvedAt: new Date().toISOString(),
        approvedBy: 'Commissioner',
      };
      // Also update plumberConnectionData totalAmount so citizen sees correct amount
      if (!application.plumberConnectionData) {
        application.plumberConnectionData = {};
      }
      application.plumberConnectionData.totalAmount = totalAmount || estimationRows.reduce((sum: number, row: any) => sum + (row.price || 0), 0);
      application.plumberConnectionData.estimationRows = estimationRows;
    }

    // Save unauthorized tap penalty if provided
    const penaltyAmount = unauthorizedTapPenalty ? parseFloat(unauthorizedTapPenalty) : 0;
    if (penaltyAmount > 0) {
      application.unauthorizedTapPenalty = {
        amount: penaltyAmount,
        approvedAt: new Date().toISOString(),
        approvedBy: 'Commissioner',
      };
      console.log(`[COMMISSIONER APPROVE] Unauthorized tap penalty: ₹${penaltyAmount}`);
    }

    // Update workflow
    if (!application.workflow) {
      application.workflow = {};
    }
    application.workflow.commissioner = {
      status: 'approved',
      action: 'approvedForPayment',
      remarks: remarks || 'Application approved. Payment letter sent to applicant.',
      approvedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    };

    application.updatedAt = new Date().toISOString();

    // Save updated application
    await kv.set(`application:${application.id}`, application);

    // Remove from commissioner queue
    const commissionerQueue = await kv.get('commissioner:queue') || [];
    const updatedQueue = commissionerQueue.filter((id: string) => id !== application.id);
    await kv.set('commissioner:queue', updatedQueue);
    console.log(`[COMMISSIONER APPROVE] Removed ${application.id} from commissioner:queue`);

    // CRITICAL: Ensure application is in the citizen's application list
    if (application.citizenId) {
      const citizenApps = await kv.get(`citizen:${application.citizenId}:applications`) || [];
      if (!citizenApps.includes(application.id)) {
        citizenApps.push(application.id);
        await kv.set(`citizen:${application.citizenId}:applications`, citizenApps);
        console.log(`[COMMISSIONER APPROVE] Added ${application.id} to citizen list for ${application.citizenId}`);
      } else {
        console.log(`[COMMISSIONER APPROVE] Citizen list OK: ${application.id} already in list for ${application.citizenId}`);
      }
    }

    // ALSO send to plumber for installation work (both web and mobile queues)
    const plumberQueue = await kv.get('plumber:queue') || [];
    if (!plumberQueue.includes(application.id)) {
      plumberQueue.push(application.id);
      await kv.set('plumber:queue', plumberQueue);
      console.log(`[COMMISSIONER APPROVE] Added ${application.id} to plumber:queue for installation`);
    }
    const plumberMobileQueue = await kv.get('plumber:mobile_installation_queue') || [];
    if (!plumberMobileQueue.includes(application.id)) {
      plumberMobileQueue.push(application.id);
      await kv.set('plumber:mobile_installation_queue', plumberMobileQueue);
      console.log(`[COMMISSIONER APPROVE] Added ${application.id} to plumber:mobile_installation_queue`);
    }

    console.log(`[COMMISSIONER APPROVE] Application ${application.id} approved and sent to citizen for payment AND plumber for installation. Status: ${application.status}, Stage: ${application.currentStage}`);

    return c.json({
      success: true,
      message: 'Application approved and sent to citizen for payment',
      application,
    });
  } catch (error) {
    console.log(`[COMMISSIONER APPROVE] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Commissioner rejects application and generates endorsement letter
app.post("/make-server-698be164/commissioner/reject", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, remarks, rejectReason } = body;

    console.log(`[COMMISSIONER REJECT] Rejecting application: ${applicationId}`);

    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }

    const application = await kv.get(`application:${applicationId}`);

    if (!application) {
      console.log(`[COMMISSIONER REJECT] Application not found: ${applicationId}`);
      return c.json({ success: false, error: "Application not found" }, 404);
    }

    application.status = 'rejected';
    application.currentStage = 'rejected';

    if (!application.workflow) {
      application.workflow = {};
    }
    application.workflow.commissioner = {
      status: 'rejected',
      action: 'rejected',
      remarks: remarks || 'Application rejected.',
      rejectReason: rejectReason || 'Other',
      rejectedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    };

    application.updatedAt = new Date().toISOString();

    await kv.set(`application:${application.id}`, application);

    // Remove from commissioner queue
    const commissionerQueue = await kv.get('commissioner:queue') || [];
    const updatedQueue = commissionerQueue.filter((id: string) => id !== application.id);
    await kv.set('commissioner:queue', updatedQueue);
    console.log(`[COMMISSIONER REJECT] Removed ${application.id} from commissioner:queue`);

    console.log(`[COMMISSIONER REJECT] Application ${application.id} rejected successfully.`);

    return c.json({
      success: true,
      message: 'Application rejected',
      application,
    });
  } catch (error) {
    console.log(`[COMMISSIONER REJECT] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Commissioner sends back application to Field Engineer
app.post("/make-server-698be164/commissioner/send-back", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, remarks } = body;

    console.log(`[COMMISSIONER SEND-BACK] Sending back application: ${applicationId}`);

    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }

    const application = await kv.get(`application:${applicationId}`);

    if (!application) {
      console.log(`[COMMISSIONER SEND-BACK] Application not found: ${applicationId}`);
      return c.json({ success: false, error: "Application not found" }, 404);
    }

    application.status = 'sentToFieldEngineer';
    application.currentStage = 'field_engineer';

    if (!application.workflow) {
      application.workflow = {};
    }
    application.workflow.commissioner = {
      status: 'sent_back',
      action: 'sent_back',
      remarks: remarks || 'Sent back for corrections.',
      sentBackAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    };
    application.workflow.fieldEngineer = { status: 'pending' };

    application.updatedAt = new Date().toISOString();

    await kv.set(`application:${application.id}`, application);

    // Remove from commissioner queue
    const commissionerQueue = await kv.get('commissioner:queue') || [];
    const updatedCQ = commissionerQueue.filter((id: string) => id !== application.id);
    await kv.set('commissioner:queue', updatedCQ);

    // Add to field engineer queue
    const feQueue = await kv.get('field_engineer:queue') || [];
    if (!feQueue.includes(application.id)) {
      feQueue.push(application.id);
      await kv.set('field_engineer:queue', feQueue);
    }

    console.log(`[COMMISSIONER SEND-BACK] Application ${application.id} sent back to Field Engineer.`);

    return c.json({
      success: true,
      message: 'Application sent back to Field Engineer',
      application,
    });
  } catch (error) {
    console.log(`[COMMISSIONER SEND-BACK] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Commissioner completes certificate and sends to applicant
app.post("/make-server-698be164/commissioner/complete-certificate", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, applicationNo, certificateNo, status } = body;

    console.log(`[CERTIFICATE COMPLETION] Processing certificate for application: ${applicationId}`);

    // Find the application
    const allApps = await kv.getByPrefix('application:');
    let application = allApps.find(app => app.id === applicationId || app.applicationNo === applicationNo);

    if (!application) {
      console.log(`[CERTIFICATE COMPLETION] Application not found: ${applicationId || applicationNo}`);
      return c.json({ success: false, error: "Application not found" }, 404);
    }

    // Check if this is a reconnection or disconnection or change connection application that should be sent to plumber
    const isReconnection = body.sendToPlumber || application.type === 'reconnection';
    const isDisconnection = body.sendToPlumberForDisconnection || application.type === 'disconnection';
    const isChangeConnection = body.sendToPlumberForChangeConnection || application.type === 'changeConnection';
    
    // Store certificate data
    application.certificateData = {
      ...body,
      certificateNo: body.certificateNo || `DMA/JN/CERT/${application.applicationNo || application.id}`,
      issuedDate: body.issuedDate || new Date().toISOString(),
      signedDate: body.signedDate || new Date().toISOString(),
      issuer: 'Commissioner, Department of Municipal Administration'
    };
    application.workflow.commissioner = { 
      status: 'approved',
      approvedAt: new Date().toISOString(),
      certificateIssued: true,
      certificateNo: body.certificateNo || `DMA/JN/CERT/${application.applicationNo || application.id}`,
      remarks: isDisconnection
        ? 'Payment verified, disconnection permission certificate issued, sent to plumber for disconnection work'
        : isReconnection 
        ? 'Payment verified, reconnection permission letter issued, sent to Field Engineer for plumber assignment'
        : isChangeConnection
        ? 'Payment verified, change of connection type permission certificate issued, sent to citizen and plumber'
        : 'Payment verified and installation permission certificate issued'
    };
    application.updatedAt = new Date().toISOString();

    if (isDisconnection) {
      // DISCONNECTION: Send to plumber for disconnection work
      application.status = 'sentToPlumberForDisconnection';
      application.currentStage = 'plumber_disconnection';
      
      console.log(`[CERTIFICATE COMPLETION] Disconnection app - sending to plumber queue: ${application.id}`);
      
      const plumberQueueDis = await kv.get('plumber:queue') || [];
      if (!plumberQueueDis.includes(application.id)) {
        plumberQueueDis.push(application.id);
        await kv.set('plumber:queue', plumberQueueDis);
        console.log(`[CERTIFICATE COMPLETION] Added ${application.id} to plumber:queue for disconnection`);
      }
    } else if (isReconnection) {
      // RECONNECTION: Send to Field Engineer for plumber assignment (per flow diagram)
      application.status = 'sentToFieldEngineerForReconnection';
      application.currentStage = 'field_engineer_plumber_assignment';
      
      console.log(`[CERTIFICATE COMPLETION] Reconnection app - sending to Field Engineer for plumber assignment: ${application.id}`);
      
      // Add to field engineer reconnection queue
      const feReconQueue = await kv.get('field_engineer:reconnection_queue') || [];
      if (!feReconQueue.includes(application.id)) {
        feReconQueue.push(application.id);
        await kv.set('field_engineer:reconnection_queue', feReconQueue);
        console.log(`[CERTIFICATE COMPLETION] Added ${application.id} to field_engineer:reconnection_queue. Queue length: ${feReconQueue.length}`);
      }
    } else if (isChangeConnection) {
      // CHANGE OF CONNECTION: Send to plumber for change connection work
      application.status = 'sentToPlumberForChangeConnection';
      application.currentStage = 'plumber_change_connection';
      
      console.log(`[CERTIFICATE COMPLETION] Change connection app - sending to plumber queue: ${application.id}`);
      
      const plumberQueueCC = await kv.get('plumber:queue') || [];
      if (!plumberQueueCC.includes(application.id)) {
        plumberQueueCC.push(application.id);
        await kv.set('plumber:queue', plumberQueueCC);
        console.log(`[CERTIFICATE COMPLETION] Added ${application.id} to plumber:queue for change connection`);
      }

      // Also add to plumber mobile queue
      const mobileChangeQueue = await kv.get('plumber:mobile_change_connection_queue') || [];
      if (!mobileChangeQueue.includes(application.id)) {
        mobileChangeQueue.push(application.id);
        await kv.set('plumber:mobile_change_connection_queue', mobileChangeQueue);
        console.log(`[CERTIFICATE COMPLETION] Added ${application.id} to plumber:mobile_change_connection_queue`);
      }
    } else {
      // NEW CONNECTION: Approved - send to plumber for installation work
      application.status = 'installation_approved';
      application.currentStage = 'plumber_installation';

      console.log(`[CERTIFICATE COMPLETION] New connection app - sending to plumber for installation: ${application.id}`);

      // Add to plumber queue for web dashboard
      const plumberQueueNC = await kv.get('plumber:queue') || [];
      if (!plumberQueueNC.includes(application.id)) {
        plumberQueueNC.push(application.id);
        await kv.set('plumber:queue', plumberQueueNC);
        console.log(`[CERTIFICATE COMPLETION] Added ${application.id} to plumber:queue for installation. Queue length: ${plumberQueueNC.length}`);
      }

      // Add to plumber mobile installation queue
      const mobileInstallQueue = await kv.get('plumber:mobile_installation_queue') || [];
      if (!mobileInstallQueue.includes(application.id)) {
        mobileInstallQueue.push(application.id);
        await kv.set('plumber:mobile_installation_queue', mobileInstallQueue);
        console.log(`[CERTIFICATE COMPLETION] Added ${application.id} to plumber:mobile_installation_queue. Queue length: ${mobileInstallQueue.length}`);
      }
    }

    // Save updated application
    await kv.set(`application:${application.id}`, application);

    // Remove from commissioner payment verification queue
    const paymentQueue = await kv.get('commissioner:payment_verification_queue') || [];
    const updatedQueue = paymentQueue.filter(id => id !== application.id);
    await kv.set('commissioner:payment_verification_queue', updatedQueue);
    
    console.log(`[CERTIFICATE COMPLETION] Removed application ${application.id} from payment verification queue`);

    // Add to the citizen's application list if not already there
    const citizenApps = await kv.get(`citizen:${application.citizenId}:applications`) || [];
    if (!citizenApps.includes(application.id)) {
      citizenApps.push(application.id);
      await kv.set(`citizen:${application.citizenId}:applications`, citizenApps);
    }

    // If this was an appeal-approved application, update the appeal record
    if (application.isAppealApproved && application.appealId) {
      try {
        const appeal = await kv.get(`appeal:${application.appealId}`);
        if (appeal) {
          appeal.currentStage = 'permission_letter_sent';
          appeal.updatedAt = new Date().toISOString();
          if (!appeal.workflow) appeal.workflow = {};
          appeal.workflow.permissionLetter = { status: 'generated', certificateNo: application.certificateData?.certificateNo || 'N/A', generatedAt: new Date().toISOString() };
          await kv.set(`appeal:${application.appealId}`, appeal);
          console.log(`[CERTIFICATE COMPLETION] Updated appeal ${application.appealId} with permission letter`);
        }
      } catch (appealErr) {
        console.log(`[CERTIFICATE COMPLETION] Warning: Could not update appeal record: ${appealErr}`);
      }
    }

    console.log(`[CERTIFICATE COMPLETION] Certificate generated for ${application.id}. Status: ${application.status}, isReconnection: ${isReconnection}, isDisconnection: ${isDisconnection}`);

    return c.json({ 
      success: true, 
      message: isDisconnection 
        ? "Certificate generated and sent to plumber for disconnection work"
        : isReconnection 
        ? "Certificate generated and sent to plumber for reconnection work"
        : isChangeConnection
        ? "Certificate generated and sent to citizen and plumber for change of connection type work"
        : "Certificate sent to applicant successfully",
      application,
      sentToPlumber: isReconnection || isDisconnection || isChangeConnection
    });
  } catch (error) {
    console.log(`[CERTIFICATE COMPLETION] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Commissioner verifies payment and generates final permission certificate with DSC
app.post("/make-server-698be164/commissioner/verify-payment-and-approve", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, certificateNo, remarks } = body;
    
    console.log(`[COMMISSIONER FINAL APPROVAL] Verifying payment and approving application: ${applicationId}`);
    
    // Get the application
    const application = await kv.get(`application:${applicationId}`);
    
    if (!application) {
      console.log(`[COMMISSIONER FINAL APPROVAL] Application not found: ${applicationId}`);
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    
    // Update application - approved and send to plumber for installation
    application.status = 'installation_approved';
    application.currentStage = 'plumber_installation';
    application.finalCertificate = {
      certificateNo,
      generatedAt: new Date().toISOString(),
      dscSignedAt: new Date().toISOString(),
      dscCertificateId: `DSC-2026-COMM-${application.id.slice(-6).toUpperCase()}`,
      approvedBy: 'Commissioner',
      remarks: remarks || 'Payment verified and permission certificate generated'
    };
    if (!application.workflow) application.workflow = {};
    application.workflow.commissionerFinalApproval = {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      certificateNo,
      remarks
    };
    application.updatedAt = new Date().toISOString();
    
    // Save updated application
    await kv.set(`application:${application.id}`, application);
    
    // Remove from commissioner's payment verification queue
    const commissionerPaymentQueue = await kv.get('commissioner:payment_verification_queue') || [];
    const updatedQueue = commissionerPaymentQueue.filter((id: string) => id !== application.id);
    await kv.set('commissioner:payment_verification_queue', updatedQueue);

    // If this was an appeal-approved application, update the appeal record
    if (application.isAppealApproved && application.appealId) {
      try {
        const appeal = await kv.get(`appeal:${application.appealId}`);
        if (appeal) {
          appeal.currentStage = 'permission_letter_sent';
          appeal.updatedAt = new Date().toISOString();
          if (!appeal.workflow) appeal.workflow = {};
          appeal.workflow.permissionLetter = { status: 'generated', certificateNo, generatedAt: new Date().toISOString() };
          await kv.set(`appeal:${application.appealId}`, appeal);
          console.log(`[COMMISSIONER FINAL APPROVAL] Updated appeal ${application.appealId} with permission letter`);
        }
      } catch (appealErr) {
        console.log(`[COMMISSIONER FINAL APPROVAL] Warning: Could not update appeal record: ${appealErr}`);
      }
    }

    // Add to plumber queue for installation work
    const plumberQueueFinal = await kv.get('plumber:queue') || [];
    if (!plumberQueueFinal.includes(application.id)) {
      plumberQueueFinal.push(application.id);
      await kv.set('plumber:queue', plumberQueueFinal);
      console.log(`[COMMISSIONER FINAL APPROVAL] Added ${application.id} to plumber:queue for installation`);
    }
    const mobileInstallQueueFinal = await kv.get('plumber:mobile_installation_queue') || [];
    if (!mobileInstallQueueFinal.includes(application.id)) {
      mobileInstallQueueFinal.push(application.id);
      await kv.set('plumber:mobile_installation_queue', mobileInstallQueueFinal);
      console.log(`[COMMISSIONER FINAL APPROVAL] Added ${application.id} to plumber:mobile_installation_queue`);
    }
    
    console.log(`[COMMISSIONER FINAL APPROVAL] Application ${application.id} approved with certificate ${certificateNo}. Sent to plumber for installation.`);
    
    return c.json({ 
      success: true, 
      message: 'Payment verified and permission certificate generated successfully',
      application 
    });
  } catch (error) {
    console.log(`[COMMISSIONER FINAL APPROVAL] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get commissioner's payment verification queue
app.get("/make-server-698be164/commissioner/payment-verification-queue", async (c) => {
  try {
    const queueIds = await kv.get('commissioner:payment_verification_queue') || [];
    const applications = [];
    
    for (const appId of queueIds) {
      const app = await kv.get(`application:${appId}`);
      if (app) {
        applications.push(app);
      }
    }
    
    console.log(`[COMMISSIONER] Retrieved ${applications.length} applications for payment verification`);
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`[COMMISSIONER] Error retrieving payment verification queue: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// DEVELOPER TEST ENDPOINT - Add Field Visit Report
// ========================================
app.post("/make-server-698be164/dev/add-field-visit-report", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId } = body;
    
    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID required' }, 400);
    }
    
    console.log(`[DEV] Adding field visit report to application: ${applicationId}`);
    
    // Find the application
    const allApps = await kv.getByPrefix('application:');
    const application = allApps.find(app => 
      app.id === applicationId || app.applicationNo === applicationId
    );
    
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    
    console.log(`[DEV] Found application ${application.id}, current status: ${application.status}`);
    
    // Update status and add field visit report
    application.status = 'field_visit_completed';
    
    // Update fieldVisit to completed
    if (!application.fieldVisit) {
      application.fieldVisit = {
        status: 'scheduled',
        visitDate: new Date().toISOString().split('T')[0],
        visitPurpose: 'Site Verification',
        comment: 'Added via dev endpoint',
      };
    }
    application.fieldVisit.status = 'completed';
    application.fieldVisit.completedAt = new Date().toISOString();
    
    // Add the field visit report
    application.fieldVisitReport = {
      engineerName: 'Test Field Engineer',
      submittedAt: new Date().toISOString(),
      locationVerification: {
        verified: true,
        latitude: 12.9716,
        longitude: 77.5946,
        address: application.applicantDetails?.address || '123, Test Road, Test City',
        verifiedAt: new Date().toISOString(),
      },
      siteObservations: 'Property is located in a residential area with proper access. Water supply infrastructure is available nearby. No major obstructions found during site inspection.',
      engineerRemarks: 'Site is suitable for tap connection installation. Property details verified. Recommend approval for connection.',
      photos: [
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
        'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800',
      ],
      documents: [
        {
          name: 'Site_Visit_Report_Final.pdf',
          size: '2.5 MB',
        },
        {
          name: 'Property_Photos.zip',
          size: '5.2 MB',
        },
        {
          name: 'Measurement_Report.pdf',
          size: '1.8 MB',
        },
      ],
    };
    
    // Update workflow
    if (!application.workflow.fieldEngineer) {
      application.workflow.fieldEngineer = {};
    }
    application.workflow.fieldEngineer.status = 'completed';
    application.workflow.fieldEngineer.timestamp = new Date().toISOString();
    
    // Save the updated application
    await kv.set(`application:${application.id}`, application);
    
    console.log(`[DEV] ✅ Successfully added field visit report to ${application.id}`);
    console.log(`[DEV] Application status: ${application.status}`);
    console.log(`[DEV] Field visit status: ${application.fieldVisit.status}`);
    console.log(`[DEV] Has report: ${!!application.fieldVisitReport}`);
    
    return c.json({ 
      success: true, 
      message: 'Field visit report added successfully',
      application: {
        id: application.id,
        applicationNo: application.applicationNo,
        status: application.status,
        fieldVisit: application.fieldVisit,
        hasFieldVisitReport: !!application.fieldVisitReport,
      }
    });
    
  } catch (error) {
    console.log(`[DEV] Error adding field visit report: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// DEBUG ENDPOINT - Check and Fix Application for Citizen
// ========================================
app.get("/make-server-698be164/dev/check-application/:applicationId", async (c) => {
  try {
    const applicationId = c.req.param('applicationId');
    console.log(`[DEBUG] Checking application: ${applicationId}`);
    
    // Get the application
    const application = await kv.get(`application:${applicationId}`);
    
    if (!application) {
      console.log(`[DEBUG] Application not found: ${applicationId}`);
      return c.json({ success: false, error: 'Application not found' });
    }
    
    console.log(`[DEBUG] Application found:`, {
      id: application.id,
      applicationNo: application.applicationNo,
      citizenId: application.citizenId,
      status: application.status,
      currentStage: application.currentStage,
      workflow: application.workflow
    });
    
    // Check if it's in the citizen's application list
    const citizenApps = await kv.get(`citizen:${application.citizenId}:applications`) || [];
    const isInCitizenList = citizenApps.includes(application.id);
    
    console.log(`[DEBUG] Citizen applications list for ${application.citizenId}:`, citizenApps);
    console.log(`[DEBUG] Is application in citizen list? ${isInCitizenList}`);
    
    // If not in list, add it
    if (!isInCitizenList) {
      console.log(`[DEBUG] Adding application to citizen's list`);
      citizenApps.push(application.id);
      await kv.set(`citizen:${application.citizenId}:applications`, citizenApps);
    }
    
    return c.json({ 
      success: true, 
      application,
      isInCitizenList,
      citizenApps,
      fixed: !isInCitizenList
    });
  } catch (error) {
    console.log(`[DEBUG] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// TAP RECONNECTION WORKFLOW ROUTES
// ========================================

// Verify RR Number for reconnection
app.post("/make-server-698be164/tap-reconnection/verify-rr", async (c) => {
  try {
    const body = await c.req.json();
    const { rrNumber } = body;

    if (!rrNumber) {
      return c.json({ success: false, error: "RR Number is required" }, 400);
    }

    console.log(`[VERIFY RR] Verifying RR Number: ${rrNumber}`);

    // Simulate RR Number verification (in production, this would query the connection database)
    // For now, return mock data for any RR Number
    const rrData = {
      // Applicant Details
      district: "Dharwad",
      ulb: "Hubballi-Dharwad",
      ulbType: "City Corporation",
      authorityType: "Board",
      
      // Property Details
      ownerName: "Ramesh Kumar",
      doorNumber: "45/2",
      wardNumber: "Ward No. 85",
      street: "Gandhi Nagar Main Road",
      address: "45/2, Gandhi Nagar Main Road, Near City Hospital",
      city: "Hubballi",
      propertyDistrict: "Dharwad",
      state: "Karnataka",
      pincode: "580030",
      mobileNo: "9876543210",
      
      // Connection Details
      connectionType: "Metered Connection",
      meterCategory: "Domestic",
      motorStatus: "Disconnected",
      meterInstalledDate: "15-Jan-2020",
      schemeName: "General Scheme"
    };

    // Store verified RR data
    await kv.set(`rr:${rrNumber}`, rrData);

    console.log(`[VERIFY RR] RR Number verified: ${rrNumber}`);
    return c.json({ success: true, rrData });
  } catch (error) {
    console.log(`[VERIFY RR] Error verifying RR Number: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Submit tap reconnection application
app.post("/make-server-698be164/tap-reconnection/submit", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      rrNumber, citizenId, rrData, charges,
      hasUGDConnection, disconnectionDetails, arrearDetails, paymentDetails,
      wantToChangeConnectionType, newConnectionType,
      reconnectionReason, applicationFees, existingConnection, securityDeposit,
      wantDigiLocker
    } = body;

    if (!rrNumber || !citizenId || !rrData) {
      return c.json({ 
        success: false, 
        error: "Missing required fields" 
      }, 400);
    }

    // Generate unique application ID
    const applicationId = `RECON-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    console.log(`[RECONNECTION] Creating reconnection application: ${applicationId}`);
    
    const application = {
      id: applicationId,
      type: "reconnection",
      rrNumber,
      citizenId,
      rrData,
      charges,
      
      // Step 2 data
      hasUGDConnection: hasUGDConnection || "",
      disconnectionDetails: disconnectionDetails || { disconnectionReason: "N/A", dateOfApproval: "N/A" },
      arrearDetails: arrearDetails || { currentDemand: 0, arrears: 0, totalBill: 0 },
      reconnectionPaymentDetails: paymentDetails || null,
      
      // Step 3 data
      wantToChangeConnectionType: wantToChangeConnectionType || "",
      newConnectionType: newConnectionType || null,
      reconnectionReason: reconnectionReason || "N/A",
      applicationFees: applicationFees || 0,
      existingConnection: existingConnection || "N/A",
      securityDeposit: securityDeposit || 0,
      wantDigiLocker: wantDigiLocker || "",
      
      // Map rrData to standard application structure for compatibility
      applicantDetails: {
        applicantName: rrData.ownerName || "N/A",
        mobile: rrData.mobileNo || "",
        doorNumber: rrData.doorNumber || "",
        wardNumber: rrData.wardNumber || "",
        street: rrData.street || "",
        address: rrData.address || "",
        city: rrData.city || "",
        district: rrData.propertyDistrict || "",
        state: rrData.state || "",
        pincode: rrData.pincode || ""
      },
      
      connectionDetails: {
        connectionType: rrData.connectionType || "Metered Connection",
        propertyType: rrData.meterCategory || "Domestic"
      },
      
      propertyDetails: {
        district: rrData.propertyDistrict || "",
        ulb: rrData.ulb || "Hubballi-Dharwad",
        ulbType: rrData.ulbType || "City Corporation",
        authorityType: rrData.authorityType || "Board",
        ownershipType: "Owner"
      },
      
      status: "sentToCaseworker",
      currentStage: "caseworker",
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workflow: {
        submitted: {
          status: "completed",
          timestamp: new Date().toISOString()
        }
      }
    };

    // Save application
    await kv.set(`application:${applicationId}`, application);
    console.log(`[RECONNECTION] Application saved with type: ${application.type}`);
    
    // Add to caseworker queue
    const caseworkerQueue = await kv.get('caseworker:queue') || [];
    if (!caseworkerQueue.includes(applicationId)) {
      caseworkerQueue.push(applicationId);
    }
    await kv.set('caseworker:queue', caseworkerQueue);
    console.log(`[RECONNECTION] Added to caseworker queue. Queue length: ${caseworkerQueue.length}`);
    
    // Add to citizen's applications list
    const citizenApps = await kv.get(`citizen:${citizenId}:applications`) || [];
    if (!citizenApps.includes(applicationId)) {
      citizenApps.push(applicationId);
    }
    await kv.set(`citizen:${citizenId}:applications`, citizenApps);
    console.log(`[RECONNECTION] Added to citizen ${citizenId} applications. Total: ${citizenApps.length}`);

    console.log(`[RECONNECTION] Application created successfully: ${applicationId}`);
    
    return c.json({ 
      success: true, 
      applicationId,
      message: "Reconnection application submitted successfully"
    });
  } catch (error) {
    console.log(`[RECONNECTION] Error submitting application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Debug endpoint - Get application by ID
app.get("/make-server-698be164/debug/application/:applicationId", async (c) => {
  try {
    const applicationId = c.req.param('applicationId');
    console.log(`[DEBUG] Fetching application: ${applicationId}`);
    
    const application = await kv.get(`application:${applicationId}`);
    
    if (!application) {
      return c.json({ 
        success: false, 
        error: 'Application not found',
        applicationId 
      }, 404);
    }
    
    console.log(`[DEBUG] Application ${applicationId} found:`, JSON.stringify(application, null, 2));
    
    return c.json({ 
      success: true, 
      application,
      applicationId,
      type: application.type || 'undefined',
      status: application.status,
      currentStage: application.currentStage
    });
  } catch (error) {
    console.log(`[DEBUG] Error fetching application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// COMMISSIONER RECONNECTION ACTIONS
// ========================================

// Commissioner approves reconnection and sends to citizen for payment
app.post("/make-server-698be164/commissioner/reconnection/approve", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, remarks } = body;
    
    console.log(`[COMMISSIONER RECON APPROVE] Approving reconnection application: ${applicationId}`);
    
    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }
    if (!remarks || !remarks.trim()) {
      return c.json({ success: false, error: 'Remarks are required' }, 400);
    }
    
    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    
    // Check if already processed
    if (application.workflow?.commissioner?.status === 'approved' || 
        application.workflow?.commissioner?.status === 'rejected' ||
        application.status === 'sentToCitizenForPayment') {
      return c.json({ success: false, error: 'Application has already been processed by Commissioner' }, 400);
    }
    
    // Update application status
    application.status = 'sentToCitizenForPayment';
    application.currentStage = 'payment';
    // Clear any stale paymentDetails so citizen sees payment form (not receipt)
    delete application.paymentDetails;
    application.workflow.commissioner = {
      status: 'approved',
      action: 'approvedForPayment',
      remarks: remarks,
      approvedAt: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };
    application.updatedAt = new Date().toISOString();
    
    // Save updated application
    await kv.set(`application:${applicationId}`, application);
    
    // Remove from commissioner queue
    const commissionerQueue = await kv.get('commissioner:queue') || [];
    const updatedQueue = commissionerQueue.filter((id: string) => id !== applicationId);
    await kv.set('commissioner:queue', updatedQueue);
    
    // CRITICAL: Ensure application is in the citizen's application list
    // This fixes cases where the list might have lost the entry during workflow
    if (application.citizenId) {
      const citizenApps = await kv.get(`citizen:${application.citizenId}:applications`) || [];
      if (!citizenApps.includes(applicationId)) {
        citizenApps.push(applicationId);
        await kv.set(`citizen:${application.citizenId}:applications`, citizenApps);
        console.log(`[COMMISSIONER RECON APPROVE] REPAIR: Added ${applicationId} to citizen list for ${application.citizenId}`);
      } else {
        console.log(`[COMMISSIONER RECON APPROVE] Citizen list OK: ${applicationId} already in list for ${application.citizenId}`);
      }
    }
    
    console.log(`[COMMISSIONER RECON APPROVE] Application ${applicationId} approved and sent to citizen for payment`);
    
    return c.json({ 
      success: true, 
      message: 'Application approved and sent to citizen for payment',
      application 
    });
  } catch (error) {
    console.log(`[COMMISSIONER RECON APPROVE] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Commissioner sends back reconnection application for corrections
app.post("/make-server-698be164/commissioner/reconnection/send-back", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, remarks, sendBackTo } = body;
    
    console.log(`[COMMISSIONER RECON SEND-BACK] Sending back application: ${applicationId} to ${sendBackTo}`);
    
    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }
    if (!remarks || !remarks.trim()) {
      return c.json({ success: false, error: 'Remarks are required for sending back' }, 400);
    }
    
    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    
    // Determine where to send back
    const target = sendBackTo || 'Field Engineer';
    
    application.workflow.commissioner = {
      status: 'sent_back',
      action: 'sentBack',
      remarks: remarks,
      sentBackTo: target,
      sentBackAt: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };
    application.updatedAt = new Date().toISOString();
    
    if (target === 'Field Engineer') {
      application.status = 'sentBackToFieldEngineer';
      application.currentStage = 'field_engineer';
      // Add back to field engineer queue
      const feQueue = await kv.get('field_engineer:queue') || [];
      if (!feQueue.includes(applicationId)) {
        feQueue.push(applicationId);
        await kv.set('field_engineer:queue', feQueue);
      }
    } else if (target === 'Revenue Officer') {
      application.status = 'sentBackToRevenueOfficer';
      application.currentStage = 'revenue_officer';
      const roQueue = await kv.get('revenue_officer:queue') || [];
      if (!roQueue.includes(applicationId)) {
        roQueue.push(applicationId);
        await kv.set('revenue_officer:queue', roQueue);
      }
    } else if (target === 'Caseworker') {
      application.status = 'sentBackToCaseworker';
      application.currentStage = 'caseworker';
      const cwQueue = await kv.get('caseworker:queue') || [];
      if (!cwQueue.includes(applicationId)) {
        cwQueue.push(applicationId);
        await kv.set('caseworker:queue', cwQueue);
      }
    }
    
    // Save updated application
    await kv.set(`application:${applicationId}`, application);
    
    // Remove from commissioner queue
    const commissionerQueue = await kv.get('commissioner:queue') || [];
    const updatedQueue = commissionerQueue.filter((id: string) => id !== applicationId);
    await kv.set('commissioner:queue', updatedQueue);
    
    console.log(`[COMMISSIONER RECON SEND-BACK] Application ${applicationId} sent back to ${target}`);
    
    return c.json({ 
      success: true, 
      message: `Application sent back to ${target} for corrections`,
      application 
    });
  } catch (error) {
    console.log(`[COMMISSIONER RECON SEND-BACK] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Commissioner rejects reconnection and generates endorsement letter with DSC
app.post("/make-server-698be164/commissioner/reconnection/reject", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, remarks, rejectionReason } = body;
    
    console.log(`[COMMISSIONER RECON REJECT] Rejecting application: ${applicationId}`);
    
    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }
    if (!remarks || !remarks.trim()) {
      return c.json({ success: false, error: 'Remarks are required for rejection' }, 400);
    }
    
    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    
    // Check if already processed
    if (application.workflow?.commissioner?.status === 'approved' || 
        application.workflow?.commissioner?.status === 'rejected') {
      return c.json({ success: false, error: 'Application has already been processed by Commissioner' }, 400);
    }
    
    // Generate endorsement letter number
    const endorsementNo = `END-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
    
    application.status = 'rejected';
    application.currentStage = 'rejected';
    application.workflow.commissioner = {
      status: 'rejected',
      action: 'rejectedWithEndorsement',
      remarks: remarks,
      rejectionReason: rejectionReason || remarks,
      endorsementNo: endorsementNo,
      dscSigned: true,
      dscSignedAt: new Date().toISOString(),
      rejectedAt: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };
    application.endorsementLetter = {
      endorsementNo: endorsementNo,
      applicantName: application.applicantDetails?.applicantName || application.rrData?.ownerName || 'N/A',
      applicationId: applicationId,
      rrNumber: application.rrNumber || 'N/A',
      rejectionReason: rejectionReason || remarks,
      commissionerRemarks: remarks,
      generatedAt: new Date().toISOString(),
      dscSigned: true,
      dscSignedAt: new Date().toISOString()
    };
    application.updatedAt = new Date().toISOString();
    
    // Save updated application
    await kv.set(`application:${applicationId}`, application);
    
    // Remove from commissioner queue
    const commissionerQueue = await kv.get('commissioner:queue') || [];
    const updatedQueue = commissionerQueue.filter((id: string) => id !== applicationId);
    await kv.set('commissioner:queue', updatedQueue);
    
    console.log(`[COMMISSIONER RECON REJECT] Application ${applicationId} rejected with endorsement ${endorsementNo}`);
    
    return c.json({ 
      success: true, 
      message: 'Application rejected and endorsement letter generated with DSC',
      endorsementNo: endorsementNo,
      application 
    });
  } catch (error) {
    console.log(`[COMMISSIONER RECON REJECT] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// CHANGE OF CONNECTION TYPE - COMMISSIONER ENDPOINTS
// ========================================

// Commissioner approves change-of-connection application and sends to citizen for payment
app.post("/make-server-698be164/commissioner/change-connection/approve", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, remarks } = body;

    console.log(`[COMMISSIONER CC APPROVE] Approving change-connection application: ${applicationId}`);

    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }
    if (!remarks || !remarks.trim()) {
      return c.json({ success: false, error: 'Remarks are required' }, 400);
    }

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    // Check if already processed
    if (application.workflow?.commissioner?.status === 'approved' ||
        application.workflow?.commissioner?.status === 'rejected' ||
        application.status === 'sentToCitizenForPayment') {
      return c.json({ success: false, error: 'Application has already been processed by Commissioner' }, 400);
    }

    // Update application status
    application.status = 'sentToCitizenForPayment';
    application.currentStage = 'payment';
    // Clear any stale paymentDetails so citizen sees payment form (not receipt)
    delete application.paymentDetails;
    if (!application.workflow) { application.workflow = {}; }
    application.workflow.commissioner = {
      status: 'approved',
      action: 'approvedForPayment',
      remarks: remarks,
      approvedAt: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };
    application.updatedAt = new Date().toISOString();

    // Save updated application
    await kv.set(`application:${applicationId}`, application);

    // Remove from commissioner queue
    const commissionerQueue = await kv.get('commissioner:queue') || [];
    const updatedQueue = commissionerQueue.filter((id: string) => id !== applicationId);
    await kv.set('commissioner:queue', updatedQueue);

    // Ensure application is in the citizen's application list
    if (application.citizenId) {
      const citizenApps = await kv.get(`citizen:${application.citizenId}:applications`) || [];
      if (!citizenApps.includes(applicationId)) {
        citizenApps.push(applicationId);
        await kv.set(`citizen:${application.citizenId}:applications`, citizenApps);
        console.log(`[COMMISSIONER CC APPROVE] Added ${applicationId} to citizen list for ${application.citizenId}`);
      }
    }

    console.log(`[COMMISSIONER CC APPROVE] Application ${applicationId} approved and sent to citizen for payment`);

    return c.json({
      success: true,
      message: 'Change of connection application approved and sent to citizen for payment',
      application
    });
  } catch (error) {
    console.log(`[COMMISSIONER CC APPROVE] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Commissioner sends back change-of-connection application for corrections
app.post("/make-server-698be164/commissioner/change-connection/send-back", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, remarks, sendBackTo } = body;

    console.log(`[COMMISSIONER CC SEND-BACK] Sending back application: ${applicationId} to ${sendBackTo}`);

    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }
    if (!remarks || !remarks.trim()) {
      return c.json({ success: false, error: 'Remarks are required for sending back' }, 400);
    }

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    const target = sendBackTo || 'Field Engineer';

    if (!application.workflow) { application.workflow = {}; }
    application.workflow.commissioner = {
      status: 'sent_back',
      action: 'sentBack',
      remarks: remarks,
      sentBackTo: target,
      sentBackAt: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };
    application.updatedAt = new Date().toISOString();

    if (target === 'Field Engineer') {
      application.status = 'sentBackToFieldEngineer';
      application.currentStage = 'field_engineer';
      const feQueue = await kv.get('field_engineer:queue') || [];
      if (!feQueue.includes(applicationId)) {
        feQueue.push(applicationId);
        await kv.set('field_engineer:queue', feQueue);
      }
      const feCCQueue = await kv.get('field_engineer:change-connection:queue') || [];
      if (!feCCQueue.includes(applicationId)) {
        feCCQueue.push(applicationId);
        await kv.set('field_engineer:change-connection:queue', feCCQueue);
      }
    } else if (target === 'Revenue Officer') {
      application.status = 'sentBackToRevenueOfficer';
      application.currentStage = 'revenue_officer';
      const roQueue = await kv.get('revenue_officer:queue') || [];
      if (!roQueue.includes(applicationId)) {
        roQueue.push(applicationId);
        await kv.set('revenue_officer:queue', roQueue);
      }
    } else if (target === 'Caseworker') {
      application.status = 'sentBackToCaseworker';
      application.currentStage = 'caseworker';
      const cwQueue = await kv.get('caseworker:queue') || [];
      if (!cwQueue.includes(applicationId)) {
        cwQueue.push(applicationId);
        await kv.set('caseworker:queue', cwQueue);
      }
    }

    await kv.set(`application:${applicationId}`, application);

    const commissionerQueue = await kv.get('commissioner:queue') || [];
    const updatedCQ = commissionerQueue.filter((id: string) => id !== applicationId);
    await kv.set('commissioner:queue', updatedCQ);

    console.log(`[COMMISSIONER CC SEND-BACK] Application ${applicationId} sent back to ${target}`);

    return c.json({
      success: true,
      message: `Application sent back to ${target} for corrections`,
      application
    });
  } catch (error) {
    console.log(`[COMMISSIONER CC SEND-BACK] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Commissioner rejects change-of-connection and generates endorsement letter with DSC
app.post("/make-server-698be164/commissioner/change-connection/reject", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, remarks, rejectionReason } = body;

    console.log(`[COMMISSIONER CC REJECT] Rejecting application: ${applicationId}`);

    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }
    if (!remarks || !remarks.trim()) {
      return c.json({ success: false, error: 'Remarks are required for rejection' }, 400);
    }

    const application = await kv.get(`application:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    if (application.workflow?.commissioner?.status === 'approved' ||
        application.workflow?.commissioner?.status === 'rejected') {
      return c.json({ success: false, error: 'Application has already been processed by Commissioner' }, 400);
    }

    const endorsementNo = `END-CC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;

    application.status = 'rejected';
    application.currentStage = 'rejected';
    if (!application.workflow) { application.workflow = {}; }
    application.workflow.commissioner = {
      status: 'rejected',
      action: 'rejectedWithEndorsement',
      remarks: remarks,
      rejectionReason: rejectionReason || remarks,
      endorsementNo: endorsementNo,
      dscSigned: true,
      dscSignedAt: new Date().toISOString(),
      rejectedAt: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };
    application.endorsementLetter = {
      endorsementNo: endorsementNo,
      applicantName: application.rrData?.ownerName || 'N/A',
      applicationId: applicationId,
      rrNumber: application.rrNumber || 'N/A',
      existingConnectionType: application.existingConnectionType || 'N/A',
      newConnectionType: application.newConnectionType || 'N/A',
      rejectionReason: rejectionReason || remarks,
      commissionerRemarks: remarks,
      generatedAt: new Date().toISOString(),
      dscSigned: true,
      dscSignedAt: new Date().toISOString()
    };
    application.updatedAt = new Date().toISOString();

    await kv.set(`application:${applicationId}`, application);

    const commissionerQueue = await kv.get('commissioner:queue') || [];
    const updatedQueue = commissionerQueue.filter((id: string) => id !== applicationId);
    await kv.set('commissioner:queue', updatedQueue);

    console.log(`[COMMISSIONER CC REJECT] Application ${applicationId} rejected with endorsement ${endorsementNo}`);

    return c.json({
      success: true,
      message: 'Application rejected and endorsement letter generated with DSC',
      endorsementNo: endorsementNo,
      application
    });
  } catch (error) {
    console.log(`[COMMISSIONER CC REJECT] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// TAP DISCONNECTION ENDPOINTS
// ========================================

// Verify RR Number for disconnection
app.post("/make-server-698be164/tap-disconnection/verify-rr", async (c) => {
  try {
    const body = await c.req.json();
    const { rrNumber } = body;

    if (!rrNumber) {
      return c.json({ success: false, error: "RR Number is required" }, 400);
    }

    console.log(`[DISCONNECTION VERIFY RR] Verifying RR Number: ${rrNumber}`);

    // Check if we have stored RR data from a previous verification
    const existingRrData = await kv.get(`rr:${rrNumber}`);

    // Build disconnection-specific RR data (includes arrears info)
    const rrData = {
      // Applicant Details
      district: existingRrData?.district || "Dharwad",
      ulb: existingRrData?.ulb || "Hubli-Dharwad",
      ulbType: existingRrData?.ulbType || "CC",

      // Property Details
      ownerName: existingRrData?.ownerName || "Rahul",
      doorNumber: existingRrData?.doorNumber || "191",
      wardNumber: existingRrData?.wardNumber || "Ward No.10",
      street: existingRrData?.street || "Ayodhya Nagar",
      address: existingRrData?.address || "Hubballi",
      city: existingRrData?.city || "Hubballi",
      propertyDistrict: existingRrData?.propertyDistrict || "Dharwad",
      state: existingRrData?.state || "Karnataka",
      pincode: existingRrData?.pincode || "580017",
      mobileNo: existingRrData?.mobileNo || "9876543210",

      // Connection Details
      connectionType: existingRrData?.connectionType || "Domestic 1/3\"",
      meterCategory: existingRrData?.meterCategory || "Meter",
      meterStatus: "Active",
      meterInstalledDate: existingRrData?.meterInstalledDate || "12/06/2022",
      schemeName: existingRrData?.schemeName || "Har Ghar Jal",

      // Current Arrears
      currentDemand: 200,
      arrears: 150,
      totalBill: 350
    };

    // Store verified RR data
    await kv.set(`rr:disconnection:${rrNumber}`, rrData);

    console.log(`[DISCONNECTION VERIFY RR] RR Number verified: ${rrNumber}`);
    return c.json({ success: true, rrData });
  } catch (error) {
    console.log(`[DISCONNECTION VERIFY RR] Error verifying RR Number: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Submit tap disconnection application
app.post("/make-server-698be164/tap-disconnection/submit", async (c) => {
  try {
    const body = await c.req.json();
    const {
      rrNumber, citizenId, disconnectionType, rrData,
      hasUGDConnection, disconnectionReason, wantToClearBill,
      arrearDetails, paymentDetails, declarationAccepted
    } = body;

    if (!rrNumber || !citizenId || !rrData || !disconnectionType) {
      return c.json({
        success: false,
        error: "Missing required fields for disconnection application"
      }, 400);
    }

    if (!declarationAccepted) {
      return c.json({
        success: false,
        error: "Declaration must be accepted before submitting"
      }, 400);
    }

    // Check if arrears exist and payment is required
    const totalBill = arrearDetails?.totalBill || 0;
    if (totalBill > 0 && !paymentDetails) {
      return c.json({
        success: false,
        error: "Outstanding arrears must be cleared before submitting disconnection application"
      }, 400);
    }

    // Generate unique application ID
    const applicationId = `DISCON-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    console.log(`[DISCONNECTION] Creating disconnection application: ${applicationId}`);

    const application = {
      id: applicationId,
      type: "disconnection",
      disconnectionType: disconnectionType,
      status: "pending_caseworker",
      currentStage: "caseworker",
      rrNumber,
      citizenId,
      rrData,
      hasUGDConnection,
      disconnectionReason,
      wantToClearBill,
      arrearDetails,
      arrearPaymentDetails: paymentDetails || null,
      declarationAccepted: true,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workflow: {
        caseworker: { status: "pending", assignedAt: new Date().toISOString() },
        fieldEngineer: { status: "not_started" },
        commissioner: { status: "not_started" },
        plumber: { status: "not_started" },
        commissionerVerification: { status: "not_started" }
      }
    };

    // Save application
    await kv.set(`application:${applicationId}`, application);

    // Add to caseworker queue
    const caseworkerQueue = await kv.get('caseworker:queue') || [];
    if (!caseworkerQueue.includes(applicationId)) {
      caseworkerQueue.push(applicationId);
    }
    await kv.set('caseworker:queue', caseworkerQueue);

    // Track citizen's applications
    const citizenApps = await kv.get(`citizen:${citizenId}:applications`) || [];
    if (!citizenApps.includes(applicationId)) {
      citizenApps.push(applicationId);
    }
    await kv.set(`citizen:${citizenId}:applications`, citizenApps);

    console.log(`[DISCONNECTION] Application ${applicationId} created and added to caseworker queue`);

    return c.json({
      success: true,
      applicationId,
      message: 'Disconnection application submitted successfully'
    });
  } catch (error) {
    console.log(`[DISCONNECTION] Error submitting application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete all disconnection applications
app.delete("/make-server-698be164/dev/delete-disconnection-apps", async (c) => {
  try {
    const allApps = await kv.getByPrefix('application:');
    const disconnectionApps = allApps.filter((dApp: any) => dApp && dApp.type === 'disconnection');
    console.log(`[DEV] Found ${disconnectionApps.length} disconnection applications to delete`);

    for (const dApp of disconnectionApps) {
      if (!dApp || !dApp.id) continue;
      await kv.del(`application:${dApp.id}`);
      console.log(`[DEV] Deleted application: ${dApp.id}`);

      const caseworkerQueue = await kv.get('caseworker:queue') || [];
      const updatedCWQueue = caseworkerQueue.filter((id: string) => id !== dApp.id);
      await kv.set('caseworker:queue', updatedCWQueue);

      const feQueue = await kv.get('field_engineer:queue') || [];
      const updatedFEQueue = feQueue.filter((id: string) => id !== dApp.id);
      await kv.set('field_engineer:queue', updatedFEQueue);

      const commQueue = await kv.get('commissioner:queue') || [];
      const updatedCommQueue = commQueue.filter((id: string) => id !== dApp.id);
      await kv.set('commissioner:queue', updatedCommQueue);

      if (dApp.citizenId) {
        const citizenApps = await kv.get(`citizen:${dApp.citizenId}:applications`) || [];
        const updatedCitizenApps = citizenApps.filter((id: string) => id !== dApp.id);
        await kv.set(`citizen:${dApp.citizenId}:applications`, updatedCitizenApps);
      }
    }

    return c.json({ success: true, deleted: disconnectionApps.length });
  } catch (error) {
    console.log(`[DEV] Error deleting disconnection apps: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// PLUMBER LICENSE REGISTRATION ENDPOINTS
// ========================================

// Submit new plumber license application
app.post("/make-server-698be164/plumber-license/apply", async (c) => {
  try {
    const body = await c.req.json();
    console.log("[PLUMBER LICENSE] New registration application received:", JSON.stringify(body).substring(0, 500));

    const { registrationType, district, ulb, financialYear, registrationFees, citizenId, applicantName, documents } = body;

    if (!registrationType || !district || !ulb) {
      return c.json({ success: false, error: 'Missing required fields for plumber license registration' }, 400);
    }

    const random = Math.floor(1000 + Math.random() * 9000);
    const applicationId = `PLR-${new Date().getFullYear()}-${String(random).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const application: any = {
      id: applicationId, applicationNo: applicationId, applicationType: 'plumber_license',
      registrationType: registrationType || 'individual', status: 'submitted',
      submittedAt: now, updatedAt: now,
      district, ulb, financialYear: financialYear || '2025-2026', registrationFees: registrationFees || '1000',
      citizenId: citizenId || body.mobileNumber || '',
      applicantName: applicantName || body.plumberName || body.firmName || '',
      documents: documents || {},
      workflow: { currentStep: 'caseworker_review', steps: [{ step: 'submitted', actor: 'citizen', timestamp: now, status: 'completed' }] },
    };

    if (registrationType === 'individual') {
      application.plumberName = body.plumberName || '';
      application.addressDistrict = body.addressDistrict || '';
      application.city = body.city || '';
      application.street = body.street || '';
      application.wardNo = body.wardNo || '';
      application.pincode = body.pincode || '';
      application.mobileNumber = body.mobileNumber || '';
      application.qualification = body.qualification || '';
      application.yearOfExperience = body.yearOfExperience || '';
    }

    if (registrationType === 'contractor') {
      application.firmName = body.firmName || '';
      application.typeOfFirm = body.typeOfFirm || '';
      application.officeAddress = body.officeAddress || '';
      application.contDistrict = body.contDistrict || '';
      application.taluk = body.taluk || '';
      application.pincode = body.pincode || '';
      application.mobileNumber = body.mobileNumber || '';
      application.emailId = body.emailId || '';
      application.panNumber = body.panNumber || '';
      application.gstNumber = body.gstNumber || '';
      application.authFullName = body.authFullName || '';
      application.authDesignation = body.authDesignation || '';
      application.authMobile = body.authMobile || '';
      application.authEmail = body.authEmail || '';
    }

    await kv.set(`plumber_license:${applicationId}`, application);
    console.log(`[PLUMBER LICENSE] Saved application: plumber_license:${applicationId}`);

    const caseworkerPlumberQueue = await kv.get('caseworker:plumber_license_queue') || [];
    if (!caseworkerPlumberQueue.includes(applicationId)) {
      caseworkerPlumberQueue.push(applicationId);
    }
    await kv.set('caseworker:plumber_license_queue', caseworkerPlumberQueue);

    const cid = citizenId || body.mobileNumber;
    const citizenApps = await kv.get(`citizen:${cid}:plumber_license_apps`) || [];
    if (!citizenApps.includes(applicationId)) {
      citizenApps.push(applicationId);
    }
    await kv.set(`citizen:${cid}:plumber_license_apps`, citizenApps);

    return c.json({ success: true, applicationId, message: 'Plumber license registration submitted successfully' });
  } catch (error) {
    console.log(`[PLUMBER LICENSE] Error submitting application: ${error}`);
    return c.json({ success: false, error: `Error submitting plumber license application: ${String(error)}` }, 500);
  }
});

// Get plumber license applications for a citizen
app.get("/make-server-698be164/plumber-license/my-applications/:citizenId", async (c) => {
  try {
    const citizenId = c.req.param('citizenId');
    console.log(`[PLUMBER LICENSE MY-APPS] Fetching applications for citizen: ${citizenId}`);

    // PRIMARY: Look up citizen-to-app mapping
    const appIds = await kv.get(`citizen:${citizenId}:plumber_license_apps`) || [];
    console.log(`[PLUMBER LICENSE MY-APPS] Citizen mapping key citizen:${citizenId}:plumber_license_apps has ${appIds.length} IDs:`, appIds);
    
    const applications: any[] = [];
    const foundIds = new Set<string>();

    for (const appId of appIds) {
      const appData = await kv.get(`plumber_license:${appId}`);
      if (appData) {
        applications.push(appData);
        foundIds.add(appData.id);
        console.log(`[PLUMBER LICENSE MY-APPS] Found app from mapping: ${appId}, status=${appData.status}`);
      } else {
        console.log(`[PLUMBER LICENSE MY-APPS] WARNING: App ID ${appId} in mapping but NOT found in plumber_license:${appId}`);
      }
    }

    // FALLBACK: Scan ALL plumber_license: apps for ones matching this citizenId
    // This catches apps where the citizen mapping was lost or citizenId format doesn't match
    const allPlumberApps = await kv.getByPrefix('plumber_license:');
    console.log(`[PLUMBER LICENSE MY-APPS] Fallback scan: ${allPlumberApps.length} total plumber_license apps in DB`);
    
    for (const plApp of allPlumberApps) {
      if (!plApp || foundIds.has(plApp.id)) continue;
      
      const appCid = plApp.citizenId ? String(plApp.citizenId).trim() : '';
      const myCid = String(citizenId).trim();
      
      // Match by exact citizenId
      let matched = (appCid === myCid);
      
      // Match by phone number appearing in citizenId
      if (!matched && myCid.length > 5) {
        if (appCid.includes(myCid)) matched = true;
      }
      
      // Match by mobileNumber field
      if (!matched && plApp.mobileNumber && myCid.length > 5) {
        if (String(plApp.mobileNumber).trim() === myCid) matched = true;
        if (String(plApp.mobileNumber).includes(myCid)) matched = true;
      }
      
      if (matched) {
        applications.push(plApp);
        foundIds.add(plApp.id);
        console.log(`[PLUMBER LICENSE MY-APPS] FALLBACK MATCH: ${plApp.id}, status=${plApp.status}, citizenId=${appCid}, mobile=${plApp.mobileNumber || 'N/A'}`);
        
        // Also repair the citizen mapping so future lookups are fast
        if (!appIds.includes(plApp.id)) {
          appIds.push(plApp.id);
          await kv.set(`citizen:${citizenId}:plumber_license_apps`, appIds);
          console.log(`[PLUMBER LICENSE MY-APPS] REPAIRED citizen mapping: added ${plApp.id} to citizen:${citizenId}:plumber_license_apps`);
        }
      }
    }

    console.log(`[PLUMBER LICENSE MY-APPS] Returning ${applications.length} total applications for citizen ${citizenId}`);

    // Sort by submission date (newest first)
    applications.sort((a: any, b: any) => {
      const dateA = new Date(a.submittedAt || 0).getTime();
      const dateB = new Date(b.submittedAt || 0).getTime();
      return dateB - dateA;
    });

    return c.json({ success: true, applications });

  } catch (error) {
    console.log(`[PLUMBER LICENSE MY-APPS] Error fetching citizen applications: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get plumber license applications for caseworker
app.get("/make-server-698be164/plumber-license/caseworker/applications", async (c) => {
  try {
    console.log("[PLUMBER LICENSE CW] Fetching caseworker plumber license applications");
    
    // THREE-TIER inclusion strategy (same pattern as regular app dashboards):
    const allPlumberApps = await kv.getByPrefix('plumber_license:');
    console.log(`[PLUMBER LICENSE CW] Found ${allPlumberApps.length} total plumber license apps`);
    
    const applications: any[] = [];
    
    for (const plApp of allPlumberApps) {
      if (plApp && plApp.id) {
        // Tier 1: Has caseworker workflow data
        const hasCWWorkflow = plApp.workflow?.caseworker && plApp.workflow.caseworker.status !== 'not_started';
        
        // Tier 2: Currently at caseworker stage
        const isAtCWStage = plApp.status === 'submitted' || plApp.status === 'sentToCaseworker';
        
        // Tier 3: All downstream statuses (app has passed through caseworker)
        const hasPassedCW = plApp.status === 'sentToFieldEngineer' ||
          plApp.status === 'sentToCommissioner' ||
          plApp.status === 'pendingPayment' ||
          plApp.status === 'paymentCompleted' ||
          plApp.status === 'approved' ||
          plApp.status === 'rejected' ||
          plApp.status === 'sentBackToCitizen';
        
        const shouldInclude = hasCWWorkflow || isAtCWStage || hasPassedCW;
        
        console.log(`[PLUMBER LICENSE CW] App ${plApp.id}: status=${plApp.status}, hasCW=${!!hasCWWorkflow}, atCW=${!!isAtCWStage}, passedCW=${!!hasPassedCW}, include=${!!shouldInclude}`);
        
        if (shouldInclude && !applications.find((a: any) => a.id === plApp.id)) {
          applications.push(plApp);
        }
      }
    }
    
    applications.sort((a: any, b: any) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
    console.log(`[PLUMBER LICENSE CW] Returning ${applications.length} applications`);
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`[PLUMBER LICENSE CW] Error fetching caseworker applications: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Caseworker forwards plumber license application to Field Engineer
app.post("/make-server-698be164/plumber-license/caseworker/forward", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, comment, forwardTo } = body;
    console.log(`[PLUMBER LICENSE] Caseworker forwarding ${applicationId} to ${forwardTo}`);
    if (!applicationId || !comment) {
      return c.json({ success: false, error: 'Missing applicationId or comment' }, 400);
    }
    const appData = await kv.get(`plumber_license:${applicationId}`);
    if (!appData) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    // Status guard: only forward if currently submitted
    if (appData.status !== 'submitted') {
      return c.json({ success: false, error: `Cannot forward application in status: ${appData.status}. Expected: submitted` }, 400);
    }
    const now = new Date().toISOString();
    const targetRole = forwardTo || 'Field Engineer';
    appData.status = 'sentToFieldEngineer';
    appData.updatedAt = now;
    appData.caseworkerComments = comment;
    appData.workflow = appData.workflow || { steps: [] };
    appData.workflow.currentStep = 'field_engineer_review';
    appData.workflow.steps.push({ step: 'caseworker_reviewed', actor: 'caseworker', timestamp: now, status: 'completed', comment, forwardedTo: targetRole });
    appData.workflow.caseworker = { status: 'reviewed', comment, forwardedTo: targetRole, timestamp: now };
    await kv.set(`plumber_license:${applicationId}`, appData);
    // Remove from caseworker plumber license queue
    const cwQueue = await kv.get('caseworker:plumber_license_queue') || [];
    const updatedCwQueue = cwQueue.filter((id: string) => id !== applicationId);
    await kv.set('caseworker:plumber_license_queue', updatedCwQueue);
    // Add to field engineer plumber license queue
    const feQueue = await kv.get('field_engineer:plumber_license_queue') || [];
    if (!feQueue.includes(applicationId)) {
      feQueue.push(applicationId);
    }
    await kv.set('field_engineer:plumber_license_queue', feQueue);
    console.log(`[PLUMBER LICENSE] Forwarded ${applicationId} to ${targetRole}, removed from caseworker queue`);
    return c.json({ success: true, message: `Application forwarded to ${targetRole}` });
  } catch (error) {
    console.log(`[PLUMBER LICENSE] Error forwarding application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get plumber license RENEWAL applications for Field Engineer (only PLR-REN-* apps)
app.get("/make-server-698be164/plumber-license/field-engineer/renewal-applications", async (c) => {
  try {
    console.log("[PLUMBER LICENSE FE RENEWAL] Fetching field engineer renewal applications");
    const allPlumberApps = await kv.getByPrefix('plumber_license:');
    console.log(`[PLUMBER LICENSE FE RENEWAL] Found ${allPlumberApps.length} total plumber license apps`);

    const applications: any[] = [];

    for (const plApp of allPlumberApps) {
      if (plApp && plApp.id && plApp.isRenewal && String(plApp.id).startsWith('PLR-REN-')) {
        // Tier 1: Has field engineer workflow data
        const hasFEWorkflow = plApp.workflow?.fieldEngineer && plApp.workflow.fieldEngineer.status !== 'not_started';

        // Tier 2: Currently at field engineer stage
        const isAtFEStage = plApp.status === 'sentToFieldEngineer';

        // Tier 3: All downstream statuses (app has passed through FE)
        const hasPassedFE = plApp.status === 'sentToCommissioner' ||
          plApp.status === 'pendingPayment' ||
          plApp.status === 'paymentCompleted' ||
          plApp.status === 'approved' ||
          plApp.status === 'rejected';

        // Also include sent-back-to-citizen if FE was involved
        const isSentBackByCitizenFromFE = plApp.status === 'sentBackToCitizen' && plApp.workflow?.sendBack?.sentBackBy === 'fieldEngineer';

        // For Tier 3, only include if FE was actually involved
        const shouldInclude = hasFEWorkflow || isAtFEStage || isSentBackByCitizenFromFE ||
          (hasPassedFE && plApp.workflow?.fieldEngineer);

        console.log(`[PLUMBER LICENSE FE RENEWAL] App ${plApp.id}: status=${plApp.status}, hasFE=${!!hasFEWorkflow}, atFE=${!!isAtFEStage}, passedFE=${!!hasPassedFE}, include=${!!shouldInclude}`);

        if (shouldInclude && !applications.find((a: any) => a.id === plApp.id)) {
          applications.push(plApp);
        }
      }
    }

    applications.sort((a: any, b: any) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
    console.log(`[PLUMBER LICENSE FE RENEWAL] Returning ${applications.length} renewal applications`);
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`[PLUMBER LICENSE FE RENEWAL] Error fetching applications: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get plumber license applications for Field Engineer
app.get("/make-server-698be164/plumber-license/field-engineer/applications", async (c) => {
  try {
    console.log("[PLUMBER LICENSE FE] Fetching field engineer plumber license applications");
    
    // THREE-TIER inclusion strategy (same pattern as regular app dashboards):
    const allPlumberApps = await kv.getByPrefix('plumber_license:');
    console.log(`[PLUMBER LICENSE FE] Found ${allPlumberApps.length} total plumber license apps`);
    
    const applications: any[] = [];
    
    for (const plApp of allPlumberApps) {
      if (plApp && plApp.id) {
        // Tier 1: Has field engineer workflow data
        const hasFEWorkflow = plApp.workflow?.fieldEngineer && plApp.workflow.fieldEngineer.status !== 'not_started';
        
        // Tier 2: Currently at field engineer stage
        const isAtFEStage = plApp.status === 'sentToFieldEngineer';
        
        // Tier 3: All downstream statuses (app has passed through FE)
        const hasPassedFE = plApp.status === 'sentToCommissioner' ||
          plApp.status === 'pendingPayment' ||
          plApp.status === 'paymentCompleted' ||
          plApp.status === 'approved' ||
          plApp.status === 'rejected';
        
        // Also include sent-back-to-citizen if FE was involved
        const isSentBackByCitizenFromFE = plApp.status === 'sentBackToCitizen' && plApp.workflow?.sendBack?.sentBackBy === 'fieldEngineer';
        
        // For Tier 3, only include if FE was actually involved
        const shouldInclude = hasFEWorkflow || isAtFEStage || isSentBackByCitizenFromFE ||
          (hasPassedFE && plApp.workflow?.fieldEngineer);
        
        console.log(`[PLUMBER LICENSE FE] App ${plApp.id}: status=${plApp.status}, hasFE=${!!hasFEWorkflow}, atFE=${!!isAtFEStage}, passedFE=${!!hasPassedFE}, include=${!!shouldInclude}`);
        
        if (shouldInclude && !applications.find((a: any) => a.id === plApp.id)) {
          applications.push(plApp);
        }
      }
    }
    
    applications.sort((a: any, b: any) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
    console.log(`[PLUMBER LICENSE FE] Returning ${applications.length} applications`);
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`[PLUMBER LICENSE FE] Error fetching applications: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Field Engineer forwards plumber license application to Commissioner
app.post("/make-server-698be164/plumber-license/field-engineer/forward", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, comment, forwardTo } = body;
    console.log(`[PLUMBER LICENSE FE] Field Engineer forwarding ${applicationId} to ${forwardTo || 'Commissioner'}`);
    if (!applicationId || !comment) {
      return c.json({ success: false, error: 'Missing applicationId or comment' }, 400);
    }
    const appData = await kv.get(`plumber_license:${applicationId}`);
    if (!appData) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    // Status guard: only forward if currently at field engineer stage
    if (appData.status !== 'sentToFieldEngineer') {
      return c.json({ success: false, error: `Cannot forward application in status: ${appData.status}. Expected: sentToFieldEngineer` }, 400);
    }
    const now = new Date().toISOString();
    const targetRole = forwardTo || 'Commissioner';
    appData.status = 'sentToCommissioner';
    appData.updatedAt = now;
    appData.fieldEngineerComments = comment;
    // Clear stale root-level commissioner decision from previous sendback
    delete appData.commissionerDecision;
    appData.workflow = appData.workflow || { steps: [] };
    appData.workflow.currentStep = 'commissioner_review';
    appData.workflow.steps = appData.workflow.steps || [];
    appData.workflow.steps.push({ step: 'field_engineer_reviewed', actor: 'field_engineer', timestamp: now, status: 'completed', comment, forwardedTo: targetRole });
    appData.workflow.fieldEngineer = { status: 'reviewed', comment, forwardedTo: targetRole, timestamp: now };
    // Reset commissioner workflow status so commissioner can re-review after sendback
    appData.workflow.commissioner = { status: 'pending', previousDecision: appData.workflow.commissioner?.status || null };
    await kv.set(`plumber_license:${applicationId}`, appData);
    // Remove from field engineer plumber license queue
    const feQueue = await kv.get('field_engineer:plumber_license_queue') || [];
    const updatedFeQueue = feQueue.filter((id: string) => id !== applicationId);
    await kv.set('field_engineer:plumber_license_queue', updatedFeQueue);
    // Add to commissioner plumber license queue
    const commQueue = await kv.get('commissioner:plumber_license_queue') || [];
    if (!commQueue.includes(applicationId)) {
      commQueue.push(applicationId);
    }
    await kv.set('commissioner:plumber_license_queue', commQueue);
    console.log(`[PLUMBER LICENSE FE] Forwarded ${applicationId} to ${targetRole}, removed from FE queue`);
    return c.json({ success: true, message: `Application forwarded to ${targetRole}` });
  } catch (error) {
    console.log(`[PLUMBER LICENSE FE] Error forwarding application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ─── Commissioner Plumber License Routes ─────────────────────────────────────

// Get plumber license RENEWAL applications for Commissioner (only PLR-REN-* apps)
app.get("/make-server-698be164/plumber-license/commissioner/renewal-applications", async (c) => {
  try {
    console.log("[PLUMBER LICENSE COMM RENEWAL] Fetching commissioner renewal applications");
    const allPlumberApps = await kv.getByPrefix('plumber_license:');
    console.log(`[PLUMBER LICENSE COMM RENEWAL] Found ${allPlumberApps.length} total plumber license apps`);

    const applications: any[] = [];

    for (const plApp of allPlumberApps) {
      if (plApp && plApp.id && plApp.isRenewal && String(plApp.id).startsWith('PLR-REN-')) {
        // Tier 1: Has commissioner workflow data
        const hasCommWorkflow = plApp.workflow?.commissioner && plApp.workflow.commissioner.status !== 'not_started';

        // Tier 2: Currently at commissioner stage
        const isAtCommStage = plApp.status === 'sentToCommissioner' || plApp.status === 'paymentCompleted';

        // Tier 3: All downstream statuses (app has passed through commissioner)
        const hasPassedComm = plApp.status === 'pendingPayment' ||
          plApp.status === 'approved' ||
          plApp.status === 'rejected';

        // Also catch sent-back scenarios
        const isSentBack = plApp.workflow?.commissioner?.status === 'sent_back';
        const isSentBackToCitizen = plApp.status === 'sentBackToCitizen' && plApp.workflow?.commissioner;

        const shouldInclude = hasCommWorkflow || isAtCommStage || isSentBack || isSentBackToCitizen ||
          (hasPassedComm && plApp.workflow?.commissioner);

        console.log(`[PLUMBER LICENSE COMM RENEWAL] App ${plApp.id}: status=${plApp.status}, hasComm=${!!hasCommWorkflow}, atComm=${!!isAtCommStage}, include=${!!shouldInclude}`);

        if (shouldInclude && !applications.find((a: any) => a.id === plApp.id)) {
          applications.push(plApp);
        }
      }
    }

    applications.sort((a: any, b: any) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
    console.log(`[PLUMBER LICENSE COMM RENEWAL] Returning ${applications.length} renewal applications`);
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`[PLUMBER LICENSE COMM RENEWAL] Error fetching applications: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Commissioner sends back plumber license renewal application directly to Citizen/Plumber
app.post("/make-server-698be164/plumber-license/commissioner/sendback-to-citizen", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, comment } = body;
    console.log(`[PLUMBER LICENSE COMM] Commissioner sending back ${applicationId} to Citizen`);
    if (!applicationId || !comment) {
      return c.json({ success: false, error: 'Missing applicationId or comment' }, 400);
    }
    const appData = await kv.get(`plumber_license:${applicationId}`);
    if (!appData) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    if (appData.status !== 'sentToCommissioner') {
      return c.json({ success: false, error: `Cannot send back application in status: ${appData.status}. Expected: sentToCommissioner` }, 400);
    }
    const now = new Date().toISOString();
    appData.status = 'sentBackToCitizen';
    appData.updatedAt = now;
    appData.commissionerComments = comment;
    appData.commissionerDecision = 'sent_back_to_citizen';
    appData.workflow = appData.workflow || { steps: [] };
    appData.workflow.currentStep = 'sent_back_to_citizen';
    appData.workflow.steps = appData.workflow.steps || [];
    appData.workflow.steps.push({
      step: 'commissioner_sent_back_to_citizen',
      actor: 'commissioner',
      timestamp: now,
      status: 'completed',
      comment,
      decision: 'sent_back_to_citizen'
    });
    appData.workflow.commissioner = {
      status: 'sent_back_to_citizen',
      comment,
      timestamp: now,
      decision: 'sent_back_to_citizen'
    };
    appData.workflow.sendBack = {
      sentBackBy: 'commissioner',
      sentBackByLabel: 'Commissioner',
      comment,
      timestamp: now,
    };
    appData.workflow.previousSendBacks = appData.workflow.previousSendBacks || [];
    appData.workflow.previousSendBacks.push({
      sentBackBy: 'commissioner',
      sentBackByLabel: 'Commissioner',
      comment,
      timestamp: now,
    });
    await kv.set(`plumber_license:${applicationId}`, appData);

    const commQueue = await kv.get('commissioner:plumber_license_queue') || [];
    const updatedCommQueue = commQueue.filter((id: string) => id !== applicationId);
    await kv.set('commissioner:plumber_license_queue', updatedCommQueue);

    console.log(`[PLUMBER LICENSE COMM] Sent back ${applicationId} to Citizen/Plumber`);
    return c.json({ success: true, message: 'Application sent back to Citizen/Plumber for corrections.' });
  } catch (error) {
    console.log(`[PLUMBER LICENSE COMM] Error sending back to citizen: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get plumber license applications for Commissioner
app.get("/make-server-698be164/plumber-license/commissioner/applications", async (c) => {
  try {
    console.log("[PLUMBER LICENSE COMM] Fetching commissioner plumber license applications");
    
    // THREE-TIER inclusion strategy (consistent with all other list endpoints):
    const allPlumberApps = await kv.getByPrefix('plumber_license:');
    console.log(`[PLUMBER LICENSE COMM] Found ${allPlumberApps.length} total plumber license apps`);
    
    const applications: any[] = [];
    
    for (const plApp of allPlumberApps) {
      if (plApp && plApp.id) {
        // Tier 1: Has commissioner workflow data
        const hasCommWorkflow = plApp.workflow?.commissioner && plApp.workflow.commissioner.status !== 'not_started';
        
        // Tier 2: Currently at commissioner stage
        const isAtCommStage = plApp.status === 'sentToCommissioner' || plApp.status === 'paymentCompleted';
        
        // Tier 3: All downstream statuses (app has passed through commissioner)
        const hasPassedComm = plApp.status === 'pendingPayment' ||
          plApp.status === 'approved' ||
          plApp.status === 'rejected';
        
        // Also catch sent-back scenarios (commissioner sent it back to FE)
        const isSentBack = plApp.workflow?.commissioner?.status === 'sent_back';
        
        // Also catch sentBackToCitizen if commissioner was involved
        const isSentBackToCitizen = plApp.status === 'sentBackToCitizen' && plApp.workflow?.commissioner;
        
        // For Tier 3, only include if commissioner was actually involved
        const shouldInclude = hasCommWorkflow || isAtCommStage || isSentBack || isSentBackToCitizen ||
          (hasPassedComm && plApp.workflow?.commissioner);
        
        console.log(`[PLUMBER LICENSE COMM] App ${plApp.id}: status=${plApp.status}, hasComm=${!!hasCommWorkflow}, atComm=${!!isAtCommStage}, passedComm=${!!hasPassedComm}, sentBack=${!!isSentBack}, include=${!!shouldInclude}`);
        
        if (shouldInclude && !applications.find((a: any) => a.id === plApp.id)) {
          applications.push(plApp);
        }
      }
    }
    
    applications.sort((a: any, b: any) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
    console.log(`[PLUMBER LICENSE COMM] Returning ${applications.length} applications`);
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`[PLUMBER LICENSE COMM] Error fetching applications: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Commissioner approves plumber license application → pendingPayment for citizen
app.post("/make-server-698be164/plumber-license/commissioner/approve", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, comment } = body;
    console.log(`[PLUMBER LICENSE COMM] Commissioner approving ${applicationId}`);
    if (!applicationId || !comment) {
      return c.json({ success: false, error: 'Missing applicationId or comment' }, 400);
    }
    const appData = await kv.get(`plumber_license:${applicationId}`);
    if (!appData) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    // Status guard: only approve if currently at commissioner stage
    if (appData.status !== 'sentToCommissioner') {
      return c.json({ success: false, error: `Cannot approve application in status: ${appData.status}. Expected: sentToCommissioner` }, 400);
    }
    const now = new Date().toISOString();
    appData.status = 'pendingPayment';
    appData.updatedAt = now;
    // Clear any stale paymentDetails so citizen sees payment form (not receipt)
    delete appData.paymentDetails;
    appData.commissionerComments = comment;
    appData.commissionerDecision = 'approved';
    appData.workflow = appData.workflow || { steps: [] };
    appData.workflow.currentStep = 'pending_payment';
    appData.workflow.steps = appData.workflow.steps || [];
    appData.workflow.steps.push({
      step: 'commissioner_approved',
      actor: 'commissioner',
      timestamp: now,
      status: 'completed',
      comment,
      decision: 'approved'
    });
    appData.workflow.commissioner = {
      status: 'approved',
      comment,
      timestamp: now,
      decision: 'approved'
    };
    await kv.set(`plumber_license:${applicationId}`, appData);
    // Remove from commissioner plumber license queue
    const commQueue = await kv.get('commissioner:plumber_license_queue') || [];
    const updatedQueue = commQueue.filter((id: string) => id !== applicationId);
    await kv.set('commissioner:plumber_license_queue', updatedQueue);
    console.log(`[PLUMBER LICENSE COMM] Approved ${applicationId}, status → pendingPayment`);
    return c.json({ success: true, message: 'Application approved. Citizen can now make payment.' });
  } catch (error) {
    console.log(`[PLUMBER LICENSE COMM] Error approving application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Commissioner rejects plumber license application
app.post("/make-server-698be164/plumber-license/commissioner/reject", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, comment } = body;
    console.log(`[PLUMBER LICENSE COMM] Commissioner rejecting ${applicationId}`);
    if (!applicationId || !comment) {
      return c.json({ success: false, error: 'Missing applicationId or comment' }, 400);
    }
    const appData = await kv.get(`plumber_license:${applicationId}`);
    if (!appData) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    // Status guard: only reject if currently at commissioner stage
    if (appData.status !== 'sentToCommissioner') {
      return c.json({ success: false, error: `Cannot reject application in status: ${appData.status}. Expected: sentToCommissioner` }, 400);
    }
    const now = new Date().toISOString();
    appData.status = 'rejected';
    appData.updatedAt = now;
    appData.commissionerComments = comment;
    appData.commissionerDecision = 'rejected';
    appData.workflow = appData.workflow || { steps: [] };
    appData.workflow.currentStep = 'rejected';
    appData.workflow.steps = appData.workflow.steps || [];
    appData.workflow.steps.push({
      step: 'commissioner_rejected',
      actor: 'commissioner',
      timestamp: now,
      status: 'completed',
      comment,
      decision: 'rejected'
    });
    appData.workflow.commissioner = {
      status: 'rejected',
      comment,
      timestamp: now,
      decision: 'rejected'
    };
    await kv.set(`plumber_license:${applicationId}`, appData);
    // Remove from commissioner plumber license queue
    const commQueue = await kv.get('commissioner:plumber_license_queue') || [];
    const updatedQueue = commQueue.filter((id: string) => id !== applicationId);
    await kv.set('commissioner:plumber_license_queue', updatedQueue);
    console.log(`[PLUMBER LICENSE COMM] Rejected ${applicationId}`);
    return c.json({ success: true, message: 'Application rejected. Citizen has been notified.' });
  } catch (error) {
    console.log(`[PLUMBER LICENSE COMM] Error rejecting application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// PLUMBER LICENSE - CITIZEN PAYMENT
// ========================================

// Citizen makes payment for approved plumber license
app.post("/make-server-698be164/plumber-license/payment", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, paymentMethod, transactionId } = body;
    console.log(`[PLUMBER LICENSE PAY] Citizen paying for ${applicationId}`);
    if (!applicationId) {
      return c.json({ success: false, error: 'Missing applicationId' }, 400);
    }
    const appData = await kv.get(`plumber_license:${applicationId}`);
    if (!appData) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    if (appData.status !== 'pendingPayment') {
      return c.json({ success: false, error: `Cannot make payment in status: ${appData.status}` }, 400);
    }
    const now = new Date().toISOString();
    const txnId = transactionId || `TXN-PL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Set status to paymentCompleted → goes back to Commissioner for certificate generation + DSC
    appData.status = 'paymentCompleted';
    appData.updatedAt = now;
    appData.paymentDetails = {
      status: 'completed',
      paidAt: now,
      transactionId: txnId,
      paymentMethod: paymentMethod || 'online',
      amount: appData.registrationFees || '500',
    };
    
    appData.workflow = appData.workflow || { steps: [] };
    appData.workflow.currentStep = 'pending_certificate';
    appData.workflow.steps = appData.workflow.steps || [];
    appData.workflow.steps.push({
      step: 'payment_completed',
      actor: 'citizen',
      timestamp: now,
      status: 'completed',
      transactionId: txnId,
      paymentMethod: paymentMethod || 'online'
    });
    
    await kv.set(`plumber_license:${applicationId}`, appData);
    
    // Add back to commissioner plumber license queue for certificate generation + DSC
    const commQueue = await kv.get('commissioner:plumber_license_queue') || [];
    if (!commQueue.includes(applicationId)) {
      commQueue.push(applicationId);
    }
    await kv.set('commissioner:plumber_license_queue', commQueue);
    
    console.log(`[PLUMBER LICENSE PAY] Payment completed for ${applicationId}, status → paymentCompleted, added to commissioner queue for certificate generation`);
    return c.json({ 
      success: true, 
      message: 'Payment successful. Application sent to Commissioner for certificate generation and DSC.',
      transactionId: txnId
    });
  } catch (error) {
    console.log(`[PLUMBER LICENSE PAY] Error processing payment: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// PLUMBER LICENSE - COMMISSIONER SENDBACK
// ========================================

// Commissioner sends back plumber license application to Field Engineer
app.post("/make-server-698be164/plumber-license/commissioner/sendback", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, comment } = body;
    console.log(`[PLUMBER LICENSE COMM] Commissioner sending back ${applicationId} to Field Engineer`);
    if (!applicationId || !comment) {
      return c.json({ success: false, error: 'Missing applicationId or comment' }, 400);
    }
    const appData = await kv.get(`plumber_license:${applicationId}`);
    if (!appData) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    // Status guard: only sendback if currently at commissioner stage
    if (appData.status !== 'sentToCommissioner') {
      return c.json({ success: false, error: `Cannot send back application in status: ${appData.status}. Expected: sentToCommissioner` }, 400);
    }
    const now = new Date().toISOString();
    appData.status = 'sentToFieldEngineer';
    appData.updatedAt = now;
    appData.commissionerComments = comment;
    appData.commissionerDecision = 'sent_back';
    appData.workflow = appData.workflow || { steps: [] };
    appData.workflow.currentStep = 'field_engineer_review';
    appData.workflow.steps = appData.workflow.steps || [];
    appData.workflow.steps.push({
      step: 'commissioner_sent_back',
      actor: 'commissioner',
      timestamp: now,
      status: 'completed',
      comment,
      decision: 'sent_back'
    });
    appData.workflow.commissioner = {
      status: 'sent_back',
      comment,
      timestamp: now,
      decision: 'sent_back'
    };
    await kv.set(`plumber_license:${applicationId}`, appData);
    
    // Remove from commissioner plumber license queue
    const commQueue = await kv.get('commissioner:plumber_license_queue') || [];
    const updatedCommQueue = commQueue.filter((id: string) => id !== applicationId);
    await kv.set('commissioner:plumber_license_queue', updatedCommQueue);
    
    // Add back to field engineer plumber license queue
    const feQueue = await kv.get('field_engineer:plumber_license_queue') || [];
    if (!feQueue.includes(applicationId)) {
      feQueue.push(applicationId);
    }
    await kv.set('field_engineer:plumber_license_queue', feQueue);
    
    console.log(`[PLUMBER LICENSE COMM] Sent back ${applicationId} to Field Engineer`);
    return c.json({ success: true, message: 'Application sent back to Field Engineer for review.' });
  } catch (error) {
    console.log(`[PLUMBER LICENSE COMM] Error sending back application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// PLUMBER LICENSE - COMMISSIONER CERTIFICATE GENERATION + DSC
// ========================================

// Commissioner generates plumber license certificate with DSC after citizen payment
app.post("/make-server-698be164/plumber-license/commissioner/generate-license", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, dscDetails, comment } = body;
    console.log(`[PLUMBER LICENSE CERT] Commissioner generating license for ${applicationId}`);
    if (!applicationId) {
      return c.json({ success: false, error: 'Missing applicationId' }, 400);
    }
    const appData = await kv.get(`plumber_license:${applicationId}`);
    if (!appData) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    if (appData.status !== 'paymentCompleted') {
      return c.json({ success: false, error: `Cannot generate license in status: ${appData.status}. Expected: paymentCompleted` }, 400);
    }
    const now = new Date().toISOString();
    
    // Generate license number
    const licenseNo = `PL-${appData.district ? appData.district.substring(0, 3).toUpperCase() : 'KAR'}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    appData.status = 'approved';
    appData.updatedAt = now;
    appData.licenseNumber = licenseNo;
    appData.licenseIssuedAt = now;
    appData.licenseValidUntil = new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString();
    appData.commissionerCertificateComments = comment || '';
    
    // Store DSC details
    appData.dscDetails = {
      signedBy: dscDetails?.signedBy || 'Commissioner',
      signedAt: now,
      certificateId: `DSC-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      serialNumber: dscDetails?.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      validFrom: now,
      validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
    };
    
    appData.workflow = appData.workflow || { steps: [] };
    appData.workflow.currentStep = 'license_issued';
    appData.workflow.steps = appData.workflow.steps || [];
    appData.workflow.steps.push({
      step: 'certificate_generated',
      actor: 'commissioner',
      timestamp: now,
      status: 'completed',
      licenseNumber: licenseNo,
      comment: comment || ''
    });
    appData.workflow.steps.push({
      step: 'dsc_applied',
      actor: 'commissioner',
      timestamp: now,
      status: 'completed',
      dscCertificateId: appData.dscDetails.certificateId
    });
    appData.workflow.steps.push({
      step: 'license_issued',
      actor: 'commissioner',
      timestamp: now,
      status: 'completed',
      licenseNumber: licenseNo
    });
    appData.workflow.commissioner = {
      ...appData.workflow.commissioner,
      certificateGenerated: true,
      dscApplied: true,
      licenseIssuedAt: now,
      licenseNumber: licenseNo,
    };
    
    await kv.set(`plumber_license:${applicationId}`, appData);
    
    // Remove from commissioner plumber license queue
    const commQueue = await kv.get('commissioner:plumber_license_queue') || [];
    const updatedQueue = commQueue.filter((id: string) => id !== applicationId);
    await kv.set('commissioner:plumber_license_queue', updatedQueue);
    
    console.log(`[PLUMBER LICENSE CERT] License generated for ${applicationId}: ${licenseNo}, DSC applied, removed from commissioner queue`);
    return c.json({ 
      success: true, 
      message: 'License certificate generated with DSC. Citizen can now download the certificate.',
      licenseNumber: licenseNo,
      dscCertificateId: appData.dscDetails.certificateId
    });
  } catch (error) {
    console.log(`[PLUMBER LICENSE CERT] Error generating license: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single plumber license application by ID
app.get("/make-server-698be164/plumber-license/application/:id", async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`[PLUMBER LICENSE] Fetching application: ${id}`);
    const appData = await kv.get(`plumber_license:${id}`);
    if (!appData) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    return c.json({ success: true, application: appData });
  } catch (error) {
    console.log(`[PLUMBER LICENSE] Error fetching application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// PLUMBER LICENSE - SEND BACK TO CITIZEN (Caseworker & Field Engineer)
// ========================================

// Caseworker sends back plumber license application to Citizen
app.post("/make-server-698be164/plumber-license/caseworker/sendback", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, comment } = body;
    console.log(`[PLUMBER LICENSE CW] Caseworker sending back ${applicationId} to Citizen`);
    if (!applicationId || !comment) {
      return c.json({ success: false, error: 'Missing applicationId or comment' }, 400);
    }
    const appData = await kv.get(`plumber_license:${applicationId}`);
    if (!appData) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    if (appData.status !== 'submitted') {
      return c.json({ success: false, error: `Cannot send back application in status: ${appData.status}. Expected: submitted` }, 400);
    }
    const now = new Date().toISOString();
    appData.status = 'sentBackToCitizen';
    appData.updatedAt = now;
    appData.workflow = appData.workflow || { steps: [] };
    appData.workflow.steps = appData.workflow.steps || [];
    appData.workflow.steps.push({
      step: 'caseworker_sent_back_to_citizen',
      actor: 'caseworker',
      timestamp: now,
      status: 'completed',
      comment,
      decision: 'sent_back_to_citizen'
    });
    appData.workflow.sendBack = {
      sentBackBy: 'caseworker',
      comment,
      timestamp: now,
      sentBackByLabel: 'Caseworker'
    };
    appData.workflow.currentStep = 'citizen_correction';
    await kv.set(`plumber_license:${applicationId}`, appData);
    const cwQueue = await kv.get('caseworker:plumber_license_queue') || [];
    const updatedCwQueue = cwQueue.filter((id: string) => id !== applicationId);
    await kv.set('caseworker:plumber_license_queue', updatedCwQueue);
    console.log(`[PLUMBER LICENSE CW] Sent back ${applicationId} to Citizen`);
    return c.json({ success: true, message: 'Application sent back to Citizen for corrections.' });
  } catch (error) {
    console.log(`[PLUMBER LICENSE CW] Error sending back application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Field Engineer sends back plumber license application to Citizen
app.post("/make-server-698be164/plumber-license/field-engineer/sendback", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, comment } = body;
    console.log(`[PLUMBER LICENSE FE] Field Engineer sending back ${applicationId} to Citizen`);
    if (!applicationId || !comment) {
      return c.json({ success: false, error: 'Missing applicationId or comment' }, 400);
    }
    const appData = await kv.get(`plumber_license:${applicationId}`);
    if (!appData) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    if (appData.status !== 'sentToFieldEngineer') {
      return c.json({ success: false, error: `Cannot send back application in status: ${appData.status}. Expected: sentToFieldEngineer` }, 400);
    }
    const now = new Date().toISOString();
    appData.status = 'sentBackToCitizen';
    appData.updatedAt = now;
    appData.workflow = appData.workflow || { steps: [] };
    appData.workflow.steps = appData.workflow.steps || [];
    appData.workflow.steps.push({
      step: 'field_engineer_sent_back_to_citizen',
      actor: 'field_engineer',
      timestamp: now,
      status: 'completed',
      comment,
      decision: 'sent_back_to_citizen'
    });
    appData.workflow.sendBack = {
      sentBackBy: 'fieldEngineer',
      comment,
      timestamp: now,
      sentBackByLabel: 'Field Engineer'
    };
    appData.workflow.currentStep = 'citizen_correction';
    await kv.set(`plumber_license:${applicationId}`, appData);
    const feQueue = await kv.get('field_engineer:plumber_license_queue') || [];
    const updatedFeQueue = feQueue.filter((id: string) => id !== applicationId);
    await kv.set('field_engineer:plumber_license_queue', updatedFeQueue);
    console.log(`[PLUMBER LICENSE FE] Sent back ${applicationId} to Citizen`);
    return c.json({ success: true, message: 'Application sent back to Citizen for corrections.' });
  } catch (error) {
    console.log(`[PLUMBER LICENSE FE] Error sending back application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Citizen resubmits plumber license application after corrections
app.post("/make-server-698be164/plumber-license/citizen/resubmit", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, updatedFields } = body;
    console.log(`[PLUMBER LICENSE CITIZEN] Citizen resubmitting ${applicationId}`);
    if (!applicationId) {
      return c.json({ success: false, error: 'Missing applicationId' }, 400);
    }
    const appData = await kv.get(`plumber_license:${applicationId}`);
    if (!appData) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    if (appData.status !== 'sentBackToCitizen') {
      return c.json({ success: false, error: `Cannot resubmit application in status: ${appData.status}. Expected: sentBackToCitizen` }, 400);
    }
    const sentBackBy = appData.workflow?.sendBack?.sentBackBy || 'caseworker';
    const now = new Date().toISOString();
    // Apply updated fields from citizen corrections
    if (updatedFields && typeof updatedFields === 'object') {
      for (const [key, value] of Object.entries(updatedFields)) {
        if (!['id', 'applicationNo', 'applicationType', 'status', 'workflow', 'citizenId'].includes(key)) {
          appData[key] = value;
        }
      }
    }
    appData.updatedAt = now;
    appData.workflow = appData.workflow || { steps: [] };
    appData.workflow.steps = appData.workflow.steps || [];
    appData.workflow.steps.push({
      step: 'citizen_resubmitted',
      actor: 'citizen',
      timestamp: now,
      status: 'completed',
      comment: `Citizen resubmitted after corrections (sent back by ${sentBackBy})`,
      previousSendBack: appData.workflow.sendBack
    });
    // Store previous sendback info for remarks trail
    appData.workflow.previousSendBacks = appData.workflow.previousSendBacks || [];
    appData.workflow.previousSendBacks.push(appData.workflow.sendBack);
    delete appData.workflow.sendBack;
    if (sentBackBy === 'caseworker') {
      appData.status = 'submitted';
      appData.workflow.currentStep = 'caseworker_review';
      appData.workflow.caseworker = { status: 'pending', previousDecision: 'sent_back_to_citizen' };
      await kv.set(`plumber_license:${applicationId}`, appData);
      const cwQueue = await kv.get('caseworker:plumber_license_queue') || [];
      if (!cwQueue.includes(applicationId)) { cwQueue.push(applicationId); }
      await kv.set('caseworker:plumber_license_queue', cwQueue);
      console.log(`[PLUMBER LICENSE CITIZEN] Resubmitted ${applicationId} back to Caseworker`);
      return c.json({ success: true, message: 'Application resubmitted to Caseworker for review.', routedTo: 'Caseworker' });
    } else if (sentBackBy === 'fieldEngineer') {
      appData.status = 'sentToFieldEngineer';
      appData.workflow.currentStep = 'field_engineer_review';
      appData.workflow.fieldEngineer = { status: 'pending', previousDecision: 'sent_back_to_citizen' };
      await kv.set(`plumber_license:${applicationId}`, appData);
      const feQueue = await kv.get('field_engineer:plumber_license_queue') || [];
      if (!feQueue.includes(applicationId)) { feQueue.push(applicationId); }
      await kv.set('field_engineer:plumber_license_queue', feQueue);
      console.log(`[PLUMBER LICENSE CITIZEN] Resubmitted ${applicationId} back to Field Engineer`);
      return c.json({ success: true, message: 'Application resubmitted to Field Engineer for review.', routedTo: 'Field Engineer' });
    } else {
      appData.status = 'submitted';
      appData.workflow.currentStep = 'caseworker_review';
      await kv.set(`plumber_license:${applicationId}`, appData);
      const cwQueue = await kv.get('caseworker:plumber_license_queue') || [];
      if (!cwQueue.includes(applicationId)) { cwQueue.push(applicationId); }
      await kv.set('caseworker:plumber_license_queue', cwQueue);
      console.log(`[PLUMBER LICENSE CITIZEN] Resubmitted ${applicationId} back to Caseworker (fallback)`);
      return c.json({ success: true, message: 'Application resubmitted to Caseworker for review.', routedTo: 'Caseworker' });
    }
  } catch (error) {
    console.log(`[PLUMBER LICENSE CITIZEN] Error resubmitting application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// PLUMBER LICENSE - RENEWAL ENDPOINT
// ========================================

// Lookup a plumber license by license number (for renewal flow)
app.get("/make-server-698be164/plumber-license/lookup-by-license/:licenseNumber", async (c) => {
  try {
    const licenseNumber = decodeURIComponent(c.req.param('licenseNumber'));
    console.log(`[PLUMBER LICENSE LOOKUP] Looking up license: ${licenseNumber}`);

    if (!licenseNumber) {
      return c.json({ success: false, error: 'License number is required' }, 400);
    }

    // Search all plumber_license entries for one matching the license number
    const allApps = await kv.getByPrefix('plumber_license:');
    let foundApp: any = null;
    for (const entry of allApps) {
      if (entry && entry.licenseNumber && entry.licenseNumber === licenseNumber && entry.status === 'approved') {
        foundApp = entry;
        break;
      }
    }

    if (!foundApp) {
      console.log(`[PLUMBER LICENSE LOOKUP] No approved license found for: ${licenseNumber}`);
      return c.json({ success: false, error: `No approved license found with number "${licenseNumber}". Please check the license number and try again.` }, 404);
    }

    // Check if license is blacklisted
    if (foundApp.blacklisted) {
      return c.json({ success: false, error: 'This license has been blacklisted. Renewal is not permitted. Please contact the ULB office.' }, 403);
    }

    // Check renewal window (30 days) — license must be active and within 30 days of expiry
    const now = new Date();
    const expiryDate = foundApp.licenseValidUntil ? new Date(foundApp.licenseValidUntil) : null;
    let renewalEligible = false;
    let renewalMessage = '';

    if (!expiryDate || isNaN(expiryDate.getTime())) {
      renewalEligible = false;
      renewalMessage = 'License expiry date is not available.';
    } else {
      const diffMs = expiryDate.getTime() - now.getTime();
      const daysUntilExpiry = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) {
        renewalEligible = false;
        renewalMessage = `This license expired on ${expiryDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} (${Math.abs(daysUntilExpiry)} days ago). Renewal is not permitted for expired licenses. Please apply for a new license.`;
      } else if (daysUntilExpiry > 30) {
        renewalEligible = false;
        renewalMessage = `This license is still valid until ${expiryDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} (${daysUntilExpiry} days remaining). Renewal is available only within the 30-day window before expiry.`;
      } else {
        renewalEligible = true;
        renewalMessage = `License is eligible for renewal. Expires in ${daysUntilExpiry} day(s) on ${expiryDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}.`;
      }
    }

    // Check if a renewal was already submitted
    if (foundApp.renewalApplicationId) {
      renewalEligible = false;
      renewalMessage = `A renewal application (${foundApp.renewalApplicationId}) has already been submitted for this license. Please track its status from the Application Status page.`;
    }

    console.log(`[PLUMBER LICENSE LOOKUP] Found license: ${foundApp.id}, eligible: ${renewalEligible}`);
    return c.json({
      success: true,
      application: foundApp,
      renewalEligible,
      renewalMessage,
    });
  } catch (error) {
    console.log(`[PLUMBER LICENSE LOOKUP] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Citizen submits plumber license renewal
app.post("/make-server-698be164/plumber-license/renew", async (c) => {
  try {
    const body = await c.req.json();
    const { originalApplicationId, licenseNumber, citizenId, updatedAddress } = body;
    console.log(`[PLUMBER LICENSE RENEWAL] Renewal request for license ${licenseNumber} (original app: ${originalApplicationId})`);

    if (!originalApplicationId || !licenseNumber) {
      return c.json({ success: false, error: 'Missing originalApplicationId or licenseNumber' }, 400);
    }

    // Fetch the original approved application
    const originalApp = await kv.get(`plumber_license:${originalApplicationId}`);
    if (!originalApp) {
      return c.json({ success: false, error: 'Original application not found' }, 404);
    }
    if (originalApp.status !== 'approved' || !originalApp.licenseNumber) {
      return c.json({ success: false, error: 'Original application is not an approved license' }, 400);
    }

    const random = Math.floor(1000 + Math.random() * 9000);
    const renewalId = `PLR-REN-${new Date().getFullYear()}-${String(random).padStart(4, '0')}`;
    const now = new Date().toISOString();

    // Create renewal application carrying forward all details from the original
    const renewalApp: any = {
      id: renewalId,
      applicationNo: renewalId,
      applicationType: 'plumber_license',
      renewalOf: originalApplicationId,
      originalLicenseNumber: licenseNumber,
      isRenewal: true,
      registrationType: originalApp.registrationType || 'individual',
      status: 'submitted',
      submittedAt: now,
      updatedAt: now,
      district: originalApp.district || '',
      ulb: originalApp.ulb || '',
      financialYear: '2025-2026',
      registrationFees: '1000',
      citizenId: citizenId || originalApp.citizenId || '',
      applicantName: originalApp.applicantName || '',
      documents: originalApp.documents || {},
      workflow: {
        currentStep: 'caseworker_review',
        steps: [{
          step: 'renewal_submitted',
          actor: 'citizen',
          timestamp: now,
          status: 'completed',
          comment: `Renewal of license ${licenseNumber} (original: ${originalApplicationId})`
        }]
      },
    };

    // Copy individual fields
    if (originalApp.registrationType === 'individual' || !originalApp.registrationType) {
      renewalApp.plumberName = originalApp.plumberName || '';
      renewalApp.addressDistrict = originalApp.addressDistrict || '';
      renewalApp.city = originalApp.city || '';
      renewalApp.street = originalApp.street || '';
      renewalApp.wardNo = originalApp.wardNo || '';
      renewalApp.pincode = originalApp.pincode || '';
      renewalApp.mobileNumber = originalApp.mobileNumber || '';
      renewalApp.qualification = originalApp.qualification || '';
      renewalApp.yearOfExperience = originalApp.yearOfExperience || '';

      // Apply updated address fields if provided
      if (updatedAddress) {
        if (updatedAddress.street) renewalApp.street = updatedAddress.street;
        if (updatedAddress.wardNo) renewalApp.wardNo = updatedAddress.wardNo;
        if (updatedAddress.city) renewalApp.city = updatedAddress.city;
        if (updatedAddress.pincode) renewalApp.pincode = updatedAddress.pincode;
        renewalApp.addressUpdated = true;
      }
    }

    // Copy contractor fields
    if (originalApp.registrationType === 'contractor') {
      renewalApp.firmName = originalApp.firmName || '';
      renewalApp.typeOfFirm = originalApp.typeOfFirm || '';
      renewalApp.officeAddress = originalApp.officeAddress || '';
      renewalApp.contDistrict = originalApp.contDistrict || '';
      renewalApp.taluk = originalApp.taluk || '';
      renewalApp.pincode = originalApp.pincode || '';
      renewalApp.mobileNumber = originalApp.mobileNumber || '';
      renewalApp.emailId = originalApp.emailId || '';
      renewalApp.panNumber = originalApp.panNumber || '';
      renewalApp.gstNumber = originalApp.gstNumber || '';
      renewalApp.authFullName = originalApp.authFullName || '';
      renewalApp.authDesignation = originalApp.authDesignation || '';
      renewalApp.authMobile = originalApp.authMobile || '';
      renewalApp.authEmail = originalApp.authEmail || '';

      // Apply updated address fields if provided
      if (updatedAddress) {
        if (updatedAddress.officeAddress) renewalApp.officeAddress = updatedAddress.officeAddress;
        if (updatedAddress.pincode) renewalApp.pincode = updatedAddress.pincode;
        renewalApp.addressUpdated = true;
      }
    }

    // Save renewal application
    await kv.set(`plumber_license:${renewalId}`, renewalApp);

    // Add to caseworker plumber license queue
    const cwQueue = await kv.get('caseworker:plumber_license_queue') || [];
    if (!cwQueue.includes(renewalId)) {
      cwQueue.push(renewalId);
    }
    await kv.set('caseworker:plumber_license_queue', cwQueue);

    // Add to citizen's application mapping so my-applications returns it
    const citizenMapping = await kv.get(`citizen:${renewalApp.citizenId}:plumber_license_apps`) || [];
    if (!citizenMapping.includes(renewalId)) {
      citizenMapping.push(renewalId);
      await kv.set(`citizen:${renewalApp.citizenId}:plumber_license_apps`, citizenMapping);
    }

    // Track renewal on original app
    originalApp.renewalApplicationId = renewalId;
    originalApp.renewalSubmittedAt = now;
    await kv.set(`plumber_license:${originalApplicationId}`, originalApp);

    console.log(`[PLUMBER LICENSE RENEWAL] Created renewal ${renewalId} for license ${licenseNumber}`);
    return c.json({
      success: true,
      applicationId: renewalId,
      message: `Renewal application ${renewalId} created and sent to Caseworker for review.`
    });
  } catch (error) {
    console.log(`[PLUMBER LICENSE RENEWAL] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get plumber license RENEWAL applications for caseworker
app.get("/make-server-698be164/plumber-license/caseworker/renewal-applications", async (c) => {
  try {
    console.log("[PLUMBER LICENSE CW RENEWAL] Fetching caseworker renewal applications");

    const allPlumberApps = await kv.getByPrefix('plumber_license:');
    console.log(`[PLUMBER LICENSE CW RENEWAL] Found ${allPlumberApps.length} total plumber license apps`);

    const applications: any[] = [];

    for (const plApp of allPlumberApps) {
      if (plApp && plApp.id && plApp.isRenewal === true) {
        // Tier 1: Has caseworker workflow data
        const hasCWWorkflow = plApp.workflow?.caseworker && plApp.workflow.caseworker.status !== 'not_started';

        // Tier 2: Currently at caseworker stage
        const isAtCWStage = plApp.status === 'submitted' || plApp.status === 'sentToCaseworker';

        // Tier 3: All downstream statuses (app has passed through caseworker)
        const hasPassedCW = plApp.status === 'sentToFieldEngineer' ||
          plApp.status === 'sentToCommissioner' ||
          plApp.status === 'pendingPayment' ||
          plApp.status === 'paymentCompleted' ||
          plApp.status === 'approved' ||
          plApp.status === 'rejected' ||
          plApp.status === 'sentBackToCitizen';

        const shouldInclude = hasCWWorkflow || isAtCWStage || hasPassedCW;

        console.log(`[PLUMBER LICENSE CW RENEWAL] App ${plApp.id}: status=${plApp.status}, include=${!!shouldInclude}`);

        if (shouldInclude && !applications.find((a: any) => a.id === plApp.id)) {
          applications.push(plApp);
        }
      }
    }

    applications.sort((a: any, b: any) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
    console.log(`[PLUMBER LICENSE CW RENEWAL] Returning ${applications.length} renewal applications`);
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`[PLUMBER LICENSE CW RENEWAL] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Seed a demo approved plumber license into KV (idempotent)
app.post("/make-server-698be164/plumber-license/seed-demo", async (c) => {
  try {
    const body = await c.req.json();
    const demoApp = body?.demoApplication;
    if (!demoApp || !demoApp.id) {
      return c.json({ success: false, error: 'Missing demoApplication or id' }, 400);
    }

    const existing = await kv.get(`plumber_license:${demoApp.id}`);
    if (existing) {
      // Reset expiry and clear any previous renewal link so the demo is always eligible
      const updated = { ...existing, licenseValidUntil: demoApp.licenseValidUntil };
      delete updated.renewalApplicationId;
      delete updated.renewalSubmittedAt;
      await kv.set(`plumber_license:${demoApp.id}`, updated);
      console.log(`[PLUMBER LICENSE SEED] Demo license ${demoApp.id} already exists, reset for renewal testing`);
      return c.json({ success: true, seeded: false, message: 'Reset for renewal' });
    }

    // Persist the demo approved license
    await kv.set(`plumber_license:${demoApp.id}`, demoApp);

    // Also add to citizen's application list so my-applications picks it up
    const citizenId = demoApp.citizenId || demoApp.mobileNumber || '';
    if (citizenId) {
      const citizenQueue = await kv.get(`citizen:${citizenId}:plumber_license_apps`) || [];
      if (!citizenQueue.includes(demoApp.id)) {
        citizenQueue.push(demoApp.id);
        await kv.set(`citizen:${citizenId}:plumber_license_apps`, citizenQueue);
      }
    }

    console.log(`[PLUMBER LICENSE SEED] Seeded demo license ${demoApp.id} for citizen ${citizenId}`);
    return c.json({ success: true, seeded: true, message: `Demo license ${demoApp.id} created` });
  } catch (error) {
    console.log(`[PLUMBER LICENSE SEED] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// ULB ADMIN - TARIFF RATE CONFIGURATION
// ========================================

// Get all tariff rates
app.get("/make-server-698be164/ulb-admin/tariff-rates", async (c) => {
  try {
    console.log("[TARIFF] Fetching all tariff rates");
    const tariffData = await kv.get('ulb_admin:tariff_rates');
    const rates = tariffData || [];
    console.log(`[TARIFF] Returning ${rates.length} tariff rates`);
    return c.json({ success: true, rates });
  } catch (error) {
    console.log(`[TARIFF] Error fetching tariff rates: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Save (create/update) a tariff rate or configuration
app.post("/make-server-698be164/ulb-admin/tariff-rates", async (c) => {
  try {
    const body = await c.req.json();
    const { rate } = body;
    console.log(`[TARIFF] Saving tariff rate/config`);
    if (!rate) {
      return c.json({ success: false, error: 'Missing rate object in request body' }, 400);
    }
    // Validate: must have either new config format (ulbType) or old format (connectionType + pipeSize)
    const isNewConfigFormat = !!rate.ulbType;
    const isOldRateFormat = !!rate.connectionType && !!rate.pipeSize;
    if (!isNewConfigFormat && !isOldRateFormat) {
      return c.json({ success: false, error: 'Missing required tariff rate fields' }, 400);
    }
    const now = new Date().toISOString();
    const existingRates = await kv.get('ulb_admin:tariff_rates') || [];

    if (rate.id) {
      // Update existing or insert if not found
      const idx = existingRates.findIndex((r: any) => r.id === rate.id);
      if (idx === -1) {
        existingRates.push({ ...rate, createdAt: now, updatedAt: now });
        console.log(`[TARIFF] Created config/rate with id ${rate.id}`);
      } else {
        existingRates[idx] = { ...existingRates[idx], ...rate, updatedAt: now };
        console.log(`[TARIFF] Updated config/rate ${rate.id}`);
      }
    } else {
      // Create new
      const newId = `TR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      existingRates.push({ ...rate, id: newId, createdAt: now, updatedAt: now, isActive: rate.isActive !== undefined ? rate.isActive : true });
      console.log(`[TARIFF] Created new tariff rate ${newId}`);
    }

    await kv.set('ulb_admin:tariff_rates', existingRates);
    return c.json({ success: true, message: rate.id ? 'Tariff rate updated' : 'Tariff rate created', rates: existingRates });
  } catch (error) {
    console.log(`[TARIFF] Error saving tariff rate: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a tariff rate
app.post("/make-server-698be164/ulb-admin/tariff-rates/delete", async (c) => {
  try {
    const body = await c.req.json();
    const { rateId } = body;
    console.log(`[TARIFF] Deleting tariff rate: ${rateId}`);
    if (!rateId) {
      return c.json({ success: false, error: 'Missing rateId' }, 400);
    }
    const existingRates = await kv.get('ulb_admin:tariff_rates') || [];
    const filtered = existingRates.filter((r: any) => r.id !== rateId);
    if (filtered.length === existingRates.length) {
      return c.json({ success: false, error: 'Tariff rate not found' }, 404);
    }
    await kv.set('ulb_admin:tariff_rates', filtered);
    console.log(`[TARIFF] Deleted tariff rate ${rateId}`);
    return c.json({ success: true, message: 'Tariff rate deleted', rates: filtered });
  } catch (error) {
    console.log(`[TARIFF] Error deleting tariff rate: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Seed default tariff rates (idempotent)
app.post("/make-server-698be164/ulb-admin/tariff-rates/seed", async (c) => {
  try {
    console.log("[TARIFF] Seeding default tariff rates");
    const existing = await kv.get('ulb_admin:tariff_rates');
    if (existing && existing.length > 0) {
      console.log("[TARIFF] Tariff rates already exist, skipping seed");
      return c.json({ success: true, message: 'Tariff rates already seeded', rates: existing });
    }
    const now = new Date().toISOString();
    const defaultRates = [
      { id: 'TR-DEFAULT-001', connectionType: 'Domestic', pipeSize: '15mm', connectionCharge: 2500, monthlyMinCharge: 150, ratePerKL: 8, securityDeposit: 1000, supervisionCharge: 500, roadCuttingCharge: 1500, isActive: true, effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', createdAt: now, updatedAt: now },
      { id: 'TR-DEFAULT-002', connectionType: 'Domestic', pipeSize: '20mm', connectionCharge: 3500, monthlyMinCharge: 200, ratePerKL: 8, securityDeposit: 1500, supervisionCharge: 750, roadCuttingCharge: 2000, isActive: true, effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', createdAt: now, updatedAt: now },
      { id: 'TR-DEFAULT-003', connectionType: 'Domestic', pipeSize: '25mm', connectionCharge: 5000, monthlyMinCharge: 300, ratePerKL: 10, securityDeposit: 2000, supervisionCharge: 1000, roadCuttingCharge: 2500, isActive: true, effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', createdAt: now, updatedAt: now },
      { id: 'TR-DEFAULT-004', connectionType: 'Commercial', pipeSize: '15mm', connectionCharge: 5000, monthlyMinCharge: 300, ratePerKL: 20, securityDeposit: 2500, supervisionCharge: 1000, roadCuttingCharge: 2000, isActive: true, effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', createdAt: now, updatedAt: now },
      { id: 'TR-DEFAULT-005', connectionType: 'Commercial', pipeSize: '20mm', connectionCharge: 7500, monthlyMinCharge: 500, ratePerKL: 20, securityDeposit: 3500, supervisionCharge: 1500, roadCuttingCharge: 3000, isActive: true, effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', createdAt: now, updatedAt: now },
      { id: 'TR-DEFAULT-006', connectionType: 'Commercial', pipeSize: '25mm', connectionCharge: 10000, monthlyMinCharge: 750, ratePerKL: 25, securityDeposit: 5000, supervisionCharge: 2000, roadCuttingCharge: 4000, isActive: true, effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', createdAt: now, updatedAt: now },
      { id: 'TR-DEFAULT-007', connectionType: 'Industrial', pipeSize: '25mm', connectionCharge: 15000, monthlyMinCharge: 1000, ratePerKL: 35, securityDeposit: 7500, supervisionCharge: 3000, roadCuttingCharge: 5000, isActive: true, effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', createdAt: now, updatedAt: now },
      { id: 'TR-DEFAULT-008', connectionType: 'Industrial', pipeSize: '32mm', connectionCharge: 20000, monthlyMinCharge: 1500, ratePerKL: 35, securityDeposit: 10000, supervisionCharge: 5000, roadCuttingCharge: 7500, isActive: true, effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', createdAt: now, updatedAt: now },
      { id: 'TR-DEFAULT-009', connectionType: 'Industrial', pipeSize: '40mm', connectionCharge: 30000, monthlyMinCharge: 2500, ratePerKL: 40, securityDeposit: 15000, supervisionCharge: 7500, roadCuttingCharge: 10000, isActive: true, effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', createdAt: now, updatedAt: now },
      { id: 'TR-DEFAULT-010', connectionType: 'Institutional', pipeSize: '20mm', connectionCharge: 4000, monthlyMinCharge: 250, ratePerKL: 12, securityDeposit: 2000, supervisionCharge: 750, roadCuttingCharge: 2000, isActive: true, effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', createdAt: now, updatedAt: now },
    ];
    await kv.set('ulb_admin:tariff_rates', defaultRates);
    console.log(`[TARIFF] Seeded ${defaultRates.length} default tariff rates`);
    return c.json({ success: true, message: 'Default tariff rates seeded', rates: defaultRates });
  } catch (error) {
    console.log(`[TARIFF] Error seeding tariff rates: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// METER MANAGEMENT - APPROVED PLUMBERS LIST
// ========================================

// Get approved plumber licenses (for bill collector assignment)
app.get("/make-server-698be164/meter-management/approved-plumbers", async (c) => {
  try {
    console.log("[METER] Fetching approved plumber licenses");
    const allPlumberApps = await kv.getByPrefix('plumber_license:');
    
    const approvedStatuses = ['approved', 'certificate_issued', 'license_active', 'payment_completed', 'commissioner_approved'];
    const approved = allPlumberApps.filter((app: any) => {
      return approvedStatuses.includes(app.status) || 
        (app.status && app.status.includes('approved')) ||
        (app.status && app.status.includes('certificate'));
    });

    const contractors: any[] = [];
    const individuals: any[] = [];

    for (const app of approved) {
      const regType = app.registrationType || (app.firmName ? 'contractor' : 'individual');
      if (regType === 'contractor') {
        contractors.push({
          id: app.id,
          applicationNo: app.applicationNo || app.id,
          firmName: app.firmName || 'N/A',
          typeOfFirm: app.typeOfFirm || 'N/A',
          officeAddress: app.officeAddress || 'N/A',
          district: app.contDistrict || app.district || 'N/A',
          taluk: app.taluk || 'N/A',
          pincode: app.pincode || 'N/A',
          mobile: app.mobileNumber || 'N/A',
          email: app.emailId || 'N/A',
          panNumber: app.panNumber || 'N/A',
          gstNumber: app.gstNumber || 'N/A',
          authFullName: app.authFullName || 'N/A',
          authDesignation: app.authDesignation || 'N/A',
          authMobile: app.authMobile || 'N/A',
          authEmail: app.authEmail || 'N/A',
          status: app.status,
          registrationType: 'contractor',
        });
      } else {
        individuals.push({
          id: app.id,
          applicationNo: app.applicationNo || app.id,
          plumberName: app.plumberName || app.applicantName || 'N/A',
          district: app.addressDistrict || app.district || 'N/A',
          city: app.city || 'N/A',
          street: app.street || 'N/A',
          wardNo: app.wardNo || 'N/A',
          pincode: app.pincode || 'N/A',
          mobile: app.mobileNumber || 'N/A',
          qualification: app.qualification || 'N/A',
          yearOfExperience: app.yearOfExperience || 'N/A',
          status: app.status,
          registrationType: 'individual',
        });
      }
    }

    console.log(`[METER] Found ${contractors.length} contractors, ${individuals.length} individual plumbers`);
    return c.json({ success: true, contractors, individuals });
  } catch (error) {
    console.log(`[METER] Error fetching approved plumbers: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// METER MANAGEMENT - BILL COLLECTOR ENDPOINTS
// ========================================

// Get all bill collectors
app.get("/make-server-698be164/meter-management/bill-collectors", async (c) => {
  try {
    console.log("[METER] Fetching all bill collectors");
    const collectors = await kv.get('meter_management:bill_collectors') || [];
    console.log(`[METER] Returning ${collectors.length} bill collectors`);
    return c.json({ success: true, collectors });
  } catch (error) {
    console.log(`[METER] Error fetching bill collectors: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create/update a bill collector
app.post("/make-server-698be164/meter-management/bill-collectors", async (c) => {
  try {
    const body = await c.req.json();
    const { collector } = body;
    if (!collector) {
      return c.json({ success: false, error: 'Missing collector object' }, 400);
    }
    const now = new Date().toISOString();
    const existing = await kv.get('meter_management:bill_collectors') || [];

    if (collector.id) {
      const idx = existing.findIndex((r: any) => r.id === collector.id);
      if (idx === -1) {
        existing.push({ ...collector, createdAt: now, updatedAt: now });
        console.log(`[METER] Created bill collector with id ${collector.id}`);
      } else {
        existing[idx] = { ...existing[idx], ...collector, updatedAt: now };
        console.log(`[METER] Updated bill collector ${collector.id}`);
      }
    } else {
      const newId = `BC-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      existing.push({ ...collector, id: newId, createdAt: now, updatedAt: now });
      console.log(`[METER] Created new bill collector ${newId}`);
    }

    await kv.set('meter_management:bill_collectors', existing);
    return c.json({ success: true, message: 'Bill collector saved', collectors: existing });
  } catch (error) {
    console.log(`[METER] Error saving bill collector: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a bill collector
app.post("/make-server-698be164/meter-management/bill-collectors/delete", async (c) => {
  try {
    const body = await c.req.json();
    const { collectorId } = body;
    if (!collectorId) {
      return c.json({ success: false, error: 'Missing collectorId' }, 400);
    }
    const existing = await kv.get('meter_management:bill_collectors') || [];
    const filtered = existing.filter((r: any) => r.id !== collectorId);
    if (filtered.length === existing.length) {
      return c.json({ success: false, error: 'Bill collector not found' }, 404);
    }
    await kv.set('meter_management:bill_collectors', filtered);
    console.log(`[METER] Deleted bill collector ${collectorId}`);
    return c.json({ success: true, message: 'Bill collector deleted', collectors: filtered });
  } catch (error) {
    console.log(`[METER] Error deleting bill collector: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// METER MANAGEMENT - WARD ASSIGNMENT ENDPOINTS
// ========================================

// Get all ward assignments
app.get("/make-server-698be164/meter-management/ward-assignments", async (c) => {
  try {
    console.log("[METER] Fetching all ward assignments");
    const assignments = await kv.get('meter_management:ward_assignments') || [];
    console.log(`[METER] Returning ${assignments.length} ward assignments`);
    return c.json({ success: true, assignments });
  } catch (error) {
    console.log(`[METER] Error fetching ward assignments: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create/update a ward assignment
app.post("/make-server-698be164/meter-management/ward-assignments", async (c) => {
  try {
    const body = await c.req.json();
    const { assignment } = body;
    if (!assignment) {
      return c.json({ success: false, error: 'Missing assignment object' }, 400);
    }
    const now = new Date().toISOString();
    const existing = await kv.get('meter_management:ward_assignments') || [];

    if (assignment.id) {
      const idx = existing.findIndex((r: any) => r.id === assignment.id);
      if (idx === -1) {
        existing.push({ ...assignment, createdAt: now, updatedAt: now });
        console.log(`[METER] Created ward assignment with id ${assignment.id}`);
      } else {
        existing[idx] = { ...existing[idx], ...assignment, updatedAt: now };
        console.log(`[METER] Updated ward assignment ${assignment.id}`);
      }
    } else {
      const newId = `WA-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      existing.push({ ...assignment, id: newId, createdAt: now, updatedAt: now });
      console.log(`[METER] Created new ward assignment ${newId}`);
    }

    await kv.set('meter_management:ward_assignments', existing);
    return c.json({ success: true, message: 'Ward assignment saved', assignments: existing });
  } catch (error) {
    console.log(`[METER] Error saving ward assignment: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a ward assignment
app.post("/make-server-698be164/meter-management/ward-assignments/delete", async (c) => {
  try {
    const body = await c.req.json();
    const { assignmentId } = body;
    if (!assignmentId) {
      return c.json({ success: false, error: 'Missing assignmentId' }, 400);
    }
    const existing = await kv.get('meter_management:ward_assignments') || [];
    const filtered = existing.filter((r: any) => r.id !== assignmentId);
    if (filtered.length === existing.length) {
      return c.json({ success: false, error: 'Ward assignment not found' }, 404);
    }
    await kv.set('meter_management:ward_assignments', filtered);
    console.log(`[METER] Deleted ward assignment ${assignmentId}`);
    return c.json({ success: true, message: 'Ward assignment deleted', assignments: filtered });
  } catch (error) {
    console.log(`[METER] Error deleting ward assignment: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// BILL COLLECTOR MOBILE APP ENDPOINTS
// ========================================

// Login - authenticate bill collector by phone number
app.post("/make-server-698be164/bill-collector/login", async (c) => {
  try {
    const body = await c.req.json();
    const { phone } = body;
    if (!phone) {
      return c.json({ success: false, error: 'Missing phone number' }, 400);
    }
    console.log(`[BC LOGIN] Authenticating bill collector with phone: ${phone}`);

    // ── Demo credentials auto-seed ─────────────────────────────────────
    // Demo phone: 9000000001 → auto-provisions Rahul M S with approved wards
    const DEMO_PHONE = '9000000001';
    const DEMO_BC_ID = 'BC-DEMO-001';
    const DEMO_WA_ID = 'WA-DEMO-001';

    if (phone === DEMO_PHONE) {
      const now = new Date().toISOString();
      let seedCollectors = await kv.get('meter_management:bill_collectors') || [];
      let demoCollector = seedCollectors.find((bc: any) => bc.bcPhoneNo === DEMO_PHONE);

      if (!demoCollector) {
        demoCollector = {
          id: DEMO_BC_ID,
          billCollectorId: 'BCKM-2025-0001',
          district: 'Dharwad',
          ulb: 'Hubballi-Dharwad (HDMC)',
          ulbType: 'City Corporation',
          zone: 'Zone A',
          authorityType: 'Municipal Corporation',
          plumberType: 'individual',
          selectedPlumberId: '',
          selectedPlumberName: '',
          plumberDetails: null,
          bcFullName: 'Rahul M S',
          bcDateOfBirth: '1990-05-15',
          bcAddress: '#23, Gandhi Nagar, 2nd Cross',
          bcDistrict: 'Dharwad',
          bcCity: 'Hubballi',
          bcState: 'Karnataka',
          bcPincode: '580030',
          bcDesignation: 'Bill Collector',
          bcEmployeeType: 'Permanent',
          bcPhoneNo: DEMO_PHONE,
          bcEmail: 'rahul.ms@example.com',
          bcActive: true,
          bcSupportingDoc: '',
          bcPhotoCopy: '',
          status: 'Active',
          createdAt: now,
          updatedAt: now,
        };
        seedCollectors.push(demoCollector);
        await kv.set('meter_management:bill_collectors', seedCollectors);
        console.log('[BC LOGIN] Seeded demo bill collector: Rahul M S');
      }

      // Ensure approved ward assignment exists
      let seedAssignments = await kv.get('meter_management:ward_assignments') || [];
      let demoAssignment = seedAssignments.find((a: any) => a.id === DEMO_WA_ID);

      if (!demoAssignment) {
        demoAssignment = {
          id: DEMO_WA_ID,
          billCollectorId: 'BCKM-2025-0001',
          billCollectorName: 'Rahul M S',
          billCollectorRecordId: DEMO_BC_ID,
          wardNumbers: ['Ward 25', 'Ward 26'],
          billingDays: 'Mon-Sat',
          billingStartDate: '2025-01-01',
          billingEndDate: '2025-12-31',
          billingMachineNo: 'MCH-1024',
          assetId: 'AST-7890',
          effectiveDate: '2025-01-01',
          remarks: 'Demo ward assignment for testing',
          status: 'Approved',
          assignedDate: now,
          createdAt: now,
          updatedAt: now,
        };
        seedAssignments.push(demoAssignment);
        await kv.set('meter_management:ward_assignments', seedAssignments);
        console.log('[BC LOGIN] Seeded demo ward assignment: Ward 25 & Ward 26 (Approved)');
      } else if (demoAssignment.status !== 'Approved') {
        demoAssignment.status = 'Approved';
        demoAssignment.updatedAt = now;
        const sidx = seedAssignments.findIndex((a: any) => a.id === DEMO_WA_ID);
        if (sidx >= 0) seedAssignments[sidx] = demoAssignment;
        await kv.set('meter_management:ward_assignments', seedAssignments);
        console.log('[BC LOGIN] Updated demo ward assignment status to Approved');
      }

      // Seed/refresh demo tap-connection applications for Ward 25 & Ward 26
      // Always overwrite to ensure latest fields (e.g. lastMeterReading) are present
      {
        const demoApps = [
          {
            id: 'demo_bc_app_1',
            applicationNo: 'TAP-2025-W25-001',
            rrNumber: '234354',
            status: 'approved',
            applicantDetails: { applicantName: 'Ramesh A', mobileNumber: '9876500001' },
            propertyDetails: { district: 'Dharwad', ulb: 'Hubballi-Dharwad (HDMC)', ulbType: 'City Corporation', ward: 'Ward 25', address: '#12 MG Road, Hubballi' },
            connectionDetails: { connectionType: 'Domestic', rrNumber: '234354' },
            meterDetails: { meterCategory: 'Meter', meterStatus: 'Active', meterInstalledDate: '2024-12-10', meterNumber: 'MTR-W25-10042', lastMeterReading: 4523 },
            createdAt: now, updatedAt: now,
          },
          {
            id: 'demo_bc_app_2',
            applicationNo: 'TAP-2025-W25-002',
            rrNumber: '325455',
            status: 'approved',
            applicantDetails: { applicantName: 'S Sachin', mobileNumber: '9876500002' },
            propertyDetails: { district: 'Dharwad', ulb: 'Hubballi-Dharwad (HDMC)', ulbType: 'City Corporation', ward: 'Ward 25', address: '#45 JC Nagar, Hubballi' },
            connectionDetails: { connectionType: 'Domestic', rrNumber: '325455' },
            meterDetails: { meterCategory: 'Meter', meterStatus: 'Active', meterInstalledDate: '2024-11-20', meterNumber: 'MTR-W25-10078', lastMeterReading: 3187 },
            createdAt: now, updatedAt: now,
          },
          {
            id: 'demo_bc_app_3',
            applicationNo: 'TAP-2025-W25-003',
            rrNumber: '524131',
            status: 'approved',
            applicantDetails: { applicantName: 'Mahaveer', mobileNumber: '9876500003' },
            propertyDetails: { district: 'Dharwad', ulb: 'Hubballi-Dharwad (HDMC)', ulbType: 'City Corporation', ward: 'Ward 25', address: '#78 Station Road, Hubballi' },
            connectionDetails: { connectionType: 'Non-Domestic', rrNumber: '524131' },
            meterDetails: { meterCategory: 'Meter', meterStatus: 'Active', meterInstalledDate: '2024-10-05', meterNumber: 'MTR-W25-10103', lastMeterReading: 7842 },
            createdAt: now, updatedAt: now,
          },
          {
            id: 'demo_bc_app_4',
            applicationNo: 'TAP-2025-W25-004',
            rrNumber: '452421',
            status: 'approved',
            applicantDetails: { applicantName: 'Shanti V', mobileNumber: '9876500004' },
            propertyDetails: { district: 'Dharwad', ulb: 'Hubballi-Dharwad (HDMC)', ulbType: 'City Corporation', ward: 'Ward 25', address: '#9 Industrial Area, Hubballi' },
            connectionDetails: { connectionType: 'Industries', rrNumber: '452421' },
            meterDetails: { meterCategory: 'Meter', meterStatus: 'Active', meterInstalledDate: '2024-09-15', meterNumber: 'MTR-W25-10215', lastMeterReading: 12056 },
            createdAt: now, updatedAt: now,
          },
          {
            id: 'demo_bc_app_5',
            applicationNo: 'TAP-2025-W26-001',
            rrNumber: '342454',
            status: 'approved',
            applicantDetails: { applicantName: 'M Sudha', mobileNumber: '9876500005' },
            propertyDetails: { district: 'Dharwad', ulb: 'Hubballi-Dharwad (HDMC)', ulbType: 'City Corporation', ward: 'Ward 26', address: '#33 College Road, Dharwad' },
            connectionDetails: { connectionType: 'Commercial', rrNumber: '342454' },
            meterDetails: { meterCategory: 'Meter', meterStatus: 'Active', meterInstalledDate: '2024-08-25', meterNumber: 'MTR-W26-10051', lastMeterReading: 5391 },
            createdAt: now, updatedAt: now,
          },
        ];

        for (const dApp of demoApps) {
          await kv.set(`application:${dApp.id}`, dApp);
        }
        console.log('[BC LOGIN] Seeded 5 demo tap-connection applications for Ward 25 & Ward 26');
      }
    }
    // ── End demo auto-seed ─────────────────────────────────────────────

    const collectors = await kv.get('meter_management:bill_collectors') || [];
    const collector = collectors.find((bc: any) => bc.bcPhoneNo === phone);
    
    if (!collector) {
      console.log(`[BC LOGIN] No bill collector found with phone ${phone}`);
      return c.json({ success: false, error: 'Mobile number not registered as bill collector' });
    }

    // Get approved ward assignments for this collector
    const assignments = await kv.get('meter_management:ward_assignments') || [];
    const approvedAssignments = assignments.filter((a: any) =>
      a.billCollectorRecordId === collector.id && a.status === 'Approved'
    );

    const wardNumbers: string[] = [];
    for (const a of approvedAssignments) {
      if (a.wardNumbers && Array.isArray(a.wardNumbers)) {
        for (const w of a.wardNumbers) {
          if (!wardNumbers.includes(w)) {
            wardNumbers.push(w);
          }
        }
      }
    }

    console.log(`[BC LOGIN] Collector ${collector.bcFullName} has ${wardNumbers.length} approved wards`);

    return c.json({
      success: true,
      collector: {
        id: collector.id,
        billCollectorId: collector.billCollectorId,
        name: collector.bcFullName,
        phone: collector.bcPhoneNo,
        designation: collector.bcDesignation || '',
        district: collector.district || '',
        ulb: collector.ulb || '',
        ulbType: collector.ulbType || '',
      },
      wards: wardNumbers,
      assignments: approvedAssignments,
    });
  } catch (error) {
    console.log(`[BC LOGIN] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get applications for a ward
app.get("/make-server-698be164/bill-collector/applications/:wardNo", async (c) => {
  try {
    const wardNo = c.req.param('wardNo');
    console.log(`[BC APPS] Fetching applications for ward: ${wardNo}`);

    // Get tap connection applications that belong to this ward
    const allApps = await kv.getByPrefix('application:');
    const wardApps = allApps.filter((app: any) => {
      const appWard = app.propertyDetails?.ward || app.connectionDetails?.ward || '';
      return String(appWard) === String(wardNo);
    });

    // Also get any DCB data already saved for this ward
    const dcbData = await kv.get(`bill_collector:dcb:ward_${wardNo}`) || [];

    console.log(`[BC APPS] Found ${wardApps.length} applications for ward ${wardNo}`);

    const transformedApps = wardApps.map((app: any) => {
      // connectionDetails.propertyType = usage category (domestic, commercial, etc.)
      // connectionDetails.connectionType = metering type (Metered/Non-Metered)
      const rawPropType = app.connectionDetails?.propertyType || '';
      const rawConnType = app.connectionDetails?.connectionType || '';
      // Auto-repair: if propertyType looks like a service name, default to Domestic
      const badValues = ['new-tap-connection', 'water-supply', 'sewerage'];
      const usageCategory = badValues.includes(rawPropType.toLowerCase())
        ? 'Domestic'
        : (rawPropType.charAt(0).toUpperCase() + rawPropType.slice(1));
      const meteringType = (rawConnType === 'Metered' || rawConnType === 'Non-Metered')
        ? rawConnType
        : 'Metered';
      return {
        id: app.id,
        applicationNo: app.applicationNo || app.id,
        rrNumber: app.rrNumber || app.connectionDetails?.rrNumber || '',
        applicantName: app.applicantDetails?.applicantName || 'N/A',
        connectionType: usageCategory,
        meteringType: meteringType,
        district: app.propertyDetails?.district || '',
        ulb: app.propertyDetails?.ulb || '',
        ulbType: app.propertyDetails?.ulbType || '',
        meterCategory: meteringType === 'Non-Metered' ? 'Non-Meter' : (app.meterDetails?.meterCategory || 'Meter'),
        meterStatus: meteringType === 'Non-Metered' ? 'N/A' : (app.meterDetails?.meterStatus || 'Active'),
        meterInstalledDate: app.meterDetails?.meterInstalledDate || '',
        meterNumber: meteringType === 'Non-Metered' ? 'N/A' : (app.meterDetails?.meterNumber || ''),
        lastMeterReading: app.meterDetails?.lastMeterReading ?? 0,
        ward: app.propertyDetails?.ward || app.connectionDetails?.ward || wardNo,
        status: app.status || 'active',
        dcbEntry: dcbData.find((d: any) => d.applicationId === (app.id || app.applicationNo)) || null,
      };
    });

    return c.json({ success: true, applications: transformedApps });
  } catch (error) {
    console.log(`[BC APPS] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Save DCB (Demand Collection Balance) data
app.post("/make-server-698be164/bill-collector/dcb", async (c) => {
  try {
    const body = await c.req.json();
    const { dcbEntry, wardNo } = body;
    if (!dcbEntry || !wardNo) {
      return c.json({ success: false, error: 'Missing dcbEntry or wardNo' }, 400);
    }
    const now = new Date().toISOString();
    const key = `bill_collector:dcb:ward_${wardNo}`;
    const existing = await kv.get(key) || [];

    const idx = existing.findIndex((d: any) => d.applicationId === dcbEntry.applicationId);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...dcbEntry, updatedAt: now };
    } else {
      existing.push({ ...dcbEntry, id: `DCB-${Date.now()}`, createdAt: now, updatedAt: now });
    }

    await kv.set(key, existing);
    console.log(`[BC DCB] Saved DCB for ward ${wardNo}, app ${dcbEntry.applicationId}`);
    return c.json({ success: true, message: 'DCB saved' });
  } catch (error) {
    console.log(`[BC DCB] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Generate Bill for an application
app.post("/make-server-698be164/bill-collector/generate-bill", async (c) => {
  try {
    const body = await c.req.json();
    const { billEntry, wardNo } = body;
    if (!billEntry || !wardNo) {
      return c.json({ success: false, error: 'Missing billEntry or wardNo' }, 400);
    }
    const now = new Date().toISOString();
    const key = `bill_collector:bills:ward_${wardNo}`;
    const existing = await kv.get(key) || [];

    const billId = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const idx = existing.findIndex((b: any) => b.applicationId === billEntry.applicationId);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...billEntry, billId: existing[idx].billId || billId, updatedAt: now, status: 'generated' };
    } else {
      existing.push({ ...billEntry, billId, createdAt: now, updatedAt: now, status: 'generated' });
    }

    await kv.set(key, existing);
    console.log(`[BC BILL] Generated bill ${billId} for ward ${wardNo}, app ${billEntry.applicationId}`);
    return c.json({ success: true, message: 'Bill generated', billId });
  } catch (error) {
    console.log(`[BC BILL] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// CHANGE OF CONNECTION TYPE ENDPOINTS
// ========================================

// Verify RR Number for Change of Connection Type
app.post("/make-server-698be164/change-connection/verify-rr", async (c) => {
  try {
    const body = await c.req.json();
    const { rrNumber } = body;

    if (!rrNumber) {
      return c.json({ success: false, error: "RR Number is required" }, 400);
    }

    console.log(`[CHANGE CONN VERIFY RR] Verifying RR Number: ${rrNumber}`);

    // Check if we have stored RR data from a previous flow
    const existingRrData = await kv.get(`rr:${rrNumber}`);

    // Build RR data with defaults for demo
    const rrData = {
      // Applicant Details
      district: existingRrData?.district || "Dharwad",
      ulb: existingRrData?.ulb || "Hubli-Dharwad",
      ulbType: existingRrData?.ulbType || "CC",

      // Property Details
      ownerName: existingRrData?.ownerName || "Rajesh S",
      doorNumber: existingRrData?.doorNumber || "191",
      wardNumber: existingRrData?.wardNumber || "Ward No.10",
      street: existingRrData?.street || "Ayodhya Nagar",
      address: existingRrData?.address || "4th Cross GV Nagar",
      city: existingRrData?.city || "Hubballi",
      propertyDistrict: existingRrData?.propertyDistrict || "Dharwad",
      state: existingRrData?.state || "Karnataka",
      pincode: existingRrData?.pincode || "580026",
      mobileNo: existingRrData?.mobileNo || "9876543210",

      // Connection Details
      connectionType: existingRrData?.connectionType || "Domestic 1/3\"",
      meterCategory: existingRrData?.meterCategory || "Meter",
      meterStatus: "Active",
      meterInstalledDate: existingRrData?.meterInstalledDate || "12/06/2022",
      schemeName: existingRrData?.schemeName || "Har Ghar Jal",

      // Current Arrears
      currentDemand: 200,
      arrears: 150,
      totalBill: 350
    };

    // Store verified RR data for this flow
    await kv.set(`rr:change-connection:${rrNumber}`, rrData);

    console.log(`[CHANGE CONN VERIFY RR] RR Number verified: ${rrNumber}`);
    return c.json({ success: true, rrData });
  } catch (error) {
    console.log(`[CHANGE CONN VERIFY RR] Error verifying RR Number: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Submit Change of Connection Type application
app.post("/make-server-698be164/change-connection/submit", async (c) => {
  try {
    const body = await c.req.json();
    const {
      rrNumber, citizenId, rrData,
      hasUGDConnection, existingConnectionType, newConnectionType,
      applicationFees, securityDeposit, supportingDocName,
      saveToDigiLocker, arrearDetails, paymentDetails, declarationAccepted
    } = body;

    if (!rrNumber || !citizenId || !rrData || !newConnectionType) {
      return c.json({
        success: false,
        error: "Missing required fields for change of connection type application"
      }, 400);
    }

    if (!declarationAccepted) {
      return c.json({
        success: false,
        error: "Declaration must be accepted before submitting"
      }, 400);
    }

    // Check if arrears exist and payment is required
    const totalBill = arrearDetails?.totalBill || 0;
    if (totalBill > 0 && !paymentDetails) {
      return c.json({
        success: false,
        error: "Outstanding arrears must be cleared before submitting change of connection type application"
      }, 400);
    }

    // Generate unique application ID
    const applicationId = `CHGCON-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    console.log(`[CHANGE CONN] Creating change of connection application: ${applicationId}`);

    const application = {
      id: applicationId,
      type: "changeConnection",
      status: "pending_caseworker",
      currentStage: "caseworker",
      rrNumber,
      citizenId,
      rrData,
      hasUGDConnection,
      existingConnectionType: existingConnectionType || (rrData?.connectionType || ""),
      newConnectionType,
      applicationFees: applicationFees || 0,
      securityDeposit: securityDeposit || 0,
      supportingDocName: supportingDocName || "",
      saveToDigiLocker: saveToDigiLocker || "no",
      arrearDetails: arrearDetails || { currentDemand: 0, arrears: 0, totalBill: 0 },
      arrearPaymentDetails: paymentDetails || null,
      declarationAccepted: true,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workflow: {
        caseworker: { status: "pending", assignedAt: new Date().toISOString() },
        revenueOfficer: { status: "not_started" },
        fieldEngineer: { status: "not_started" },
        commissioner: { status: "not_started" },
        plumber: { status: "not_started" },
        commissionerVerification: { status: "not_started" }
      }
    };

    // Save application
    await kv.set(`application:${applicationId}`, application);

    // Add to caseworker queue (for change requests)
    const caseworkerQueue = await kv.get('caseworker:queue') || [];
    if (!caseworkerQueue.includes(applicationId)) {
      caseworkerQueue.push(applicationId);
    }
    await kv.set('caseworker:queue', caseworkerQueue);

    // Also add to a dedicated change-connection queue for the caseworker
    const changeQueue = await kv.get('caseworker:change-connection:queue') || [];
    if (!changeQueue.includes(applicationId)) {
      changeQueue.push(applicationId);
    }
    await kv.set('caseworker:change-connection:queue', changeQueue);

    // Track citizen's applications
    const citizenApps = await kv.get(`citizen:${citizenId}:applications`) || [];
    if (!citizenApps.includes(applicationId)) {
      citizenApps.push(applicationId);
    }
    await kv.set(`citizen:${citizenId}:applications`, citizenApps);

    console.log(`[CHANGE CONN] Application ${applicationId} created and added to caseworker queue`);

    return c.json({
      success: true,
      applicationId,
      message: 'Change of Connection Type application submitted successfully'
    });
  } catch (error) {
    console.log(`[CHANGE CONN] Error submitting application: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// DCB CORRECTION ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// Fetch DCB details by RR Number (with eligibility checks)
app.post("/make-server-698be164/dcb/fetch-rr", async (c) => {
  try {
    const body = await c.req.json();
    const { rrNumber } = body;

    if (!rrNumber) {
      return c.json({ success: false, error: "RR Number is required" }, 400);
    }

    console.log(`[DCB FETCH] Fetching DCB details for RR: ${rrNumber}`);

    // ── Step 1: Try real lookup from citizen_dcb KV ──
    let dcbData: any = null;
    let dataSource = 'mock';

    const citizenDCB = await kv.get(`citizen_dcb:${rrNumber}`);
    if (citizenDCB && typeof citizenDCB === 'object') {
      dcbData = {
        district: citizenDCB.district || 'N/A',
        ulb: citizenDCB.ulb || 'N/A',
        ulbType: citizenDCB.ulbType || 'N/A',
        connectionType: citizenDCB.connectionType || 'N/A',
        meterCategory: citizenDCB.meterCategory || 'N/A',
        meterStatus: citizenDCB.meterStatus || 'N/A',
        meterInstalledDate: citizenDCB.meterInstalledDate || 'N/A',
        meterNumber: citizenDCB.meterNumber || 'N/A',
        previousReading: citizenDCB.previousReading || '0',
        currentReading: citizenDCB.currentReading || '0',
        billGeneratedDate: citizenDCB.billGeneratedDate || 'N/A',
        billNumber: citizenDCB.billNumber || 'N/A',
        arrears: citizenDCB.arrears ?? 0,
        principleAmount: citizenDCB.principleAmount ?? 0,
        interest: citizenDCB.interest ?? 1,
        interestAmount: citizenDCB.interestAmount ?? 0,
        penalty: citizenDCB.penalty ?? 0,
        totalAmount: citizenDCB.totalAmount ?? 0,
        applicantName: citizenDCB.applicantName || citizenDCB.consumerName || 'N/A',
        applicationNo: citizenDCB.applicationNo || 'N/A',
        ward: citizenDCB.ward || 'N/A',
        paymentStatus: citizenDCB.paymentStatus || 'unpaid',
      };
      dataSource = 'kv';
      console.log(`[DCB FETCH] Found citizen_dcb record for RR: ${rrNumber}`);
    } else {
      // Fallback to demo data for prototype/demo usage
      dcbData = {
        district: "Dharwad",
        ulb: "Hubli-Dharwad",
        ulbType: "CC",
        connectionType: 'Domestic',
        meterCategory: "Meter",
        meterStatus: "Active",
        meterInstalledDate: "12/06/2022",
        meterNumber: "MTR-" + rrNumber,
        previousReading: "1000",
        currentReading: "1500",
        billGeneratedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        billNumber: "BILL-" + rrNumber + "-" + Date.now().toString().slice(-6),
        arrears: 250,
        principleAmount: 300,
        interest: 1,
        interestAmount: 30,
        penalty: 50,
        totalAmount: 630,
        applicantName: "Demo Consumer",
        applicationNo: "APP-" + rrNumber,
        ward: "Ward 1",
        paymentStatus: 'unpaid',
      };
      console.log(`[DCB FETCH] No citizen_dcb found for RR: ${rrNumber}. Using demo fallback.`);
    }

    // ── Step 2: ELIGIBILITY CHECK — Bill must be unpaid ──
    const paymentStatus = (dcbData.paymentStatus || 'unpaid').toLowerCase();
    if (paymentStatus === 'paid' || paymentStatus === 'fully_paid') {
      console.log(`[DCB FETCH] ELIGIBILITY FAIL: Bill for RR ${rrNumber} is already paid (${paymentStatus}).`);
      return c.json({
        success: false,
        error: `This bill (RR: ${rrNumber}) has already been paid (Status: ${paymentStatus}). DCB correction is only allowed for unpaid bills.`,
        eligibilityFailed: true,
        reason: 'bill_already_paid',
      }, 400);
    }

    // ── Step 3: ELIGIBILITY CHECK — Bill must be from current or previous month ──
    const billDateStr = dcbData.billGeneratedDate;
    if (billDateStr && billDateStr !== 'N/A') {
      try {
        let billDate: Date;
        if (billDateStr.includes('/')) {
          const parts = billDateStr.split('/');
          billDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          billDate = new Date(billDateStr);
        }
        if (!isNaN(billDate.getTime())) {
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          const billMonth = billDate.getMonth();
          const billYear = billDate.getFullYear();
          const isCurrentMonth = (billMonth === currentMonth && billYear === currentYear);
          const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          const isPreviousMonth = (billMonth === prevMonth && billYear === prevYear);

          if (!isCurrentMonth && !isPreviousMonth) {
            const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            const msg = `Bill is from ${monthNames[billMonth]} ${billYear}. DCB correction is only permitted for bills generated in the current month (${monthNames[currentMonth]} ${currentYear}) or previous month (${monthNames[prevMonth]} ${prevYear}).`;
            console.log(`[DCB FETCH] ELIGIBILITY FAIL: ${msg}`);
            return c.json({ success: false, error: msg, eligibilityFailed: true, reason: 'bill_outside_correction_window' }, 400);
          }
        }
      } catch (dateErr) {
        console.log(`[DCB FETCH] Could not parse bill date for eligibility: ${billDateStr}. Proceeding.`);
      }
    }

    // ── Step 4: Check for existing open corrections on this RR ──
    const allDCB = await kv.getByPrefix('dcb_correction:');
    const openCorrections = allDCB.filter((item: any) =>
      item && item.rrNumber === rrNumber && item.type === 'dcbCorrection' &&
      item.status !== 'correction_applied' && item.status !== 'ro_rejected' && item.status !== 'rejected'
    );
    const hasOpenCorrection = openCorrections.length > 0;
    let openCorrectionWarning: string | null = null;
    if (hasOpenCorrection) {
      const openIds = openCorrections.map((cc: any) => cc.id).join(', ');
      openCorrectionWarning = `An open DCB correction already exists for this RR number (${openIds}). Please wait for the existing correction to be resolved before submitting a new one.`;
      console.log(`[DCB FETCH] WARNING: Open correction exists for RR ${rrNumber}: ${openIds}`);
    }

    console.log(`[DCB FETCH] DCB data fetched for RR: ${rrNumber} (source: ${dataSource}, eligible: ${!hasOpenCorrection})`);
    return c.json({
      success: true,
      dcbData,
      dataSource,
      eligibility: {
        billUnpaid: true,
        billMonthValid: true,
        eligible: !hasOpenCorrection,
        hasOpenCorrection,
        openCorrectionWarning,
      },
    });
  } catch (error) {
    console.log(`[DCB FETCH] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Forward DCB Correction to Revenue Officer (with validation + duplicate guard + audit log)
app.post("/make-server-698be164/dcb/forward-to-ro", async (c) => {
  try {
    const body = await c.req.json();
    const {
      rrNumber, originalData, correctedData,
      effectiveDate, correctionReason, correctionReasonLabel,
      supportingDocument, caseworkerRemarks,
      caseworkerName, caseworkerId
    } = body;

    if (!rrNumber) {
      return c.json({ success: false, error: "RR Number is required" }, 400);
    }
    if (!correctionReason) {
      return c.json({ success: false, error: "Correction reason is required" }, 400);
    }

    console.log(`[DCB FORWARD] Forwarding DCB correction for RR: ${rrNumber} by ${caseworkerName}`);

    // ── Fix 3: DUPLICATE CORRECTION GUARD ──
    const allExisting = await kv.getByPrefix('dcb_correction:');
    const openForRR = allExisting.filter((item: any) =>
      item && item.rrNumber === rrNumber && item.type === 'dcbCorrection' &&
      item.status !== 'correction_applied' && item.status !== 'ro_rejected' && item.status !== 'rejected'
    );
    if (openForRR.length > 0) {
      const openIds = openForRR.map((cc: any) => cc.id).join(', ');
      console.log(`[DCB FORWARD] BLOCKED: Duplicate correction for RR ${rrNumber}. Open IDs: ${openIds}`);
      return c.json({
        success: false,
        error: `A DCB correction is already in progress for RR: ${rrNumber} (${openIds}). Please resolve the existing correction before submitting a new one.`,
        duplicateBlocked: true,
      }, 409);
    }

    // ── Fix 6: SERVER-SIDE VALIDATION on corrected values ──
    const orig = originalData || {};
    const corr = correctedData || {};

    // Validate: corrected meter reading >= previous reading
    if (corr.currentReading !== undefined && corr.currentReading !== null && corr.currentReading !== '') {
      const correctedReading = parseFloat(String(corr.currentReading).replace(/[^0-9.]/g, ''));
      const previousReading = parseFloat(String(orig.previousReading || '0').replace(/[^0-9.]/g, ''));
      if (!isNaN(correctedReading) && !isNaN(previousReading) && correctedReading < previousReading) {
        console.log(`[DCB FORWARD] VALIDATION FAIL: Corrected reading (${correctedReading}) < previous reading (${previousReading})`);
        return c.json({
          success: false,
          error: `Corrected meter reading (${correctedReading}) cannot be less than the previous reading (${previousReading}).`,
          validationFailed: true,
          field: 'currentReading',
        }, 400);
      }
    }

    // Validate: numeric financial fields must be >= 0
    const numericFields = ['arrears', 'principleAmount', 'penalty'];
    for (const field of numericFields) {
      if (corr[field] !== undefined && corr[field] !== null && corr[field] !== '') {
        const val = parseFloat(String(corr[field]));
        if (isNaN(val) || val < 0) {
          console.log(`[DCB FORWARD] VALIDATION FAIL: ${field} has invalid value: ${corr[field]}`);
          return c.json({
            success: false,
            error: `${field} must be a non-negative number. Got: ${corr[field]}`,
            validationFailed: true,
            field,
          }, 400);
        }
      }
    }

    // Validate: at least one field must actually be changed
    let hasActualChange = false;
    const fieldsToCheck = ['currentReading', 'arrears', 'principleAmount', 'penalty', 'interest'];
    for (const f of fieldsToCheck) {
      if (corr[f] !== undefined && corr[f] !== null && corr[f] !== '' && String(corr[f]) !== String(orig[f] || '')) {
        hasActualChange = true;
        break;
      }
    }
    if (!hasActualChange) {
      console.log(`[DCB FORWARD] VALIDATION FAIL: No actual changes detected in corrected data`);
      return c.json({
        success: false,
        error: 'No changes detected. At least one DCB field must be modified for a correction request.',
        validationFailed: true,
        field: 'none',
      }, 400);
    }

    const now = new Date().toISOString();
    const applicationId = `DCB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // ── Fix 4: Initialize auditLog with creation entry ──
    const dcbCorrectionApp = {
      id: applicationId,
      type: 'dcbCorrection',
      rrNumber,
      originalData,
      correctedData,
      effectiveDate,
      correctionReason,
      correctionReasonLabel: correctionReasonLabel || correctionReason,
      supportingDocument: supportingDocument || null,
      caseworkerRemarks: caseworkerRemarks || '',
      caseworkerName,
      caseworkerId,
      status: 'pending',
      forwardedAt: now,
      createdAt: now,
      updatedAt: now,
      auditLog: [
        {
          action: 'correction_initiated',
          actor: caseworkerName || 'Caseworker',
          role: 'Caseworker',
          remarks: `DCB correction initiated for RR: ${rrNumber}. Reason: ${correctionReasonLabel || correctionReason}. Forwarded to Revenue Officer for review.`,
          timestamp: now,
        },
      ],
      notifications: [
        {
          to: 'revenue_officer',
          message: `New DCB correction ${applicationId} for RR ${rrNumber} submitted by ${caseworkerName || 'Caseworker'} and awaiting your review.`,
          sentAt: now,
        },
      ],
    };

    await kv.set(`dcb_correction:${applicationId}`, dcbCorrectionApp);

    const roQueue = await kv.get('dcb_correction:ro_queue') || [];
    roQueue.push(applicationId);
    await kv.set('dcb_correction:ro_queue', roQueue);

    console.log(`[DCB FORWARD] DCB correction ${applicationId} forwarded to Revenue Officer (validated, audit logged)`);
    return c.json({ success: true, applicationId, message: 'DCB Correction forwarded to Revenue Officer' });
  } catch (error) {
    console.log(`[DCB FORWARD] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get DCB Correction applications for Revenue Officer
app.get("/make-server-698be164/dcb/revenue-officer/applications", async (c) => {
  try {
    console.log('[DCB RO] Fetching DCB correction applications for Revenue Officer');
    const allDCB = await kv.getByPrefix('dcb_correction:');
    const applications = allDCB.filter((item: any) => item && item.id && item.type === 'dcbCorrection');

    applications.sort((a: any, b: any) => {
      return new Date(b.forwardedAt || b.createdAt || 0).getTime() - new Date(a.forwardedAt || a.createdAt || 0).getTime();
    });

    console.log(`[DCB RO] Returning ${applications.length} DCB correction applications`);
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`[DCB RO] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single DCB Correction application
app.get("/make-server-698be164/dcb/application/:id", async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`[DCB APP] Fetching DCB correction: ${id}`);

    const application = await kv.get(`dcb_correction:${id}`);
    if (!application) {
      return c.json({ success: false, error: 'DCB Correction application not found' }, 404);
    }

    return c.json({ success: true, application });
  } catch (error) {
    console.log(`[DCB APP] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Revenue Officer forward/cancel DCB Correction
app.post("/make-server-698be164/dcb/revenue-officer/action", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, action, remarks, roName } = body;

    if (!applicationId || !action) {
      return c.json({ success: false, error: 'Application ID and action are required' }, 400);
    }
    // RO forwards (approve) or cancels (reject) — does NOT approve/reject on merit
    if (action !== 'approve' && action !== 'reject') {
      return c.json({ success: false, error: 'Action must be approve (forward) or reject (cancel)' }, 400);
    }

    console.log(`[DCB RO ACTION] ${action} DCB correction: ${applicationId} by ${roName}`);

    const application = await kv.get(`dcb_correction:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    if (application.status !== 'pending' && application.status !== 'returned_by_commissioner') {
      return c.json({ success: false, error: `Cannot ${action} application with status: ${application.status}` }, 400);
    }

    // ── Bill lock enforcement: prevent action on locked bills ──
    if (application.billLocked) {
      return c.json({ success: false, error: 'This bill has been locked after correction. No further modifications are allowed.' }, 400);
    }

    const now = new Date().toISOString();
    application.auditLog = application.auditLog || [];
    application.notifications = application.notifications || [];

    if (action === 'approve') {
      application.status = 'ro_approved';
      application.roAction = { action: 'forward', remarks: remarks || '', roName, actionDate: now };
      const commQueue = await kv.get('dcb_correction:commissioner_queue') || [];
      if (!commQueue.includes(applicationId)) { commQueue.push(applicationId); await kv.set('dcb_correction:commissioner_queue', commQueue); }
      application.auditLog.push({ action: 'ro_forwarded', actor: roName || 'Revenue Officer', role: 'Revenue Officer', remarks: `Forwarded to Commissioner for approval. ${remarks || ''}`.trim(), timestamp: now });
      application.notifications.push({ to: 'commissioner', message: `DCB Correction ${applicationId} for RR ${application.rrNumber} forwarded by RO ${roName || 'Revenue Officer'} for your approval.`, sentAt: now });
      application.notifications.push({ to: 'caseworker', message: `Your DCB correction ${applicationId} has been forwarded to the Commissioner by Revenue Officer.`, sentAt: now });
    } else {
      application.status = 'ro_rejected';
      application.roAction = { action: 'cancel', remarks: remarks || '', roName, actionDate: now };
      application.auditLog.push({ action: 'ro_cancelled', actor: roName || 'Revenue Officer', role: 'Revenue Officer', remarks: `Correction cancelled by Revenue Officer. ${remarks || ''}`.trim(), timestamp: now });
      application.notifications.push({ to: 'caseworker', message: `DCB Correction ${applicationId} has been cancelled by Revenue Officer. Reason: ${remarks || 'N/A'}`, sentAt: now });
    }
    application.updatedAt = now;
    await kv.set(`dcb_correction:${applicationId}`, application);

    const msg = action === 'approve' ? 'DCB Correction forwarded to Commissioner' : 'DCB Correction cancelled by Revenue Officer';
    console.log(`[DCB RO ACTION] ${msg}: ${applicationId}`);
    return c.json({ success: true, message: msg });
  } catch (error) {
    console.log(`[DCB RO ACTION] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get DCB Correction applications for Commissioner
app.get("/make-server-698be164/dcb/commissioner/applications", async (c) => {
  try {
    console.log('[DCB COMM] Fetching DCB correction applications for Commissioner');
    const allDCB = await kv.getByPrefix('dcb_correction:');
    const applications = allDCB.filter((item: any) =>
      item && item.id && item.type === 'dcbCorrection' &&
      (item.status === 'ro_approved' || item.status === 'correction_applied' || item.status === 'returned_by_commissioner' || item.status === 'rejected')
    );
    applications.sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
    console.log(`[DCB COMM] Returning ${applications.length} DCB correction applications`);
    return c.json({ success: true, applications });
  } catch (error) {
    console.log(`[DCB COMM] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Commissioner approve/return-for-rework/reject DCB Correction
app.post("/make-server-698be164/dcb/commissioner/action", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, action, remarks, commissionerName } = body;
    if (!applicationId || !action) return c.json({ success: false, error: 'Application ID and action required' }, 400);
    // ── Fix 1: Accept 'reject' action in addition to 'approve' and 'return' ──
    if (action !== 'approve' && action !== 'return' && action !== 'reject') {
      return c.json({ success: false, error: 'Action must be approve, return, or reject' }, 400);
    }

    const application = await kv.get(`dcb_correction:${applicationId}`);
    if (!application) return c.json({ success: false, error: 'Application not found' }, 404);
    if (application.status !== 'ro_approved') return c.json({ success: false, error: `Cannot ${action} with status: ${application.status}` }, 400);

    const now = new Date().toISOString();
    application.auditLog = application.auditLog || [];
    application.notifications = application.notifications || [];

    if (action === 'approve') {
      // ── Commissioner Approve ──
      application.commissionerAction = { action: 'approve', remarks: remarks || '', commissionerName, actionDate: now };
      application.auditLog.push({ action: 'commissioner_approved', actor: commissionerName || 'Commissioner', role: 'Commissioner', remarks: remarks || '', timestamp: now });

      const correctedData = application.correctedData || {};
      const originalData = application.originalData || {};
      const rrNumber = application.rrNumber;

      // ── Fix 5: Meter reading-based demand recalculation ──
      const prevReadingStr = String(originalData.previousReading || '0').replace(/[^0-9.]/g, '');
      const corrCurrentReadingStr = String(correctedData.currentReading || originalData.currentReading || '0').replace(/[^0-9.]/g, '');
      const previousReading = parseFloat(prevReadingStr) || 0;
      const currentReading = parseFloat(corrCurrentReadingStr) || 0;
      const unitsConsumed = Math.max(0, currentReading - previousReading);

      // Determine rate per unit from connection type
      const connType = (originalData.connectionType || '').toLowerCase();
      let ratePerUnit = 5; // default domestic
      if (connType.includes('non-domestic') || connType.includes('non domestic')) {
        ratePerUnit = 8;
      } else if (connType.includes('commercial')) {
        ratePerUnit = 10;
      } else if (connType.includes('industr')) {
        ratePerUnit = 12;
      } else if (connType.includes('domestic')) {
        ratePerUnit = 5;
      }

      // Recalculate current demand from meter reading
      const currentDemand = Math.round(unitsConsumed * ratePerUnit * 100) / 100;

      // Financial components
      const correctedArrears = parseFloat(correctedData.arrears) || parseFloat(originalData.arrears) || 0;
      const interestPct = parseFloat(correctedData.interest ?? originalData.interest) || 1;
      const correctedInterestAmt = Math.round(currentDemand * interestPct) / 100;
      const correctedPenalty = parseFloat(correctedData.penalty) || parseFloat(originalData.penalty) || 0;
      const recalculatedTotal = Math.round((currentDemand + correctedArrears + correctedInterestAmt + correctedPenalty) * 100) / 100;

      const billNumber = originalData.billNumber || `BILL-${Date.now()}`;
      const billVersion = (application.billVersion || 0) + 1;

      application.recalculatedDCB = {
        previousReading, currentReading, unitsConsumed, ratePerUnit, currentDemand,
        arrears: correctedArrears, principleAmount: currentDemand, interestPercent: interestPct,
        interestAmount: correctedInterestAmt, penalty: correctedPenalty, totalAmount: recalculatedTotal,
        billNumber, billVersion, regeneratedAt: now, supersedes: `v${billVersion - 1}`,
      };
      application.billVersion = billVersion;
      application.billRegenerated = true;
      application.billRegeneratedAt = now;
      application.auditLog.push({
        action: 'dcb_recalculated', actor: 'System', role: 'System',
        remarks: `DCB recalculated from meter readings. Previous: ${previousReading}, Current: ${currentReading}, Units: ${unitsConsumed}, Rate: Rs.${ratePerUnit}/unit, Demand: Rs.${currentDemand}, Arrears: Rs.${correctedArrears}, Interest: Rs.${correctedInterestAmt}, Penalty: Rs.${correctedPenalty}, Total: Rs.${recalculatedTotal}. Bill v${billVersion}.`,
        timestamp: now,
      });
      application.auditLog.push({ action: 'bill_regenerated', actor: 'System', role: 'System', remarks: `Bill ${billNumber} re-generated with corrected values (v${billVersion}). Same bill number retained.`, timestamp: now });

      // ── Fix 7: Create actual regenerated bill entity in KV ──
      const regeneratedBill: any = {
        id: `${billNumber}:v${billVersion}`,
        billNumber,
        billVersion,
        rrNumber,
        applicantName: originalData.applicantName || application.applicantName || 'N/A',
        applicationNo: originalData.applicationNo || application.applicationNo || 'N/A',
        connectionType: originalData.connectionType || 'N/A',
        district: originalData.district || 'N/A',
        ulb: originalData.ulb || 'N/A',
        ward: originalData.ward || 'N/A',
        meterNumber: originalData.meterNumber || 'N/A',
        previousReading, currentReading, unitsConsumed, ratePerUnit, currentDemand,
        arrears: correctedArrears, interestPercent: interestPct,
        interestAmount: correctedInterestAmt, penalty: correctedPenalty, totalAmount: recalculatedTotal,
        billDate: now,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        billingMonth: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        correctionId: applicationId,
        corrected: true,
        correctedAt: now,
        supersedes: billVersion > 1 ? `${billNumber}:v${billVersion - 1}` : null,
        locked: true,
        lockedAt: now,
        generatedBy: 'System (DCB Correction)',
        approvedBy: commissionerName || 'Commissioner',
        status: 'active',
      };
      await kv.set(`bill:${billNumber}:v${billVersion}`, regeneratedBill);
      // Also store a pointer to the latest version
      await kv.set(`bill_latest:${billNumber}`, regeneratedBill);
      application.auditLog.push({ action: 'bill_entity_created', actor: 'System', role: 'System', remarks: `Bill entity bill:${billNumber}:v${billVersion} persisted in KV store.`, timestamp: now });

      // Update citizen DCB + KMF-25
      if (rrNumber) {
        const citizenDCB = await kv.get(`citizen_dcb:${rrNumber}`);
        if (citizenDCB) {
          Object.assign(citizenDCB, {
            lastCorrectionId: applicationId, lastCorrectedAt: now,
            currentReading: String(currentReading), previousReading: String(previousReading),
            unitsConsumed, currentDemand, arrears: correctedArrears,
            principleAmount: currentDemand, interestAmount: correctedInterestAmt,
            penalty: correctedPenalty, totalAmount: recalculatedTotal,
            latestBillVersion: billVersion, latestBillId: `${billNumber}:v${billVersion}`,
          });
          await kv.set(`citizen_dcb:${rrNumber}`, citizenDCB);
          application.auditLog.push({ action: 'citizen_dcb_updated', actor: 'System', role: 'System', remarks: `Citizen DCB record updated for RR: ${rrNumber}. Demand recalculated from corrected meter reading.`, timestamp: now });
        }
        const kmfEntry = await kv.get(`kmf25:${rrNumber}`);
        if (kmfEntry) {
          Object.assign(kmfEntry, {
            lastCorrectionId: applicationId, lastCorrectedAt: now,
            arrears: correctedArrears, demandAmount: currentDemand, totalDemand: recalculatedTotal,
            latestBillVersion: billVersion,
          });
          await kv.set(`kmf25:${rrNumber}`, kmfEntry);
          application.auditLog.push({ action: 'kmf25_updated', actor: 'System', role: 'System', remarks: `KMF-25 register updated for RR: ${rrNumber}`, timestamp: now });
        }
      }

      application.billLocked = true;
      application.billLockedAt = now;
      application.auditLog.push({ action: 'bill_locked', actor: 'System', role: 'System', remarks: `Corrected bill ${billNumber} v${billVersion} locked. No further modifications allowed.`, timestamp: now });
      application.status = 'correction_applied';
      application.correctionAppliedAt = now;
      application.auditLog.push({ action: 'correction_applied', actor: 'System', role: 'System', remarks: 'DCB correction fully applied. Ticket closed.', timestamp: now });
      application.notifications.push({ to: 'caseworker', message: `DCB Correction ${applicationId} approved by Commissioner. Bill ${billNumber} re-generated (v${billVersion}). New total: Rs.${recalculatedTotal}.`, sentAt: now });
      application.notifications.push({ to: 'citizen', message: `Your water bill for RR ${rrNumber} has been corrected. Revised amount: Rs.${recalculatedTotal}. Bill Number: ${billNumber}.`, sentAt: now });
      application.notifications.push({ to: 'revenue_officer', message: `DCB Correction ${applicationId} for RR ${rrNumber} has been approved by Commissioner and bill re-generated.`, sentAt: now });

      const commQueue = await kv.get('dcb_correction:commissioner_queue') || [];
      await kv.set('dcb_correction:commissioner_queue', commQueue.filter((id: string) => id !== applicationId));
      console.log(`[DCB COMM] Correction applied for ${applicationId}. Units: ${unitsConsumed}, Demand: Rs.${currentDemand}, Total: Rs.${recalculatedTotal}`);

    } else if (action === 'return') {
      // ── Commissioner Send Back to Caseworker ──
      application.status = 'returned_by_commissioner';
      application.commissionerAction = { action: 'return', remarks: remarks || '', commissionerName, actionDate: now };
      application.returnHistory = application.returnHistory || [];
      application.returnHistory.push({ returnedBy: commissionerName || 'Commissioner', remarks: remarks || '', returnedAt: now });
      application.auditLog.push({ action: 'returned_by_commissioner', actor: commissionerName || 'Commissioner', role: 'Commissioner', remarks: remarks || '', timestamp: now });
      const commQueueReturn = await kv.get('dcb_correction:commissioner_queue') || [];
      await kv.set('dcb_correction:commissioner_queue', commQueueReturn.filter((id: string) => id !== applicationId));
      application.notifications.push({ to: 'caseworker', message: `DCB Correction ${applicationId} sent back to you by Commissioner for rework. Remarks: ${remarks || 'N/A'}`, sentAt: now });
      console.log(`[DCB COMM] Returned for rework: ${applicationId}`);

    } else if (action === 'reject') {
      // ── Fix 1: Commissioner Reject ──
      application.status = 'rejected';
      application.commissionerAction = { action: 'reject', remarks: remarks || '', commissionerName, actionDate: now };
      application.rejectedAt = now;
      application.auditLog.push({
        action: 'commissioner_rejected', actor: commissionerName || 'Commissioner', role: 'Commissioner',
        remarks: remarks || 'Rejected by Commissioner', timestamp: now,
      });
      // Remove from commissioner queue
      const commQueueReject = await kv.get('dcb_correction:commissioner_queue') || [];
      await kv.set('dcb_correction:commissioner_queue', commQueueReject.filter((id: string) => id !== applicationId));
      // Notify caseworker and RO
      application.notifications.push({ to: 'caseworker', message: `DCB Correction ${applicationId} has been rejected by Commissioner. Reason: ${remarks || 'N/A'}. This correction request is now closed.`, sentAt: now });
      application.notifications.push({ to: 'revenue_officer', message: `DCB Correction ${applicationId} for RR ${application.rrNumber} rejected by Commissioner.`, sentAt: now });
      console.log(`[DCB COMM] Rejected: ${applicationId}. Reason: ${remarks || 'N/A'}`);
    }

    application.updatedAt = now;
    await kv.set(`dcb_correction:${applicationId}`, application);

    const responseMsg = action === 'approve'
      ? 'Correction approved, DCB recalculated, and bill re-generated'
      : action === 'return'
        ? 'Returned to caseworker for rework'
        : 'DCB Correction rejected';
    return c.json({ success: true, message: responseMsg });
  } catch (error) {
    console.log(`[DCB COMM ACTION] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get DCB Correction audit log
app.get("/make-server-698be164/dcb/audit-log/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const application = await kv.get(`dcb_correction:${id}`);
    if (!application) return c.json({ success: false, error: 'Application not found' }, 404);
    return c.json({ success: true, auditLog: application.auditLog || [], notifications: application.notifications || [] });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get DCB Corrections by caseworker (status tracking)
app.get("/make-server-698be164/dcb/caseworker/my-corrections/:caseworkerId", async (c) => {
  try {
    const caseworkerId = c.req.param('caseworkerId');
    const allDCB = await kv.getByPrefix('dcb_correction:');
    const corrections = allDCB.filter((item: any) => item && item.id && item.type === 'dcbCorrection' && item.caseworkerId === caseworkerId);
    corrections.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return c.json({ success: true, corrections });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Caseworker resubmit DCB Correction after Commissioner return-for-rework
app.post("/make-server-698be164/dcb/caseworker/resubmit", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, correctedData, caseworkerRemarks, caseworkerName, caseworkerId } = body;

    if (!applicationId) return c.json({ success: false, error: 'Application ID is required' }, 400);

    const application = await kv.get(`dcb_correction:${applicationId}`);
    if (!application) return c.json({ success: false, error: 'Application not found' }, 404);
    if (application.status !== 'returned_by_commissioner') {
      return c.json({ success: false, error: `Cannot resubmit. Current status: ${application.status}. Only returned_by_commissioner items can be resubmitted.` }, 400);
    }

    console.log(`[DCB RESUBMIT] Caseworker resubmitting ${applicationId} after commissioner return`);
    const now = new Date().toISOString();

    // ── Validation: corrected reading >= previous reading ──
    const orig = application.originalData || {};
    const corr = correctedData || {};
    if (corr.currentReading !== undefined && corr.currentReading !== null && corr.currentReading !== '') {
      const corrReading = parseFloat(String(corr.currentReading).replace(/[^0-9.]/g, ''));
      const prevReading = parseFloat(String(orig.previousReading || '0').replace(/[^0-9.]/g, ''));
      if (!isNaN(corrReading) && !isNaN(prevReading) && corrReading < prevReading) {
        return c.json({ success: false, error: `Corrected reading (${corrReading}) cannot be less than previous reading (${prevReading}).`, validationFailed: true }, 400);
      }
    }
    // Validate numeric fields >= 0
    for (const field of ['arrears', 'principleAmount', 'penalty']) {
      if (corr[field] !== undefined && corr[field] !== null && corr[field] !== '') {
        const val = parseFloat(String(corr[field]));
        if (isNaN(val) || val < 0) {
          return c.json({ success: false, error: `${field} must be a non-negative number. Got: ${corr[field]}`, validationFailed: true }, 400);
        }
      }
    }

    // Update corrected data with new values
    application.correctedData = { ...(application.correctedData || {}), ...corr };
    application.caseworkerRemarks = caseworkerRemarks || application.caseworkerRemarks || '';
    // Skip RO on resubmission — go directly back to Commissioner (RO already reviewed and forwarded)
    application.status = 'ro_approved';
    application.resubmittedAt = now;
    application.resubmissionCount = (application.resubmissionCount || 0) + 1;
    application.updatedAt = now;

    application.auditLog = application.auditLog || [];
    application.auditLog.push({
      action: 'caseworker_resubmitted',
      actor: caseworkerName || 'Caseworker',
      role: 'Caseworker',
      remarks: `Resubmitted after Commissioner return (attempt #${application.resubmissionCount}). Corrections made per Commissioner's remarks. ${caseworkerRemarks || ''}`.trim(),
      timestamp: now,
    });
    application.auditLog.push({
      action: 'auto_forwarded_to_commissioner',
      actor: 'System',
      role: 'System',
      remarks: 'Resubmission auto-forwarded to Commissioner (RO review already completed in prior cycle).',
      timestamp: now,
    });

    application.notifications = application.notifications || [];
    application.notifications.push({
      to: 'commissioner',
      message: `DCB Correction ${applicationId} has been resubmitted by caseworker with corrections. Ready for your re-review.`,
      sentAt: now,
    });
    application.notifications.push({
      to: 'revenue_officer',
      message: `FYI: DCB Correction ${applicationId} resubmitted by caseworker and auto-forwarded to Commissioner (your prior review stands).`,
      sentAt: now,
    });

    // Add directly to Commissioner queue (skip RO)
    const commQueue = await kv.get('dcb_correction:commissioner_queue') || [];
    if (!commQueue.includes(applicationId)) {
      commQueue.push(applicationId);
      await kv.set('dcb_correction:commissioner_queue', commQueue);
    }

    await kv.set(`dcb_correction:${applicationId}`, application);
    console.log(`[DCB RESUBMIT] ${applicationId} resubmitted (attempt #${application.resubmissionCount}). Auto-forwarded to Commissioner (skipping RO).`);
    return c.json({ success: true, message: 'DCB Correction resubmitted successfully. Auto-forwarded to Commissioner for re-review.' });
  } catch (error) {
    console.log(`[DCB RESUBMIT] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ULB Admin: Fetch RR for DCB Correction (bypasses eligibility — for paid/older bills)
app.post("/make-server-698be164/dcb/ulb-admin/fetch-rr", async (c) => {
  try {
    const body = await c.req.json();
    const { rrNumber, district, ulb } = body;

    if (!rrNumber) return c.json({ success: false, error: "RR Number is required" }, 400);
    if (!district) return c.json({ success: false, error: "District is required" }, 400);
    if (!ulb) return c.json({ success: false, error: "ULB is required" }, 400);

    console.log(`[DCB ULB FETCH] ULB Admin fetching DCB for RR: ${rrNumber}, District: ${district}, ULB: ${ulb}`);

    let dcbData: any = null;
    let dataSource = 'mock';
    let ineligibilityReason: string | null = null;

    const citizenDCB = await kv.get(`citizen_dcb:${rrNumber}`);
    if (citizenDCB && typeof citizenDCB === 'object') {
      dcbData = {
        district: citizenDCB.district || district || 'N/A',
        ulb: citizenDCB.ulb || ulb || 'N/A',
        ulbType: citizenDCB.ulbType || 'N/A',
        connectionType: citizenDCB.connectionType || 'N/A',
        meterCategory: citizenDCB.meterCategory || 'N/A',
        meterStatus: citizenDCB.meterStatus || 'N/A',
        meterInstalledDate: citizenDCB.meterInstalledDate || 'N/A',
        meterNumber: citizenDCB.meterNumber || 'N/A',
        previousReading: citizenDCB.previousReading || '0',
        currentReading: citizenDCB.currentReading || '0',
        billGeneratedDate: citizenDCB.billGeneratedDate || 'N/A',
        billNumber: citizenDCB.billNumber || 'N/A',
        arrears: citizenDCB.arrears ?? 0,
        principleAmount: citizenDCB.principleAmount ?? 0,
        interest: citizenDCB.interest ?? 1,
        interestAmount: citizenDCB.interestAmount ?? 0,
        penalty: citizenDCB.penalty ?? 0,
        totalAmount: citizenDCB.totalAmount ?? 0,
        applicantName: citizenDCB.applicantName || citizenDCB.consumerName || 'N/A',
        applicationNo: citizenDCB.applicationNo || 'N/A',
        ward: citizenDCB.ward || 'N/A',
        paymentStatus: citizenDCB.paymentStatus || 'unpaid',
      };
      dataSource = 'kv';
    } else {
      dcbData = {
        district: district || "Dharwad", ulb: ulb || "Hubli-Dharwad", ulbType: "CC",
        connectionType: 'Domestic', meterCategory: "Meter", meterStatus: "Active",
        meterInstalledDate: "12/06/2022", meterNumber: "MTR-" + rrNumber,
        previousReading: "800", currentReading: "1200",
        billGeneratedDate: "15/10/2025",
        billNumber: "BILL-" + rrNumber + "-" + Date.now().toString().slice(-6),
        arrears: 500, principleAmount: 420, interest: 1, interestAmount: 42,
        penalty: 100, totalAmount: 1062,
        applicantName: "Demo Consumer (Paid)", applicationNo: "APP-" + rrNumber,
        ward: "Ward 5", paymentStatus: 'paid',
      };
    }

    // Determine ineligibility reason
    const paymentStatus = (dcbData.paymentStatus || 'unpaid').toLowerCase();
    if (paymentStatus === 'paid' || paymentStatus === 'fully_paid') {
      ineligibilityReason = 'bill_already_paid';
    }
    const billDateStr = dcbData.billGeneratedDate;
    if (billDateStr && billDateStr !== 'N/A' && !ineligibilityReason) {
      try {
        let billDate: Date;
        if (billDateStr.includes('/')) {
          const parts = billDateStr.split('/');
          billDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else { billDate = new Date(billDateStr); }
        if (!isNaN(billDate.getTime())) {
          const now = new Date();
          const cm = now.getMonth(); const cy = now.getFullYear();
          const bm = billDate.getMonth(); const by = billDate.getFullYear();
          const pm = cm === 0 ? 11 : cm - 1; const py = cm === 0 ? cy - 1 : cy;
          if (!(bm === cm && by === cy) && !(bm === pm && by === py)) {
            ineligibilityReason = 'bill_outside_correction_window';
          }
        }
      } catch (e) { /* ignore */ }
    }

    console.log(`[DCB ULB FETCH] Data fetched for RR: ${rrNumber} (source: ${dataSource}, ineligibility: ${ineligibilityReason || 'none'})`);
    return c.json({ success: true, dcbData, dataSource, ineligibilityReason });
  } catch (error) {
    console.log(`[DCB ULB FETCH] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ULB Admin: Save DCB Correction (elevated authority — paid/older bills)
app.post("/make-server-698be164/dcb/ulb-admin/correction", async (c) => {
  try {
    const body = await c.req.json();
    const { rrNumber, district, ulb, originalData, correctedData, effectiveDate, correctionReason, correctionReasonLabel, ineligibilityReason, adminRemarks, adminName, adminId } = body;

    if (!rrNumber) return c.json({ success: false, error: "RR Number is required" }, 400);
    if (!correctionReason || correctionReason === '__none__') return c.json({ success: false, error: "Correction reason is required" }, 400);
    if (!effectiveDate) return c.json({ success: false, error: "Effective date is required" }, 400);

    const orig = originalData || {};
    const corr = correctedData || {};

    // Validation
    if (corr.currentReading !== undefined && corr.currentReading !== null && corr.currentReading !== '') {
      const cr = parseFloat(String(corr.currentReading).replace(/[^0-9.]/g, ''));
      const pr = parseFloat(String(orig.previousReading || '0').replace(/[^0-9.]/g, ''));
      if (!isNaN(cr) && !isNaN(pr) && cr < pr) return c.json({ success: false, error: `Corrected reading (${cr}) < previous reading (${pr}).`, validationFailed: true }, 400);
    }
    for (const field of ['arrears', 'principleAmount', 'penalty']) {
      if (corr[field] !== undefined && corr[field] !== null && corr[field] !== '') {
        const val = parseFloat(String(corr[field]));
        if (isNaN(val) || val < 0) return c.json({ success: false, error: `${field} must be >= 0. Got: ${corr[field]}`, validationFailed: true }, 400);
      }
    }
    let hasChange = false;
    for (const f of ['currentReading', 'arrears', 'principleAmount', 'penalty']) {
      if (corr[f] !== undefined && corr[f] !== null && corr[f] !== '' && String(corr[f]) !== String(orig[f] || '')) { hasChange = true; break; }
    }
    if (!hasChange) return c.json({ success: false, error: 'No changes detected.', validationFailed: true }, 400);

    const now = new Date().toISOString();
    const applicationId = `ULBDCB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Recalculate
    const prevR = parseFloat(String(orig.previousReading || '0').replace(/[^0-9.]/g, '')) || 0;
    const currR = parseFloat(String(corr.currentReading || orig.currentReading || '0').replace(/[^0-9.]/g, '')) || 0;
    const units = Math.max(0, currR - prevR);
    const ct = (orig.connectionType || '').toLowerCase();
    let rate = 5;
    if (ct.includes('non-domestic') || ct.includes('non domestic')) rate = 8;
    else if (ct.includes('commercial')) rate = 10;
    else if (ct.includes('industr')) rate = 12;
    const demand = Math.round(units * rate * 100) / 100;
    const arr = parseFloat(corr.arrears) || parseFloat(orig.arrears) || 0;
    const intPct = parseFloat(orig.interest) || 1;
    const intAmt = Math.round(demand * intPct) / 100;
    const pen = parseFloat(corr.penalty) || parseFloat(orig.penalty) || 0;
    const total = Math.round((demand + arr + intAmt + pen) * 100) / 100;
    const billNo = orig.billNumber || `BILL-${Date.now()}`;

    const correctionApp: any = {
      id: applicationId, type: 'ulbDcbCorrection', flow: 'ulb_admin',
      rrNumber, district, ulb, originalData: orig, correctedData: corr,
      effectiveDate, correctionReason,
      correctionReasonLabel: correctionReasonLabel || correctionReason,
      ineligibilityReason: ineligibilityReason || 'elevated_authority',
      adminRemarks: adminRemarks || '', adminName: adminName || 'ULB Admin', adminId: adminId || 'ULB001',
      status: 'correction_applied', createdAt: now, updatedAt: now, correctionAppliedAt: now,
      recalculatedDCB: {
        previousReading: prevR, currentReading: currR, unitsConsumed: units, ratePerUnit: rate, currentDemand: demand,
        arrears: arr, principleAmount: demand, interestPercent: intPct, interestAmount: intAmt, penalty: pen, totalAmount: total,
        billNumber: billNo, billVersion: 1, regeneratedAt: now,
      },
      billRegenerated: true, billRegeneratedAt: now, billVersion: 1, billLocked: true, billLockedAt: now,
      auditLog: [
        { action: 'ulb_admin_correction_initiated', actor: adminName || 'ULB Admin', role: 'ULB Admin', remarks: `ULB-level DCB correction for RR: ${rrNumber}. Reason: ${correctionReasonLabel || correctionReason}. Ineligibility: ${ineligibilityReason || 'elevated authority'}.`, timestamp: now },
        { action: 'dcb_recalculated', actor: 'System', role: 'System', remarks: `Units: ${units}, Rate: Rs.${rate}/unit, Demand: Rs.${demand}, Arrears: Rs.${arr}, Interest: Rs.${intAmt}, Penalty: Rs.${pen}, Total: Rs.${total}.`, timestamp: now },
        { action: 'correction_applied', actor: 'System', role: 'System', remarks: 'ULB Admin correction applied directly. No further approval required.', timestamp: now },
      ],
      notifications: [
        { to: 'commissioner', message: `ULB Admin applied DCB correction ${applicationId} for RR ${rrNumber}. Total: Rs.${total}.`, sentAt: now },
        { to: 'citizen', message: `Your water bill for RR ${rrNumber} has been corrected. Revised: Rs.${total}.`, sentAt: now },
      ],
    };
    await kv.set(`dcb_correction:${applicationId}`, correctionApp);

    // Bill entity
    await kv.set(`bill:${billNo}:v1`, {
      id: `${billNo}:v1`, billNumber: billNo, billVersion: 1, rrNumber,
      applicantName: orig.applicantName || 'N/A', connectionType: orig.connectionType || 'N/A',
      district, ulb, previousReading: prevR, currentReading: currR,
      unitsConsumed: units, ratePerUnit: rate, currentDemand: demand,
      arrears: arr, interestAmount: intAmt, penalty: pen, totalAmount: total,
      billDate: now, correctionId: applicationId, corrected: true, correctedBy: 'ULB Admin',
      locked: true, status: 'active',
    });
    await kv.set(`bill_latest:${billNo}`, { billNumber: billNo, billVersion: 1, totalAmount: total, correctionId: applicationId });

    // Update citizen DCB
    const citizenDCB = await kv.get(`citizen_dcb:${rrNumber}`);
    if (citizenDCB) {
      Object.assign(citizenDCB, {
        lastCorrectionId: applicationId, lastCorrectedAt: now,
        currentReading: String(currR), arrears: arr, principleAmount: demand,
        interestAmount: intAmt, penalty: pen, totalAmount: total,
      });
      await kv.set(`citizen_dcb:${rrNumber}`, citizenDCB);
    }

    console.log(`[DCB ULB CORR] Correction ${applicationId} applied. Total: Rs.${total}`);
    return c.json({ success: true, applicationId, recalculatedTotal: total, message: 'DCB Correction saved and applied successfully.' });
  } catch (error) {
    console.log(`[DCB ULB CORR] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ULB Admin: Get all ULB-level DCB corrections
app.get("/make-server-698be164/dcb/ulb-admin/corrections", async (c) => {
  try {
    const allDCB = await kv.getByPrefix('dcb_correction:');
    const corrections = allDCB.filter((item: any) => item && item.id && item.type === 'ulbDcbCorrection');
    corrections.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return c.json({ success: true, corrections });
  } catch (error) {
    console.log(`[DCB ULB CORR LIST] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ULB Admin: Submit future-cycle DCB adjustment
app.post("/make-server-698be164/dcb/ulb-admin/adjustment", async (c) => {
  try {
    const body = await c.req.json();
    const { rrNumber, billNumber, originalBillData, adjustmentMonth, adjustmentType, adjustmentCategory, adjustmentAmount, reasonCode, reasonLabel, remarks, adminName, adminId } = body;
    if (!rrNumber) return c.json({ success: false, error: 'RR Number required' }, 400);
    if (!adjustmentMonth) return c.json({ success: false, error: 'Adjustment month required' }, 400);
    if (!adjustmentType) return c.json({ success: false, error: 'Adjustment type required' }, 400);
    if (!adjustmentAmount || parseFloat(adjustmentAmount) <= 0) return c.json({ success: false, error: 'Valid amount required' }, 400);
    if (!reasonCode) return c.json({ success: false, error: 'Reason code required' }, 400);

    const now = new Date().toISOString();
    const adjustmentId = `DCBA-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const amt = parseFloat(adjustmentAmount);

    const adjustmentRecord: any = {
      id: adjustmentId, type: 'dcbAdjustment', rrNumber, billNumber: billNumber || 'N/A',
      originalBillData: originalBillData || {}, adjustmentMonth, adjustmentType, adjustmentCategory: adjustmentCategory || 'principal',
      adjustmentAmount: amt, reasonCode, reasonLabel: reasonLabel || reasonCode, remarks: remarks || '',
      adminName: adminName || 'ULB Admin', adminId: adminId || 'ulb-admin',
      status: 'adjustment_posted', createdAt: now, updatedAt: now, adjustmentLocked: true, adjustmentLockedAt: now,
      auditLog: [
        { action: 'adjustment_created', actor: adminName || 'ULB Admin', role: 'ULB Admin', remarks: `Future-cycle adjustment: ${adjustmentType} Rs.${amt} in ${adjustmentCategory} for ${adjustmentMonth}`, timestamp: now },
        { action: 'adjustment_posted', actor: 'System', role: 'System', remarks: `Posted to ${adjustmentMonth}. Historical paid bill unchanged.`, timestamp: now },
        { action: 'running_dcb_recalculated', actor: 'System', role: 'System', remarks: 'Running DCB recalculated.', timestamp: now },
        { action: 'adjustment_locked', actor: 'System', role: 'System', remarks: 'Adjustment entry locked.', timestamp: now },
      ],
      notifications: [
        { to: 'commissioner', message: `ULB Admin posted DCB adjustment ${adjustmentId} for RR ${rrNumber}. ${adjustmentType} Rs.${amt} in ${adjustmentMonth}.`, sentAt: now },
        { to: 'billing_team', message: `Next bill for RR ${rrNumber} will reflect ${adjustmentType} Rs.${amt}.`, sentAt: now },
      ],
    };

    const citizenDCB = await kv.get(`citizen_dcb:${rrNumber}`);
    if (citizenDCB) {
      citizenDCB.pendingAdjustments = citizenDCB.pendingAdjustments || [];
      citizenDCB.pendingAdjustments.push({ adjustmentId, adjustmentMonth, adjustmentType, adjustmentCategory: adjustmentCategory || 'principal', adjustmentAmount: amt, postedAt: now });
      await kv.set(`citizen_dcb:${rrNumber}`, citizenDCB);
      adjustmentRecord.auditLog.push({ action: 'citizen_dcb_updated', actor: 'System', role: 'System', remarks: `Pending adjustment recorded on citizen DCB.`, timestamp: now });
    }
    const kmfEntry = await kv.get(`kmf25:${rrNumber}`);
    if (kmfEntry) {
      kmfEntry.pendingAdjustments = kmfEntry.pendingAdjustments || [];
      kmfEntry.pendingAdjustments.push({ adjustmentId, adjustmentMonth, adjustmentType, adjustmentAmount: amt, postedAt: now });
      await kv.set(`kmf25:${rrNumber}`, kmfEntry);
      adjustmentRecord.auditLog.push({ action: 'kmf25_updated', actor: 'System', role: 'System', remarks: 'KMF-25 updated with pending adjustment.', timestamp: now });
    }

    await kv.set(`dcb_adjustment:${adjustmentId}`, adjustmentRecord);
    console.log(`[DCB ULB ADJ] ${adjustmentId} posted for RR ${rrNumber}`);
    return c.json({ success: true, adjustmentId, message: 'Adjustment posted successfully' });
  } catch (error) {
    console.log(`[DCB ULB ADJ] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ULB Admin: Get all adjustments
app.get("/make-server-698be164/dcb/ulb-admin/adjustments", async (c) => {
  try {
    const allAdj = await kv.getByPrefix('dcb_adjustment:');
    const adjustments = allAdj.filter((item: any) => item && item.id && item.type === 'dcbAdjustment');
    adjustments.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return c.json({ success: true, adjustments });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY DATA ENTRY ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// Submit Legacy Data Entry
app.post("/make-server-698be164/legacy-data/submit", async (c) => {
  try {
    const body = await c.req.json();
    const {
      applicantType, locationDetails, existingConnection,
      financialDetails, billingDetails, headerDetails,
      caseworkerName, caseworkerId
    } = body;

    if (!locationDetails?.fullName) {
      return c.json({ success: false, error: "Full Name is required" }, 400);
    }
    if (!existingConnection?.rrNumber) {
      return c.json({ success: false, error: "RR Number is required" }, 400);
    }

    console.log(`[LEGACY DATA] Submitting legacy data entry for RR: ${existingConnection.rrNumber} by ${caseworkerName}`);

    const applicationId = `LEG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const legacyApp = {
      id: applicationId,
      type: 'legacyDataEntry',
      applicantType,
      locationDetails,
      existingConnection,
      financialDetails: financialDetails || {},
      billingDetails: billingDetails || {},
      headerDetails: headerDetails || { district: 'Dharwad', ulb: 'Hubli-Dharwad', authorityType: 'Board', ulbType: 'CC' },
      caseworkerName,
      caseworkerId,
      status: 'submitted',
      currentStage: 'field_engineer',
      workflow: {
        caseworker: {
          name: caseworkerName,
          id: caseworkerId,
          status: 'submitted',
          timestamp: new Date().toISOString(),
        },
      },
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`legacy_data:${applicationId}`, legacyApp);

    console.log(`[LEGACY DATA] Legacy data entry ${applicationId} submitted successfully`);
    return c.json({ success: true, applicationId, message: 'Legacy Data Entry submitted successfully' });
  } catch (error) {
    console.log(`[LEGACY DATA] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get Legacy Data Applications
app.get("/make-server-698be164/legacy-data/applications", async (c) => {
  try {
    const stage = c.req.query('stage') || null;
    console.log(`[LEGACY DATA] Fetching legacy data applications, stage filter: ${stage}`);

    // Get all keys with prefix legacy_data:
    const allEntries = await kv.getByPrefix('legacy_data:');
    console.log(`[LEGACY DATA] Found ${allEntries?.length || 0} legacy data entries`);

    let applications = allEntries || [];

    // Filter by stage if specified
    if (stage) {
      applications = applications.filter((app: any) => app?.currentStage === stage);
      console.log(`[LEGACY DATA] After stage filter (${stage}): ${applications.length} entries`);
    }

    return c.json({ success: true, applications, total: applications.length });
  } catch (error) {
    console.log(`[LEGACY DATA] Error fetching applications: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single Legacy Data Application by ID
app.get("/make-server-698be164/legacy-data/application/:id", async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`[LEGACY DATA] Fetching legacy data application: ${id}`);

    const application = await kv.get(`legacy_data:${id}`);
    if (!application) {
      return c.json({ success: false, error: 'Legacy data application not found' }, 404);
    }

    return c.json({ success: true, application });
  } catch (error) {
    console.log(`[LEGACY DATA] Error fetching application ${c.req.param('id')}: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Field Engineer Forward Legacy Data to Commissioner
app.post("/make-server-698be164/legacy-data/fe-forward", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, feComments, feName, feId } = body;

    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }
    if (!feComments || feComments.trim().length < 10) {
      return c.json({ success: false, error: 'Field Engineer comments must be at least 10 characters' }, 400);
    }

    console.log(`[LEGACY DATA] FE forwarding ${applicationId} to Commissioner`);

    const application = await kv.get(`legacy_data:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    application.status = 'fe_verified';
    application.currentStage = 'commissioner';
    application.workflow = application.workflow || {};
    application.workflow.fieldEngineer = {
      name: feName || 'Field Engineer',
      id: feId || 'FE001',
      status: 'verified',
      comments: feComments.trim(),
      timestamp: new Date().toISOString(),
    };
    application.updatedAt = new Date().toISOString();

    await kv.set(`legacy_data:${applicationId}`, application);

    console.log(`[LEGACY DATA] ${applicationId} forwarded to Commissioner successfully`);
    return c.json({ success: true, message: 'Application forwarded to Commissioner' });
  } catch (error) {
    console.log(`[LEGACY DATA] Error forwarding to Commissioner: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Commissioner Action on Legacy Data (approve / reject / send_back)
app.post("/make-server-698be164/legacy-data/commissioner-action", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId, action, comments, commissionerName, commissionerId } = body;

    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }
    if (!action || !['approve', 'reject', 'send_back'].includes(action)) {
      return c.json({ success: false, error: 'Valid action (approve/reject/send_back) is required' }, 400);
    }
    if (!comments || comments.trim().length < 10) {
      return c.json({ success: false, error: 'Comments must be at least 10 characters' }, 400);
    }

    console.log(`[LEGACY DATA] Commissioner ${action} on ${applicationId}`);

    const application = await kv.get(`legacy_data:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    application.workflow = application.workflow || {};
    const timestamp = new Date().toISOString();

    if (action === 'approve') {
      const newRRNumber = 'RR-' + Date.now().toString().slice(-8) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      
      application.status = 'approved';
      application.currentStage = 'completed';
      application.newRRNumber = newRRNumber;
      application.workflow.commissioner = {
        name: commissionerName || 'Commissioner',
        id: commissionerId || 'COM001',
        status: 'approved',
        comments: comments.trim(),
        timestamp,
        newRRNumber,
      };
      application.approvedAt = timestamp;
      application.permissionLetter = {
        generatedAt: timestamp,
        newRRNumber,
        dscSigned: true,
        dscSignedBy: commissionerName || 'Commissioner',
        dscSignedAt: timestamp,
        letterNumber: 'KMDS/LEG/' + Date.now().toString().slice(-6),
      };
    } else if (action === 'reject') {
      application.status = 'rejected';
      application.currentStage = 'completed';
      application.workflow.commissioner = {
        name: commissionerName || 'Commissioner',
        id: commissionerId || 'COM001',
        status: 'rejected',
        comments: comments.trim(),
        timestamp,
      };
      application.rejectedAt = timestamp;
    } else if (action === 'send_back') {
      application.status = 'sent_back';
      application.currentStage = 'field_engineer';
      application.workflow.commissioner = {
        name: commissionerName || 'Commissioner',
        id: commissionerId || 'COM001',
        status: 'sent_back',
        comments: comments.trim(),
        timestamp,
      };
      application.sendBackHistory = application.sendBackHistory || [];
      application.sendBackHistory.push({
        sentBackBy: commissionerName || 'Commissioner',
        comments: comments.trim(),
        timestamp,
      });
    }

    application.updatedAt = timestamp;
    await kv.set(`legacy_data:${applicationId}`, application);

    console.log(`[LEGACY DATA] Commissioner ${action} on ${applicationId} completed`);
    return c.json({
      success: true,
      message: action === 'approve' ? 'Application approved. Permission letter generated.' :
               action === 'reject' ? 'Application rejected.' :
               'Application sent back to Field Engineer.',
      newRRNumber: application.newRRNumber || null,
      permissionLetter: application.permissionLetter || null,
    });
  } catch (error) {
    console.log(`[LEGACY DATA] Commissioner action error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Send Legacy Data Permission Letter to Citizen
app.post("/make-server-698be164/legacy-data/send-to-citizen", async (c) => {
  try {
    const body = await c.req.json();
    const { applicationId } = body;

    if (!applicationId) {
      return c.json({ success: false, error: 'Application ID is required' }, 400);
    }

    console.log(`[LEGACY DATA] Sending permission letter to citizen for ${applicationId}`);

    const application = await kv.get(`legacy_data:${applicationId}`);
    if (!application) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    if (application.status !== 'approved') {
      return c.json({ success: false, error: 'Application must be approved before sending to citizen' }, 400);
    }

    application.status = 'sent_to_citizen';
    application.currentStage = 'citizen';
    application.sentToCitizenAt = new Date().toISOString();
    application.updatedAt = new Date().toISOString();

    await kv.set(`legacy_data:${applicationId}`, application);

    console.log(`[LEGACY DATA] Permission letter sent to citizen for ${applicationId}`);
    return c.json({ success: true, message: 'Permission letter sent to applicant successfully' });
  } catch (error) {
    console.log(`[LEGACY DATA] Send to citizen error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// APPEAL ROUTES
// ========================================

app.post("/make-server-698be164/appeal/submit", async (c) => {
  try {
    const body = await c.req.json();
    const { originalApplicationId, citizenId, citizenName, citizenPhone, reasonForAppeal, applicationDetails } = body;
    if (!originalApplicationId || !reasonForAppeal) {
      return c.json({ success: false, error: 'Original Application ID and Reason for Appeal are required' }, 400);
    }
    const timestamp = new Date().toISOString();
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '-');
    const randomSuffix = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    const ulbPrefix = applicationDetails?.ulb ? applicationDetails.ulb.substring(0, 3).toUpperCase() : 'HUB';
    const appealId = `${ulbPrefix}_JN-${dateStr}-NT_Appeal_${randomSuffix}`;
    const appealData = {
      id: appealId,
      type: 'appeal',
      originalApplicationId,
      citizenId: citizenId || 'N/A',
      citizenName: citizenName || 'N/A',
      citizenPhone: citizenPhone || 'N/A',
      reasonForAppeal: reasonForAppeal.trim(),
      applicationDetails: applicationDetails || {},
      ulb: applicationDetails?.ulb || 'N/A',
      menu: applicationDetails?.menu || 'Tap Connection',
      subMenu: applicationDetails?.subMenu || 'New Tap Connection',
      dateOfRejection: applicationDetails?.rejectedAt || applicationDetails?.updatedAt || 'N/A',
      dateOfAppealRequested: timestamp,
      status: 'requested',
      currentStage: 'project_director',
      submittedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      workflow: {
        citizen: { name: citizenName || 'N/A', phone: citizenPhone || 'N/A', timestamp, reasonForAppeal: reasonForAppeal.trim() }
      }
    };
    await kv.set(`appeal:${appealId}`, appealData);
    console.log(`[APPEAL] Appeal ${appealId} submitted for application ${originalApplicationId}`);
    return c.json({ success: true, appealId, message: 'Appeal submitted successfully' });
  } catch (error) {
    console.log(`[APPEAL] Submit error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/make-server-698be164/appeal/applications", async (c) => {
  try {
    const stage = c.req.query('stage') || null;
    const citizenPhone = c.req.query('citizenPhone') || null;
    const allAppeals = await kv.getByPrefix('appeal:');
    let appeals = allAppeals || [];
    if (stage) { appeals = appeals.filter((a: any) => a?.currentStage === stage); }
    if (citizenPhone) { appeals = appeals.filter((a: any) => a?.citizenPhone === citizenPhone); }
    return c.json({ success: true, applications: appeals, total: appeals.length });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/make-server-698be164/appeal/application/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const appeal = await kv.get(`appeal:${id}`);
    if (!appeal) { return c.json({ success: false, error: 'Appeal not found' }, 404); }
    return c.json({ success: true, application: appeal });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-698be164/appeal/pd-action", async (c) => {
  try {
    const body = await c.req.json();
    const { appealId, action, comments, pdName } = body;
    if (!appealId || !action) { return c.json({ success: false, error: 'Appeal ID and action are required' }, 400); }
    const appeal = await kv.get(`appeal:${appealId}`);
    if (!appeal) { return c.json({ success: false, error: 'Appeal not found' }, 404); }
    const timestamp = new Date().toISOString();
    if (action === 'approve') { appeal.status = 'pd_approved'; appeal.currentStage = 'commissioner'; }
    else if (action === 'reject') { appeal.status = 'pd_rejected'; appeal.currentStage = 'closed'; }
    else { return c.json({ success: false, error: 'Invalid action' }, 400); }
    appeal.updatedAt = timestamp;
    if (!appeal.workflow) appeal.workflow = {};
    appeal.workflow.projectDirector = { name: pdName || 'Project Director', action, comments: comments || '', timestamp };
    await kv.set(`appeal:${appealId}`, appeal);
    console.log(`[APPEAL] PD ${action} appeal ${appealId}`);
    return c.json({ success: true, message: `Appeal ${action === 'approve' ? 'approved and sent to Commissioner' : 'rejected and closed'}` });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-698be164/appeal/commissioner-action", async (c) => {
  try {
    const body = await c.req.json();
    const { appealId, action, comments, commissionerName, estimationRows, totalAmount } = body;
    if (!appealId || !action) {
      return c.json({ success: false, error: 'Appeal ID and action are required' }, 400);
    }
    const appeal = await kv.get(`appeal:${appealId}`);
    if (!appeal) {
      return c.json({ success: false, error: 'Appeal not found' }, 404);
    }
    const timestamp = new Date().toISOString();

    if (action === 'approve') {
      appeal.status = 'commissioner_approved';
      appeal.currentStage = 'payment_letter_sent';

      // Try to update the original application to allow citizen payment
      const origAppId = appeal.originalApplicationId;
      if (origAppId) {
        const allApps = await kv.getByPrefix('application:');
        const origApp = allApps.find((a: any) => a?.id === origAppId || a?.applicationNo === origAppId);
        if (origApp) {
          origApp.status = 'sentToCitizenForPayment';
          origApp.currentStage = 'payment';
          origApp.updatedAt = timestamp;
          // Clear any stale paymentDetails so citizen sees payment form (not receipt)
          delete origApp.paymentDetails;
          origApp.isAppealApproved = true;
          origApp.appealId = appealId;

          // Save approved estimation data if provided
          if (estimationRows && estimationRows.length > 0) {
            origApp.approvedEstimation = {
              rows: estimationRows,
              totalAmount: totalAmount || estimationRows.reduce((sum: number, row: any) => sum + (row?.price || 0), 0),
              approvedAt: timestamp,
              approvedBy: commissionerName || 'Commissioner',
            };
            if (!origApp.plumberConnectionData) {
              origApp.plumberConnectionData = {};
            }
            origApp.plumberConnectionData.totalAmount = totalAmount || estimationRows.reduce((sum: number, row: any) => sum + (row?.price || 0), 0);
            origApp.plumberConnectionData.estimationRows = estimationRows;
          }

          if (!origApp.workflow) origApp.workflow = {};
          origApp.workflow.commissioner = {
            status: 'approved',
            action: 'approvedViaAppeal',
            remarks: comments || 'Appeal approved. Previous rejection revoked. Payment letter sent to applicant.',
            approvedAt: timestamp,
            timestamp,
          };
          origApp.workflow.currentStep = 'approved';
          await kv.set(`application:${origApp.id}`, origApp);
          console.log(`[APPEAL] Original application ${origApp.id} updated to sentToCitizenForPayment via appeal with estimation data`);

          // Ensure the application is in the citizen's application list
          if (origApp.citizenId) {
            const citizenApps = await kv.get(`citizen:${origApp.citizenId}:applications`) || [];
            if (!citizenApps.includes(origApp.id)) {
              citizenApps.push(origApp.id);
              await kv.set(`citizen:${origApp.citizenId}:applications`, citizenApps);
            }
          }

          // Add to plumber queue for later (plumber gets permission letter after payment is verified)
          const plumberQueue = await kv.get('plumber:queue') || [];
          if (!plumberQueue.includes(origApp.id)) {
            plumberQueue.push(origApp.id);
            await kv.set('plumber:queue', plumberQueue);
            console.log(`[APPEAL] Added ${origApp.id} to plumber:queue`);
          }
          const plumberMobileQueue = await kv.get('plumber:mobile_installation_queue') || [];
          if (!plumberMobileQueue.includes(origApp.id)) {
            plumberMobileQueue.push(origApp.id);
            await kv.set('plumber:mobile_installation_queue', plumberMobileQueue);
            console.log(`[APPEAL] Added ${origApp.id} to plumber:mobile_installation_queue`);
          }
        } else {
          console.log(`[APPEAL] Original application ${origAppId} not found in kv_store — appeal approved but original app not updated`);
        }
      }
    } else if (action === 'reject') {
      appeal.status = 'commissioner_appeal_rejected';
      appeal.currentStage = 'closed';
    } else {
      return c.json({ success: false, error: 'Invalid action. Must be approve or reject.' }, 400);
    }

    appeal.updatedAt = timestamp;
    if (!appeal.workflow) appeal.workflow = {};
    appeal.workflow.commissioner = {
      name: commissionerName || 'Commissioner',
      action,
      comments: comments || '',
      timestamp,
    };
    await kv.set(`appeal:${appealId}`, appeal);
    console.log(`[APPEAL] Commissioner ${action} appeal ${appealId}`);
    return c.json({
      success: true,
      message: action === 'approve'
        ? 'Appeal approved. Payment letter signed and sent to citizen. Original rejection revoked.'
        : 'Appeal rejected by Commissioner. Case closed.',
    });
  } catch (error) {
    console.log(`[APPEAL] Commissioner action error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get original application status for appeal tracking (used by PD and Citizen)
// Pass ?full=true to get the complete application object (for Commissioner/PD detail views)
app.get("/make-server-698be164/appeal/original-app-status", async (c) => {
  try {
    const originalAppId = c.req.query('originalAppId');
    if (!originalAppId) {
      return c.json({ success: false, error: 'originalAppId query param is required' }, 400);
    }
    const fullData = c.req.query('full') === 'true';
    console.log(`[APPEAL TRACK] Fetching original app status for: ${originalAppId}, full=${fullData}`);
    const allApps = await kv.getByPrefix('application:');
    const origApp = allApps.find((a: any) => a?.id === originalAppId || a?.applicationNo === originalAppId);
    if (!origApp) {
      return c.json({ success: true, found: false, message: 'Original application not found in KV store' });
    }
    if (fullData) {
      // Return the complete application object (for Commissioner/PD detail views)
      return c.json({
        success: true,
        found: true,
        application: origApp,
      });
    }
    return c.json({
      success: true,
      found: true,
      application: {
        id: origApp.id,
        applicationNo: origApp.applicationNo || origApp.id,
        status: origApp.status,
        currentStage: origApp.currentStage,
        isAppealApproved: origApp.isAppealApproved || false,
        appealId: origApp.appealId || null,
        updatedAt: origApp.updatedAt,
        paymentDetails: origApp.paymentDetails || null,
        workflow: origApp.workflow || {},
        applicantDetails: origApp.applicantDetails || {},
      },
    });
  } catch (error) {
    console.log(`[APPEAL TRACK] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// AUTH: CITIZEN REGISTRATION & PASSWORD MGMT
// ========================================

// Register new citizen
app.post("/make-server-698be164/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    const { fullName, phone, email, aadhaarNumber, dateOfBirth, gender, address, district, ulb, ulbType, password } = body;

    console.log(`[AUTH REGISTER] Registering citizen with phone: ${phone}`);

    if (!fullName || !phone || !password) {
      return c.json({ success: false, error: 'Full Name, Phone Number, and Password are required' }, 400);
    }

    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      return c.json({ success: false, error: 'Phone number must be exactly 10 digits' }, 400);
    }

    if (password.length < 6) {
      return c.json({ success: false, error: 'Password must be at least 6 characters' }, 400);
    }

    // Check if user already exists
    const existingUser = await kv.get(`registered_user:${phone}`);
    if (existingUser) {
      console.log(`[AUTH REGISTER] User already exists: ${phone}`);
      return c.json({ success: false, error: 'A user with this phone number is already registered. Please use Forgot Password if you cannot access your account.' }, 409);
    }

    // Create user record
    const user: Record<string, any> = {
      id: `CITIZEN-${phone}`,
      phone,
      fullName,
      email: email || '',
      aadhaarNumber: aadhaarNumber || '',
      dateOfBirth: dateOfBirth || '',
      gender: gender || '',
      address: address || '',
      district: district || '',
      ulb: ulb || '',
      ulbType: ulbType || '',
      password,
      type: 'citizen',
      role: 'citizen',
      isPlumber: false,
      name: fullName,
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`registered_user:${phone}`, user);
    console.log(`[AUTH REGISTER] Citizen registered successfully: ${phone} (${fullName})`);

    return c.json({
      success: true,
      message: 'Registration successful! You can now log in with your phone number and password.',
      userId: user.id,
    });
  } catch (error) {
    console.log(`[AUTH REGISTER] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Login — verifies against registered users in KV store
app.post("/make-server-698be164/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { identifier, otp, userType } = body;

    console.log(`[AUTH LOGIN] Login attempt: identifier=${identifier}, userType=${userType}`);

    if (!identifier || !otp) {
      return c.json({ success: false, error: 'Phone/Employee ID and OTP/Password are required' }, 400);
    }

    // Check registered users in KV
    const registeredUser = await kv.get(`registered_user:${identifier}`);
    if (registeredUser) {
      if (registeredUser.password !== otp) {
        console.log(`[AUTH LOGIN] Invalid password for registered user: ${identifier}`);
        return c.json({ success: false, error: 'Invalid password. Please try again or use Forgot Password.' }, 401);
      }

      if (registeredUser.type !== userType) {
        console.log(`[AUTH LOGIN] User type mismatch for: ${identifier}`);
        return c.json({ success: false, error: `This account is not registered as ${userType}` }, 401);
      }

      console.log(`[AUTH LOGIN] Registered user logged in: ${identifier} (${registeredUser.name})`);
      const { password: _pw, ...safeUser } = registeredUser;
      return c.json({ success: true, user: safeUser, source: 'registered' });
    }

    // Not found — frontend will fall back to hardcoded credentials
    console.log(`[AUTH LOGIN] User not found in KV, deferring to client-side: ${identifier}`);
    return c.json({ success: false, error: 'not_found', message: 'User not in server registry' }, 404);
  } catch (error) {
    console.log(`[AUTH LOGIN] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Forgot Password — Step 1: Send OTP (simulated)
app.post("/make-server-698be164/auth/forgot-password/send-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { phone } = body;

    console.log(`[AUTH FORGOT] Send OTP request for phone: ${phone}`);

    if (!phone || phone.length !== 10) {
      return c.json({ success: false, error: 'Please enter a valid 10-digit phone number' }, 400);
    }

    const user = await kv.get(`registered_user:${phone}`);
    if (!user) {
      console.log(`[AUTH FORGOT] Phone not found: ${phone}`);
      return c.json({ success: false, error: 'No account found with this phone number. Please register first.' }, 404);
    }

    const otp = '123456';
    const otpRecord = {
      phone,
      otp,
      purpose: 'password_reset',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };
    await kv.set(`otp:reset:${phone}`, otpRecord);

    console.log(`[AUTH FORGOT] OTP generated for ${phone}: ${otp} (demo mode)`);

    return c.json({
      success: true,
      message: 'OTP has been sent to your registered mobile number.',
      hint: 'Demo mode: Use OTP 123456',
    });
  } catch (error) {
    console.log(`[AUTH FORGOT] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Forgot Password — Step 2: Verify OTP & reset password
app.post("/make-server-698be164/auth/forgot-password/reset", async (c) => {
  try {
    const body = await c.req.json();
    const { phone, otp, newPassword } = body;

    console.log(`[AUTH RESET] Password reset for phone: ${phone}`);

    if (!phone || !otp || !newPassword) {
      return c.json({ success: false, error: 'Phone, OTP, and New Password are all required' }, 400);
    }

    if (newPassword.length < 6) {
      return c.json({ success: false, error: 'New password must be at least 6 characters' }, 400);
    }

    const otpRecord = await kv.get(`otp:reset:${phone}`);
    if (!otpRecord) {
      return c.json({ success: false, error: 'No OTP was sent to this number. Please request a new OTP.' }, 400);
    }

    if (otpRecord.otp !== otp) {
      return c.json({ success: false, error: 'Invalid OTP. Please check and try again.' }, 401);
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      await kv.del(`otp:reset:${phone}`);
      return c.json({ success: false, error: 'OTP has expired. Please request a new one.' }, 400);
    }

    const user = await kv.get(`registered_user:${phone}`);
    if (!user) {
      return c.json({ success: false, error: 'User account not found.' }, 404);
    }

    user.password = newPassword;
    user.updatedAt = new Date().toISOString();
    await kv.set(`registered_user:${phone}`, user);

    await kv.del(`otp:reset:${phone}`);

    console.log(`[AUTH RESET] Password reset successful for ${phone}`);

    return c.json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    console.log(`[AUTH RESET] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Registration OTP — Send OTP for verifying phone during registration (simulated)
app.post("/make-server-698be164/auth/register/send-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { phone } = body;

    console.log(`[AUTH REG OTP] Send registration OTP for phone: ${phone}`);

    if (!phone || phone.length !== 10) {
      return c.json({ success: false, error: 'Please enter a valid 10-digit phone number' }, 400);
    }

    const existing = await kv.get(`registered_user:${phone}`);
    if (existing) {
      return c.json({ success: false, error: 'This phone number is already registered. Please log in or use Forgot Password.' }, 409);
    }

    const otp = '123456';
    const otpRecord = {
      phone,
      otp,
      purpose: 'registration',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };
    await kv.set(`otp:register:${phone}`, otpRecord);

    console.log(`[AUTH REG OTP] Registration OTP for ${phone}: ${otp} (demo mode)`);

    return c.json({
      success: true,
      message: 'OTP has been sent to your mobile number.',
      hint: 'Demo mode: Use OTP 123456',
    });
  } catch (error) {
    console.log(`[AUTH REG OTP] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Verify registration OTP
app.post("/make-server-698be164/auth/register/verify-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { phone, otp } = body;

    console.log(`[AUTH REG VERIFY] Verifying registration OTP for: ${phone}`);

    if (!phone || !otp) {
      return c.json({ success: false, error: 'Phone and OTP are required' }, 400);
    }

    const otpRecord = await kv.get(`otp:register:${phone}`);
    if (!otpRecord) {
      return c.json({ success: false, error: 'No OTP was sent to this number. Please request a new OTP.' }, 400);
    }

    if (otpRecord.otp !== otp) {
      return c.json({ success: false, error: 'Invalid OTP. Please check and try again.' }, 401);
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      await kv.del(`otp:register:${phone}`);
      return c.json({ success: false, error: 'OTP has expired. Please request a new one.' }, 400);
    }

    otpRecord.verified = true;
    await kv.set(`otp:register:${phone}`, otpRecord);

    console.log(`[AUTH REG VERIFY] OTP verified for ${phone}`);

    return c.json({ success: true, message: 'Phone number verified successfully!' });
  } catch (error) {
    console.log(`[AUTH REG VERIFY] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
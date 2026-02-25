# Jalanidhi Appeal Module - Complete Package

---

## 🤖 AI INTEGRATION PROMPT (Copy This to AI Assistant)

**If you're a designer and want AI to do all the integration work, copy the prompt below and paste it into your AI assistant (Claude, ChatGPT, etc.):**

---

```
I need you to integrate the Appeal module into my Jalanidhi government portal. Here's what you need to do:

## Context
- I'm building Jalanidhi (KMDS project) for Karnataka Government
- Using React with navy (#1f3a5f) color, Poppins font, Supabase backend
- Current modules: Tap Connection (already has Appeal working)
- Need to add Appeal for: [UGD / Borewell / Both]

## Your Task
Complete these 6 steps:

### STEP 1: Copy Component Files
Copy these 4 components from my existing Tap Connection implementation:
- /src/app/components/jalanidhi/CitizenRequestAppeal.tsx
- /src/app/components/jalanidhi/CitizenAppealStatus.tsx
- /src/app/components/jalanidhi/ProjectDirectorPage.tsx
- /src/app/components/jalanidhi/CommissionerAppealDashboard.tsx
- /src/app/components/jalanidhi/RemarksTimeline.tsx (dependency)

### STEP 2: Add Backend Routes
Add all 9 appeal routes to /supabase/functions/server/index.tsx:
1. POST /appeal/submit
2. GET /appeal/applications
3. GET /appeal/pending-pd
4. GET /appeal/forwarded-to-commissioner
5. POST /appeal/pd-forward
6. POST /appeal/pd-reject
7. POST /appeal/commissioner-approve (must reactivate original app)
8. POST /appeal/commissioner-reject
9. GET /appeal/original-app-status

Refer to APPEAL_MODULE_PACKAGE.md for complete backend code.

### STEP 3: Update Routing in App.tsx
Add these 4 routes:
- /jalanidhi/appeal/request → CitizenRequestAppeal
- /jalanidhi/appeal/status → CitizenAppealStatus
- /jalanidhi/project-director/appeal → ProjectDirectorPage
- /jalanidhi/commissioner/appeal → CommissionerAppealDashboard

Also update breadcrumb logic.

### STEP 4: Update Sidebars
- Citizen sidebar: Add "Appeal" menu with 2 sub-items
- Commissioner sidebar: Add "Appealed Applications" menu item
- Import Scale icon from lucide-react

### STEP 5: Customize for My Module
In CitizenRequestAppeal.tsx:
- Update menu/submenu options for [UGD/Borewell]
- Change fetchRejectedApplications endpoint to my module's endpoint
- Update dummy data to match my application ID format

### STEP 6: Add Appeal Badge to Application Views
Show "APPEAL" badge in:
- Application status pages where isAppealApproved === true
- Payment views with yellow banner explaining appeal approval

## Important Conventions
- Use explicit && null checks (no optional chaining ?.)
- Connection type defaults to 'Domestic' (not 'N/A')
- Follow navy (#1f3a5f) color scheme
- Use Poppins font throughout
- Table styling: white bg, rounded-[10px], navy header

## Testing Required
After integration, verify:
1. Citizen can submit appeal for rejected application
2. Project Director sees pending appeals
3. PD can forward to Commissioner
4. Commissioner can approve (must reactivate original app)
5. Original app shows in payment stage with "APPEAL" badge
6. Entire workflow completes successfully

Please read the APPEAL_MODULE_PACKAGE.md file in my project for complete code snippets and proceed with the integration.
```

---

**That's it! Just copy the above prompt and give it to your AI assistant. It will read this file and do all the integration work for you.**

---

## Overview
The Appeal module allows citizens to appeal rejected applications across Tap Connection, UGD, and Borewell services. Three roles are involved:
- **Citizen** → Submits appeal & tracks status
- **Project Director** → Reviews & forwards/rejects appeals
- **Commissioner** → Makes final approve/reject decision

**Workflow**: Citizen submits → PD reviews → PD forwards → Commissioner decides → Original app reactivated (if approved)

---

## Quick Start

### Step 1: Copy Component Files
Copy these 4 files from `/src/app/components/jalanidhi/`:
```
✓ CitizenRequestAppeal.tsx
✓ CitizenAppealStatus.tsx
✓ ProjectDirectorPage.tsx
✓ CommissionerAppealDashboard.tsx
✓ RemarksTimeline.tsx (shared dependency)
```

### Step 2: Add Backend Routes
Add these routes to `/supabase/functions/server/index.tsx`:

```typescript
// 1. Submit Appeal
app.post('/make-server-698be164/appeal/submit', async (c) => {
  const body = await c.req.json();
  const appealId = `APPEAL-${Date.now()}`;
  const now = new Date().toISOString();
  
  const appeal = {
    id: appealId,
    menu: body.menu || 'tap_connection',
    subMenu: body.subMenu || 'new_tap_connection',
    originalApplicationId: body.originalApplicationId || '',
    dateOfRejection: body.dateOfRejection || '',
    dateOfAppealRequested: now,
    reasonForAppeal: body.reasonForAppeal || '',
    supportingDocument: body.supportingDocument || '',
    status: 'pending_pd_review',
    currentStage: 'project_director',
    citizenPhone: body.citizenPhone || '',
    citizenName: body.citizenName || '',
    ulb: body.ulb || '',
    applicationDetails: null,
    workflow: {},
    createdAt: now,
    updatedAt: now,
  };
  
  await kv.set(`appeal:${appealId}`, appeal);
  return c.json({ success: true, appealId });
});

// 2. Get Citizen Appeals
app.get('/make-server-698be164/appeal/applications', async (c) => {
  const citizenPhone = c.req.query('citizenPhone');
  const allAppeals = await kv.getByPrefix('appeal:');
  const filtered = allAppeals.filter((a: any) => a && a.citizenPhone === citizenPhone);
  return c.json({ success: true, applications: filtered });
});

// 3. Get Pending PD Appeals
app.get('/make-server-698be164/appeal/pending-pd', async (c) => {
  const allAppeals = await kv.getByPrefix('appeal:');
  const pending = allAppeals.filter((a: any) => a && a.status === 'pending_pd_review');
  return c.json({ success: true, applications: pending });
});

// 4. Get Forwarded Appeals (Commissioner)
app.get('/make-server-698be164/appeal/forwarded-to-commissioner', async (c) => {
  const allAppeals = await kv.getByPrefix('appeal:');
  const forwarded = allAppeals.filter((a: any) => a && a.status === 'pd_forwarded');
  return c.json({ success: true, applications: forwarded });
});

// 5. PD Forward
app.post('/make-server-698be164/appeal/pd-forward', async (c) => {
  const { appealId, remarks } = await c.req.json();
  const appeal = await kv.get(`appeal:${appealId}`);
  if (!appeal) return c.json({ success: false, error: 'Appeal not found' }, 404);
  
  appeal.status = 'pd_forwarded';
  appeal.currentStage = 'commissioner';
  appeal.workflow.projectDirector = {
    remarks: remarks || '',
    decidedAt: new Date().toISOString(),
    action: 'forwarded'
  };
  appeal.updatedAt = new Date().toISOString();
  
  await kv.set(`appeal:${appealId}`, appeal);
  return c.json({ success: true });
});

// 6. PD Reject
app.post('/make-server-698be164/appeal/pd-reject', async (c) => {
  const { appealId, remarks } = await c.req.json();
  const appeal = await kv.get(`appeal:${appealId}`);
  if (!appeal) return c.json({ success: false, error: 'Appeal not found' }, 404);
  
  appeal.status = 'pd_rejected';
  appeal.workflow.projectDirector = {
    remarks: remarks || '',
    decidedAt: new Date().toISOString(),
    action: 'rejected'
  };
  appeal.updatedAt = new Date().toISOString();
  
  await kv.set(`appeal:${appealId}`, appeal);
  return c.json({ success: true });
});

// 7. Commissioner Approve (CRITICAL: Reactivates original app)
app.post('/make-server-698be164/appeal/commissioner-approve', async (c) => {
  const { appealId, remarks } = await c.req.json();
  const appeal = await kv.get(`appeal:${appealId}`);
  if (!appeal) return c.json({ success: false, error: 'Appeal not found' }, 404);
  
  // Update appeal
  appeal.status = 'commissioner_approved';
  appeal.workflow.commissioner = {
    remarks: remarks || '',
    decidedAt: new Date().toISOString(),
    action: 'approved'
  };
  appeal.updatedAt = new Date().toISOString();
  await kv.set(`appeal:${appealId}`, appeal);
  
  // Reactivate original application
  const originalAppId = appeal.originalApplicationId;
  if (originalAppId) {
    const originalApp = await kv.get(`application:${originalAppId}`);
    if (originalApp) {
      originalApp.status = 'commissioner_approved_via_appeal';
      originalApp.isAppealApproved = true;
      originalApp.appealId = appealId;
      originalApp.updatedAt = new Date().toISOString();
      await kv.set(`application:${originalAppId}`, originalApp);
    }
  }
  
  return c.json({ success: true });
});

// 8. Commissioner Reject
app.post('/make-server-698be164/appeal/commissioner-reject', async (c) => {
  const { appealId, remarks } = await c.req.json();
  const appeal = await kv.get(`appeal:${appealId}`);
  if (!appeal) return c.json({ success: false, error: 'Appeal not found' }, 404);
  
  appeal.status = 'commissioner_rejected';
  appeal.workflow.commissioner = {
    remarks: remarks || '',
    decidedAt: new Date().toISOString(),
    action: 'rejected'
  };
  appeal.updatedAt = new Date().toISOString();
  
  await kv.set(`appeal:${appealId}`, appeal);
  return c.json({ success: true });
});

// 9. Get Original App Status
app.get('/make-server-698be164/appeal/original-app-status', async (c) => {
  const originalAppId = c.req.query('originalAppId');
  if (!originalAppId) return c.json({ success: false, error: 'Missing originalAppId' }, 400);
  
  const app = await kv.get(`application:${originalAppId}`);
  if (!app) return c.json({ success: true, found: false });
  
  return c.json({ success: true, found: true, application: app });
});
```

### Step 3: Add Routes to App.tsx
```typescript
// In your routing switch statement
case "/jalanidhi/appeal/request":
  return <CitizenRequestAppeal />;

case "/jalanidhi/appeal/status":
  return <CitizenAppealStatus />;

case "/jalanidhi/project-director/appeal":
  return <ProjectDirectorPage />;

case "/jalanidhi/commissioner/appeal":
  return <CommissionerAppealDashboard />;

// In breadcrumb logic
else if (activePath.startsWith("/jalanidhi/appeal/")) {
  crumbs.push({ label: "Appeal", path: "/jalanidhi/appeal" });
  if (activePath === "/jalanidhi/appeal/request") {
    crumbs.push({ label: "Request Appeal", path: "/jalanidhi/appeal/request" });
  } else if (activePath === "/jalanidhi/appeal/status") {
    crumbs.push({ label: "Appeal Status", path: "/jalanidhi/appeal/status" });
  }
}

// Add imports at top
import CitizenRequestAppeal from "./components/jalanidhi/CitizenRequestAppeal";
import CitizenAppealStatus from "./components/jalanidhi/CitizenAppealStatus";
import ProjectDirectorPage from "./components/jalanidhi/ProjectDirectorPage";
import CommissionerAppealDashboard from "./components/jalanidhi/CommissionerAppealDashboard";
```

### Step 4: Update Sidebars
```typescript
// Citizen Sidebar
{
  id: 'appeal',
  label: 'Appeal',
  icon: Scale,
  subItems: [
    { id: 'appeal-request', label: 'Request Appeal', path: '/jalanidhi/appeal/request' },
    { id: 'appeal-status', label: 'Appeal Status', path: '/jalanidhi/appeal/status' }
  ]
}

// Commissioner Sidebar
{
  id: 'appeal',
  label: 'Appealed Applications',
  icon: Scale,
  path: '/jalanidhi/commissioner/appeal'
}
```

---

## Customization for UGD/Borewell

### Update Menu Options in CitizenRequestAppeal.tsx

**Find this section (around line 170):**
```typescript
{/* Submenu */}
<GovSelect value={subMenu} onChange={setSubMenu}>
  {menu === 'tap_connection' && (
    <>
      <option value="new_tap_connection">New Tap Connection</option>
      <option value="tap_reconnection">Tap Reconnection</option>
      <option value="tap_disconnection">Tap Disconnection</option>
    </>
  )}
  {menu === 'ugd' && (
    <>
      <option value="new_ugd_connection">New UGD Connection</option>
      <option value="ugd_disconnection">UGD Disconnection</option>
      <option value="ugd_reconnection">UGD Reconnection</option>
    </>
  )}
  {menu === 'borewell' && (
    <>
      <option value="new_borewell">New Borewell Registration</option>
      <option value="borewell_closure">Borewell Closure</option>
    </>
  )}
</GovSelect>
```

### Update Data Fetch Endpoint

**Find fetchRejectedApplications() (around line 95):**
```typescript
const fetchRejectedApplications = async () => {
  setLoading(true);
  try {
    // FOR UGD: Change to '/ugd/applications?citizenPhone=' + phone
    // FOR BOREWELL: Change to '/borewell/applications?citizenPhone=' + phone
    const rawUrl = 'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/citizen/all-apps-raw';
    
    const response = await fetch(rawUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + publicAnonKey,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.success && data.applications) {
      const myRejected = data.applications.filter((app: any) => {
        return app && app.status === 'rejected' && 
               (app.citizenPhone === phone || app.citizenId === 'CITIZEN-' + phone);
      });
      setRejectedApps(myRejected);
    }
  } catch (err) {
    console.error('[APPEAL] Error:', err);
  } finally {
    setLoading(false);
  }
};
```

---

## Data Structures

### Appeal Object
```typescript
{
  id: string                      // APPEAL-{timestamp}
  menu: string                    // 'tap_connection' | 'ugd' | 'borewell'
  subMenu: string                 // 'new_tap_connection' | 'new_ugd_connection' | etc
  originalApplicationId: string   // ID of rejected application
  dateOfRejection: string
  dateOfAppealRequested: string   // ISO timestamp
  reasonForAppeal: string
  supportingDocument?: string     // Base64 encoded
  status: string                  // Workflow state (see below)
  currentStage: string            // 'project_director' | 'commissioner'
  citizenPhone: string
  citizenName: string
  ulb: string
  workflow: {
    projectDirector?: { remarks: string, decidedAt: string, action: string }
    commissioner?: { remarks: string, decidedAt: string, action: string }
  }
  createdAt: string
  updatedAt: string
}
```

### Status Values
- `pending_pd_review` → Waiting for Project Director
- `pd_forwarded` → Forwarded to Commissioner
- `pd_rejected` → Rejected by PD
- `commissioner_approved` → Approved (original app reactivated)
- `commissioner_rejected` → Final rejection
- `completed` → Appeal approved & original app completed

---

## Testing Checklist

**Happy Path:**
1. [ ] Citizen submits appeal for rejected application
2. [ ] Appeal appears in Project Director dashboard
3. [ ] PD forwards appeal to Commissioner with remarks
4. [ ] Appeal appears in Commissioner dashboard
5. [ ] Commissioner approves appeal
6. [ ] Original application status changes to 'commissioner_approved_via_appeal'
7. [ ] Original application gets isAppealApproved = true
8. [ ] Citizen sees application in payment stage (with "APPEAL" badge)
9. [ ] Payment flow works normally

**Rejection Paths:**
- [ ] PD can reject appeal (status → pd_rejected)
- [ ] Commissioner can reject appeal (status → commissioner_rejected)
- [ ] Citizen sees rejection status in appeal tracker

---

## Show Appeal Badge in UI

When displaying applications that were approved via appeal:

```typescript
{application.isAppealApproved && (
  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
    APPEAL
  </span>
)}

// In payment view
{application.isAppealApproved && (
  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4">
    <FileText className="w-5 h-5 text-yellow-700 inline mr-2" />
    <span className="text-yellow-800 font-semibold">
      Approved via Appeal — Previous Rejection Revoked
    </span>
  </div>
)}
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Appeals not showing in PD dashboard | Verify `status === 'pending_pd_review'` |
| Original app not reactivated | Check `originalApplicationId` matches exactly |
| Citizen can't see rejected apps | Ensure `citizenPhone` matches |
| 404 on submit | Verify `/appeal/submit` route is registered |

---

## Design Conventions

All components follow these standards:
- **Color**: #1f3a5f (navy primary)
- **Font**: Poppins, sans-serif
- **Containers**: `bg-white rounded-[10px] shadow-sm border border-gray-200`
- **Buttons**: `bg-[#1f3a5f] text-white hover:bg-[#2d4a6f]`
- **Null checks**: Use `&&` not `?.` (optional chaining)
- **Default connection type**: 'Domestic' (not 'N/A')

---

## Summary

**3 Main Components:**
1. **CitizenRequestAppeal** - Submit appeal form
2. **CitizenAppealStatus** - Track appeal progress
3. **ProjectDirectorPage** - PD review dashboard
4. **CommissionerAppealDashboard** - Commissioner decision dashboard

**9 Backend Routes** - All handle appeal CRUD and workflow transitions

**Key Feature**: When Commissioner approves, the original rejected application is automatically reactivated and moves to payment stage with special "APPEAL" marking.

---

**Last Updated**: February 24, 2026  
**Module Version**: 1.0  
**Compatible**: Tap Connection, UGD, Borewell
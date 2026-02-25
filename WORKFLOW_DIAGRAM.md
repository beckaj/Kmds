# 🔄 COMPLETE WORKFLOW DIAGRAM

## Jalanidhi Tap Connection Application Flow

---

## 📊 DETAILED FLOW WITH DATA STATES

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STAGE 1: CITIZEN APPLICATION                        │
└─────────────────────────────────────────────────────────────────────────────┘

👤 CITIZEN (Phone: 9876543210)
   │
   ├─ Logs in as "Citizen"
   ├─ Navigates: Citizen Services → Jalanidhi → Tap Connection → New Connection
   ├─ Fills 3-step form:
   │    Step 1: Property Details (District, ULB, Property ID)
   │    Step 2: Applicant Details (Name, Mobile, Aadhar, Address)
   │    Step 3: Connection Details (Property Type, Plot No, Survey No)
   │
   └─ Clicks "Submit Application"

                                    ↓

[API: POST /tap-connection/apply]
   │
   ├─ Generates Application ID: TAP-1234567890-ABC123
   ├─ Status: "pending_plumber"
   ├─ Current Stage: "plumber"
   │
   ├─ Stores in KV:
   │    • application:TAP-1234567890-ABC123 = { ...applicationData }
   │    • citizen:CITIZEN-9876543210:applications[] += TAP-1234567890-ABC123
   │    • plumber:queue[] += TAP-1234567890-ABC123
   │
   └─ Returns: { success: true, applicationId }

                                    ↓

👤 CITIZEN sees:
   ├─ Success message with Application ID
   ├─ Navigate to "Application Status"
   └─ Status Badge: 🟡 "Pending" (Yellow)


┌─────────────────────────────────────────────────────────────────────────────┐
│                       STAGE 2: PLUMBER REVIEW & ACCEPT                       │
└─────────────────────────────────────────────────────────────────────────────┘

🔧 PLUMBER (Phone: 9988776655, License: PLB12345)
   │
   ├─ Logs in as "Citizen" (Plumber credentials)
   ├─ Navigates: Citizen Services → Jalanidhi → Plumber Dashboard
   │
   └─ Sees application in queue

                                    ↓

[API: GET /plumber/applications]
   │
   ├─ Fetches from: plumber:queue[]
   ├─ Returns: [TAP-1234567890-ABC123, ...]
   │
   └─ Plumber Dashboard displays applications

                                    ↓

🔧 PLUMBER clicks "View"
   │
   ├─ Opens ApplicationSummaryView (Plumber Mode)
   ├─ Reviews: Property, Applicant, Connection Details
   │
   └─ Clicks "Accept" button

                                    ↓

🔧 PLUMBER fills Connection Details:
   │
   ├─ Uploads Documents:
   │    • Site Sketch (image/PDF)
   │    • Estimate Document (image/PDF)
   │
   ├─ Fills Estimation Table:
   │    Row 1: Labor Charges | 3 members | ₹600
   │    Row 2: Pipe Material | 50 meters | ₹5,000
   │    Row 3: Fittings | 10 pieces | ₹1,500
   │    Row 4: Installation | Lump sum | ₹2,000
   │    ─────────────────────────────────────────
   │    Total: ₹9,100.00
   │
   ├─ Adds Comments: "Work can be completed in 5 days"
   │
   └─ Clicks "Save & Submit"

                                    ↓

[API: POST /plumber/process]
   │
   ├─ Input:
   │    • applicationId: TAP-1234567890-ABC123
   │    • action: "accept"
   │    • plumberId: PLB12345
   │    • plumberName: "Suresh Plumber"
   │    • connectionDetails: { estimationRows, totalAmount, documents, comments }
   │
   ├─ Updates Application:
   │    • status: "pending_applicant_review"
   │    • currentStage: "applicant_review"
   │    • plumberDetails: { plumberId, plumberName }
   │    • plumberConnectionData: { ...connectionDetails }
   │    • workflow.plumber: { status: "completed", timestamp }
   │
   ├─ Updates KV:
   │    • application:TAP-1234567890-ABC123 = { ...updatedData }
   │    • plumber:queue[] -= TAP-1234567890-ABC123  (REMOVED)
   │    • citizen:CITIZEN-9876543210:applications[] (UNCHANGED - still has it!)
   │
   └─ Returns: { success: true }

                                    ↓

🔧 PLUMBER sees:
   └─ Success message → Application removed from queue


┌─────────────────────────────────────────────────────────────────────────────┐
│                    STAGE 3: CITIZEN REVIEWS PLUMBER DATA                     │
└─────────────────────────────────────────────────────────────────────────────┘

👤 CITIZEN (Phone: 9876543210) - SAME USER
   │
   ├─ Already logged in (or logs in again)
   ├─ Navigates: Citizen Services → Jalanidhi → Tap Connection → Application Status
   │
   └─ Clicks 🟡 Gold "Refresh" button

                                    ↓

[API: GET /citizen/CITIZEN-9876543210/applications]
   │
   ├─ Fetches application IDs from: citizen:CITIZEN-9876543210:applications[]
   ├─ For each ID, fetches: application:TAP-1234567890-ABC123
   │
   ├─ Returns: [{
   │    id: TAP-1234567890-ABC123,
   │    status: "pending_applicant_review",  ← UPDATED!
   │    plumberDetails: { plumberId, plumberName },  ← NEW!
   │    plumberConnectionData: { estimationRows, totalAmount, ... }  ← NEW!
   │    ...
   │  }]
   │
   └─ Frontend updates display

                                    ↓

👤 CITIZEN sees:
   ├─ Status Badge: 🔵 "Under Review" (Blue) ← CHANGED FROM YELLOW!
   ├─ Same Application ID
   │
   └─ Clicks "View" button

                                    ↓

[Frontend Logic: ApplicationStatus.tsx]
   │
   ├─ Checks: if (app.status === 'pending_applicant_review')
   ├─ TRUE → Opens CitizenReviewView (Special View)
   │
   └─ CitizenReviewView displays:

        ┌──────────────────────────────────────────────────────┐
        │       CITIZEN REVIEW VIEW - FULL SCREEN              │
        ├──────────────────────────────────────────────────────┤
        │                                                       │
        │  📋 SECTION 1: APPLICATION DETAILS                   │
        │  ├─ Property Details                                 │
        │  ├─ Applicant Details                                │
        │  ├─ Connection Details                               │
        │  └─ Plumber Information:                             │
        │      • Name: Suresh Plumber                          │
        │      • License: PLB12345                             │
        │                                                       │
        │  ─────────────────────────────────────────────────   │
        │                                                       │
        │  🔧 SECTION 2: PLUMBER SUBMITTED DETAILS             │
        │                                                       │
        │  📄 Documents Status:                                │
        │     ✅ Site Sketch: Uploaded                         │
        │     ✅ Estimate Document: Uploaded                   │
        │                                                       │
        │  📊 Estimation Details:                              │
        │  ┌────┬─────────────────┬──────────┬─────────┐       │
        │  │ # │ Attribute       │ Unit     │ Amount  │       │
        │  ├────┼─────────────────┼──────────┼─────────┤       │
        │  │ 1  │ Labor Charges   │ 3 members│ ₹600    │       │
        │  │ 2  │ Pipe Material   │ 50 meters│ ₹5,000  │       │
        │  │ 3  │ Fittings        │ 10 pieces│ ₹1,500  │       │
        │  │ 4  │ Installation    │ Lump sum │ ₹2,000  │       │
        │  ├────┴─────────────────┴──────────┼─────────┤       │
        │  │ TOTAL ESTIMATED AMOUNT           │ ₹9,100  │       │
        │  └──────────────────────────────────┴─────────┘       │
        │                                                       │
        │  💬 Plumber Comments:                                │
        │     "Work can be completed in 5 days.                │
        │      All materials available."                       │
        │                                                       │
        │  ─────────────────────────────────────────────────   │
        │                                                       │
        │         [Back]          [Submit Application]         │
        │                                                       │
        └──────────────────────────────────────────────────────┘

                                    ↓

👤 CITIZEN reviews everything
   │
   └─ Clicks "Submit Application" button

                                    ↓

[API: POST /citizen/submit-application]
   │
   ├─ Input: { applicationId: TAP-1234567890-ABC123 }
   │
   ├─ Updates Application:
   │    • status: "pending_caseworker"
   │    • currentStage: "caseworker"
   │    • workflow.applicantReview: { status: "completed", timestamp }
   │
   ├─ Updates KV:
   │    • application:TAP-1234567890-ABC123 = { ...updatedData }
   │    • caseworker:queue[] += TAP-1234567890-ABC123
   │    • citizen:CITIZEN-9876543210:applications[] (STILL UNCHANGED!)
   │
   └─ Returns: { success: true }

                                    ↓

👤 CITIZEN sees:
   ├─ Success message
   ├─ Returns to Application Status
   └─ Status Badge: 🟢 "Processing" (Green)


┌─────────────────────────────────────────────────────────────────────────────┐
│                   STAGE 4-7: DEPARTMENT WORKFLOW (Coming Soon)               │
└─────────────────────────────────────────────────────────────────────────────┘

🏛️ CASEWORKER (9111111111) → Verifies & selects scheme → Forward
    ↓
🏛️ REVENUE OFFICER (9222222222) → Reviews & verifies → Forward
    ↓
🏛️ FIELD ENGINEER (9333333333) → Site visit & estimation → Forward
    ↓
🏛️ COMMISSIONER (9444444444) → Final approval with DSC → Approve/Reject


═══════════════════════════════════════════════════════════════════════════════
```

---

## 🔑 KEY POINTS

### ✅ **Dynamic Updates:**
- Application **stays in citizen's list** throughout workflow
- Only **status and data fields** update
- **No page reload needed** - manual refresh button updates data

### ✅ **Data Persistence:**
- Application ID: `TAP-1234567890-ABC123` **never changes**
- Stored at: `application:TAP-1234567890-ABC123`
- Referenced in: `citizen:CITIZEN-9876543210:applications[]`

### ✅ **Status Transitions:**
```
pending_plumber (🟡 Pending)
    ↓
pending_applicant_review (🔵 Under Review) ← Plumber submitted data
    ↓
pending_caseworker (🟢 Processing) ← Citizen approved
    ↓
[Future stages...]
```

### ✅ **What Gets Added by Plumber:**
```javascript
plumberDetails: {
  plumberId: "PLB12345",
  plumberName: "Suresh Plumber"
}

plumberConnectionData: {
  estimationRows: [
    { attribute: "Labor Charges", unitOfMeasurement: "3 members", amount: "600" },
    { attribute: "Pipe Material", unitOfMeasurement: "50 meters", amount: "5000" },
    // ... more rows
  ],
  totalAmount: 9100,
  siteSketchUploaded: true,
  estimateUploaded: true,
  comments: "Work can be completed in 5 days"
}
```

---

## 🎯 IMPLEMENTATION STATUS

| Stage | Status | Roles Involved |
|-------|--------|----------------|
| 1. Citizen Application | ✅ **COMPLETE** | Citizen (9876543210) |
| 2. Plumber Review | ✅ **COMPLETE** | Plumber (9988776655) |
| 3. Citizen Review | ✅ **COMPLETE** | Citizen (9876543210) |
| 4. Caseworker | 🚧 **Coming Soon** | Caseworker (9111111111) |
| 5. Revenue Officer | 🚧 **Coming Soon** | Revenue Officer (9222222222) |
| 6. Field Engineer | 🚧 **Coming Soon** | Field Engineer (9333333333) |
| 7. Commissioner | 🚧 **Coming Soon** | Commissioner (9444444444) |

---

**The first 3 stages are fully functional and working dynamically!** 🎉

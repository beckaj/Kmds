# 🧪 Complete Workflow Testing Guide

## 📋 Testing Scenario: Citizen → Plumber → Citizen Review Flow

This guide walks through testing the complete dynamic workflow where a citizen submits an application, a plumber reviews and accepts it with details, and the citizen sees the plumber-submitted information.

---

## 🔑 Test Credentials

| Role | Phone Number | OTP | Notes |
|------|--------------|-----|-------|
| **Citizen** | 9876543210 | 123456 | General citizen |
| **Citizen + Plumber** | 9988776655 | 123456 | Has plumber license PLB12345 |
| **Caseworker** | 9111111111 | 123456 | Employee ID: CW001 |
| **Revenue Officer** | 9222222222 | 123456 | Employee ID: RO001 |
| **Field Engineer** | 9333333333 | 123456 | Employee ID: FE001 |
| **Commissioner** | 9444444444 | 123456 | Employee ID: COM001 |

---

## ✅ Step-by-Step Testing Process

### **STEP 1: Citizen Submits Application**

1. **Login as Citizen**
   - Go to Login page
   - Select "Citizen" tab
   - Phone: `9876543210`
   - OTP: `123456`
   - Captcha: Any text
   - Click "LOGIN"

2. **Navigate to New Tap Connection**
   - Click "Citizen Services" from dashboard
   - Expand "Jalanidhi" section
   - Click "Tap Connection"
   - Click "New Connection"

3. **Fill Application Form**
   
   **Step 1: Property Details**
   - District: Select any (e.g., "Bangalore Urban")
   - ULB: Select any (e.g., "BBMP")
   - Authority Type: Select (e.g., "Municipal Corporation")
   - ULB Type: Select (e.g., "A+")
   - Ownership Type: Select (e.g., "Owner")
   - Property ID: Enter any (e.g., "PROP12345")
   - Click "Verify Property"
   - Wait for verification success
   - Click "Next"

   **Step 2: Applicant Details**
   - Applicant Name: "Rajesh Kumar" (auto-filled)
   - Father's Name: Enter any name
   - Mobile: "9876543210" (auto-filled)
   - Email: Enter any email
   - Aadhar: Enter 12 digits
   - Address: Enter address
   - Click "Next"

   **Step 3: Connection Details**
   - Property Type: Select (e.g., "Residential")
   - Connection Type: Select (e.g., "New Connection")
   - Plot Number: Enter any
   - Survey Number: Enter any
   - Property Address: Enter address
   - Pincode: Enter 6 digits
   - Click "Submit Application"

4. **Verify Submission**
   - You should see success message
   - Note the Application ID (e.g., `TAP-1234567890-ABC123`)
   - Click "View Applications"

5. **Check Application Status**
   - In "Application Status" page, you should see:
     - Your new application listed
     - Status badge: **"Pending"** (Yellow color)
     - Application ID matches what you noted

6. **Logout**
   - Click profile icon → Logout

---

### **STEP 2: Plumber Reviews and Accepts Application**

1. **Login as Plumber**
   - Select "Citizen" tab (plumbers login as citizens)
   - Phone: `9988776655`
   - OTP: `123456`
   - Captcha: Any text
   - Click "LOGIN"

2. **Access Plumber Dashboard**
   - Click "Citizen Services"
   - Expand "Jalanidhi" section
   - Click "Plumber Dashboard"

3. **Find the Application**
   - You should see the application submitted in Step 1
   - Status should show: **"Pending"** (Yellow)
   - Verify Application ID matches
   - Applicant Name: "Rajesh Kumar"

4. **View Application Details**
   - Click "View" button on the application
   - Review all sections:
     - ✅ Property Details
     - ✅ Applicant Details
     - ✅ Connection Details
   - Verify all information is correct

5. **Accept and Enter Connection Details**
   - Click **"Accept"** button at the bottom
   - You'll be redirected to "Connection Details" form

6. **Fill Connection Details Form**

   **Upload Documents:**
   - Site Sketch: Upload any image/PDF file
   - Estimate: Upload any image/PDF file
   - Both should show ✓ green checkmark after upload

   **Estimation Table:**
   - Default row: "Labor Charges | 3 members | 600"
   - Click "Add New Row" to add more items
   - Example rows:
     - Pipe Material | 50 meters | 5000
     - Fittings | 10 pieces | 1500
     - Installation Charges | Lump sum | 2000
   - Total will auto-calculate (e.g., ₹9,100.00)

   **Remarks/Comments (Optional):**
   - Add any notes (e.g., "Work can be completed in 5 days. All materials available.")

7. **Submit Connection Details**
   - Click **"Save & Submit"** button
   - Wait for success message
   - Application should disappear from plumber queue
   - Click "Back to Applications" or "Logout"

---

### **STEP 3: Citizen Reviews Plumber-Submitted Details**

1. **Login as Citizen Again**
   - Phone: `9876543210`
   - OTP: `123456`
   - Captcha: Any text
   - Click "LOGIN"

2. **Navigate to Application Status**
   - Click "Citizen Services"
   - Expand "Jalanidhi"
   - Click "Tap Connection"
   - Click "Application Status"

3. **Refresh to See Updated Status**
   - Click the **"Refresh"** button (Gold colored, top right)
   - Icon should spin while refreshing
   - Wait for refresh to complete

4. **Verify Status Changed**
   - Application status should now show: **"Under Review"** (Blue color)
   - This indicates plumber has submitted details

5. **View Plumber-Submitted Details**
   - Click **"View"** button on the application
   - A special "Citizen Review" page will open showing:

   **Section 1: Original Application Data**
   - ✅ Property Details
   - ✅ Applicant Details  
   - ✅ Connection Details
   - ✅ Plumber Information (Name: "Suresh Plumber", License: "PLB12345")

   **Section 2: Plumber Submitted Details** (New section!)
   - 📄 **Documents Status:**
     - ✅ Site Sketch: Uploaded
     - ✅ Estimate Document: Uploaded
   
   - 📊 **Estimation Table:**
     | S.No | Attributes | Unit | Amount |
     |------|------------|------|--------|
     | 1 | Labor Charges | 3 members | ₹600.00 |
     | 2 | Pipe Material | 50 meters | ₹5,000.00 |
     | 3 | Fittings | 10 pieces | ₹1,500.00 |
     | 4 | Installation | Lump sum | ₹2,000.00 |
     | **Total** | | | **₹9,100.00** |
   
   - 💬 **Plumber Comments:**
     - "Work can be completed in 5 days. All materials available."

6. **Submit Application to Caseworker**
   - Review all details carefully
   - If satisfied, click **"Submit Application"** button at bottom
   - Confirm submission
   - Application status will change to: **"Processing"**
   - Application will move to Caseworker queue

---

## 🎯 Expected Behavior & Dynamic Updates

### ✅ What Should Work Dynamically:

1. **Application Persistence:**
   - Application stays in citizen's list throughout the workflow
   - Application ID never changes
   - Only status and stage update

2. **Status Flow:**
   - Initial: `pending_plumber` → Badge: "Pending" (Yellow)
   - After plumber accepts: `pending_applicant_review` → Badge: "Under Review" (Blue)
   - After citizen submits: `pending_caseworker` → Badge: "Processing"

3. **Data Visibility:**
   - **Before plumber accepts:** Citizen sees basic application + "Pending" status
   - **After plumber accepts:** Citizen sees "Under Review" + can view plumber details
   - **Plumber details include:** Estimation table, documents status, total amount, comments

4. **Manual Refresh:**
   - Click gold "Refresh" button anytime to get latest status
   - No page reload required - seamless update
   - Refresh button shows spinning icon + "Refreshing..." text while loading

5. **View Actions:**
   - **Regular "View" button:** Shows ApplicationSummaryView with all data (including plumber details if available)
   - **Special "Submit Application" action:** Only appears when status is "Under Review" - opens CitizenReviewView

---

## 🐛 Troubleshooting

### Issue: Application not appearing in Plumber Dashboard
**Solution:** 
- Verify you used citizen phone (9876543210) to submit application
- Check application was submitted successfully (you got confirmation)
- Make sure you logged in as plumber (9988776655)

### Issue: Citizen doesn't see "Under Review" status
**Solution:**
- Click the **Refresh** button (don't reload page)
- Verify plumber clicked "Save & Submit" successfully
- Check browser console for any errors

### Issue: Plumber details not showing for citizen
**Solution:**
- Ensure application status is "Under Review" (blue badge)
- Check that plumber filled and submitted connection details form
- Click "View" button (not just looking at table row)

### Issue: "Submit Application" button not appearing for citizen
**Solution:**
- Status must be exactly "pending_applicant_review"
- Use the special "Submit Application" action (appears when status is "Under Review")
- Regular "View" button shows read-only summary

---

## 📊 Backend Data Flow

```
1. Citizen Applies:
   ├─ CREATE application → status: "pending_plumber"
   ├─ ADD to citizen:9876543210:applications[]
   └─ ADD to plumber:queue[]

2. Plumber Accepts:
   ├─ UPDATE application → status: "pending_applicant_review"
   ├─ ADD plumberConnectionData { estimationRows, totalAmount, documents, comments }
   ├─ ADD plumberDetails { plumberId, plumberName }
   ├─ REMOVE from plumber:queue[]
   └─ REMAINS in citizen:9876543210:applications[] ✅

3. Citizen Refreshes:
   ├─ FETCH all apps from citizen:9876543210:applications[]
   ├─ GET latest data for each application
   └─ DISPLAY with updated status + plumber data ✅

4. Citizen Reviews & Submits:
   ├─ UPDATE application → status: "pending_caseworker"
   ├─ ADD to caseworker:queue[]
   └─ REMAINS in citizen:9876543210:applications[] ✅
```

---

## 🎉 Success Criteria

The workflow is working correctly if:

- ✅ Citizen can submit application
- ✅ Application appears in Plumber Dashboard
- ✅ Plumber can accept and fill connection details
- ✅ After plumber submits, citizen's refresh shows "Under Review" status
- ✅ Citizen can click "View" and see ALL plumber-submitted details:
  - Documents upload status
  - Complete estimation table with total amount
  - Plumber comments/remarks
- ✅ Citizen can submit application to caseworker
- ✅ No page reloads needed - everything updates dynamically
- ✅ Status badges show correct colors at each stage

---

## 🚀 Next Steps (Future Implementation)

- [ ] Caseworker Dashboard (Phone: 9111111111)
- [ ] Revenue Officer Dashboard (Phone: 9222222222)  
- [ ] Field Engineer Dashboard (Phone: 9333333333)
- [ ] Commissioner Dashboard (Phone: 9444444444)
- [ ] End-to-end approval/rejection flow
- [ ] Document download functionality
- [ ] Email/SMS notifications at each stage

---

**Last Updated:** 2026-02-07
**Status:** ✅ Citizen → Plumber → Citizen Review Flow COMPLETE

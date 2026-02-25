# 🔐 LOGIN CREDENTIALS - Quick Reference

## Government of Karnataka - DMA Jalanidhi Portal

---

## 👤 CITIZEN LOGIN

| User Type | Phone Number | OTP | Plumber License | Notes |
|-----------|--------------|-----|-----------------|-------|
| **General Citizen** | `9876543210` | `123456` | - | Can apply for tap connections |
| **Citizen + Plumber** | `9988776655` | `123456` | `PLB12345` | Can access Plumber Dashboard |

---

## 🏛️ DEPARTMENT LOGIN

| Role | Phone Number | OTP | Employee ID | Name |
|------|--------------|-----|-------------|------|
| **Caseworker** | `9111111111` | `123456` | `CW001` | Priya Verma |
| **Revenue Officer** | `9222222222` | `123456` | `RO001` | Anil Reddy |
| **Field Engineer** | `9333333333` | `123456` | `FE001` | Karthik Rao |
| **Commissioner/CO** | `9444444444` | `123456` | `COM001` | Dr. Sudha Sharma |

---

## 📋 WORKFLOW STAGES

1. **Citizen** → Applies for New Tap Connection
2. **Plumber** → Reviews & submits estimation
3. **Citizen** → Reviews plumber details & submits
4. **Caseworker** → Verifies & selects scheme (🚧 Coming Soon)
5. **Revenue Officer** → Reviews & forwards (🚧 Coming Soon)
6. **Field Engineer** → Site visit & estimation (🚧 Coming Soon)
7. **Commissioner** → Final approval with DSC (🚧 Coming Soon)

---

## 🎯 QUICK TEST FLOW

### For Complete Testing:

1. **Login as Citizen** (`9876543210`) → Submit new application
2. **Logout** → **Login as Plumber** (`9988776655`) → Accept & fill details
3. **Logout** → **Login as Citizen** (`9876543210`) → Click Refresh → Review plumber details → Submit

---

## 💡 TIPS

- **Captcha:** You can enter any text (validation is disabled for demo)
- **All OTPs:** Always `123456` for all users
- **Phone Input:** Enter exactly as shown (10 digits)
- **Plumber Access:** Citizen with phone `9988776655` has special plumber access

---

## 🔄 STATUS BADGE COLORS

| Status | Badge Color | Meaning |
|--------|-------------|---------|
| Pending | 🟡 Yellow | Awaiting plumber review |
| Under Review | 🔵 Blue | Plumber submitted, awaiting citizen review |
| Processing | 🟢 Green | Submitted to caseworker |
| Declined | 🔴 Red | Rejected by plumber |
| Approved | 🟢 Green | Final approval granted |

---

**Print this card for quick reference during testing!** 📎

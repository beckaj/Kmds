import { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronRight, FileText, Layers, Shield, BarChart3, ArrowLeft } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

type Status = 'done' | 'partial' | 'missing';

interface TaskItem {
  id: number;
  title: string;
  status: Status;
  components: string[];
  notes: string;
}

interface TaskSection {
  title: string;
  icon: React.ReactNode;
  tasks: TaskItem[];
}

// ── Data ─────────────────────────────────────────────────────────────────────

const sections: TaskSection[] = [
  {
    title: 'One-Time Registration and Login',
    icon: <Shield className="w-5 h-5" />,
    tasks: [
      {
        id: 20,
        title: 'Unified One-Time Citizen Registration via KMDS / Seva Sindhu / KarnatakaOne / BengaluruOne',
        status: 'done',
        components: [
          'CitizenRegistration.tsx – Multi-step registration with OTP phone verification, personal details form, Aadhaar input, and password creation',
          'Login.tsx – Integrates CitizenRegistration as "Register" flow',
        ],
        notes: 'Full registration flow with phone OTP verification, personal details capture (name, email, Aadhaar), and password creation. Integrated into the Login screen with "New here? Register" link.',
      },
      {
        id: 21,
        title: 'Login by Citizen',
        status: 'done',
        components: [
          'Login.tsx – Role-based login supporting citizen, caseworker, field-engineer, revenue-officer, commissioner, ULB admin, DMA admin, project-director',
          'Server /login endpoint – Validates credentials against kv_store',
        ],
        notes: 'Fully implemented login with email/phone and password. Role-based redirection after successful authentication. Session persistence via localStorage.',
      },
      {
        id: 22,
        title: 'Login by Citizen – Forgot Password',
        status: 'done',
        components: [
          'ForgotPassword.tsx – 3-step flow: phone entry → OTP verification → new password setup',
          'Login.tsx – "Forgot Password" link triggers the ForgotPassword component',
        ],
        notes: 'Complete forgot password flow with phone number entry, OTP verification, and new password + confirm password form with strength validation.',
      },
      {
        id: 23,
        title: 'Login by Citizen – Change Password',
        status: 'missing',
        components: [],
        notes: 'No in-app "Change Password" feature exists after login. The ForgotPassword component handles password reset from the login screen, but there is no profile/settings page where a logged-in citizen can change their current password by entering old + new password.',
      },
    ],
  },
  {
    title: 'Plumber / Contractor',
    icon: <Layers className="w-5 h-5" />,
    tasks: [
      {
        id: 24,
        title: 'Login by Citizen Plumber – New License / Contractor Registration',
        status: 'done',
        components: [
          'PlumberRegistrationForm.tsx – Multi-step plumber license application form with personal details, qualification, experience, and document uploads',
          'PlumberDashboard.tsx – Plumber portal dashboard after login',
          'PlumberConnectionDetails.tsx – View assigned connection details',
        ],
        notes: 'Citizen can log in and submit a plumber license application. The form collects personal information, qualifications, experience details, and required documents.',
      },
      {
        id: 25,
        title: 'Workflow for Plumber / Contractor – New License Registration',
        status: 'done',
        components: [
          'CaseworkerPlumberLicenseDashboard.tsx – Caseworker reviews & verifies plumber license applications',
          'FieldEngineerPlumberLicenseDashboard.tsx – FE field verification of plumber applicant',
          'CommissionerPlumberLicenseDashboard.tsx – Commissioner final approval/rejection with DSC',
          'PlumberLicenseStatus.tsx – Citizen can track application status and progress',
          'PlumberLicenseResubmitForm.tsx – Citizen can resubmit rejected/rework applications',
        ],
        notes: 'Full 4-tier workflow: Citizen → Caseworker (document verification) → Field Engineer (physical verification) → Commissioner (approval + DSC). Supports approve, reject, and send-back-for-rework at each stage.',
      },
      {
        id: 26,
        title: 'Payment for Plumber / Contractor – New License Registration',
        status: 'done',
        components: [
          'PlumberLicensePaymentView.tsx – Payment interface for plumber license fees',
          'PlumberLicenseStatus.tsx – Triggers payment view after commissioner approval',
        ],
        notes: 'After commissioner approval, the citizen is prompted to pay the license fee. Payment interface with amount display, payment method selection, and confirmation.',
      },
      {
        id: 27,
        title: 'Generation of License / Agreement Certificate for Plumber / Contractor',
        status: 'done',
        components: [
          'CommissionerPlumberLicenseDashboard.tsx → PlumberLicenseCertificateGeneration component – Generates official license certificate with DSC',
          'Server /plumber-license/commissioner/generate-license endpoint',
          'PlumberLicenseStatus.tsx – Citizen can download issued certificate',
        ],
        notes: 'Commissioner generates the official plumber license certificate with Digital Signature Certificate (DSC). The system generates a unique license number. Citizens can view and download the certificate from their status page.',
      },
      {
        id: 28,
        title: 'Renewal Submission, Workflow, Payment, and Generation of Renewal License Certificate for Plumber',
        status: 'done',
        components: [
          'PlumberLicenseRenewal.tsx – Citizen submits renewal application',
          'CaseworkerPlumberLicenseRenewalDashboard.tsx – Caseworker reviews renewal',
          'FieldEngineerPlumberLicenseRenewalDashboard.tsx – FE verifies renewal',
          'CommissionerPlumberLicenseRenewalDashboard.tsx – Commissioner approves renewal + generates renewed certificate',
        ],
        notes: 'Complete renewal cycle mirrors the new license workflow. Citizen submits renewal → Caseworker → FE → Commissioner approval → Payment → Renewed certificate generation.',
      },
    ],
  },
  {
    title: 'Tap Connection – Application & Workflow',
    icon: <FileText className="w-5 h-5" />,
    tasks: [
      {
        id: 29,
        title: 'Citizen (Owner / Tenant) Application – New Tap Connection',
        status: 'done',
        components: [
          'NewTapConnection.tsx / NewTapConnectionForm.tsx – Multi-step application form',
          'ApplicantDetailsStep.tsx – Step 1: Personal & address details',
          'ConnectionDetailsStep.tsx – Step 2: Connection type, meter preference, property details',
          'CitizenBankDetailsForm.tsx – Step 3: Bank details for FBAS auto-debit',
          'CitizenReviewView.tsx – Step 4: Review & submit',
        ],
        notes: 'Comprehensive 4-step application form: Applicant Details → Connection Details (domestic/non-domestic/commercial/industrial, metered/non-metered) → Bank Details (FBAS) → Review & Submit. Supports owner/tenant distinction.',
      },
      {
        id: 30,
        title: 'Workflow Process – New Tap Connection',
        status: 'done',
        components: [
          'CaseworkerDashboard.tsx – Caseworker receives & processes applications',
          'CaseworkerApplicationView.tsx – Detailed application review by caseworker',
          'FieldEngineerDashboard.tsx – FE receives forwarded applications',
          'FieldEngineerApplicationView.tsx – FE field visit & report',
          'FieldEngineerScheduleVisit.tsx – FE schedules physical site inspection',
          'FieldReportView.tsx – FE submits field visit report with cost estimation',
          'RevenueOfficerDashboard.tsx – RO reviews FE report',
          'RevenueOfficerApplicationView.tsx – RO detailed review',
          'RevenueOfficerForwardPage.tsx – RO forwards to Commissioner',
          'CommissionerPage.tsx / CommissionerDashboard.tsx – Commissioner final decision',
          'CommissionerApplicationView.tsx – Commissioner detailed review with endorse/reject',
          'ApplicationStatus.tsx – Citizen tracks full workflow progress',
          'ApplicationSummaryView.tsx – Full application summary with all stages',
        ],
        notes: 'Complete 5-tier workflow: Citizen → Caseworker (verify documents) → Field Engineer (site visit + cost estimation) → Revenue Officer (review + forward) → Commissioner (approve/reject with endorsement letter). Full audit trail and remarks at every stage.',
      },
      {
        id: 31,
        title: 'Payment Process – New Tap Connection',
        status: 'done',
        components: [
          'CitizenPaymentView.tsx – Payment interface after commissioner approval',
          'CommissionerPaymentVerification.tsx – Commissioner verifies payment receipt',
          'PaymentLetterView.tsx – Generated payment demand letter',
        ],
        notes: 'After commissioner approval, citizen receives payment demand. Payment interface shows fee breakdown. Commissioner has payment verification dashboard to confirm received payments.',
      },
      {
        id: 32,
        title: 'Generation of Permission Certificate – New Tap Connection',
        status: 'done',
        components: [
          'CertificateView.tsx – Official permission certificate with all details',
          'ApplicationStatus.tsx – "View Certificate" button appears after approval',
        ],
        notes: 'Permission certificate generated after payment verification. Includes application details, connection type, approved costs, plumber assignment, and official authorization. Supports print/download.',
      },
      {
        id: 33,
        title: 'Plumber Installation, Field Engineer Review, and Final Closure – New Tap Connection',
        status: 'done',
        components: [
          'PlumberMobileApp.tsx – Plumber mobile interface for accepting assignments',
          'PlumberInstallationChecklist.tsx – Step-by-step installation checklist with photo uploads',
          'PlumberMobileAppList.tsx – Plumber views assigned connections',
          'FieldEngineerInstallationView.tsx – FE reviews plumber\'s installation work',
          'FieldEngineerMobileApp.tsx – FE mobile app for field visits',
          'FieldVisitChecklist.tsx – FE field visit checklist',
          'FieldVisitReport.tsx – FE generates visit report',
        ],
        notes: 'Full post-approval lifecycle: Caseworker assigns plumber → Plumber accepts on mobile app → Plumber completes installation with photo evidence → FE verifies installation on-site → FE approves/requests rework → Connection closed as completed.',
      },
    ],
  },
  {
    title: 'Tap Connection – Metering & Billing',
    icon: <BarChart3 className="w-5 h-5" />,
    tasks: [
      {
        id: 34,
        title: 'Authorization of Meter Reader / Bill Collector – Caseworker Entry and Assignment',
        status: 'done',
        components: [
          'BillCollectorDetails.tsx – Caseworker adds/manages bill collector profiles',
          'AssignWardToBillCollectors.tsx – Caseworker assigns wards to bill collectors',
          'FEBillCollectorApplications.tsx – FE views bill collector assignments',
        ],
        notes: 'Caseworker can add new bill collector details (name, phone, designation, district, ULB). Ward assignment allows mapping specific wards to bill collectors for meter reading and bill collection duties.',
      },
      {
        id: 35,
        title: 'Mobile App + Portable Printer with Automatic DCB Updating – Metered Connections',
        status: 'partial',
        components: [
          'BillCollectorMobileApp.tsx – Full mobile app with login, home, detail, DCB, billing, receipt, payment screens',
          'BillCollectorLogin.tsx – Bill collector mobile login',
          'BillCollectorHome.tsx – Ward-wise connection listing',
          'BillCollectorAppDetail.tsx – Individual connection details',
          'BillCollectorDCBForm.tsx – Meter reading entry & DCB form',
          'BillCollectorBillGeneration.tsx – Auto bill generation from meter reading',
          'BillCollectorBillReceipt.tsx – Receipt generation with print support',
          'BillCollectorPaymentMethods.tsx – Multiple payment method support',
          'Server endpoints for DCB save/update',
        ],
        notes: 'Mobile app is fully functional: login → view assigned wards → select connection → enter meter reading → auto-generate bill → collect payment → generate receipt with print. DCB records are automatically updated on the server. PARTIAL: "Portable printer" integration is simulated via browser print functionality (window.print). No native Bluetooth/USB printer SDK integration exists.',
      },
      {
        id: 36,
        title: 'View DCB Details – Metered Connections',
        status: 'done',
        components: [
          'DCBStatement.tsx – Full DCB (Demand, Collection, Balance) statement view for metered connections',
          'KMFReport.tsx – KMF No. 25 register format report for metered connections',
          'JalanihiSidebar.tsx – Navigation under "Payments & Billing > Metered" section',
        ],
        notes: 'Citizens can view their complete DCB history for metered connections. Includes demand amount, collection amount, balance, bill details, payment dates. Supports CSV export and print. KMF-25 register format also available.',
      },
      {
        id: 37,
        title: 'Reading Correction Request Raised by Caseworker',
        status: 'done',
        components: [
          'CaseworkerDCBCorrectionView.tsx – Caseworker initiates meter reading correction by entering RR number, viewing current readings, and submitting corrected values',
          'CaseworkerDCBCorrectionTracker.tsx – Tracks status of all submitted corrections',
          'RevenueOfficerDCBCorrectionDashboard.tsx – RO reviews correction requests',
          'RevenueOfficerDCBCorrectionView.tsx – RO detailed review of correction',
          'CommissionerDCBCorrectionDashboard.tsx – Commissioner reviews corrections forwarded by RO',
          'CommissionerDCBCorrectionView.tsx – Commissioner approves/rejects with auto DCB recalculation',
          'ULBAdminDCBCorrection.tsx – ULB Admin DCB correction view',
        ],
        notes: 'Full correction workflow: Caseworker enters RR number → fetches current DCB → enters corrected meter reading with reason → forwards to Revenue Officer → RO reviews and forwards to Commissioner → Commissioner approves (triggers auto DCB recalculation, bill regeneration, KMF-25 update) or rejects. Also functions as the "DCB Correction (Edit) Request" flow (Task #52).',
      },
      {
        id: 38,
        title: 'DCB Generation for Non-Metered Connections – New Tap Connection',
        status: 'done',
        components: [
          'NonMeteredDCBStatement.tsx – DCB statement for non-metered (flat-rate) connections',
          'NonMeteredReceipts.tsx – Payment receipts for non-metered connections',
          'NonMeteredKMFReport.tsx – KMF-25 register for non-metered connections',
          'JalanihiSidebar.tsx – Navigation under "Payments & Billing > Non-Metered" section',
        ],
        notes: 'Complete DCB management for non-metered connections with flat slab-rate billing. Includes demand generation based on tariff configuration, collection tracking, balance statement, receipt generation, and KMF-25 format reporting.',
      },
      {
        id: 39,
        title: 'Receipt Generation after Payment',
        status: 'done',
        components: [
          'PaymentReceipts.tsx – Metered connection payment receipts with search, view, print, download',
          'NonMeteredReceipts.tsx – Non-metered connection receipts',
          'BillCollectorBillReceipt.tsx – Bill collector mobile receipt generation',
          'CitizenPaymentView.tsx – Generates receipt after online payment',
        ],
        notes: 'Receipts are generated after every payment: (1) Online payment by citizen → digital receipt, (2) Bill collector field collection → mobile receipt with print, (3) Citizen can view all past receipts in the Payments & Billing section with search, pagination, and print/download functionality.',
      },
    ],
  },
  {
    title: 'Tap Connection – Disconnection',
    icon: <FileText className="w-5 h-5" />,
    tasks: [
      {
        id: 40,
        title: 'Citizen Application for Tap Disconnection (Voluntary)',
        status: 'done',
        components: [
          'TapDisconnection.tsx / TapDisconnectionForm.tsx – Disconnection application form with RR number lookup, reason selection, and supporting documents',
        ],
        notes: 'Citizen can apply for voluntary tap disconnection by entering their RR number, selecting a reason for disconnection, providing additional remarks, and uploading supporting documents.',
      },
      {
        id: 41,
        title: 'Work Process for Tap Disconnection (Voluntary)',
        status: 'done',
        components: [
          'CaseworkerDashboard.tsx (applicationType="disconnection") – Caseworker processes disconnection requests',
          'FieldEngineerDisconnectionView.tsx – FE verifies disconnection on site',
          'PlumberDisconnectionChecklist.tsx – Plumber performs physical disconnection',
          'PlumberMobileApp.tsx – Plumber accepts disconnection work on mobile',
          'RevenueOfficerDashboard.tsx – RO reviews disconnection',
          'CommissionerDisconnectionView.tsx – Commissioner final approval',
        ],
        notes: 'Full workflow: Citizen applies → Caseworker verifies → FE site visit → Plumber performs disconnection work (mobile checklist with photos) → FE verifies disconnection → RO reviews → Commissioner approves/rejects.',
      },
      {
        id: 42,
        title: 'Payment for Tap Disconnection (Voluntary)',
        status: 'done',
        components: [
          'CitizenPaymentView.tsx – Handles disconnection payment (shared payment component)',
          'ApplicationStatus.tsx – Shows "Make Payment" button for approved disconnections',
        ],
        notes: 'Payment process for disconnection uses the same CitizenPaymentView component. Disconnection fee is calculated and presented to the citizen after commissioner approval.',
      },
      {
        id: 43,
        title: 'Generation of Permission for Tap Disconnection (Voluntary)',
        status: 'done',
        components: [
          'CertificateView.tsx – Generates disconnection permission certificate',
          'CommissionerDisconnectionView.tsx – Endorsement letter generation for disconnection',
        ],
        notes: 'Disconnection permission certificate is generated through the same CertificateView component. Includes disconnection date, reason, final meter reading, and authorization details.',
      },
      {
        id: 44,
        title: 'Due Payment Notice Cycle and Enforced Tap Disconnection',
        status: 'missing',
        components: [],
        notes: 'NOT IMPLEMENTED. No automated due payment notice cycle exists. No mechanism for sending overdue notices (1st notice, 2nd notice, final notice). No enforced/involuntary disconnection workflow initiated by the system or officials for non-payment. This would require: (1) Configurable notice period rules, (2) Automated notice generation for overdue balances, (3) Notice tracking (sent date, delivery status), (4) Enforced disconnection initiation by Revenue Officer/Commissioner after notice period expires, (5) Different workflow from voluntary disconnection.',
      },
      {
        id: 45,
        title: 'DCB Update for Tap Disconnection (Voluntary or Enforced)',
        status: 'partial',
        components: [
          'Server index.tsx – DCB update logic exists in commissioner approval endpoints',
          'CommissionerDCBCorrectionView.tsx – Manual DCB correction available',
        ],
        notes: 'PARTIAL: When disconnection is completed, the server marks the connection status but does NOT automatically zero out future demand in the DCB record, close the billing cycle, or update the KMF-25 register to reflect disconnection. Manual DCB correction can be used as a workaround. A dedicated "DCB closure on disconnection" automated process is missing.',
      },
    ],
  },
  {
    title: 'Tap Connection – Reconnection',
    icon: <FileText className="w-5 h-5" />,
    tasks: [
      {
        id: 46,
        title: 'Citizen Application for Tap Re-connection (Same or Different Category)',
        status: 'done',
        components: [
          'TapReconnection.tsx / TapReconnectionForm.tsx – Reconnection application with RR number lookup, category selection (same/different), supporting documents',
        ],
        notes: 'Citizen can apply for reconnection after a previous disconnection. Form includes RR number verification, option to reconnect in same or different connection category, reason for reconnection, and document uploads.',
      },
      {
        id: 47,
        title: 'Workflow Process for Tap Re-connection',
        status: 'done',
        components: [
          'CaseworkerDashboard.tsx (applicationType="reconnection") – Caseworker processes reconnection requests',
          'FieldEngineerReconnectionView.tsx – FE verifies reconnection feasibility',
          'PlumberReconnectionChecklist.tsx – Plumber performs physical reconnection',
          'PlumberMobileApp.tsx – Plumber accepts reconnection work on mobile',
          'RevenueOfficerReconnectionView.tsx – RO reviews reconnection',
          'CommissionerReconnectionView.tsx – Commissioner final approval with endorsement letter',
        ],
        notes: 'Full workflow: Citizen applies → Caseworker verifies → FE site inspection → Plumber reconnection work (mobile checklist with photos) → FE verifies reconnection → RO reviews → Commissioner approves/rejects with endorsement letter.',
      },
      {
        id: 48,
        title: 'Payment Process for Tap Re-connection',
        status: 'done',
        components: [
          'CitizenReconnectionPaymentView.tsx – Dedicated reconnection payment view showing outstanding dues + reconnection fee',
          'ApplicationStatus.tsx – Triggers reconnection payment flow',
        ],
        notes: 'Dedicated payment view for reconnection that shows previous disconnection details, any outstanding balance, reconnection fee, and total payable amount. Separate from the standard payment view.',
      },
      {
        id: 49,
        title: 'Generation of Permission for Tap Re-connection',
        status: 'done',
        components: [
          'CertificateView.tsx – Generates reconnection permission certificate',
          'CommissionerReconnectionView.tsx – Endorsement letter for reconnection',
        ],
        notes: 'Reconnection permission certificate generated through CertificateView component. Commissioner also generates endorsement/rejection letters during the approval process.',
      },
      {
        id: 50,
        title: 'DCB Update for Tap Re-connection',
        status: 'partial',
        components: [
          'Server index.tsx – DCB update logic for reconnection completion',
          'CommissionerDCBCorrectionView.tsx – Manual DCB correction available',
        ],
        notes: 'PARTIAL: When reconnection is completed, the server updates the application status but does NOT automatically reinstate the billing cycle in the DCB, create a new demand entry from the reconnection date, or update the KMF-25 register. Manual DCB correction can be used. An automated "DCB reinstatement on reconnection" process is missing.',
      },
    ],
  },
  {
    title: 'Tap Connection – Change & Correction',
    icon: <FileText className="w-5 h-5" />,
    tasks: [
      {
        id: 51,
        title: 'Change of Connection Category (Tap)',
        status: 'done',
        components: [
          'ChangeOfConnectionType.tsx / ChangeOfConnectionTypeForm.tsx – Citizen submits change request with RR lookup',
          'CaseworkerDashboard.tsx (applicationType="changeConnection") – Caseworker processes change requests',
          'FieldEngineerChangeConnectionView.tsx – FE verifies change requirements',
          'FieldEngineerChangeConnectionVerifyView.tsx – FE verifies plumber\'s change work',
          'PlumberChangeConnectionChecklist.tsx – Plumber performs physical changes',
          'RevenueOfficerChangeConnectionView.tsx – RO reviews change request',
          'CommissionerChangeConnectionView.tsx – Commissioner final approval',
        ],
        notes: 'Complete workflow for changing connection category (e.g., Domestic → Commercial). Citizen applies with RR number → Caseworker verifies → FE inspects → Plumber makes changes → FE verifies → RO reviews → Commissioner approves. Supports tariff recalculation.',
      },
      {
        id: 52,
        title: 'DCB Correction (Edit) Request by Caseworker – Tap Connection',
        status: 'done',
        components: [
          'CaseworkerDCBCorrectionView.tsx – Caseworker enters corrected meter reading',
          'CaseworkerDCBCorrectionTracker.tsx – Caseworker tracks correction status',
          'RevenueOfficerDCBCorrectionDashboard.tsx – RO reviews corrections',
          'RevenueOfficerDCBCorrectionView.tsx – RO detailed correction review',
          'CommissionerDCBCorrectionDashboard.tsx – Commissioner correction dashboard',
          'CommissionerDCBCorrectionView.tsx – Commissioner approves/rejects with auto recalculation',
          'ULBAdminDCBCorrection.tsx – ULB Admin correction oversight',
          'ULBAdminDCBAdjustment.tsx – ULB Admin DCB adjustment tool',
        ],
        notes: 'Full DCB correction workflow: Caseworker enters RR number → views current DCB → enters corrected meter reading with justification → forwards to Revenue Officer → RO reviews & forwards to Commissioner → Commissioner approves (auto-recalculates DCB, regenerates bill with same bill number, updates KMF-25, locks corrected bill, notifies caseworker & citizen) or rejects with reason.',
      },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStatusIcon(status: Status) {
  if (status === 'done') return <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />;
  if (status === 'partial') return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
  return <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
}

function getStatusBadge(status: Status) {
  if (status === 'done') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 font-['Poppins',sans-serif]">
        <CheckCircle2 className="w-3 h-3" /> Completed
      </span>
    );
  }
  if (status === 'partial') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-['Poppins',sans-serif]">
        <AlertTriangle className="w-3 h-3" /> Partial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 font-['Poppins',sans-serif]">
      <XCircle className="w-3 h-3" /> Not Implemented
    </span>
  );
}

function getStatusColor(status: Status) {
  if (status === 'done') return 'border-l-green-500';
  if (status === 'partial') return 'border-l-amber-500';
  return 'border-l-red-500';
}

// ── Component ────────────────────────────────────────────────────────────────

interface TaskChecklistProps {
  onBack?: () => void;
}

export default function TaskChecklist({ onBack }: TaskChecklistProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');

  const toggleTask = (id: number) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<number>();
    sections.forEach((s) => s.tasks.forEach((t) => allIds.add(t.id)));
    setExpandedTasks(allIds);
  };

  const collapseAll = () => {
    setExpandedTasks(new Set());
  };

  // Compute stats
  const allTasks = sections.flatMap((s) => s.tasks);
  const totalTasks = allTasks.length;
  const doneCount = allTasks.filter((t) => t.status === 'done').length;
  const partialCount = allTasks.filter((t) => t.status === 'partial').length;
  const missingCount = allTasks.filter((t) => t.status === 'missing').length;
  const completionPct = Math.round(((doneCount + partialCount * 0.5) / totalTasks) * 100);

  const filteredSections = sections.map((s) => ({
    ...s,
    tasks: filterStatus === 'all' ? s.tasks : s.tasks.filter((t) => t.status === filterStatus),
  })).filter((s) => s.tasks.length > 0);

  return (
    <div className="min-h-screen bg-[#f5f5fa] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#1f3a5f] hover:text-[#1f3a5f]/80 mb-4 font-['Poppins',sans-serif] text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </button>
        )}

        <div className="bg-white rounded-[10px] shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Title Bar */}
          <div className="bg-[#1f3a5f] px-6 py-4">
            <h1 className="text-white text-xl font-bold font-['Poppins',sans-serif]">
              Jalanidhi (KMDS) – Implementation Checklist
            </h1>
            <p className="text-white/70 text-sm font-['Poppins',sans-serif] mt-1">
              Use Cases #20 – #52 · Department of Municipal Administration, Government of Karnataka
            </p>
          </div>

          {/* Stats Bar */}
          <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Progress Bar */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 font-['Poppins',sans-serif]">
                    Overall Completion
                  </span>
                  <span className="text-sm font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                    {completionPct}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${completionPct}%`,
                      background: completionPct >= 80 ? 'linear-gradient(90deg, #16a34a, #22c55e)' : completionPct >= 50 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #ef4444, #f87171)',
                    }}
                  />
                </div>
              </div>

              {/* Stats Chips */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setFilterStatus(filterStatus === 'all' ? 'all' : 'all')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-['Poppins',sans-serif] transition-all cursor-pointer ${filterStatus === 'all' ? 'bg-[#1f3a5f] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  All: {totalTasks}
                </button>
                <button
                  onClick={() => setFilterStatus(filterStatus === 'done' ? 'all' : 'done')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-['Poppins',sans-serif] transition-all cursor-pointer ${filterStatus === 'done' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> {doneCount}
                </button>
                <button
                  onClick={() => setFilterStatus(filterStatus === 'partial' ? 'all' : 'partial')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-['Poppins',sans-serif] transition-all cursor-pointer ${filterStatus === 'partial' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> {partialCount}
                </button>
                <button
                  onClick={() => setFilterStatus(filterStatus === 'missing' ? 'all' : 'missing')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-['Poppins',sans-serif] transition-all cursor-pointer ${filterStatus === 'missing' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                >
                  <XCircle className="w-3.5 h-3.5" /> {missingCount}
                </button>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-3">
            <button
              onClick={expandAll}
              className="text-xs font-medium text-[#0066cc] hover:text-[#0052a3] font-['Poppins',sans-serif] transition-colors"
            >
              Expand All
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={collapseAll}
              className="text-xs font-medium text-[#0066cc] hover:text-[#0052a3] font-['Poppins',sans-serif] transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Sections */}
        {filteredSections.map((section) => (
          <div key={section.title} className="mb-6">
            {/* Section Header */}
            <div className="flex items-center gap-2.5 mb-3 px-1">
              <div className="w-8 h-8 bg-[#1f3a5f]/10 rounded-lg flex items-center justify-center text-[#1f3a5f]">
                {section.icon}
              </div>
              <h2 className="text-base font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                {section.title}
              </h2>
              <span className="text-xs text-gray-500 font-['Poppins',sans-serif] bg-gray-100 px-2 py-0.5 rounded-full">
                {section.tasks.filter((t) => t.status === 'done').length}/{section.tasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="space-y-2">
              {section.tasks.map((task) => {
                const isExpanded = expandedTasks.has(task.id);
                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-lg border border-gray-200 overflow-hidden border-l-4 ${getStatusColor(task.status)} shadow-sm hover:shadow-md transition-shadow`}
                  >
                    {/* Task Header */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50/50 transition-colors"
                    >
                      {getStatusIcon(task.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#1f3a5f]/50 font-['Poppins',sans-serif]">
                            #{task.id}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 font-['Poppins',sans-serif]">
                            {task.title}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusBadge(task.status)}
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        {/* Notes */}
                        <div className="mt-3 mb-3">
                          <p className="text-sm text-gray-700 font-['Poppins',sans-serif] leading-relaxed">
                            {task.notes}
                          </p>
                        </div>

                        {/* Components */}
                        {task.components.length > 0 ? (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-['Poppins',sans-serif] mb-2">
                              Implementing Components ({task.components.length})
                            </p>
                            <div className="space-y-1.5">
                              {task.components.map((comp, idx) => {
                                const parts = comp.split(' – ');
                                const fileName = parts[0] || '';
                                const desc = parts.length > 1 ? parts.slice(1).join(' – ') : '';
                                return (
                                  <div key={idx} className="flex items-start gap-2 text-xs">
                                    <code className="px-1.5 py-0.5 bg-[#1f3a5f]/5 text-[#1f3a5f] rounded font-mono text-[11px] flex-shrink-0 mt-0.5">
                                      {fileName}
                                    </code>
                                    {desc && (
                                      <span className="text-gray-500 font-['Poppins',sans-serif] leading-relaxed">
                                        {desc}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-red-800 font-['Poppins',sans-serif]">
                              No components implemented for this use case.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Summary Footer */}
        <div className="bg-white rounded-[10px] shadow-sm border border-gray-200 overflow-hidden mt-8 mb-8">
          <div className="bg-[#1f3a5f] px-6 py-3">
            <h2 className="text-white text-sm font-bold font-['Poppins',sans-serif]">
              Summary & Recommendations
            </h2>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
                <p className="text-3xl font-bold text-green-700 font-['Poppins',sans-serif]">{doneCount}</p>
                <p className="text-xs text-green-600 font-semibold font-['Poppins',sans-serif] mt-1">Fully Implemented</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 text-center">
                <p className="text-3xl font-bold text-amber-700 font-['Poppins',sans-serif]">{partialCount}</p>
                <p className="text-xs text-amber-600 font-semibold font-['Poppins',sans-serif] mt-1">Partially Implemented</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200 text-center">
                <p className="text-3xl font-bold text-red-700 font-['Poppins',sans-serif]">{missingCount}</p>
                <p className="text-xs text-red-600 font-semibold font-['Poppins',sans-serif] mt-1">Not Implemented</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                Pending Items to Address:
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 bg-red-50 rounded-lg p-3 border border-red-100">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 font-['Poppins',sans-serif]">#23 – Change Password (Post-Login)</p>
                    <p className="text-xs text-red-600 font-['Poppins',sans-serif] mt-0.5">
                      Need a profile/settings page where logged-in users can change their password (old password + new password + confirm).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-red-50 rounded-lg p-3 border border-red-100">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 font-['Poppins',sans-serif]">#44 – Due Payment Notice Cycle & Enforced Disconnection</p>
                    <p className="text-xs text-red-600 font-['Poppins',sans-serif] mt-0.5">
                      Requires: configurable notice periods, automated overdue notice generation, notice tracking, enforced disconnection initiation by officials, and a separate workflow from voluntary disconnection.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 font-['Poppins',sans-serif]">#35 – Portable Printer Integration</p>
                    <p className="text-xs text-amber-600 font-['Poppins',sans-serif] mt-0.5">
                      Bill Collector mobile app uses browser print (window.print). Native Bluetooth/USB printer SDK integration for portable receipt printers is not implemented.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 font-['Poppins',sans-serif]">#45 & #50 – Automated DCB Updates on Disconnection/Reconnection</p>
                    <p className="text-xs text-amber-600 font-['Poppins',sans-serif] mt-0.5">
                      Server updates application status but doesn't automatically close/reinstate the billing cycle in DCB or update KMF-25 register. Manual DCB correction is available as a workaround.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

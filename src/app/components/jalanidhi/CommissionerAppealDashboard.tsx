import { useState, useEffect } from 'react';
import {
  ChevronLeft, Scale, Eye, RefreshCw, Search, CheckCircle, XCircle,
  MessageSquare, FileText, User, MapPin, Droplet, Wrench, Calculator, ShieldCheck
} from 'lucide-react';
import { GovButton } from '../ui/gov-button';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import PaymentLetterView from './PaymentLetterView';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

interface AppealApplication {
  id: string;
  ulb: string;
  menu: string;
  subMenu: string;
  dateOfRejection: string;
  dateOfAppealRequested: string;
  reasonForAppeal: string;
  status: string;
  currentStage: string;
  originalApplicationId: string;
  citizenName: string;
  citizenPhone: string;
  applicationDetails: any;
  workflow: any;
}

// Dummy original application data (same as PD page — shared reference data)
const ORIGINAL_APP_DATA: Record<string, any> = {
  'NTC/2025/HBD/0012': {
    applicationNo: 'NTC/2025/HBD/0012',
    submittedAt: '2025-10-15T10:30:00',
    applicantDetails: {
      applicantName: 'Ramesh Kumar Patil', fatherName: 'Basavaraj Patil', mobile: '9876543210',
      email: 'ramesh.patil@gmail.com', aadharNumber: '8765 4321 9012', doorNumber: '45/2A',
      wardNumber: 'Ward 12', street: 'MG Road', address: '45/2A, MG Road, Hubli - 580020',
    },
    propertyDetails: { district: 'Dharwad', ulb: 'Hubli-Dharwad Municipal Corporation', ulbType: 'Corporation', authorityType: 'Municipal', propertyType: 'Residential', ownershipType: 'Self-Owned' },
    connectionDetails: { connectionType: 'Domestic', propertyType: 'Residential' },
    plumberDetails: { plumberName: 'Suresh M. Gowda', licenseNo: 'PLB/2024/HBD/056' },
    plumberEstimation: {
      rows: [
        { id: '1', attribute: 'GI Pipe 15mm', measurement: '12 meters', price: 1800 },
        { id: '2', attribute: 'PVC Pipe 20mm', measurement: '8 meters', price: 960 },
        { id: '3', attribute: 'Stop Cock 15mm', measurement: '2 Nos', price: 450 },
        { id: '4', attribute: 'Ferrule 15mm', measurement: '1 No', price: 350 },
        { id: '5', attribute: 'Labour Charges', measurement: 'Lump Sum', price: 2500 },
      ],
      totalAmount: 6060,
      comments: 'Standard domestic connection. Route verified through MG Road main pipeline. No obstructions found.',
    },
    fieldVisitReport: {
      engineerName: 'Anand S. Kulkarni',
      siteObservations: 'Property is located on MG Road, Hubli. Main water pipeline (200mm DI pipe) runs along the road at approximately 1.5m depth. Connection point identified near the property boundary wall. No underground utilities obstruction detected. Soil type is red laterite, easy for trenching.',
      engineerRemarks: 'Feasible for new domestic connection. Recommended 15mm ferrule connection from the main line. Distance from main to property meter point is approximately 12 meters. Standard trenching required.',
      locationVerification: { verified: true, verifiedAt: '2025-11-05T14:20:00', address: '45/2A, MG Road, Hubli - 580020', latitude: 15.3647, longitude: 75.1240 },
      fieldEngineerEstimation: {
        rows: [
          { id: '1', attribute: 'GI Pipe 15mm', measurement: '12 meters', price: 1800 },
          { id: '2', attribute: 'PVC Pipe 20mm', measurement: '8 meters', price: 960 },
          { id: '3', attribute: 'Stop Cock 15mm', measurement: '2 Nos', price: 450 },
          { id: '4', attribute: 'Ferrule 15mm', measurement: '1 No', price: 350 },
          { id: '5', attribute: 'Labour Charges', measurement: 'Lump Sum', price: 2500 },
          { id: '6', attribute: 'Road Restoration', measurement: 'Lump Sum', price: 1200 },
        ],
        totalAmount: 7260,
      },
    },
    workflow: {
      caseworker: { name: 'Prakash Hegde', comment: 'Documents verified. Applicant has valid property ownership proof and Aadhar. Forwarded to Revenue Officer for zone validation.', forwardedAt: '2025-10-18T11:45:00' },
      revenueOfficer: { name: 'Kavitha R. Naik', comment: 'Ward 12 zone verified. No outstanding dues on property. Water supply availability confirmed for this zone. Forwarded to Field Engineer for site inspection.', forwardedAt: '2025-10-22T16:30:00' },
      fieldEngineer: { name: 'Anand S. Kulkarni', remarks: 'Site inspection completed. Location verified via GPS. Connection feasible from MG Road main pipeline. Estimation prepared and attached. Forwarding to Commissioner for final approval.', forwardedAt: '2025-11-05T17:00:00' },
      commissioner: { name: 'Dr. Suresh B. Angadi', comment: 'Application rejected. The property falls under a zone where the water supply infrastructure is being upgraded under the AMRUT 2.0 scheme. New connections in this zone are temporarily suspended until the pipeline replacement work is completed (expected March 2026). The applicant may re-apply after the infrastructure upgrade is completed.', decidedAt: '2025-12-10T10:15:00', status: 'rejected' },
    },
  },
  'NTC/2025/HBD/0037': {
    applicationNo: 'NTC/2025/HBD/0037', submittedAt: '2025-09-20T09:15:00',
    applicantDetails: { applicantName: 'Lakshmi Devi Joshi', fatherName: 'Venkatesh Joshi', mobile: '9123456789', email: 'lakshmi.joshi@yahoo.com', aadharNumber: '6543 2109 8765', doorNumber: '12/B', wardNumber: 'Ward 5', street: 'Station Road', address: '12/B, Station Road, Dharwad - 580001' },
    propertyDetails: { district: 'Dharwad', ulb: 'Hubli-Dharwad Municipal Corporation', ulbType: 'Corporation', authorityType: 'Municipal', propertyType: 'Commercial', ownershipType: 'Rented' },
    connectionDetails: { connectionType: 'Commercial', propertyType: 'Commercial' },
    plumberDetails: { plumberName: 'Manoj D. Shetty', licenseNo: 'PLB/2024/HBD/023' },
    plumberEstimation: {
      rows: [
        { id: '1', attribute: 'GI Pipe 20mm', measurement: '18 meters', price: 3600 },
        { id: '2', attribute: 'PVC Pipe 25mm', measurement: '10 meters', price: 1500 },
        { id: '3', attribute: 'Stop Cock 20mm', measurement: '2 Nos', price: 700 },
        { id: '4', attribute: 'Ferrule 20mm', measurement: '1 No', price: 550 },
        { id: '5', attribute: 'Labour Charges', measurement: 'Lump Sum', price: 4000 },
      ],
      totalAmount: 10350, comments: 'Commercial connection requiring 20mm pipe. Longer route due to building setback from main road.',
    },
    fieldVisitReport: {
      engineerName: 'Priya S. Desai',
      siteObservations: 'Commercial property on Station Road. Main pipeline is 150mm CI pipe, older infrastructure. Building is set back 18m from road. Requires trenching through parking area.',
      engineerRemarks: 'Connection feasible but requires larger bore pipe for commercial use. Route through parking area needs restoration. Existing pipeline pressure may be insufficient during peak hours.',
      locationVerification: { verified: true, verifiedAt: '2025-10-08T11:45:00', address: '12/B, Station Road, Dharwad - 580001', latitude: 15.4589, longitude: 75.0078 },
      fieldEngineerEstimation: {
        rows: [
          { id: '1', attribute: 'GI Pipe 20mm', measurement: '18 meters', price: 3600 },
          { id: '2', attribute: 'PVC Pipe 25mm', measurement: '10 meters', price: 1500 },
          { id: '3', attribute: 'Stop Cock 20mm', measurement: '2 Nos', price: 700 },
          { id: '4', attribute: 'Ferrule 20mm', measurement: '1 No', price: 550 },
          { id: '5', attribute: 'Labour Charges', measurement: 'Lump Sum', price: 4000 },
          { id: '6', attribute: 'Road & Parking Restoration', measurement: 'Lump Sum', price: 2800 },
        ],
        totalAmount: 13150,
      },
    },
    workflow: {
      caseworker: { name: 'Deepa M. Hiremath', comment: 'Commercial application verified. Rental agreement and trade license copies attached. NOC from property owner present. Forwarded to Revenue Officer.', forwardedAt: '2025-09-25T14:20:00' },
      revenueOfficer: { name: 'Kavitha R. Naik', comment: 'Ward 5 zone check completed. Property tax records verified. No outstanding dues. Commercial connection rate applicable. Forwarded to Field Engineer.', forwardedAt: '2025-09-30T10:00:00' },
      fieldEngineer: { name: 'Priya S. Desai', remarks: 'Site inspected. Connection route identified through parking area. Pipeline pressure noted as marginal for commercial use during peak demand. Estimation prepared with restoration charges. Forwarding to Commissioner.', forwardedAt: '2025-10-08T16:30:00' },
      commissioner: { name: 'Dr. Suresh B. Angadi', comment: 'Application rejected. The applicant has provided a rental agreement but the property ownership verification reveals pending litigation on the property (Civil Suit No. CS/2024/1456 in Dharwad Civil Court). As per KMDS guidelines, new water connections cannot be sanctioned for properties with pending legal disputes. The applicant should resolve the property dispute first and re-apply with updated legal clearance documents.', decidedAt: '2025-11-28T11:30:00', status: 'rejected' },
    },
  },
  'NTC/2025/HBD/0045': {
    applicationNo: 'NTC/2025/HBD/0045', submittedAt: '2025-11-01T08:45:00',
    applicantDetails: { applicantName: 'Mohammed Irfan Shaikh', fatherName: 'Abdul Kareem Shaikh', mobile: '9988776655', email: 'irfan.shaikh@gmail.com', aadharNumber: '4321 0987 6543', doorNumber: '78/1', wardNumber: 'Ward 18', street: 'Lamington Road', address: '78/1, Lamington Road, Hubli - 580021' },
    propertyDetails: { district: 'Dharwad', ulb: 'Hubli-Dharwad Municipal Corporation', ulbType: 'Corporation', authorityType: 'Municipal', propertyType: 'Residential', ownershipType: 'Self-Owned' },
    connectionDetails: { connectionType: 'Domestic', propertyType: 'Residential' },
    plumberDetails: { plumberName: 'Rajesh P. Naik', licenseNo: 'PLB/2023/HBD/089' },
    plumberEstimation: {
      rows: [
        { id: '1', attribute: 'GI Pipe 15mm', measurement: '15 meters', price: 2250 },
        { id: '2', attribute: 'PVC Pipe 20mm', measurement: '6 meters', price: 720 },
        { id: '3', attribute: 'Stop Cock 15mm', measurement: '2 Nos', price: 450 },
        { id: '4', attribute: 'Ferrule 15mm', measurement: '1 No', price: 350 },
        { id: '5', attribute: 'Labour Charges', measurement: 'Lump Sum', price: 3000 },
      ],
      totalAmount: 6770, comments: 'Domestic connection with slightly longer route due to narrow lane access. Connection from Lamington Road main line.',
    },
    fieldVisitReport: {
      engineerName: 'Anand S. Kulkarni',
      siteObservations: 'Property located in a densely built area off Lamington Road. Narrow access lane (approx 3m wide). Main pipeline runs along Lamington Road. Trenching will affect pedestrian access temporarily. Existing drainage line runs parallel at 0.8m depth — needs careful excavation.',
      engineerRemarks: 'Connection feasible but requires careful execution due to proximity to existing drainage line. Recommended hand trenching for the last 5 meters near the property. No blasting required.',
      locationVerification: { verified: true, verifiedAt: '2025-11-20T10:30:00', address: '78/1, Lamington Road, Hubli - 580021', latitude: 15.3510, longitude: 75.1350 },
      fieldEngineerEstimation: {
        rows: [
          { id: '1', attribute: 'GI Pipe 15mm', measurement: '15 meters', price: 2250 },
          { id: '2', attribute: 'PVC Pipe 20mm', measurement: '6 meters', price: 720 },
          { id: '3', attribute: 'Stop Cock 15mm', measurement: '2 Nos', price: 450 },
          { id: '4', attribute: 'Ferrule 15mm', measurement: '1 No', price: 350 },
          { id: '5', attribute: 'Labour Charges', measurement: 'Lump Sum', price: 3000 },
          { id: '6', attribute: 'Road Restoration (Narrow Lane)', measurement: 'Lump Sum', price: 800 },
        ],
        totalAmount: 7570,
      },
    },
    workflow: {
      caseworker: { name: 'Prakash Hegde', comment: 'Documents verified. Property ownership khata extract valid. Aadhar verified. Application is in order. Forwarding to Revenue Officer.', forwardedAt: '2025-11-05T09:30:00' },
      revenueOfficer: { name: 'Mahesh V. Hosamani', comment: 'Ward 18 zone check completed. Property has existing arrears of ₹2,400 on SWM charges from FY 2024-25. However, water supply zone validation is cleared. Forwarded with note on pending SWM dues.', forwardedAt: '2025-11-12T15:00:00' },
      fieldEngineer: { name: 'Anand S. Kulkarni', remarks: 'Site inspection completed. Location GPS verified. Connection route identified. Drainage line proximity noted — hand trenching recommended near property. Estimation prepared. Forwarding to Commissioner.', forwardedAt: '2025-11-20T16:45:00' },
      commissioner: { name: 'Dr. Suresh B. Angadi', comment: 'Application rejected. The Revenue Officer has noted outstanding SWM arrears of ₹2,400 for FY 2024-25. As per Municipal Corporation bye-laws (Section 147), no new utility connections shall be sanctioned until all existing municipal dues are cleared. The applicant must clear the pending SWM charges and obtain a No Dues Certificate from the Revenue Section before re-applying.', decidedAt: '2026-01-05T09:45:00', status: 'rejected' },
    },
  },
  'NTC/2026/HBD/0003': {
    applicationNo: 'NTC/2026/HBD/0003', submittedAt: '2025-12-10T11:00:00',
    applicantDetails: { applicantName: 'Sanjay B. Kulkarni', fatherName: 'Balappa Kulkarni', mobile: '9345678901', email: 'sanjay.kulkarni@rediffmail.com', aadharNumber: '2109 8765 4321', doorNumber: '23/C', wardNumber: 'Ward 8', street: 'Koppikar Road', address: '23/C, Koppikar Road, Hubli - 580020' },
    propertyDetails: { district: 'Dharwad', ulb: 'Hubli-Dharwad Municipal Corporation', ulbType: 'Corporation', authorityType: 'Municipal', propertyType: 'Residential', ownershipType: 'Joint Ownership' },
    connectionDetails: { connectionType: 'Domestic', propertyType: 'Residential' },
    plumberDetails: { plumberName: 'Suresh M. Gowda', licenseNo: 'PLB/2024/HBD/056' },
    plumberEstimation: {
      rows: [
        { id: '1', attribute: 'GI Pipe 15mm', measurement: '10 meters', price: 1500 },
        { id: '2', attribute: 'PVC Pipe 20mm', measurement: '5 meters', price: 600 },
        { id: '3', attribute: 'Stop Cock 15mm', measurement: '1 No', price: 225 },
        { id: '4', attribute: 'Ferrule 15mm', measurement: '1 No', price: 350 },
        { id: '5', attribute: 'Labour Charges', measurement: 'Lump Sum', price: 2000 },
      ],
      totalAmount: 4675, comments: 'Short route connection from Koppikar Road main line. Straightforward installation.',
    },
    fieldVisitReport: {
      engineerName: 'Priya S. Desai',
      siteObservations: 'Property on Koppikar Road near HDMC office. Good access. Main line (250mm DI) runs directly in front. However, property already has an existing disconnected water connection (old RR No: HD/2019/D/4523). Meter box found at property boundary in damaged condition.',
      engineerRemarks: 'An old disconnected connection exists at this property. As per records, it was disconnected in 2021 due to non-payment of water bills amounting to ₹8,750. Recommending the applicant clear previous dues and apply for reconnection instead of a new connection.',
      locationVerification: { verified: true, verifiedAt: '2026-01-15T13:00:00', address: '23/C, Koppikar Road, Hubli - 580020', latitude: 15.3580, longitude: 75.1280 },
      fieldEngineerEstimation: {
        rows: [
          { id: '1', attribute: 'GI Pipe 15mm', measurement: '10 meters', price: 1500 },
          { id: '2', attribute: 'PVC Pipe 20mm', measurement: '5 meters', price: 600 },
          { id: '3', attribute: 'Stop Cock 15mm', measurement: '1 No', price: 225 },
          { id: '4', attribute: 'Ferrule 15mm', measurement: '1 No', price: 350 },
          { id: '5', attribute: 'Labour Charges', measurement: 'Lump Sum', price: 2000 },
        ],
        totalAmount: 4675,
      },
    },
    workflow: {
      caseworker: { name: 'Deepa M. Hiremath', comment: 'Documents verified. Joint ownership deed attached. Both owners have signed the application. NOC from co-owner present. Forwarded to Revenue Officer.', forwardedAt: '2025-12-15T10:30:00' },
      revenueOfficer: { name: 'Kavitha R. Naik', comment: 'Ward 8 verification completed. Note: Property records show a previous water connection (RR No: HD/2019/D/4523) that was disconnected in 2021 with outstanding dues of ₹8,750. This should be flagged for Commissioner review. Zone clearance given subject to resolution of previous dues.', forwardedAt: '2025-12-22T14:00:00' },
      fieldEngineer: { name: 'Priya S. Desai', remarks: 'Site inspection confirms existing disconnected connection at the property. Old meter box and ferrule still present at boundary. Recommending reconnection process instead of new connection to avoid duplicate infrastructure. Forwarding to Commissioner with this observation.', forwardedAt: '2026-01-15T17:00:00' },
      commissioner: { name: 'Dr. Suresh B. Angadi', comment: 'Application rejected. Site inspection and Revenue Officer records confirm that the property already has an existing water connection (RR No: HD/2019/D/4523) that was disconnected in 2021 due to non-payment of ₹8,750 in water charges. As per KMDS Policy Circular No. 23/2024, a new tap connection cannot be sanctioned for a property with an existing disconnected connection. The applicant must first clear the outstanding dues and apply for Tap Reconnection through the appropriate sub-menu.', decidedAt: '2026-02-02T10:00:00', status: 'rejected' },
    },
  },
  'NTC/2026/HBD/0018': {
    applicationNo: 'NTC/2026/HBD/0018', submittedAt: '2026-01-05T14:30:00',
    applicantDetails: { applicantName: 'Geeta S. Deshmukh', fatherName: 'Shivappa Deshmukh', mobile: '9567890123', email: 'geeta.deshmukh@gmail.com', aadharNumber: '1098 7654 3210', doorNumber: '156', wardNumber: 'Ward 22', street: 'Vidyanagar', address: '156, Vidyanagar, Hubli - 580031' },
    propertyDetails: { district: 'Dharwad', ulb: 'Hubli-Dharwad Municipal Corporation', ulbType: 'Corporation', authorityType: 'Municipal', propertyType: 'Residential', ownershipType: 'Self-Owned' },
    connectionDetails: { connectionType: 'Domestic', propertyType: 'Residential' },
    plumberDetails: { plumberName: 'Rajesh P. Naik', licenseNo: 'PLB/2023/HBD/089' },
    plumberEstimation: {
      rows: [
        { id: '1', attribute: 'GI Pipe 15mm', measurement: '20 meters', price: 3000 },
        { id: '2', attribute: 'PVC Pipe 20mm', measurement: '12 meters', price: 1440 },
        { id: '3', attribute: 'Stop Cock 15mm', measurement: '2 Nos', price: 450 },
        { id: '4', attribute: 'Ferrule 15mm', measurement: '1 No', price: 350 },
        { id: '5', attribute: 'Labour Charges', measurement: 'Lump Sum', price: 3500 },
      ],
      totalAmount: 8740, comments: 'Extended route required as property is set back from main road. Pipe needs to cross an internal lane.',
    },
    fieldVisitReport: {
      engineerName: 'Anand S. Kulkarni',
      siteObservations: 'Property in Vidyanagar layout, Ward 22. This area falls under the Malaprabha Right Bank Canal (MRBC) water supply zone. The zone currently has intermittent water supply (alternate days, 2 hours). Main pipeline (100mm AC pipe) is old and has frequent burst history. Area is proposed for pipeline replacement under JJM (Jal Jeevan Mission) Phase-II.',
      engineerRemarks: 'Connection technically feasible but the existing 100mm AC main pipeline in Vidyanagar is aged (installed circa 1998) and scheduled for replacement under JJM Phase-II. Adding new connections may increase pressure on the already stressed pipeline. Recommend deferring new connections until pipeline replacement is completed.',
      locationVerification: { verified: true, verifiedAt: '2026-01-28T11:15:00', address: '156, Vidyanagar, Hubli - 580031', latitude: 15.3720, longitude: 75.1150 },
      fieldEngineerEstimation: {
        rows: [
          { id: '1', attribute: 'GI Pipe 15mm', measurement: '20 meters', price: 3000 },
          { id: '2', attribute: 'PVC Pipe 20mm', measurement: '12 meters', price: 1440 },
          { id: '3', attribute: 'Stop Cock 15mm', measurement: '2 Nos', price: 450 },
          { id: '4', attribute: 'Ferrule 15mm', measurement: '1 No', price: 350 },
          { id: '5', attribute: 'Labour Charges', measurement: 'Lump Sum', price: 3500 },
          { id: '6', attribute: 'Road Restoration', measurement: 'Lump Sum', price: 1500 },
        ],
        totalAmount: 10240,
      },
    },
    workflow: {
      caseworker: { name: 'Prakash Hegde', comment: 'All documents verified. Property khata and ownership documents valid. Aadhar matching confirmed. Forwarding to Revenue Officer.', forwardedAt: '2026-01-10T11:00:00' },
      revenueOfficer: { name: 'Mahesh V. Hosamani', comment: 'Ward 22 zone verification completed. No outstanding dues on property. However, noting that Vidyanagar area has been flagged for infrastructure upgrade under JJM Phase-II. Water supply in this zone is currently intermittent. Forwarded to Field Engineer for assessment.', forwardedAt: '2026-01-18T16:00:00' },
      fieldEngineer: { name: 'Anand S. Kulkarni', remarks: 'Site inspected. Old AC pipeline (100mm, circa 1998) serves this area. Pipeline has documented burst history — 4 incidents in last 6 months. Area is under JJM Phase-II for complete pipeline replacement. Adding new load to this pipeline is not advisable. Forwarding to Commissioner with strong recommendation to defer.', forwardedAt: '2026-01-28T17:30:00' },
      commissioner: { name: 'Dr. Suresh B. Angadi', comment: 'Application rejected. Based on the Field Engineer\'s assessment, the Vidyanagar area (Ward 22) is served by an aging 100mm AC pipeline installed in 1998 with documented frequent burst incidents. The area is scheduled for complete pipeline replacement under Jal Jeevan Mission Phase-II (Work Order No: JJM/KAR/2025/W-0892, expected completion: September 2026). Sanctioning new connections on this deteriorated pipeline would pose supply quality and pressure risks. The applicant is advised to re-apply after the JJM Phase-II pipeline replacement is completed in the Vidyanagar zone.', decidedAt: '2026-02-14T10:30:00', status: 'rejected' },
    },
  },
};

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-gray-500 mb-1 font-['Poppins',sans-serif]">{label}</label>
      <p className="text-[14px] font-medium text-gray-900 font-['Poppins',sans-serif]">{value}</p>
    </div>
  );
}

export default function CommissionerAppealDashboard() {
  const [appeals, setAppeals] = useState<AppealApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppeal, setSelectedAppeal] = useState<AppealApplication | null>(null);
  const [processing, setProcessing] = useState(false);
  const [actionComments, setActionComments] = useState('');
  const [showPaymentLetter, setShowPaymentLetter] = useState(false);
  const [pendingApproveComments, setPendingApproveComments] = useState('');
  const [fetchedOrigApp, setFetchedOrigApp] = useState<any>(null);
  const [fetchingOrigApp, setFetchingOrigApp] = useState(false);

  useEffect(() => {
    fetchAppeals();
  }, []);

  // When an appeal is selected, try to fetch the real original application from server
  useEffect(() => {
    if (selectedAppeal) {
      const origAppId = selectedAppeal.originalApplicationId || '';
      // Only fetch from server if not already in dummy data
      if (origAppId && !ORIGINAL_APP_DATA[origAppId]) {
        fetchOriginalApplication(origAppId);
      } else {
        setFetchedOrigApp(null);
      }
    } else {
      setFetchedOrigApp(null);
    }
  }, [selectedAppeal]);

  const fetchOriginalApplication = async (origAppId: string) => {
    setFetchingOrigApp(true);
    try {
      const url = 'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/appeal/original-app-status?originalAppId=' + encodeURIComponent(origAppId) + '&full=true';
      console.log('[COMM APPEAL] Fetching original app data:', origAppId);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + publicAnonKey,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success && data.found && data.application) {
        console.log('[COMM APPEAL] Fetched original app:', data.application.id, data.application.status);
        // Runtime fix: auto-patch invalid propertyType (legacy form bug)
        const VALID_CATS = ['domestic', 'commercial', 'non-domestic', 'nondomestic', 'non_domestic', 'industrial'];
        const origCd = data.application.connectionDetails;
        if (origCd && origCd.propertyType) {
          const ptN = origCd.propertyType.toLowerCase().replace(/[\s_-]+/g, '');
          const isV = VALID_CATS.some(function(c) { return ptN === c.replace(/[\s_-]+/g, ''); });
          if (!isV) {
            console.log('[COMM APPEAL] Auto-fixing invalid propertyType:', origCd.propertyType, '→ domestic');
            origCd.propertyType = 'domestic';
            fetch(`https://${projectId}.supabase.co/functions/v1/make-server-698be164/dev/patch-application`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ applicationId: data.application.id, patch: { connectionDetails: { propertyType: 'domestic' } } }),
            }).catch(function() {});
          }
        }
        setFetchedOrigApp(data.application);
      } else {
        console.log('[COMM APPEAL] Original app not found in KV store for:', origAppId);
        setFetchedOrigApp(null);
      }
    } catch (err) {
      console.error('[COMM APPEAL] Error fetching original app:', err);
      setFetchedOrigApp(null);
    } finally {
      setFetchingOrigApp(false);
    }
  };

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const url = 'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/appeal/applications';
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + publicAnonKey,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        // Show PD-approved appeals (pending commissioner action) + already actioned by commissioner
        const commAppeals = (data.applications || []).filter((a: any) =>
          a && (a.status === 'pd_approved' || a.status === 'commissioner_approved' || a.status === 'commissioner_appeal_rejected')
        );
        setAppeals(commAppeals);
        console.log('[COMM APPEAL] Loaded', commAppeals.length, 'appeals');
      }
    } catch (err) {
      console.error('[COMM APPEAL] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedAppeal) return;
    if (!actionComments.trim()) {
      alert('Please provide comments before taking action.');
      return;
    }

    // For approve: show Payment Letter with DSC flow instead of direct server call
    if (action === 'approve') {
      const confirmMsg = 'Revoke the previous rejection and proceed to generate Payment Letter with DSC? The signed payment letter will be sent to the citizen.';
      if (!confirm(confirmMsg)) return;
      setPendingApproveComments(actionComments.trim());
      setShowPaymentLetter(true);
      return;
    }

    // For reject: call server directly
    const confirmMsg = 'Reject this appeal? The original rejection will stand and the case will be closed.';
    if (!confirm(confirmMsg)) return;

    setProcessing(true);
    try {
      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/appeal/commissioner-action',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + publicAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appealId: selectedAppeal.id,
            action,
            comments: actionComments.trim(),
            commissionerName: 'Commissioner',
          }),
        }
      );
      const data = await response.json();
      console.log('[COMM APPEAL] Action response:', data);

      if (data.success) {
        alert(data.message);
        setSelectedAppeal(null);
        setActionComments('');
        fetchAppeals();
      } else {
        alert('Error: ' + (data.error || 'Unknown'));
      }
    } catch (err) {
      console.error('[COMM APPEAL] Action error:', err);
      alert('Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return 'N/A'; }
  };

  const formatDateTime = (ds: string) => {
    if (!ds) return 'N/A';
    try {
      const d = new Date(ds);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch { return 'N/A'; }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'pd_approved') return { text: 'Pending Review', cls: 'bg-yellow-100 text-yellow-800' };
    if (status === 'commissioner_approved') return { text: 'Approved', cls: 'bg-green-100 text-green-800' };
    if (status === 'commissioner_appeal_rejected') return { text: 'Rejected', cls: 'bg-red-100 text-red-800' };
    return { text: status, cls: 'bg-gray-100 text-gray-800' };
  };

  const filteredAppeals = appeals.filter((app) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (app.id || '').toLowerCase().includes(q) ||
      (app.ulb || '').toLowerCase().includes(q) ||
      (app.citizenName || '').toLowerCase().includes(q) ||
      (app.originalApplicationId || '').toLowerCase().includes(q)
    );
  });

  const sortedAppeals = [...filteredAppeals].sort((a, b) => {
    // Pending first, then by date
    if (a.status === 'pd_approved' && b.status !== 'pd_approved') return -1;
    if (a.status !== 'pd_approved' && b.status === 'pd_approved') return 1;
    return new Date(b.dateOfAppealRequested || 0).getTime() - new Date(a.dateOfAppealRequested || 0).getTime();
  });

  // ── Detail View ──
  if (selectedAppeal) {
    const appeal = selectedAppeal;
    const isActioned = appeal.status === 'commissioner_approved' || appeal.status === 'commissioner_appeal_rejected';
    const pdWf = appeal.workflow && appeal.workflow.projectDirector ? appeal.workflow.projectDirector : {};
    const commWf = appeal.workflow && appeal.workflow.commissioner ? appeal.workflow.commissioner : {};

    const origAppId = appeal.originalApplicationId || '';
    // Use fetched real app data first, then fall back to dummy data
    const origApp = fetchedOrigApp || ORIGINAL_APP_DATA[origAppId] || null;
    const ad = origApp && origApp.applicantDetails ? origApp.applicantDetails : {};
    const pd = origApp && origApp.propertyDetails ? origApp.propertyDetails : {};
    const cd = origApp && origApp.connectionDetails ? origApp.connectionDetails : {};
    const plb = origApp && origApp.plumberDetails ? origApp.plumberDetails : {};
    const pe = origApp && origApp.plumberEstimation ? origApp.plumberEstimation : (origApp && origApp.plumberConnectionData ? origApp.plumberConnectionData : {});
    const peRows = pe && pe.rows ? pe.rows : (pe && pe.estimationRows ? pe.estimationRows : []);
    const fvr = origApp && origApp.fieldVisitReport ? origApp.fieldVisitReport : {};
    const feEst = fvr && fvr.fieldEngineerEstimation ? fvr.fieldEngineerEstimation : {};
    const feEstRows = feEst && feEst.rows ? feEst.rows : [];
    // Also check approvedEstimation (set by regular commissioner flow)
    const approvedEst = origApp && origApp.approvedEstimation ? origApp.approvedEstimation : {};
    const approvedEstRows = approvedEst && approvedEst.rows ? approvedEst.rows : [];
    const owf = origApp && origApp.workflow ? origApp.workflow : {};
    const cwRemark = owf && owf.caseworker ? owf.caseworker : {};
    const roRemark = owf && owf.revenueOfficer ? owf.revenueOfficer : {};
    const feRemark = owf && owf.fieldEngineer ? owf.fieldEngineer : {};
    const commRemark = owf && owf.commissioner ? owf.commissioner : {};

    // Use field engineer estimation rows (preferred), then approved estimation, then plumber estimation
    const paymentEstimationRows = feEstRows.length > 0 ? feEstRows : (approvedEstRows.length > 0 ? approvedEstRows : peRows);
    const paymentTotalAmount = feEstRows.length > 0
      ? (feEst && feEst.totalAmount ? feEst.totalAmount : 0)
      : (approvedEstRows.length > 0
        ? (approvedEst && approvedEst.totalAmount ? approvedEst.totalAmount : 0)
        : (pe && pe.totalAmount ? pe.totalAmount : 0));

    // Show Payment Letter View with DSC signing when commissioner approves via appeal
    if (showPaymentLetter && selectedAppeal) {
      const handleAppealPaymentComplete = async () => {
        console.log('[COMM APPEAL] Completing appeal approval with payment letter...');
        const response = await fetch(
          'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/appeal/commissioner-action',
          {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + publicAnonKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              appealId: selectedAppeal.id,
              action: 'approve',
              comments: pendingApproveComments,
              commissionerName: 'Commissioner',
              estimationRows: paymentEstimationRows,
              totalAmount: paymentTotalAmount,
            }),
          }
        );
        const data = await response.json();
        console.log('[COMM APPEAL] Appeal approve with payment letter response:', data);

        if (data.success) {
          alert('Appeal Approved Successfully!\n\nPayment letter has been signed with DSC and sent to the citizen.\nThe citizen can now view the payment letter and make the payment.\nOnce paid, the application will follow the regular NTC workflow.');
          setShowPaymentLetter(false);
          setPendingApproveComments('');
          setSelectedAppeal(null);
          setActionComments('');
          fetchAppeals();
        } else {
          throw new Error(data.error || 'Failed to approve appeal');
        }
      };

      return (
        <PaymentLetterView
          applicationId={origAppId || selectedAppeal.originalApplicationId || selectedAppeal.id}
          applicationNo={origAppId || selectedAppeal.originalApplicationId || selectedAppeal.id}
          applicantName={ad && ad.applicantName ? ad.applicantName : (selectedAppeal.citizenName || 'N/A')}
          totalAmount={paymentTotalAmount}
          estimationRows={paymentEstimationRows.length > 0 ? paymentEstimationRows : undefined}
          commissionerRemarks={pendingApproveComments}
          connectionType={cd && cd.connectionType ? cd.connectionType : ''}
          usageCategory={cd && cd.propertyType ? cd.propertyType : ''}
          nonMeterBillingMode={cd && cd.nonMeterBillingMode ? cd.nonMeterBillingMode : ''}
          unauthorizedTapPenalty={0}
          onBack={() => { setShowPaymentLetter(false); setPendingApproveComments(''); }}
          onComplete={handleAppealPaymentComplete}
          isAppealFlow={true}
        />
      );
    }

    return (
      <div className="p-6 max-w-[1200px] mx-auto">
        <button
          onClick={() => { setSelectedAppeal(null); setActionComments(''); setShowPaymentLetter(false); }}
          disabled={processing}
          className="mb-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Appealed Applications
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
            Appeal Review — Commissioner
          </h1>
          <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
            Appeal Application No: <span className="font-semibold">{appeal.id}</span>
          </p>
          {isActioned && (
            <div className={'mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold font-[\'Poppins\',sans-serif] ' + (appeal.status === 'commissioner_approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
              {appeal.status === 'commissioner_approved' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {appeal.status === 'commissioner_approved' ? 'Approved — Rejection Revoked — Payment Enabled' : 'Rejected — Case Closed'}
            </div>
          )}
          {fetchingOrigApp && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 font-['Poppins',sans-serif]">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Loading original application data...
            </div>
          )}
          {!fetchingOrigApp && fetchedOrigApp && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 font-['Poppins',sans-serif]">
              <CheckCircle className="w-4 h-4" />
              Original application data loaded from server (Status: {fetchedOrigApp.status || 'N/A'})
            </div>
          )}
        </div>

        {/* Appeal Information */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Appeal Information
            </h2>
          </div>
          <div className="p-6">
            <div className="bg-[#f8fafc] rounded-lg p-5">
              <div className="grid grid-cols-3 gap-6 mb-4">
                <DetailField label="Appeal Application No" value={appeal.id} />
                <DetailField label="Original Application No" value={appeal.originalApplicationId || 'N/A'} />
                <DetailField label="ULB" value={appeal.ulb || 'N/A'} />
              </div>
              <div className="grid grid-cols-3 gap-6 mb-4">
                <DetailField label="Menu" value={appeal.menu || 'Tap Connection'} />
                <DetailField label="Sub-Menu" value={appeal.subMenu || 'New Tap Connection'} />
                <DetailField label="Date of Rejection" value={formatDate(appeal.dateOfRejection)} />
              </div>
              <div className="grid grid-cols-3 gap-6 mb-4">
                <DetailField label="Date of Appeal Requested" value={formatDate(appeal.dateOfAppealRequested)} />
                <DetailField label="Applicant Name" value={appeal.citizenName || 'N/A'} />
                <DetailField label="Applicant Phone" value={appeal.citizenPhone || 'N/A'} />
              </div>
            </div>
          </div>
        </div>

        {/* Reason for Appeal */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Reason for Appeal
            </h2>
          </div>
          <div className="p-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-[14px] text-amber-900 font-['Poppins',sans-serif]">
                {appeal.reasonForAppeal || 'No reason provided'}
              </p>
            </div>
          </div>
        </div>

        {/* PD Recommendation */}
        {pdWf && pdWf.action && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Project Director Recommendation
              </h2>
            </div>
            <div className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-bold text-green-800 font-['Poppins',sans-serif]">Approved & Recommended for Commissioner Review</span>
                </div>
                <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] mb-2">
                  <span className="font-semibold">Comments:</span> {pdWf.comments || 'N/A'}
                </p>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                  By: {pdWf.name || 'N/A'} | {formatDateTime(pdWf.timestamp)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Original Application Details */}
        {origApp && (<>
          {/* Applicant, Property, Connection Details */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Original Application Details — {origApp.applicationNo}
              </h2>
              <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mt-1">Submitted: {formatDateTime(origApp.submittedAt)}</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Applicant Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-[#1f3a5f]" />
                  <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">Applicant Information</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 bg-[#f8fafc] rounded-lg p-4">
                  <DetailField label="Name" value={ad.applicantName || 'N/A'} />
                  <DetailField label="Father's Name" value={ad.fatherName || 'N/A'} />
                  <DetailField label="Mobile" value={ad.mobile || 'N/A'} />
                  <DetailField label="Email" value={ad.email || 'N/A'} />
                  <DetailField label="Aadhar Number" value={ad.aadharNumber || 'N/A'} />
                  <DetailField label="Door No / Ward" value={(ad.doorNumber || 'N/A') + ' / ' + (ad.wardNumber || 'N/A')} />
                  <div className="col-span-3">
                    <DetailField label="Address" value={ad.address || 'N/A'} />
                  </div>
                </div>
              </div>
              {/* Property Details */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-[#1f3a5f]" />
                  <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">Property Details</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 bg-[#f8fafc] rounded-lg p-4">
                  <DetailField label="District" value={pd.district || 'N/A'} />
                  <DetailField label="ULB" value={pd.ulb || 'N/A'} />
                  <DetailField label="ULB Type" value={pd.ulbType || 'N/A'} />
                  <DetailField label="Authority Type" value={pd.authorityType || 'N/A'} />
                  <DetailField label="Property Type" value={pd.propertyType || 'N/A'} />
                  <DetailField label="Ownership Type" value={pd.ownershipType || 'N/A'} />
                </div>
              </div>
              {/* Connection Details */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Droplet className="w-5 h-5 text-[#1f3a5f]" />
                  <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">Connection Details</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 bg-[#f8fafc] rounded-lg p-4">
                  <DetailField label="Connection Type" value={cd.connectionType || 'N/A'} />
                  <DetailField label="Property Type" value={cd.propertyType || 'N/A'} />
                  <DetailField label="Assigned Plumber" value={(plb.plumberName || 'N/A') + ' (' + (plb.licenseNo || 'N/A') + ')'} />
                </div>
              </div>
            </div>
          </div>

          {/* Plumber Cost Estimation */}
          {peRows.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Plumber Cost Estimation
                </h2>
              </div>
              <div className="p-6">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-[#1f3a5f] grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3 px-5 py-3">
                    <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-center">#</p>
                    <p className="text-white text-sm font-semibold font-['Poppins',sans-serif]">Attribute</p>
                    <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-center">Measurement</p>
                    <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-right">Price</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {peRows.map((row: any, idx: number) => (
                      <div key={row.id || idx} className={'grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3 px-5 py-3 ' + (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                        <p className="text-gray-500 text-sm font-['Poppins',sans-serif] text-center">{idx + 1}</p>
                        <p className="text-gray-900 text-[15px] font-medium font-['Poppins',sans-serif]">{row.attribute}</p>
                        <p className="text-gray-700 text-[15px] font-['Poppins',sans-serif] text-center">{row.measurement}</p>
                        <p className="text-gray-900 text-[15px] font-semibold font-['Poppins',sans-serif] text-right">{'₹'}{typeof row.price === 'number' ? row.price.toFixed(2) : row.price}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-100 border-t-2 border-gray-300 px-5 py-4">
                    <div className="grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3">
                      <div></div>
                      <p className="text-[#1f3a5f] text-[15px] font-bold font-['Poppins',sans-serif]">Total Amount</p>
                      <div></div>
                      <p className="text-[#1f3a5f] text-lg font-bold font-['Poppins',sans-serif] text-right">{'₹'}{typeof pe.totalAmount === 'number' ? pe.totalAmount.toFixed(2) : pe.totalAmount}</p>
                    </div>
                  </div>
                </div>
                {pe.comments && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-[#1f3a5f] font-semibold font-['Poppins',sans-serif] mb-1">Plumber's Comments:</p>
                    <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">{pe.comments}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Field Inspection Report */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Field Inspection Report</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-[#f8fafc] rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4">
                  <DetailField label="Inspected By" value={fvr.engineerName || 'N/A'} />
                  <div>
                    <label className="block text-[13px] font-medium text-gray-500 mb-1 font-['Poppins',sans-serif]">Location Verified</label>
                    <span className={'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ' + (fvr.locationVerification && fvr.locationVerification.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                      {fvr.locationVerification && fvr.locationVerification.verified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <DetailField label="Verified At" value={fvr.locationVerification && fvr.locationVerification.verifiedAt ? formatDateTime(fvr.locationVerification.verifiedAt) : 'N/A'} />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-2">Site Observations:</p>
                <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">{fvr.siteObservations || 'N/A'}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-800 font-['Poppins',sans-serif] mb-2">Engineer Remarks:</p>
                <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">{fvr.engineerRemarks || 'N/A'}</p>
              </div>
              {/* Field Engineer Estimation */}
              {feEstRows.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="w-5 h-5 text-[#1f3a5f]" />
                    <h4 className="text-base font-semibold text-[#414141] font-['Poppins',sans-serif]">Field Engineer's Cost Estimation</h4>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-[#1f3a5f] grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3 px-5 py-3">
                      <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-center">#</p>
                      <p className="text-white text-sm font-semibold font-['Poppins',sans-serif]">Attribute</p>
                      <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-center">Measurement</p>
                      <p className="text-white text-sm font-semibold font-['Poppins',sans-serif] text-right">Price</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {feEstRows.map((row: any, idx: number) => (
                        <div key={row.id || idx} className={'grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3 px-5 py-3 ' + (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                          <p className="text-gray-500 text-sm font-['Poppins',sans-serif] text-center">{idx + 1}</p>
                          <p className="text-gray-900 text-[15px] font-medium font-['Poppins',sans-serif]">{row.attribute}</p>
                          <p className="text-gray-700 text-[15px] font-['Poppins',sans-serif] text-center">{row.measurement}</p>
                          <p className="text-gray-900 text-[15px] font-semibold font-['Poppins',sans-serif] text-right">{'₹'}{typeof row.price === 'number' ? row.price.toFixed(2) : row.price}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-100 border-t-2 border-gray-300 px-5 py-4">
                      <div className="grid grid-cols-[40px_2.5fr_1.5fr_1.5fr] gap-3">
                        <div></div>
                        <p className="text-[#1f3a5f] text-[15px] font-bold font-['Poppins',sans-serif]">Total Amount</p>
                        <div></div>
                        <p className="text-[#1f3a5f] text-lg font-bold font-['Poppins',sans-serif] text-right">{'₹'}{typeof feEst.totalAmount === 'number' ? feEst.totalAmount.toFixed(2) : feEst.totalAmount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Workflow Remarks Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Workflow Remarks
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-0">
                {cwRemark.comment && (
                  <div className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 bg-sky-600" />
                      <div className="w-0.5 flex-1 bg-gray-200 mt-1 mb-1" />
                    </div>
                    <div className="flex-1 mb-4">
                      <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-sky-800 font-['Poppins',sans-serif]">Caseworker — {cwRemark.name || 'N/A'}</span>
                          <span className="text-xs text-gray-500 font-['Poppins',sans-serif]">{formatDateTime(cwRemark.forwardedAt)}</span>
                        </div>
                        <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">{cwRemark.comment}</p>
                      </div>
                    </div>
                  </div>
                )}
                {roRemark.comment && (
                  <div className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 bg-amber-500" />
                      <div className="w-0.5 flex-1 bg-gray-200 mt-1 mb-1" />
                    </div>
                    <div className="flex-1 mb-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-amber-800 font-['Poppins',sans-serif]">Revenue Officer — {roRemark.name || 'N/A'}</span>
                          <span className="text-xs text-gray-500 font-['Poppins',sans-serif]">{formatDateTime(roRemark.forwardedAt)}</span>
                        </div>
                        <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">{roRemark.comment}</p>
                      </div>
                    </div>
                  </div>
                )}
                {feRemark.remarks && (
                  <div className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 bg-indigo-500" />
                      <div className="w-0.5 flex-1 bg-gray-200 mt-1 mb-1" />
                    </div>
                    <div className="flex-1 mb-4">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-indigo-800 font-['Poppins',sans-serif]">Field Engineer — {feRemark.name || 'N/A'}</span>
                          <span className="text-xs text-gray-500 font-['Poppins',sans-serif]">{formatDateTime(feRemark.forwardedAt)}</span>
                        </div>
                        <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">{feRemark.remarks}</p>
                      </div>
                    </div>
                  </div>
                )}
                {commRemark.comment && (
                  <div className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 bg-red-500" />
                    </div>
                    <div className="flex-1 mb-1">
                      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="text-sm font-bold text-red-800 font-['Poppins',sans-serif]">Commissioner — {commRemark.name || 'N/A'}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-200 text-red-800">ORIGINAL REJECTION</span>
                          </div>
                          <span className="text-xs text-gray-500 font-['Poppins',sans-serif]">{formatDateTime(commRemark.decidedAt)}</span>
                        </div>
                        <p className="text-[14px] text-gray-800 font-['Poppins',sans-serif] leading-relaxed font-medium">{commRemark.comment}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>)}

        {/* Commissioner Action — Only if not yet actioned */}
        {!isActioned && (
          <div className="bg-white rounded-lg border-2 border-[#1f3a5f] shadow-md mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-[#1f3a5f]/5">
              <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                Commissioner Decision on Appeal
              </h2>
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
                Review the appeal and decide whether to revoke the original rejection or uphold it.
              </p>
            </div>
            <div className="p-6">
              <div className="bg-[#f8fafc] rounded-lg p-5">
                <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                  Comments / Decision Rationale <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  rows={4}
                  placeholder="Enter your decision rationale and comments..."
                  className="w-full px-4 py-3 text-[14px] font-['Poppins',sans-serif] border-[1.5px] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] placeholder:text-gray-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <GovButton
                  variant="danger"
                  size="lg"
                  onClick={() => handleAction('reject')}
                  loading={processing}
                  disabled={!actionComments.trim()}
                >
                  <XCircle className="w-4 h-4" />
                  Reject Appeal & Uphold Rejection
                </GovButton>
                <GovButton
                  variant="success"
                  size="lg"
                  onClick={() => handleAction('approve')}
                  loading={processing}
                  disabled={!actionComments.trim()}
                >
                  <CheckCircle className="w-4 h-4" />
                  Revoke Rejection & Approve for Payment
                </GovButton>
              </div>
            </div>
          </div>
        )}

        {/* Commissioner Decision (if actioned) */}
        {isActioned && commWf && commWf.action && (() => {
          const commDecision = commWf.action === 'approve'
            ? 'Appeal Approved — Original Rejection Revoked — Citizen Can Make Payment'
            : 'Appeal Rejected — Original Rejection Upheld — Case Closed';
          const remarkEntries: RemarkEntry[] = [
            { role: 'Commissioner', comment: commWf.comments || commDecision, timestamp: commWf.timestamp || '', variant: commWf.action === 'approve' ? 'approved' : 'rejected' },
          ];
          return (
            <div className="mb-6">
              <RemarksTimeline remarks={remarkEntries} title="Appeal Decision History" />
            </div>
          );
        })()}
      </div>
    );
  }

  // ── Dashboard (List) View ──
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-2">
            <Scale className="w-6 h-6" />
            Appealed Applications — New Tap Connection
          </h1>
          <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
            Appeals approved by Project Director, pending your final decision
          </p>
        </div>
        <button
          onClick={fetchAppeals}
          className="flex items-center gap-2 px-4 py-2 bg-[#1f3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors font-['Poppins',sans-serif] text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4 flex items-end gap-4">
        <div className="flex-1 max-w-[400px]">
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5 font-['Poppins',sans-serif]">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Appeal ID, ULB, Name, Application No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-[14px] font-['Poppins',sans-serif] border-[1.5px] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f] mx-auto"></div>
            <p className="mt-4 text-gray-600 font-['Poppins',sans-serif]">Loading appealed applications...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden">
          {/* Title Bar */}
          <div className="bg-[#1f3a5f] px-6 py-4 border-b border-[#e5e7eb]">
            <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-white leading-7">
              Appeal Applications
            </h2>
          </div>
          {sortedAppeals.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-['Poppins',sans-serif]">No appealed applications found</p>
              <p className="text-sm text-gray-400 font-['Poppins',sans-serif] mt-1">PD-approved appeals will appear here for your review</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: '1200px' }}>
                <thead className="bg-[#f8f9fa] border-b border-[#e5e7eb]">
                  <tr>
                    <th className="px-6 py-5 text-center font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[50px]">Sl.</th>
                    <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[200px]">Appeal Application No.</th>
                    <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[180px]">Original Application No.</th>
                    <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[140px]">Applicant</th>
                    <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[100px]">ULB</th>
                    <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[120px]">Appeal Date</th>
                    <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[100px]">Status</th>
                    <th className="px-6 py-5 text-left font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide w-[80px]">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {sortedAppeals.map((appeal, index) => {
                    const badge = getStatusBadge(appeal.status);
                    return (
                      <tr key={appeal.id} className="border-b border-[#e5e7eb] hover:bg-[#f8f9fb] transition-colors">
                        <td className="px-6 py-4 text-center font-['Poppins',sans-serif] text-[14px] font-medium text-[#414141]">{index + 1}</td>
                        <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] font-medium text-[#06c]">
                          <span className="inline-block max-w-[200px] truncate" title={appeal.id}>{appeal.id}</span>
                        </td>
                        <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">{appeal.originalApplicationId || 'N/A'}</td>
                        <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#170f49] font-medium">{appeal.citizenName || 'N/A'}</td>
                        <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">{appeal.ulb || 'N/A'}</td>
                        <td className="px-6 py-4 font-['Poppins',sans-serif] text-[14px] text-[#414141]">{formatDate(appeal.dateOfAppealRequested)}</td>
                        <td className="px-6 py-4">
                          <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-medium font-[\'Poppins\',sans-serif] border ' + badge.cls}>
                            {badge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedAppeal(appeal)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1f3a5f] text-white rounded-[8px] text-[14px] font-medium font-['Poppins',sans-serif] hover:bg-[#2d4a6f] transition-colors shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 text-right">
        <span className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">
          Showing {sortedAppeals.length} of {appeals.length} appeal(s)
        </span>
      </div>
    </div>
  );
}

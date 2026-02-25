import { useState, useEffect, useRef } from 'react';
import { Scale, Upload, CheckCircle2, FileText, X, Eye, User, MapPin, Droplet, ClipboardCheck, XCircle, ChevronLeft, MessageSquare, Wrench, Calculator } from 'lucide-react';
import { GovSelect } from '../ui/gov-select';
import { GovInput } from '../ui/gov-input';
import { GovButton } from '../ui/gov-button';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

// Dummy full application data for each NTC application
const DUMMY_APP_DETAILS: Record<string, any> = {
  'NTC/2025/HBD/0012': {
    applicationNo: 'NTC/2025/HBD/0012',
    submittedAt: '2025-10-15T10:30:00',
    status: 'rejected',
    applicantDetails: {
      applicantName: 'Ramesh Kumar Patil',
      fatherName: 'Basavaraj Patil',
      mobile: '9876543210',
      email: 'ramesh.patil@gmail.com',
      aadharNumber: '8765 4321 9012',
      doorNumber: '45/2A',
      wardNumber: 'Ward 12',
      street: 'MG Road',
      address: '45/2A, MG Road, Hubli - 580020',
    },
    propertyDetails: {
      district: 'Dharwad',
      ulb: 'Hubli-Dharwad Municipal Corporation',
      ulbType: 'Corporation',
      authorityType: 'Municipal',
      propertyType: 'Residential',
      ownershipType: 'Self-Owned',
    },
    connectionDetails: {
      connectionType: 'Domestic',
      propertyType: 'Residential',
    },
    plumberDetails: {
      plumberName: 'Suresh M. Gowda',
      licenseNo: 'PLB/2024/HBD/056',
    },
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
      locationVerification: {
        verified: true,
        verifiedAt: '2025-11-05T14:20:00',
        address: '45/2A, MG Road, Hubli - 580020',
        latitude: 15.3647,
        longitude: 75.1240,
      },
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
      caseworker: {
        name: 'Prakash Hegde',
        comment: 'Documents verified. Applicant has valid property ownership proof and Aadhar. Forwarded to Revenue Officer for zone validation.',
        forwardedAt: '2025-10-18T11:45:00',
        status: 'forwarded',
      },
      revenueOfficer: {
        name: 'Kavitha R. Naik',
        comment: 'Ward 12 zone verified. No outstanding dues on property. Water supply availability confirmed for this zone. Forwarded to Field Engineer for site inspection.',
        forwardedAt: '2025-10-22T16:30:00',
        status: 'forwarded',
      },
      fieldEngineer: {
        name: 'Anand S. Kulkarni',
        remarks: 'Site inspection completed. Location verified via GPS. Connection feasible from MG Road main pipeline. Estimation prepared and attached. Forwarding to Commissioner for final approval.',
        forwardedAt: '2025-11-05T17:00:00',
        status: 'forwarded',
      },
      commissioner: {
        name: 'Dr. Suresh B. Angadi',
        comment: 'Application rejected. The property falls under a zone where the water supply infrastructure is being upgraded under the AMRUT 2.0 scheme. New connections in this zone are temporarily suspended until the pipeline replacement work is completed (expected March 2026). The applicant may re-apply after the infrastructure upgrade is completed.',
        decidedAt: '2025-12-10T10:15:00',
        status: 'rejected',
      },
    },
  },
  'NTC/2025/HBD/0037': {
    applicationNo: 'NTC/2025/HBD/0037',
    submittedAt: '2025-09-20T09:15:00',
    status: 'rejected',
    applicantDetails: {
      applicantName: 'Lakshmi Devi Joshi',
      fatherName: 'Venkatesh Joshi',
      mobile: '9123456789',
      email: 'lakshmi.joshi@yahoo.com',
      aadharNumber: '6543 2109 8765',
      doorNumber: '12/B',
      wardNumber: 'Ward 5',
      street: 'Station Road',
      address: '12/B, Station Road, Dharwad - 580001',
    },
    propertyDetails: {
      district: 'Dharwad',
      ulb: 'Hubli-Dharwad Municipal Corporation',
      ulbType: 'Corporation',
      authorityType: 'Municipal',
      propertyType: 'Commercial',
      ownershipType: 'Rented',
    },
    connectionDetails: {
      connectionType: 'Commercial',
      propertyType: 'Commercial',
    },
    plumberDetails: {
      plumberName: 'Manoj D. Shetty',
      licenseNo: 'PLB/2024/HBD/023',
    },
    plumberEstimation: {
      rows: [
        { id: '1', attribute: 'GI Pipe 20mm', measurement: '18 meters', price: 3600 },
        { id: '2', attribute: 'PVC Pipe 25mm', measurement: '10 meters', price: 1500 },
        { id: '3', attribute: 'Stop Cock 20mm', measurement: '2 Nos', price: 700 },
        { id: '4', attribute: 'Ferrule 20mm', measurement: '1 No', price: 550 },
        { id: '5', attribute: 'Labour Charges', measurement: 'Lump Sum', price: 4000 },
      ],
      totalAmount: 10350,
      comments: 'Commercial connection requiring 20mm pipe. Longer route due to building setback from main road.',
    },
    fieldVisitReport: {
      engineerName: 'Priya S. Desai',
      siteObservations: 'Commercial property on Station Road. Main pipeline is 150mm CI pipe, older infrastructure. Building is set back 18m from road. Requires trenching through parking area.',
      engineerRemarks: 'Connection feasible but requires larger bore pipe for commercial use. Route through parking area needs restoration. Existing pipeline pressure may be insufficient during peak hours.',
      locationVerification: {
        verified: true,
        verifiedAt: '2025-10-08T11:45:00',
        address: '12/B, Station Road, Dharwad - 580001',
        latitude: 15.4589,
        longitude: 75.0078,
      },
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
      caseworker: {
        name: 'Deepa M. Hiremath',
        comment: 'Commercial application verified. Rental agreement and trade license copies attached. NOC from property owner present. Forwarded to Revenue Officer.',
        forwardedAt: '2025-09-25T14:20:00',
        status: 'forwarded',
      },
      revenueOfficer: {
        name: 'Kavitha R. Naik',
        comment: 'Ward 5 zone check completed. Property tax records verified. No outstanding dues. Commercial connection rate applicable. Forwarded to Field Engineer.',
        forwardedAt: '2025-09-30T10:00:00',
        status: 'forwarded',
      },
      fieldEngineer: {
        name: 'Priya S. Desai',
        remarks: 'Site inspected. Connection route identified through parking area. Pipeline pressure noted as marginal for commercial use during peak demand. Estimation prepared with restoration charges. Forwarding to Commissioner.',
        forwardedAt: '2025-10-08T16:30:00',
        status: 'forwarded',
      },
      commissioner: {
        name: 'Dr. Suresh B. Angadi',
        comment: 'Application rejected. The applicant has provided a rental agreement but the property ownership verification reveals pending litigation on the property (Civil Suit No. CS/2024/1456 in Dharwad Civil Court). As per KMDS guidelines, new water connections cannot be sanctioned for properties with pending legal disputes. The applicant should resolve the property dispute first and re-apply with updated legal clearance documents.',
        decidedAt: '2025-11-28T11:30:00',
        status: 'rejected',
      },
    },
  },
  'NTC/2025/HBD/0045': {
    applicationNo: 'NTC/2025/HBD/0045',
    submittedAt: '2025-11-01T08:45:00',
    status: 'rejected',
    applicantDetails: {
      applicantName: 'Mohammed Irfan Shaikh',
      fatherName: 'Abdul Kareem Shaikh',
      mobile: '9988776655',
      email: 'irfan.shaikh@gmail.com',
      aadharNumber: '4321 0987 6543',
      doorNumber: '78/1',
      wardNumber: 'Ward 18',
      street: 'Lamington Road',
      address: '78/1, Lamington Road, Hubli - 580021',
    },
    propertyDetails: {
      district: 'Dharwad',
      ulb: 'Hubli-Dharwad Municipal Corporation',
      ulbType: 'Corporation',
      authorityType: 'Municipal',
      propertyType: 'Residential',
      ownershipType: 'Self-Owned',
    },
    connectionDetails: {
      connectionType: 'Domestic',
      propertyType: 'Residential',
    },
    plumberDetails: {
      plumberName: 'Rajesh P. Naik',
      licenseNo: 'PLB/2023/HBD/089',
    },
    plumberEstimation: {
      rows: [
        { id: '1', attribute: 'GI Pipe 15mm', measurement: '15 meters', price: 2250 },
        { id: '2', attribute: 'PVC Pipe 20mm', measurement: '6 meters', price: 720 },
        { id: '3', attribute: 'Stop Cock 15mm', measurement: '2 Nos', price: 450 },
        { id: '4', attribute: 'Ferrule 15mm', measurement: '1 No', price: 350 },
        { id: '5', attribute: 'Labour Charges', measurement: 'Lump Sum', price: 3000 },
      ],
      totalAmount: 6770,
      comments: 'Domestic connection with slightly longer route due to narrow lane access. Connection from Lamington Road main line.',
    },
    fieldVisitReport: {
      engineerName: 'Anand S. Kulkarni',
      siteObservations: 'Property located in a densely built area off Lamington Road. Narrow access lane (approx 3m wide). Main pipeline runs along Lamington Road. Trenching will affect pedestrian access temporarily. Existing drainage line runs parallel at 0.8m depth — needs careful excavation.',
      engineerRemarks: 'Connection feasible but requires careful execution due to proximity to existing drainage line. Recommended hand trenching for the last 5 meters near the property. No blasting required.',
      locationVerification: {
        verified: true,
        verifiedAt: '2025-11-20T10:30:00',
        address: '78/1, Lamington Road, Hubli - 580021',
        latitude: 15.3510,
        longitude: 75.1350,
      },
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
      caseworker: {
        name: 'Prakash Hegde',
        comment: 'Documents verified. Property ownership khata extract valid. Aadhar verified. Application is in order. Forwarding to Revenue Officer.',
        forwardedAt: '2025-11-05T09:30:00',
        status: 'forwarded',
      },
      revenueOfficer: {
        name: 'Mahesh V. Hosamani',
        comment: 'Ward 18 zone check completed. Property has existing arrears of ₹2,400 on SWM charges from FY 2024-25. However, water supply zone validation is cleared. Forwarded with note on pending SWM dues.',
        forwardedAt: '2025-11-12T15:00:00',
        status: 'forwarded',
      },
      fieldEngineer: {
        name: 'Anand S. Kulkarni',
        remarks: 'Site inspection completed. Location GPS verified. Connection route identified. Drainage line proximity noted — hand trenching recommended near property. Estimation prepared. Forwarding to Commissioner.',
        forwardedAt: '2025-11-20T16:45:00',
        status: 'forwarded',
      },
      commissioner: {
        name: 'Dr. Suresh B. Angadi',
        comment: 'Application rejected. The Revenue Officer has noted outstanding SWM arrears of ₹2,400 for FY 2024-25. As per Municipal Corporation bye-laws (Section 147), no new utility connections shall be sanctioned until all existing municipal dues are cleared. The applicant must clear the pending SWM charges and obtain a No Dues Certificate from the Revenue Section before re-applying.',
        decidedAt: '2026-01-05T09:45:00',
        status: 'rejected',
      },
    },
  },
  'NTC/2026/HBD/0003': {
    applicationNo: 'NTC/2026/HBD/0003',
    submittedAt: '2025-12-10T11:00:00',
    status: 'rejected',
    applicantDetails: {
      applicantName: 'Sanjay B. Kulkarni',
      fatherName: 'Balappa Kulkarni',
      mobile: '9345678901',
      email: 'sanjay.kulkarni@rediffmail.com',
      aadharNumber: '2109 8765 4321',
      doorNumber: '23/C',
      wardNumber: 'Ward 8',
      street: 'Koppikar Road',
      address: '23/C, Koppikar Road, Hubli - 580020',
    },
    propertyDetails: {
      district: 'Dharwad',
      ulb: 'Hubli-Dharwad Municipal Corporation',
      ulbType: 'Corporation',
      authorityType: 'Municipal',
      propertyType: 'Residential',
      ownershipType: 'Joint Ownership',
    },
    connectionDetails: {
      connectionType: 'Domestic',
      propertyType: 'Residential',
    },
    plumberDetails: {
      plumberName: 'Suresh M. Gowda',
      licenseNo: 'PLB/2024/HBD/056',
    },
    plumberEstimation: {
      rows: [
        { id: '1', attribute: 'GI Pipe 15mm', measurement: '10 meters', price: 1500 },
        { id: '2', attribute: 'PVC Pipe 20mm', measurement: '5 meters', price: 600 },
        { id: '3', attribute: 'Stop Cock 15mm', measurement: '1 No', price: 225 },
        { id: '4', attribute: 'Ferrule 15mm', measurement: '1 No', price: 350 },
        { id: '5', attribute: 'Labour Charges', measurement: 'Lump Sum', price: 2000 },
      ],
      totalAmount: 4675,
      comments: 'Short route connection from Koppikar Road main line. Straightforward installation.',
    },
    fieldVisitReport: {
      engineerName: 'Priya S. Desai',
      siteObservations: 'Property on Koppikar Road near HDMC office. Good access. Main line (250mm DI) runs directly in front. However, property already has an existing disconnected water connection (old RR No: HD/2019/D/4523). Meter box found at property boundary in damaged condition.',
      engineerRemarks: 'An old disconnected connection exists at this property. As per records, it was disconnected in 2021 due to non-payment of water bills amounting to ₹8,750. Recommending the applicant clear previous dues and apply for reconnection instead of a new connection.',
      locationVerification: {
        verified: true,
        verifiedAt: '2026-01-15T13:00:00',
        address: '23/C, Koppikar Road, Hubli - 580020',
        latitude: 15.3580,
        longitude: 75.1280,
      },
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
      caseworker: {
        name: 'Deepa M. Hiremath',
        comment: 'Documents verified. Joint ownership deed attached. Both owners have signed the application. NOC from co-owner present. Forwarded to Revenue Officer.',
        forwardedAt: '2025-12-15T10:30:00',
        status: 'forwarded',
      },
      revenueOfficer: {
        name: 'Kavitha R. Naik',
        comment: 'Ward 8 verification completed. Note: Property records show a previous water connection (RR No: HD/2019/D/4523) that was disconnected in 2021 with outstanding dues of ₹8,750. This should be flagged for Commissioner review. Zone clearance given subject to resolution of previous dues.',
        forwardedAt: '2025-12-22T14:00:00',
        status: 'forwarded',
      },
      fieldEngineer: {
        name: 'Priya S. Desai',
        remarks: 'Site inspection confirms existing disconnected connection at the property. Old meter box and ferrule still present at boundary. Recommending reconnection process instead of new connection to avoid duplicate infrastructure. Forwarding to Commissioner with this observation.',
        forwardedAt: '2026-01-15T17:00:00',
        status: 'forwarded',
      },
      commissioner: {
        name: 'Dr. Suresh B. Angadi',
        comment: 'Application rejected. Site inspection and Revenue Officer records confirm that the property already has an existing water connection (RR No: HD/2019/D/4523) that was disconnected in 2021 due to non-payment of ₹8,750 in water charges. As per KMDS Policy Circular No. 23/2024, a new tap connection cannot be sanctioned for a property with an existing disconnected connection. The applicant must first clear the outstanding dues and apply for Tap Reconnection through the appropriate sub-menu.',
        decidedAt: '2026-02-02T10:00:00',
        status: 'rejected',
      },
    },
  },
  'NTC/2026/HBD/0018': {
    applicationNo: 'NTC/2026/HBD/0018',
    submittedAt: '2026-01-05T14:30:00',
    status: 'rejected',
    applicantDetails: {
      applicantName: 'Geeta S. Deshmukh',
      fatherName: 'Shivappa Deshmukh',
      mobile: '9567890123',
      email: 'geeta.deshmukh@gmail.com',
      aadharNumber: '1098 7654 3210',
      doorNumber: '156',
      wardNumber: 'Ward 22',
      street: 'Vidyanagar',
      address: '156, Vidyanagar, Hubli - 580031',
    },
    propertyDetails: {
      district: 'Dharwad',
      ulb: 'Hubli-Dharwad Municipal Corporation',
      ulbType: 'Corporation',
      authorityType: 'Municipal',
      propertyType: 'Residential',
      ownershipType: 'Self-Owned',
    },
    connectionDetails: {
      connectionType: 'Domestic',
      propertyType: 'Residential',
    },
    plumberDetails: {
      plumberName: 'Rajesh P. Naik',
      licenseNo: 'PLB/2023/HBD/089',
    },
    plumberEstimation: {
      rows: [
        { id: '1', attribute: 'GI Pipe 15mm', measurement: '20 meters', price: 3000 },
        { id: '2', attribute: 'PVC Pipe 20mm', measurement: '12 meters', price: 1440 },
        { id: '3', attribute: 'Stop Cock 15mm', measurement: '2 Nos', price: 450 },
        { id: '4', attribute: 'Ferrule 15mm', measurement: '1 No', price: 350 },
        { id: '5', attribute: 'Labour Charges', measurement: 'Lump Sum', price: 3500 },
      ],
      totalAmount: 8740,
      comments: 'Extended route required as property is set back from main road. Pipe needs to cross an internal lane.',
    },
    fieldVisitReport: {
      engineerName: 'Anand S. Kulkarni',
      siteObservations: 'Property in Vidyanagar layout, Ward 22. This area falls under the Malaprabha Right Bank Canal (MRBC) water supply zone. The zone currently has intermittent water supply (alternate days, 2 hours). Main pipeline (100mm AC pipe) is old and has frequent burst history. Area is proposed for pipeline replacement under JJM (Jal Jeevan Mission) Phase-II.',
      engineerRemarks: 'Connection technically feasible but the existing 100mm AC main pipeline in Vidyanagar is aged (installed circa 1998) and scheduled for replacement under JJM Phase-II. Adding new connections may increase pressure on the already stressed pipeline. Recommend deferring new connections until pipeline replacement is completed.',
      locationVerification: {
        verified: true,
        verifiedAt: '2026-01-28T11:15:00',
        address: '156, Vidyanagar, Hubli - 580031',
        latitude: 15.3720,
        longitude: 75.1150,
      },
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
      caseworker: {
        name: 'Prakash Hegde',
        comment: 'All documents verified. Property khata and ownership documents valid. Aadhar matching confirmed. Forwarding to Revenue Officer.',
        forwardedAt: '2026-01-10T11:00:00',
        status: 'forwarded',
      },
      revenueOfficer: {
        name: 'Mahesh V. Hosamani',
        comment: 'Ward 22 zone verification completed. No outstanding dues on property. However, noting that Vidyanagar area has been flagged for infrastructure upgrade under JJM Phase-II. Water supply in this zone is currently intermittent. Forwarded to Field Engineer for assessment.',
        forwardedAt: '2026-01-18T16:00:00',
        status: 'forwarded',
      },
      fieldEngineer: {
        name: 'Anand S. Kulkarni',
        remarks: 'Site inspected. Old AC pipeline (100mm, circa 1998) serves this area. Pipeline has documented burst history — 4 incidents in last 6 months. Area is under JJM Phase-II for complete pipeline replacement. Adding new load to this pipeline is not advisable. Forwarding to Commissioner with strong recommendation to defer.',
        forwardedAt: '2026-01-28T17:30:00',
        status: 'forwarded',
      },
      commissioner: {
        name: 'Dr. Suresh B. Angadi',
        comment: 'Application rejected. Based on the Field Engineer\'s assessment, the Vidyanagar area (Ward 22) is served by an aging 100mm AC pipeline installed in 1998 with documented frequent burst incidents. The area is scheduled for complete pipeline replacement under Jal Jeevan Mission Phase-II (Work Order No: JJM/KAR/2025/W-0892, expected completion: September 2026). Sanctioning new connections on this deteriorated pipeline would pose supply quality and pressure risks. The applicant is advised to re-apply after the JJM Phase-II pipeline replacement is completed in the Vidyanagar zone.',
        decidedAt: '2026-02-14T10:30:00',
        status: 'rejected',
      },
    },
  },
};

export default function CitizenRequestAppeal() {
  const [menu, setMenu] = useState('tap_connection');
  const [subMenu, setSubMenu] = useState('new_tap_connection');
  const [applicationNo, setApplicationNo] = useState('');
  const [dateOfRejection, setDateOfRejection] = useState('');
  const [reasonForAppeal, setReasonForAppeal] = useState('');
  const [supportingDoc, setSupportingDoc] = useState<File | null>(null);
  const [docUploaded, setDocUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rejectedApps, setRejectedApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [appealId, setAppealId] = useState('');
  const [showDetailView, setShowDetailView] = useState(false);

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const phone = userData && userData.phone ? String(userData.phone) : '';

  useEffect(() => {
    fetchRejectedApplications();
  }, []);

  const fetchRejectedApplications = async () => {
    setLoading(true);
    try {
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
          if (!app) return false;
          if (app.status !== 'rejected') return false;
          const appCid = app.citizenId ? String(app.citizenId).trim() : '';
          const myCid = 'CITIZEN-' + phone;
          if (appCid === myCid) return true;
          if (phone && phone.length > 5) {
            if (appCid.includes(phone)) return true;
            if (app.applicantDetails && app.applicantDetails.mobile && String(app.applicantDetails.mobile).includes(phone)) return true;
          }
          return false;
        });
        console.log('[APPEAL REQUEST] Found', myRejected.length, 'rejected applications');
        setRejectedApps(myRejected);
      }
    } catch (err) {
      console.error('[APPEAL REQUEST] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  // Dummy NTC application numbers (fallback when no real rejected apps exist)
  const dummyApps = [
    { value: 'NTC/2025/HBD/0012', label: 'NTC/2025/HBD/0012', rejectedDate: '2025-12-10' },
    { value: 'NTC/2025/HBD/0037', label: 'NTC/2025/HBD/0037', rejectedDate: '2025-11-28' },
    { value: 'NTC/2025/HBD/0045', label: 'NTC/2025/HBD/0045', rejectedDate: '2026-01-05' },
    { value: 'NTC/2026/HBD/0003', label: 'NTC/2026/HBD/0003', rejectedDate: '2026-02-02' },
    { value: 'NTC/2026/HBD/0018', label: 'NTC/2026/HBD/0018', rejectedDate: '2026-02-14' },
  ];

  // When application no changes, auto-fill Date of Rejection
  const handleApplicationChange = (val: string) => {
    setApplicationNo(val);
    setShowDetailView(false);
    if (val && val !== '__none__') {
      const found = rejectedApps.find((a) => a.id === val);
      if (found) {
        const rejDate = found.updatedAt || found.rejectedAt || '';
        setDateOfRejection(formatDate(rejDate));
      } else {
        // Check dummy apps fallback
        const dummyMatch = dummyApps.find((d) => d.value === val);
        if (dummyMatch) {
          setDateOfRejection(formatDate(dummyMatch.rejectedDate));
        } else {
          setDateOfRejection('');
        }
      }
    } else {
      setDateOfRejection('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (file) {
      setSupportingDoc(file);
      setDocUploaded(true);
    }
  };

  const handleRemoveFile = () => {
    setSupportingDoc(null);
    setDocUploaded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!applicationNo || applicationNo === '__none__') {
      alert('Please select an Application No');
      return;
    }
    if (!reasonForAppeal || reasonForAppeal === '__none__') {
      alert('Please select a Reason for Appeal');
      return;
    }
    if (!confirm('Are you sure you want to submit this appeal? This will be sent to the Project Director for review.')) return;

    setSubmitting(true);
    try {
      const selectedApp = rejectedApps.find((a) => a.id === applicationNo);
      const applicantName = (selectedApp && selectedApp.applicantDetails && selectedApp.applicantDetails.applicantName) || userData.name || 'N/A';
      const ulb = (selectedApp && selectedApp.propertyDetails && selectedApp.propertyDetails.ulb) || 'Hubli-Dharwad';
      const connectionType = (selectedApp && selectedApp.connectionDetails && selectedApp.connectionDetails.connectionType) || 'N/A';
      const rejectedAt = selectedApp ? (selectedApp.updatedAt || selectedApp.rejectedAt || '') : '';

      const reasonLabels: Record<string, string> = {
        incorrect_evaluation: 'Incorrect Evaluation',
        improper_verification: 'Improper Verification',
        technical_error: 'Technical/System Error',
        biased_decision: 'Biased Decision',
        incomplete_review: 'Incomplete Review',
        other: 'Other',
      };
      const reasonText = reasonLabels[reasonForAppeal] || reasonForAppeal;

      const subMenuLabels: Record<string, string> = {
        new_tap_connection: 'New Tap Connection',
        reconnection: 'Tap Reconnection',
        disconnection: 'Tap Disconnection',
        change_connection: 'Change Connection Type',
      };
      const subMenuText = subMenuLabels[subMenu] || subMenu;

      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/appeal/submit',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + publicAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            originalApplicationId: applicationNo,
            citizenId: 'CITIZEN-' + phone,
            citizenName: applicantName,
            citizenPhone: phone,
            reasonForAppeal: reasonText,
            applicationDetails: {
              ulb,
              menu: 'Tap Connection',
              subMenu: subMenuText,
              connectionType,
              applicantName,
              rejectedAt,
              updatedAt: selectedApp ? selectedApp.updatedAt || '' : '',
              applicationNo: applicationNo,
            },
          }),
        }
      );

      const data = await response.json();
      console.log('[APPEAL REQUEST] Submit response:', data);

      if (data.success) {
        setSubmitted(true);
        setAppealId(data.appealId || '');
      } else {
        alert('Failed to submit appeal: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('[APPEAL REQUEST] Submit error:', err);
      alert('Network error while submitting appeal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setMenu('tap_connection');
    setSubMenu('new_tap_connection');
    setApplicationNo('');
    setDateOfRejection('');
    setReasonForAppeal('');
    setSupportingDoc(null);
    setDocUploaded(false);
  };

  // Build application number options from rejected apps
  const realOptions = rejectedApps.map((app) => ({
    value: app.id,
    label: app.applicationNo || app.id,
  }));

  const appNoOptions = realOptions.length > 0
    ? realOptions
    : dummyApps.map((d) => ({ value: d.value, label: d.label }));

  // Success view
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        <div className="max-w-[600px] mx-auto mt-12">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Appeal Submitted Successfully
            </h2>
            <p className="text-[14px] text-gray-600 font-['Poppins',sans-serif] mb-2">
              Your appeal has been submitted to the Project Director for review.
            </p>
            {appealId && (
              <p className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-6">
                Appeal Application No: <span className="text-[#f9a825]">{appealId}</span>
              </p>
            )}
            <GovButton
              variant="primary"
              onClick={() => {
                setSubmitted(false);
                handleCancel();
                fetchRejectedApplications();
              }}
            >
              Submit Another Appeal
            </GovButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] flex items-center gap-3">
          <Scale className="w-6 h-6" />
          Request Appeal
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">
          Fill in the details below to submit an appeal for a rejected application
        </p>
      </div>

      {/* Appeal Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
            Appeal Details
          </h2>
        </div>

        <div className="p-6">
          <div className="bg-[#f8fafc] rounded-lg p-5">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-3 border-[#1f3a5f] border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-gray-500 font-['Poppins',sans-serif]">Loading applications...</p>
              </div>
            ) : (
              <>
                {/* Row 1: Menu, Sub-Menu, Application No, Date of Rejection */}
                <div className="grid grid-cols-4 gap-5 mb-5">
                  <GovSelect
                    label="Menu"
                    required
                    placeholder="Select Menu"
                    options={[
                      { value: 'tap_connection', label: 'Tap Connection' },
                    ]}
                    value={menu}
                    onValueChange={setMenu}
                  />

                  <GovSelect
                    label="Sub-Menu"
                    required
                    placeholder="Select Sub-Menu"
                    options={[
                      { value: 'new_tap_connection', label: 'New Tap Connection' },
                      { value: 'reconnection', label: 'Tap Reconnection' },
                      { value: 'disconnection', label: 'Tap Disconnection' },
                      { value: 'change_connection', label: 'Change Connection Type' },
                    ]}
                    value={subMenu}
                    onValueChange={setSubMenu}
                  />

                  <GovSelect
                    label="Application No"
                    required
                    placeholder="Select Application"
                    options={appNoOptions}
                    value={applicationNo}
                    onValueChange={handleApplicationChange}
                  />

                  <div className="flex flex-col">
                    <GovInput
                      label="Date of Rejection"
                      required
                      value={dateOfRejection}
                      readOnly
                      disabled
                      placeholder="Auto-filled"
                    />
                    {applicationNo && applicationNo !== '__none__' && (
                      <button
                        type="button"
                        onClick={() => setShowDetailView(!showDetailView)}
                        className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-[#1f3a5f] hover:text-[#f9a825] font-['Poppins',sans-serif] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        {showDetailView ? 'Hide Details' : 'View Application Details'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Row 2: Reason for Appeal, Supporting Doc */}
                <div className="grid grid-cols-4 gap-5">
                  <GovSelect
                    label="Reason for Appeal"
                    required
                    placeholder="Select Reason"
                    options={[
                      { value: 'incorrect_evaluation', label: 'Incorrect Evaluation' },
                      { value: 'improper_verification', label: 'Improper Verification' },
                      { value: 'technical_error', label: 'Technical/System Error' },
                      { value: 'biased_decision', label: 'Biased Decision' },
                      { value: 'incomplete_review', label: 'Incomplete Review' },
                      { value: 'other', label: 'Other' },
                    ]}
                    value={reasonForAppeal}
                    onValueChange={setReasonForAppeal}
                  />

                  <div className="w-full">
                    <p className="text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                      Supporting Doc <span className="text-red-600">*</span>
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {docUploaded && supportingDoc ? (
                      <div className="flex items-center gap-3 bg-white border border-green-300 rounded-lg px-4 py-3">
                        <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 font-['Poppins',sans-serif] truncate">
                            {supportingDoc.name}
                          </p>
                          <p className="text-xs text-gray-500 font-['Poppins',sans-serif]">
                            {(supportingDoc.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <GovButton
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }}
                      >
                        <Upload className="w-4 h-4" />
                        Upload Document
                      </GovButton>
                    )}
                    <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1.5">
                      Accepted formats: PDF, JPG, PNG, DOC (Max 5MB)
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Submit / Cancel Buttons */}
          {!loading && (
            <div className="flex justify-center gap-4 mt-6">
              <GovButton
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                loading={submitting}
                disabled={!applicationNo || applicationNo === '__none__' || !reasonForAppeal || reasonForAppeal === '__none__'}
              >
                Submit
              </GovButton>
              <GovButton
                variant="outline"
                size="lg"
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancel
              </GovButton>
            </div>
          )}
        </div>
      </div>

      {/* Application Detail View - shown when View is clicked */}
      {showDetailView && applicationNo && applicationNo !== '__none__' && (() => {
        const app = DUMMY_APP_DETAILS[applicationNo] || null;
        if (!app) {
          return (
            <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <p className="text-gray-500 font-['Poppins',sans-serif] text-center">Application details not available for this application.</p>
            </div>
          );
        }

        const ad = app.applicantDetails || {};
        const pd = app.propertyDetails || {};
        const cd = app.connectionDetails || {};
        const plb = app.plumberDetails || {};
        const pe = app.plumberEstimation || {};
        const peRows = pe.rows || [];
        const fvr = app.fieldVisitReport || {};
        const feEst = (fvr && fvr.fieldEngineerEstimation) || {};
        const feEstRows = feEst.rows || [];
        const wf = app.workflow || {};
        const cw = wf.caseworker || {};
        const ro = wf.revenueOfficer || {};
        const fe = wf.fieldEngineer || {};
        const comm = wf.commissioner || {};

        const formatDateTime = (ds: string) => {
          if (!ds) return 'N/A';
          try {
            const d = new Date(ds);
            return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
          } catch { return 'N/A'; }
        };

        return (
          <div className="mt-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                    Application Details — {app.applicationNo}
                  </h2>
                  <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mt-1">
                    Submitted: {formatDateTime(app.submittedAt)} &nbsp;|&nbsp;
                    Status: <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Rejected</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetailView(false)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 font-['Poppins',sans-serif] transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Applicant Information */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-[#1f3a5f]" />
                    <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">Applicant Information</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 bg-[#f8fafc] rounded-lg p-4">
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Name</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{ad.applicantName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Father's Name</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{ad.fatherName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Mobile</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{ad.mobile || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Email</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{ad.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Aadhar Number</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{ad.aadharNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Door No / Ward</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{ad.doorNumber || 'N/A'} / {ad.wardNumber || 'N/A'}</p>
                    </div>
                    <div className="col-span-3">
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Address</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{ad.address || 'N/A'}</p>
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
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">District</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{pd.district || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">ULB</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{pd.ulb || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">ULB Type</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{pd.ulbType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Authority Type</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{pd.authorityType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Property Type</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{pd.propertyType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Ownership Type</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{pd.ownershipType || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Connection Details */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Droplet className="w-5 h-5 text-[#1f3a5f]" />
                    <h3 className="text-lg font-semibold text-[#414141] font-['Poppins',sans-serif]">Connection Details</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 bg-[#f8fafc] rounded-lg p-4">
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Connection Type</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">{cd.connectionType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Property Type</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif] capitalize">{cd.propertyType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Assigned Plumber</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{plb.plumberName || 'N/A'} ({plb.licenseNo || 'N/A'})</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plumber Estimation */}
            {peRows.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wrench className="w-5 h-5 text-[#1f3a5f]" />
                  <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Plumber Cost Estimation</h3>
                </div>
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
            )}

            {/* Field Inspection Report */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">Field Inspection Report</h3>
              <div className="space-y-4">
                <div className="bg-[#f8fafc] rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Inspected By</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{fvr.engineerName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Location Verified</p>
                      <span className={'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ' + (fvr.locationVerification && fvr.locationVerification.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                        {fvr.locationVerification && fvr.locationVerification.verified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">Verified At</p>
                      <p className="text-[15px] font-medium text-gray-900 font-['Poppins',sans-serif]">{fvr.locationVerification && fvr.locationVerification.verifiedAt ? formatDateTime(fvr.locationVerification.verifiedAt) : 'N/A'}</p>
                    </div>
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
              </div>

              {/* Field Engineer Estimation */}
              {feEstRows.length > 0 && (
                <div className="mt-6">
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

            {/* Workflow Remarks Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <MessageSquare className="w-5 h-5 text-[#1f3a5f]" />
                <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">Workflow Remarks</h3>
              </div>
              <div className="space-y-0">
                {/* Caseworker */}
                {cw.comment && (
                  <div className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 bg-sky-600" />
                      <div className="w-0.5 flex-1 bg-gray-200 mt-1 mb-1" />
                    </div>
                    <div className="flex-1 mb-4">
                      <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-sky-800 font-['Poppins',sans-serif]">Caseworker — {cw.name || 'N/A'}</span>
                          <span className="text-xs text-gray-500 font-['Poppins',sans-serif]">{formatDateTime(cw.forwardedAt)}</span>
                        </div>
                        <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">{cw.comment}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Revenue Officer */}
                {ro.comment && (
                  <div className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 bg-amber-500" />
                      <div className="w-0.5 flex-1 bg-gray-200 mt-1 mb-1" />
                    </div>
                    <div className="flex-1 mb-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-amber-800 font-['Poppins',sans-serif]">Revenue Officer — {ro.name || 'N/A'}</span>
                          <span className="text-xs text-gray-500 font-['Poppins',sans-serif]">{formatDateTime(ro.forwardedAt)}</span>
                        </div>
                        <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">{ro.comment}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Field Engineer */}
                {fe.remarks && (
                  <div className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 bg-indigo-500" />
                      <div className="w-0.5 flex-1 bg-gray-200 mt-1 mb-1" />
                    </div>
                    <div className="flex-1 mb-4">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-indigo-800 font-['Poppins',sans-serif]">Field Engineer — {fe.name || 'N/A'}</span>
                          <span className="text-xs text-gray-500 font-['Poppins',sans-serif]">{formatDateTime(fe.forwardedAt)}</span>
                        </div>
                        <p className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">{fe.remarks}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Commissioner — Rejection */}
                {comm.comment && (
                  <div className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 bg-red-500" />
                    </div>
                    <div className="flex-1 mb-1">
                      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="text-sm font-bold text-red-800 font-['Poppins',sans-serif]">Commissioner — {comm.name || 'N/A'}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-200 text-red-800">REJECTED</span>
                          </div>
                          <span className="text-xs text-gray-500 font-['Poppins',sans-serif]">{formatDateTime(comm.decidedAt)}</span>
                        </div>
                        <p className="text-[14px] text-gray-800 font-['Poppins',sans-serif] leading-relaxed font-medium">{comm.comment}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Home,
  ChevronDown,
  Settings,
  Users,
  Database,
  Shield,
  Building2,
  MapPin,
  Plus,
  Search,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Check,
  GitBranch,
  IndianRupee,
  Globe,
  Landmark,
  AlertCircle,
  FileText,
  Layers,
  Calendar,
} from 'lucide-react';
import UnifiedSidebar from './UnifiedSidebar';
import type { SidebarMenuItem } from './UnifiedSidebar';

const FONT = "font-['Poppins',sans-serif]";

// ── Types ────────────────────────────────────────────────────────────────────
type View =
  | 'overview'
  | 'user-management'
  | 'masters-authority-type'
  | 'masters-stage-workflow'
  | 'masters-schemes'
  | 'masters-workflow-level'
  | 'masters-penalty-reason'
  | 'masters-rejection-reason'
  | 'masters-map-plumber-type'
  | 'masters-tariff-rates'
  | 'masters-district-escom'
  | 'config-workflow'
  | 'config-tariff'
  | 'config-notifications'
  | 'config-system';

// ── Master Data Types ────────────────────────────────────────────────────────
interface AuthorityTypeRecord {
  id: number;
  name: string;
  code: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdOn: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// Overview Component
// ══════════════════════════════════════════════════════════════════════════════
function OverviewContent() {
  const stats = [
    { label: 'Total ULBs', value: '314', icon: Building2, color: 'blue' },
    { label: 'Active Users', value: '2,847', icon: Users, color: 'emerald' },
    { label: 'Districts', value: '31', icon: MapPin, color: 'purple' },
    { label: 'Authority Types', value: '6', icon: Shield, color: 'amber' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold text-[#1f3a5f] ${FONT}`}>
          DMA Admin Overview
        </h1>
        <p className={`text-sm text-gray-600 ${FONT} mt-1`}>
          Department of Municipal Administration &mdash; System Administration Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const bgMap: Record<string, string> = {
            blue: 'bg-blue-50 border-blue-200',
            emerald: 'bg-emerald-50 border-emerald-200',
            purple: 'bg-purple-50 border-purple-200',
            amber: 'bg-amber-50 border-amber-200',
          };
          const iconBgMap: Record<string, string> = {
            blue: 'bg-blue-100',
            emerald: 'bg-emerald-100',
            purple: 'bg-purple-100',
            amber: 'bg-amber-100',
          };
          const iconColorMap: Record<string, string> = {
            blue: 'text-[#1f3a5f]',
            emerald: 'text-emerald-700',
            purple: 'text-purple-700',
            amber: 'text-amber-700',
          };
          const valColorMap: Record<string, string> = {
            blue: 'text-[#1f3a5f]',
            emerald: 'text-emerald-700',
            purple: 'text-purple-700',
            amber: 'text-amber-700',
          };

          return (
            <div key={stat.label} className={`rounded-lg border p-5 ${bgMap[stat.color]}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full ${iconBgMap[stat.color]} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${iconColorMap[stat.color]}`} />
                </div>
                <span className={`text-[11px] uppercase tracking-wide font-semibold text-gray-500 ${FONT}`}>
                  {stat.label}
                </span>
              </div>
              <p className={`text-2xl font-bold ${valColorMap[stat.color]} ${FONT}`}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Welcome Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className={`text-xl font-semibold text-[#1f3a5f] ${FONT} mb-4`}>
          Welcome, DMA Administrator
        </h2>
        <p className={`text-gray-700 ${FONT} leading-relaxed mb-4`}>
          As the DMA Admin, you have state-level access to manage master data, user accounts,
          system configurations, and administrative settings across all ULBs under the
          Department of Municipal Administration, Government of Karnataka.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#1f3a5f]" />
              </div>
              <h3 className={`text-sm font-semibold text-[#1f3a5f] ${FONT}`}>User Management</h3>
            </div>
            <p className={`text-xs text-gray-600 ${FONT}`}>
              Manage state and district-level users, roles, and access permissions.
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className={`text-sm font-semibold text-purple-800 ${FONT}`}>Masters</h3>
            </div>
            <p className={`text-xs text-gray-600 ${FONT}`}>
              Maintain master data like Authority Types, Districts, ULB Types, and Zones.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Settings className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className={`text-sm font-semibold text-amber-800 ${FONT}`}>Configurations</h3>
            </div>
            <p className={`text-xs text-gray-600 ${FONT}`}>
              Configure workflows, tariff rules, notifications, and system parameters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// User Management
// ══════════════════════════════════════════════════════════════════════════════
function UserManagementContent() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold text-[#1f3a5f] ${FONT}`}>User Management</h1>
        <p className={`text-sm text-gray-600 ${FONT} mt-1`}>
          Manage state and district-level users, roles, and access permissions
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className={`text-lg font-semibold text-gray-500 ${FONT} mb-2`}>Coming Soon</h3>
          <p className={`text-sm text-gray-400 ${FONT}`}>
            State-level user management features will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Authority Type Master
// ══════════════════════════════════════════════════════════════════════════════
function AuthorityTypeMaster() {
  const [records, setRecords] = useState<AuthorityTypeRecord[]>([
    { id: 1, name: 'City Corporation', code: 'CC', description: 'City Corporation / Mahanagara Palike', status: 'Active', createdOn: '2024-01-15' },
    { id: 2, name: 'City Municipal Council', code: 'CMC', description: 'City Municipal Council / Nagara Sabhe', status: 'Active', createdOn: '2024-01-15' },
    { id: 3, name: 'Town Municipal Council', code: 'TMC', description: 'Town Municipal Council / Pura Sabhe', status: 'Active', createdOn: '2024-01-15' },
    { id: 4, name: 'Town Panchayat', code: 'TP', description: 'Town Panchayat / Pattana Panchayat', status: 'Active', createdOn: '2024-01-15' },
    { id: 5, name: 'Notified Area Committee', code: 'NAC', description: 'Notified Area Committee', status: 'Active', createdOn: '2024-02-10' },
    { id: 6, name: 'Industrial Township', code: 'ITA', description: 'Industrial Township Authority', status: 'Inactive', createdOn: '2024-03-05' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState<AuthorityTypeRecord | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  const filtered = records.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  });

  const openAdd = () => {
    setEditRecord(null);
    setFormName('');
    setFormCode('');
    setFormDesc('');
    setFormStatus('Active');
    setShowModal(true);
  };

  const openEdit = (rec: AuthorityTypeRecord) => {
    setEditRecord(rec);
    setFormName(rec.name);
    setFormCode(rec.code);
    setFormDesc(rec.description);
    setFormStatus(rec.status);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formName.trim() || !formCode.trim()) return;

    if (editRecord) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editRecord.id
            ? { ...r, name: formName, code: formCode, description: formDesc, status: formStatus }
            : r
        )
      );
    } else {
      const newId = Math.max(...records.map((r) => r.id)) + 1;
      setRecords((prev) => [
        ...prev,
        {
          id: newId,
          name: formName,
          code: formCode,
          description: formDesc,
          status: formStatus,
          createdOn: new Date().toISOString().split('T')[0],
        },
      ]);
    }
    setShowModal(false);
  };

  const toggleStatus = (id: number) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' } : r
      )
    );
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this Authority Type?')) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className={`text-2xl font-bold text-[#1f3a5f] ${FONT}`}>Authority Type</h1>
          <p className={`text-sm text-gray-600 ${FONT} mt-1`}>
            Manage authority types for Urban Local Bodies (ULBs)
          </p>
        </div>
        <button
          onClick={openAdd}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#1f3a5f] rounded-lg hover:bg-[#2d4a6f] transition-colors ${FONT}`}
        >
          <Plus className="w-4 h-4" />
          Add Authority Type
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 border-[1.5px] border-gray-300 rounded-md ${FONT} text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all`}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1f3a5f]">
                <th className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-white ${FONT}`}>#</th>
                <th className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-white ${FONT}`}>Authority Name</th>
                <th className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-white ${FONT}`}>Code</th>
                <th className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-white ${FONT}`}>Description</th>
                <th className={`px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-white ${FONT}`}>Status</th>
                <th className={`px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-white ${FONT}`}>Created On</th>
                <th className={`px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-white ${FONT}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Database className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className={`text-gray-500 ${FONT} font-medium text-sm`}>No records found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((rec, idx) => (
                  <tr
                    key={rec.id}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'} hover:bg-blue-50/40 transition-colors border-b border-gray-100`}
                  >
                    <td className={`px-4 py-3 text-[12px] text-gray-500 font-medium ${FONT}`}>{idx + 1}</td>
                    <td className={`px-4 py-3 text-[13px] text-gray-900 font-semibold ${FONT}`}>{rec.name}</td>
                    <td className={`px-4 py-3 ${FONT}`}>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#1f3a5f] border border-blue-200">
                        {rec.code}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-[12px] text-gray-600 ${FONT}`}>{rec.description}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleStatus(rec.id)} title="Toggle status">
                        {rec.status === 'Active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ToggleRight className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                            <ToggleLeft className="w-3.5 h-3.5" />
                            Inactive
                          </span>
                        )}
                      </button>
                    </td>
                    <td className={`px-4 py-3 text-center text-[12px] text-gray-600 ${FONT}`}>{rec.createdOn}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(rec)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-[#1f3a5f] transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200">
          <p className={`text-[12px] text-gray-500 ${FONT}`}>
            Showing <span className="font-semibold text-[#1f3a5f]">{filtered.length}</span> of{' '}
            <span className="font-semibold text-[#1f3a5f]">{records.length}</span> authority types
          </p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className={`text-lg font-semibold text-[#1f3a5f] ${FONT}`}>
                {editRecord ? 'Edit Authority Type' : 'Add Authority Type'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={`block text-[13px] font-medium text-gray-700 mb-1.5 ${FONT}`}>
                  Authority Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. City Corporation"
                  className={`w-full px-3 py-2.5 border-[1.5px] border-gray-300 rounded-lg ${FONT} text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all`}
                />
              </div>
              <div>
                <label className={`block text-[13px] font-medium text-gray-700 mb-1.5 ${FONT}`}>
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CC"
                  maxLength={10}
                  className={`w-full px-3 py-2.5 border-[1.5px] border-gray-300 rounded-lg ${FONT} text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all uppercase`}
                />
              </div>
              <div>
                <label className={`block text-[13px] font-medium text-gray-700 mb-1.5 ${FONT}`}>
                  Description
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Brief description of the authority type"
                  rows={2}
                  className={`w-full px-3 py-2.5 border-[1.5px] border-gray-300 rounded-lg ${FONT} text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all resize-none`}
                />
              </div>
              <div>
                <label className={`block text-[13px] font-medium text-gray-700 mb-1.5 ${FONT}`}>Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Inactive')}
                  className={`w-full px-3 py-2.5 border-[1.5px] border-gray-300 rounded-lg ${FONT} text-[13px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className={`px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${FONT}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formName.trim() || !formCode.trim()}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1f3a5f] rounded-lg hover:bg-[#2d4a6f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${FONT}`}
              >
                <Check className="w-4 h-4" />
                {editRecord ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Schemes Master
// ══════════════════════════════════════════════════════════════════════════════

// Dropdown option data
const ULB_TYPES = ['CC', 'CMC', 'TMC', 'TP', 'NAC'];
const DISTRICTS = ['Ballari', 'Uttar Kannada', 'Kumta', 'Dharwad', 'Belgaum', 'Mysuru', 'Mangaluru', 'Shimoga', 'Davangere', 'Gulbarga'];
const ULB_NAMES: Record<string, string[]> = {
  'Ballari': ['Ballari', 'Hospet', 'Sandur'],
  'Uttar Kannada': ['Dandeli', 'Karwar', 'Sirsi', 'Honnavar'],
  'Kumta': ['Kumta'],
  'Dharwad': ['Hubli-Dharwad', 'Kundgol', 'Navalgund'],
  'Belgaum': ['Belgaum', 'Gokak', 'Athani'],
  'Mysuru': ['Mysuru', 'Nanjangud', 'T. Narasipura'],
  'Mangaluru': ['Mangaluru', 'Puttur', 'Bantwal'],
  'Shimoga': ['Shimoga', 'Bhadravathi', 'Sagar'],
  'Davangere': ['Davangere', 'Harihara', 'Jagaluru'],
  'Gulbarga': ['Gulbarga', 'Yadgir', 'Shahpur'],
};
const SCHEME_NAMES = ['Akash Gang', 'Har Ghar Jal', 'Ganga', 'Swachh Bharat', 'AMRUT 2.0', 'JJM', 'Smart City', 'PMAY'];
const SERVICE_APPLIED_OPTIONS = ['Tap', 'Borewell', 'UGD', 'SWM'];

interface SchemeRecord {
  id: number;
  ulbType: string;
  district: string;
  ulbName: string;
  schemeName: string;
  amount: number;
  sponsoredBy: 'Central' | 'State' | 'Both';
  startDate: string;
  endDate: string;
  appliedFor: string;
  status: 'Active' | 'Inactive';
}

const INITIAL_SCHEMES: SchemeRecord[] = [
  { id: 1, ulbType: 'CC', district: 'Ballari', ulbName: 'Ballari', schemeName: 'Akash Gang', amount: 100000, sponsoredBy: 'State', startDate: '2024-03-14', endDate: '2025-09-30', appliedFor: 'Tap', status: 'Active' },
  { id: 2, ulbType: 'CMC', district: 'Uttar Kannada', ulbName: 'Dandeli', schemeName: 'Har Ghar Jal', amount: 500000, sponsoredBy: 'Central', startDate: '2025-01-01', endDate: '2026-12-31', appliedFor: 'Tap', status: 'Active' },
  { id: 3, ulbType: 'TMC', district: 'Uttar Kannada', ulbName: 'Kumta', schemeName: 'Ganga', amount: 800000, sponsoredBy: 'Both', startDate: '2024-02-20', endDate: '2026-05-30', appliedFor: 'Tap', status: 'Active' },
];

function SchemesMaster() {
  const [records, setRecords] = useState<SchemeRecord[]>(INITIAL_SCHEMES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState<SchemeRecord | null>(null);

  // Form state
  const [fUlbType, setFUlbType] = useState('');
  const [fDistrict, setFDistrict] = useState('');
  const [fUlbName, setFUlbName] = useState('');
  const [fSchemeName, setFSchemeName] = useState('');
  const [fAmount, setFAmount] = useState('');
  const [fSponsoredBy, setFSponsoredBy] = useState<'Central' | 'State' | 'Both'>('Central');
  const [fStartDate, setFStartDate] = useState('');
  const [fEndDate, setFEndDate] = useState('');
  const [fAppliedFor, setFAppliedFor] = useState('');
  const [fStatus, setFStatus] = useState(true);

  const resetForm = () => {
    setFUlbType('');
    setFDistrict('');
    setFUlbName('');
    setFSchemeName('');
    setFAmount('');
    setFSponsoredBy('Central');
    setFStartDate('');
    setFEndDate('');
    setFAppliedFor('');
    setFStatus(true);
    setEditRecord(null);
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (rec: SchemeRecord) => {
    setEditRecord(rec);
    setFUlbType(rec.ulbType);
    setFDistrict(rec.district);
    setFUlbName(rec.ulbName);
    setFSchemeName(rec.schemeName);
    setFAmount(rec.amount.toString());
    setFSponsoredBy(rec.sponsoredBy);
    setFStartDate(rec.startDate);
    setFEndDate(rec.endDate);
    setFAppliedFor(rec.appliedFor);
    setFStatus(rec.status === 'Active');
    setShowForm(true);
  };

  const handleSave = () => {
    if (!fUlbType || !fDistrict || !fUlbName || !fSchemeName || !fAmount || !fStartDate || !fEndDate || !fAppliedFor) return;

    const newRec: SchemeRecord = {
      id: editRecord ? editRecord.id : (records.length > 0 ? Math.max(...records.map((r) => r.id)) + 1 : 1),
      ulbType: fUlbType,
      district: fDistrict,
      ulbName: fUlbName,
      schemeName: fSchemeName,
      amount: parseInt(fAmount, 10) || 0,
      sponsoredBy: fSponsoredBy,
      startDate: fStartDate,
      endDate: fEndDate,
      appliedFor: fAppliedFor,
      status: fStatus ? 'Active' : 'Inactive',
    };

    if (editRecord) {
      setRecords((prev) => prev.map((r) => (r.id === editRecord.id ? newRec : r)));
    } else {
      setRecords((prev) => [...prev, newRec]);
    }
    setShowForm(false);
    resetForm();
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this scheme?')) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const filtered = records.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.schemeName.toLowerCase().includes(q) ||
      r.ulbType.toLowerCase().includes(q) ||
      r.district.toLowerCase().includes(q) ||
      r.ulbName.toLowerCase().includes(q) ||
      r.sponsoredBy.toLowerCase().includes(q) ||
      r.appliedFor.toLowerCase().includes(q)
    );
  });

  const formatAmount = (val: number) => {
    return val.toLocaleString('en-IN');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  };

  // Available ULB names based on selected district
  const availableUlbs = fDistrict && ULB_NAMES[fDistrict] ? ULB_NAMES[fDistrict] : [];

  const inputCls = `w-full px-3 py-2.5 border-[1.5px] border-gray-300 rounded-lg ${FONT} text-[13px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all`;
  const labelCls = `block text-[13px] font-medium text-gray-700 mb-1.5 ${FONT}`;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className={`text-2xl font-bold text-[#1f3a5f] ${FONT}`}>Schemes Master</h1>
          <p className={`text-sm text-gray-600 ${FONT} mt-1`}>
            Manage government schemes for Urban Local Bodies
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openAdd}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#1f3a5f] rounded-lg hover:bg-[#2d4a6f] transition-colors ${FONT}`}
          >
            <Plus className="w-4 h-4" />
            Add New Scheme
          </button>
        )}
      </div>

      {/* ─── Add / Edit Form ─────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-lg font-semibold text-[#1f3a5f] ${FONT}`}>
              {editRecord ? 'Edit Scheme' : 'Add New Scheme'}
            </h2>
            <button
              onClick={() => { setShowForm(false); resetForm(); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Row 1: ULB Type, District, ULB Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div>
              <label className={labelCls}>
                ULB Type<span className="text-red-500">*</span>
              </label>
              <select value={fUlbType} onChange={(e) => setFUlbType(e.target.value)} className={inputCls}>
                <option value="">-- Select --</option>
                {ULB_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                District<span className="text-red-500">*</span>
              </label>
              <select
                value={fDistrict}
                onChange={(e) => { setFDistrict(e.target.value); setFUlbName(''); }}
                className={inputCls}
              >
                <option value="">-- Select --</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                ULB Name<span className="text-red-500">*</span>
              </label>
              <select value={fUlbName} onChange={(e) => setFUlbName(e.target.value)} className={inputCls} disabled={!fDistrict}>
                <option value="">-- Select --</option>
                {availableUlbs.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Scheme Name, Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className={labelCls}>
                Scheme Name<span className="text-red-500">*</span>
              </label>
              <select value={fSchemeName} onChange={(e) => setFSchemeName(e.target.value)} className={inputCls}>
                <option value="">-- Select --</option>
                {SCHEME_NAMES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Amount<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setFAmount(val);
                }}
                placeholder="e.g. 100000"
                className={inputCls}
              />
            </div>
          </div>

          {/* Row 3: Sponsored by, Start Date, End Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div>
              <label className={labelCls}>
                Sponsored by<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-5 h-[42px]">
                {(['Central', 'State', 'Both'] as const).map((opt) => (
                  <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="sponsoredBy"
                      checked={fSponsoredBy === opt}
                      onChange={() => setFSponsoredBy(opt)}
                      className="w-4 h-4 accent-[#1f3a5f]"
                    />
                    <span className={`text-[13px] text-gray-700 ${FONT}`}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>
                Start Date<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <DatePicker
                  selected={fStartDate ? new Date(fStartDate) : null}
                  onChange={(date) => setFStartDate(date ? date.toISOString().split('T')[0] : '')}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select start date"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  className={`${inputCls} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>
                End Date<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <DatePicker
                  selected={fEndDate ? new Date(fEndDate) : null}
                  onChange={(date) => setFEndDate(date ? date.toISOString().split('T')[0] : '')}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select end date"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  className={`${inputCls} pl-10`}
                />
              </div>
            </div>
          </div>

          {/* Row 4: Service Applied For, Active/Inactive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className={labelCls}>
                Service Applied For<span className="text-red-500">*</span>
              </label>
              <select value={fAppliedFor} onChange={(e) => setFAppliedFor(e.target.value)} className={inputCls}>
                <option value="">-- Select --</option>
                {SERVICE_APPLIED_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Active/Inactive<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3 h-[42px]">
                <button
                  type="button"
                  onClick={() => setFStatus(!fStatus)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${fStatus ? 'bg-[#1f3a5f]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${fStatus ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <span className={`text-[13px] font-medium ${FONT} ${fStatus ? 'text-[#1f3a5f]' : 'text-gray-500'}`}>
                  {fStatus ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Form Buttons */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
            <button
              onClick={() => { setShowForm(false); resetForm(); }}
              className={`px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${FONT}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!fUlbType || !fDistrict || !fUlbName || !fSchemeName || !fAmount || !fStartDate || !fEndDate || !fAppliedFor}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1f3a5f] rounded-lg hover:bg-[#2d4a6f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${FONT}`}
            >
              <Check className="w-4 h-4" />
              {editRecord ? 'Update Scheme' : 'Save Scheme'}
            </button>
          </div>
        </div>
      )}

      {/* ─── Search ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by scheme name, district, ULB..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 border-[1.5px] border-gray-300 rounded-md ${FONT} text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all`}
          />
        </div>
      </div>

      {/* ─── Table ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1f3a5f]">
                {['Sl. No', 'ULB Type', 'District', 'ULB Name', 'Scheme Name', 'Amount (in Rs)', 'Sponsored By', 'Start Date', 'End Date', 'Applied for', 'Status', 'Action'].map((h) => (
                  <th
                    key={h}
                    className={`px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-white ${FONT} whitespace-nowrap`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center">
                    <Database className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className={`text-gray-500 ${FONT} font-medium text-sm`}>No schemes found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((rec, idx) => (
                  <tr
                    key={rec.id}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'} hover:bg-blue-50/40 transition-colors border-b border-gray-100`}
                  >
                    <td className={`px-3 py-3 text-[12px] text-gray-500 font-medium ${FONT}`}>{idx + 1}</td>
                    <td className={`px-3 py-3 text-[12px] text-gray-900 font-medium ${FONT}`}>{rec.ulbType}</td>
                    <td className={`px-3 py-3 text-[12px] text-gray-900 ${FONT}`}>{rec.district}</td>
                    <td className={`px-3 py-3 text-[12px] text-gray-900 ${FONT}`}>{rec.ulbName}</td>
                    <td className={`px-3 py-3 text-[13px] text-gray-900 font-semibold ${FONT}`}>{rec.schemeName}</td>
                    <td className={`px-3 py-3 text-[12px] text-gray-900 font-medium ${FONT} whitespace-nowrap`}>{formatAmount(rec.amount)}</td>
                    <td className={`px-3 py-3 ${FONT}`}>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        rec.sponsoredBy === 'Central'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : rec.sponsoredBy === 'State'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {rec.sponsoredBy}
                      </span>
                    </td>
                    <td className={`px-3 py-3 text-[12px] text-gray-600 ${FONT} whitespace-nowrap`}>{formatDate(rec.startDate)}</td>
                    <td className={`px-3 py-3 text-[12px] text-gray-600 ${FONT} whitespace-nowrap`}>{formatDate(rec.endDate)}</td>
                    <td className={`px-3 py-3 text-[12px] text-gray-900 ${FONT}`}>{rec.appliedFor}</td>
                    <td className="px-3 py-3 text-center">
                      {rec.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(rec)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-[#1f3a5f] transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200">
          <p className={`text-[12px] text-gray-500 ${FONT}`}>
            Showing <span className="font-semibold text-[#1f3a5f]">{filtered.length}</span> of{' '}
            <span className="font-semibold text-[#1f3a5f]">{records.length}</span> schemes
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Generic "Coming Soon" Placeholder
// ══════════════════════════════════════════════════════════════════════════════
function PlaceholderContent({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
}) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold text-[#1f3a5f] ${FONT}`}>{title}</h1>
        <p className={`text-sm text-gray-600 ${FONT} mt-1`}>{subtitle}</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center py-12">
          <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className={`text-lg font-semibold text-gray-500 ${FONT} mb-2`}>Coming Soon</h3>
          <p className={`text-sm text-gray-400 ${FONT}`}>
            This feature will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}

// Old SidebarItem removed — using UnifiedSidebar instead

// ══════════════════════════════════════════════════════════════════════════════
// Main DMA Admin Page
// ══════════════════════════════════════════════════════════════════════════════
export default function DMAAdminPage() {
  const [currentView, setCurrentView] = useState<View>(() => {
    const saved = localStorage.getItem('dma_admin_currentView');
    return (saved as View) || 'overview';
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem('dma_admin_currentView', currentView);
  }, [currentView]);

  // Masters submenu items
  const mastersItems: { key: View; label: string }[] = [
    { key: 'masters-authority-type', label: 'Authority Type' },
    { key: 'masters-stage-workflow', label: 'Stage of Workflow Master' },
    { key: 'masters-schemes', label: 'Schemes Master' },
    { key: 'masters-workflow-level', label: 'Workflow Level Master' },
    { key: 'masters-penalty-reason', label: 'Penalty Reason Master' },
    { key: 'masters-rejection-reason', label: 'Rejection Reason Master' },
    { key: 'masters-map-plumber-type', label: 'Map Plumber Type' },
    { key: 'masters-tariff-rates', label: 'View/Edit on Tariff Rates' },
    { key: 'masters-district-escom', label: 'Mapping District to ESCOM' },
  ];

  // Config submenu items
  const configItems: { key: View; label: string }[] = [
    { key: 'config-workflow', label: 'Workflow Configuration' },
    { key: 'config-tariff', label: 'Tariff Rate Configuration' },
    { key: 'config-notifications', label: 'Notification Settings' },
    { key: 'config-system', label: 'System Parameters' },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewContent />;
      case 'user-management':
        return <UserManagementContent />;
      case 'masters-authority-type':
        return <AuthorityTypeMaster />;
      case 'masters-stage-workflow':
        return <PlaceholderContent title="Stage Workflow Master" subtitle="Manage stage workflow master data" icon={GitBranch} />;
      case 'masters-schemes':
        return <SchemesMaster />;
      case 'masters-workflow-level':
        return <PlaceholderContent title="Workflow Level Master" subtitle="Manage workflow level master data" icon={Layers} />;
      case 'masters-penalty-reason':
        return <PlaceholderContent title="Penalty Reason Master" subtitle="Manage penalty reason master data" icon={AlertCircle} />;
      case 'masters-rejection-reason':
        return <PlaceholderContent title="Rejection Reason Master" subtitle="Manage rejection reason master data" icon={AlertCircle} />;
      case 'masters-map-plumber-type':
        return <PlaceholderContent title="Map Plumber Type Master" subtitle="Manage map plumber type master data" icon={MapPin} />;
      case 'masters-tariff-rates':
        return <PlaceholderContent title="Tariff Rates Master" subtitle="Manage tariff rates master data" icon={IndianRupee} />;
      case 'masters-district-escom':
        return <PlaceholderContent title="District ESCOM Master" subtitle="Manage district ESCOM master data" icon={MapPin} />;
      case 'config-workflow':
        return <PlaceholderContent title="Workflow Configuration" subtitle="Configure approval workflows and routing rules" icon={GitBranch} />;
      case 'config-tariff':
        return <PlaceholderContent title="Tariff Rate Configuration" subtitle="Configure state-level tariff rate templates" icon={IndianRupee} />;
      case 'config-notifications':
        return <PlaceholderContent title="Notification Settings" subtitle="Configure SMS, email, and push notification templates" icon={AlertCircle} />;
      case 'config-system':
        return <PlaceholderContent title="System Parameters" subtitle="Manage system-wide configuration parameters" icon={Globe} />;
      default:
        return <OverviewContent />;
    }
  };

  const sidebarItems: SidebarMenuItem[] = [
    {
      id: 'dma-overview',
      label: 'Overview',
      icon: <Home className="w-[18px] h-[18px]" />,
      path: 'overview',
    },
    {
      id: 'dma-user-mgmt',
      label: 'User Management',
      icon: <Users className="w-[18px] h-[18px]" />,
      path: 'user-management',
    },
    {
      id: 'dma-masters',
      label: 'Masters',
      icon: <Database className="w-[18px] h-[18px]" />,
      children: mastersItems.map((item) => ({
        id: 'dma-' + item.key,
        label: item.label,
        path: item.key,
      })),
    },
    {
      id: 'dma-config',
      label: 'Configurations',
      icon: <Settings className="w-[18px] h-[18px]" />,
      children: configItems.map((item) => ({
        id: 'dma-' + item.key,
        label: item.label,
        path: item.key,
      })),
    },
  ];

  return (
    <div className="flex h-screen bg-[#f5f5fa]">
      {/* Sidebar */}
      <UnifiedSidebar
        title="DMA Admin Panel"
        items={sidebarItems}
        activePath={currentView}
        onNavigate={(view) => setCurrentView(view as View)}
        storageKey="dmaAdminSidebar"
        collapsible={true}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </main>
    </div>
  );
}
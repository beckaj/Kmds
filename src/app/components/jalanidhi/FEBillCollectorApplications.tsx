import { useState, useEffect } from 'react';
import { Search, RefreshCw, Eye, ChevronLeft, CheckCircle, XCircle } from 'lucide-react';
import { GovSelect } from '../ui/gov-select';
import { GovTable, GovTableHeader, GovTableHeaderCell, GovTableBody, GovTableRow, GovTableCell, GovTableEmpty, GovTableLoading } from '../ui/gov-table';
import { GovButton } from '../ui/gov-button';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

// ─── Types ──────────────────────────────────────────────────────────────────

interface WardAssignment {
  id: string;
  billCollectorId: string;
  billCollectorName: string;
  billCollectorRecordId: string;
  wardNumbers: string[];
  billingDays: string;
  billingStartDate: string;
  billingEndDate: string;
  billingMachineNo: string;
  assetId: string;
  effectiveDate: string;
  remarks: string;
  status: string;
  assignedDate: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return day + '/' + month + '/' + year;
  } catch {
    return dateStr;
  }
}

// ─── Status Options ─────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: '__all__', label: 'All Statuses' },
  { value: 'Sent for Approval', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

function mapStatusLabel(status: string): string {
  if (status === 'Sent for Approval') return 'Pending';
  if (status === 'Approved') return 'Approved';
  if (status === 'Rejected') return 'Rejected';
  return status;
}

function statusBadgeClass(status: string): string {
  if (status === 'Sent for Approval') return 'bg-amber-100 text-amber-700';
  if (status === 'Approved') return 'bg-green-100 text-green-700';
  if (status === 'Rejected') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-600';
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function FEBillCollectorApplications() {
  // ─── Page state ─────────────────────────────────────────────────────────
  const [page, setPage] = useState<'list' | 'view'>(() => {
    const saved = localStorage.getItem('feBcApp_page');
    return saved === 'view' ? 'view' : 'list';
  });

  // ─── Data ───────────────────────────────────────────────────────────────
  const [assignments, setAssignments] = useState<WardAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Filters ────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState('__all__');
  const [search, setSearch] = useState('');

  // ─── View detail state ──────────────────────────────────────────────────
  const [viewAssignment, setViewAssignment] = useState<WardAssignment | null>(() => {
    const saved = localStorage.getItem('feBcApp_viewAssignment');
    return saved ? JSON.parse(saved) : null;
  });

  // ─── Action state ──────────────────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // ─── Persist state ──────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem('feBcApp_page', page); }, [page]);
  useEffect(() => {
    if (viewAssignment) {
      localStorage.setItem('feBcApp_viewAssignment', JSON.stringify(viewAssignment));
    } else {
      localStorage.removeItem('feBcApp_viewAssignment');
    }
  }, [viewAssignment]);

  // ─── Fetch assignments ──────────────────────────────────────────────────
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/meter-management/ward-assignments`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data && data.success && data.assignments) {
        // Only show assignments forwarded to Field Engineer (Sent for Approval, Approved, Rejected)
        const feAssignments = data.assignments.filter((a: WardAssignment) => {
          const s = a && a.status ? a.status : '';
          return s === 'Sent for Approval' || s === 'Approved' || s === 'Rejected';
        });
        setAssignments(feAssignments);
      }
    } catch (error) {
      console.error('[FE BILL COLLECTOR APPS] Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, []);

  // ─── Filtered assignments ───────────────────────────────────────────────
  const filteredAssignments = assignments.filter((a) => {
    // Status filter
    if (statusFilter !== '__all__' && a.status !== statusFilter) return false;

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const bcId = a && a.billCollectorId ? a.billCollectorId.toLowerCase() : '';
      const bcName = a && a.billCollectorName ? a.billCollectorName.toLowerCase() : '';
      const wards = a && a.wardNumbers ? a.wardNumbers.join(', ').toLowerCase() : '';
      return bcId.indexOf(q) !== -1 || bcName.indexOf(q) !== -1 || wards.indexOf(q) !== -1;
    }
    return true;
  });

  // ─── Handle View Click ─────────────────────────────────────────────────
  const handleViewClick = (assignment: WardAssignment) => {
    setViewAssignment(assignment);
    setPage('view');
  };

  // ─── Handle Back to List ───────────────────────────────────────────────
  const handleBackToList = () => {
    setPage('list');
    setViewAssignment(null);
    setSuccessMsg('');
  };

  // ─── Handle Approve ────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!viewAssignment) return;
    setActionLoading(true);
    try {
      const updated = {
        ...viewAssignment,
        status: 'Approved',
      };
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/meter-management/ward-assignments`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignment: updated }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        setSuccessMsg('Ward assignment approved successfully!');
        setViewAssignment({ ...viewAssignment, status: 'Approved' });
        await fetchAssignments();
      } else {
        console.error('[FE BILL COLLECTOR APPS] Approve failed:', data && data.error ? data.error : 'Unknown error');
      }
    } catch (error) {
      console.error('[FE BILL COLLECTOR APPS] Error approving:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Handle Reject ─────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!viewAssignment) return;
    setActionLoading(true);
    try {
      const updated = {
        ...viewAssignment,
        status: 'Rejected',
      };
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/meter-management/ward-assignments`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignment: updated }),
        }
      );
      const data = await response.json();
      if (data && data.success) {
        setSuccessMsg('Ward assignment rejected.');
        setViewAssignment({ ...viewAssignment, status: 'Rejected' });
        await fetchAssignments();
      } else {
        console.error('[FE BILL COLLECTOR APPS] Reject failed:', data && data.error ? data.error : 'Unknown error');
      }
    } catch (error) {
      console.error('[FE BILL COLLECTOR APPS] Error rejecting:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================================
  // RENDER: VIEW ASSIGNMENT DETAIL
  // =====================================================================
  if (page === 'view' && viewAssignment) {
    const isPending = viewAssignment && viewAssignment.status === 'Sent for Approval';

    return (
      <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
        {/* Back Button */}
        <button
          onClick={handleBackToList}
          className="flex items-center gap-1.5 text-[14px] text-[#1f3a5f] font-medium font-['Poppins',sans-serif] mb-3 hover:underline cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to List
        </button>

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">
          Ward Assignment Details
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-6">
          Reviewing assignment for <span className="font-semibold text-[#1f3a5f]">{viewAssignment && viewAssignment.billCollectorName ? viewAssignment.billCollectorName : 'N/A'}</span>
        </p>

        {/* Success Message */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-800 font-medium font-['Poppins',sans-serif]">{successMsg}</p>
          </div>
        )}

        {/* Detail Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-8">

            {/* Section 1: Bill Collector Info */}
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Bill Collector Details
            </h2>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Bill Collector ID</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.billCollectorId ? viewAssignment.billCollectorId : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Bill Collector Name</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.billCollectorName ? viewAssignment.billCollectorName : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Application Status</label>
                  <p className="text-[14px] font-['Poppins',sans-serif]">
                    <span className={
                      'inline-block px-2.5 py-1 rounded-full text-[12px] font-medium ' +
                      statusBadgeClass(viewAssignment && viewAssignment.status ? viewAssignment.status : '')
                    }>
                      {viewAssignment && viewAssignment.status ? mapStatusLabel(viewAssignment.status) : 'N/A'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Ward Assignment Info */}
            <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
              Ward Assignment Details
            </h2>
            <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Assigned Ward No(s)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {viewAssignment && viewAssignment.wardNumbers && viewAssignment.wardNumbers.length > 0
                      ? viewAssignment.wardNumbers.map((w: string) => (
                          <span key={w} className="inline-block px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#1f3a5f]/10 text-[#1f3a5f] font-['Poppins',sans-serif]">{w}</span>
                        ))
                      : <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">N/A</p>
                    }
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Billing Days</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.billingDays ? viewAssignment.billingDays : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Effective Date</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.effectiveDate ? formatDateDisplay(viewAssignment.effectiveDate) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Billing Start Date</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.billingStartDate ? formatDateDisplay(viewAssignment.billingStartDate) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Billing End Date</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.billingEndDate ? formatDateDisplay(viewAssignment.billingEndDate) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Machine No</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.billingMachineNo ? viewAssignment.billingMachineNo : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Asset ID</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.assetId ? viewAssignment.assetId : 'N/A'}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5 font-['Poppins',sans-serif]">Remarks</label>
                  <p className="text-[14px] text-gray-900 font-medium font-['Poppins',sans-serif]">
                    {viewAssignment && viewAssignment.remarks ? viewAssignment.remarks : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <GovButton variant="outline" onClick={handleBackToList}>
                Back to List
              </GovButton>
              {isPending && (
                <>
                  <GovButton variant="outline" onClick={handleReject} loading={actionLoading}>
                    <XCircle className="w-4 h-4" />
                    Reject
                  </GovButton>
                  <GovButton variant="primary" onClick={handleApprove} loading={actionLoading}>
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </GovButton>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================================
  // RENDER: MAIN LIST PAGE
  // =====================================================================

  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">
            Assigned Wards Details to Bill Collector
          </h1>
          <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
            Review and approve ward assignments forwarded by Caseworker
          </p>
        </div>
        <button
          onClick={fetchAssignments}
          className="flex items-center gap-2 px-4 py-2 bg-[#1f3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors font-['Poppins',sans-serif] text-sm font-medium cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex items-end gap-6 mb-5">
        {/* Status Filter */}
        <div className="w-[220px]">
          <GovSelect
            label="Status"
            placeholder="All Statuses"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val)}
          />
        </div>

        {/* Search */}
        <div className="relative w-[320px]">
          <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, Name, Ward..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <GovTable title="Bill Collector Ward Assignments" minWidth="1200px">
        <GovTableHeader>
          <GovTableHeaderCell width="60px" align="center">SL. NO</GovTableHeaderCell>
          <GovTableHeaderCell width="170px">BILL COLLECTOR ID</GovTableHeaderCell>
          <GovTableHeaderCell width="170px">BILL COLLECTOR NAME</GovTableHeaderCell>
          <GovTableHeaderCell width="160px" align="center">ASSIGNED WARD NO</GovTableHeaderCell>
          <GovTableHeaderCell width="150px" align="center">BILLING START DATE</GovTableHeaderCell>
          <GovTableHeaderCell width="150px" align="center">BILLING END DATE</GovTableHeaderCell>
          <GovTableHeaderCell width="130px" align="center">MACHINE NO</GovTableHeaderCell>
          <GovTableHeaderCell width="160px" align="center">APPLICATION STATUS</GovTableHeaderCell>
          <GovTableHeaderCell width="100px" align="center">ACTION</GovTableHeaderCell>
        </GovTableHeader>
        <GovTableBody>
          {loading ? (
            <GovTableLoading colSpan={9} />
          ) : filteredAssignments.length === 0 ? (
            <GovTableEmpty message="No bill collector applications found." colSpan={9} />
          ) : (
            filteredAssignments.map((row, index) => {
              const status = row && row.status ? row.status : 'N/A';
              return (
                <GovTableRow key={row.id}>
                  <GovTableCell align="center">{index + 1}</GovTableCell>
                  <GovTableCell variant="id">{row.billCollectorId || 'N/A'}</GovTableCell>
                  <GovTableCell>{row.billCollectorName || 'N/A'}</GovTableCell>
                  <GovTableCell align="center">
                    {row && row.wardNumbers && row.wardNumbers.length > 0 ? (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {row.wardNumbers.map((w: string) => (
                          <span key={w} className="inline-block px-2 py-0.5 rounded text-[12px] font-medium bg-[#1f3a5f]/10 text-[#1f3a5f] font-['Poppins',sans-serif]">{w}</span>
                        ))}
                      </div>
                    ) : 'N/A'}
                  </GovTableCell>
                  <GovTableCell align="center">{row && row.billingStartDate ? formatDateDisplay(row.billingStartDate) : 'N/A'}</GovTableCell>
                  <GovTableCell align="center">{row && row.billingEndDate ? formatDateDisplay(row.billingEndDate) : 'N/A'}</GovTableCell>
                  <GovTableCell align="center">{row && row.billingMachineNo ? row.billingMachineNo : 'N/A'}</GovTableCell>
                  <GovTableCell align="center">
                    <span className={
                      'inline-block px-2.5 py-1 rounded-full text-[12px] font-medium font-[\'Poppins\',sans-serif] ' +
                      statusBadgeClass(status)
                    }>
                      {mapStatusLabel(status)}
                    </span>
                  </GovTableCell>
                  <GovTableCell align="center">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleViewClick(row); }}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold rounded font-['Poppins',sans-serif] transition-colors cursor-pointer bg-[#1f3a5f] text-white hover:bg-[#2d4a6f]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </GovTableCell>
                </GovTableRow>
              );
            })
          )}
        </GovTableBody>
      </GovTable>
    </div>
  );
}
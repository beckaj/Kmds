import { useState, useEffect, useRef } from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { GovTable, GovTableHeader, GovTableHeaderCell, GovTableBody, GovTableRow, GovTableCell, GovTableEmpty, GovTableLoading, GovStatusBadge } from '../ui/gov-table';
import { GovSelect } from '../ui/gov-select';

interface DCBCorrectionApp {
  id: string;
  rrNumber: string;
  meterCategory: string;
  connectionType: string;
  effectiveDate: string;
  correctionReason: string;
  status: string;
  queue: string;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'ro_approved', label: 'Approved' },
  { value: 'returned_by_commissioner', label: 'Sent Back' },
  { value: 'correction_applied', label: 'Correction Applied' },
];

export default function RevenueOfficerDCBCorrectionDashboard() {
  const [applications, setApplications] = useState<DCBCorrectionApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const isFetchingRef = useRef(false);

  useEffect(() => {
    fetchApplications(true);
    const interval = setInterval(() => fetchApplications(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchApplications = async (isInitial: boolean) => {
    if (isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      if (isInitial) setLoading(true);
      setFetchError(null);

      const response = await fetch(
        'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/dcb/revenue-officer/applications',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + publicAnonKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        setFetchError('Server returned an error: ' + response.statusText);
        if (isInitial) setApplications([]);
        return;
      }

      const data = await response.json();
      if (data.success) {
        const transformed = (data.applications || []).map((app: any) => ({
          id: app.id || 'N/A',
          rrNumber: app.rrNumber || 'N/A',
          meterCategory: (app.originalData && app.originalData.meterCategory) ? app.originalData.meterCategory : 'N/A',
          connectionType: (app.originalData && app.originalData.connectionType) ? app.originalData.connectionType : 'N/A',
          effectiveDate: app.effectiveDate || 'N/A',
          correctionReason: app.correctionReasonLabel || app.correctionReason || 'N/A',
          status: app.status || 'pending',
          queue: getQueueLabel(app.status || 'pending'),
        }));
        setApplications(transformed);
      } else {
        setFetchError(data.error || 'Unknown error');
        if (isInitial) setApplications([]);
      }
    } catch (error) {
      console.error('[RO DCB DASHBOARD] Error:', error);
      setFetchError('Network error. Server may be temporarily unavailable.');
      if (isInitial) setApplications([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const getQueueLabel = (status: string): string => {
    if (status === 'ro_approved') return 'Commissioner';
    if (status === 'correction_applied') return 'Commissioner';
    if (status === 'returned_by_commissioner') return '';
    return '';
  };

  const getStatusLabel = (status: string): string => {
    if (status === 'pending') return 'Pending';
    if (status === 'ro_approved') return 'Approved';
    if (status === 'correction_applied') return 'Correction Applied';
    if (status === 'returned_by_commissioner') return 'Sent Back';
    if (status === 'ro_rejected') return 'Rejected';
    return status;
  };

  const handleView = (appId: string) => {
    const event = new CustomEvent('navigate', {
      detail: '/jalanidhi/revenue-officer/tap-connection/dcb-correction/view/' + appId,
    });
    window.dispatchEvent(event);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const filteredApplications = statusFilter === 'all'
    ? applications
    : applications.filter((app) => app.status === statusFilter);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] underline underline-offset-4">
            DCB Correction Application:
          </h1>
        </div>
        <button
          onClick={() => fetchApplications(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1f3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors font-['Poppins',sans-serif] text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-[220px]">
          <GovSelect
            label="Status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onValueChange={setStatusFilter}
            placeholder="Select Status"
          />
        </div>
      </div>

      {fetchError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm font-['Poppins',sans-serif]">{fetchError}</p>
        </div>
      )}

      {/* Data Table */}
      <GovTable title="DCB Correction Applications" minWidth="1100px">
        <GovTableHeader>
          <GovTableHeaderCell width="60px" align="center">SL. NO</GovTableHeaderCell>
          <GovTableHeaderCell width="160px">RR NUMBER</GovTableHeaderCell>
          <GovTableHeaderCell width="130px">METER CATEGORY</GovTableHeaderCell>
          <GovTableHeaderCell width="140px">CONNECTION TYPE</GovTableHeaderCell>
          <GovTableHeaderCell width="130px" align="center">EFFECTIVE DATE</GovTableHeaderCell>
          <GovTableHeaderCell width="170px">CORRECTION REASONS</GovTableHeaderCell>
          <GovTableHeaderCell width="130px" align="center">STATUS</GovTableHeaderCell>
          <GovTableHeaderCell width="130px" align="center">QUEUE</GovTableHeaderCell>
          <GovTableHeaderCell width="100px" align="center">ACTION</GovTableHeaderCell>
        </GovTableHeader>
        <GovTableBody>
          {loading ? (
            <GovTableLoading colSpan={9} />
          ) : filteredApplications.length === 0 ? (
            <GovTableEmpty message="No DCB correction applications found" colSpan={9} />
          ) : (
            filteredApplications.map((row, index) => (
              <GovTableRow key={row.id}>
                <GovTableCell align="center">{index + 1}</GovTableCell>
                <GovTableCell variant="id">{row.rrNumber}</GovTableCell>
                <GovTableCell>{row.meterCategory}</GovTableCell>
                <GovTableCell>{row.connectionType}</GovTableCell>
                <GovTableCell align="center">{formatDate(row.effectiveDate)}</GovTableCell>
                <GovTableCell>{row.correctionReason}</GovTableCell>
                <GovTableCell align="center">
                  <GovStatusBadge
                    variant={
                      row.status === 'ro_approved' ? 'approved'
                      : row.status === 'correction_applied' ? 'completed'
                      : row.status === 'returned_by_commissioner' ? 'sentBack'
                      : row.status === 'ro_rejected' ? 'rejected'
                      : 'pending'
                    }
                  >
                    {getStatusLabel(row.status)}
                  </GovStatusBadge>
                </GovTableCell>
                <GovTableCell align="center">{row.queue || ''}</GovTableCell>
                <GovTableCell align="center">
                  <button
                    onClick={() => handleView(row.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold rounded font-['Poppins',sans-serif] transition-colors cursor-pointer bg-[#1f3a5f] text-white hover:bg-[#2d4a6f]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                </GovTableCell>
              </GovTableRow>
            ))
          )}
        </GovTableBody>
      </GovTable>
    </div>
  );
}
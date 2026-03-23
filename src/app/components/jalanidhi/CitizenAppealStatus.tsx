import { useState, useEffect } from 'react';
import { Scale, Search, RefreshCw, CheckCircle, XCircle, Clock, CreditCard, FileText, Wrench, Eye, ChevronLeft } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { RemarksTimeline } from './RemarksTimeline';
import type { RemarkEntry } from './RemarksTimeline';

export default function CitizenAppealStatus() {
  const [appeals, setAppeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppeal, setSelectedAppeal] = useState<any>(null);
  const [origAppStatus, setOrigAppStatus] = useState<any>(null);
  const [loadingOrigApp, setLoadingOrigApp] = useState(false);

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const phone = userData && userData.phone ? String(userData.phone) : '';

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const url = 'https://' + projectId + '.supabase.co/functions/v1/make-server-698be164/appeal/applications?citizenPhone=' + phone;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + publicAnonKey,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success && data.appeals) {
        setAppeals(data.appeals);
      } else {
        setAppeals([]);
      }
    } catch (err) {
      console.error('[APPEAL STATUS] Error:', err);
      setAppeals([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string; icon: any } } = {
      'pending': { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
      'under_review': { label: 'Under Review', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: FileText },
      'approved': { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      'rejected': { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
    };
    const info = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-300', icon: FileText };
    const IconComp = info.icon;
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${info.color} font-['Poppins',sans-serif] font-medium text-sm`}>
        <IconComp className="w-4 h-4" />
        {info.label}
      </div>
    );
  };

  const filteredAppeals = appeals.filter((app) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    if (app.id && app.id.toLowerCase().includes(term)) return true;
    if (app.appealId && app.appealId.toLowerCase().includes(term)) return true;
    if (app.applicationNo && app.applicationNo.toLowerCase().includes(term)) return true;
    return false;
  });

  if (selectedAppeal) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] p-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setSelectedAppeal(null)}
            className="flex items-center gap-2 px-4 py-2 mb-6 bg-white rounded-md shadow-sm hover:shadow transition-shadow text-[#1f3a5f] font-['Poppins',sans-serif] font-semibold"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Appeals
          </button>

          <div className="bg-white rounded-[10px] shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Scale className="w-8 h-8 text-[#1f3a5f]" />
                <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                  Appeal Details
                </h1>
              </div>
              {getStatusBadge(selectedAppeal.status || 'pending')}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Appeal ID</p>
                <p className="text-base font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {selectedAppeal.appealId || selectedAppeal.id || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Application Number</p>
                <p className="text-base font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {selectedAppeal.applicationNo || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Submitted On</p>
                <p className="text-base font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {formatDate(selectedAppeal.createdAt || selectedAppeal.submittedAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-['Poppins',sans-serif] mb-1">Last Updated</p>
                <p className="text-base font-semibold text-gray-900 font-['Poppins',sans-serif]">
                  {formatDate(selectedAppeal.updatedAt || selectedAppeal.createdAt)}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                Reason for Appeal
              </h3>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-gray-700 font-['Poppins',sans-serif]">
                  {selectedAppeal.reasonForAppeal || selectedAppeal.reason || 'No reason provided'}
                </p>
              </div>
            </div>

            {selectedAppeal.supportingDocUrl && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
                  Supporting Documents
                </h3>
                <a
                  href={selectedAppeal.supportingDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f3a5f] text-white rounded-md hover:bg-[#15283f] transition-colors font-['Poppins',sans-serif]"
                >
                  <FileText className="w-4 h-4" />
                  View Document
                </a>
              </div>
            )}

            {selectedAppeal.remarks && selectedAppeal.remarks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
                  Review Timeline
                </h3>
                <RemarksTimeline remarks={selectedAppeal.remarks} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-[10px] shadow-md p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Scale className="w-8 h-8 text-[#1f3a5f]" />
              <h1 className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                My Appeals
              </h1>
            </div>
            <button
              onClick={fetchAppeals}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#1f3a5f] text-white rounded-md hover:bg-[#15283f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-['Poppins',sans-serif]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Appeal ID or Application Number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] font-['Poppins',sans-serif]"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-8 h-8 text-[#1f3a5f] animate-spin" />
            </div>
          ) : filteredAppeals.length === 0 ? (
            <div className="text-center py-16">
              <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-['Poppins',sans-serif] text-lg">
                {searchTerm ? 'No appeals found matching your search' : 'No appeals submitted yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f8f9fa] border-b border-[#e5e7eb]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#1f3a5f] uppercase tracking-wider font-['Poppins',sans-serif]">
                      Appeal ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#1f3a5f] uppercase tracking-wider font-['Poppins',sans-serif]">
                      Application No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#1f3a5f] uppercase tracking-wider font-['Poppins',sans-serif]">
                      Submitted On
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#1f3a5f] uppercase tracking-wider font-['Poppins',sans-serif]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-[#1f3a5f] uppercase tracking-wider font-['Poppins',sans-serif]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppeals.map((appeal) => (
                    <tr key={appeal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[#06c] font-medium font-['Poppins',sans-serif]">
                          {appeal.appealId || appeal.id || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 font-['Poppins',sans-serif]">
                          {appeal.applicationNo || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600 font-['Poppins',sans-serif]">
                          {formatDate(appeal.createdAt || appeal.submittedAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(appeal.status || 'pending')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setSelectedAppeal(appeal)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f3a5f] text-white rounded-md hover:bg-[#15283f] transition-colors font-['Poppins',sans-serif] font-semibold text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

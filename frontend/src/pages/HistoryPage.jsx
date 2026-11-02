import React, { useState, useEffect } from 'react';
import { vehiclesApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Car,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';

export const HistoryPage = () => {
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [timeRange, setTimeRange] = useState('ALL');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await vehiclesApi.getHistory({
        page,
        size: pageSize,
        search,
        status,
        timeRange,
      });

      if (data && data.content) {
        setRecords(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        setRecords([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (err) {
      console.error('Failed to fetch parking history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, pageSize, status, timeRange]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchHistory();
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;

    const headers = ['Record ID', 'Vehicle Plate', 'Type', 'Driver Name', 'Slot Number', 'Entry Time', 'Exit Time', 'Duration (Mins)', 'Fee ($)', 'Payment', 'Status'];
    const rows = records.map((r) => [
      `PK-${r.id}`,
      `"${r.vehicleNumber}"`,
      r.vehicleType,
      `"${r.driverName}"`,
      r.slotNumber,
      r.entryTime || '',
      r.exitTime || '',
      r.durationMinutes || 0,
      r.totalFee || 0,
      r.paymentMethod || 'CASH',
      r.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ParkFlow_Audit_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '—';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            <span>Facility Parking History & Audit Log</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive ledger of vehicle admissions, departures, durations, and fee transactions.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={records.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search license plate, driver name, slot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <select
          value={timeRange}
          onChange={(e) => {
            setTimeRange(e.target.value);
            setPage(0);
          }}
          className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="ALL">All Time</option>
          <option value="TODAY">Today</option>
          <option value="LAST_7_DAYS">Last 7 Days</option>
          <option value="LAST_30_DAYS">Last 30 Days</option>
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="ALL">All Statuses</option>
          <option value="PARKED">Currently Parked</option>
          <option value="COMPLETED">Completed Trips</option>
        </select>

        <button
          onClick={() => {
            setSearch('');
            setStatus('ALL');
            setTimeRange('ALL');
            setPage(0);
          }}
          className="w-full md:w-auto px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
        >
          Reset
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500">Querying parking ledger...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Records Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              No historical parking transactions match your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Vehicle Plate</th>
                  <th className="py-3 px-4">Slot Bay</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Inbound (Entry)</th>
                  <th className="py-3 px-4">Outbound (Exit)</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Fee / Tariff</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                      PK-{r.id}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {r.vehicleNumber}
                      </span>
                      <span className="block text-[10px] text-slate-400 capitalize font-sans mt-0.5">
                        {r.vehicleType?.toLowerCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-blue-600 text-sm">
                        {r.slotNumber}
                      </span>
                      <div className="text-[11px] text-slate-500">
                        {r.floor} • {r.zone}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{r.driverName}</div>
                      {r.phoneNumber && (
                        <div className="text-[11px] text-slate-400 font-mono">{r.phoneNumber}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {r.entryTime ? new Date(r.entryTime).toLocaleString() : 'N/A'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {r.exitTime ? new Date(r.exitTime).toLocaleString() : '—'}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700 font-medium">
                      {formatDuration(r.durationMinutes)}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {r.status === 'COMPLETED' ? (
                        <div className="text-emerald-700">
                          ${r.totalFee ? Number(r.totalFee).toFixed(2) : '0.00'}
                          <span className="block text-[10px] text-slate-400 font-sans font-normal">
                            via {r.paymentMethod || 'CASH'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-blue-600 text-[11px] font-normal font-sans">
                          Accruing (${r.hourlyRate}/h)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-700">{records.length}</span> of{' '}
            <span className="font-bold text-slate-700">{totalElements}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <span className="font-mono font-semibold px-2">
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

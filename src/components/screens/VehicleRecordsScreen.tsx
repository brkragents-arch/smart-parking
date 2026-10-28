import React, { useState, useMemo } from 'react';
import { useParking } from '../../context/ParkingContext';
import {
  FileSpreadsheet,
  Search,
  Download,
  Filter,
  Car,
  Bus,
  Bike,
  Crown,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowUpDown,
  History,
  UserCheck,
} from 'lucide-react';
import { VehicleCategory, SessionStatus } from '../../types';

export const VehicleRecordsScreen: React.FC = () => {
  const { sessions, auditLogs, anprEvents, getZoneById } = useParking();

  const [activeTab, setActiveTab] = useState<'SESSIONS' | 'AUDIT'>('SESSIONS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<VehicleCategory | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'ALL'>('ALL');

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (categoryFilter !== 'ALL' && s.vehicle_category !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && s.session_status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toUpperCase();
        return (
          s.registration_number.toUpperCase().includes(q) ||
          s.token_number.toUpperCase().includes(q) ||
          s.slot_id.toUpperCase().includes(q)
        );
      }
      return true;
    });
  }, [sessions, categoryFilter, statusFilter, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeTab === 'SESSIONS') {
      headers = [
        'Session ID',
        'Token Number',
        'Registration Number',
        'Category',
        'Slot ID',
        'Zone ID',
        'Status',
        'Entry Time',
        'Exit Time',
        'Allocation Method',
        'Entry Gate',
        'Reason',
      ];
      rows = filteredSessions.map((s) => [
        s.session_id,
        s.token_number,
        s.registration_number,
        s.vehicle_category,
        s.slot_id,
        s.zone_id,
        s.session_status,
        new Date(s.entry_time).toLocaleString(),
        s.exit_time ? new Date(s.exit_time).toLocaleString() : 'N/A',
        s.allocation_method,
        s.entry_gate_id,
        `"${s.allocation_reason.replace(/"/g, '""')}"`,
      ]);
    } else {
      headers = ['Log ID', 'Timestamp', 'User Role', 'User Name', 'Action', 'Affected Record', 'Result', 'Details'];
      rows = auditLogs.map((l) => [
        l.log_id,
        new Date(l.timestamp).toLocaleString(),
        l.user_role,
        `"${l.user_name}"`,
        l.action,
        l.affected_record,
        l.result,
        `"${l.details.replace(/"/g, '""')}"`,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Smart_Pushkaralu_${activeTab.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
              Module G • Data Records & Audit
            </span>
            <span className="text-xs text-slate-400">Pushkaralu Central Registry</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            <span>Searchable Vehicle Records & Operator Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete transactional ledger of incoming vehicles, parking durations, gate passages, and administrative audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('SESSIONS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'SESSIONS'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vehicle Sessions ({filteredSessions.length})
            </button>
            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'AUDIT'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Audit Trail ({auditLogs.length})
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (For Sessions Tab) */}
      {activeTab === 'SESSIONS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Plate, Token, or Slot ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="CAR">Cars Only</option>
            <option value="BUS">Buses Only</option>
            <option value="BIKE">Bikes Only</option>
            <option value="VIP">VIP Enclave Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Sessions</option>
            <option value="ACTIVE">Currently Parked (Active)</option>
            <option value="COMPLETED">Completed / Exited</option>
          </select>

        </div>
      )}

      {/* Main Table View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        
        {activeTab === 'SESSIONS' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Vehicle Registration</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Slot & Zone</th>
                  <th className="py-3.5 px-4 font-bold">Token Number</th>
                  <th className="py-3.5 px-4 font-bold">Entry Time</th>
                  <th className="py-3.5 px-4 font-bold">Exit Time</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((sess) => (
                    <tr
                      key={sess.session_id}
                      className="hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-white text-xs">
                        {sess.registration_number}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                          sess.vehicle_category === 'CAR' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          sess.vehicle_category === 'BUS' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                          sess.vehicle_category === 'BIKE' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {sess.vehicle_category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-cyan-300">{sess.slot_id}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {getZoneById(sess.zone_id)?.zone_name || sess.zone_id}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                        {sess.token_number}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                        {new Date(sess.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {sess.exit_time
                          ? new Date(sess.exit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                          : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            sess.session_status === 'ACTIVE'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {sess.session_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[10px] text-slate-400">
                        {sess.allocation_method === 'AUTOMATIC_INTELLIGENT' ? 'AI Engine' : 'Manual'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No parking records match your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Timestamp</th>
                  <th className="py-3.5 px-4 font-bold">Operator / System</th>
                  <th className="py-3.5 px-4 font-bold">Role</th>
                  <th className="py-3.5 px-4 font-bold">Action</th>
                  <th className="py-3.5 px-4 font-bold">Record</th>
                  <th className="py-3.5 px-4 font-bold">Result</th>
                  <th className="py-3.5 px-4 font-bold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {auditLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                      {log.user_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 font-mono text-cyan-300">
                        {log.user_role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-cyan-400 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                      {log.affected_record}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        log.result === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        log.result === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-300 max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { reservationsApi, slotsApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  CalendarClock,
  Plus,
  Calendar,
  Clock,
  Car,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  LogIn,
  X,
  Filter,
} from 'lucide-react';

export const ReservationsPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedSlotId = searchParams.get('slotId');
  const preselectedType = searchParams.get('type') || 'CAR';

  const [reservations, setReservations] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Create Reservation Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Default start date = 1 hour from now; end date = 5 hours from now
  const now = new Date();
  const defaultStart = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    slotId: preselectedSlotId ? Number(preselectedSlotId) : '',
    vehicleNumber: '',
    vehicleType: preselectedType,
    driverName: '',
    phoneNumber: '',
    startTime: defaultStart,
    endTime: defaultEnd,
    notes: '',
  });

  // Entry ticket modal for check-in
  const [checkInTicket, setCheckInTicket] = useState(null);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationsApi.getAll(statusFilter);
      setReservations(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  useEffect(() => {
    if (modalOpen) {
      slotsApi.getAvailable(formData.vehicleType).then((slots) => {
        setAvailableSlots(slots || []);
        if (slots?.length > 0 && !formData.slotId) {
          setFormData((prev) => ({ ...prev, slotId: slots[0].id }));
        }
      });
    }
  }, [modalOpen, formData.vehicleType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'vehicleNumber' ? value.toUpperCase() : value,
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.slotId) {
      setError('Please choose a parking bay');
      return;
    }

    try {
      setCreating(true);
      await reservationsApi.create({
        ...formData,
        slotId: Number(formData.slotId),
      });

      setSuccessMsg('Slot reservation created successfully');
      setModalOpen(false);
      fetchReservations();
    } catch (err) {
      setError(err.message || 'Failed to create reservation');
    } finally {
      setCreating(false);
    }
  };

  const handleCancelReservation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await reservationsApi.cancel(id);
      setSuccessMsg('Reservation cancelled successfully');
      fetchReservations();
    } catch (err) {
      setError(err.message || 'Failed to cancel reservation');
    }
  };

  const handleCheckIn = async (reservation) => {
    try {
      const record = await reservationsApi.checkIn(reservation.id);
      setCheckInTicket(record);
      setCheckInModalOpen(true);
      setSuccessMsg(`Reservation #${reservation.id} checked in successfully. Bay ${record.slotNumber} assigned.`);
      fetchReservations();
    } catch (err) {
      setError(err.message || 'Failed to check-in reservation');
    }
  };

  const filteredReservations = reservations.filter((r) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      r.vehicleNumber?.toLowerCase().includes(s) ||
      r.driverName?.toLowerCase().includes(s) ||
      r.slotNumber?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-amber-500" />
            <span>Advance Parking Slot Reservations</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Book slots in advance, prevent double bookings, and check in reserved arrivals.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Reserve A Slot
        </button>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by license plate, driver name, or slot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="ALL">All Reservation Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CHECKED_IN">Checked In</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500">Loading reservations schedule...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarClock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Reservations Found</h3>
            <p className="text-xs text-slate-500 mt-1">There are no reservation bookings matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Reserved Bay</th>
                  <th className="py-3 px-4">Vehicle Plate</th>
                  <th className="py-3 px-4">Driver Name</th>
                  <th className="py-3 px-4">Reservation Window</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReservations.map((res) => {
                  const isConfirmed = res.status === 'CONFIRMED' || res.status === 'PENDING';
                  return (
                    <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                        RES-{res.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-600 text-sm">
                          {res.slotNumber}
                        </span>
                        <div className="text-[11px] text-slate-500">
                          {res.floor} • {res.zone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                          {res.vehicleNumber}
                        </span>
                        <span className="block text-[10px] text-slate-400 capitalize mt-1">
                          {res.vehicleType?.toLowerCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{res.driverName}</div>
                        {res.phoneNumber && (
                          <div className="text-[11px] text-slate-400 font-mono">{res.phoneNumber}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{res.startTime ? new Date(res.startTime).toLocaleDateString() : ''}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {res.startTime ? new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          {' → '}
                          {res.endTime ? new Date(res.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={res.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                        {res.notes || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {isConfirmed && (
                          <>
                            <button
                              onClick={() => handleCheckIn(res)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                              title="Check-in vehicle now"
                            >
                              <LogIn className="w-3 h-3" />
                              Check-In
                            </button>
                            <button
                              onClick={() => handleCancelReservation(res.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium"
                              title="Cancel reservation"
                            >
                              <XCircle className="w-3 h-3" />
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Reservation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">New Slot Reservation</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Vehicle Type *
                  </label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                  >
                    <option value="CAR">Car</option>
                    <option value="BIKE">Bike</option>
                    <option value="EV">EV (Charging)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Select Bay *
                  </label>
                  <select
                    name="slotId"
                    value={formData.slotId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  >
                    <option value="">Select bay...</option>
                    {availableSlots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.slotNumber} ({s.floor} - {s.zone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Vehicle Plate Number *
                  </label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    required
                    placeholder="KA-05-MJ-4412"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    name="driverName"
                    required
                    placeholder="Enter driver name"
                    value={formData.driverName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    required
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    required
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="+1 (555) 0192"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Notes / Meeting Ref (Optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  placeholder="e.g. VIP client board meeting"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {creating ? 'Reserving...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check-in Slip Modal */}
      <ReceiptModal
        isOpen={checkInModalOpen}
        onClose={() => {
          setCheckInModalOpen(false);
          setCheckInTicket(null);
        }}
        data={checkInTicket}
        type="ENTRY"
      />
    </div>
  );
};

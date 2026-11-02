import React, { useState, useEffect } from 'react';
import { vehiclesApi } from '../services/api';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  LogOut,
  Search,
  Clock,
  Car,
  Bike,
  Zap,
  CreditCard,
  DollarSign,
  Smartphone,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  X,
  User,
  MapPin,
} from 'lucide-react';

export const ExitPage = () => {
  const [currentParked, setCurrentParked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [exitNotes, setExitNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Completed Receipt Modal State
  const [completedRecord, setCompletedRecord] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const fetchParkedVehicles = async (query = '') => {
    try {
      setLoading(true);
      const data = await vehiclesApi.getCurrent(query);
      setCurrentParked(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch parked vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkedVehicles();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchParkedVehicles(searchQuery);
  };

  // Open checkout modal
  const openCheckout = (record) => {
    setSelectedVehicle(record);
    setPaymentMethod('CARD');
    setExitNotes('');
    setCheckoutModalOpen(true);
  };

  // Calculate live duration & estimated fee for checkout dialog
  const calculateEstimate = (record) => {
    if (!record || !record.entryTime) return { minutes: 0, hours: 0, fee: 0 };
    const entry = new Date(record.entryTime);
    const now = new Date();
    const diffMs = Math.max(0, now - entry);
    const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    const billedHours = Math.max(1, Math.ceil(minutes / 60));
    const rate = Number(record.hourlyRate) || 5.0;
    const fee = (billedHours * rate).toFixed(2);
    return { minutes, billedHours, fee };
  };

  const handleConfirmExit = async () => {
    if (!selectedVehicle) return;

    try {
      setProcessing(true);
      const result = await vehiclesApi.exit({
        recordId: selectedVehicle.id,
        vehicleNumber: selectedVehicle.vehicleNumber,
        paymentMethod,
        notes: exitNotes,
      });

      setCheckoutModalOpen(false);
      setCompletedRecord(result);
      setReceiptModalOpen(true);
      setSuccessMsg(`Vehicle ${result.vehicleNumber} successfully checked out. Slot ${result.slotNumber} released.`);

      // Refresh parked list
      fetchParkedVehicles(searchQuery);
    } catch (err) {
      setError(err.message || 'Failed to process vehicle exit');
    } finally {
      setProcessing(false);
    }
  };

  const estimate = selectedVehicle ? calculateEstimate(selectedVehicle) : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LogOut className="w-6 h-6 text-rose-600" />
            <span>Vehicle Outbound Checkout & Gate Exit</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Locate parked vehicles by plate or bay, calculate duration tariff, and release the slot.
          </p>
        </div>

        <button
          onClick={() => fetchParkedVehicles(searchQuery)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          Refresh List
        </button>
      </div>

      {/* Success / Error Messages */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">
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
          <button onClick={() => setError('')} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by license plate (e.g. KA-01), slot number (A-01), or driver name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
          />
        </form>

        <button
          onClick={handleSearchSubmit}
          className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          Search Vehicle
        </button>

        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              fetchParkedVehicles('');
            }}
            className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Currently Parked List / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Currently Parked Vehicles ({currentParked.length})
            </h3>
            <p className="text-xs text-slate-500">Active sessions currently occupying facility bays</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500">Checking active sessions...</p>
          </div>
        ) : currentParked.length === 0 ? (
          <div className="p-12 text-center">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Active Vehicles Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              There are no vehicles currently parked matching your search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">License Plate</th>
                  <th className="py-3 px-4">Slot Bay</th>
                  <th className="py-3 px-4">Driver Details</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4">Elapsed Duration</th>
                  <th className="py-3 px-4">Current Fee</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentParked.map((record) => {
                  const est = calculateEstimate(record);
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <span className="bg-yellow-100 px-2 py-0.5 rounded border border-yellow-300">
                          {record.vehicleNumber}
                        </span>
                        <span className="block text-[10px] text-slate-400 capitalize mt-1 font-sans">
                          {record.vehicleType?.toLowerCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-600 text-sm">
                          {record.slotNumber}
                        </span>
                        <div className="text-[11px] text-slate-500">
                          {record.floor} • {record.zone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{record.driverName}</div>
                        {record.phoneNumber && (
                          <div className="text-[11px] text-slate-400 font-mono">{record.phoneNumber}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {record.entryTime
                          ? new Date(record.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'N/A'}
                        <div className="text-[10px] text-slate-400">
                          {record.entryTime ? new Date(record.entryTime).toLocaleDateString() : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {Math.floor(est.minutes / 60)}h {est.minutes % 60}m
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 text-sm">
                        ${est.fee}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openCheckout(record)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-sm transition-colors text-xs"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Check Out
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

      {/* Checkout Dialog Modal */}
      {checkoutModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Vehicle Exit & Fee Settlement</h3>
                <p className="text-xs text-slate-400">Confirm departure and payment method</p>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Summary Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Vehicle Number
                  </span>
                  <div className="text-lg font-mono font-bold text-slate-900">
                    {selectedVehicle.vehicleNumber}
                  </div>
                  <div className="text-xs text-slate-500">Slot {selectedVehicle.slotNumber}</div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total Amount
                  </span>
                  <div className="text-2xl font-mono font-extrabold text-emerald-600">
                    ${estimate?.fee || '0.00'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {estimate?.billedHours} hr(s) @ ${selectedVehicle.hourlyRate}/h
                  </div>
                </div>
              </div>

              {/* Time Breakdown */}
              <div className="space-y-2 text-xs py-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Driver:</span>
                  <span className="font-medium text-slate-800">{selectedVehicle.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Entry Time:</span>
                  <span className="text-slate-700">
                    {new Date(selectedVehicle.entryTime).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Exit Time (Now):</span>
                  <span className="text-slate-700">{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Duration:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {Math.floor((estimate?.minutes || 0) / 60)}h {(estimate?.minutes || 0) % 60}m
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CASH', label: 'Cash', icon: DollarSign },
                    { id: 'CARD', label: 'Credit Card', icon: CreditCard },
                    { id: 'UPI', label: 'UPI / Digital', icon: Smartphone },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-2.5 rounded-xl border text-center text-xs flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === pm.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <pm.icon className="w-4 h-4" />
                      <span>{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exit Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Exit Remarks / Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Transaction ID, gate pass validated"
                  value={exitNotes}
                  onChange={(e) => setExitNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExit}
                  disabled={processing}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{processing ? 'Processing...' : 'Complete Exit & Free Bay'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setCompletedRecord(null);
        }}
        data={completedRecord}
        type="EXIT"
      />
    </div>
  );
};

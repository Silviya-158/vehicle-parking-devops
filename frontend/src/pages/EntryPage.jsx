import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { vehiclesApi, slotsApi } from '../services/api';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  LogIn,
  Car,
  Bike,
  Zap,
  Truck,
  User,
  Phone,
  Grid3X3,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

export const EntryPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const preselectedSlotId = searchParams.get('slotId');
  const preselectedType = searchParams.get('type') || 'CAR';

  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: preselectedType,
    driverName: '',
    phoneNumber: '',
    slotId: preselectedSlotId ? Number(preselectedSlotId) : '',
    notes: '',
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successTicket, setSuccessTicket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch available slots whenever vehicleType changes
  useEffect(() => {
    const loadSlots = async () => {
      try {
        setLoadingSlots(true);
        const slots = await slotsApi.getAvailable(formData.vehicleType);
        setAvailableSlots(slots || []);

        // If preselected slot is not in available list (maybe reserved or different type), select first available
        if (slots.length > 0 && (!formData.slotId || !slots.some((s) => s.id === Number(formData.slotId)))) {
          setFormData((prev) => ({ ...prev, slotId: slots[0].id }));
        }
      } catch (err) {
        console.error('Failed to load available slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [formData.vehicleType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'vehicleNumber' ? value.toUpperCase() : value,
    }));
    setError('');
  };

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, vehicleType: type, slotId: '' }));
  };

  const selectedSlotObj = availableSlots.find((s) => s.id === Number(formData.slotId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.vehicleNumber.trim()) {
      setError('Please provide a valid vehicle registration plate number.');
      return;
    }

    if (!formData.slotId) {
      setError('Please select an available parking bay.');
      return;
    }

    try {
      setSubmitting(true);
      const result = await vehiclesApi.entry({
        vehicleNumber: formData.vehicleNumber.trim(),
        vehicleType: formData.vehicleType,
        driverName: formData.driverName.trim() || 'Driver',
        phoneNumber: formData.phoneNumber.trim() || null,
        slotId: Number(formData.slotId),
        notes: formData.notes.trim() || null,
      });

      setSuccessTicket(result);
      setModalOpen(true);

      // Reset form
      setFormData({
        vehicleNumber: '',
        vehicleType: 'CAR',
        driverName: '',
        phoneNumber: '',
        slotId: '',
        notes: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to record vehicle entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <LogIn className="w-6 h-6 text-blue-600" />
          <span>Vehicle Inbound Check-In & Slot Assignment</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verify registration number, match vehicle category, and assign an available bay.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check-In Form (2 Columns on Desktop) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Vehicle Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Vehicle Category
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'CAR', label: 'Car / Sedan', icon: Car },
                  { id: 'BIKE', label: 'Bike / Scooter', icon: Bike },
                  { id: 'EV', label: 'EV (Electric)', icon: Zap },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTypeSelect(item.id)}
                    className={`p-3 rounded-xl border text-center transition-all duration-150 flex flex-col items-center gap-1.5 ${
                      formData.vehicleType === item.id
                        ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-bold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${formData.vehicleType === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-xs">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Vehicle & Driver Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Vehicle Registration Plate *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="vehicleNumber"
                    required
                    placeholder="e.g. KA-01-AB-1234"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold tracking-wider uppercase focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Accepts standard state/commercial license plates</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Driver / Visitor Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    name="driverName"
                    required
                    placeholder="Enter full name"
                    value={formData.driverName}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Entry Notes / Remarks
                </label>
                <input
                  type="text"
                  name="notes"
                  placeholder="Visitor badge, purpose of visit..."
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Step 3: Slot Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  2. Select Available Parking Bay *
                </label>
                <span className="text-xs text-emerald-600 font-medium">
                  {availableSlots.length} available {formData.vehicleType.toLowerCase()} bays
                </span>
              </div>

              {loadingSlots ? (
                <div className="p-4 text-center text-xs text-slate-500">Checking bay availability...</div>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    No available {formData.vehicleType} slots currently. Please wait for an exit or choose a different type.
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-52 overflow-y-auto p-1">
                  {availableSlots.map((slot) => {
                    const isSelected = Number(formData.slotId) === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, slotId: slot.id }))}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 font-bold'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm">{slot.slotNumber}</span>
                          <span className="text-[10px] text-slate-500 font-mono">${slot.hourlyRate}/h</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {slot.floor} • {slot.zone}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/slots')}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || availableSlots.length === 0}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{submitting ? 'Allocating Bay...' : 'Confirm Entry & Print Slip'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Ticket Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-6 text-white flex flex-col justify-between border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-sm tracking-wide">Live Pass Preview</span>
              </div>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-500/30">
                PENDING
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Vehicle License
                </span>
                <div className="text-xl font-mono font-bold tracking-widest text-white mt-0.5">
                  {formData.vehicleNumber || '--- --- ----'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5 capitalize">
                  {formData.vehicleType.toLowerCase()} Vehicle
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Driver Name:</span>
                  <span className="font-semibold text-slate-200">
                    {formData.driverName || 'Guest Driver'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Bay:</span>
                  <span className="font-mono font-bold text-blue-400">
                    {selectedSlotObj?.slotNumber || 'Unassigned'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-200">
                    {selectedSlotObj ? `${selectedSlotObj.floor} (${selectedSlotObj.zone})` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hourly Tariff:</span>
                  <span className="font-mono text-slate-200">
                    ${selectedSlotObj?.hourlyRate || '5.00'}/hour
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Entry Timestamp:</span>
                  <span className="font-mono text-slate-200">Current Instant</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <div className="font-mono text-[9px] tracking-[5px] text-slate-500 select-none">
              ||| |||| | ||||| || |||
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Automatic entry gate arm will raise on submission</p>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSuccessTicket(null);
        }}
        data={successTicket}
        type="ENTRY"
      />
    </div>
  );
};

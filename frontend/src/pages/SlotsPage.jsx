import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { slotsApi, vehiclesApi } from '../services/api';
import { SlotCard } from '../components/SlotCard';
import { AddSlotModal } from '../components/AddSlotModal';
import { EditSlotModal } from '../components/EditSlotModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { useAuth } from '../context/AuthContext';
import {
  Grid3X3,
  Plus,
  Search,
  Filter,
  Car,
  Bike,
  Zap,
  CheckCircle,
  AlertOctagon,
  CalendarClock,
  Layers,
  RefreshCw,
  X,
  AlertCircle,
} from 'lucide-react';

export const SlotsPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [metadata, setMetadata] = useState({ floors: [], zones: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [slotToEdit, setSlotToEdit] = useState(null);

  // Quick exit receipt modal
  const [receiptData, setReceiptData] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const fetchSlots = async () => {
    try {
      setError('');
      const [slotsData, meta] = await Promise.all([
        slotsApi.getAll({
          floor: selectedFloor,
          status: selectedStatus,
          slotType: selectedType,
          search: searchTerm,
        }),
        slotsApi.getMetadata(),
      ]);
      setSlots(slotsData || []);
      setMetadata(meta || { floors: [], zones: [] });
    } catch (err) {
      setError(err.message || 'Failed to load parking slots');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedFloor, selectedStatus, selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSlots();
  };

  const handleAddSlot = async (slotData) => {
    await slotsApi.create(slotData);
    setSuccessMsg(`Parking slot ${slotData.slotNumber} created successfully`);
    fetchSlots();
  };

  const handleUpdateSlot = async (id, slotData) => {
    await slotsApi.update(id, slotData);
    setSuccessMsg(`Parking slot ${slotData.slotNumber} updated successfully`);
    fetchSlots();
  };

  const handleDeleteSlot = async (slot) => {
    if (!window.confirm(`Are you sure you want to permanently delete slot ${slot.slotNumber}?`)) {
      return;
    }

    try {
      await slotsApi.delete(slot.id);
      setSuccessMsg(`Slot ${slot.slotNumber} deleted successfully`);
      fetchSlots();
    } catch (err) {
      setError(err.message || 'Failed to delete slot');
    }
  };

  // Quick action triggers from slot card
  const handleParkVehicle = (slot) => {
    navigate(`/entry?slotId=${slot.id}&slotNumber=${slot.slotNumber}&type=${slot.slotType}`);
  };

  const handleReserveSlot = (slot) => {
    navigate(`/reservations?slotId=${slot.id}&slotNumber=${slot.slotNumber}&type=${slot.slotType}`);
  };

  const handleProcessExit = async (slot) => {
    try {
      const exitRecord = await vehiclesApi.exit({
        vehicleNumber: slot.currentVehicleNumber,
        recordId: slot.activeParkingRecordId,
        paymentMethod: 'CASH',
      });
      setReceiptData(exitRecord);
      setReceiptModalOpen(true);
      fetchSlots();
    } catch (err) {
      setError(err.message || 'Failed to process vehicle exit');
    }
  };

  const handleEditSlot = (slot) => {
    setSlotToEdit(slot);
    setEditModalOpen(true);
  };

  // Summary counts
  const totalCount = slots.length;
  const availableCount = slots.filter((s) => s.status === 'AVAILABLE').length;
  const occupiedCount = slots.filter((s) => s.status === 'OCCUPIED').length;
  const reservedCount = slots.filter((s) => s.status === 'RESERVED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 text-blue-600" />
            <span>Interactive Parking Layout & Slots</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visual map of all bays across floors, zones, and vehicle types.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchSlots();
            }}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {isAdmin && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Parking Slot
            </button>
          )}
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <span>{successMsg}</span>
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

      {/* Floor Filter Tabs & Live Status Pills */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Floor selection tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedFloor('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFloor === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Floors
            </button>
            {metadata.floors?.map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedFloor === floor
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {floor}
              </button>
            ))}
          </div>

          {/* Status Quick Legend / Counters */}
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Available: {availableCount}
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Occupied: {occupiedCount}
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Reserved: {reservedCount}
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search slot, plate, zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </form>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available Only</option>
            <option value="OCCUPIED">Occupied Only</option>
            <option value="RESERVED">Reserved Only</option>
          </select>

          {/* Vehicle Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-700"
          >
            <option value="ALL">All Vehicle Types</option>
            <option value="CAR">Car Slots</option>
            <option value="BIKE">Bike / Two-Wheeler Slots</option>
            <option value="EV">EV Charging Slots</option>
          </select>

          {/* Reset Filters button */}
          <button
            onClick={() => {
              setSelectedFloor('ALL');
              setSelectedStatus('ALL');
              setSelectedType('ALL');
              setSearchTerm('');
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Visual Parking Bays Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading parking bays...</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
          <Grid3X3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Parking Slots Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No parking slots match your current filter criteria. Try adjusting the filters or adding a new slot.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {slots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              onPark={handleParkVehicle}
              onExit={handleProcessExit}
              onReserve={handleReserveSlot}
              onEdit={handleEditSlot}
              onDelete={handleDeleteSlot}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddSlotModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddSlot}
        metadata={metadata}
      />

      <EditSlotModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSlotToEdit(null);
        }}
        slot={slotToEdit}
        onSave={handleUpdateSlot}
      />

      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setReceiptData(null);
        }}
        data={receiptData}
        type="EXIT"
      />
    </div>
  );
};

import React from 'react';
import { Car, Bike, Zap, Truck, Clock, User, LogIn, LogOut, Calendar, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const SlotCard = ({
  slot,
  onPark,
  onExit,
  onReserve,
  onEdit,
  onDelete,
  onViewDetails,
  isAdmin,
}) => {
  const getVehicleIcon = (type) => {
    switch (type) {
      case 'BIKE':
        return <Bike className="w-5 h-5" />;
      case 'EV':
        return <Zap className="w-5 h-5 text-emerald-500" />;
      case 'TRUCK':
        return <Truck className="w-5 h-5" />;
      case 'CAR':
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  const getBorderColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'border-emerald-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/20';
      case 'OCCUPIED':
        return 'border-rose-300 hover:border-rose-500 bg-rose-50/20';
      case 'RESERVED':
        return 'border-amber-300 hover:border-amber-500 bg-amber-50/20';
      default:
        return 'border-slate-200 bg-white';
    }
  };

  const isAvailable = slot.status === 'AVAILABLE';
  const isOccupied = slot.status === 'OCCUPIED';
  const isReserved = slot.status === 'RESERVED';

  // Format entry time to simple hours/minutes ago
  const formatSince = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between relative group ${getBorderColor(
        slot.status
      )}`}
    >
      {/* Top Header: Slot Number & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-mono font-bold text-sm">
            {slot.slotNumber}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>{slot.floor}</span>
              <span>•</span>
              <span className="text-slate-600">{slot.zone}</span>
            </div>
          </div>
        </div>
        <StatusBadge status={slot.status} size="sm" />
      </div>

      {/* Middle Content: Vehicle Type & Current Occupant or Rate */}
      <div className="my-3 py-2 border-y border-slate-100/80">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            {getVehicleIcon(slot.slotType)}
            <span>{slot.slotType} Slot</span>
          </div>
          <span className="font-semibold text-slate-800 font-mono">${slot.hourlyRate}/hr</span>
        </div>

        {isOccupied && (
          <div className="mt-2 bg-rose-50 rounded-lg p-2.5 border border-rose-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Parked Vehicle</span>
              {slot.currentEntryTime && (
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {formatSince(slot.currentEntryTime)}
                </span>
              )}
            </div>
            <div className="mt-1 font-mono font-bold text-sm text-slate-900 tracking-wider">
              {slot.currentVehicleNumber || 'Plate Unknown'}
            </div>
            {slot.currentDriverName && (
              <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5 truncate">
                <User className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{slot.currentDriverName}</span>
              </div>
            )}
          </div>
        )}

        {isReserved && (
          <div className="mt-2 bg-amber-50 rounded-lg p-2.5 border border-amber-100">
            <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Reserved For</div>
            <div className="mt-1 font-mono font-bold text-sm text-slate-900 tracking-wider">
              {slot.currentVehicleNumber || 'Pending Confirmation'}
            </div>
            {slot.currentDriverName && (
              <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5 truncate">
                <User className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{slot.currentDriverName}</span>
              </div>
            )}
          </div>
        )}

        {isAvailable && (
          <div className="mt-2 py-2 text-center text-xs text-emerald-700 bg-emerald-50/60 rounded-lg border border-emerald-100/60 font-medium">
            Ready for vehicle check-in
          </div>
        )}
      </div>

      {/* Footer: Action Buttons */}
      <div className="flex items-center justify-between pt-1 gap-1.5">
        <div className="flex items-center gap-1.5 w-full">
          {isAvailable && (
            <>
              <button
                onClick={() => onPark(slot)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                title="Record vehicle entry"
              >
                <LogIn className="w-3.5 h-3.5" />
                Park
              </button>
              <button
                onClick={() => onReserve(slot)}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 rounded-lg text-xs font-medium transition-colors"
                title="Reserve this slot"
              >
                <Calendar className="w-3.5 h-3.5" />
                Reserve
              </button>
            </>
          )}

          {isOccupied && (
            <button
              onClick={() => onExit(slot)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              title="Process vehicle exit"
            >
              <LogOut className="w-3.5 h-3.5" />
              Process Exit
            </button>
          )}

          {isReserved && (
            <button
              onClick={() => onPark(slot)}
              className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              title="Check-in reservation"
            >
              <LogIn className="w-3.5 h-3.5" />
              Check-in Reservation
            </button>
          )}
        </div>

        {/* Slot Options Menu */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onEdit(slot)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Slot"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {isAdmin && (
            <button
              onClick={() => onDelete(slot)}
              disabled={isOccupied || isReserved}
              className={`p-1.5 rounded-lg transition-colors ${
                isOccupied || isReserved
                  ? 'text-slate-200 cursor-not-allowed'
                  : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
              }`}
              title={isOccupied || isReserved ? 'Cannot delete slot while occupied/reserved' : 'Delete Slot'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

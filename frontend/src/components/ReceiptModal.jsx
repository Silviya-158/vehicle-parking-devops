import React from 'react';
import { Printer, CheckCircle, X, ShieldCheck, Clock, Calendar, Car } from 'lucide-react';

export const ReceiptModal = ({ isOpen, onClose, data, type = 'ENTRY' }) => {
  if (!isOpen || !data) return null;

  const isEntry = type === 'ENTRY';

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Receipt Header */}
        <div className={`p-6 text-white text-center relative ${isEntry ? 'bg-blue-600' : 'bg-emerald-600'}`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex p-3 rounded-full bg-white/20 mb-2">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">
            {isEntry ? 'Vehicle Entry Ticket' : 'Parking Exit Receipt'}
          </h3>
          <p className="text-xs text-white/80 mt-1">
            {isEntry ? 'Vehicle checked in successfully' : 'Payment processed & slot released'}
          </p>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-4 text-sm" id="printable-receipt">
          {/* Facility Info */}
          <div className="text-center pb-3 border-b border-dashed border-slate-200">
            <span className="font-bold text-slate-800 tracking-wider uppercase text-xs">
              ParkFlow Central Tech Park
            </span>
            <div className="text-xs text-slate-500">Facility ID: FAC-001 • Gate 3</div>
          </div>

          {/* Key Allocation Highlight */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Assigned Slot</span>
              <div className="text-2xl font-mono font-extrabold text-blue-600 mt-0.5">
                {data.slotNumber || 'Slot'}
              </div>
              <div className="text-xs text-slate-500">{data.floor} • {data.zone}</div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vehicle Plate</span>
              <div className="text-lg font-mono font-bold text-slate-900 mt-0.5 bg-yellow-100 px-2 py-0.5 rounded border border-yellow-300">
                {data.vehicleNumber}
              </div>
              <div className="text-xs text-slate-500 capitalize">{data.vehicleType}</div>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-2 py-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Ticket Reference:</span>
              <span className="font-mono font-semibold text-slate-800">PK-{data.id || '001'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Driver Name:</span>
              <span className="font-medium text-slate-800">{data.driverName || 'Guest Driver'}</span>
            </div>
            {data.phoneNumber && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Contact:</span>
                <span className="font-mono text-slate-800">{data.phoneNumber}</span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Entry Time:</span>
              <span className="font-medium text-slate-800">{formatDate(data.entryTime)}</span>
            </div>

            {!isEntry && (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Exit Time:</span>
                  <span className="font-medium text-slate-800">{formatDate(data.exitTime)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Duration:</span>
                  <span className="font-semibold text-slate-800">
                    {Math.floor((data.durationMinutes || 0) / 60)} hrs {(data.durationMinutes || 0) % 60} mins
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Hourly Rate:</span>
                  <span className="font-medium text-slate-800">${data.hourlyRate}/hr</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-medium text-slate-800">{data.paymentMethod || 'CASH'}</span>
                </div>
              </>
            )}
          </div>

          {/* Total Fee Banner for Exit */}
          {!isEntry && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <span className="font-bold text-emerald-900 text-sm">Total Amount Paid</span>
              <span className="text-2xl font-extrabold text-emerald-700 font-mono">
                ${data.totalFee ? Number(data.totalFee).toFixed(2) : '0.00'}
              </span>
            </div>
          )}

          {/* Barcode Simulation */}
          <div className="pt-2 text-center border-t border-dashed border-slate-200">
            <div className="font-mono text-[9px] tracking-[6px] text-slate-400 uppercase select-none">
              ||| | | |||| || || | ||| |||| | ||| ||| |
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              AUTH-CODE: {btoa(data.vehicleNumber || 'PK').substring(0, 16)}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/70 transition-colors"
          >
            Done
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';

export const AddSlotModal = ({ isOpen, onClose, onSave, metadata }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    slotNumber: '',
    slotType: 'CAR',
    floor: metadata?.floors?.[0] || 'Ground Floor',
    zone: metadata?.zones?.[0] || 'Zone A',
    hourlyRate: '5.00',
    status: 'AVAILABLE',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.slotNumber.trim()) {
      setError('Slot number is required');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        ...formData,
        hourlyRate: parseFloat(formData.hourlyRate) || 5.0,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add parking slot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Add New Parking Slot</h3>
              <p className="text-xs text-slate-500">Create a new slot in the facility</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Slot Number *
              </label>
              <input
                type="text"
                name="slotNumber"
                placeholder="e.g. A-07"
                value={formData.slotNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Vehicle Type *
              </label>
              <select
                name="slotType"
                value={formData.slotType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="CAR">Car</option>
                <option value="BIKE">Bike</option>
                <option value="EV">EV (Charging)</option>
                <option value="TRUCK">Truck</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Floor *
              </label>
              <input
                type="text"
                name="floor"
                placeholder="e.g. Ground Floor"
                value={formData.floor}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Zone *
              </label>
              <input
                type="text"
                name="zone"
                placeholder="e.g. Zone A"
                value={formData.zone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Hourly Rate ($) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Initial Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="AVAILABLE">Available</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

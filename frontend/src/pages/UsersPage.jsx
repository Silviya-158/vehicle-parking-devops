import React, { useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  Users,
  UserPlus,
  Shield,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Lock,
  Mail,
  User,
  Power,
} from 'lucide-react';

export const UsersPage = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Form states
  const [addForm, setAddForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'STAFF',
    active: true,
  });

  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    role: 'STAFF',
    active: true,
    password: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsersList(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch registered users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await usersApi.create(addForm);
      setSuccessMsg(`User ${addForm.username} created successfully`);
      setAddModalOpen(false);
      setAddForm({
        username: '',
        password: '',
        fullName: '',
        email: '',
        role: 'STAFF',
        active: true,
      });
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    }
  };

  const openEditModal = (u) => {
    setUserToEdit(u);
    setEditForm({
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      active: u.active,
      password: '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await usersApi.update(userToEdit.id, editForm);
      setSuccessMsg(`User ${userToEdit.username} updated successfully`);
      setEditModalOpen(false);
      setUserToEdit(null);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleToggleStatus = async (userItem) => {
    try {
      await usersApi.toggleStatus(userItem.id);
      setSuccessMsg(`Account status toggled for ${userItem.username}`);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to toggle account status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Staff & System Access Control</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage operator accounts, assign ADMIN or STAFF roles, and deactivate credentials.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add System User
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <span>{successMsg}</span>
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

      {/* Users Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500">Loading system accounts...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Role Permission</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs uppercase border border-slate-200">
                          {u.username?.charAt(0)}
                        </div>
                        <span className="font-mono font-bold text-slate-900">{u.username}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">{u.fullName}</td>

                    <td className="py-3.5 px-4 text-slate-600">{u.email}</td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          u.role === 'ADMIN'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={u.active ? 'ACTIVE' : 'INACTIVE'} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          u.active
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={u.active ? 'Deactivate User' : 'Activate User'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add New Staff / Admin</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. john.doe"
                  value={addForm.username}
                  onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="john@parkflow.io"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Permission Role *
                </label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                >
                  <option value="STAFF">Staff Operator (Entry, Exit, Slot View)</option>
                  <option value="ADMIN">Administrator (Full Access & Configuration)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editModalOpen && userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Edit User: {userToEdit.username}</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                >
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Reset Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  placeholder="New password (optional)"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

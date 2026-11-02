import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Lock, User, ShieldCheck, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (userType) => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('staff');
      setPassword('staff123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background geometric accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 w-full max-w-md overflow-hidden relative z-10">
        {/* Header Banner */}
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ParkFlow™</h1>
              <p className="text-xs text-slate-400">Vehicle Slot Management System</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
            Sign in with your enterprise credentials to access the facility dashboard.
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-500/25 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Demo Access Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Quick Demo Credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-colors group"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                  Admin Login
                </div>
                <div className="text-[11px] text-slate-500 font-mono">admin / admin123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('staff')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-left transition-colors group"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-600">
                  Staff Login
                </div>
                <div className="text-[11px] text-slate-500 font-mono">staff / staff123</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

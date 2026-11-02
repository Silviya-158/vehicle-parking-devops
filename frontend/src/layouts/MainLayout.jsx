import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Grid3X3,
  LogIn,
  LogOut,
  CalendarClock,
  History,
  Users,
  Menu,
  X,
  Shield,
  Building2,
  Bell,
  Clock,
  LogOut as SignOutIcon,
  ChevronDown,
} from 'lucide-react';

export const MainLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Parking Slots', path: '/slots', icon: Grid3X3 },
    { name: 'Vehicle Entry', path: '/entry', icon: LogIn },
    { name: 'Vehicle Exit', path: '/exit', icon: LogOut },
    { name: 'Reservations', path: '/reservations', icon: CalendarClock },
    { name: 'Parking History', path: '/history', icon: History },
  ];

  if (isAdmin) {
    navItems.push({ name: 'User Management', path: '/users', icon: Users, adminOnly: true });
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0 text-slate-300">
        {/* Brand / Logo */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-black text-lg">
            P
          </div>
          <div>
            <div className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
              <span>ParkFlow</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 font-semibold px-1.5 py-0.2 rounded border border-blue-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Smart Parking Platform</p>
          </div>
        </div>

        {/* Facility Info Widget */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-slate-300">Central Tech Park</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Facility Gate A</span>
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Online
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
              {item.adminOnly && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                  Admin
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white uppercase border border-slate-600">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white truncate max-w-[110px]">
                  {user?.fullName || 'Operator'}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-blue-400" />
                  {user?.role || 'STAFF'}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign Out"
            >
              <SignOutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Title / Facility Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm hidden sm:inline">
                ParkFlow System
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium">Commercial Hub - Sector 4</span>
              </div>
            </div>
          </div>

          {/* Right Header items: Clock, Live Status, User Profile */}
          <div className="flex items-center gap-4">
            {/* Real-time Digital Clock */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span>•</span>
              <span className="font-bold text-slate-800">
                {currentTime.toLocaleTimeString('en-US')}
              </span>
            </div>

            {/* User Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {user?.fullName || 'User'}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    {user?.role || 'STAFF'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-fade-in">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-medium text-slate-900">{user?.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                  >
                    <SignOutIcon className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-64 bg-slate-900 h-full flex flex-col p-4 text-white">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-bold text-base">ParkFlow Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 mt-4 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                        isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>
              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-slate-800 rounded-lg"
                >
                  <SignOutIcon className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

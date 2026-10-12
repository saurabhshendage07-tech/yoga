import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CalendarCheck,
  CreditCard,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  QrCode,
  PanelBottom
} from 'lucide-react';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  // If not logged in or not admin, redirect or show login prompt
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FBF9F5]">
        <div className="bg-white p-8 rounded-3xl border border-[#E1DBD1] max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#24362C]">Admin Access Required</h2>
          <p className="text-xs text-[#6A7E72]">
            You must be logged in with an administrator account to view the studio management control panel.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/login"
              className="w-full py-2.5 rounded-full bg-[#2D4A3E] text-white text-xs font-semibold"
            >
              Go to Login Page
            </Link>
            <Link
              to="/"
              className="w-full py-2.5 rounded-full bg-gray-100 text-[#24362C] text-xs font-medium"
            >
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Enrollments', path: '/admin/enrollments', icon: CalendarCheck },
    { name: 'Payment Settings', path: '/admin/payment-settings', icon: QrCode },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Contact Inquiries', path: '/admin/messages', icon: MessageSquare },
    { name: 'Footer Management', path: '/admin/footer', icon: PanelBottom },
    { name: 'Studio Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex text-[#24362C]">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1E2E25] text-[#D8E2DA] border-r border-[#2C4235] shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#2C4235] flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EAE3D6] p-1 flex items-center justify-center">
              <img src="/logo.svg" alt="PranaVeda Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-heading font-bold text-sm text-[#FBF9F5] tracking-wider block">
                PRANAVEDA
              </span>
              <span className="text-[10px] text-[#A3B8A8] uppercase tracking-widest block font-medium">
                Admin Center
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  active
                    ? 'bg-[#2D4A3E] text-white font-semibold shadow-xs'
                    : 'text-[#A8BDB0] hover:text-white hover:bg-[#283D31]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#E2B887]' : 'text-[#869A8C]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#2C4235] space-y-2">
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#A8BDB0] hover:text-white hover:bg-[#283D31] transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              View Live Website
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#FCA5A5] hover:bg-red-950/40 rounded-xl transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-[#E1DBD1] py-3.5 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-[#2D4A3E] hover:bg-black/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block text-xs font-medium text-[#55695C]">
              PranaVeda Yoga & Wellness Sanctuary • <span className="text-[#2D4A3E] font-semibold">Management Console</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFE9DF] text-[#2D4A3E] hover:bg-[#E5DDCF] text-xs font-semibold transition"
            >
              <span>Live Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="flex items-center gap-2.5 pl-3 border-l border-[#E1DBD1]">
              <div className="w-8 h-8 rounded-full bg-[#2D4A3E] text-white flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-semibold text-[#24362C] leading-tight">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-[#7A8C80]">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-64 bg-[#1E2E25] text-[#D8E2DA] flex flex-col z-10 shadow-2xl animate-slide-right">
              <div className="p-4 border-b border-[#2C4235] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#EAE3D6] p-1 flex items-center justify-center">
                    <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-heading font-bold text-sm text-white">PRANAVEDA</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                        active ? 'bg-[#2D4A3E] text-white font-semibold' : 'text-[#A8BDB0] hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-[#2C4235] space-y-2">
                <Link
                  to="/"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-[#A8BDB0]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Website</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-300"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Nested Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

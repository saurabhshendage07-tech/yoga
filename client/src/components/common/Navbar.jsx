import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  X,
  User,
  ShieldCheck,
  LogOut,
  Sparkles,
  PhoneCall,
  CalendarCheck
} from 'lucide-react';

export default function Navbar({ onOpenEnroll }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${
      isScrolled ? 'glass-nav shadow-sm bg-[#FBF9F5]/95' : 'bg-[#FBF9F5]/80 backdrop-blur-md'
    }`}>
      {/* Top Banner Notice */}
      <div className="bg-[#2D4A3E] text-[#E8ECE9] py-1.5 px-4 text-xs font-medium text-center hidden md:flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#E2B887]" />
            <span>New Morning & Evening Yoga Batches starting this Monday. Limited 20 seats per batch!</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-xs opacity-90">
              <PhoneCall className="w-3 h-3 text-[#E2B887]" /> +91 98765 43210
            </span>
            <span className="text-white/40">|</span>
            <span className="text-xs text-[#E2B887]">Sangli Studio & Online Live</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#EAE3D6] p-1.5 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
            <img src="/logo.svg" alt="PranaVeda Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="font-heading font-bold text-lg sm:text-xl tracking-wider text-[#24362C] leading-tight group-hover:text-[#2D4A3E] transition-colors">
              PRANAVEDA
            </div>
            <div className="text-[10px] sm:text-[11px] font-medium tracking-widest text-[#7E9A82] uppercase">
              Yoga & Wellness Sanctuary
            </div>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`nav-link-item text-sm font-medium py-1 ${
                isActive(link.path)
                  ? 'text-[#2D4A3E] font-semibold active'
                  : 'text-[#55695C] hover:text-[#2D4A3E]'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EFE9DF] text-[#2D4A3E] hover:bg-[#E5DDCF] text-xs font-semibold border border-[#D5CABE] transition transform hover:-translate-y-0.5"
                  title="Open Admin Dashboard"
                >
                  <ShieldCheck className="w-4 h-4 text-[#55755E]" />
                  <span>Admin Panel</span>
                </Link>
              )}

              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#24362C] text-xs font-medium border border-[#DDD5C7] shadow-xs transition transform hover:-translate-y-0.5"
              >
                <User className="w-3.5 h-3.5 text-[#55755E]" />
                <span className="max-w-[120px] truncate">{user.name || 'Dashboard'}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-xl text-[#7A8A7F] hover:text-[#A84A4A] hover:bg-red-50 transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-medium text-[#44584C] hover:text-[#2D4A3E] px-3.5 py-2 rounded-xl hover:bg-black/5 transition"
              >
                Login / Register
              </Link>
              <button
                onClick={() => onOpenEnroll ? onOpenEnroll() : navigate('/courses')}
                className="yoga-btn-primary !py-2 !px-4 !text-xs !shadow-sm hover:!shadow"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-[#E2B887]" />
                <span>Join Now</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <Link
              to="/dashboard"
              className="p-2 rounded-lg bg-white/80 border border-[#DDD5C7] text-[#2D4A3E]"
            >
              <User className="w-4 h-4" />
            </Link>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-[#2D4A3E] hover:bg-black/5 transition"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden glass-card border-t border-[#E1DBD1] px-6 py-5 flex flex-col gap-4 animate-fade-in shadow-xl">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                  isActive(link.path)
                    ? 'bg-[#EAE3D6] text-[#2D4A3E] font-semibold'
                    : 'text-[#55695C] hover:bg-[#F2ECE1]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E1DBD1] flex flex-col gap-2.5">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#EFE9DF] text-[#24362C] text-sm font-medium"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#55755E]" />
                    My Enrolled Courses & Profile
                  </span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 py-2 px-3 rounded-lg bg-[#2D4A3E] text-white text-sm font-medium"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#E2B887]" />
                    Admin Control Panel
                  </Link>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 py-2 px-3 text-sm text-[#A84A4A] font-medium hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-medium text-[#2D4A3E] bg-[#EFE9DF] rounded-xl active:scale-[0.98] transition"
                >
                  Student Login / Register
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (onOpenEnroll) onOpenEnroll();
                    else navigate('/courses');
                  }}
                  className="w-full py-2.5 text-sm font-medium text-white bg-[#2D4A3E] rounded-xl shadow active:scale-[0.98] transition cursor-pointer"
                >
                  Join / Enroll Now
                </button>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center text-xs text-[#6A7E72] hover:text-[#2D4A3E] pt-1 flex items-center justify-center gap-1.5 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C59B63]" />
                  <span>Studio Admin Portal</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

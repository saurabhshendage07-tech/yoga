import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Lock,
  Mail,
  User,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // 3D Card Tilt State
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, scale: 1 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { login, register, resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Detect Mobile device to avoid heavy mouse tilt
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || ('ontouchstart' in window));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate subtle tilt angle (-5 to +5 deg)
    const rotateX = ((y - centerY) / centerY) * -5.5;
    const rotateY = ((x - centerX) / centerX) * 5.5;

    setTilt({ x: rotateX, y: rotateY, scale: 1.015 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, scale: 1 });
    setIsHovered(false);
  };

  const triggerError = (msg) => {
    setErrorMessage(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleInputChange = (e) => {
    if (errorMessage) setErrorMessage('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.email) {
      triggerError('Please enter your email address.');
      showToast('Please enter your email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        if (!formData.name) {
          triggerError('Please enter your full name.');
          showToast('Please enter your full name.', 'error');
          setLoading(false);
          return;
        }
        const user = await register(formData);
        setLoginSuccess(true);
        showToast('Registration successful! Welcome to PranaVeda 🙏', 'success');
        setTimeout(() => {
          navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
        }, 700);
      } else {
        const user = await login(formData.email, formData.password);
        setLoginSuccess(true);
        showToast(`Welcome back, ${user?.name || 'Practitioner'}!`, 'success');
        setTimeout(() => {
          navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
        }, 700);
      }
    } catch (err) {
      triggerError(err.message || 'Authentication error. Please verify your credentials.');
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      showToast('Please enter your registered email address.', 'error');
      return;
    }
    try {
      await resetPassword(forgotEmail);
      showToast('Password reset link sent to your email.', 'success');
      setForgotModal(false);
      setForgotEmail('');
    } catch (err) {
      showToast(err.message || 'Failed to send reset link. Please try again.', 'error');
    }
  };

  // Quick Demo Logins
  const loginDemoStudent = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      await login('student@pranavedayoga.com', 'password123');
      setLoginSuccess(true);
      showToast('Logged in as Student Demo (Aarav Sharma)', 'success');
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      triggerError(err.message || 'Demo login failed');
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loginDemoAdmin = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      await login('admin@gmail.com', 'adminSecret2026');
      setLoginSuccess(true);
      showToast('Logged in as Studio Administrator (admin@gmail.com)', 'success');
      setTimeout(() => navigate('/admin'), 600);
    } catch (err) {
      triggerError(err.message || 'Admin login failed');
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] py-10 px-3 sm:px-6 flex items-center justify-center overflow-hidden bg-[#FAF8F5]">
      
      {/* ========================================================================= */}
      {/* 1. 3D ANIMATED WELLNESS BACKGROUND                                       */}
      {/* ========================================================================= */}
      
      {/* Primary Calm Breathing Glow Orb (Center behind card) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] rounded-full pointer-events-none -z-10 animate-breathe-glow"
        style={{
          background: 'radial-gradient(circle, rgba(126, 154, 130, 0.22) 0%, rgba(197, 155, 99, 0.12) 45%, transparent 75%)',
          filter: 'blur(45px)'
        }}
      />

      {/* Floating Ambient Prana Energy Orbs */}
      <div 
        className="absolute -top-16 -right-16 w-80 h-80 rounded-full pointer-events-none -z-10 animate-blob-1"
        style={{
          background: 'radial-gradient(circle, rgba(226, 184, 135, 0.18) 0%, transparent 70%)',
          filter: 'blur(50px)'
        }}
      />
      <div 
        className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full pointer-events-none -z-10 animate-blob-2"
        style={{
          background: 'radial-gradient(circle, rgba(45, 74, 62, 0.14) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
      />

      {/* 3D Sacred Floating Mandala / Lotus Silhouette (Opacity 0.10 - 0.15) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[580px] h-[420px] sm:h-[580px] pointer-events-none -z-10 opacity-12 sm:opacity-15 animate-mandala-spin"
        style={{ transition: 'transform 0.5s ease-out' }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full stroke-[#2D4A3E] fill-none" strokeWidth="0.6">
          <circle cx="100" cy="100" r="95" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="78" />
          <circle cx="100" cy="100" r="60" strokeDasharray="2 2" />
          <circle cx="100" cy="100" r="42" />
          <circle cx="100" cy="100" r="24" />
          {/* Sacred Lotus Petals */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
            <path
              key={i}
              d="M 100 100 Q 120 60 100 20 Q 80 60 100 100 Z"
              transform={`rotate(${angle} 100 100)`}
              className="stroke-[#C59B63]"
              strokeWidth="0.5"
            />
          ))}
          {/* Inner Mandala Ring */}
          {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((angle, i) => (
            <path
              key={`inner-${i}`}
              d="M 100 100 Q 112 75 100 50 Q 88 75 100 100 Z"
              transform={`rotate(${angle} 100 100)`}
              className="stroke-[#2D4A3E]"
              strokeWidth="0.4"
            />
          ))}
        </svg>
      </div>

      {/* Floating Prana Particle Sparkles */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <span className="absolute top-[18%] left-[15%] w-2 h-2 rounded-full bg-[#C59B63]/30 animate-prana-float" style={{ animationDelay: '0s' }} />
        <span className="absolute top-[35%] right-[18%] w-2.5 h-2.5 rounded-full bg-[#55755E]/25 animate-prana-float" style={{ animationDelay: '1.8s' }} />
        <span className="absolute bottom-[22%] left-[25%] w-1.5 h-1.5 rounded-full bg-[#C59B63]/40 animate-prana-float" style={{ animationDelay: '3.2s' }} />
        <span className="absolute bottom-[30%] right-[22%] w-2 h-2 rounded-full bg-[#8FA895]/35 animate-prana-float" style={{ animationDelay: '4.5s' }} />
      </div>

      {/* ========================================================================= */}
      {/* 2. 3D PERSPECTIVE WRAPPER & COMPACT LOGIN CARD                           */}
      {/* ========================================================================= */}
      <div 
        className="w-full flex items-center justify-center"
        style={{ perspective: '1200px' }}
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: !isMobile
              ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.scale})`
              : 'none',
            transition: isHovered
              ? 'transform 0.12s cubic-bezier(0.2, 0, 0.4, 1)'
              : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            transformStyle: 'preserve-3d'
          }}
          className={`
            w-full max-w-[430px] mx-auto
            rounded-3xl p-6 sm:p-7
            bg-white/90 backdrop-blur-xl
            border border-[#EAE3D6]/90
            shadow-[0_20px_50px_-12px_rgba(30,48,38,0.12),0_4px_16px_rgba(0,0,0,0.03)]
            relative z-10
            transition-shadow duration-300
            hover:shadow-[0_28px_60px_-12px_rgba(30,48,38,0.18),0_6px_20px_rgba(197,155,99,0.08)]
            ${isShaking ? 'animate-card-shake' : ''}
          `}
        >
          
          {/* Subtle Top Inner Light Sheen */}
          <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#C59B63]/30 to-transparent pointer-events-none" />

          {/* ========================================================================= */}
          {/* 3. CARD HEADER WITH ANIMATED PRANAVEDA LOGO                              */}
          {/* ========================================================================= */}
          <div className="text-center mb-5">
            {/* Animated Logo Container with Soft Aura */}
            <div className="relative inline-block mb-2.5">
              <div className="absolute inset-0 rounded-2xl bg-[#E2B887]/30 blur-md animate-pulse pointer-events-none" />
              <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#EFE9DF] p-2 mx-auto flex items-center justify-center shadow-sm border border-[#DDD5C7] transition-transform duration-300 hover:scale-105">
                <img src="/logo.svg" alt="PranaVeda Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1E2E25] tracking-tight">
              {isRegister ? 'Join PranaVeda' : 'Welcome Back'}
            </h1>
            <p className="text-[11px] sm:text-xs text-[#6A7E72] mt-1 font-light max-w-xs mx-auto">
              {isRegister
                ? 'Begin your transformative Himalayan wellness journey'
                : 'Continue your mindful yoga & wellness journey'}
            </p>
          </div>

          {/* ========================================================================= */}
          {/* 4. COMPACT 1-CLICK QUICK DEMO ACCESS                                     */}
          {/* ========================================================================= */}
          <div className="mb-4.5 p-2.5 sm:p-3 rounded-2xl bg-[#FAF8F5]/80 border border-[#EAE3D6] space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#7A8C80] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#C59B63]" />
                Quick Demo Access
              </span>
              <span className="text-[9px] text-[#A8B8A5] font-medium">1-Click Login</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={loginDemoStudent}
                disabled={loading || loginSuccess}
                className="group relative px-3 py-1.5 sm:py-2 rounded-xl bg-white border border-[#DDD5C7] text-[11px] font-semibold text-[#2D4A3E] hover:bg-[#EFE9DF] hover:border-[#C59B63]/60 transition-all duration-200 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span className="text-xs group-hover:scale-110 transition-transform">🧘</span>
                <span>Student</span>
              </button>
              
              <button
                type="button"
                onClick={loginDemoAdmin}
                disabled={loading || loginSuccess}
                className="group relative px-3 py-1.5 sm:py-2 rounded-xl bg-[#2D4A3E] border border-[#2D4A3E] text-white text-[11px] font-semibold hover:bg-[#1E2E25] hover:border-[#C59B63]/40 transition-all duration-200 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#E2B887] group-hover:scale-110 transition-transform" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. INLINE ERROR BANNER                                                   */}
          {/* ========================================================================= */}
          {errorMessage && (
            <div className="mb-4 p-2.5 rounded-xl bg-[#FDF2F2] border border-[#F8D7DA] flex items-start gap-2 text-xs text-[#9B2C2C] animate-fade-in">
              <AlertCircle className="w-4 h-4 text-[#E53E3E] shrink-0 mt-0.5" />
              <span className="leading-tight">{errorMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. AUTHENTICATION FORM                                                   */}
          {/* ========================================================================= */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5 text-xs">
            {/* Full Name (Register Only) */}
            {isRegister && (
              <div>
                <label className="block text-[11px] font-semibold text-[#4A5D50] mb-1">
                  Full Name <span className="text-[#C59B63]">*</span>
                </label>
                <div className="relative group">
                  <User className="w-4 h-4 text-[#869A8C] group-focus-within:text-[#2D4A3E] absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Aarav Sharma"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={isRegister}
                    className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border border-[#D5CABE] bg-white/95 text-[#24362C] placeholder-[#A0AEC0] text-xs focus:ring-2 focus:ring-[#55755E]/30 focus:border-[#55755E] focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-semibold text-[#4A5D50] mb-1">
                Email Address <span className="text-[#C59B63]">*</span>
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-[#869A8C] group-focus-within:text-[#2D4A3E] absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border border-[#D5CABE] bg-white/95 text-[#24362C] placeholder-[#A0AEC0] text-xs focus:ring-2 focus:ring-[#55755E]/30 focus:border-[#55755E] focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Mobile (Register Only) */}
            {isRegister && (
              <div>
                <label className="block text-[11px] font-semibold text-[#4A5D50] mb-1">
                  Mobile Number (WhatsApp)
                </label>
                <div className="relative group">
                  <Phone className="w-4 h-4 text-[#869A8C] group-focus-within:text-[#2D4A3E] absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                  <input
                    type="tel"
                    name="mobile"
                    placeholder="e.g. 9876543210"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border border-[#D5CABE] bg-white/95 text-[#24362C] placeholder-[#A0AEC0] text-xs focus:ring-2 focus:ring-[#55755E]/30 focus:border-[#55755E] focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-[#4A5D50]">
                  Password <span className="text-[#C59B63]">*</span>
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => setForgotModal(true)}
                    className="text-[11px] text-[#55755E] hover:text-[#2D4A3E] hover:underline cursor-pointer transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-[#869A8C] group-focus-within:text-[#2D4A3E] absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-9 pr-9 py-2 sm:py-2.5 rounded-xl border border-[#D5CABE] bg-white/95 text-[#24362C] placeholder-[#A0AEC0] text-xs focus:ring-2 focus:ring-[#55755E]/30 focus:border-[#55755E] focus:outline-none transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#869A8C] hover:text-[#2D4A3E] p-1 cursor-pointer transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 3D Action Button */}
            <button
              type="submit"
              disabled={loading || loginSuccess}
              className={`
                group w-full py-2.5 sm:py-3 px-5 rounded-full
                bg-[#2D4A3E] text-white font-semibold text-xs tracking-wide
                border border-[#3D6354]
                shadow-[0_8px_20px_-4px_rgba(45,74,62,0.35)]
                hover:bg-[#22392F] hover:shadow-[0_12px_24px_-4px_rgba(45,74,62,0.45)]
                hover:-translate-y-0.5 active:translate-y-0
                transition-all duration-200
                flex items-center justify-center gap-2
                disabled:opacity-70 cursor-pointer mt-2
              `}
            >
              {loginSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#E2B887] animate-bounce" />
                  <span>Success! Redirecting...</span>
                </>
              ) : loading ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E2B887] animate-dot-pulse-1" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E2B887] animate-dot-pulse-2" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E2B887] animate-dot-pulse-3" />
                  </div>
                  <span>Signing In...</span>
                </div>
              ) : (
                <>
                  <span>{isRegister ? 'Complete Registration' : 'Sign In'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E2B887] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* ========================================================================= */}
          {/* 7. TOGGLE LOGIN / REGISTER                                               */}
          {/* ========================================================================= */}
          <div className="mt-4 pt-3 border-t border-[#F0EAE1] text-center">
            <button
              type="button"
              onClick={() => {
                setErrorMessage('');
                setIsRegister(!isRegister);
              }}
              className="text-xs text-[#55695C] hover:text-[#1E2E25] font-medium transition-colors cursor-pointer"
            >
              {isRegister ? (
                <span>Already have an account? <strong className="text-[#2D4A3E] underline decoration-[#C59B63]/50">Sign In here</strong></span>
              ) : (
                <span>Don't have an account yet? <strong className="text-[#2D4A3E] underline decoration-[#C59B63]/50">Register now</strong></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. FORGOT PASSWORD MODAL                                                 */}
      {/* ========================================================================= */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 bg-[#1E2E25]/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white/95 backdrop-blur-xl border border-[#EAE3D6] p-6 shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setForgotModal(false)}
              className="absolute right-4 top-4 text-[#869A8C] hover:text-[#24362C] p-1 rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1E2E25]">Reset Your Password</h3>
              <p className="text-xs text-[#6A7E72] mt-1">
                Enter your registered email address to receive recovery instructions.
              </p>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-3.5 text-xs">
              <div className="relative group">
                <Mail className="w-4 h-4 text-[#869A8C] group-focus-within:text-[#2D4A3E] absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] text-xs focus:ring-2 focus:ring-[#55755E]/30 focus:border-[#55755E] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-[#FAF8F5] transition text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2D4A3E] hover:bg-[#1E2E25] text-white font-semibold text-xs shadow-sm hover:shadow transition cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

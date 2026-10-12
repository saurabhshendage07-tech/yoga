import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Sparkles,
  ArrowUp,
  ArrowRight,
  Compass,
  Heart,
  ShieldCheck,
  Sun,
  Flame,
  CalendarCheck
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Dynamic state loaded from backend with resilient defaults
  const [footerData, setFooterData] = useState({
    brandName: 'PRANAVEDA',
    tagline: 'Yoga & Wellness Sanctuary',
    description: 'Rooted in authentic Himalayan Vedic lineages and modern biomechanics. Empowering conscious souls to cultivate mental stillness, profound vitality, and harmonious living.',
    address: 'Ram Mandir Chowk',
    city: 'Sangli',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '416416',
    phone: '+91 98765 43210',
    email: 'namaste@pranavedayoga.com',
    whatsapp: '+91 98765 43210',
    openingHours: 'Mon - Sat: 05:30 AM - 08:30 PM | Sun: 06:00 AM - 12:00 PM (Satsang & Meditation)',
    yogaDetails: 'Daily Himalayan Hatha, dynamic Ashtanga/Vinyasa flow, and therapeutic Iyengar alignment batches led by master yogacharyas.',
    wellnessDetails: 'Personalized Ayurvedic consultation, sound bowl therapy, chakra balancing, and deep restorative Yoga Nidra.',
    retreatDetails: 'Quarterly Himalayan mountain retreats in Rishikesh & Dharamshala for immersive meditation and teacher sadhana.',
    ctaHeading: 'Begin Your Journey Within',
    ctaDescription: 'Discover balance, movement and mindful living with PranaVeda. Small batches, certified master yogis, and lifelong serenity.',
    ctaButtonText: 'Explore Our Programs',
    ctaButtonUrl: '/courses',
    socialLinks: {
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
      youtube: 'https://youtube.com',
      linkedin: 'https://linkedin.com',
      whatsapp: 'https://wa.me/919876543210'
    },
    quickLinks: [
      { name: 'Home', url: '/', enabled: true },
      { name: 'About Us & Instructors', url: '/about', enabled: true },
      { name: 'All Yoga Courses', url: '/courses', enabled: true },
      { name: 'Contact & Sanctuary Visit', url: '/contact', enabled: true },
      { name: 'Student Portal / Dashboard', url: '/dashboard', enabled: true }
    ],
    wellnessLinks: [
      { name: 'Yoga Classes & Batches', url: '/courses', enabled: true },
      { name: 'Meditation & Pranayama', url: '/courses', enabled: true },
      { name: 'Wellness Programs', url: '/courses', enabled: true },
      { name: 'Himalayan Retreats', url: '/about', enabled: true },
      { name: 'Our Sacred Philosophy', url: '/about', enabled: true }
    ],
    copyright: `© ${currentYear} PranaVeda Yoga & Wellness Sanctuary. All rights reserved.`,
    privacyPolicyUrl: '/about',
    termsUrl: '/about'
  });

  useEffect(() => {
    fetch('/api/footer')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setFooterData((prev) => ({
            ...prev,
            ...data.data,
            socialLinks: { ...prev.socialLinks, ...(data.data.socialLinks || {}) }
          }));
        }
      })
      .catch((err) => console.log('Footer config loaded with default fallback:', err));
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const cleanWhatsappNumber = (footerData.whatsapp || '').replace(/[^0-9]/g, '') || '919876543210';

  return (
    <footer className="relative bg-[#12231B] text-[#D8E2DA] overflow-hidden w-full max-w-full box-border border-t border-[#233B2E]">
      {/* ========================================================= */}
      {/* 1. LUXURY BACKGROUND ART & AMBIENT GLOWS                 */}
      {/* ========================================================= */}
      {/* Subtle radial emerald & gold lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[350px] bg-[#2D4A3E]/30 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-10 w-[450px] h-[350px] bg-[#E2B887]/8 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Large Himalayan Lotus Watermark */}
      <div className="absolute -right-16 top-1/3 w-96 h-96 opacity-[0.035] pointer-events-none select-none -z-0">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-full h-full text-[#E2B887]">
          <circle cx="100" cy="100" r="95" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="75" />
          <path d="M100 20 C110 50 140 70 140 100 C140 130 110 150 100 180 C90 150 60 130 60 100 C60 70 90 50 100 20 Z" />
          <path d="M20 100 C50 110 70 140 100 140 C130 140 150 110 180 100 C150 90 130 60 100 60 C70 60 50 90 20 100 Z" />
          <path d="M43 43 C70 60 90 90 100 100 C110 110 140 130 157 157 C130 140 110 110 100 100 C90 90 60 70 43 43 Z" />
          <path d="M157 43 C140 70 110 90 100 100 C90 110 70 140 43 157 C60 130 90 110 100 100 C110 90 130 60 157 43 Z" />
        </svg>
      </div>

      {/* Subtle Botanical Leaf Accent (Left Edge) */}
      <div className="absolute -left-12 bottom-12 w-64 h-64 opacity-[0.03] pointer-events-none select-none -z-0">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-[#7E9A82]">
          <path d="M50 0 C60 30 90 40 100 50 C70 60 60 90 50 100 C40 70 10 60 0 50 C30 40 40 10 50 0 Z" />
        </svg>
      </div>

      {/* ========================================================= */}
      {/* 2. PRE-FOOTER PROMOTIONAL CTA SECTION                     */}
      {/* ========================================================= */}
      <div className="relative z-10 border-b border-[#233B2E]/90 bg-gradient-to-r from-[#172D22]/80 via-[#1A3327]/90 to-[#172D22]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-[#E2B887]/20 shadow-2xl relative overflow-hidden group">
            {/* Ambient gold shimmer */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#E2B887]/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
            
            <div className="space-y-2 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E2B887]/15 border border-[#E2B887]/30 text-[#E2B887] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#E2B887] animate-pulse" />
                <span>Himalayan Yoga & Meditation Sanctuary</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#FBF9F5] tracking-tight">
                {footerData.ctaHeading}
              </h2>
              <p className="text-xs sm:text-sm text-[#A8BDB0] font-light leading-relaxed">
                {footerData.ctaDescription}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to={footerData.ctaButtonUrl || '/courses'}
                className="yoga-btn-gold w-full sm:w-auto !py-3 !px-7 !text-xs !shadow-lg hover:!shadow-xl text-center font-bold tracking-wide"
              >
                <span>{footerData.ctaButtonText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-semibold text-[#E8ECE9] hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 transition text-center"
              >
                Schedule Studio Visit
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. INTERACTIVE ELEVATED SANCTUARY CARDS (Quick Info)       */}
      {/* ========================================================= */}
      <div className="relative z-10 border-b border-[#233B2E]/60 py-8 bg-[#15271E]/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Sanctuary Location */}
            <div className="group p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-[#E2B887]/40 shadow-sm transition-all duration-350 transform hover:-translate-y-1.5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#2D4A3E]/80 border border-[#486D5B] text-[#E2B887] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition duration-300 shadow-md">
                <MapPin className="w-5 h-5 text-[#E2B887]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-sm text-[#FBF9F5] group-hover:text-[#E2B887] transition-colors">
                  Sanctuary Studio
                </h4>
                <p className="text-xs text-[#A8BDB0] leading-relaxed line-clamp-2">
                  {footerData.address}, {footerData.city}
                </p>
                <a
                  href="https://maps.google.com/?q=Ram+Mandir+Chowk,+Sangli,+Maharashtra"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E2B887] hover:underline pt-0.5"
                >
                  <span>Get Directions ↗</span>
                </a>
              </div>
            </div>

            {/* Card 2: Helpline & WhatsApp */}
            <div className="group p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-[#25D366]/40 shadow-sm transition-all duration-350 transform hover:-translate-y-1.5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#2D4A3E]/80 border border-[#486D5B] text-[#25D366] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition duration-300 shadow-md">
                <MessageSquare className="w-5 h-5 text-[#25D366]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-sm text-[#FBF9F5] group-hover:text-[#25D366] transition-colors">
                  Helpline & WhatsApp
                </h4>
                <p className="text-xs text-[#A8BDB0]">
                  {footerData.phone} • {footerData.email}
                </p>
                <a
                  href={`https://wa.me/${cleanWhatsappNumber}?text=Namaste!%20I%20would%20like%20to%20know%20more%20about%20PranaVeda%20Yoga%20classes.`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#25D366] hover:underline pt-0.5"
                >
                  <span>Chat on WhatsApp Directly ↗</span>
                </a>
              </div>
            </div>

            {/* Card 3: Class Hours */}
            <div className="group p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-[#E2B887]/40 shadow-sm transition-all duration-350 transform hover:-translate-y-1.5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#2D4A3E]/80 border border-[#486D5B] text-[#E2B887] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition duration-300 shadow-md">
                <Clock className="w-5 h-5 text-[#E2B887]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-sm text-[#FBF9F5] group-hover:text-[#E2B887] transition-colors">
                  Daily Batch Timings
                </h4>
                <p className="text-xs text-[#A8BDB0] leading-snug">
                  {footerData.openingHours}
                </p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E2B887] hover:underline pt-0.5"
                >
                  <span>View All Batch Slots →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. MAIN 4-COLUMN FOOTER NAVIGATION LAYOUT                 */}
      {/* ========================================================= */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* COLUMN 1: Brand, Mission & Social (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              {/* Animated 3D/Gold Logo Badge */}
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2D4A3E] to-[#1A3025] p-2 flex items-center justify-center border border-[#E2B887]/40 shadow-lg group-hover:scale-105 group-hover:border-[#E2B887] transition duration-300">
                <img src="/logo.svg" alt="PranaVeda Sanctuary Logo" className="w-full h-full object-contain" />
                <div className="absolute inset-0 rounded-2xl bg-[#E2B887]/10 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none" />
              </div>
              <div>
                <span className="font-heading font-bold text-xl tracking-wider text-[#FBF9F5] block leading-none group-hover:text-[#E2B887] transition-colors">
                  {footerData.brandName}
                </span>
                <span className="text-[10px] tracking-widest text-[#A3B8A8] uppercase font-medium block mt-1">
                  {footerData.tagline}
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#A8BDB0] leading-relaxed font-light">
              {footerData.description}
            </p>

            {/* Social Media Icons with Premium Glow */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7E9A82] block">
                Connect With Us
              </span>
              <div className="flex items-center gap-2.5">
                {footerData.socialLinks?.instagram && (
                  <a
                    href={footerData.socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-[#E2B887] text-[#D8E2DA] hover:text-[#12231B] border border-white/10 hover:border-[#E2B887] flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:-translate-y-0.5 shadow-xs"
                    aria-label="Instagram"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}

                {footerData.socialLinks?.facebook && (
                  <a
                    href={footerData.socialLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-[#E2B887] text-[#D8E2DA] hover:text-[#12231B] border border-white/10 hover:border-[#E2B887] flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:-translate-y-0.5 shadow-xs"
                    aria-label="Facebook"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}

                {footerData.socialLinks?.youtube && (
                  <a
                    href={footerData.socialLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-[#E2B887] text-[#D8E2DA] hover:text-[#12231B] border border-white/10 hover:border-[#E2B887] flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:-translate-y-0.5 shadow-xs"
                    aria-label="YouTube"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}

                {footerData.socialLinks?.linkedin && (
                  <a
                    href={footerData.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-[#E2B887] text-[#D8E2DA] hover:text-[#12231B] border border-white/10 hover:border-[#E2B887] flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:-translate-y-0.5 shadow-xs"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                )}

                <a
                  href={`https://wa.me/${cleanWhatsappNumber}?text=Namaste%20PranaVeda%20Team!`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-slate-900 border border-[#25D366]/40 flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:-translate-y-0.5 shadow-xs"
                  aria-label="WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#FBF9F5] tracking-wider uppercase flex items-center gap-1.5 border-b border-[#2C4436] pb-2.5">
              <span>Quick Links</span>
            </h3>

            <ul className="space-y-2.5 text-xs text-[#A8BDB0]">
              {(footerData.quickLinks || []).filter(l => l.enabled !== false).map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.url}
                    className="hover:text-[#E2B887] transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#55755E] group-hover:bg-[#E2B887] group-hover:scale-125 transition-all" />
                    <span className="transform group-hover:translate-x-0.5 transition-transform">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: Yoga & Wellness (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#FBF9F5] tracking-wider uppercase flex items-center gap-1.5 border-b border-[#2C4436] pb-2.5">
              <span>Yoga & Wellness</span>
            </h3>

            <ul className="space-y-2.5 text-xs text-[#A8BDB0]">
              {(footerData.wellnessLinks || []).filter(l => l.enabled !== false).map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.url}
                    className="hover:text-[#E2B887] transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#55755E] group-hover:bg-[#E2B887] group-hover:scale-125 transition-all" />
                    <span className="transform group-hover:translate-x-0.5 transition-transform">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {footerData.wellnessDetails && (
              <div className="pt-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-[#8EA395] leading-relaxed italic">
                "{footerData.wellnessDetails}"
              </div>
            )}
          </div>

          {/* COLUMN 4: Contact / Visit Us (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#FBF9F5] tracking-wider uppercase flex items-center gap-1.5 border-b border-[#2C4436] pb-2.5">
              <span>Visit Sanctuary</span>
            </h3>

            <div className="space-y-3 text-xs text-[#A8BDB0]">
              {/* Address */}
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E2B887] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {footerData.address}, {footerData.city}, {footerData.state} {footerData.postalCode ? `- ${footerData.postalCode}` : ''}
                </span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E2B887] shrink-0" />
                <a href={`tel:${footerData.phone}`} className="hover:text-[#E2B887] transition-colors">
                  {footerData.phone}
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E2B887] shrink-0" />
                <a href={`mailto:${footerData.email}`} className="hover:text-[#E2B887] transition-colors">
                  {footerData.email}
                </a>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-[#E2B887] shrink-0 mt-0.5" />
                <span className="leading-snug text-[#8FA895]">
                  {footerData.openingHours}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. FOOTER BOTTOM COPYRIGHT & LEGAL BAR                    */}
      {/* ========================================================= */}
      <div className="relative z-10 border-t border-[#233B2E] bg-[#0E1C15]/70 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7E9A82]">
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
            <span>{footerData.copyright}</span>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="flex items-center gap-1">
              <span>Mindfully crafted with</span>
              <Heart className="w-3.5 h-3.5 text-[#D97757] fill-current" />
              <span>for conscious wellness.</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to={footerData.privacyPolicyUrl || '/about'}
              className="hover:text-[#E2B887] transition-colors text-xs"
            >
              Privacy Policy
            </Link>
            <span className="text-white/20">|</span>
            <Link
              to={footerData.termsUrl || '/about'}
              className="hover:text-[#E2B887] transition-colors text-xs"
            >
              Terms of Sanctuary
            </Link>
            <span className="text-white/20">|</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] hover:bg-[#E2B887] text-[#D8E2DA] hover:text-[#12231B] border border-white/10 hover:border-[#E2B887] transition duration-300 transform hover:-translate-y-0.5 cursor-pointer text-[11px] font-semibold"
              title="Back to top"
            >
              <span>Top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
}

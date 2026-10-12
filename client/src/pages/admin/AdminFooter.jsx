import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  Save,
  RotateCcw,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Globe,
  Share2,
  Compass,
  CheckCircle2,
  ExternalLink,
  Layers,
  HeartHandshake,
  ShieldCheck,
  Flame,
  ArrowRight
} from 'lucide-react';
import { getFooterSettings, saveFooterSettings } from '../../services/settingService';

export default function AdminFooter() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [footer, setFooter] = useState({
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
    copyright: '© 2026 PranaVeda Yoga & Wellness Sanctuary. All rights reserved.',
    privacyPolicyUrl: '/about',
    termsUrl: '/about'
  });

  const fetchFooterSettings = async () => {
    setFetching(true);
    try {
      const data = await getFooterSettings();
      if (data) {
        setFooter(prev => ({
          ...prev,
          ...data,
          socialLinks: { ...prev.socialLinks, ...(data.socialLinks || {}) }
        }));
      }
    } catch (err) {
      console.error('Error loading footer settings:', err);
      showToast('Could not load current footer settings', 'error');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchFooterSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveFooterSettings(footer);
      showToast('Footer updated in Firestore successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Error updating footer settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLinkChange = (index, field, value) => {
    const updated = [...footer.quickLinks];
    updated[index] = { ...updated[index], [field]: value };
    setFooter({ ...footer, quickLinks: updated });
  };

  const handleWellnessLinkChange = (index, field, value) => {
    const updated = [...footer.wellnessLinks];
    updated[index] = { ...updated[index], [field]: value };
    setFooter({ ...footer, wellnessLinks: updated });
  };

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE9DF] text-[#2D4A3E] text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C59B63]" />
            <span>Website Layout & Dynamic Content</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#24362C]">
            Footer Management
          </h1>
          <p className="text-xs text-[#6A7E72] mt-0.5">
            Configure dynamic brand info, studio location, yoga offerings, social URLs, pre-footer CTA, and copyright metadata across the public website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white border border-[#D5CABE] text-[#2D4A3E] text-xs font-semibold hover:bg-[#FBF9F5] transition flex items-center gap-1.5 shadow-xs"
          >
            <span>Preview Public Footer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {fetching ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E1DBD1] space-y-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-[#EFE9DF] mx-auto" />
          <p className="text-xs text-[#6A7E72]">Loading live footer configuration...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* ========================================================= */}
          {/* 1. BRAND INFORMATION                                      */}
          {/* ========================================================= */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1DBD1] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
              <h2 className="text-base font-serif font-bold text-[#24362C] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#55755E]" />
                Brand Information & Tagline
              </h2>
              <span className="text-[10px] text-[#869A8C] uppercase tracking-wider font-semibold">
                Column 1 Data
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Brand Name</label>
                <input
                  type="text"
                  value={footer.brandName}
                  onChange={(e) => setFooter({ ...footer, brandName: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Footer Tagline</label>
                <input
                  type="text"
                  value={footer.tagline}
                  onChange={(e) => setFooter({ ...footer, tagline: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#4A5D50] font-semibold mb-1">Footer Brand Story / Description</label>
              <textarea
                rows="3"
                value={footer.description}
                onChange={(e) => setFooter({ ...footer, description: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. CONTACT & SANCTUARY LOCATION                          */}
          {/* ========================================================= */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1DBD1] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
              <h2 className="text-base font-serif font-bold text-[#24362C] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#55755E]" />
                Contact & Sanctuary Location
              </h2>
              <span className="text-[10px] text-[#869A8C] uppercase tracking-wider font-semibold">
                Column 4 & Interactive Cards
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[#4A5D50] font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  value={footer.address}
                  onChange={(e) => setFooter({ ...footer, address: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">City</label>
                <input
                  type="text"
                  value={footer.city}
                  onChange={(e) => setFooter({ ...footer, city: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">State & Postal Code</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="State"
                    value={footer.state}
                    onChange={(e) => setFooter({ ...footer, state: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={footer.postalCode || ''}
                    onChange={(e) => setFooter({ ...footer, postalCode: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Phone Helpline</label>
                <input
                  type="text"
                  value={footer.phone}
                  onChange={(e) => setFooter({ ...footer, phone: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Official Email</label>
                <input
                  type="email"
                  value={footer.email}
                  onChange={(e) => setFooter({ ...footer, email: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">WhatsApp Desk Number / Link</label>
                <input
                  type="text"
                  value={footer.whatsapp}
                  onChange={(e) => setFooter({ ...footer, whatsapp: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Opening Hours & Schedule</label>
                <input
                  type="text"
                  value={footer.openingHours}
                  onChange={(e) => setFooter({ ...footer, openingHours: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. YOGA & WELLNESS DETAILS                                */}
          {/* ========================================================= */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1DBD1] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
              <h2 className="text-base font-serif font-bold text-[#24362C] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#55755E]" />
                Yoga, Healing & Retreat Offerings
              </h2>
              <span className="text-[10px] text-[#869A8C] uppercase tracking-wider font-semibold">
                Column 3 Details
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Yoga Classes Details</label>
                <input
                  type="text"
                  value={footer.yogaDetails}
                  onChange={(e) => setFooter({ ...footer, yogaDetails: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Wellness & Healing Description</label>
                <input
                  type="text"
                  value={footer.wellnessDetails}
                  onChange={(e) => setFooter({ ...footer, wellnessDetails: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Himalayan Retreats Information</label>
                <input
                  type="text"
                  value={footer.retreatDetails}
                  onChange={(e) => setFooter({ ...footer, retreatDetails: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. PRE-FOOTER CALL TO ACTION (CTA)                       */}
          {/* ========================================================= */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1DBD1] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
              <h2 className="text-base font-serif font-bold text-[#24362C] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C59B63]" />
                Pre-Footer Call to Action (CTA)
              </h2>
              <span className="text-[10px] text-[#869A8C] uppercase tracking-wider font-semibold">
                Promotional Header Bar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[#4A5D50] font-semibold mb-1">CTA Main Heading</label>
                <input
                  type="text"
                  value={footer.ctaHeading}
                  onChange={(e) => setFooter({ ...footer, ctaHeading: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs font-serif font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#4A5D50] font-semibold mb-1">CTA Supporting Description</label>
                <input
                  type="text"
                  value={footer.ctaDescription}
                  onChange={(e) => setFooter({ ...footer, ctaDescription: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={footer.ctaButtonText}
                  onChange={(e) => setFooter({ ...footer, ctaButtonText: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">CTA Button Link / Path</label>
                <input
                  type="text"
                  value={footer.ctaButtonUrl}
                  onChange={(e) => setFooter({ ...footer, ctaButtonUrl: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 5. SOCIAL MEDIA CHANNELS                                 */}
          {/* ========================================================= */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1DBD1] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
              <h2 className="text-base font-serif font-bold text-[#24362C] flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#55755E]" />
                Social Media Channels
              </h2>
              <span className="text-[10px] text-[#869A8C] uppercase tracking-wider font-semibold">
                Glowing Icon Links
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Instagram Profile URL</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={footer.socialLinks?.instagram || ''}
                  onChange={(e) => setFooter({
                    ...footer,
                    socialLinks: { ...footer.socialLinks, instagram: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Facebook Page URL</label>
                <input
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={footer.socialLinks?.facebook || ''}
                  onChange={(e) => setFooter({
                    ...footer,
                    socialLinks: { ...footer.socialLinks, facebook: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">YouTube Channel URL</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/..."
                  value={footer.socialLinks?.youtube || ''}
                  onChange={(e) => setFooter({
                    ...footer,
                    socialLinks: { ...footer.socialLinks, youtube: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">LinkedIn Page URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/..."
                  value={footer.socialLinks?.linkedin || ''}
                  onChange={(e) => setFooter({
                    ...footer,
                    socialLinks: { ...footer.socialLinks, linkedin: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 6. COPYRIGHT & LEGAL                                     */}
          {/* ========================================================= */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1DBD1] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
              <h2 className="text-base font-serif font-bold text-[#24362C] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#55755E]" />
                Copyright & Legal Bar
              </h2>
              <span className="text-[10px] text-[#869A8C] uppercase tracking-wider font-semibold">
                Bottom Bar Metadata
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-[#4A5D50] font-semibold mb-1">Copyright Notice Text</label>
                <input
                  type="text"
                  value={footer.copyright}
                  onChange={(e) => setFooter({ ...footer, copyright: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Privacy Policy Route</label>
                <input
                  type="text"
                  value={footer.privacyPolicyUrl || '/about'}
                  onChange={(e) => setFooter({ ...footer, privacyPolicyUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Terms of Service Route</label>
                <input
                  type="text"
                  value={footer.termsUrl || '/about'}
                  onChange={(e) => setFooter({ ...footer, termsUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Save Action Sticky / Float Bar */}
          <div className="sticky bottom-4 z-20 p-4 rounded-2xl glass-card bg-white/95 border border-[#D5CABE] shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#55695C]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Changes immediately synchronize with the live website footer.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchFooterSettings}
                className="px-4 py-2.5 rounded-xl border border-[#D5CABE] text-[#4A5D50] hover:bg-[#FBF9F5] font-semibold text-xs transition"
              >
                Discard Changes
              </button>

              <button
                type="submit"
                disabled={loading}
                className="yoga-btn-primary !py-2.5 !px-6 !text-xs !rounded-xl shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-[#E2B887]" />
                <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

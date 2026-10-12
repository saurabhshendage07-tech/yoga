import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Send,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { addContactMessage } from '../services/contactService';

export default function Contact() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    subject: 'General Yoga Inquiry',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showToast('Please fill in your name, email, and message.', 'error');
      return;
    }

    setLoading(true);
    try {
      await addContactMessage(formData);

      setSubmitted(true);
      showToast('Inquiry sent successfully to sanctuary! Our team will contact you shortly.', 'success');
      setFormData({
        name: '',
        email: '',
        mobile: '',
        subject: 'General Yoga Inquiry',
        message: ''
      });
    } catch (err) {
      showToast(err.message || 'Error submitting inquiry. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-16 space-y-20 relative w-full max-w-full overflow-hidden box-border">
      {/* Background ambient blobs */}
      <div className="absolute top-10 right-[-8%] w-[450px] h-[450px] rounded-full bg-[#7C9A82]/10 blur-3xl pointer-events-none -z-10 animate-blob-slow" />
      <div className="absolute top-[45%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#E5B887]/15 blur-3xl pointer-events-none -z-10 animate-blob-slower" />

      {/* Header */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFE9DF] text-[#2D4A3E] text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#C59B63]" />
          <span>We are Here to Guide Your Path</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#20342A] tracking-tight">
          Connect with Our Sanctuary
        </h1>
        <div className="heading-accent-line" />
        <p className="text-sm sm:text-base text-[#55695C] max-w-xl mx-auto font-light leading-relaxed">
          Have questions regarding batch timings, private 1-on-1 therapeutic guidance, or visiting our peaceful physical studio? Send us a message anytime.
        </p>
      </section>

      {/* Grid: Contact Info & Form */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Contact Cards & Quick WhatsApp */}
          <div className="lg:col-span-5 space-y-6">
            <div className="yoga-card yoga-card-sage p-6 sm:p-8 space-y-6">
              <div className="yoga-card-side-accent" />
              <h2 className="text-xl font-serif font-bold text-[#24362C]">Studio Information</h2>

              <div className="space-y-4 text-xs sm:text-sm text-[#4A5D50]">
                {/* Location */}
                <div className="flex items-start gap-3.5 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-[#EFE9DF] text-[#2D4A3E] flex items-center justify-center shrink-0 mt-0.5 icon-box shadow-xs group-hover:-translate-y-1 transition duration-300">
                    <MapPin className="w-4 h-4 text-[#55755E]" />
                  </div>
                  <div>
                    <strong className="block text-[#24362C] font-serif">Studio Sanctuary Address:</strong>
                    <span className="text-[#6A7E72] leading-relaxed">
                      Ram Mandir Chowk, Sangli, Maharashtra - 416416
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3.5 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-[#EFE9DF] text-[#2D4A3E] flex items-center justify-center shrink-0 mt-0.5 icon-box shadow-xs group-hover:scale-110 transition duration-300">
                    <Phone className="w-4 h-4 text-[#55755E] group-hover:animate-pulse" />
                  </div>
                  <div>
                    <strong className="block text-[#24362C] font-serif">Helpline & WhatsApp Desk:</strong>
                    <span className="text-[#6A7E72] font-medium">+91 98765 43210</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-[#EFE9DF] text-[#2D4A3E] flex items-center justify-center shrink-0 mt-0.5 icon-box shadow-xs group-hover:-translate-y-0.5 transition duration-300">
                    <Mail className="w-4 h-4 text-[#55755E]" />
                  </div>
                  <div>
                    <strong className="block text-[#24362C] font-serif">Email:</strong>
                    <span className="text-[#6A7E72]">namaste@pranavedayoga.com</span>
                  </div>
                </div>

                {/* Timings */}
                <div className="flex items-start gap-3.5 group">
                  <div className="w-10 h-10 rounded-xl bg-[#EFE9DF] text-[#2D4A3E] flex items-center justify-center shrink-0 mt-0.5 icon-box shadow-xs">
                    <Clock className="w-4 h-4 text-[#55755E]" />
                  </div>
                  <div>
                    <strong className="block text-[#24362C] font-serif">Studio Class Timings:</strong>
                    <span className="text-[#6A7E72] block">Monday - Saturday: 05:30 AM - 08:30 PM</span>
                    <span className="text-[#869A8C] text-xs">Sunday: 06:00 AM - 12:00 PM (Satsang & Meditation)</span>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Action */}
              <div className="pt-2">
                <a
                  href="https://wa.me/919876543210?text=Namaste%20PranaVeda%20Yoga%20Team!%20I%20would%20like%20to%20know%20more%20about%20your%20classes."
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#25D366] text-slate-900 text-xs font-bold shadow-md hover:bg-[#20bd5a] hover:shadow-lg transform hover:-translate-y-0.5 transition duration-300 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp Directly</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="yoga-card yoga-card-gold p-8 sm:p-10 space-y-6">
              <div className="yoga-card-side-accent" />
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#24362C]">Send Us an Inquiry</h2>
                <p className="text-xs text-[#6A7E72] mt-1">
                  Leave your details and message below. We typically respond within a few hours.
                </p>
              </div>

              {submitted && (
                <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-3 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="font-bold">Thank you for your message!</p>
                    <p className="text-[11px] text-green-700">Our wellness counselor will get in touch with you shortly.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#4A5D50] font-semibold mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Iyer"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[#4A5D50] font-semibold mb-1">Email Address *</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#4A5D50] font-semibold mb-1">Mobile / WhatsApp Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[#4A5D50] font-semibold mb-1">Inquiry Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                    >
                      <option value="General Yoga Inquiry">General Yoga Inquiry</option>
                      <option value="Beginner Batch Timing">Beginner Batch Timing</option>
                      <option value="1-on-1 Personal Training">1-on-1 Personal Training</option>
                      <option value="Corporate / Group Wellness">Corporate / Group Wellness</option>
                      <option value="Studio Location & Parking">Studio Location & Parking</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Your Message *</label>
                  <textarea
                    rows="4"
                    placeholder="Tell us about your fitness background, any questions, or health goals..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition shadow-xs"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="yoga-btn-primary px-8 py-3 rounded-full text-white text-xs font-bold tracking-wide shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? 'Submitting...' : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps Location Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="yoga-card rounded-3xl overflow-hidden p-2 shadow-lg">
          <div className="p-4 bg-[#FBF9F5] flex items-center justify-between border-b border-[#EAE3D6] rounded-t-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2D4A3E]">
              <MapPin className="w-4 h-4 text-[#55755E]" />
              <span>Studio Location (Ram Mandir Chowk, Sangli, Maharashtra)</span>
            </div>
            <a
              href="https://maps.google.com/?q=Ram+Mandir+Chowk,+Sangli,+Maharashtra"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold text-[#55755E] hover:underline"
            >
              Open in Google Maps ↗
            </a>
          </div>
          <iframe
            title="PranaVeda Yoga Sanctuary Map - Sangli"
            src="https://maps.google.com/maps?q=Ram+Mandir+Chowk,+Sangli,+Maharashtra&t=&z=16&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="360"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full rounded-b-2xl"
          ></iframe>
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Award,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Users,
  Sun,
  Flame,
  ArrowRight,
  Heart,
  Feather
} from 'lucide-react';

export default function About({ onOpenEnroll }) {
  const instructors = [
    {
      name: "Acharya Ananya Sharma",
      role: "Founder & Lead Hatha Yoga Master",
      experience: "14+ Years of Dedicated Teaching",
      certifications: ["E-RYT 500 Yoga Alliance", "M.Sc. Yogic Sciences (SVYASA)", "Ayurvedic Lifestyle Consultant"],
      specialization: "Classical Hatha, Yoga Therapy & Therapeutic Pranayama",
      bio: "Trained in classical ashrams in Rishikesh and Mysore, Acharya Ananya combines ancient Vedic meditation with precision biomechanics. She has mentored over 8,000 students globally to restore physical vitality and mental stillness.",
      image: "/assets/instructor-lead.jpg",
      accent: "yoga-card-gold"
    },
    {
      name: "Yogacharya Rohan Verma",
      role: "Senior Ashtanga & Vinyasa Specialist",
      experience: "10+ Years Experience",
      certifications: ["RYT 500 Certified", "Mysore Ashtanga Lineage", "Sports Biomechanics Specialist"],
      specialization: "Dynamic Vinyasa Flow, Arm Balances & Mobility Biomechanics",
      bio: "Rohan brings invigorating energy and laser focus to every class. His structured methods demystify handstands and inversions while protecting shoulders and wrists.",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      accent: "yoga-card-sage"
    },
    {
      name: "Priya Nair",
      role: "Holistic Health & Power Yoga Coach",
      experience: "8+ Years Experience",
      certifications: ["RYT 200 Yoga Alliance", "Certified Holistic Nutritionist", "Pre/Post-Natal Yoga Specialist"],
      specialization: "Weight Management, Core Power & Women's Health",
      bio: "Priya combines energetic metabolic conditioning with mindful breathwork. Her vibrant teaching inspires consistency, fat loss, and sustainable lifestyle habits.",
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
      accent: "yoga-card-peach"
    },
    {
      name: "Meera Krishnan",
      role: "Restorative Yoga & Sound Healing Therapist",
      experience: "7+ Years Experience",
      certifications: ["Certified Sound Healing Master (Tibetan Singing Bowls)", "Yin Yoga Certified (100h)", "Reiki Master"],
      specialization: "Restorative Yin Yoga, Sound Bath & Yoga Nidra",
      bio: "Meera curates deeply meditative soundscapes and restorative postures that soothe adrenal fatigue, dissolve anxiety, and induce profound cellular rejuvenation.",
      image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=800&q=80",
      accent: "yoga-card-purple"
    }
  ];

  return (
    <div className="py-8 sm:py-16 space-y-24 relative w-full max-w-full overflow-hidden box-border">
      {/* Ambient background decorative blobs */}
      <div className="absolute top-10 right-[-8%] w-[450px] h-[450px] rounded-full bg-[#7C9A82]/10 blur-3xl pointer-events-none -z-10 animate-blob-slow" />
      <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#E5B887]/15 blur-3xl pointer-events-none -z-10 animate-blob-slower" />
      <div className="absolute bottom-20 right-[-5%] w-[420px] h-[420px] rounded-full bg-[#C9B8DB]/15 blur-3xl pointer-events-none -z-10 animate-blob-reverse" />

      {/* Header Hero */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center space-y-5 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFE9DF] text-[#2D4A3E] text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#C59B63]" />
          <span>Our Sacred Roots & Living Philosophy</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#20342A] leading-tight tracking-tight">
          Nurturing Body, Calming Mind & Awakening Consciousness
        </h1>
        <div className="heading-accent-line" />
        <p className="text-base sm:text-lg text-[#55695C] max-w-3xl mx-auto leading-relaxed font-sans font-light">
          Founded on the timeless wisdom of traditional Himalayan lineages and the physiological rigor of modern biomechanics, PranaVeda is a tranquil sanctuary dedicated to holistic human flourishing.
        </p>
      </section>

      {/* Mission & Vision Cards */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="yoga-card yoga-card-gold p-8 sm:p-10 space-y-5 group">
            <div className="yoga-card-side-accent" />
            <div className="w-14 h-14 rounded-2xl bg-[#FBF5EC] text-[#C59B63] flex items-center justify-center icon-box shadow-xs">
              <Sun className="w-7 h-7 text-[#C59B63]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#24362C]">Our Sacred Mission</h2>
            <p className="text-sm text-[#55695C] leading-relaxed">
              To make authentic, non-dogmatic, and therapeutic yoga accessible to people of all fitness levels and backgrounds. We empower each practitioner with practical tools to relieve chronic tension, cultivate mental clarity, and discover deep inner stillness.
            </p>
          </div>

          <div className="yoga-card yoga-card-sage p-8 sm:p-10 space-y-5 group">
            <div className="yoga-card-side-accent" />
            <div className="w-14 h-14 rounded-2xl bg-[#EDF3EF] text-[#2D4A3E] flex items-center justify-center icon-box shadow-xs">
              <Compass className="w-7 h-7 text-[#55755E]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#24362C]">Our Vision</h2>
            <p className="text-sm text-[#55695C] leading-relaxed">
              To be the most trusted holistic yoga sanctuary where ancient Vedic teachings harmonize with personalized individual care, cultivating a compassionate global community living with vitality, presence, and purpose.
            </p>
          </div>
        </div>
      </section>

      {/* Teaching Philosophy & Class Environment */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="yoga-card rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-semibold tracking-widest text-[#55755E] uppercase bg-[#EFE9DF] px-3 py-1 rounded-full">
              Our Core Principles
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#20342A]">
              The PranaVeda Teaching Philosophy
            </h2>
            <div className="heading-accent-line" style={{ margin: '0 0 1rem 0' }} />
            <p className="text-sm text-[#55695C] leading-relaxed">
              We believe yoga is not a competitive performance of contortionism; it is the sacred art of tuning into your body's innate wisdom, breath, and natural healing capacity.
            </p>
            <ul className="space-y-3.5 text-xs sm:text-sm text-[#4A5D50]">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#55755E] shrink-0 mt-0.5" />
                <span><strong>Sthira Sukham Asanam:</strong> Cultivating steady strength effortlessly balanced with ease.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#55755E] shrink-0 mt-0.5" />
                <span><strong>Breath-Led Movement:</strong> Conscious Prana flow resetting the autonomic nervous system.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#55755E] shrink-0 mt-0.5" />
                <span><strong>Anatomical Safety:</strong> Precision prop alignment protecting every joint and lumbar disc.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#55755E] shrink-0 mt-0.5" />
                <span><strong>Warm, Zero-Judgment Space:</strong> Honoring your individual pace with loving kindness.</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden shadow-md aspect-square group">
              <img
                src="/assets/hero-banner.jpg"
                alt="Studio Sanctuary Environment"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-md aspect-square group">
              <img
                src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80"
                alt="Yoga Props, Blankets and Mats"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Instructors Profiles */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold tracking-widest text-[#55755E] uppercase bg-[#EFE9DF] px-3.5 py-1 rounded-full">
            Master Faculty
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#20342A]">
            Meet Our Dedicated Yoga Masters
          </h2>
          <div className="heading-accent-line" />
          <p className="text-sm text-[#6A7E72] max-w-xl mx-auto">
            Experienced lifelong practitioners dedicated to guiding your personal transformation with wisdom and empathy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {instructors.map((inst, idx) => (
            <div
              key={idx}
              className={`yoga-card ${inst.accent} p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start group`}
            >
              <div className="yoga-card-side-accent" />
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shrink-0 shadow-md border-2 border-[#EAE3D6] relative">
                <img
                  src={inst.image}
                  alt={inst.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#24362C] group-hover:text-[#2D4A3E] transition">
                    {inst.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#55755E]">{inst.role}</p>
                  <p className="text-[11px] text-[#869A8C] mt-0.5">{inst.experience}</p>
                </div>

                {/* Certifications badges */}
                <div className="flex flex-wrap gap-1.5">
                  {inst.certifications.map((cert, cidx) => (
                    <span
                      key={cidx}
                      className="px-2.5 py-0.5 bg-[#EFE9DF] text-[#2D4A3E] text-[10px] font-medium rounded-full"
                    >
                      {cert}
                    </span>
                  ))}
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-[#2D4A3E]">
                    Specialization: <span className="font-normal text-[#55695C]">{inst.specialization}</span>
                  </p>
                </div>

                <p className="text-xs text-[#6A7E72] leading-relaxed pt-1">
                  {inst.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
        <div className="p-8 sm:p-14 rounded-3xl bg-[#2D4A3E] text-white shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-tight">
            Ready to Begin Your Transformative Journey?
          </h2>
          <p className="text-xs sm:text-base text-[#D8E2DA] max-w-xl mx-auto font-light">
            Join thousands of inspired practitioners in our morning, evening, and weekend live batches.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onOpenEnroll ? onOpenEnroll() : null}
              className="yoga-btn-gold px-9 py-3.5 text-xs font-bold rounded-full shadow-lg cursor-pointer"
            >
              Enroll in a Batch Today
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

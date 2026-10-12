import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import YogaBenefitsSection from '../components/home/YogaBenefitsSection';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
  HeartHandshake,
  CheckCircle2,
  CalendarCheck,
  Star,
  Activity,
  Flame,
  Moon,
  Brain,
  Smile,
  Compass,
  Zap,
  Check,
  ChevronDown,
  HelpCircle,
  Clock,
  Calendar
} from 'lucide-react';
import { getCourses } from '../services/courseService';
import { getTestimonials } from '../services/testimonialService';
import { initialCourses, initialTestimonials } from '../services/mockData';

export default function Home({ onOpenEnroll }) {
  const [courses, setCourses] = useState(initialCourses);
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [loading, setLoading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getCourses({ includeInactive: false }).catch(() => initialCourses),
      getTestimonials({ onlyApproved: true }).catch(() => initialTestimonials)
    ])
      .then(([coursesData, testimonialsData]) => {
        if (coursesData && coursesData.length > 0) {
          setCourses(coursesData);
        }
        if (testimonialsData && testimonialsData.length > 0) {
          setTestimonials(testimonialsData);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const popularCourses = courses.slice(0, 3);

  const instructors = [
    {
      name: 'Acharya Ananya Sharma',
      role: 'Founder & Lead Hatha Yoga Master',
      experience: '14+ Years Teaching',
      certs: 'E-RYT 500 | M.Sc. Yogic Sciences',
      image: '/assets/instructor-lead.jpg',
      bio: 'Deeply grounded in traditional Vedic lineages, Acharya Ananya brings mindful biomechanics and therapeutic alignment.'
    },
    {
      name: 'Yogacharya Rohan Verma',
      role: 'Senior Ashtanga & Vinyasa Specialist',
      experience: '10+ Years Teaching',
      certs: 'RYT 500 | Mysore Ashtanga Tradition',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
      bio: 'Master of arm balances, mobility, and fluid transitions that build unshakeable core strength.'
    },
    {
      name: 'Priya Nair',
      role: 'Holistic Health & Power Yoga Coach',
      experience: '8+ Years Teaching',
      certs: 'RYT 200 | Certified Nutritionist',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      bio: 'Empowers students to boost metabolism, overcome fatigue, and discover joyful daily movement.'
    }
  ];

  const faqs = [
    {
      q: "How do I choose the right yoga batch for my fitness level?",
      a: "If you are new to yoga or returning after a break, we recommend our 'Beginner Yoga Foundation'. For active fat-burn and core conditioning, choose 'Weight Management Power Yoga'. If you seek stress relief and breath control, 'Pranayama & Mindful Meditation' is ideal."
    },
    {
      q: "Are classes conducted in-studio or online live?",
      a: "We offer both! You can attend in-person at our Sangli Ram Mandir Chowk sanctuary studio or join our interactive live HD stream with real-time posture corrections and personal guidance from the master yogacharyas."
    },
    {
      q: "What if I miss a live morning or evening class?",
      a: "Never worry about missing a session. Every batch class is recorded in high definition and uploaded to your Student Dashboard within 2 hours, accessible on any device whenever you are ready to practice."
    },
    {
      q: "What equipment or preparation do I need before starting?",
      a: "All you need is a comfortable yoga mat, breathable stretchy clothing, and a water bottle. Blocks, straps, and meditation bolsters are provided for all in-studio classes."
    }
  ];

  return (
    <div className="space-y-24 sm:space-y-32 w-full max-w-full overflow-x-hidden box-border">
      {/* ================================================== */}
      {/* 1. HERO SECTION */}
      {/* ================================================== */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Soft Animated Floating Background Blobs */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F2ECE1]/70 via-[#FBF9F5] to-[#FBF9F5] -z-10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#7E9A82]/12 rounded-full blur-3xl -z-10 animate-blob-1" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#E2B887]/15 rounded-full blur-3xl -z-10 animate-blob-2" />

        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column with Staggered Entrance */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top Pill */}
            <div className="animate-hero-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EAE3D6] border border-[#DDD5C7] text-[#2D4A3E] text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C59B63]" />
              <span>Authentic Vedic Yoga • Daily Live & In-Studio Batches</span>
            </div>

            {/* Main Heading */}
            <h1 className="animate-hero-2 text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#20342A] tracking-tight leading-[1.15]">
              Transform Your Body, Mind & Life With Yoga
            </h1>

            {/* Subheading Description */}
            <p className="animate-hero-3 text-base sm:text-lg text-[#55695C] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Discover authentic Himalayan Hatha, dynamic Vinyasa flow, therapeutic Pranayama, and restorative meditation. Guided by certified master yogacharyas in small, personalized batches.
            </p>

            {/* Hero CTAs with Premium Button Interactions */}
            <div className="animate-hero-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => onOpenEnroll ? onOpenEnroll() : navigate('/courses')}
                className="yoga-btn-primary w-full sm:w-auto text-sm py-3.5 px-8"
              >
                <CalendarCheck className="w-4 h-4 text-[#E2B887]" />
                <span>Join Now • View Batches</span>
              </button>

              <Link
                to="/courses"
                className="yoga-btn-secondary w-full sm:w-auto text-sm py-3.5 px-7"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4 text-[#55755E]" />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="animate-hero-4 pt-6 grid grid-cols-3 gap-4 border-t border-[#E5DDD0] max-w-lg mx-auto lg:mx-0 text-center">
              <div>
                <p className="text-2xl font-serif font-bold text-[#2D4A3E]">5,000+</p>
                <p className="text-xs text-[#6A7E72] font-medium mt-0.5">Lives Transformed</p>
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-[#2D4A3E]">14+ Yrs</p>
                <p className="text-xs text-[#6A7E72] font-medium mt-0.5">Teaching Lineage</p>
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-[#2D4A3E]">4.9 / 5</p>
                <p className="text-xs text-[#6A7E72] font-medium mt-0.5">Student Rating ⭐</p>
              </div>
            </div>
          </div>

          {/* Right Image Banner Column */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
              <img
                src="/assets/hero-banner.jpg"
                alt="Meditation & Yoga at PranaVeda"
                className="w-full h-full object-cover transform group-hover:scale-104 transition duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              
              {/* Floating Quote Badge */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl glass-card text-[#24362C] shadow-lg animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2D4A3E] text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[#E2B887]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#2D4A3E] leading-snug">
                      "Yoga is the journey of the self, through the self, to the self."
                    </p>
                    <p className="text-[10px] text-[#6A7E72] mt-0.5 font-serif italic">— The Bhagavad Gita</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2. ABOUT YOGA & STUDIO PHILOSOPHY */}
      {/* ================================================== */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="yoga-card yoga-card-sage p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFE9DF] text-[#2D4A3E] text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 text-[#55755E]" />
              <span>About PranaVeda Sanctuary</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#20342A] leading-tight">
              More Than Just Physical Exercise — A Pathway to Wholeness
            </h2>
            <div className="heading-accent-line !mx-0" />

            <p className="text-sm text-[#55695C] leading-relaxed">
              At PranaVeda, we view yoga as a holistic science of conscious living. Located at Ram Mandir Chowk, Sangli, our sanctuary bridges ancient Himalayan wisdom with modern biomechanics to support modern professionals, families, and wellness seekers.
            </p>
            <p className="text-sm text-[#55695C] leading-relaxed">
              Whether you are an absolute beginner taking your very first breath on the mat, or an advanced practitioner seeking to master arm balances and deep dhyana, our small batches ensure individualized alignment and personal care.
            </p>
            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#2D4A3E] hover:text-[#55755E] uppercase tracking-wider border-b-2 border-[#2D4A3E] pb-1 transition group"
              >
                <span>Read Our Full Story & Philosophy</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video lg:aspect-square group">
            <img
              src="/assets/instructor-lead.jpg"
              alt="Yoga Instructor Leading Class"
              className="w-full h-full object-cover transform group-hover:scale-104 transition duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-6">
              <div className="text-white">
                <p className="text-xs font-medium text-[#E2B887]">Daily In-Studio & Online Live</p>
                <h4 className="text-lg font-serif font-bold">Led by Certified E-RYT 500 Yogacharyas</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 3. WHY CHOOSE US (4 Pillars) */}
      {/* ================================================== */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-semibold tracking-widest text-[#55755E] uppercase">
            The PranaVeda Advantage
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#20342A]">
            Why Students Choose Our Classes
          </h2>
          <div className="heading-accent-line" />
          <p className="text-sm text-[#6A7E72] max-w-xl mx-auto">
            Experience thoughtful curriculum, authentic guidance, and a warm, supportive community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="yoga-card yoga-card-sage p-6">
            <div className="yoga-card-side-accent" />
            <div className="icon-box w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-[#2D4A3E] flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-[#059669]" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#24362C] mb-2">
              Certified Master Teachers
            </h3>
            <p className="text-xs text-[#6A7E72] leading-relaxed">
              Taught exclusively by E-RYT 500 yoga alliance certified masters with decades of Himalayan lineage and therapeutic background.
            </p>
          </div>

          <div className="yoga-card yoga-card-gold p-6">
            <div className="yoga-card-side-accent" />
            <div className="icon-box w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-[#D97706] flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-[#D97706]" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#24362C] mb-2">
              Small Batch Size (Max 20)
            </h3>
            <p className="text-xs text-[#6A7E72] leading-relaxed">
              We limit class batches to ensure personal attention, individual posture corrections, and safety for every body type.
            </p>
          </div>

          <div className="yoga-card yoga-card-teal p-6">
            <div className="yoga-card-side-accent" />
            <div className="icon-box w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-[#0D9488] flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-[#0D9488]" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#24362C] mb-2">
              Mind-Body-Breath Integration
            </h3>
            <p className="text-xs text-[#6A7E72] leading-relaxed">
              Every class incorporates traditional Pranayama breath control, therapeutic alignment, and deep sound-assisted meditation.
            </p>
          </div>

          <div className="yoga-card yoga-card-lavender p-6">
            <div className="yoga-card-side-accent" />
            <div className="icon-box w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#4F46E5] flex items-center justify-center mb-4">
              <CalendarCheck className="w-6 h-6 text-[#4F46E5]" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#24362C] mb-2">
              Flexible Timings & Alerts
            </h3>
            <p className="text-xs text-[#6A7E72] leading-relaxed">
              Morning, evening & weekend slots with automated WhatsApp reminders, receipts, and recorded session access if you miss a class.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. YOGA BENEFITS (8 SPECIFIC PROMPT REQUIREMENTS) */}
      {/* ================================================== */}
      <YogaBenefitsSection />

      {/* ================================================== */}
      {/* 5. POPULAR COURSES PREVIEW */}
      {/* ================================================== */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold tracking-widest text-[#55755E] uppercase">
              Curated Offerings
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#20342A] mt-1">
              Popular Yoga Courses
            </h2>
            <div className="heading-accent-line !mx-0" />
            <p className="text-xs text-[#6A7E72] mt-1">
              Live interactive batches with certified instructors.
            </p>
          </div>

          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#2D4A3E] hover:text-[#55755E] uppercase tracking-wider group"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-96 rounded-3xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularCourses.map((course) => (
              <div
                key={course.id}
                className="yoga-card yoga-card-sage flex flex-col group overflow-hidden"
              >
                {/* Course Image with Subtle Zoom */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.name}
                    className="w-full h-full object-cover transform group-hover:scale-104 transition duration-500 ease-out"
                  />
                  <div className="absolute top-3 left-3 bg-[#2D4A3E]/90 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {course.level}
                  </div>
                  {course.availableSeats && course.availableSeats < 10 && (
                    <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                      Only {course.availableSeats} seats left
                    </div>
                  )}
                </div>

                {/* Course Info */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#24362C] group-hover:text-[#2D4A3E] transition-colors">
                      {course.name}
                    </h3>
                    <p className="text-xs text-[#6A7E72] mt-2 line-clamp-2 leading-relaxed">
                      {course.shortDescription}
                    </p>

                    <div className="mt-4 pt-3 border-t border-[#F0EAE1] grid grid-cols-2 gap-2 text-[11px] text-[#55695C]">
                      <div>
                        <span className="text-[#869A8C] block text-[10px]">Duration:</span>
                        <span className="font-semibold">{course.duration}</span>
                      </div>
                      <div>
                        <span className="text-[#869A8C] block text-[10px]">Timing:</span>
                        <span className="font-semibold truncate block">{course.timing}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="pt-4 border-t border-[#F0EAE1] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#869A8C] uppercase font-semibold">Course Fee</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-[#2D4A3E]">₹{course.fee}</span>
                        {course.originalFee && (
                          <span className="text-xs text-gray-400 line-through">₹{course.originalFee}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/courses/${course.slug || course.id}`}
                        className="px-3 py-2 rounded-xl text-xs font-medium text-[#2D4A3E] bg-[#EFE9DF] hover:bg-[#E5DDCF] transition transform hover:-translate-y-0.5"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => onOpenEnroll ? onOpenEnroll(course) : navigate('/courses')}
                        className="yoga-btn-primary !py-2 !px-3.5 !text-xs"
                      >
                        Enroll
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================================================== */}
      {/* 6. OUR MASTER INSTRUCTORS */}
      {/* ================================================== */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-semibold tracking-widest text-[#55755E] uppercase">
            Himalayan Masters & Coaches
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#20342A]">
            Meet Your Dedicated Instructors
          </h2>
          <div className="heading-accent-line" />
          <p className="text-sm text-[#6A7E72] max-w-xl mx-auto">
            Experienced mentors with deep yogic lineage, scientific anatomical training, and genuine warmth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {instructors.map((inst, i) => (
            <div
              key={i}
              className="yoga-card yoga-card-gold p-6 text-center space-y-4 group"
            >
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden shadow-md border-2 border-[#E1DBD1]">
                <img
                  src={inst.image}
                  alt={inst.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#24362C] group-hover:text-[#2D4A3E] transition-colors">
                  {inst.name}
                </h3>
                <p className="text-xs text-[#55755E] font-medium mt-0.5">{inst.role}</p>
                <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-[#EFE9DF] text-[10px] text-[#2D4A3E] font-semibold">
                  {inst.certs}
                </div>
              </div>
              <p className="text-xs text-[#6A7E72] leading-relaxed italic">
                "{inst.bio}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================== */}
      {/* 7. STUDENT TESTIMONIALS */}
      {/* ================================================== */}
      <section className="bg-[#EFE9DF]/50 py-16 border-y border-[#DDD5C7]/80 relative overflow-hidden">
        <div className="absolute top-0 right-10 w-96 h-96 bg-[#7E9A82]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-semibold tracking-widest text-[#55755E] uppercase">
              Community Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#20342A]">
              What Our Students Say
            </h2>
            <div className="heading-accent-line" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test, i) => (
              <div
                key={i}
                className={`yoga-card ${test.accentClass} p-6 flex flex-col justify-between space-y-4 group`}
              >
                <div className="yoga-card-side-accent" />
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-[#55695C] leading-relaxed italic">
                    "{test.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-[#F0EAE1]">
                  <img
                    src={test.avatar}
                    alt={test.name}
                    className="w-10 h-10 rounded-full object-cover transform group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-xs text-[#24362C]">{test.name}</h4>
                    <p className="text-[10px] text-[#869A8C]">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 8. INTERACTIVE FAQ SECTION ACCORDION */}
      {/* ================================================== */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFE9DF] text-[#2D4A3E] text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-[#55755E]" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#20342A]">
            Frequently Asked Questions
          </h2>
          <div className="heading-accent-line" />
          <p className="text-sm text-[#6A7E72] max-w-lg mx-auto">
            Everything you need to know about joining our yoga sanctuary and choosing the right course.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                className={`yoga-card transition-all duration-300 p-5 sm:p-6 cursor-pointer ${
                  isOpen ? 'bg-[#FAF8F5] border-[#55755E]/40 shadow-md' : 'bg-white hover:border-[#D5CABE]'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className={`font-serif font-bold text-sm sm:text-base transition-colors ${
                    isOpen ? 'text-[#2D4A3E]' : 'text-[#24362C]'
                  }`}>
                    {faq.q}
                  </h3>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 bg-[#2D4A3E] text-white' : 'bg-[#EFE9DF] text-[#55755E]'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                  <div className="accordion-inner pt-3 text-xs sm:text-sm text-[#55695C] leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================== */}
      {/* 9. CALL TO ACTION BANNER */}
      {/* ================================================== */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl pb-8">
        <div className="relative rounded-3xl bg-[#2D4A3E] text-white p-8 sm:p-14 overflow-hidden shadow-2xl">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#55755E]/40 rounded-full blur-3xl animate-blob-1" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#E2B887]/20 rounded-full blur-3xl animate-blob-2" />
          
          <div className="relative max-w-2xl space-y-5 text-center sm:text-left z-10">
            <span className="text-xs font-semibold tracking-widest text-[#E2B887] uppercase">
              Begin Your Journey Today
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
              Ready to Experience Serenity, Strength & Deep Wellness?
            </h2>
            <p className="text-sm text-[#D8E2DA] leading-relaxed">
              Book your spot in our upcoming morning or evening batches. Instant confirmation, WhatsApp schedule delivery, and 100% money-back satisfaction guarantee.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => onOpenEnroll ? onOpenEnroll() : navigate('/courses')}
                className="yoga-btn-gold w-full sm:w-auto text-xs py-3.5 px-8"
              >
                Enroll Now • Claim Early Bird Discount
              </button>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition text-center transform hover:-translate-y-0.5"
              >
                Schedule Studio Visit
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

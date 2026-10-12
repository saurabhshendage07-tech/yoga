import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { getCourseById } from '../services/courseService';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80';

export default function CourseDetail({ onOpenEnroll }) {
  const { idOrSlug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCourseById(idOrSlug)
      .then(data => {
        if (data) {
          setCourse(data);
        } else {
          setError('Course not found');
        }
      })
      .catch(err => {
        console.error('Error fetching course from Firestore:', err);
        setError('Failed to load course details');
      })
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-4xl text-center">
        <div className="w-12 h-12 border-4 border-[#55755E]/30 border-t-[#55755E] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#55695C] font-serif">Loading course sanctuary details...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-xl text-center space-y-4">
        <div className="yoga-card p-8 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-serif font-bold text-[#24362C]">Course Not Found</h2>
          <p className="text-xs text-[#6A7E72]">{error || 'The requested yoga course could not be located.'}</p>
          <Link
            to="/courses"
            className="yoga-btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Courses</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-14 space-y-12 relative w-full max-w-full overflow-hidden box-border">
      {/* Background ambient blobs */}
      <div className="absolute top-10 right-[-8%] w-[450px] h-[450px] rounded-full bg-[#7C9A82]/10 blur-3xl pointer-events-none -z-10 animate-blob-slow" />
      <div className="absolute top-[45%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#E5B887]/15 blur-3xl pointer-events-none -z-10 animate-blob-slower" />

      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex items-center gap-2 text-xs text-[#7A8C80]">
          <Link to="/" className="hover:text-[#2D4A3E] transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/courses" className="hover:text-[#2D4A3E] transition">Courses</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#24362C] font-semibold truncate">{course.name}</span>
        </div>
      </div>

      {/* Main Course Layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-8 animate-fade-in">
            {/* Header Title */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1 rounded-full bg-[#2D4A3E] text-white text-xs font-semibold uppercase tracking-wider shadow-xs">
                  {course.level}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#EFE9DF] text-[#2D4A3E] text-xs font-semibold shadow-xs">
                  Batch: {course.batch || course.timing}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#20342A] leading-tight">
                {course.name}
              </h1>
              <p className="text-base text-[#55695C] leading-relaxed font-light">
                {course.shortDescription}
              </p>
            </div>

            {/* Featured Image with Fallback */}
            <div className="rounded-3xl overflow-hidden shadow-xl border border-[#E1DBD1] aspect-video bg-[#F0EAE1] group">
              <img
                src={course.image || DEFAULT_FALLBACK_IMAGE}
                alt={course.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                }}
                className="w-full h-full object-cover group-hover:scale-104 transition duration-500"
              />
            </div>

            {/* Complete Description */}
            <div className="yoga-card yoga-card-sage p-8 space-y-4">
              <div className="yoga-card-side-accent" />
              <h2 className="text-xl font-serif font-bold text-[#24362C] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#55755E]" />
                About This Course
              </h2>
              <p className="text-xs sm:text-sm text-[#55695C] leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </div>

            {/* Course Benefits */}
            {course.benefits && course.benefits.length > 0 && (
              <div className="yoga-card yoga-card-gold p-8 space-y-4">
                <div className="yoga-card-side-accent" />
                <h2 className="text-xl font-serif font-bold text-[#24362C] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C59B63]" />
                  What You Will Gain
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FBF9F5] border border-[#EAE3D6] hover:bg-white transition shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-[#55755E] shrink-0 mt-0.5" />
                      <span className="text-xs font-medium text-[#24362C]">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum Modules (if present) */}
            {course.curriculum && course.curriculum.length > 0 && (
              <div className="yoga-card yoga-card-purple p-8 space-y-4">
                <div className="yoga-card-side-accent" />
                <h2 className="text-xl font-serif font-bold text-[#24362C]">
                  Weekly Syllabus & Practice Modules
                </h2>
                <div className="space-y-2.5">
                  {course.curriculum.map((curr, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#F4F0E8] text-xs font-medium text-[#2D4A3E] border border-[#DDD5C7] flex items-center gap-3 hover:bg-[#EAE3D6] transition">
                      <span className="w-6 h-6 rounded-full bg-[#2D4A3E] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span>{curr}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="yoga-card p-8 space-y-3">
                <h2 className="text-lg font-serif font-bold text-[#24362C]">
                  Prerequisites & Guidelines
                </h2>
                <ul className="space-y-2 text-xs text-[#55695C]">
                  {course.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#55755E] font-bold">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Enrollment Sticky Card (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 yoga-card yoga-card-gold p-6 sm:p-8 shadow-xl space-y-6">
              <div className="yoga-card-side-accent" />
              {/* Pricing Box */}
              <div>
                <p className="text-xs text-[#869A8C] uppercase font-semibold">Total Course Investment</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-[#2D4A3E]">₹{course.fee}</span>
                  {course.originalFee && (
                    <span className="text-sm text-gray-400 line-through">₹{course.originalFee}</span>
                  )}
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full ml-auto">
                    Limited Offer
                  </span>
                </div>
              </div>

              {/* Available Seats Counter */}
              <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#EAE3D6] space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#6A7E72] font-medium">Available Seats:</span>
                  <span className="font-bold text-[#2D4A3E]">{course.availableSeats || 8} / {course.totalSeats || 20}</span>
                </div>
                <div className="w-full bg-[#E5DDD0] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#55755E] h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(10, ((course.availableSeats || 8) / (course.totalSeats || 20)) * 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Schedule Summary */}
              <div className="space-y-3 text-xs border-y border-[#F0EAE1] py-4 text-[#4A5D50]">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#55755E]" />
                  <div>
                    <span className="text-[10px] text-[#869A8C] block">Duration</span>
                    <span className="font-semibold text-[#24362C]">{course.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#55755E]" />
                  <div>
                    <span className="text-[10px] text-[#869A8C] block">Batch Timing</span>
                    <span className="font-semibold text-[#24362C]">{course.timing}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#55755E]" />
                  <div>
                    <span className="text-[10px] text-[#869A8C] block">Lead Acharya</span>
                    <span className="font-semibold text-[#24362C]">{course.instructor}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-3">
                <button
                  onClick={() => onOpenEnroll ? onOpenEnroll(course) : null}
                  className="yoga-btn-primary w-full py-3.5 text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer"
                >
                  Enroll Now • Secure My Seat
                </button>

                <p className="text-[10px] text-center text-[#869A8C] flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#55755E]" />
                  Instant WhatsApp Confirmation & Official Invoice
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

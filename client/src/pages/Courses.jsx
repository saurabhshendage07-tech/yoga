import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  BookOpen,
  Star,
  Award,
  ChevronRight,
  Flame,
  Check,
  ExternalLink,
  Eye,
  Info
} from 'lucide-react';
import { getCourses } from '../services/courseService';
import { initialCourses } from '../services/mockData';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80';

export default function Courses({ onOpenEnroll }) {
  const [courses, setCourses] = useState(initialCourses);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState(initialCourses[0]);
  const detailsSectionRef = useRef(null);

  useEffect(() => {
    getCourses({ includeInactive: false })
      .then(data => {
        const list = (data && data.length > 0) ? data : initialCourses;
        setCourses(list);
        setSelectedCourse(list[0]);
      })
      .catch(err => {
        console.warn('Notice: Firestore getCourses returned fallback:', err);
        setCourses(initialCourses);
        setSelectedCourse(initialCourses[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  const filteredCourses = courses.filter(course => {
    const courseName = course.name || course.title || '';
    const courseDesc = course.shortDescription || course.description || '';
    const courseInst = course.instructor || '';
    const courseLevel = course.level || 'All Levels';

    const matchesSearch =
      courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courseDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courseInst.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel =
      selectedLevel === 'All' ||
      courseLevel.toLowerCase() === selectedLevel.toLowerCase() ||
      (selectedLevel === 'All Levels' && courseLevel.toLowerCase() === 'all levels');

    return matchesSearch && matchesLevel;
  });

  // Handle course selection and smooth scroll to details section
  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    if (detailsSectionRef.current) {
      setTimeout(() => {
        detailsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const getAccentClass = (idx) => {
    const accents = [
      'yoga-card-sage',
      'yoga-card-gold',
      'yoga-card-teal',
      'yoga-card-lavender',
      'yoga-card-peach',
      'yoga-card-purple'
    ];
    return accents[idx % accents.length];
  };

  return (
    <div className="py-8 sm:py-16 space-y-16 relative w-full max-w-full overflow-hidden box-border">
      {/* Background ambient blobs */}
      <div className="absolute top-12 left-[-6%] w-[450px] h-[450px] rounded-full bg-[#7C9A82]/10 blur-3xl pointer-events-none -z-10 animate-blob-slow" />
      <div className="absolute top-[35%] right-[-8%] w-[500px] h-[500px] rounded-full bg-[#E5B887]/15 blur-3xl pointer-events-none -z-10 animate-blob-slower" />

      {/* Header Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center space-y-4 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFE9DF] text-[#2D4A3E] text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#C59B63]" />
          <span>Curated Holistic Programs</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#20342A] tracking-tight">
          Explore Our Yoga & Meditation Courses
        </h1>
        <div className="heading-accent-line" />
        <p className="text-sm sm:text-base text-[#55695C] max-w-2xl mx-auto leading-relaxed font-light">
          From foundational alignment to invigorating Vinyasa flows, therapeutic breathwork, and deep restful meditation. Click any course to view full modules & curriculum details below.
        </p>
      </section>

      {/* Filter and Search Bar */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="yoga-card rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#869A8C] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search courses, styles, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none transition"
            />
          </div>

          {/* Level Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <Filter className="w-3.5 h-3.5 text-[#7A8C80] mr-1 hidden sm:block shrink-0" />
            {levels.map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition shrink-0 cursor-pointer ${
                  selectedLevel === level
                    ? 'bg-[#2D4A3E] text-white font-semibold shadow-md transform -translate-y-0.5'
                    : 'bg-white/80 text-[#55695C] hover:bg-[#EFE9DF] border border-[#DDD5C7]'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Course Cards Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-96 rounded-3xl bg-gray-200/60 animate-pulse" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 yoga-card p-8 max-w-md mx-auto space-y-4">
            <p className="text-base font-serif font-bold text-[#24362C]">No courses matched your search.</p>
            <p className="text-xs text-[#6A7E72]">Try changing your keywords or resetting the level filter.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedLevel('All'); }}
              className="yoga-btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, idx) => {
              const isSelected = selectedCourse && selectedCourse.id === course.id;
              return (
                <div
                  key={course.id}
                  onClick={() => handleSelectCourse(course)}
                  className={`yoga-card ${getAccentClass(idx)} flex flex-col justify-between group cursor-pointer transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-[#55755E] shadow-xl transform -translate-y-1.5' : 'hover:shadow-lg'
                  }`}
                >
                  <div className="yoga-card-side-accent" />
                  <div>
                    {/* Image Container with zoom & fallback */}
                    <div className="relative h-56 overflow-hidden rounded-t-3xl bg-[#F0EAE1]">
                      <img
                        src={course.image || DEFAULT_FALLBACK_IMAGE}
                        alt={course.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                        }}
                        className="w-full h-full object-cover group-hover:scale-106 transition duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-[#2D4A3E]/95 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                        {course.level}
                      </div>
                      {isSelected ? (
                        <div className="absolute top-3 right-3 bg-[#2D4A3E] text-[#E2B887] border border-[#E2B887]/40 text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">
                          <Eye className="w-3 h-3" />
                          <span>Active Preview</span>
                        </div>
                      ) : (
                        course.availableSeats && course.availableSeats < 10 && (
                          <div className="absolute top-3 right-3 bg-amber-600/95 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                            Only {course.availableSeats} seats left
                          </div>
                        )
                      )}
                    </div>

                    {/* Body Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-[#24362C] group-hover:text-[#2D4A3E] transition">
                          {course.name}
                        </h3>
                        <p className="text-xs text-[#6A7E72] mt-1.5 line-clamp-2 leading-relaxed">
                          {course.shortDescription}
                        </p>
                      </div>

                      {/* Schedule Metadata */}
                      <div className="space-y-1.5 p-3 rounded-xl bg-[#FBF9F5] border border-[#EAE3D6] text-[11px] text-[#55695C]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#55755E] shrink-0" />
                          <span><strong>Duration:</strong> {course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#55755E] shrink-0" />
                          <span className="truncate"><strong>Timing:</strong> {course.timing}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-[#55755E] shrink-0" />
                          <span><strong>Instructor:</strong> {course.instructor}</span>
                        </div>
                      </div>

                      {/* Key Benefits Highlights */}
                      {course.benefits && course.benefits.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase text-[#7A8C80] tracking-wider">Key Highlights:</p>
                          <ul className="space-y-1 text-xs text-[#4A5D50]">
                            {course.benefits.slice(0, 2).map((b, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#55755E] shrink-0 mt-0.5" />
                                <span className="text-[11px] line-clamp-1">{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Pricing & Action Buttons */}
                  <div className="p-6 pt-0">
                    <div className="pt-4 border-t border-[#F0EAE1] flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-[#869A8C] uppercase font-semibold">Course Fee</p>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-bold text-[#2D4A3E]">₹{course.fee}</span>
                          {course.originalFee && (
                            <span className="text-xs text-gray-400 line-through">₹{course.originalFee}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCourse(course);
                          }}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#2D4A3E] bg-[#EFE9DF] hover:bg-[#E5DDCF] transition cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenEnroll) onOpenEnroll(course);
                          }}
                          className="yoga-btn-primary px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm cursor-pointer"
                        >
                          Enroll
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* INSTANT COURSE DETAILS SPOTLIGHT SECTION (BELOW COURSE CARDS)             */}
      {/* ========================================================================= */}
      {selectedCourse && (
        <section
          ref={detailsSectionRef}
          className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl pt-6 animate-fade-in-up"
        >
          <div className="yoga-card yoga-card-gold p-6 sm:p-10 shadow-2xl border border-[#D5CABE] relative overflow-hidden space-y-8">
            <div className="yoga-card-side-accent" />
            
            {/* Top Bar with Badges and Close/Full Page Links */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D6]">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3.5 py-1 rounded-full bg-[#2D4A3E] text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                  {selectedCourse.level || 'All Levels'}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#EFE9DF] text-[#2D4A3E] text-xs font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#55755E]" />
                  {selectedCourse.batch || selectedCourse.timing}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  4.9 / 5 (120+ student reviews)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/courses/${selectedCourse.slug || selectedCourse.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#55755E] hover:text-[#2D4A3E] hover:underline"
                >
                  <span>Open Dedicated Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Main Details Grid: Left Image (5 cols) & Right Information (7 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Large Image & Highlights (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl overflow-hidden shadow-lg border-2 border-[#EAE3D6] aspect-[4/3] bg-[#F0EAE1] relative group">
                  <img
                    src={selectedCourse.image || DEFAULT_FALLBACK_IMAGE}
                    alt={selectedCourse.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                    }}
                    className="w-full h-full object-cover group-hover:scale-104 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
                    <div className="text-white space-y-0.5">
                      <p className="text-[10px] uppercase font-bold text-[#E2B887] tracking-wider">Lead Instructor</p>
                      <h4 className="font-serif font-bold text-base">{selectedCourse.instructor}</h4>
                      {selectedCourse.instructorTitle && (
                        <p className="text-xs text-gray-200">{selectedCourse.instructorTitle}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Info Box */}
                <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#EAE3D6] grid grid-cols-2 gap-3 text-xs text-[#55695C]">
                  <div>
                    <span className="text-[10px] text-[#869A8C] uppercase font-bold block">Course Duration</span>
                    <span className="font-bold text-[#24362C]">{selectedCourse.duration}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#869A8C] uppercase font-bold block">Batch Timing</span>
                    <span className="font-bold text-[#24362C] truncate block">{selectedCourse.timing}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#869A8C] uppercase font-bold block">Available Seats</span>
                    <span className="font-bold text-[#2D4A3E]">
                      {selectedCourse.availableSeats || 8} / {selectedCourse.totalSeats || 20} Seats
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#869A8C] uppercase font-bold block">Syllabus Modules</span>
                    <span className="font-bold text-[#24362C]">
                      {selectedCourse.curriculum?.length || 4} Structured Modules
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Description, Syllabus, Benefits & Pricing CTA (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#20342A] leading-tight">
                    {selectedCourse.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#55695C] mt-2 leading-relaxed font-light">
                    {selectedCourse.description || selectedCourse.shortDescription}
                  </p>
                </div>

                {/* Benefits List */}
                {selectedCourse.benefits && selectedCourse.benefits.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="font-serif font-bold text-sm text-[#24362C] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C59B63]" />
                      Key Transformation & Benefits
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedCourse.benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-[#FBF9F5] border border-[#EAE3D6] text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#55755E] shrink-0 mt-0.5" />
                          <span className="text-[#3A4E40]">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Curriculum Modules */}
                {selectedCourse.curriculum && selectedCourse.curriculum.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="font-serif font-bold text-sm text-[#24362C] flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#55755E]" />
                      Weekly Syllabus Modules ({selectedCourse.curriculum.length})
                    </h3>
                    <div className="space-y-1.5">
                      {selectedCourse.curriculum.map((curr, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs font-medium text-[#2D4A3E] flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#2D4A3E] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {i + 1}
                          </span>
                          <span>{curr}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing Box and Action Buttons */}
                <div className="p-5 rounded-2xl bg-[#F8F5EE] border border-[#E5DDD0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-[#869A8C] uppercase font-bold">Total Course Investment</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[#2D4A3E]">₹{selectedCourse.fee}</span>
                      {selectedCourse.originalFee && (
                        <span className="text-sm text-gray-400 line-through">₹{selectedCourse.originalFee}</span>
                      )}
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Early Bird Offer
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => onOpenEnroll ? onOpenEnroll(selectedCourse) : null}
                      className="yoga-btn-primary w-full sm:w-auto px-7 py-3 text-xs font-bold rounded-full shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4 text-[#E2B887]" />
                      <span>Enroll in This Course</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  Smile,
  Brain,
  Moon,
  Flame,
  HeartHandshake,
  Zap,
  Sparkles
} from 'lucide-react';

const benefitsData = [
  {
    id: 'flexibility',
    title: 'Improved Flexibility',
    desc: 'Lengthen tight muscles, lubricate joints, and release stubborn physical tension safely.',
    icon: Activity,
    accentName: 'Mint / Emerald',
    accentColor: '#059669',
    accentLight: '#ECFDF5',
    accentBorder: 'rgba(16, 185, 129, 0.3)',
    accentGlow: 'rgba(16, 185, 129, 0.22)',
    gradientFrom: '#10B981',
    gradientTo: '#059669',
    iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blobColor: 'bg-emerald-200/20'
  },
  {
    id: 'posture',
    title: 'Better Posture & Alignment',
    desc: 'Correct spinal imbalances from desk work and relieve neck and lower back pressure.',
    icon: ShieldCheck,
    accentName: 'Warm Gold',
    accentColor: '#D97706',
    accentLight: '#FFFBEB',
    accentBorder: 'rgba(245, 158, 11, 0.3)',
    accentGlow: 'rgba(245, 158, 11, 0.22)',
    gradientFrom: '#F59E0B',
    gradientTo: '#D97706',
    iconBg: 'bg-amber-50 text-amber-700 border-amber-100',
    blobColor: 'bg-amber-200/20'
  },
  {
    id: 'stress',
    title: 'Deep Stress Reduction',
    desc: 'Lower cortisol levels and soothe chronic anxiety with mindful parasympathetic breathwork.',
    icon: Smile,
    accentName: 'Teal',
    accentColor: '#0D9488',
    accentLight: '#F0FDFA',
    accentBorder: 'rgba(20, 184, 166, 0.3)',
    accentGlow: 'rgba(20, 184, 166, 0.22)',
    gradientFrom: '#14B8A6',
    gradientTo: '#0D9488',
    iconBg: 'bg-teal-50 text-teal-700 border-teal-100',
    blobColor: 'bg-teal-200/20'
  },
  {
    id: 'concentration',
    title: 'Laser Concentration',
    desc: 'Sharpen cognitive focus, enhance memory retention, and cultivate mental stillness.',
    icon: Brain,
    accentName: 'Lavender / Indigo',
    accentColor: '#4F46E5',
    accentLight: '#EEF2FF',
    accentBorder: 'rgba(99, 102, 241, 0.3)',
    accentGlow: 'rgba(99, 102, 241, 0.22)',
    gradientFrom: '#6366F1',
    gradientTo: '#4F46E5',
    iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    blobColor: 'bg-indigo-200/20'
  },
  {
    id: 'sleep',
    title: 'Better Restful Sleep',
    desc: 'Alleviate insomnia and calm an overactive mind for deep, rejuvenating night sleep.',
    icon: Moon,
    accentName: 'Soft Purple',
    accentColor: '#9333EA',
    accentLight: '#FAF5FF',
    accentBorder: 'rgba(168, 85, 247, 0.3)',
    accentGlow: 'rgba(168, 85, 247, 0.22)',
    gradientFrom: '#A855F7',
    gradientTo: '#9333EA',
    iconBg: 'bg-purple-50 text-purple-700 border-purple-100',
    blobColor: 'bg-purple-200/20'
  },
  {
    id: 'fitness',
    title: 'Physical Fitness & Tone',
    desc: 'Build functional lean muscle, metabolic endurance, and dynamic whole-body stamina.',
    icon: Flame,
    accentName: 'Rose / Coral',
    accentColor: '#E11D48',
    accentLight: '#FFF1F2',
    accentBorder: 'rgba(244, 63, 94, 0.3)',
    accentGlow: 'rgba(244, 63, 94, 0.22)',
    gradientFrom: '#F43F5E',
    gradientTo: '#E11D48',
    iconBg: 'bg-rose-50 text-rose-700 border-rose-100',
    blobColor: 'bg-rose-200/20'
  },
  {
    id: 'relaxation',
    title: 'Mental Relaxation',
    desc: 'Immerse in grounding Yoga Nidra and sound vibrations to silence persistent mental chatter.',
    icon: HeartHandshake,
    accentName: 'Sky Blue',
    accentColor: '#0284C7',
    accentLight: '#F0F9FF',
    accentBorder: 'rgba(14, 165, 233, 0.3)',
    accentGlow: 'rgba(14, 165, 233, 0.22)',
    gradientFrom: '#0EA5E9',
    gradientTo: '#0284C7',
    iconBg: 'bg-sky-50 text-sky-700 border-sky-100',
    blobColor: 'bg-sky-200/20'
  },
  {
    id: 'holistic',
    title: 'Overall Holistic Wellness',
    desc: 'Synchronize body, mind, and spirit for boundless daily energy and lasting joy.',
    icon: Zap,
    accentName: 'Warm Orange',
    accentColor: '#EA580C',
    accentLight: '#FFF7ED',
    accentBorder: 'rgba(249, 115, 22, 0.3)',
    accentGlow: 'rgba(249, 115, 22, 0.22)',
    gradientFrom: '#F97316',
    gradientTo: '#EA580C',
    iconBg: 'bg-orange-50 text-orange-700 border-orange-100',
    blobColor: 'bg-orange-200/20'
  }
];

function InteractiveBenefitCard({ benefit, index, isVisible }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const rafRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const Icon = benefit.icon;

  // 3D Tilt calculation based on mouse position
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Max 3deg tilt
      const rotateX = -((y - centerY) / centerY) * 3;
      const rotateY = ((x - centerX) / centerX) * 3;

      setTiltStyle({
        transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-10px) scale(1.02)`
      });
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)'
    });
  };

  // Staggered reveal delay: 0ms, 100ms, 200ms, ...
  const revealDelayMs = index * 100;
  // Continuous float stagger: 0s, 0.7s, 1.4s, ...
  const floatDelaySec = `${(index * 0.75).toFixed(2)}s`;

  return (
    <div
      style={{
        transitionDelay: `${revealDelayMs}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0px)' : 'translateY(28px)'
      }}
      className="transition-all duration-700 ease-out h-full"
    >
      {/* Outer Floating Wrapper */}
      <div
        style={{ animationDelay: floatDelaySec }}
        className="animate-card-float h-full"
      >
        {/* Interactive 3D Card Shell */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            ...tiltStyle,
            boxShadow: isHovered
              ? `0 22px 40px -15px ${benefit.accentGlow}, 0 4px 12px rgba(0, 0, 0, 0.03)`
              : '0 4px 20px -4px rgba(0, 0, 0, 0.04)',
            borderColor: isHovered ? benefit.accentBorder : '#E4DDD3'
          }}
          className="relative group h-full rounded-3xl bg-white/95 backdrop-blur-sm border p-6 sm:p-7 flex flex-col justify-between overflow-hidden transition-[transform,box-shadow,border-color] duration-350 ease-out cursor-default"
        >
          {/* ========================================================= */}
          {/* 1. MOVING GRADIENT AURA (Slow Moving Subtle Glow)         */}
          {/* ========================================================= */}
          <div
            className="absolute -inset-[100%] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10"
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${benefit.accentGlow} 120deg, transparent 240deg, ${benefit.accentGlow} 360deg)`
            }}
          >
            <div className="w-full h-full animate-border-spin" />
          </div>

          {/* ========================================================= */}
          {/* 2. MOVING SIDE COLOR BAR (Subtle Vertical Accent Bar)     */}
          {/* ========================================================= */}
          <div
            style={{
              background: `linear-gradient(180deg, ${benefit.gradientFrom} 0%, ${benefit.gradientTo} 50%, ${benefit.gradientFrom} 100%)`,
              boxShadow: isHovered ? `0 0 12px ${benefit.accentGlow}` : 'none'
            }}
            className="absolute left-0 top-6 bottom-6 w-1.5 rounded-r-full animate-side-bar transition-all duration-350"
          />

          {/* Ambient Top Corner Glow */}
          <div
            style={{
              background: `radial-gradient(circle at top right, ${benefit.accentGlow} 0%, transparent 70%)`
            }}
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-500"
          />

          {/* Card Body */}
          <div className="relative z-10 space-y-4">
            {/* Top Area: Animated Icon Container */}
            <div className="flex items-center justify-between">
              <div
                style={{
                  boxShadow: isHovered ? `0 6px 16px -2px ${benefit.accentGlow}` : 'none'
                }}
                className={`w-12 h-12 rounded-2xl ${benefit.iconBg} border flex items-center justify-center transition-all duration-350 ease-out transform group-hover:scale-108 group-hover:-translate-y-0.5`}
              >
                <Icon
                  style={{
                    color: isHovered ? benefit.accentColor : undefined
                  }}
                  className="w-5 h-5 transition-colors duration-300"
                />
              </div>

              {/* Decorative Subtle Dot */}
              <div
                style={{ backgroundColor: benefit.accentColor }}
                className="w-2 h-2 rounded-full opacity-30 group-hover:opacity-80 transition-opacity duration-300"
              />
            </div>

            {/* Title & Description with Subtle Kinetic Motion */}
            <div className="space-y-2 pt-1">
              <h3
                style={{
                  color: isHovered ? benefit.accentColor : '#24362C'
                }}
                className="font-serif font-bold text-base transition-colors duration-300 leading-snug"
              >
                {benefit.title}
              </h3>
              
              <p className="text-xs text-[#6A7E72] leading-relaxed transition-transform duration-350 group-hover:-translate-y-0.5">
                {benefit.desc}
              </p>
            </div>
          </div>

          {/* Bottom Accent Highlight Line on Hover */}
          <div
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${benefit.accentBorder} 50%, transparent 100%)`
            }}
            className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        </div>
      </div>
    </div>
  );
}

export default function YogaBenefitsSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-12 overflow-hidden"
    >
      {/* ========================================================= */}
      {/* FLOATING AMBIENT BACKGROUND BLOBS (Subtle Wellness Glow)  */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Blob 1: Soft Emerald / Mint */}
        <div className="absolute -top-12 -left-12 w-96 h-96 rounded-full bg-emerald-200/25 blur-3xl animate-blob-1" />
        
        {/* Blob 2: Soft Lavender / Purple */}
        <div className="absolute top-1/4 -right-16 w-96 h-96 rounded-full bg-purple-200/20 blur-3xl animate-blob-2" />
        
        {/* Blob 3: Warm Gold / Amber */}
        <div className="absolute -bottom-16 left-1/4 w-96 h-96 rounded-full bg-amber-200/20 blur-3xl animate-blob-1" style={{ animationDelay: '-6s' }} />
        
        {/* Blob 4: Soft Sky Blue / Teal */}
        <div className="absolute bottom-10 -right-12 w-80 h-80 rounded-full bg-sky-200/20 blur-3xl animate-blob-2" style={{ animationDelay: '-10s' }} />
      </div>

      {/* Section Header */}
      <div className="text-center space-y-3 mb-12 sm:mb-14 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE9DF] text-[#2D4A3E] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#C59B63]" />
          <span>Holistic Health Benefits</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#20342A] tracking-tight">
          Scientifically Proven Yoga Benefits
        </h2>

        <p className="text-sm text-[#6A7E72] max-w-xl mx-auto leading-relaxed">
          Experience life-changing physical and psychological benefits through consistent daily practice.
        </p>
      </div>

      {/* Responsive 4-Column Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {benefitsData.map((benefit, idx) => (
          <InteractiveBenefitCard
            key={benefit.id}
            benefit={benefit}
            index={idx}
            isVisible={isVisible}
          />
        ))}
      </div>
    </section>
  );
}

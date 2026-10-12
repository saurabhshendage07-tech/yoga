import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReceiptModal from '../components/common/ReceiptModal';
import {
  User,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  BookOpen,
  ArrowRight,
  LogOut,
  Mail,
  Phone
} from 'lucide-react';
import { getUserBookings } from '../services/bookingService';

export default function UserDashboard({ onOpenEnroll }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    getUserBookings(user.id || user.uid, user.email)
      .then(data => {
        if (data) {
          setEnrollments(data);
        }
      })
      .catch(err => console.error('Error fetching enrollments from Firestore:', err))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="py-8 sm:py-14 space-y-12 relative w-full max-w-full overflow-hidden box-border">
      {/* Ambient background blobs */}
      <div className="absolute top-10 right-[-8%] w-[450px] h-[450px] rounded-full bg-[#7C9A82]/10 blur-3xl pointer-events-none -z-10 animate-blob-slow" />
      <div className="absolute top-[45%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#E5B887]/15 blur-3xl pointer-events-none -z-10 animate-blob-slower" />

      {/* Welcome Banner */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="rounded-3xl bg-[#2D4A3E] text-white p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#E2B887] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#E2B887]" />
              <span>Student Sanctuary Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
              Namaste, {user.name}! 🙏
            </h1>
            <p className="text-xs sm:text-sm text-[#D8E2DA] leading-relaxed font-light">
              Welcome to your dedicated dashboard. Track your enrolled yoga batches, access instant receipts, and stay aligned with your teacher guidance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenEnroll ? onOpenEnroll() : navigate('/courses')}
              className="yoga-btn-gold px-5 py-2.5 rounded-full text-[#24362C] text-xs font-bold shadow-lg cursor-pointer"
            >
              Enroll in New Course
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid: Enrolled Courses & Profile */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Enrolled Courses (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-[#24362C] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#55755E]" />
                My Enrolled Batches ({enrollments.length})
              </h2>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(n => (
                  <div key={n} className="h-40 rounded-3xl bg-gray-200/60 animate-pulse" />
                ))}
              </div>
            ) : enrollments.length === 0 ? (
              <div className="p-8 sm:p-12 yoga-card text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#EFE9DF] text-[#55755E] flex items-center justify-center mx-auto icon-box shadow-xs">
                  <Sparkles className="w-7 h-7 text-[#C59B63]" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#24362C]">No Active Enrollments Yet</h3>
                <p className="text-xs text-[#6A7E72] max-w-sm mx-auto font-light">
                  Ready to begin your transformative wellness path? Explore our live morning and evening batches.
                </p>
                <button
                  onClick={() => onOpenEnroll ? onOpenEnroll() : navigate('/courses')}
                  className="yoga-btn-primary px-6 py-2.5 rounded-full text-white text-xs font-semibold cursor-pointer"
                >
                  Browse Yoga Courses
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enr, idx) => (
                  <div
                    key={enr.id}
                    className="yoga-card yoga-card-sage p-6 space-y-4"
                  >
                    <div className="yoga-card-side-accent" />
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            enr.enrollmentStatus === 'Active'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {enr.enrollmentStatus || 'Active'}
                          </span>
                          <span className="text-[11px] text-[#869A8C] font-mono">
                            {enr.id}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-lg text-[#24362C]">
                          {enr.courseName}
                        </h3>
                      </div>

                      <div className="text-right sm:self-center">
                        <span className="text-xs text-green-800 bg-green-50 border border-green-200 px-3 py-1 rounded-full font-semibold flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          Paid: ₹{enr.amount}
                        </span>
                      </div>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#EAE3D6] text-xs text-[#55695C]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#55755E]" />
                        <span><strong>Batch:</strong> {enr.batchTiming}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#55755E]" />
                        <span><strong>Start Date:</strong> {enr.startDate || 'Next Monday'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#55755E]" />
                        <span className="font-mono text-[11px] truncate">
                          <strong>UTR / Ref:</strong> {enr.paymentId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#55755E]" />
                        <span><strong>Enrolled:</strong> {new Date(enr.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#F0EAE1]">
                      <button
                        onClick={() => setSelectedReceipt(enr)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EFE9DF] hover:bg-[#E5DDCF] text-xs font-semibold text-[#2D4A3E] transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#55755E]" />
                        <span>View / Print Official Receipt</span>
                      </button>

                      <a
                        href={`https://wa.me/919876543210?text=Namaste!%20I%20am%20enrolled%20in%20${encodeURIComponent(enr.courseName)}%20(ID:%20${enr.id}).%20Please%20send%20the%20live%20class%20link.`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#25D366] hover:underline cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Teacher WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Student Profile & Support (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="yoga-card yoga-card-gold p-6 space-y-4">
              <div className="yoga-card-side-accent" />
              <h3 className="font-serif font-bold text-base text-[#24362C] flex items-center gap-2">
                <User className="w-4 h-4 text-[#55755E]" />
                Student Profile
              </h3>
              
              <div className="space-y-3 text-xs text-[#4A5D50]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#869A8C] block">Full Name</span>
                  <span className="font-semibold text-sm text-[#24362C]">{user.name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#869A8C] block">Email</span>
                  <span className="font-medium text-[#24362C]">{user.email}</span>
                </div>
                {user.mobile && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#869A8C] block">Mobile Number</span>
                    <span className="font-medium text-[#24362C]">{user.mobile}</span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#869A8C] block">Role</span>
                  <span className="capitalize text-[#2D4A3E] font-semibold">{user.role || 'Student'}</span>
                </div>
              </div>
            </div>

            {/* Support Help Card */}
            <div className="yoga-card yoga-card-lavender p-6 space-y-3">
              <div className="yoga-card-side-accent" />
              <h3 className="font-serif font-bold text-sm text-[#24362C]">Need Studio Assistance?</h3>
              <p className="text-xs text-[#55695C] leading-relaxed font-light">
                Our student sanctuary coordinators are available daily to assist with batch switches, class recordings, or posture guidance.
              </p>
              <div className="space-y-2 pt-2 text-xs text-[#2D4A3E]">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#55755E]" />
                  <span>+91 98765 43210</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#55755E]" />
                  <span>namaste@pranavedayoga.com</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          enrollment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}

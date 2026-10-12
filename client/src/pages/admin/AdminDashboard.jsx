import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CalendarCheck,
  CreditCard,
  IndianRupee,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  Database
} from 'lucide-react';
import { getDashboardStats, subscribeToDashboardMetrics } from '../../services/dashboardService';
import { autoSeedAllFirestoreCollections } from '../../services/seedFirestoreService';
import { useToast } from '../../context/ToastContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const { showToast } = useToast();

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      const res = await autoSeedAllFirestoreCollections({ force: true });
      if (res.success) {
        showToast('All collections & data successfully saved to your Firestore database!', 'success');
        // Refresh dashboard stats
        const freshStats = await getDashboardStats();
        setStats(freshStats);
      } else {
        showToast('Seeding completed with notes: ' + (res.error || 'Check console'), 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('Error syncing with Firestore: ' + err.message, 'error');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    getDashboardStats()
      .then(data => {
        setStats(data);
        // If everything is zero, auto-seed in background once
        if (data && (data.totalCourses === 0 && data.totalStudents === 0)) {
          autoSeedAllFirestoreCollections().then(() => {
            getDashboardStats().then(s => setStats(s)).catch(() => {});
          }).catch(() => {});
        }
      })
      .catch(err => console.error('Error fetching dashboard stats from Firestore:', err))
      .finally(() => setLoading(false));

    // Real-time updates subscription
    const unsubscribe = subscribeToDashboardMetrics((liveStats) => {
      setStats(liveStats);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-gray-200 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      sub: 'Verified Collections',
      icon: IndianRupee,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      label: 'Total Students',
      value: stats?.totalStudents !== undefined ? stats.totalStudents : (stats?.totalUsers || 0),
      sub: 'Registered Practitioners',
      icon: Users,
      color: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    {
      label: 'Total Enrollments',
      value: stats?.totalEnrollments || 0,
      sub: `${stats?.activeEnrollments || 0} active enrolled`,
      icon: CalendarCheck,
      color: 'bg-teal-50 text-teal-800 border-teal-200'
    },
    {
      label: 'Total Courses',
      value: `${stats?.activeCourses || 0} / ${stats?.totalCourses || 0}`,
      sub: 'Active Batches',
      icon: BookOpen,
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      label: 'Successful Payments',
      value: stats?.successfulPaymentsCount || 0,
      sub: 'Verified Payments',
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-800 border-green-200'
    },
    {
      label: 'Pending Payments',
      value: stats?.pendingPaymentsCount || 0,
      sub: 'Awaiting Verification',
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-800 border-yellow-200'
    },
    {
      label: 'Failed / Refunded',
      value: stats?.failedPaymentsCount || 0,
      sub: 'Declined or Cancelled',
      icon: XCircle,
      color: 'bg-rose-50 text-rose-800 border-rose-200'
    },
    {
      label: 'Upcoming Classes',
      value: stats?.upcomingClassesCount || 0,
      sub: 'Scheduled Live Sessions',
      icon: Calendar,
      color: 'bg-purple-50 text-purple-800 border-purple-200'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#2D4A3E] text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#E2B887]">
              Studio Overview
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-emerald-200 border border-white/20">
              <Database className="w-3 h-3 text-[#E2B887]" />
              Firestore Live Data
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
            PranaVeda Management Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#D8E2DA] mt-1">
            Live student enrollments, class schedules, and payment verification records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#20342A] text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{seeding ? 'Saving to Firestore...' : 'Sync / Save All Data to Firestore'}</span>
          </button>
          <Link
            to="/admin/courses"
            className="px-4 py-2 rounded-xl bg-[#E2B887] text-[#24362C] text-xs font-bold hover:bg-[#d6a974] transition"
          >
            + Add New Course
          </Link>
          <Link
            to="/admin/enrollments"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition"
          >
            Manage Enrollments
          </Link>
        </div>
      </div>

      {/* 8 Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-white border ${card.color} shadow-2xs hover:shadow-xs transition flex items-start justify-between`}
            >
              <div>
                <p className="text-[11px] font-semibold text-[#7A8C80] uppercase tracking-wider">{card.label}</p>
                <h3 className="text-xl font-bold text-[#24362C] mt-1">{card.value}</h3>
                <p className="text-[10px] text-[#869A8C] mt-0.5">{card.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 4 Real-time Data Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Enrollments (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E1DBD1] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
            <h2 className="font-serif font-bold text-base text-[#24362C] flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#55755E]" />
              Recent Enrollments
            </h2>
            <Link to="/admin/enrollments" className="text-xs font-semibold text-[#55755E] hover:underline">
              View All ↗
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#7A8C80] text-[11px] uppercase border-b border-[#F0EAE1]">
                  <th className="pb-2">Student</th>
                  <th className="pb-2">Course</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F0E8]">
                {stats?.recentEnrollments && stats.recentEnrollments.length > 0 ? (
                  stats.recentEnrollments.map((enr) => (
                    <tr key={enr.id || enr.enrollmentId} className="hover:bg-[#FBF9F5] transition">
                      <td className="py-2.5 font-medium text-[#24362C]">
                        <p className="font-semibold">{enr.studentName || enr.userName || enr.student_name}</p>
                        <p className="text-[10px] text-[#869A8C]">{enr.phone || enr.mobile || enr.userMobile}</p>
                      </td>
                      <td className="py-2.5 text-[#55695C]">{enr.courseName || enr.course_name}</td>
                      <td className="py-2.5 font-bold text-[#2D4A3E]">₹{enr.amount || enr.coursePrice}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (enr.enrollmentStatus === 'Active' || enr.enrollmentStatus === 'Confirmed')
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {enr.enrollmentStatus || enr.enrollment_status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-400">No enrollments in Firestore yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E1DBD1] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
            <h2 className="font-serif font-bold text-base text-[#24362C] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#C59B63]" />
              Recent Payments
            </h2>
            <Link to="/admin/payments" className="text-xs font-semibold text-[#55755E] hover:underline">
              View All ↗
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#7A8C80] text-[11px] uppercase border-b border-[#F0EAE1]">
                  <th className="pb-2">Payment ID</th>
                  <th className="pb-2">Student</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F0E8]">
                {stats?.recentPayments && stats.recentPayments.length > 0 ? (
                  stats.recentPayments.map((pay) => (
                    <tr key={pay.id || pay.paymentId} className="hover:bg-[#FBF9F5] transition">
                      <td className="py-2.5 font-mono text-[11px] text-[#24362C]">
                        {pay.paymentId || pay.id}
                      </td>
                      <td className="py-2.5 font-medium text-[#55695C]">
                        {pay.studentName || pay.userName}
                      </td>
                      <td className="py-2.5 font-bold text-[#2D4A3E]">₹{pay.amount}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (pay.paymentStatus === 'Success' || pay.status === 'Successful')
                            ? 'bg-green-100 text-green-800'
                            : (pay.paymentStatus === 'Failed' || pay.status === 'Failed')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {pay.paymentStatus || pay.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-400">No payment records yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Registrations (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E1DBD1] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
            <h2 className="font-serif font-bold text-base text-[#24362C] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#55755E]" />
              Recent Registrations
            </h2>
            <Link to="/admin/users" className="text-xs font-semibold text-[#55755E] hover:underline">
              Manage Students ↗
            </Link>
          </div>

          <div className="space-y-2.5">
            {stats?.recentRegistrations && stats.recentRegistrations.length > 0 ? (
              stats.recentRegistrations.map((u) => (
                <div key={u.id || u.uid} className="flex items-center justify-between p-3 rounded-2xl bg-[#FBF9F5] border border-[#EAE3D6] text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EAE3D6] text-[#2D4A3E] font-bold flex items-center justify-center text-xs shrink-0">
                      {u.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-[#24362C]">{u.name}</p>
                      <p className="text-[10px] text-[#869A8C]">{u.email} • {u.phone || u.mobile || 'No phone'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#7A8C80] font-medium">
                    {new Date(u.createdAt || u.registrationDate).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-2 text-center">No students registered yet</p>
            )}
          </div>
        </div>

        {/* Upcoming Classes Schedule (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E1DBD1] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
            <h2 className="font-serif font-bold text-base text-[#24362C] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C59B63]" />
              Upcoming Class Schedule
            </h2>
            <span className="text-xs text-[#7A8C80] font-medium">Next Sessions</span>
          </div>

          <div className="space-y-2.5">
            {stats?.upcomingClasses && stats.upcomingClasses.length > 0 ? (
              stats.upcomingClasses.map((cl) => (
                <div key={cl.id || cl.classId} className="flex items-center justify-between p-3 rounded-2xl bg-[#FBF9F5] border border-[#EAE3D6] text-xs">
                  <div>
                    <p className="font-semibold text-[#24362C]">{cl.courseName}</p>
                    <p className="text-[10px] text-[#869A8C]">{cl.instructor} • {cl.location}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[#E2B887]/20 text-[#2D4A3E] font-bold text-[10px]">
                      {cl.date} • {cl.startTime}
                    </span>
                    <p className="text-[9px] text-[#7A8C80] mt-0.5">{cl.enrolledCount || 0} / {cl.capacity || 20} Seats</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-2 text-center">No upcoming classes scheduled</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

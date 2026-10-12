import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import ReceiptModal from '../../components/common/ReceiptModal';
import {
  CalendarCheck,
  Search,
  Download,
  Filter,
  FileText,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Mail,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
  Hourglass,
  Calendar,
  IndianRupee,
  MapPin,
  HeartPulse,
  ShieldCheck,
  ImageIcon,
  X,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { getBookings, updateBookingStatus, subscribeToBookings } from '../../services/bookingService';
import { getCourses } from '../../services/courseService';

export default function AdminEnrollments() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  // Modals
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [screenshotModalUrl, setScreenshotModalUrl] = useState(null);

  // Verification & Rejection Action Modals
  const [verifyTarget, setVerifyTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Payment could not be verified.');
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState(null);

  const fetchEnrollments = () => {
    getBookings({
      search: searchQuery,
      courseId: selectedCourse,
      paymentStatus: paymentStatusFilter
    })
      .then(data => {
        setEnrollments(data);
      })
      .catch(err => {
        console.error(err);
        showToast('Failed to load bookings from Firestore', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getCourses().then(data => {
      if (data) setCourses(data);
    });
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [searchQuery, selectedCourse, paymentStatusFilter]);

  // Verify Payment Action
  const handleVerifyPayment = async () => {
    if (!verifyTarget) return;
    setActionLoading(true);
    try {
      const updated = await updateBookingStatus(verifyTarget.id, 'confirmed');
      showToast('Booking and Payment verified in Firestore.', 'success');
      setVerifyTarget(null);
      if (selectedEnrollment && selectedEnrollment.id === verifyTarget.id) {
        setSelectedEnrollment(prev => ({ ...prev, ...updated, bookingStatus: 'confirmed', paymentStatus: 'paid' }));
      }
      fetchEnrollments();
    } catch (err) {
      showToast(err.message || 'Failed to verify booking in Firestore', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Payment Action
  const handleRejectPayment = async () => {
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      const updated = await updateBookingStatus(rejectTarget.id, 'cancelled', rejectionReason);
      showToast('Booking cancelled/rejected in Firestore.', 'info');
      setRejectTarget(null);
      setRejectionReason('Payment could not be verified.');
      if (selectedEnrollment && selectedEnrollment.id === rejectTarget.id) {
        setSelectedEnrollment(prev => ({ ...prev, ...updated, bookingStatus: 'cancelled', paymentStatus: 'failed' }));
      }
      fetchEnrollments();
    } catch (err) {
      showToast(err.message || 'Failed to update booking in Firestore', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (enrollments.length === 0) {
      showToast('No enrollments to export', 'info');
      return;
    }
    const headers = ['Booking ID', 'Student Name', 'Email', 'Phone', 'Course', 'Amount', 'Booking Status', 'Payment Status', 'UTR Number', 'Created At'];
    const rows = enrollments.map(e => [
      e.id,
      `"${e.userName || e.studentName || ''}"`,
      e.userEmail || e.email || '',
      e.userPhone || e.phone || '',
      `"${e.courseName || ''}"`,
      e.amount || '',
      e.bookingStatus || '',
      e.paymentStatus || '',
      e.utrNumber || '',
      `"${new Date(e.createdAt).toLocaleString()}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pranaveda_bookings_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported bookings CSV successfully', 'success');
  };

  const copyUtr = (utr) => {
    if (utr) {
      navigator.clipboard.writeText(utr);
      setCopiedUtr(utr);
      setTimeout(() => setCopiedUtr(null), 2000);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'verified' || s === 'successful') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200">
          <CheckCircle className="w-3 h-3 text-green-600" />
          <span>🟢 Verified</span>
        </span>
      );
    }
    if (s === 'rejected' || s === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
          <XCircle className="w-3 h-3 text-red-600" />
          <span>🔴 Rejected</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
        <Hourglass className="w-3 h-3 text-amber-600" />
        <span>🟡 Pending Verification</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#24362C]">Enrollments & Payment Verification</h1>
          <p className="text-xs text-[#6A7E72] mt-0.5">
            Audit UPI UTR numbers, inspect payment screenshots, verify or reject incoming student enrollments.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D4A3E] text-white text-xs font-bold hover:bg-[#233B2B] shadow transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#E2B887]" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E1DBD1] shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#869A8C] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search student, mobile, UTR number, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D5CABE] focus:outline-none focus:ring-2 focus:ring-[#55755E]"
          />
        </div>

        {/* Filter by Course */}
        <div>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full p-2 rounded-xl border border-[#D5CABE] bg-white text-[#24362C]"
          >
            <option value="all">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Filter by Payment Status */}
        <div>
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="w-full p-2 rounded-xl border border-[#D5CABE] bg-white text-[#24362C]"
          >
            <option value="all">Payment Status: All</option>
            <option value="Pending Verification">🟡 Pending Verification</option>
            <option value="Verified">🟢 Verified</option>
            <option value="Rejected">🔴 Rejected</option>
          </select>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white rounded-3xl border border-[#E1DBD1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF9F5] text-[#7A8C80] text-[11px] uppercase border-b border-[#EAE3D6]">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Course</th>
                <th className="p-4">Batch</th>
                <th className="p-4">Amount</th>
                <th className="p-4">UTR Number</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Enrollment Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-400">Loading enrollment records...</td>
                </tr>
              ) : enrollments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-400">No enrollment records match filter criteria</td>
                </tr>
              ) : (
                enrollments.map((enr) => {
                  const sName = enr.student_name || enr.userName || 'Unnamed Student';
                  const sMobile = enr.mobile || enr.userMobile || 'N/A';
                  const sEmail = enr.email || enr.userEmail || '';
                  const cName = enr.course_name || enr.courseName || 'Yoga Course';
                  const batch = enr.batch || enr.batchTiming || 'Standard Batch';
                  const utr = enr.utr_number || enr.utrNumber || enr.paymentId || 'N/A';
                  const pStatus = enr.payment_status || enr.paymentStatus || 'Pending Verification';
                  const isPending = pStatus.toLowerCase().includes('pending');
                  const isVerified = pStatus.toLowerCase() === 'verified' || pStatus.toLowerCase() === 'successful';
                  const isRejected = pStatus.toLowerCase() === 'rejected' || pStatus.toLowerCase() === 'failed';

                  return (
                    <tr key={enr.id} className="hover:bg-[#FBF9F5]/70 transition">
                      {/* Student Name */}
                      <td className="p-4">
                        <p className="font-bold text-[#24362C] text-sm">{sName}</p>
                        <p className="text-[10px] text-[#869A8C] truncate max-w-[140px]">{sEmail}</p>
                        <p className="text-[10px] font-mono text-[#A8BDB0]">{enr.id}</p>
                      </td>

                      {/* Mobile */}
                      <td className="p-4 font-medium text-[#55695C]">
                        {sMobile}
                      </td>

                      {/* Course */}
                      <td className="p-4">
                        <p className="font-semibold text-[#2D4A3E]">{cName}</p>
                      </td>

                      {/* Batch */}
                      <td className="p-4 text-[#6A7E72] max-w-[140px] truncate" title={batch}>
                        {batch}
                      </td>

                      {/* Amount */}
                      <td className="p-4 font-bold text-sm text-[#24362C]">
                        ₹{enr.amount}
                      </td>

                      {/* UTR Number */}
                      <td className="p-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#24362C] bg-[#F7F4EE] px-2 py-0.5 rounded border border-[#EAE3D6]">
                            {utr}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyUtr(utr)}
                            title="Copy UTR"
                            className="text-[#869A8C] hover:text-[#2D4A3E] transition"
                          >
                            {copiedUtr === utr ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="p-4">
                        {getStatusBadge(pStatus)}
                      </td>

                      {/* Enrollment Date */}
                      <td className="p-4 text-[#6A7E72]">
                        <p>{new Date(enr.createdAt || enr.created_at).toLocaleDateString()}</p>
                        <p className="text-[10px] text-[#869A8C]">
                          {new Date(enr.createdAt || enr.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => setSelectedEnrollment(enr)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EFE9DF] hover:bg-[#E5DDCF] text-xs font-semibold text-[#2D4A3E] transition"
                            title="View Student & Payment Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {/* Verify Payment */}
                          {!isVerified && (
                            <button
                              type="button"
                              onClick={() => setVerifyTarget(enr)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-xs font-semibold text-green-700 border border-green-200 transition"
                              title="Verify Payment"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </button>
                          )}

                          {/* Reject Payment */}
                          {!isRejected && (
                            <button
                              type="button"
                              onClick={() => setRejectTarget(enr)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-700 border border-red-200 transition"
                              title="Reject Payment"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ENROLLMENT & PAYMENT DETAILS MODAL                               */}
      {/* ========================================================================= */}
      {selectedEnrollment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E1DBD1] relative my-8 text-xs text-[#24362C]">
            <button
              onClick={() => setSelectedEnrollment(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-[#6A7E72] hover:text-[#24362C] hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#55755E] bg-[#EFE9DF] px-2.5 py-0.5 rounded-full">
                  {selectedEnrollment.id}
                </span>
                {getStatusBadge(selectedEnrollment.payment_status || selectedEnrollment.paymentStatus)}
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#24362C] mt-2">
                Enrollment Details
              </h2>
            </div>

            <div className="space-y-6">
              {/* Student Details Section */}
              <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#EAE3D6] space-y-3">
                <h3 className="font-serif font-bold text-sm text-[#2D4A3E] flex items-center gap-2 border-b border-[#EAE3D6] pb-2">
                  <User className="w-4 h-4" />
                  Student Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#869A8C] text-[11px]">Full Name:</span>
                    <p className="font-bold text-[#24362C] text-sm">
                      {selectedEnrollment.student_name || selectedEnrollment.userName}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#869A8C] text-[11px]">Mobile Number:</span>
                    <p className="font-semibold text-[#24362C]">
                      {selectedEnrollment.mobile || selectedEnrollment.userMobile}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#869A8C] text-[11px]">Email Address:</span>
                    <p className="font-semibold text-[#24362C]">
                      {selectedEnrollment.email || selectedEnrollment.userEmail}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#869A8C] text-[11px]">Age & Gender:</span>
                    <p className="font-semibold text-[#24362C]">
                      {selectedEnrollment.age ? `${selectedEnrollment.age} yrs` : 'Not specified'} • {selectedEnrollment.gender || 'Not specified'}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#869A8C] text-[11px]">Residential Address:</span>
                    <p className="font-medium text-[#24362C]">
                      {selectedEnrollment.address || 'Not provided'}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#869A8C] text-[11px]">Emergency Contact:</span>
                    <p className="font-medium text-[#24362C]">
                      {selectedEnrollment.emergency_contact || selectedEnrollment.emergencyContact || 'Not provided'}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#869A8C] text-[11px]">Health Considerations & Goals:</span>
                    <p className="font-medium text-[#55695C] italic bg-white p-2.5 rounded-xl border border-[#EAE3D6] mt-0.5">
                      "{selectedEnrollment.health_goals || selectedEnrollment.notes || 'None mentioned'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Details Section */}
              <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#EAE3D6] space-y-3">
                <h3 className="font-serif font-bold text-sm text-[#2D4A3E] flex items-center gap-2 border-b border-[#EAE3D6] pb-2">
                  <CalendarCheck className="w-4 h-4" />
                  Course & Batch
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[#869A8C] text-[11px]">Course:</span>
                    <p className="font-bold text-[#24362C]">
                      {selectedEnrollment.course_name || selectedEnrollment.courseName}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#869A8C] text-[11px]">Batch Timing:</span>
                    <p className="font-semibold text-[#24362C]">
                      {selectedEnrollment.batch || selectedEnrollment.batchTiming}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#869A8C] text-[11px]">Fee Amount:</span>
                    <p className="font-bold text-base text-[#2D4A3E]">
                      ₹{selectedEnrollment.amount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Details Section */}
              <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#EAE3D6] space-y-3">
                <h3 className="font-serif font-bold text-sm text-[#2D4A3E] flex items-center gap-2 border-b border-[#EAE3D6] pb-2">
                  <ShieldCheck className="w-4 h-4" />
                  Payment Verification Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#869A8C] text-[11px]">Transaction / UTR Number:</span>
                    <p className="font-mono font-bold text-sm text-[#24362C]">
                      {selectedEnrollment.utr_number || selectedEnrollment.utrNumber || selectedEnrollment.paymentId || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#869A8C] text-[11px]">Submission Date:</span>
                    <p className="font-medium text-[#24362C]">
                      {new Date(selectedEnrollment.createdAt || selectedEnrollment.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Payment Screenshot Option */}
                  {(selectedEnrollment.payment_screenshot_url || selectedEnrollment.paymentScreenshotUrl) ? (
                    <div className="sm:col-span-2 pt-2 border-t border-[#EAE3D6] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#55755E]" />
                        <span className="font-semibold text-[#24362C]">Payment Screenshot Attached</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setScreenshotModalUrl(selectedEnrollment.payment_screenshot_url || selectedEnrollment.paymentScreenshotUrl)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#2D4A3E] text-white font-semibold flex items-center gap-1.5 shadow-xs hover:bg-[#233B2B] transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Screenshot</span>
                      </button>
                    </div>
                  ) : (
                    <div className="sm:col-span-2 pt-2 border-t border-[#EAE3D6] text-[#869A8C]">
                      No screenshot was uploaded during submission.
                    </div>
                  )}

                  {/* Verification / Rejection Info */}
                  {selectedEnrollment.verified_by && (
                    <div className="sm:col-span-2 p-2.5 rounded-xl bg-white border border-[#EAE3D6] text-[11px]">
                      <span className="text-[#869A8C]">Processed By: </span>
                      <strong className="text-[#24362C]">{selectedEnrollment.verified_by}</strong>
                      <span className="text-[#869A8C]"> on </span>
                      <strong className="text-[#24362C]">
                        {new Date(selectedEnrollment.verified_at).toLocaleString()}
                      </strong>
                      {selectedEnrollment.rejection_reason && (
                        <p className="text-red-700 mt-1">
                          Reason: <strong>{selectedEnrollment.rejection_reason}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons inside modal */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(selectedEnrollment)}
                  className="px-4 py-2.5 rounded-xl bg-[#EFE9DF] hover:bg-[#E5DDCF] font-semibold text-[#2D4A3E] flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Official Receipt</span>
                </button>

                <div className="flex items-center gap-2">
                  {selectedEnrollment.payment_status !== 'Verified' && (
                    <button
                      type="button"
                      onClick={() => setVerifyTarget(selectedEnrollment)}
                      className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Verify Payment</span>
                    </button>
                  )}

                  {selectedEnrollment.payment_status !== 'Rejected' && (
                    <button
                      type="button"
                      onClick={() => setRejectTarget(selectedEnrollment)}
                      className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold border border-red-200 transition"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Payment</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONFIRM VERIFICATION MODAL                                       */}
      {/* ========================================================================= */}
      {verifyTarget && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E1DBD1] text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto ring-8 ring-green-50">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-serif font-bold text-[#24362C]">
              Verify Payment?
            </h3>

            <p className="text-xs text-[#55695C] leading-relaxed">
              Are you sure you want to verify this payment for <strong>{verifyTarget.student_name || verifyTarget.userName}</strong>?
            </p>

            <div className="p-3 bg-[#FBF9F5] rounded-xl border border-[#EAE3D6] text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-[#869A8C]">Amount:</span>
                <span className="font-bold text-[#2D4A3E]">₹{verifyTarget.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#869A8C]">UTR Number:</span>
                <span className="font-mono font-bold text-[#24362C]">{verifyTarget.utr_number || verifyTarget.utrNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#869A8C]">Course:</span>
                <span className="font-medium text-[#24362C]">{verifyTarget.course_name || verifyTarget.courseName}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setVerifyTarget(null)}
                disabled={actionLoading}
                className="w-1/2 py-2.5 rounded-xl border border-[#DDD5C7] text-[#55695C] font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyPayment}
                disabled={actionLoading}
                className="w-1/2 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold shadow-md transition disabled:opacity-50"
              >
                {actionLoading ? 'Verifying...' : 'Verify Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REJECT PAYMENT MODAL (WITH REJECTION REASON)                     */}
      {/* ========================================================================= */}
      {rejectTarget && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E1DBD1] space-y-4 text-xs text-[#24362C]">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-serif font-bold text-[#24362C]">
                Reject Payment
              </h3>
              <p className="text-xs text-[#55695C] mt-1">
                Reject enrollment for <strong>{rejectTarget.student_name || rejectTarget.userName}</strong> (UTR: {rejectTarget.utr_number || rejectTarget.utrNumber})
              </p>
            </div>

            <div>
              <label className="block text-[#4A5D50] font-semibold mb-1">
                Rejection Reason (Optional / Example: Payment could not be verified)
              </label>
              <textarea
                rows="3"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Payment could not be verified / UTR mismatch"
                className="w-full p-2.5 rounded-xl border border-[#D5CABE] bg-[#FBF9F5] text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              ></textarea>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                disabled={actionLoading}
                className="w-1/2 py-2.5 rounded-xl border border-[#DDD5C7] text-[#55695C] font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectPayment}
                disabled={actionLoading}
                className="w-1/2 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold shadow-md transition disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: FULL-SCREEN PAYMENT SCREENSHOT VIEWER LIGHTBOX                   */}
      {/* ========================================================================= */}
      {screenshotModalUrl && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-3xl w-full bg-white rounded-3xl p-4 shadow-2xl border border-gray-700 overflow-hidden flex flex-col items-center">
            <button
              onClick={() => setScreenshotModalUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full text-left pb-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-serif font-bold text-sm text-[#24362C]">Payment Screenshot Preview</span>
              <a
                href={screenshotModalUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="text-xs text-[#2D4A3E] font-semibold hover:underline flex items-center gap-1 mr-10"
              >
                <span>Open Original</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="max-h-[75vh] overflow-auto p-2 flex items-center justify-center w-full">
              <img
                src={screenshotModalUrl}
                alt="Full Payment Screenshot"
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-md border"
              />
            </div>
          </div>
        </div>
      )}

      {/* Official Printable Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          enrollment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}

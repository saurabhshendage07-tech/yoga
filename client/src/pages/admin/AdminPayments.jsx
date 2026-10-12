import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldCheck,
  IndianRupee,
  Calendar,
  XCircle,
  QrCode,
  Plus,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import {
  getPayments,
  createPaymentRecord,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
  subscribeToPayments
} from '../../services/paymentService';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    courseName: 'Beginner Yoga Foundation',
    amount: 2499,
    paymentMethod: 'UPI',
    paymentStatus: 'Success',
    utrNumber: ''
  });

  const { showToast } = useToast();

  const fetchPayments = () => {
    getPayments({ status: statusFilter, search: searchQuery })
      .then(data => {
        setPayments(data);
      })
      .catch(err => {
        console.error(err);
        showToast('Failed to load payments from Firestore', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
    const unsubscribe = subscribeToPayments((livePayments) => {
      let filtered = livePayments;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.paymentId?.toLowerCase().includes(q) ||
          p.studentName?.toLowerCase().includes(q) ||
          p.userName?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.utrNumber?.toLowerCase().includes(q)
        );
      }
      if (statusFilter !== 'all') {
        filtered = filtered.filter(p => {
          const s = (p.paymentStatus || p.status || '').toLowerCase();
          return s === statusFilter.toLowerCase();
        });
      }
      setPayments(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [statusFilter, searchQuery]);

  const handleOpenAdd = () => {
    setEditingPayment(null);
    setFormData({
      studentName: '',
      email: '',
      phone: '',
      courseName: 'Beginner Yoga Foundation',
      amount: 2499,
      paymentMethod: 'UPI',
      paymentStatus: 'Success',
      utrNumber: `UTR${Math.floor(1000000000 + Math.random() * 9000000000)}`
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPayment(p);
    setFormData({
      studentName: p.studentName || p.userName || '',
      email: p.email || p.userEmail || '',
      phone: p.phone || p.userPhone || '',
      courseName: p.courseName || '',
      amount: p.amount || 0,
      paymentMethod: p.paymentMethod || 'UPI',
      paymentStatus: p.paymentStatus || p.status || 'Pending',
      utrNumber: p.utrNumber || p.transactionId || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentName || !formData.amount) {
      showToast('Student name and amount are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingPayment) {
        await updatePayment(editingPayment.id, formData);
        showToast('Payment updated in Firestore!', 'success');
      } else {
        await createPaymentRecord(formData);
        showToast('Payment record created in Firestore!', 'success');
      }
      setModalOpen(false);
      fetchPayments();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment record from Firestore?')) return;
    try {
      await deletePayment(id);
      showToast('Payment record deleted from Firestore', 'success');
      fetchPayments();
    } catch (err) {
      showToast(err.message || 'Failed to delete payment', 'error');
    }
  };

  const handleRefund = async (id) => {
    if (!window.confirm(`Issue a refund for payment transaction "${id}"?`)) return;
    try {
      await updatePaymentStatus(id, 'Refunded');
      showToast('Payment marked as Refunded in Firestore', 'success');
      fetchPayments();
    } catch {
      showToast('Error updating payment status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#24362C]">Payment Management</h1>
          <p className="text-xs text-[#6A7E72] mt-0.5">
            Firestore payment records, UPI QR code transactions, and verification audits.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D4A3E] text-white text-xs font-bold hover:bg-[#233B2B] shadow transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Payment Record</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#869A8C] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search student, email, payment ID, UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-[#6A7E72] font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl border border-[#D5CABE] bg-white text-[#24362C]"
          >
            <option value="all">All Statuses</option>
            <option value="Success">Success Only</option>
            <option value="Pending">Pending Verification</option>
            <option value="Failed">Failed / Rejected</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-[#E1DBD1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF9F5] text-[#7A8C80] text-[11px] uppercase border-b border-[#EAE3D6]">
              <tr>
                <th className="p-4">Payment ID</th>
                <th className="p-4">Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method & UTR</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">Loading payments from Firestore...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">No payment records found</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id || p.paymentId} className="hover:bg-[#FBF9F5]/70 transition">
                    <td className="p-4 font-mono font-bold text-[#24362C]">
                      {p.paymentId || p.id}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-[#24362C]">{p.studentName || p.userName}</p>
                      <p className="text-[10px] text-[#869A8C]">{p.email || p.userEmail}</p>
                    </td>

                    <td className="p-4 text-[#55695C] font-medium">{p.courseName}</td>

                    <td className="p-4 font-bold text-sm text-[#2D4A3E]">
                      ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="p-4 space-y-0.5">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#55695C] bg-[#FBF9F5] px-2 py-0.5 rounded-md border border-[#EAE3D6]">
                        <QrCode className="w-3 h-3 text-[#C59B63]" />
                        {p.paymentMethod || 'UPI'}
                      </span>
                      {p.utrNumber && (
                        <p className="text-[10px] font-mono text-[#869A8C]">{p.utrNumber}</p>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        (p.paymentStatus === 'Success' || p.status === 'Successful' || p.paymentStatus === 'Verified')
                          ? 'bg-green-100 text-green-800'
                          : p.paymentStatus === 'Refunded'
                          ? 'bg-purple-100 text-purple-800'
                          : (p.paymentStatus === 'Failed' || p.status === 'Failed' || p.paymentStatus === 'Rejected')
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {(p.paymentStatus === 'Success' || p.status === 'Successful' || p.paymentStatus === 'Verified') && <CheckCircle2 className="w-3 h-3" />}
                        {(p.paymentStatus === 'Failed' || p.status === 'Failed' || p.paymentStatus === 'Rejected') && <XCircle className="w-3 h-3" />}
                        {(p.paymentStatus === 'Pending' || p.paymentStatus === 'Pending Verification') && <Clock className="w-3 h-3" />}
                        <span>{p.paymentStatus || p.status}</span>
                      </span>
                    </td>

                    <td className="p-4 text-[#6A7E72] text-[11px]">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg bg-[#EFE9DF] text-[#2D4A3E] hover:bg-[#E5DDCF] transition cursor-pointer"
                          title="Edit Payment"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {(p.paymentStatus === 'Success' || p.status === 'Successful' || p.paymentStatus === 'Verified') && (
                          <button
                            onClick={() => handleRefund(p.id)}
                            className="p-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 transition cursor-pointer"
                            title="Refund Payment"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Delete Payment Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Payment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#DDD5C7] space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
              <h2 className="font-serif font-bold text-lg text-[#24362C]">
                {editingPayment ? 'Edit Payment Record' : 'Record New Payment'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Student Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                  />
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Course Name</label>
                  <input
                    type="text"
                    value={formData.courseName}
                    onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                  />
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full p-2 rounded-xl border border-[#D5CABE] bg-white text-[#24362C]"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Razorpay">Razorpay Card/Netbanking</option>
                    <option value="Cash">Direct Studio Cash</option>
                    <option value="Bank Transfer">NEFT / Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Payment Status</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="w-full p-2 rounded-xl border border-[#D5CABE] bg-white text-[#24362C]"
                  >
                    <option value="Success">Success (Verified)</option>
                    <option value="Pending">Pending Verification</option>
                    <option value="Failed">Failed / Rejected</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">UTR / Transaction Number</label>
                <input
                  type="text"
                  placeholder="e.g. UTR987654321012"
                  value={formData.utrNumber}
                  onChange={(e) => setFormData({ ...formData, utrNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE3D6]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-[#2D4A3E] text-white font-bold hover:bg-[#233B2B] shadow transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : (editingPayment ? 'Save Changes' : 'Record Payment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

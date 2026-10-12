import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Bell,
  MessageSquare,
  Phone,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  Sparkles,
  Trash2
} from 'lucide-react';
import {
  getNotifications,
  createNotification,
  updateNotificationStatus,
  deleteNotification,
  subscribeToNotifications
} from '../../services/notificationService';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();

  const [customData, setCustomData] = useState({
    recipientName: '',
    mobile: '',
    recipientEmail: '',
    channel: 'WhatsApp',
    message: ''
  });

  const fetchNotifications = () => {
    getNotifications({
      search: searchQuery,
      channel: channelFilter,
      status: statusFilter
    })
      .then(data => {
        setNotifications(data);
      })
      .catch(err => {
        console.error(err);
        showToast('Failed to load notifications from Firestore', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
    const unsubscribe = subscribeToNotifications((liveNotifications) => {
      let filtered = liveNotifications;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(n =>
          n.recipientName?.toLowerCase().includes(q) ||
          n.recipientMobile?.toLowerCase().includes(q) ||
          n.mobile?.toLowerCase().includes(q) ||
          n.message?.toLowerCase().includes(q)
        );
      }
      if (channelFilter !== 'all') {
        filtered = filtered.filter(n => (n.channel || 'WhatsApp').toLowerCase() === channelFilter.toLowerCase());
      }
      if (statusFilter !== 'all') {
        filtered = filtered.filter(n => (n.status || 'Delivered').toLowerCase() === statusFilter.toLowerCase());
      }
      setNotifications(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [searchQuery, channelFilter, statusFilter]);

  const handleSendCustom = async (e) => {
    e.preventDefault();
    if (!customData.mobile || !customData.message) {
      showToast('Please enter mobile number and message', 'error');
      return;
    }

    setSending(true);
    try {
      await createNotification(customData);
      showToast('Notification saved to Firestore and dispatched! 🚀', 'success');
      setModalOpen(false);
      setCustomData({ recipientName: '', mobile: '', recipientEmail: '', channel: 'WhatsApp', message: '' });
      fetchNotifications();
    } catch (err) {
      showToast(err.message || 'Failed to dispatch message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleResend = async (id, msg) => {
    try {
      await updateNotificationStatus(id, 'Delivered');
      showToast(`Notification re-sent: "${msg?.slice(0, 30)}..."`, 'success');
      fetchNotifications();
    } catch {
      showToast('Error re-sending notification', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification record from Firestore?')) return;
    try {
      await deleteNotification(id);
      showToast('Notification record deleted from Firestore', 'success');
      fetchNotifications();
    } catch {
      showToast('Error deleting notification', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#24362C]">Notification Logs & Dispatcher</h1>
          <p className="text-xs text-[#6A7E72] mt-0.5">
            Audit automated WhatsApp and SMS delivery logs or broadcast custom messages to students via Firestore.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D4A3E] text-white text-xs font-bold hover:bg-[#233B2B] shadow transition self-start sm:self-auto cursor-pointer"
        >
          <Send className="w-4 h-4 text-[#E2B887]" />
          <span>Send Custom WhatsApp / SMS</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#869A8C] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search recipient, mobile, message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="p-2 rounded-xl border border-[#D5CABE] bg-white text-[#24362C]"
          >
            <option value="all">All Channels</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="SMS">SMS</option>
            <option value="Email">Email</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl border border-[#D5CABE] bg-white text-[#24362C]"
          >
            <option value="all">All Delivery Statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="Sent">Sent</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-3xl border border-[#E1DBD1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF9F5] text-[#7A8C80] text-[11px] uppercase border-b border-[#EAE3D6]">
              <tr>
                <th className="p-4">Recipient & Channel</th>
                <th className="p-4">Type</th>
                <th className="p-4">Message Content Preview</th>
                <th className="p-4">Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">Loading notifications from Firestore...</td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">No notification logs found in Firestore</td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-[#FBF9F5]/70 transition">
                    <td className="p-4">
                      <p className="font-bold text-[#24362C]">{n.recipientName}</p>
                      <p className="text-[11px] text-[#55695C]">{n.recipientMobile || n.mobile}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[10px] text-[#2D4A3E] font-medium">
                        {n.channel || 'WhatsApp'}
                      </span>
                    </td>

                    <td className="p-4 font-medium text-[#2D4A3E]">
                      {n.type === 'welcome_enrollment' ? '🎉 Welcome & Enrollment' : '📢 Custom Broadcast'}
                    </td>

                    <td className="p-4 max-w-sm">
                      <p className="text-xs text-[#4A5D50] line-clamp-2 whitespace-pre-line font-sans">
                        {n.message}
                      </p>
                    </td>

                    <td className="p-4 text-[#6A7E72]">
                      <p>{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '—'}</p>
                      <p className="text-[10px] text-[#869A8C]">
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        (n.status === 'Delivered' || n.status === 'Sent')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {(n.status === 'Delivered' || n.status === 'Sent') ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        <span>{n.status || 'Delivered'}</span>
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleResend(n.id, n.message)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#EFE9DF] text-[#2D4A3E] hover:bg-[#E5DDCF] transition cursor-pointer"
                          title="Re-send notification"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Resend</span>
                        </button>
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="p-1 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Delete notification"
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

      {/* Send Custom Message Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-[#DDD5C7] shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D6]">
              <h3 className="font-serif font-bold text-lg text-[#24362C]">
                Dispatch Notification
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendCustom} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Student / Recipient Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={customData.recipientName}
                  onChange={(e) => setCustomData({ ...customData, recipientName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={customData.mobile}
                  onChange={(e) => setCustomData({ ...customData, mobile: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Dispatch Channel</label>
                <select
                  value={customData.channel}
                  onChange={(e) => setCustomData({ ...customData, channel: e.target.value })}
                  className="w-full p-2 rounded-xl border border-[#D5CABE] bg-white text-[#24362C]"
                >
                  <option value="WhatsApp">WhatsApp Message</option>
                  <option value="SMS">SMS Text</option>
                  <option value="Email">Email</option>
                </select>
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Message Body *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Type your message here..."
                  value={customData.message}
                  onChange={(e) => setCustomData({ ...customData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE3D6]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2 rounded-xl bg-[#2D4A3E] text-white font-bold hover:bg-[#233B2B] shadow cursor-pointer disabled:opacity-50"
                >
                  {sending ? 'Dispatching...' : 'Send Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

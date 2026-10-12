import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Trash2,
  Mail,
  Phone,
  Clock,
  Send,
  ExternalLink,
  Plus,
  X
} from 'lucide-react';
import {
  getContactMessages,
  addContactMessage,
  updateMessageStatus,
  deleteContactMessage,
  subscribeToContactMessages
} from '../../services/contactService';

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  
  const [newEnquiry, setNewEnquiry] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Yoga Inquiry',
    message: ''
  });

  const { showToast } = useToast();

  const fetchMessages = () => {
    getContactMessages({ status: statusFilter, search: searchQuery })
      .then(data => {
        setMessages(data);
      })
      .catch(err => {
        console.error(err);
        showToast('Failed to load inquiries from Firestore', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
    const unsubscribe = subscribeToContactMessages((liveMessages) => {
      let filtered = liveMessages;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(m =>
          m.name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.phone?.toLowerCase().includes(q) ||
          m.subject?.toLowerCase().includes(q) ||
          m.message?.toLowerCase().includes(q)
        );
      }
      if (statusFilter !== 'all') {
        filtered = filtered.filter(m => {
          const s = (m.status || 'unread').toLowerCase();
          if (statusFilter === 'New' || statusFilter === 'unread') {
            return s === 'unread' || s === 'new';
          }
          return s === statusFilter.toLowerCase();
        });
      }
      setMessages(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [statusFilter, searchQuery]);

  const handleCreateEnquiry = async (e) => {
    e.preventDefault();
    if (!newEnquiry.name || !newEnquiry.email || !newEnquiry.message) {
      showToast('Name, email, and message are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      await addContactMessage(newEnquiry);
      showToast('New enquiry recorded in Firestore!', 'success');
      setModalOpen(false);
      setNewEnquiry({ name: '', email: '', phone: '', subject: 'General Yoga Inquiry', message: '' });
      fetchMessages();
    } catch (err) {
      showToast(err.message || 'Failed to record enquiry', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateMessageStatus(id, newStatus);
      showToast('Inquiry status updated in Firestore', 'success');
      fetchMessages();
    } catch {
      showToast('Error updating message status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry from Firestore?')) return;
    try {
      await deleteContactMessage(id);
      showToast('Message deleted from Firestore', 'success');
      fetchMessages();
    } catch {
      showToast('Error deleting message', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#24362C]">Contact Inquiries & Leads</h1>
          <p className="text-xs text-[#6A7E72] mt-0.5">
            Prospective students seeking batch information, private coaching, or studio visits (Firestore "enquiries" collection).
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D4A3E] text-white text-xs font-bold hover:bg-[#233B2B] shadow transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Inquiry</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#869A8C] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search inquiries by name, message, email..."
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
            <option value="all">All Inquiries</option>
            <option value="New">Unread Only</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading messages from Firestore...</div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E1DBD1] space-y-2">
            <p className="font-serif font-bold text-base text-[#24362C]">No inquiries found</p>
            <p className="text-xs text-[#6A7E72]">Contact submissions from the website will appear here in real-time.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-6 rounded-3xl bg-white border transition shadow-xs space-y-4 ${
                msg.status === 'unread' || msg.status === 'New' ? 'border-[#55755E] ring-1 ring-[#55755E]/20' : 'border-[#E1DBD1]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      msg.status === 'unread' || msg.status === 'New'
                        ? 'bg-amber-100 text-amber-800'
                        : msg.status === 'replied'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {msg.status || 'unread'}
                    </span>
                    <span className="text-[11px] text-[#869A8C] font-semibold">
                      Subject: {msg.subject || 'Yoga Inquiry'}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#24362C]">
                    {msg.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={msg.status || 'unread'}
                    onChange={(e) => handleUpdateStatus(msg.id, e.target.value)}
                    className="p-1.5 rounded-lg border border-[#D5CABE] bg-white text-xs font-semibold text-[#2D4A3E]"
                  >
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>

                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#EAE3D6] text-xs text-[#24362C] leading-relaxed">
                {msg.message}
              </div>

              {/* Contact Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-[#6A7E72] border-t border-[#F0EAE1]">
                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href={`mailto:${msg.email}`}
                    className="flex items-center gap-1.5 hover:text-[#2D4A3E] font-medium"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#55755E]" />
                    <span>{msg.email}</span>
                  </a>
                  {msg.phone && (
                    <a
                      href={`https://wa.me/${msg.phone.replace(/\D/g, '')}?text=Namaste%20${encodeURIComponent(msg.name)}!%20Regarding%20your%20yoga%20inquiry...`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 hover:text-green-700 font-semibold text-[#25D366]"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{msg.phone} (Reply via WhatsApp)</span>
                    </a>
                  )}
                </div>

                <div className="text-[11px] text-[#869A8C]">
                  Received: {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : '—'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add New Inquiry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-[#DDD5C7] shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D6]">
              <h3 className="font-serif font-bold text-lg text-[#24362C]">
                Record New Lead / Inquiry
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEnquiry} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={newEnquiry.name}
                  onChange={(e) => setNewEnquiry({ ...newEnquiry, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="priya@example.com"
                    value={newEnquiry.email}
                    onChange={(e) => setNewEnquiry({ ...newEnquiry, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                  />
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={newEnquiry.phone}
                    onChange={(e) => setNewEnquiry({ ...newEnquiry, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Morning Sunrise Batch Enquiry"
                  value={newEnquiry.subject}
                  onChange={(e) => setNewEnquiry({ ...newEnquiry, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Message *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Details about the enquiry..."
                  value={newEnquiry.message}
                  onChange={(e) => setNewEnquiry({ ...newEnquiry, message: e.target.value })}
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
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#2D4A3E] text-white font-bold hover:bg-[#233B2B] shadow cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

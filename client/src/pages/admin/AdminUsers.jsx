import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Shield,
  UserCheck,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  X,
  Sparkles
} from 'lucide-react';
import {
  getUsers,
  addStudent,
  updateStudent,
  deleteStudent,
  toggleUserStatus,
  subscribeToUsers
} from '../../services/userService';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
    courseName: 'Beginner Yoga Foundation',
    batch: 'Morning Sunrise Batch',
    address: '',
    emergencyContact: '',
    notes: ''
  });

  const { showToast } = useToast();

  const fetchUsers = () => {
    getUsers({ search: searchQuery, role: roleFilter, status: statusFilter })
      .then(data => {
        setUsers(data);
      })
      .catch(err => {
        console.error(err);
        showToast('Failed to load students from Firestore', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
    const unsubscribe = subscribeToUsers((liveUsers) => {
      let filtered = liveUsers;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(u =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          u.mobile?.toLowerCase().includes(q)
        );
      }
      if (roleFilter !== 'all') {
        filtered = filtered.filter(u => (u.role || 'user').toLowerCase() === roleFilter.toLowerCase());
      }
      if (statusFilter !== 'all') {
        filtered = filtered.filter(u => {
          const s = (u.status || (u.isActive !== false ? 'active' : 'inactive')).toLowerCase();
          return s === statusFilter.toLowerCase();
        });
      }
      setUsers(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [searchQuery, roleFilter, statusFilter]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'active',
      courseName: 'Beginner Yoga Foundation',
      batch: 'Morning Sunrise Batch',
      address: '',
      emergencyContact: '',
      notes: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || user.mobile || '',
      role: user.role || 'user',
      status: user.status || (user.isActive !== false ? 'active' : 'inactive'),
      courseName: Array.isArray(user.activeCourses) && user.activeCourses.length > 0 ? user.activeCourses[0] : (user.courseName || ''),
      batch: user.batch || 'Morning Sunrise Batch',
      address: user.address || '',
      emergencyContact: user.emergencyContact || '',
      notes: user.notes || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast('Name and email are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        await updateStudent(editingUser.id || editingUser.uid, {
          ...formData,
          activeCourses: formData.courseName ? [formData.courseName] : []
        });
        showToast('Student details updated in Firestore!', 'success');
      } else {
        await addStudent(formData);
        showToast('New student added to Firestore!', 'success');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete student "${name}" from Firestore?`)) return;
    try {
      await deleteStudent(id);
      showToast('Student deleted from Firestore', 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to delete student', 'error');
    }
  };

  const handleToggleActive = async (id, name, currentStatus) => {
    try {
      await toggleUserStatus(id, currentStatus);
      showToast(`Student status updated for ${name}`, 'success');
      fetchUsers();
    } catch {
      showToast('Error toggling student status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#24362C]">Student Directory</h1>
          <p className="text-xs text-[#6A7E72] mt-0.5">
            Firestore-connected student registry with live enrollment status, account controls, and CRUD management.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D4A3E] text-white text-xs font-bold hover:bg-[#233B2B] shadow transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Controls & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#869A8C] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#6A7E72] font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-2 rounded-xl border border-[#D5CABE] bg-white text-[#24362C]"
            >
              <option value="all">All Roles</option>
              <option value="user">Students Only</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#6A7E72] font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 rounded-xl border border-[#D5CABE] bg-white text-[#24362C]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-[#E1DBD1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF9F5] text-[#7A8C80] text-[11px] uppercase border-b border-[#EAE3D6]">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Enrolled Course</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">Loading student directory from Firestore...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">No students found matching criteria</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id || user.uid} className="hover:bg-[#FBF9F5]/70 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EFE9DF] text-[#2D4A3E] font-bold flex items-center justify-center text-xs shrink-0">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-[#24362C]">{user.name}</p>
                          <span className="text-[10px] text-[#869A8C] font-mono">{user.uid || user.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[#55695C] space-y-0.5">
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-[#7A8C80]" /> {user.email}
                      </p>
                      {(user.phone || user.mobile) && (
                        <p className="flex items-center gap-1.5 text-[11px]">
                          <Phone className="w-3 h-3 text-[#7A8C80]" /> {user.phone || user.mobile}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      {user.activeCourses && user.activeCourses.length > 0 ? (
                        <div>
                          <p className="font-semibold text-[#2D4A3E]">{user.activeCourses[0]}</p>
                          {user.activeCourses.length > 1 && (
                            <span className="text-[10px] text-[#869A8C]">+{user.activeCourses.length - 1} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">None</span>
                      )}
                    </td>
                    <td className="p-4 text-[#7A8C80] text-[11px]">
                      {user.createdAt ? (
                        new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      ) : '—'}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(user.id || user.uid, user.name, user.status || (user.isActive !== false ? 'active' : 'inactive'))}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition ${
                          user.status === 'active' || user.isActive !== false ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {user.status === 'active' || user.isActive !== false ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{user.status === 'active' || user.isActive !== false ? 'Active' : 'Suspended'}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 rounded-lg bg-[#EFE9DF] text-[#2D4A3E] hover:bg-[#E5DDCF] transition cursor-pointer"
                          title="Edit Student"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id || user.uid, user.name)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Delete Student"
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

      {/* Add / Edit Student Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#DDD5C7] space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
              <h2 className="font-serif font-bold text-lg text-[#24362C]">
                {editingUser ? 'Edit Student Record' : 'Add New Student'}
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
                <label className="block text-[#4A5D50] font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Phone / Mobile</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Enrolled Course</label>
                  <input
                    type="text"
                    placeholder="e.g. Beginner Yoga Foundation"
                    value={formData.courseName}
                    onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                  />
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Batch Schedule</label>
                  <input
                    type="text"
                    placeholder="e.g. Morning Sunrise Batch"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2 rounded-xl border border-[#D5CABE] bg-white text-[#24362C]"
                  >
                    <option value="user">Student (User)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2 rounded-xl border border-[#D5CABE] bg-white text-[#24362C]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Address (Optional)</label>
                <input
                  type="text"
                  placeholder="City or residential address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
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
                  {saving ? 'Saving...' : (editingUser ? 'Save Changes' : 'Create Student')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  IndianRupee,
  Search,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
  subscribeToCourses
} from '../../services/courseService';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    duration: '4 Weeks (12 Sessions)',
    timing: '06:30 AM - 07:30 AM (Mon, Wed, Fri)',
    batch: 'Morning Sunrise Batch',
    fee: 2499,
    originalFee: 3499,
    level: 'Beginner',
    instructor: 'Acharya Ananya Sharma',
    totalSeats: 20,
    availableSeats: 15,
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
    benefits: 'Improve flexibility\nRelieve stress and back pain\nLearn pranayama',
    requirements: 'Suitable for beginners\nComfortable clothing and yoga mat',
    isActive: true
  });

  const fetchCourses = () => {
    getCourses({ includeInactive: true })
      .then(data => {
        setCourses(data);
      })
      .catch(err => {
        console.error(err);
        showToast('Failed to load courses from Firestore', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
    const unsubscribe = subscribeToCourses((liveCourses) => {
      setCourses(liveCourses);
      setLoading(false);
    }, { includeInactive: true });

    return () => unsubscribe();
  }, []);

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      name: '',
      shortDescription: '',
      description: '',
      duration: '4 Weeks (12 Sessions)',
      timing: '06:30 AM - 07:30 AM (Mon, Wed, Fri)',
      batch: 'Morning Sunrise Batch',
      fee: 2499,
      originalFee: 3499,
      level: 'Beginner',
      instructor: 'Acharya Ananya Sharma',
      totalSeats: 20,
      availableSeats: 15,
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
      benefits: 'Improve flexibility\nRelieve stress and back pain\nLearn pranayama',
      requirements: 'Suitable for beginners\nComfortable clothing and yoga mat',
      isActive: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name || course.title,
      shortDescription: course.shortDescription || '',
      description: course.description || '',
      duration: course.duration || '4 Weeks',
      timing: course.timing || '',
      batch: course.batch || course.timing || '',
      fee: course.fee !== undefined ? course.fee : course.price,
      originalFee: course.originalFee || course.fee || course.price,
      level: course.level || 'All Levels',
      instructor: course.instructor || 'Lead Acharya',
      totalSeats: course.totalSeats || 20,
      availableSeats: course.availableSeats !== undefined ? course.availableSeats : 20,
      image: course.image || '',
      benefits: Array.isArray(course.benefits) ? course.benefits.join('\n') : (course.benefits || ''),
      requirements: Array.isArray(course.requirements) ? course.requirements.join('\n') : (course.requirements || ''),
      isActive: course.isActive !== false
    });
    setModalOpen(true);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleCourseStatus(id, currentStatus);
      showToast('Course status updated in Firestore', 'success');
      fetchCourses();
    } catch {
      showToast('Failed to toggle course status', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete course "${name}"?`)) return;
    try {
      await deleteCourse(id);
      showToast('Course deleted from Firestore', 'success');
      fetchCourses();
    } catch {
      showToast('Failed to delete course', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, formData);
        showToast('Course updated in Firestore!', 'success');
      } else {
        await addCourse(formData);
        showToast('New course created in Firestore!', 'success');
      }
      setModalOpen(false);
      fetchCourses();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.instructor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.level?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#24362C]">Yoga Courses Management</h1>
          <p className="text-xs text-[#6A7E72] mt-0.5">
            Add, update fees, schedules, images, and enable/disable public course batches.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D4A3E] text-white text-xs font-bold hover:bg-[#233B2B] shadow transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-[#869A8C] absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by course name, level, instructor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
        />
      </div>

      {/* Courses List Table */}
      <div className="bg-white rounded-3xl border border-[#E1DBD1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF9F5] text-[#7A8C80] text-[11px] uppercase border-b border-[#EAE3D6]">
              <tr>
                <th className="p-4">Course</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Instructor</th>
                <th className="p-4">Fee (₹)</th>
                <th className="p-4">Seats</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">Loading courses...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">No courses found</td>
                </tr>
              ) : (
                filtered.map((course) => (
                  <tr key={course.id} className="hover:bg-[#FBF9F5]/70 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.image}
                          alt={course.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <p className="font-bold text-[#24362C] text-sm">{course.name}</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-[#EFE9DF] text-[10px] text-[#2D4A3E] font-medium">
                            {course.level}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[#55695C]">
                      <p className="font-medium text-[#24362C]">{course.duration}</p>
                      <p className="text-[11px] text-[#869A8C]">{course.timing}</p>
                    </td>
                    <td className="p-4 font-medium text-[#24362C]">{course.instructor}</td>
                    <td className="p-4 font-bold text-sm text-[#2D4A3E]">
                      ₹{course.fee}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-[#24362C]">{course.availableSeats || 0}</span>
                      <span className="text-[#869A8C]"> / {course.totalSeats || 20}</span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(course.id, course.isActive !== false)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                          course.isActive !== false
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {course.isActive !== false ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{course.isActive !== false ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(course)}
                          className="p-1.5 rounded-lg bg-[#EFE9DF] text-[#2D4A3E] hover:bg-[#E5DDCF] transition"
                          title="Edit Course"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id, course.name)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                          title="Delete Course"
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

      {/* Add / Edit Course Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#DDD5C7] space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
              <h2 className="font-serif font-bold text-xl text-[#24362C]">
                {editingCourse ? 'Edit Yoga Course' : 'Create New Yoga Course'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full p-2 rounded-xl border border-[#D5CABE] text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                    <option value="Customized">Customized</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Short Description (for cards)</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Complete Course Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                  />
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Class Timing</label>
                  <input
                    type="text"
                    value={formData.timing}
                    onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                  />
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Lead Instructor</label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Course Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                  />
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Original Fee (₹)</label>
                  <input
                    type="number"
                    value={formData.originalFee}
                    onChange={(e) => setFormData({ ...formData, originalFee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                  />
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Total Seats</label>
                  <input
                    type="number"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                  />
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Available Seats</label>
                  <input
                    type="number"
                    value={formData.availableSeats}
                    onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">Course Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Key Benefits (1 per line)</label>
                  <textarea
                    rows="2"
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Requirements (1 per line)</label>
                  <textarea
                    rows="2"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] text-[#24362C]"
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE3D6]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#2D4A3E] text-white font-bold hover:bg-[#233B2B] shadow transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : (editingCourse ? 'Save Changes' : 'Create Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

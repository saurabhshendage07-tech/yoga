import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import EnrollmentModal from './components/common/EnrollmentModal';
import ClickRipple from './components/common/ClickRipple';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import { getCourses } from './services/courseService';
import { initialCourses } from './services/mockData';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Contact from './pages/Contact';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEnrollments from './pages/admin/AdminEnrollments';
import AdminPayments from './pages/admin/AdminPayments';
import AdminPaymentSettings from './pages/admin/AdminPaymentSettings';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminContactMessages from './pages/admin/AdminContactMessages';
import AdminSettings from './pages/admin/AdminSettings';
import AdminFooter from './pages/admin/AdminFooter';

export default function App() {
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(initialCourses[0]);
  const [allCourses, setAllCourses] = useState(initialCourses);
  const location = useLocation();

  useEffect(() => {
    // Scroll to top upon page navigation
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    getCourses()
      .then(courses => {
        if (courses && courses.length > 0) {
          setAllCourses(courses);
        }
      })
      .catch(err => console.warn('Notice: App.jsx getCourses fallback:', err));
  }, []);

  const handleOpenEnroll = (course = null) => {
    setSelectedCourseForEnroll(course || allCourses[0] || null);
    setEnrollModalOpen(true);
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] w-full max-w-full overflow-x-hidden box-border">
      {/* Global Interactive Click Ripple */}
      <ClickRipple />

      {/* User Navigation (only on public pages) */}
      {!isAdminRoute && <Navbar onOpenEnroll={handleOpenEnroll} />}

      {/* Main Page Routing */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden box-border">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home onOpenEnroll={handleOpenEnroll} />} />
          <Route path="/about" element={<About onOpenEnroll={handleOpenEnroll} />} />
          <Route path="/courses" element={<Courses onOpenEnroll={handleOpenEnroll} />} />
          <Route path="/courses/:idOrSlug" element={<CourseDetail onOpenEnroll={handleOpenEnroll} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<UserDashboard onOpenEnroll={handleOpenEnroll} />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="enrollments" element={<AdminEnrollments />} />
              <Route path="payment-settings" element={<AdminPaymentSettings />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="messages" element={<AdminContactMessages />} />
              <Route path="footer" element={<AdminFooter />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
      </main>

      {/* Global Enrollment & Payment Modal */}
      <EnrollmentModal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        preselectedCourse={selectedCourseForEnroll}
        allCourses={allCourses}
      />

      {/* Footer (only on public pages) */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

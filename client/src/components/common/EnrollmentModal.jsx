import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createBooking } from '../../services/bookingService';
import { getPaymentSettings } from '../../services/paymentService';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  Copy,
  Check,
  Upload,
  ArrowLeft,
  ArrowRight,
  QrCode,
  Image as ImageIcon,
  HelpCircle,
  Hourglass
} from 'lucide-react';

export default function EnrollmentModal({ isOpen, onClose, preselectedCourse, allCourses = [] }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Current Step: 1 = Form, 2 = QR Payment, 3 = Payment Verification (UTR), 4 = Success
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    age: '',
    gender: 'Female',
    courseId: preselectedCourse?.id || '',
    preferredBatch: '',
    address: '',
    emergencyContact: '',
    notes: '',
    utrNumber: '',
    paymentScreenshot: null,
    screenshotPreview: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submittedEnrollment, setSubmittedEnrollment] = useState(null);

  // Payment Settings from backend
  const [paymentSettings, setPaymentSettings] = useState({
    qr_code_url: '',
    upi_id: 'yogaclass@upi',
    payment_instructions: 'Scan this QR code using Google Pay, PhonePe, Paytm or any UPI app.',
    is_active: true
  });
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Selected course details
  const selectedCourse = (allCourses.find(c => c.id === formData.courseId) || preselectedCourse) || allCourses[0];

  // Fetch Payment Settings from Firestore
  const fetchPaymentSettings = async () => {
    setLoadingSettings(true);
    try {
      const data = await getPaymentSettings();
      if (data) {
        setPaymentSettings(data);
      }
    } catch (err) {
      console.warn('Notice: Using default payment settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPaymentSettings();
    }
  }, [isOpen]);

  useEffect(() => {
    if (preselectedCourse) {
      setFormData(prev => ({
        ...prev,
        courseId: preselectedCourse.id,
        preferredBatch: preselectedCourse.batch || preselectedCourse.timing || 'Morning Sunrise Batch (06:30 AM - 07:30 AM)'
      }));
    } else if (allCourses.length > 0 && !formData.courseId) {
      setFormData(prev => ({
        ...prev,
        courseId: allCourses[0].id,
        preferredBatch: allCourses[0].batch || allCourses[0].timing || 'Morning Sunrise Batch (06:30 AM - 07:30 AM)'
      }));
    }
  }, [preselectedCourse, allCourses]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        mobile: prev.mobile || user.mobile || ''
      }));
    }
  }, [user]);

  if (!isOpen) return null;

  // Validation for Step 1
  const validateStep1 = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.mobile.trim()) errs.mobile = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(formData.mobile.replace(/\D/g, '').slice(-10))) {
      errs.mobile = 'Please enter a valid 10-digit mobile number';
    }
    if (!formData.email.trim()) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Please enter a valid email address';
    if (!formData.age) errs.age = 'Age is required';
    else if (Number(formData.age) < 10 || Number(formData.age) > 95) errs.age = 'Age must be between 10 and 95';
    if (!formData.courseId) errs.courseId = 'Please select a course';
    if (!formData.preferredBatch) errs.preferredBatch = 'Please select a preferred batch';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validation for Step 3 (Payment Verification)
  const validateStep3 = () => {
    const errs = {};
    if (!formData.utrNumber.trim()) {
      errs.utrNumber = 'Transaction / UTR Number is required';
    } else if (formData.utrNumber.trim().length < 6) {
      errs.utrNumber = 'Please enter a valid UTR / Transaction ID (min 6 characters)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCourseChange = (e) => {
    const cid = e.target.value;
    const c = allCourses.find(item => item.id === cid);
    setFormData(prev => ({
      ...prev,
      courseId: cid,
      preferredBatch: c?.batch || c?.timing || 'Morning Sunrise Batch (06:30 AM - 07:30 AM)'
    }));
  };

  // Handle Screenshot Upload
  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Invalid file format. Allowed formats: PNG, JPG, JPEG, WEBP.', 'error');
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        paymentScreenshot: reader.result,
        screenshotPreview: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setFormData(prev => ({
      ...prev,
      paymentScreenshot: null,
      screenshotPreview: null
    }));
  };

  // Copy UPI ID helper
  const handleCopyUpi = () => {
    if (paymentSettings?.upi_id) {
      navigator.clipboard.writeText(paymentSettings.upi_id);
      setCopiedUpi(true);
      showToast('UPI ID copied to clipboard!', 'success');
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  // Move from Step 1 -> Step 2
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!validateStep1()) {
      showToast('Please fill in all required fields accurately.', 'error');
      return;
    }
    // Refresh latest payment settings before showing QR
    fetchPaymentSettings();
    setCurrentStep(2);
  };

  // Move from Step 2 -> Step 3
  const handleCompletedPaymentClick = () => {
    setCurrentStep(3);
  };

  // Submit Enrollment (Step 3 -> Step 4)
  const handleSubmitEnrollment = async (e) => {
    e.preventDefault();
    if (!validateStep3()) {
      showToast('Please enter the Transaction / UTR Number.', 'error');
      return;
    }

    setLoading(true);
    try {
      let uploadedScreenshotUrl = '';

      // If user provided a screenshot, upload it first
      if (formData.paymentScreenshot) {
        try {
          const uploadRes = await fetch('/api/enrollments/upload-screenshot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: formData.paymentScreenshot })
          });
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.data?.url) {
            uploadedScreenshotUrl = uploadData.data.url;
          }
        } catch (uploadErr) {
          console.warn('Screenshot upload fallback warning:', uploadErr.message);
        }
      }

      // Submit enrollment to Firestore
      const newBooking = await createBooking({
        userId: user?.id || user?.uid || null,
        userName: formData.fullName,
        student_name: formData.fullName,
        userEmail: formData.email,
        email: formData.email,
        userPhone: formData.mobile,
        mobile: formData.mobile,
        age: formData.age,
        gender: formData.gender,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        notes: formData.notes,
        courseId: selectedCourse?.id || '',
        courseName: selectedCourse?.name || selectedCourse?.title || 'Yoga Course',
        amount: selectedCourse?.fee || selectedCourse?.price || 2499,
        preferredBatch: formData.preferredBatch,
        batch: formData.preferredBatch,
        utrNumber: formData.utrNumber,
        bookingStatus: 'pending',
        paymentStatus: 'pending',
        paymentScreenshotUrl: formData.paymentScreenshot || uploadedScreenshotUrl
      });

      setSubmittedEnrollment(newBooking);
      setCurrentStep(4);
      showToast('Enrollment Submitted Successfully to Firestore! 🙏', 'success');

      // Celebration Confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      showToast(err.message || 'Error submitting enrollment. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSubmittedEnrollment(null);
    setFormData(prev => ({
      ...prev,
      utrNumber: '',
      paymentScreenshot: null,
      screenshotPreview: null
    }));
    onClose();
  };

  const isQrAvailable = Boolean(paymentSettings?.qr_code_url && paymentSettings?.is_active);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#FAF8F5] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E1DBD1] relative my-8 text-[#24362C]">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#6A7E72] hover:text-[#24362C] hover:bg-black/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================================================= */}
        {/* STEP 1: ENROLLMENT FORM                                                   */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div>
            {/* Modal Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE9DF] text-[#2D4A3E] text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C59B63]" />
                Direct Studio Registration
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#24362C]">
                Enroll in Yoga Course
              </h2>
              <p className="text-xs text-[#6A7E72] mt-1">
                Fill your details to reserve your seat. Instant UPI QR payment verification.
              </p>
            </div>

            {/* Course Summary Card */}
            {selectedCourse && (
              <div className="mb-6 p-4 rounded-2xl bg-white border border-[#E4DDD3] flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedCourse.image}
                    alt={selectedCourse.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#24362C]">
                      {selectedCourse.name}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-[#6A7E72] mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#55755E]" /> {selectedCourse.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#55755E]" /> {selectedCourse.timing}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-[#869A8C] uppercase font-semibold">Course Fee</p>
                  <p className="text-lg font-bold text-[#2D4A3E]">₹{selectedCourse.fee}</p>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleProceedToPayment} className="space-y-4 text-xs">
              {/* Row 1: Course Selection & Preferred Batch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Select Course *</label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleCourseChange}
                    className="w-full p-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
                  >
                    {allCourses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (₹{c.fee})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Preferred Batch Timing *</label>
                  <select
                    name="preferredBatch"
                    value={formData.preferredBatch}
                    onChange={handleInputChange}
                    className={`w-full p-2.5 rounded-xl border ${errors.preferredBatch ? 'border-red-400 bg-red-50' : 'border-[#D5CABE] bg-white'} text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none`}
                  >
                    <option value="Morning Sunrise Batch (06:30 AM - 07:30 AM)">Morning Sunrise Batch (06:30 AM - 07:30 AM)</option>
                    <option value="Morning Power Flow (07:45 AM - 09:00 AM)">Morning Power Flow (07:45 AM - 09:00 AM)</option>
                    <option value="Evening Fat-Burn Batch (06:00 PM - 07:00 PM)">Evening Fat-Burn Batch (06:00 PM - 07:00 PM)</option>
                    <option value="Evening De-stress Batch (07:30 PM - 08:30 PM)">Evening De-stress Batch (07:30 PM - 08:30 PM)</option>
                    <option value="Brahma Muhurta Batch (05:30 AM - 06:30 AM)">Brahma Muhurta Batch (05:30 AM - 06:30 AM)</option>
                    <option value="Flexible 1-on-1 Slot">Flexible 1-on-1 Slot</option>
                  </select>
                  {errors.preferredBatch && <p className="text-red-500 text-[10px] mt-1">{errors.preferredBatch}</p>}
                </div>
              </div>

              {/* Row 2: Full Name & Mobile Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#869A8C] absolute left-3 top-3" />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="e.g. Aarav Sharma"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border ${errors.fullName ? 'border-red-400 bg-red-50' : 'border-[#D5CABE] bg-white'} text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none`}
                    />
                  </div>
                  {errors.fullName && <p className="text-red-500 text-[10px] mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">WhatsApp / Mobile Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#869A8C] absolute left-3 top-3" />
                    <input
                      type="tel"
                      name="mobile"
                      placeholder="10-digit mobile number"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border ${errors.mobile ? 'border-red-400 bg-red-50' : 'border-[#D5CABE] bg-white'} text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none`}
                    />
                  </div>
                  {errors.mobile && <p className="text-red-500 text-[10px] mt-1">{errors.mobile}</p>}
                </div>
              </div>

              {/* Row 3: Email Address, Age, Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-[#4A5D50] font-semibold mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#869A8C] absolute left-3 top-3" />
                    <input
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border ${errors.email ? 'border-red-400 bg-red-50' : 'border-[#D5CABE] bg-white'} text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Age *</label>
                  <input
                    type="number"
                    name="age"
                    placeholder="e.g. 26"
                    min="10"
                    max="95"
                    value={formData.age}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 rounded-xl border ${errors.age ? 'border-red-400 bg-red-50' : 'border-[#D5CABE] bg-white'} text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none`}
                  />
                  {errors.age && <p className="text-red-500 text-[10px] mt-1">{errors.age}</p>}
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full p-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Address & Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Residential City / Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="e.g. Ram Mandir Chowk, Sangli"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#4A5D50] font-semibold mb-1">Emergency Contact (Name & Phone)</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    placeholder="e.g. Mother - 9876543211"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 5: Health considerations or goals */}
              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">
                  Health Considerations or Goals (Optional)
                </label>
                <textarea
                  name="notes"
                  rows="2"
                  placeholder="e.g. Lower back stiffness, beginner flexibility goals, previous injury notes..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CABE] bg-white text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
                ></textarea>
              </div>

              {/* Action Button: Pay ₹{fee} & Confirm Seat */}
              <div className="pt-4 border-t border-[#E1DBD1] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[11px] text-[#6A7E72]">
                  <Lock className="w-4 h-4 text-[#55755E]" />
                  <span>Encrypted & Verified UPI Payment</span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#2D4A3E] hover:bg-[#233B2B] text-white text-xs font-bold tracking-wide shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#E2B887]" />
                  <span>Pay ₹{selectedCourse?.fee || 1999} & Confirm Seat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: "COMPLETE YOUR PAYMENT" (DYNAMIC UPI QR CODE)                    */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="text-center">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#55755E]">
                Step 2 of 3 • Direct UPI Transfer
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#24362C] mt-1">
                Complete Your Payment
              </h2>
            </div>

            {/* Course Name & Amount Box */}
            <div className="p-4 rounded-2xl bg-white border border-[#E1DBD1] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#869A8C] tracking-wider">Course Name</p>
                <h3 className="font-serif font-bold text-base text-[#24362C] mt-0.5">
                  {selectedCourse?.name || 'Pranayama & Mindful Meditation'}
                </h3>
              </div>
              <div className="text-right pl-4 border-l border-[#EAE3D6]">
                <p className="text-[10px] uppercase font-bold text-[#869A8C] tracking-wider">Amount</p>
                <p className="text-2xl font-serif font-bold text-[#2D4A3E]">
                  ₹{selectedCourse?.fee || 1999}
                </p>
              </div>
            </div>

            {/* QR Code Presentation */}
            {isQrAvailable ? (
              <div className="bg-white rounded-3xl p-6 border border-[#E1DBD1] shadow-sm text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE9DF] text-[#2D4A3E] text-xs font-bold">
                  <QrCode className="w-3.5 h-3.5 text-[#55755E]" />
                  Scan & Pay
                </div>

                {/* Large Crisp QR Code Frame */}
                <div className="relative mx-auto w-56 sm:w-64 aspect-square p-3 bg-white rounded-2xl border-2 border-[#2D4A3E] shadow-md flex items-center justify-center">
                  <img
                    src={paymentSettings.qr_code_url}
                    alt="UPI Payment QR Code"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>

                {/* Subtext */}
                <p className="text-xs text-[#55695C] font-medium max-w-sm mx-auto">
                  {paymentSettings.payment_instructions || 'Scan this QR code using Google Pay, PhonePe, Paytm or any UPI app.'}
                </p>

                {/* UPI ID Badge with Copy Option */}
                <div className="inline-flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-[#F7F4EE] border border-[#DDD5C7] text-xs font-mono text-[#24362C]">
                  <span>UPI ID: <strong>{paymentSettings.upi_id || 'yogaclass@upi'}</strong></span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1 rounded-md hover:bg-[#EAE3D6] text-[#55755E] transition flex items-center gap-1 text-[11px] font-sans font-semibold"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-green-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* App Badges */}
                <div className="pt-1 flex items-center justify-center gap-2 text-[10px] text-[#7A8C80] font-medium">
                  <span>Google Pay</span> • <span>PhonePe</span> • <span>Paytm</span> • <span>BHIM UPI</span>
                </div>
              </div>
            ) : (
              /* QR Code Removed or Not Configured Notice */
              <div className="p-6 rounded-3xl bg-amber-50/80 border border-amber-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#24362C]">
                  Online payment is currently unavailable.
                </h3>
                <p className="text-xs text-[#55695C] max-w-md mx-auto">
                  Please contact the Yoga Class for payment assistance. Our admissions team will provide manual account details or assist with your seat confirmation.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
                  <a
                    href="tel:+919876543210"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#2D4A3E] text-white font-semibold shadow-xs"
                  >
                    Call Studio: +91 98765 43210
                  </a>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-green-700 text-white font-semibold shadow-xs"
                  >
                    WhatsApp Support
                  </a>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-[#E1DBD1] flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#DDD5C7] text-[#55695C] hover:bg-white text-xs font-semibold flex items-center justify-center gap-2 transition order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Edit Details</span>
              </button>

              {isQrAvailable && (
                <button
                  type="button"
                  onClick={handleCompletedPaymentClick}
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#2D4A3E] hover:bg-[#233B2B] text-white text-xs font-bold tracking-wide shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 order-1 sm:order-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#86EFAC]" />
                  <span>I Have Completed the Payment</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: PAYMENT VERIFICATION (UTR & SCREENSHOT)                          */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#55755E]">
                Step 3 of 3 • Verification Step
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#24362C] mt-1">
                Payment Verification
              </h2>
              <p className="text-xs text-[#6A7E72] mt-1">
                Please enter the UTR/transaction number generated by your UPI payment.
              </p>
            </div>

            {/* Order Brief Summary */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E1DBD1] flex items-center justify-between text-xs">
              <div>
                <p className="text-[10px] text-[#869A8C] uppercase font-bold">Course & Student</p>
                <p className="font-bold text-[#24362C]">{selectedCourse?.name}</p>
                <p className="text-[11px] text-[#6A7E72]">{formData.fullName} ({formData.mobile})</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#869A8C] uppercase font-bold">Amount Paid</p>
                <p className="font-serif font-bold text-base text-[#2D4A3E]">₹{selectedCourse?.fee}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitEnrollment} className="space-y-4 text-xs">
              {/* Transaction / UTR Number */}
              <div>
                <label className="block text-[#4A5D50] font-semibold mb-1">
                  Transaction / UTR Number *
                </label>
                <input
                  type="text"
                  name="utrNumber"
                  placeholder="Enter UTR / Transaction ID (e.g. 423981729384)"
                  value={formData.utrNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono ${
                    errors.utrNumber ? 'border-red-400 bg-red-50' : 'border-[#D5CABE] bg-white'
                  } text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none`}
                />
                {errors.utrNumber ? (
                  <p className="text-red-500 text-[10px] mt-1">{errors.utrNumber}</p>
                ) : (
                  <p className="text-[10px] text-[#869A8C] mt-1">
                    Found in your UPI app payment receipt (Google Pay, PhonePe, Paytm, or BHIM).
                  </p>
                )}
              </div>

              {/* Payment Screenshot (Optional but recommended) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#4A5D50] font-semibold">
                    Payment Screenshot (Optional but recommended)
                  </label>
                  <span className="text-[10px] text-[#869A8C]">PNG, JPG, WEBP (Max 5MB)</span>
                </div>

                {!formData.screenshotPreview ? (
                  <label className="border-2 border-dashed border-[#D5CABE] hover:border-[#55755E] bg-white rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition text-center group">
                    <Upload className="w-6 h-6 text-[#869A8C] group-hover:text-[#2D4A3E] transition mb-1" />
                    <span className="text-xs font-semibold text-[#2D4A3E]">Click to upload payment screenshot</span>
                    <span className="text-[10px] text-[#869A8C] mt-0.5">Helps our studio verify your seat faster</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="p-3 bg-white rounded-2xl border border-[#D5CABE] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={formData.screenshotPreview}
                        alt="Screenshot Preview"
                        className="w-12 h-12 object-cover rounded-xl border border-gray-200"
                      />
                      <div>
                        <p className="font-semibold text-xs text-[#24362C]">Payment Screenshot Attached</p>
                        <p className="text-[10px] text-green-700 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Ready for verification
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-[#EFE9DF]/70 border border-[#DDD5C7] text-[#55695C] text-[11px] flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-[#55755E] shrink-0 mt-0.5" />
                <span>
                  Our admin team verifies incoming UPI transactions against the UTR number before final batch assignment.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E1DBD1] flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#DDD5C7] text-[#55695C] hover:bg-white text-xs font-semibold flex items-center justify-center gap-2 transition order-2 sm:order-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to QR Code</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#2D4A3E] hover:bg-[#233B2B] text-white text-xs font-bold tracking-wide shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 order-1 sm:order-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting Enrollment...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#E2B887]" />
                      <span>Submit Enrollment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: ENROLLMENT SUBMISSION SUCCESS VIEW                                */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="text-center py-4 space-y-6 animate-scale-up">
            <div className="w-16 h-16 bg-[#2D4A3E] text-white rounded-full flex items-center justify-center mx-auto shadow-lg ring-8 ring-[#EAE3D6]">
              <CheckCircle2 className="w-9 h-9 text-[#86EFAC]" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#55755E]">
                Submission Received
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#24362C] mt-1">
                Enrollment Submitted Successfully!
              </h2>
              <p className="text-xs sm:text-sm text-[#55695C] mt-2 max-w-md mx-auto leading-relaxed">
                Your payment is pending verification. Our team will verify your payment and confirm your seat shortly.
              </p>
            </div>

            {/* Confirmation Summary Card */}
            {submittedEnrollment && (
              <div className="p-5 rounded-2xl bg-white border border-[#DDD5C7] text-left text-xs space-y-3 max-w-lg mx-auto shadow-xs">
                <div className="flex justify-between border-b border-[#F0EAE1] pb-2">
                  <span className="text-[#6A7E72]">Enrollment ID:</span>
                  <span className="font-mono font-bold text-[#24362C]">{submittedEnrollment.id}</span>
                </div>
                <div className="flex justify-between border-b border-[#F0EAE1] pb-2">
                  <span className="text-[#6A7E72]">Student Name:</span>
                  <span className="font-bold text-[#24362C]">{submittedEnrollment.student_name || submittedEnrollment.userName}</span>
                </div>
                <div className="flex justify-between border-b border-[#F0EAE1] pb-2">
                  <span className="text-[#6A7E72]">Course & Batch:</span>
                  <span className="font-medium text-[#2D4A3E] text-right">
                    {submittedEnrollment.course_name || submittedEnrollment.courseName} <br />
                    <span className="text-[11px] text-[#6A7E72]">({submittedEnrollment.batch || submittedEnrollment.batchTiming})</span>
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#F0EAE1] pb-2">
                  <span className="text-[#6A7E72]">Amount:</span>
                  <span className="font-bold text-sm text-[#2D4A3E]">₹{submittedEnrollment.amount}</span>
                </div>
                <div className="flex justify-between border-b border-[#F0EAE1] pb-2">
                  <span className="text-[#6A7E72]">Transaction / UTR:</span>
                  <span className="font-mono font-semibold text-[#24362C]">{submittedEnrollment.utr_number || submittedEnrollment.utrNumber}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[#6A7E72]">Payment Status:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    <Hourglass className="w-3 h-3 text-amber-600 animate-pulse" />
                    <span>🟡 Pending Verification</span>
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  handleClose();
                  navigate('/dashboard');
                }}
                className="w-full sm:w-auto px-7 py-2.5 rounded-full bg-[#2D4A3E] hover:bg-[#233B2B] text-white text-xs font-semibold shadow-md transition"
              >
                Go to My Dashboard
              </button>
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white hover:bg-gray-50 text-[#24362C] text-xs font-medium border border-[#DDD5C7] transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

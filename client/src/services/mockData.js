export const initialUsers = [
  {
    id: "user_admin_01",
    uid: "user_admin_01",
    name: "Sourabh Shendage",
    email: "admin@gmail.com",
    phone: "7276037032",
    mobile: "7276037032",
    role: "admin",
    status: "active",
    createdAt: "2026-01-10T08:00:00.000Z"
  },
  {
    id: "user_student_01",
    uid: "user_student_01",
    name: "Aarav Sharma",
    email: "student@pranavedayoga.com",
    phone: "9876543210",
    mobile: "9876543210",
    role: "user",
    status: "active",
    createdAt: "2026-01-15T09:30:00.000Z"
  },
  {
    id: "user_student_02",
    uid: "user_student_02",
    name: "Pooja Deshmukh",
    email: "pooja.d@gmail.com",
    phone: "9123456780",
    mobile: "9123456780",
    role: "user",
    status: "active",
    createdAt: "2026-02-01T11:20:00.000Z"
  },
  {
    id: "user_student_03",
    uid: "user_student_03",
    name: "Rohan Kulkarni",
    email: "rohan.k@yahoo.com",
    phone: "9887766554",
    mobile: "9887766554",
    role: "user",
    status: "active",
    createdAt: "2026-02-14T14:15:00.000Z"
  }
];

export const initialCourses = [
  {
    id: "course-1",
    name: "Beginner Yoga Foundation",
    title: "Beginner Yoga Foundation",
    slug: "beginner-yoga-foundation",
    shortDescription: "Gentle introduction to foundational asanas, breathing techniques, and posture alignment.",
    description: "Start your transformative yoga journey with our Beginner Yoga Foundation course. Designed specifically for individuals new to yoga or those looking to rebuild their foundation, this course covers fundamental postures (asanas), basic breathing exercises (pranayama), and simple relaxation techniques. You will build strength, improve flexibility, and learn how to practice safely with modifications tailored to your body.",
    duration: "4 Weeks (12 Sessions)",
    timing: "06:30 AM - 07:30 AM (Mon, Wed, Fri)",
    batch: "Morning Sunrise Batch",
    fee: 2499,
    price: 2499,
    originalFee: 3499,
    level: "Beginner",
    instructor: "Acharya Ananya Sharma",
    totalSeats: 20,
    availableSeats: 8,
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80",
    status: "active",
    isActive: true,
    benefits: [
      "Improve baseline spinal flexibility & joint mobility",
      "Master correct breathing mechanics & posture alignment",
      "Relieve daily back tension and mental fatigue",
      "Step-by-step guidance suitable for absolute beginners"
    ],
    requirements: [
      "No prior yoga experience needed",
      "Comfortable stretchy clothing and a yoga mat",
      "Open mind and willingness to practice with patience"
    ],
    createdAt: "2026-01-01T06:00:00.000Z"
  },
  {
    id: "course-2",
    name: "Advanced Hatha & Vinyasa Flow",
    title: "Advanced Hatha & Vinyasa Flow",
    slug: "advanced-hatha-vinyasa",
    shortDescription: "Dynamic, breath-synchronized sequence for strength, endurance, arm balances, and deep focus.",
    description: "Take your practice to higher realms with our Advanced Hatha & Vinyasa Flow. This immersive course blends traditional Hatha holds with fluid Vinyasa transitions, challenging inversions, deep hip openers, and intense pranayama.",
    duration: "6 Weeks (18 Sessions)",
    timing: "07:45 AM - 09:00 AM (Tue, Thu, Sat)",
    batch: "Morning Power Flow",
    fee: 3999,
    price: 3999,
    originalFee: 5499,
    level: "Advanced",
    instructor: "Yogacharya Rohan Verma",
    totalSeats: 15,
    availableSeats: 5,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    status: "active",
    isActive: true,
    benefits: [
      "Master advanced arm balances, handstands, and inversions",
      "Enhance muscular endurance and core stability",
      "Cultivate internal heat and deep detoxification",
      "Refine advanced bandhas and ujjayi pranayama control"
    ],
    requirements: [
      "At least 6 months of consistent yoga practice",
      "Ability to comfortably perform basic Surya Namaskar cycles"
    ],
    createdAt: "2026-01-02T06:00:00.000Z"
  },
  {
    id: "course-3",
    name: "Weight Management & Core Power Yoga",
    title: "Weight Management & Core Power Yoga",
    slug: "weight-management-core-power",
    shortDescription: "High-energy metabolic yoga workout to burn calories, tone muscles, and boost vitality.",
    description: "Combine traditional yogic postures with high-energy isometric holds to boost your metabolic rate, shed stubborn fat, and sculpt your core without damaging joints.",
    duration: "4 Weeks (16 Sessions)",
    timing: "06:00 PM - 07:00 PM (Mon to Thu)",
    batch: "Evening Fat-Burn Batch",
    fee: 2999,
    price: 2999,
    originalFee: 4199,
    level: "Intermediate",
    instructor: "Priya Nair",
    totalSeats: 25,
    availableSeats: 12,
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    status: "active",
    isActive: true,
    benefits: [
      "Targeted abdominal and oblique strengthening",
      "High caloric burn and sustained metabolic acceleration",
      "Improved cardiovascular stamina and mental grit"
    ],
    requirements: [
      "Basic physical fitness and desire to work up a sweat",
      "Yoga mat and water bottle"
    ],
    createdAt: "2026-01-03T06:00:00.000Z"
  },
  {
    id: "course-4",
    name: "Pranayama & Mindful Meditation",
    title: "Pranayama & Mindful Meditation",
    slug: "pranayama-mindful-meditation",
    shortDescription: "Ancient breathwork, nervous system regulation, and deep dhyana meditation for mental peace.",
    description: "Learn sacred Himalayan breathing sciences: Anulom Vilom, Kapalabhati, Bhramari, and Ujjayi. Soothe stress, reduce anxiety, and unlock extraordinary mental stillness.",
    duration: "3 Weeks (9 Sessions)",
    timing: "05:30 AM - 06:15 AM (Tue, Thu, Sat)",
    batch: "Brahma Muhurta Batch",
    fee: 1999,
    price: 1999,
    originalFee: 2999,
    level: "All Levels",
    instructor: "Acharya Ananya Sharma",
    totalSeats: 30,
    availableSeats: 18,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    status: "active",
    isActive: true,
    benefits: [
      "Deeply regulates parasympathetic nervous system",
      "Enhances lung capacity and oxygenates cellular tissue",
      "Dissolves anxiety, insomnia, and mental restlessness"
    ],
    requirements: [
      "Empty stomach for morning breath practice",
      "Quiet seated space and cushion/mat"
    ],
    createdAt: "2026-01-04T06:00:00.000Z"
  }
];

export const initialBookings = [
  {
    id: "BK-849201",
    bookingId: "BK-849201",
    enrollmentId: "BK-849201",
    userId: "user_student_01",
    userName: "Aarav Sharma",
    studentName: "Aarav Sharma",
    userEmail: "student@pranavedayoga.com",
    email: "student@pranavedayoga.com",
    userPhone: "9876543210",
    phone: "9876543210",
    courseId: "course-1",
    courseName: "Beginner Yoga Foundation",
    amount: 2499,
    batch: "Morning Sunrise Batch",
    preferredBatch: "Morning Sunrise Batch (06:30 AM - 07:30 AM)",
    bookingStatus: "confirmed",
    enrollmentStatus: "Confirmed",
    paymentStatus: "paid",
    payment_status: "Success",
    paymentId: "PAY-918231",
    utrNumber: "408192847192",
    createdAt: "2026-02-10T07:15:00.000Z"
  },
  {
    id: "BK-849202",
    bookingId: "BK-849202",
    enrollmentId: "BK-849202",
    userId: "user_student_02",
    userName: "Pooja Deshmukh",
    studentName: "Pooja Deshmukh",
    userEmail: "pooja.d@gmail.com",
    email: "pooja.d@gmail.com",
    userPhone: "9123456780",
    phone: "9123456780",
    courseId: "course-2",
    courseName: "Advanced Hatha & Vinyasa Flow",
    amount: 3999,
    batch: "Morning Power Flow",
    preferredBatch: "Morning Power Flow (07:45 AM - 09:00 AM)",
    bookingStatus: "pending",
    enrollmentStatus: "Pending",
    paymentStatus: "pending",
    payment_status: "Pending",
    paymentId: "PAY-918232",
    utrNumber: "408192847990",
    createdAt: "2026-02-12T10:30:00.000Z"
  },
  {
    id: "BK-849203",
    bookingId: "BK-849203",
    enrollmentId: "BK-849203",
    userId: "user_student_03",
    userName: "Rohan Kulkarni",
    studentName: "Rohan Kulkarni",
    userEmail: "rohan.k@yahoo.com",
    email: "rohan.k@yahoo.com",
    userPhone: "9887766554",
    phone: "9887766554",
    courseId: "course-3",
    courseName: "Weight Management & Core Power Yoga",
    amount: 2999,
    batch: "Evening Fat-Burn Batch",
    preferredBatch: "Evening Fat-Burn Batch (06:00 PM - 07:00 PM)",
    bookingStatus: "confirmed",
    enrollmentStatus: "Confirmed",
    paymentStatus: "paid",
    payment_status: "Success",
    paymentId: "PAY-918233",
    utrNumber: "408192848123",
    createdAt: "2026-02-15T16:45:00.000Z"
  }
];

export const initialPayments = [
  {
    id: "PAY-918231",
    paymentId: "PAY-918231",
    bookingId: "BK-849201",
    orderId: "BK-849201",
    userName: "Aarav Sharma",
    studentName: "Aarav Sharma",
    amount: 2499,
    paymentStatus: "Success",
    status: "Success",
    paymentMethod: "UPI",
    transactionId: "408192847192",
    createdAt: "2026-02-10T07:16:00.000Z"
  },
  {
    id: "PAY-918232",
    paymentId: "PAY-918232",
    bookingId: "BK-849202",
    orderId: "BK-849202",
    userName: "Pooja Deshmukh",
    studentName: "Pooja Deshmukh",
    amount: 3999,
    paymentStatus: "Pending",
    status: "Pending",
    paymentMethod: "UPI",
    transactionId: "408192847990",
    createdAt: "2026-02-12T10:31:00.000Z"
  },
  {
    id: "PAY-918233",
    paymentId: "PAY-918233",
    bookingId: "BK-849203",
    orderId: "BK-849203",
    userName: "Rohan Kulkarni",
    studentName: "Rohan Kulkarni",
    amount: 2999,
    paymentStatus: "Success",
    status: "Success",
    paymentMethod: "UPI",
    transactionId: "408192848123",
    createdAt: "2026-02-15T16:46:00.000Z"
  }
];

export const initialContactMessages = [
  {
    id: "msg-101",
    name: "Dr. Sandeep Patil",
    email: "sandeep.patil@hospital.org",
    phone: "9822012345",
    mobile: "9822012345",
    subject: "Private Therapeutic Session for Spinal Disc Care",
    message: "Namaste, I am interested in private 1-on-1 therapeutic yoga sessions for lumbar spondylosis. Please let me know the available time slots.",
    status: "unread",
    createdAt: "2026-02-16T11:00:00.000Z"
  },
  {
    id: "msg-102",
    name: "Anita Joshi",
    email: "anita.j@gmail.com",
    phone: "9988771122",
    mobile: "9988771122",
    subject: "Weekend Himalayan Meditation Retreat Enquiry",
    message: "Could you please share details, pricing, and accommodation options for the upcoming Rishikesh meditation retreat?",
    status: "read",
    createdAt: "2026-02-14T09:20:00.000Z"
  }
];

export const initialTestimonials = [
  {
    id: "test-1",
    quote: "Joining PranaVeda transformed my posture and relieved my chronic lower back stiffness within just 4 weeks. The instructors teach with scientific precision and genuine care.",
    name: "Dr. Rajesh Kulkarni",
    role: "Cardiologist & Yoga Student",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    accentClass: "yoga-card-sage",
    isApproved: true,
    createdAt: "2026-01-10T10:00:00.000Z"
  },
  {
    id: "test-2",
    quote: "As someone working long hours on screens, the Pranayama and Evening Restorative classes are my daily reset button. I sleep deeper, feel calmer, and my focus has skyrocketed.",
    name: "Sneha Mukherjee",
    role: "Software Architect",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    accentClass: "yoga-card-lavender",
    isApproved: true,
    createdAt: "2026-01-12T10:00:00.000Z"
  },
  {
    id: "test-3",
    quote: "The Power Yoga and 1-on-1 coaching helped me lose 8 kg while building real flexibility. The student portal, instant receipts, and reminders make everything effortless!",
    name: "Vikram Malhotra",
    role: "Entrepreneur",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    accentClass: "yoga-card-gold",
    isApproved: true,
    createdAt: "2026-01-15T10:00:00.000Z"
  }
];

export const initialPaymentSettings = {
  id: "payment_settings_default",
  upi_id: "yogaclass@upi",
  qr_code_url: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=400&q=80",
  payment_instructions: "Scan this QR code using Google Pay, PhonePe, Paytm or any BHIM UPI app. Enter the 12-digit UTR / Transaction number after completing transfer.",
  is_active: true
};

export const initialStudioSettings = {
  studioName: "PranaVeda Yoga & Wellness Sanctuary",
  tagline: "Authentic Himalayan Yoga, Pranayama & Holistic Healing",
  email: "namaste@pranavedayoga.com",
  phone: "+91 98765 43210",
  whatsappNumber: "+91 98765 43210",
  address: "Ram Mandir Chowk, Sangli, Maharashtra - 416416",
  workingHours: "Mon - Sat: 5:30 AM - 8:30 PM | Sun: 6:00 AM - 12:00 PM",
  razorpayKeyId: "rzp_test_PranaVeda2026",
  whatsappAutoNotification: true,
  smsAutoNotification: true
};

export const initialFooterSettings = {
  brandName: "PRANAVEDA",
  tagline: "Yoga & Wellness Sanctuary",
  aboutText: "Rooted in ancient Vedic traditions and Himalayan yogic mastery, PranaVeda offers authentic guidance in classical Hatha, Ashtanga, Vinyasa, and restorative mindfulness for seekers worldwide.",
  contact: {
    address: "Ram Mandir Chowk, Sangli, Maharashtra - 416416",
    phone: "+91 98765 43210",
    email: "namaste@pranavedayoga.com",
    hours: "Mon - Sat: 5:30 AM - 8:30 PM | Sun: 6:00 AM - 12:00 PM"
  },
  socialLinks: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
    linkedin: "https://linkedin.com",
    whatsapp: "https://wa.me/919876543210"
  },
  quickLinks: [
    { name: "Home", url: "/", enabled: true },
    { name: "About Us & Instructors", url: "/about", enabled: true },
    { name: "All Yoga Courses", url: "/courses", enabled: true },
    { name: "Contact & Sanctuary Visit", url: "/contact", enabled: true },
    { name: "Student Portal / Dashboard", url: "/dashboard", enabled: true }
  ],
  wellnessLinks: [
    { name: "Yoga Classes & Batches", url: "/courses", enabled: true },
    { name: "Meditation & Pranayama", url: "/courses", enabled: true },
    { name: "Wellness Programs", url: "/courses", enabled: true },
    { name: "Himalayan Retreats", url: "/about", enabled: true },
    { name: "Our Sacred Philosophy", url: "/about", enabled: true }
  ],
  copyright: "© 2026 PranaVeda Yoga & Wellness Sanctuary. All rights reserved.",
  privacyPolicyUrl: "/about",
  termsUrl: "/about"
};

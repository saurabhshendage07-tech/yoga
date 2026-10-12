import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🚀 Starting Comprehensive Payment & Enrollment System Test...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  ✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title}`);
      failed++;
    }
  };

  try {
    // 1. Check Public Payment Settings
    console.log('1️⃣ Testing Public Payment Settings Endpoint...');
    const resSettings = await axios.get(`${BASE_URL}/payments/settings`);
    assert(resSettings.data.success === true, 'Public payment settings returns success');
    assert(typeof resSettings.data.data.upi_id === 'string', 'UPI ID is returned dynamically');
    assert(resSettings.data.data.qr_code_url !== undefined, 'QR code URL field exists');

    // 2. Admin Payment Settings Update
    console.log('\n2️⃣ Testing Admin Payment Settings Updates...');
    const updateRes = await axios.put(
      `${BASE_URL}/payments/settings`,
      {
        upi_id: 'pranaveda@upi',
        payment_instructions: 'Scan using GPay / PhonePe to confirm your seat immediately.',
        is_active: true
      },
      {
        headers: { 'x-user-role': 'admin', 'x-user-email': 'admin@pranavedayoga.com' }
      }
    );
    assert(updateRes.data.success === true, 'Admin can update payment settings');
    assert(updateRes.data.data.upi_id === 'pranaveda@upi', 'UPI ID updated to pranaveda@upi');

    // Verify public endpoint reflects the update
    const resSettingsUpdated = await axios.get(`${BASE_URL}/payments/settings`);
    assert(resSettingsUpdated.data.data.upi_id === 'pranaveda@upi', 'Public endpoint reflects updated UPI ID');

    // 3. Admin QR Auto-Generation
    console.log('\n3️⃣ Testing Admin QR Code Auto-Generation...');
    const qrGenRes = await axios.post(
      `${BASE_URL}/payments/generate-qr`,
      { upi_id: 'yogaclass@upi' },
      {
        headers: { 'x-user-role': 'admin', 'x-user-email': 'admin@pranavedayoga.com' }
      }
    );
    assert(qrGenRes.data.success === true, 'QR code auto-generation succeeds');
    assert(qrGenRes.data.data.qr_code_url.startsWith('/uploads/'), 'QR code URL stored in /uploads');

    // 4. Test Image Upload (Screenshot / QR)
    console.log('\n4️⃣ Testing Screenshot Upload Endpoint...');
    // Simple 1x1 transparent PNG base64
    const samplePngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const uploadRes = await axios.post(`${BASE_URL}/enrollments/upload-screenshot`, {
      imageBase64: samplePngBase64
    });
    assert(uploadRes.data.success === true, 'Screenshot uploads successfully');
    assert(uploadRes.data.data.url.startsWith('/uploads/screenshot-'), 'Screenshot saved with unique URL');

    // 5. Test User Enrollment Submission with UPI QR Flow
    console.log('\n5️⃣ Testing User Enrollment Submission (Course 4: Pranayama ₹1999)...');
    const enrollRes = await axios.post(`${BASE_URL}/enrollments/submit-upi`, {
      fullName: 'Meera Iyer',
      email: 'meera.iyer@example.com',
      mobile: '9876543210',
      age: 29,
      gender: 'Female',
      address: 'Koramangala, Bangalore',
      emergencyContact: 'Father - 9876543219',
      notes: 'Focusing on breath awareness',
      courseId: 'course-4', // Pranayama & Mindful Meditation
      preferredBatch: 'Brahma Muhurta Batch (05:30 AM - 06:30 AM)',
      utrNumber: '429182736451',
      paymentScreenshotUrl: uploadRes.data.data.url
    });

    assert(enrollRes.status === 201, 'Enrollment created with 201 status');
    assert(enrollRes.data.success === true, 'Enrollment response indicates success');
    const newEnr = enrollRes.data.data.enrollment;
    assert(newEnr.payment_status === 'Pending Verification', 'Payment status MUST start as Pending Verification');
    assert(newEnr.amount === 1999, 'Server validated course fee as ₹1999');
    assert(newEnr.utr_number === '429182736451', 'UTR number saved accurately');
    assert(newEnr.payment_screenshot_url === uploadRes.data.data.url, 'Screenshot URL linked to enrollment');

    // 6. Test Admin Retrieval of Enrollments
    console.log('\n6️⃣ Testing Admin Retrieval & Filtering...');
    const listRes = await axios.get(`${BASE_URL}/enrollments?search=Meera`);
    assert(listRes.data.success === true, 'Admin can query enrollments');
    const found = listRes.data.data.find(e => e.id === newEnr.id);
    assert(Boolean(found), 'Newly created enrollment appears in admin list');

    // 7. Test Admin Verify Payment Workflow
    console.log('\n7️⃣ Testing Admin Verify Payment...');
    const verifyRes = await axios.post(
      `${BASE_URL}/enrollments/${newEnr.id}/verify-payment`,
      {},
      {
        headers: { 'x-user-role': 'admin', 'x-user-email': 'admin@pranavedayoga.com' }
      }
    );
    assert(verifyRes.data.success === true, 'Payment verification succeeds');
    assert(verifyRes.data.data.payment_status === 'Verified', 'Payment status updated to Verified');
    assert(verifyRes.data.data.verified_by === 'admin@pranavedayoga.com', 'Verified by recorded');
    assert(Boolean(verifyRes.data.data.verified_at), 'Verified timestamp recorded');

    // 8. Test Second Enrollment with Rejection Workflow
    console.log('\n8️⃣ Testing Second Enrollment & Rejection Workflow...');
    const enroll2Res = await axios.post(`${BASE_URL}/enrollments/submit-upi`, {
      fullName: 'Rajat Kapoor',
      email: 'rajat.k@example.com',
      mobile: '9811223344',
      age: 34,
      gender: 'Male',
      address: 'Indiranagar, Bangalore',
      courseId: 'course-2', // Advanced Hatha & Vinyasa Flow (₹3999)
      preferredBatch: 'Morning Power Flow (07:45 AM - 09:00 AM)',
      utrNumber: '000000000000'
    });

    const enr2 = enroll2Res.data.data.enrollment;
    assert(enr2.amount === 3999, 'Course 2 fee is ₹3999');

    const rejectRes = await axios.post(
      `${BASE_URL}/enrollments/${enr2.id}/reject-payment`,
      { rejection_reason: 'UTR number invalid / no funds received' },
      {
        headers: { 'x-user-role': 'admin', 'x-user-email': 'admin@pranavedayoga.com' }
      }
    );
    assert(rejectRes.data.success === true, 'Payment rejection succeeds');
    assert(rejectRes.data.data.payment_status === 'Rejected', 'Payment status updated to Rejected');
    assert(rejectRes.data.data.rejection_reason === 'UTR number invalid / no funds received', 'Rejection reason recorded');

    // 9. Test Security: Unauthorized Admin Call Blocked
    console.log('\n9️⃣ Testing Security Protections (Unauthorized access)...');
    try {
      await axios.put(`${BASE_URL}/payments/settings`, { upi_id: 'hacker@upi' });
      assert(false, 'Unauthorized request should have failed');
    } catch (authErr) {
      assert(authErr.response?.status === 403, 'Unauthorized access correctly blocked with 403 Forbidden');
    }

    // 10. Test Remove QR & Disabled State
    console.log('\n🔟 Testing Remove QR Code & Disabled State...');
    const removeRes = await axios.delete(`${BASE_URL}/payments/remove-qr`, {
      headers: { 'x-user-role': 'admin', 'x-user-email': 'admin@pranavedayoga.com' }
    });
    assert(removeRes.data.success === true, 'Admin can remove QR code');

    const disabledSettings = await axios.get(`${BASE_URL}/payments/settings`);
    assert(disabledSettings.data.data.is_active === false, 'Public settings marks is_active as false when QR is removed');

    // Restore default QR
    console.log('\n🔄 Restoring default QR code for production readiness...');
    await axios.post(
      `${BASE_URL}/payments/generate-qr`,
      { upi_id: 'yogaclass@upi' },
      {
        headers: { 'x-user-role': 'admin', 'x-user-email': 'admin@pranavedayoga.com' }
      }
    );
    await axios.put(
      `${BASE_URL}/payments/settings`,
      {
        upi_id: 'yogaclass@upi',
        payment_instructions: 'Scan this QR code using Google Pay, PhonePe, Paytm or any UPI app.',
        is_active: true
      },
      {
        headers: { 'x-user-role': 'admin', 'x-user-email': 'admin@pranavedayoga.com' }
      }
    );

    console.log(`\n======================================================`);
    console.log(`✨ TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('Test execution error:', err.response?.data || err.message);
  }
}

runTests();

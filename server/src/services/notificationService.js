import axios from 'axios';
import { dbService } from '../config/db.js';

/**
 * Modular Notification Service for WhatsApp & SMS
 * Supports: Meta WhatsApp Cloud API, Twilio, Indian SMS Gateway (Fast2SMS/Msg91), and Dev Simulator.
 */
class NotificationService {
  constructor() {
    this.whatsappProvider = process.env.WHATSAPP_PROVIDER || 'SIMULATOR'; // META | TWILIO | SIMULATOR
    this.smsProvider = process.env.SMS_PROVIDER || 'SIMULATOR'; // FAST2SMS | TWILIO | SIMULATOR
  }

  /**
   * Dispatches WhatsApp Welcome / Enrollment Message
   */
  async sendWhatsAppMessage({ to, message, templateData = {} }) {
    const cleanNumber = to.replace(/[^0-9]/g, '');
    let status = 'Delivered';
    let providerResponse = null;
    let errorDetail = null;

    try {
      if (this.whatsappProvider === 'META' && process.env.META_WA_TOKEN && process.env.META_PHONE_NUMBER_ID) {
        // Meta WhatsApp Cloud API Integration
        const res = await axios.post(
          `https://graph.facebook.com/v19.0/${process.env.META_PHONE_NUMBER_ID}/messages`,
          {
            messaging_product: 'whatsapp',
            to: cleanNumber,
            type: 'text',
            text: { body: message }
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.META_WA_TOKEN}`,
              'Content-Type': 'application/json'
            },
            timeout: 8000
          }
        );
        providerResponse = res.data;
        console.log(`[WhatsApp-Meta] Message sent to ${cleanNumber}`);
      } else if (this.whatsappProvider === 'TWILIO' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        // Twilio WhatsApp Integration
        const twilioAuth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
        const params = new URLSearchParams();
        params.append('From', `whatsapp:${process.env.TWILIO_WA_PHONE_NUMBER || '+14155238886'}`);
        params.append('To', `whatsapp:+${cleanNumber}`);
        params.append('Body', message);

        const res = await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
          params.toString(),
          {
            headers: {
              Authorization: `Basic ${twilioAuth}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 8000
          }
        );
        providerResponse = res.data;
        console.log(`[WhatsApp-Twilio] Message sent to ${cleanNumber}`);
      } else {
        // Dev Simulation Mode (Safe, informative, and visual in Admin Dashboard)
        providerResponse = { mode: 'Dev Simulator', deliveredAt: new Date().toISOString() };
        console.log(`\n========================================`);
        console.log(`🟢 [SIMULATED WHATSAPP DISPATCH] To: ${cleanNumber}`);
        console.log(message);
        console.log(`========================================\n`);
      }
    } catch (err) {
      status = 'Failed';
      errorDetail = err.response?.data || err.message;
      console.error(`❌ [WhatsApp Error] Failed to send to ${cleanNumber}:`, errorDetail);
    }

    return { status, providerResponse, errorDetail };
  }

  /**
   * Dispatches SMS message via Indian SMS gateway or Twilio
   */
  async sendSMSMessage({ to, message }) {
    const cleanNumber = to.replace(/[^0-9]/g, '');
    let status = 'Delivered';
    let providerResponse = null;
    let errorDetail = null;

    try {
      if (this.smsProvider === 'FAST2SMS' && process.env.FAST2SMS_API_KEY) {
        // Indian SMS Gateway (Fast2SMS)
        const res = await axios.post(
          'https://www.fast2sms.com/dev/bulkV2',
          {
            route: 'q',
            message: message,
            language: 'english',
            flash: 0,
            numbers: cleanNumber.slice(-10) // 10 digit Indian number
          },
          {
            headers: {
              authorization: process.env.FAST2SMS_API_KEY,
              'Content-Type': 'application/json'
            },
            timeout: 8000
          }
        );
        providerResponse = res.data;
        console.log(`[SMS-Fast2SMS] SMS sent to ${cleanNumber}`);
      } else if (this.smsProvider === 'TWILIO' && process.env.TWILIO_ACCOUNT_SID) {
        const twilioAuth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
        const params = new URLSearchParams();
        params.append('From', process.env.TWILIO_SMS_PHONE_NUMBER);
        params.append('To', `+${cleanNumber}`);
        params.append('Body', message);

        const res = await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
          params.toString(),
          {
            headers: {
              Authorization: `Basic ${twilioAuth}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 8000
          }
        );
        providerResponse = res.data;
      } else {
        providerResponse = { mode: 'Dev Simulator', deliveredAt: new Date().toISOString() };
        console.log(`\n========================================`);
        console.log(`📱 [SIMULATED SMS DISPATCH] To: ${cleanNumber}`);
        console.log(message);
        console.log(`========================================\n`);
      }
    } catch (err) {
      status = 'Failed';
      errorDetail = err.response?.data || err.message;
      console.error(`❌ [SMS Error] Failed to send to ${cleanNumber}:`, errorDetail);
    }

    return { status, providerResponse, errorDetail };
  }

  /**
   * Main High-Level Enrollment Welcome Notification Trigger
   */
  async sendWelcomeEnrollmentNotification({
    userName,
    mobile,
    email,
    courseName,
    batchTiming,
    startDate = "Upcoming Monday",
    paymentId,
    amount
  }) {
    const studioName = process.env.STUDIO_NAME || 'PranaVeda Yoga & Wellness';

    // Standard requested message format
    const whatsappMessage = `Welcome to ${studioName} 🧘\n\nDear ${userName},\n\nCongratulations! Your enrollment for ${courseName} has been successfully confirmed.\n\nCourse: ${courseName}\nBatch: ${batchTiming}\nStart Date: ${startDate}\nPayment ID: ${paymentId}\nAmount Paid: ₹${amount}\n\nWe are happy to have you join our yoga community.\n\nThank you,\n${studioName}`;

    const smsMessage = `Welcome to ${studioName}! Dear ${userName}, enrollment for ${courseName} is confirmed. Batch: ${batchTiming}. See you on the mat!`;

    // Dispatch WhatsApp
    const waResult = await this.sendWhatsAppMessage({ to: mobile, message: whatsappMessage });
    
    // Dispatch SMS
    const smsResult = await this.sendSMSMessage({ to: mobile, message: smsMessage });

    const overallStatus = (waResult.status === 'Delivered' || smsResult.status === 'Delivered') 
      ? 'Delivered' 
      : (waResult.status === 'Failed' && smsResult.status === 'Failed') ? 'Failed' : 'Partial';

    // Persist to notifications collection for Admin Dashboard audit
    const notifRecord = {
      id: `notif-${Date.now()}`,
      recipientName: userName,
      recipientMobile: mobile,
      recipientEmail: email || '',
      type: 'welcome_enrollment',
      channel: 'WhatsApp & SMS',
      courseName: courseName,
      status: overallStatus,
      whatsappStatus: waResult.status,
      smsStatus: smsResult.status,
      message: whatsappMessage,
      errorDetail: waResult.errorDetail || smsResult.errorDetail || null,
      createdAt: new Date().toISOString()
    };

    await dbService.addDoc('notifications', notifRecord);
    return notifRecord;
  }

  /**
   * Send Custom Message from Admin Panel
   */
  async sendCustomMessage({ recipientName, mobile, channel = 'WhatsApp', message }) {
    let result;
    if (channel === 'WhatsApp') {
      result = await this.sendWhatsAppMessage({ to: mobile, message });
    } else if (channel === 'SMS') {
      result = await this.sendSMSMessage({ to: mobile, message });
    } else {
      const wa = await this.sendWhatsAppMessage({ to: mobile, message });
      const sms = await this.sendSMSMessage({ to: mobile, message });
      result = { status: wa.status === 'Delivered' ? 'Delivered' : sms.status };
    }

    const notifRecord = {
      id: `notif-custom-${Date.now()}`,
      recipientName: recipientName || 'Student',
      recipientMobile: mobile,
      type: 'custom_broadcast',
      channel: channel,
      courseName: 'General / Custom',
      status: result.status,
      message: message,
      errorDetail: result.errorDetail || null,
      createdAt: new Date().toISOString()
    };

    await dbService.addDoc('notifications', notifRecord);
    return notifRecord;
  }
}

export const notificationService = new NotificationService();

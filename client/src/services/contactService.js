import {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
  subscribeToEnquiries
} from './enquiryService';

/**
 * Contact Service interface connected to Firestore collection "enquiries"
 */
export async function addContactMessage({ name, email, phone = '', mobile = '', subject = 'General Yoga Inquiry', message }) {
  return await createEnquiry({
    name,
    email,
    phone: phone || mobile,
    subject,
    message
  });
}

export async function getContactMessages({ status = 'all', search = '' } = {}) {
  return await getEnquiries({ status, search });
}

export async function updateMessageStatus(messageId, newStatus) {
  return await updateEnquiryStatus(messageId, newStatus);
}

export async function deleteContactMessage(messageId) {
  return await deleteEnquiry(messageId);
}

export function subscribeToContactMessages(callback) {
  return subscribeToEnquiries(callback);
}

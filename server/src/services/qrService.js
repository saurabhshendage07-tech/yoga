import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

export const qrService = {
  /**
   * Generate a UPI URI string
   */
  generateUpiUri(upiId, payeeName = 'PranaVeda Yoga & Wellness', amount = null) {
    let uri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&cu=INR`;
    if (amount) {
      uri += `&am=${encodeURIComponent(amount)}`;
    }
    return uri;
  },

  /**
   * Generate QR Code as a Data URL (base64)
   */
  async generateQrDataUrl(textOrUpiId, options = {}) {
    const text = textOrUpiId.startsWith('upi://') ? textOrUpiId : this.generateUpiUri(textOrUpiId);
    return QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: options.width || 400,
      color: {
        dark: options.darkColor || '#1E2E25',
        light: options.lightColor || '#FFFFFF'
      }
    });
  },

  /**
   * Generate and save a QR Code image file into the uploads directory
   */
  async generateAndSaveQrFile(upiId, payeeName = 'PranaVeda Yoga & Wellness', filename = null) {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    const upiUri = this.generateUpiUri(upiId, payeeName);
    const fname = filename || `qr-gen-${Date.now()}.png`;
    const filePath = path.join(UPLOADS_DIR, fname);

    await QRCode.toFile(filePath, upiUri, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 500,
      color: {
        dark: '#1E2E25',
        light: '#FFFFFF'
      }
    });

    return `/uploads/${fname}`;
  },

  /**
   * Ensure default QR code exists on startup
   */
  async ensureDefaultQrCode() {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    const defaultFilePath = path.join(UPLOADS_DIR, 'default_yoga_qr.png');
    if (!fs.existsSync(defaultFilePath)) {
      await QRCode.toFile(defaultFilePath, this.generateUpiUri('yogaclass@upi', 'PranaVeda Yoga Sanctuary'), {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 600,
        color: {
          dark: '#1E2E25',
          light: '#FFFFFF'
        }
      });
      console.log('✅ Generated initial default UPI QR code: default_yoga_qr.png');
    }
  }
};

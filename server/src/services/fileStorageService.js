import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const fileStorageService = {
  /**
   * Save a base64 encoded image to the uploads directory.
   * @param {string} base64Data - Full data URI or raw base64 string
   * @param {string} prefix - Filename prefix (e.g., 'qr', 'screenshot')
   * @returns {{ url: string, filename: string, size: number }}
   */
  saveBase64Image(base64Data, prefix = 'upload') {
    if (!base64Data || typeof base64Data !== 'string') {
      throw new Error('Invalid image data provided.');
    }

    // Match MIME type and data
    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    let mimeType = 'image/png';
    let rawBase64 = base64Data;

    if (matches && matches.length === 3) {
      mimeType = matches[1].toLowerCase();
      rawBase64 = matches[2];
    }

    // Normalize jpeg/jpg
    if (mimeType === 'image/jpg') mimeType = 'image/jpeg';

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(`Unsupported image format (${mimeType}). Allowed formats: PNG, JPG, JPEG, WEBP.`);
    }

    const buffer = Buffer.from(rawBase64, 'base64');

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new Error(`Image size exceeds the 5MB limit (current: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB).`);
    }

    const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/webp' ? 'webp' : 'png';
    const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    return {
      url: `/uploads/${filename}`,
      filename,
      size: buffer.length,
      mimeType
    };
  },

  /**
   * Delete a file from uploads directory given its URL or filename
   */
  deleteFileByUrl(fileUrl) {
    try {
      if (!fileUrl || !fileUrl.startsWith('/uploads/')) return false;
      const filename = path.basename(fileUrl);
      // Protect default files
      if (filename.startsWith('default_')) return false;
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Failed to delete file:', fileUrl, err.message);
      return false;
    }
  },

  /**
   * Check if a file exists
   */
  fileExists(fileUrl) {
    if (!fileUrl) return false;
    const filename = path.basename(fileUrl);
    const filePath = path.join(UPLOADS_DIR, filename);
    return fs.existsSync(filePath);
  }
};

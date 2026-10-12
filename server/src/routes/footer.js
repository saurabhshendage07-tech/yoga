import express from 'express';
import { dbService } from '../config/db.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/footer
 * @desc    Fetch public footer settings (Brand, Contact, Yoga, Social, CTA, Legal)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const settings = await dbService.getFooterSettings();
    return res.json({
      success: true,
      data: settings
    });
  } catch (err) {
    console.error('Error fetching footer settings:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve footer settings'
    });
  }
});

/**
 * @route   PUT /api/footer
 * @desc    Update footer settings
 * @access  Admin
 */
router.put('/', requireAdmin, async (req, res) => {
  try {
    const updateData = req.body;
    if (!updateData || typeof updateData !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid footer payload'
      });
    }

    const updated = await dbService.saveFooterSettings(updateData);
    return res.json({
      success: true,
      message: 'Footer settings updated successfully',
      data: updated
    });
  } catch (err) {
    console.error('Error saving footer settings:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to update footer settings'
    });
  }
});

export default router;

import express from 'express';
import DonationRequest from '../models/DonationRequest.js';
import User from '../models/User.js';

const router = express.Router();

// Create donation request
router.post('/create', async (req, res) => {
  try {
    const { userId, ngoId, type, address } = req.body;
    const dr = new DonationRequest({ userId, ngoId, type, address });
    await dr.save();
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// List user's donation history
router.get('/history/:userId', async (req, res) => {
  try {
    const requests = await DonationRequest.find({ userId: req.params.userId });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List requests for NGO
router.get('/requests', async (req, res) => {
  try {
    const ngoId = req.query.ngoId;
    const requests = await DonationRequest.find({ ngoId, status: 'pending' }).populate('userId');
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept/Reject request
router.post('/:id/:decision', async (req, res) => {
  try {
    const { id, decision } = req.params;
    const dr = await DonationRequest.findById(id);
    if (!dr) return res.json({ success: false, message: 'Request not found' });

    dr.status = decision === 'accept' ? 'accepted' : 'rejected';
    await dr.save();

    if (decision === 'accept') {
      // Reward coins to user
      await User.findByIdAndUpdate(dr.userId, { $inc: { coins: 50 } });
    }
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

export default router;

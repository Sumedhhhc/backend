import express from 'express';
import DonationRequest from '../models/DonationRequest.js';
import User from '../models/User.js';

const router = express.Router();

// Create donation request
router.post('/create', async (req, res) => {
  try {
    const { userId, type, address, details } = req.body;

    const dr = new DonationRequest({
      userId,
      type,
      address,
      details
    });

    await dr.save();
    res.json({ success: true, requestId: dr._id });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// List requests for NGO
router.get('/requests', async (req, res) => {
  try {
    const requests = await DonationRequest
      .find({ status: 'pending' })
      .populate('userId', 'name email address');

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Accept/Reject request
router.post('/:id/:decision', async (req, res) => {
  try {
    const { id, decision } = req.params;

    const dr = await DonationRequest.findById(id);
    if (!dr) return res.json({ success: false, message: 'Request not found' });

    dr.status = decision === 'accept' ? 'accepted' : 'rejected';

    if (decision === 'accept') {
      dr.coinsEarned = 50; // save coins for history display

      // get NGO name from database
      const ngo = await NGO.findById(dr.ngoId);
      if (ngo) dr.ngoName = ngo.name;

      // reward user
      await User.findByIdAndUpdate(dr.userId, { $inc: { coins: 50 } });
    }

    await dr.save();

    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Get history of all donations by a user
router.get('/history/:userId', async (req, res) => {
  try {
    const history = await DonationRequest.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

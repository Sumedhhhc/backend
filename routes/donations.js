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

    // Flatten some user fields to make it easy for frontends to consume
    const out = requests.map(r => {
      const obj = r.toObject ? r.toObject() : r;
      const user = obj.userId || {};
      return {
        ...obj,
        userName: (user && (user.name || user.email)) || obj.userName || null,
        userEmail: user && user.email,
        userAddress: user && user.address,
      };
    });

    res.json({ success: true, requests: out });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get history using EMAIL instead of userId
router.get('/history/email/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);

    // Get user by email
    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "User not found" });

    // Fetch all donations by this user
    const history = await DonationRequest
      .find({ userId: user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, history });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}); 

// Accept/Reject request
router.post('/:id/:decision', async (req, res) => {
  try {
    const { id, decision } = req.params;
    const { ngoId } = req.body;  // ngoId must be sent by dashboard

    const dr = await DonationRequest.findById(id);
    if (!dr) return res.json({ success: false, message: 'Request not found' });

    // Update status
    dr.status = decision === 'accept' ? 'accepted' : 'rejected';

    // Store the NGO that processed the request
    if (decision === 'accept' && ngoId) {
      dr.ngoId = ngoId;
    }

    await dr.save();

    // Reward coins
    if (decision === 'accept') {
      await User.findByIdAndUpdate(dr.userId, { $inc: { coins: 50 } });
    }

    res.json({ success: true, updated: dr });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

export default router;

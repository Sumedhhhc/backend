import express from 'express';
import NGO from '../models/NGO.js';

const router = express.Router();

// For payments: integrate Razorpay/Stripe (API keys via process.env)
router.post('/pay', async (req, res) => {
  // TODO: Integrate payment gateway and activate subscription for NGO
  res.json({ success: false, message: 'Payment integration required.' });
});

router.get('/status/:ngoId', async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.ngoId);
    res.json({ active: ngo.subscriptionActive, trialExpiresAt: ngo.trialExpiresAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

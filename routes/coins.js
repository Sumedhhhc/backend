import express from 'express';
import User from '../models/User.js';
import CoinTransaction from '../models/CoinTransaction.js';

const router = express.Router();

// Get coin history for a user
router.get('/history/:userId', async (req, res) => {
  try {
    const history = await CoinTransaction.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Redeem coins for gift card
router.post('/redeem', async (req, res) => {
  try {
    const { userId, amount, giftCardName } = req.body;

    if (!userId || !amount || !giftCardName) {
      return res.status(400).json({ success: false, message: 'userId, amount, and giftCardName are required' });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if user has enough coins
    if (user.coins < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient coins' });
    }

    // Deduct coins
    user.coins -= amount;
    await user.save();

    // Log transaction
    const transaction = new CoinTransaction({
      userId: user._id,
      amount,
      reason: `Redeemed for ${giftCardName}`,
    });
    await transaction.save();

    res.json({ success: true, message: `${amount} coins redeemed for ${giftCardName}`, coinsLeft: user.coins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

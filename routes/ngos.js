import express from 'express';
import NGO from '../models/NGO.js';

const router = express.Router();

// List NGOs within radius (10–15km)
router.get('/nearby', async (req, res) => {
  const { lng, lat, radius } = req.query; // radius in km
  try {
    const ngos = await NGO.find({
      'address.geo': {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: (radius || 15) * 1000,
        }
      },
      isVerified: true,
      subscriptionActive: true,
    });
    res.json({ ngos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update NGO availability status
router.post('/status', async (req, res) => {
  try {
    const { email, status } = req.body;

    if (!["available", "occupied"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const ngo = await NGO.findOneAndUpdate(
      { email },
      { status },
      { new: true }
    );

    if (!ngo) {
      return res.status(404).json({ success: false, message: "NGO not found" });
    }

    res.json({ success: true, status: ngo.status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

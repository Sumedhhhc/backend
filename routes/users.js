import express from 'express';
import User from '../models/User.js';
import NGO from '../models/NGO.js';

const router = express.Router();

router.get('/by-email', async (req, res) => {
  try {
    const { email } = req.query;

    let account = await User.findOne({ email }, { password: 0 });
    if (account) return res.json({ success: true, type: 'user', data: account });

    account = await NGO.findOne({ email }, { password: 0 });
    if (account) return res.json({ success: true, type: 'ngo', data: account });

    res.status(404).json({ success: false, message: 'User/NGO not found' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { type, email } = req.query;
    let results = [];

    if (email) {
      let account = await User.findOne({ email }, { password: 0 });
      if (account) {
        return res.json({ success: true, type: 'user', data: [account] });
      }

      account = await NGO.findOne({ email }, { password: 0 });
      if (account) {
        return res.json({ success: true, type: 'ngo', data: [account] });
      }

      return res.status(404).json({ success: false, message: 'User/NGO not found' });
    }

    if (!type || type === 'user') {
      const users = await User.find({}, { password: 0 }); // exclude password
      results = results.concat(users.map(u => ({ ...u.toObject(), type: 'user' })));
    }

    if (!type || type === 'ngo') {
      const ngos = await NGO.find({}, { password: 0 }); // exclude password
      results = results.concat(ngos.map(n => ({ ...n.toObject(), type: 'ngo' })));
    }

    res.json({ success: true, data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let account = await User.findById(id, { password: 0 });
    if (account) return res.json({ success: true, type: 'user', data: account });

    account = await NGO.findById(id, { password: 0 });
    if (account) return res.json({ success: true, type: 'ngo', data: account });

    res.status(404).json({ success: false, message: 'User/NGO not found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

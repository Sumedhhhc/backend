import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import NGO from '../models/NGO.js';
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.post('/user-signup', async (req, res) => {
  try {
    const { name, email, number, password, address } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, number, password: hashedPassword, address: { formatted: address } });
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post('/ngo-signup', upload.array('documents', 5), async (req, res) => {
  try {
    const { name, email, number, password, address } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const docs = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const ngo = new NGO({
      name,
      email,
      number,
      password: hashedPassword,
      address: { formatted: address },
      documents: docs,
      trialExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await ngo.save();
    res.json({ success: true, message: "NGO registered successfully" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try User
    let account = await User.findOne({ email });
    if (account && await bcrypt.compare(password, account.password)) {
      const token = jwt.sign({ id: account._id, type: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });
      return res.json({ success: true, type: 'user', token });
    }

    // Try NGO
    account = await NGO.findOne({ email });
    if (account && await bcrypt.compare(password, account.password)) {
      const token = jwt.sign({ id: account._id, type: 'ngo' }, process.env.JWT_SECRET, { expiresIn: '30d' });
      return res.json({ success: true, type: 'ngo', token });
    }

    // Neither matched
    return res.json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

export default router;

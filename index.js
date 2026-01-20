import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import ngosRoutes from './routes/ngos.js';
import donationsRoutes from './routes/donations.js';
import coinsRoutes from './routes/coins.js';
import subscriptionsRoutes from './routes/subscriptions.js';
import usersRouter from './routes/users.js';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));
app.use("/uploads", express.static("uploads"));


// simple request logger to help debugging network calls from device
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

// enable CORS preflight responses for all routes (safe default)
app.options('*', cors());


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/ngos', ngosRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/coins', coinsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/users', usersRouter);

// Simple root endpoint
app.get('/', (req, res) => {
  res.send('Helphub API running 🚀');
});

// lightweight ping endpoint for quick connectivity checks from device
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server — listen on all interfaces by default so devices on the LAN can reach it
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server started on ${HOST}:${PORT}`);
});

import mongoose from 'mongoose';

const DonationRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
  type: { type: String, enum: ['Food', 'Clothes', 'Money'], required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const DonationRequest = mongoose.model('DonationRequest', DonationRequestSchema);

export default DonationRequest;

import mongoose from 'mongoose';

const CoinTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const CoinTransaction = mongoose.model('CoinTransaction', CoinTransactionSchema);

export default CoinTransaction;

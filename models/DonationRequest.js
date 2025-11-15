import mongoose from 'mongoose';

const DonationRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Food', 'Clothes', 'Money'], required: true },
  address: { type: String, required: true },
  details: {
    foodQuantity: String,
    foodItem: String,
    foodType: { type: String, enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan'] },
    expirytime: {
      type: String,
      enum: ['1hr', '4hrs', '8hrs', '12hrs', '24hrs'],
      required: function () {
        return this.type === 'Food';
      }
    },
    clothesDescription: String,
    moneyAmount: Number,
  },
  ngoName: { type: String },
  coinsEarned: { type: Number, default: 50 },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const DonationRequest = mongoose.model('DonationRequest', DonationRequestSchema);

export default DonationRequest;

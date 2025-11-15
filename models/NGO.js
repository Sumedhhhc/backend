import mongoose from "mongoose";

const NGOSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  number: { type: String, required: true },
  password: { type: String, required: true },
  address: {
    type: {
      formatted: String,
      geo: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
      },
    },
    required: false,
  },
  status: { type: String, enum: ["available", "occupied"], default: "available" },
  documents: [{ type: String }], // URLs or file refs to uploaded docs
  isVerified: { type: Boolean, default: false },
  trialExpiresAt: { type: Date }, // for trial logic
  subscriptionActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

NGOSchema.index({ "address.geo": "2dsphere" });

const NGO = mongoose.model("NGO", NGOSchema);
export default NGO;

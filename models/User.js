import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
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
  coins: { type: Number},
  createdAt: { type: Date, default: Date.now },
});

UserSchema.index({ "address.geo": "2dsphere" });

const User = mongoose.model("User", UserSchema);
export default User;

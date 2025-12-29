import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  planType: { type: String, default: "Free" },
  credits: { type: Number, default: 200 },    
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Plan", planSchema);

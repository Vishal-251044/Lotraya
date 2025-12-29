import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  videoUrl: { type: String, required: true },
  script: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Video", videoSchema);

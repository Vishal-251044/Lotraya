import express from "express";
import { generateVideo, getUserVideos } from "../controllers/videoController.js";

const router = express.Router();

// Generate video
router.post("/generate", generateVideo);

// Get all videos for a specific user
router.get("/user/:email", getUserVideos);

export default router;

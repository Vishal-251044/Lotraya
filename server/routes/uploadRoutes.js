// routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "temp_uploads/" });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      folder: "uploads",
    });
    fs.unlinkSync(filePath);
    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error("Upload failed:", err.message);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

export default router;

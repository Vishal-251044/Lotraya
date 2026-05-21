// import fs from "fs";
// import path from "path";
// import axios from "axios";
// import FormData from "form-data";
// import dotenv from "dotenv";
// import cloudinary from "cloudinary";
// import Video from "../models/Video.js";
// import Plan from "../models/Plan.js";

// dotenv.config();

// cloudinary.v2.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const ensureTempDir = () => {
//   const dir = path.join(process.cwd(), "temp");
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir);
//   return dir;
// };

// const normalizeUrl = (url) => {
//   if (!url) return null;
//   if (url.startsWith("http")) return url;
//   return `${process.env.CLIENT_URL}${url.startsWith("/") ? "" : "/"}${url}`;
// };

// const downloadFile = async (url, outputPath) => {
//   const fixedUrl = normalizeUrl(url);
//   console.log(`⬇️ Downloading: ${fixedUrl}`);

//   const response = await axios.get(fixedUrl, { responseType: "stream" });
//   const writer = fs.createWriteStream(outputPath);

//   response.data.pipe(writer);

//   return new Promise((resolve, reject) => {
//     writer.on("finish", resolve);
//     writer.on("error", reject);
//   });
// };

// export const generateVideo = async (req, res) => {
//   const tempFiles = [];

//   try {
//     const { userEmail, script, avatarUrl, audioUrl, avatarSize, audioSize } =
//       req.body;

//     if (!userEmail || !script || !avatarUrl || !audioUrl) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     console.log(`🎬 Video generation started for ${userEmail}`);

//     /* ---------------- PLAN CHECK ---------------- */
//     const plan = await Plan.findOne({ userEmail });
//     if (!plan) return res.status(404).json({ message: "Plan not found" });

//     const totalSizeMB = avatarSize + audioSize + script.length / 1_000_000;
//     const pointsRequired = Math.ceil(totalSizeMB * 20);

//     if (plan.credits < pointsRequired) {
//       return res.status(400).json({
//         message: "Low credits",
//         required: pointsRequired,
//         currentCredits: plan.credits,
//       });
//     }

//     /* ---------------- FILE PATHS ---------------- */
//     const tempDir = ensureTempDir();

//     const avatarPath = path.join(tempDir, `avatar_${Date.now()}.mp4`);
//     const audioPath = path.join(tempDir, `audio_${Date.now()}.wav`);
//     const clonedAudioPath = path.join(tempDir, `cloned_${Date.now()}.wav`);
//     const finalVideoPath = path.join(tempDir, `final_${Date.now()}.mp4`);

//     tempFiles.push(avatarPath, audioPath, clonedAudioPath, finalVideoPath);

//     /* ---------------- DOWNLOAD FILES ---------------- */
//     await downloadFile(avatarUrl, avatarPath);
//     await downloadFile(audioUrl, audioPath);

//     /* ---------------- VOICE CLONE ---------------- */
//     console.log("🎤 Voice cloning...");

//     const audioForm = new FormData();
//     audioForm.append("reference_audio", fs.createReadStream(audioPath));
//     audioForm.append("script", script);
//     audioForm.append("language", "en");

//     const voiceRes = await axios.post(
//       "http://localhost:8002/generate_voice",
//       audioForm,
//       {
//         headers: audioForm.getHeaders(),
//         responseType: "arraybuffer",
//         timeout: 300000, // 5 min
//       }
//     );

//     fs.writeFileSync(clonedAudioPath, voiceRes.data);
//     console.log("✅ Voice clone done");

//     /* ---------------- START LIPSYNC JOB ---------------- */
//     console.log("🎞 Starting lipsync job...");

//     const videoForm = new FormData();
//     videoForm.append("face", fs.createReadStream(avatarPath));
//     videoForm.append("audio", fs.createReadStream(clonedAudioPath));

//     const startRes = await axios.post(
//       "http://localhost:8001/generate",
//       videoForm,
//       { headers: videoForm.getHeaders() }
//     );

//     const jobId = startRes.data.job_id;
//     console.log(`🆔 Job ID: ${jobId}`);

//     /* ---------------- POLL STATUS ---------------- */
//     let status = "processing";
//     let attempts = 0;
//     const MAX_WAIT = 10 * 60 * 1000; 
//     const start = Date.now();

//     while (status === "processing") {
//       if (Date.now() - start > MAX_WAIT) {
//         throw new Error("Video generation timeout (CPU limit)");
//       }

//       await new Promise(r => setTimeout(r, 5000));
//       const statusRes = await axios.get(
//         `http://localhost:8001/status/${jobId}`
//       );
//       status = statusRes.data.status;
//     }

//     if (status !== "completed") {
//       throw new Error("Lipsync job failed");
//     }

//     /* ---------------- DOWNLOAD RESULT ---------------- */
//     const videoRes = await axios.get(
//       `http://localhost:8001/download/${jobId}`,
//       { responseType: "arraybuffer" }
//     );

//     fs.writeFileSync(finalVideoPath, videoRes.data);
//     console.log("✅ Video received");

//     /* ---------------- UPLOAD TO CLOUDINARY ---------------- */
//     const uploadRes = await cloudinary.v2.uploader.upload(finalVideoPath, {
//       resource_type: "video",
//       folder: "user_videos",
//     });

//     const videoUrl = uploadRes.secure_url;

//     /* ---------------- SAVE DB ---------------- */
//     plan.credits -= pointsRequired;
//     await plan.save();

//     await Video.create({ userEmail, videoUrl, script });

//     res.status(200).json({
//       message: "🎉 Video generated successfully",
//       videoUrl,
//       usedPoints: pointsRequired,
//       remainingCredits: plan.credits,
//     });
//   } catch (error) {
//     console.error("❌ Video generation error:", error.message);
//     res.status(500).json({ message: error.message });
//   } finally {
//     // Cleanup temp files
//     tempFiles.forEach((file) => {
//       if (fs.existsSync(file)) fs.unlinkSync(file);
//     });
//   }
// };

// export const getUserVideos = async (req, res) => {
//   try {
//     const { email } = req.params;
//     if (!email) return res.status(400).json({ message: "Email required" });

//     const videos = await Video.find({ userEmail: email }).sort({
//       createdAt: -1,
//     });

//     res.status(200).json({ videos });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch videos" });
//   }
// };




import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import Video from "../models/Video.js";
import Plan from "../models/Plan.js";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ensureTempDir = () => {
  const dir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  return dir;
};

const normalizeUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${process.env.CLIENT_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

const downloadFile = async (url, outputPath) => {
  const fixedUrl = normalizeUrl(url);
  console.log(`⬇️ Downloading: ${fixedUrl}`);

  const response = await axios.get(fixedUrl, { responseType: "stream" });
  const writer = fs.createWriteStream(outputPath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

export const generateVideo = async (req, res) => {
  const tempFiles = [];

  try {
    const { userEmail, script, avatarUrl, audioUrl, avatarSize, audioSize } =
      req.body;

    if (!userEmail || !script || !avatarUrl || !audioUrl) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log(`🎬 Video generation started for ${userEmail}`);

    /* ---------------- PLAN CHECK ---------------- */
    const plan = await Plan.findOne({ userEmail });
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const totalSizeMB = avatarSize + audioSize + script.length / 1_000_000;
    const pointsRequired = Math.ceil(totalSizeMB * 20);

    if (plan.credits < pointsRequired) {
      return res.status(400).json({
        message: "Low credits",
        required: pointsRequired,
        currentCredits: plan.credits,
      });
    }

    /* ---------------- FILE PATHS ---------------- */
    const tempDir = ensureTempDir();

    const avatarPath = path.join(tempDir, `avatar_${Date.now()}.mp4`);
    const audioPath = path.join(tempDir, `audio_${Date.now()}.wav`);
    const finalVideoPath = path.join(tempDir, `final_${Date.now()}.mp4`);

    tempFiles.push(avatarPath, audioPath, finalVideoPath);

    /* ---------------- DOWNLOAD FILES ---------------- */
    await downloadFile(avatarUrl, avatarPath);
    await downloadFile(audioUrl, audioPath);

    /* ---------------- SINGLE VIDEO API ---------------- */
    const videoApiUrl = process.env.VIDEO_GENERATION_API_URL;
    const videoApiKey = process.env.VIDEO_GENERATION_API_KEY;

    if (!videoApiUrl || !videoApiKey) {
      throw new Error(
        "Video generation API is not configured. Please set VIDEO_GENERATION_API_URL and VIDEO_GENERATION_API_KEY."
      );
    }

    console.log("🎞 Sending request to video generation API...");

    const videoForm = new FormData();
    videoForm.append("script", script);
    videoForm.append("language", "en");
    videoForm.append("video", fs.createReadStream(avatarPath));
    videoForm.append("audio", fs.createReadStream(audioPath));

    const videoRes = await axios.post(videoApiUrl, videoForm, {
      headers: {
        ...videoForm.getHeaders(),
        "X-API-Key": videoApiKey,
      },
      responseType: "arraybuffer",
      timeout: 600000,
      validateStatus: () => true,
    });

    if (videoRes.status < 200 || videoRes.status >= 300) {
      let errorMessage = `Video API request failed with status ${videoRes.status}`;

      try {
        const payload = JSON.parse(Buffer.from(videoRes.data).toString("utf8"));
        if (payload?.detail) {
          errorMessage = Array.isArray(payload.detail)
            ? payload.detail.join(", ")
            : payload.detail;
        } else if (payload?.message) {
          errorMessage = payload.message;
        }
      } catch {
        const text = Buffer.from(videoRes.data).toString("utf8").trim();
        if (text) errorMessage = text;
      }

      throw new Error(errorMessage);
    }

    fs.writeFileSync(finalVideoPath, videoRes.data);
    console.log("✅ Video received from API");

    /* ---------------- UPLOAD TO CLOUDINARY ---------------- */
    const uploadRes = await cloudinary.v2.uploader.upload(finalVideoPath, {
      resource_type: "video",
      folder: "user_videos",
    });

    const videoUrl = uploadRes.secure_url;

    /* ---------------- SAVE DB ---------------- */
    plan.credits -= pointsRequired;
    await plan.save();

    await Video.create({ userEmail, videoUrl, script });

    res.status(200).json({
      message: "🎉 Video generated successfully",
      videoUrl,
      usedPoints: pointsRequired,
      remainingCredits: plan.credits,
    });
  } catch (error) {
    console.error("❌ Video generation error:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    // Cleanup temp files
    tempFiles.forEach((file) => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
  }
};

export const getUserVideos = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ message: "Email required" });

    const videos = await Video.find({ userEmail: email }).sort({
      createdAt: -1,
    });

    res.status(200).json({ videos });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch videos" });
  }
};
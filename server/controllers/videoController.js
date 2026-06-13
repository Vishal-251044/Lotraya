import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import cloudinary from "cloudinary";
import Video from "../models/Video.js";
import Plan from "../models/Plan.js";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ensureTempDir = () => {
  const dir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const cleanupTempFiles = (files) => {
  for (const filePath of files) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

const normalizeUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const clientUrl = process.env.CLIENT_URL;
  if (!clientUrl) {
    throw new Error("CLIENT_URL is missing for relative media URLs");
  }

  return `${clientUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

const getFileExtensionFromUrl = (url, fallbackExtension) => {
  try {
    const { pathname } = new URL(normalizeUrl(url));
    return path.extname(pathname) || fallbackExtension;
  } catch {
    return fallbackExtension;
  }
};

const downloadFile = async (url, outputPath) => {
  const sourceUrl = normalizeUrl(url);
  const response = await axios.get(sourceUrl, { responseType: "stream" });
  const writer = fs.createWriteStream(outputPath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

const getGeneratorBaseUrl = () => {
  if (process.env.VIDEO_GENERATOR_URL) {
    return process.env.VIDEO_GENERATOR_URL.replace(/\/$/, "");
  }

  const host =
    process.env.VIDEO_GENERATOR_HOST || process.env.VIDEO_GENERATOR_IP;
  const port = process.env.VIDEO_GENERATOR_PORT;

  if (!host || !port) {
    throw new Error(
      "Set VIDEO_GENERATOR_URL or VIDEO_GENERATOR_HOST/VIDEO_GENERATOR_IP with VIDEO_GENERATOR_PORT in .env"
    );
  }

  return `http://${host}:${port}`;
};

const createGeneratorHeaders = (form) => {
  const apiKey = process.env.VIDEO_GENERATOR_API_KEY;

  if (!apiKey) {
    throw new Error("VIDEO_GENERATOR_API_KEY is missing");
  }

  return {
    ...form.getHeaders(),
    "X-API-Key": apiKey,
  };
};

export const generateVideo = async (req, res) => {
  const tempFiles = [];

  try {
    const { userEmail, script, avatarUrl, audioUrl, avatarSize, audioSize } =
      req.body;

    if (!userEmail || !script || !avatarUrl || !audioUrl) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log(`Video generation started for ${userEmail}`);

    const plan = await Plan.findOne({ userEmail });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const avatarMb = Number(avatarSize) || 0;
    const audioMb = Number(audioSize) || 0;
    const totalSizeMb = avatarMb + audioMb + script.length / 1_000_000;
    const pointsRequired = Math.ceil(totalSizeMb * 20);

    if (plan.credits < pointsRequired) {
      return res.status(400).json({
        message: "Low credits",
        required: pointsRequired,
        currentCredits: plan.credits,
      });
    }

    const tempDir = ensureTempDir();
    const uniqueSuffix = Date.now();
    const avatarPath = path.join(
      tempDir,
      `avatar_${uniqueSuffix}${getFileExtensionFromUrl(avatarUrl, ".jpg")}`
    );
    const audioPath = path.join(
      tempDir,
      `audio_${uniqueSuffix}${getFileExtensionFromUrl(audioUrl, ".wav")}`
    );
    const finalVideoPath = path.join(tempDir, `final_${uniqueSuffix}.mp4`);

    tempFiles.push(avatarPath, audioPath, finalVideoPath);

    await downloadFile(avatarUrl, avatarPath);
    await downloadFile(audioUrl, audioPath);

    const generatorForm = new FormData();
    generatorForm.append("script", script);
    generatorForm.append("language", "en");
    generatorForm.append("audio", fs.createReadStream(audioPath));
    generatorForm.append("video", fs.createReadStream(avatarPath));

    const generatorResponse = await axios.post(
      `${getGeneratorBaseUrl()}/generate`,
      generatorForm,
      {
        headers: createGeneratorHeaders(generatorForm),
        responseType: "arraybuffer",
        timeout: 300000,
      }
    );

    fs.writeFileSync(finalVideoPath, generatorResponse.data);

    const uploadResponse = await cloudinary.v2.uploader.upload(finalVideoPath, {
      resource_type: "video",
      folder: "user_videos",
    });

    const videoUrl = uploadResponse.secure_url;

    plan.credits -= pointsRequired;
    await plan.save();

    await Video.create({ userEmail, videoUrl, script });

    return res.status(200).json({
      message: "Video generated successfully",
      videoUrl,
      usedPoints: pointsRequired,
      remainingCredits: plan.credits,
    });
  } catch (error) {
    const rawError = error.response?.data;
    const responseMessage =
      typeof rawError === "string"
        ? rawError
        : rawError?.message || rawError?.detail;
    const message = responseMessage || error.message || "Video generation failed";

    console.error("Video generation error:", message);
    return res.status(error.response?.status || 500).json({ message });
  } finally {
    cleanupTempFiles(tempFiles);
  }
};

export const getUserVideos = async (req, res) => {
  try {
    const { email } = req.params;
    const videos = await Video.find({ userEmail: email }).sort({ createdAt: -1 });
    return res.status(200).json({ videos });
  } catch (error) {
    console.error("Fetch videos error:", error.message);
    return res.status(500).json({ message: "Failed to fetch videos" });
  }
};
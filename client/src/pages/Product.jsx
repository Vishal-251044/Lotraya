import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../pagesStyles/Product.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import avatar1 from "../assets/401.jpeg";
import avatar2 from "../assets/402.avif";
import avatar3 from "../assets/403.jpg";
import avatar4 from "../assets/404.jpg";
import avatar5 from "../assets/405.jpg";
import avatar6 from "../assets/406.jpg";
import avatar7 from "../assets/407.jpg";
import avatar8 from "../assets/408.jpg";

import audio1 from "../assets/501.mp3";
import audio2 from "../assets/502.mp3";
import audio3 from "../assets/503.mp3";
import audio4 from "../assets/504.mp3";

const Product = () => {
  const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8];
  const audios = [audio1, audio2, audio3, audio4];

  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [script, setScript] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) return;
    const fetchVideos = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/video/user/${user.email}`);
        const data = await res.json();
        if (res.ok) {
          setVideos(data.videos || []);
        } else {
          toast.error("❌ Failed to load videos", { theme: "dark" });
        }
      } catch (err) {
        toast.error("⚠️ Error fetching videos", { theme: "dark" });
      }
    };
    fetchVideos();
  }, [user]);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setSelectedAvatar(fileURL);
      setIsVideo(file.type.startsWith("video"));
      toast.success("✅ Avatar uploaded successfully!", { theme: "dark" });
    }
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setSelectedAudio(fileURL);
      toast.success("✅ Audio uploaded successfully!", { theme: "dark" });
    }
  };

  const handleGenerate = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
      toast.error("⚠️ Please login first!", { theme: "dark" });
      return;
    }

    if (!selectedAvatar || !selectedAudio || !script.trim()) {
      toast.error("⚠️ Incomplete input!", { theme: "dark" });
      return;
    }

    const avatarSize = selectedAvatar.size ? selectedAvatar.size / (1024 * 1024) : 1;
    const audioSize = selectedAudio.size ? selectedAudio.size / (1024 * 1024) : 1;

    const totalSizeMB = avatarSize + audioSize + script.length / 1000000;
    const points = Math.ceil(totalSizeMB * 20);

    toast.info(`🧮 Calculated ${points} points required.`, { theme: "dark" });

    try {
      setLoading(true);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/video/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user.email,
          avatarUrl: selectedAvatar,
          audioUrl: selectedAudio,
          avatarSize,
          audioSize,
          script
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(`❌ ${data.message || "Failed to generate video"}`, { theme: "dark" });
      } else {
        toast.success(
          `🎬 ${data.message} Used ${data.usedPoints} points. Remaining: ${data.remainingCredits}`,
          { theme: "dark" }
        );
      }
    } catch (error) {
      toast.error("⚠️ Server error! Please try again later.", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="bottom-right" theme="dark" autoClose={2500} hideProgressBar />

      <div className="product-page">
        <div className="product-grid">

          {/* ✅ Avatar Section */}
          <div className="product-card avatar-section">
            <h3>+ Select an avatar</h3>
            <p>A well-lit close-up or half-body photo works best</p>

            <div className="btn-group">
              <label htmlFor="avatarUpload" className="upload-btn">
                <i className="fa-solid fa-image"></i> Upload Photo
              </label>
              <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarUpload}
              />
            </div>

            <div className="sample-row">
              <p>Try a sample photo</p>
              <div className="sample-list">
                {avatars.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`avatar-${i}`}
                    className={`sample-avatar ${selectedAvatar === img ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedAvatar(img);
                      toast.info("✅ Avatar selected!", { theme: "dark" });
                    }}
                  />
                ))}
              </div>
            </div>

            {selectedAvatar && (
              <div className="preview-box">
                {isVideo ? (
                  <video
                    src={selectedAvatar}
                    controls
                    width="100%"
                    style={{
                      borderRadius: "8px",
                      maxHeight: "300px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <img
                    src={selectedAvatar}
                    alt="preview"
                    width="100%"
                    style={{
                      borderRadius: "8px",
                      maxHeight: "300px",
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* ✅ Audio Section */}
          <div className="product-card audio-section">
            <h3>+ Select an audio</h3>
            <p>Please note we support audio uploads of any languages.</p>

            <div className="btn-group">
              <label htmlFor="audioUpload" className="upload-btn">
                <i className="fa-solid fa-file-audio"></i> Upload Your Voice
              </label>
              <input
                id="audioUpload"
                type="file"
                accept="audio/*"
                style={{ display: "none" }}
                onChange={handleAudioUpload}
              />
            </div>

            <div className="sample-row">
              <p>Try a sample audio</p>
              <div className="sample-list">
                {audios.map((audio, i) => (
                  <div
                    key={i}
                    className={`audio-box ${selectedAudio === audio ? "selected" : ""}`}
                    onClick={() => {
                      toast.dismiss();
                      setSelectedAudio(audio);
                      toast.info("✅ Audio selected!", {
                        theme: "dark",
                        position: "bottom-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        pauseOnHover: false,
                        closeOnClick: true,
                      });
                    }}
                  >
                    <audio
                      className="sample-audio"
                      controls
                      controlsList="nodownload noplaybackrate noremoteplayback"
                    >
                      <source src={audio} type="audio/mp3" />
                    </audio>
                  </div>
                ))}
              </div>
            </div>

            {selectedAudio && (
              <div className="preview-box">
                <audio src={selectedAudio} controls />
              </div>
            )}
          </div>

          {/* ✅ Generate Section */}
          <div className="product-card generate-section">
            <textarea
              placeholder="Write a script to generate a video..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
            ></textarea>
            <div className="generate-actions">
              <button className="generate-btn" onClick={handleGenerate} disabled={loading}>
                {loading ? "⏳ Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Recent Creations Section */}
        <div className="recent-creations">
          <h3>Your Videos :</h3>
          {videos.length === 0 ? (
            <p className="no-video-text">No videos generated yet.</p>
          ) : (
            <div className="recent-grid">
              {videos.map((vid, i) => (
                <div key={i} className="recent-box">
                  <video controls src={vid.videoUrl}></video>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Product;

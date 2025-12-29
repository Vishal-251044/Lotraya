import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../pagesStyles/Home.css";

import img1 from "../assets/1.webp";
import img2 from "../assets/2.webp";
import img3 from "../assets/3.webp";
import img4 from "../assets/4.jpg";
import img5 from "../assets/5.jpg";
import img6 from "../assets/6.jpg";
import img7 from "../assets/7.jpg";
import img8 from "../assets/8.jpg";
import img9 from "../assets/9.jpg";
import img10 from "../assets/10.jpg";
import img11 from "../assets/11.jpg";
import img12 from "../assets/12.jpg";
import img13 from "../assets/13.jpg";

import icon1 from "../assets/101.png";
import icon2 from "../assets/102.png";
import icon3 from "../assets/103.png";

import step1Img from "../assets/301.png";
import step2Img from "../assets/302.png";
import step3Img from "../assets/303.mp4";

const Home = () => {
  const navigate = useNavigate();
  const images = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12, img13];

  return (
    <>
      <Navbar />

      <div className="home-container">
        {/* Image Slider */}
        <div className="image-slider">
          <div className="image-track">
            {images.concat(images).map((src, index) => (
              <img key={index} src={src} alt={`slide-${index}`} />
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="hero-content">
          <h1>
            Bring Your Characters to Life <br /> with Expressive Animation
          </h1>
          <p>
            Our AI turns any photo into a realistic, engaging video. Give your digital persona a voice with synced audio, natural facial movements, and dynamic gestures. Just upload your picture and script to unlock the next generation of AI-driven video creation.
          </p>

          <button
            className="cta-btn"
            onClick={() => navigate("/product")}
          >
            Try for Free →
          </button>        </div>

        {/* Features Section */}
        <div className="features-section">
          <div className="feature-box reverse">
            <img src={icon1} alt="feature icon" className="feature-icon" />
            <div className="feature-content">
              <h3>Create 60 Seconds of Talking Brilliance</h3>
              <p>
                Turn any photo into a lively talking video of up to 60 seconds—perfect for stories, product showcases, or character conversations. More time means greater impact.
              </p>

            </div>
          </div>

          <div className="feature-box">
            <img src={icon2} alt="feature icon" className="feature-icon-right" />
            <div className="feature-content">
              <h3>Your Voice, Your Identity</h3>
              <p>
                Shape a one-of-a-kind experience using your real voice or a personalized AI-trained vocal style. Tailored to match your script, tone, and character perfectly.
              </p>

            </div>
          </div>

          <div className="feature-box reverse">
            <img src={icon3} alt="feature icon" className="feature-icon" />
            <div className="feature-content">
              <h3>Expressive Gestures and Scene Flexibility</h3>
              <p>
                Move past simple talking avatars—add natural gestures, varied poses, and dynamic scene shifts with fluid transitions. Your character performs with intent and realism.
              </p>

            </div>
          </div>
        </div>

        {/* How It steps Section */}
        <div className="steps-section">
          <h2 className="steps-title">
            Start with Just <span>One Photo</span>
          </h2>
          <p className="steps-subtitle">
            One Script. One Click. Full Performance.
          </p>

          {/* Step 1 */}
          <div className="step step-1">
            <div className="step-image">
              <img src={step1Img} alt="Upload a Photo" />
              <button className="step-btn">Upload a Photo</button>
            </div>
            <div className="step-text">
              <span className="step-label">Step 01</span>
              <h3>Upload a Clear Photo</h3>
              <p>
                For the best results, provide a well-lit portrait, half-body, or full-body image. Clear details and good lighting ensure your avatar looks natural, expressive, and true to life in every animation.
              </p>

            </div>
          </div>

          {/* Step 2 */}
          <div className="step step-2 reverse">
            <div className="step-image">
              <img src={step2Img} alt="Add Script" />
            </div>
            <div className="step-text">
              <span className="step-label">Step 02</span>
              <h3>Add Script or Audio</h3>
              <p>
                Simply enter your text or upload a voice recording, and our system will seamlessly synchronize speech with natural movements and expressions.
              </p>

            </div>
          </div>

          {/* Step 3 */}
          <div className="step step-3">
            <div className="step-image">
              <video
                src= {step3Img}  
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
            <div className="step-text">
              <span className="step-label">Step 03</span>
              <h3>Generate the Video</h3>
              <p>
                In just one click, your character transforms into a lifelike performance—talking, moving, and expressing with natural gestures.
              </p>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Home;

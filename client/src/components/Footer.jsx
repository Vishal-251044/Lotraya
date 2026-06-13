import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../componentsStyles/Footer.css";

function Footer() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          {/* Logo + Contact */}
          <div className="footer-section">
            <div className="logo-footer">Lotraya</div>
            <p>Join Us: <a href="#">lotrayasupport@gmail.com</a></p>
            <p>Contact Us: <a href="#">+91 9999999999</a></p>
          </div>

          {/* Features */}
          <div className="footer-section">
            <h4>Feature</h4>
            <NavLink to="/">Storytelling Tools</NavLink>
            <NavLink to="/">Multilingual Avatar</NavLink>
            <NavLink to="/">Expression Full of Emotions</NavLink>
          </div>

          {/* Company */}
          <div className="footer-section">
            <h4>Company</h4>
            {/* Instead of routing, open modal */}
            <button className="about-link" onClick={() => setAboutOpen(true)}>
              About Us
            </button>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4>Contact Us</h4>
            <a href="#" target="_blank" rel="noreferrer">Twitter</a>
            <a href="#" target="_blank" rel="noreferrer">Facebook</a>
            <a href="#" target="_blank" rel="noreferrer">YouTube</a>
            <a href="#" target="_blank" rel="noreferrer">Instagram</a>
          </div>

          {/* Policy */}
          <div className="footer-section">
            <h4>Policy</h4>
            <NavLink to="/">Acceptable Use Policy</NavLink>
            <NavLink to="/">Privacy Policy</NavLink>
            <NavLink to="/">Terms of Service</NavLink>
            <NavLink to="/">Dispute Policy</NavLink>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Lotraya. All Rights Reserved.</p>
        </div>
      </footer>

      {/* About Modal */}
      {aboutOpen && (
        <div className="about-overlay" onClick={() => setAboutOpen(false)}>
          <div className="about-container" onClick={(e) => e.stopPropagation()}>
            <button className="about-close" onClick={() => setAboutOpen(false)}>✖</button>
            <h2 className="about-title">About Lotraya</h2>
            <div className="about-content">
              <p>
                Lotraya is an advanced AI-powered storytelling platform that brings 
                imagination to life. It lets you create avatars, animate them with 
                realistic emotions, and generate multilingual narratives. Whether 
                you’re a creator, educator, or business, Lotraya helps you craft 
                interactive stories and videos effortlessly.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Footer;

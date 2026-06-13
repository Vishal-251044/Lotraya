import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../pagesStyles/Login.css";

import bgImage from "../assets/201.jpg";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/"); 
    }
  }, [navigate]);

  // Handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manual Login/Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = isLogin
      ? `${import.meta.env.VITE_API_URL}/api/auth/login`
      : `${import.meta.env.VITE_API_URL}/api/auth/register`;

    try {
      const response = await axios.post(url, formData);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);

      toast.success(isLogin ? "Login Successful!" : "Account Created Successfully!", {
        style: {
          backgroundColor: "#1e2f1e",
          color: "#b6fbb6",
          borderRadius: "10px",
          fontSize: "14px",
        },
      });
      navigate("/product");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong", {
        style: {
          backgroundColor: "#2f1e1e",
          color: "#ffb6b6",
          borderRadius: "10px",
          fontSize: "14px",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Google Auth
  const handleGoogleAuth = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/google-auth`,
        {
          token: credentialResponse.credential,
        }
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      toast.success("Google Login Successful!", {
        style: {
          backgroundColor: "#1e2f1e",
          color: "#b6fbb6",
          borderRadius: "10px",
          fontSize: "14px",
        },
      });
      navigate("/product");
    } catch (error) {
      toast.error("Google Authentication Failed!", {
        style: {
          backgroundColor: "#2f1e1e",
          color: "#ffb6b6",
          borderRadius: "10px",
          fontSize: "14px",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div
        className="login-container"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <button className="back-home-btn" onClick={() => navigate("/")}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>

        <div className="login-box">
          <h2>{isLogin ? "Login" : "Register"}</h2>

          <form className="login-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                required
              />
            )}

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <i className="fa-solid fa-eye"></i>
                ) : (
                  <i className="fa-solid fa-eye-slash"></i>
                )}
              </span>
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
            </button>

            {/* Google Login */}
            <div className="google-login">
              <GoogleLogin
                onSuccess={handleGoogleAuth}
                onError={() =>
                  toast.error("Google Login Failed", {
                    style: {
                      backgroundColor: "#2f1e1e",
                      color: "#ffb6b6",
                      borderRadius: "10px",
                      fontSize: "14px",
                    },
                  })
                }
              />
            </div>

            <p>
              {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
              <span className="link" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Register" : "Login"}
              </span>
            </p>
          </form>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </GoogleOAuthProvider>
  );
};

export default Login;

import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../componentsStyles/Navbar.css";
import PricingModal from "./PricingModal";
import credit from "../assets/credit.png";
import { FaEdit } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Navbar() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({ name: "", password: "" });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    if (loggedUser) setUser(loggedUser);
  }, []);

  useEffect(() => {
    if (user) fetchPlan();
  }, [user]);

  const fetchPlan = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/plan/getUserPlan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (data.success) setPlan(data.plan);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch plan");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setPlan(null);
    navigate("/login");
  };

  const getUserInitial = () => (user?.name ? user.name.charAt(0).toUpperCase() : "");

  const handleEditClick = () => {
    setUpdatedUser({ name: user.name, password: "" });
    setShowModal(true);
    setIsDropdownOpen(false);
  };

  const handleChange = (e) => setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: updatedUser.name,
          password: updatedUser.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedUserData = { ...user, name: updatedUser.name };
        setUser(updatedUserData);
        localStorage.setItem("user", JSON.stringify(updatedUserData));
        setShowModal(false);
        toast.success("User details updated successfully!");
      } else {
        toast.error(data.message || "Error updating user details");
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Open Pricing modal
  const handlePricingOpen = () => setIsPricingOpen(true);

  return (
    <>
      <nav className="navbar">
        <div className="logo-nav">Lotraya</div>

        <div className="nav-links">
          <button className="nav-btn-pricing" onClick={handlePricingOpen}>
            <img src={credit} alt="Pricing Icon" className="pricing-icon" />
            <span>{plan ? `${plan.planType} | ${plan.credits} coins` : "Pricing"}</span>
          </button>

          {user ? (
            <div className="user-avatar-wrapper" ref={dropdownRef}>
              <div
                className="user-avatar-circle"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {getUserInitial()}
              </div>

              {isDropdownOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <span><b>Name: </b>{user.name}</span>
                    <span><b>Email: </b>{user.email}</span>
                    <div>
                      <FaEdit className="edit-icon" onClick={handleEditClick} />
                    </div>
                  </div>
                  <div className="user-actions">
                    <button className="logout-btn" onClick={handleLogout}>
                      <i className="fa-solid fa-right-from-bracket"></i> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="nav-btn-login">
              <i className="fa-regular fa-user"></i> Login
            </NavLink>
          )}
        </div>
      </nav>

      {/* Pricing Modal */}
      {isPricingOpen && (
        <PricingModal onClose={() => setIsPricingOpen(false)} user={user} setPlan={setPlan} />
      )}

      {/* Edit User Modal */}
      {showModal && (
        <div className="edit-modal">
          <div className="modal-content">
            <h2>Edit Profile</h2>
            <input
              type="text"
              name="name"
              placeholder="Update Name"
              value={updatedUser.name}
              onChange={handleChange}
              className="input-field-edit"
            />
            <input
              type="password"
              name="password"
              placeholder="Update Password"
              value={updatedUser.password}
              onChange={handleChange}
              className="input-field-edit"
            />
            <div className="modal-buttons">
              <button className="primary-button" onClick={handleUpdate} disabled={loading}>
                {loading ? "Updating..." : "Confirm"}
              </button>
              <button className="secondary-button" onClick={() => setShowModal(false)} disabled={loading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast container inside Navbar */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default Navbar;

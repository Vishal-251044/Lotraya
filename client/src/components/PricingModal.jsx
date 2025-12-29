import { useState, useEffect } from "react";
import "../componentsStyles/PricingModal.css";
import creditIcon from "../assets/credit.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PricingModal({ onClose, user, setPlan }) {
  const [activeTab, setActiveTab] = useState("subscription");
  const [userPlan, setUserPlan] = useState(null);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (navigator.brave && navigator.brave.isBrave) {
      document.body.classList.add("is-brave");
    } else if (ua.includes("chrome")) {
      document.body.classList.add("is-chrome");
    }

    if (user) fetchUserPlan();
  }, [user]);

  const fetchUserPlan = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/plan/getUserPlan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (data.success) setUserPlan(data.plan);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching user plan");
    }
  };

  const handlePayment = (amount, description, planType = null, credits = null, isCoin = false) => {
    if (!user) {
      toast.warn("Please login first!");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);

    script.onload = async () => {
      const options = {
        key: "rzp_test_oB6Z965by3wM4n",
        amount: amount,
        currency: "INR",
        name: "Lotraya",
        description,
        handler: async function () {
          try {
            const updateRes = await fetch(`${import.meta.env.VITE_API_URL}/api/plan/updatePlan`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                planType: isCoin ? null : planType,
                credits,
                isCoin,
              }),
            });
            const updateData = await updateRes.json();
            if (updateData.success) {
              toast.success("Payment successful & plan updated!");
              setUserPlan(updateData.plan);
              if (setPlan) setPlan(updateData.plan);
            } else {
              toast.error(updateData.message || "Failed to update plan");
            }
          } catch (err) {
            console.error(err);
            toast.error("Error updating plan after payment");
          }
        },
        prefill: { email: user.email, name: user.name },
        theme: { color: "#1a73e8" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    };
  };

  const handleSubscribeClick = (plan) => {
    if (!user) {
      toast.warn("Please login first!");
      return;
    }

    const planPriority = { Free: 1, Pro: 2, Premium: 3 };
    if (userPlan && planPriority[plan.planType] <= planPriority[userPlan.planType]) {
      toast.warn("Cannot buy same or lower plan. Buy higher plan or coins.");
      return;
    }

    const amount = plan.price === "$0.0" ? 0 : parseFloat(plan.price.slice(1)) * 100;
    handlePayment(amount, `Subscribe ${plan.planType}`, plan.planType, plan.credits, false);
  };

  const handleBuyCredits = (credit) => {
    if (!user) {
      toast.warn("Please login first!");
      return;
    }

    const amount = parseFloat(credit.price.slice(1)) * 100;
    handlePayment(amount, `Purchase ${credit.amount} credits`, null, parseInt(credit.amount), true);
  };

  const subscriptionPlans = [
    {
      planType: "Free",
      price: "₹ 0.0",
      credits: 200,
      duration: "per month",
      features: [
        "High-quality video generation",
        "Free voices with 10+ language",
        "Up to 30s video length",
        "Standard queue",
      ],
    },
    {
      planType: "Pro",
      price: "₹ 39.9",
      credits: 7000,
      duration: "per month",
      features: [
        "All Free benefits",
        "Up to 2 min video length",
        "Priority queue",
        "Commercial use permitted",
      ],
    },
    {
      planType: "Premium",
      price: "₹ 99.9",
      credits: 20000,
      duration: "per month",
      features: [
        "All Free benefits",
        "Up to 5 min video length",
        "Priority queue",
        "Priority support",
        "Commercial use permitted",
      ],
    },
  ];

  const creditsList = [
    { amount: "100", price: "₹ 1.0" },
    { amount: "200", price: "₹ 2.0" },
    { amount: "500", price: "₹ 5.0" },
    { amount: "1000", price: "₹ 10.0" },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>
          ✖
        </button>
        <h2 className="modal-title">Members receive exclusive advantages</h2>

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "subscription" ? "active" : ""}`}
            onClick={() => setActiveTab("subscription")}
          >
            Subscription
          </button>
          <button
            className={`tab-btn ${activeTab === "credits" ? "active" : ""}`}
            onClick={() => setActiveTab("credits")}
          >
            Credits
          </button>
        </div>

        {activeTab === "subscription" && (
          <div className="plans">
            {subscriptionPlans.map((plan, i) => (
              <div className="plan-card" key={i}>
                <h3>{plan.planType}</h3>
                <p className="price">
                  {plan.price} <span>{plan.duration}</span>
                </p>
                <p className="credits">{plan.credits} credits/month</p>
                <ul>{plan.features.map((feat, idx) => <li key={idx}>{feat}</li>)}</ul>
                <button className="plan-btn" onClick={() => handleSubscribeClick(plan)}>
                  {userPlan?.planType === plan.planType
                    ? `${plan.planType} - ${userPlan.credits} credits`
                    : plan.planType === "Free"
                      ? "Subscribe Free Plan"
                      : "Subscribe"}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "credits" && (
          <div className="credits-container">
            <p className="tips">
              Credits purchased alone are non-exchangeable for memberships and cannot be refunded, transferred, or withdrawn. Valid for lifetime.
            </p>
            <div className="credits-grid">
              {creditsList.map((credit, i) => (
                <div className="credit-card" key={i}>
                  <img src={creditIcon} alt="credit" className="credit-img" />
                  <h4>{credit.amount} Credits</h4>
                  <p>{credit.price}</p>
                  <button className="plan-btn" onClick={() => handleBuyCredits(credit)}>
                    Purchase
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toast container inside modal */}
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
      </div>
    </div>
  );
}

export default PricingModal;

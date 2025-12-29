import Plan from "../models/Plan.js";

// Get user plan
export const getUserPlan = async (req, res) => {
  try {
    const { email } = req.body;
    let plan = await Plan.findOne({ userEmail: email });

    if (!plan) {
      // Auto-assign Free plan
      plan = await Plan.create({ userEmail: email, planType: "Free", credits: 200 });
    }

    res.json({ success: true, plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update / purchase plan or add coins
export const updatePlan = async (req, res) => {
  try {
    const { email, planType, credits } = req.body;

    const plan = await Plan.findOne({ userEmail: email });

    if (!plan) {
      // If no plan exists, create one (Free plan by default)
      const newPlan = await Plan.create({
        userEmail: email,
        planType: planType || "Free",
        credits: credits || 0,
      });
      return res.json({ success: true, plan: newPlan });
    }

    // Determine plan hierarchy
    const planOrder = { Free: 1, Pro: 2, Premium: 3 };

    let updatedPlan = { ...plan._doc }; 

    // Upgrade plan only if new plan is higher
    if (planType && planOrder[planType] > planOrder[plan.planType]) {
      updatedPlan.planType = planType;
      updatedPlan.credits = credits || plan.credits; 
    } 
    // If only buying coins, just increase credits
    else if (!planType && credits) {
      updatedPlan.credits += credits;
    } 
    // Prevent buying same or lower plan
    else if (planType && planOrder[planType] <= planOrder[plan.planType]) {
      return res.status(400).json({ success: false, message: "Cannot downgrade or buy same plan again" });
    }

    updatedPlan.updatedAt = Date.now();

    const savedPlan = await Plan.findOneAndUpdate(
      { userEmail: email },
      updatedPlan,
      { new: true }
    );

    res.json({ success: true, plan: savedPlan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

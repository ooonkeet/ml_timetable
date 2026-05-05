import Activity from "../../models/admin/activity.model.js";

export const getRecentActivities = async (req, res) => {
  try {
    // Fetch the 5 most recent activities, sorted by creation date
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(5);
    res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({ message: "Failed to fetch recent activities" });
  }
};

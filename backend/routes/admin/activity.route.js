import express from "express";
import { getRecentActivities } from "../../controllers/admin/activity.controller.js";

const router = express.Router();

// GET /api/v1/activity/recent
router.get("/recent", getRecentActivities);

export default router;


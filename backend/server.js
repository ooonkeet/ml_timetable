import express from "express";
import dotenv from "dotenv";
import connectDB from "./lib/db.js";

import Timetable from "./models/timetable/timeTable.model.js";
import subjectRoutes from "./routes/admin/subjects.route.js";
import programRoutes from "./routes/admin/program.routes.js";
import sectionRoutes from "./routes/admin/section.route.js";
import streamRoutes from "./routes/admin/stream.route.js";
import classSettingsRoutes from "./routes/admin/classSettings.route.js";
import universityRoutes from "./routes/admin/university.route.js";
import authroutes from "./routes/auth/auth.routes.js";
import timetableRoutes from './routes/modifier/timetable.routes.js';
import activityRoutes from "./routes/admin/activity.route.js";
import cors from 'cors'
dotenv.config();
connectDB();

const app = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use("/api/v1/subjects", subjectRoutes);
app.use("/api/v1/programs", programRoutes);
app.use("/api/v1/sections", sectionRoutes);
app.use("/api/v1/streams", streamRoutes);
app.use("/api/v1/classSettings", classSettingsRoutes);
app.use("/api/v1/university", universityRoutes);
app.use("/api/v1/auth", authroutes);
app.use("/api/v1/timetable", timetableRoutes);
app.use("/api/v1/activity", activityRoutes);
app.post("/test", (req, res) => {
    console.log("BODY:", req.body);
    res.json({ received: req.body });
});
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`✅Server running on port ${PORT}`));

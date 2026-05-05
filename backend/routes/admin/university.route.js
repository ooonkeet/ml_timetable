// src/routes/university.routes.js
import express from "express";
import {
  createUniversity,
  getUniversities,
  getUniversityById,
  updateUniversity,
  deleteUniversity,
} from "../../controllers/admin/university.controller.js";

const router = express.Router();

router.post("/createUni", createUniversity);
router.get("/getUni", getUniversities);
router.get("/uni/:id", getUniversityById);
router.put("/uni/:id", updateUniversity);
router.delete("/uni/:id", deleteUniversity);

export default router;

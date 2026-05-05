import express from 'express'
import {
  timetableController,
  // getTimetables,
  // getTimetableById,
  // deleteTimetable,
  // updateTimetable
} from '../../controllers/modifier/timetable.controller.js';

const router = express.Router();

// ============ TIMETABLE ROUTES ============

// POST: Generate new timetable
// URL: POST /api/v1/timetable/schedule
router.post("/schedule", timetableController);

// GET: Fetch all timetables with optional filters
// URL: GET /api/v1/timetable/all
// Query params: ?universityId=xxx&sectionId=yyy&streamId=zzz
// router.get("/all", getTimetables);

// // GET: Fetch single timetable by ID
// // URL: GET /api/v1/timetable/:timetableId
// router.get("/:timetableId", getTimetableById);

// // PUT: Update timetable
// // URL: PUT /api/v1/timetable/:timetableId
// router.put("/:timetableId", updateTimetable);

// // DELETE: Delete timetable
// // URL: DELETE /api/v1/timetable/:timetableId
// router.delete("/:timetableId", deleteTimetable);

export default router
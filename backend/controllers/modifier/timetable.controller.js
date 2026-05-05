import axios from 'axios';
import Timetable from '../../models/timetable/timeTable.model.js';
import mongoose from 'mongoose';

const SCHEDULER_URL = `http://127.0.0.1:8001/schedule`;

// Generate timetable and save to database
const timetableController = async (req, res) => {
  try {
    console.log("📥 Received timetable generation request");

    // Basic validation
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("❌ Empty request body");
      return res.status(400).json({
        error: "Empty request body",
        tip: "Send JSON with timetable parameters"
      });
    }

    const {
      universityId,
      programId,
      sectionId,
      streamId,
      userId,
      // Python scheduler fields
      sectionsCount,
      theoryRooms,
      labRooms,
      theoryRoomAssignments,
      labRoomAssignments,
      subjects,
      faculty,
      periodsPerDay,
      breakPeriod,
      workingDays,
      constraints
    } = req.body;

    // Validate MongoDB IDs
    if (!universityId || !sectionId) {
      console.log("❌ Missing required MongoDB IDs");
      return res.status(400).json({
        error: "Missing required fields",
        required: ["universityId", "sectionId"],
        tip: "These are needed to link the timetable to your database"
      });
    }

    // Validate Python scheduler requirements
    const requiredFields = [
      'sectionsCount',
      'theoryRooms',
      'labRooms',
      'theoryRoomAssignments',
      'labRoomAssignments',
      'subjects',
      'faculty'
    ];

    const missingFields = [];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      console.log("❌ Missing fields for Python scheduler:", missingFields);
      return res.status(400).json({
        error: "Missing required fields for Python scheduler",
        missingFields: missingFields,
        requiredFields: requiredFields,
        tip: "All these fields are required to generate a timetable"
      });
    }

    console.log("✅ All validations passed");
    console.log("🔄 Forwarding request to Python scheduler:", SCHEDULER_URL);

    // Prepare payload for Python scheduler
    // Send EXACTLY what the Python scheduler expects
    const schedulerPayload = {
      sectionsCount,
      theoryRooms,
      labRooms,
      theoryRoomAssignments,
      labRoomAssignments,
      subjects,
      faculty,
      periodsPerDay: periodsPerDay || 8,
      breakPeriod: breakPeriod || 4,
      workingDays: workingDays || 5
    };

    console.log("📊 Sending to Python scheduler...");
    console.log("   Sections:", sectionsCount);
    console.log("   Subjects:", subjects.map(s => s.name).join(", "));
    console.log("   Faculty:", faculty.map(f => f.name).join(", "));

    // Forward to Python scheduler
    let response;
    try {
      response = await axios.post(SCHEDULER_URL, schedulerPayload, {
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("✅ Python scheduler responded successfully");
      console.log("   Status:", response.status);

    } catch (schedulerErr) {
      console.error("❌ Python scheduler error:");
      console.error("   URL:", SCHEDULER_URL);
      console.error("   Error:", schedulerErr.message);

      if (schedulerErr.response) {
        console.error("   HTTP Status:", schedulerErr.response.status);
        console.error("   Error Details:", JSON.stringify(schedulerErr.response.data, null, 2));

        // Forward Python's error to client
        return res.status(schedulerErr.response.status).json({
          error: "Python scheduler returned an error",
          details: schedulerErr.response.data,
          tip: "Check that all faculty are assigned to sections and all constraints are valid"
        });
      } else {
        console.error("   Connection failed - scheduler may not be running");
        return res.status(502).json({
          error: "Cannot connect to Python scheduler",
          details: "http://127.0.0.1:8001/schedule is not responding",
          tip: "Make sure your Python scheduler is running: python -m uvicorn main:app --host 127.0.0.1 --port 8001"
        });
      }
    }

    // Check if scheduler returned a valid response
    if (!response.data) {
      console.error("❌ Empty response from Python scheduler");
      return res.status(502).json({
        error: "Invalid response from Python scheduler",
        details: "No data returned"
      });
    }

    if (response.status !== 200) {
      console.error("❌ Unexpected status from Python scheduler:", response.status);
      return res.status(response.status).json(response.data);
    }

    console.log("💾 Creating timetable document in MongoDB...");

    // Create new timetable document
    const timetableData = new Timetable({
      university: new mongoose.Types.ObjectId(universityId),
      program: programId ? new mongoose.Types.ObjectId(programId) : null,
      section: new mongoose.Types.ObjectId(sectionId),
      stream: streamId ? new mongoose.Types.ObjectId(streamId) : null,
      schedule: response.data.schedules || response.data,
      createdBy: userId ? new mongoose.Types.ObjectId(userId) : null,
      createdAt: new Date(),
      rawData: {
        input: {
          universityId,
          programId,
          sectionId,
          streamId,
          userId,
          sectionsCount,
          subjectsCount: subjects.length,
          facultyCount: faculty.length
        },
        schedulerPayload: schedulerPayload,
        schedulerResponse: response.data
      }
    });

    console.log("💾 Saving to MongoDB...");

    // Save to database
    await timetableData.save();

    console.log("✅ Timetable saved to MongoDB successfully!");
    console.log("   Timetable ID:", timetableData._id);
    console.log("   Sections:", sectionsCount);

    return res.status(200).json({
      success: true,
      message: "Timetable generated and saved successfully",
      timetableId: timetableData._id,
      data: response.data
    });

  } catch (err) {
    console.error("❌ CRITICAL ERROR in timetableController:");
    console.error("   Message:", err.message);
    console.error("   Type:", err.constructor.name);

    // Database errors
    if (err.name === 'MongoError' || err.name === 'MongooseError') {
      console.error("   MongoDB error details:", err);
      return res.status(500).json({
        error: "Database error while saving timetable",
        details: err.message
      });
    }

    // Network errors
    if (err.code === 'ECONNREFUSED') {
      return res.status(502).json({
        error: "Cannot connect to Python scheduler",
        details: "Connection refused on http://127.0.0.1:8001",
        tip: "Ensure Python scheduler is running"
      });
    }

    if (err.code === 'ENOTFOUND') {
      return res.status(502).json({
        error: "DNS resolution failed",
        details: "Cannot resolve scheduler host"
      });
    }

    if (err.code === 'ETIMEDOUT') {
      return res.status(504).json({
        error: "Request timeout",
        details: "Python scheduler took too long to respond",
        tip: "Try increasing timeout or check Python scheduler performance"
      });
    }

    // Generic error
    return res.status(500).json({
      error: "Failed to generate timetable",
      details: err.message,
      type: err.constructor.name
    });
  }
};

export { timetableController };
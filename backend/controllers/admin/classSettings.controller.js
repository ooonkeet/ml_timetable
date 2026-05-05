import ClassSettings from "../../models/admin/classSettings.model.js";
import Activity from "../../models/admin/activity.model.js"; // Import Activity model

export const createClassSettings = async (req, res) => {
  try {
    // Validate required fields
    const { stream, classDuration, classDays, break: breakTime } = req.body;
    
    if (!stream || !classDuration || !classDays || !Array.isArray(classDays)) {
      return res.status(400).json({ 
        message: "Missing required fields or invalid format" 
      });
    }

    // Create new class settings
    const info = new ClassSettings({
      stream,
      classDuration,
      classDays,
      break: {
        start: breakTime?.start || '',
        end: breakTime?.end || ''
      }
    });

    await info.save();
    const savedInfo = await ClassSettings.findById(info._id).populate('stream');
    res.status(201).json(savedInfo);
  } catch (error) {
    console.error('Error creating class settings:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors
    });
  }
};

export const getClassSettings = async (req, res) => {
  try {
    const infos = await ClassSettings.find()
      .populate({
        path: 'stream',
        select: 'name program' // Include only necessary fields
      })
      .sort('-createdAt'); // Sort by newest first

    if (!infos || infos.length === 0) {
      return res.json([]);
    }

    res.json(infos);
  } catch (error) {
    console.error('Error fetching class settings:', error);
    res.status(500).json({ 
      message: error.message 
    });
  }
};

export const getClassSettingsById = async (req, res) => {
  try {
    const info = await ClassSettings.findById(req.params.id);
    if (!info) return res.status(404).json({ message: "Not found" });
    res.json(info);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateClassSettings = async (req, res) => {
  try {
    // Validate required fields
    const { stream, classDuration, classDays, break: breakTime } = req.body;
    
    if (!stream || !classDuration || !classDays || !Array.isArray(classDays)) {
      return res.status(400).json({ 
        message: "Missing required fields or invalid format" 
      });
    }

    // Update the class settings
    const info = await ClassSettings.findByIdAndUpdate(
      req.params.id, 
      {
        stream,
        classDuration,
        classDays,
        break: {
          start: breakTime?.start || '',
          end: breakTime?.end || ''
        }
      },
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    ).populate('stream');

    if (!info) {
      return res.status(404).json({ message: "Class setting not found" });
    }

    // Log activity
    await Activity.create({
      action: "Updated",
      entity: "Class Settings",
      details: `Class settings for Stream '${info.stream.name}' (${info.stream.program.name}) with duration ${info.classDuration} mins were updated.`,
    });

    res.json(info);
  } catch (error) {
    console.error('Error updating class settings:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors
    });
  }
};

export const deleteClassSettings = async (req, res) => {
  try {
    const infoToDelete = await ClassSettings.findById(req.params.id).populate({
      path: 'stream',
      populate: {
        path: 'program',
        select: 'name'
      },
      select: 'name'
    });
    if (!infoToDelete) return res.status(404).json({ message: "Not found" });

    await ClassSettings.findByIdAndDelete(req.params.id);

    // Log activity
    await Activity.create({
      action: "Deleted",
      entity: "Class Settings",
      details: `Class settings for Stream '${infoToDelete.stream.name}' (${infoToDelete.stream.program.name}) were deleted.`,
    });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

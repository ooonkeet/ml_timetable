import Stream from "../../models/admin/stream.model.js";
import Activity from "../../models/admin/activity.model.js"; // Import Activity model

export const createStream = async (req, res) => {
  try {
    const stream = new Stream(req.body);
    await stream.save();

    const populatedStream = await Stream.findById(stream._id).populate({
      path: 'program',
      populate: {
        path: 'university',
        select: 'name'
      },
      select: 'name'
    });

    // Log activity
    await Activity.create({
      action: "Created",
      entity: "Stream",
      details: `Stream '${populatedStream.name}' (${populatedStream.studentIntake} students) was created in Program '${populatedStream.program.name}' (${populatedStream.program.university.name}).`,
    });

    res.status(201).json(stream);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getStreams = async (req, res) => {
  try {
    const streams = await Stream.find().populate('program');
    res.json(streams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStreamById = async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.id);
    if (!stream) return res.status(404).json({ message: "Not found" });
    res.json(stream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStream = async (req, res) => {
  try {
    const updatedStream = await Stream.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate({
      path: 'program',
      populate: {
        path: 'university',
        select: 'name'
      },
      select: 'name'
    });
    if (!updatedStream) return res.status(404).json({ message: "Not found" });

    // Log activity
    await Activity.create({
      action: "Updated",
      entity: "Stream",
      details: `Stream '${updatedStream.name}' (${updatedStream.studentIntake} students) in Program '${updatedStream.program.name}' (${updatedStream.program.university.name}) was updated.`,
    });

    res.json(updatedStream);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteStream = async (req, res) => {
  try {
    const streamToDelete = await Stream.findById(req.params.id).populate({
      path: 'program',
      populate: {
        path: 'university',
        select: 'name'
      },
      select: 'name'
    });
    if (!streamToDelete) return res.status(404).json({ message: "Not found" });

    await Stream.findByIdAndDelete(req.params.id);

    // Log activity
    await Activity.create({
      action: "Deleted",
      entity: "Stream",
      details: `Stream '${streamToDelete.name}' from Program '${streamToDelete.program.name}' (${streamToDelete.program.university.name}) was deleted.`,
    });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

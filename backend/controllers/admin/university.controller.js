import University from "../../models/admin/university.model.js";
import Activity from "../../models/admin/activity.model.js"; // Import Activity model

export const createUniversity = async (req, res) => {
  try {
    const university = new University(req.body);
    await university.save();

    // Log activity
    await Activity.create({
      action: "Created",
      entity: "University",
      details: `University '${university.name}' was created.`,
    });

    res.status(201).json(university);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUniversities = async (req, res) => {
  try {
    const university= await University.find({});
    res.json(university);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUniversityById = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) return res.status(404).json({ message: "Not found" });
    res.json(university);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUniversity = async (req, res) => {
  try {
    const updatedUniversity = await University.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUniversity) return res.status(404).json({ message: "Not found" });

    // Log activity
    await Activity.create({
      action: "Updated",
      entity: "University",
      details: `University '${updatedUniversity.name}' was updated.`,
    });

    res.json(updatedUniversity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUniversity = async (req, res) => {
  try {
    const universityToDelete = await University.findById(req.params.id);
    if (!universityToDelete) return res.status(404).json({ message: "Not found" });

    await University.findByIdAndDelete(req.params.id);

    // Log activity
    await Activity.create({
      action: "Deleted",
      entity: "University",
      details: `University '${universityToDelete.name}' was deleted.`,
    });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

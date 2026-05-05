import Program from '../../models/admin/program.model.js';
import Activity from "../../models/admin/activity.model.js"; // Import Activity model

//POST
export const createProgram = async (req, res) => {
  try {
    const program = new Program(req.body);
    await program.save();

    // Populate university name for activity log
    const populatedProgram = await Program.findById(program._id).populate('university', 'name');

    // Log activity
    await Activity.create({
      action: "Created",
      entity: "Program",
      details: `Program '${populatedProgram.name}' was created in University '${populatedProgram.university.name}'.`,
    });

    res.status(201).json(program);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//GET
export const getPrograms = async (req, res) => {
  try {
    const programs = await Program.find().populate('university');
    res.status(200).json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProgramById = async (req, res) => {
  try {
    const program = await Program.find(req.params.id).populate('university');
    res.status(200).json(program);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//UPDATE
export const updateProgram = async (req, res) => {
  try {
    const newProgram = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('university', 'name'); // Populate for activity log
    
    if (!newProgram) return res.status(404).json({ message: "Program not found" });

    // Log activity
    await Activity.create({
      action: "Updated",
      entity: "Program",
      details: `Program '${newProgram.name}' in University '${newProgram.university.name}' was updated.`,
    });

    res.status(200).json(newProgram);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//DELETE
export const deleteProgram = async (req, res) => {
  try {
    const programToDelete = await Program.findById(req.params.id).populate('university', 'name');
    if (!programToDelete) return res.status(404).json({ message: "Program not found" });

    await Program.findByIdAndDelete(req.params.id);

    // Log activity
    await Activity.create({
      action: "Deleted",
      entity: "Program",
      details: `Program '${programToDelete.name}' from University '${programToDelete.university.name}' was deleted.`,
    });

    res.json({ message: "Program deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

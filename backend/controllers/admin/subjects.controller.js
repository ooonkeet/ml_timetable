import Subject from '../../models/admin/subjects.model.js';
import Activity from "../../models/admin/activity.model.js"; // Import Activity model

//POST
export const createSubject = async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();

    const populatedSubject = await Subject.findById(subject._id).populate({
      path: 'stream',
      populate: {
        path: 'program',
        select: 'name'
      },
      select: 'name'
    });

    // Log activity
    await Activity.create({
      action: "Created",
      entity: "Subject",
      details: `Subject '${populatedSubject.name}' (${populatedSubject.code}, ${populatedSubject.type}) was added to Stream '${populatedSubject.stream.name}' (${populatedSubject.stream.program.name}).`,
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//GET
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate('stream');
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//UPDATE
export const updateSubject = async (req, res) => {
  try {
    const newSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate({
      path: 'stream',
      populate: {
        path: 'program',
        select: 'name'
      },
      select: 'name'
    });
    
    if (!newSubject) return res.status(404).json({ message: "Subject not found" });

    // Log activity
    await Activity.create({
      action: "Updated",
      entity: "Subject",
      details: `Subject '${newSubject.name}' (${newSubject.code}, ${newSubject.type}) in Stream '${newSubject.stream.name}' (${newSubject.stream.program.name}) was updated.`,
    });

    res.status(200).json(newSubject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//DELETE
export const deleteSubject = async (req, res) => {
  try {
    const subjectToDelete = await Subject.findById(req.params.id).populate({
      path: 'stream',
      populate: {
        path: 'program',
        select: 'name'
      },
      select: 'name'
    });
    if (!subjectToDelete) return res.status(404).json({ message: "Subject not found" });

    await Subject.findByIdAndDelete(req.params.id);

    // Log activity
    await Activity.create({
      action: "Deleted",
      entity: "Subject",
      details: `Subject '${subjectToDelete.name}' (${subjectToDelete.code}) from Stream '${subjectToDelete.stream.name}' was deleted.`,
    });

    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Section from "../../models/admin/section.model.js";
import Activity from "../../models/admin/activity.model.js"; // Import Activity model

export const createSection = async (req, res) => {
  try {
    const section = new Section(req.body);
    await section.save();

    const populatedSection = await Section.findById(section._id).populate({
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
      entity: "Section",
      details: `Section '${populatedSection.name}' (Year ${populatedSection.year}, Sem ${populatedSection.semester}) was created in Stream '${populatedSection.stream.name}' (${populatedSection.stream.program.name}).`,
    });

    res.status(201).json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSections = async (req, res) => {
  try {
    const sections = await Section.find().populate('stream');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ message: "Not found" });
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSection = async (req, res) => {
  try {
    const updatedSection = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate({
      path: 'stream',
      populate: {
        path: 'program',
        select: 'name'
      },
      select: 'name'
    });
    if (!updatedSection) return res.status(404).json({ message: "Not found" });

    // Log activity
    await Activity.create({
      action: "Updated",
      entity: "Section",
      details: `Section '${updatedSection.name}' (Year ${updatedSection.year}, Sem ${updatedSection.semester}) in Stream '${updatedSection.stream.name}' (${updatedSection.stream.program.name}) was updated.`,
    });

    res.json(updatedSection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const sectionToDelete = await Section.findById(req.params.id).populate({
      path: 'stream',
      populate: {
        path: 'program',
        select: 'name'
      },
      select: 'name'
    });
    if (!sectionToDelete) return res.status(404).json({ message: "Not found" });

    await Section.findByIdAndDelete(req.params.id);

    // Log activity
    await Activity.create({
      action: "Deleted",
      entity: "Section",
      details: `Section '${sectionToDelete.name}' (Year ${sectionToDelete.year}, Sem ${sectionToDelete.semester}) from Stream '${sectionToDelete.stream.name}' was deleted.`,
    });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

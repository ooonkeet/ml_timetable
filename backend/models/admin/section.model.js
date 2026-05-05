import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    stream: { type: mongoose.Schema.Types.ObjectId,ref:"Stream",required: true },
    year: { type: Number, required: true },
    semester: { type: Number, required: true },
    name: { type: String, required: true },
    totalStudents: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

const Section = mongoose.model('Section',sectionSchema);
export default Section;
 
import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
  },
  { timestamps: true }
);

const University = new mongoose.model('University', universitySchema);
export default University;

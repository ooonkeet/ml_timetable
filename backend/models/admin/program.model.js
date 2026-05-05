import mongoose from 'mongoose';

const programSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

const Program = mongoose.model('Program', programSchema);
export default Program;

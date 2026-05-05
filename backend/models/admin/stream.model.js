import mongoose from 'mongoose';

const streamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      required: true,
    },
    studentIntake: { type: Number, required: true }, // total admitted students in this stream
    numberOfSections: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

const Stream = mongoose.model('Stream', streamSchema);
export default Stream;

import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ["Created", "Updated", "Deleted"],
    },
    entity: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;


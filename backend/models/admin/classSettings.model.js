import mongoose from 'mongoose';

const classSettingsSchema = new mongoose.Schema(
  {
    stream: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
      required: [true, 'Stream is required']
    },
    classDuration: { 
      type: Number, 
      required: [true, 'Class duration is required'],
      min: [30, 'Class duration must be at least 30 minutes'],
      max: [120, 'Class duration cannot exceed 120 minutes']
    },
    break: { 
      start: { 
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:mm format']
      }, 
      end: { 
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:mm format']
      }
    },
    classDays: {
      type: [{
        type: String,
        enum: {
          values: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          message: '{VALUE} is not a valid day'
        }
      }],
      validate: {
        validator: function(array) {
          return array && array.length > 0;
        },
        message: 'At least one class day must be selected'
      }
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const ClassSettings = mongoose.model('ClassSettings', classSettingsSchema);
export default ClassSettings;

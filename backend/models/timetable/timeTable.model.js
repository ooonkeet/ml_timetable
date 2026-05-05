import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
    university: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
        required: true
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
        default: null
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        required: true
    },
    stream: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stream',
        default: null
    },
    schedule: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    rawData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
timetableSchema.index({ university: 1, section: 1 });
timetableSchema.index({ stream: 1 });
timetableSchema.index({ createdAt: -1 });

const Timetable = mongoose.model('Timetable', timetableSchema);

export default Timetable;
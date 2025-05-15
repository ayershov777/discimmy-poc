const mongoose = require('mongoose');

// Define the segment schema
const SegmentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['article', 'research', 'exercise', 'session', 'project', 'integration']
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: false
    }
});

const ModuleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    key: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: false,
        trim: true,
    },
    pathway: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pathway',
        required: true,
    },
    prerequisites: [[{
        type: String, // Module keys
    }]],
    concepts: [{
        type: String,
    }],
    content: {
        type: [SegmentSchema],
        default: [],
    },
});

// Compound indices to make key and name unique within a pathway
ModuleSchema.index({ key: 1, pathway: 1 }, { unique: true });
ModuleSchema.index({ name: 1, pathway: 1 }, { unique: true });

const Module = mongoose.model('Module', ModuleSchema);

module.exports = Module;

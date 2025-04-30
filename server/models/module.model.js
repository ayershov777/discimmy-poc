const mongoose = require('mongoose');

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
        type: String, // Changed to store module keys
    }]],
    concepts: [{
        type: String,
    }],
    content: {
        type: String,
        default: '',
    },
});

// Compound indices to make key and name unique within a pathway
ModuleSchema.index({ key: 1, pathway: 1 }, { unique: true });
ModuleSchema.index({ name: 1, pathway: 1 }, { unique: true });

const Module = mongoose.model('Module', ModuleSchema);

module.exports = Module;

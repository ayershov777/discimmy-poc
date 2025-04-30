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
        unique: true,
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
    content: {
        type: String,
    },
});

const Module = mongoose.model('Module', ModuleSchema);

module.exports = Module;

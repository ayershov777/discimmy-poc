const mongoose = require('mongoose');

const pathwaySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    goal: {
        type: String,
        default: '',
        trim: true,
    },
    requirements: {
        type: String,
        default: '',
        trim: true,
    },
    targetAudience: {
        type: String,
        default: '',
        trim: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const Pathway = mongoose.model('Pathway', pathwaySchema);

module.exports = Pathway;

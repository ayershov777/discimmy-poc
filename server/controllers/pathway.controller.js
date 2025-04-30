const Pathway = require('../models/pathway.model');
const moduleController = require('./module.controller');
const mongoose = require('mongoose');

// Get all pathways with optional filtering by userId
exports.getAllPathways = async (req, res) => {
    try {
        const { userId } = req.query;

        let query = {};

        // If userId is provided and valid, filter pathways by owner
        if (userId) {
            // Validate if userId is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'Invalid user ID format' });
            }

            query.owner = userId;
        }

        const pathways = await Pathway.find(query);
        res.status(200).json(pathways);
    } catch (error) {
        console.error('Error fetching pathways:', error);
        res.status(500).json({ message: 'Server error while fetching pathways' });
    }
};

// Get a single pathway by ID
exports.getPathwayById = async (req, res) => {
    try {
        const pathway = await Pathway.findById(req.params.id);

        if (!pathway) {
            return res.status(404).json({ message: 'Pathway not found' });
        }

        res.status(200).json(pathway);
    } catch (error) {
        console.error('Error fetching pathway:', error);
        res.status(500).json({ message: 'Server error while fetching pathway' });
    }
};

// Create a new pathway (requires authentication)
exports.createPathway = async (req, res) => {
    try {
        const { title, description, goal, requirements, targetAudience } = req.body;

        // Validate input
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        // Create new pathway with the authenticated user as owner
        const newPathway = new Pathway({
            title,
            description,
            goal,
            requirements,
            targetAudience,
            owner: req.user.id // Set from authenticated user
        });

        await newPathway.save();

        res.status(201).json({
            message: 'Pathway created successfully',
            pathway: newPathway
        });
    } catch (error) {
        console.error('Error creating pathway:', error);

        // Check for duplicate key error (unique title constraint)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A pathway with this title already exists' });
        }

        res.status(500).json({ message: 'Server error while creating pathway' });
    }
};

// Update a pathway (owner only)
exports.updatePathway = async (req, res) => {
    try {
        const { title, description, goal, requirements, targetAudience } = req.body;
        const pathwayId = req.params.id;

        // Find the pathway
        const pathway = await Pathway.findById(pathwayId);

        if (!pathway) {
            return res.status(404).json({ message: 'Pathway not found' });
        }

        // Check ownership - convert to string for reliable comparison
        if (pathway.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this pathway' });
        }

        // Update the pathway
        const updatedPathway = await Pathway.findByIdAndUpdate(
            pathwayId,
            { title, description, goal, requirements, targetAudience },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: 'Pathway updated successfully',
            pathway: updatedPathway
        });
    } catch (error) {
        console.error('Error updating pathway:', error);

        // Check for duplicate key error (unique title constraint)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A pathway with this title already exists' });
        }

        res.status(500).json({ message: 'Server error while updating pathway' });
    }
};

// Delete a pathway (owner only)
exports.deletePathway = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const pathwayId = req.params.id;

        // Find the pathway
        const pathway = await Pathway.findById(pathwayId);

        if (!pathway) {
            return res.status(404).json({ message: 'Pathway not found' });
        }

        // Check ownership - convert to string for reliable comparison
        if (pathway.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this pathway' });
        }

        // Delete all modules belonging to this pathway
        const modulesDeleted = await moduleController.deleteModulesByPathway(pathwayId);

        if (!modulesDeleted) {
            throw new Error('Failed to delete related modules');
        }

        // Delete the pathway
        await Pathway.findByIdAndDelete(pathwayId, { session });

        await session.commitTransaction();

        res.status(200).json({ message: 'Pathway and all its modules deleted successfully' });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error deleting pathway:', error);
        res.status(500).json({ message: 'Server error while deleting pathway' });
    } finally {
        session.endSession();
    }
};

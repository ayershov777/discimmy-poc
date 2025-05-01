const geminiService = require('../services/gemini.service');
const Pathway = require('../models/pathway.model');
const Module = require('../models/module.model');
const mongoose = require('mongoose');

// Generate/enhance pathway properties
exports.generatePathwayProperties = async (req, res) => {
    try {
        const { pathwayId, properties } = req.body;

        if (!pathwayId || !properties || !Array.isArray(properties) || properties.length === 0) {
            return res.status(400).json({ message: 'Pathway ID and properties array are required' });
        }

        // Find the pathway
        const pathway = await Pathway.findById(pathwayId);
        if (!pathway) {
            return res.status(404).json({ message: 'Pathway not found' });
        }

        // Check ownership
        if (pathway.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to modify this pathway' });
        }

        const results = {};
        const updates = {};

        // Generate requested properties
        for (const property of properties) {
            let generatedContent;

            switch (property) {
                case 'title':
                    generatedContent = await geminiService.generatePathwayTitle(pathway);
                    results.title = generatedContent;
                    updates.title = generatedContent;
                    break;
                case 'description':
                    generatedContent = await geminiService.generatePathwayDescription(pathway);
                    results.description = generatedContent;
                    updates.description = generatedContent;
                    break;
                case 'goal':
                    generatedContent = await geminiService.generatePathwayGoal(pathway);
                    results.goal = generatedContent;
                    updates.goal = generatedContent;
                    break;
                case 'requirements':
                    generatedContent = await geminiService.generatePathwayRequirements(pathway);
                    results.requirements = generatedContent;
                    updates.requirements = generatedContent;
                    break;
                case 'targetAudience':
                    generatedContent = await geminiService.generatePathwayTargetAudience(pathway);
                    results.targetAudience = generatedContent;
                    updates.targetAudience = generatedContent;
                    break;
                default:
                    // Skip unrecognized properties
                    break;
            }
        }

        // If apply=true in the request, update the pathway
        if (req.body.apply === true && Object.keys(updates).length > 0) {
            await Pathway.findByIdAndUpdate(pathwayId, updates);
            results.applied = true;
        } else {
            results.applied = false;
        }

        res.status(200).json({
            message: 'Content generated successfully',
            results
        });
    } catch (error) {
        console.error('Error generating pathway properties:', error);
        res.status(500).json({
            message: 'Server error while generating content',
            error: error.message
        });
    }
};

// Generate/enhance module properties
exports.generateModuleProperties = async (req, res) => {
    try {
        const { moduleId, properties } = req.body;

        if (!moduleId || !properties || !Array.isArray(properties) || properties.length === 0) {
            return res.status(400).json({ message: 'Module ID and properties array are required' });
        }

        // Find the module
        const module = await Module.findById(moduleId);
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Find the parent pathway
        const pathway = await Pathway.findById(module.pathway);
        if (!pathway) {
            return res.status(404).json({ message: 'Parent pathway not found' });
        }

        // Check ownership
        if (pathway.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to modify this module' });
        }

        const results = {};
        const updates = {};

        // For prerequisites, we need available modules
        let availableModules = [];
        if (properties.includes('prerequisites')) {
            availableModules = await Module.find({ pathway: module.pathway });
        }

        // Generate requested properties
        for (const property of properties) {
            let generatedContent;

            switch (property) {
                case 'name':
                    generatedContent = await geminiService.generateModuleName(module, pathway);
                    results.name = generatedContent;
                    updates.name = generatedContent;
                    break;
                case 'description':
                    generatedContent = await geminiService.generateModuleDescription(module, pathway);
                    results.description = generatedContent;
                    updates.description = generatedContent;
                    break;
                case 'concepts':
                    generatedContent = await geminiService.generateModuleConcepts(module, pathway);
                    results.concepts = generatedContent;
                    updates.concepts = generatedContent;
                    break;
                case 'prerequisites':
                    generatedContent = await geminiService.generateModulePrerequisites(module, pathway, availableModules);
                    results.prerequisites = generatedContent;
                    updates.prerequisites = generatedContent;
                    break;
                case 'content':
                    generatedContent = await geminiService.generateModuleContent(module, pathway);
                    results.content = generatedContent;
                    updates.content = generatedContent;
                    break;
                default:
                    // Skip unrecognized properties
                    break;
            }
        }

        // If apply=true in the request, update the module
        if (req.body.apply === true && Object.keys(updates).length > 0) {
            await Module.findByIdAndUpdate(moduleId, updates);
            results.applied = true;
        } else {
            results.applied = false;
        }

        res.status(200).json({
            message: 'Content generated successfully',
            results
        });
    } catch (error) {
        console.error('Error generating module properties:', error);
        res.status(500).json({
            message: 'Server error while generating content',
            error: error.message
        });
    }
};

// Generate pathway structure based on user prompt and attached files
exports.generatePathwayStructure = async (req, res) => {
    try {
        const { pathwayId, userPrompt, attachedFiles } = req.body;

        if (!pathwayId || !userPrompt) {
            return res.status(400).json({ message: 'Pathway ID and user prompt are required' });
        }

        // Find the pathway
        const pathway = await Pathway.findById(pathwayId);
        if (!pathway) {
            return res.status(404).json({ message: 'Pathway not found' });
        }

        // Check ownership
        if (pathway.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to modify this pathway' });
        }

        // Get existing modules for this pathway
        const existingModules = await Module.find({ pathway: pathwayId });
        
        // Add modules to pathway object for the prompt
        const pathwayWithModules = {
            ...pathway.toObject(),
            modules: existingModules
        };

        // Generate pathway structure
        const result = await geminiService.generatePathwayStructure(
            pathwayWithModules, 
            userPrompt, 
            attachedFiles || []
        );

        // Return the generated structure
        res.status(200).json({
            message: 'Pathway structure generated successfully',
            results: result
        });
    } catch (error) {
        console.error('Error generating pathway structure:', error);
        res.status(500).json({ 
            message: 'Server error while generating pathway structure',
            error: error.message 
        });
    }
};

// Apply a previously generated pathway structure
exports.applyPathwayStructure = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { pathwayId, structure } = req.body;

        if (!pathwayId || !structure || !structure.modules) {
            return res.status(400).json({ message: 'Pathway ID and module structure are required' });
        }

        // Find the pathway
        const pathway = await Pathway.findById(pathwayId);
        if (!pathway) {
            return res.status(404).json({ message: 'Pathway not found' });
        }

        // Check ownership
        if (pathway.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to modify this pathway' });
        }

        // Get existing modules for this pathway
        const existingModules = await Module.find({ pathway: pathwayId });

        // Create a map of existing modules by key for quick lookup
        const existingModulesByKey = new Map();
        existingModules.forEach(module => {
            existingModulesByKey.set(module.key, module);
        });

        // Identify modules to create, update, or delete
        const modulesToCreate = [];
        const modulesToUpdate = [];
        const keysToKeep = new Set();

        // Process each module in the structure
        console.log('Processing modules in the structure:', structure.modules);
        for (const moduleData of structure.modules) {
            keysToKeep.add(moduleData.key);

            if (existingModulesByKey.has(moduleData.key)) {
                // Module exists - prepare for update
                const existingModule = existingModulesByKey.get(moduleData.key);

                // Prepare update object (only include fields that changed)
                const updateData = {
                    _id: existingModule._id
                };

                if (moduleData.name !== existingModule.name) {
                    updateData.name = moduleData.name;
                }

                // Compare concepts arrays (we'll just replace if different)
                if (!arraysEqual(moduleData.concepts, existingModule.concepts)) {
                    updateData.concepts = moduleData.concepts;
                }

                // Convert prerequisites format if needed
                let prerequisites = moduleData.prerequisites;
                if (!Array.isArray(prerequisites[0])) {
                    // Convert flat array to nested array structure if needed
                    prerequisites = [prerequisites];
                }

                // Check if prerequisites changed
                if (!nestedArraysEqual(prerequisites, existingModule.prerequisites)) {
                    updateData.prerequisites = prerequisites;
                }

                // Only add to update list if there are changes
                if (Object.keys(updateData).length > 1) { // > 1 because _id is always included
                    modulesToUpdate.push(updateData);
                }
            } else {
                // New module - prepare for creation
                // Convert prerequisites format if needed
                let prerequisites = moduleData.prerequisites;
                if (prerequisites && prerequisites.length > 0 && !Array.isArray(prerequisites[0])) {
                    // Convert flat array to nested array structure
                    prerequisites = [prerequisites];
                }

                modulesToCreate.push({
                    name: moduleData.name,
                    key: moduleData.key,
                    description: '', // Default empty description
                    concepts: moduleData.concepts || [],
                    prerequisites: prerequisites || [[]],
                    pathway: pathwayId
                });
            }
        }

        // Identify modules to delete (existing modules not in the generated structure)
        const modulesToDelete = existingModules
            .filter(module => !keysToKeep.has(module.key))
            .map(module => module._id);

        // Execute database operations

        // Delete modules
        if (modulesToDelete.length > 0) {
            await Module.deleteMany({ _id: { $in: modulesToDelete } }, { session });
        }

        // Update modules
        for (const moduleData of modulesToUpdate) {
            const moduleId = moduleData._id;
            delete moduleData._id; // Remove _id before update
            await Module.findByIdAndUpdate(moduleId, moduleData, { session });
        }

        // Create modules
        if (modulesToCreate.length > 0) {
            await Module.insertMany(modulesToCreate, { session });
        }

        await session.commitTransaction();

        // Return success with counts
        res.status(200).json({
            message: 'Pathway structure applied successfully',
            changes: {
                created: modulesToCreate.length,
                updated: modulesToUpdate.length,
                deleted: modulesToDelete.length
            },
            applied: true
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error applying pathway structure:', error);
        res.status(500).json({
            message: 'Server error while applying pathway structure',
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

// Helper functions for comparing arrays
function arraysEqual(arr1, arr2) {
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }

    return true;
}

function nestedArraysEqual(arr1, arr2) {
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
        if (!arraysEqual(arr1[i], arr2[i])) return false;
    }

    return true;
}

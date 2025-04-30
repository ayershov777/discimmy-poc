const Module = require('../models/module.model');
const Pathway = require('../models/pathway.model');
const mongoose = require('mongoose');

// Helper function to check if there's a circular reference in module prerequisites
const hasCyclicDependency = async (moduleKey, pathwayId, visitedKeys = new Set(), recursionStack = new Set()) => {
    // If module is already in recursion stack, we have a cycle
    if (recursionStack.has(moduleKey)) return true;

    // If module was already visited and no cycle was found, we're good
    if (visitedKeys.has(moduleKey)) return false;

    // Mark module as visited and add to recursion stack
    visitedKeys.add(moduleKey);
    recursionStack.add(moduleKey);

    // Find module's prerequisites
    const module = await Module.findOne({ key: moduleKey, pathway: pathwayId });
    if (!module) return false;

    // Check each prerequisite group
    for (const group of module.prerequisites) {
        // For each module key in the group
        for (const prereqKey of group) {
            if (await hasCyclicDependency(prereqKey, pathwayId, visitedKeys, recursionStack)) {
                return true;
            }
        }
    }

    // Remove from recursion stack and return false (no cycle found)
    recursionStack.delete(moduleKey);
    return false;
};

// Helper function to get all ancestor module keys
const getAllAncestorKeys = async (moduleKey, pathwayId, ancestorKeys = new Set()) => {
    // Find module's prerequisites
    const module = await Module.findOne({ key: moduleKey, pathway: pathwayId });
    if (!module) return ancestorKeys;

    // Check each prerequisite group
    for (const group of module.prerequisites) {
        // For each module key in the group
        for (const prereqKey of group) {
            // Add to ancestor set
            ancestorKeys.add(prereqKey);
            // Recursively get ancestors of this prerequisite
            await getAllAncestorKeys(prereqKey, pathwayId, ancestorKeys);
        }
    }

    return ancestorKeys;
};

// Helper function to detect cycles in a graph using Kahn's algorithm
const detectCycle = (graph) => {
    // Count incoming edges for each node
    const inDegree = new Map();
    for (const [node, edges] of graph.entries()) {
        if (!inDegree.has(node)) {
            inDegree.set(node, 0);
        }

        for (const edge of edges) {
            inDegree.set(edge, (inDegree.get(edge) || 0) + 1);
        }
    }

    // Find nodes with no incoming edges
    const queue = [];
    for (const [node, degree] of inDegree.entries()) {
        if (degree === 0) {
            queue.push(node);
        }
    }

    // Process nodes with no incoming edges
    let count = 0;
    while (queue.length > 0) {
        const node = queue.shift();
        count++;

        // Reduce in-degree of adjacent nodes
        if (graph.has(node)) {
            for (const neighbor of graph.get(node)) {
                inDegree.set(neighbor, inDegree.get(neighbor) - 1);

                // If in-degree becomes 0, add to queue
                if (inDegree.get(neighbor) === 0) {
                    queue.push(neighbor);
                }
            }
        }
    }

    // If count is less than number of nodes, there is a cycle
    return count < graph.size;
};

// Helper function to check for redundant prerequisites
const checkRedundantPrerequisites = (graph) => {
    // For each node, compute all ancestors
    const allAncestors = new Map();

    // Initialize with direct prerequisites
    for (const [node, prereqs] of graph.entries()) {
        allAncestors.set(node, new Set(prereqs));
    }

    // Compute transitive closure
    let changed = true;
    while (changed) {
        changed = false;
        for (const [node, ancestors] of allAncestors.entries()) {
            const newAncestors = new Set([...ancestors]);
            for (const ancestor of ancestors) {
                if (allAncestors.has(ancestor)) {
                    for (const indirectAncestor of allAncestors.get(ancestor)) {
                        if (!newAncestors.has(indirectAncestor)) {
                            newAncestors.add(indirectAncestor);
                            changed = true;
                        }
                    }
                }
            }
            allAncestors.set(node, newAncestors);
        }
    }

    // Check if any direct prerequisite is also an indirect prerequisite
    for (const [node, directPrereqs] of graph.entries()) {
        for (let i = 0; i < directPrereqs.length; i++) {
            const directPrereq = directPrereqs[i];
            for (let j = 0; j < directPrereqs.length; j++) {
                if (i !== j) {
                    const otherPrereq = directPrereqs[j];
                    if (allAncestors.has(otherPrereq) && allAncestors.get(otherPrereq).has(directPrereq)) {
                        return true; // Found redundancy
                    }
                }
            }
        }
    }

    return false;
};

// Get all modules for a specific pathway
exports.getModulesByPathway = async (req, res) => {
    try {
        const { pathwayId } = req.query;

        if (!pathwayId) {
            return res.status(400).json({ message: 'Pathway ID is required' });
        }

        const modules = await Module.find({ pathway: pathwayId });
        res.status(200).json(modules);
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({ message: 'Server error while fetching modules' });
    }
};

// Get a single module by ID
exports.getModuleById = async (req, res) => {
    try {
        const module = await Module.findById(req.params.id);

        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        res.status(200).json(module);
    } catch (error) {
        console.error('Error fetching module:', error);
        res.status(500).json({ message: 'Server error while fetching module' });
    }
};

// Create a new module (requires authentication)
exports.createModule = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, key, description, pathwayId, prerequisites, concepts, content } = req.body;

        // Validate required fields
        if (!name || !key || !pathwayId) {
            return res.status(400).json({ message: 'Name, key, and pathwayId are required' });
        }

        // Find pathway and check ownership
        const pathway = await Pathway.findById(pathwayId);

        if (!pathway) {
            return res.status(404).json({ message: 'Pathway not found' });
        }

        // Check ownership - convert to string for reliable comparison
        if (pathway.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to add modules to this pathway' });
        }

        // Check if module with same name or key already exists in this pathway
        const existingModule = await Module.findOne({
            $or: [
                { name: name, pathway: pathwayId },
                { key: key, pathway: pathwayId }
            ]
        });

        if (existingModule) {
            if (existingModule.name === name) {
                return res.status(400).json({ message: 'A module with this name already exists in this pathway' });
            } else {
                return res.status(400).json({ message: 'A module with this key already exists in this pathway' });
            }
        }

        // Check if all prerequisite modules exist in the pathway
        if (prerequisites && prerequisites.length > 0) {
            for (const group of prerequisites) {
                for (const prereqKey of group) {
                    const prereqModule = await Module.findOne({ key: prereqKey, pathway: pathwayId });

                    if (!prereqModule) {
                        return res.status(400).json({
                            message: `Prerequisite module with key '${prereqKey}' not found in this pathway`
                        });
                    }
                }
            }

            // Create a temporary module to check for cycles
            const tempModule = { key, prerequisites, pathway: pathwayId };

            // Check for cyclic dependencies
            const hasCycle = await hasCyclicDependency(key, pathwayId, new Set(), new Set());
            if (hasCycle) {
                return res.status(400).json({ message: 'Circular reference detected in prerequisites' });
            }

            // Check for redundant ancestors
            for (const group of prerequisites) {
                for (const prereqKey of group) {
                    const ancestors = await getAllAncestorKeys(prereqKey, pathwayId);

                    // Check if any other prerequisite is already an ancestor
                    for (const otherGroup of prerequisites) {
                        for (const otherPrereqKey of otherGroup) {
                            if (prereqKey !== otherPrereqKey && ancestors.has(otherPrereqKey)) {
                                return res.status(400).json({
                                    message: `Redundant prerequisite: '${otherPrereqKey}' is already an ancestor of '${prereqKey}'`
                                });
                            }
                        }
                    }
                }
            }
        }

        // Create new module
        const newModule = new Module({
            name,
            key,
            description,
            pathway: pathwayId,
            prerequisites: prerequisites || [],
            concepts: concepts || [],
            content: content || ''
        });

        await newModule.save({ session });
        await session.commitTransaction();

        res.status(201).json({
            message: 'Module created successfully',
            module: newModule
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error creating module:', error);

        // Check for duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A module with this key already exists in this pathway' });
        }

        res.status(500).json({ message: 'Server error while creating module' });
    } finally {
        session.endSession();
    }
};

// Create multiple modules in batch (requires authentication)
exports.createModulesBatch = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { pathwayId, modules } = req.body;

        // Validate inputs
        if (!pathwayId || !modules || !Array.isArray(modules) || modules.length === 0) {
            return res.status(400).json({
                message: 'PathwayId and an array of modules are required'
            });
        }

        // Find pathway and check ownership
        const pathway = await Pathway.findById(pathwayId);

        if (!pathway) {
            return res.status(404).json({ message: 'Pathway not found' });
        }

        // Check ownership - convert to string for reliable comparison
        if (pathway.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to add modules to this pathway' });
        }

        // Validate all modules have required fields
        for (const module of modules) {
            if (!module.name || !module.key) {
                return res.status(400).json({
                    message: 'All modules must have a name and key'
                });
            }
        }

        // Check for duplicate names or keys within the batch
        const names = new Set();
        const keys = new Set();

        for (const module of modules) {
            if (names.has(module.name)) {
                return res.status(400).json({
                    message: `Duplicate module name '${module.name}' in the batch`
                });
            }
            if (keys.has(module.key)) {
                return res.status(400).json({
                    message: `Duplicate module key '${module.key}' in the batch`
                });
            }
            names.add(module.name);
            keys.add(module.key);
        }

        // Check if any modules with the same names or keys already exist in this pathway
        const existingModules = await Module.find({
            pathway: pathwayId,
            $or: [
                { name: { $in: Array.from(names) } },
                { key: { $in: Array.from(keys) } }
            ]
        });

        if (existingModules.length > 0) {
            const existingNames = existingModules.map(m => m.name);
            const existingKeys = existingModules.map(m => m.key);

            return res.status(400).json({
                message: 'Some modules with the same name or key already exist in this pathway',
                existingNames,
                existingKeys
            });
        }

        // Build prerequisite reference map for validation
        const moduleKeyMap = new Map();
        for (const module of modules) {
            moduleKeyMap.set(module.key, module);
        }

        // First pass: validate all prerequisites are either existing modules or in the batch
        const existingModuleKeys = new Set();
        const existingModuleKeysArray = await Module.find({ pathway: pathwayId }).distinct('key');
        existingModuleKeysArray.forEach(key => existingModuleKeys.add(key));

        for (const module of modules) {
            if (module.prerequisites && module.prerequisites.length > 0) {
                for (const group of module.prerequisites) {
                    for (const prereqKey of group) {
                        // Check if prerequisite exists in database or in the batch
                        if (!existingModuleKeys.has(prereqKey) && !moduleKeyMap.has(prereqKey)) {
                            return res.status(400).json({
                                message: `Prerequisite module with key '${prereqKey}' not found in this pathway or in the batch`
                            });
                        }
                    }
                }
            }
        }

        // Build dependency graph for cycle detection
        const graph = new Map();

        // Add existing modules to the graph
        const existingModulesWithPrereqs = await Module.find({
            pathway: pathwayId
        }).select('key prerequisites');

        for (const existingModule of existingModulesWithPrereqs) {
            graph.set(existingModule.key, []);
            for (const group of existingModule.prerequisites) {
                for (const prereqKey of group) {
                    if (!graph.get(existingModule.key).includes(prereqKey)) {
                        graph.get(existingModule.key).push(prereqKey);
                    }
                }
            }
        }

        // Add new modules to the graph
        for (const module of modules) {
            if (!graph.has(module.key)) {
                graph.set(module.key, []);
            }

            if (module.prerequisites && module.prerequisites.length > 0) {
                for (const group of module.prerequisites) {
                    for (const prereqKey of group) {
                        if (!graph.get(module.key).includes(prereqKey)) {
                            graph.get(module.key).push(prereqKey);
                        }
                    }
                }
            }
        }

        // Check for cycles in the combined graph using Kahn's algorithm
        const hasCycles = detectCycle(graph);
        if (hasCycles) {
            return res.status(400).json({
                message: 'Circular dependency detected in prerequisites'
            });
        }

        // Check for redundant ancestors
        const isRedundant = checkRedundantPrerequisites(graph);
        if (isRedundant) {
            return res.status(400).json({
                message: 'Redundant prerequisites detected: some prerequisites are already ancestors of others'
            });
        }

        // Create all modules
        const createdModules = [];
        for (const moduleData of modules) {
            const newModule = new Module({
                name: moduleData.name,
                key: moduleData.key,
                description: moduleData.description || '',
                pathway: pathwayId,
                prerequisites: moduleData.prerequisites || [],
                concepts: moduleData.concepts || [],
                content: moduleData.content || ''
            });

            await newModule.save({ session });
            createdModules.push(newModule);
        }

        await session.commitTransaction();

        res.status(201).json({
            message: `${createdModules.length} modules created successfully`,
            modules: createdModules
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error creating modules in batch:', error);

        // Check for duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'A module with this name or key already exists in this pathway'
            });
        }

        res.status(500).json({ message: 'Server error while creating modules in batch' });
    } finally {
        session.endSession();
    }
};


// Update a module (owner only)
exports.updateModule = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, key, description, prerequisites, concepts, content } = req.body;
        const moduleId = req.params.id;

        // Find the module
        const module = await Module.findById(moduleId);

        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Find pathway to check ownership
        const pathway = await Pathway.findById(module.pathway);

        if (!pathway) {
            return res.status(404).json({ message: 'Parent pathway not found' });
        }

        // Check ownership - convert to string for reliable comparison
        if (pathway.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this module' });
        }

        // Prevent module key updates
        if (key && key !== module.key) {
            return res.status(400).json({
                message: 'Module keys cannot be updated. Create a new module if you need to change the key.'
            });
        }

        // Check if updated name conflicts with another module in the same pathway
        if (name && name !== module.name) {
            const existingModule = await Module.findOne({
                _id: { $ne: moduleId }, // Exclude the current module
                pathway: module.pathway,
                name: name
            });

            if (existingModule) {
                return res.status(400).json({ message: 'A module with this name already exists in this pathway' });
            }
        }

        // Check if all prerequisite modules exist in the pathway
        if (prerequisites && prerequisites.length > 0) {
            // Create updated module data for validation
            const updatedModuleData = {
                key: key || module.key,
                prerequisites: prerequisites,
                pathway: module.pathway
            };

            for (const group of prerequisites) {
                for (const prereqKey of group) {
                    // Skip self-reference check if key isn't being updated
                    if (prereqKey === updatedModuleData.key) {
                        return res.status(400).json({ message: 'Module cannot be its own prerequisite' });
                    }

                    const prereqModule = await Module.findOne({ key: prereqKey, pathway: module.pathway });

                    if (!prereqModule) {
                        return res.status(400).json({
                            message: `Prerequisite module with key '${prereqKey}' not found in this pathway`
                        });
                    }
                }
            }

            // Check for cyclic dependencies using the module's new key (if changing)
            const moduleKey = key || module.key;

            // First, temporarily update the module's prerequisites for validation
            const originalPrereqs = module.prerequisites;
            module.prerequisites = prerequisites;
            await module.save({ session });

            // Check for cycles
            const hasCycle = await hasCyclicDependency(moduleKey, module.pathway, new Set(), new Set());

            if (hasCycle) {
                // Restore original prerequisites
                module.prerequisites = originalPrereqs;
                await module.save({ session });
                await session.abortTransaction();

                return res.status(400).json({ message: 'Circular reference detected in prerequisites' });
            }

            // Check for redundant ancestors
            for (const group of prerequisites) {
                for (const prereqKey of group) {
                    const ancestors = await getAllAncestorKeys(prereqKey, module.pathway);

                    // Check if any other prerequisite is already an ancestor
                    for (const otherGroup of prerequisites) {
                        for (const otherPrereqKey of otherGroup) {
                            if (prereqKey !== otherPrereqKey && ancestors.has(otherPrereqKey)) {
                                // Restore original prerequisites
                                module.prerequisites = originalPrereqs;
                                await module.save({ session });
                                await session.abortTransaction();

                                return res.status(400).json({
                                    message: `Redundant prerequisite: '${otherPrereqKey}' is already an ancestor of '${prereqKey}'`
                                });
                            }
                        }
                    }
                }
            }

            // Restore original prerequisites (we'll update everything at once below)
            module.prerequisites = originalPrereqs;
            await module.save({ session });
        }

        // Update the module
        const updatedModule = await Module.findByIdAndUpdate(
            moduleId,
            { 
                name: name !== undefined ? name : module.name,
                description: description !== undefined ? description : module.description,
                prerequisites: prerequisites !== undefined ? prerequisites : module.prerequisites,
                concepts: concepts !== undefined ? concepts : module.concepts,
                content: content !== undefined ? content : module.content
            },
            { new: true, runValidators: true, session }
        );

        await session.commitTransaction();

        res.status(200).json({
            message: 'Module updated successfully',
            module: updatedModule
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error updating module:', error);

        // Check for duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A module with this key already exists in this pathway' });
        }

        res.status(500).json({ message: 'Server error while updating module' });
    } finally {
        session.endSession();
    }
};

// Delete a module (owner only)
exports.deleteModule = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const moduleId = req.params.id;

        // Find the module
        const module = await Module.findById(moduleId);

        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Find pathway to check ownership
        const pathway = await Pathway.findById(module.pathway);

        if (!pathway) {
            return res.status(404).json({ message: 'Parent pathway not found' });
        }

        // Check ownership - convert to string for reliable comparison
        if (pathway.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this module' });
        }

        // Find all modules that have this module as a prerequisite
        const dependentModules = await Module.find({
            pathway: module.pathway,
            prerequisites: { $elemMatch: { $elemMatch: { $eq: module.key } } }
        });

        // Update prerequisites for all dependent modules
        for (const dependentModule of dependentModules) {
            // Create a new prerequisites array with the deleted module removed
            const updatedPrerequisites = dependentModule.prerequisites.map(group => {
                // Filter out the deleted module key from each group
                const updatedGroup = group.filter(prereqKey => prereqKey !== module.key);
                return updatedGroup;
            }).filter(group => group.length > 0); // Remove empty groups

            // Update the dependent module
            dependentModule.prerequisites = updatedPrerequisites;
            await dependentModule.save({ session });
        }

        // Delete the module
        await Module.findByIdAndDelete(moduleId, { session });

        await session.commitTransaction();

        res.status(200).json({
            message: 'Module deleted successfully and removed from prerequisites of other modules',
            updatedModuleCount: dependentModules.length
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error deleting module:', error);
        res.status(500).json({ message: 'Server error while deleting module' });
    } finally {
        session.endSession();
    }
};

// Delete all modules for a specific pathway (used when deleting a pathway)
exports.deleteModulesByPathway = async (pathwayId) => {
    try {
        const result = await Module.deleteMany({ pathway: pathwayId });
        console.log(`Deleted ${result.deletedCount} modules for pathway ${pathwayId}`);
        return true;
    } catch (error) {
        console.error('Error deleting modules by pathway:', error);
        return false;
    }
};

// Import statements - add our new ModuleContentEditor
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import AuthContext from '../../../context/AuthContext';
import axios from 'axios';
import {
    Typography,
    Box,
    Button,
    CircularProgress,
    Alert,
    Divider,
    Paper,
    TextField,
    Stack,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Tooltip
} from '@mui/material';
import {
    Edit,
    Save,
    Preview,
    Delete,
    Visibility,
    ArrowBack,
    OpenInNew,
    Close,
    Add,
    AutoAwesome
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import AIGeneration from '../../common/AIGeneration';
import ModuleContentRenderer from '../../common/ModuleContentRenderer';
import ModuleContentEditor from '../../common/ModuleContentEditor';

// Helper component for Markdown content
const MarkdownContent = ({ content }) => {
    if (!content) return <Typography variant="body2" color="text.secondary">No content provided</Typography>;

    return (
        <Box sx={{
            '& h1, & h2, & h3, & h4, & h5, & h6': {
                mt: 2,
                mb: 1,
                fontWeight: 600
            },
            '& p': { mb: 2 },
            '& ul, & ol': { pl: 2, mb: 2 }
        }}>
            <ReactMarkdown>{content}</ReactMarkdown>
        </Box>
    );
};

// This component will be used to create a new module or edit an existing one
const ModuleView = () => {
    const { id, pathwayId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useContext(AuthContext);

    // Check if URL has edit parameter
    const queryParams = new URLSearchParams(location.search);
    const editParam = queryParams.get('edit');
    const isNewModule = id === 'new';

    const [module, setModule] = useState(null);
    const [pathway, setPathway] = useState(null);
    const [availableModules, setAvailableModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(editParam === 'true' || isNewModule);
    const [isOwner, setIsOwner] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [contentDialogOpen, setContentDialogOpen] = useState(false);

    // Form data for editing
    const [formData, setFormData] = useState({
        name: '',
        key: '',
        description: '',
        prerequisites: [[]],
        concepts: [],
        content: []
    });

    // Helper function to parse content from various formats
    const parseContent = (contentData) => {
        if (!contentData) return [];
        
        if (Array.isArray(contentData)) {
            return contentData;
        }
        
        // Try to parse JSON string
        if (typeof contentData === 'string') {
            try {
                const parsed = JSON.parse(contentData);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (e) {
                // If parsing fails, create a single article segment with the content
                return [{
                    type: 'article',
                    title: 'Converted Content',
                    content: contentData,
                    section: 'Content'
                }];
            }
        }
        
        // If it's an object with results.content
        if (contentData && typeof contentData === 'object' && contentData.results && Array.isArray(contentData.results.content)) {
            return contentData.results.content;
        }
        
        // Default to empty array
        return [];
    };

    // Fetch pathway data and module if not creating new
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch pathway data
                const pathwayRes = await axios.get(`${import.meta.env.VITE_API_URL}/pathways/${pathwayId}`);
                setPathway(pathwayRes.data);

                // Check if user is the owner
                if (user && pathwayRes.data.owner === user.id) {
                    setIsOwner(true);
                }

                // Fetch all modules for this pathway for prerequisites
                const modulesRes = await axios.get(`${import.meta.env.VITE_API_URL}/modules?pathwayId=${pathwayId}`);
                setAvailableModules(modulesRes.data);

                // If not creating a new module, fetch the existing module
                if (!isNewModule) {
                    const moduleRes = await axios.get(`${import.meta.env.VITE_API_URL}/modules/${id}`);
                    setModule(moduleRes.data);

                    // Parse content into segments array
                    const parsedContent = parseContent(moduleRes.data.content);

                    // Initialize form data
                    setFormData({
                        name: moduleRes.data.name || '',
                        key: moduleRes.data.key || '',
                        description: moduleRes.data.description || '',
                        prerequisites: moduleRes.data.prerequisites || [[]],
                        concepts: moduleRes.data.concepts || [],
                        content: parsedContent
                    });
                } else {
                    // Initialize form data for new module
                    setFormData({
                        name: '',
                        key: '',
                        description: '',
                        prerequisites: [[]],
                        concepts: [],
                        content: []
                    });
                }

                setError('');
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, pathwayId, user, isNewModule]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle content change from ModuleContentEditor
    const handleContentChange = (newContent) => {
        setFormData({
            ...formData,
            content: newContent
        });
    };

    // Handle concepts change (array of strings)
    const handleConceptsChange = (event, newConcepts) => {
        setFormData({
            ...formData,
            concepts: newConcepts
        });
    };

    // Handle prerequisites change
    const addPrerequisiteGroup = () => {
        setFormData({
            ...formData,
            prerequisites: [...formData.prerequisites, []]
        });
    };

    const removePrerequisiteGroup = (groupIndex) => {
        const updatedPrerequisites = formData.prerequisites.filter((_, index) => index !== groupIndex);
        setFormData({
            ...formData,
            prerequisites: updatedPrerequisites.length ? updatedPrerequisites : [[]]
        });
    };

    const handlePrerequisiteChange = (groupIndex, event, newPrereqs) => {
        const updatedPrerequisites = [...formData.prerequisites];
        updatedPrerequisites[groupIndex] = newPrereqs.map(module => module.key);

        setFormData({
            ...formData,
            prerequisites: updatedPrerequisites
        });
    };

    // Toggle between edit and view modes
    const toggleEditMode = () => {
        if (isEditing) {
            // If switching from edit to view, update the URL
            navigate(`/dashboard/create/module/${pathwayId}/${id}`);
        } else {
            // If switching from view to edit, update the URL
            navigate(`/dashboard/create/module/${pathwayId}/${id}?edit=true`);
        }
        setIsEditing(!isEditing);
    };

    // Auto-generate a key from the name
    const generateKey = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    // Handle name change with auto key generation
    const handleNameChange = (e) => {
        const newName = e.target.value;
        setFormData({
            ...formData,
            name: newName,
            key: isNewModule ? generateKey(newName) : formData.key
        });
    };

    // Save module changes
    const saveModule = async () => {
        try {
            setLoading(true);

            // Validate required fields
            if (!formData.name || !formData.key) {
                setError('Name and key are required');
                setLoading(false);
                return;
            }

            // Create the module data
            const moduleData = {
                name: formData.name,
                key: formData.key,
                description: formData.description,
                prerequisites: formData.prerequisites,
                concepts: formData.concepts,
                content: formData.content, // Now sending array directly
                pathwayId
            };

            console.log('Saving module with data:', moduleData);

            let res;
            if (isNewModule) {
                // Create new module
                res = await axios.post(`${import.meta.env.VITE_API_URL}/modules`, moduleData);

                // Navigate to the newly created module
                navigate(`/dashboard/create/module/${pathwayId}/${res.data.module._id}`);
            } else {
                // Update existing module
                res = await axios.put(`${import.meta.env.VITE_API_URL}/modules/${id}`, moduleData);

                setModule(res.data.module);
                setIsEditing(false);
                navigate(`/dashboard/create/module/${pathwayId}/${id}`);
            }

            setError('');
        } catch (err) {
            console.error('Error saving module:', err);
            setError(
                err.response?.data?.message ||
                `Failed to ${isNewModule ? 'create' : 'update'} module. Please try again.`
            );
        } finally {
            setLoading(false);
        }
    };

    // Delete module
    const deleteModule = async () => {
        try {
            setLoading(true);

            await axios.delete(`${import.meta.env.VITE_API_URL}/modules/${id}`);

            navigate(`/dashboard/create/pathway/${pathwayId}`);
        } catch (err) {
            console.error('Error deleting module:', err);
            setError(err.response?.data?.message || 'Failed to delete module. Please try again.');
            setLoading(false);
        }
    };

    // Handle AI generation results
    const handleAIGenerationResults = (newData) => {
        const updatedFormData = { ...formData };
        
        Object.keys(newData).forEach(key => {
            if (key !== 'applied' && newData[key]) {
                if (key === 'content') {
                    // Parse content from AI generation
                    updatedFormData[key] = parseContent(newData[key]);
                } else {
                    updatedFormData[key] = newData[key];
                }
            }
        });
        
        setFormData(updatedFormData);
    };

    // Render loading state
    if (loading && !module && !isNewModule) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    // Render error state
    if (error && !module && !isNewModule) {
        return (
            <Box mt={3}>
                <Alert severity="error">{error}</Alert>
                <Button
                    variant="outlined"
                    onClick={() => navigate(`/dashboard/create/pathway/${pathwayId}`)}
                    sx={{ mt: 2 }}
                >
                    Back to Pathway
                </Button>
            </Box>
        );
    }

    if (!module && !isNewModule) {
        return (
            <Box mt={3}>
                <Alert severity="warning">Module not found</Alert>
                <Button
                    variant="outlined"
                    onClick={() => navigate(`/dashboard/create/pathway/${pathwayId}`)}
                    sx={{ mt: 2 }}
                >
                    Back to Pathway
                </Button>
            </Box>
        );
    }

    // For preview of prerequisites, convert keys to names
    const getPrerequisiteNames = (group) => {
        return group.map(key => {
            const module = availableModules.find(m => m.key === key);
            return module ? module.name : key;
        });
    };

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Back button */}
            <Button
                variant="text"
                startIcon={<ArrowBack />}
                onClick={() => navigate(`/dashboard/create/pathway/${pathwayId}`)}
                sx={{ mb: 2 }}
            >
                Back to Pathway
            </Button>

            {/* Module Header with Edit/Preview Toggle */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h5" component="h1">
                        {isNewModule ? 'Create New Module' : isEditing ? 'Edit Module' : module?.name}
                    </Typography>

                    {!isEditing && !isNewModule && (
                        <Typography variant="subtitle1" color="text.secondary">
                            Module in {pathway?.title}
                        </Typography>
                    )}
                </Box>

                <Box>
                    {isOwner && !isNewModule && (
                        <>
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<Save />}
                                        onClick={saveModule}
                                        disabled={loading}
                                        sx={{ mr: 1 }}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={() => setDeleteDialogOpen(true)}
                                        sx={{ mr: 1 }}
                                    >
                                        Delete
                                    </Button>
                                    <AIGeneration
                                        type="module"
                                        id={id}
                                        initialData={formData}
                                        pathwayData={pathway}
                                        availableOptions={['name', 'description', 'concepts', 'prerequisites', 'content']}
                                        onGenerated={handleAIGenerationResults}
                                        buttonVariant="outlined"
                                        buttonSize="medium"
                                        buttonText="Enhance with AI"
                                    />
                                    <Button
                                        variant="outlined"
                                        startIcon={<Preview />}
                                        onClick={toggleEditMode}
                                        sx={{ ml: 1 }}
                                    >
                                        Preview
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={() => setDeleteDialogOpen(true)}
                                        sx={{ mr: 1 }}
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Edit />}
                                        onClick={toggleEditMode}
                                    >
                                        Edit
                                    </Button>
                                </>
                            )}
                        </>
                    )}

                    {isNewModule && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Save />}
                            onClick={saveModule}
                            disabled={loading}
                        >
                            Create Module
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Module Form or Details */}
            {isEditing ? (
                <Box component="form" sx={{ mb: 4 }}>
                    <Stack spacing={3}>
                        <TextField
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleNameChange}
                            required
                            fullWidth
                            helperText="The display name of this module"
                        />

                        <TextField
                            label="Key"
                            name="key"
                            value={formData.key}
                            onChange={handleInputChange}
                            required
                            fullWidth
                            disabled={!isNewModule}
                            helperText={
                                isNewModule
                                    ? "Unique identifier for this module (auto-generated from name)"
                                    : "Unique identifier for this module (cannot be changed)"
                            }
                        />

                        <TextField
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={3}
                            helperText="Supports markdown syntax"
                        />

                        {/* Prerequisites */}
                        <Box>
                            <Typography variant="subtitle1" gutterBottom>
                                Prerequisites (OR groups)
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Add multiple groups for OR logic. Modules within the same group use AND logic.
                            </Typography>

                            {formData.prerequisites.map((group, groupIndex) => (
                                <Box
                                    key={groupIndex}
                                    sx={{
                                        mb: 2,
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        position: 'relative'
                                    }}
                                >
                                    <Typography variant="subtitle2" gutterBottom>
                                        Group {groupIndex + 1}
                                    </Typography>

                                    <Autocomplete
                                        multiple
                                        id={`prerequisites-group-${groupIndex}`}
                                        options={availableModules.filter(m => m.key !== formData.key)}
                                        getOptionLabel={(option) => option.name}
                                        value={availableModules.filter(m => group.includes(m.key))}
                                        onChange={(event, newValue) => handlePrerequisiteChange(groupIndex, event, newValue)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="outlined"
                                                placeholder="Select prerequisite modules"
                                            />
                                        )}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    variant="outlined"
                                                    label={option.name}
                                                    {...getTagProps({ index })}
                                                    key={option.key}
                                                />
                                            ))
                                        }
                                    />

                                    {formData.prerequisites.length > 1 && (
                                        <IconButton
                                            size="small"
                                            onClick={() => removePrerequisiteGroup(groupIndex)}
                                            sx={{ position: 'absolute', top: 8, right: 8 }}
                                        >
                                            <Close fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                            ))}

                            <Button
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={addPrerequisiteGroup}
                                size="small"
                            >
                                Add Prerequisite Group
                            </Button>
                        </Box>

                        {/* Concepts */}
                        <Autocomplete
                            multiple
                            freeSolo
                            id="concepts"
                            options={[]}
                            value={formData.concepts}
                            onChange={handleConceptsChange}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    flexWrap: 'wrap',
                                    minHeight: '80px',
                                    maxHeight: '150px',
                                    overflow: 'auto'
                                },
                                '& .MuiAutocomplete-inputRoot': {
                                    padding: '5px 6px !important'
                                },
                                '& .MuiAutocomplete-input': {
                                    width: '100% !important'
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Concepts"
                                    placeholder="Add concept and press Enter"
                                    helperText="Key concepts covered in this module"
                                    multiline
                                    InputProps={{
                                        ...params.InputProps,
                                        sx: { alignItems: 'flex-start' }
                                    }}
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        variant="outlined"
                                        label={option}
                                        {...getTagProps({ index })}
                                        key={index}
                                        sx={{
                                            m: 0.5,
                                            maxWidth: '100%',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                    />
                                ))
                            }
                        />

                        {/* Content Editor - Use ModuleContentEditor component */}
                        <Box>
                            <Typography variant="subtitle1" gutterBottom>
                                Content
                            </Typography>
                            
                            <ModuleContentEditor 
                                value={formData.content} 
                                onChange={handleContentChange} 
                            />
                        </Box>
                    </Stack>
                </Box>
            ) : (
                <Box sx={{ mb: 4 }}>
                    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Description</Typography>
                        <MarkdownContent content={module.description} />
                    </Paper>

                    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Module Key</Typography>
                        <Typography variant="body1" fontFamily="monospace">
                            {module.key}
                        </Typography>
                    </Paper>

                    {/* Prerequisites */}
                    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Prerequisites</Typography>

                        {module.prerequisites.length === 0 ||
                            (module.prerequisites.length === 1 && module.prerequisites[0].length === 0) ? (
                            <Typography variant="body2" color="text.secondary">
                                No prerequisites required
                            </Typography>
                        ) : (
                            <Box>
                                {module.prerequisites.map((group, groupIndex) => (
                                    <Box key={groupIndex} sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Group {groupIndex + 1} (learner must complete all of these):
                                        </Typography>

                                        {group.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary">
                                                Empty group
                                            </Typography>
                                        ) : (
                                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                                                {getPrerequisiteNames(group).map((name, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={name}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                ))}

                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    The learner must complete all modules in at least one group to unlock this module.
                                </Typography>
                            </Box>
                        )}
                    </Paper>

                    {/* Concepts */}
                    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Concepts</Typography>

                        {module.concepts.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No concepts defined
                            </Typography>
                        ) : (
                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                                {module.concepts.map((concept, index) => (
                                    <Chip
                                        key={index}
                                        label={concept}
                                        size="small"
                                    />
                                ))}
                            </Box>
                        )}
                    </Paper>

                    {/* Content Preview/Link */}
                    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Content</Typography>

                        {!module.content || (Array.isArray(module.content) && module.content.length === 0) ? (
                            <Typography variant="body2" color="text.secondary">
                                No content available
                            </Typography>
                        ) : (
                            <Box>
                                <Button
                                    variant="outlined"
                                    startIcon={<OpenInNew />}
                                    onClick={() => setContentDialogOpen(true)}
                                >
                                    View Content
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </Box>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Module</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this module? This action cannot be undone.
                        Note that any other modules that list this module as a prerequisite will be updated.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={deleteModule} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Content Dialog */}
            <Dialog
                open={contentDialogOpen}
                onClose={() => setContentDialogOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        {module?.name} - Content
                        <IconButton onClick={() => setContentDialogOpen(false)}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {/* Use the ModuleContentRenderer component for viewing module content */}
                    <ModuleContentRenderer
                        content={module?.content}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default ModuleView;

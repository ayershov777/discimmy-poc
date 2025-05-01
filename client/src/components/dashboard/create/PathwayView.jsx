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
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    Divider,
    Tabs,
    Tab,
    TextField,
    Stack,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Edit,
    Visibility,
    Delete,
    Save,
    AddCircle,
    Preview,
    AutoAwesome
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import AIGeneration from '../../common/AIGeneration';
import PathwayStructureGenerator from '../../common/PathwayStructureGenerator';

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

const PathwayView = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useContext(AuthContext);

    // Check if URL has edit parameter
    const queryParams = new URLSearchParams(location.search);
    const editParam = queryParams.get('edit');

    const [pathway, setPathway] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(editParam === 'true');
    const [isOwner, setIsOwner] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Form data for editing
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        goal: '',
        requirements: '',
        targetAudience: ''
    });

    // Initialize form data from pathway
    useEffect(() => {
        if (pathway) {
            setFormData({
                title: pathway.title || '',
                description: pathway.description || '',
                goal: pathway.goal || '',
                requirements: pathway.requirements || '',
                targetAudience: pathway.targetAudience || ''
            });
        }
    }, [pathway]);

    // Fetch pathway data and modules
    useEffect(() => {
        const fetchPathwayAndModules = async () => {
            try {
                setLoading(true);

                // Fetch pathway data
                const pathwayRes = await axios.get(`${import.meta.env.VITE_API_URL}/pathways/${id}`);
                setPathway(pathwayRes.data);

                // Check if user is the owner
                if (user && pathwayRes.data.owner === user.id) {
                    setIsOwner(true);
                }

                // Fetch modules for this pathway
                const modulesRes = await axios.get(`${import.meta.env.VITE_API_URL}/modules?pathwayId=${id}`);
                setModules(modulesRes.data);

                setError('');
            } catch (err) {
                console.error('Error fetching pathway data:', err);
                setError('Failed to load pathway data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPathwayAndModules();
        }
    }, [id, user]);

    // Handle form change
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Toggle between edit and view modes
    const toggleEditMode = () => {
        if (isEditing) {
            // If switching from edit to view, update the URL
            navigate(`/dashboard/create/pathway/${id}`);
        } else {
            // If switching from view to edit, update the URL
            navigate(`/dashboard/create/pathway/${id}?edit=true`);
        }
        setIsEditing(!isEditing);
    };

    // Save pathway changes
    const saveChanges = async () => {
        try {
            setLoading(true);

            const res = await axios.put(`${import.meta.env.VITE_API_URL}/pathways/${id}`, formData);

            setPathway(res.data.pathway);
            setIsEditing(false);
            navigate(`/dashboard/create/pathway/${id}`);

            setError('');
        } catch (err) {
            console.error('Error updating pathway:', err);
            setError(err.response?.data?.message || 'Failed to update pathway. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Delete pathway
    const deletePathway = async () => {
        try {
            setLoading(true);

            await axios.delete(`${import.meta.env.VITE_API_URL}/pathways/${id}`);

            navigate('/dashboard/create/my-pathways');
        } catch (err) {
            console.error('Error deleting pathway:', err);
            setError(err.response?.data?.message || 'Failed to delete pathway. Please try again.');
            setLoading(false);
        }
    };

    // Render loading state
    if (loading && !pathway) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    // Render error state
    if (error && !pathway) {
        return (
            <Box mt={3}>
                <Alert severity="error">{error}</Alert>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard/create/my-pathways')}
                    sx={{ mt: 2 }}
                >
                    Back to My Pathways
                </Button>
            </Box>
        );
    }

    if (!pathway) {
        return (
            <Box mt={3}>
                <Alert severity="warning">Pathway not found</Alert>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard/create/my-pathways')}
                    sx={{ mt: 2 }}
                >
                    Back to My Pathways
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Pathway Header with Edit/Preview Toggle */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h5" component="h1">
                        {isEditing ? 'Edit Pathway' : pathway.title}
                    </Typography>

                    {!isEditing && (
                        <Typography variant="subtitle1" color="text.secondary">
                            Learning Pathway
                        </Typography>
                    )}
                </Box>

                <Box>
                    {isOwner && (
                        <>
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<Save />}
                                        onClick={saveChanges}
                                        disabled={loading}
                                        sx={{ mr: 1 }}
                                    >
                                        Save
                                    </Button>
                                    <AIGeneration
                                        type="pathway"
                                        id={id}
                                        initialData={formData}
                                        availableOptions={['title', 'description', 'goal', 'requirements', 'targetAudience']}
                                        onGenerated={(newData) => {
                                            const updatedFormData = { ...formData };
                                            Object.keys(newData).forEach(key => {
                                                if (key !== 'applied' && newData[key]) {
                                                    updatedFormData[key] = newData[key];
                                                }
                                            });
                                            setFormData(updatedFormData);
                                        }}
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
                </Box>
            </Box>

            {/* Pathway Details - Edit Mode or View Mode */}
            {isEditing ? (
                <Box component="form" sx={{ mb: 4 }}>
                    <Stack spacing={3}>
                        <TextField
                            label="Title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            fullWidth
                            multiline
                            rows={4}
                            helperText="Supports markdown syntax"
                        />

                        <TextField
                            label="Goal"
                            name="goal"
                            value={formData.goal}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={3}
                            helperText="Supports markdown syntax"
                        />

                        <TextField
                            label="Requirements"
                            name="requirements"
                            value={formData.requirements}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={3}
                            helperText="Supports markdown syntax"
                        />

                        <TextField
                            label="Target Audience"
                            name="targetAudience"
                            value={formData.targetAudience}
                            onChange={handleInputChange}
                            fullWidth
                        />
                    </Stack>
                </Box>
            ) : (
                <Box sx={{ mb: 4 }}>
                    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Description</Typography>
                        <MarkdownContent content={pathway.description} />
                    </Paper>

                    {pathway.goal && (
                        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Goal</Typography>
                            <MarkdownContent content={pathway.goal} />
                        </Paper>
                    )}

                    {pathway.requirements && (
                        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Requirements</Typography>
                            <MarkdownContent content={pathway.requirements} />
                        </Paper>
                    )}

                    {pathway.targetAudience && (
                        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Target Audience</Typography>
                            <Typography>{pathway.targetAudience}</Typography>
                        </Paper>
                    )}
                </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Modules Section */}
            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">
                        Modules
                        <Chip
                            label={modules.length}
                            size="small"
                            sx={{ ml: 1, fontSize: '0.7rem' }}
                        />
                    </Typography>

                    {isOwner && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddCircle />}
                                component={Link}
                                to={`/dashboard/create/module/${id}/new`}
                            >
                                Add Module
                            </Button>
                            <PathwayStructureGenerator
                                pathwayId={id}
                                pathwayData={pathway}
                                onGenerated={(result, successMessage) => {
                                    // If success message is provided, it means the structure was applied
                                    if (successMessage) {
                                        // Show success message
                                        alert(successMessage);

                                        // Refresh the modules list
                                        const fetchModules = async () => {
                                            try {
                                                const modulesRes = await axios.get(`${import.meta.env.VITE_API_URL}/modules?pathwayId=${id}`);
                                                setModules(modulesRes.data);
                                            } catch (err) {
                                                console.error('Error fetching updated modules:', err);
                                            }
                                        };

                                        fetchModules();
                                    }
                                }}
                                buttonVariant="outlined"
                                buttonText="Generate Structure with AI"
                            />

                        </Box>
                    )}
                </Box>

                {modules.length === 0 ? (
                    <Box textAlign="center" py={5} bgcolor="grey.50" borderRadius={1}>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            No modules have been added to this pathway yet.
                        </Typography>
                        {isOwner && (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddCircle />}
                                component={Link}
                                to={`/dashboard/create/module/${id}/new`}
                            >
                                Create First Module
                            </Button>
                        )}
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {modules.map((module) => (
                            <Grid item xs={12} sm={6} md={4} key={module._id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" component="h2" gutterBottom>
                                            {module.name}
                                        </Typography>

                                        {module.concepts && module.concepts.length > 0 && (
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Key Concepts:
                                                </Typography>
                                                <Box display="flex" flexWrap="wrap" gap={0.5}>
                                                    {module.concepts.map((concept, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={concept}
                                                            size="small"
                                                            sx={{ mb: 0.5 }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            startIcon={<Visibility />}
                                            component={Link}
                                            to={`/dashboard/create/module/${pathway._id}/${module._id}`}
                                        >
                                            View
                                        </Button>
                                        {isOwner && (
                                            <>
                                                <Button
                                                    size="small"
                                                    startIcon={<Edit />}
                                                    component={Link}
                                                    to={`/dashboard/create/module/${pathway._id}/${module._id}?edit=true`}
                                                >
                                                    Edit
                                                </Button>
                                            </>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Pathway</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this pathway? This action will also delete all modules
                        within this pathway and cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={deletePathway} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PathwayView;

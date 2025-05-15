import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Card,
    CardContent,
    CardActions,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Divider,
    Alert,
    Collapse
} from '@mui/material';
import {
    Add,
    Delete,
    Edit,
    Save,
    Cancel,
    ArrowUpward,
    ArrowDownward,
    Article,
    Search,
    Assignment,
    Group,
    Build,
    Code,
    ExpandMore,
    ExpandLess
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

// Define segment types and their corresponding icons
const segmentIcons = {
    article: <Article color="primary" />,
    research: <Search color="primary" />,
    exercise: <Assignment color="primary" />,
    session: <Group color="primary" />,
    project: <Build color="primary" />,
    integration: <Code color="primary" />
};

const segmentTypeOptions = [
    { value: 'article', label: 'Article' },
    { value: 'research', label: 'Research' },
    { value: 'exercise', label: 'Exercise' },
    { value: 'session', label: 'Session' },
    { value: 'project', label: 'Project' },
    { value: 'integration', label: 'Integration' }
];

// Component for editing a single segment
const SegmentEditor = ({ segment, onSave, onCancel }) => {
    // Ensure content is a string
    const normalizeContent = (content) => {
        if (typeof content === 'string') {
            return content;
        }

        if (Array.isArray(content)) {
            return content.join('\n\n');
        }

        if (typeof content === 'object' && content !== null) {
            try {
                return JSON.stringify(content, null, 2);
            } catch (e) {
                console.error('Failed to stringify content:', e);
                return '';
            }
        }

        return String(content || '');
    };

    const [formData, setFormData] = useState({
        type: segment?.type || 'article',
        title: segment?.title || '',
        content: normalizeContent(segment?.content) || '',
        section: segment?.section || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Segment Type</InputLabel>
                        <Select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                        >
                            {segmentTypeOptions.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {segmentIcons[option.value]}
                                        <Typography>{option.label}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        name="section"
                        label="Section"
                        value={formData.section}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        placeholder="e.g., Introduction, Core Concepts, Consolidation"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name="title"
                        label="Title"
                        value={formData.title}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name="content"
                        label="Content (Markdown)"
                        value={formData.content}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={15}
                        margin="normal"
                        required
                        sx={{ fontFamily: 'monospace' }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={onCancel}
                            startIcon={<Cancel />}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            startIcon={<Save />}
                        >
                            Save Segment
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

// Preview component for a segment with collapsible content
const SegmentPreview = ({ segment, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast, isExpanded, onToggleExpand }) => {
    return (
        <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {segmentIcons[segment.type] || <Article color="primary" />}
                    <Typography variant="h6">{segment.title}</Typography>
                </Box>
                {segment.section && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Section: {segment.section}
                    </Typography>
                )}
                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 1 }}>
                    <Button
                        size="small"
                        onClick={onToggleExpand}
                        endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                        sx={{ textTransform: 'none' }}
                    >
                        {isExpanded ? "Collapse Content" : "Expand Content"}
                    </Button>
                </Box>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ bgcolor: 'background.paper', p: 1, borderRadius: 1, mt: 1 }}>
                        <ReactMarkdown>{segment.content}</ReactMarkdown>
                    </Box>
                </Collapse>
            </CardContent>
            <CardActions>
                <IconButton onClick={onEdit} title="Edit">
                    <Edit />
                </IconButton>
                <IconButton onClick={onDelete} title="Delete" color="error">
                    <Delete />
                </IconButton>
                <IconButton onClick={onMoveUp} disabled={isFirst} title="Move Up">
                    <ArrowUpward />
                </IconButton>
                <IconButton onClick={onMoveDown} disabled={isLast} title="Move Down">
                    <ArrowDownward />
                </IconButton>
            </CardActions>
        </Card>
    );
};

// Main content editor component
const ModuleContentEditor = ({ value, onChange }) => {
    const [segments, setSegments] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [expandedSegments, setExpandedSegments] = useState({});

    // Initialize segments from value
    useEffect(() => {
        if (Array.isArray(value) && value.length > 0) {
            // Ensure all segments have string content
            const normalizedSegments = value.map(segment => ({
                ...segment,
                content: typeof segment.content === 'string'
                    ? segment.content
                    : Array.isArray(segment.content)
                        ? segment.content.join('\n\n')
                        : typeof segment.content === 'object'
                            ? JSON.stringify(segment.content, null, 2)
                            : String(segment.content || '')
            }));
            setSegments(normalizedSegments);

            // Initialize expanded state for all segments (default first segment expanded)
            if (Object.keys(expandedSegments).length === 0) {
                const initialExpandedState = {};
                normalizedSegments.forEach((_, index) => {
                    initialExpandedState[index] = index === 0; // Expand only the first segment by default
                });
                setExpandedSegments(initialExpandedState);
            }
        } else {
            setSegments([]);
        }
    }, [value]);

    // Update parent component with new segments
    const updateSegments = (newSegments) => {
        setSegments(newSegments);
        onChange(newSegments);
    };

    // Handle saving a segment
    const handleSaveSegment = (segmentData) => {
        let newSegments;

        if (isAddingNew) {
            newSegments = [...segments, segmentData];
            // Auto-expand newly added segment
            setExpandedSegments({
                ...expandedSegments,
                [segments.length]: true
            });
        } else {
            newSegments = [...segments];
            newSegments[editingIndex] = segmentData;
        }

        updateSegments(newSegments);
        setEditingIndex(null);
        setIsAddingNew(false);
    };

    // Handle deleting a segment
    const handleConfirmDelete = () => {
        const newSegments = segments.filter((_, index) => index !== deleteIndex);
        updateSegments(newSegments);

        // Update expanded states after deletion
        const newExpandedSegments = {};
        Object.keys(expandedSegments).forEach(key => {
            const keyNum = parseInt(key);
            if (keyNum < deleteIndex) {
                newExpandedSegments[keyNum] = expandedSegments[keyNum];
            } else if (keyNum > deleteIndex) {
                newExpandedSegments[keyNum - 1] = expandedSegments[keyNum];
            }
        });
        setExpandedSegments(newExpandedSegments);

        setDeleteDialogOpen(false);
        setDeleteIndex(null);
    };

    // Handle moving a segment up
    const handleMoveUp = (index) => {
        if (index <= 0) return;

        const newSegments = [...segments];
        const temp = newSegments[index];
        newSegments[index] = newSegments[index - 1];
        newSegments[index - 1] = temp;

        // Swap expanded states
        const newExpandedSegments = { ...expandedSegments };
        const tempExpanded = newExpandedSegments[index];
        newExpandedSegments[index] = newExpandedSegments[index - 1];
        newExpandedSegments[index - 1] = tempExpanded;
        setExpandedSegments(newExpandedSegments);

        updateSegments(newSegments);
    };

    // Handle moving a segment down
    const handleMoveDown = (index) => {
        if (index >= segments.length - 1) return;

        const newSegments = [...segments];
        const temp = newSegments[index];
        newSegments[index] = newSegments[index + 1];
        newSegments[index + 1] = temp;

        // Swap expanded states
        const newExpandedSegments = { ...expandedSegments };
        const tempExpanded = newExpandedSegments[index];
        newExpandedSegments[index] = newExpandedSegments[index + 1];
        newExpandedSegments[index + 1] = tempExpanded;
        setExpandedSegments(newExpandedSegments);

        updateSegments(newSegments);
    };

    // Toggle expand/collapse for a segment
    const toggleExpandSegment = (index) => {
        setExpandedSegments({
            ...expandedSegments,
            [index]: !expandedSegments[index]
        });
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Module Content Segments</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => {
                        setIsAddingNew(true);
                        setEditingIndex(null);
                    }}
                >
                    Add Segment
                </Button>
            </Box>

            {segments.length === 0 && !isAddingNew && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    No content segments yet. Click "Add Segment" to create your first segment.
                </Alert>
            )}

            {/* Segment list */}
            {segments.map((segment, index) => (
                <React.Fragment key={index}>
                    {editingIndex === index ? (
                        <Card variant="outlined" sx={{ mb: 2 }}>
                            <SegmentEditor
                                segment={segment}
                                onSave={handleSaveSegment}
                                onCancel={() => setEditingIndex(null)}
                            />
                        </Card>
                    ) : (
                        <SegmentPreview
                            segment={segment}
                            onEdit={() => {
                                setEditingIndex(index);
                                setIsAddingNew(false);
                            }}
                            onDelete={() => {
                                setDeleteIndex(index);
                                setDeleteDialogOpen(true);
                            }}
                            onMoveUp={() => handleMoveUp(index)}
                            onMoveDown={() => handleMoveDown(index)}
                            isFirst={index === 0}
                            isLast={index === segments.length - 1}
                            isExpanded={!!expandedSegments[index]}
                            onToggleExpand={() => toggleExpandSegment(index)}
                        />
                    )}
                </React.Fragment>
            ))}

            {/* New segment form */}
            {isAddingNew && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                    <SegmentEditor
                        segment={null}
                        onSave={handleSaveSegment}
                        onCancel={() => setIsAddingNew(false)}
                    />
                </Card>
            )}

            {/* Delete confirmation dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Segment</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this segment? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ModuleContentEditor;

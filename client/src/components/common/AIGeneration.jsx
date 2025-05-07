import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormGroup,
    FormControlLabel,
    Checkbox,
    TextField,
    CircularProgress,
    Typography,
    Box,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    AutoAwesome,
    Check,
    ExpandMore,
    InfoOutlined
} from '@mui/icons-material';
import ApiService from '../../services/ApiService';
import ReactMarkdown from 'react-markdown';

// Component for generating/enhancing content using AI
const AIGeneration = ({
    type, // 'pathway' or 'module'
    id, // ID of the pathway or module
    initialData, // Current data
    pathwayData, // Only needed for module generation
    availableOptions, // Array of properties that can be generated
    onGenerated, // Callback function for when content is applied
    buttonVariant = 'outlined',
    buttonSize = 'medium',
    buttonText = 'Enhance with AI'
}) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [generatedContent, setGeneratedContent] = useState({});
    const [userPrompt, setUserPrompt] = useState('');
    const [autoApply, setAutoApply] = useState(false);

    const handleOpen = () => {
        setOpen(true);
        setSelectedOptions([]);
        setGeneratedContent({});
        setError('');
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOptionChange = (option) => {
        if (selectedOptions.includes(option)) {
            setSelectedOptions(selectedOptions.filter(o => o !== option));
        } else {
            setSelectedOptions([...selectedOptions, option]);
        }
    };

    const handleAutoApplyChange = (event) => {
        setAutoApply(event.target.checked);
    };

    const handlePromptChange = (event) => {
        setUserPrompt(event.target.value);
    };

    const handleGenerate = async () => {
        if (selectedOptions.length === 0) {
            setError('Please select at least one option to generate');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let response;

            if (type === 'pathway') {
                response = await ApiService.generatePathwayProperties(id, selectedOptions, autoApply);
            } else if (type === 'module') {
                response = await ApiService.generateModuleProperties(id, selectedOptions, autoApply);
            }

            setGeneratedContent(response.results);

            if (autoApply && response.results.applied) {
                onGenerated(response.results);
                handleClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error generating content');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        onGenerated(generatedContent);
        handleClose();
    };

    const generateLabel = (option) => {
        const labels = {
            title: 'Title',
            description: 'Description',
            goal: 'Goal',
            requirements: 'Requirements',
            targetAudience: 'Target Audience',
            name: 'Name',
            concepts: 'Concepts',
            prerequisites: 'Prerequisites',
            content: 'Content'
        };

        return labels[option] || option;
    };

    const generateDescription = (option) => {
        const descriptions = {
            title: 'Generate an engaging, descriptive title',
            description: 'Create a detailed description of what learners will achieve',
            goal: 'Define clear learning outcomes and objectives',
            requirements: 'Specify prerequisites and requirements for learners',
            targetAudience: 'Identify the ideal target audience',
            name: 'Create a concise, descriptive name for this module',
            concepts: 'Generate key concepts that should be covered',
            prerequisites: 'Suggest logical prerequisites from other modules',
            content: 'Generate complete Markdown content for the module'
        };

        return descriptions[option] || '';
    };

    // Updated method to render content based on type
    const renderContent = (option, content) => {
        if (option === 'concepts' || option === 'prerequisites') {
            return (
                <Box sx={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    p: 1,
                    borderRadius: 1
                }}>
                    {JSON.stringify(content, null, 2)}
                </Box>
            );
        } else if (option === 'content') {
            // Check if content is in the segmented format
            let segmentContent = null;
            if (content && typeof content === 'object') {
                if (Array.isArray(content)) {
                    segmentContent = content;
                } else if (content.results && content.results.content) {
                    segmentContent = content.results.content;
                }
            }

            if (segmentContent) {
                // Render segmented content summary
                return (
                    <Box sx={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                        p: 1,
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: 1
                    }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Segmented content with {segmentContent.length} segments
                        </Typography>
                        <Box
                            sx={{
                                p: 1,
                                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                fontFamily: 'monospace',
                                fontSize: '0.8rem'
                            }}
                        >
                            <ul>
                                {segmentContent.slice(0, 5).map((segment, index) => (
                                    <li key={index}>
                                        <strong>{segment.type}</strong>: {segment.title}
                                        {segment.section && <span> (Section: {segment.section})</span>}
                                    </li>
                                ))}
                                {segmentContent.length > 5 && (
                                    <li>... and {segmentContent.length - 5} more segments</li>
                                )}
                            </ul>
                        </Box>
                    </Box>
                );
            } else if (typeof content === 'string') {
                // For string content, check if it's JSON or plain text
                try {
                    const parsedContent = JSON.parse(content);
                    if (Array.isArray(parsedContent)) {
                        // It's a JSON array of segments
                        return (
                            <Box sx={{
                                maxHeight: '300px',
                                overflowY: 'auto',
                                p: 1,
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                borderRadius: 1
                            }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Segmented content with {parsedContent.length} segments
                                </Typography>
                                <Box
                                    sx={{
                                        p: 1,
                                        backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        fontFamily: 'monospace',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    <ul>
                                        {parsedContent.slice(0, 5).map((segment, index) => (
                                            <li key={index}>
                                                <strong>{segment.type}</strong>: {segment.title}
                                                {segment.section && <span> (Section: {segment.section})</span>}
                                            </li>
                                        ))}
                                        {parsedContent.length > 5 && (
                                            <li>... and {parsedContent.length - 5} more segments</li>
                                        )}
                                    </ul>
                                </Box>
                            </Box>
                        );
                    }
                } catch (e) {
                    // Not JSON, treat as Markdown
                    return (
                        <Box
                            sx={{
                                p: 2,
                                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                borderRadius: 1,
                                maxHeight: '300px',
                                overflowY: 'auto',
                                '& a': {
                                    color: 'primary.main',
                                    textDecoration: 'none',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                },
                                '& pre': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                    padding: 2,
                                    borderRadius: 1,
                                    overflowX: 'auto',
                                    fontFamily: 'monospace'
                                },
                                '& code': {
                                    fontFamily: 'monospace',
                                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                    padding: '2px 4px',
                                    borderRadius: '3px',
                                },
                                '& h1, & h2, & h3, & h4, & h5, & h6': {
                                    marginTop: '1em',
                                    marginBottom: '0.5em',
                                    fontWeight: 500
                                }
                            }}
                        >
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </Box>
                    );
                }
            } else {
                // Handle other content formats
                return (
                    <Box sx={{
                        p: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.03)',
                        borderRadius: 1
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            Unknown content format
                        </Typography>
                    </Box>
                );
            }
        } else {
            // For other fields (like description), render as Markdown
            return (
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.03)',
                        borderRadius: 1,
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}
                >
                    <ReactMarkdown>{content}</ReactMarkdown>
                </Box>
            );
        }
    };

    return (
        <>
            <Button
                variant={buttonVariant}
                color="primary"
                startIcon={<AutoAwesome />}
                onClick={handleOpen}
                size={buttonSize}
            >
                {buttonText}
            </Button>

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Generate Content with AI
                </DialogTitle>

                <DialogContent dividers>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Typography variant="subtitle1" gutterBottom>
                        What would you like to generate?
                    </Typography>

                    <FormGroup sx={{ mb: 3 }}>
                        {availableOptions.map((option) => (
                            <FormControlLabel
                                key={option}
                                control={
                                    <Checkbox
                                        checked={selectedOptions.includes(option)}
                                        onChange={() => handleOptionChange(option)}
                                        disabled={loading}
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {generateLabel(option)}
                                        <Tooltip title={generateDescription(option)}>
                                            <InfoOutlined fontSize="small" color="action" />
                                        </Tooltip>
                                    </Box>
                                }
                            />
                        ))}
                    </FormGroup>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={autoApply}
                                onChange={handleAutoApplyChange}
                                disabled={loading}
                            />
                        }
                        label="Automatically apply generated content"
                    />

                    {Object.keys(generatedContent).length > 0 && selectedOptions.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Generated Content:
                            </Typography>

                            {selectedOptions.map((option) => (
                                generatedContent[option] && (
                                    <Accordion key={option} sx={{ mb: 1 }}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Typography>
                                                {generateLabel(option)}
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {renderContent(option, generatedContent[option])}
                                        </AccordionDetails>
                                    </Accordion>
                                )
                            ))}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                    <Button
                        onClick={handleClose}
                        color="inherit"
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Box>
                        {Object.keys(generatedContent).length > 0 && !autoApply && (
                            <Button
                                onClick={handleApply}
                                variant="contained"
                                color="success"
                                startIcon={<Check />}
                                sx={{ mr: 1 }}
                            >
                                Apply Changes
                            </Button>
                        )}

                        <Button
                            onClick={handleGenerate}
                            variant="contained"
                            color="primary"
                            startIcon={<AutoAwesome />}
                            disabled={loading || selectedOptions.length === 0}
                        >
                            {loading ? (
                                <>
                                    <CircularProgress size={24} sx={{ mr: 1 }} />
                                    Generating...
                                </>
                            ) : (
                                'Generate'
                            )}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AIGeneration;

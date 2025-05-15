import React, { useState, useEffect } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Box,
    Paper,
    Divider,
    Chip,
    CircularProgress
} from '@mui/material';
import {
    ExpandMore,
    Article,
    Search,
    Assignment,
    Group,
    Build,
    Code
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

const ModuleContentRenderer = ({ content, loading = false }) => {
    const [segments, setSegments] = useState([]);
    const [sections, setSections] = useState([]);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (loading || !content) {
            setSegments([]);
            setSections([]);
            return;
        }

        // Helper function to ensure we have a valid array of segments
        const normalizeContent = (inputContent) => {
            // If content is already an array, use it directly
            if (Array.isArray(inputContent)) {
                return inputContent;
            }

            // If content is a string, try to parse it as JSON
            if (typeof inputContent === 'string') {
                try {
                    const parsed = JSON.parse(inputContent);
                    if (Array.isArray(parsed)) {
                        return parsed;
                    }
                } catch (e) {
                    console.warn('Content is not valid JSON:', e);
                }
            }

            // Return empty array for invalid content
            return [];
        };

        // Get normalized segments
        const normalizedSegments = normalizeContent(content);
        setSegments(normalizedSegments);

        // Extract unique sections for grouping
        const uniqueSections = Array.from(
            new Set(normalizedSegments.map(segment => segment.section || 'Content'))
        );
        setSections(uniqueSections);

        // Set first segment as expanded by default
        if (normalizedSegments.length > 0 && !expanded) {
            setExpanded(`segment-0-0`);
        }
    }, [content, loading, expanded]);

    // Helper function to ensure content is a string
    const ensureString = (content) => {
        if (typeof content === 'string') {
            return content;
        }

        // If content is an array, join with newlines
        if (Array.isArray(content)) {
            return content.join('\n\n');
        }

        // If content is an object, convert to JSON string
        if (typeof content === 'object' && content !== null) {
            try {
                return JSON.stringify(content, null, 2);
            } catch (e) {
                console.error('Failed to stringify object content:', e);
                return 'Error: Failed to render content';
            }
        }

        // For other types, convert to string
        return String(content || '');
    };

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    // Render loading state
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    // Render content frame if no content
    if (!content || segments.length === 0) {
        return (
            <Paper elevation={0} sx={{ p: 3, mt: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                    No content available
                </Typography>
            </Paper>
        );
    }

    // Render content by sections
    return (
        <Box sx={{ mt: 2 }}>
            {sections.map((section, sectionIndex) => (
                <Box key={`section-${sectionIndex}`} sx={{ mb: 3 }}>
                    {sections.length > 1 && (
                        <Typography variant="h6" component="h2" gutterBottom>
                            {section}
                        </Typography>
                    )}

                    {segments
                        .filter(segment => (segment.section || 'Content') === section)
                        .map((segment, segmentIndex) => {
                            const segmentId = `segment-${sectionIndex}-${segmentIndex}`;

                            // Ensure segment content is a string
                            const segmentContent = ensureString(segment.content);

                            return (
                                <Accordion
                                    key={segmentId}
                                    expanded={expanded === segmentId}
                                    onChange={handleAccordionChange(segmentId)}
                                    sx={{ mb: 1 }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMore />}
                                        aria-controls={`${segmentId}-content`}
                                        id={`${segmentId}-header`}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {segmentIcons[segment.type] || <Article color="primary" />}
                                            <Typography>{segment.title}</Typography>
                                            <Chip
                                                label={segment.type}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ ml: 1, textTransform: 'capitalize' }}
                                            />
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Divider sx={{ mb: 2 }} />
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: 'auto',
                                                border: 'none',
                                                borderRadius: 1,
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {/* Markdown Content Renderer */}
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    maxHeight: '500px',
                                                    overflowY: 'auto',
                                                    bgcolor: 'background.paper',
                                                    borderRadius: 1,
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
                                                    '& img': {
                                                        maxWidth: '100%',
                                                        height: 'auto'
                                                    },
                                                    '& table': {
                                                        borderCollapse: 'collapse',
                                                        width: '100%',
                                                        marginBottom: '1em'
                                                    },
                                                    '& th, & td': {
                                                        border: '1px solid rgba(0, 0, 0, 0.12)',
                                                        padding: '8px',
                                                        textAlign: 'left'
                                                    },
                                                    '& th': {
                                                        backgroundColor: 'rgba(0, 0, 0, 0.05)'
                                                    },
                                                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                                                        marginTop: '1.5em',
                                                        marginBottom: '0.5em',
                                                        fontWeight: 500
                                                    },
                                                    '& p': {
                                                        marginBottom: '1em'
                                                    },
                                                    '& ul, & ol': {
                                                        paddingLeft: '2em',
                                                        marginBottom: '1em'
                                                    }
                                                }}
                                            >
                                                <ReactMarkdown>
                                                    {segmentContent}
                                                </ReactMarkdown>
                                            </Box>
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })}
                </Box>
            ))}
        </Box>
    );
};

export default ModuleContentRenderer;

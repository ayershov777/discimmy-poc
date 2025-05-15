import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Chip,
    CircularProgress,
    LinearProgress,
    Button,
    Card,
    CardContent,
    CardActions,
    Divider
} from '@mui/material';
import {
    ArrowBack,
    ArrowForward,
    Article,
    Search,
    Assignment,
    Group,
    Build,
    Code,
    Fullscreen,
    FullscreenExit
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

// Define segment types and their corresponding icons and colors
const segmentIcons = {
    article: <Article />,
    research: <Search />,
    exercise: <Assignment />,
    session: <Group />,
    project: <Build />,
    integration: <Code />
};

const segmentColors = {
    article: '#3498db', // blue
    research: '#9b59b6', // purple
    exercise: '#2ecc71', // green
    session: '#f39c12', // orange
    project: '#e74c3c', // red
    integration: '#1abc9c' // teal
};

const ModuleContentSlideshow = ({ content, loading = false, onClose }) => {
    const [segments, setSegments] = useState([]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        if (loading || !content) {
            setSegments([]);
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

        // Reset to first slide when content changes
        setCurrentSlideIndex(0);
    }, [content, loading]);

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

    const handleNext = () => {
        if (currentSlideIndex < segments.length - 1) {
            setCurrentSlideIndex(currentSlideIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(currentSlideIndex - 1);
        }
    };

    const toggleFullscreen = () => {
        setFullscreen(!fullscreen);
    };

    // Handle keydown events for navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrevious();
            } else if (e.key === 'Escape' && fullscreen) {
                setFullscreen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentSlideIndex, segments.length, fullscreen]);

    // Render loading state
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    // Render empty state
    if (!content || segments.length === 0) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="300px"
                bgcolor="background.paper"
            >
                <Typography variant="body1" color="text.secondary">
                    No content available
                </Typography>
            </Box>
        );
    }

    // Current segment to display
    const currentSegment = segments[currentSlideIndex];
    const segmentContent = ensureString(currentSegment.content);
    const segmentType = currentSegment.type || 'article';
    const segmentIcon = segmentIcons[segmentType] || segmentIcons.article;
    const segmentColor = segmentColors[segmentType] || segmentColors.article;

    return (
        <Box
            sx={{
                height: fullscreen ? '100vh' : '80vh',
                width: fullscreen ? '100vw' : 'auto',
                position: fullscreen ? 'fixed' : 'relative',
                top: fullscreen ? 0 : 'auto',
                left: fullscreen ? 0 : 'auto',
                zIndex: fullscreen ? 1300 : 'auto',
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* Header Area - Fixed */}
            <Box sx={{ flexShrink: 0 }}>
                {/* Progress bar */}
                <LinearProgress
                    variant="determinate"
                    value={(currentSlideIndex / (segments.length - 1)) * 100}
                    sx={{ height: 4 }}
                />

                {/* Slide counter and fullscreen toggle */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Slide {currentSlideIndex + 1} of {segments.length}
                    </Typography>
                    <Box>
                        <IconButton onClick={toggleFullscreen} size="small">
                            {fullscreen ? <FullscreenExit /> : <Fullscreen />}
                        </IconButton>
                    </Box>
                </Box>
            </Box>

            {/* Main Content Area - With Card and ScrollArea */}
            <Box
                sx={{
                    flexGrow: 1,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden', // Hide overflow here
                }}
            >
                <Card
                    elevation={3}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        borderTop: '4px solid',
                        borderColor: segmentColor,
                        overflow: 'hidden', // Hide overflow at card level
                    }}
                >
                    {/* Card header - Fixed */}
                    <Box
                        sx={{
                            p: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            flexShrink: 0,
                        }}
                    >
                        {/* Segment header */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 1,
                                gap: 1,
                            }}
                        >
                            <Box sx={{ color: segmentColor }}>
                                {segmentIcon}
                            </Box>
                            <Typography variant="h5" component="h2">
                                {currentSegment.title}
                            </Typography>
                            <Chip
                                label={segmentType}
                                size="small"
                                sx={{
                                    textTransform: 'capitalize',
                                    ml: 'auto',
                                    bgcolor: segmentColor,
                                    color: 'white',
                                }}
                            />
                        </Box>

                        {currentSegment.section && (
                            <Typography
                                variant="subtitle1"
                                color="text.secondary"
                                gutterBottom
                            >
                                Section: {currentSegment.section}
                            </Typography>
                        )}
                    </Box>

                    {/* Scrollable Content Area */}
                    <Box
                        sx={{
                            p: 2,
                            flexGrow: 1,
                            overflowY: 'auto', // Only this area scrolls
                            '& a': {
                                color: 'primary.main',
                                textDecoration: 'none',
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            },
                            '& pre': {
                                bgcolor: 'rgba(0, 0, 0, 0.05)',
                                p: 2,
                                borderRadius: 1,
                                overflowX: 'auto',
                                fontFamily: 'monospace',
                            },
                            '& code': {
                                fontFamily: 'monospace',
                                bgcolor: 'rgba(0, 0, 0, 0.05)',
                                p: '2px 4px',
                                borderRadius: '3px',
                            },
                            '& img': {
                                maxWidth: '100%',
                                height: 'auto',
                            },
                            '& table': {
                                borderCollapse: 'collapse',
                                width: '100%',
                                mb: '1em',
                            },
                            '& th, & td': {
                                border: '1px solid rgba(0, 0, 0, 0.12)',
                                p: '8px',
                                textAlign: 'left',
                            },
                            '& th': {
                                bgcolor: 'rgba(0, 0, 0, 0.05)',
                            },
                            '& h1, & h2, & h3, & h4, & h5, & h6': {
                                mt: '1.5em',
                                mb: '0.5em',
                                fontWeight: 500,
                            },
                            '& p': {
                                mb: '1em',
                            },
                            '& ul, & ol': {
                                pl: '2em',
                                mb: '1em',
                            },
                        }}
                    >
                        <ReactMarkdown>{segmentContent}</ReactMarkdown>
                    </Box>

                    {/* Card footer with navigation buttons - Fixed at bottom */}
                    <CardActions
                        sx={{
                            p: 2,
                            justifyContent: 'space-between',
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            flexShrink: 0,
                            backgroundColor: 'background.paper',
                        }}
                    >
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={handlePrevious}
                            disabled={currentSlideIndex === 0}
                            variant="outlined"
                        >
                            Previous
                        </Button>

                        {fullscreen && (
                            <Button onClick={onClose} color="inherit">
                                Close
                            </Button>
                        )}

                        <Button
                            endIcon={<ArrowForward />}
                            onClick={handleNext}
                            disabled={currentSlideIndex === segments.length - 1}
                            variant="contained"
                        >
                            Next
                        </Button>
                    </CardActions>
                </Card>
            </Box>

            {/* Footer Area - Fixed */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 1,
                    gap: 0.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    flexWrap: 'wrap',
                    flexShrink: 0,
                    backgroundColor: 'background.paper',
                }}
            >
                {segments.map((_, index) => (
                    <Box
                        key={index}
                        onClick={() => setCurrentSlideIndex(index)}
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: index === currentSlideIndex ? 'primary.main' : 'grey.300',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                            '&:hover': {
                                bgcolor: index === currentSlideIndex ? 'primary.main' : 'grey.400',
                            },
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
};

export default ModuleContentSlideshow;

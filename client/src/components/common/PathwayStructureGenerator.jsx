import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Typography,
    Box,
    Alert,
    Divider,
    Paper,
    Tooltip,
    IconButton,
    Grid
} from '@mui/material';
import {
    AutoAwesome,
    Add,
    Upload,
    Delete,
    Info
} from '@mui/icons-material';
import ApiService from '../../services/ApiService';

// Component for generating a pathway structure using AI
const PathwayStructureGenerator = ({
    pathwayId,
    pathwayData,
    onGenerated,
    buttonVariant = 'contained',
    buttonSize = 'medium',
    buttonStartIcon = <AutoAwesome />,
    buttonText = 'Generate Structure with AI'
}) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userPrompt, setUserPrompt] = useState('');
    const [generatedStructure, setGeneratedStructure] = useState(null);
    const [attachedFiles, setAttachedFiles] = useState([]);

    const handleOpen = () => {
        setOpen(true);
        setUserPrompt('');
        setGeneratedStructure(null);
        setError('');
        setAttachedFiles([]);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handlePromptChange = (event) => {
        setUserPrompt(event.target.value);
    };

    const handleFileUpload = (event) => {
        const fileList = event.target.files;
        if (fileList && fileList.length > 0) {
            const newFiles = Array.from(fileList).map(file => ({
                name: file.name,
                file
            }));

            // Read file contents
            newFiles.forEach(fileObj => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setAttachedFiles(prev => {
                        const updatedFiles = [...prev];
                        const fileIndex = updatedFiles.findIndex(f => f.name === fileObj.name);

                        if (fileIndex >= 0) {
                            updatedFiles[fileIndex] = {
                                ...updatedFiles[fileIndex],
                                content: e.target.result
                            };
                        } else {
                            updatedFiles.push({
                                name: fileObj.name,
                                file: fileObj.file,
                                content: e.target.result
                            });
                        }

                        return updatedFiles;
                    });
                };
                reader.readAsText(fileObj.file);
            });
        }
    };

    const removeFile = (fileName) => {
        setAttachedFiles(prev => prev.filter(file => file.name !== fileName));
    };

    const handleGenerate = async () => {
        if (!userPrompt.trim()) {
            setError('Please enter a prompt to guide the AI generation');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Prepare files for API call
            const filesForApi = attachedFiles.map(file => ({
                name: file.name,
                content: file.content
            }));

            const response = await ApiService.generatePathwayStructure(
                pathwayId,
                userPrompt,
                filesForApi,
                false // Don't auto-apply
            );

            setGeneratedStructure(response.results);
        } catch (err) {
            setError(err.response?.data?.message || 'Error generating pathway structure');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        console.log('Apply clicked, generatedStructure:', generatedStructure);
        if (!generatedStructure) {
            console.warn('No structure to apply');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Use ApiService instead of direct axios
            const response = await ApiService.applyPathwayStructure(pathwayId, generatedStructure);

            // Extract changes data if available
            const changes = response.changes || { created: 0, updated: 0, deleted: 0 };
            const successMessage = `Structure applied successfully! Created ${changes.created} modules, updated ${changes.updated} modules, and deleted ${changes.deleted} modules.`;

            // Call the onGenerated callback
            onGenerated(generatedStructure, successMessage);
            handleClose();
        } catch (err) {
            console.error('Apply error:', err);
            setError(err.response?.data?.message || 'Error applying pathway structure');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant={buttonVariant}
                color="primary"
                startIcon={buttonStartIcon}
                onClick={handleOpen}
                size={buttonSize}
            >
                {buttonText}
            </Button>

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    Generate Pathway Structure with AI
                </DialogTitle>

                <DialogContent dividers>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Describe what you want in this pathway:
                        </Typography>

                        <TextField
                            value={userPrompt}
                            onChange={handlePromptChange}
                            placeholder="E.g., 'Create a learning pathway for beginner JavaScript developers covering fundamentals, DOM manipulation, and async programming'"
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            disabled={loading}
                        />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            Attach Context Files
                            <Tooltip title="Upload files with content you want included in your pathway. The AI will analyze these files and incorporate relevant concepts.">
                                <IconButton size="small">
                                    <Info fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Upload />}
                                component="label"
                                disabled={loading}
                            >
                                Upload Files
                                <input
                                    type="file"
                                    hidden
                                    multiple
                                    onChange={handleFileUpload}
                                />
                            </Button>
                        </Box>

                        {attachedFiles.length > 0 && (
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Attached Files ({attachedFiles.length})
                                </Typography>

                                <Grid container spacing={1}>
                                    {attachedFiles.map((file) => (
                                        <Grid item xs={12} sm={6} md={4} key={file.name}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    p: 1,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    borderRadius: 1
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        maxWidth: '80%',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {file.name}
                                                </Typography>

                                                <IconButton
                                                    size="small"
                                                    onClick={() => removeFile(file.name)}
                                                    disabled={loading}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        )}
                    </Box>

                    {generatedStructure && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Generated Pathway Structure:
                            </Typography>

                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Summary
                                </Typography>
                                <Typography variant="body2">
                                    {generatedStructure.summary}
                                </Typography>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Modules ({generatedStructure.modules?.length || 0})
                                </Typography>

                                <Box
                                    sx={{
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        fontFamily: 'monospace',
                                        fontSize: '0.8rem',
                                        backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                        p: 2,
                                        whiteSpace: 'pre-wrap'
                                    }}
                                >
                                    {JSON.stringify(generatedStructure.modules, null, 2)}
                                </Box>
                            </Paper>
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
                        {generatedStructure && (
                            <Button
                                onClick={handleApply}
                                variant="contained"
                                color="success"
                                sx={{ mr: 1 }}
                            >
                                Apply Structure
                            </Button>
                        )}

                        <Button
                            onClick={handleGenerate}
                            variant="contained"
                            color="primary"
                            startIcon={<AutoAwesome />}
                            disabled={loading || !userPrompt.trim()}
                        >
                            {loading ? (
                                <>
                                    <CircularProgress size={24} sx={{ mr: 1 }} />
                                    Generating...
                                </>
                            ) : (
                                'Generate Structure'
                            )}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PathwayStructureGenerator;

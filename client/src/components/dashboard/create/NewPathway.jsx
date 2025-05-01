import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../../context/AuthContext';
import axios from 'axios';
import {
    Typography,
    Box,
    TextField,
    Button,
    Paper,
    Alert,
    Stack,
    CircularProgress
} from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';
import AIGeneration from '../../common/AIGeneration';

const NewPathway = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        goal: '',
        requirements: '',
        targetAudience: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { title, description, goal, requirements, targetAudience } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!title || !description) {
            setError('Title and description are required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/pathways`,
                formData,
                config
            );

            // Navigate to the newly created pathway
            navigate(`/dashboard/create/pathway/${res.data.pathway._id}`);
        } catch (err) {
            console.error('Error creating pathway:', err);
            setError(
                err.response?.data?.message ||
                'Failed to create pathway. Please try again.'
            );
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" component="h1" gutterBottom>
                Create New Learning Pathway
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Box component="form" onSubmit={onSubmit} noValidate>
                <Stack spacing={3}>
                    <TextField
                        label="Title"
                        name="title"
                        value={title}
                        onChange={onChange}
                        required
                        fullWidth
                        variant="outlined"
                        placeholder="Enter a descriptive title for your learning pathway"
                    />

                    <TextField
                        label="Description"
                        name="description"
                        value={description}
                        onChange={onChange}
                        required
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        placeholder="Describe what learners will achieve through this pathway (supports markdown)"
                        helperText="Supports markdown syntax"
                    />

                    <TextField
                        label="Goal"
                        name="goal"
                        value={goal}
                        onChange={onChange}
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        placeholder="What is the end goal of this learning pathway? (supports markdown)"
                        helperText="Supports markdown syntax"
                    />

                    <TextField
                        label="Requirements"
                        name="requirements"
                        value={requirements}
                        onChange={onChange}
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        placeholder="What should learners know before starting this pathway? (supports markdown)"
                        helperText="Supports markdown syntax"
                    />

                    <TextField
                        label="Target Audience"
                        name="targetAudience"
                        value={targetAudience}
                        onChange={onChange}
                        fullWidth
                        variant="outlined"
                        placeholder="Who is this pathway designed for?"
                    />

                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Create Pathway'}
                        </Button>
                        <AIGeneration
                            type="pathway"
                            id="new" // Not saved yet, but we'll still use the component
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
                            onClick={() => navigate('/dashboard/create/my-pathways')}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
};

export default NewPathway;

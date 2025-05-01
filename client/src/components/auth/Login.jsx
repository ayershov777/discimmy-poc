import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate, Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    Link,
    Stack
} from '@mui/material';

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { email, password } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login({ email, password });
        setLoading(false);

        if (!result.success) {
            setError(result.message);
        } else {
            navigate('/dashboard');
        }
    };

    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: 'background.default'
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        borderRadius: 2
                    }}
                >
                    <Typography variant="h4" component="h1" align="center" gutterBottom>
                        Sign In
                    </Typography>

                    <Typography
                        variant="subtitle1"
                        align="center"
                        sx={{ mb: 3 }}
                    >
                        Access Your Account
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={onSubmit}>
                        <Stack spacing={2}>
                            <TextField
                                label="Email"
                                type="email"
                                name="email"
                                variant="outlined"
                                fullWidth
                                value={email}
                                onChange={onChange}
                                required
                            />

                            <TextField
                                label="Password"
                                type="password"
                                name="password"
                                variant="outlined"
                                fullWidth
                                value={password}
                                onChange={onChange}
                                required
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={loading}
                                sx={{ mt: 2 }}
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </Stack>
                    </Box>

                    <Typography
                        variant="body2"
                        align="center"
                        sx={{ mt: 3 }}
                    >
                        Don't have an account?{' '}
                        <Link component={RouterLink} to="/register" underline="hover">
                            Register
                        </Link>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;

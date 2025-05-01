import React, { useState, useContext } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './Auth.css';

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

    const onChange = e =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
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
        <div className="auth-container">
            <div className="auth-card">
                <h1>Sign In</h1>
                <p className="auth-subtitle">Access Your Account</p>

                {error && <div className="error-message">{error}</div>}

                <form className="auth-form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p className="auth-redirect">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { username, email, password, password2 } = formData;

    const onChange = e =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');

        if (password !== password2) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        const result = await register({ username, email, password });
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
                <h1>Register</h1>
                <p className="auth-subtitle">Create Your Account</p>

                {error && <div className="error-message">{error}</div>}

                <form className="auth-form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={onChange}
                            required
                        />
                    </div>

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
                            minLength="6"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password2">Confirm Password</label>
                        <input
                            type="password"
                            id="password2"
                            name="password2"
                            value={password2}
                            onChange={onChange}
                            minLength="6"
                            required
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p className="auth-redirect">
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;

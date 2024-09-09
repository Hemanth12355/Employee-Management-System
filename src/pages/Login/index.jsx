import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await axios.post('http://192.168.0.111:8080/users/validate', { email, password });
      const user = response.data;

      if (!user) {
        setError('Email or password is incorrect');
        return;
      }

      console.log('User logged in:', user);
      if (!user.role) {
        throw new Error('User role is undefined');
      }
      
      switch (user.role) {
        case 'Super User':
          navigate('/super-admin', { state: { loggedInUser: user } });
          break;
        case 'Admin':
          navigate('/admin', { state: { loggedInUser: user } });
          break;
        case 'User':
          navigate('/employee', { state: { loggedInUser: user } });
          break;
        default:
          setError('Access denied: Not a Super Admin, Admin, or Employee');
      }
    } catch (error) {
      console.error('Login failed:', error.message);
      setError(error.response?.data?.message || 'An error occurred during login');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;

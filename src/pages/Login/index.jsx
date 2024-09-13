import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import axios from 'axios';
import { motion } from 'framer-motion';

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

  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 120,
        damping: 10
      }
    }
  };

  const inputVariants = {
    focus: { scale: 1.05 },
    blur: { scale: 1 }
  };

  return (
    <div className="login-page-background">
      <motion.div 
        className="login-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <form className="login-form" onSubmit={handleSubmit}>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Login
          </motion.h2>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <motion.input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              variants={inputVariants}
              whileFocus="focus"
              whileBlur="blur"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <motion.input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              variants={inputVariants}
              whileFocus="focus"
              whileBlur="blur"
            />
          </div>
          <motion.button 
            type="submit"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Login
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;

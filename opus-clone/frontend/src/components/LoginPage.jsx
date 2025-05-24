import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'; // Fallback for safety

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { // Updated URL
        email,
        password,
      });
      
      setMessage(res.data.message || 'Login successful!');
      if (res.data.token) {
        localStorage.setItem('token', res.data.token); // Store JWT in localStorage
        console.log('JWT stored in localStorage:', res.data.token);
      }
      setFormData({ email: '', password: '' }); // Clear form
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.request) {
        setError('No response from server. Please try again later.');
      } else {
        setError('Login failed. Please try again.');
      }
      console.error('Login error:', err);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Login</h2>
      {message && <p style={{ ...styles.message, ...styles.successMessage }}>{message}</p>}
      {error && <p style={{ ...styles.message, ...styles.errorMessage }}>{error}</p>}
      <form onSubmit={onSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={onChange}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="password" style={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={onChange}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>Login</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#28a745', // Green color for login
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  message: {
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '4px',
    textAlign: 'center',
  },
  successMessage: {
    color: '#155724',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
  },
  errorMessage: {
    color: '#721c24',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
  },
};

export default LoginPage;

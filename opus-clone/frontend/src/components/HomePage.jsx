import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to Opus Clone</h1>
      <p style={styles.subtitle}>Your collaborative workspace.</p>
      <div style={styles.nav}>
        <Link to="/login" style={styles.link}>Login</Link>
        <span style={styles.separator}>|</span>
        <Link to="/register" style={styles.link}>Register</Link>
      </div>
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
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5em',
    color: '#333',
    marginBottom: '20px',
  },
  subtitle: {
    fontSize: '1.2em',
    color: '#555',
    marginBottom: '30px',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
  },
  link: {
    margin: '0 15px',
    padding: '10px 20px',
    textDecoration: 'none',
    color: '#fff',
    backgroundColor: '#007bff',
    borderRadius: '5px',
    fontSize: '1em',
    transition: 'background-color 0.3s ease',
  },
  separator: {
    fontSize: '1.2em',
    color: '#ccc',
  },
};

export default HomePage;

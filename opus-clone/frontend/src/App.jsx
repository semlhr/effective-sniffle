import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardPage from './components/DashboardPage';
import './App.css';

// Simple authentication check
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <nav style={styles.navbar}>
        <Link to="/" style={styles.navLink}>Home</Link>
        {!isAuthenticated() && <Link to="/login" style={styles.navLink}>Login</Link>}
        {!isAuthenticated() && <Link to="/register" style={styles.navLink}>Register</Link>}
        {isAuthenticated() && <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>}
      </nav>
      <div style={styles.container}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          {/* Optional: Redirect to home for any other path */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'center',
    padding: '10px 20px',
    backgroundColor: '#333',
    marginBottom: '20px',
  },
  navLink: {
    color: 'white',
    margin: '0 15px',
    textDecoration: 'none',
    fontSize: '1.1em',
  },
  container: {
    padding: '20px',
  }
};

export default App;

import React from 'react';

const DashboardPage = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    // For a real app, you'd likely redirect to login or home:
    // window.location.href = '/login'; 
    alert('Logged out! (Token removed, please refresh or navigate away)');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to your Dashboard!</h1>
      <p style={styles.text}>This is a protected area.</p>
      <button onClick={handleLogout} style={styles.button}>Logout</button>
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
    backgroundColor: '#e9ecef',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    padding: '20px',
  },
  title: {
    fontSize: '2em',
    color: '#343a40',
    marginBottom: '20px',
  },
  text: {
    fontSize: '1.1em',
    color: '#495057',
    marginBottom: '30px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1em',
    color: '#fff',
    backgroundColor: '#dc3545', // Red for logout
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  }
};

export default DashboardPage;

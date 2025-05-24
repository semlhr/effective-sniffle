import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // for expect(...).toBeInTheDocument() etc.
import axios from 'axios'; // This will be the mock from src/__mocks__/axios.js
import RegisterPage from '../components/RegisterPage';
import LoginPage from '../components/LoginPage';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

jest.mock('axios'); // Ensures we use the mock from src/__mocks__/axios.js

describe('RegisterPage Integration Tests', () => {
  beforeEach(() => {
    axios.post.mockClear();
    localStorageMock.clear();
    // Clear any messages from previous tests if they persist in the component's module scope
    // This is a bit of a workaround for how messages are handled in the component
    // A better approach would be for the component to reset messages on new submissions.
    render(<RegisterPage />); 
    const usernameInput = screen.getByLabelText(/username/i);
    if (usernameInput.value !== '') fireEvent.change(usernameInput, {target: {value: ''}}); 
  });

  test('renders registration form correctly', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('successful registration displays success message and clears form', async () => {
    axios.post.mockResolvedValueOnce({
      data: { message: 'User registered successfully!' },
      status: 201,
    });

    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText('User registered successfully!')).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/username/i).value).toBe('');
    expect(screen.getByLabelText(/email/i).value).toBe('');
    expect(screen.getByLabelText(/password/i).value).toBe('');
  });

  test('registration failure (user exists) displays error message', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: { message: 'User with this email already exists.' },
        status: 409,
      },
    });

    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'existinguser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText('User with this email already exists.')).toBeInTheDocument();
    });
  });

  test('client-side password too short validation', async () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '123' } }); // Short password
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long.')).toBeInTheDocument();
    });
    expect(axios.post).not.toHaveBeenCalled();
  });
});

describe('LoginPage Integration Tests', () => {
  beforeEach(() => {
    axios.post.mockClear();
    localStorageMock.clear();
     render(<LoginPage />); 
    const emailInput = screen.getByLabelText(/email/i);
    if (emailInput.value !== '') fireEvent.change(emailInput, {target: {value: ''}}); 
  });

  test('renders login form correctly', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('successful login stores token and displays success message', async () => {
    const fakeToken = 'fake-jwt-token';
    axios.post.mockResolvedValueOnce({
      data: { message: 'Login successful!', token: fakeToken },
      status: 200,
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Login successful!')).toBeInTheDocument();
    });
    expect(localStorageMock.getItem('token')).toBe(fakeToken);
    expect(screen.getByLabelText(/email/i).value).toBe(''); // Form should clear
  });

  test('login failure displays error message', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: { message: 'Invalid credentials.' },
        status: 401,
      },
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials.')).toBeInTheDocument();
    });
    expect(localStorageMock.getItem('token')).toBeNull();
  });
});

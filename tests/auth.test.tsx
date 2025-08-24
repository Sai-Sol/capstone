import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from '@/contexts/auth-context';
import { useAuth } from '@/hooks/use-auth';
import { HARDCODED_USERS } from '@/lib/constants';

// Test component to use auth context
const TestComponent = () => {
  const { user, login, logout, register, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="user-status">
        {loading ? 'Loading' : user ? `Logged in as ${user.email}` : 'Not logged in'}
      </div>
      <button 
        data-testid="login-btn" 
        onClick={() => login({ email: 'admin@example.com', password: '456' })}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
      <button 
        data-testid="register-btn" 
        onClick={() => register({ 
          name: 'Test User', 
          email: 'test@example.com', 
          password: '123', 
          country: 'US' 
        })}
      >
        Register
      </button>
    </div>
  );
};

describe('Authentication System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with no user when localStorage is empty', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
  });

  it('should login with valid credentials', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as admin@example.com');
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'quantum-user',
      expect.stringContaining('admin@example.com')
    );
  });

  it('should logout and clear user data', async () => {
    // Set up logged in state
    localStorage.setItem('quantum-user', JSON.stringify({
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin'
    }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('logout-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith('quantum-user');
  });

  it('should register new user', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('register-btn'));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'quantum-users-db',
        expect.stringContaining('test@example.com')
      );
    });
  });

  it('should restore user from localStorage on mount', () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    };
    
    localStorage.getItem.mockReturnValue(JSON.stringify(userData));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as test@example.com');
  });

  it('should handle corrupted localStorage data', () => {
    localStorage.getItem.mockReturnValue('invalid-json');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
  });
});
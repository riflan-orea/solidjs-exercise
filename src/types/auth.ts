/**
 * ============================================================================
 * AUTH TYPES - Type definitions for authentication
 * ============================================================================
 *
 * This file contains TypeScript interfaces and types used throughout
 * the authentication system. Defining types separately helps with:
 * - Code reusability across components
 * - Better IDE autocompletion
 * - Catching type errors at compile time
 */

/**
 * User interface - represents an authenticated user
 * In a real application, this would include more fields like:
 * - profile picture URL
 * - roles/permissions
 * - account creation date, etc.
 */
export interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Login credentials interface
 * Used when submitting the login form
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data interface
 * Extends login credentials with additional fields needed for signup
 */
export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

/**
 * Auth context type - defines the shape of our authentication context
 * This is what components will receive when they use the auth context
 */
export interface AuthContextType {
  // The current user (null if not logged in)
  user: () => User | null;

  // Loading state - true while checking auth status
  isLoading: () => boolean;

  // Helper to check if user is authenticated
  isAuthenticated: () => boolean;

  // Auth actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
}

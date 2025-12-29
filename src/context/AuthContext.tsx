/**
 * ============================================================================
 * AUTH CONTEXT - Global authentication state management
 * ============================================================================
 *
 * This file implements SolidJS Context API for managing authentication state.
 *
 * KEY SOLIDJS CONCEPTS DEMONSTRATED:
 *
 * 1. createContext() - Creates a context that can be provided to child components
 * 2. createSignal() - Creates reactive state (similar to React's useState)
 * 3. createEffect() - Runs side effects when dependencies change
 * 4. useContext() - Consumes context in child components
 *
 * WHY USE CONTEXT FOR AUTH?
 * - Auth state needs to be accessible throughout the entire app
 * - Many components need to know if user is logged in
 * - Avoids "prop drilling" (passing props through many levels)
 */

import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  JSX,
} from "solid-js";
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthContextType,
} from "../types/auth";

/**
 * Create the Auth Context
 *
 * createContext<T | undefined>(undefined) creates a context with:
 * - Generic type T (AuthContextType in our case)
 * - Default value of undefined (will be provided by AuthProvider)
 *
 * The context acts as a "channel" for passing data through the component tree
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props interface for AuthProvider component
 * JSX.Element represents any valid SolidJS JSX element
 */
interface AuthProviderProps {
  children: JSX.Element;
}

/**
 * SIMULATED USER DATABASE
 *
 * In a real application, this would be replaced with API calls to your backend.
 * We're using a simple Map to simulate user storage for learning purposes.
 *
 * Map<email, { user data + password }>
 */
const mockUserDatabase = new Map<
  string,
  { user: User; password: string }
>();

// Add a demo user for testing
mockUserDatabase.set("demo@example.com", {
  user: {
    id: "1",
    email: "demo@example.com",
    name: "Demo User",
  },
  password: "password123",
});

/**
 * LOCAL STORAGE KEY
 * Used to persist user session across browser refreshes
 */
const AUTH_STORAGE_KEY = "solidjs_auth_user";

/**
 * AuthProvider Component
 *
 * This component wraps your app and provides authentication state
 * to all child components. It's similar to React's Context.Provider.
 *
 * USAGE:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider(props: AuthProviderProps) {
  /**
   * createSignal() - SolidJS's reactive primitive
   *
   * Unlike React's useState which returns [value, setter],
   * SolidJS returns [getter, setter] where getter is a FUNCTION.
   *
   * This is because SolidJS uses fine-grained reactivity:
   * - Only components that call user() will re-render when user changes
   * - The getter function creates a "subscription" to the signal
   */
  const [user, setUser] = createSignal<User | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);

  /**
   * createEffect() - Runs side effects when dependencies change
   *
   * This effect runs:
   * 1. Once on component mount (initial render)
   * 2. Whenever any signal accessed inside it changes
   *
   * Here we use it to check localStorage for existing session on app load
   *
   * Note: We're not accessing any signals inside, so it only runs once
   */
  createEffect(() => {
    // Check if user is already logged in (from previous session)
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

    if (storedUser) {
      try {
        // Parse stored user data
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
      } catch (error) {
        // Invalid stored data, clear it
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }

    // Done checking auth status
    setIsLoading(false);
  });

  /**
   * Login function - authenticates user with email/password
   *
   * In a real app, this would:
   * 1. Send credentials to your backend API
   * 2. Receive a JWT token or session cookie
   * 3. Store the token securely
   *
   * Returns: Promise<boolean> - true if login successful
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    // Simulate network delay (remove in production)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user exists in our mock database
    const storedData = mockUserDatabase.get(credentials.email);

    if (storedData && storedData.password === credentials.password) {
      // Login successful!
      setUser(storedData.user);

      // Persist user to localStorage for session persistence
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storedData.user));

      return true;
    }

    // Login failed
    return false;
  };

  /**
   * Register function - creates a new user account
   *
   * In a real app, this would:
   * 1. Validate input (email format, password strength)
   * 2. Send data to backend API
   * 3. Handle email verification
   *
   * Returns: Promise<boolean> - true if registration successful
   */
  const register = async (data: RegisterData): Promise<boolean> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if email already exists
    if (mockUserDatabase.has(data.email)) {
      return false; // Email already registered
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(), // Simple ID generation
      email: data.email,
      name: data.name,
    };

    // Store in mock database
    mockUserDatabase.set(data.email, {
      user: newUser,
      password: data.password,
    });

    // Auto-login after registration
    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));

    return true;
  };

  /**
   * Logout function - clears user session
   *
   * In a real app, this might also:
   * 1. Invalidate the session on the server
   * 2. Clear any cached data
   * 3. Redirect to login page
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  /**
   * isAuthenticated - derived state
   *
   * This is a "computed" value that depends on user signal.
   * It returns true if user is not null.
   *
   * Because it's a function that calls user(), it will automatically
   * update whenever user changes - this is SolidJS's fine-grained reactivity!
   */
  const isAuthenticated = () => user() !== null;

  /**
   * Context Value
   *
   * This object contains all the auth state and methods that will be
   * available to any component that uses useAuth()
   */
  const authContextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  /**
   * AuthContext.Provider
   *
   * Wraps children and makes authContextValue available to all descendants.
   * Any component in the tree can access this using useContext(AuthContext)
   */
  return (
    <AuthContext.Provider value={authContextValue}>
      {props.children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook - Custom hook to access auth context
 *
 * This is a convenience wrapper around useContext that:
 * 1. Provides type safety
 * 2. Throws a helpful error if used outside AuthProvider
 *
 * USAGE IN COMPONENTS:
 * const { user, login, logout } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  // Ensure the hook is used within AuthProvider
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

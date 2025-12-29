/**
 * ============================================================================
 * LOGIN PAGE - User authentication form
 * ============================================================================
 *
 * This component demonstrates:
 * 1. Form handling in SolidJS
 * 2. Using createSignal for form state
 * 3. Async operations with loading states
 * 4. Error handling and user feedback
 * 5. Programmatic navigation after login
 */

import { createSignal, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@suid/material";
import { useAuth } from "../context/AuthContext";

/**
 * Login Page Component
 *
 * Renders a login form and handles user authentication.
 * Redirects to dashboard on successful login.
 */
export function Login() {
  /**
   * Form State using createSignal
   *
   * Each form field gets its own signal. This is SolidJS's approach
   * to controlled form inputs. When the signal updates, only the
   * specific parts of the DOM that use it will update (fine-grained reactivity).
   */
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");

  /**
   * UI State
   *
   * isSubmitting: tracks if form submission is in progress
   * error: holds error message to display to user
   */
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal("");

  // Get login function from auth context
  const { login } = useAuth();

  // Navigation hook for redirecting after login
  const navigate = useNavigate();

  /**
   * Form Submit Handler
   *
   * Handles the login form submission:
   * 1. Prevents default form behavior
   * 2. Validates input
   * 3. Calls login function
   * 4. Handles success/error
   *
   * @param e - Form submit event
   */
  const handleSubmit = async (e: Event) => {
    // Prevent default form submission (which would reload the page)
    e.preventDefault();

    // Clear any previous errors
    setError("");

    // Basic validation
    if (!email() || !password()) {
      setError("Please fill in all fields");
      return;
    }

    // Start loading state
    setIsSubmitting(true);

    try {
      /**
       * Call the login function from AuthContext
       *
       * This is an async operation that:
       * 1. Validates credentials against our mock database
       * 2. Updates the auth state if successful
       * 3. Returns true/false indicating success
       */
      const success = await login({
        email: email(),
        password: password(),
      });

      if (success) {
        // Login successful - redirect to dashboard
        navigate("/dashboard");
      } else {
        // Login failed - show error
        setError("Invalid email or password");
      }
    } catch (err) {
      // Unexpected error (network issues, etc.)
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      // Always stop loading state, even if there was an error
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ marginBottom: 3 }}
        >
          Enter your credentials to access your account
        </Typography>

        {/**
         * Error Alert
         *
         * Show component conditionally renders the Alert only when
         * there's an error message. This is cleaner than using
         * {error() && <Alert>...</Alert>}
         */}
        <Show when={error()}>
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error()}
          </Alert>
        </Show>

        {/**
         * Login Form
         *
         * Using native form element with onSubmit handler.
         * This approach:
         * - Enables form submission with Enter key
         * - Better accessibility
         * - Works with browser autofill
         */}
        <Box component="form" onSubmit={handleSubmit}>
          {/**
           * TextField - Material UI's input component
           *
           * Key props:
           * - fullWidth: spans container width
           * - label: floating label text
           * - type: input type (text, email, password, etc.)
           * - value: current value (from signal getter)
           * - onChange: update handler (calls signal setter)
           * - disabled: prevents interaction during submission
           * - required: HTML5 validation
           *
           * Note: We use e.currentTarget.value to get the input value.
           * currentTarget is the element the event handler is attached to.
           */}
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email()}
            onChange={(e) => setEmail(e.currentTarget.value)}
            disabled={isSubmitting()}
            required
            sx={{ marginBottom: 2 }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password()}
            onChange={(e) => setPassword(e.currentTarget.value)}
            disabled={isSubmitting()}
            required
            sx={{ marginBottom: 3 }}
          />

          {/**
           * Submit Button
           *
           * - type="submit" triggers form submission
           * - Shows loading spinner when submitting
           * - Disabled during submission to prevent double-submit
           */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isSubmitting()}
            sx={{ marginBottom: 2 }}
          >
            <Show when={isSubmitting()} fallback="Login">
              {/**
               * Loading state
               * Shows spinner and "Logging in..." text
               */}
              <CircularProgress size={20} color="inherit" sx={{ marginRight: 1 }} />
              Logging in...
            </Show>
          </Button>
        </Box>

        {/**
         * Registration Link
         *
         * Provides navigation to register page for new users.
         * Using A component from @solidjs/router for client-side navigation.
         */}
        <Typography variant="body2" align="center">
          Don't have an account?{" "}
          <A
            href="/register"
            style={{
              color: "#1976d2",
              "text-decoration": "none",
            }}
          >
            Register here
          </A>
        </Typography>

        {/**
         * Demo Credentials Hint
         */}
        <Paper
          variant="outlined"
          sx={{
            padding: 2,
            marginTop: 3,
            backgroundColor: "grey.50",
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            <strong>Demo Account:</strong> demo@example.com / password123
          </Typography>
        </Paper>
      </Paper>
    </Container>
  );
}

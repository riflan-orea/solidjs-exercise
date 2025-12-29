/**
 * ============================================================================
 * REGISTER PAGE - New user registration form
 * ============================================================================
 *
 * This component demonstrates:
 * 1. Multi-field form handling
 * 2. Password confirmation validation
 * 3. Form validation patterns
 * 4. Registration flow with auto-login
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
 * Register Page Component
 *
 * Provides a registration form for new users.
 * After successful registration, automatically logs in the user
 * and redirects to the dashboard.
 */
export function Register() {
  /**
   * Form State
   *
   * Each field has its own signal for fine-grained reactivity.
   * Changes to one field won't trigger re-renders for other fields.
   */
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");

  /**
   * UI State
   */
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal("");

  const { register } = useAuth();
  const navigate = useNavigate();

  /**
   * Validate Form Input
   *
   * Performs client-side validation before submitting.
   * Returns an error message string, or empty string if valid.
   *
   * Note: In a real app, you'd also validate on the server!
   * Client-side validation is for UX, server-side is for security.
   */
  const validateForm = (): string => {
    // Check all fields are filled
    if (!name() || !email() || !password() || !confirmPassword()) {
      return "Please fill in all fields";
    }

    // Validate name length
    if (name().length < 2) {
      return "Name must be at least 2 characters";
    }

    // Basic email validation (regex pattern)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email())) {
      return "Please enter a valid email address";
    }

    // Password strength validation
    if (password().length < 6) {
      return "Password must be at least 6 characters";
    }

    // Password confirmation match
    if (password() !== confirmPassword()) {
      return "Passwords do not match";
    }

    // All validations passed
    return "";
  };

  /**
   * Form Submit Handler
   */
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    // Run validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      /**
       * Call register function from AuthContext
       *
       * If successful, the user is automatically logged in
       * (handled in AuthContext.register)
       */
      const success = await register({
        name: name(),
        email: email(),
        password: password(),
      });

      if (success) {
        // Registration successful - redirect to dashboard
        navigate("/dashboard");
      } else {
        // Registration failed (usually means email already exists)
        setError("An account with this email already exists");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create Account
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ marginBottom: 3 }}
        >
          Fill in your details to create a new account
        </Typography>

        {/* Error Alert */}
        <Show when={error()}>
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error()}
          </Alert>
        </Show>

        {/* Registration Form */}
        <Box component="form" onSubmit={handleSubmit}>
          {/**
           * Name Field
           *
           * Using type="text" for general text input.
           * The 'autoComplete' attribute helps browsers provide
           * appropriate autofill suggestions.
           */}
          <TextField
            fullWidth
            label="Full Name"
            type="text"
            value={name()}
            onChange={(e) => setName(e.currentTarget.value)}
            disabled={isSubmitting()}
            required
            autoComplete="name"
            sx={{ marginBottom: 2 }}
          />

          {/**
           * Email Field
           *
           * type="email" provides:
           * - Mobile keyboards show @ symbol
           * - Basic browser validation
           * - Appropriate autofill
           */}
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email()}
            onChange={(e) => setEmail(e.currentTarget.value)}
            disabled={isSubmitting()}
            required
            autoComplete="email"
            sx={{ marginBottom: 2 }}
          />

          {/**
           * Password Field
           *
           * type="password" hides input characters.
           * autoComplete="new-password" tells browsers this is
           * for a new password (vs logging into existing account).
           */}
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password()}
            onChange={(e) => setPassword(e.currentTarget.value)}
            disabled={isSubmitting()}
            required
            autoComplete="new-password"
            helperText="Must be at least 6 characters"
            sx={{ marginBottom: 2 }}
          />

          {/**
           * Confirm Password Field
           *
           * Used to prevent typos in password.
           * We validate that this matches the password field.
           */}
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword()}
            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
            disabled={isSubmitting()}
            required
            autoComplete="new-password"
            sx={{ marginBottom: 3 }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isSubmitting()}
            sx={{ marginBottom: 2 }}
          >
            <Show when={isSubmitting()} fallback="Create Account">
              <CircularProgress size={20} color="inherit" sx={{ marginRight: 1 }} />
              Creating account...
            </Show>
          </Button>
        </Box>

        {/* Login Link */}
        <Typography variant="body2" align="center">
          Already have an account?{" "}
          <A
            href="/login"
            style={{
              color: "#1976d2",
              "text-decoration": "none",
            }}
          >
            Login here
          </A>
        </Typography>
      </Paper>
    </Container>
  );
}

/**
 * ============================================================================
 * HOME PAGE - Landing page for the application
 * ============================================================================
 *
 * This component demonstrates:
 * 1. Basic page structure with Material UI
 * 2. Conditional content based on auth status
 * 3. Using navigation links
 */

import { Show } from "solid-js";
import { A } from "@solidjs/router";
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  Stack,
} from "@suid/material";
import { useAuth } from "../context/AuthContext";

/**
 * Home Page Component
 *
 * The landing page visitors see when they first visit the app.
 * Shows different content based on whether user is logged in.
 */
export function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    /**
     * Container - Responsive centered container
     *
     * maxWidth="md" - Limits width to "medium" breakpoint
     * This ensures content is readable and not too wide on large screens
     */
    <Container maxWidth="md">
      {/**
       * Paper - Elevated surface (card-like appearance)
       *
       * elevation={3} - Shadow depth (0-24)
       * sx prop - Style system for responsive styling
       */}
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        {/**
         * Typography variants:
         * - h3: Large heading
         * - h5: Medium heading
         * - body1: Regular paragraph text
         *
         * gutterBottom - Adds margin below the element
         */}
        <Typography variant="h3" gutterBottom align="center">
          Welcome to SolidJS Auth Demo
        </Typography>

        <Typography variant="h5" color="text.secondary" align="center" gutterBottom>
          A learning project for SolidJS authentication patterns
        </Typography>

        {/**
         * Conditional rendering based on auth status
         * Shows personalized content for logged-in users
         */}
        <Show
          when={isAuthenticated()}
          fallback={
            /**
             * Guest Content
             * Shown to visitors who are not logged in
             */
            <Box sx={{ marginTop: 4 }}>
              <Typography variant="body1" paragraph>
                This project demonstrates:
              </Typography>

              {/**
               * Stack - Flexbox layout component
               *
               * spacing={1} - Gap between items
               * sx={{ marginLeft: 2 }} - Left padding for list appearance
               */}
              <Stack spacing={1} sx={{ marginLeft: 2, marginBottom: 3 }}>
                <Typography>• SolidJS reactive primitives (signals, effects)</Typography>
                <Typography>• Context API for global state management</Typography>
                <Typography>• @solidjs/router for page navigation</Typography>
                <Typography>• SUID (Material UI) for beautiful components</Typography>
                <Typography>• Protected routes for authenticated pages</Typography>
                <Typography>• Form handling and validation</Typography>
              </Stack>

              <Typography variant="body1" paragraph>
                Get started by creating an account or logging in with the demo account:
              </Typography>

              {/**
               * Demo credentials box
               * Styled to stand out with a different background
               */}
              <Paper
                variant="outlined"
                sx={{
                  padding: 2,
                  backgroundColor: "grey.100",
                  marginBottom: 3,
                }}
              >
                <Typography variant="body2">
                  <strong>Demo Account:</strong>
                </Typography>
                <Typography variant="body2">
                  Email: demo@example.com
                </Typography>
                <Typography variant="body2">
                  Password: password123
                </Typography>
              </Paper>

              {/**
               * Action buttons
               * Stack with row direction creates horizontal button group
               */}
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  component={A}
                  href="/login"
                  size="large"
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  component={A}
                  href="/register"
                  size="large"
                >
                  Register
                </Button>
              </Stack>
            </Box>
          }
        >
          {/**
           * Authenticated User Content
           * Shown when user is logged in
           */}
          <Box sx={{ marginTop: 4, textAlign: "center" }}>
            <Typography variant="h5" gutterBottom>
              Hello, {user()?.name}! 👋
            </Typography>

            <Typography variant="body1" paragraph>
              You're logged in and ready to explore the dashboard.
            </Typography>

            <Button
              variant="contained"
              color="primary"
              component={A}
              href="/dashboard"
              size="large"
            >
              Go to Dashboard
            </Button>
          </Box>
        </Show>
      </Paper>

      {/**
       * Footer section with project info
       */}
      <Box sx={{ marginTop: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Built with SolidJS + Vite + SUID (Material UI)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Check the source code comments to learn how it works!
        </Typography>
      </Box>
    </Container>
  );
}

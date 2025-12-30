/**
 * ============================================================================
 * NAVBAR COMPONENT - Navigation bar with auth-aware links
 * ============================================================================
 *
 * This component demonstrates:
 * 1. Using @solidjs/router for navigation
 * 2. Consuming auth context with useAuth()
 * 3. Conditional rendering with Show component
 * 4. Using SUID (Material UI) components
 */

import { Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from "@suid/material";
import { useAuth } from "../context/AuthContext";

/**
 * Navbar Component
 *
 * Displays different navigation options based on authentication status:
 * - Logged out: Shows Login and Register buttons
 * - Logged in: Shows user name and Logout button
 */
export function Navbar() {
  /**
   * useAuth() - Access our authentication context
   *
   * Destructuring the values we need from the auth context.
   * These are reactive - components will update when they change!
   */
  const { user, isAuthenticated, logout } = useAuth();

  /**
   * useNavigate() - Programmatic navigation hook from @solidjs/router
   *
   * Returns a function that can be called to navigate to different routes.
   * Useful for navigating after actions (like logout)
   */
  const navigate = useNavigate();

  /**
   * Handle logout button click
   * Logs out the user and redirects to home page
   */
  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to home after logout
  };

  return (
    /**
     * SUID AppBar - Material UI's app bar component
     *
     * position="static" - Scrolls with the page (vs "fixed" which stays on top)
     * sx prop - Inline styles using Material UI's system
     */
    <AppBar position="static" sx={{ marginBottom: 2 }}>
      {/**
       * Toolbar - Container that properly spaces AppBar content
       */}
      <Toolbar>
        {/**
         * Typography - Material UI's text component
         *
         * variant="h6" - Uses heading 6 styling
         * component="div" - Renders as a div instead of default h6
         * sx={{ flexGrow: 1 }} - Takes up remaining space, pushing buttons right
         */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {/**
           * A component from @solidjs/router
           *
           * Similar to HTML <a> but handles client-side navigation.
           * Doesn't cause full page reload - just updates the view.
           */}
          <A
            href="/"
            style={{
              "text-decoration": "none",
              color: "inherit",
            }}
          >
            SolidJS Auth Demo
          </A>
        </Typography>

        {/**
         * Box - Material UI's generic container
         *
         * Used here to group navigation buttons with proper spacing
         */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {/**
           * Users Link - Always visible (public route)
           *
           * This demonstrates TanStack Query + Table functionality.
           * Accessible to all users, authenticated or not.
           */}
          <Button color="inherit" component={A} href="/users">
            Users
          </Button>

          {/**
           * Show Component - SolidJS's conditional rendering
           *
           * Unlike React where you use {condition && <Component />},
           * SolidJS provides the Show component for better performance.
           *
           * - when: condition to check
           * - fallback: what to render when condition is false
           *
           * Show only mounts/unmounts content when condition changes,
           * which is more efficient than recreating elements.
           */}
          <Show
            when={isAuthenticated()}
            fallback={
              <>
                {/* Guest Navigation - shown when NOT logged in */}
                <Button color="inherit" component={A} href="/login">
                  Login
                </Button>
                <Button color="inherit" component={A} href="/register">
                  Register
                </Button>
              </>
            }
          >
            {/* Authenticated Navigation - shown when logged in */}

            {/**
             * Display user's name
             *
             * user() is a getter function - must call it to get the value!
             * Using optional chaining (?.) since user could theoretically be null
             */}
            <Typography
              sx={{
                display: "flex",
                alignItems: "center",
                marginRight: 2,
              }}
            >
              Welcome, {user()?.name}!
            </Typography>

            <Button color="inherit" component={A} href="/dashboard">
              Dashboard
            </Button>

            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Show>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

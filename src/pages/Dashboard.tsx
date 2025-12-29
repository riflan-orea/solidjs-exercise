/**
 * ============================================================================
 * DASHBOARD PAGE - Protected user dashboard
 * ============================================================================
 *
 * This component demonstrates:
 * 1. Protected content (only accessible when logged in)
 * 2. Displaying user-specific data
 * 3. Using Material UI Grid for layouts
 * 4. Reactive data based on auth state
 *
 * Note: This page is wrapped with ProtectedRoute in App.tsx,
 * so we can assume the user is authenticated when this renders.
 */

import { createSignal, createEffect, For } from "solid-js";
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@suid/material";
import { useAuth } from "../context/AuthContext";

/**
 * Dashboard Page Component
 *
 * Displays a personalized dashboard for authenticated users.
 * Shows user information and some mock activity data.
 */
export function Dashboard() {
  const { user } = useAuth();

  /**
   * Mock activity data
   *
   * In a real app, this would come from an API.
   * Using createSignal to make it reactive (could be updated via API polling).
   */
  const [activities] = createSignal([
    { id: 1, action: "Logged in", timestamp: new Date().toLocaleString() },
    { id: 2, action: "Viewed dashboard", timestamp: new Date().toLocaleString() },
    { id: 3, action: "Profile created", timestamp: "Earlier today" },
  ]);

  /**
   * Mock statistics
   *
   * Example of derived/computed values that could update reactively.
   */
  const stats = [
    { label: "Profile Views", value: 42 },
    { label: "Tasks Completed", value: 15 },
    { label: "Days Active", value: 7 },
    { label: "Achievements", value: 3 },
  ];

  /**
   * createEffect for side effects
   *
   * This effect runs whenever user() changes.
   * In a real app, you might use this to:
   * - Fetch user-specific data from an API
   * - Track analytics events
   * - Initialize user preferences
   */
  createEffect(() => {
    const currentUser = user();
    if (currentUser) {
      console.log(`Dashboard loaded for user: ${currentUser.email}`);
      // In a real app: fetch user data, analytics, etc.
    }
  });

  return (
    <Container maxWidth="lg">
      {/**
       * Welcome Header
       *
       * Personalized greeting using the user's name from auth context.
       * Remember: user() is a getter function, must call it!
       */}
      <Box sx={{ marginTop: 4, marginBottom: 4 }}>
        <Typography variant="h3" gutterBottom>
          Welcome back, {user()?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your account today.
        </Typography>
      </Box>

      {/**
       * Grid Layout
       *
       * Material UI Grid uses a 12-column layout system.
       * - container: Makes this the grid container
       * - spacing: Gap between grid items (in theme spacing units)
       *
       * Child Grid items use:
       * - xs, sm, md, lg, xl: Column span at different breakpoints
       */}
      <Grid container spacing={3}>
        {/**
         * User Profile Card
         *
         * xs={12} md={4} means:
         * - Full width (12 cols) on extra-small screens
         * - 4 columns (1/3 width) on medium screens and up
         */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Your Profile
              </Typography>
              <Divider sx={{ marginBottom: 2 }} />

              {/**
               * Profile Information
               *
               * Displaying user data from auth context.
               * In a real app, this would include more fields.
               */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{user()?.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{user()?.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                    {user()?.id}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Paper>
        </Grid>

        {/**
         * Statistics Cards
         *
         * xs={12} md={8} - Takes remaining 8 columns on medium+ screens
         */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Quick Stats
              </Typography>
              <Divider sx={{ marginBottom: 2 }} />

              {/**
               * Nested Grid for Stats Cards
               *
               * This creates a 2x2 grid of stat cards within
               * the larger grid item.
               */}
              <Grid container spacing={2}>
                {/**
                 * For Component - SolidJS's list rendering
                 *
                 * Unlike React's .map(), SolidJS uses the For component.
                 * Benefits:
                 * - Better performance (doesn't re-render entire list)
                 * - Automatically handles keying
                 * - Each item callback receives (item, index) => JSX
                 *
                 * each={array} - The array to iterate over
                 * The callback receives item and index (as a function)
                 */}
                <For each={stats}>
                  {(stat) => (
                    <Grid item xs={6} sm={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: "center" }}>
                          <Typography
                            variant="h4"
                            color="primary"
                            sx={{ fontWeight: "bold" }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stat.label}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </For>
              </Grid>
            </CardContent>
          </Paper>
        </Grid>

        {/**
         * Recent Activity Section
         *
         * Full width on all screen sizes
         */}
        <Grid item xs={12}>
          <Paper elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Recent Activity
              </Typography>
              <Divider sx={{ marginBottom: 2 }} />

              {/**
               * Activity List
               *
               * List/ListItem components from Material UI
               * provide proper spacing and structure for lists.
               */}
              <List>
                <For each={activities()}>
                  {(activity) => (
                    <ListItem divider>
                      <ListItemText
                        primary={activity.action}
                        secondary={activity.timestamp}
                      />
                    </ListItem>
                  )}
                </For>
              </List>
            </CardContent>
          </Paper>
        </Grid>

        {/**
         * Learning Notes Section
         *
         * Additional educational content about the code
         */}
        <Grid item xs={12}>
          <Paper
            elevation={1}
            sx={{
              padding: 3,
              backgroundColor: "primary.light",
              color: "primary.contrastText",
            }}
          >
            <Typography variant="h6" gutterBottom>
              📚 Learning Notes
            </Typography>
            <Typography variant="body2" paragraph>
              This dashboard page demonstrates several SolidJS concepts:
            </Typography>
            <Box component="ul" sx={{ margin: 0, paddingLeft: 3 }}>
              <li>
                <Typography variant="body2">
                  <strong>Protected Routes:</strong> This page is wrapped with
                  ProtectedRoute, ensuring only authenticated users can access it.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Context Consumption:</strong> We use useAuth() to access
                  the current user's data from our AuthContext.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>For Component:</strong> SolidJS's optimized way to render
                  lists, more efficient than Array.map().
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>createEffect:</strong> Runs side effects when reactive
                  dependencies change (like user data).
                </Typography>
              </li>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

/**
 * ============================================================================
 * APP.TSX - Main Application Component with Routing
 * ============================================================================
 *
 * This is the root component of our SolidJS application.
 *
 * KEY CONCEPTS DEMONSTRATED:
 *
 * 1. ROUTING (@solidjs/router v0.15+)
 *    - Router: Wraps the app with routing capabilities
 *    - Route: Defines URL-to-component mappings as children of Router
 *    - root: A wrapper component for all routes (like a layout)
 *
 * 2. CONTEXT PROVIDERS
 *    - AuthProvider wraps the entire app, making auth state
 *      available to all components via useAuth()
 *    - QueryClientProvider enables TanStack Query throughout the app
 *
 * 3. PROTECTED ROUTES
 *    - ProtectedRoute component guards authenticated pages
 *    - Redirects to login if not authenticated
 *
 * 4. TANSTACK QUERY
 *    - QueryClient: Manages query cache and defaults
 *    - QueryClientProvider: Makes QueryClient available to all components
 *
 * FILE STRUCTURE:
 * - /                → Home page (public)
 * - /login           → Login page (public)
 * - /register        → Registration page (public)
 * - /users           → Users directory with TanStack Table (public)
 * - /charts          → Data visualization with Chart.js (public)
 * - /forms           → Form handling with Modular Forms (public)
 * - /dashboard       → Dashboard (protected - requires auth)
 */

import type { JSX } from "solid-js/jsx-runtime";
import { Router, Route } from "@solidjs/router";
import { CssBaseline, ThemeProvider, createTheme } from "@suid/material";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

// Context Provider
import { AuthProvider } from "./context/AuthContext";

// Components
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Users } from "./pages/Users";
import { Charts } from "./pages/Charts";
import { Forms } from "./pages/Forms";
import PrintPDF from "./pages/PrintPDF";

/**
 * QueryClient Configuration
 *
 * The QueryClient is the core of TanStack Query. It:
 * - Manages the query cache
 * - Handles background refetching
 * - Provides default options for all queries
 *
 * Creating it outside the component ensures a single instance
 * is shared across the entire application.
 */
const queryClient = new QueryClient({
  /**
   * Default Options
   *
   * These settings apply to all queries unless overridden.
   */
  defaultOptions: {
    queries: {
      /**
       * staleTime - How long data stays "fresh"
       *
       * Fresh data is returned from cache without refetching.
       * After staleTime, data is "stale" and will refetch in background.
       *
       * 1 minute = 60 * 1000 = 60000ms
       */
      staleTime: 60 * 1000,

      /**
       * retry - Number of retry attempts on failure
       *
       * If a query fails, TanStack Query will retry this many times
       * before giving up and returning an error.
       */
      retry: 1,

      /**
       * refetchOnWindowFocus - Refetch when window regains focus
       *
       * When user switches back to your app, stale queries refetch.
       * Set to false to disable this behavior.
       */
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Material UI Theme Configuration
 *
 * createTheme() creates a theme object that customizes the look of
 * all SUID (Material UI) components. You can customize:
 * - Colors (primary, secondary, error, etc.)
 * - Typography (fonts, sizes)
 * - Spacing
 * - Component-specific styles
 *
 * The ThemeProvider makes this theme available to all SUID components.
 */
const theme = createTheme({
  palette: {
    // Primary color - used for main actions, links, etc.
    primary: {
      main: "#1976d2", // Blue
      light: "#42a5f5",
      dark: "#1565c0",
    },
    // Secondary color - used for less prominent elements
    secondary: {
      main: "#9c27b0", // Purple
      light: "#ba68c8",
      dark: "#7b1fa2",
    },
    // Background colors
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  // Typography customization
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
});

/**
 * RouteSectionProps - Props passed to route section components
 *
 * In @solidjs/router v0.15+, the root component receives props
 * with a children property that contains the matched route.
 */
interface RouteSectionProps {
  children?: JSX.Element;
}

/**
 * Layout Component - Wraps all routes with common elements
 *
 * This is used as the "root" prop of Router.
 * It provides:
 * - Theme provider for consistent styling
 * - CSS baseline for cross-browser consistency
 * - Query client for TanStack Query
 * - Auth provider for global state
 * - Navigation bar on all pages
 */
function Layout(props: RouteSectionProps) {
  return (
    /**
     * ThemeProvider - Provides Material UI theme to all children
     *
     * This must wrap all SUID components to apply the theme.
     */
    <ThemeProvider theme={theme}>
      {/**
       * CssBaseline - CSS Reset
       *
       * Normalizes styles across browsers (similar to normalize.css).
       * Provides a consistent starting point for styling.
       */}
      <CssBaseline />

      {/**
       * QueryClientProvider - TanStack Query Provider
       *
       * Makes the QueryClient available to all child components.
       * Any component can now use createQuery, createMutation, etc.
       *
       * Must wrap components that use TanStack Query hooks.
       */}
      <QueryClientProvider client={queryClient}>
        {/**
         * AuthProvider - Global Authentication State
         *
         * All child components can access auth state via useAuth().
         */}
        <AuthProvider>
          {/**
           * Navbar - Always visible navigation
           *
           * Placed here so it appears on every page.
           * Uses auth context to show appropriate nav items.
           */}
          <Navbar />

          {/**
           * Route Content
           *
           * props.children contains the matched route's component.
           * This is where the page content will be rendered.
           */}
          {props.children}
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

/**
 * ProtectedDashboard Component
 *
 * Wrapper for Dashboard that includes protection.
 * Separated into its own component for cleaner Route definition.
 */
function ProtectedDashboard() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

/**
 * NotFound Component
 *
 * Displayed when no route matches the current URL.
 */
function NotFound() {
  return (
    <div style={{ "text-align": "center", padding: "50px" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/">Go back home</a>
    </div>
  );
}

/**
 * App Component - Root of the Application
 *
 * This component sets up the Router with:
 * - root: Layout component wrapping all routes
 * - Route children: Define URL-to-component mappings
 *
 * In @solidjs/router v0.15+:
 * - Routes are passed as children of Router
 * - The "root" prop defines a wrapper component for all routes
 * - No separate Routes component needed
 */
function App() {
  return (
    /**
     * Router - Enables client-side routing
     *
     * Props:
     * - root: Component that wraps all routes (receives children prop)
     * - children: Route definitions
     *
     * The Router enables:
     * - A component for links
     * - useNavigate() hook for programmatic navigation
     * - useParams(), useSearchParams() for URL data
     */
    <Router root={Layout}>
      {/**
       * PUBLIC ROUTES
       *
       * These routes are accessible to everyone, logged in or not.
       *
       * Route props:
       * - path: URL pattern to match
       * - component: Component to render when path matches
       */}

      {/* Home Page - Landing page */}
      <Route path="/" component={Home} />

      {/* Login Page - For existing users */}
      <Route path="/login" component={Login} />

      {/* Register Page - For new users */}
      <Route path="/register" component={Register} />

      {/**
       * Users Page - TanStack Query + Table Demo
       *
       * This page demonstrates:
       * - Fetching data with TanStack Query
       * - Displaying data with TanStack Table
       * - Sorting, filtering, and pagination
       */}
      <Route path="/users" component={Users} />

      {/**
       * Charts Page - Data Visualization Demo
       *
       * This page demonstrates:
       * - Chart.js integration with solid-chartjs
       * - Different chart types (Line, Bar, Pie, Doughnut)
       * - Reactive charts that update with signals
       */}
      <Route path="/charts" component={Charts} />

      {/**
       * Forms Page - Form Handling Demo
       *
       * This page demonstrates:
       * - @modular-forms/solid for form state management
       * - Valibot for schema validation
       * - Various input types and validation rules
       */}
      <Route path="/forms" component={Forms} />

      {/**
       * Print/PDF Page - Client-side Print and PDF Export Demo
       *
       * This page demonstrates:
       * - Browser print functionality with window.print()
       * - PDF generation using jsPDF and html2canvas
       * - @media print CSS for print-specific styling
       */}
      <Route path="/print" component={PrintPDF} />

      {/**
       * PROTECTED ROUTES
       *
       * These routes require authentication.
       * Using ProtectedDashboard which wraps Dashboard with ProtectedRoute.
       *
       * How it works:
       * 1. User navigates to /dashboard
       * 2. Route renders ProtectedDashboard
       * 3. ProtectedRoute checks auth status:
       *    - If authenticated → renders Dashboard
       *    - If not authenticated → redirects to /login
       */}
      <Route path="/dashboard" component={ProtectedDashboard} />

      {/**
       * CATCH-ALL ROUTE (404)
       *
       * path="*" matches any URL not matched by other routes.
       * Useful for showing a "Page Not Found" message.
       */}
      <Route path="*" component={NotFound} />
    </Router>
  );
}

export default App;

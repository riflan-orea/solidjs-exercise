/**
 * ============================================================================
 * PROTECTED ROUTE COMPONENT - Guards routes that require authentication
 * ============================================================================
 *
 * This component demonstrates:
 * 1. Route protection pattern in SolidJS
 * 2. Using Show for conditional rendering
 * 3. Redirecting unauthenticated users
 *
 * USAGE:
 * Wrap any component that should only be accessible to logged-in users:
 *
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */

import { Show } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { Navigate } from "@solidjs/router";
import { CircularProgress, Box } from "@suid/material";
import { useAuth } from "../context/AuthContext";

/**
 * Props interface for ProtectedRoute
 * children: The protected content to render if authenticated
 */
interface ProtectedRouteProps {
  children: JSX.Element;
}

/**
 * ProtectedRoute Component
 *
 * Acts as a "guard" that checks if the user is authenticated before
 * rendering the protected content. If not authenticated, redirects
 * to the login page.
 *
 * This pattern is essential for:
 * - Protecting sensitive pages (dashboard, profile, settings)
 * - Improving security by preventing unauthorized access
 * - Providing good UX by redirecting to login
 */
export function ProtectedRoute(props: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    /**
     * First Show: Handle loading state
     *
     * While checking authentication status (e.g., reading from localStorage),
     * we show a loading spinner. This prevents flickering and ensures we
     * don't redirect before knowing the actual auth status.
     */
    <Show
      when={!isLoading()}
      fallback={
        /**
         * Loading State
         *
         * Box component centers the spinner both horizontally and vertically.
         * CircularProgress is Material UI's loading spinner.
         */
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      {/**
       * Second Show: Check authentication
       *
       * Once loading is complete, check if user is authenticated.
       * If not, redirect to login page.
       */}
      <Show
        when={isAuthenticated()}
        fallback={
          /**
           * Navigate Component - Declarative redirect
           *
           * From @solidjs/router, this component performs a redirect
           * when rendered. It's the declarative way to redirect users.
           *
           * - href: where to redirect
           *
           * Alternative: You could use useNavigate() hook for
           * programmatic navigation in response to events.
           */
          <Navigate href="/login" />
        }
      >
        {/**
         * Protected Content
         *
         * If user is authenticated, render the children (protected content).
         * props.children contains whatever is wrapped by ProtectedRoute.
         */}
        {props.children}
      </Show>
    </Show>
  );
}

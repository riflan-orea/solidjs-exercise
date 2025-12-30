/**
 * ============================================================================
 * USERS PAGE - Demonstrates TanStack Query and TanStack Table
 * ============================================================================
 *
 * This page showcases:
 * 1. TanStack Query for data fetching with caching
 * 2. TanStack Table for powerful table functionality
 * 3. Sorting, filtering, and pagination
 * 4. Query invalidation and cache management
 *
 * KEY CONCEPTS DEMONSTRATED:
 *
 * 1. TANSTACK QUERY (@tanstack/solid-query)
 *    - createQuery: Hook for fetching and caching data
 *    - useQueryClient: Access the query client for cache operations
 *    - invalidateQueries: Force refetch of cached data
 *    - Automatic loading/error states
 *
 * 2. TANSTACK TABLE (@tanstack/solid-table)
 *    - createSolidTable: Creates a table instance
 *    - Column definitions: Define how data is displayed
 *    - Sorting, filtering, pagination built-in
 */

import { createSignal, Show, For } from "solid-js";
import { createQuery, useQueryClient } from "@tanstack/solid-query";
import {
  createSolidTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/solid-table";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Chip,
  Divider,
} from "@suid/material";

import { fetchUsers } from "../services/api";
import type { ApiUser } from "../types/api";

/**
 * Column Definitions for the Users Table
 *
 * Each column definition specifies:
 * - accessorKey: Which property to access from the data
 * - header: What to display in the header
 * - cell: How to render the cell (optional, defaults to the value)
 *
 * TanStack Table is headless - it handles logic, you handle rendering.
 */
const columns: ColumnDef<ApiUser>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => (
      <Typography sx={{ fontWeight: 500 }}>
        {info.getValue() as string}
      </Typography>
    ),
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: (info) => (
      <Chip
        label={`@${info.getValue() as string}`}
        size="small"
        variant="outlined"
      />
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: (info) => (
      <a
        href={`mailto:${info.getValue() as string}`}
        style={{ color: "#1976d2", "text-decoration": "none" }}
      >
        {info.getValue() as string}
      </a>
    ),
  },
  {
    accessorFn: (row) => row.address.city,
    id: "city",
    header: "City",
  },
  {
    accessorFn: (row) => row.company.name,
    id: "company",
    header: "Company",
  },
  {
    accessorKey: "website",
    header: "Website",
    cell: (info) => (
      <a
        href={`https://${info.getValue() as string}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#1976d2", "text-decoration": "none" }}
      >
        {info.getValue() as string}
      </a>
    ),
  },
];

/**
 * Users Page Component
 *
 * Fetches users from API and displays them in an interactive table.
 * Includes query invalidation demo.
 */
export function Users() {
  /**
   * useQueryClient - Access the QueryClient instance
   *
   * The QueryClient provides methods for:
   * - invalidateQueries: Mark queries as stale and refetch
   * - resetQueries: Clear cache and refetch
   * - setQueryData: Manually update cache
   * - getQueryData: Read from cache
   */
  const queryClient = useQueryClient();

  /**
   * Track invalidation state for UI feedback
   */
  const [isInvalidating, setIsInvalidating] = createSignal(false);
  const [lastInvalidated, setLastInvalidated] = createSignal<string | null>(null);

  // Table state
  const [sorting, setSorting] = createSignal<SortingState>([]);
  const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = createSignal("");

  /**
   * TanStack Query - createQuery
   */
  const usersQuery = createQuery(() => ({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  }));

  /**
   * Invalidate Users Query
   *
   * invalidateQueries marks matching queries as stale, causing them
   * to refetch the next time they're accessed or immediately if
   * the query is currently being observed.
   *
   * This is useful for:
   * - After mutations (create/update/delete)
   * - Manual refresh buttons
   * - Polling scenarios
   */
  const handleInvalidate = async () => {
    setIsInvalidating(true);

    /**
     * invalidateQueries options:
     * - queryKey: Which queries to invalidate (supports partial matching)
     * - exact: If true, only matches exact queryKey
     * - refetchType: 'active' | 'inactive' | 'all' | 'none'
     */
    await queryClient.invalidateQueries({ queryKey: ["users"] });

    setLastInvalidated(new Date().toLocaleTimeString());
    setIsInvalidating(false);
  };

  /**
   * Reset Users Query
   *
   * resetQueries is more aggressive - it:
   * - Clears the cache for matching queries
   * - Resets to initial state
   * - Triggers refetch
   */
  const handleReset = async () => {
    setIsInvalidating(true);
    await queryClient.resetQueries({ queryKey: ["users"] });
    setLastInvalidated(new Date().toLocaleTimeString());
    setIsInvalidating(false);
  };

  /**
   * Refetch Query
   *
   * Direct refetch bypasses stale checks - always fetches fresh data.
   * Useful when you want to force a refresh regardless of stale state.
   */
  const handleRefetch = async () => {
    setIsInvalidating(true);
    await usersQuery.refetch();
    setLastInvalidated(new Date().toLocaleTimeString());
    setIsInvalidating(false);
  };

  /**
   * TanStack Table instance
   */
  const table = createSolidTable({
    get data() {
      return usersQuery.data ?? [];
    },
    columns,
    state: {
      get sorting() {
        return sorting();
      },
      get columnFilters() {
        return columnFilters();
      },
      get globalFilter() {
        return globalFilter();
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ marginTop: 4, marginBottom: 4 }}>
        <Typography variant="h3" gutterBottom>
          Users Directory
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Data fetched from JSONPlaceholder API using TanStack Query
        </Typography>
      </Box>

      {/**
       * Query Invalidation Demo Section
       *
       * This section demonstrates different ways to refresh/invalidate queries.
       */}
      <Paper elevation={2} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>
          Query Cache Controls
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
          Test different TanStack Query cache operations. Watch the network tab to see requests!
        </Typography>

        <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ marginBottom: 2 }}>
          {/**
           * Invalidate Button
           *
           * Marks the query as stale, triggering a background refetch.
           * The UI shows cached data while new data loads.
           */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleInvalidate}
            disabled={isInvalidating()}
          >
            {isInvalidating() ? "Invalidating..." : "Invalidate Query"}
          </Button>

          {/**
           * Reset Button
           *
           * Clears cache completely and refetches.
           * Shows loading state as there's no cached data.
           */}
          <Button
            variant="contained"
            color="secondary"
            onClick={handleReset}
            disabled={isInvalidating()}
          >
            Reset Query
          </Button>

          {/**
           * Refetch Button
           *
           * Forces immediate refetch regardless of stale state.
           */}
          <Button
            variant="outlined"
            onClick={handleRefetch}
            disabled={isInvalidating()}
          >
            Force Refetch
          </Button>
        </Stack>

        {/* Query State Info */}
        <Stack direction="row" spacing={3} flexWrap="wrap">
          <Chip
            label={`Status: ${usersQuery.status}`}
            color={usersQuery.status === "success" ? "success" : "default"}
            size="small"
          />
          <Chip
            label={`Fetching: ${usersQuery.isFetching ? "Yes" : "No"}`}
            color={usersQuery.isFetching ? "warning" : "default"}
            size="small"
          />
          <Chip
            label={`Stale: ${usersQuery.isStale ? "Yes" : "No"}`}
            color={usersQuery.isStale ? "error" : "success"}
            size="small"
          />
          <Show when={lastInvalidated()}>
            <Chip
              label={`Last refreshed: ${lastInvalidated()}`}
              size="small"
              variant="outlined"
            />
          </Show>
        </Stack>

        <Divider sx={{ marginY: 2 }} />

        {/* Explanation */}
        <Typography variant="body2" color="text.secondary">
          <strong>Invalidate:</strong> Marks query stale → background refetch → updates when done
          <br />
          <strong>Reset:</strong> Clears cache → shows loading → refetches from scratch
          <br />
          <strong>Refetch:</strong> Immediately fetches new data, bypasses stale time
        </Typography>
      </Paper>

      {/* Loading State */}
      <Show when={usersQuery.isLoading}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <CircularProgress />
          <Typography sx={{ marginLeft: 2 }}>Loading users...</Typography>
        </Box>
      </Show>

      {/* Error State */}
      <Show when={usersQuery.isError}>
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          Failed to load users: {(usersQuery.error as Error)?.message}
          <Button
            onClick={() => usersQuery.refetch()}
            sx={{ marginLeft: 2 }}
            size="small"
          >
            Retry
          </Button>
        </Alert>
      </Show>

      {/* Success State - Show Table */}
      <Show when={usersQuery.data}>
        <Paper elevation={3} sx={{ padding: 3 }}>
          {/* Background fetch indicator */}
          <Show when={usersQuery.isFetching && !usersQuery.isLoading}>
            <Alert severity="info" sx={{ marginBottom: 2 }}>
              Updating data in background...
            </Alert>
          </Show>

          {/* Global Filter */}
          <Box sx={{ marginBottom: 3 }}>
            <TextField
              fullWidth
              label="Search all columns..."
              value={globalFilter()}
              onChange={(e) => setGlobalFilter(e.currentTarget.value)}
              size="small"
            />
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <For each={table.getHeaderGroups()}>
                  {(headerGroup) => (
                    <TableRow>
                      <For each={headerGroup.headers}>
                        {(header) => (
                          <TableCell
                            onClick={header.column.getToggleSortingHandler()}
                            sx={{
                              cursor: header.column.getCanSort()
                                ? "pointer"
                                : "default",
                              fontWeight: "bold",
                              backgroundColor: "grey.100",
                              userSelect: "none",
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: " 🔼",
                              desc: " 🔽",
                            }[header.column.getIsSorted() as string] ?? null}
                          </TableCell>
                        )}
                      </For>
                    </TableRow>
                  )}
                </For>
              </TableHead>

              <TableBody>
                <For each={table.getRowModel().rows}>
                  {(row) => (
                    <TableRow
                      hover
                      sx={{
                        "&:hover": { backgroundColor: "grey.50" },
                      }}
                    >
                      <For each={row.getVisibleCells()}>
                        {(cell) => (
                          <TableCell>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        )}
                      </For>
                    </TableRow>
                  )}
                </For>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ marginTop: 3 }}
          >
            <Button
              variant="outlined"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>

            <Typography>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </Typography>

            <Button
              variant="outlined"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ marginTop: 2 }}
          >
            Showing {table.getRowModel().rows.length} of{" "}
            {usersQuery.data?.length ?? 0} users
          </Typography>
        </Paper>

        {/* Learning Notes */}
        <Paper
          elevation={1}
          sx={{
            padding: 3,
            marginTop: 3,
            marginBottom: 4,
            backgroundColor: "primary.light",
            color: "primary.contrastText",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Query Invalidation Concepts
          </Typography>
          <Box component="ul" sx={{ margin: 0, paddingLeft: 3 }}>
            <li>
              <Typography variant="body2">
                <strong>useQueryClient:</strong> Access the QueryClient for cache operations.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>invalidateQueries:</strong> Marks queries stale, triggers background refetch.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>resetQueries:</strong> Clears cache completely, refetches from scratch.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>refetch:</strong> Forces immediate data fetch, bypasses stale checks.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>isFetching vs isLoading:</strong> isFetching = any fetch, isLoading = no cached data.
              </Typography>
            </li>
          </Box>
        </Paper>
      </Show>
    </Container>
  );
}

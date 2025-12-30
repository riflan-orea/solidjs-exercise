/**
 * ============================================================================
 * USERS PAGE - Demonstrates TanStack Query and TanStack Table
 * ============================================================================
 *
 * This page showcases:
 * 1. TanStack Query for data fetching with caching
 * 2. TanStack Table for powerful table functionality
 * 3. Sorting, filtering, and pagination
 *
 * KEY CONCEPTS DEMONSTRATED:
 *
 * 1. TANSTACK QUERY (@tanstack/solid-query)
 *    - createQuery: Hook for fetching and caching data
 *    - Automatic loading/error states
 *    - Background refetching and cache invalidation
 *
 * 2. TANSTACK TABLE (@tanstack/solid-table)
 *    - createSolidTable: Creates a table instance
 *    - Column definitions: Define how data is displayed
 *    - Sorting, filtering, pagination built-in
 */

import { createSignal, Show, For } from "solid-js";
import { createQuery } from "@tanstack/solid-query";
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
    /**
     * ID Column
     * accessorKey maps directly to user.id
     */
    accessorKey: "id",
    header: "ID",
    /**
     * cell receives info about the row/cell
     * info.getValue() returns the cell's value
     */
    cell: (info) => info.getValue(),
  },
  {
    /**
     * Name Column with custom cell rendering
     */
    accessorKey: "name",
    header: "Name",
    cell: (info) => (
      <Typography sx={{ fontWeight: 500 }}>
        {info.getValue() as string}
      </Typography>
    ),
  },
  {
    /**
     * Username Column
     */
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
    /**
     * Email Column with mailto link
     */
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
    /**
     * City Column - accessing nested property
     *
     * accessorFn allows custom accessor logic for nested data
     */
    accessorFn: (row) => row.address.city,
    id: "city",
    header: "City",
  },
  {
    /**
     * Company Column - accessing nested property
     */
    accessorFn: (row) => row.company.name,
    id: "company",
    header: "Company",
  },
  {
    /**
     * Website Column with external link
     */
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
 */
export function Users() {
  /**
   * Sorting State
   *
   * SortingState is an array of { id, desc } objects.
   * Empty array means no sorting applied.
   */
  const [sorting, setSorting] = createSignal<SortingState>([]);

  /**
   * Column Filters State
   *
   * ColumnFiltersState is an array of { id, value } objects.
   * Used for column-specific filtering.
   */
  const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>([]);

  /**
   * Global Filter State
   *
   * A simple string for filtering across all columns.
   */
  const [globalFilter, setGlobalFilter] = createSignal("");

  /**
   * TanStack Query - createQuery
   *
   * createQuery is the SolidJS version of React Query's useQuery.
   *
   * Key features:
   * - Automatic caching: Data is cached by queryKey
   * - Background refetching: Stale data is refetched automatically
   * - Loading/error states: Built-in state management
   * - Deduplication: Multiple components can share the same query
   *
   * Returns an object with:
   * - data: The fetched data (undefined while loading)
   * - isLoading: True during initial fetch
   * - isError: True if fetch failed
   * - error: The error object if failed
   * - refetch: Function to manually refetch
   */
  const usersQuery = createQuery(() => ({
    /**
     * queryKey - Unique identifier for this query
     *
     * TanStack Query uses this key to:
     * - Cache the results
     * - Deduplicate requests
     * - Invalidate/refetch data
     *
     * Can include variables: ['users', userId] for user-specific queries
     */
    queryKey: ["users"],

    /**
     * queryFn - The function that fetches data
     *
     * Must return a Promise. TanStack Query handles:
     * - Calling this function
     * - Tracking loading state
     * - Catching errors
     * - Caching results
     */
    queryFn: fetchUsers,

    /**
     * staleTime - How long data stays "fresh" (in ms)
     *
     * While fresh, queries return cached data without refetching.
     * After staleTime, data is considered stale and will refetch
     * in the background on next access.
     *
     * 5 minutes = 5 * 60 * 1000 = 300000ms
     */
    staleTime: 5 * 60 * 1000,
  }));

  /**
   * TanStack Table - createSolidTable
   *
   * Creates a table instance with all the features we need.
   * The table is "headless" - it provides logic, we provide UI.
   *
   * Configuration:
   * - data: The data to display (from our query)
   * - columns: Column definitions
   * - state: Current table state (sorting, filters, etc.)
   * - on*Change: Callbacks when state changes
   * - get*RowModel: Enable specific features
   */
  const table = createSolidTable({
    /**
     * get data() - Accessor for reactive data
     *
     * Using a getter makes this reactive - table updates when data changes.
     * Falls back to empty array while loading.
     */
    get data() {
      return usersQuery.data ?? [];
    },

    /**
     * columns - Column definitions (defined above)
     */
    columns,

    /**
     * state - Current table state
     *
     * Using getters for reactivity with SolidJS signals.
     */
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

    /**
     * State change handlers
     *
     * These are called when the table wants to update state.
     * We update our signals, which triggers reactivity.
     */
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,

    /**
     * Row Models - Enable table features
     *
     * Each get*RowModel enables a specific feature:
     * - getCoreRowModel: Basic row rendering (required)
     * - getSortedRowModel: Sorting functionality
     * - getFilteredRowModel: Filtering functionality
     * - getPaginationRowModel: Pagination functionality
     */
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
       * Loading State
       *
       * Show spinner while data is being fetched.
       * usersQuery.isLoading is true during initial fetch.
       */}
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

      {/**
       * Error State
       *
       * Show error message if fetch failed.
       * usersQuery.error contains the error details.
       */}
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

      {/**
       * Success State - Show Table
       *
       * Only render table when data is available.
       */}
      <Show when={usersQuery.data}>
        <Paper elevation={3} sx={{ padding: 3 }}>
          {/**
           * Global Filter Input
           *
           * Filters across all columns at once.
           */}
          <Box sx={{ marginBottom: 3 }}>
            <TextField
              fullWidth
              label="Search all columns..."
              value={globalFilter()}
              onChange={(e) => setGlobalFilter(e.currentTarget.value)}
              size="small"
            />
          </Box>

          {/**
           * Table Container
           *
           * TableContainer adds horizontal scrolling on small screens.
           */}
          <TableContainer>
            <Table>
              {/**
               * Table Header
               *
               * We iterate over header groups and headers from the table.
               * Each header can be clicked to toggle sorting.
               */}
              <TableHead>
                <For each={table.getHeaderGroups()}>
                  {(headerGroup) => (
                    <TableRow>
                      <For each={headerGroup.headers}>
                        {(header) => (
                          <TableCell
                            /**
                             * Click handler for sorting
                             *
                             * getToggleSortingHandler() returns a click handler
                             * that toggles sorting for this column.
                             */
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
                            {/**
                             * flexRender - Renders column header/cell content
                             *
                             * This handles both string headers and JSX headers.
                             * First argument: what to render (header definition)
                             * Second argument: context (header object)
                             */}
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}

                            {/**
                             * Sort Indicator
                             *
                             * Show arrow indicating sort direction.
                             * getIsSorted() returns 'asc', 'desc', or false.
                             */}
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

              {/**
               * Table Body
               *
               * We iterate over rows from getRowModel().
               * Each row contains cells that we render.
               */}
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
                            {/**
                             * flexRender for cell content
                             *
                             * Renders the cell using the column's cell definition.
                             */}
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

          {/**
           * Pagination Controls
           *
           * TanStack Table provides pagination methods:
           * - getCanPreviousPage/getCanNextPage: Check if navigation possible
           * - previousPage/nextPage: Navigate between pages
           * - getPageCount: Total number of pages
           * - getState().pagination: Current page info
           */}
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

          {/**
           * Data Summary
           *
           * Show total rows and filtered count.
           */}
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

        {/**
         * Learning Notes Section
         */}
        <Paper
          elevation={1}
          sx={{
            padding: 3,
            marginTop: 3,
            backgroundColor: "primary.light",
            color: "primary.contrastText",
          }}
        >
          <Typography variant="h6" gutterBottom>
            TanStack Query + Table Concepts
          </Typography>
          <Box component="ul" sx={{ margin: 0, paddingLeft: 3 }}>
            <li>
              <Typography variant="body2">
                <strong>createQuery:</strong> Fetches data with automatic
                caching, loading states, and error handling.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>queryKey:</strong> Unique identifier for caching.
                Change it to refetch (e.g., ['users', searchTerm]).
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>createSolidTable:</strong> Headless table logic -
                provides sorting, filtering, pagination.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Column Definitions:</strong> Define how each column
                accesses and renders data.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>flexRender:</strong> Renders cells/headers, handling
                both strings and JSX.
              </Typography>
            </li>
          </Box>
        </Paper>
      </Show>
    </Container>
  );
}

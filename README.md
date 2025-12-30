# SolidJS Authentication Demo - Learning Project

A comprehensive learning project demonstrating authentication patterns, routing, state management, data fetching, and UI components in SolidJS.

## Features

- **Authentication System**: Login, Register, and Logout functionality
- **Protected Routes**: Dashboard accessible only to authenticated users
- **State Management**: Global auth state using SolidJS Context API
- **Routing**: Client-side routing with @solidjs/router
- **Data Fetching**: TanStack Query for server state management
- **Data Tables**: TanStack Table with sorting, filtering, and pagination
- **Material UI**: Beautiful components using SUID (Material UI for SolidJS)
- **TypeScript**: Fully typed for better developer experience
- **Extensive Comments**: Every file is documented for learning purposes

## Tech Stack

- **SolidJS** - Reactive UI framework
- **Vite** - Fast development server and build tool
- **@solidjs/router** - Official routing library
- **@tanstack/solid-query** - Data fetching and caching
- **@tanstack/solid-table** - Headless table library
- **SUID** - Material UI components for SolidJS
- **TypeScript** - Type safety

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx       # Navigation bar with auth-aware links
│   └── ProtectedRoute.tsx # Route guard for authenticated pages
├── context/
│   └── AuthContext.tsx  # Global authentication state management
├── pages/
│   ├── Home.tsx         # Landing page
│   ├── Login.tsx        # Login form
│   ├── Register.tsx     # Registration form
│   ├── Dashboard.tsx    # Protected user dashboard
│   └── Users.tsx        # TanStack Query + Table demo
├── services/
│   └── api.ts           # API functions for JSONPlaceholder
├── types/
│   ├── auth.ts          # Auth type definitions
│   └── api.ts           # API response type definitions
├── App.tsx              # Main app component with routing
├── index.tsx            # Application entry point
└── index.css            # Global styles
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Build for Production

```bash
npm run build
```

## Demo Account

Use these credentials to test the login functionality:

- **Email**: demo@example.com
- **Password**: password123

Or create your own account using the Register page!

## Key Concepts Demonstrated

### 1. Signals (Reactive State)
```typescript
const [count, setCount] = createSignal(0);
// Access: count() (it's a function!)
// Update: setCount(newValue)
```

### 2. Context API (Global State)
```typescript
// Create context
const AuthContext = createContext<AuthContextType>();

// Provide context
<AuthContext.Provider value={authValue}>
  {props.children}
</AuthContext.Provider>

// Consume context
const auth = useContext(AuthContext);
```

### 3. Effects (Side Effects)
```typescript
createEffect(() => {
  // Runs when dependencies change
  console.log('User:', user());
});
```

### 4. Show Component (Conditional Rendering)
```typescript
<Show when={isAuthenticated()} fallback={<LoginButton />}>
  <LogoutButton />
</Show>
```

### 5. For Component (List Rendering)
```typescript
<For each={items()}>
  {(item) => <div>{item.name}</div>}
</For>
```

### 6. TanStack Query (Data Fetching)
```typescript
const usersQuery = createQuery(() => ({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5 minutes
}));

// Access data, loading, error states
usersQuery.data
usersQuery.isLoading
usersQuery.isError
```

### 7. TanStack Table (Data Display)
```typescript
const table = createSolidTable({
  get data() { return usersQuery.data ?? []; },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});
```

### 8. Router
```typescript
<Router root={Layout}>
  <Route path="/" component={Home} />
  <Route path="/users" component={Users} />
  <Route path="/dashboard" component={ProtectedDashboard} />
</Router>
```

## API

The Users page fetches data from [JSONPlaceholder](https://jsonplaceholder.typicode.com/), a free fake API for testing. It demonstrates:

- Fetching user data with proper error handling
- Caching with TanStack Query
- Displaying data in a sortable, filterable table
- Pagination controls

## Learning Resources

- [SolidJS Documentation](https://solidjs.com)
- [SolidJS Router](https://github.com/solidjs/solid-router)
- [TanStack Query for Solid](https://tanstack.com/query/latest/docs/solid/overview)
- [TanStack Table](https://tanstack.com/table/latest)
- [SUID (Material UI)](https://suid.io)
- [SolidJS Discord](https://discord.com/invite/solidjs)

## License

MIT

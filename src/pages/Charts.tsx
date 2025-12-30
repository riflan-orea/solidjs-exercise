/**
 * ============================================================================
 * CHARTS PAGE - Data Visualization with Chart.js
 * ============================================================================
 *
 * This page demonstrates:
 * 1. Chart.js integration with SolidJS via solid-chartjs
 * 2. Different chart types (Line, Bar, Pie, Doughnut)
 * 3. Reactive charts that update with signals
 * 4. Fetching data and visualizing it
 *
 * KEY CONCEPTS:
 *
 * 1. SOLID-CHARTJS
 *    - Chart components: Line, Bar, Pie, Doughnut, Radar, etc.
 *    - Reactive updates when data/options change
 *    - Built on Chart.js
 *
 * 2. CHART.JS CONCEPTS
 *    - data: { labels, datasets } structure
 *    - options: Customization for axes, legends, tooltips
 *    - Chart registration for tree-shaking
 */

import { createSignal, Show } from "solid-js";
import { createQuery } from "@tanstack/solid-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "solid-chartjs";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Stack,
  CircularProgress,
} from "@suid/material";

import { fetchTodos, fetchUsers } from "../services/api";

/**
 * Register Chart.js components
 *
 * Chart.js v3+ uses a tree-shakeable architecture.
 * You must register the components you need:
 * - Scales: CategoryScale, LinearScale, etc.
 * - Elements: PointElement, LineElement, BarElement, ArcElement
 * - Plugins: Title, Tooltip, Legend
 */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Charts Page Component
 */
export function Charts() {
  /**
   * Signal for interactive demo
   *
   * This demonstrates reactive charts - when dataMultiplier changes,
   * the charts automatically update.
   */
  const [dataMultiplier, setDataMultiplier] = createSignal(1);

  /**
   * Fetch real data from API for visualization
   */
  const todosQuery = createQuery(() => ({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    staleTime: 5 * 60 * 1000,
  }));

  const usersQuery = createQuery(() => ({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
  }));

  /**
   * LINE CHART DATA
   *
   * Demonstrates a line chart with multiple datasets.
   * Uses the multiplier signal for reactive updates.
   */
  const lineChartData = () => ({
    /**
     * labels - X-axis categories
     */
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],

    /**
     * datasets - Array of data series
     *
     * Each dataset can have:
     * - label: Legend label
     * - data: Array of values
     * - borderColor: Line color
     * - backgroundColor: Fill color (with Filler plugin)
     * - tension: Line curvature (0 = straight, 1 = very curved)
     */
    datasets: [
      {
        label: "Sales",
        data: [65, 59, 80, 81, 56, 55].map((v) => v * dataMultiplier()),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Revenue",
        data: [28, 48, 40, 19, 86, 27].map((v) => v * dataMultiplier()),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  });

  /**
   * BAR CHART DATA
   *
   * Shows todos per user from API data.
   */
  const barChartData = () => {
    if (!todosQuery.data || !usersQuery.data) {
      return { labels: [], datasets: [] };
    }

    // Count todos per user
    const todosByUser = new Map<number, { completed: number; pending: number }>();
    todosQuery.data.forEach((todo) => {
      const current = todosByUser.get(todo.userId) || { completed: 0, pending: 0 };
      if (todo.completed) {
        current.completed++;
      } else {
        current.pending++;
      }
      todosByUser.set(todo.userId, current);
    });

    // Get user names
    const userNames = usersQuery.data.map((u) => u.name.split(" ")[0]);

    return {
      labels: userNames,
      datasets: [
        {
          label: "Completed",
          data: usersQuery.data.map(
            (u) => (todosByUser.get(u.id)?.completed || 0) * dataMultiplier()
          ),
          backgroundColor: "rgba(75, 192, 192, 0.8)",
        },
        {
          label: "Pending",
          data: usersQuery.data.map(
            (u) => (todosByUser.get(u.id)?.pending || 0) * dataMultiplier()
          ),
          backgroundColor: "rgba(255, 99, 132, 0.8)",
        },
      ],
    };
  };

  /**
   * PIE CHART DATA
   *
   * Shows overall todo completion status.
   */
  const pieChartData = () => {
    if (!todosQuery.data) {
      return { labels: [], datasets: [] };
    }

    const completed = todosQuery.data.filter((t) => t.completed).length;
    const pending = todosQuery.data.filter((t) => !t.completed).length;

    return {
      labels: ["Completed", "Pending"],
      datasets: [
        {
          data: [completed, pending],
          backgroundColor: [
            "rgba(75, 192, 192, 0.8)",
            "rgba(255, 99, 132, 0.8)",
          ],
          borderColor: ["rgb(75, 192, 192)", "rgb(255, 99, 132)"],
          borderWidth: 2,
        },
      ],
    };
  };

  /**
   * DOUGHNUT CHART DATA
   *
   * Shows user distribution by company city.
   */
  const doughnutChartData = () => {
    if (!usersQuery.data) {
      return { labels: [], datasets: [] };
    }

    // Group users by city
    const cityCounts = new Map<string, number>();
    usersQuery.data.forEach((user) => {
      const city = user.address.city;
      cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
    });

    const cities = Array.from(cityCounts.keys());
    const counts = Array.from(cityCounts.values());

    // Generate colors for each city
    const colors = cities.map((_, i) => {
      const hue = (i * 137.5) % 360; // Golden angle for nice distribution
      return `hsla(${hue}, 70%, 60%, 0.8)`;
    });

    return {
      labels: cities,
      datasets: [
        {
          data: counts,
          backgroundColor: colors,
          borderWidth: 2,
        },
      ],
    };
  };

  /**
   * Chart Options
   *
   * Common options for all charts:
   * - responsive: Resize with container
   * - maintainAspectRatio: Keep proportions
   * - plugins: Configure title, legend, tooltip
   */
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "Monthly Sales & Revenue (Interactive)",
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "Todos by User (from API)",
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" as const },
      title: {
        display: true,
        text: "Todo Completion Status",
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" as const },
      title: {
        display: true,
        text: "Users by City",
      },
    },
  };

  const isLoading = () => todosQuery.isLoading || usersQuery.isLoading;

  /**
   * Handle multiplier input change
   */
  const handleMultiplierChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = parseFloat(target.value);
    if (!isNaN(value) && value >= 0.5 && value <= 3) {
      setDataMultiplier(value);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ marginTop: 4, marginBottom: 4 }}>
        <Typography variant="h3" gutterBottom>
          Data Visualization
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Interactive charts using Chart.js with solid-chartjs
        </Typography>
      </Box>

      {/* Interactive Controls */}
      <Paper elevation={2} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>
          Interactive Demo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
          Change the multiplier to see charts update reactively!
        </Typography>

        <Box sx={{ maxWidth: 400 }}>
          <Typography gutterBottom>
            Data Multiplier: {dataMultiplier().toFixed(1)}x
          </Typography>
          {/**
           * Using a native range input since SUID doesn't have Slider
           */}
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={dataMultiplier()}
            onInput={handleMultiplierChange}
            style={{
              width: "100%",
              height: "8px",
              cursor: "pointer",
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption">0.5x</Typography>
            <Typography variant="caption">3x</Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={2} sx={{ marginTop: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setDataMultiplier(1)}
          >
            Reset to 1x
          </Button>
          <Button
            variant="outlined"
            onClick={() => setDataMultiplier(Math.random() * 2 + 0.5)}
          >
            Random Value
          </Button>
        </Stack>
      </Paper>

      {/* Loading State */}
      <Show when={isLoading()}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <CircularProgress />
          <Typography sx={{ marginLeft: 2 }}>Loading chart data...</Typography>
        </Box>
      </Show>

      {/* Charts Grid */}
      <Show when={!isLoading()}>
        <Grid container spacing={3}>
          {/**
           * LINE CHART
           *
           * Best for: Trends over time, continuous data
           */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Box sx={{ height: 300 }}>
                <Line data={lineChartData()} options={lineChartOptions} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ marginTop: 1 }}>
                Line charts are great for showing trends and changes over time.
              </Typography>
            </Paper>
          </Grid>

          {/**
           * BAR CHART
           *
           * Best for: Comparing categories, discrete data
           */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Box sx={{ height: 300 }}>
                <Bar data={barChartData()} options={barChartOptions} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ marginTop: 1 }}>
                Bar charts compare values across different categories.
              </Typography>
            </Paper>
          </Grid>

          {/**
           * PIE CHART
           *
           * Best for: Parts of a whole, percentages
           */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Box sx={{ height: 300 }}>
                <Pie data={pieChartData()} options={pieChartOptions} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ marginTop: 1 }}>
                Pie charts show proportions of a whole (best with few categories).
              </Typography>
            </Paper>
          </Grid>

          {/**
           * DOUGHNUT CHART
           *
           * Best for: Parts of a whole with center space
           */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Box sx={{ height: 300 }}>
                <Doughnut data={doughnutChartData()} options={doughnutChartOptions} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ marginTop: 1 }}>
                Doughnut charts are like pie charts with a hole for additional info.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

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
            Chart.js Concepts
          </Typography>
          <Box component="ul" sx={{ margin: 0, paddingLeft: 3 }}>
            <li>
              <Typography variant="body2">
                <strong>Registration:</strong> Chart.js v3+ requires registering components you use.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Data Structure:</strong> {"{ labels: [...], datasets: [{ label, data, ... }] }"}
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Reactivity:</strong> Charts update automatically when data signals change.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Options:</strong> Customize axes, legends, tooltips, animations, and more.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Chart Types:</strong> Line, Bar, Pie, Doughnut, Radar, Polar, Scatter, Bubble.
              </Typography>
            </li>
          </Box>
        </Paper>
      </Show>
    </Container>
  );
}

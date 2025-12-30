/**
 * PrintPDF.tsx - Client-side Print and PDF Download Demo
 *
 * This component demonstrates how to implement:
 * 1. Browser print functionality using window.print()
 * 2. PDF generation using jspdf and html2canvas
 *
 * Key concepts covered:
 * - Capturing HTML elements as canvas images
 * - Converting canvas to PDF using jsPDF
 * - Using CSS @media print for print-specific styling
 * - Handling async operations with loading states
 * - Creating downloadable files in the browser
 */

import { createSignal, Show, For } from "solid-js";
import { createQuery } from "@tanstack/solid-query";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider,
} from "@suid/material";
import { Print, Download, Refresh } from "@suid/icons-material";

/**
 * Import PDF generation libraries
 *
 * jsPDF: Creates PDF documents programmatically
 * html2canvas: Captures HTML elements as canvas images
 *
 * The workflow is:
 * 1. html2canvas captures the DOM element as an image
 * 2. jsPDF creates a new PDF document
 * 3. The canvas image is added to the PDF
 * 4. PDF is downloaded or opened
 */
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { fetchUsers, fetchPosts } from "../services/api";
import type { ApiUser, ApiPost } from "../types/api";

/**
 * PrintPDF Component
 *
 * Demonstrates client-side printing and PDF generation
 * with real data from JSONPlaceholder API
 */
const PrintPDF = () => {
  /**
   * Reference to the printable content area
   *
   * We use a signal to store the DOM element reference
   * This is similar to React's useRef but works with SolidJS
   */
  let printableRef: HTMLDivElement | undefined;

  /**
   * Loading state for PDF generation
   *
   * PDF generation is async (capturing canvas, creating PDF)
   * so we show a loading indicator while processing
   */
  const [isGeneratingPDF, setIsGeneratingPDF] = createSignal(false);

  /**
   * Error state for handling failures
   */
  const [error, setError] = createSignal<string | null>(null);

  /**
   * Fetch users data using TanStack Query
   *
   * We'll display this data in a table format
   * that can be printed or exported to PDF
   */
  const usersQuery = createQuery(() => ({
    queryKey: ["users-print"],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  }));

  /**
   * Fetch posts data for additional content
   */
  const postsQuery = createQuery(() => ({
    queryKey: ["posts-print"],
    queryFn: fetchPosts,
    staleTime: 5 * 60 * 1000,
  }));

  /**
   * handlePrint - Triggers browser's native print dialog
   *
   * How it works:
   * 1. window.print() opens the browser's print dialog
   * 2. CSS @media print rules control what's visible when printing
   * 3. The user can choose to print to paper or save as PDF
   *
   * Pros:
   * - Simple to implement
   * - Uses browser's native functionality
   * - User can choose printer settings
   *
   * Cons:
   * - Less control over output format
   * - Styling can be tricky across browsers
   */
  const handlePrint = () => {
    // Clear any previous errors
    setError(null);

    /**
     * window.print() triggers the browser's print dialog
     *
     * The @media print CSS rules in index.css control
     * what gets printed and how it's styled
     */
    window.print();
  };

  /**
   * handleDownloadPDF - Generates and downloads a PDF file
   *
   * This uses a two-step process:
   * 1. html2canvas captures the DOM element as a canvas image
   * 2. jsPDF creates a PDF and adds the canvas image to it
   *
   * The process is async because capturing and converting
   * large DOM elements takes time
   */
  const handleDownloadPDF = async () => {
    // Check if the printable element exists
    if (!printableRef) {
      setError("Unable to find content to export");
      return;
    }

    // Set loading state
    setIsGeneratingPDF(true);
    setError(null);

    try {
      /**
       * Step 1: Capture the DOM element as a canvas
       *
       * html2canvas options:
       * - scale: Higher values = better quality (but larger file)
       * - useCORS: Enable if images are from different domains
       * - logging: Disable in production
       * - backgroundColor: Set background color for the capture
       */
      const canvas = await html2canvas(printableRef, {
        scale: 2, // 2x scale for better quality
        useCORS: true, // Handle cross-origin images
        logging: false, // Disable console logs
        backgroundColor: "#ffffff", // White background
      });

      /**
       * Step 2: Convert canvas to image data
       *
       * toDataURL() returns a base64-encoded string
       * representing the image in PNG format
       */
      const imgData = canvas.toDataURL("image/png");

      /**
       * Step 3: Create a new PDF document
       *
       * jsPDF constructor options:
       * - orientation: 'portrait' or 'landscape'
       * - unit: 'mm', 'cm', 'in', 'pt', 'px'
       * - format: 'a4', 'letter', 'legal', or [width, height]
       */
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      /**
       * Step 4: Calculate dimensions to fit the PDF page
       *
       * We need to scale the canvas image to fit within
       * the PDF page dimensions while maintaining aspect ratio
       */
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate the scaling ratio
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      /**
       * Step 5: Add the image to the PDF
       *
       * addImage parameters:
       * - imageData: Base64 string or HTMLImageElement
       * - format: 'PNG', 'JPEG', etc.
       * - x, y: Position on the page
       * - width, height: Dimensions of the image
       */
      // Center the image on the page
      const x = (pdfWidth - scaledWidth) / 2;
      const y = 10; // Small margin from top

      pdf.addImage(imgData, "PNG", x, y, scaledWidth, scaledHeight);

      /**
       * Step 6: Download the PDF
       *
       * save() triggers a download with the specified filename
       */
      const timestamp = new Date().toISOString().split("T")[0];
      pdf.save(`report-${timestamp}.pdf`);
    } catch (err) {
      /**
       * Error handling
       *
       * Common errors:
       * - CORS issues with external images
       * - Memory issues with very large elements
       * - Browser compatibility issues
       */
      console.error("PDF generation failed:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      // Reset loading state
      setIsGeneratingPDF(false);
    }
  };

  /**
   * handleDownloadTablePDF - Alternative method using jsPDF directly
   *
   * This method creates a PDF programmatically without html2canvas
   * Useful when you want more control over the PDF layout
   */
  const handleDownloadTablePDF = () => {
    if (!usersQuery.data) {
      setError("No data available to export");
      return;
    }

    setIsGeneratingPDF(true);
    setError(null);

    try {
      const pdf = new jsPDF();
      const users = usersQuery.data;

      /**
       * Add title to the PDF
       *
       * setFontSize: Set the font size
       * setFont: Set font family and style
       * text: Add text at specific coordinates
       */
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("User Report", 105, 20, { align: "center" });

      // Add generation date
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, {
        align: "center",
      });

      // Add a line separator
      pdf.setLineWidth(0.5);
      pdf.line(20, 32, 190, 32);

      /**
       * Create table headers
       *
       * We manually position text to create a table-like layout
       */
      let yPosition = 45;
      const lineHeight = 8;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("ID", 20, yPosition);
      pdf.text("Name", 35, yPosition);
      pdf.text("Email", 90, yPosition);
      pdf.text("City", 160, yPosition);

      // Header underline
      yPosition += 2;
      pdf.line(20, yPosition, 190, yPosition);
      yPosition += lineHeight;

      /**
       * Add table rows
       *
       * Loop through users and add each as a row
       * Handle page breaks when content exceeds page height
       */
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      users.forEach((user: ApiUser, index: number) => {
        // Check if we need a new page
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;

          // Re-add headers on new page
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(11);
          pdf.text("ID", 20, yPosition);
          pdf.text("Name", 35, yPosition);
          pdf.text("Email", 90, yPosition);
          pdf.text("City", 160, yPosition);
          yPosition += 2;
          pdf.line(20, yPosition, 190, yPosition);
          yPosition += lineHeight;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
        }

        // Add alternating row background
        if (index % 2 === 0) {
          pdf.setFillColor(245, 245, 245);
          pdf.rect(20, yPosition - 5, 170, lineHeight, "F");
        }

        // Add row data
        pdf.text(user.id.toString(), 20, yPosition);
        pdf.text(user.name.substring(0, 25), 35, yPosition);
        pdf.text(user.email.substring(0, 35), 90, yPosition);
        pdf.text(user.address.city, 160, yPosition);

        yPosition += lineHeight;
      });

      // Add footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
      }

      // Save the PDF
      const timestamp = new Date().toISOString().split("T")[0];
      pdf.save(`users-report-${timestamp}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header with Action Buttons */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Print & PDF Export Demo
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This page demonstrates client-side printing and PDF generation using
          jsPDF and html2canvas. The content below can be printed or downloaded
          as a PDF.
        </Typography>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          {/**
           * Print Button
           *
           * Uses the browser's native print functionality
           * The @media print CSS rules control the output
           */}
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
            disabled={usersQuery.isLoading}
          >
            Print Page
          </Button>

          {/**
           * Download PDF (Screenshot method)
           *
           * Captures the printable area as an image
           * and embeds it in a PDF
           */}
          <Button
            variant="contained"
            startIcon={isGeneratingPDF() ? <CircularProgress size={20} /> : <Download />}
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF() || usersQuery.isLoading}
          >
            {isGeneratingPDF() ? "Generating..." : "Download as PDF"}
          </Button>

          {/**
           * Download PDF (Table method)
           *
           * Creates a PDF programmatically with proper formatting
           * Better for structured data like tables
           */}
          <Button
            variant="contained"
            color="secondary"
            startIcon={isGeneratingPDF() ? <CircularProgress size={20} /> : <Download />}
            onClick={handleDownloadTablePDF}
            disabled={isGeneratingPDF() || usersQuery.isLoading}
          >
            {isGeneratingPDF() ? "Generating..." : "Export Table PDF"}
          </Button>

          {/* Refresh Data Button */}
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<Refresh />}
            onClick={() => {
              usersQuery.refetch();
              postsQuery.refetch();
            }}
            disabled={usersQuery.isFetching || postsQuery.isFetching}
          >
            Refresh Data
          </Button>
        </Stack>

        {/* Error Alert */}
        <Show when={error()}>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error()}
          </Alert>
        </Show>
      </Paper>

      {/**
       * Printable Content Area
       *
       * This div is captured for PDF generation
       * The ref is used to target this element with html2canvas
       *
       * CSS class "printable-area" can be used with @media print
       * to style content specifically for printing
       */}
      <div ref={printableRef} class="printable-area">
        <Paper sx={{ p: 3, mb: 3 }}>
          {/* Report Header */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              User & Posts Report
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generated on: {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Users Table */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Users Directory
          </Typography>

          <Show
            when={!usersQuery.isLoading}
            fallback={
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            }
          >
            <Show
              when={usersQuery.data}
              fallback={
                <Alert severity="error">Failed to load users data</Alert>
              }
            >
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>ID</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Email</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Company</strong>
                      </TableCell>
                      <TableCell>
                        <strong>City</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <For each={usersQuery.data}>
                      {(user: ApiUser) => (
                        <TableRow>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.company.name}</TableCell>
                          <TableCell>{user.address.city}</TableCell>
                        </TableRow>
                      )}
                    </For>
                  </TableBody>
                </Table>
              </TableContainer>
            </Show>
          </Show>

          <Divider sx={{ my: 3 }} />

          {/* Posts Summary */}
          <Typography variant="h6" gutterBottom>
            Recent Posts Summary
          </Typography>

          <Show
            when={!postsQuery.isLoading}
            fallback={
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            }
          >
            <Show
              when={postsQuery.data}
              fallback={
                <Alert severity="error">Failed to load posts data</Alert>
              }
            >
              {/* Show first 5 posts as a summary */}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="10%">
                        <strong>ID</strong>
                      </TableCell>
                      <TableCell width="30%">
                        <strong>Title</strong>
                      </TableCell>
                      <TableCell width="60%">
                        <strong>Body (Preview)</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <For each={postsQuery.data?.slice(0, 5)}>
                      {(post: ApiPost) => (
                        <TableRow>
                          <TableCell>{post.id}</TableCell>
                          <TableCell>{post.title}</TableCell>
                          <TableCell>
                            {post.body.substring(0, 100)}...
                          </TableCell>
                        </TableRow>
                      )}
                    </For>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Showing 5 of {postsQuery.data?.length} total posts
              </Typography>
            </Show>
          </Show>

          {/* Report Footer */}
          <Box
            sx={{
              mt: 4,
              pt: 2,
              borderTop: "1px solid #eee",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              This report was generated from the SolidJS Learning Project Demo
            </Typography>
          </Box>
        </Paper>
      </div>

      {/* Implementation Notes */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Implementation Notes
        </Typography>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Two PDF Generation Methods:
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>1. Screenshot Method (html2canvas + jsPDF):</strong> Captures
          the DOM as an image and embeds it in a PDF. Good for complex layouts
          with styling, but the text in the PDF is not selectable.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>2. Programmatic Method (jsPDF only):</strong> Builds the PDF
          from scratch using jsPDF API. Creates selectable text and smaller file
          sizes, but requires manual positioning and doesn't capture CSS styling.
        </Typography>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Print CSS Tips:
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, "padding-left": "20px" }}>
            <li>Use @media print to hide navigation and buttons</li>
            <li>Set page margins with @page rule</li>
            <li>Use page-break-inside: avoid for tables</li>
            <li>Consider using print-specific fonts and colors</li>
          </ul>
        </Typography>
      </Paper>
    </Container>
  );
};

export default PrintPDF;

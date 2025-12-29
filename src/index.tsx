/**
 * ============================================================================
 * INDEX.TSX - Application Entry Point
 * ============================================================================
 *
 * This is the entry point of our SolidJS application.
 * It renders the root App component into the DOM.
 *
 * KEY CONCEPTS:
 *
 * 1. render() function - SolidJS's way to mount the app to the DOM
 *    - First argument: A function that returns JSX (not JSX directly!)
 *    - Second argument: The DOM element to mount to
 *
 * 2. The "@refresh reload" directive - Vite HMR (Hot Module Replacement)
 *    - Tells Vite to do a full reload on changes to this file
 *    - Ensures clean state after updates during development
 */

/* @refresh reload */

import { render } from "solid-js/web";
import "./index.css";
import App from "./App";

/**
 * Get the root DOM element
 *
 * This is the <div id="root"> element in index.html
 * The '!' asserts that this element exists (TypeScript non-null assertion)
 */
const root = document.getElementById("root");

/**
 * Render the App
 *
 * SolidJS render() is different from React's:
 * - Takes a function () => <App /> not just <App />
 * - Returns a dispose function to unmount the app
 *
 * The function wrapper allows SolidJS to properly track reactive updates.
 */
render(() => <App />, root!);

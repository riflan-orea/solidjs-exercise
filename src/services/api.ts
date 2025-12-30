/**
 * ============================================================================
 * API SERVICE - Functions to fetch data from JSONPlaceholder
 * ============================================================================
 *
 * This file contains functions that fetch data from the fake REST API.
 * JSONPlaceholder (https://jsonplaceholder.typicode.com/) is a free
 * fake API for testing and prototyping.
 *
 * KEY CONCEPTS DEMONSTRATED:
 *
 * 1. FETCH API
 *    - Native browser API for making HTTP requests
 *    - Returns a Promise that resolves to a Response object
 *
 * 2. ASYNC/AWAIT
 *    - Modern syntax for handling Promises
 *    - Makes asynchronous code look synchronous
 *
 * 3. TYPE SAFETY
 *    - Functions are typed with return types
 *    - Response data is cast to our defined types
 */

import type { ApiUser, ApiPost, ApiTodo } from "../types/api";

/**
 * Base URL for the fake API
 *
 * JSONPlaceholder provides these endpoints:
 * - /users - 10 users
 * - /posts - 100 posts
 * - /comments - 500 comments
 * - /todos - 200 todos
 * - /albums - 100 albums
 * - /photos - 5000 photos
 */
const API_BASE_URL = "https://jsonplaceholder.typicode.com";

/**
 * Fetch all users from the API
 *
 * This function:
 * 1. Makes a GET request to /users
 * 2. Parses the JSON response
 * 3. Returns typed array of users
 *
 * @returns Promise<ApiUser[]> - Array of user objects
 * @throws Error if the request fails
 *
 * USAGE WITH TANSTACK QUERY:
 * const query = createQuery(() => ({
 *   queryKey: ['users'],
 *   queryFn: fetchUsers
 * }));
 */
export async function fetchUsers(): Promise<ApiUser[]> {
  // Make the HTTP request
  const response = await fetch(`${API_BASE_URL}/users`);

  // Check if the request was successful
  if (!response.ok) {
    // Throw an error that TanStack Query will catch
    throw new Error(`Failed to fetch users: ${response.status}`);
  }

  // Parse JSON and return typed data
  const data: ApiUser[] = await response.json();
  return data;
}

/**
 * Fetch a single user by ID
 *
 * @param id - The user ID to fetch
 * @returns Promise<ApiUser> - Single user object
 * @throws Error if user not found or request fails
 */
export async function fetchUserById(id: number): Promise<ApiUser> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch user ${id}: ${response.status}`);
  }

  const data: ApiUser = await response.json();
  return data;
}

/**
 * Fetch all posts from the API
 *
 * @returns Promise<ApiPost[]> - Array of post objects
 */
export async function fetchPosts(): Promise<ApiPost[]> {
  const response = await fetch(`${API_BASE_URL}/posts`);

  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.status}`);
  }

  const data: ApiPost[] = await response.json();
  return data;
}

/**
 * Fetch posts by user ID
 *
 * This demonstrates query parameters in the URL.
 * JSONPlaceholder supports filtering with ?userId=X
 *
 * @param userId - The user ID to filter by
 * @returns Promise<ApiPost[]> - Array of posts by that user
 */
export async function fetchPostsByUser(userId: number): Promise<ApiPost[]> {
  const response = await fetch(`${API_BASE_URL}/posts?userId=${userId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch posts for user ${userId}: ${response.status}`);
  }

  const data: ApiPost[] = await response.json();
  return data;
}

/**
 * Fetch all todos from the API
 *
 * @returns Promise<ApiTodo[]> - Array of todo objects
 */
export async function fetchTodos(): Promise<ApiTodo[]> {
  const response = await fetch(`${API_BASE_URL}/todos`);

  if (!response.ok) {
    throw new Error(`Failed to fetch todos: ${response.status}`);
  }

  const data: ApiTodo[] = await response.json();
  return data;
}

/**
 * Fetch todos by user ID
 *
 * @param userId - The user ID to filter by
 * @returns Promise<ApiTodo[]> - Array of todos for that user
 */
export async function fetchTodosByUser(userId: number): Promise<ApiTodo[]> {
  const response = await fetch(`${API_BASE_URL}/todos?userId=${userId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch todos for user ${userId}: ${response.status}`);
  }

  const data: ApiTodo[] = await response.json();
  return data;
}

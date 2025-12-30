/**
 * ============================================================================
 * API TYPES - Type definitions for fake API data
 * ============================================================================
 *
 * These types match the data structure from JSONPlaceholder API.
 * https://jsonplaceholder.typicode.com/
 *
 * Using interfaces allows TypeScript to:
 * - Provide autocompletion in your IDE
 * - Catch type errors at compile time
 * - Document the shape of your data
 */

/**
 * User interface - represents a user from the API
 *
 * This matches the /users endpoint from JSONPlaceholder
 */
export interface ApiUser {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

/**
 * Post interface - represents a post from the API
 *
 * This matches the /posts endpoint from JSONPlaceholder
 */
export interface ApiPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

/**
 * Todo interface - represents a todo from the API
 *
 * This matches the /todos endpoint from JSONPlaceholder
 */
export interface ApiTodo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

/**
 * Comment interface - represents a comment from the API
 *
 * This matches the /comments endpoint from JSONPlaceholder
 */
export interface ApiComment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

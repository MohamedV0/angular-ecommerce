// API Response Models - Based on Real API Testing
// Updated: 2025-01-27 with actual response formats

/**
 * Collection Response Format (Products, Categories, Brands)
 * Based on real API response: GET /api/v1/categories, /api/v1/products
 */
export interface CollectionResponse<T> {
  results: number;                    // Total items count
  metadata: PaginationMetadata;       // Pagination info
  data: T[];                         // Array of items
}

/**
 * Pagination Metadata Structure
 * Note: API uses 'metadata' not 'paginationResult'
 */
export interface PaginationMetadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number;                  // Only present if next page exists
  prevPage?: number;                  // Only present if previous page exists
}

/**
 * Single Item Response Format (Product Details, Category Details)
 * Based on real API response: GET /api/v1/products/{id}
 */
export interface SingleItemResponse<T> {
  data: T;                           // Single item
}

/**
 * Authentication Response Format
 * Based on real API response: POST /api/v1/auth/signup, /api/v1/auth/signin
 */
export interface AuthResponse {
  message: string;                    // "success"
  user: {
    name: string;
    email: string;
    role: string;                     // "user" or "admin"
  };
  token: string;                      // JWT token
}

/**
 * Error Response Format
 * Based on real API response: Invalid endpoints return this format
 */
export interface ApiError {
  statusMsg: string;                  // "fail"
  message: string;                    // Error description
}

/**
 * Generic API Options for HTTP requests
 */
export interface ApiRequestOptions {
  headers?: { [key: string]: string };
  params?: { [key: string]: string | number | boolean };
  requiresAuth?: boolean;             // Whether request requires authentication
}

/**
 * Query Parameters for Collection Endpoints
 */
export interface CollectionQueryParams {
  limit?: number;                     // Number of items per page
  page?: number;                      // Page number (1-based)
  sort?: string;                      // Sort field (e.g., "-price", "createdAt")
  keyword?: string;                   // Search keyword
  fields?: string;                    // Field selection (comma-separated)
}

/**
 * Product-specific Query Parameters
 * Based on real API testing: GET /api/v1/products
 */
export interface ProductQueryParams extends CollectionQueryParams {
  'price[gte]'?: number;             // Price greater than or equal
  'price[lte]'?: number;             // Price less than or equal
  brand?: string;                     // Brand ID filter
  'category[in]'?: string[];         // Category IDs filter (array)
}

/**
 * Cart Response Format
 * Based on real API testing (2025-09-30)
 * 
 * ✅ Implementation Strategy:
 * - POST /cart returns product as string ID → We immediately follow with GET /cart
 * - This interface represents GET/PUT/DELETE responses with full product objects
 * - We never directly consume POST responses, so product is always CartProductObject
 */
export interface CartApiResponse {
  status: string;                     // "success"
  message?: string;                   // Present in some responses
  numOfCartItems: number;             // Total items count
  cartId: string;                     // Cart ID
  data: {
    _id: string;
    cartOwner: string;
    products: Array<{
      count: number;
      _id: string;
      product: CartProductObject;     // Always full object (we use GET, not POST response)
      price: number;
    }>;
    createdAt: string;
    updatedAt: string;
    __v: number;
    totalCartPrice: number;
  };
}

/**
 * Cart Product Object Structure (returned by GET/PUT/DELETE endpoints)
 * Based on real API testing: GET /cart returns this structure
 * Updated: 2025-09-30 - Matches actual API response
 * 
 * ⚠️ NOTE: This is a SUBSET of the full Product interface
 * - Price is stored at cart item level, NOT in product
 * - Missing: price, priceAfterDiscount, description, slug, images[], sold, createdAt, updatedAt, ratingsQuantity
 */
export interface CartProductObject {
  _id: string;
  title: string;
  imageCover: string;
  quantity: number;                   // Available stock quantity (NOT cart quantity)
  ratingsAverage: number;
  subcategory: Array<{
    _id: string;
    name: string;
    slug: string;
    category: string;
  }>;
  category: {
    _id: string;
    name: string;
    slug: string;
    image: string;
  };
  brand: {
    _id: string;
    name: string;
    slug: string;
    image: string;
  };
  id: string;                         // Duplicate of _id (API quirk)
}

